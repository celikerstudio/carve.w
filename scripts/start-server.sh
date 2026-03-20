#!/bin/bash
# Visual Companion — lightweight mockup server for UI/design discussions
# Usage: bash scripts/start-server.sh

PORT=${1:-3333}
DIR="$(cd "$(dirname "$0")/../visual-companion" && pwd)"

if [ ! -d "$DIR" ]; then
  echo "Creating visual-companion directory..."
  mkdir -p "$DIR"
fi

echo "Starting Visual Companion on http://localhost:$PORT"
echo "Serving from: $DIR"
cd "$DIR" && npx -y serve -l $PORT -s --no-clipboard
