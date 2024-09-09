#!/bin/bash

# Check if the correct number of arguments is passed
if [ $# -lt 1 ]; then
  echo "Usage: $0 <command>"
  exit 1
fi

# Determine the env file based on the APP_ENV variable
case "$APP_ENV" in
  development)
    ENV_FILE=".env.development"
    ;;
  staging)
    ENV_FILE=".env.staging"
    ;;
  production)
    ENV_FILE=".env.production"
    ;;
  *)
    echo "Error: Unknown APP_ENV value: $APP_ENV"
    exit 1
    ;;
esac

# Check if the environment file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE file does not exist."
  exit 1
fi

# Load environment variables from the file
set -o allexport
source "$ENV_FILE"
set -o allexport

# Run the command with the loaded environment variables
eval "$@"
