from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import requests
import time
import uvicorn
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

app = FastAPI(title="CS2 Skin Maestro API")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CurrencyManager:
    def __init__(self):
        # Базовые значения (fallback)
        self.rates = {"usd": 92.40, "cny": 13.50, "rub": 1.0}
        self.last_update = 0
        self.cache_duration = 12 * 60 * 60 # 12 часов

    def get_rates(self):
        current_time = time.time()
        # Обновляем курсы, если прошло 12 часов или если это первый запуск
        if current_time - self.last_update > self.cache_duration:
            self._fetch_from_api()
        return self.rates

    def _fetch_from_api(self):
        try:
            # Используем бесплатный API курсов к доллару
            response = requests.get("https://api.exchangerate-api.com/v4/latest/USD")
            if response.status_code == 200:
                data = response.json()
                rub_rate = data["rates"].get("RUB", 92.40)
                cny_rate = data["rates"].get("CNY", 7.20)
                
                # Сохраняем актуальные цифры
                self.rates["usd"] = rub_rate
                # Юань в рублях: сколько рублей дают за 1 юань (USDtoRUB / USDtoCNY)
                self.rates["cny"] = rub_rate / cny_rate if cny_rate > 0 else 13.50
                
                self.last_update = time.time()
                print(f"OK Курсы валют обновлены: 1$ = {self.rates['usd']:.2f} RUB, 1Y = {self.rates['cny']:.2f} RUB")
        except Exception as e:
            print("Error при попытке запросить курсы валют:", e)

# Инициализируем нашего менеджера
currency_manager = CurrencyManager()

@app.get("/api/ping")
def ping():
    return {"ping": "pong", "status": "Server is ready for CS2 data"}

@app.get("/api/rates")
def get_rates():
    """Отдает калькулятору самые свежие курсы валют (12ч кэш)"""
    return currency_manager.get_rates()

# ============================================
# SMART ARBITRAGE — Сравнение цен на площадках
# ============================================
from urllib.parse import quote
import json
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

PRICEMPIRE_API_KEY = os.getenv("PRICEMPIRE_API_KEY", "")

# Комиссии площадок (дефолтные, пользователь может менять в настройках)
PLATFORM_FEES = {
    "buff163": 0.025,
    "csfloat": 0.02,
    "market_csgo": 0.05,
    "steam": 0.15,
}

# Маппинг названий источников Pricempire к нашим
PRICEMPIRE_SOURCE_MAP = {
    "buff163": "buff163",
    "csfloat": "csfloat",
    "csgomarket": "market_csgo",
    "steam": "steam",
}

class ArbitrageRequest(BaseModel):
    item_name: str

