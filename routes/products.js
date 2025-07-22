const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { dbOperations } = require("../src/database");
const config = require("../config/config");

const router = express.Router();

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

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 确保上传目录存在
    if (!fs.existsSync(config.uploadPath)) {
      fs.mkdirSync(config.uploadPath, { recursive: true });
    }
    cb(null, config.uploadPath);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueName =
      Date.now() +
      "_" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.maxFileSize, // 5MB
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

// 获取所有产品
router.get("/", async (req, res) => {
  try {
    const { language = "zh" } = req.query;
    const products = await dbOperations.getAllProducts();
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
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const { language = "zh" } = req.query;
    const products = await dbOperations.getProductsByCategory(category);
    const processedProducts = processMultilingualProducts(products, language);

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
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { language = "zh" } = req.query;
    const product = await dbOperations.getProductById(id);

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
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      name_zh,
      name_en,
      description_zh,
      description_en,
      price,
      category,
    } = req.body;

    // 验证必填字段
    if (!name_zh || !name_en || !price || !category) {
      return res.status(400).json({
        success: false,
        error: "缺少必填字段",
        message: "中文名称、英文名称、价格和分类为必填项",
      });
    }

    // 验证分类
    const validCategories = config.categories.map((cat) => cat.id);
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: "无效的分类",
        message: `分类必须是以下之一: ${validCategories.join(", ")}`,
      });
    }

    // 处理图片路径
    const imagePath = req.file
      ? `/uploads/products/${req.file.filename}`
      : null;

    // 创建产品对象
    const product = {
      name_zh: name_zh.trim(),
      name_en: name_en.trim(),
      description_zh: description_zh ? description_zh.trim() : "",
      description_en: description_en ? description_en.trim() : "",
      price: price.trim(),
      category: category,
      image: imagePath,
    };

    // 保存到数据库
    const newProduct = await dbOperations.addProduct(product);

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
});

// 更新产品
router.put("/:id", upload.single("image"), async (req, res) => {
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
    const existingProduct = await dbOperations.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: "产品不存在",
        message: `ID为 ${id} 的产品未找到`,
      });
    }

    // 验证必填字段
    if (!name_zh || !name_en || !price || !category) {
      return res.status(400).json({
        success: false,
        error: "缺少必填字段",
        message: "中文名称、英文名称、价格和分类为必填项",
      });
    }

    // 验证分类
    const validCategories = config.categories.map((cat) => cat.id);
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: "无效的分类",
        message: `分类必须是以下之一: ${validCategories.join(", ")}`,
      });
    }

    // 处理图片路径
    let imagePath = existingProduct.image; // 保持原有图片
    if (req.file) {
      // 如果有新图片，删除旧图片
      if (existingProduct.image) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          "public",
          existingProduct.image
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagePath = `/uploads/products/${req.file.filename}`;
    }

    // 更新产品对象
    const updatedProduct = {
      name_zh: name_zh.trim(),
      name_en: name_en.trim(),
      description_zh: description_zh ? description_zh.trim() : "",
      description_en: description_en ? description_en.trim() : "",
      price: price.trim(),
      category: category,
      image: imagePath,
    };

    // 更新数据库
    const result = await dbOperations.updateProduct(id, updatedProduct);

    res.json({
      success: true,
      message: "产品更新成功",
      data: result,
    });
  } catch (error) {
    console.error("更新产品失败:", error);
    res.status(500).json({
      success: false,
      error: "更新产品失败",
      message: error.message,
    });
  }
});

// 删除产品
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 检查产品是否存在
    const existingProduct = await dbOperations.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: "产品不存在",
        message: `ID为 ${id} 的产品未找到`,
      });
    }

    // 删除产品图片
    if (existingProduct.image) {
      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        existingProduct.image
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // 从数据库删除
    const result = await dbOperations.deleteProduct(id);

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

module.exports = router;
