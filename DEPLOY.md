# UniFlex Store — VPS Production Deploy Runbook

> **Target stack:** Ubuntu 22.04 LTS · Node 20 LTS · PM2 · Nginx · Certbot (Let's Encrypt)  
> **Domain:** uniflexstore.com · **App port:** 3000

---

## 0. Prerequisites

| Requirement | Notes |
|---|---|
| VPS with 2 vCPU / 4 GB RAM minimum | DigitalOcean Droplet, Hetzner CX21, or equivalent |
| Managed Postgres (Neon, Supabase, RDS) | Never run Postgres on the same VPS — connection pooling + managed backups |
| Domain DNS pointing to VPS IP | A record for `uniflexstore.com` and `www.uniflexstore.com` |
| Stripe account in live mode | Separate from test keys |
| Resend account with domain verified | SPF + DKIM for transactional email deliverability |
| Cloudinary account | For product/brand image uploads |
| Sentry project (optional) | See §8 |

---

## 1. Initial Server Setup

```bash
# As root — create deploy user
adduser deploy
usermod -aG sudo deploy
# Copy SSH key for the deploy user
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy/
```

```bash
# Switch to deploy user for all subsequent steps
su - deploy
```

### Install Node 20 via nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v   # must print v20.x.x
```

### Install PM2 and pnpm/npm globally

```bash
npm install -g pm2
```

### Install Nginx

```bash
sudo apt update && sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 2. Clone and Build

```bash
cd /home/deploy
git clone https://github.com/your-org/uniflexstore.com.git app
cd app
```

### Create `.env.production`

```bash
cat > .env.production << 'EOF'
# ─── Database ────────────────────────────────────────────────
DATABASE_URL="postgresql://user:pass@host:5432/uniflexdb?sslmode=require"

# ─── Auth.js ─────────────────────────────────────────────────
AUTH_SECRET="<run: openssl rand -base64 32>"
AUTH_URL="https://uniflexstore.com"

# OAuth providers (production credentials)
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."

# ─── Stripe ──────────────────────────────────────────────────
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."       # from Stripe dashboard → Webhooks

# ─── Resend ──────────────────────────────────────────────────
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="orders@uniflexstore.com"

# ─── Cloudinary ──────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."

# ─── AI (OpenAI) ─────────────────────────────────────────────
OPENAI_API_KEY="sk-..."

# ─── App ─────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="https://uniflexstore.com"
NODE_ENV="production"

# ─── Sentry (optional) ───────────────────────────────────────
# SENTRY_DSN="https://xxx@sentry.io/xxx"
# NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
# SENTRY_AUTH_TOKEN="..."   # for source map upload
EOF
```

> **Security:** `chmod 600 .env.production` — never commit this file.

### Install dependencies and run Prisma migrations

```bash
npm ci --omit=dev

# sharp is required for Next.js image optimization (AVIF/WebP) on self-hosted deployments
npm install sharp

# Apply database migrations (safe for production — does not reset data)
npx prisma migrate deploy

# Generate Prisma client (already done by postinstall, but explicit here)
npx prisma generate
```

### Build

```bash
npm run build
```

> Build should complete without TypeScript errors. The output is `.next/`.

---

## 3. PM2 Process Manager

### Create ecosystem config

```bash
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [
    {
      name: 'uniflex',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/deploy/app',
      instances: 'max',          // cluster mode — one worker per vCPU
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '512M',
      error_file: '/home/deploy/logs/uniflex-err.log',
      out_file:   '/home/deploy/logs/uniflex-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
EOF

mkdir -p /home/deploy/logs
```

### Start with PM2

```bash
pm2 start ecosystem.config.cjs --env production
pm2 save                  # persist across reboots
pm2 startup               # follow the printed sudo command
```

```bash
# Verify
pm2 status
pm2 logs uniflex --lines 50
```

---

## 4. Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/uniflexstore.com
```

```nginx
# /etc/nginx/sites-available/uniflexstore.com

# Redirect HTTP → HTTPS and www → apex
server {
    listen 80;
    server_name uniflexstore.com www.uniflexstore.com;
    return 301 https://uniflexstore.com$request_uri;
}

# www → apex (HTTPS)
server {
    listen 443 ssl http2;
    server_name www.uniflexstore.com;
    ssl_certificate     /etc/letsencrypt/live/uniflexstore.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/uniflexstore.com/privkey.pem;
    return 301 https://uniflexstore.com$request_uri;
}

# Main site
server {
    listen 443 ssl http2;
    server_name uniflexstore.com;

    ssl_certificate     /etc/letsencrypt/live/uniflexstore.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/uniflexstore.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers (complement what Next.js sends)
    add_header X-Robots-Tag "index, follow" always;
    add_header Expect-CT "max-age=86400, enforce" always;

    # Stripe webhook — preserve raw body (already handled, but just in case)
    location /api/stripe/webhook {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        # Do NOT buffer — important for Stripe signature verification
        proxy_request_buffering off;
    }

    # Next.js static assets — aggressive caching
    location /_next/static/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_cache_valid  200 1y;
        add_header         Cache-Control "public, max-age=31536000, immutable";
    }

    # All other requests
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 30s;
    }

    # Limit request size (protect against large payload attacks)
    client_max_body_size 10M;

    # Gzip (Next.js already compresses but Nginx catches edge cases)
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/uniflexstore.com /etc/nginx/sites-enabled/
sudo nginx -t            # must print "syntax is ok"
sudo systemctl reload nginx
```

---

## 5. SSL Certificate (Certbot / Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d uniflexstore.com -d www.uniflexstore.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

Certbot installs a systemd timer that auto-renews before expiry. Verify:

```bash
sudo systemctl status certbot.timer
```

---

## 6. Stripe Webhook

1. Go to **Stripe Dashboard → Developers → Webhooks → Add endpoint**
2. URL: `https://uniflexstore.com/api/stripe/webhook`
3. Events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the **Signing secret** → set as `STRIPE_WEBHOOK_SECRET` in `.env.production`
5. Restart PM2: `pm2 restart uniflex`

