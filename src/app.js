document.addEventListener('DOMContentLoaded', () => {
    // --- Состояние приложения ---
    const state = {
        rates: {
            cnyManual: 13.50,
            cnyAuto: 0,
            usd: 92.40,
            eur: 100.00,
            uah: 2.45,
            kzt: 0.20,
            byn: 28.50,
            rub: 1.00
        },
        platforms: {
            buff163: { fee: 0.025 },
            csfloat: { fee: 0.02 },
            marketcsgo: { fee: 0.05 },
            steam: { fee: 0.15 },
            lisskins: { fee: 0.00 },
            csmoney: { fee: 0.07 }
        },
        currentTab: 'calculator',
        settings: {
            language: 'ru',
            mainCurrency: 'RUB',
            rounding: 2,
            rateInterval: 30,
            extraCosts: 0,
            cnyMode: 'auto',
            aiAuto: true,
            aiStyle: 'detailed',
            autoInventory: false,
            cacheInventory: true
        }
    };

    // ============================================
    // I18N — тексты интерфейса
    // ============================================
    const i18n = {
        ru: {
            newDeal: 'Новая сделка',
            itemNameLabel: 'Название предмета (используется для ИИ и Истории)',
            itemNamePlaceholder: 'Например: AK-47 | Redline (Field-Tested)',
            buyPrice: 'Цена покупки',
            buyPlatformLabel: 'Площадка покупки',
            sellPrice: 'Ожидаемая цена продажи',
            sellPlatformLabel: 'Площадка продажи',
            advancedBtn: 'Дополнительные параметры (Float, Stickers) ▾',
            advancedBtnOpen: 'Дополнительные параметры (Float, Stickers) ▴',
            floatLabel: 'Float Value',
            stickerLabel: 'Наценка за стикеры (%)',
            calcBtn: 'Рассчитать профит',
            saveHistoryBtn: '➕ Добавить сделку в историю',
            analysisTitle: 'Анализ прибыли',
            netProfit: 'Чистая прибыль',
            roi: 'ROI',
            chatTitle: 'Чат с Маэстро',
            chatOnline: 'Онлайн',
            chatPlaceholder: 'Спроси у Маэстро...',
            totalCost: 'Расход (с учетом комиссий):',
            totalRevenue: 'Доход (после вычета):',
            inventoryTitle: 'Инвентарь Steam',
            myAccounts: 'Мои аккаунты',
            addAccount: '➕ Добавить',
            loadInventory: '🔄 Загрузить инвентарь',
            historyTitle: 'История сделок',
            itemCol: 'Предмет',
            buyCol: 'Покупка',
            sellCol: 'Продажа',
            profitCol: 'Профит',
            dateCol: 'Дата',
            actionsCol: 'Действия',
            settingsTitle: '⚙️ Настройки приложения',
            settingsAutoSaved: 'Настройки сохраняются автоматически',
            // Arbitration
            arbTitle: '💹 Арбитраж-Сканер',
            arbSubtitle: 'Поиск арбитражных возможностей по ~24 000 скинов CS2',
            arbBuyOn: 'Покупаю на',
            arbSellOn: 'Продаю на',
            arbMinProfit: 'Мин. профит %',
            arbPriceFrom: 'Цена от ($)',
            arbPriceTo: 'Цена до ($)',
            arbSearchName: '🔎 Поиск по имени',
            arbSearchPlaceholder: 'AK-47, Karambit, AWP...',
            arbWear: 'Износ',
            arbWearAll: 'Все',
            arbSort: 'Сортировка',
            arbSortPct: '📈 Профит %',
            arbSortUsd: '💰 Профит $',
            arbSortBuy: '💵 Цена покупки',
            arbSortSell: '💶 Цена продажи',
            arbDir: 'Направление',
            arbDesc: '⬇ По убыванию',
            arbAsc: '⬆ По возрастанию',
            arbScanBtn: '🔍 Сканировать',
            arbLoadingText: 'Загружаем базу...',
            arbHint: '💡 Обновляется каждые 30 мин',
            arbSkin: 'Скин',
            arbBuyPrice: 'Цена покупки',
            arbSellPrice: 'Цена продажи',
            arbProfit: 'Профит',
            arbProfitPct: '% профита',
            arbActions: 'Действия',
            arbEmptyTitle: 'Нажмите «Сканировать»',
            arbEmptyDesc: 'Система проверит тысячи скинов и покажет самые выгодные арбитражные возможности',
            arbBuyBtn: '🛒 Купить',
            arbSellBtn: '💰 Продать',
            // Settings
            setGenTitle: 'Общие',
            setLang: 'Язык интерфейса',
            setLangHint: 'Выберите язык приложения',
            setTheme: 'Тема оформления',
            setThemeHint: 'Светлая или тёмная тема',
            setThemeLight: '☀️ Светлая',
            setThemeDark: '🌙 Тёмная',
            setCur: 'Основная валюта',
            setCurHint: 'В какой валюте показывать итоговый профит',
            setRatesTitle: 'Курсы и расчёты',
            setCnyMode: 'Тип курса юаня',
            setCnyModeHint: 'Выбор курса для расчётов',
            valCnyAuto: 'Биржевой',
            valCnyManual: 'Ручной',
            setCny: 'Ручной курс юаня (¥→₽)',
            setCnyHint: 'Ваш курс закупа юаней',
            setUpdate: 'Автообновление курсов',
            setUpdateHint: 'Как часто обновлять биржевые курсы',
            setRound: 'Округление цен',
            setRoundHint: 'Количество знаков после запятой',
            setFeesTitle: 'Комиссии площадок',
            setFeeHint: 'Комиссия площадки (%)',
            // Navigation
            navCalc: 'Калькулятор',
            navInv: 'Инвентарь',
            navHist: 'История',
            navArb: 'Арбитраж',
            navSet: 'Настройки',
            // Header
            hdrManual: 'Мой',
            hdrExchange: 'БИРЖА',
            // Settings Select
            valRub: '₽ Рубль',
            valUsd: '$ Доллар',
            valCny: '¥ Юань',
            valEur: '€ Евро',
            valUah: '₴ Гривна',
            valKzt: '₸ Тенге',
            valByn: 'Br Белорусский рубль',
            val5m: 'Каждые 5 мин',
            val15m: 'Каждые 15 мин',
            val30m: 'Каждые 30 мин',
            val0m: 'Вручную',
            // Custom statuses
            scanStatusDone: '✅ Сканирование завершено · {c} · Данные: Market.CSGO',
            scanStatusFound: 'Найдено {tt} возможностей · {b} → {s} · (Стр. {p} из {ps})',
            scanStatusCached: '{n} скинов в базе',
            errScan: '❌ Ошибка: {msg}. Проверьте, что сервер запущен.',
            msgSaved: '✅ Настройка сохранена',
            msgLangRun: '🇷🇺 Язык изменён',
            msgLangEn: '🇬🇧 Language changed',
            msgCnyUpdated: 'Курс юаня обновлен',
            emptyItemsTitle: 'Ничего не найдено',
            emptyItemsDesc: 'По вашим фильтрам нет подходящих предметов'
        },
        en: {
            newDeal: 'New Trade',
            itemNameLabel: 'Item name (used for AI and History)',
            itemNamePlaceholder: 'E.g.: AK-47 | Redline (Field-Tested)',
            buyPrice: 'Buy price',
            buyPlatformLabel: 'Buy platform',
            sellPrice: 'Expected sell price',
            sellPlatformLabel: 'Sell platform',
            advancedBtn: 'Advanced parameters (Float, Stickers) ▾',
            advancedBtnOpen: 'Advanced parameters (Float, Stickers) ▴',
            floatLabel: 'Float Value',
            stickerLabel: 'Sticker overpay (%)',
            calcBtn: 'Calculate profit',
            saveHistoryBtn: '➕ Add trade to history',
            analysisTitle: 'Profit Analysis',
            netProfit: 'Net Profit',
            roi: 'ROI',
            chatTitle: 'Chat with Maestro',
            chatOnline: 'Online',
            chatPlaceholder: 'Ask Maestro...',
            totalCost: 'Cost (with fees):',
            totalRevenue: 'Revenue (after deduction):',
            inventoryTitle: 'Steam Inventory',
            myAccounts: 'My accounts',
            addAccount: '➕ Add',
            loadInventory: '🔄 Load inventory',
            historyTitle: 'Trade History',
            itemCol: 'Item',
            buyCol: 'Buy',
            sellCol: 'Sell',
            profitCol: 'Profit',
            dateCol: 'Date',
            actionsCol: 'Actions',
            settingsTitle: '⚙️ Application Settings',
            settingsAutoSaved: 'Settings are saved automatically',
            // Arbitration
            arbTitle: '💹 Arbitrage Scanner',
            arbSubtitle: 'Finding arbitrage opportunities across ~24,000 CS2 skins',
            arbBuyOn: 'Buy on',
            arbSellOn: 'Sell on',
            arbMinProfit: 'Min. profit %',
            arbPriceFrom: 'Min price ($)',
            arbPriceTo: 'Max price ($)',
            arbSearchName: '🔎 Search by name',
            arbSearchPlaceholder: 'AK-47, Karambit, AWP...',
            arbWear: 'Wear',
            arbWearAll: 'All',
            arbSort: 'Sort by',
            arbSortPct: '📈 Profit %',
            arbSortUsd: '💰 Profit $',
            arbSortBuy: '💵 Buy price',
            arbSortSell: '💶 Sell price',
            arbDir: 'Direction',
            arbDesc: '⬇ Descending',
            arbAsc: '⬆ Ascending',
            arbScanBtn: '🔍 Scan',
            arbLoadingText: 'Loading database...',
            arbHint: '💡 Updates every 30 mins',
            arbSkin: 'Skin',
            arbBuyPrice: 'Buy Price',
            arbSellPrice: 'Sell Price',
            arbProfit: 'Profit',
            arbProfitPct: '% profit',
            arbActions: 'Actions',
            arbEmptyTitle: 'Press «Scan»',
            arbEmptyDesc: 'The system will scan thousands of skins and show the best arbitrage opportunities',
            arbBuyBtn: '🛒 Buy',
            arbSellBtn: '💰 Sell',
            // Settings
            setGenTitle: 'General',
            setLang: 'Interface Language',
            setLangHint: 'Choose app language',
            setTheme: 'Theme',
            setThemeHint: 'Light or Dark theme',
            setThemeLight: '☀️ Light',
            setThemeDark: '🌙 Dark',
            setCur: 'Main Currency',
            setCurHint: 'Currency for final profit',
            setRatesTitle: 'Rates & Calculations',
            setCnyMode: 'CNY Rate Mode',
            setCnyModeHint: 'For calculation formulas',
            valCnyAuto: 'Exchange (Auto)',
            valCnyManual: 'Manual',
            setCny: 'Manual CNY rate (¥→₽)',
            setCnyHint: 'Your buying CNY rate',
            setUpdate: 'Auto-update rates',
            setUpdateHint: 'How often to update exchange rates',
            setRound: 'Price rounding',
            setRoundHint: 'Decimal places',
            setFeesTitle: 'Platform Fees',
            setFeeHint: 'Platform fee (%)',
            // Navigation
            navCalc: 'Calculator',
            navInv: 'Inventory',
            navHist: 'History',
            navArb: 'Arbitrage',
            navSet: 'Settings',
            // Header
            hdrManual: 'My',
            hdrExchange: 'EXCHANGE',
            // Settings Select
            valRub: '₽ Ruble',
            valUsd: '$ Dollar',
            valCny: '¥ Yuan',
            valEur: '€ Euro',
            valUah: '₴ Hryvnia',
            valKzt: '₸ Tenge',
            valByn: 'Br Belarusian Ruble',
            val5m: '5 min',
            val15m: '15 min',
            val30m: '30 min',
            val0m: 'Manual',
            // Custom statuses
            scanStatusDone: '✅ Scan completed · {c} · Data: Market.CSGO',
            scanStatusFound: 'Found {tt} opportunities · {b} → {s} · (Page {p} of {ps})',
            scanStatusCached: '{n} skins in database',
            errScan: '❌ Error: {msg}. Check if the server is running.',
            msgSaved: '✅ Setting saved',
            msgLangRun: '🇷🇺 Язык изменён',
            msgLangEn: '🇬🇧 Language changed',
            msgCnyUpdated: 'CNY rate updated',
            emptyItemsTitle: 'Nothing found',
            emptyItemsDesc: 'No items match your filters'
        }
    };

    function applyLanguage(lang) {
        const t = i18n[lang] || i18n.ru;

        // Применяем значения для всех элементов с атрибутами data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                el.textContent = t[key];
            }
        });

        // Явное обновление кастомных селектов после перевода их option tags
        if (typeof refreshCustomSelect === 'function') {
            document.querySelectorAll('select.native-select, select.settings-control, select.arb-select').forEach(sel => {
                refreshCustomSelect(sel);
            });
        }

        // Применяем плейсхолдеры
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (t[key]) {
                el.setAttribute('placeholder', t[key]);
            }
        });

        const set = (id, prop, val) => { const el = document.getElementById(id); if (el) el[prop] = val; };
        const setText = (id, val) => set(id, 'textContent', val);
        const setPlaceholder = (id, val) => set(id, 'placeholder', val);

        // Стародавний хардкод (на случай если data-i18n где-то не прописан)
        setText('calc-card-title', t.newDeal);
        const itemNameLabel = document.querySelector('label[for="item-name"], label.item-name-label');
        if (itemNameLabel) itemNameLabel.textContent = t.itemNameLabel;
        setPlaceholder('item-name', t.itemNamePlaceholder);
        const calcBtn = document.getElementById('calculate-btn');
        if (calcBtn) calcBtn.textContent = t.calcBtn;
        const saveBtn = document.getElementById('save-history-btn');
        if (saveBtn) saveBtn.textContent = t.saveHistoryBtn;
        setText('result-card-title', t.analysisTitle);
        setText('net-profit-label', t.netProfit);
        setPlaceholder('ai-chat-input', t.chatPlaceholder);
        setText('ai-chat-title', t.chatTitle);
        setText('ai-chat-status', t.chatOnline);
        setText('total-cost-label', t.totalCost);
        setText('total-revenue-label', t.totalRevenue);
        setText('inventory-card-title', t.inventoryTitle);
        setText('add-account-btn', t.addAccount);
        setText('fetch-inventory-btn', t.loadInventory);
        setText('history-card-title', t.historyTitle);
        setText('settings-page-title', t.settingsTitle);
        setText('settings-footer-autosave', t.settingsAutoSaved);

        const advBtn = document.getElementById('toggle-advanced');
        if (advBtn) {
            const adv = document.getElementById('advanced-fields');
            advBtn.textContent = adv && adv.classList.contains('hidden') ? t.advancedBtn : t.advancedBtnOpen;
        }
        state.settings.language = lang;

        // Обновляем текущие результаты арбитража при смене языка, если они есть
        const arbScanBtn = document.getElementById('arb-scan-btn');
        if (arbScanBtn && !arbScanBtn.disabled && document.getElementById('arb-table-body')?.children.length > 0) {
            // В идеале мы бы перерендерили таблицу (runArbScan(currentArbPage)), но это дернет сервер.
            // Поэтому просто меняем заголовки (это уже сделано data-i18n).
        }
    }

    // --- Элементы UI ---
    const cnyManualInput = document.getElementById('cny-manual');
    const cnyAutoDisplay = document.getElementById('cny-auto');
    const usdRateDisplay = document.getElementById('usd-rate');
    const calcBtn = document.getElementById('calculate-btn');
    const itemNameInput = document.getElementById('item-name');
    const autocompleteList = document.getElementById('autocomplete-list');
    const itemFloatInput = document.getElementById('item-float');
    const floatMarker = document.getElementById('float-marker');
    let acDebounce = null;
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // --- Бургер-меню для мобилок ---
    const burgerBtn = document.getElementById('burger-btn');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function toggleMobileMenu() {
        burgerBtn.classList.toggle('active');
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
    }

    function closeMobileMenu() {
        burgerBtn.classList.remove('active');
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    }

    if (burgerBtn) burgerBtn.addEventListener('click', toggleMobileMenu);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileMenu);

    // --- Переключение вкладок ---
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');

            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            tabPanes.forEach(p => p.classList.remove('active'));
            document.getElementById(`tab-${tabId}`).classList.add('active');

            state.currentTab = tabId;
            closeMobileMenu();

            // Авто-загрузка инвентаря при переходе на вкладку
            if (tabId === 'inventory' && state.settings.autoInventory) {
                const fetchBtn = document.getElementById('fetch-inventory-btn');
                if (fetchBtn) setTimeout(() => fetchBtn.click(), 300);
            }
        });
    });

    // Интервал обновления курсов
    let rateIntervalTimer = null;
    function setupRateInterval(minutes) {
        if (rateIntervalTimer) clearInterval(rateIntervalTimer);
        const mins = parseInt(minutes) || 0;
        if (mins > 0) {
            rateIntervalTimer = setInterval(fetchRates, mins * 60 * 1000);
        }
    }

    // Форматирование числа с учётом настройки округления
    function formatNum(value, decimals) {
        const d = (decimals !== undefined) ? decimals : state.settings.rounding;
        return value.toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d });
    }

    // Конвертация рублей в основную валюту
    function toMainCurrency(rub) {
        const cur = state.settings.mainCurrency;

        switch (cur) {
            case 'USD':
                if (state.rates.usd > 0) return { value: rub / state.rates.usd, symbol: '$' };
                break;
            case 'EUR':
                if (state.rates.eur > 0) return { value: rub / state.rates.eur, symbol: '€' };
                break;
            case 'UAH':
                if (state.rates.uah > 0) return { value: rub / state.rates.uah, symbol: '₴' };
                break;
            case 'KZT':
                if (state.rates.kzt > 0) return { value: rub / state.rates.kzt, symbol: '₸' };
                break;
            case 'BYN':
                if (state.rates.byn > 0) return { value: rub / state.rates.byn, symbol: 'Br' };
                break;
            case 'CNY':
                const activeCny = state.settings.cnyMode === 'auto' ? state.rates.cnyAuto : state.rates.cnyManual;
                if (activeCny > 0) return { value: rub / activeCny, symbol: '¥' };
                break;
        }

        return { value: rub, symbol: '₽' };
    }

    function loadSettings() {
        // --- Тема (radio-кнопки) ---
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        const savedTheme = localStorage.getItem('maestro-theme') || 'light';
        if (savedTheme === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.className = isDark ? 'dark-theme' : '';
        } else {
            document.body.className = savedTheme === 'dark' ? 'dark-theme' : '';
        }
        const activeRadio = document.getElementById(`theme-${savedTheme}`);
        if (activeRadio) activeRadio.checked = true;
        themeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const theme = e.target.value;
                if (theme === 'system') {
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.body.className = isDark ? 'dark-theme' : '';
                    showToast('💻 Тема по системе', 'info');
                } else {
                    document.body.className = theme === 'dark' ? 'dark-theme' : '';
                    showToast(theme === 'dark' ? '🌙 Тёмная тема включена' : '☀️ Светлая тема включена', 'info');
                }
                localStorage.setItem('maestro-theme', theme);
                if (typeof renderHistoryChart === 'function') renderHistoryChart();
            });
        });

        // --- Загрузка всех настроек из localStorage ---
        const settingsDefaults = {
            'setting-language': 'ru',
            'setting-cny-mode': 'auto',
            'setting-main-currency': 'RUB',
            'setting-cny-rate': '13.50',
            'setting-rate-interval': '30',
            'setting-rounding': '2',
            'setting-fee-buff163': '2.5',
            'setting-fee-csfloat': '2.0',
            'setting-fee-marketcsgo': '5.0',
            'setting-fee-steam': '15.0',
            'setting-fee-lisskins': '0',
            'setting-fee-csmoney': '7.0',
            'setting-default-buy-platform': 'buff163',
            'setting-default-sell-platform': 'csfloat',
            'setting-default-buy-currency': 'CNY',
            'setting-default-sell-currency': 'USD',
            'setting-extra-costs': '0',
            'setting-ai-style': 'detailed'
        };

        Object.keys(settingsDefaults).forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const saved = localStorage.getItem('maestro-' + id);
            el.value = (saved !== null) ? saved : settingsDefaults[id];
        });

        // Checkbox настройки
        const checkboxDefaults = {
            'setting-auto-inventory': false,
            'setting-cache-inventory': true,
            'setting-ai-auto': true
        };
        Object.keys(checkboxDefaults).forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const saved = localStorage.getItem('maestro-' + id);
            el.checked = (saved !== null) ? (saved === 'true') : checkboxDefaults[id];
        });

        // Применяем язык из настроек
        const savedLang = localStorage.getItem('maestro-setting-language') || 'ru';
        state.settings.language = savedLang;
        applyLanguage(savedLang);

        // Применяем основную валюту
        const savedCurrency = localStorage.getItem('maestro-setting-main-currency') || 'RUB';
        state.settings.mainCurrency = savedCurrency;

        // Применяем округление
        const savedRounding = localStorage.getItem('maestro-setting-rounding');
        state.settings.rounding = savedRounding !== null ? parseInt(savedRounding) : 2;

        // Применяем допрасходы
        const savedExtra = localStorage.getItem('maestro-setting-extra-costs');
        state.settings.extraCosts = savedExtra !== null ? parseFloat(savedExtra) : 0;

        // Применяем AI настройки
        const savedAiAuto = localStorage.getItem('maestro-setting-ai-auto');
        state.settings.aiAuto = savedAiAuto !== null ? (savedAiAuto === 'true') : true;
        const savedAiStyle = localStorage.getItem('maestro-setting-ai-style');
        state.settings.aiStyle = savedAiStyle || 'detailed';

        // Применяем авто-загрузку и кэш инвентаря
        const savedAutoInv = localStorage.getItem('maestro-setting-auto-inventory');
        state.settings.autoInventory = savedAutoInv === 'true';
        const savedCacheInv = localStorage.getItem('maestro-setting-cache-inventory');
        state.settings.cacheInventory = savedCacheInv !== 'false'; // default true

        // Синхронизируем тип курса юаня
        const savedCnyMode = localStorage.getItem('maestro-setting-cny-mode') || 'auto';
        state.settings.cnyMode = savedCnyMode;

        window.updateCnyVisibility = function (mode) {
            const container = document.getElementById('setting-cny-rate-container');
            const topItem = document.getElementById('cny-manual-item');
            if (mode === 'auto') {
                if (container) container.classList.add('hidden');
                if (topItem) topItem.classList.add('hidden');
            } else {
                if (container) container.classList.remove('hidden');
                if (topItem) topItem.classList.remove('hidden');
            }
        };
        window.updateCnyVisibility(savedCnyMode);

        // Синхронизируем курс юаня
        const savedCnyRate = localStorage.getItem('maestro-setting-cny-rate');
        if (savedCnyRate) state.rates.cnyManual = parseFloat(savedCnyRate);
        const savedCnyManual = localStorage.getItem('maestro-cny-manual');
        if (savedCnyManual) state.rates.cnyManual = parseFloat(savedCnyManual);
        if (cnyManualInput) cnyManualInput.value = state.rates.cnyManual.toFixed(2);

        // Синхронизируем комиссии площадок
        const feeMap = {
            'setting-fee-buff163': 'buff163',
            'setting-fee-csfloat': 'csfloat',
            'setting-fee-marketcsgo': 'marketcsgo',
            'setting-fee-steam': 'steam',
            'setting-fee-lisskins': 'lisskins',
            'setting-fee-csmoney': 'csmoney'
        };
        Object.keys(feeMap).forEach(id => {
            const saved = localStorage.getItem('maestro-' + id);
            if (saved !== null) state.platforms[feeMap[id]].fee = parseFloat(saved) / 100;
        });

        // Устанавливаем дефолты калькулятора
        const defBuyPlatform = localStorage.getItem('maestro-setting-default-buy-platform');
        const defSellPlatform = localStorage.getItem('maestro-setting-default-sell-platform');
        const defBuyCurrency = localStorage.getItem('maestro-setting-default-buy-currency');
        const defSellCurrency = localStorage.getItem('maestro-setting-default-sell-currency');
        if (defBuyPlatform) { const el = document.getElementById('buy-platform'); if (el) el.value = defBuyPlatform; }
        if (defSellPlatform) { const el = document.getElementById('sell-platform'); if (el) el.value = defSellPlatform; }
        if (defBuyCurrency) { const el = document.getElementById('buy-currency'); if (el) el.value = defBuyCurrency; }
        if (defSellCurrency) { const el = document.getElementById('sell-currency'); if (el) el.value = defSellCurrency; }

        // Запускаем интервал обновления курсов
        const savedInterval = localStorage.getItem('maestro-setting-rate-interval');
        const intervalMins = savedInterval !== null ? parseInt(savedInterval) : 30;
        state.settings.rateInterval = intervalMins;
        setupRateInterval(intervalMins);

        renderHistory();
        renderAccounts();
    }

    cnyManualInput.addEventListener('change', (e) => {
        const value = parseFloat(e.target.value) || 0;
        state.rates.cnyManual = value;
        localStorage.setItem('maestro-cny-manual', value);
    });

    // Получение актуальных биржевых курсов валют
    async function fetchRates() {
        // Показываем skeleton пока грузятся курсы
        if (usdRateDisplay) usdRateDisplay.innerHTML = '<span class="skeleton skeleton-rate"></span>';
        if (cnyAutoDisplay) cnyAutoDisplay.innerHTML = '<span class="skeleton skeleton-rate"></span>';

        try {
            const response = await fetch('/api/rates');
            if (response.ok) {
                const data = await response.json();
                state.rates.usd = data.usd || state.rates.usd;
                state.rates.cnyAuto = data.cny || state.rates.cnyAuto;

                // Assuming the API returns these, otherwise they'll keep their default/previous values
                if (data.eur) state.rates.eur = data.eur;
                if (data.uah) state.rates.uah = data.uah;
                if (data.kzt) state.rates.kzt = data.kzt;
                if (data.byn) state.rates.byn = data.byn;

                // Обновляем интерфейс
                if (usdRateDisplay) usdRateDisplay.textContent = state.rates.usd.toFixed(2);
                if (cnyAutoDisplay) cnyAutoDisplay.textContent = state.rates.cnyAuto.toFixed(2);
            }
        } catch (error) {
            console.error("Ошибка загрузки курсов с локального сервера:", error);
            if (usdRateDisplay) usdRateDisplay.textContent = '—';
            if (cnyAutoDisplay) cnyAutoDisplay.textContent = '—';
        }
    }

    // --- Калькулятор ---
    async function calculate() {
        const itemName = document.getElementById('item-name').value.trim() || 'Указанный предмет';
        const buyPrice = parseFloat(document.getElementById('buy-price').value) || 0;
        const buyCurrency = document.getElementById('buy-currency').value;
        const buyPlatform = document.getElementById('buy-platform').value;

        const sellPrice = parseFloat(document.getElementById('sell-price').value) || 0;
        const sellCurrency = document.getElementById('sell-currency').value;
        const sellPlatform = document.getElementById('sell-platform').value;

        const stickerOverpay = parseFloat(document.getElementById('sticker-overpay').value) || 0;

        // 1. Приводим всё к рублю
        const getInRub = (amount, currency) => {
            if (currency === 'CNY') return amount * (state.settings.cnyMode === 'auto' ? state.rates.cnyAuto : state.rates.cnyManual);
            if (currency === 'USD') return amount * state.rates.usd;
            return amount;
        };

        const buyInRub = getInRub(buyPrice, buyCurrency);
        const sellInRubBase = getInRub(sellPrice, sellCurrency);

        // 2. Наценка за стикеры
        const stickerValue = (sellInRubBase * (stickerOverpay / 100));
        const sellInRubWithStickers = sellInRubBase + stickerValue;

        // 3. Вычитаем комиссии
        const sellFee = state.platforms[sellPlatform] ? state.platforms[sellPlatform].fee : 0;
        const netRevenueRub = sellInRubWithStickers * (1 - sellFee);

        // 4. Допрасходы (из настроек)
        const extraRub = getInRub(state.settings.extraCosts, state.settings.mainCurrency);

        // 5. Итог
        const profitRub = netRevenueRub - buyInRub - extraRub;
        const roi = buyInRub > 0 ? (profitRub / buyInRub) * 100 : 0;

        // 6. Отображение в основной валюте
        const profitEl = document.getElementById('final-profit');
        const roiEl = document.getElementById('final-roi');
        const mainCur = toMainCurrency(profitRub);
        const decimals = state.settings.rounding;
        profitEl.textContent = `${formatNum(mainCur.value, decimals)} ${mainCur.symbol}`;
        roiEl.textContent = `${roi.toFixed(1)}%`;

        if (profitRub > 0) {
            profitEl.className = 'result-value positive';
        } else if (profitRub < 0) {
            profitEl.className = 'result-value negative';
        } else {
            profitEl.className = 'result-value neutral';
        }

        window.lastCalculation = {
            itemName, buyPrice, buyCurrency, buyPlatform, sellPrice, sellCurrency, sellPlatform, profitRub
        };
        const saveHistoryBtn = document.getElementById('save-history-btn');
        if (saveHistoryBtn) saveHistoryBtn.classList.remove('hidden');

        // Доход/расход в основной валюте
        const costCur = toMainCurrency(buyInRub + extraRub);
        const revCur = toMainCurrency(netRevenueRub);
        document.getElementById('total-cost').textContent = `${formatNum(costCur.value, decimals)} ${costCur.symbol}`;
        document.getElementById('total-revenue').textContent = `${formatNum(revCur.value, decimals)} ${revCur.symbol}`;

        // --- AI Маэстро (если включён автоанализ) ---
        if (!state.settings.aiAuto) return;

        const itemFloat = parseFloat(document.getElementById('item-float').value);
        const floatStr = isNaN(itemFloat) ? 'не указан' : String(itemFloat);

        const styleMap = {
            brief: 'Дай КРАТКИЙ анализ (2-3 предложения), только главное.',
            detailed: 'Проанализируй подробно, оцени ликвидность площадок, учти риски и дай финальный вердикт.',
            expert: 'Дай ЭКСПЕРТНЫЙ глубокий анализ: ликвидность, риски флоата, стикеров, тренды рынка, рекомендации по тайминму продажи. Используй всю базу знаний.'
        };
        const styleInstruction = styleMap[state.settings.aiStyle] || styleMap.detailed;

        const aiPrompt = `Пользователь рассчитывает сделку:\nПредмет: ${itemName}\nПокупка: ${buyPrice} ${buyCurrency} на ${buyPlatform}\nПродажа: ${sellPrice} ${sellCurrency} на ${sellPlatform}\nНаценка за стикеры: ${stickerOverpay}%\nИзнос (Float): ${floatStr}\nПрофит: ${profitRub.toFixed(2)} ₽ (ROI: ${roi.toFixed(1)}%).\n${styleInstruction}`;

        addChatMessage(`Оцениваю сделку по ${itemName}...`, 'user');
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: aiPrompt })
            });
            const data = await response.json();
            addChatMessage(data.reply, 'bot');
        } catch (error) {
            addChatMessage('Извините, не смог проанализировать сделку, сервер недоступен.', 'bot');
        }
    }

    calcBtn.addEventListener('click', calculate);

    // --- ИСТОРИЯ СДЕЛОК ---
    let historyData = JSON.parse(localStorage.getItem('maestro-history')) || [];
    let historyChartInstance = null;

    function renderHistoryChart() {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('history-chart');
        if (!ctx) return;

        // historyData отсортирована (сначала новые). Для графика нужны сначала старые.
        const reversedData = [...historyData].reverse();

        const labels = [];
        const dataPoints = [];
        let cumulativeProfit = 0;

        reversedData.forEach(trade => {
            cumulativeProfit += trade.profitRub || 0;
            const shortDate = trade.dateStr.split(' ')[0] || trade.dateStr; // берем только время/первую часть
            labels.push(shortDate);
            dataPoints.push(cumulativeProfit);
        });

        if (historyChartInstance) {
            historyChartInstance.destroy();
        }

        const isDark = document.body.classList.contains('dark-theme');
        const gridColor = isDark ? '#333' : '#e5e5ea';
        const textColor = isDark ? '#8e8e93' : '#636366';

        historyChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Капитал (P&L)',
                    data: dataPoints,
                    borderColor: '#007aff',
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#007aff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Бэнкролл: ${context.parsed.y.toFixed(2)} ₽`
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: textColor } },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor },
                        suggestedMin: 0
                    }
                }
            }
        });
    }

    function renderHistory() {
        const historyBody = document.getElementById('history-body');
        if (!historyBody) return;
        historyBody.innerHTML = '';
        historyData.forEach((c, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${c.itemName}</strong></td>
                <td>${c.buyPrice} ${c.buyCurrency} <br><small>${c.buyPlatform}</small></td>
                <td>${c.sellPrice} ${c.sellCurrency} <br><small>${c.sellPlatform}</small></td>
                <td class="${c.profitRub > 0 ? 'positive' : (c.profitRub < 0 ? 'negative' : '')}">${c.profitRub > 0 ? '+' : ''}${parseFloat(c.profitRub).toFixed(2)} ₽</td>
                <td>${c.dateStr}</td>
                <td>
                    <button class="btn-action edit-btn" style="background:none; border:none; cursor:pointer;" title="Отредактировать">✏️</button>
                    <button class="btn-action del-btn" style="background:none; border:none; cursor:pointer; color:red;" title="Удалить">🗑️</button>
                </td>
            `;
            tr.querySelector('.del-btn').addEventListener('click', () => {
                historyData.splice(index, 1);
                localStorage.setItem('maestro-history', JSON.stringify(historyData));
                renderHistory();
            });
            tr.querySelector('.edit-btn').addEventListener('click', () => {
                const newName = prompt("Новое название предмета:", c.itemName);
                if (newName) {
                    historyData[index].itemName = newName;
                    localStorage.setItem('maestro-history', JSON.stringify(historyData));
                    renderHistory();
                }
            });
            historyBody.appendChild(tr);
        });

        // Отрисовка графика после рендера таблицы
        renderHistoryChart();
    }

    const saveHistoryBtn = document.getElementById('save-history-btn');
    if (saveHistoryBtn) {
        saveHistoryBtn.addEventListener('click', () => {
            if (!window.lastCalculation) return;
            const now = new Date();
            const dateStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.toLocaleDateString()}`;

            const newTrade = { ...window.lastCalculation, dateStr };
            historyData.unshift(newTrade);
            localStorage.setItem('maestro-history', JSON.stringify(historyData));

            renderHistory();
            showToast('✅ Сделка сохранена в историю', 'success');

            saveHistoryBtn.classList.add('hidden');
            window.lastCalculation = null;
        });
    }

    // Дополнительные параметры
    const toggleBtn = document.getElementById('toggle-advanced');
    const advancedFields = document.getElementById('advanced-fields');

    toggleBtn.addEventListener('click', () => {
        advancedFields.classList.toggle('hidden');
        toggleBtn.textContent = advancedFields.classList.contains('hidden')
            ? 'Дополнительные параметры (Float, Stickers) ▾'
            : 'Дополнительные параметры (Float, Stickers) ▴';
    });

    // --- Автодополнение (Autocomplete) ---
    if (itemNameInput && autocompleteList) {
        itemNameInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (val.length < 2) {
                autocompleteList.classList.add('hidden');
                return;
            }
            if (acDebounce) clearTimeout(acDebounce);
            acDebounce = setTimeout(async () => {
                try {
                    const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(val)}`);
                    const data = await res.json();
                    if (!data.items || data.items.length === 0) {
                        autocompleteList.classList.add('hidden');
                        return;
                    }
                    autocompleteList.innerHTML = '';
                    data.items.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'autocomplete-item';
                        div.textContent = item;
                        div.addEventListener('click', () => {
                            itemNameInput.value = item;
                            autocompleteList.classList.add('hidden');
                        });
                        autocompleteList.appendChild(div);
                    });
                    autocompleteList.classList.remove('hidden');
                } catch (e) { console.error('Autocomplete API fail', e); }
            }, 300);
        });
        document.addEventListener('click', (e) => {
            if (e.target !== itemNameInput && e.target !== autocompleteList) {
                autocompleteList.classList.add('hidden');
            }
        });
    }

    // --- Визуализатор Float ---
    if (itemFloatInput && floatMarker) {
        itemFloatInput.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            if (isNaN(val) || val < 0 || val > 1) {
                floatMarker.classList.add('hidden');
                return;
            }
            floatMarker.classList.remove('hidden');
            // Переводим флоат (0..1) в % ширины, учитывая нелинейность зон (но для простоты можно линейно):
            // Для реального float позиция = val * 100%
            floatMarker.style.left = `${(val * 100).toFixed(2)}%`;
            floatMarker.innerHTML = `<div class="float-marker-val">${val.toFixed(4)}</div>`;
        });
    }

    // --- AI Чат Логика ---
    const chatMessages = document.getElementById('ai-chat-messages');
    const chatInput = document.getElementById('ai-chat-input');
    const chatSendBtn = document.getElementById('ai-chat-send');

    function addChatMessage(text, sender = 'user') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;

        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.innerHTML = text.replace(/\n/g, '<br>');

        msgDiv.appendChild(bubble);
        chatMessages.appendChild(msgDiv);

        // Прокрутка вниз к последнему сообщению
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleChatSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Показываем сообщение пользователя
        addChatMessage(text, 'user');
        chatInput.value = '';

        // 2. Имитируем ожидание перед ответом (в будущем тут будет запрос к Gemini)
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await response.json();
            addChatMessage(data.reply, 'bot');
        } catch (error) {
            addChatMessage("Извините, сервер ИИ временно недоступен.", 'bot');
        }
    }

    chatSendBtn.addEventListener('click', handleChatSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChatSend();
    });

    // --- Инвентарь Steam Аккаунты ---
    const fetchInvBtn = document.getElementById('fetch-inventory-btn');
    const accountSelect = document.getElementById('account-select');
    const addAccountBtn = document.getElementById('add-account-btn');
    const editAccountBtn = document.getElementById('edit-account-btn');
    const delAccountBtn = document.getElementById('delete-account-btn');
    let accounts = JSON.parse(localStorage.getItem('maestro-accounts')) || [];

    function renderAccounts() {
        if (!accountSelect) return;
        accountSelect.innerHTML = '<option value="">-- Выберите или добавьте аккаунт --</option>';
        accounts.forEach((acc, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = `${acc.name} (${acc.steamId})`;
            accountSelect.appendChild(opt);
        });
    }

    if (addAccountBtn) {
        addAccountBtn.addEventListener('click', () => {
            const steamId = prompt("Введите Steam ID 64 (Например: 76561198...):");
            if (!steamId) return;
            const name = prompt("Введите имя для этого аккаунта (Например: Мейн):") || "Аккаунт";
            accounts.push({ steamId, name });
            localStorage.setItem('maestro-accounts', JSON.stringify(accounts));
            renderAccounts();
            accountSelect.value = accounts.length - 1;
        });
    }
    if (editAccountBtn) {
        editAccountBtn.addEventListener('click', () => {
            const idx = accountSelect.value;
            if (idx === "") return alert("Сначала выберите аккаунт!");
            const newName = prompt("Новое имя:", accounts[idx].name);
            if (newName) {
                accounts[idx].name = newName;
                localStorage.setItem('maestro-accounts', JSON.stringify(accounts));
                renderAccounts();
                accountSelect.value = idx;
            }
        });
    }
    if (delAccountBtn) {
        delAccountBtn.addEventListener('click', () => {
            const idx = accountSelect.value;
            if (idx === "") return alert("Сначала выберите аккаунт!");
            if (confirm(`Удалить аккаунт ${accounts[idx].name}?`)) {
                accounts.splice(idx, 1);
                localStorage.setItem('maestro-accounts', JSON.stringify(accounts));
                renderAccounts();
            }
        });
    }

    const invLoading = document.getElementById('inventory-loading');
    const invError = document.getElementById('inventory-error');
    const invGrid = document.getElementById('inventory-grid');
    let isFetchingInv = false;

    fetchInvBtn.addEventListener('click', async () => {
        if (isFetchingInv) return;
        const idx = accountSelect.value;
        if (idx === "") {
            invError.textContent = "Пожалуйста, выберите или добавьте аккаунт Steam.";
            invError.classList.remove('hidden');
            return;
        }
        const steamId = accounts[idx].steamId;

        // Проверяем кэш если включено кэширование
        if (state.settings.cacheInventory) {
            const cacheKey = `maestro-inv-cache-${steamId}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const { data, timestamp } = JSON.parse(cached);
                    const ageMin = (Date.now() - timestamp) / 60000;
                    if (ageMin < 30) {
                        invGrid.innerHTML = '';
                        invError.classList.add('hidden');
                        renderInventoryItems(data.items, invGrid);
                        showToast(`📦 Инвентарь из кэша (${Math.floor(ageMin)} мин назад)`, 'info');
                        return;
                    }
                } catch (e) { /* кэш повреждён */ }
            }
        }

        isFetchingInv = true;
        fetchInvBtn.disabled = true;
        fetchInvBtn.style.opacity = '0.7';

        invLoading.classList.add('hidden');
        invGrid.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            invGrid.innerHTML += `
                <div class="skeleton-card">
                    <div class="skeleton skeleton-img"></div>
                    <div class="skeleton skeleton-text-long"></div>
                    <div class="skeleton skeleton-text-short"></div>
                </div>
            `;
        }
        invError.classList.add('hidden');

        try {
            const response = await fetch(`/api/inventory/${steamId}?t=${Date.now()}`);
            const data = await response.json();
            invGrid.innerHTML = '';

            if (data.error) {
                invError.textContent = data.error;
                invError.classList.remove('hidden');
                return;
            }
            if (!data.items || data.items.length === 0) {
                invError.textContent = "Инвентарь пуст или предметы скрыты.";
                invError.classList.remove('hidden');
                return;
            }

            renderInventoryItems(data.items, invGrid);

            // Сохраняем в кэш
            if (state.settings.cacheInventory) {
                try {
                    localStorage.setItem(`maestro-inv-cache-${steamId}`, JSON.stringify({ data, timestamp: Date.now() }));
                } catch (e) { /* localStorage переполнен */ }
            }
        } catch (error) {
            invLoading.classList.add('hidden');
            invError.textContent = "Произошла ошибка при загрузке. Сервер не отвечает.";
            invError.classList.remove('hidden');
        } finally {
            isFetchingInv = false;
            fetchInvBtn.disabled = false;
            fetchInvBtn.style.opacity = '1';
        }
    });

    function renderInventoryItems(items, grid) {
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'inv-item';
            let stickersHtml = '';
            if (item.stickers && item.stickers.length > 0) {
                stickersHtml = `<div class="inv-stickers-list">${item.stickers.map(s => `<span class="sticker-badge" title="${s}">◆ ${s.split('|')[0] || s}</span>`).join('')}</div>`;
            }
            let floatHtml = item.inspect_url ? `<div class="inv-float-badge" data-inspect="${item.inspect_url}">Флоат (узнать в игре)</div>` : '';
            let qtyHtml = (item.quantity && item.quantity > 1) ? `<span class="inv-qty-badge">×${item.quantity}</span>` : '';
            card.innerHTML = `
                <div style="position: relative;"><img class="inv-img" src="${item.icon}" alt="${item.name}">${qtyHtml}</div>
                <div class="inv-name">${item.name}</div>
                <div class="inv-meta">${item.type || 'Скин'}</div>
                ${stickersHtml}${floatHtml}
            `;
            card.addEventListener('click', () => {
                const itemNameInput = document.getElementById('item-name');
                if (itemNameInput) itemNameInput.value = item.name;
                showToast(`🎯 ${item.name} → калькулятор`, 'info');
                document.querySelector('[data-tab="calculator"]').click();
            });
            const cardIdx = grid.children.length;
            card.classList.add('animated');
            card.style.animationDelay = `${cardIdx * 50}ms`;
            grid.appendChild(card);
        });
    }

    // ============================================
    // TOAST-УВЕДОМЛЕНИЯ
    // ============================================
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // ============================================
    // RIPPLE-ЭФФЕКТ НА КНОПКАХ
    // ============================================
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const circle = document.createElement('span');
            circle.classList.add('ripple-circle');
            const rect = this.getBoundingClientRect();
            circle.style.left = (e.clientX - rect.left - 10) + 'px';
            circle.style.top = (e.clientY - rect.top - 10) + 'px';
            this.appendChild(circle);
            setTimeout(() => circle.remove(), 600);
        });
    });

    // ============================================
    // НАСТРОЙКИ — ЛОГИКА
    // ============================================

    // Сворачивание/разворачивание секций
    document.querySelectorAll('.settings-section-header').forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.getAttribute('data-collapse');
            const body = document.getElementById(targetId);
            if (!body) return;
            header.classList.toggle('collapsed');
            body.classList.toggle('collapsed');
        });
    });

    // Автосохранение всех select и input[number] настроек
    document.querySelectorAll('.settings-control, .settings-input-num').forEach(el => {
        el.addEventListener('change', () => {
            localStorage.setItem('maestro-' + el.id, el.value);
            const t = i18n[state.settings.language || 'ru'] || i18n.ru;
            showToast(t.msgSaved, 'success');

            // Смена типа курса юаня
            if (el.id === 'setting-cny-mode') {
                state.settings.cnyMode = el.value;
                if (typeof window.updateCnyVisibility === 'function') {
                    window.updateCnyVisibility(el.value);
                }
                if (typeof calculate === 'function') calculate();
                if (typeof renderHistory === 'function') renderHistory();
            }

            // Синхронизация основной валюты
            if (el.id === 'setting-main-currency') {
                const topBarCurrency = document.getElementById('top-bar-currency');
                if (topBarCurrency) topBarCurrency.value = el.value;
                if (typeof calculate === 'function') calculate();
                if (typeof renderHistory === 'function') renderHistory();
            }
            if (el.id === 'setting-cny-rate') {
                const val = parseFloat(el.value) || 0;
                state.rates.cnyManual = val;
                localStorage.setItem('maestro-cny-manual', val);
                if (cnyManualInput) cnyManualInput.value = val.toFixed(2);
            }

            // Синхронизация комиссий с state (включая csmoney)
            const feeMap = {
                'setting-fee-buff163': 'buff163',
                'setting-fee-csfloat': 'csfloat',
                'setting-fee-marketcsgo': 'marketcsgo',
                'setting-fee-steam': 'steam',
                'setting-fee-lisskins': 'lisskins',
                'setting-fee-csmoney': 'csmoney'
            };
            if (feeMap[el.id]) {
                state.platforms[feeMap[el.id]].fee = parseFloat(el.value) / 100;
            }

            // Применение языка
            if (el.id === 'setting-language') {
                applyLanguage(el.value);
                initCustomSelects(); // обновляем кастомные select после смены языка
            }

            // Основная валюта
            if (el.id === 'setting-main-currency') {
                state.settings.mainCurrency = el.value;
                if (typeof calculate === 'function') calculate();
                if (typeof renderHistory === 'function') renderHistory();
            }

            // Округление
            if (el.id === 'setting-rounding') {
                state.settings.rounding = parseInt(el.value) || 0;
            }

            // Допрасходы
            if (el.id === 'setting-extra-costs') {
                state.settings.extraCosts = parseFloat(el.value) || 0;
            }

            // Интервал обновления курсов
            if (el.id === 'setting-rate-interval') {
                const mins = parseInt(el.value) || 0;
                state.settings.rateInterval = mins;
                setupRateInterval(mins);
                if (mins > 0) {
                    showToast(`🔄 Курсы будут обновляться каждые ${mins} мин.`, 'info');
                } else {
                    showToast('🔄 Авто-обновление курсов отключено', 'info');
                }
            }

            // Стиль AI
            if (el.id === 'setting-ai-style') {
                state.settings.aiStyle = el.value;
            }
        });
    });

    // Автосохранение checkbox настроек
    document.querySelectorAll('.settings-toggle input[type="checkbox"]').forEach(el => {
        el.addEventListener('change', () => {
            localStorage.setItem('maestro-' + el.id, el.checked);
            const t = i18n[state.settings.language || 'ru'] || i18n.ru;
            showToast(t.msgSaved, 'success');

            // Применяем сразу
            if (el.id === 'setting-ai-auto') {
                state.settings.aiAuto = el.checked;
                showToast(el.checked ? '🤖 AI-автоанализ включён' : '🤖 AI-автоанализ отключён', 'info');
            }
            if (el.id === 'setting-auto-inventory') {
                state.settings.autoInventory = el.checked;
            }
            if (el.id === 'setting-cache-inventory') {
                state.settings.cacheInventory = el.checked;
                if (!el.checked) localStorage.removeItem('maestro-inv-cache');
            }
        });
    });

    // Синхронизация top-bar ручного юаня
    if (cnyManualInput) {
        cnyManualInput.addEventListener('change', () => {
            const cnySettingEl = document.getElementById('setting-cny-rate');
            if (cnySettingEl) cnySettingEl.value = cnyManualInput.value;
            localStorage.setItem('maestro-setting-cny-rate', cnyManualInput.value);
        });
    }

    // Очистить историю
    const clearHistoryBtn = document.getElementById('setting-clear-history');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Вы уверены? Все записи о сделках будут удалены.')) {
                historyData.length = 0;
                localStorage.removeItem('maestro-history');
                renderHistory();
                showToast('🗑️ История сделок очищена', 'info');
            }
        });
    }

    // Сбросить все настройки
    const resetAllBtn = document.getElementById('setting-reset-all');
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', () => {
            if (confirm('⚠️ Все настройки, история и аккаунты будут удалены. Продолжить?')) {
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('maestro-')) keysToRemove.push(key);
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
                showToast('⚠️ Все настройки сброшены. Перезагрузка...', 'error');
                setTimeout(() => location.reload(), 1200);
            }
        });
    }
    // ============================================
    // КАСТОМНЫЕ SELECT (DROPDOWN)
    // ============================================
    function initCustomSelects() {
        document.querySelectorAll('select:not(.native-select)').forEach(sel => {
            // Пропускаем если уже обработан
            if (sel.classList.contains('native-select')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'custom-select';

            // Триггер (кнопка, которая показывает текущий выбор)
            const trigger = document.createElement('div');
            trigger.className = 'custom-select-trigger';

            const selectedOpt = sel.options[sel.selectedIndex];
            trigger.innerHTML = `<span class="cs-label">${selectedOpt ? selectedOpt.textContent : ''}</span><span class="arrow">▼</span>`;

            // Панель опций
            const optionsPanel = document.createElement('div');
            optionsPanel.className = 'custom-select-options';

            Array.from(sel.options).forEach((opt, i) => {
                const optDiv = document.createElement('div');
                optDiv.className = 'custom-select-option' + (i === sel.selectedIndex ? ' selected' : '');
                optDiv.textContent = opt.textContent;
                optDiv.dataset.value = opt.value;

                optDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sel.value = opt.value;
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                    trigger.querySelector('.cs-label').textContent = opt.textContent;

                    optionsPanel.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
                    optDiv.classList.add('selected');

                    wrapper.classList.remove('open');
                });

                optionsPanel.appendChild(optDiv);
            });

            // Клик на триггер — открыть/закрыть
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                // Закрываем все другие dropdown'ы
                document.querySelectorAll('.custom-select.open').forEach(cs => {
                    if (cs !== wrapper) cs.classList.remove('open');
                });
                wrapper.classList.toggle('open');
            });

            // Скрываем нативный select
            sel.classList.add('native-select');

            // Вставляем
            sel.parentNode.insertBefore(wrapper, sel);
            wrapper.appendChild(sel);
            wrapper.appendChild(trigger);
            wrapper.appendChild(optionsPanel);
        });
    }

    // Обновить конкретный кастомный select (для динамических option — аккаунты)
    function refreshCustomSelect(selectEl) {
        const wrapper = selectEl.closest('.custom-select');
        if (!wrapper) return;

        const trigger = wrapper.querySelector('.custom-select-trigger .cs-label');
        const panel = wrapper.querySelector('.custom-select-options');

        // Пересоздать опции
        panel.innerHTML = '';
        Array.from(selectEl.options).forEach((opt, i) => {
            const optDiv = document.createElement('div');
            optDiv.className = 'custom-select-option' + (i === selectEl.selectedIndex ? ' selected' : '');
            optDiv.textContent = opt.textContent;
            optDiv.dataset.value = opt.value;

            optDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                selectEl.value = opt.value;
                selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                trigger.textContent = opt.textContent;

                panel.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
                optDiv.classList.add('selected');

                wrapper.classList.remove('open');
            });

            panel.appendChild(optDiv);
        });

        // Обновить триггер
        const selectedOpt = selectEl.options[selectEl.selectedIndex];
        if (trigger && selectedOpt) trigger.textContent = selectedOpt.textContent;
    }

    // Закрыть все dropdown при клике вне
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select.open').forEach(cs => cs.classList.remove('open'));
    });

    // ============================================
    // SMART ARBITRAGE — Логика
    // ============================================
    const arbInput = document.getElementById('arbitrage-input');
    const arbSearchBtn = document.getElementById('arbitrage-search-btn');
    const arbLoading = document.getElementById('arbitrage-loading');
    const arbError = document.getElementById('arbitrage-error');
    const arbResults = document.getElementById('arbitrage-results');
    const arbCards = document.getElementById('arbitrage-cards');
    const arbBar = document.getElementById('arbitrage-bar');
    const arbSummary = document.getElementById('arbitrage-summary');
    const arbItemName = document.getElementById('arbitrage-item-name');
    const arbHistoryChips = document.getElementById('arbitrage-history-chips');
    let isSearchingArb = false;

    // Загружаем историю поиска
    let arbSearchHistory = JSON.parse(localStorage.getItem('maestro-arb-history')) || [];

    function renderArbHistoryChips() {
        if (!arbHistoryChips) return;
        arbHistoryChips.innerHTML = '';
        arbSearchHistory.slice(0, 8).forEach(name => {
            const chip = document.createElement('span');
            chip.className = 'arb-chip';
            chip.textContent = name;
            chip.title = name;
            chip.addEventListener('click', () => {
                arbInput.value = name;
                searchArbitrage(name);
            });
            arbHistoryChips.appendChild(chip);
        });
    }

    function saveArbHistory(itemName) {
        arbSearchHistory = arbSearchHistory.filter(n => n !== itemName);
        arbSearchHistory.unshift(itemName);
        if (arbSearchHistory.length > 10) arbSearchHistory = arbSearchHistory.slice(0, 10);
        localStorage.setItem('maestro-arb-history', JSON.stringify(arbSearchHistory));
        renderArbHistoryChips();
    }

    async function searchArbitrage(itemName) {
        if (!itemName || isSearchingArb) return;
        isSearchingArb = true;

        // UI: показываем загрузку
        arbError.classList.add('hidden');
        arbResults.classList.add('hidden');
        arbLoading.classList.remove('hidden');
        arbSearchBtn.disabled = true;
        arbSearchBtn.style.opacity = '0.7';

        try {
            const response = await fetch('/api/arbitrage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_name: itemName })
            });
            const data = await response.json();

            arbLoading.classList.add('hidden');

            if (data.error) {
                arbError.textContent = data.error;
                arbError.classList.remove('hidden');
                return;
            }

            // Сохраняем в историю
            saveArbHistory(itemName);

            // Рендерим результат
            renderArbitrageResults(data);

        } catch (error) {
            arbLoading.classList.add('hidden');
            arbError.textContent = 'Ошибка соединения с сервером. Проверьте, запущен ли backend.';
            arbError.classList.remove('hidden');
        } finally {
            isSearchingArb = false;
            arbSearchBtn.disabled = false;
            arbSearchBtn.style.opacity = '1';
        }
    }

    function renderArbitrageResults(data) {
        // Название предмета
        arbItemName.textContent = data.item_name;

        // Определяем cheapest/expensive для подсветки
        const analysis = data.analysis;
        const cheapestKey = analysis ? analysis.cheapest.platform : null;
        const expensiveKey = analysis ? analysis.most_expensive.platform : null;

        // Рендерим карточки
        arbCards.innerHTML = '';
        const platformOrder = ['buff163', 'csfloat', 'market_csgo', 'steam'];

        const availablePrices = [];

        platformOrder.forEach((key, idx) => {
            const p = data.prices[key];
            if (!p) return;

            const card = document.createElement('div');
            let cardClass = 'arb-card';
            if (!p.available) cardClass += ' unavailable';
            if (p.available && key === cheapestKey) cardClass += ' cheapest';
            if (p.available && key === expensiveKey) cardClass += ' expensive';
            card.className = cardClass;

            // Анимация каскадная
            card.style.animation = `cardPopIn 0.4s ${idx * 80}ms ease-out both`;

            // Формат цены
            let priceMain = '—';
            let priceSub = 'Нет данных';
            if (p.available) {
                if (key === 'buff163' && p.price_cny) {
                    priceMain = `¥${p.price_cny.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}`;
                } else {
                    priceMain = `$${p.price_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                }
                priceSub = `≈ ${p.price_rub.toLocaleString('ru-RU', { minimumFractionDigits: 0 })} ₽`;
                availablePrices.push({ key, name: p.name, price_rub: p.price_rub });
            }

            // Бейджи
            let badgeHtml = '';
            if (p.available && key === cheapestKey && cheapestKey !== expensiveKey) {
                badgeHtml = '<span class="arb-badge buy">🏆 Купить тут</span>';
            } else if (p.available && key === expensiveKey && cheapestKey !== expensiveKey) {
                badgeHtml = '<span class="arb-badge sell">💰 Продать тут</span>';
            }

            const feePercent = (p.fee * 100).toFixed(1);

            card.innerHTML = `
                <span class="arb-card-icon">${p.icon}</span>
                <div class="arb-card-name">${p.name}</div>
                ${badgeHtml}
                <div class="arb-card-price">${priceMain}</div>
                <div class="arb-card-price-sub">${priceSub}</div>
                <div class="arb-card-fee">Комиссия: ${feePercent}%</div>
                <a href="${p.link}" target="_blank" rel="noopener" class="arb-link">
                    🔗 Открыть на ${p.name}
                </a>
            `;
            arbCards.appendChild(card);
        });

        // Рендерим шкалу цен
        renderPriceBar(availablePrices);

        // Рендерим сводку
        renderArbitrageSummary(analysis);

        arbResults.classList.remove('hidden');
    }

    function renderPriceBar(prices) {
        arbBar.innerHTML = '';
        if (prices.length < 2) return;

        const minPrice = Math.min(...prices.map(p => p.price_rub));
        const maxPrice = Math.max(...prices.map(p => p.price_rub));
        const range = maxPrice - minPrice;

        if (range === 0) return;

        const colors = {
            'buff163': '#FFD700',
            'csfloat': '#4A90D9',
            'market_csgo': '#34c759',
            'steam': '#1b2838',
        };

        prices.forEach(p => {
            const percent = ((p.price_rub - minPrice) / range) * 80 + 10; // 10%–90% range
            const dot = document.createElement('div');
            dot.className = 'arb-bar-dot';
            dot.style.left = `${percent}%`;
            dot.style.background = colors[p.key] || '#666';
            dot.title = `${p.name}: ${p.price_rub.toLocaleString('ru-RU')} ₽`;

            const label = document.createElement('span');
            label.className = 'arb-bar-dot-label';
            label.textContent = `${p.name}: ${p.price_rub.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}₽`;

            dot.appendChild(label);
            arbBar.appendChild(dot);
        });
    }

    function renderArbitrageSummary(analysis) {
        if (!analysis) {
            arbSummary.innerHTML = '<div class="arb-summary-title">Недостаточно данных для анализа</div>';
            return;
        }

        const verdictClass = analysis.verdict;
        let verdictText = '';
        let verdictEmoji = '';
        if (analysis.verdict === 'profitable') {
            verdictText = 'Арбитраж выгоден!';
            verdictEmoji = '🔥';
        } else if (analysis.verdict === 'unprofitable') {
            verdictText = 'Арбитраж невыгоден';
            verdictEmoji = '❌';
        } else {
            verdictText = 'Нейтрально';
            verdictEmoji = '➖';
        }

        const profitClass = analysis.net_profit_rub > 0 ? 'profit' : (analysis.net_profit_rub < 0 ? 'loss' : 'neutral-val');
        const profitSign = analysis.net_profit_rub > 0 ? '+' : '';

        arbSummary.innerHTML = `
            <div class="arb-summary-title">📊 Арбитражная сводка</div>
            <div class="arb-summary-row">
                <div class="arb-summary-item">
                    <span class="arb-summary-label">Спред</span>
                    <span class="arb-summary-value">${analysis.spread_percent}%</span>
                </div>
                <div class="arb-summary-item">
                    <span class="arb-summary-label">Чистый профит</span>
                    <span class="arb-summary-value ${profitClass}">${profitSign}${analysis.net_profit_rub.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</span>
                </div>
                <div class="arb-summary-item">
                    <span class="arb-summary-label">ROI (нетто)</span>
                    <span class="arb-summary-value ${profitClass}">${profitSign}${analysis.net_profit_percent}%</span>
                </div>
            </div>
            <div class="arb-verdict ${verdictClass}">${verdictEmoji} ${verdictText}</div>
            <div class="arb-summary-route">
                Маршрут: <strong>${analysis.cheapest.name}</strong> (${analysis.cheapest.price_rub.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽) 
                → <strong>${analysis.most_expensive.name}</strong> (${analysis.most_expensive.price_rub.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽)
                <br>Комиссия продажи: ${analysis.sell_fee_name} ${analysis.sell_fee_percent}%
            </div>
        `;
    }

    // Обработчики событий
    if (arbSearchBtn) {
        arbSearchBtn.addEventListener('click', () => {
            const itemName = arbInput.value.trim();
            if (itemName) searchArbitrage(itemName);
        });
    }

    if (arbInput) {
        arbInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const itemName = arbInput.value.trim();
                if (itemName) searchArbitrage(itemName);
            }
        });
    }

    function initArbitrage() {
        renderArbHistoryChips();
    }

    // ============================================
    // ARBITRAGE SCANNER — Сканер (Market.CSGO + Steam)
    // ============================================
    const arbScanBtn = document.getElementById('arb-scan-btn');
    const arbBuyPlatform = document.getElementById('arb-buy-platform');
    const arbSellPlatform = document.getElementById('arb-sell-platform');
    const arbMinProfit = document.getElementById('arb-min-profit');
    const arbMinPrice = document.getElementById('arb-min-price');
    const arbMaxPrice = document.getElementById('arb-max-price');

    // Новые элементы для фильтров и пагинации
    const arbSearch = document.getElementById('arb-search');
    const arbWear = document.getElementById('arb-wear');
    const arbSortBy = document.getElementById('arb-sort-by');
    const arbSortDir = document.getElementById('arb-sort-dir');
    const arbPaginationWrap = document.getElementById('arb-pagination');
    let currentArbPage = 1;
    const arbPerPage = 50;

    const scanLoading = document.getElementById('arb-loading');
    const scanError = document.getElementById('arb-error');
    const scanEmpty = document.getElementById('arb-empty');
    const scanResultsWrap = document.getElementById('arb-results-wrap');
    const scanTableBody = document.getElementById('arb-table-body');
    const scanResultsCount = document.getElementById('arb-results-count');
    const scanStatus = document.getElementById('arb-status');

    let isScanRunning = false;

    function setArbUI(uiState) {
        // Скрываем ВСЕ элементы сканера
        [scanLoading, scanError, scanResultsWrap, scanEmpty, scanStatus].forEach(el => {
            if (el) el.classList.add('hidden');
        });
        // Показываем нужные
        switch (uiState) {
            case 'loading':
                scanLoading?.classList.remove('hidden');
                break;
            case 'results':
                scanResultsWrap?.classList.remove('hidden');
                scanStatus?.classList.remove('hidden');
                break;
            case 'error':
                scanError?.classList.remove('hidden');
                break;
            case 'empty-scan':
                scanStatus?.classList.remove('hidden');
                scanEmpty?.classList.remove('hidden');
                break;
            default:
                scanEmpty?.classList.remove('hidden');
                break;
        }
    }

    function getPctClass(pct) {
        if (pct >= 20) return 'fire';
        if (pct >= 10) return 'great';
        return 'good';
    }

    function renderArbTable(items, usdToRub) {
        if (!scanTableBody) return;
        scanTableBody.innerHTML = '';

        let convRate = 1;
        let convSym = '$';
        const cur = state.settings.mainCurrency;

        if (cur === 'RUB') { convRate = usdToRub || state.rates.usd; convSym = '₽'; }
        else if (cur === 'EUR') { convRate = (usdToRub || state.rates.usd) / state.rates.eur; convSym = '€'; }
        else if (cur === 'UAH') { convRate = (usdToRub || state.rates.usd) / state.rates.uah; convSym = '₴'; }
        else if (cur === 'KZT') { convRate = (usdToRub || state.rates.usd) / state.rates.kzt; convSym = '₸'; }
        else if (cur === 'BYN') { convRate = (usdToRub || state.rates.usd) / state.rates.byn; convSym = 'Br'; }
        else if (cur === 'CNY') {
            const activeCny = state.settings.cnyMode === 'auto' ? (state.rates.cnyAuto || 13.5) : (state.rates.cnyManual || 13.5);
            convRate = (usdToRub || state.rates.usd) / activeCny;
            convSym = '¥';
        }

        items.forEach((item, i) => {
            const profitCur = (item.profit_usd * convRate).toFixed(cur === 'RUB' ? 0 : 2);
            const buyCur = (item.buy_price * convRate).toFixed(cur === 'RUB' ? 0 : 2);
            const sellCur = (item.sell_price * convRate).toFixed(cur === 'RUB' ? 0 : 2);

            const mainBuy = `$${item.buy_price}`;
            const subBuy = cur === 'USD' ? '' : ` <span style="color:var(--text-muted);font-size:11px;">(≈${buyCur}${convSym})</span>`;

            const mainSell = `$${item.sell_price}`;
            const subSell = cur === 'USD' ? '' : ` <span style="color:var(--text-muted);font-size:11px;">(≈${sellCur}${convSym})</span>`;

            const mainProfit = `+$${item.profit_usd}`;
            const subProfit = cur === 'USD' ? '' : ` <span style="color:var(--text-muted);font-size:11px;">(≈${profitCur}${convSym})</span>`;

            const pctClass = getPctClass(item.profit_pct);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="arb-rank">${i + 1}</td>
                <td><div class="arb-skin-name" title="${item.name}">${item.name}</div></td>
                <td class="arb-price">${mainBuy}${subBuy}</td>
                <td class="arb-price">${mainSell}${subSell}</td>
                <td class="arb-profit">${mainProfit}${subProfit}</td>
                <td><span class="arb-pct-badge ${pctClass}">+${item.profit_pct}%</span></td>
                <td>
                    <div class="arb-actions">
                        <a href="${item.buy_link}" target="_blank" class="arb-link-btn" data-i18n="arbBuyBtn">🛒 Купить</a>
                        <a href="${item.sell_link}" target="_blank" class="arb-link-btn" data-i18n="arbSellBtn">💰 Продать</a>
                    </div>
                </td>
            `;
            scanTableBody.appendChild(tr);
        });

        // Применяем язык для кнопок в таблице
        const lang = state.settings.language || 'ru';
        const t = i18n[lang] || i18n.ru;
        scanTableBody.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.innerHTML = t[key];
        });
    }

    function renderPagination(currentPage, totalPages) {
        if (!arbPaginationWrap) return;
        arbPaginationWrap.innerHTML = '';
        if (totalPages <= 1) return;

        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        // Первая / Пред
        ['«', '‹'].forEach((label, i) => {
            const btn = document.createElement('button');
            btn.className = 'arb-page-btn';
            btn.textContent = label;
            btn.disabled = currentPage === 1;
            btn.onclick = () => runArbScan(i === 0 ? 1 : currentPage - 1);
            arbPaginationWrap.appendChild(btn);
        });

        // Страницы
        for (let p = startPage; p <= endPage; p++) {
            const btn = document.createElement('button');
            btn.className = `arb-page-btn ${p === currentPage ? 'active' : ''}`;
            btn.textContent = p;
            btn.onclick = () => runArbScan(p);
            arbPaginationWrap.appendChild(btn);
        }

        // След / Последняя
        ['›', '»'].forEach((label, i) => {
            const btn = document.createElement('button');
            btn.className = 'arb-page-btn';
            btn.textContent = label;
            btn.disabled = currentPage === totalPages;
            btn.onclick = () => runArbScan(i === 0 ? currentPage + 1 : totalPages);
            arbPaginationWrap.appendChild(btn);
        });
    }

    async function runArbScan(targetPage = 1) {
        if (isScanRunning) return;
        isScanRunning = true;
        currentArbPage = targetPage;
        if (arbScanBtn) arbScanBtn.disabled = true;
        setArbUI('loading');

        const params = new URLSearchParams({
            buy_platform: arbBuyPlatform?.value || 'market_csgo',
            sell_platform: arbSellPlatform?.value || 'steam',
            buy_fee: state.platforms[arbBuyPlatform?.value]?.fee ?? 0.05,
            sell_fee: state.platforms[arbSellPlatform?.value]?.fee ?? 0.15,
            min_profit_pct: arbMinProfit?.value || 3,
            min_price_usd: arbMinPrice?.value || 1,
            max_price_usd: arbMaxPrice?.value || 5000,
            search: arbSearch?.value || '',
            wear: arbWear?.value || '',
            sort_by: arbSortBy?.value || 'profit_pct',
            sort_dir: arbSortDir?.value || 'desc',
            page: targetPage,
            per_page: arbPerPage
        });

        try {
            const resp = await fetch(`/api/arbitrage/scan?${params}`);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();

            const usdToRub = data.rates?.usd_to_rub || state.rates.usd || 92.4;
            const t = i18n[state.settings.language || 'ru'] || i18n.ru;
            const cached = data.cached_items ? t.scanStatusCached.replace('{n}', data.cached_items.toLocaleString()) : '';
            if (scanStatus) {
                scanStatus.textContent = t.scanStatusDone.replace('{c}', cached);
            }

            if (!data.items || data.items.length === 0) {
                setArbUI('empty-scan');
                if (scanEmpty) {
                    scanEmpty.querySelector('.arb-empty-title').textContent = t.emptyItemsTitle;
                    scanEmpty.querySelector('.arb-empty-desc').textContent = t.emptyItemsDesc;
                }
            } else {
                const buyName = arbBuyPlatform?.options[arbBuyPlatform.selectedIndex]?.text || '';
                const sellName = arbSellPlatform?.options[arbSellPlatform.selectedIndex]?.text || '';
                if (scanResultsCount) {
                    const t = i18n[state.settings.language || 'ru'] || i18n.ru;
                    scanResultsCount.textContent = t.scanStatusFound
                        .replace('{tt}', data.total)
                        .replace('{b}', buyName)
                        .replace('{s}', sellName)
                        .replace('{p}', data.page)
                        .replace('{ps}', data.pages);
                }

                renderArbTable(data.items, usdToRub);
                renderPagination(data.page, data.pages);
                setArbUI('results');
            }
        } catch (err) {
            setArbUI('error');
            if (scanError) scanError.textContent = `❌ Ошибка: ${err.message}. Проверьте, что сервер запущен.`;
        } finally {
            isScanRunning = false;
            if (arbScanBtn) arbScanBtn.disabled = false;
        }
    }

    if (arbScanBtn) arbScanBtn.addEventListener('click', () => runArbScan(1));
    if (arbSearch) arbSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') runArbScan(1); });

    // ============================================
    // ⌨️ KEYBOARD SHORTCUTS
    // ============================================
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Игнорируем если фокус в input/textarea
            const tag = document.activeElement.tagName;
            const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

            // Ctrl+Enter — рассчитать (даже из инпута)
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                const btn = document.getElementById('calculate-btn');
                if (btn && state.currentTab === 'calculator') btn.click();
                return;
            }

            // Остальные шорткаты — только вне инпутов
            if (isInput) return;

            // Ctrl+Shift+S — сохранить сделку
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                const saveBtn = document.getElementById('save-history-btn');
                if (saveBtn && !saveBtn.classList.contains('hidden')) saveBtn.click();
                return;
            }

            // Ctrl+1..5 — переключение вкладок
            if (e.ctrlKey && !e.shiftKey && !e.altKey) {
                const tabMap = { '1': 'calculator', '2': 'inventory', '3': 'history', '4': 'arbitrage', '5': 'settings' };
                if (tabMap[e.key]) {
                    e.preventDefault();
                    const navBtn = document.querySelector(`.nav-item[data-tab="${tabMap[e.key]}"]`);
                    if (navBtn) navBtn.click();
                    showToast(`📌 ${navBtn?.textContent?.trim() || tabMap[e.key]}`, 'info');
                    return;
                }
            }

            // ? — показать подсказки
            if (e.key === '?' && !e.ctrlKey) {
                showShortcutsHint();
            }
        });

        // Tooltip с подсказкой на кнопке расчёта
        const calcBtn = document.getElementById('calculate-btn');
        if (calcBtn && !calcBtn.title) calcBtn.title = 'Рассчитать (Ctrl+Enter)';
    }

    function showShortcutsHint() {
        const existing = document.getElementById('shortcuts-hint-toast');
        if (existing) return;
        const div = document.createElement('div');
        div.id = 'shortcuts-hint-toast';
        div.className = 'shortcuts-hint';
        div.innerHTML = `
            <div class="sh-title">⌨️ Горячие клавиши</div>
            <div class="sh-row"><kbd>Ctrl+Enter</kbd> <span>Рассчитать профит</span></div>
            <div class="sh-row"><kbd>Ctrl+Shift+S</kbd> <span>Сохранить сделку</span></div>
            <div class="sh-row"><kbd>Ctrl+1</kbd>…<kbd>5</kbd> <span>Переключить вкладку</span></div>
            <div class="sh-row"><kbd>?</kbd> <span>Эта подсказка</span></div>
            <button class="sh-close" onclick="this.parentElement.remove()">✕</button>
        `;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 6000);
    }

    // ============================================
    // 🌗 АВТО-ТЕМА ПО СИСТЕМЕ
    // ============================================
    function applySystemTheme() {
        const savedTheme = localStorage.getItem('maestro-theme') || 'light';
        if (savedTheme === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.className = isDark ? 'dark-theme' : '';
            // Слушаем изменения системной темы
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (localStorage.getItem('maestro-theme') === 'system') {
                    document.body.className = e.matches ? 'dark-theme' : '';
                }
            });
        }
    }

    // Патчим loadSettings theme-логику под system
    const originalThemeRadios = document.querySelectorAll('input[name="theme"]');
    originalThemeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'system') {
                applySystemTheme();
            }
        });
    });

    // ============================================
    // 👋 ОНБОРДИНГ (первый запуск)
    // ============================================
    function initOnboarding() {
        const alreadyOnboarded = localStorage.getItem('maestro-onboarded');
        if (alreadyOnboarded) return;
        showOnboarding();
    }

    const onboardingSteps = [
        {
            icon: '📊',
            title: 'Добро пожаловать в CS2 Skin Maestro!',
            text: 'Профессиональный инструмент для трейдеров CS2. Считай профит, сравнивай цены на площадках и управляй своими сделками.',
            highlight: null
        },
        {
            icon: '🧮',
            title: 'Калькулятор профита',
            text: 'Введи цену покупки и продажи — приложение автоматически учтёт комиссии площадок и курсы валют. AI Маэстро проанализирует сделку.',
            highlight: '[data-tab="calculator"]'
        },
        {
            icon: '💹',
            title: 'Smart Arbitrage',
            text: 'Введи название скина — получи сравнение цен на всех платформах. Сканер найдёт лучшие возможности для арбитража автоматически.',
            highlight: '[data-tab="arbitrage"]'
        },
        {
            icon: '⚙️',
            title: 'Настрой под себя',
            text: 'В настройках укажи свои курсы валют, комиссии площадок и выбери тему. Все данные сохраняются локально в браузере.',
            highlight: '[data-tab="settings"]'
        }
    ];

    let onboardingCurrentStep = 0;

    function showOnboarding() {
        const overlay = document.createElement('div');
        overlay.id = 'onboarding-overlay';
        overlay.className = 'onboarding-overlay';

        overlay.innerHTML = `
            <div class="onboarding-card" id="onboarding-card">
                <div class="onboarding-progress">
                    ${onboardingSteps.map((_, i) => `<div class="ob-dot ${i === 0 ? 'active' : ''}" data-step="${i}"></div>`).join('')}
                </div>
                <div class="onboarding-icon" id="ob-icon">${onboardingSteps[0].icon}</div>
                <h2 class="onboarding-title" id="ob-title">${onboardingSteps[0].title}</h2>
                <p class="onboarding-text" id="ob-text">${onboardingSteps[0].text}</p>
                <div class="onboarding-actions">
                    <button class="btn btn-secondary" id="ob-skip">Пропустить</button>
                    <button class="btn btn-primary" id="ob-next">Далее →</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('ob-skip').addEventListener('click', closeOnboarding);
        document.getElementById('ob-next').addEventListener('click', nextOnboardingStep);
    }

    function nextOnboardingStep() {
        onboardingCurrentStep++;

        if (onboardingCurrentStep >= onboardingSteps.length) {
            closeOnboarding();
            return;
        }

        const step = onboardingSteps[onboardingCurrentStep];
        const card = document.getElementById('onboarding-card');

        // Анимация смены
        card.classList.add('ob-slide-out');
        setTimeout(() => {
            document.getElementById('ob-icon').textContent = step.icon;
            document.getElementById('ob-title').textContent = step.title;
            document.getElementById('ob-text').textContent = step.text;

            // Обновляем точки прогресса
            document.querySelectorAll('.ob-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === onboardingCurrentStep);
                dot.classList.toggle('done', i < onboardingCurrentStep);
            });

            // Кнопка на последнем шаге
            const nextBtn = document.getElementById('ob-next');
            if (nextBtn) {
                nextBtn.textContent = onboardingCurrentStep === onboardingSteps.length - 1 ? '🚀 Начать!' : 'Далее →';
            }

            card.classList.remove('ob-slide-out');
            card.classList.add('ob-slide-in');
            setTimeout(() => card.classList.remove('ob-slide-in'), 300);

            // Подсвечиваем нужный nav-элемент
            if (step.highlight) {
                document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('ob-highlight'));
                const el = document.querySelector(step.highlight);
                if (el) el.classList.add('ob-highlight');
            }
        }, 200);
    }

    function closeOnboarding() {
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) {
            overlay.classList.add('ob-fade-out');
            setTimeout(() => overlay.remove(), 400);
        }
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('ob-highlight'));
        localStorage.setItem('maestro-onboarded', 'true');
    }

    // Кнопка "Показать онбординг снова" в настройках
    const resetOnboardingBtn = document.getElementById('setting-reset-onboarding');
    if (resetOnboardingBtn) {
        resetOnboardingBtn.addEventListener('click', () => {
            localStorage.removeItem('maestro-onboarded');
            onboardingCurrentStep = 0;
            showOnboarding();
            showToast('👋 Тур запущен заново', 'info');
        });
    }

    // Инициализация
    loadSettings();
    applySystemTheme();
    fetchRates();
    initCustomSelects();
    initArbitrage();
    initKeyboardShortcuts();
    initOnboarding();
});
