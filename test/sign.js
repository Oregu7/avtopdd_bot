const cheerio = require("cheerio");
const rp = require("request-promise");
const sleep = require("thread-sleep");
const config = require("config");
const { RoadSignModel, RoadSignCategoryModel } = require("../models");

async function getRoadSingCategories() {
    const data = await rp.get("https://pdd.am.ru/road-signs/");
    const $ = cheerio.load(data);
    const categories = $("a.pdd-index-block").map((indx, el) => {
        let link = "https://pdd.am.ru" + $(el).attr("href");
        let name = $(el).find(".pdd-index-block__content > span").text().trim();
        let image = $(el).find(".pdd-index-block__image > img").attr("src");

        return { link, name, image };
    });

    return categories.get();
}

async function getRoadSigns(link) {
    const data = await rp.get(link);
    const $ = cheerio.load(data);
    const roadSigns = $("tbody > tr.au-accordion-trigger > td:last-child").map((indx, el) => {
        let name = $(el).find("h3.au-accordion__header").text().trim();
        let image = $(el).find("img").attr("src") || "";
        let description = $(el).find(".au-accordion__target > p").map((indx, el) => {
            return $(el).find("span").text().trim();
        }).get().join("\n");

        return {
            name,
            image: image.replace(/\/m\//, "/xl/"),
            description,
        };
    });

    return roadSigns.get();
}

(async() => {
    const categories = await getRoadSingCategories();

    for (let item of categories) {
        let category = await RoadSignCategoryModel.create(item);
        let roadSigns = (await getRoadSigns(category.link)).map((roadSign) => {
            roadSign.category = category._id;
            return roadSign;
        });
        let ok = await RoadSignModel.create(roadSigns);
        console.log(ok);

        sleep(5000);
    }
})();