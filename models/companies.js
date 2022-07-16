const mongoose = require("mongoose");

const companiesSchema = mongoose.Schema({
  name: "string",
  imageName: "string",
  uploadDate: {
    type: "date",
    default: Date.now,
    select: false,
  },
});

module.exports = mongoose.model("companies", companiesSchema);
