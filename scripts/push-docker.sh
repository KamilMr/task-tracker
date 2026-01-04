#!/bin/zsh

VERSION=$(node -p "require('./package.json').version")
echo $VERSION

YOUR_USERNAME=kamilmrowka

docker tag task-tracker-tasktracker:latest $YOUR_USERNAME/task-tracker:$VERSION && \
  docker tag task-tracker-tasktracker:latest $YOUR_USERNAME/task-tracker:latest && \
  docker push $YOUR_USERNAME/task-tracker:$VERSION && \
  docker push $YOUR_USERNAME/task-tracker:latest