---

## 7. Deployment Workflow (Zero-Downtime Updates)

```bash
cd /home/deploy/app

# Pull latest code
git pull origin main

# Install any new deps
npm ci --omit=dev

# Run pending migrations (safe, only applies new ones)
npx prisma migrate deploy

# Rebuild
npm run build

# Reload with zero downtime (PM2 cluster mode)
pm2 reload uniflex --update-env
```

For automated CI/CD (GitHub Actions):

```yaml
# .github/workflows/deploy.yml  (example)
- name: Deploy
  run: |
    ssh deploy@your-vps 'cd /home/deploy/app && git pull && npm ci --omit=dev && npx prisma migrate deploy && npm run build && pm2 reload uniflex --update-env'
```

---

## 8. Sentry Error Monitoring (Optional)

```bash
# Install the package
npm install @sentry/nextjs

# Create a Sentry project at sentry.io
# Add to .env.production:
#   NEXT_PUBLIC_SENTRY_DSN="https://xxx@o0.ingest.sentry.io/xxx"
#   SENTRY_DSN="..."
#   SENTRY_AUTH_TOKEN="..."    # for source map upload during build

# Uncomment the withSentryConfig wrapper in next.config.ts
# Rebuild and reload
npm run build && pm2 reload uniflex
```

---

## 9. Environment Variable Checklist

Run before every deploy:

```bash
node -e "
const required = [
  'DATABASE_URL','AUTH_SECRET','AUTH_URL',
  'STRIPE_SECRET_KEY','NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY','STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY','NEXT_PUBLIC_APP_URL',
  'CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET',
  'OPENAI_API_KEY'
]
const missing = required.filter(k => !process.env[k])
if (missing.length) { console.error('MISSING:', missing.join(', ')); process.exit(1) }
console.log('All env vars present')
" 
```

---

## 10. Post-Deploy Smoke Tests

```bash
# Run Playwright e2e against production
PLAYWRIGHT_BASE_URL=https://uniflexstore.com \
TEST_USER_EMAIL=alice@example.com \
TEST_USER_PASSWORD=Test@1234 \
TEST_PRODUCT_SLUG=velocity-runner-v2 \
npx playwright test e2e/checkout.spec.ts --project=chromium
```

Manual checklist:
- [ ] Homepage loads (< 2s)
- [ ] Can add product to cart
- [ ] Checkout flow completes with Stripe test card `4242 4242 4242 4242`
- [ ] Order confirmation email arrives
- [ ] Admin panel accessible at `/admin`
- [ ] `https://uniflexstore.com/sitemap.xml` returns XML
- [ ] `https://uniflexstore.com/robots.txt` disallows `/admin/`
- [ ] `curl -I https://uniflexstore.com` shows `strict-transport-security` header
- [ ] SSL Labs score A+ at `ssllabs.com/ssltest/`

---

## 11. Monitoring and Maintenance

| Task | Frequency |
|---|---|
| `pm2 logs uniflex --lines 100` | Daily — watch for errors |
| `pm2 monit` | Real-time CPU/memory dashboard |
| Check Stripe webhook delivery | Weekly |
| Check Resend email delivery rate | Weekly |
| `sudo certbot renew --dry-run` | Monthly (auto, but verify) |
| `npm audit --production` | Monthly |
| Rotate `AUTH_SECRET` if compromised | As needed |

---

## 12. Rollback

If a deploy breaks production:

```bash
cd /home/deploy/app
git log --oneline -10           # find last good commit
git checkout <good-commit-sha>
npm ci --omit=dev && npm run build
pm2 reload uniflex --update-env
```

For DB migrations (Prisma does not support automatic rollback):
- Restore from your managed Postgres provider's point-in-time backup
- Write and apply a compensating migration manually

---

*Runbook version: Phase 8 — June 2026*
