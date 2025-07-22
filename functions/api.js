const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");

const app = express();

// 基本中间件配置
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 简单的API密钥验证中间件
const validateApiKey = (req, res, next) => {
  // 对于GET请求，跳过API密钥验证
  if (req.method === "GET") {
    return next();
  }

  const apiKey = req.headers.authorization;
  const expectedKey = process.env.API_KEY || "your-secret-key-12345";

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: "未授权访问" });
  }

  next();
};

// 根路径
app.get("/", (req, res) => {
  res.json({
    message: "Sail Express 后端API服务 (Netlify Functions)",
    version: "1.0.0",
    status: "running",
    endpoints: {
      products: "/api/products",
      health: "/health",
    },
  });
});

// 健康检查
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: "netlify-functions",
  });
});

// 产品API - 简化版本
app.get("/api/products", (req, res) => {
  // 返回示例数据
  const sampleProducts = [
    {
      id: 1,
      name: "新鲜三文鱼",
      name_zh: "新鲜三文鱼",
      name_en: "Fresh Salmon",
      description: "优质新鲜三文鱼",
      description_zh: "优质新鲜三文鱼",
      description_en: "Premium fresh salmon",
      price: 88.0,
      category: "fresh",
      image: "/uploads/salmon.jpg",
    },
    {
      id: 2,
      name: "冷冻虾仁",
      name_zh: "冷冻虾仁",
      name_en: "Frozen Shrimp",
      description: "进口冷冻虾仁",
      description_zh: "进口冷冻虾仁",
      description_en: "Imported frozen shrimp",
      price: 66.0,
      category: "frozen",
      image: "/uploads/shrimp.jpg",
    },
  ];

  // 返回符合前端期望的格式
  res.json({
    success: true,
    data: sampleProducts,
    message: "获取产品成功",
  });
});

// 404处理
app.use("*", (req, res) => {
  res.status(404).json({
    error: "接口不存在",
    message: `路径 ${req.originalUrl} 未找到`,
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error("API错误:", err);
  res.status(500).json({
    error: "服务器内部错误",
    message: err.message,
  });
});

// 导出serverless函数
module.exports.handler = serverless(app);
