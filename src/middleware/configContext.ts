// @TODO: use express
const configContext = (configObj) => async (ctx, next) => {
  ctx.warmock = {
    config: configObj,
    _original: {
      config: configObj,
    },
  };

  await next();
};

export default configContext;
