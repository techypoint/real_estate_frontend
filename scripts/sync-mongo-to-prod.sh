#!/usr/bin/env bash
#
# Copy the admin-managed collections from local Mongo to prod Mongo.
#
#   projects, projectcontents, admin_audit, areas, builders
#
# Local Mongo: 127.0.0.1:27017. Prod Mongo: 127.0.0.1:27018 (the prod port
# forwarded to this machine, e.g. `ssh -L 27018:127.0.0.1:27017 <prod-host>`).
#
# Each collection on prod is REPLACED by the local copy (mongorestore --drop).
# Before that, the same collections are dumped from prod as a backup, so a bad
# sync can be undone with:
#   mongorestore --host 127.0.0.1 --port 27018 --drop --dir <backup dir>
#
# No credentials are passed — both instances are expected to accept
# connections without a login. Optional: DB (default real_estate_uprera),
# BACKUP_ROOT (default ./mongo-sync).
#
# Usage: scripts/sync-mongo-to-prod.sh [--yes]
#   --yes  skip the confirmation prompt

set -euo pipefail

DB="${DB:-real_estate_uprera}"
COLLECTIONS=(projects projectcontents admin_audit areas builders)
LOCAL_HOST=127.0.0.1 LOCAL_PORT=27017
PROD_HOST=127.0.0.1 PROD_PORT=27018
BACKUP_ROOT="${BACKUP_ROOT:-./mongo-sync}"

ASSUME_YES=false
[[ "${1:-}" == "--yes" ]] && ASSUME_YES=true

for tool in mongodump mongorestore; do
  command -v "$tool" >/dev/null || { echo "error: $tool not found (install mongodb-database-tools)" >&2; exit 1; }
done

LOCAL_ARGS=(--host "$LOCAL_HOST" --port "$LOCAL_PORT")
PROD_ARGS=(--host "$PROD_HOST" --port "$PROD_PORT")

STAMP="$(date +%Y%m%d-%H%M%S)"
LOCAL_DUMP="$BACKUP_ROOT/$STAMP/local"
PROD_BACKUP="$BACKUP_ROOT/$STAMP/prod-before"
mkdir -p "$LOCAL_DUMP" "$PROD_BACKUP"

echo "Database:    $DB"
echo "Collections: ${COLLECTIONS[*]}"
echo "From local   $LOCAL_HOST:$LOCAL_PORT  ->  prod $PROD_HOST:$PROD_PORT"
echo "Dumps in:    $BACKUP_ROOT/$STAMP"
echo

echo "==> Dumping from local"
for c in "${COLLECTIONS[@]}"; do
  mongodump "${LOCAL_ARGS[@]}" --db "$DB" --collection "$c" --out "$LOCAL_DUMP" --quiet
  echo "    $c"
done

echo "==> Backing up the same collections from prod"
for c in "${COLLECTIONS[@]}"; do
  mongodump "${PROD_ARGS[@]}" --db "$DB" --collection "$c" --out "$PROD_BACKUP" --quiet
  echo "    $c"
done

if ! $ASSUME_YES; then
  echo
  read -rp "Replace these ${#COLLECTIONS[@]} collections on PROD with the local copies? Type 'yes' to continue: " answer
  [[ "$answer" == "yes" ]] || { echo "Aborted. Nothing restored to prod."; exit 1; }
fi

echo "==> Restoring to prod (drop + restore each collection)"
INCLUDES=()
for c in "${COLLECTIONS[@]}"; do INCLUDES+=(--nsInclude "$DB.$c"); done
mongorestore "${PROD_ARGS[@]}" --drop "${INCLUDES[@]}" --dir "$LOCAL_DUMP"

echo
echo "Done. Prod backup taken before the restore: $PROD_BACKUP"
echo "To undo: mongorestore --host $PROD_HOST --port $PROD_PORT --drop --dir $PROD_BACKUP"
