const _ = require("lodash");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const { TicketModel, ExaminationModel } = require("../models");
const { compileMessage, createRows } = require("../utils");

function createQuestionMessage(examinationId, ticket, questionNumber = 0) {
    const [question] = ticket.questions.splice(questionNumber, 1);
    const message = `${question.text}\n
    ${question.answers.map((answer) => answer.text).join("\n")}`;
    const buttons = question.answers.map((answer, indx) => Markup.callbackButton(
        `${indx+1} Вариант`,
        `examination:${examinationId};${questionNumber};${indx}`
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

function getAnswerStatus(ticket, questionNumber, answerNumber) {
    const { answers } = ticket.questions[Number(questionNumber)];
    return answers[Number(answerNumber)].status;
}

function checkExam(examination) {
    let success = 0;
    let wrong = 0;
    for (let answer of examination.answers) {
        if (answer.status) success += 1;
        else wrong += 1;
    }

    return { success, wrong };
}

function existQuestion(examination, questionNumber) {
    const { answers } = examination;
    return _.findIndex(answers, { question: Number(questionNumber) }) == -1 ? false : true;
}

async function updateQuestionKeyboard(ctx, ticket, questionNumber, answerNumber) {
    try {
        const question = ticket.questions[Number(questionNumber)];
        const buttons = question.answers.map((answer, indx) => {
            let icon = "";
            if (Number(answerNumber) == indx)
                icon = answer.status ? "✅" : "❌";

            return Markup.callbackButton(`${indx+1} Вариант ${icon}`, "answered");
        });
        const keyboard = Markup.inlineKeyboard([
            ...createRows(buttons, 2), [Markup.callbackButton("«Вернуться", "backToTickets")],
        ]);

        let ok = await ctx.editMessageReplyMarkup(keyboard);
    } catch (err) {
        console.error(err);
    }

    return "ok";
}

exports.startTestAction = async(ctx) => {
    const [, ticketId] = ctx.match;
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) return ctx.answerCbQuery("Я не нашел Ваш билет :(", true).catch(console.error);
    ctx.answerCbQuery("").catch(console.error);
    // examination
    const examination = await ExaminationModel.create({
        ticket: ticket._id,
        userId: ctx.from.id,
    });
    const questionMessage = createQuestionMessage(examination._id, ticket);

    return sendQuestionMessageToUser(ctx, questionMessage);
};

exports.answerAction = async(ctx) => {
    const [, examinationId, questionNumber, answerNumber] = ctx.match;
    // проверяем наличие билета
    const examination = await ExaminationModel
        .findById(examinationId)
        .populate("ticket");
    if (!examination) return ctx.answerCbQuery("Я не нашел Ваш билет :(", true).catch(console.error);
    // проверяем верный ли ответ
    const answerStatus = getAnswerStatus(examination.ticket, questionNumber, answerNumber);
    if (!answerStatus) ctx.answerCbQuery("👎Ответ НЕверный !").catch(console.error);
    else ctx.answerCbQuery("👍Ответ Верный !").catch(console.error);
    // проверяем наличие вопроса
    if (existQuestion(examination, questionNumber)) return null;
    // обновляем клавиатуру
    await updateQuestionKeyboard(ctx, examination.ticket, questionNumber, answerNumber);
    // сохраняем ответ пользователя
    examination.answers.push({
        question: Number(questionNumber),
        answer: Number(answerNumber),
        status: answerStatus,
    });
    // проверяем закончился ли наш тест
    const nextQuestionNumber = Number(questionNumber) + 1;
    if (examination.ticket.questions.length <= nextQuestionNumber) {
        const wrongCountAnswers = 2;
        const { wrong, success } = checkExam(examination);
        let title = "Вы успешно сдали экзамен !";

        const buttons = [Markup.callbackButton("«Вернуться", "backToTickets")];
        if (wrong > wrongCountAnswers) {
            examination.status = -1;
            title = "Вы провалили экзамен !";
            buttons.unshift(Markup.callbackButton("Пересдать экзамен", `ticket:${examination.ticket._id}`));
        } else {
            examination.status = 1;
        }
        // сохраняем данные о экзамине
        await examination.save();

        // отправляем результаты пользователю
        const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 });
        const message = `👍(${success}) 👎(${wrong})\n${title}`;
        return ctx.reply(message, keyboard.extra());
    }

    await examination.save();
    // отправляет следующий вопрос
    const questionMessage = createQuestionMessage(examination._id, examination.ticket, nextQuestionNumber);
    return sendQuestionMessageToUser(ctx, questionMessage);
};

exports.answeredAction = (ctx) => {
    return ctx.answerCbQuery("Вы уже ответили на этот вопрос !", true).catch(console.error);
};