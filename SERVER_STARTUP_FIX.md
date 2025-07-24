# 服务器启动错误修复记录

## 🐛 问题描述

后端服务在 Railway 上部署时崩溃，错误信息显示：

```
Error: Cannot find module '../config/config'
Require stack:
- /app/src/server.js
```

## 🔍 问题分析

### 根本原因

在之前的表单验证修复过程中，我们删除了 `config/config.js` 和 `src/middleware.js` 文件，但 `src/server.js` 仍然在尝试引用这些文件：

```javascript
// src/server.js 第4行
const config = require("../config/config");

// src/server.js 第6行
const {
  validateApiKey,
  errorHandler,
  requestLogger,
  corsOptions,
} = require("./middleware");
```

### 问题所在

- `config/config.js` 文件被删除，但 `server.js` 仍需要配置信息
- `src/middleware.js` 文件被删除，但 `server.js` 仍需要中间件函数
- 缺少必要的目录初始化逻辑

## ✅ 修复方案

### 1. 重新创建配置文件

创建 `config/config.js` 文件，包含服务器运行所需的所有配置：

```javascript
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
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
};
```

### 2. 重新创建中间件文件

创建 `src/middleware.js` 文件，包含所有必要的中间件函数：

```javascript
// API密钥验证中间件
const validateApiKey = (req, res, next) => {
  // 对于GET请求，跳过API密钥验证
  if (req.method === "GET") {
    return next();
  }
  // ... 验证逻辑
};

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  // ... 错误处理逻辑
};

// 请求日志中间件
const requestLogger = (req, res, next) => {
  // ... 日志记录逻辑
};
```

### 3. 创建初始化脚本

创建 `src/init.js` 文件，确保必要的目录结构存在：

```javascript
// 确保上传目录存在
function ensureUploadDirectory() {
  const uploadPath = config.uploadPath;
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
}

// 确保公共目录存在
function ensurePublicDirectory() {
  const publicPath = path.join(__dirname, "..", "public");
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }
}
```

### 4. 修改服务器启动逻辑

在 `src/server.js` 中添加初始化调用：

```javascript
const { init } = require("./init");

// 启动服务器前先初始化
init();
```

## 🧪 测试验证

### 本地测试

```bash
node src/server.js
```

**预期输出：**

```
🚀 初始化 Sail Express 后端服务...
创建上传目录: C:\Projects\sail-express-backend\uploads
公共目录已存在: C:\Projects\sail-express-backend\public
✅ 初始化完成！
🚀 Sail Express 后端服务器启动成功！
📍 服务器地址: http://localhost:3000
🌍 环境: development
🔑 API密钥: your-secret-key-12345
📁 上传路径: C:\Projects\sail-express-backend\uploads
成功连接到SQLite数据库
产品表创建成功或已存在
数据库中已有 6 个产品，跳过示例数据插入
```

### 部署测试

- Railway 部署应该不再崩溃
- 服务器应该能够正常启动
- API 端点应该能够正常响应

## 📋 修复状态

- [x] 重新创建 `config/config.js` 配置文件
- [x] 重新创建 `src/middleware.js` 中间件文件
- [x] 创建 `src/init.js` 初始化脚本
- [x] 修改 `src/server.js` 启动逻辑
- [x] 本地测试验证
- [x] 提交代码到 GitHub
- [x] 创建修复记录文档

## 🎯 后续建议

1. **环境变量配置**：在生产环境中使用环境变量覆盖默认配置
2. **错误监控**：添加更详细的错误日志和监控
3. **健康检查**：确保 `/health` 端点能够正确响应
4. **文档更新**：更新部署文档，说明必要的环境变量

## 📝 总结

通过重新创建必要的配置文件和中间件，解决了服务器启动时的模块找不到错误。现在服务器可以正常启动，并且包含了完整的配置管理和目录初始化逻辑。
