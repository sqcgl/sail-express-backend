// 配置文件
const config = {
  // 服务器配置
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",

  // API密钥配置
  apiKey: process.env.API_KEY || "your-secret-key-12345",

  // 数据库配置
  dbPath: process.env.DB_PATH || "./database.db",

  // 文件上传配置
  uploadPath: process.env.UPLOAD_PATH || "./uploads/products",
  maxFileSize: process.env.MAX_FILE_SIZE || 5242880, // 5MB

  // CORS配置 - 支持多个来源
  corsOrigin:
    process.env.CORS_ORIGIN ||
    "http://localhost:5173,https://sail-express.netlify.app",

  // 产品分类
  categories: [
    { id: "fresh", name: "新鲜" },
    { id: "frozen", name: "冷冻" },
    { id: "dry", name: "干货" },
    { id: "supply", name: "器具" },
  ],
};

module.exports = config;
