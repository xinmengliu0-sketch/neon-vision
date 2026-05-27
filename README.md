# 刘新蒙项目实践 - 电脑性能检测

一个功能完整的电脑性能检测网站，用于检测硬件配置和评估系统性能。

## 功能特性

- 🖥️ **硬件信息检测** - 自动识别处理器、内存、显卡、存储等硬件配置
- ⚡ **性能测试** - CPU运算、内存读写、显卡渲染、存储I/O性能测试
- 📊 **性能报告** - 可视化的性能分析报告和综合评分
- 📜 **历史记录** - 保存测试结果，支持查看和对比
- 📱 **响应式设计** - 支持多种设备访问

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js (数据可视化)

## 快速开始

### 本地运行

#### 方式1：一键启动（推荐）

**Windows用户：**
双击运行 `start.bat` 文件

**Mac/Linux用户：**
在终端运行：
```bash
chmod +x start.sh
./start.sh
```

#### 方式2：手动启动

使用Python启动服务器：
```bash
python -m http.server 8000
```

### 访问网站

启动服务器后，在浏览器中访问：**http://localhost:8000**

## 部署到 GitHub Pages

您也可以将项目部署到 GitHub Pages，让任何人都能在线访问：

1. 进入项目的 GitHub 设置页面
2. 找到 "Pages" 选项
3. 在 "Source" 中选择 `main` 分支
4. 点击 "Save"
5. 稍等几分钟，您的网站将可以通过以下地址访问：
   `https://xinmengliu0-sketch.github.io/neon-vision/`

## 项目结构

```
neon-vision/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── main.js         # 主程序
│   ├── hardware.js     # 硬件检测
│   ├── benchmark.js    # 性能测试
│   ├── storage.js      # 数据存储
│   └── charts.js       # 图表展示
└── README.md           # 项目说明
```

## 使用说明

1. 打开网站后，会自动检测您的硬件信息
2. 点击"开始完整测试"进行全面性能评估
3. 查看测试报告和优化建议
4. 测试结果会自动保存到本地存储

## 作者

刘新蒙

## 许可证

本项目仅供学习和实践使用。
