const puppeteer = require("puppeteer");

module.exports.CreaPlaylist = async function (email, password, bot, chatId) {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  try {
    bot.sendMessage(chatId, "<b>Avvio..</b>", { parse_mode: "HTML" });
    await page.goto("https://www.beatport.com/top-100", {
      waitUntil: "load",
    });

    //chiudi quel coso fastidioso che si apre appena apre la pagina
    try {
      let close = await page.$$("svg[class='bx-close-xsvg']");
      await close[0].click();
    } catch (err) {}

    bot.sendMessage(
      chatId,
      "<b>Predo le tracce dalla top 100 BeatPort...</b>",
      { parse_mode: "HTML" }
    );
    //prendi le tracce top 100 da beatport
    let tracceTop100 = await page.$$("li[class='bucket-item ec-item track']");
    let tracceTop100Final = [];
    for (let i = 0; i < tracceTop100.length; i++) {
      let titolo = await page.evaluate(
        (el) => el.getAttribute("data-ec-name"),
        tracceTop100[i]
      );

      let artista = await page.evaluate(
        (el2) => el2.getAttribute("data-ec-d1"),
        tracceTop100[i]
      );

      tracceTop100Final.push(titolo + " " + artista);
    }

    bot.sendMessage(chatId, "<b>Cerco i brani su spotify...</b>", {
      parse_mode: "HTML",
    });
    //vai sul sito per creare la playlist e accedi
    await page.goto("https://spotlistr.com/.netlify/functions/routes/login", {
      waitUntil: "load",
    });
    let inputAccedere = await page.$$("div[class='col-xs-12']");
    await inputAccedere[3].click();
    await page.keyboard.type(email);
    await inputAccedere[4].click();
    await page.keyboard.type(password);
    let buttonAccedi = await page.$$(
      "button[class='btn btn-block btn-green ng-binding']"
    );
    await buttonAccedi[0].click();
    try {
      /*await page.waitForSelector(
        "button[class='auth-allow btn btn-green ng-binding']"
      );*/
      await page.waitFor(2500);
      let ButtonAccetto = await page.$(
        "button[class='auth-allow btn btn-green ng-binding']"
      );
      await ButtonAccetto.click();
    } catch (err) {}

    //procedo a creare la playlist
    let menu = await page.$$("i[class='sidebar icon']");
    await menu[0].click();
    await page.waitFor(1000);
    let menuTextBox = await page.$$("a[class='item']");
    await menuTextBox[0].click();

    let inputListaTracce = await page.$$("div[class='field']");
    await inputListaTracce[0].click();
    for (let i = 0; i < tracceTop100Final.length; i++) {
      await page.keyboard.type(tracceTop100Final[i] + "\n");
    }

    bot.sendMessage(chatId, "<b>Creo la Playlist...</b>", {
      parse_mode: "HTML",
    });
    await autoScroll(page);
    let ButtonSearch = await page.$$("div>button[class='ui positive button']");
    await ButtonSearch[0].click();
    await ButtonSearch[0].click();

    await page.waitFor(20000);
    await autoScroll(page);
    let inputNomePl = await page.$$("div[class='six wide field']");
    await inputNomePl[0].click();
    await inputNomePl[0].click();
    await page.keyboard.type("Top 100 Beatport");
    let buttonCreate = await page.$$("button[class='ui positive button']");
    await buttonCreate[1].click();
    bot.sendMessage(chatId, "<b>Operazione Conclusa 👌</b>", {
      parse_mode: "HTML",
    });
    await page.waitFor(2000);
    browser.close();

    //mostro di nuovo menu
    bot.sendMessage(
      chatId,
      "<b>Scegli che tipo di playlist vuoi creare!🎶</b>",
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
  } catch (err) {
    browser.close();
    console.log(err);
    //se si verifica qualche errore
    bot.sendMessage(chatId, "<b>Si è verificato un errore, riprova 😥</b>", {
      parse_mode: "HTML",
    });
    bot.sendMessage(
      chatId,
      "<b>Scegli che tipo di playlist vuoi creare!🎶</b>",
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
  }
};

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 5000;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
