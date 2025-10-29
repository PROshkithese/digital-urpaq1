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
/* ====== Исправленная база кабинетов ====== */
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
        { number: '305', name: 'не известен для меня но', floor: 3, description: 'он на этом этаже' }
        { number: '306', name: 'не известен для меня но ', floor: 3, description: 'он на этом этаже ' }
        { number: '307', name: 'не известен для меня но', floor: 3, description: 'он на этом этаже' }
    ],
    'art': [
        { number: '401', name: 'Хореографический зал', floor: 4, description: 'Зеркальный зал для танцев' },
        { number: '402', name: 'Театральная студия', floor: 4, description: 'Сцена и театральное оборудование' },
        { number: '403', name: 'Изостудия', floor: 4, description: 'Мольберты и материалы для рисования' },
        { number: '404', name: 'Музыкальный класс', floor: 4, description: 'Фортепиано и музыкальные инструменты' },
        { number: '405', name: 'Фотостудия', floor: 4, description: 'Профессиональное фотооборудование' }
    ],
    'admin': [
        { number: '1', name: 'Приемная директора', floor: 1, description: 'Кабинет администрации' },
        { number: '2', name: 'Методический кабинет', floor: 1, description: 'Консультации для родителей' },
        { number: '3', name: 'Бухгалтерия', floor: 1, description: 'Финансовые вопросы' },
        { number: '4', name: 'Медпункт', floor: 1, description: 'Медицинская помощь' },
        { number: '5', name: 'Библиотека', floor: 1, description: 'Читальный зал и книжный фонд' },
        { number: '6', name: 'Столовая', floor: 1, description: 'Питание учащихся' },
        { number: '7', name: 'Актовый зал', floor: 1, description: 'Мероприятия и собрания' }
    ]
};

/* ====== Функция определения этажа по номеру кабинета ====== */
function getFloorByNumber(number) {
    const num = parseInt(number, 10);
    if (isNaN(num)) return null;

    if (num >= 1 && num <= 200) return 1;   // Администрация и IT 1 этаж
    if (num >= 201 && num <= 300) return 2; // IT 2 этаж
    if (num >= 301 && num <= 400) return 3; // Научные лаборатории 3 этаж
    if (num >= 401 && num <= 405) return 4; // Художественные студии 4 этаж

    return null; // вне диапазона
}

