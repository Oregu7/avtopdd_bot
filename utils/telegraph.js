const _ = require("lodash");
const telegraph = require("telegraph-node");
const config = require("config");

const ph = new telegraph();
const token = config.get("bot.telegraphToken");
const { BOT } = config.get("constants");

exports.createAnswers = async(tickets) => {
    const title = "Ответы на Билеты";
    const data = [];
    for (let ticket of tickets) {
        data.push({
            tag: "h4",
            children: [ticket.name],
        });
        // формируем ответы на вопросы
        let questions = ticket.questions.map((question) => {
            let answer = _.findIndex(question.answers, { status: true });
            return { tag: "li", children: [`${answer + 1}`] };
        });
        data.push({
            tag: "ol",
            children: [...questions],
        });
        data.push({ tag: "hr" });
    }

    return await ph.createPage(token, title, data, {
        return_content: true,
        author_name: BOT.name,
        author_url: BOT.url,
    });
};