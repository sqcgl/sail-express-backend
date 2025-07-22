const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// 数据库路径
const dbPath = path.join(__dirname, "database.db");

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("数据库连接失败:", err.message);
    process.exit(1);
  } else {
    console.log("成功连接到SQLite数据库");
    migrateDatabase();
  }
});

// 迁移数据库
async function migrateDatabase() {
  try {
    console.log("开始多语言数据库迁移...");

    // 1. 添加多语言字段
    await addMultilingualFields();

    // 2. 迁移现有数据
    await migrateExistingData();

    // 3. 添加英文示例数据
    await addEnglishSampleData();

    console.log("✅ 多语言数据库迁移完成！");
    process.exit(0);
  } catch (error) {
    console.error("❌ 迁移失败:", error);
    process.exit(1);
  }
}

// 添加多语言字段
function addMultilingualFields() {
  return new Promise((resolve, reject) => {
    const alterTableSQL = `
      ALTER TABLE products ADD COLUMN name_zh TEXT;
    `;

    db.run(alterTableSQL, (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error("添加 name_zh 字段失败:", err.message);
        reject(err);
        return;
      }
      console.log("✅ 添加 name_zh 字段");

      const alterTableSQL2 = `
        ALTER TABLE products ADD COLUMN name_en TEXT;
      `;

      db.run(alterTableSQL2, (err) => {
        if (err && !err.message.includes("duplicate column name")) {
          console.error("添加 name_en 字段失败:", err.message);
          reject(err);
          return;
        }
        console.log("✅ 添加 name_en 字段");

        const alterTableSQL3 = `
          ALTER TABLE products ADD COLUMN description_zh TEXT;
        `;

        db.run(alterTableSQL3, (err) => {
          if (err && !err.message.includes("duplicate column name")) {
            console.error("添加 description_zh 字段失败:", err.message);
            reject(err);
            return;
          }
          console.log("✅ 添加 description_zh 字段");

          const alterTableSQL4 = `
            ALTER TABLE products ADD COLUMN description_en TEXT;
          `;

          db.run(alterTableSQL4, (err) => {
            if (err && !err.message.includes("duplicate column name")) {
              console.error("添加 description_en 字段失败:", err.message);
              reject(err);
              return;
            }
            console.log("✅ 添加 description_en 字段");
            resolve();
          });
        });
      });
    });
  });
}

// 迁移现有数据
function migrateExistingData() {
  return new Promise((resolve, reject) => {
    console.log("🔄 迁移现有数据到多语言字段...");

    const updateSQL = `
      UPDATE products 
      SET name_zh = name, 
          description_zh = description
      WHERE name_zh IS NULL OR name_zh = ''
    `;

    db.run(updateSQL, function (err) {
      if (err) {
        console.error("迁移现有数据失败:", err.message);
        reject(err);
        return;
      }
      console.log(`✅ 迁移了 ${this.changes} 条记录的中文数据`);
      resolve();
    });
  });
}

// 添加英文示例数据
function addEnglishSampleData() {
  return new Promise((resolve, reject) => {
    console.log("🔄 添加英文示例数据...");

    const englishData = [
      {
        id: 1,
        name_en: "Fresh Salmon",
        description_en:
          "Norwegian imported fresh salmon, delicious meat, suitable for making various sushi",
      },
      {
        id: 2,
        name_en: "Tuna",
        description_en: "Deep sea tuna, delicate taste, rich in nutrition",
      },
      {
        id: 3,
        name_en: "Sushi Rice",
        description_en:
          "Japanese imported sushi rice, moderate stickiness, excellent taste",
      },
      {
        id: 4,
        name_en: "Nori Seaweed",
        description_en:
          "High-quality nori seaweed, deep green color, crisp and tender taste",
      },
      {
        id: 5,
        name_en: "Sushi Knife",
        description_en:
          "Professional sushi knife, sharp and durable, precise cutting",
      },
      {
        id: 6,
        name_en: "Sushi Rolling Mat",
        description_en:
          "Bamboo sushi rolling mat, traditional craftsmanship, easy to use",
      },
    ];

    let completed = 0;
    const total = englishData.length;

    englishData.forEach((data) => {
      const updateSQL = `
        UPDATE products 
        SET name_en = ?, description_en = ?
        WHERE id = ?
      `;

      db.run(
        updateSQL,
        [data.name_en, data.description_en, data.id],
        function (err) {
          if (err) {
            console.error(`更新产品 ${data.id} 英文数据失败:`, err.message);
          } else {
            console.log(`✅ 产品 ${data.id} 英文数据更新成功`);
          }

          completed++;
          if (completed === total) {
            console.log("✅ 所有英文示例数据添加完成");
            resolve();
          }
        }
      );
    });
  });
}

// 验证迁移结果
function verifyMigration() {
  return new Promise((resolve, reject) => {
    console.log("🔍 验证迁移结果...");

    const verifySQL = `
      SELECT id, name, name_zh, name_en, description, description_zh, description_en
      FROM products
      ORDER BY id
    `;

    db.all(verifySQL, (err, rows) => {
      if (err) {
        console.error("验证失败:", err.message);
        reject(err);
        return;
      }

      console.log("\n📊 迁移结果验证:");
      console.log("=".repeat(80));

      rows.forEach((row) => {
        console.log(`产品 ${row.id}:`);
        console.log(`  中文名称: ${row.name_zh || row.name}`);
        console.log(`  英文名称: ${row.name_en || "未设置"}`);
        console.log(
          `  中文描述: ${row.description_zh || row.description || "无描述"}`
        );
        console.log(`  英文描述: ${row.description_en || "未设置"}`);
        console.log("");
      });

      console.log("=".repeat(80));
      console.log(`✅ 总共 ${rows.length} 个产品`);
      resolve();
    });
  });
}

// 关闭数据库连接
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("关闭数据库失败:", err.message);
    } else {
      console.log("数据库连接已关闭");
    }
    process.exit(0);
  });
});
