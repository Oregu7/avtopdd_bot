const mongoose = require("mongoose");

module.exports = (dbURI) => {
    mongoose.connect(dbURI, {
        autoReconnect: true,

        poolSize: 20,
        socketTimeoutMS: 480000,
        keepAlive: 300000,

        keepAliveInitialDelay: 300000,
        connectTimeoutMS: 30000,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000,
        useNewUrlParser: true,
    });

    const gracefulShutdown = (msg, callback) => {
        mongoose.connection.close(() => {
            console.log(`Mongoose disconnected through ${msg}`);
            callback();
        });
    };

    mongoose.connection.on("connected", () => {
        console.log(`Mongoose connected to ${dbURI}`);
    });

    mongoose.connection.on("error", (err) => {
        console.log(`Mongoose connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
        console.log("Mongoose disconnected");
    });

    process.once("SIGUSR2", () => {
        gracefulShutdown("nodemon restart", () => {
            process.kill(process.pid, "SIGUSR2");
        });
    });

    process.on("SIGINT", () => {
        gracefulShutdown("app termination", () => {
            process.exit(0);
        });
    });

    process.on("SIGTERM", () => {
        gracefulShutdown("app shutdown", () => {
            process.exit(0);
        });
    });
};