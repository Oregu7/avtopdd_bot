const rp = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const sleep = require("thread-sleep");
const confgi = require("config");
const TicketModel = require("../models/ticket");

async function getQuestions(url) {
    const data = await rp.get({
        uri: url,
        headers: {
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/28.0.1500.95 Safari/537.36",
            "X-Compress": "null",
        },
    });

    const $ = cheerio.load(data);
    const questions = $(".exam-question").map((indx, el) => {
        let id = $(el).attr("data-question");
        let text = $(el).find("span.question").text().trim();
        let image = $(el).find(".holder_image.image_default > img").attr("src") ||
            $(el).find(".image_only_one > img").attr("src");

        let answers = $(el).find(".question_blok .q-holder").map((indx, el) => {
            let value = $(el).find("input").attr("value");
            let name = $(el).find("input").attr("name");
            let text = $(el).find("label").text().trim();

            return { value, name, text, status: false };
        }).get();

        return {
            questionId: id,
            text,
            image: image ? "http://www.transinfo.am" + image : null,
            answers,
        };
    }).get();

    return questions;
}

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
}

(async() => {
    const $ = cheerio.load(await rp.get("http://www.transinfo.am/ru/pdd/to-pass-the-exam.html"));
    $(".tests-holders > li").each(async(indx, el) => {
        let name = $(el).find("a").text().trim();
        let link = "http://www.transinfo.am" + $(el).find("a").attr("href");
        let questions = await getQuestions(link);
        let doc = { indx, name, link, questions };

        let ok = await TicketModel.create(doc);
        console.log(ok);

        sleep(3000);
    });

    //checkStatusAnswer(144, "answer[144]", "answer_b").catch(console.error);
})();