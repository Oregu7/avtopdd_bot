const { UserModel } = require("../models");
const { compileMessage } = require("../utils");

module.exports = async(ctx) => {
    if (!ctx.session.hasOwnProperty("authorized")) {
        const user = await UserModel.getOrCreate(ctx);
        console.log(`[ new client ] => ${user.username}:${user.userId}`);
        ctx.session.authorized = true;
    }

    const message = `<b>Mangakun Bot - </b> это бот, который будет оповещать
    о выходе Вашей любимой <b>манги</b>.
    
    Используйте эти команды, чтобы управлять ботом:
    
    <b>Манга</b>
    /search - поиск манги
    /add - добавить мангу в базу
    /manga - список Ваших подписок
    /genres - список жанров

    <b>Помощь</b>
    /help - справка
    /feedback - связаться с нами
    
    /rate - оценить бот`;

    return ctx.reply(compileMessage(message), Extra.HTML());
};