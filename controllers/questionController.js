const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const { TicketModel } = require("../models");
const { compileMessage } = require("../utils");


function createQuestionMessage(ticket, questionNumber = 0) {
    const [question] = ticket.questions.splice(questionNumber, 1);
    const image = question.image ? `<a href="${question.image}">\u{2063}</a>` : "";
    const message = `${image}${question.text}\n
    ${question.answers.map((answer) => answer.text).join("\n")}`;
    const buttons = question.answers.map((answer, indx) => Markup.callbackButton(
        `${indx+1} Вариант`,
        `question:${ticket._id};${questionNumber};${answer.status}`
    ));
    const keyboard = Markup.inlineKeyboard([
        buttons, [Markup.callbackButton("«Вернуться", "back")],
    ]);

    return {
        message: compileMessage(message),
        keyboard,
    };
}

exports.startTestAction = async(ctx) => {
    const [, ticketId] = ctx.match;
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) return ctx.answerCbQuery("Я не нашел Ваш билет :(", true);
    ctx.answerCbQuery("");
    const { message, keyboard } = createQuestionMessage(ticket);

    return ctx.replyWithHTML(message, keyboard.extra());
};

exports.answerAction = async(ctx) => {
    const [, ticketId, questionNumber, answerStatus] = ctx.match;
    // проверяем верный ли ответ
    if (answerStatus == "false") return ctx.answerCbQuery("❌Ответ НЕверный !");
    // проверяем наличие билета
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) return ctx.answerCbQuery("Я не нашел Ваш билет :(", true);
    ctx.answerCbQuery("✅Ответ Верный !");
    // проверяем закончился ли наш тест
    const nextQuestionNumber = Number(questionNumber) + 1;
    if (ticket.questions.length <= nextQuestionNumber)
        return ctx.reply("Тест успешно завершен !");

    // отправляет следующий вопрос
    const { message, keyboard } = createQuestionMessage(ticket, nextQuestionNumber);
    return ctx.replyWithHTML(message, keyboard.extra());
};