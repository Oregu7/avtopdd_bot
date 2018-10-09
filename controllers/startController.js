const config = require("config");
const { UserModel } = require("../models");
const { compileMessage } = require("../utils");

module.exports = async(ctx) => {
    if (!ctx.session.hasOwnProperty("authorized")) {
        const user = await UserModel.getOrCreate(ctx);
        console.log(`[ new client ] => ${user.username}:${user.userId}`);
        ctx.session.authorized = true;
    }

    const message = "<b>Transinfo Bot - </b> это бот, который поможет Вам выучить правила ПДД.";
    const keyboard = config.get("constants.MAIN_KEYBOARD");

    return ctx.replyWithHTML(compileMessage(message), keyboard.extra());
};