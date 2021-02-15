const R = require('ramda')

const groupListBy = R.curry((propName, arr) => {
  return R.groupBy(
    R.prop(propName),
    arr
  );
});

module.exports = {
  groupListBy
};
