const Joi = require('joi');
const { AppError } = require('./errorHandler');

function normalizeEmptyValue(value) {
  if (value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }
  return value;
}

function normalizeQueryParams(data) {
  const normalized = {};
  for (const [key, value] of Object.entries(data)) {
    normalized[key] = normalizeEmptyValue(value);
  }
  return normalized;
}

const validate = (schema, source = 'body') => {
  return async (ctx, next) => {
    let data = source === 'body' 
      ? ctx.request.body 
      : source === 'query' 
        ? ctx.request.query 
        : ctx.params;
    
    if (source === 'query') {
      data = normalizeQueryParams(data);
    }
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new AppError(errors.join(', '), 400);
    }
    
    ctx.validatedData = value;
    await next();
  };
};

const schemas = {
  categoryCreate: Joi.object({
    name: Joi.string().required().max(100).messages({
      'string.base': '分类名称必须是字符串',
      'string.empty': '分类名称不能为空',
      'string.max': '分类名称不能超过100个字符',
      'any.required': '分类名称是必填项',
    }),
    parent_id: Joi.number().integer().min(0).default(0).messages({
      'number.base': '父分类ID必须是数字',
      'number.integer': '父分类ID必须是整数',
      'number.min': '父分类ID不能小于0',
    }),
    sort: Joi.number().integer().min(0).default(0).messages({
      'number.base': '排序必须是数字',
      'number.integer': '排序必须是整数',
      'number.min': '排序不能小于0',
    }),
  }),

  categoryUpdate: Joi.object({
    name: Joi.string().max(100).messages({
      'string.base': '分类名称必须是字符串',
      'string.max': '分类名称不能超过100个字符',
    }),
    parent_id: Joi.number().integer().min(0).messages({
      'number.base': '父分类ID必须是数字',
      'number.integer': '父分类ID必须是整数',
      'number.min': '父分类ID不能小于0',
    }),
    sort: Joi.number().integer().min(0).messages({
      'number.base': '排序必须是数字',
      'number.integer': '排序必须是整数',
      'number.min': '排序不能小于0',
    }),
  }),

  idParam: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'ID必须是数字',
      'number.integer': 'ID必须是整数',
      'number.positive': 'ID必须是正数',
      'any.required': 'ID是必填项',
    }),
  }),

  productCreate: Joi.object({
    name: Joi.string().required().max(200).messages({
      'string.base': '商品名称必须是字符串',
      'string.empty': '商品名称不能为空',
      'string.max': '商品名称不能超过200个字符',
      'any.required': '商品名称是必填项',
    }),
    description: Joi.string().allow('').allow(null).messages({
      'string.base': '商品描述必须是字符串',
    }),
    category_id: Joi.number().integer().positive().required().messages({
      'number.base': '分类ID必须是数字',
      'number.integer': '分类ID必须是整数',
      'number.positive': '分类ID必须是正数',
      'any.required': '分类ID是必填项',
    }),
    brand_id: Joi.number().integer().positive().allow(null).messages({
      'number.base': '品牌ID必须是数字',
      'number.integer': '品牌ID必须是整数',
      'number.positive': '品牌ID必须是正数',
    }),
    main_image: Joi.string().uri().allow('').allow(null).messages({
      'string.base': '主图URL必须是字符串',
      'string.uri': '主图URL格式不正确',
    }),
    images: Joi.array().items(Joi.string().uri()).max(9).messages({
      'array.base': '图片列表必须是数组',
      'array.max': '图片列表最多9张',
      'string.uri': '图片URL格式不正确',
    }),
    status: Joi.number().integer().valid(0, 1).default(1).messages({
      'number.base': '状态必须是数字',
      'number.integer': '状态必须是整数',
      'any.only': '状态只能是0或1',
    }),
    has_sku: Joi.number().integer().valid(0, 1).default(0).messages({
      'number.base': '多规格标识必须是数字',
      'number.integer': '多规格标识必须是整数',
      'any.only': '多规格标识只能是0或1',
    }),
    specifications: Joi.array().items(
      Joi.object({
        name: Joi.string().required().max(50).messages({
          'string.base': '规格名称必须是字符串',
          'string.empty': '规格名称不能为空',
          'string.max': '规格名称不能超过50个字符',
          'any.required': '规格名称是必填项',
        }),
        values: Joi.array().items(Joi.string().max(100)).min(1).required().messages({
          'array.base': '规格值必须是数组',
          'array.min': '规格值至少有1个',
          'any.required': '规格值是必填项',
        }),
      })
    ).allow(null),
    skus: Joi.array().items(
      Joi.object({
        sku_code: Joi.string().required().max(100).messages({
          'string.base': 'SKU编码必须是字符串',
          'string.empty': 'SKU编码不能为空',
          'string.max': 'SKU编码不能超过100个字符',
          'any.required': 'SKU编码是必填项',
        }),
        spec_combination: Joi.object().required().messages({
          'object.base': '规格组合必须是对象',
          'any.required': '规格组合是必填项',
        }),
        price: Joi.number().positive().precision(2).required().messages({
          'number.base': '价格必须是数字',
          'number.positive': '价格必须是正数',
          'any.required': '价格是必填项',
        }),
        stock: Joi.number().integer().min(0).default(0).messages({
          'number.base': '库存必须是数字',
          'number.integer': '库存必须是整数',
          'number.min': '库存不能小于0',
        }),
        image: Joi.string().uri().allow('').allow(null).messages({
          'string.base': 'SKU图片URL必须是字符串',
          'string.uri': 'SKU图片URL格式不正确',
        }),
      })
    ).allow(null),
  }),

  productUpdate: Joi.object({
    name: Joi.string().max(200).messages({
      'string.base': '商品名称必须是字符串',
      'string.max': '商品名称不能超过200个字符',
    }),
    description: Joi.string().allow('').allow(null).messages({
      'string.base': '商品描述必须是字符串',
    }),
    category_id: Joi.number().integer().positive().messages({
      'number.base': '分类ID必须是数字',
      'number.integer': '分类ID必须是整数',
      'number.positive': '分类ID必须是正数',
    }),
    brand_id: Joi.number().integer().positive().allow(null).messages({
      'number.base': '品牌ID必须是数字',
      'number.integer': '品牌ID必须是整数',
      'number.positive': '品牌ID必须是正数',
    }),
    main_image: Joi.string().uri().allow('').allow(null).messages({
      'string.base': '主图URL必须是字符串',
      'string.uri': '主图URL格式不正确',
    }),
    images: Joi.array().items(Joi.string().uri()).max(9).messages({
      'array.base': '图片列表必须是数组',
      'array.max': '图片列表最多9张',
      'string.uri': '图片URL格式不正确',
    }),
    status: Joi.number().integer().valid(0, 1).messages({
      'number.base': '状态必须是数字',
      'number.integer': '状态必须是整数',
      'any.only': '状态只能是0或1',
    }),
    has_sku: Joi.number().integer().valid(0, 1).messages({
      'number.base': '多规格标识必须是数字',
      'number.integer': '多规格标识必须是整数',
      'any.only': '多规格标识只能是0或1',
    }),
    specifications: Joi.array().items(
      Joi.object({
        name: Joi.string().required().max(50).messages({
          'string.base': '规格名称必须是字符串',
          'string.empty': '规格名称不能为空',
          'string.max': '规格名称不能超过50个字符',
          'any.required': '规格名称是必填项',
        }),
        values: Joi.array().items(Joi.string().max(100)).min(1).required().messages({
          'array.base': '规格值必须是数组',
          'array.min': '规格值至少有1个',
          'any.required': '规格值是必填项',
        }),
      })
    ).allow(null),
    skus: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().positive().allow(null).messages({
          'number.base': 'SKU ID必须是数字',
          'number.integer': 'SKU ID必须是整数',
          'number.positive': 'SKU ID必须是正数',
        }),
        sku_code: Joi.string().required().max(100).messages({
          'string.base': 'SKU编码必须是字符串',
          'string.empty': 'SKU编码不能为空',
          'string.max': 'SKU编码不能超过100个字符',
          'any.required': 'SKU编码是必填项',
        }),
        spec_combination: Joi.object().required().messages({
          'object.base': '规格组合必须是对象',
          'any.required': '规格组合是必填项',
        }),
        price: Joi.number().positive().precision(2).required().messages({
          'number.base': '价格必须是数字',
          'number.positive': '价格必须是正数',
          'any.required': '价格是必填项',
        }),
        stock: Joi.number().integer().min(0).default(0).messages({
          'number.base': '库存必须是数字',
          'number.integer': '库存必须是整数',
          'number.min': '库存不能小于0',
        }),
        image: Joi.string().uri().allow('').allow(null).messages({
          'string.base': 'SKU图片URL必须是字符串',
          'string.uri': 'SKU图片URL格式不正确',
        }),
        status: Joi.number().integer().valid(0, 1).default(1).messages({
          'number.base': '状态必须是数字',
          'number.integer': '状态必须是整数',
          'any.only': '状态只能是0或1',
        }),
      })
    ).allow(null),
  }),

  productList: Joi.object({
    page: Joi.number().integer().positive().default(1).messages({
      'number.base': '页码必须是数字',
      'number.integer': '页码必须是整数',
      'number.positive': '页码必须是正数',
    }),
    page_size: Joi.number().integer().positive().max(100).default(20).messages({
      'number.base': '每页数量必须是数字',
      'number.integer': '每页数量必须是整数',
      'number.positive': '每页数量必须是正数',
      'number.max': '每页数量最多100条',
    }),
    category_id: Joi.number().integer().positive().allow(null).messages({
      'number.base': '分类ID必须是数字',
      'number.integer': '分类ID必须是整数',
      'number.positive': '分类ID必须是正数',
    }),
    brand_id: Joi.number().integer().positive().allow(null).messages({
      'number.base': '品牌ID必须是数字',
      'number.integer': '品牌ID必须是整数',
      'number.positive': '品牌ID必须是正数',
    }),
    status: Joi.number().integer().valid(0, 1).allow(null).messages({
      'number.base': '状态必须是数字',
      'number.integer': '状态必须是整数',
      'any.only': '状态只能是0或1',
    }),
    keyword: Joi.string().allow('').allow(null).messages({
      'string.base': '搜索关键词必须是字符串',
    }),
  }),
};

module.exports = {
  validate,
  schemas,
  normalizeEmptyValue,
  normalizeQueryParams,
};