/* ====== Функция поиска кабинета с поддержкой этажей 1-405 ====== */
function findClassroom(query) {
    const normalizedQuery = query.toLowerCase().replace(/[^a-zа-яәғқңөүһі0-9]+/gi, ' ').trim();

    // Поиск по номеру кабинета в базе
    for (const category in classrooms) {
        const room = classrooms[category].find(r =>
            r.number === normalizedQuery || normalizedQuery.split(' ').includes(r.number)
        );
        if (room) return room;
    }

    // Если номер кабинета указан, но его нет в базе
    const match = normalizedQuery.match(/\b\d{1,3}\b/);
    if (match) {
        const floor = getFloorByNumber(match[0]);
        if (floor) {
            return { number: match[0], floor: floor, description: `Кабинет ${match[0]} находится на ${floor}-м этаже.` };
        }
    }

    // Поиск по названию
    for (const category in classrooms) {
        const room = classrooms[category].find(r =>
            normalizedQuery.includes(r.name.toLowerCase()) ||
            r.name.toLowerCase().includes(normalizedQuery)
        );
        if (room) return room;
    }

    // Поиск по направлению
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
            // Найден конкретный кабинет
            const floorText = classroom.floor === 1 ? '1 этаже' : `${classroom.floor} этаже`;
            const directions = [
                `Кабинет ${classroom.number} («${classroom.name}») находится на ${floorText}. ${classroom.description}`,
                `Чтобы найти ${classroom.name} (кабинет ${classroom.number}): поднимитесь на ${floorText}. ${classroom.description}`,
                `${classroom.name} расположен в кабинете ${classroom.number} на ${floorText}. ${classroom.description}`
            ];
            return directions[Math.floor(Math.random() * directions.length)];
        } else if (classroom && classroom.category) {
            // Найдено направление
            return classroom.description;
        } else {
            // Кабинет не найден
            const suggestions = [
                "Я могу помочь найти конкретный кабинет. Уточните, например: 'Где находится кабинет 101?' или 'Как найти лабораторию робототехники?'",
                "Подскажите номер кабинета или название кружка, и я покажу, как туда добраться. Например: 'биологическая лаборатория' или 'кабинет 301'",
                "Для навигации уточните: номер кабинета, название направления (IT, наука, искусство) или конкретный кружок"
            ];
            return suggestions[Math.floor(Math.random() * suggestions.length)];
        }
    }

    // ===== Этажи и планировка =====
    if (matchAny(s, ['этаж', 'қабат', 'floor', 'планировка', 'схема'])) {
        return "Планировка Дворца школьников:\n\n" +
               "🔹 1 этаж: Администрация, IT-направление, столовая, актовый зал\n" +
               "🔹 2 этаж: Продвинутые IT-лаборатории\n" + 
               "🔹 3 этаж: Научно-биологические лаборатории\n" +
               "🔹 4 этаж: Художественно-эстетические студии\n\n" +
               "Уточните, какой кабинет или направление вас интересует!";
    }

    // ===== Популярные кабинеты =====
    if (matchAny(s, ['робот', 'лего', 'робототехник'])) {
        return "🚀 Лаборатория робототехники находится в кабинете 102 на 1 этаже. Здесь собирают и программируют роботов Lego Mindstorms. Чтобы попасть: от главного входа прямо, затем налево.";
    }

    if (matchAny(s, ['3d', 'трехмер', 'принтер'])) {
        return "🖨️ Кабинет 3D-моделирования (103) на 1 этаже. Оборудован 3D-принтерами и компьютерами для создания моделей. Рядом с лабораторией робототехники.";
    }

    if (matchAny(s, ['танц', 'хореограф'])) {
        return "💃 Хореографический зал (401) на 4 этаже. Просторный зал с зеркалами и станками. Лифт находится справа от главного входа.";
    }

    if (matchAny(s, ['театр', 'сцена'])) {
        return "🎭 Театральная студия (402) на 4 этаже. Оснащена сценой, гримерными и театральным оборудованием. Рядом с хореографическим залом.";
    }

    if (matchAny(s, ['директор', 'администрац', 'приемная'])) {
        return "👔 Приемная директора (001) на 1 этаже. Сразу при входе направо. Часы приема: Пн-Пт 10:00-12:00, 15:00-17:00.";
    }

    if (matchAny(s, ['столов', 'еда', 'куш'])) {
        return "🍽️ Столовая (006) на 1 этаже. В левом крыле здания. Питание: завтрак 9:00-10:00, обед 13:00-14:00.";
    }

    // ===== Общие вопросы =====
    if(matchAny(s, ['как дела','how are you','қалдарыңыз қалай','қалайсыңыз'])) {
        const replies = [
            "Спасибо, всё отлично! Готов помочь с навигацией по Дворцу школьников! 😊",
            "I am your guide to the Schoolchildren's Palace. Ready to help you find any classroom!",
            "Рахмет, бәрі тамаша! Оқушылар сарайында жол көрсетуге дайынмын! 😊"
        ];
        return replies[Math.floor(Math.random() * replies.length)];
    }

    if(matchAny(s, ['пока','bye','сау болыңыз'])) {
        const replies = [
            "До свидания! Если заблудитесь - возвращайтесь, помогу сориентироваться!",
            "Goodbye! Come back if you need directions to any classroom!",
            "Қош болыңыз! Егер жолыңызды таппасаңыз, кері оралыңыз - жол көрсетемін!"
        ];
        return replies[Math.floor(Math.random() * replies.length)];
    }

    if(matchAny(s, ['как тебя зовут','what is your name','сен кімсің'])) {
        const replies = [
            "Мен Джарвис, Оқушылар сарайының көмекшісімін. Сарайдың кез келген бөлмесіне жол көрсете аламын!",
            "I am Jarvis, your navigation assistant in the Schoolchildren's Palace. I can guide you to any classroom!",
            "Мен Джарвис, Петропавл қаласындағы интерактивті гидімін. Кез келген кабинетке жол көрсете аламын! 😊"
        ];
        return replies[Math.floor(Math.random() * replies.length)];
    }

    // ===== Адрес и контакты =====
    if(matchAny(s, ['адрес','address','мекенжай','contact','телефон','place'])) {
        const replies = [
            "Дворец школьников находится по адресу: г. Петропавловск, ул. Жамбыла Жабаева, 55 А. Телефон: 8 7152 34-02-44. Нужна помощь с навигацией внутри здания?",
            "The Schoolchildren's Palace is located at: Petropavlovsk, st. Zhambyla Zhabaeva, 55 A. Telephone: 8 7152 34-02-44. Need directions inside the building?",
            "Оқушылар сарайы мына мекенжайда орналасқан: Петропавл қ., көш. Жамбыл Жабаева, 55 А. Телефон: 8 7152 34-02-44. Ғимарат ішінде жол көрсету керек пе?"
        ];
        return replies[Math.floor(Math.random() * replies.length)];
    }

    // ===== Основные направления =====
    if(matchAny(s, ['направлен','кружк','занят','club','клуб','program','дисциплин'])) {
        return "Во Дворце более 90 кружков по трём направлениям:\n\n" +
               "💻 IT-технологии (1-2 этажи): программирование, робототехника, 3D-моделирование\n" +
               "🔬 Научно-биологическое (3 этаж): биология, химия, экология, гидропоника\n" +
               "🎨 Художественно-эстетическое (4 этаж): танцы, театр, музыка, рисование\n\n" +
               "80% кружков бесплатные! Уточните, какой кабинет вас интересует?";
    }

    // ===== Если непонятно =====
    const randomReplies = [
        "Интересно! Уточните, пожалуйста: вас интересует конкретный кабинет, направление или как куда-то пройти?",
        "Попробуйте спросить по-другому. Например: 'Где находится кабинет 101?' или 'Как пройти в лабораторию робототехники?'",
        "I can help with navigation! Try asking: 'Where is classroom 201?' or 'How to find the robotics lab?'",
        "Мен жол көрсете аламын! Мысалы: '102 бөлме қайда?' немесе 'Робототехника зертханасына қалай баруға болады?' сұраңыз"
    ];
    return randomReplies[Math.floor(Math.random() * randomReplies.length)];
}