class PricempireService:
    """Сервис получения цен через Pricempire API + fallback на прямые запросы."""
    
    def __init__(self):
        self.cache = {}  # {item_name: {data, timestamp}}
        self.cache_duration = 120  # 2 минуты
        self.marketcsgo_cache = None
        self.marketcsgo_cache_time = 0
        self.marketcsgo_cache_duration = 300  # 5 минут
    
    def get_prices(self, item_name: str) -> dict:
        """Получает цены предмета со всех площадок."""
        # Проверяем кэш
        if item_name in self.cache:
            cached = self.cache[item_name]
            if time.time() - cached["timestamp"] < self.cache_duration:
                return cached["data"]
        
        result = {}
        
        # Стратегия 1: Pricempire API (если есть ключ)
        if PRICEMPIRE_API_KEY:
            result = self._fetch_from_pricempire(item_name)
        
        # Стратегия 2: Прямые запросы (fallback или дополнение)
        if not result.get("steam"):
            steam_data = self._fetch_from_steam(item_name)
            if steam_data:
                result["steam"] = steam_data
        
        if not result.get("market_csgo"):
            marketcsgo_data = self._fetch_from_marketcsgo(item_name)
            if marketcsgo_data:
                result["market_csgo"] = marketcsgo_data
        
        # Кэшируем результат
        self.cache[item_name] = {"data": result, "timestamp": time.time()}
        return result
    
    def _fetch_from_pricempire(self, item_name: str) -> dict:
        """Получает цены через Pricempire API v3."""
        result = {}
        try:
            url = "https://api.pricempire.com/v3/items/prices"
            params = {
                "api_key": PRICEMPIRE_API_KEY,
                "sources": "buff163,csfloat,csgomarket,steam",
                "app_id": 730,
                "currency": "USD",
                "name": item_name,
            }
            headers = {
                "User-Agent": "CS2SkinMaestro/1.0",
                "Accept": "application/json",
            }
            response = requests.get(url, params=params, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Pricempire может вернуть данные в разных форматах
                # Пробуем обработать оба варианта
                if isinstance(data, list) and len(data) > 0:
                    item_data = data[0]
                elif isinstance(data, dict):
                    item_data = data
                else:
                    return result
                
                prices = item_data.get("prices", item_data)
                
                for source_key, our_key in PRICEMPIRE_SOURCE_MAP.items():
                    source_data = prices.get(source_key, {})
                    if source_data:
                        price = source_data.get("price", source_data.get("min", 0))
                        if isinstance(price, (int, float)) and price > 0:
                            # Pricempire возвращает цены в центах USD
                            price_usd = price / 100 if price > 100 else price
                            result[our_key] = {
                                "price_usd": round(price_usd, 2),
                                "available": True,
                                "source": "pricempire"
                            }
            else:
                print(f"⚠️ Pricempire API ответил кодом {response.status_code}")
        except Exception as e:
            print(f"❌ Ошибка Pricempire API: {e}")
        
        return result
    
    def _fetch_from_steam(self, item_name: str) -> dict:
        """Прямой запрос к Steam Market API (бесплатно, без ключа)."""
        try:
            encoded_name = quote(item_name)
            url = f"https://steamcommunity.com/market/priceoverview/?appid=730&market_hash_name={encoded_name}&currency=1"
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json",
            }
            response = requests.get(url, headers=headers, timeout=8)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    lowest = data.get("lowest_price", "")
                    median = data.get("median_price", "")
                    
                    # Парсим цену (формат: "$12.50" или "12,50€")
                    price_str = lowest or median
                    if price_str:
                        price_clean = price_str.replace("$", "").replace("€", "").replace(",", ".").strip()
                        try:
                            price_usd = float(price_clean)
                            return {
                                "price_usd": round(price_usd, 2),
                                "available": True,
                                "source": "steam_direct"
                            }
                        except ValueError:
                            pass
        except Exception as e:
            print(f"❌ Ошибка Steam API: {e}")
        return None
    
    def _fetch_from_marketcsgo(self, item_name: str) -> dict:
        """Прямой запрос к Market CSGO API (бесплатный прайс-лист)."""
        try:
            # Обновляем прайс-лист если кэш устарел
            current_time = time.time()
            if not self.marketcsgo_cache or (current_time - self.marketcsgo_cache_time > self.marketcsgo_cache_duration):
                url = "https://market.csgo.com/api/v2/prices/USD.json"
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                }
                response = requests.get(url, headers=headers, timeout=15)
                if response.status_code == 200:
                    data = response.json()
                    items = data.get("items", [])
                    # Создаем словарь для быстрого поиска
                    self.marketcsgo_cache = {}
                    for item in items:
                        name = item.get("market_hash_name", "")
                        if name:
                            self.marketcsgo_cache[name] = item
                    self.marketcsgo_cache_time = current_time
                    print(f"✅ Market CSGO прайс-лист загружен: {len(self.marketcsgo_cache)} предметов")
                else:
                    return None
            
            if self.marketcsgo_cache and item_name in self.marketcsgo_cache:
                item = self.marketcsgo_cache[item_name]
                price = item.get("price", item.get("average", item.get("min", 0)))
                if price and float(price) > 0:
                    return {
                        "price_usd": round(float(price), 2),
                        "available": True,
                        "source": "marketcsgo_direct"
                    }
        except Exception as e:
            print(f"❌ Ошибка Market CSGO API: {e}")
        return None


# Инициализируем сервис арбитража
arbitrage_service = PricempireService()

