# Deployment

## Platform

Aliyun OSS (Object Storage Service) with static website hosting.

## CI/CD

GitHub Actions workflow: `.github/workflows/deploy.yml`

### Triggers

- Push to `main` branch
- Manual trigger via `workflow_dispatch`

### Build Steps

1. Checkout code
2. Setup Node.js 22
3. `npm install`
4. `npm run build` (generates `dist/`)
5. Upload `dist/` to OSS bucket

### Required Secrets

| Secret | Purpose |
|--------|---------|
| `OSS_ACCESS_KEY_ID` | Aliyun access key |
| `OSS_ACCESS_KEY_SECRET` | Aliyun access secret |
| `OSS_ENDPOINT` | OSS region endpoint |
| `OSS_BUCKET` | Target bucket name |

## Manual Deploy

```bash
npm run build
# Upload dist/ to your hosting provider
```

## Post-Deploy Verification

- Check site loads at production URL
- Verify Cmd+K search works
- Confirm dark mode toggle works
- Test RSS feed at `/feed.xml`
- Check sitemap at `/sitemap-index.xml`
