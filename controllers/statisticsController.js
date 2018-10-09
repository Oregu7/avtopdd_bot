const { UserModel, ExaminationModel } = require("../models");
const { compileMessage } = require("../utils");

module.exports = async(ctx) => {
    const [usersCount, successExamCount, failExamCount] = await Promise.all([
        UserModel.countDocuments(),
        ExaminationModel.countDocuments({ status: 1 }),
        ExaminationModel.countDocuments({ status: -1 }),
    ]);

    const message = `<b>Статистика бота:</b>
    👥 - Пользователи — ${usersCount}
    👍 - Сдали экзамен — ${successExamCount}
    👎 - Не сдали экзамен — ${failExamCount}`;

    return ctx.replyWithHTML(compileMessage(message));
};