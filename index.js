const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHANNEL_ID;

const bot = new TelegramBot(token);
const app = express();
app.use(bodyParser.json());

bot.deleteWebHook()
    .then(() => {
        console.log('Webhook удален успешно.');

        bot.onText(/\/dima-get-current-currency/, async (msg) => {
            const chatId = msg.chat.id;

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

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Ошибка при удалении вебхука:', error);
    });
