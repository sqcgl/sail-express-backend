const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库路径
const dbPath = path.join(__dirname, 'database.db');

// 分类映射：旧分类 -> 新分类
const categoryMapping = {
  'seafood': 'fresh',      // 海鲜 -> 新鲜
  'ingredients': 'dry',    // 食材 -> 干货
  'tools': 'supply'        // 工具 -> 器具
};

// 创建数据库连接
const db = new sqlite3.Database(dbPath);

console.log('开始迁移产品分类...');

// 首先查看当前的产品分类
db.all('SELECT id, name, category FROM products', (err, products) => {
  if (err) {
    console.error('查询产品失败:', err);
    db.close();
    return;
  }

  console.log('当前产品分类:');
  products.forEach(product => {
    console.log(`- ${product.name}: ${product.category}`);
  });

  // 开始迁移
  let updatedCount = 0;
  let totalProducts = products.length;

  products.forEach(product => {
    const newCategory = categoryMapping[product.category];
    
    if (newCategory) {
      db.run(
        'UPDATE products SET category = ? WHERE id = ?',
        [newCategory, product.id],
        function(err) {
          if (err) {
            console.error(`更新产品 ${product.name} 失败:`, err);
          } else {
            updatedCount++;
            console.log(`✓ ${product.name}: ${product.category} -> ${newCategory}`);
          }

          // 检查是否所有产品都已更新
          if (updatedCount === totalProducts) {
            console.log(`\n迁移完成！共更新了 ${updatedCount} 个产品的分类。`);
            
            // 显示更新后的分类统计
            db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category', (err, stats) => {
              if (err) {
                console.error('查询分类统计失败:', err);
              } else {
                console.log('\n更新后的分类统计:');
                stats.forEach(stat => {
                  console.log(`- ${stat.category}: ${stat.count} 个产品`);
                });
              }
              db.close();
            });
          }
        }
      );
    } else {
      console.log(`⚠ ${product.name}: 未知分类 "${product.category}"，跳过`);
      updatedCount++;
      
      if (updatedCount === totalProducts) {
        console.log(`\n迁移完成！共更新了 ${updatedCount} 个产品的分类。`);
        db.close();
      }
    }
  });
});
