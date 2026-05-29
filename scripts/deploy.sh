#!/bin/bash
set -euo pipefail

# Config
REMOTE_HOST="120.26.254.107"
REMOTE_USER="root"
REMOTE_DIR="/var/www/blog"
SSH_KEY="$HOME/.ssh/aliyun.pem"
SSH_PORT=22

echo "Building blog..."
npm run build

echo "Deploying to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}..."
rsync -avz --delete \
  -e "ssh -i ${SSH_KEY} -p ${SSH_PORT}" \
  dist/ \
  ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

echo "Deploy complete!"
