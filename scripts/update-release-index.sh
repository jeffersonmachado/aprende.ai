#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$PROJECT_DIR/dist"
INDEX_FILE="$DIST_DIR/releases.json"

mkdir -p "$DIST_DIR"

node - <<'EOF' "$DIST_DIR" "$INDEX_FILE"
const fs = require('fs');
const path = require('path');

const [distDir, indexFile] = process.argv.slice(2);
const defaultProject = 'aprende-ai';

function inferVersion(manifest) {
  if (manifest.version) {
    return manifest.version;
  }

  const match = String(manifest.artifact || '').match(/-v(\d+\.\d+\.\d+)-/);
  return match ? match[1] : null;
}

function inferGitCommit(manifest) {
  if (typeof manifest.gitCommit === 'string') {
    return manifest.gitCommit;
  }

  return null;
}

function inferGitBranch(manifest) {
  if (typeof manifest.gitBranch === 'string') {
    return manifest.gitBranch;
  }

  return null;
}

function inferGitDirty(manifest) {
  if (typeof manifest.gitDirty === 'boolean') {
    return manifest.gitDirty;
  }

  return null;
}

function inferPublishReady(manifest) {
  if (typeof manifest.publishReady === 'boolean') {
    return manifest.publishReady;
  }

  return null;
}

const manifestFiles = fs
  .readdirSync(distDir)
  .filter((name) => name.endsWith('.zip.manifest.json'))
  .sort();

const releases = manifestFiles
  .map((name) => {
    const fullPath = path.join(distDir, name);
    const manifest = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    return {
      project: manifest.project || defaultProject,
      version: inferVersion(manifest),
      gitCommit: inferGitCommit(manifest),
      gitBranch: inferGitBranch(manifest),
      gitDirty: inferGitDirty(manifest),
      publishReady: inferPublishReady(manifest),
      releaseNotesFile: manifest.releaseNotesFile || null,
      releaseNotesSummary: typeof manifest.releaseNotesSummary === 'string' ? manifest.releaseNotesSummary : null,
      releaseNotesItems: Array.isArray(manifest.releaseNotesItems) ? manifest.releaseNotesItems : [],
      artifact: manifest.artifact,
      checksumFile: manifest.checksumFile,
      manifestFile: name,
      sizeBytes: manifest.sizeBytes,
      sizeHuman: manifest.sizeHuman,
      fileCount: manifest.fileCount,
      sha256: manifest.sha256,
      generatedAt: manifest.generatedAt,
    };
  })
  .sort((left, right) => String(right.generatedAt).localeCompare(String(left.generatedAt)));

const payload = {
  project: releases[0]?.project ?? defaultProject,
  updatedAt: new Date().toISOString(),
  totalReleases: releases.length,
  latest: releases[0] ?? null,
  releases,
};

fs.writeFileSync(indexFile, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Release index atualizado: ${indexFile}`);
EOF