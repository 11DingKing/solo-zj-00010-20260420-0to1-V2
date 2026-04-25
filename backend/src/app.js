const Koa = require('koa');
const { koaBody } = require('koa-body');
const Router = require('koa-router');
const cors = require('koa-cors');
require('dotenv').config();

const { errorHandler, responseHandler } = require('./middleware/errorHandler');
const { connectRedis } = require('./config/redis');

const categoriesRouter = require('./routes/categories');
const productsRouter = require('./routes/products');

const app = new Koa();
const router = new Router();

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization'],
}));

app.use(koaBody({
  multipart: true,
  jsonLimit: '10mb',
  formLimit: '10mb',
}));

app.use(errorHandler());
app.use(responseHandler());

router.get('/api/health', async (ctx) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
});

app.use(router.routes()).use(router.allowedMethods());
app.use(categoriesRouter.routes()).use(categoriesRouter.allowedMethods());
app.use(productsRouter.routes()).use(productsRouter.allowedMethods());

async function startServer() {
  try {
    await connectRedis();
    console.log('Redis connection initialized');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
