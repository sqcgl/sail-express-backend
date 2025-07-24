const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const config = require("../config/config");

// 创建数据库连接
const db = new sqlite3.Database(config.dbPath, (err) => {
  if (err) {
    console.error("数据库连接失败:", err.message);
  } else {
    console.log("成功连接到SQLite数据库");
    initDatabase();
  }
});

// 初始化数据库表
function initDatabase() {
  // 创建产品表
  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price TEXT NOT NULL,
      category TEXT NOT NULL,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createProductsTable, (err) => {
    if (err) {
      console.error("创建产品表失败:", err.message);
    } else {
      console.log("产品表创建成功或已存在");
      insertSampleData();
    }
  });
}

// 插入示例数据
function insertSampleData() {
  const sampleProducts = [
    {
      name: "新鲜三文鱼",
      description: "挪威进口新鲜三文鱼，肉质鲜美，适合制作各类寿司",
      price: "¥180/kg",
      category: "fresh",
    },
    {
      name: "金枪鱼",
      description: "深海金枪鱼，口感细腻，营养丰富",
      price: "¥220/kg",
      category: "fresh",
    },
    {
      name: "寿司米",
      description: "日本进口寿司专用米，粘性适中，口感绝佳",
      price: "¥25/kg",
      category: "dry",
    },
    {
      name: "海苔",
      description: "优质海苔，色泽深绿，口感脆嫩",
      price: "¥15/包",
      category: "dry",
    },
    {
      name: "寿司刀",
      description: "专业寿司刀，锋利耐用，切割精准",
      price: "¥280/把",
      category: "supply",
    },
    {
      name: "寿司卷帘",
      description: "竹制寿司卷帘，传统工艺，使用方便",
      price: "¥45/个",
      category: "supply",
    },
  ];

  // 检查是否已有数据
  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (err) {
      console.error("查询产品数量失败:", err.message);
      return;
    }

    if (row.count === 0) {
      console.log("插入示例产品数据...");

      const insertProduct =
        "INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)";

      sampleProducts.forEach((product) => {
        db.run(
          insertProduct,
          [product.name, product.description, product.price, product.category],
          function (err) {
            if (err) {
              console.error("插入产品失败:", err.message);
            } else {
              console.log(
                `产品 "${product.name}" 插入成功，ID: ${this.lastID}`
              );
            }
          }
        );
      });
    } else {
      console.log(`数据库中已有 ${row.count} 个产品，跳过示例数据插入`);
    }
  });
}

// 数据库操作方法
const dbOperations = {
  // 获取所有产品
  getAllProducts: () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM products ORDER BY created_at DESC", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // 根据ID获取产品
  getProductById: (id) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // 添加产品
  addProduct: (product) => {
    return new Promise((resolve, reject) => {
      const sql =
        "INSERT INTO products (name, name_zh, name_en, description, description_zh, description_en, price, category, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.run(
        sql,
        [
          product.name_zh || product.name_en || product.name, // 优先使用中文名称，其次英文名称，最后原有名称
          product.name_zh || "", // 允许中文名称为空
          product.name_en,
          product.description_zh || product.description_en || product.description, // 优先使用中文描述，其次英文描述，最后原有描述
          product.description_zh || "", // 允许中文描述为空
          product.description_en || "",
          product.price,
          product.category,
          product.image,
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...product });
          }
        }
      );
    });
  },

  // 更新产品
  updateProduct: (id, product) => {
    return new Promise((resolve, reject) => {
      const sql =
        "UPDATE products SET name = ?, name_zh = ?, name_en = ?, description = ?, description_zh = ?, description_en = ?, price = ?, category = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      db.run(
        sql,
        [
          product.name_zh || product.name_en || product.name, // 优先使用中文名称，其次英文名称，最后原有名称
          product.name_zh || "", // 允许中文名称为空
          product.name_en,
          product.description_zh || product.description_en || product.description, // 优先使用中文描述，其次英文描述，最后原有描述
          product.description_zh || "", // 允许中文描述为空
          product.description_en || "",
          product.price,
          product.category,
          product.image,
          id,
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, ...product });
          }
        }
      );
    });
  },

  // 删除产品
  deleteProduct: (id) => {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, deleted: this.changes > 0 });
        }
      });
    });
  },

  // 根据分类获取产品
  getProductsByCategory: (category) => {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM products WHERE category = ? ORDER BY created_at DESC",
        [category],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  },
};

module.exports = { db, dbOperations };
