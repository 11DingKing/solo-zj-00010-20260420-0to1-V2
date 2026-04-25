-- 设置客户端连接字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS ecommerce DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ecommerce;
ALTER DATABASE ecommerce CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '分类名称',
  parent_id INT UNSIGNED DEFAULT 0 COMMENT '父分类ID，0表示顶级分类',
  level TINYINT UNSIGNED DEFAULT 1 COMMENT '分类级别：1-一级，2-二级，3-三级',
  sort INT UNSIGNED DEFAULT 0 COMMENT '排序',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parent_id (parent_id),
  INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- 品牌表
CREATE TABLE IF NOT EXISTS brands (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '品牌名称',
  logo VARCHAR(500) DEFAULT NULL COMMENT '品牌Logo URL',
  description TEXT COMMENT '品牌描述',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='品牌表';

-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL COMMENT '商品名称',
  description TEXT COMMENT '商品描述（富文本）',
  category_id INT UNSIGNED NOT NULL COMMENT '分类ID',
  brand_id INT UNSIGNED DEFAULT NULL COMMENT '品牌ID',
  main_image VARCHAR(500) DEFAULT NULL COMMENT '主图URL',
  images JSON DEFAULT NULL COMMENT '商品图片列表（JSON数组，最多9张）',
  status TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-下架，1-上架',
  has_sku TINYINT UNSIGNED DEFAULT 0 COMMENT '是否有多规格：0-无，1-有',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category_id (category_id),
  INDEX idx_brand_id (brand_id),
  INDEX idx_status (status),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- 规格表（比如颜色、尺码）
CREATE TABLE IF NOT EXISTS specifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL COMMENT '商品ID',
  name VARCHAR(50) NOT NULL COMMENT '规格名称，如：颜色、尺码',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='规格表';

-- 规格值表（比如红色、蓝色、S码、M码）
CREATE TABLE IF NOT EXISTS specification_values (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  spec_id INT UNSIGNED NOT NULL COMMENT '规格ID',
  value VARCHAR(100) NOT NULL COMMENT '规格值，如：红色、S码',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_spec_id (spec_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='规格值表';

-- SKU表
CREATE TABLE IF NOT EXISTS skus (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL COMMENT '商品ID',
  sku_code VARCHAR(100) NOT NULL COMMENT 'SKU编码',
  spec_combination JSON NOT NULL COMMENT '规格组合（JSON，如：{"颜色":"红色","尺码":"M"}）',
  price DECIMAL(10,2) NOT NULL COMMENT '价格',
  stock INT UNSIGNED DEFAULT 0 COMMENT '库存',
  image VARCHAR(500) DEFAULT NULL COMMENT 'SKU图片',
  status TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_sku_code (sku_code),
  INDEX idx_product_id (product_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SKU表';

-- 插入初始分类数据
-- 一级分类
INSERT INTO categories (name, parent_id, level, sort) VALUES
('服装', 0, 1, 1),
('数码产品', 0, 1, 2),
('家居用品', 0, 1, 3);

-- 服装下的二级分类
INSERT INTO categories (name, parent_id, level, sort) VALUES
('男装', 1, 2, 1),
('女装', 1, 2, 2),
('童装', 1, 2, 3);

-- 男装下的三级分类
INSERT INTO categories (name, parent_id, level, sort) VALUES
('T恤', 4, 3, 1),
('衬衫', 4, 3, 2),
('裤子', 4, 3, 3),
('外套', 4, 3, 4);

-- 女装下的三级分类
INSERT INTO categories (name, parent_id, level, sort) VALUES
('连衣裙', 5, 3, 1),
('T恤', 5, 3, 2),
('裤子', 5, 3, 3),
('裙子', 5, 3, 4);

-- 数码产品下的二级分类
INSERT INTO categories (name, parent_id, level, sort) VALUES
('手机', 2, 2, 1),
('电脑', 2, 2, 2),
('配件', 2, 2, 3);

-- 手机下的三级分类
INSERT INTO categories (name, parent_id, level, sort) VALUES
('智能手机', 15, 3, 1),
('老人机', 15, 3, 2);

-- 电脑下的三级分类
INSERT INTO categories (name, parent_id, level, sort) VALUES
('笔记本', 16, 3, 1),
('台式机', 16, 3, 2),
('一体机', 16, 3, 3);

-- 家居用品下的二级分类
INSERT INTO categories (name, parent_id, level, sort) VALUES
('床上用品', 3, 2, 1),
('厨房用品', 3, 2, 2),
('家具', 3, 2, 3);

-- 插入示例品牌数据
INSERT INTO brands (name, logo, description) VALUES
('苹果', 'https://example.com/logos/apple.png', 'Apple Inc. 美国科技公司'),
('华为', 'https://example.com/logos/huawei.png', '华为技术有限公司'),
('小米', 'https://example.com/logos/xiaomi.png', '北京小米科技有限责任公司'),
('耐克', 'https://example.com/logos/nike.png', 'Nike 全球知名运动品牌'),
('阿迪达斯', 'https://example.com/logos/adidas.png', 'Adidas 德国运动品牌');
