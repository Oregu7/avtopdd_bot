const config = require("config");
const Telegraf = require("telegraf");
const { localSession } = require("./utils");
const {
    startController,
    ticketsController,
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

// start bot
bot.startPolling();