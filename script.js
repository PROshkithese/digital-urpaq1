const historyEl = document.getElementById('history');
const textIn = document.getElementById('textIn');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const statusEl = document.getElementById('status');

/* ====== Добавление сообщений ====== */
function appendMessage(text, who='bot'){
    const div = document.createElement('div');
    div.className = 'jarvis-msg ' + (who === 'user' ? 'jarvis-user' : 'jarvis-bot');
    div.textContent = text;
    historyEl.appendChild(div);
    historyEl.scrollTop = historyEl.scrollHeight;
}

/* ====== Функция поиска ключевых слов ====== */
function matchAny(str, keywords){
    str = str.toLowerCase().replace(/[^a-zа-яәғқңөүһі0-9]/gi, ' ');
    return keywords.some(kw => str.includes(kw));
}

/* ====== База данных кабинетов ====== */
const classrooms = {
    'it': [
        { number: '101', name: 'Компьютерный класс', floor: 1, description: 'Основы программирования и компьютерной грамотности' },
        { number: '102', name: 'Лаборатория робототехники', floor: 1, description: 'Сборка и программирование роботов Lego Mindstorms' },
        { number: '103', name: '3D-моделирование', floor: 1, description: '3D-печать и моделирование в Blender' },
        { number: '201', name: 'Кибербезопасность', floor: 2, description: 'Основы информационной безопасности' },
        { number: '202', name: 'Веб-разработка', floor: 2, description: 'Создание сайтов и веб-приложений' }
    ],
    'science': [
        { number: '301', name: 'Биологическая лаборатория', floor: 3, description: 'Микроскопы и исследовательское оборудование' },
        { number: '302', name: 'Химическая лаборатория', floor: 3, description: 'Проведение химических экспериментов' },
        { number: '303', name: 'Кабинет экологии', floor: 3, description: 'Изучение окружающей среды' },
        { number: '304', name: 'Гидропоника', floor: 3, description: 'Выращивание растений без почвы' }
    ],
    'art': [
        { number: '401', name: 'Хореографический зал', floor: 4, description: 'Зеркальный зал для танцев' },
        { number: '402', name: 'Театральная студия', floor: 4, description: 'Сцена и театральное оборудование' },
        { number: '403', name: 'Изостудия', floor: 4, description: 'Мольберты и материалы для рисования' },
        { number: '404', name: 'Музыкальный класс', floor: 4, description: 'Фортепиано и музыкальные инструменты' },
        { number: '405', name: 'Фотостудия', floor: 4, description: 'Профессиональное фотооборудование' }
    ],
    'admin': [
        { number: '001', name: 'Приемная директора', floor: 1, description: 'Кабинет администрации' },
        { number: '002', name: 'Методический кабинет', floor: 1, description: 'Консультации для родителей' },
        { number: '003', name: 'Бухгалтерия', floor: 1, description: 'Финансовые вопросы' },
        { number: '004', name: 'Медпункт', floor: 1, description: 'Медицинская помощь' },
        { number: '005', name: 'Библиотека', floor: 1, description: 'Читальный зал и книжный фонд' },
        { number: '006', name: 'Столовая', floor: 1, description: 'Питание учащихся' },
        { number: '007', name: 'Актовый зал', floor: 1, description: 'Мероприятия и собрания' }
    ]
};

/* ====== Функция определения этажа по номеру кабинета ====== */
function getFloorByNumber(number) {
    const num = parseInt(number, 10);
    if(isNaN(num)) return null;

    if(num >= 1 && num <= 100) return 1;   // Администрация и IT 1 этаж
    if(num >= 101 && num <= 200) return 1; // IT 1 этаж
    if(num >= 201 && num <= 300) return 2; // IT 2 этаж
    if(num >= 301 && num <= 400) return 3; // Научно-биологические 3 этаж
    if(num >= 401 && num <= 500) return 4; // Художественно-эстетические 4 этаж

    return null;
}

