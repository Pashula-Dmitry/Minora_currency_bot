const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHANNEL_ID; // ID вашего канала

const bot = new TelegramBot(token);
const app = express();
app.use(bodyParser.json());


const webhookUrl = process.env.WEBHOOK_URL;
bot.setWebHook(`${webhookUrl}/bot${token}`);

app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});


bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет! Я ваш бот.');
});


bot.onText(/\/dimaGetCurrentCurrency/, async (msg) => {
    const chatId = msg.chat.id;
    const searchPattern = /курс.*?USD.*?EUR.*?PLN.*?\+38.*?@MenorahValuta/;

    try {

        const updates = await bot.getUpdates({ offset: -1, limit: 100 });


        const channelMessages = updates
            .map(update => update.message)
            .filter(message => message && message.chat && message.chat.id == channelId);


        const lastMessage = channelMessages[channelMessages.length - 1];

        if (lastMessage) {
            await bot.forwardMessage(chatId, lastMessage.chat.id, lastMessage.message_id);
        } else {
            bot.sendMessage(chatId, 'Сообщения в канале не найдены.');
        }
    } catch (error) {
        console.error('Ошибка при получении сообщений:', error);
        bot.sendMessage(chatId, 'Произошла ошибка при получении сообщений.');
    }
});

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
