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

# Update desktop info and icon cache so the system sees the new app immediately
if [ -x "$(command -v update-desktop-database)" ]; then
  update-desktop-database /usr/share/applications || true
fi

if [ -x "$(command -v gtk-update-icon-cache)" ]; then
  gtk-update-icon-cache -f -t /usr/share/icons/hicolor || true
fi

# Fallback: Copy icon to pixmaps for broader compatibility
if [ -f "/usr/share/icons/hicolor/1024x1024/apps/munliwall.png" ]; then
    cp "/usr/share/icons/hicolor/1024x1024/apps/munliwall.png" "/usr/share/pixmaps/munliwall.png"
fi
