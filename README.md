# 📸 我的拼图 - 个人作品集网站

一个创意互动式个人作品集网站，通过拼图游戏的形式展示我的技能、实习经历和作品。

## ✨ 项目特色

- **拼图交互** 🧩：6张拼图代表不同的技能和经历
- **黑白→彩色** 🎨：阅读完内容后拼图自动变色
- **拖拽功能** ✋：可以随意拖拽拼图
- **响应式设计** 📱：完美支持PC和手机
- **动画效果** ✨：Framer Motion提供流畅的交互动画
- **数字手账风** 📔：年轻人最爱的视觉拼贴风格

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **动画库**：Framer Motion
- **状态管理**：Zustand
- **样式**：Tailwind CSS
- **部署**：Vercel

## 📦 项目结构

```
portfolio-interactive/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── PuzzleBoard.tsx   # 拼图棋盘
│   │   ├── PuzzlePiece.tsx   # 单个拼图
│   │   └── StartButton.tsx   # 开始按钮
│   ├── pages/               # 页面组件
│   │   ├── HomePage.tsx      # 首页
│   │   └── DetailPage.tsx    # 详情页
│   ├── store/               # 状态管理
│   │   └── puzzleStore.ts    # Zustand store
│   ├── types/               # TypeScript类型
│   │   └── index.ts
│   ├── App.tsx              # 主应用
│   ├── main.tsx             # 入口
│   └── index.css            # 全局样式
├── index.html               # HTML模板
├── package.json             # 项目依赖
├── vite.config.ts          # Vite配置
├── tsconfig.json           # TypeScript配置
├── tailwind.config.js      # Tailwind配置
└── postcss.config.js       # PostCSS配置
```

## 🚀 快速开始

### 1. 安装依赖
```bash
cd portfolio-interactive
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:5173`

### 3. 构建生产版本
```bash
npm run build
```

## 📝 核心功能

### 1. 首页
- 欢迎页面展示
- 点击"开始了解我"按钮进入拼图棋盘
- 混乱排列的6张黑白拼图

### 2. 拼图交互
- **点击拼图** → 进入详情页查看内容
- **拖拽拼图** → 可以随意移动
- **Hover效果** → 拼图高亮、搅动动画
- **阅读完成** → 拼图自动变彩色

### 3. 详情页
- 展示文字介绍、图片和视频
- 视频支持hover自动播放
- 点击关闭按钮返回首页

### 4. 完成状态
- 所有拼图阅读完后显示个人留言
- 显示联系方式
- 访客可以留言

## 🎨 设计色系

- 粉色：`#FF69B4`（高饱和）
- 青绿色：`#20B2AA`
- 天蓝色：`#87CEEB`
- 黄色：`#FFD700`
- 珊瑚橙：`#FF7F50`
- 薰衣草紫：`#DDA0DD`
- 奶油白：`#FFFDD0`

## 📚 6张拼图说明

1. **摄影** 📸 - 我的摄影作品和经历
2. **综艺实习** 🎬 - 综艺节目实习经历
3. **纪录片实习** 🎥 - 纪录片制作经验
4. **互联网品牌部实习** 💼 - 品牌运营经验
5. **AI漫剧实习** 🤖 - AI相关项目经验
6. **运动** ⚽ - 我的运动爱好

## 🔄 未来计划

- [ ] 集成后端数据库（Supabase）
- [ ] 实现访客留言功能
- [ ] 添加用户自定义内容管理
- [ ] 部署到Vercel
- [ ] SEO优化
- [ ] PWA支持

## 📧 联系方式

- 邮箱：[待补充]
- 微信：[待补充]

## 📄 许可证

MIT License

---

**创建日期**：2026年8月
**最后更新**：2026年8月
