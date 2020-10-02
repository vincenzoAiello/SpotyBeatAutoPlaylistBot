const telegram = require("node-telegram-bot-api");
const puppeteer = require("puppeteer");
const chromiumBeat = require("./ChromiumBeat");

let bot = new telegram("your token", {
  polling: true,
});

let ricercaTop100;

bot.onText(/\/start/, (msg, match) => {
  bot.sendMessage(
    msg.chat.id,
    "<b>Benvenuto, con questo bot puoi creare automaticamnete una palylist Spotify contenente le top 100 tracce di Beatport!🎶</b>",
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Beatport top 100 🔝💯",
              callback_data: "top100",
            },
          ],
        ],
      },
    }
  );
});

bot.on("text", (msg) => {
  if (ricercaTop100) {
    let credenziali = msg.text.split(" ");
    let email = credenziali[0];
    let password = credenziali[1];

    chromiumBeat.CreaPlaylist(email, password, bot, msg.chat.id);
    ricercaTop100 = false;
  }
});

bot.on("callback_query", (callback) => {
  if (callback.data == "top100") {
    bot.answerCallbackQuery(callback.id).then(() => {
      bot.sendMessage(
        callback.message.chat.id,
        "<b>Inserisci email/username e password per accedere su Spotify</b> \n <i>es[email/username password]</i>",
        { parse_mode: "HTML" }
      );
      ricercaTop100 = true;
    });
  }
});
