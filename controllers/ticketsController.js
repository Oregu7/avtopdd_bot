const Markup = require("telegraf/markup");
const { TicketModel } = require("../models");
const { compileMessage } = require("../utils");

function paginate({ page, pages } = {}) {
    let next = page + 1;
    let previous = page - 1;

    if (next > pages) next = 1;
    if (previous <= 0) previous = pages;

    return {
        next,
        previous,
    };
}

function createTicketsMessage(result) {
    const message = "Экзаменационные билеты";
    const buttons = result.docs
        .map((ticket) => Markup.callbackButton(ticket.name, `ticket:${ticket._id}`));
    const { previous, next } = paginate(result);
    const paginateButtons = [
        Markup.callbackButton("«", `tickets:${previous}`),
        Markup.callbackButton("»", `tickets:${next}`)
    ];
    const keyboard = Markup.inlineKeyboard([
        ...buttons,
        paginateButtons,
    ], { columns: 3});

    return { message, keyboard };
}

exports.command = async(ctx) => {
    const tickets = await TicketModel.paginate({}, {
        page: 1,
        limit: 16,
        sort: "indx",
        select: "name _id"
    });
    const { message, keyboard } = createTicketsMessage(tickets);

    return ctx.reply(message, keyboard.extra()); 
}

exports.action = async(ctx) => {
    const [, page] = ctx.match;
    const tickets = await TicketModel.paginate({}, {
        page,
        limit: 16,
        sort: "indx",
        select: "name _id"
    });
    const { message, keyboard } = createTicketsMessage(tickets);

    return ctx.editMessageText(message, keyboard.extra()); 
}