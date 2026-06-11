#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${PORT:-3000}"

echo "Building Monarch..."
npm run build

echo "Starting production server on port $PORT..."
fuser -k "${PORT}/tcp" 2>/dev/null || true
npm run start -- -p "$PORT" &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT

sleep 2

if [ ! -x /tmp/cloudflared ]; then
  echo "Downloading cloudflared..."
  curl -fsSL -o /tmp/cloudflared \
    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
  chmod +x /tmp/cloudflared
fi

echo ""
echo "Opening public tunnel (share the URL below)..."
echo ""
/tmp/cloudflared tunnel --url "http://localhost:${PORT}"
