const { Telegraf, Scenes, session } = require('telegraf');
const express = require('express');
const fs = require('fs');
const http = require('http');
const path = require('path');

const app = express();

const publicPath = path.join(__dirname, 'public');

const server = http.createServer(app);

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

const bot = new Telegraf('7143843786:AAHmtyOkT-GH1ZU8sc0JuNLGPiGc-KW4fuE');

bot.command("start", (ctx) => {
    ctx.reply(`Привет! Я бот, который генерирует билеты!\nДля этого отправьте команду /generate`);
});

const nameWizard = new Scenes.WizardScene(
    'city-wizard',
    (ctx) => {
        ctx.reply('Введите номер вагона:');
        return ctx.wizard.next();
    },
    (ctx) => {
        let userId = String(ctx.message.from.id);
        let userUserId = info[Number(userId)];
        if (isNaN(ctx.message.text) || ctx.message.text.length !== 3 && ctx.message.text.length !== 4) {
            ctx.reply("Вы ввели неверные данные, попробуйте ещё раз:");
        } else {
            if (ctx.message.text.length === 3) {
                userUserId.wagon = `0${ctx.message.text}`;
            } else {
                userUserId.wagon = ctx.message.text;
            }
            ctx.reply("Отлично! Введите количество билетов:");
            return ctx.wizard.next();
        }
    },
    (ctx) => {
        let userId = String(ctx.message.from.id);
        let userUserId = info[Number(userId)];
        if (Number(ctx.message.text) !== 1 && Number(ctx.message.text) !== 2) {
            ctx.reply("К сожалению можно сделать максимум два билета, попробуйте ещё раз:")
        } else {
            userUserId.count = ctx.message.text;
            const chatId = ctx.message.chat.id;
            let series = [];
            for (let i = 0; i < Number(info[userId].count); i++) {
                let serie = "";
                let firstLetter = Math.floor(Math.random() * 6) + 4;
                serie += firstLetter;
                for (let i = 0; i < 8; i++) {
                    serie += Math.floor(Math.random() * 10);
                }
                series[i] = serie;
            }

            info[userId].series = series.join(", ");
            const link = `http://localhost:3000/${chatId}`;
            ctx.reply(`Олично, вот сгенерированный билет:\n${link}`);
            return ctx.scene.leave();
        }
    }
);

const stage = new Scenes.Stage([nameWizard]);
bot.use(session());
bot.use(stage.middleware());

let info = {};

function updateData() {
    fs.readFile('users.txt', 'utf-8', (err, data) => {
        if (err) {
            console.error('Ошибка при чтении файла:', err);
            return;
        }
        const lines = data.split('\n');
        const cleanedLines = lines.map(line => line.replace('\r', ''));
        let newInfo = {};
        for (let i = 0; i < cleanedLines.length; i++) {
            if (!newInfo[cleanedLines[i]]) {
                newInfo[cleanedLines[i]] = {};
            }
            newInfo[cleanedLines[i]].wagon = "";
            newInfo[cleanedLines[i]].date = "";
            newInfo[cleanedLines[i]].currentTime = "";
            newInfo[cleanedLines[i]].time = "";
            newInfo[cleanedLines[i]].timer = "";
            newInfo[cleanedLines[i]].series = "";
            newInfo[cleanedLines[i]].count = "";
        }
        info = newInfo;
    });
}

fs.watchFile('users.txt', (curr, prev) => {
    if (curr.mtime > prev.mtime) {
        updateData();
    }
});

updateData();

bot.command("generate", (ctx) => {
    const users = Object.keys(info);
    let userId = String(ctx.message.from.id);
    if (users.includes(userId)) {
        if (info[userId].intervalId) {
            clearInterval(info[userId].intervalId);
        }
        ctx.scene.enter('city-wizard');
        const currentDate = new Date();

        setInterval(function () {
            const topTime = new Date();
            let hour = topTime.getHours();
            if (hour < 10) {
                hour = `0${hour}`;
            }

            let minute = topTime.getMinutes();
            if (minute < 10) {
                minute = `0${minute}`;
            }
            time = `${hour}:${minute}`;
            info[userId].time = time;
        }, 1000);

        let month = currentDate.getMonth() + 1;
        if (month < 10) {
            month = `0${month}`;
        }
        let day = currentDate.getDate();
        if (day < 10) {
            day = `0${day}`;
        }

        let currentHour = currentDate.getHours();
        if (currentHour < 10) {
            currentHour = `0${currentHour}`;
        }
        let currentMinute = currentDate.getMinutes();
        if (currentMinute < 10) {
            currentMinute = `0${currentMinute}`;
        }
        let currentSecond = currentDate.getSeconds();
        if (currentSecond < 10) {
            currentSecond = `0${currentSecond}`;
        }

        info[userId].intervalId = startTimer(userId);

        const date = `${day}.${month}.${currentDate.getFullYear()}`;
        const currentTime = `${currentHour}:${currentMinute}:${currentSecond}`;
        info[userId].date = date;
        info[userId].currentTime = currentTime;
    } else {
        ctx.reply(`К сожалению вы не можете пользоваться функциями этого бота, так как вы не заплатили за него. Стоимость функций этого бота - 100 грн. Для оплаты свяжитесь с нами:\n\n@EvgeniyZhuranskiy\n\nили\n\n@shsha4i`);
    }
});

function startTimer(userId) {
    let minutes = 60;
    let seconds = 0;
    let minutesText;
    let secondsText;

    return setInterval(function () {
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(info[userId].intervalId);
                info[userId].timer = "00:00";
                return;
            } else {
                minutes--;
                seconds = 59;
            }
        } else {
            seconds--;
        }
        if (minutes < 10) {
            minutesText = `0${minutes}`;
        } else {
            minutesText = `${minutes}`;
        }
        if (seconds < 10) {
            secondsText = `0${seconds}`;
        } else {
            secondsText = `${seconds}`;
        }
        info[userId].timer = `${minutesText}:${secondsText}`;
    }, 1000);
}

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head>');
    res.write('<meta charset="UTF-8">')
    res.write('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    res.write('<title>Главная страница</title>');
    res.write('</head>');
    res.write('<body>');
    res.write('<h1 style="font-family: Arial;">Добро пожаловать! Для того, чтобы использовать это приложение, перейдите в бота: <a href="https://t.me/tickets_generator_bot">Бот</a></h1>');
    res.write('</body>');
    res.write('</html>');
    res.end();
});

app.use(express.static(publicPath));

app.get('/:chatId', (req, res) => {
    const chatId = req.params.chatId;

    if (!Object.keys(info).includes(String(chatId)) || info[chatId].timer === "00:00" || info[chatId].count === "") {
        return res.status(404).send('<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Страница не найдена, либо таймер истёк</title></head><body><h1 style="font-family: Arial;">Страница не найдена, либо таймер истёк. Перейдите в бота, чтобы сгенерировать билет: <a href="https://t.me/tickets_generator_bot">Бот</a></h1></body></html>');
    }

    fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        let html = data.replace('${info.time}', info[chatId].time)
                       .replace('${info.series}', info[chatId].series)
                       .replace('${info.wagon}', info[chatId].wagon)
                       .replace('${info.date}', info[chatId].date)
                       .replace('${info.currentTime}', info[chatId].currentTime)
                       .replace('${info.count}', info[chatId].count)
                       .replace('${info.timer}', info[chatId].timer);

        res.send(html);
    });
});

app.get('/api/data', (req, res) => {
    const chatId = req.query.chatId;
    const data = {
        time: info[chatId].time,
        timer: info[chatId].timer
    };
    res.json(data);
});

bot.launch();