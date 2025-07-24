const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("../config/config");
const {
  validateApiKey,
  errorHandler,
  requestLogger,
  corsOptions,
} = require("./middleware");
const productsRouter = require("../routes/products");
const { init } = require("./init");

const app = express();

// 中间件配置
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors(corsOptions));
app.use(requestLogger);

// 静态文件服务
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// API路由
app.use("/api/products", validateApiKey, productsRouter);

// 根路径
app.get("/", (req, res) => {
  res.json({
    message: "Sail Express 后端API服务",
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
      categories: "/api/products/category/:category",
      product: "/api/products/:id",
    },
    documentation: "请参考API文档了解详细使用方法",
  });
});

// 健康检查
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// 404处理
app.use("*", (req, res) => {
  res.status(404).json({
    error: "接口不存在",
    message: `路径 ${req.originalUrl} 未找到`,
    availableEndpoints: [
      "GET /api/products",
      "GET /api/products/:id",
      "GET /api/products/category/:category",
      "POST /api/products",
      "PUT /api/products/:id",
      "DELETE /api/products/:id",
    ],
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = config.port;

// 初始化服务
init();

app.listen(PORT, () => {
  console.log("🚀 Sail Express 后端服务器启动成功！");
  console.log(`📍 服务器地址: http://localhost:${PORT}`);
  console.log(`🌍 环境: ${config.nodeEnv}`);
  console.log(`🔑 API密钥: ${config.apiKey}`);
  console.log(`📁 上传路径: ${config.uploadPath}`);
  console.log("📚 API文档:");
  console.log("  GET  /api/products - 获取所有产品");
  console.log("  GET  /api/products/:id - 获取单个产品");
  console.log("  GET  /api/products/category/:category - 获取分类产品");
  console.log("  POST /api/products - 添加产品 (需要API密钥)");
  console.log("  PUT  /api/products/:id - 更新产品 (需要API密钥)");
  console.log("  DELETE /api/products/:id - 删除产品 (需要API密钥)");
  console.log("");
  console.log("💡 提示: 使用 npm run dev 启动开发模式");
});

// 优雅关闭
process.on("SIGTERM", () => {
  console.log("收到 SIGTERM 信号，正在关闭服务器...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("收到 SIGINT 信号，正在关闭服务器...");
  process.exit(0);
});

module.exports = app;
