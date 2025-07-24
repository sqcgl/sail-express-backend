const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

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

// 内存存储产品数据
let products = [
  {
    id: 1,
    name_zh: "新鲜三文鱼",
    name_en: "Fresh Salmon",
    description_zh: "挪威进口新鲜三文鱼，肉质鲜美，适合制作各类寿司",
    description_en:
      "Norwegian imported fresh salmon, tender and delicious, perfect for making various sushi",
    price: "¥180/kg",
    category: "fresh",
    image: "/uploads/salmon.jpg",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name_zh: "冷冻虾仁",
    name_en: "Frozen Shrimp",
    description_zh: "进口冷冻虾仁，品质优良，口感鲜美",
    description_en:
      "Imported frozen shrimp, excellent quality, delicious taste",
    price: "¥120/kg",
    category: "frozen",
    image: "/uploads/shrimp.jpg",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    name_zh: "寿司米",
    name_en: "Sushi Rice",
    description_zh: "日本进口寿司专用米，粘性适中，口感绝佳",
    description_en:
      "Japanese imported sushi rice, moderate stickiness, excellent taste",
    price: "¥25/kg",
    category: "dry",
    image: "/uploads/rice.jpg",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 4,
    name_zh: "寿司刀",
    name_en: "Sushi Knife",
    description_zh: "专业寿司刀，锋利耐用，切割精准",
    description_en:
      "Professional sushi knife, sharp and durable, precise cutting",
    price: "¥280/把",
    category: "supply",
    image: "/uploads/knife.jpg",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
];

let nextId = 5;

// 产品分类配置
const categories = [
  { id: "fresh", name: "新鲜" },
  { id: "frozen", name: "冷冻" },
  { id: "dry", name: "干货" },
  { id: "supply", name: "器具" },
];

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

// 处理多语言产品数据
function processMultilingualProduct(product, language = "zh") {
  if (!product) return product;

  // 根据语言返回对应的字段
  if (language === "en") {
    return {
      ...product,
      name: product.name_en || product.name_zh || product.name,
      description:
        product.description_en || product.description_zh || product.description,
    };
  } else {
    return {
      ...product,
      name: product.name_zh || product.name,
      description: product.description_zh || product.description,
    };
  }
}

// 处理多语言产品列表
function processMultilingualProducts(products, language = "zh") {
  return products.map((product) =>
    processMultilingualProduct(product, language)
  );
}

// 配置文件上传（内存存储）
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("只允许上传图片文件 (jpeg, jpg, png, gif, webp)"));
    }
  },
});

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

// 获取所有产品
app.get("/api/products", (req, res) => {
  try {
    const { language = "zh" } = req.query;
    const processedProducts = processMultilingualProducts(products, language);

    res.json({
      success: true,
      data: processedProducts,
      count: processedProducts.length,
      language: language,
    });
  } catch (error) {
    console.error("获取产品列表失败:", error);
    res.status(500).json({
      success: false,
      error: "获取产品列表失败",
      message: error.message,
    });
  }
});

// 根据分类获取产品
app.get("/api/products/category/:category", (req, res) => {
  try {
    const { category } = req.params;
    const { language = "zh" } = req.query;
    const categoryProducts = products.filter((p) => p.category === category);
    const processedProducts = processMultilingualProducts(
      categoryProducts,
      language
    );

    res.json({
      success: true,
      data: processedProducts,
      count: processedProducts.length,
      category: category,
      language: language,
    });
  } catch (error) {
    console.error("获取分类产品失败:", error);
    res.status(500).json({
      success: false,
      error: "获取分类产品失败",
      message: error.message,
    });
  }
});

// 根据ID获取产品
app.get("/api/products/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { language = "zh" } = req.query;
    const product = products.find((p) => p.id === parseInt(id));

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "产品不存在",
        message: `ID为 ${id} 的产品未找到`,
      });
    }

    const processedProduct = processMultilingualProduct(product, language);

    res.json({
      success: true,
      data: processedProduct,
      language: language,
    });
  } catch (error) {
    console.error("获取产品详情失败:", error);
    res.status(500).json({
      success: false,
      error: "获取产品详情失败",
      message: error.message,
    });
  }
});

