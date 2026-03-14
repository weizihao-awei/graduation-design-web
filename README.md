# 毕业设计 Web - 个人博客系统

## 项目介绍

这是一个基于 Vue 3 + Vite 构建的个人博客系统前端项目，实现了完整的博客功能，包括文章发布、浏览、评论、标签分类管理等核心功能。

## 技术栈

### 核心框架

- **Vue 3.5** - 渐进式 JavaScript 框架
- **Vite 7** - 下一代前端构建工具
- **Vue Router 4** - Vue.js 官方路由管理器
- **Pinia 3** - Vue 3 状态管理库

### UI 框架

- **Element Plus 2** - 基于 Vue 3 的组件库
- **Element Plus Icons** - Element Plus 图标库

### 工具库

- **Axios** - HTTP 客户端
- **Marked** - Markdown 解析器
- **Highlight.js** - 代码高亮库

## 功能特性

### 用户功能

- 用户注册、登录、密码重置
- 个人信息管理
- 文章发布与编辑
- 文章浏览与搜索
- 文章评论互动
- 点赞收藏功能

### 文章管理

- 文章列表展示（瀑布流布局）
- 文章详情查看
- 文章分类筛选
- 标签多选筛选
- 文章排序（最新/最早/最新编辑/最早编辑）
- 搜索功能

### 内容展示

- 首页推荐文章
- 热门文章排行
- 最新文章列表
- 热门标签云
- 文章分类导航

### 管理功能

- 文章发布与编辑
- Markdown 编辑器
- 代码高亮显示
- 标签管理
- 分类管理

## 安装教程

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装步骤

1. 克隆项目到本地

```bash
git clone <repository-url>
cd graduation-design-web
```

2. 安装依赖

```bash
npm install
```

3. 配置后端接口地址

编辑 `src/utils/request.js` 文件，修改 `baseURL` 为你的后端服务地址：

```javascript
const service = axios.create({
  baseURL: "http://localhost:8081/api",
  timeout: 10000,
});
```

4. 启动开发服务器

```bash
npm run dev
```

5. 访问应用
   打开浏览器访问 `http://localhost:5173`

## 使用说明

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
graduation-design-web/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口
│   │   ├── article.js     # 文章相关接口
│   │   ├── auth.js        # 认证相关接口
│   │   ├── category.js    # 分类相关接口
│   │   ├── comment.js     # 评论相关接口
│   │   ├── statistics.js  # 统计相关接口
│   │   ├── tag.js        # 标签相关接口
│   │   └── user.js       # 用户相关接口
│   ├── components/        # 公共组件
│   │   ├── ArticleCard.vue           # 文章卡片组件
│   │   ├── ArticlePublishDialog.vue  # 文章发布对话框
│   │   ├── CommentItem.vue          # 评论项组件
│   │   ├── Footer.vue              # 页脚组件
│   │   ├── Header.vue              # 头部导航组件
│   │   └── Pagination.vue          # 分页组件
│   ├── router/            # 路由配置
│   │   └── index.js       # 路由定义
│   ├── store/             # 状态管理
│   │   └── index.js       # Pinia store
│   ├── utils/             # 工具函数
│   │   ├── index.js       # 通用工具
│   │   └── request.js     # Axios 封装
│   ├── views/             # 页面组件
│   │   ├── ArticleDetail.vue        # 文章详情页
│   │   ├── ArticleQuery.vue        # 文章查询页
│   │   ├── Articles.vue            # 文章列表页
│   │   ├── Home.vue               # 首页
│   │   ├── HotArticles.vue         # 热门文章页
│   │   ├── LatestArticles.vue      # 最新文章页
│   │   ├── RecommendArticles.vue   # 推荐文章页
│   │   ├── Login.vue              # 登录页
│   │   ├── Register.vue           # 注册页
│   │   ├── ResetPassword.vue       # 重置密码页
│   │   ├── Profile.vue            # 个人中心页
│   │   ├── Tags.vue               # 标签页
│   │   └── Write.vue             # 写文章页
│   ├── App.vue            # 根组件
│   ├── main.js            # 入口文件
│   └── style.css          # 全局样式
├── index.html             # HTML 模板
├── vite.config.js         # Vite 配置
└── package.json           # 项目配置
```

## 主要功能模块

### 文章模块

- 支持文章的增删改查
- 支持 Markdown 格式编辑
- 支持代码高亮显示
- 支持图片上传
- 支持标签和分类管理
- 支持多标签筛选
- 支持多种排序方式

### 用户模块

- 用户注册、登录、登出
- 密码重置功能
- 个人信息管理
- 用户权限控制

### 评论模块

- 文章评论功能
- 评论回复功能
- 评论点赞功能

### 统计模块

- 文章浏览量统计
- 点赞量统计
- 评论量统计

## API 文档

详细的 API 接口文档请参考项目中的以下文件：

- `api.md` - 通用 API 文档
- `认证api.md` - 认证相关 API
- `sql.md` - 数据库结构文档

## 开发指南

### 代码规范

- 使用 Vue 3 Composition API 和 `<script setup>` 语法
- 组件命名使用 PascalCase
- 文件命名使用 PascalCase（组件）或 kebab-case（页面）
- 使用 ESLint 进行代码检查

### 状态管理

使用 Pinia 进行全局状态管理，主要包括：

- 用户登录状态
- 用户信息
- 主题设置

### 路由管理

使用 Vue Router 4 进行路由管理，支持：

- 动态路由
- 路由守卫
- 懒加载

### 样式管理

- 使用 CSS 变量进行主题管理
- 响应式设计，支持移动端适配
- 使用 scoped CSS 避免样式污染

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件

## 更新日志

### v1.0.0 (2024-03-14)

- 初始版本发布
- 实现基础博客功能
- 支持文章发布、浏览、评论
- 支持用户认证和权限管理
- 支持标签和分类管理
