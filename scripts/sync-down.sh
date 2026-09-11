#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "同步已停止：当前项目存在未提交修改。请先提交或妥善处理这些修改。" >&2
  git status --short >&2
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

echo "正在通过 SSH 同步 origin/$branch..."
git pull --ff-only origin "$branch"

needs_install=0
if [[ ! -d node_modules ]]; then
  needs_install=1
elif ! npm ls --depth=0 >/dev/null 2>&1; then
  needs_install=1
elif [[ -f package-lock.json && package-lock.json -nt node_modules/.package-lock.json ]]; then
  needs_install=1
fi

if (( needs_install )); then
  echo "正在安装项目依赖..."
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi
else
  echo "依赖检查通过，无需重新安装。"
fi

echo "同步完成：$branch 已是最新状态。"
