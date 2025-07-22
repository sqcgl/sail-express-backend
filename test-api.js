const http = require("http");

// 测试配置
const BASE_URL = "http://localhost:3001";
const API_KEY = "your-secret-key-12345";

// 测试函数
function testAPI(endpoint, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: API_KEY,
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// 运行测试
async function runTests() {
  console.log("🧪 开始API测试...\n");

  try {
    // 测试1: 获取所有产品
    console.log("1. 测试获取所有产品...");
    const allProducts = await testAPI("/api/products");
    console.log(`   状态码: ${allProducts.status}`);
    console.log(`   产品数量: ${allProducts.data.count || 0}`);
    console.log("");

    // 测试2: 获取海鲜类产品
    console.log("2. 测试获取海鲜类产品...");
    const seafoodProducts = await testAPI("/api/products/category/seafood");
    console.log(`   状态码: ${seafoodProducts.status}`);
    console.log(`   产品数量: ${seafoodProducts.data.count || 0}`);
    console.log("");

    // 测试3: 获取单个产品
    console.log("3. 测试获取单个产品...");
    const singleProduct = await testAPI("/api/products/1");
    console.log(`   状态码: ${singleProduct.status}`);
    console.log(`   产品名称: ${singleProduct.data.data?.name || "N/A"}`);
    console.log("");

    // 测试4: 健康检查
    console.log("4. 测试健康检查...");
    const health = await testAPI("/health");
    console.log(`   状态码: ${health.status}`);
    console.log(`   状态: ${health.data.status}`);
    console.log("");

    // 测试5: API信息
    console.log("5. 测试API信息...");
    const apiInfo = await testAPI("/");
    console.log(`   状态码: ${apiInfo.status}`);
    console.log(`   消息: ${apiInfo.data.message}`);
    console.log("");

    console.log("✅ 所有测试完成！");
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

// 运行测试
runTests();
