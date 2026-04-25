const db = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { setCache, getCache, deleteCache, deleteCacheByPattern } = require('../config/redis');
const { getConnection } = require('../config/database');

const CACHE_TTL = 600;

function isValidPositiveNumber(val) {
  if (val === undefined || val === null || val === '') {
    return false;
  }
  const num = typeof val === 'string' ? parseInt(val, 10) : val;
  return typeof num === 'number' && !isNaN(num) && num > 0;
}

function isValidStatus(val) {
  if (val === undefined || val === null || val === '') {
    return false;
  }
  const num = typeof val === 'string' ? parseInt(val, 10) : val;
  return typeof num === 'number' && !isNaN(num) && (num === 0 || num === 1);
}

function isValidKeyword(val) {
  if (val === undefined || val === null) {
    return false;
  }
  return typeof val === 'string' && val.trim().length > 0;
}

async function getProductList(params) {
  const page = parseInt(params.page) || 1;
  const pageSize = parseInt(params.page_size) || 20;
  const offset = (page - 1) * pageSize;
  
  const whereConditions = ['1=1'];
  const queryParams = [];
  
  if (isValidPositiveNumber(params.category_id)) {
    const catId = typeof params.category_id === 'string' 
      ? parseInt(params.category_id, 10) 
      : params.category_id;
    whereConditions.push('p.category_id = ?');
    queryParams.push(catId);
  }
  
  if (isValidPositiveNumber(params.brand_id)) {
    const bId = typeof params.brand_id === 'string' 
      ? parseInt(params.brand_id, 10) 
      : params.brand_id;
    whereConditions.push('p.brand_id = ?');
    queryParams.push(bId);
  }
  
  if (isValidStatus(params.status)) {
    const status = typeof params.status === 'string' 
      ? parseInt(params.status, 10) 
      : params.status;
    whereConditions.push('p.status = ?');
    queryParams.push(status);
  }
  
  if (isValidKeyword(params.keyword)) {
    whereConditions.push('p.name LIKE ?');
    queryParams.push(`%${params.keyword.trim()}%`);
  }
  
  const whereClause = whereConditions.join(' AND ');
  
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM products p 
    WHERE ${whereClause}
  `;
  
  const countResult = await db.query(countQuery, queryParams);
  const total = countResult[0].total;
  
  const dataQuery = `
    SELECT 
      p.id,
      p.name,
      p.main_image,
      p.status,
      p.created_at,
      p.updated_at,
      c.name as category_name,
      b.name as brand_name,
      (SELECT MIN(price) FROM skus WHERE product_id = p.id AND status = 1) as min_price,
      (SELECT SUM(stock) FROM skus WHERE product_id = p.id AND status = 1) as total_stock
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const dataParams = [...queryParams, Number(pageSize), Number(offset)];
  const list = await db.query(dataQuery, dataParams);
  
  const processedList = list.map(item => ({
    ...item,
    min_price: item.min_price ? parseFloat(item.min_price) : null,
    total_stock: item.total_stock ? parseInt(item.total_stock) : 0,
  }));
  
  return {
    list: processedList,
    pagination: {
      page,
      page_size: pageSize,
      total,
      total_pages: Math.ceil(total / pageSize),
    },
  };
}

