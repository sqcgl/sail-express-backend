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

console.log('🚀 开始生产环境分类迁移...');
console.log('📊 分类映射:');
Object.keys(categoryMapping).forEach(oldCat => {
  console.log(`   ${oldCat} -> ${categoryMapping[oldCat]}`);
});

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 连接数据库失败:', err.message);
    process.exit(1);
  }
  console.log('✅ 成功连接到数据库');
});

// 开始事务
db.run('BEGIN TRANSACTION', (err) => {
  if (err) {
    console.error('❌ 开始事务失败:', err.message);
    db.close();
    process.exit(1);
  }
  console.log('🔄 开始数据库迁移...');
});

// 查询所有产品
db.all('SELECT id, name, category FROM products', (err, products) => {
  if (err) {
    console.error('❌ 查询产品失败:', err);
    db.run('ROLLBACK');
    db.close();
    process.exit(1);
  }

  console.log(`📋 找到 ${products.length} 个产品需要迁移`);

  if (products.length === 0) {
    console.log('✅ 没有产品需要迁移');
    db.run('COMMIT');
    db.close();
    return;
  }

  let updatedCount = 0;
  let totalProducts = products.length;

  products.forEach(product => {
    const newCategory = categoryMapping[product.category];
    
    if (newCategory) {
      db.run(
        'UPDATE products SET category = ?, updated_at = DATETIME("now") WHERE id = ?',
        [newCategory, product.id],
        function(err) {
          if (err) {
            console.error(`❌ 更新产品 ${product.name} 失败:`, err);
            db.run('ROLLBACK');
            db.close();
            process.exit(1);
          } else {
            updatedCount++;
            console.log(`✅ ${product.name}: ${product.category} -> ${newCategory}`);
          }

          // 检查是否所有产品都已更新
          if (updatedCount === totalProducts) {
            console.log(`\n🎉 迁移完成！共更新了 ${updatedCount} 个产品的分类。`);
            
            // 提交事务
            db.run('COMMIT', (err) => {
              if (err) {
                console.error('❌ 提交事务失败:', err.message);
                db.close();
                process.exit(1);
              }
              
              console.log('✅ 事务已提交');
              
              // 显示更新后的分类统计
              db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category', (err, stats) => {
                if (err) {
                  console.error('❌ 查询分类统计失败:', err);
                } else {
                  console.log('\n📊 更新后的分类统计:');
                  stats.forEach(stat => {
                    console.log(`   - ${stat.category}: ${stat.count} 个产品`);
                  });
                }
                
                console.log('\n✨ 分类迁移成功完成！');
                db.close();
              });
            });
          }
        }
      );
    } else {
      console.log(`⚠️  ${product.name}: 未知分类 "${product.category}"，跳过`);
      updatedCount++;
      
      if (updatedCount === totalProducts) {
        console.log(`\n🎉 迁移完成！共更新了 ${updatedCount} 个产品的分类。`);
        db.run('COMMIT');
        db.close();
      }
    }
  });
}); 