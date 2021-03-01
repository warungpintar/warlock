export const log = (x) => {
  console.log(x);
  return x;
};

export const toString = (x) => {
  return x.toString();
};

export const strToJson = (str) => JSON.parse(str);
