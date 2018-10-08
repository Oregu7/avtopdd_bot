const Markup = require("telegraf/markup");
const { UserModel } = require("../models");
const { compileMessage } = require("../utils");

module.exports = async(ctx) => {
    if (!ctx.session.hasOwnProperty("authorized")) {
        const user = await UserModel.getOrCreate(ctx);
        console.log(`[ new client ] => ${user.username}:${user.userId}`);
        ctx.session.authorized = true;
    }

    const message = "<b>Transinfo Bot - </b> это бот, который поможет Вам выучить правила ПДД.";
    const keyboard = Markup.keyboard([
        Markup.button("Билеты"),
        Markup.button("Ответы"),
        Markup.button("Дорожные Знаки"),
    ], { columns: 2 });

    return ctx.replyWithHTML(compileMessage(message), keyboard.resize(true).extra());
};