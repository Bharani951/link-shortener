#!/usr/bin/env bash
# Link Shortener: start, stop or inspect the full app in Docker.
# Usage:  ./run.sh start | stop | logs | status
set -e
cd "$(dirname "$0")"

case "${1:-start}" in
  start)
    echo "Building and starting MongoDB, backend and frontend..."
    docker compose --profile full up -d --build
    echo "Waiting for the backend to be ready..."
    for i in $(seq 1 60); do
      if curl -fs http://localhost:8080/api/ping > /dev/null; then
        echo
        echo "Link Shortener is running"
        echo "  App:       http://localhost:3000"
        echo "  API:       http://localhost:8080/api/ping"
        echo "  Database:  mongodb://localhost:27017"
        echo
        echo "Stop it with: ./run.sh stop"
        exit 0
      fi
      sleep 2
    done
    echo "The backend did not answer within 2 minutes. See: ./run.sh logs"
    exit 1
    ;;
  stop)   docker compose --profile full down ;;
  logs)   docker compose --profile full logs -f backend frontend ;;
  status) docker compose --profile full ps ;;
  *)      echo "Usage: ./run.sh start | stop | logs | status"; exit 1 ;;
esac