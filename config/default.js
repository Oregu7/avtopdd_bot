// загружаем переменные окружения
require("dotenv").config();
// загружаем компоненты
const constants = require("./constants");
const mongo = require("./mongo");
// необходимые переменные окружения
const REQUIRED_VARIABLES = [
    //"NODE_ENV",
    //"BOT_TOKEN",
    //"TELEGRAPH_TOKEN",
    "DB_URL",
];

// start mongo
mongo(process.env.DB_URL);

REQUIRED_VARIABLES.forEach((name) => {
    if (!process.env[name]) {
        throw new Error(`Environment variable ${name} is missing`);
    }
});

// шарим конфиг
module.exports = {
    constants,
    env: process.env.NODE_ENV,
    bot: {
        token: process.env.BOT_TOKEN,
        telegraphToken: process.env.TELEGRAPH_TOKEN,
    },
    server: {
        port: Number(process.env.PORT),
        ip: process.env.IP,
        webhook: process.env.WEBHOOK,
    },
};