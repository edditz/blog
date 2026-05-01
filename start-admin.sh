#!/bin/bash

# 启动博客后台管理平台
# 使用方式: ./start-admin.sh

set -e

ADMIN_DIR="$(cd "$(dirname "$0")" && pwd)/blog-admin"
PORTS=(3001 5173)

# 清理占用指定端口的进程
kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "  停止端口 $port 上的进程: $pids"
    echo "$pids" | xargs kill -9 2>/dev/null || true
  fi
}

# 清理所有相关端口
cleanup() {
  echo ""
  echo "正在清理后台管理平台进程..."
  for port in "${PORTS[@]}"; do
    kill_port "$port"
  done
  echo "清理完成。"
}

# 仅捕获 EXIT，让 pnpm 自行处理 SIGINT，退出后再兜底清理残留
trap cleanup EXIT

# 启动前先清理可能残留的进程
echo "检查并清理残留进程..."
for port in "${PORTS[@]}"; do
  kill_port "$port"
done

echo ""
echo "========================================="
echo "  博客后台管理平台"
echo "========================================="
echo "  前端:  http://localhost:5173"
echo "  后端:  http://localhost:3001"
echo "  按 Ctrl+C 停止所有服务"
echo "========================================="
echo ""

cd "$ADMIN_DIR"

# 启动前端和后端
pnpm dev
