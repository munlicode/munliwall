#!/bin/bash

# Fix chrome-sandbox permissions
# The installation directory typically matches the productName or packageName.
# We use a wildcard or try common paths to be safe, or targeted path.

APP_PATH="/opt/munliwall"

if [ -f "$APP_PATH/chrome-sandbox" ]; then
    chown root:root "$APP_PATH/chrome-sandbox"
    chmod 4755 "$APP_PATH/chrome-sandbox"
fi

# Link the executable to /usr/bin for easier access if not done automatically
if [ -f "$APP_PATH/munliwall" ]; then
    ln -sf "$APP_PATH/munliwall" /usr/bin/munliwall
fi
