'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { fetchAiHotFeed, readFeedUrl } = require('../lib/aihot');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'assets', 'aihot-featured.js');
const LIMIT = 18;

async function main() {
  const feedUrl = readFeedUrl(ROOT);
  if (!feedUrl) {
    throw new Error('Set AIHOT_FEED_URL or create data/aihot-feed-url.txt first.');
  }

  const data = await fetchAiHotFeed(feedUrl, { limit: LIMIT });
  if (!data.items.length) {
    throw new Error('AIHOT feed returned no usable items.');
  }

  const payload = JSON.stringify(data, null, 2);
  fs.writeFileSync(OUTPUT, `window.AIHOT_FEATURED = ${payload};\n`, 'utf8');
  console.log(`Synced ${data.items.length} AIHOT items to ${path.relative(ROOT, OUTPUT)} at ${data.fetchedAt}`);
}

main().catch((error) => {
  console.error(`[aihot] ${error.message}`);
  process.exitCode = 1;
});
