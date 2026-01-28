#!/bin/zsh

VERSION=$(node -p "require('./package.json').version")
echo $VERSION

YOUR_USERNAME=kamilmrowka

docker build -t $YOUR_USERNAME/task-tracker:$VERSION -t $YOUR_USERNAME/task-tracker:latest . && \
  docker push $YOUR_USERNAME/task-tracker:$VERSION && \
  docker push $YOUR_USERNAME/task-tracker:latest

