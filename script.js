/* ====== Функция определения этажа по номеру кабинета ====== */
function getFloorByNumber(number) {
    const num = parseInt(number, 10);
    if (isNaN(num)) return null;

    if (num >= 1 && num <= 200) return 1;   // Администрация и IT 1 этаж
    if (num >= 201 && num <= 300) return 2; // IT 2 этаж
    if (num >= 301 && num <= 400) return 3; // Научные лаборатории 3 этаж
    if (num >= 401 && num <= 405) return 4; // Художественные студии 4 этаж

    return null; // Если кабинет за пределами 1–405
}

/* ====== Функция поиска кабинета ====== */
function findClassroom(query) {
    const normalizedQuery = query.toLowerCase().replace(/[^a-zа-яәғқңөүһі0-9]+/gi, ' ').trim();

    // Поиск по номеру кабинета
    for (const category in classrooms) {
        const room = classrooms[category].find(r =>
            r.number === normalizedQuery || normalizedQuery.split(' ').includes(r.number)
        );
        if (room) return room;
    }

    // Определение этажа по номеру
    const match = normalizedQuery.match(/\b\d{1,3}\b/);
    if (match) {
        const floor = getFloorByNumber(match[0]);
        if (floor) return { number: match[0], floor: floor, description: `Кабинет ${match[0]} находится на ${floor}-м этаже.` };
        return { number: match[0], description: `Кабинет ${match[0]} за пределами доступных этажей (1–405).` };
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
        return { category: 'it', description: 'IT-направление находится на 1–2 этажах' };
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
    if (/\b(hello|hi|hey)\b/.test(s)) {
        const greetings = [
            "Hello! I am an interactive assistant at the Petropavlovsk Schoolchildren's Palace. How can I help?",
            "Good afternoon! Ask me about clubs, directions, classrooms or events."
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (/\b(салем|салеме|сәлем)\b/.test(s)) {
        const greetings = [
            "Сәлеметсіздер ме! Мен Петропавл қалалық Оқушылар сарайының интерактивті көмекшісімін. Қалай көмектесе аламын?",
            "Қайырлы күн! Мен сізге Оқушылар сарайында жол көрсетемін. Клубтар, бөлмелер немесе оқиғалар туралы сұраңыз."
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (/\b(прив|здр)\b/.test(s)) {
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
            const floorText = classroom.floor ? (classroom.floor === 1 ? '1 этаже' : `${classroom.floor}-м этаже`) : 'неизвестном этаже';
            return `Кабинет ${classroom.number}${classroom.name ? ` («${classroom.name}») ` : ''}находится на ${floorText}. ${classroom.description || ''}`;
        } else if (classroom && classroom.category) {
            return classroom.description;
        } else {
            return "Я могу помочь найти кабинет. Уточните номер или название.";
        }
    }

    // ===== Этажи и планировка =====
    if (matchAny(s, ['этаж', 'қабат', 'floor', 'планировка', 'схема'])) {
        return "Планировка Дворца школьников:\n\n" +
               "🔹 1 этаж: Администрация, IT (001–102)\n" +
               "🔹 2 этаж: IT, Веб-разработка (201–202)\n" +
               "🔹 3 этаж: Научные лаборатории (301–304)\n" +
               "🔹 4 этаж: Художественно-эстетические направления (401–405)";
    }

    // ===== Если ничего не понятно =====
    return "Извините, я не совсем понял запрос. Попробуйте уточнить номер кабинета или название направления.";
}
