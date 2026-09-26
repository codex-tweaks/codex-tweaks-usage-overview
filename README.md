# 用量概览

在 Codex 一级侧栏顶部显示通用限额，悬停查看完整用量与重置卡，并可点击进入用量设置。

## 功能

- 在 ChatGPT 与 Codex 两种模式的侧栏顶部持续展示同一份主要用量信息
- 悬停查看完整限额和重置时间
- 液态玻璃悬浮卡，支持明暗主题与降低透明度偏好
- 记录并显示本地重置额度信息

## 安装

下载或克隆本仓库后，将本目录作为本地功能包导入 Codex Tweaks。首次安装后需完成编译并手动启用。

## 权限与安全

- Renderer：读取 Codex 当前用量状态、修改侧栏，并在浏览器本地存储中保存重置额度信息
- Node：未使用
- 网络：不直接发起网络请求

## 兼容性

- Codex Tweaks API：v3
- 已测试平台：macOS
- 已知限制：依赖 Codex 用量状态和一级侧栏的内部结构
- 玻璃折射依赖 Chromium 的滤镜支持；开启降低透明度或高对比度模式时使用实色背景

## 开发

使用 `mise run install` 安装锁定的依赖，`mise run check` 检查脚本语法和补丁格式。修改源码后，在 Codex Tweaks 中重新编译，并验证侧栏、悬停卡、明暗主题、设置导航以及停用清理。

液态玻璃使用 [liquid-glass-react](https://github.com/rdev/liquid-glass-react)。React 和玻璃组件随包本地编译，运行时不从 CDN 加载。

## 致谢

感谢 [LINUX DO](https://linux.do/) 社区为开发者提供交流与分享的空间。

## 许可证

本项目使用 [MIT 许可证](LICENSE)。
