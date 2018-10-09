const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

const ruleSchema = Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    link: { type: String, required: true },
    telegraph: { type: String, default: "" },
    index: { type: Number, default: 0 },
});
ruleSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Rule", ruleSchema);