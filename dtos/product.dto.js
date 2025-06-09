import { object, size, string, integer, array} from "superstruct";


export const createDto = object({
  name : size(string(),1,20),
  description:size(string(), 1 , 300),
  price : integer(),
  tags: array(string()),
});

