const { normalizedConfigByHandler } = require('../utils/configTransform');

const configContext = configObj => async (ctx, next) => {
  const config = normalizedConfigByHandler(configObj);

  ctx.warmock = {
    config: config,
    _original: {
      config: configObj,
    },
  };

  await next();
};

module.exports = configContext;
