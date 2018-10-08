const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const { TicketModel, ExaminationModel } = require("../models");
const { compileMessage, createRows } = require("../utils");

function createQuestionMessage(ticket, questionNumber = 0) {
    const [question] = ticket.questions.splice(questionNumber, 1);
    const message = `${question.text}\n
    ${question.answers.map((answer) => answer.text).join("\n")}`;
    const buttons = question.answers.map((answer, indx) => Markup.callbackButton(
        `${indx+1} Вариант`,
        `question:${ticket._id};${questionNumber};${answer.status}`
    ));
    const keyboard = Markup.inlineKeyboard([
        ...createRows(buttons, 2), [Markup.callbackButton("«Вернуться", "backToTickets")],
    ]);

    return {
        image: question.image,
        message: compileMessage(message),
        keyboard,
    };
}

function sendQuestionMessageToUser(ctx, { image, message, keyboard } = {}) {
    if (!image)
        return ctx.replyWithHTML(message, keyboard.extra());
    if (message.length >= 200) {
        const photo = `<a href="${image}">\u{2063}</a>`;
        return ctx.replyWithHTML(photo + message, keyboard.extra());
    }

    return ctx.replyWithPhoto(image, Extra.load({ caption: message }).markup(keyboard));
}

exports.startTestAction = async(ctx) => {
    const [, ticketId] = ctx.match;
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) return ctx.answerCbQuery("Я не нашел Ваш билет :(", true).catch(console.error);
    ctx.answerCbQuery("").catch(console.error);
    const questionMessage = createQuestionMessage(ticket);

    return sendQuestionMessageToUser(ctx, questionMessage);
};

exports.answerAction = async(ctx) => {
    const [, ticketId, questionNumber, answerStatus] = ctx.match;
    // проверяем верный ли ответ
    if (answerStatus == "false") return ctx.answerCbQuery("👎Ответ НЕверный !").catch(console.error);
    // проверяем наличие билета
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) return ctx.answerCbQuery("Я не нашел Ваш билет :(", true).catch(console.error);
    ctx.answerCbQuery("👍Ответ Верный !").catch(console.error);
    // проверяем закончился ли наш тест
    const nextQuestionNumber = Number(questionNumber) + 1;
    if (ticket.questions.length <= nextQuestionNumber) {
        const keyboard = Markup.inlineKeyboard([
            [Markup.callbackButton("«Вернуться", "back")],
        ]);
        return ctx.reply("Тест успешно завершен !", keyboard.extra());
    }

    // отправляет следующий вопрос
    const questionMessage = createQuestionMessage(ticket, nextQuestionNumber);
    return sendQuestionMessageToUser(ctx, questionMessage);
};