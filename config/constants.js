const Markup = require("telegraf/markup");

const BOT = {
    name: "Билеты+ПДД",
    url: "https://t.me/avtopddbot",
    username: "@avtopddbot",
};

const MAIN_KEYBOARD = Markup.keyboard([
    Markup.button("Билеты"),
    Markup.button("Ответы"),
    Markup.button("Дорожные Знаки"),
    Markup.button("Правила"),
], { columns: 2 });

module.exports = {
    BOT,
    MAIN_KEYBOARD,
};