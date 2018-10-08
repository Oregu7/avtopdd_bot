const { TicketModel } = require("../models");
const { telegraph } = require("../utils");

module.exports = async(ctx) => {
    const tickets = await TicketModel
        .find({})
        .sort({ indx: 1 });

    const { url } = await telegraph.createAnswers(tickets);
    return ctx.reply(url);
};