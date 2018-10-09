const config = require("config");
const escape = require("escape-html");
const Extra = require("telegraf/extra");
const { UserModel } = require("../models");
const { compileMessage } = require("../utils");

async function sendMessageToUser(ctx, user, text, { isLast = false, lastIndex = 0 } = {}) {
    try {
        const keyboard = config.get("constants.MAIN_KEYBOARD");
        await ctx.telegram.sendMessage(user.userId, text, Extra.markup(keyboard));
        if (isLast) {
            return ctx.reply(`Рассылка закончена!:\n\nПользователи: ${lastIndex + 1}\nСообщение: ${text}`);
        }
    } catch (err) {
        console.error(err);
    }
}

module.exports = async(ctx) => {
    let timeIndex = 5000;
    const text = compileMessage(escape(ctx.match[1].trim()));
    ctx.reply(`Начинаю рассылку:\n${text}`);

    const users = await UserModel.find({});
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        let isLast = i == (users.length - 1);
        setTimeout(sendMessageToUser, timeIndex, ctx, user, text, { isLast, lastIndex: i });
        timeIndex *= 2;
    }
};