import md5 from 'md5';
// https://stackoverflow.com/questions/2722943/is-calculating-an-md5-hash-less-cpu-intensive-than-sha-family-functions

export const log = (x: any) => {
  console.log(x);
  return x;
};

export const toString = (x) => {
  return x.toString();
};

export const strToJson = (str) => JSON.parse(str);

export const hashStr = (payload: string): string => md5(payload);

export const concat = (any) => (arr) => arr.concat(any);
