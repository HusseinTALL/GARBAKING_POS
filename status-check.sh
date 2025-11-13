#!/bin/bash
LOGS_DIR="$(dirname "$0")/logs/latest"
if [ ! -d "$LOGS_DIR" ]; then
    echo "No active session found"
    exit 1
fi

echo "═══════════════════════════════════════════════════════"
echo "  GARBAKING POS - SERVICE STATUS"
echo "═══════════════════════════════════════════════════════"
for pidfile in "$LOGS_DIR"/*.pid; do
    if [ -f "$pidfile" ]; then
        service=$(basename "$pidfile" .pid)
        pid=$(cat "$pidfile")
        if kill -0 "$pid" 2>/dev/null; then
            echo "✓ $service (PID: $pid) - RUNNING"
        else
            echo "✗ $service - STOPPED"
        fi
    fi
done
echo "═══════════════════════════════════════════════════════"
