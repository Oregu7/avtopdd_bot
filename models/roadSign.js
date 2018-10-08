const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roadSignSchema = Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "RoadSignCategory" },
});

module.exports = mongoose.model("RoadSign", roadSignSchema);