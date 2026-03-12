#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
zip -r aprende-ai-v2.zip api frontend docs README.md
