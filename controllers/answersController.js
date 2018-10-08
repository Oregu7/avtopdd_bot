const _ = require("lodash");
const { TicketModel } = require("../models");
const { compileMessage } = require("../utils");

module.exports = async(ctx) => {
    const tickets = await TicketModel
        .find({})
        .sort({ indx: 1 })
        .limit(30);
    let message = "<b>Ответы на вопросы:</b>\n\n";
    for (let ticket of tickets) {
        message += `[${ticket.name}]\n`;
        let questionIndx = 1;
        for (let question of ticket.questions) {
            let answer = _.findIndex(question.answers, { status: true });
            message += `${questionIndx}) ${answer+1}\n`;
            questionIndx++;
        }

        message += "\n";
    }

    return ctx.replyWithHTML(compileMessage(message));
};