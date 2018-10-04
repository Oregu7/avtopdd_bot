const rp = require("request-promise");
const confgi = require("config");
const sleep = require("thread-sleep");
const TicketModel = require("../models/ticket");

async function checkStatusAnswer(questionId, name, value) {
    const data = await rp.post({
        uri: "http://www.transinfo.am/ru/pdd/test-exam.html",
        form: {
            [name]: value,
            ticket: questionId,
        },
        json: true,
    });
    console.log(data);
    return data.status == "true" ? true : false;
}

(async() => {
    const tickets = await TicketModel
        .find()
        .sort("indx")
        .skip(3);
    //.limit(5);

    for (let ticket of tickets) {
        for (let question of ticket.questions) {
            for (let answer of question.answers) {
                answer.status = await checkStatusAnswer(question.questionId, answer.name, answer.value);
                sleep(1000);
            }
        }

        ticket.save().then((ok) => {
            console.log(`!!!! [${ticket.name}] => DONE`);
        });
    }
})();