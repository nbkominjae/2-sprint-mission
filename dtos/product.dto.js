const { object, size, string, integer } = require("superstruct");


var createDto = object({
  name : size(string(),1,20),
  description:size(string(), 1 , 300),
  price : integer(),
});

module.exports = {
  createDto,
};
