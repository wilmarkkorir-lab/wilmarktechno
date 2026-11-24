#!/bin/sh
# Daily database backup (run from the project root, e.g. from cron). Keeps 14 days.
# Restore: gunzip -c backups/wilmark-DATE.sql.gz | docker compose exec -T db psql -U wilmark wilmark
set -e
mkdir -p backups
docker compose exec -T db pg_dump -U wilmark wilmark | gzip > "backups/wilmark-$(date +%F).sql.gz"
find backups -name 'wilmark-*.sql.gz' -mtime +14 -delete
