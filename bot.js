const config = require("config");
const Telegraf = require("telegraf");
const { localSession } = require("./utils");
const {
    startController,
    ticketsController,
    questionController,
} = require("./controllers");

// configure
const token = config.get("bot.token");
const bot = new Telegraf(token);

// middlewares
bot.use(localSession.middleware());

// commands
bot.command("start", startController);
bot.command("tickets", ticketsController.command);
// hears
bot.hears(/билеты/i, ticketsController.command);
// actions
bot.action(/^tickets:(\d+)$/, ticketsController.action);
bot.action(/^back$/, ticketsController.backAction);
bot.action(/^ticket:(\w+)$/, questionController.startTestAction);
bot.action(/^question:(\w+);(\d+);(true|false)$/, questionController.answerAction);

module.exports = bot;