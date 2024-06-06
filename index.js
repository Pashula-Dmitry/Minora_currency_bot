const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

// Вставьте сюда ваш токен API, который вы получили от BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;

const index = new TelegramBot(token);
const app = express();
app.use(bodyParser.json());

const webhookUrl = process.env.WEBHOOK_URL;
index.setWebHook(`${webhookUrl}/bot${token}`);

app.post(`/bot${token}`, (req, res) => {
    index.processUpdate(req.body);
    res.sendStatus(200);
});


index.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    index.sendMessage(chatId, 'Привет! Я ваш бот.');
});


index.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    index.sendMessage(chatId, `Вы сказали: ${text}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
