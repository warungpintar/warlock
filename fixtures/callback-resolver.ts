export default (root) => {
  return {
    ...root,
    name: root.name.toUpperCase(),
  };
};
