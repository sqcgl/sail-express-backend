# Sail Express 后端 API 服务

## 项目概述

Sail Express 后端 API 服务是一个基于 Node.js + Express + SQLite 的产品管理系统，为前端提供产品数据的增删改查功能。

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web 框架
- **SQLite** - 轻量级数据库
- **Multer** - 文件上传处理
- **CORS** - 跨域资源共享

## 项目结构

```
sail-express-backend/
├── src/
│   ├── server.js          # 主服务器文件
│   ├── database.js        # 数据库配置和操作
│   └── middleware.js      # 中间件
├── routes/
│   └── products.js        # 产品相关路由
├── config/
│   └── config.js          # 配置文件
├── uploads/
│   └── products/          # 产品图片存储
├── public/                # 静态文件
├── package.json           # 项目配置
└── README.md              # 项目说明
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 启动生产服务器

```bash
npm start
```

## API 接口

### 产品管理

#### 获取所有产品

```
GET /api/products
```

#### 获取单个产品

```
GET /api/products/:id
```

#### 获取分类产品

```
GET /api/products/category/:category
```

#### 添加产品 (需要 API 密钥)

```
POST /api/products
Content-Type: multipart/form-data
Authorization: your-secret-key-12345

参数:
- name: 产品名称 (必填)
- description: 产品描述
- price: 价格 (必填)
- category: 分类 (必填) - seafood/ingredients/tools
- image: 产品图片文件
```

#### 更新产品 (需要 API 密钥)

```
PUT /api/products/:id
Content-Type: multipart/form-data
Authorization: your-secret-key-12345

参数: 同添加产品
```

#### 删除产品 (需要 API 密钥)

```
DELETE /api/products/:id
Authorization: your-secret-key-12345
```

### 系统接口

#### 健康检查

```
GET /health
```

#### API 信息

```
GET /
```

## 配置说明

### 环境变量

可以通过环境变量或配置文件修改以下设置：

- `PORT` - 服务器端口 (默认: 3001)
- `API_KEY` - API 密钥 (默认: your-secret-key-12345)
- `DB_PATH` - 数据库文件路径 (默认: ./database.db)
- `UPLOAD_PATH` - 图片上传路径 (默认: ./uploads/products)
- `MAX_FILE_SIZE` - 最大文件大小 (默认: 5MB)
- `CORS_ORIGIN` - 允许的跨域来源 (默认: http://localhost:3000)

### 产品分类

系统支持以下产品分类：

- `seafood` - 海鲜类
- `ingredients` - 食材类
- `tools` - 器具类

## 数据库

### 产品表结构

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 示例数据

系统启动时会自动插入以下示例产品：

1. 新鲜三文鱼 (海鲜类)
2. 金枪鱼 (海鲜类)
3. 寿司米 (食材类)
4. 海苔 (食材类)
5. 寿司刀 (器具类)
6. 寿司卷帘 (器具类)

## 安全说明

### API 密钥认证

- GET 请求（获取数据）无需认证
- POST/PUT/DELETE 请求需要 API 密钥
- 在请求头中添加：`Authorization: your-secret-key-12345`

### 文件上传安全

- 只允许图片文件 (jpeg, jpg, png, gif, webp)
- 文件大小限制：5MB
- 自动生成唯一文件名防止冲突

## 部署说明

### 本地部署

1. 克隆项目
2. 安装依赖：`npm install`
3. 启动服务：`npm start`

### 云服务器部署

1. 上传项目到服务器
2. 安装 Node.js 和 npm
3. 安装依赖：`npm install`
4. 配置环境变量
5. 启动服务：`npm start`
6. 配置反向代理（如 Nginx）

### 使用 PM2 管理进程

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start src/server.js --name "sail-express-backend"

# 查看状态
pm2 status

# 重启应用
pm2 restart sail-express-backend
```

## 开发说明

### 开发模式

使用 `npm run dev` 启动开发模式，支持热重载。

### 日志

服务器会记录所有请求日志，包括：

- 请求时间
- 请求方法
- 请求路径
- 客户端 IP

### 错误处理

系统包含完整的错误处理机制：

- 400 - 请求参数错误
- 401 - 未授权访问
- 404 - 资源不存在
- 500 - 服务器内部错误

## 联系信息

如有问题或建议，请联系开发团队。

---

**版本**: 1.0.0  
**最后更新**: 2024 年 12 月 19 日
