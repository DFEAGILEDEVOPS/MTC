const path = require("path")

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "azure-storage-queue.js",
    path: path.resolve(__dirname, "dist")
  }
}
