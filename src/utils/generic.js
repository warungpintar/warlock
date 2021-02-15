const R = require('ramda');

const log = R.tap(x => {
  console.log(x);
  return x;
});

module.exports = {
  log
}