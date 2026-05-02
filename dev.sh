#!/bin/bash

# 启动博客 + 后台管理平台
# 使用方式: ./dev.sh

set -e

ADMIN_DIR="$(cd "$(dirname "$0")" && pwd)/blog-admin"
PORTS=(3001 5173 4321)

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
  echo "正在清理进程..."
  # 停止后台任务
  jobs -p | xargs kill 2>/dev/null || true
  for port in "${PORTS[@]}"; do
    kill_port "$port"
  done
  echo "清理完成。"
}

trap cleanup EXIT

# 启动前先清理可能残留的进程
echo "检查并清理残留进程..."
for port in "${PORTS[@]}"; do
  kill_port "$port"
done

echo ""
echo "========================================="
echo "  博客 + 后台管理平台"
echo "========================================="
echo "  博客:  http://localhost:4321"
echo "  前端:  http://localhost:5173"
echo "  后端:  http://localhost:3001"
echo "  按 Ctrl+C 停止所有服务"
echo "========================================="
echo ""

# 启动博客
pnpm dev &

# 启动后台管理平台
cd "$ADMIN_DIR"
pnpm dev &

# 等待所有子进程
wait
