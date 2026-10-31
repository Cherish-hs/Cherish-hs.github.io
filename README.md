# Cherish's Tech Notes

一个记录技术实践、学习过程与问题解决经验的个人博客。

**博客地址：** https://cherish-hs.github.io

## 技术方向

- **ROS 2 与机器人开发：** 通信机制、导航、机器人仿真
- **Linux 与 Docker：** 开发环境、容器管理、工具配置
- **Python 与计算机视觉：** 编程实践、OpenCV、图像识别
- **具身智能：** 持续学习与项目实践

## 博客技术栈

- Jekyll
- Markdown / Kramdown
- GitHub Pages
- GitHub Actions

## 项目结构

```text
Cherish-hs.github.io/
├── _posts/                  # 博客文章，也存放算法题解
│   └── 日期-文章名称.md
├── _projects/               # 项目的图文介绍内容
│   └── qr-code-recognition.md
├── _layouts/                # 页面模板，决定内容如何排版
│   ├── home.html            # 首页布局：横幅、个人信息、技术标签等
│   ├── showcase.html        # 首页、项目页和目录页共用的外层框架
│   ├── project.html         # 项目详情页模板
│   ├── post.html            # 博客文章和算法题解的阅读模板
│   ├── page.html            # 普通页面模板，如“关于我”
│   └── default.html         # 文章和普通页面共用的外层框架
├── _includes/               # 多个页面复用的组件
│   ├── site-nav.html        # 顶部导航栏和搜索框
│   ├── site-footer.html     # 页脚
│   ├── project-card.html    # 项目展示卡片
│   ├── article-list.html    # 文章列表
│   └── algorithm-list.html  # 算法题解列表与空状态
├── assets/                  # 样式、图片和交互脚本
│   ├── css/
│   │   ├── homepage.css     # 首页、项目页和目录页的样式
│   │   └── style.css        # 文章页和普通页面的样式
│   ├── js/
│   │   ├── homepage.js      # 搜索、文章筛选和主题切换等
│   │   └── main.js          # 文章目录、阅读进度和返回顶部等
│   └── images/
│       ├── home/            # 首页头像、横幅等图片
│       ├── opencv/          # OpenCV 文章和项目图片
│       └── docker/          # Docker 文章图片
├── projects/index.html      # “项目作品”列表页入口
├── algorithms/index.html    # “算法题解”列表页入口
├── archives/index.html      # “文章归档”列表页入口
├── index.html               # 网站首页入口，使用 home 模板
├── about.md                 # “关于我”的文字内容
├── _config.yml              # 网站名称、作者、网址和构建配置
├── Gemfile                  # 本地运行 Jekyll 需要的依赖
├── README.md                # 项目说明与维护指南（本文件）
├── .github/workflows/
│   └── jekyll-gh-pages.yml  # 推送到 main/master 后自动构建和部署
├── .gitignore               # 指定哪些文件不提交到 Git
└── .git/                    # Git 版本记录，一般不用手动修改
```

上面列出主要源码文件。`.jekyll-cache/` 等构建缓存不需要手动维护；本地构建生成的
`_site/` 是网页输出目录，应修改源码后重新构建，而不是直接编辑输出文件。

## 日常修改指南

| 想做什么 | 修改位置 |
| --- | --- |
| 写博客文章 | 在 `_posts/` 新建 Markdown 文件 |
| 上传算法题解 | 在 `_posts/` 新建文章，元信息添加 `categories: [算法题解]` |
| 添加或修改项目介绍 | `_projects/` 中的 Markdown 文件 |
| 修改个人简介、首页技术标签 | `_layouts/home.html` |
| 修改顶部导航 | `_includes/site-nav.html` |
| 修改页脚 | `_includes/site-footer.html` |
| 修改首页、项目页的颜色、字体、间距和卡片大小 | `assets/css/homepage.css` |
| 修改文章阅读页样式 | `assets/css/style.css` |
| 添加图片 | `assets/images/` 对应分类文件夹，也可以新建分类文件夹 |
| 修改“关于我” | `about.md` |
| 修改网站名称、作者和网址 | `_config.yml` |

内容、模板和样式各有分工。例如，项目内容写在 `_projects/`，排版由
`_layouts/project.html` 决定，颜色和间距由 `assets/css/homepage.css` 控制。
日常更新文章或项目时，通常只需要修改 Markdown 内容文件。

### 修改首页技术标签

在 `_layouts/home.html` 中搜索 `ch-tagcloud`。每个 `<span>…</span>` 对应一个标签，
可以修改文字、添加或删除：

```html
<div class="ch-tagcloud">
  <span>Python</span>
  <span>ROS 2</span>
  <span>OpenCV</span>
  <span>深度学习</span>
</div>
```

这里是首页展示标签，与文章元信息中的 `tags` 分开设置。

## 本地预览

在已配置 Ruby 和 Bundler 的环境中运行：

```bash
bundle install
bundle exec jekyll serve
```

然后访问 `http://127.0.0.1:4000`。

## 许可与转载

文章内容的转载与引用，请遵守各文章中注明的许可和引用要求。

## 发布项目介绍

每个项目在 `_projects/` 中对应一篇 Markdown 文件，首页和项目列表会自动读取。
项目封面、标题及「了解项目」按钮均进入站内介绍页，仓库入口放在介绍页中。

```yaml
---
title: 项目名称
description: 一句话介绍项目
order: 2
cover: /assets/images/projects/example.png
cover_alt: 项目图片说明
repo_url: https://github.com/Cherish-hs/你的仓库
tags: [Python, OpenCV]
---
```

在元信息下方写项目介绍、功能说明及图片。文件名如 `example.md`，页面地址即
`/projects/example/`。可以参考现有的 `_projects/qr-code-recognition.md`。

## 发布算法题解

题解与普通博客文章一样放在 `_posts/`，并添加分类 `算法题解`：

```yaml
---
layout: post
title: 两数之和：哈希表解法
date: 2026-10-31 12:00:00 +0800
categories: [算法题解]
tags: [哈希表, 数组]
description: 一次遍历找到目标数对，并分析时间与空间复杂度。
---
```

文件名遵循 `YYYY-MM-DD-题目名称.md`。发布后会自动进入首页题解区和
`/algorithms/` 目录，点击进入文章的独立网址。没有题解时显示空状态。