@app.post("/api/arbitrage")
def search_arbitrage(req: ArbitrageRequest):
    """
    Smart Arbitrage: сравнение цен одного скина на всех площадках.
    Возвращает цены, ссылки, анализ спреда и рекомендацию.
    """
    item_name = req.item_name.strip()
    if not item_name:
        return {"error": "Укажите название предмета"}
    
    # Получаем текущие курсы валют
    rates = currency_manager.get_rates()
    usd_to_rub = rates.get("usd", 92.40)
    cny_to_rub = rates.get("cny", 13.50)
    
    # Получаем цены со всех площадок  
    raw_prices = arbitrage_service.get_prices(item_name)
    
    if not raw_prices:
        return {
            "error": "Не удалось найти цены для этого предмета. Проверьте правильность названия (например: AK-47 | Redline (Field-Tested))",
            "item_name": item_name
        }
    
    # Формируем ссылки на предмет
    encoded_name = quote(item_name)
    
    platform_links = {
        "steam": f"https://steamcommunity.com/market/listings/730/{encoded_name}",
        "buff163": f"https://buff.163.com/market/goods?game=csgo&search={quote(item_name.replace('|', '').replace('(', '').replace(')', ''))}",
        "csfloat": f"https://csfloat.com/search?market_hash_name={encoded_name}",
        "market_csgo": f"https://market.csgo.com/?search={quote(item_name.replace('|', ' ').strip())}",
    }
    
    platform_names = {
        "steam": "Steam Market",
        "buff163": "Buff163",
        "csfloat": "CSFloat",
        "market_csgo": "Market CSGO",
    }
    
    platform_currencies = {
        "steam": "USD",
        "buff163": "CNY",
        "csfloat": "USD",
        "market_csgo": "USD",
    }
    
    platform_icons = {
        "steam": "🎮",
        "buff163": "🟡",
        "csfloat": "🔵",
        "market_csgo": "🟢",
    }
    
    # Собираем итоговые данные по площадкам
    prices = {}
    rub_prices = {}  # Для анализа
    
    for platform_key in ["buff163", "csfloat", "market_csgo", "steam"]:
        data = raw_prices.get(platform_key)
        if data and data.get("available"):
            price_usd = data["price_usd"]
            price_rub = round(price_usd * usd_to_rub, 2)
            
            # Для Buff163 — пересчитываем в юани
            price_cny = round(price_usd * usd_to_rub / cny_to_rub, 2) if platform_key == "buff163" else None
            
            prices[platform_key] = {
                "name": platform_names[platform_key],
                "icon": platform_icons[platform_key],
                "price_usd": price_usd,
                "price_rub": price_rub,
                "price_cny": price_cny,
                "currency": platform_currencies[platform_key],
                "link": platform_links[platform_key],
                "available": True,
                "fee": PLATFORM_FEES.get(platform_key, 0),
            }
            rub_prices[platform_key] = price_rub
        else:
            prices[platform_key] = {
                "name": platform_names[platform_key],
                "icon": platform_icons[platform_key],
                "price_usd": None,
                "price_rub": None,
                "price_cny": None,
                "currency": platform_currencies[platform_key],
                "link": platform_links[platform_key],
                "available": False,
                "fee": PLATFORM_FEES.get(platform_key, 0),
            }
    
    # Анализ арбитража
    analysis = None
    if len(rub_prices) >= 2:
        cheapest_key = min(rub_prices, key=rub_prices.get)
        expensive_key = max(rub_prices, key=rub_prices.get)
        
        cheapest_price = rub_prices[cheapest_key]
        expensive_price = rub_prices[expensive_key]
        
        spread_percent = round((expensive_price - cheapest_price) / cheapest_price * 100, 1) if cheapest_price > 0 else 0
        
        # Чистый профит с учетом комиссий
        sell_fee = PLATFORM_FEES.get(expensive_key, 0)
        net_revenue = expensive_price * (1 - sell_fee)
        net_profit = round(net_revenue - cheapest_price, 2)
        net_profit_percent = round((net_profit / cheapest_price) * 100, 1) if cheapest_price > 0 else 0
        
        analysis = {
            "cheapest": {
                "platform": cheapest_key,
                "name": platform_names[cheapest_key],
                "price_rub": cheapest_price,
            },
            "most_expensive": {
                "platform": expensive_key,
                "name": platform_names[expensive_key],
                "price_rub": expensive_price,
            },
            "spread_percent": spread_percent,
            "net_profit_rub": net_profit,
            "net_profit_percent": net_profit_percent,
            "sell_fee_name": platform_names[expensive_key],
            "sell_fee_percent": round(sell_fee * 100, 1),
            "verdict": "profitable" if net_profit > 0 else ("neutral" if net_profit == 0 else "unprofitable"),
        }
    
    return {
        "item_name": item_name,
        "prices": prices,
        "analysis": analysis,
        "rates": {
            "usd_to_rub": usd_to_rub,
            "cny_to_rub": cny_to_rub,
        }
    }


# ============================================
# АРБИТРАЖ-СКАНЕР
# ============================================

