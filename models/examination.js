const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

const examinationSchema = Schema({
    userId: { type: Number, required: true },
    status: { type: Number, default: 0 },
    ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
    answers: [{
        question: { type: Number, required: true },
        answer: { type: Number, required: true },
        status: { type: Boolean, required: true },
    }],
    createdAt: { type: Date, default: Date.now },
    finishAt: { type: Date, default: Date.now },
});
examinationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Examination", examinationSchema);