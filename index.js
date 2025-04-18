require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { setSession, getSession, clearSession } = require('./sessionStore');
const { appendToSheet } = require('./googleSheet');
const uz = require('./locales/uz');
const ru = require('./locales/ru');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const app = express();
const PORT = process.env.PORT || 3000;

const langs = { uz, ru };
const langCode = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  langCode[chatId] = null;
  bot.sendMessage(chatId, "✅ Assalomu alaykum Xush kelibsiz! \n\n 📬 Ushbu bot orqali siz Toshkent davlat yuridik universiteti huzuridagi M.S.Vasiqova nomidagi akademik litseyining murojaatlar botiga xabar yuborishingiz mumkin.\n\n🌐 Davom etish uchun tilni tanlang:\n\n ✅ Здравствуйте Добро пожаловать!\n\n 📬 С помощью этого бота вы можете отправить сообщение боту приложения aкадемический лицей имени М.С.Васикова при Ташкентском государственном юридическом университете.\n\n\🌐 Выберите язык, чтобы продолжить.", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "O'zbek", callback_data: 'lang_uz' }],
        [{ text: "Русский", callback_data: 'lang_ru' }]
      ]
    }
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith('lang_')) {
    const lang = data.split('_')[1];
    langCode[chatId] = lang;
    const t = langs[lang];

    bot.sendMessage(chatId, t.intro);
    bot.sendMessage(chatId, t.choose_section, {
      reply_markup: {
        keyboard: [[...t.sections]],
        resize_keyboard: true,
        one_time_keyboard: true,
      }
    });
  } else if (data === 'anonymous') {
    const t = langs[langCode[chatId]];
    setSession(chatId, 'phone', 'Anonim');
    const session = getSession(chatId);
    const preview = t.preview
      .replace('{section}', session.section)
      .replace('{message}', session.message)
      .replace('{phone}', session.phone);

    bot.sendMessage(chatId, preview, {
      reply_markup: {
        keyboard: [[t.send]],
        resize_keyboard: true
      }
    });
  }
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const lang = langCode[chatId];
  if (!lang) return;

  const t = langs[lang];
  const text = msg.text;
  const session = getSession(chatId);

  if (t.sections.includes(text)) {
    setSession(chatId, 'section', text);
    bot.sendMessage(chatId, t.enter_message);
  } else if (session.section && !session.message) {
    setSession(chatId, 'message', text);
    bot.sendMessage(chatId, t.enter_phone, {
      reply_markup: {
        keyboard: [[{ text: t.anonymous, callback_data: 'anonymous' }]],
        resize_keyboard: true
      }
    });
  } else if (session.message && !session.phone) {
    setSession(chatId, 'phone', text);
    const preview = t.preview
      .replace('{section}', session.section)
      .replace('{message}', session.message)
      .replace('{phone}', session.phone);
    bot.sendMessage(chatId, preview, {
      reply_markup: {
        keyboard: [[t.send]],
        resize_keyboard: true
      }
    });
  } else if (text === t.send) {
    const id = uuidv4().slice(0, 8);
    const { section, message, phone } = getSession(chatId);

    appendToSheet({ section, message, phone, id });
    clearSession(chatId);

    bot.sendMessage(chatId, t.sent.replace('{id}', id), {
      reply_markup: { remove_keyboard: true }
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
