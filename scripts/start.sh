#!/bin/bash

SESSION_NAME="task-tracker-dev"

# Check if tmux session already exists
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "Session $SESSION_NAME already exists. Attaching..."
    tmux attach-session -t $SESSION_NAME
    exit 0
fi

# Create new tmux session
tmux new-session -d -s $SESSION_NAME

# Split window vertically (creates left/right panes)
tmux split-window -h

# Select left pane and run docker compose build and up
tmux select-pane -t 0
tmux send-keys "docker compose build && docker compose up" C-m

# Select right pane and run start command with a delay
tmux select-pane -t 1
tmux send-keys "sleep 5 && pnpm start" C-m

# Attach to the session
tmux attach-session -t $SESSION_NAME