class ArbitrageScannerService:
    """
    Арбитраж-сканер на базе Market.CSGO API (~24K скинов).
    (Оценка других площадок временно отключена по просьбе пользователя,
     требуются реальные API ключи для точных данных).
    """

    MARKET_CSGO_URL = "https://market.csgo.com/api/v2/prices/USD.json"
    CACHE_TTL = 1800  # 30 минут

    def __init__(self):
        self._market_cache: dict = {}
        self._cache_time: float = 0
        self._total_items: int = 0

    def _load_market_csgo(self) -> dict:
        """Загружает полный прайс-лист Market.CSGO."""
        now = time.time()
        if self._market_cache and (now - self._cache_time < self.CACHE_TTL):
            return self._market_cache
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            }
            resp = requests.get(self.MARKET_CSGO_URL, headers=headers, timeout=25)
            resp.raise_for_status()
            data = resp.json()
            items = data.get("items", [])
            result = {}
            for item in items:
                name = item.get("market_hash_name", "")
                price = item.get("price", 0)
                if name and price:
                    try:
                        result[name] = float(price)
                    except (ValueError, TypeError):
                        pass
            self._market_cache = result
            self._cache_time = now
            self._total_items = len(result)
            print(f"OK Market.CSGO: загружено {len(result)} скинов")
        except Exception as e:
            print(f"Error загрузки Market.CSGO: {e}")
        return self._market_cache

    def _get_price(self, market_price: float, platform: str, name: str = "") -> float:
        """
        Возвращает реальную цену.
        Поскольку API ключа Pricempire пока нет, у нас в базе есть реальные цены 
        только с Market.CSGO (публичный дамп).
        Для остальных площадок возвращаем 0, пока не будет реализован реальный парсер.
        """
        if platform == "market_csgo":
            return market_price
        
        # Здесь должен быть реальный запрос к БД/Кэшу для Steam, Buff, CSFloat и т.д.
        # Пока реальных данных нет, возвращаем 0, чтобы не показывать ложный профит.
        return 0.0

    def scan(
        self,
        buy_platform: str = "market_csgo",
        sell_platform: str = "steam",
        buy_fee: float = 0.05,
        sell_fee: float = 0.15,
        min_profit_pct: float = 0.0,
        min_price_usd: float = 0.0,
        max_price_usd: float = 10000.0,
        search: str = "",
        wear: str = "",
        sort_by: str = "profit_pct",
        sort_dir: str = "desc",
        page: int = 1,
        per_page: int = 50,
    ) -> dict:
        """
        Полный скан с пагинацией.
        Возвращает: {items, total, page, per_page, pages}
        """
        market_prices = self._load_market_csgo()
        if not market_prices:
            return {"items": [], "total": 0, "page": 1, "per_page": per_page, "pages": 0}

        if buy_platform == sell_platform:
            return {"items": [], "total": 0, "page": 1, "per_page": per_page, "pages": 0}

        results = []
        search_lower = search.strip().lower()

        for name, market_price in market_prices.items():
            # Фильтр: только скины с "|" (исключаем кейсы, капсулы, агенты без |)
            if "|" not in name:
                continue

            # Фильтр по цене (на основе цены покупки)
            buy_price = self._get_price(market_price, buy_platform, name)
            if not (min_price_usd <= buy_price <= max_price_usd):
                continue

            # Фильтр по имени
            if search_lower and search_lower not in name.lower():
                continue

            # Фильтр по износу
            if wear and f"({wear})" not in name:
                continue

            sell_price = self._get_price(market_price, sell_platform, name)

            cost = buy_price * (1 + buy_fee)
            revenue = sell_price * (1 - sell_fee)
            profit_usd = revenue - cost
            profit_pct = (profit_usd / cost * 100) if cost > 0 else 0

            if profit_pct < min_profit_pct:
                continue

            enc = quote(name)
            platform_links = {
                "market_csgo": f"https://market.csgo.com/?search={quote(name.replace('|', ' ').strip())}",
                "steam": f"https://steamcommunity.com/market/listings/730/{enc}",
                "buff163": f"https://buff.163.com/market/goods?game=csgo&search={quote(name.replace('|',''))}",
                "csfloat": f"https://csfloat.com/search?market_hash_name={enc}",
                "csmoney": f"https://cs.money/csgo/store/?search={quote(name)}",
                "lisskins": f"https://lis-skins.ru/market/csgo/?search={quote(name)}",
            }

            results.append({
                "name": name,
                "buy_price": round(buy_price, 2),
                "sell_price": round(sell_price, 2),
                "cost": round(cost, 2),
                "revenue": round(revenue, 2),
                "profit_usd": round(profit_usd, 2),
                "profit_pct": round(profit_pct, 1),
                "buy_link": platform_links.get(buy_platform, "#"),
                "sell_link": platform_links.get(sell_platform, "#"),
            })

        # Сортировка
        reverse = sort_dir == "desc"
        if sort_by == "profit_pct":
            results.sort(key=lambda x: x["profit_pct"], reverse=reverse)
        elif sort_by == "profit_usd":
            results.sort(key=lambda x: x["profit_usd"], reverse=reverse)
        elif sort_by == "buy_price":
            results.sort(key=lambda x: x["buy_price"], reverse=reverse)
        elif sort_by == "sell_price":
            results.sort(key=lambda x: x["sell_price"], reverse=reverse)

        total = len(results)
        pages = max(1, (total + per_page - 1) // per_page)
        page = max(1, min(page, pages))
        start = (page - 1) * per_page
        end = start + per_page

        return {
            "items": results[start:end],
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": pages,
        }


arbitrage_scanner = ArbitrageScannerService()


@app.get("/api/arbitrage/scan")
def scan_arbitrage(
    buy_platform:    str   = "market_csgo",
    sell_platform:   str   = "steam",
    buy_fee:         float = 0.05,
    sell_fee:        float = 0.15,
    min_profit_pct:  float = 0.0,
    min_price_usd:   float = 0.0,
    max_price_usd:   float = 10000.0,
    search:          str   = "",
    wear:            str   = "",
    sort_by:         str   = "profit_pct",
    sort_dir:        str   = "desc",
    page:            int   = 1,
    per_page:        int   = 50,
):
    """Арбитраж-сканер с пагинацией, поиском, сортировкой."""
    rates = currency_manager.get_rates()

    result = arbitrage_scanner.scan(
        buy_platform=buy_platform,
        sell_platform=sell_platform,
        buy_fee=buy_fee,
        sell_fee=sell_fee,
        min_profit_pct=min_profit_pct,
        min_price_usd=min_price_usd,
        max_price_usd=max_price_usd,
        search=search,
        wear=wear,
        sort_by=sort_by,
        sort_dir=sort_dir,
        page=page,
        per_page=per_page,
    )

    return {
        **result,
        "buy_platform": buy_platform,
        "sell_platform": sell_platform,
        "rates": {"usd_to_rub": rates.get("usd", 92.4), "cny_to_rub": rates.get("cny", 13.5)},
        "cached_items": arbitrage_scanner._total_items,
    }


@app.get("/api/autocomplete")
def autocomplete_items(q: str = "", limit: int = 10):
    """Возвращает подсказки названий скинов для автозаполнения."""
    query = q.strip().lower()
    if len(query) < 2:
        return {"items": []}
    
    market_prices = arbitrage_scanner._load_market_csgo()
    if not market_prices:
        return {"items": []}
        
    matches = []
    for name in market_prices.keys():
        if query in name.lower():
            matches.append(name)
            if len(matches) >= limit:
                break
                
    return {"items": matches}


# Загружаем переменные окружения, в частности GEMINI_API_KEY
import google.generativeai as genai
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Загружаем "мозги" (ваши конспекты) для Маэстро
kb_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "workflow-CS2", "workflow_content_v2.txt")
try:
    with open(kb_path, "r", encoding="utf-8") as f:
        maestro_knowledge = f.read()
