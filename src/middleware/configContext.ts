// @ts-nocheck
// @TODO: use express
import { normalizedConfigByHandler } from '../utils/configTransform';

const configContext = (configObj) => async (ctx, next) => {
  const config = normalizedConfigByHandler(configObj);

  ctx.warmock = {
    config: config,
    _original: {
      config: configObj,
    },
  };

  await next();
};

export default configContext;
