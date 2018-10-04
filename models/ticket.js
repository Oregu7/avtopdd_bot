const mongoose = require("mongoose");

const AnswerSchema = mongoose.Schema({
    value: { type: String, required: true },
    name: { type: String, required: true },
    text: { type: String, required: true },
    status: { type: Boolean, default: false },
});

const QuestionSchema = mongoose.Schema({
    questionId: { type: Number, required: true, unique: true },
    text: { type: String, required: true },
    image: { type: String, default: "" },
    answers: [AnswerSchema],
});

const TicketSchema = mongoose.Schema({
    indx: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    link: { type: String, required: true },
    questions: [QuestionSchema],
});

module.exports = mongoose.model("Ticket", TicketSchema);