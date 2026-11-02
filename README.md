# 北海阅读器 1.0

单文件网页阅读器，可装到手机主屏当 App 用（PWA）。整个应用只有 HTML + 几个图标，没有后端、没有外部字体、没有 CDN。

- **格式**：TXT（UTF-8 / UTF-16 / GBK 自动识别）、EPUB 2/3、HTML
- **排版**：横排 / 竖排（竖版 EPUB 自动识别），字号、行距、页边距可调
- **字形**：繁体 / 简体三态切换，内置约 700 字常用对照表
- **字体**：自动探测本机已装的中文字体，只列出真实可用的；也可上传本机字体文件
- **纸张**：宣纸 / 麻黄 / 白纸 / 道林 / 羊皮 / 木纹 / 大理石浅 / 大理石深，另有自定义背景图
- **书架**：最多 12 个，每个 60MB，可命名、改名、删除、跨架移动
- **导入导出**：TXT 可批量导入（一次 ≤10 本），EPUB 单本；单本导出 TXT / EPUB，整架打包 ZIP
- **阅读计时**：显示已读时长，每 30 分钟提醒休息

---

## 目录结构

```
reader/
├── index.html              应用本体（全部逻辑与样式）
├── manifest.json             PWA 清单
├── sw.js                   Service Worker（离线缓存）
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-512.png
│   └── apple-touch-icon.png
├── .nojekyll               让 GitHub Pages 原样发布，不做 Jekyll 处理
└── README.md
```

---

## 部署到 GitHub Pages

仓库已经叫 `reader`，把这个文件夹里的**全部文件**推到仓库根目录：

```bash
cd ~/Desktop/reader
git init
git add .
git commit -m "北海阅读器 1.0"
git branch -M main
git remote add origin https://github.com/<你的用户名>/reader.git
git push -u origin main
```

然后在仓库页面：**Settings → Pages → Build and deployment**
- Source 选 `Deploy from a branch`
- Branch 选 `main`，目录选 `/ (root)`，保存

等一两分钟，访问：

```
https://<你的用户名>.github.io/reader/
```

> 必须用 HTTPS 访问，`file://` 直接打开时不会注册 Service Worker（也不影响阅读）。

---

## 装到手机

**Android / Chrome**：打开上面的网址 → 右上角菜单 → 「安装应用」或「添加到主屏幕」。

**iPhone / Safari**：打开网址 → 底部分享按钮 → 「添加到主屏幕」。iOS 没有安装提示，必须手动加。

装好后从主屏图标启动，没有浏览器地址栏，和普通 App 一样。

---

## 更新版本

改完 `index.html` 后，**一定要同时改 `sw.js` 里的版本号**，否则手机还会用旧缓存：

```js
const VERSION = '1.0.1';   // 每次发版 +1
```

同时建议在 `manifest.webmanifest` 的 `name` 里同步改版本字样。推送后，用户第一次打开页面会先联网拿到新版，关掉再开即生效。

---

## 数据存在哪

书籍、书架、阅读进度都保存在**浏览器本地**（IndexedDB + localStorage），不上传任何服务器。

| 项 | 位置 | 说明 |
|---|---|---|
| 书籍与书架 | IndexedDB `qingread` | 换设备、清缓存都会丢 |
| 阅读设置 | localStorage `qingread.cfg.v1` | 字体、字号、背景、颜色 |
| 当前书架 | localStorage `qingread.shelf.v1` | |
| 上次阅读 | localStorage `qingread.last.v1` | 下次打开自动续读 |

**注意**：同一域名下换路径（例如以后改仓库名）数据不通用；不同浏览器、不同设备之间也不互通。

### 从桌面单文件版迁移过来

网页版和 `file://` 版的存储是隔离的，书不会自动带过来。搬法：

1. 桌面版里进「书架管理」→「导出本架为 ZIP」（混杂格式时只会打包 TXT）
2. 解压得到一堆 `.txt` / `.epub`
3. 在网页版里：TXT 可多选一次导入 10 本，EPUB 单本导入

阅读进度和书签不会跟着走，只迁书。

---

## 已知限制

- EPUB 里的图片会被丢弃，只保留文字与段落结构
- 繁简转换是常用字表，不是完整 OpenCC；一简对多繁处取常用项（干 → 幹、发 → 發）
- 竖排时分章按字数切块（单章上限 9000 字），目录里可能出现「第 X 章（2）」这样的续段
- 单个书架上限 60MB，按原始文件大小计
- 页面用到的 `DecompressionStream` 需要较新的浏览器（Chrome 103+ / Safari 16.4+），旧浏览器打不开 EPUB

---

## 许可

个人项目。代码可自行修改使用，转载注明出处。
