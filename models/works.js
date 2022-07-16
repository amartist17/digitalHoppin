const mongoose = require("mongoose");

const worksSchema = mongoose.Schema({
  name: "string",
  description: "string",
  link: "string",
  imageName: "string",
  uploadDate: {
    type: "date",
    default: Date.now,
    select: false,
  },
});

module.exports = mongoose.model("works", worksSchema);
