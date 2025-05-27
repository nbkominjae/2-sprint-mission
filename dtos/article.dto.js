const { object, size , string } = require("superstruct");


var articleDto = object({
  title : size(string(), 1, 30),
  content : size(string(), 1, 300),
});

module.exports = {
  articleDto,
}