#!/bin/bash
set -euo pipefail

CONFIG_FILE="$(dirname "$0")/.deploy.env"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: $CONFIG_FILE not found"
  echo "Create it with:"
  echo "  REMOTE_HOST=your-host"
  echo "  REMOTE_USER=your-user"
  echo "  REMOTE_DIR=/path/to/dir"
  echo "  SSH_KEY=~/.ssh/your-key.pem"
  echo "  SSH_PORT=22"
  exit 1
fi

source "$CONFIG_FILE"

echo "Building blog..."
npm run build

echo "Deploying to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}..."
rsync -avz --delete \
  -e "ssh -i ${SSH_KEY} -p ${SSH_PORT}" \
  dist/ \
  ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

echo "Deploy complete!"
