const resolver = (parent, ctx) => {
  return parent.toLowerCase();
};

module.exports = resolver;
