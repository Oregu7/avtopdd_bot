const config = require("config");
const Telegraf = require("telegraf");
const { localSession } = require("./utils");
const {
    startController,
    ticketsController,
    questionController,
    roadSignController,
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
// hears
bot.hears(/билеты/i, ticketsController.command);
bot.hears(/знаки/i, roadSignController.categoriesCommand);
// actions
bot.action(/^tickets:(\d+)$/, ticketsController.action);
bot.action(/^backToTickets$/, ticketsController.backAction);
bot.action(/^ticket:(\w+)$/, questionController.startTestAction);
bot.action(/^question:(\w+);(\d+);(true|false)$/, questionController.answerAction);
bot.action(/^roadsign:(\w+);(\d*)$/, roadSignController.action);
bot.action(/^backToRoadSignsCategories$/, roadSignController.backAction);

module.exports = bot;