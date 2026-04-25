const db = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

async function getCategoryTree() {
  const categories = await db.query(
    'SELECT id, name, parent_id, level, sort, created_at, updated_at FROM categories ORDER BY level, sort, id'
  );
  
  const buildTree = (parentId = 0) => {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .map(cat => ({
        ...cat,
        children: buildTree(cat.id),
      }));
  };
  
  return buildTree(0);
}

async function getCategoryById(id) {
  const categories = await db.query(
    'SELECT id, name, parent_id, level, sort, created_at, updated_at FROM categories WHERE id = ?',
    [id]
  );
  return categories[0] || null;
}

async function createCategory(data) {
  let parentLevel = 0;
  
  if (data.parent_id && data.parent_id > 0) {
    const parent = await getCategoryById(data.parent_id);
    if (!parent) {
      throw new AppError('父分类不存在', 400);
    }
    if (parent.level >= 3) {
      throw new AppError('最多只能创建三级分类', 400);
    }
    parentLevel = parent.level;
  }
  
  const level = parentLevel + 1;
  
  const result = await db.query(
    'INSERT INTO categories (name, parent_id, level, sort) VALUES (?, ?, ?, ?)',
    [data.name, data.parent_id || 0, level, data.sort || 0]
  );
  
  return { id: result.insertId, level };
}

async function updateCategory(id, data) {
  const category = await getCategoryById(id);
  if (!category) {
    throw new AppError('分类不存在', 404);
  }
  
  let newLevel = category.level;
  
  if (data.parent_id !== undefined && data.parent_id !== category.parent_id) {
    if (data.parent_id === 0) {
      newLevel = 1;
    } else {
      const parent = await getCategoryById(data.parent_id);
      if (!parent) {
        throw new AppError('父分类不存在', 400);
      }
      if (parent.level >= 3) {
        throw new AppError('最多只能创建三级分类', 400);
      }
      if (parent.id === id) {
        throw new AppError('不能将自己设为父分类', 400);
      }
      
      const children = await getAllChildren(id);
      if (children.includes(parent.id)) {
        throw new AppError('不能将子分类设为父分类', 400);
      }
      
      newLevel = parent.level + 1;
    }
    
    const levelDiff = newLevel - category.level;
    if (levelDiff !== 0) {
      await updateChildrenLevel(id, levelDiff);
    }
  }
  
  const updateFields = [];
  const updateValues = [];
  
  if (data.name !== undefined) {
    updateFields.push('name = ?');
    updateValues.push(data.name);
  }
  if (data.parent_id !== undefined) {
    updateFields.push('parent_id = ?');
    updateValues.push(data.parent_id);
    updateFields.push('level = ?');
    updateValues.push(newLevel);
  }
  if (data.sort !== undefined) {
    updateFields.push('sort = ?');
    updateValues.push(data.sort);
  }
  
  if (updateFields.length === 0) {
    return { affectedRows: 0 };
  }
  
  updateValues.push(id);
  
  await db.query(
    `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );
  
  return { affectedRows: 1 };
}

async function getAllChildren(parentId) {
  const children = [];
  const getChildren = async (id) => {
    const result = await db.query(
      'SELECT id FROM categories WHERE parent_id = ?',
      [id]
    );
    for (const child of result) {
      children.push(child.id);
      await getChildren(child.id);
    }
  };
  await getChildren(parentId);
  return children;
}

async function updateChildrenLevel(parentId, levelDiff) {
  const children = await getAllChildren(parentId);
  if (children.length > 0) {
    await db.query(
      `UPDATE categories SET level = level + ? WHERE id IN (${children.map(() => '?').join(',')})`,
      [levelDiff, ...children]
    );
  }
}

async function deleteCategory(id) {
  const category = await getCategoryById(id);
  if (!category) {
    throw new AppError('分类不存在', 404);
  }
  
  const children = await db.query(
    'SELECT id FROM categories WHERE parent_id = ? LIMIT 1',
    [id]
  );
  if (children.length > 0) {
    throw new AppError('该分类下还有子分类，不能删除', 400);
  }
  
  const products = await db.query(
    'SELECT id FROM products WHERE category_id = ? LIMIT 1',
    [id]
  );
  if (products.length > 0) {
    throw new AppError('该分类下还有商品，不能删除', 400);
  }
  
  await db.query('DELETE FROM categories WHERE id = ?', [id]);
  
  return { affectedRows: 1 };
}

module.exports = {
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
