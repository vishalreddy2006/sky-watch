// Simple build script to copy current project files into ./dist for Render
// Excludes: .git, node_modules, dist
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const outDir = path.join(projectRoot, 'dist');
const excludeDirs = new Set(['.git', 'node_modules', 'dist']);

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    const dirName = path.basename(src);
    if (excludeDirs.has(dirName)) return; // skip excluded dirs
    ensureDir(dest);
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else if (stat.isFile()) {
    // Copy files as-is
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

// Clean output directory
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}

// Copy from project root into dist
copyRecursive(projectRoot, outDir);

// Log summary
console.log('Build complete. Output at:', outDir);