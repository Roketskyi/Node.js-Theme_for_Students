const fs = require('fs');
const readline = require('readline');

// Функція для зчитування списку студентів з файлу
function readStudentsFromFile(filename) {
    return new Promise((resolve, reject) => {
        const students = [];
        const readInterface = readline.createInterface({
            input: fs.createReadStream(filename),
            output: process.stdout,
            terminal: false
        });

        readInterface.on('line', function(line) {
            students.push(line);
        });

        readInterface.on('close', function() {
            resolve(students);
        });

        readInterface.on('error', function(err) {
            reject(err);
        });
    });
}

// Функція для зчитування списку тем з файлу
function readTopicsFromFile(filename) {
    return new Promise((resolve, reject) => {
        const topics = [];
        const readInterface = readline.createInterface({
            input: fs.createReadStream(filename),
            output: process.stdout,
            terminal: false
        });

        readInterface.on('line', function(line) {
            topics.push(line);
        });

        readInterface.on('close', function() {
            resolve(topics);
        });

        readInterface.on('error', function(err) {
            reject(err);
        });
    });
}

// Функція для зчитування списку призначених тем з файлу
function readAssignedTopicsFromFile(filename) {
    return new Promise((resolve, reject) => {
        let assignedPairs = [];
        try {
            if (fs.existsSync(filename)) {
                const data = fs.readFileSync(filename, 'utf8');
                assignedPairs = JSON.parse(data);
            }
            resolve(assignedPairs);
        } catch (error) {
            reject(error);
        }
    });
}

// Головна функція для зв'язування студентів і тем
async function assignTopicsToStudents() {
    try {
        const students = await readStudentsFromFile('students.txt');
        const topics = await readTopicsFromFile('topics.txt');
        let assignedPairs = await readAssignedTopicsFromFile('assigned_topics.txt');

        console.log(`Загальна кількість студентів: ${students.length}`);

        // Виведення кількості студентів з темою
        const studentsWithTopic = assignedPairs.map(pair => pair.student);
        console.log(`Кількість студентів без теми: ${students.length - studentsWithTopic.length}`);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Поетапне зв'язування тем і студентів
        for (const topic of topics) {
            // Перевірка на унікальність теми
            const topicAssigned = assignedPairs.some(pair => pair.topic === topic);
            if (topicAssigned) {
                continue; // Пропустити цю тему
            }

            console.log(`Тема: ${topic}`);
            console.log(`Натисніть '+' для призначення цієї теми студенту або натисніть Enter для пропуску:`);
            const answer = await new Promise((resolve) => {
                rl.question('', (response) => {
                    resolve(response);
                });
            });

            if (answer === '+') {
                // Перевірка, чи є студенти без теми
                const studentsWithoutTopic = students.filter(student => !assignedPairs.some(pair => pair.student === student));
                if (studentsWithoutTopic.length > 0) {
                    const randomIndex = Math.floor(Math.random() * studentsWithoutTopic.length);
                    const student = studentsWithoutTopic[randomIndex];
                    assignedPairs.push({ student, topic });
                    console.log(`Тему "${topic}" отримав(ла) студент ${student}`);
                } else {
                    console.log('Усі студенти вже отримали тему.');
                    break;
                }
            }
        }

        rl.close();

        // Перевірка наявності призначених тем після обробки
        if (assignedPairs.length === 0) {
            fs.writeFileSync('assigned_topics.txt', '[]');
            console.log('Файл assigned_topics.txt створено і залишений порожнім.');
        } else {
            // Запис даних у файл, додавання нових даних до вже існуючих або створення нового файлу
            fs.writeFileSync('assigned_topics.txt', JSON.stringify(assignedPairs, null, 2));
            console.log('Дані успішно додано до файлу assigned_topics.txt');
        }
    } catch (error) {
        console.error('Сталася помилка:', error);
    }
}

// Виклик головної функції
assignTopicsToStudents();
