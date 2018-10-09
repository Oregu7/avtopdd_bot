const config = require("config");
const Extra = require("telegraf/extra");
const { UserModel } = require("../models");
const { compileMessage } = require("../utils");

async function sendMessageToUser(ctx, user, text) {
    try {
        const keyboard = config.get("constants.MAIN_KEYBOARD");
        await ctx.telegram.sendMessage(user.userId, compileMessage(text), Extra.markup(keyboard));
    } catch (err) {
        console.error(err);
    }
}

module.exports = async(ctx) => {
    let timeIndex = 5000;
    const [, text] = ctx.match;
    const users = await UserModel.find({});
    for (let user of users) {
        setTimeout(sendMessageToUser, timeIndex, ctx, user, text);
        timeIndex *= 2;
    }
};