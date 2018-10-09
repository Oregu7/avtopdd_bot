const config = require("config");
const Telegraf = require("telegraf");
const { localSession } = require("./utils");
const {
    startController,
    ticketsController,
    examinationController,
    roadSignController,
    answersController,
    statisticsController,
    rulesController,
    broadcastController,
} = require("./controllers");

// configure
const token = config.get("bot.token");
const bot = new Telegraf(token);

// middlewares
bot.use(localSession.middleware());

// commands
bot.command("start", startController);
bot.command("tickets", ticketsController.command);
bot.command("roadSigns", roadSignController.categoriesCommand);
bot.command("answers", answersController);
bot.command("stat", statisticsController);
bot.command("rules", rulesController.command);
// hears
bot.hears(/билеты/i, ticketsController.command);
bot.hears(/дорожные знаки/i, roadSignController.categoriesCommand);
bot.hears(/ответы/i, answersController.getChached);
bot.hears(/правила/i, rulesController.command);
bot.hears(/\/fun (.+)/i, broadcastController);
// actions
bot.action(/^tickets:(\d+)$/, ticketsController.action);
bot.action(/^backToTickets$/, ticketsController.backAction);

bot.action(/^ticket:(\w+)$/, examinationController.startTestAction);
bot.action(/^examination:(\w+);(\d+);(\d+)$/, examinationController.answerAction);
bot.action(/^answered$/, examinationController.answeredAction);

bot.action(/^roadsign:(\w+);(\d*)$/, roadSignController.action);
bot.action(/^backToRoadSignsCategories$/, roadSignController.backAction);

bot.action(/^rules:(\d+)$/, rulesController.baseNextAction);
bot.action(/^rule:(\d+);?(command)?$/, rulesController.readMoreAction);
bot.action(/^backToRules$/, rulesController.backAction);

bot.catch((err) => {
    console.error(err);
});

module.exports = bot;