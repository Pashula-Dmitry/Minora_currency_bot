const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

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


bot.onText(/\/dima-get-current-currency/, async (msg) => {
    const chatId = msg.chat.id;
    const searchPattern = /курс.*?USD.*?EUR.*?PLN.*?\+38.*?@MenorahValuta/;

    try {

        const updates = await bot.getUpdates({ offset: -1, limit: 100 });


        const channelMessages = updates.filter(update =>
            update.message && update.message.chat && update.message.chat.id == channelId
        );


        const messageToForward = channelMessages.find(update =>
            searchPattern.test(update.message.text)
        );

        if (messageToForward) {
            await bot.forwardMessage(chatId, messageToForward.message.chat.id, messageToForward.message.message_id);
        } else {
            bot.sendMessage(chatId, 'Сообщение по шаблону не найдено.');
        }
    } catch (error) {
        console.error('Ошибка при поиске сообщений:', error);
        bot.sendMessage(chatId, 'Произошла ошибка при поиске сообщений.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
