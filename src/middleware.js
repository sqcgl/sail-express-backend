const config = require("../config/config");

// API密钥验证中间件
const validateApiKey = (req, res, next) => {
  // 对于GET请求，跳过API密钥验证
  if (req.method === "GET") {
    return next();
  }

  const apiKey = req.headers.authorization;

  if (!apiKey || apiKey !== config.apiKey) {
    return res.status(401).json({
      success: false,
      error: "未授权访问",
      message: "请提供有效的API密钥",
    });
  }

  next();
};

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error("API错误:", err);

  // 处理文件上传错误
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "文件过大",
      message: `文件大小不能超过 ${config.maxFileSize / (1024 * 1024)}MB`,
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      error: "文件上传错误",
      message: "文件上传失败，请检查文件格式",
    });
  }

  // 处理其他错误
  res.status(500).json({
    success: false,
    error: "服务器内部错误",
    message:
      process.env.NODE_ENV === "production" ? "服务器内部错误" : err.message,
  });
};

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get("User-Agent") || "Unknown";
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - ${ip} - ${userAgent}`);

  next();
};

// CORS配置
const corsOptions = config.corsOptions;

module.exports = {
  validateApiKey,
  errorHandler,
  requestLogger,
  corsOptions,
};
