const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

const { RuleModel } = require("../models");
const { compileMessage, createRows, paginate } = require("../utils");

exports.command = async(ctx) => {
    const rules = await getRules();
    const { message, keyboard } = createRulesMessage(rules);

    return ctx.reply(message, keyboard.extra());
};

exports.baseNextAction = async(ctx) => {
    ctx.answerCbQuery("").catch(console.error);
    const [, pageNumber] = ctx.match;
    const rules = await getRules(pageNumber);
    const { message, keyboard } = createRulesMessage(rules);

    return ctx.editMessageText(message, Extra.HTML().markup(keyboard));
};

exports.readMoreAction = async(ctx) => {
    const [, ruleNumber, type] = ctx.match;
    const rules = await getRules(ruleNumber, 1);
    if (!rules.docs.length) return ctx.answerCbQuery("Я не нашел данное ПДД :(", true).catch(console.error);
    ctx.answerCbQuery("").catch(console.error);

    const { message, keyboard } = createRuleMessage(rules);
    if (type == "command")
        return ctx.replyWithHTML(message, keyboard.extra());

    return ctx.editMessageText(message, Extra.HTML().markup(keyboard));
};

exports.backAction = (ctx) => {
    ctx.answerCbQuery("").catch(console.error);
    return exports.command(ctx);
};

function getPaginateButtons(result, name) {
    const { previous, next } = paginate(result);
    const paginateButtons = [
        Markup.callbackButton("«", `${name}:${previous}`),
        Markup.callbackButton("»", `${name}:${next}`),
    ];

    return paginateButtons;
}

function createRulesMessage(result) {
    const message = "Действующие Правила утверждены Постановлением Совета Министров - Правительства РФ от 23 октября 1993 г. № 1090 \"О правилах дорожного движения\".";
    const buttons = result.docs.map((rule) =>
        Markup.callbackButton(rule.title, `rule:${rule.index + 1};command`));
    const paginateButtons = getPaginateButtons(result, "rules");
    const keyboard = Markup.inlineKeyboard([
        ...createRows(buttons, 1),
        paginateButtons,
    ]);

    return { message, keyboard };
}

async function getRules(pageNumber = 1, limit = 10) {
    const rules = await RuleModel.paginate({}, {
        page: Number(pageNumber),
        limit,
        sort: "index",
    });

    return rules;
}

function createRuleMessage(result) {
    const [rule] = result.docs;
    const message = `<a href="${rule.telegraph}">${rule.title}</a>`;
    const paginateButtons = getPaginateButtons(result, "rule");
    const keyboard = Markup.inlineKeyboard([
        [Markup.callbackButton(`${result.page} из ${result.pages}`, "ruleNumber")],
        paginateButtons, [Markup.callbackButton("« Вернуться", "backToRules")],
    ]);

    return { message, keyboard };
}