const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const path = require("path");
const config = require("../config/config");
const {
  validateApiKey,
  errorHandler,
  requestLogger,
  corsOptions,
} = require("../src/middleware");
const productsRouter = require("../routes/products");

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
    message: "Sail Express 后端API服务 (Netlify Functions)",
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
    environment: "netlify-functions",
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

// 导出serverless函数
module.exports.handler = serverless(app);