async function getProductById(id, useCache = true) {
  const cacheKey = `product:${id}`;
  
  if (useCache) {
    const cached = await getCache(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  const products = await db.query(
    `SELECT 
      p.id,
      p.name,
      p.description,
      p.category_id,
      p.brand_id,
      p.main_image,
      p.images,
      p.status,
      p.has_sku,
      p.created_at,
      p.updated_at,
      c.name as category_name,
      b.name as brand_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.id = ?`,
    [id]
  );
  
  if (products.length === 0) {
    return null;
  }
  
  const product = products[0];
  
  try {
    product.images = product.images ? JSON.parse(product.images) : [];
  } catch {
    product.images = [];
  }
  
  if (product.has_sku) {
    const specifications = await db.query(
      `SELECT id, name 
       FROM specifications 
       WHERE product_id = ? 
       ORDER BY id`,
      [id]
    );
    
    for (const spec of specifications) {
      const values = await db.query(
        `SELECT id, value 
         FROM specification_values 
         WHERE spec_id = ? 
         ORDER BY id`,
        [spec.id]
      );
      spec.values = values;
    }
    
    const skus = await db.query(
      `SELECT id, sku_code, spec_combination, price, stock, image, status, created_at, updated_at
       FROM skus 
       WHERE product_id = ? 
       ORDER BY id`,
      [id]
    );
    
    const processedSkus = skus.map(sku => {
      try {
        return {
          ...sku,
          spec_combination: JSON.parse(sku.spec_combination),
          price: parseFloat(sku.price),
          stock: parseInt(sku.stock),
        };
      } catch {
        return {
          ...sku,
          spec_combination: {},
          price: parseFloat(sku.price),
          stock: parseInt(sku.stock),
        };
      }
    });
    
    product.specifications = specifications;
    product.skus = processedSkus;
  }
  
  await setCache(cacheKey, product, CACHE_TTL);
  
  return product;
}

async function createProduct(data) {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    const [result] = await connection.execute(
      `INSERT INTO products 
       (name, description, category_id, brand_id, main_image, images, status, has_sku) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.description || null,
        data.category_id,
        data.brand_id || null,
        data.main_image || null,
        data.images ? JSON.stringify(data.images) : null,
        data.status,
        data.has_sku,
      ]
    );
    
    const productId = result.insertId;
    
    if (data.has_sku && data.specifications && data.specifications.length > 0) {
      for (const spec of data.specifications) {
        const [specResult] = await connection.execute(
          `INSERT INTO specifications (product_id, name) VALUES (?, ?)`,
          [productId, spec.name]
        );
        
        const specId = specResult.insertId;
        
        for (const value of spec.values) {
          await connection.execute(
            `INSERT INTO specification_values (spec_id, value) VALUES (?, ?)`,
            [specId, value]
          );
        }
      }
      
      if (data.skus && data.skus.length > 0) {
        for (const sku of data.skus) {
          await connection.execute(
            `INSERT INTO skus 
             (product_id, sku_code, spec_combination, price, stock, image, status) 
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [
              productId,
              sku.sku_code,
              JSON.stringify(sku.spec_combination),
              sku.price,
              sku.stock || 0,
              sku.image || null,
            ]
          );
        }
      }
    }
    
    await connection.commit();
    
    return { id: productId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateProduct(id, data) {
  const product = await getProductById(id, false);
  if (!product) {
    throw new AppError('商品不存在', 404);
  }
  
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    const updateFields = [];
    const updateValues = [];
    
    if (data.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(data.name);
    }
    if (data.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(data.description);
    }
    if (data.category_id !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(data.category_id);
    }
    if (data.brand_id !== undefined) {
      updateFields.push('brand_id = ?');
      updateValues.push(data.brand_id);
    }
    if (data.main_image !== undefined) {
      updateFields.push('main_image = ?');
      updateValues.push(data.main_image);
    }
    if (data.images !== undefined) {
      updateFields.push('images = ?');
      updateValues.push(data.images ? JSON.stringify(data.images) : null);
    }
    if (data.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(data.status);
    }
    if (data.has_sku !== undefined) {
      updateFields.push('has_sku = ?');
      updateValues.push(data.has_sku);
    }
    
    if (updateFields.length > 0) {
      updateValues.push(id);
      await connection.execute(
        `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }
    
    if (data.has_sku !== undefined || (data.specifications && data.skus)) {
      await connection.execute(
        'DELETE FROM skus WHERE product_id = ?',
        [id]
      );
      await connection.execute(
        'DELETE FROM specification_values WHERE spec_id IN (SELECT id FROM specifications WHERE product_id = ?)',
        [id]
      );
      await connection.execute(
        'DELETE FROM specifications WHERE product_id = ?',
        [id]
      );
      
      if (data.has_sku && data.specifications && data.specifications.length > 0) {
        for (const spec of data.specifications) {
          const [specResult] = await connection.execute(
            `INSERT INTO specifications (product_id, name) VALUES (?, ?)`,
            [id, spec.name]
          );
          
          const specId = specResult.insertId;
          
          for (const value of spec.values) {
            await connection.execute(
              `INSERT INTO specification_values (spec_id, value) VALUES (?, ?)`,
              [specId, value]
            );
          }
        }
        
        if (data.skus && data.skus.length > 0) {
          for (const sku of data.skus) {
            const status = sku.status !== undefined ? sku.status : 1;
            await connection.execute(
              `INSERT INTO skus 
               (product_id, sku_code, spec_combination, price, stock, image, status) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                id,
                sku.sku_code,
                JSON.stringify(sku.spec_combination),
                sku.price,
                sku.stock || 0,
                sku.image || null,
                status,
              ]
            );
          }
        }
      }
    }
    
    await connection.commit();
    
    await deleteCache(`product:${id}`);
    await deleteCacheByPattern('product:*');
    
    return { affectedRows: 1 };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteProduct(id) {
  const product = await getProductById(id, false);
  if (!product) {
    throw new AppError('商品不存在', 404);
  }
  
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    await connection.execute('DELETE FROM skus WHERE product_id = ?', [id]);
    await connection.execute(
      'DELETE FROM specification_values WHERE spec_id IN (SELECT id FROM specifications WHERE product_id = ?)',
      [id]
    );
    await connection.execute('DELETE FROM specifications WHERE product_id = ?', [id]);
    await connection.execute('DELETE FROM products WHERE id = ?', [id]);
    
    await connection.commit();
    
    await deleteCache(`product:${id}`);
    
    return { affectedRows: 1 };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getBrands() {
  return await db.query(
    'SELECT id, name, logo, description FROM brands ORDER BY id'
  );
}

module.exports = {
  getProductList,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
};
