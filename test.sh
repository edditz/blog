#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$SCRIPT_DIR/blog-admin/packages/server"
pnpm exec vitest run "$@"
