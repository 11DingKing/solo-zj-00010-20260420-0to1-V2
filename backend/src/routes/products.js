const Router = require('koa-router');
const productController = require('../controllers/productController');
const { validate, schemas } = require('../middleware/validator');

const router = new Router({
  prefix: '/api/products',
});

router.get('/', validate(schemas.productList, 'query'), async (ctx) => {
  const result = await productController.getProductList(ctx.validatedData);
  ctx.body = result;
});

router.get('/brands', async (ctx) => {
  const brands = await productController.getBrands();
  ctx.body = brands;
});

router.get('/:id', validate(schemas.idParam, 'params'), async (ctx) => {
  const product = await productController.getProductById(ctx.params.id);
  if (!product) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '商品不存在', data: null };
    return;
  }
  ctx.body = product;
});

router.post('/', validate(schemas.productCreate), async (ctx) => {
  const result = await productController.createProduct(ctx.validatedData);
  ctx.status = 201;
  ctx.body = result;
});

router.put('/:id', validate(schemas.idParam, 'params'), validate(schemas.productUpdate), async (ctx) => {
  await productController.updateProduct(ctx.params.id, ctx.validatedData);
  ctx.body = { message: '更新成功' };
});

router.delete('/:id', validate(schemas.idParam, 'params'), async (ctx) => {
  await productController.deleteProduct(ctx.params.id);
  ctx.body = { message: '删除成功' };
});

module.exports = router;
