const { TicketModel } = require("../models");
const { telegraph } = require("../utils");

module.exports = async(ctx) => {
    const tickets = await TicketModel
        .find({})
        .sort({ indx: 1 });

    const { url } = await telegraph.createAnswers(tickets);
    return ctx.reply(url);
};

module.exports.getChached = (ctx) => {
    const url = "https://telegra.ph/Otvety-na-Bilety-10-09";
    return ctx.reply(url);
};