except FileNotFoundError:
    maestro_knowledge = "База знаний не найдена, отвечай на основе общих знаний о CS2."

system_prompt = f"""Ты — Skin Maestro, профессиональный ИИ-ассистент по арбитражу и трейдингу скинов CS:GO/CS2.
Твоя задача — анализировать сделки, помогать с расчетом профита и отвечать на вопросы пользователя строго опираясь на следующую базу знаний (правила трейдинга):

<база_знаний>
{maestro_knowledge}
</база_знаний>

Твои ответы должны быть:
1. Краткими, четкими и без "воды".
2. Опираться ТОЛЬКО на правила из базы знаний (схемы закупки, площадки, ликвидность, флоаты, холд 14 дней).
3. Использовать профессиональный сленг трейдеров.
4. Выдавать конкретный вердикт по сделке в начале сообщения."""

if api_key:
    genai.configure(api_key=api_key)
    # Прошиваем "мозги" прямо внутрь модели с помощью system_instruction
    model = genai.GenerativeModel(
        'gemini-2.5-flash',
        system_instruction=system_prompt
    )
    # Инициализируем сессию чата
    chat_session = model.start_chat(history=[])
else:
    model = None
    chat_session = None

class ChatMessage(BaseModel):
    message: str

@app.post("/api/chat")
def chat_with_maestro(chat: ChatMessage):
    """
    Интегрированный эндпоинт для чата.
    Здесь напрямую работает Google Gemini!
    """
    user_text = chat.message
    
    # Если ключа нет
    if not chat_session:
        return {"reply": "Упс! Мой мозг пока отключен. Пожалуйста, добавьте ваш GEMINI_API_KEY в файл .env в корне проекта, чтобы я ожил."}
    
    try:
        # Отправляем сообщение нейросети и ждем ответ
        response = chat_session.send_message(user_text)
        return {"reply": response.text}
    except Exception as e:
        print(f"Ошибка ИИ: {e}")
        return {"reply": "Что-то пошло не так при обращении к моим нейронам... Попробуйте повторить запрос позже."}

