export default (root) => {
  return {
    ...root,
    customField: root.name.toUpperCase(),
  };
};
