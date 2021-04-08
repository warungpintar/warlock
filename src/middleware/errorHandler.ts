// @TODO {proxy} need following @types/koa-bodyparser
const errorHandler = async (ctx, next) => {
  return next().catch((err) => {
    const { statusCode, message } = err;

    ctx.type = 'json';
    ctx.status = statusCode || 500;
    ctx.body = {
      success: false,
      message,
    };

    ctx.app.emit('error', err, ctx);
  });
};

export default errorHandler;
