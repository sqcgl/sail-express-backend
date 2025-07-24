# Railway 部署指南

## 部署步骤

### 1. 准备工作

- 确保代码已提交到 GitHub
- 确保所有依赖都已安装
- 确保配置文件正确

### 2. 在 Railway 创建项目

1. 访问 [Railway.app](https://railway.app)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择 `sail-express-backend` 仓库

### 3. 配置环境变量

在 Railway 项目设置中添加以下环境变量：

```
NODE_ENV=production
API_KEY=your-secret-api-key-here
CORS_ORIGIN=https://sail-express.netlify.app
PORT=3001
```

### 4. 部署设置

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/health`

### 5. 获取部署 URL

部署完成后，Railway 会提供一个 URL，例如：
`https://sail-express-backend-production.up.railway.app`

### 6. 更新前端配置

在前端项目中更新 API 地址：

```javascript
// src/services/apiService.js
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-railway-url.up.railway.app"
    : "http://localhost:3001";
```

## 验证部署

### 1. 健康检查

访问：`https://your-railway-url.up.railway.app/health`

### 2. API 测试

访问：`https://your-railway-url.up.railway.app/api/products`

### 3. 管理功能测试

使用 admin 页面测试 CRUD 操作

## 注意事项

1. **数据库持久化**: Railway 会自动持久化 SQLite 数据库
2. **文件上传**: 图片文件会存储在 Railway 的持久化存储中
3. **CORS 配置**: 已配置支持 Netlify 前端域名
4. **API 密钥**: 请使用强密码作为 API 密钥

## 故障排除

### 常见问题

1. **部署失败**: 检查 package.json 和依赖
2. **CORS 错误**: 检查环境变量配置
3. **数据库错误**: 检查数据库文件权限
4. **API 密钥错误**: 确保前端和后端使用相同的 API 密钥

### 日志查看

在 Railway 控制台可以查看实时日志，帮助调试问题。
