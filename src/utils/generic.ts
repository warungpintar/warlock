import R from 'ramda';

const log = R.tap((x) => {
  console.log(x);
  return x;
});

export default {
  log,
};
