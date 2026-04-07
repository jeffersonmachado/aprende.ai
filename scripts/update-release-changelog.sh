#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$PROJECT_DIR/dist"
INDEX_FILE="$DIST_DIR/releases.json"
CHANGELOG_FILE="$DIST_DIR/releases.md"

if [[ ! -f "$INDEX_FILE" ]]; then
  echo "Erro: índice de releases não encontrado em $INDEX_FILE" >&2
  echo "Execute primeiro: npm run release:index" >&2
  exit 1
fi

node - <<'EOF' "$INDEX_FILE" "$CHANGELOG_FILE"
const fs = require('fs');

const [indexFile, changelogFile] = process.argv.slice(2);
const payload = JSON.parse(fs.readFileSync(indexFile, 'utf8'));

const lines = [];
lines.push('# Release History');
lines.push('');
lines.push(`Project: ${payload.project}`);
lines.push(`Updated at: ${payload.updatedAt}`);
lines.push(`Total releases: ${payload.totalReleases}`);
lines.push('');

function splitSummary(summary) {
  if (!summary) {
    return [];
  }

  return String(summary)
    .split(' | ')
    .map((item) => item.trim())
    .filter(Boolean);
}

for (const release of payload.releases || []) {
  lines.push(`## ${release.artifact}`);
  lines.push('');
  lines.push('### Metadata');
  lines.push('');
  lines.push(`- Version: ${release.version ?? 'n/a'}`);
  lines.push(`- Commit: ${release.gitCommit ?? 'n/a'}`);
  lines.push(`- Branch: ${release.gitBranch ?? 'n/a'}`);
  lines.push(`- Worktree dirty: ${release.gitDirty == null ? 'n/a' : release.gitDirty ? 'yes' : 'no'}`);
  lines.push(`- Publish ready: ${release.publishReady == null ? 'n/a' : release.publishReady ? 'yes' : 'no'}`);
  lines.push(`- Generated at: ${release.generatedAt ?? 'n/a'}`);
  lines.push(`- Notes file: ${release.releaseNotesFile ?? 'n/a'}`);
  if (Array.isArray(release.releaseNotesItems) && release.releaseNotesItems.length > 0) {
    lines.push(`- Notes items count: ${release.releaseNotesItems.length}`);
  } else {
    lines.push('- Notes items count: 0');
  }
  lines.push(`- Size: ${release.sizeHuman ?? 'n/a'} (${release.sizeBytes ?? 'n/a'} bytes)`);
  lines.push(`- Files: ${release.fileCount ?? 'n/a'}`);
  lines.push(`- SHA-256: ${release.sha256 ?? 'n/a'}`);
  lines.push(`- Checksum file: ${release.checksumFile ?? 'n/a'}`);
  lines.push(`- Manifest file: ${release.manifestFile ?? 'n/a'}`);
  lines.push('');

  lines.push('### Notes');
  lines.push('');
  if (Array.isArray(release.releaseNotesItems) && release.releaseNotesItems.length > 0) {
    for (const item of release.releaseNotesItems) {
      lines.push(`- ${item}`);
    }
    lines.push('');
  } else if (release.releaseNotesSummary) {
    lines.push('Summary:');
    for (const summaryItem of splitSummary(release.releaseNotesSummary)) {
      lines.push(`- ${summaryItem}`);
    }
    lines.push('');
  } else {
    lines.push('No summary available.');
    lines.push('');
  }

  if (
    (!Array.isArray(release.releaseNotesItems) || release.releaseNotesItems.length === 0) &&
    !release.releaseNotesSummary
  ) {
    lines.push('- No structured notes available.');
  }
  lines.push('');
}

fs.writeFileSync(changelogFile, `${lines.join('\n')}\n`);
console.log(`Release changelog atualizado: ${changelogFile}`);
EOF