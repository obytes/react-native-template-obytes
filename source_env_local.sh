#!/bin/bash

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

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE file does not exist."
    exit 1
fi

echo "I am loading $ENV_FILE" 

# Read .env file line by line
while IFS= read -r line; do
    # Skip empty lines and lines starting with # (comments)
    if [[ -z "$line" || "$line" =~ ^# ]]; then
        continue
    fi

    # Use regex to extract env variable KEY and VALUE
    if [[ "$line" =~ ^([^=]+)=(.*) ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"

        # Use set-env binary to set the environment variable
        set-env "$key" "$value"
        if [ $? -ne 0 ]; then
            echo "Failed to set $key"
        else
            echo "Set $key"
        fi
    fi
done < "$ENV_FILE"
