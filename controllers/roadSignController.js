const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const { RoadSignCategoryModel, RoadSignModel } = require("../models");
const { compileMessage, createRows, paginate } = require("../utils");

function createRoadSignMessage(result) {
    const [roadsign] = result.docs;
    const { previous, next } = paginate(result);
    const keyboard = Markup.inlineKeyboard([
        Markup.callbackButton("«", `roadsign:${roadsign.category};${previous}`),
        Markup.callbackButton("»", `roadsign:${roadsign.category};${next}`),
        Markup.callbackButton("« Вернуться", "backToRoadSignsCategories"),
    ], { columns: 2 });
    const message = `<b>${roadsign.name}</b>\n
    ${roadsign.description.replace("\n", "\n\n")}
    <a href="${roadsign.image}">\u{2063}</a>`;

    return { message: compileMessage(message), keyboard };
}

exports.categoriesCommand = async(ctx) => {
    const roadSignCategories = await RoadSignCategoryModel.find({});
    const buttons = roadSignCategories.map((category) =>
        Markup.callbackButton(category.name, `roadsign:${category._id};`));
    const message = "Знаки дорожного движения предназначены для того, чтобы водители и пешеходы могли легко ориентироваться на дороге и соблюдать безопасность, не нарушая правил.";
    const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 });

    return ctx.reply(message, keyboard.extra());
};

exports.action = async(ctx) => {
    ctx.answerCbQuery("").catch(console.error);
    const [, categoryId, pageNumber] = ctx.match;
    const result = await RoadSignModel.paginate({ category: categoryId }, {
        limit: 1,
        page: pageNumber ? Number(pageNumber) : 1,
    });
    const { message, keyboard } = createRoadSignMessage(result);
    if (!pageNumber)
        return ctx.replyWithHTML(message, keyboard.extra());

    return ctx.editMessageText(message, Extra.HTML().markup(keyboard));
};

exports.backAction = (ctx) => {
    ctx.answerCbQuery("").catch(console.error);
    return exports.categoriesCommand(ctx);
};