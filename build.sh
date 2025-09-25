#!/bin/bash
set -e

echo "Installing all dependencies including dev dependencies..."
npm install --include=dev

echo "Running build..."
npm run build

echo "Build completed successfully!"
