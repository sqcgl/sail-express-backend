const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('验证分类迁移结果...\n');

// 查询所有产品及其分类
db.all('SELECT name, category FROM products ORDER BY category, name', (err, products) => {
  if (err) {
    console.error('查询失败:', err);
    db.close();
    return;
  }

  console.log('产品分类列表:');
  products.forEach(product => {
    console.log(`- ${product.name}: ${product.category}`);
  });

  console.log('\n分类统计:');
  
  // 统计每个分类的产品数量
  const stats = {};
  products.forEach(product => {
    stats[product.category] = (stats[product.category] || 0) + 1;
  });

  Object.keys(stats).sort().forEach(category => {
    console.log(`- ${category}: ${stats[category]} 个产品`);
  });

  console.log('\n验证完成！');
  db.close();
}); 