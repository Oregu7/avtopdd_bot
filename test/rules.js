const _ = require("lodash");
const cheerio = require("cheerio");
const rp = require("request-promise");
const sleep = require("thread-sleep");

const { telegraph } = require("../utils");
const { RuleModel } = require("../models");

async function getRules() {
    const data = await rp.get("");
    const $ = cheerio.load(data);

    const rules = $("ul.pdd-list.pdd-list-num > li").map((index, el) => {
        let link = "https://экзамен-пдд-онлайн.рф" + $(el).find("a").attr("href");
        let title = $(el).find("a").text().trim();
        $(el).find("a > strong").remove();
        let name = $(el).find("a").text().trim();

        return { link, title, name, index };
    });

    return rules.get();
}

(async() => {
    const rules = await RuleModel.find({}).sort({ index: 1 });

    for (let rule of rules) {
        let data = await rp.get(rule.link);
        let { url } = await telegraph.createRules(data, rule.name);
        rule.telegraph = url;
        let ok = await rule.save();
        console.log(ok);

        sleep(3000);
    }

})();