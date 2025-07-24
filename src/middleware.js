const config = require("../config/config");

// API密钥验证中间件
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers.authorization;

  // GET请求（获取产品列表） - 公开访问
  if (req.method === "GET") {
    return next();
  }

  // 其他请求（增删改） - 需要API密钥
  if (!apiKey) {
    return res.status(401).json({
      error: "未授权访问",
      message: "缺少API密钥，请在请求头中添加 Authorization 字段",
    });
  }

  if (apiKey !== config.apiKey) {
    return res.status(401).json({
      error: "未授权访问",
      message: "API密钥无效",
    });
  }

  next();
};

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error("服务器错误:", err);

  res.status(500).json({
    error: "服务器内部错误",
    message:
      config.nodeEnv === "development"
        ? err.message
        : "服务器出现错误，请稍后重试",
  });
};

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
};

// CORS配置中间件 - 支持多个来源
const corsOptions = {
  origin: function (origin, callback) {
    // 允许的域名列表
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://sail-express.netlify.app",
      "https://sail-express-frontend.netlify.app",
    ];

    // 允许没有origin的请求（如移动应用、Postman等）
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("不允许的来源"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

module.exports = {
  validateApiKey,
  errorHandler,
  requestLogger,
  corsOptions,
};
