const Markup = require("telegraf/markup");
const { TicketModel } = require("../models");
const { paginate, createRows } = require("../utils");

function createTicketsMessage(result) {
    const message = "Экзаменационные билеты";
    const buttons = result.docs.map((ticket) =>
        Markup.callbackButton(ticket.name, `ticket:${ticket._id}`));
    const { previous, next } = paginate(result);
    const paginateButtons = [
        Markup.callbackButton("«", `tickets:${previous}`),
        Markup.callbackButton("»", `tickets:${next}`),
    ];
    const keyboard = Markup.inlineKeyboard([
        ...createRows(buttons, 3),
        paginateButtons,
    ]);

    return { message, keyboard };
}

exports.command = async(ctx) => {
    const tickets = await TicketModel.paginate({}, {
        page: 1,
        limit: 16,
        sort: "indx",
        select: "name _id",
    });
    const { message, keyboard } = createTicketsMessage(tickets);

    return ctx.reply(message, keyboard.extra());
};

exports.action = async(ctx) => {
    const [, page] = ctx.match;
    const tickets = await TicketModel.paginate({}, {
        page: Number(page),
        limit: 16,
        sort: "indx",
        select: "name _id",
    });
    const { message, keyboard } = createTicketsMessage(tickets);

    try {
        ctx.answerCbQuery("").catch(console.error);
        await ctx.editMessageText(message, keyboard.extra());
    } catch (err) {
        console.error(err);
    }
};

exports.backAction = (ctx) => {
    ctx.answerCbQuery("").catch(console.error);
    return exports.command(ctx);
};