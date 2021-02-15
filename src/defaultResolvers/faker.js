const faker = require('faker');
const R = require('ramda');

const resolver = (_, args) => {
  const fakerProps = args.props.split('.');
  const fakerFn = R.path(fakerProps)(faker);

  return fakerFn();
};

module.exports = resolver;