// 添加产品
app.post(
  "/api/products",
  validateApiKey,
  upload.single("image"),
  (req, res) => {
    try {
      const {
        name_zh,
        name_en,
        description_zh,
        description_en,
        price,
        category,
      } = req.body;

      // 验证必填字段 - 英文名称、价格和分类为必填项，中文名称为可选
      if (!name_en || !price || !category) {
        return res.status(400).json({
          success: false,
          error: "缺少必填字段",
          message: "英文名称、价格和分类为必填项",
        });
      }

      // 验证分类
      const validCategories = categories.map((cat) => cat.id);
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: "无效的分类",
          message: `分类必须是以下之一: ${validCategories.join(", ")}`,
        });
      }

      // 处理图片路径（在Netlify Functions中，我们使用占位符）
      // 由于Netlify Functions无法持久化存储文件，我们使用占位符
      let imagePath = null;
      if (req.file) {
        // 将图片转换为Base64，这样前端可以直接显示
        const base64Image = req.file.buffer.toString("base64");
        const mimeType = req.file.mimetype;
        imagePath = `data:${mimeType};base64,${base64Image}`;
      }

      // 创建产品对象
      const newProduct = {
        id: nextId++,
        name_zh: name_zh.trim(),
        name_en: name_en.trim(),
        description_zh: description_zh ? description_zh.trim() : "",
        description_en: description_en ? description_en.trim() : "",
        price: price.trim(),
        category: category,
        image: imagePath,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 添加到内存存储
      products.push(newProduct);

      res.status(201).json({
        success: true,
        message: "产品添加成功",
        data: newProduct,
      });
    } catch (error) {
      console.error("添加产品失败:", error);
      res.status(500).json({
        success: false,
        error: "添加产品失败",
        message: error.message,
      });
    }
  }
);

// 更新产品
app.put(
  "/api/products/:id",
  validateApiKey,
  upload.single("image"),
  (req, res) => {
    try {
      const { id } = req.params;
      const {
        name_zh,
        name_en,
        description_zh,
        description_en,
        price,
        category,
      } = req.body;

      // 检查产品是否存在
      const existingProductIndex = products.findIndex(
        (p) => p.id === parseInt(id)
      );
      if (existingProductIndex === -1) {
        return res.status(404).json({
          success: false,
          error: "产品不存在",
          message: `ID为 ${id} 的产品未找到`,
        });
      }

      // 验证必填字段 - 英文名称、价格和分类为必填项，中文名称为可选
      if (!name_en || !price || !category) {
        return res.status(400).json({
          success: false,
          error: "缺少必填字段",
          message: "英文名称、价格和分类为必填项",
        });
      }

      // 验证分类
      const validCategories = categories.map((cat) => cat.id);
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: "无效的分类",
          message: `分类必须是以下之一: ${validCategories.join(", ")}`,
        });
      }

      // 处理图片路径
      let imagePath = products[existingProductIndex].image; // 保持原有图片
      if (req.file) {
        // 将图片转换为Base64，这样前端可以直接显示
        const base64Image = req.file.buffer.toString("base64");
        const mimeType = req.file.mimetype;
        imagePath = `data:${mimeType};base64,${base64Image}`;
      }

      // 更新产品对象
      const updatedProduct = {
        ...products[existingProductIndex],
        name_zh: name_zh.trim(),
        name_en: name_en.trim(),
        description_zh: description_zh ? description_zh.trim() : "",
        description_en: description_en ? description_en.trim() : "",
        price: price.trim(),
        category: category,
        image: imagePath,
        updated_at: new Date().toISOString(),
      };

      // 更新内存存储
      products[existingProductIndex] = updatedProduct;

      res.json({
        success: true,
        message: "产品更新成功",
        data: updatedProduct,
      });
    } catch (error) {
      console.error("更新产品失败:", error);
      res.status(500).json({
        success: false,
        error: "更新产品失败",
        message: error.message,
      });
    }
  }
);

// 删除产品
app.delete("/api/products/:id", validateApiKey, (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = products.findIndex((p) => p.id === parseInt(id));

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "产品不存在",
        message: `ID为 ${id} 的产品未找到`,
      });
    }

    // 从内存存储中删除
    products.splice(productIndex, 1);

    res.json({
      success: true,
      message: "产品删除成功",
      data: { id: parseInt(id) },
    });
  } catch (error) {
    console.error("删除产品失败:", error);
    res.status(500).json({
      success: false,
      error: "删除产品失败",
      message: error.message,
    });
  }
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
