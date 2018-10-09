const cheerio = require("cheerio");

const BASE_URL = "https://экзамен-пдд-онлайн.рф";

module.exports = (data) => {
    const $ = cheerio.load(data);

    const content = $("#content-main").children("p,ul").slice(2).map((index, el) => {
        let tagName = $(el).get(0).tagName;
        if ($(el).hasClass("pdd-img"))
            return createImageTag($, el);
        else if ($(el).hasClass("pdd-i"))
            return createITag($, el);
        else if ($(el).hasClass("title3"))
            return createTitleTag($, el);
        else if (tagName == "ul")
            return createUlTag($, el);
        else
            return generateContent($, el);
    }).get();

    return content;
};

function createImageTag($, el) {
    let image = $(el).find("img");
    let imageUrl = BASE_URL + image.attr("src");
    let caption = image.attr("alt").trim();

    return {
        tag: "figure",
        children: [{
            tag: "img",
            attrs: { src: imageUrl },
        }, {
            tag: "figcaption",
            children: [caption],
        }],
    };
}

function generateContent($, block) {
    const children = $(block).contents().map((index, el) => {
        let tagName = $(el).get(0).tagName;
        let text = $(el).text();
        switch (tagName) {
            case "strong":
            case "b":
                return { tag: tagName, children: [text + " "] };
            case "a":
                return {
                    tag: "a",
                    attrs: { href: BASE_URL + $(el).attr("href") },
                    children: [text],
                };
            default:
                return text;
        }
    }).get();

    return { tag: "p", children };
}

function createUlTag($, block) {
    const children = $(block).children("li, ul").map((index, el) => {
        let tagName = $(el).get(0).tagName;
        if (tagName == "li")
            return { tag: "li", children: [$(el).text().trim()] };
        else if (tagName == "ul")
            return createUlTag($, el);
    }).get();

    return { tag: "ul", children: [...children] };
}

function createITag($, el) {
    return {
        tag: "p",
        children: [{
            tag: "i",
            children: [$(el).text().trim()],
        }],
    };
}

function createTitleTag($, el) {
    return {
        tag: "h3",
        children: [$(el).text().trim()],
    };
}