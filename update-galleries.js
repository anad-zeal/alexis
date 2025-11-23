/**
 * update-galleries.js
 * Watches image directories and updates JSON metadata files automatically.
 * Usage: node update-galleries.js
 */

const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
// Map your folder names to your JSON files and ID prefixes
const galleries = [
  {
    path: 'encaustic-paintings',
    json: 'encaustic-slideshow.json',
    prefix: 'encaustic',
    title: 'Encaustic',
  },
  {
    path: 'drip-series-paintings',
    json: 'drip-series-slideshow.json',
    prefix: 'drip',
    title: 'Drip Series',
  },
  {
    path: 'black-and-white-paintings',
    json: 'black-and-white-slideshow.json',
    prefix: 'bw',
    title: 'Black & White',
  },
  {
    path: 'project-series-paintings',
    json: 'projects-slideshow.json',
    prefix: 'proj',
    title: 'Project Series',
  },
  {
    path: 'decorative-paintings',
    json: 'decorative-slideshow.json',
    prefix: 'deco',
    title: 'Decorative',
  },
  {
    path: 'historic-preservation',
    json: 'preservation-slideshow.json',
    prefix: 'pres',
    title: 'Preservation',
  },
];

const BASE_URL = 'https://elzalive.com/assets/images/';
const IMG_ROOT = path.join(__dirname, 'assets', 'images');
const JSON_ROOT = path.join(__dirname, 'json-files');

// --- HELPER FUNCTIONS ---

// Convert filename to Title Case (e.g., "my-image.jpg" -> "My Image")
function filenameToTitle(filename) {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}

// Core logic to sync a single gallery
function syncGallery(galleryConf) {
  const imgDir = path.join(IMG_ROOT, galleryConf.path);
  const jsonPath = path.join(JSON_ROOT, galleryConf.json);

  // 1. Ensure directory exists
  if (!fs.existsSync(imgDir)) {
    console.log(`[Warning] Directory not found: ${imgDir}`);
    return;
  }

  // 2. Read existing JSON or start empty
  let currentData = [];
  if (fs.existsSync(jsonPath)) {
    try {
      currentData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (e) {
      console.error(`Error parsing ${jsonPath}, starting fresh.`);
    }
  }

  // 3. Get current files on disk
  const files = fs.readdirSync(imgDir).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  let hasChanges = false;
  const newJsonData = [];

  // 4. Process files (Add new, Keep existing)
  files.forEach((file, index) => {
    const webPath = `${BASE_URL}${galleryConf.path}/${file}`;

    // Check if image already exists in JSON
    const existingEntry = currentData.find((item) => item.src === webPath);

    if (existingEntry) {
      // KEEP: Push existing entry to preserve manual IPTC edits
      newJsonData.push(existingEntry);
    } else {
      // ADD: Create new stub
      hasChanges = true;
      console.log(`[Added] ${file} to ${galleryConf.json}`);

      // Determine ID number (basic auto-increment based on array position)
      const idNum = index + 1;

      newJsonData.push({
        id: `${galleryConf.prefix}-${idNum}`,
        title: filenameToTitle(file),
        src: webPath,
        // Placeholders for manual entry
        caption: filenameToTitle(file),
        description: `Description for ${filenameToTitle(file)}`,
        medium: 'Medium TBD',
        dimensions: '00" x 00"',
      });
    }
  });

  // 5. Check for Deletions
  // If the new list is shorter than old list (logic handled by rebuilding list above)
  // We check if length changed or if we forced a rebuild
  if (currentData.length !== newJsonData.length) {
    hasChanges = true;
    console.log(`[Cleaned] Removed missing files from ${galleryConf.json}`);
  }

  // 6. Write Update
  if (hasChanges) {
    fs.writeFileSync(jsonPath, JSON.stringify(newJsonData, null, 2));
    console.log(`[Updated] ${galleryConf.json} saved.`);
  }
}

// --- EXECUTION ---

console.log('--- Synchronizing Galleries ---');

// Initial Run
galleries.forEach(syncGallery);

console.log('\n--- Watching for changes (Ctrl+C to stop) ---');

// Watcher
galleries.forEach((g) => {
  const dir = path.join(IMG_ROOT, g.path);
  if (fs.existsSync(dir)) {
    let debounceTimer;
    fs.watch(dir, (eventType, filename) => {
      if (filename && !filename.startsWith('.')) {
        // Debounce to prevent multiple firings for one file copy
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          console.log(`\nDetected change in ${g.title}...`);
          syncGallery(g);
        }, 500);
      }
    });
  }
});
