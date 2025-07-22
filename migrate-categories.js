const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// 数据库路径
const dbPath = path.join(__dirname, "database.db");

// 分类映射：旧分类 -> 新分类
const categoryMapping = {
  seafood: "fresh", // 海鲜类 -> 新鲜
  ingredients: "dry", // 食材类 -> 干货
  tools: "supply", // 器具类 -> 器具
};

// 新分类配置
const newCategories = [
  { id: "fresh", name: "新鲜" },
  { id: "frozen", name: "冷冻" },
  { id: "dry", name: "干货" },
  { id: "supply", name: "器具" },
];

async function migrateCategories() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("❌ 连接数据库失败:", err.message);
        reject(err);
        return;
      }
      console.log("✅ 成功连接到数据库");
    });

    db.serialize(() => {
      // 开始事务
      db.run("BEGIN TRANSACTION", (err) => {
        if (err) {
          console.error("❌ 开始事务失败:", err.message);
          reject(err);
          return;
        }
        console.log("🔄 开始数据库迁移...");
      });

      // 更新产品分类
      let updatedCount = 0;
      let totalCount = 0;

      db.each(
        "SELECT id, category FROM products",
        (err, row) => {
          if (err) {
            console.error("❌ 查询产品失败:", err.message);
            reject(err);
            return;
          }

          totalCount++;
          const oldCategory = row.category;
          const newCategory = categoryMapping[oldCategory];

          if (newCategory) {
            db.run(
              "UPDATE products SET category = ? WHERE id = ?",
              [newCategory, row.id],
              function (err) {
                if (err) {
                  console.error(`❌ 更新产品 ${row.id} 失败:`, err.message);
                  reject(err);
                  return;
                }
                updatedCount++;
                console.log(
                  `✅ 产品 ${row.id}: ${oldCategory} -> ${newCategory}`
                );
              }
            );
          } else {
            console.log(`⚠️  产品 ${row.id}: 未知分类 "${oldCategory}"，跳过`);
          }
        },
        (err) => {
          if (err) {
            console.error("❌ 查询产品完成时出错:", err.message);
            reject(err);
            return;
          }

          // 提交事务
          db.run("COMMIT", (err) => {
            if (err) {
              console.error("❌ 提交事务失败:", err.message);
              reject(err);
              return;
            }

            console.log("\n🎉 分类迁移完成！");
            console.log(`📊 统计信息:`);
            console.log(`   - 总产品数: ${totalCount}`);
            console.log(`   - 更新产品数: ${updatedCount}`);
            console.log(`   - 跳过产品数: ${totalCount - updatedCount}`);
            console.log("\n📋 新分类系统:");
            newCategories.forEach((cat) => {
              console.log(`   - ${cat.id}: ${cat.name}`);
            });

            db.close((err) => {
              if (err) {
                console.error("❌ 关闭数据库失败:", err.message);
                reject(err);
                return;
              }
              console.log("\n✅ 数据库连接已关闭");
              resolve();
            });
          });
        }
      );
    });
  });
}

// 运行迁移
if (require.main === module) {
  console.log("🚀 开始分类系统迁移...\n");

  migrateCategories()
    .then(() => {
      console.log("\n✨ 迁移成功完成！");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 迁移失败:", error);
      process.exit(1);
    });
}

module.exports = { migrateCategories };
