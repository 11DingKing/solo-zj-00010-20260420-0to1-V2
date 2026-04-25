class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = () => {
  return async (ctx, next) => {
    try {
      await next();
      if (ctx.status === 404) {
        ctx.status = 404;
        ctx.body = {
          code: 404,
          message: '接口不存在',
          data: null,
        };
      }
    } catch (err) {
      console.error('Error:', err);
      let statusCode = err.statusCode || 500;
      let message = err.message || '服务器内部错误';
      
      if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.details ? err.details[0].message : '参数校验失败';
      }
      
      if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 400;
        message = '数据已存在';
      }
      
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        statusCode = 400;
        message = '关联数据不存在';
      }
      
      ctx.status = statusCode;
      ctx.body = {
        code: statusCode,
        message: message,
        data: null,
      };
    }
  };
};

const responseHandler = () => {
  return async (ctx, next) => {
    await next();
    if (ctx.body && !ctx.body.code) {
      ctx.body = {
        code: 200,
        message: 'success',
        data: ctx.body,
      };
    }
  };
};

module.exports = {
  AppError,
  errorHandler,
  responseHandler,
};
