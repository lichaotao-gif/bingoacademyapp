#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

bash scripts/sync-down.sh

echo "正在启动本地开发服务并打开浏览器..."
exec npm run dev:open
