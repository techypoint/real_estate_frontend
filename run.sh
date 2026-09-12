#!/usr/bin/env bash
# Run the frontend against a specific mode.
#
# Runs in the BACKGROUND by default (nohup'd, survives closing the
# terminal/SSH session). Tracked by PORT, not a captured pid: `next dev`/
# `next start` fork an internal `next-server` child and the launching
# process can exit once it hands off, so a `$!`-captured pid frequently goes
# stale (verified — the launcher pid disappeared while next-server kept
# serving under a different pid). Whatever is actually LISTENing on the port
# is the source of truth for stop/status.
#
#   ./run.sh                # local (default) — next dev, background
#   ./run.sh local
#   ./run.sh prod            # next build && next start, background
#   ./run.sh prod --fg       # foreground instead — blocks the terminal, Ctrl+C to stop
#   ./run.sh stop            # stop whatever's listening on the port
#   ./run.sh status          # is it running, and as what pid
set -euo pipefail
cd "$(dirname "$0")"

PORT=3000
LOG="frontend.log"
NEXT="./node_modules/.bin/next"

# pid(s) currently LISTENing on $PORT, one per line (empty if none). The
# trailing `|| true` matters: under `set -e`/pipefail, grep finding nothing —
# the normal "not running" case — would otherwise abort the whole script.
listening_pids() {
  ss -tlnp 2>/dev/null | grep ":${PORT} " | grep -oP 'pid=\K[0-9]+' | sort -u || true
}

case "${1:-}" in
  stop)
    pids="$(listening_pids)"
    if [[ -z "$pids" ]]; then
      echo "Not running."
    else
      echo "$pids" | xargs -r kill
      echo "Stopped (pid(s): $(echo "$pids" | tr '\n' ' '))."
    fi
    exit 0
    ;;
  status)
    pids="$(listening_pids)"
    if [[ -z "$pids" ]]; then
      echo "Not running."
    else
      echo "Running — pid(s): $(echo "$pids" | tr '\n' ' ')"
    fi
    exit 0
    ;;
esac

MODE="${1:-local}"
FOREGROUND=false
[[ "${2:-}" == "--fg" ]] && FOREGROUND=true

case "$MODE" in
  local|prod) ;;
  *) echo "Usage: $0 [local|prod] [--fg]   |   $0 stop   |   $0 status" >&2; exit 1 ;;
esac

if [[ ! -x "$NEXT" ]]; then
  echo "$NEXT not found — run 'npm install' first." >&2
  exit 1
fi

if [[ -n "$(listening_pids)" ]]; then
  echo "Already running on port $PORT. Run '$0 stop' first." >&2
  exit 1
fi

if [[ "$MODE" == "prod" ]]; then
  echo "Building — mode: prod"
  "$NEXT" build
  CMD=("$NEXT" start -p "$PORT")
else
  CMD=("$NEXT" dev -p "$PORT")
fi

if $FOREGROUND; then
  echo "Starting frontend — mode: $MODE (foreground)"
  exec "${CMD[@]}"
fi

nohup "${CMD[@]}" > "$LOG" 2>&1 &
disown

echo "Starting in background — mode: $MODE"
for _ in $(seq 1 30); do
  [[ -n "$(listening_pids)" ]] && break
  sleep 1
done

pids="$(listening_pids)"
if [[ -n "$pids" ]]; then
  echo "Up — pid(s): $(echo "$pids" | tr '\n' ' ')"
else
  echo "Did not come up within 30s — check $LOG" >&2
  exit 1
fi
echo "Logs: tail -f $LOG"
echo "Stop:  $0 stop"
