const fs = require("fs");
const path = require("path");
const config = require("../config/config");

// 确保上传目录存在
function ensureUploadDirectory() {
  const uploadPath = config.uploadPath;
  
  if (!fs.existsSync(uploadPath)) {
    console.log(`创建上传目录: ${uploadPath}`);
    fs.mkdirSync(uploadPath, { recursive: true });
  } else {
    console.log(`上传目录已存在: ${uploadPath}`);
  }
}

// 确保公共目录存在
function ensurePublicDirectory() {
  const publicPath = path.join(__dirname, "..", "public");
  
  if (!fs.existsSync(publicPath)) {
    console.log(`创建公共目录: ${publicPath}`);
    fs.mkdirSync(publicPath, { recursive: true });
  } else {
    console.log(`公共目录已存在: ${publicPath}`);
  }
}

// 初始化函数
function init() {
  console.log("🚀 初始化 Sail Express 后端服务...");
  
  ensureUploadDirectory();
  ensurePublicDirectory();
  
  console.log("✅ 初始化完成！");
}

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  init();
}

module.exports = { init }; 