import re

@app.get("/api/inventory/{steam_id}")
def get_steam_inventory(steam_id: str):
    """
    Получает публичный инвентарь Steam по SteamID64 и вытягивает наклейки.
    """
    try:
        url = f"https://steamcommunity.com/inventory/{steam_id}/730/2?l=russian&count=100"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        }
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 403 or response.status_code == 401:
            return {"error": "Инвентарь скрыт настройками приватности Steam."}
        elif response.status_code == 429:
            return {"error": "Слишком много запросов к Steam (Steam Rate Limit). Попробуйте позже."}
        elif response.status_code != 200:
            return {"error": f"Ошибка Steam API (Код: {response.status_code})."}
            
        data = response.json()
        if not data or "assets" not in data or "descriptions" not in data:
            return {"error": "Инвентарь пуст или профиль не существует."}
            
        # Собираем словарь описаний по classid+instanceid для быстрого поиска
        desc_map = {}
        for desc in data["descriptions"]:
            if desc.get("tradable", 0) == 1 or desc.get("marketable", 0) == 1:
                key = f"{desc['classid']}_{desc.get('instanceid', '0')}"
                desc_map[key] = desc
        
        # Группируем предметы по classid+instanceid чтобы убрать дубли
        # Но НЕ группировать скины с разными наклейками (у них разный instanceid)
        grouped = {}  # "classid_instanceid" -> {item_data, quantity}
        
        for asset in data.get("assets", []):
            classid = asset.get("classid")
            instanceid = asset.get("instanceid", "0")
            group_key = f"{classid}_{instanceid}"
            
            if not classid or group_key not in desc_map:
                continue
            
            if group_key in grouped:
                grouped[group_key]["quantity"] += 1
                continue
            
            assetid = asset.get("assetid", "")
            item_info = desc_map[group_key]
            icon_url = f"https://community.cloudflare.steamstatic.com/economy/image/{item_info.get('icon_url')}"
            
            # Парсим стикеры из описаний
            stickers = []
            for d in item_info.get("descriptions", []):
                val = d.get("value", "")
                if "Наклейка:" in val or "Sticker:" in val:
                    clean_val = re.sub('<[^<]+>', '', val)
                    clean_val = clean_val.replace("Наклейка:", "").replace("Sticker:", "").strip()
                    if clean_val:
                        stickers = [s.strip() for s in clean_val.split(',')]
                        break
            
            # Создаем ссылку на осмотр (Inspect URL)
            inspect_url = ""
            for action in item_info.get("actions", []):
                if action.get("name") == "Осмотреть в игре..." or action.get("name") == "Inspect in Game...":
                    link = action.get("link", "")
                    inspect_url = link.replace("%owner_steamid%", steam_id).replace("%assetid%", assetid)
                    break

            grouped[group_key] = {
                "name": item_info.get("market_hash_name") or item_info.get("name", "Неизвестный предмет"),
                "icon": icon_url,
                "type": item_info.get("type", ""),
                "stickers": stickers,
                "inspect_url": inspect_url,
                "quantity": 1
            }
        
        items = list(grouped.values())
        return {"items": items[:100]}
        
    except Exception as e:
        print(f"Ошибка парсинга инвентаря: {e}")
        return {"error": "Ошибка связи с серверами Steam. Попробуйте еще раз."}

# Добавляем маршрут без кэширования для index.html
src_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src")

@app.get("/")
async def serve_index():
    response = FileResponse(os.path.join(src_path, "index.html"))
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Монтируем статику (стили, скрипты)
app.mount("/", StaticFiles(directory=src_path), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
