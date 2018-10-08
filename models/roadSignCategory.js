const mongoose = require("mongoose");

const roadSignCategorySchema = mongoose.Schema({
    name: { type: String, required: true },
    link: { type: String, required: true },
    image: { type: String, default: "" },
});

module.exports = mongoose.model("RoadSignCategory", roadSignCategorySchema);