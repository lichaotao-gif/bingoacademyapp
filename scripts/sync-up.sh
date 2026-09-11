#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

message="${1:-}"
if [[ -z "${message//[[:space:]]/}" ]]; then
  echo '用法：npm run sync:up -- "本次修改说明"' >&2
  exit 1
fi

origin_url="$(git remote get-url origin)"
if [[ "$origin_url" == https://github.com/* ]]; then
  repository="${origin_url#https://github.com/}"
  repository="${repository%.git}"
  origin_url="git@github.com:${repository}.git"
  git remote set-url origin "$origin_url"
  echo "已将 origin 转换为 SSH：$origin_url"
fi

if [[ "$origin_url" != git@github.com:*.git ]]; then
  echo "同步已停止：origin 必须是 git@github.com:用户名/仓库名.git 格式，当前为 $origin_url" >&2
  exit 1
fi

branch="$(git branch --show-current)"
if [[ -z "$branch" ]]; then
  echo "同步已停止：当前处于 detached HEAD 状态。" >&2
  exit 1
fi

git add -A
git diff --cached --check

if git diff --cached --quiet; then
  echo "没有需要提交的修改。"
  exit 0
fi

git commit -m "$message"

if ! git pull --rebase origin "$branch"; then
  echo "同步已停止：rebase 发生冲突或拉取失败。未覆盖任何修改，请手动处理后再继续。" >&2
  exit 1
fi

git push origin "$branch"
echo "提交并推送完成：$(git rev-parse --short HEAD)"
