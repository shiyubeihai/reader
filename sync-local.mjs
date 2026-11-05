// 从 index.html 生成本地离线版 ~/Desktop/北海阅读器.html
// 去掉：内嵌字体（本地无 fonts/）、PWA 链接、SW 注册
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
let s = fs.readFileSync(path.join(root, "index.html"), "utf8");
const before = s.length;

// 1) 内嵌字体块
const a = s.indexOf("/* 内嵌字体");
const marker = "unicode-range:U+8D9F-FFEF;}\n";
const b = s.indexOf(marker, s.indexOf("round-3.woff2"));
if (a < 0 || b < 0) throw new Error("font block not found");
s = s.slice(0, a) + s.slice(b + marker.length);

// 2) SW 注册块
const c = s.indexOf("/* PWA：只在 http(s) 下注册");
const d = s.indexOf("\n</script>", c);
if (c < 0 || d < 0) throw new Error("service worker block not found");
s = s.slice(0, c) + s.slice(d + 1);

// 3) PWA 链接
[
  '<link rel="manifest" href="./manifest.json">\n',
  '<link rel="icon" href="./icons/icon-192.png" sizes="192x192">\n',
  '<link rel="apple-touch-icon" href="./icons/apple-touch-icon.png">\n'
].forEach((tag) => { s = s.split(tag).join(""); });

fs.writeFileSync(path.join(root, "..", "北冥有鱼.html"), s);
console.log("local copy:", before, "->", s.length, "chars");
