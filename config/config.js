// 服务器配置文件
const path = require("path");

const config = {
  // 服务器配置
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // API配置
  apiKey: process.env.API_KEY || "your-secret-key-12345",

  // 数据库配置
  dbPath: process.env.DB_PATH || path.join(__dirname, "..", "database.db"),

  // 文件上传配置
  uploadPath: process.env.UPLOAD_PATH || path.join(__dirname, "..", "uploads"),
  maxFileSize: 5 * 1024 * 1024, // 5MB

  // 产品分类配置
  categories: [
    { id: "fresh", name: "新鲜" },
    { id: "frozen", name: "冷冻" },
    { id: "dry", name: "干货" },
    { id: "supply", name: "器具" },
  ],

  // CORS配置
  corsOptions: {
    origin: process.env.CORS_ORIGIN || [
      "https://sail-express.com",
      "https://sail-express-frontend.vercel.app",
      "https://sail-express-frontend.netlify.app",
      "http://localhost:5173",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
};

module.exports = config;
