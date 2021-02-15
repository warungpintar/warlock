const R = require('ramda');
const { groupListBy } = require('./list');

const normalizedConfigByHandler =config =>
  R.compose(
    groupListBy('handler'),
    R.prop('sources')
  )(config);

module.exports = {
  normalizedConfigByHandler
};
