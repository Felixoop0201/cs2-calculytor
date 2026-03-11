"""
VIZER Backend — CS2 Skin Analytics API
FastAPI-сервер с интеграцией Pricempire API v3.
"""

import os
import re
import sys
import time
import json
import logging
import threading
import requests
import uvicorn

from urllib.parse import quote
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# ─────────────────────────────────────────────
# ИНИЦИАЛИЗАЦИЯ
# ─────────────────────────────────────────────
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("vizer")

load_dotenv()

# Грузим .env из корня проекта (на уровень выше backend/)
_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(_env_path):
    load_dotenv(dotenv_path=_env_path, override=True)
    logger.info(f".env загружен: {_env_path}")
else:
    logger.warning(f".env не найден: {_env_path}")

app = FastAPI(title="VIZER API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# КОНФИГ
# ─────────────────────────────────────────────
PRICEMPIRE_API_KEY = os.getenv("PRICEMPIRE_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if PRICEMPIRE_API_KEY:
    logger.info(f"Pricempire API ключ: {PRICEMPIRE_API_KEY[:8]}... (len={len(PRICEMPIRE_API_KEY)})")
else:
    logger.warning("PRICEMPIRE_API_KEY не задан — будет использован fallback Market CSGO")

# Метаданные площадок (ключи = source-имена Pricempire)
PLATFORM_META = {
    "buff163":    {"name": "Buff163",      "fee": 0.025, "currency": "CNY", "icon": "🟡",
                   "url": lambda n: f"https://buff.163.com/market/goods?game=csgo&search={quote(n.replace('|','').replace('(','').replace(')',''))}"},
    "csfloat":    {"name": "CSFloat",      "fee": 0.020, "currency": "USD", "icon": "🔵",
                   "url": lambda n: f"https://csfloat.com/search?market_hash_name={quote(n)}"},
    "csgomarket": {"name": "Market CSGO",  "fee": 0.050, "currency": "USD", "icon": "🟢",
                   "url": lambda n: f"https://market.csgo.com/?search={quote(n.replace('|',' ').strip())}"},
    "steam":      {"name": "Steam Market", "fee": 0.150, "currency": "USD", "icon": "🎮",
                   "url": lambda n: f"https://steamcommunity.com/market/listings/730/{quote(n)}"},
    "csmoney":    {"name": "CS.Money",     "fee": 0.070, "currency": "USD", "icon": "💜",
                   "url": lambda n: f"https://cs.money/csgo/store/?search={quote(n)}"},
    "lisskins":   {"name": "LisSkins",     "fee": 0.000, "currency": "USD", "icon": "🟠",
                   "url": lambda n: f"https://lis-skins.ru/market/csgo/?search={quote(n)}"},
    "skinport":   {"name": "Skinport",     "fee": 0.120, "currency": "USD", "icon": "🔴",
                   "url": lambda n: f"https://skinport.com/market?search={quote(n)}"},
}

PRICEMPIRE_SOURCES = "buff163,csfloat,csgomarket,steam,csmoney,lisskins,skinport"
PRICEMPIRE_BASE_URL = "https://api.pricempire.com/v3/items/prices"
USER_AGENT = "VIZER/1.1"


# ─────────────────────────────────────────────
# КУРСЫ ВАЛЮТ
# ─────────────────────────────────────────────
class CurrencyManager:
    def __init__(self):
        self.rates = {
            "usd": 92.40, "cny": 13.50, "rub": 1.0,
            "eur": 100.0, "uah": 2.45, "kzt": 0.20, "byn": 28.50
        }
        self.last_update = 0
        self.cache_duration = 12 * 3600  # 12 часов

    def get_rates(self):
        if time.time() - self.last_update > self.cache_duration:
            self._fetch()
        return self.rates

    def _fetch(self):
        try:
            r = requests.get(
                "https://api.exchangerate-api.com/v4/latest/USD",
                timeout=8
            )
            if r.status_code == 200:
                d = r.json()["rates"]
                rub = d.get("RUB", 92.40)
                self.rates = {
                    "usd": rub,
                    "cny": rub / d.get("CNY", 7.20),
                    "eur": rub / d.get("EUR", 0.92),
                    "uah": rub / d.get("UAH", 38.50),
                    "kzt": rub / d.get("KZT", 450.20),
                    "byn": rub / d.get("BYN", 3.25),
                    "rub": 1.0,
                }
                self.last_update = time.time()
                logger.info(f"Курсы обновлены: 1$ = {rub:.2f} RUB")
        except Exception as e:
            logger.error(f"Ошибка обновления курсов: {e}")


currency_manager = CurrencyManager()


# ─────────────────────────────────────────────
# PRICEMPIRE — ХЕЛПЕРЫ
# ─────────────────────────────────────────────
def _pricempire_headers() -> dict:
    """Стандартные заголовки для Pricempire API."""
    return {
        "Authorization": f"Bearer {PRICEMPIRE_API_KEY}",
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
    }


def _parse_pricempire_price(source_data: dict) -> float:
    """
    Pricempire возвращает цены в ЦЕНТАХ USD (integer).
    Например: $1.50 = 150, $0.03 = 3, $25.00 = 2500.
    Всегда делим на 100.
    """
    if not source_data or not isinstance(source_data, dict):
        return 0.0
    raw = source_data.get("price") or source_data.get("min") or 0
    if not isinstance(raw, (int, float)) or raw <= 0:
        return 0.0
    return round(float(raw) / 100.0, 2)


# ─────────────────────────────────────────────
# API ENDPOINTS — базовые
# ─────────────────────────────────────────────
@app.get("/api/ping")
def ping():
    return {
        "status": "ok",
        "version": "1.1.0",
        "pricempire_key": bool(PRICEMPIRE_API_KEY),
        "platforms": list(PLATFORM_META.keys()),
    }


@app.get("/api/rates")
def get_rates():
    return currency_manager.get_rates()


#


# ─────────────────────────────────────────────
# AI ЧАТ — MAESTRO
# ─────────────────────────────────────────────
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

try:
    import google.generativeai as genai
    _genai_available = True
except ImportError:
    _genai_available = False

chat_session = None
if _genai_available and GEMINI_API_KEY:
    try:
        kb_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs", "workflow-CS2", "workflow_content_v2.txt")
        try:
            with open(kb_path, "r", encoding="utf-8") as f:
                knowledge = f.read()
        except FileNotFoundError:
            knowledge = "База знаний не найдена, отвечай на основе общих знаний о CS2."

        system_prompt = f"""Ты — VIZER AI, профессиональный ИИ-ассистент по арбитражу и трейдингу скинов CS2.
Твоя задача — анализировать сделки и отвечать, опираясь на базу знаний:

<база_знаний>
{knowledge}
</база_знаний>

Правила ответов:
1. Краткость — без воды.
2. Только факты из базы знаний (схемы закупки, площадки, ликвидность, флоаты, холд).
3. Профессиональный сленг трейдеров.
4. Вердикт по сделке — в первом предложении."""

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash", system_instruction=system_prompt)
        chat_session = model.start_chat(history=[])
        logger.info("VIZER AI инициализирован")
    except Exception as e:
        logger.error(f"AI init error: {e}")


class ChatMessage(BaseModel):
    message: str


@app.post("/api/chat")
def chat_with_ai(chat: ChatMessage):
    if not chat_session:
        return {"reply": "AI отключён. Добавьте GEMINI_API_KEY в .env для активации."}
    try:
        response = chat_session.send_message(chat.message)
        return {"reply": response.text}
    except Exception as e:
        logger.error(f"AI error: {e}")
        return {"reply": "Что-то пошло не так. Попробуйте позже."}


# ─────────────────────────────────────────────
# ИНВЕНТАРЬ STEAM
# ─────────────────────────────────────────────
@app.get("/api/inventory/{steam_id}")
def get_steam_inventory(steam_id: str):
    try:
        url = f"https://steamcommunity.com/inventory/{steam_id}/730/2?l=russian&count=100"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept-Language": "ru-RU,ru;q=0.9",
        }
        r = requests.get(url, headers=headers, timeout=10)

        if r.status_code == 403:
            return {"error": "Инвентарь скрыт настройками приватности Steam."}
        elif r.status_code == 429:
            return {"error": "Слишком много запросов к Steam. Попробуйте позже."}
        elif r.status_code != 200:
            return {"error": f"Ошибка Steam API (код {r.status_code})."}

        data = r.json()
        if not data or "assets" not in data or "descriptions" not in data:
            return {"error": "Инвентарь пуст или профиль не существует."}

        desc_map = {}
        for desc in data["descriptions"]:
            if desc.get("tradable", 0) == 1 or desc.get("marketable", 0) == 1:
                key = f"{desc['classid']}_{desc.get('instanceid', '0')}"
                desc_map[key] = desc

        grouped = {}
        for asset in data.get("assets", []):
            classid = asset.get("classid")
            instanceid = asset.get("instanceid", "0")
            gk = f"{classid}_{instanceid}"
            if not classid or gk not in desc_map:
                continue
            if gk in grouped:
                grouped[gk]["quantity"] += 1
                continue

            info = desc_map[gk]
            stickers = []
            for d in info.get("descriptions", []):
                val = d.get("value", "")
                if "Наклейка:" in val or "Sticker:" in val:
                    clean = re.sub('<[^<]+>', '', val).replace("Наклейка:", "").replace("Sticker:", "").strip()
                    if clean:
                        stickers = [s.strip() for s in clean.split(',')]
                    break

            inspect_url = ""
            for action in info.get("actions", []):
                if "Осмотреть" in action.get("name", "") or "Inspect" in action.get("name", ""):
                    inspect_url = (
                        action.get("link", "")
                        .replace("%owner_steamid%", steam_id)
                        .replace("%assetid%", asset.get("assetid", ""))
                    )
                    break

            grouped[gk] = {
                "name": info.get("market_hash_name") or info.get("name", "Неизвестный предмет"),
                "icon": f"https://community.cloudflare.steamstatic.com/economy/image/{info.get('icon_url')}",
                "type": info.get("type", ""),
                "stickers": stickers,
                "inspect_url": inspect_url,
                "quantity": 1,
            }

        return {"items": list(grouped.values())[:100]}
    except Exception as e:
        logger.error(f"Inventory error: {e}")
        return {"error": "Ошибка связи со Steam."}


# ─────────────────────────────────────────────
# СТАТИКА — обслуживаем CS2-vizer фронтенд
# ─────────────────────────────────────────────
# Пробуем CS2-vizer (новый UI), fallback на src/
_project_root = os.path.dirname(os.path.dirname(__file__))
_vizer_path = os.path.join(os.path.dirname(_project_root), "CS2-vizer")
_src_path = os.path.join(_project_root, "src")

if os.path.isdir(_vizer_path):
    static_path = _vizer_path
    logger.info(f"Фронтенд: CS2-vizer ({_vizer_path})")
else:
    static_path = _src_path
    logger.info(f"Фронтенд: src/ ({_src_path})")


@app.get("/")
async def serve_index():
    r = FileResponse(os.path.join(static_path, "index.html"))
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return r


app.mount("/", StaticFiles(directory=static_path), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
