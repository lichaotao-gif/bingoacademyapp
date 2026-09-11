# 多电脑一键同步

## 日常使用顺序

1. 上一台电脑完成修改后，先执行：

   ```bash
   npm run sync:up -- "本次修改说明"
   ```

2. 确认提交和推送成功后，再到下一台电脑执行：

   ```bash
   npm run work:start
   ```

`work:start` 会先确认工作区干净，通过 SSH 快进拉取当前分支，按需安装依赖，然后启动 Vite 开发服务器并打开本地预览。

## 旧电脑首次使用

先确认工作区没有未提交修改，再执行：

```bash
git pull --ff-only origin main
```

之后即可使用上面的 npm 命令。

## 安全约束

- `origin` 必须使用 `git@github.com:用户名/仓库名.git` 格式；脚本会自动把 GitHub HTTPS 地址转换为 SSH 地址。
- `sync:down` 在发现未提交修改时会停止，不会覆盖本地文件。
- `sync:up` 依次执行暂存、差异检查、中文说明提交、rebase 拉取和推送；发生冲突时会停止，保留现场供手动处理。
- 开发服务器保持在启动它的终端前台运行。停止时只在该终端按 `Ctrl+C`，不要使用 `killall` 或 `pkill`。