/* ====== Озвучка ====== */
let synth = window.speechSynthesis;
let voices = [];
function loadVoices(){
    voices = synth.getVoices();
}
if(synth){
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

function speak(text){
    if(!synth) return;

    const utt = new SpeechSynthesisUtterance(text);
    let lang = 'ru-RU';
    if(text.match(/[a-z]/i)) lang = 'en-US';
    if(text.match(/[\u0400-\u04FF]/)) lang = 'ru-RU';
    if(text.match(/[\u0600-\u06FF\u0400-\u04FF\u0430-\u044F]/)) lang = 'kk-KZ';

    const voice = voices.find(v => v.lang.startsWith(lang)) || voices[0];
    if(voice) utt.voice = voice;

    utt.rate = 1.2;
    utt.pitch = 1;
    utt.volume = 1.0;

    synth.speak(utt);
}

/* ====== Приветствие ====== */
appendMessage('Здравствуйте! Я — интерактивный помощник Дворца школьников Петропавловска. Чем могу помочь?', 'bot');

/* ====== Обработка кнопки отправки ====== */
sendBtn.onclick = () => {
    const text = textIn.value.trim();
    if(!text) return;
    appendMessage(text, 'user');

    
    const reply = agentResponse(text);
    setTimeout(() => {
        appendMessage(reply, 'bot');
        speak(reply);
    }, 500);
    textIn.value = '';
};

// Отправка сообщения по нажатию Enter
textIn.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendBtn.click();
    }
});

/* ====== Очистка ====== */
clearBtn.onclick = () => { 
    historyEl.innerHTML = ''; 
    appendMessage('Здравствуйте! Я — интерактивный помощник Дворца школьников Петропавловска.  Чем могу помочь?', 'bot');
};



