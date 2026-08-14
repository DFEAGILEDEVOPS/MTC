#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

run_setup=true
if [[ "${1:-}" == "--no-setup" ]]; then
  run_setup=false
fi

check_func_tools_v4() {
  if ! command -v func >/dev/null 2>&1; then
    echo "ERROR: Azure Functions Core Tools is not installed (missing 'func' command)." >&2
    echo "Install v4 on macOS with: brew tap azure/functions && brew install azure-functions-core-tools@4" >&2
    exit 1
  fi

  local version major
  version="$(func --version 2>/dev/null || true)"
  major="${version%%.*}"

  if [[ -z "$version" || ! "$major" =~ ^[0-9]+$ || "$major" -lt 4 ]]; then
    echo "ERROR: Azure Functions Core Tools v4+ is required by this repo." >&2
    echo "Detected func version: ${version:-unknown}" >&2
    echo "Upgrade on macOS: brew tap azure/functions && brew install azure-functions-core-tools@4" >&2
    echo "Verify with: func --version" >&2
    exit 1
  fi
}

ensure_docker_running() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: Docker CLI is not installed or not on PATH." >&2
    echo "Install Docker Desktop and retry." >&2
    exit 1
  fi

  if docker info >/dev/null 2>&1; then
    echo "Docker is already running."
    return
  fi

  if [[ "$(uname -s)" == "Darwin" ]]; then
    echo "Starting Docker Desktop..."
    open -a Docker >/dev/null 2>&1 || true

    echo -n "Waiting for Docker to become ready"
    for _ in $(seq 1 60); do
      if docker info >/dev/null 2>&1; then
        echo " done"
        return
      fi
      echo -n "."
      sleep 2
    done
    echo ""
    echo "ERROR: Docker did not become ready in time." >&2
    echo "Please open Docker Desktop and wait until it is running, then retry." >&2
    exit 1
  fi

  echo "ERROR: Docker daemon is not running." >&2
  echo "Start Docker and retry." >&2
  exit 1
}

# Escape a shell command so it can be safely embedded inside AppleScript.
escape_for_applescript() {
  local input="$1"
  input="${input//\\/\\\\}"
  input="${input//\"/\\\"}"
  printf '%s' "$input"
}

open_terminal_window() {
  local title="$1"
  local workdir="$2"
  local start_cmd="$3"

  local cmd
  cmd="cd \"$workdir\" && export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\" --no-use && nvm use && clear && printf '\033]1;%s\007\033]2;%s\007' '$title' '$title' && echo 'Starting $title in $workdir' && $start_cmd"

  local escaped
  escaped="$(escape_for_applescript "$cmd")"

  osascript <<EOF >/dev/null
tell application "Terminal"
  activate
  do script "$escaped"
end tell
EOF
}

open_iterm_tab() {
  local title="$1"
  local workdir="$2"
  local start_cmd="$3"

  local cmd
  cmd="cd \"$workdir\" && export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\" --no-use && nvm use && clear && printf '\033]1;%s\007\033]2;%s\007' '$title' '$title' && echo 'Starting $title in $workdir' && $start_cmd"

  local escaped
  escaped="$(escape_for_applescript "$cmd")"

  osascript <<EOF
tell application id "com.googlecode.iterm2"
  activate
  if (count of windows) = 0 then
    create window with default profile
  end if
  tell current window
    set newTab to (create tab with default profile)
    tell current session of newTab
      write text "$escaped"
    end tell
  end tell
end tell
EOF
}

open_service() {
  local title="$1"
  local workdir="$2"
  local start_cmd="$3"

  if [[ -d "/Applications/iTerm.app" ]]; then
    open_iterm_tab "$title" "$workdir" "$start_cmd"
  else
    open_terminal_window "$title" "$workdir" "$start_cmd"
  fi
}

can_use_iterm() {
  osascript -e 'tell application id "com.googlecode.iterm2" to version' >/dev/null 2>&1
}

if [[ "$run_setup" == true ]]; then
  ensure_docker_running
  check_func_tools_v4
  echo "Running repo setup first (./setup.sh)..."
  "$script_dir/setup.sh"
else
  ensure_docker_running
  echo "Skipping setup (--no-setup supplied)."
fi

if can_use_iterm; then
  echo "Opening iTerm tabs for services..."
else
  echo "iTerm AppleScript unavailable. Opening Terminal sessions for services..."
fi

open_service "Pupil SPA" "$script_dir/pupil-spa" "yarn start"
open_service "Pupil API" "$script_dir/pupil-api" "yarn start"
open_service "Admin" "$script_dir/admin" "yarn start"
open_service "Func Consumption" "$script_dir/func-consumption" "yarn start"
open_service "Func PS Report" "$script_dir/func-ps-report" "yarn start"
open_service "Func Throttled" "$script_dir/func-throttled" "yarn start"

echo "All start commands have been launched."
