#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}==>${NC} $*"; }
warn()  { echo -e "${YELLOW}==>${NC} $*"; }
error() { echo -e "${RED}==>${NC} $*" >&2; }

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    error "Docker is not installed."
    exit 1
  fi
  if ! docker info >/dev/null 2>&1; then
    error "Docker is not running. Start Docker Desktop and retry."
    exit 1
  fi
}

ensure_env() {
  if [ ! -f .env ]; then
    if [ -f .env.example ]; then
      warn "No .env found — copying from .env.example"
      cp .env.example .env
    else
      error "Missing .env file. Create one with your Firebase credentials."
      exit 1
    fi
    error "Edit .env with your Firebase credentials, then run ./run.sh again."
    exit 1
  fi

  if ! grep -E '^NEXT_PUBLIC_FIREBASE_API_KEY=.+' .env >/dev/null 2>&1; then
    error "NEXT_PUBLIC_FIREBASE_API_KEY is missing in .env."
    exit 1
  fi
  if ! grep -E '^NEXT_PUBLIC_FIREBASE_PROJECT_ID=.+' .env >/dev/null 2>&1; then
    error "NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing in .env."
    exit 1
  fi
}

cmd_up() {
  require_docker
  ensure_env

  info "Building and starting CyberLearn stack..."
  docker compose up -d --build

  WEB_PORT="${WEB_PORT:-3000}"
  CHATBOT_PORT="${CHATBOT_PORT:-8080}"

  echo ""
  info "CyberLearn is running:"
  echo "  App:      http://localhost:${WEB_PORT}"
  echo "  Chatbot:  http://localhost:${CHATBOT_PORT}"
  echo ""
  echo "Commands:"
  echo "  ./run.sh logs     # follow logs"
  echo "  ./run.sh down     # stop stack"
  echo "  ./run.sh restart  # rebuild and restart"
}

cmd_down() {
  require_docker
  info "Stopping CyberLearn stack..."
  docker compose down
  info "Stopped."
}

cmd_logs() {
  require_docker
  if [ $# -eq 0 ]; then
    docker compose logs -f
  else
    docker compose logs -f "$@"
  fi
}

cmd_restart() {
  cmd_down
  cmd_up
}

cmd_status() {
  require_docker
  docker compose ps
}

usage() {
  cat <<EOF
Usage: ./run.sh [command]

Commands:
  up        Build and start all services (default)
  down      Stop and remove containers
  logs      Follow service logs (optional service name)
  restart   Rebuild and restart the stack
  status    Show container status

Environment:
  Configure .env before first run (see .env.example).
  Set COMPOSE_PROFILES=local_model to enable the GPU vLLM service.

EOF
}

case "${1:-up}" in
  up)      cmd_up ;;
  down)    cmd_down ;;
  logs)    shift; cmd_logs "$@" ;;
  restart) cmd_restart ;;
  status)  cmd_status ;;
  -h|--help|help) usage ;;
  *)
    error "Unknown command: $1"
    usage
    exit 1
    ;;
esac
