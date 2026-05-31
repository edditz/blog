# Deployment

## Platform

Aliyun ECS with Nginx serving static files.

## Deploy

```bash
bash scripts/deploy.sh
```

The script builds the site and rsyncs `dist/` to the remote server.

### What it does

1. `npm run build` — generates `dist/`
2. `rsync -avz --delete` — syncs `dist/` to ECS via SSH

### Requirements

- SSH key at `~/.ssh/aliyun.pem`
- Remote server configured in `scripts/deploy.sh`

## Post-Deploy Verification

- Check site loads at production URL
- Verify Cmd+K search works
- Confirm dark mode toggle works
- Test RSS feed at `/feed.xml`
- Check sitemap at `/sitemap-index.xml`
