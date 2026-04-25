const Router = require('koa-router');
const categoryController = require('../controllers/categoryController');
const { validate, schemas } = require('../middleware/validator');

const router = new Router({
  prefix: '/api/categories',
});

router.get('/', async (ctx) => {
  const tree = await categoryController.getCategoryTree();
  ctx.body = tree;
});

router.get('/:id', validate(schemas.idParam, 'params'), async (ctx) => {
  const category = await categoryController.getCategoryById(ctx.params.id);
  if (!category) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '分类不存在', data: null };
    return;
  }
  ctx.body = category;
});

router.post('/', validate(schemas.categoryCreate), async (ctx) => {
  const result = await categoryController.createCategory(ctx.validatedData);
  ctx.status = 201;
  ctx.body = result;
});

router.put('/:id', validate(schemas.idParam, 'params'), validate(schemas.categoryUpdate), async (ctx) => {
  await categoryController.updateCategory(ctx.params.id, ctx.validatedData);
  ctx.body = { message: '更新成功' };
});

router.delete('/:id', validate(schemas.idParam, 'params'), async (ctx) => {
  await categoryController.deleteCategory(ctx.params.id);
  ctx.body = { message: '删除成功' };
});

module.exports = router;