/* ====== Функция поиска кабинета ====== */
function findClassroom(query) {
    const normalizedQuery = query.toLowerCase().replace(/[^a-zа-яәғқңөүһі0-9]/gi, ' ').trim();

    // Поиск по номеру кабинета в базе
    for (const category in classrooms) {
        const room = classrooms[category].find(r =>
            r.number === normalizedQuery ||
            normalizedQuery.includes(r.number)
        );
        if (room) return room;
    }

    // Если кабинет не найден в базе, попробуем определить этаж по номеру
    const match = normalizedQuery.match(/\b\d{1,3}\b/);
    if(match) {
        const floor = getFloorByNumber(match[0]);
        if(floor) return { number: match[0], floor: floor, description: `Кабинет ${match[0]} находится на ${floor}-м этаже.` };
    }

    // Поиск по названию или направлению
    for (const category in classrooms) {
        const room = classrooms[category].find(r =>
            normalizedQuery.includes(r.name.toLowerCase()) ||
            r.name.toLowerCase().includes(normalizedQuery)
        );
        if (room) return room;
    }

    if (matchAny(normalizedQuery, ['it', 'айти', 'компьютер', 'программир'])) {
        return { category: 'it', description: 'IT-направление находится на 1-2 этажах' };
    }
    if (matchAny(normalizedQuery, ['наука', 'биолог', 'хим', 'лаборатор'])) {
        return { category: 'science', description: 'Научные лаборатории находятся на 3 этаже' };
    }
    if (matchAny(normalizedQuery, ['искусств', 'творч', 'танц', 'театр', 'музык', 'рисован'])) {
        return { category: 'art', description: 'Творческие студии находятся на 4 этаже' };
    }

    return null;
}

/* ====== Логика агента ====== */
function agentResponse(input){
    if(!input) return "Скажи что-нибудь :)";

    const s = input.toLowerCase();

    // ===== Приветствия =====
    if (/^(hello|hi|hey)/.test(s)) {
        const greetings = [
            "Hello! I am an interactive assistant at the Petropavlovsk Schoolchildren's Palace. How can I help?",
            "Good afternoon! Ask me about clubs, directions, classrooms or events."
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (/^(салем|салеме|сәлем)/.test(s)) {
        const greetings = [
            "Сәлеметсіздер ме! Мен Петропавл қалалық Оқушылар сарайының интерактивті көмекшісімін. Қалай көмектесе аламын?",
            "Қайырлы күн! Мен сізге Оқушылар сарайында жол көрсетемін. Клубтар, бөлмелер немесе оқиғалар туралы сұраңыз."
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (/^(прив|здр)/.test(s)) {
        const greetings = [
            "Здравствуйте! Я интерактивный помощник Дворца школьников Петропавловска. Чем могу помочь?",
            "Добрый день! Спросите меня о кружках, кабинетах, направлениях или мероприятиях."
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // ===== Поиск кабинетов и навигация =====
    if (matchAny(s, ['кабинет', 'аудитор', 'комната', 'бөлме', 'класс', 'как найти', 'где находится', 'где найти', 'қайда', 'мекенжай'])) {
        const classroom = findClassroom(s);

        if (classroom && classroom.number) {
            const floorText = classroom.floor === 1 ? '1 этаже' : `${classroom.floor}-м этаже`;
            return `Кабинет ${classroom.number}${classroom.name ? ` («${classroom.name}») ` : ''}находится на ${floorText}. ${classroom.description || ''}`;
        } else if (classroom && classroom.category) {
            return classroom.description;
        } else {
            const suggestions = [
                "Я могу помочь найти конкретный кабинет. Уточните, например: 'Где находится кабинет 101?' или 'Как найти лабораторию робототехники?'",
                "Подскажите номер кабинета или название кружка, и я покажу, как туда добраться. Например: 'биологическая лаборатория' или 'кабинет 301'"
            ];
            return suggestions[Math.floor(Math.random() * suggestions.length)];
        }
    }

    // ===== Этажи и планировка =====
    if (matchAny(s, ['этаж', 'қабат', 'floor', 'планировка', 'схема'])) {
        return "Планировка Дворца школьников:\n\n" +
               "🔹 1 этаж: Администрация, IT (101–102)\n" +
               "🔹 2 этаж: IT, Веб-разработка (201–202)\n" +
               "🔹 3 этаж: Научные лаборатории (301–304)\n" +
               "🔹 4 этаж: Художественно-эстетические направления (401–405)";
    }

    // ===== Если ничего не понятно =====
    const unknown = [
        "Извините, я не совсем понял запрос. Попробуйте уточнить номер кабинета или название направления.",
        "Не могу найти информацию по вашему запросу. Уточните, пожалуйста, что именно ищете."
    ];
    return unknown[Math.floor(Math.random() * unknown.length)];
}

/* ====== События кнопок ====== */
sendBtn.addEventListener('click', () => {
    const userText = textIn.value.trim();
    if(!userText) return;
    appendMessage(userText, 'user');
    textIn.value = '';
    const botReply = agentResponse(userText);
    appendMessage(botReply, 'bot');
});

clearBtn.addEventListener('click', () => {
    historyEl.innerHTML = '';
});
