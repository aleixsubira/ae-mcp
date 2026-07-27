#!/bin/bash
#
# AE-MCP CEP Extension Installer for macOS
#

set -e

EXTENSION_NAME="com.aemcp.panel"
EXTENSION_DIR="$(cd "$(dirname "$0")/.." && pwd)/cep-extension"
INSTALL_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/$EXTENSION_NAME"

echo "AE-MCP CEP Extension Installer"
echo "==============================="
echo ""

# Check if extension directory exists
if [ ! -d "$EXTENSION_DIR" ]; then
  echo "Error: Extension directory not found: $EXTENSION_DIR"
  exit 1
fi

# Enable unsigned extensions (required for development).
# One key per CEP runtime version: After Effects 2025+ ships CSXS 13/14/15, and
# an extension that loaded fine yesterday disappears from Window > Extensions
# the moment AE moves to a runtime whose PlayerDebugMode was never set.
echo "Enabling unsigned extensions for debugging..."
for CSXS_VERSION in 9 10 11 12 13 14 15; do
  defaults write "com.adobe.CSXS.$CSXS_VERSION" PlayerDebugMode 1
done

# macOS caches preferences; without this the new values may not be visible to
# After Effects until the next login.
killall cfprefsd 2>/dev/null || true

# Create CEP extensions directory if it doesn't exist
mkdir -p "$(dirname "$INSTALL_DIR")"

# Remove existing installation
if [ -d "$INSTALL_DIR" ]; then
  echo "Removing existing installation..."
  rm -rf "$INSTALL_DIR"
fi

if [ -L "$INSTALL_DIR" ]; then
  echo "Removing existing symlink..."
  rm "$INSTALL_DIR"
fi

# Create symlink to extension directory
echo "Creating symlink..."
ln -s "$EXTENSION_DIR" "$INSTALL_DIR"

echo ""
echo "Installation complete!"
echo ""
echo "The extension has been installed to:"
echo "  $INSTALL_DIR"
echo ""
echo "To use the extension:"
echo "1. Start After Effects 2024 or later"
echo "2. Go to Window > Extensions > AE-MCP"
echo "3. The panel will auto-start and begin listening for commands"
echo ""
echo "Note: If After Effects is running, you may need to restart it."
