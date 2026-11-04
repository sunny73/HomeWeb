'use strict';

const fs = require('node:fs');
const path = require('node:path');

const AIHOT_HOST = 'aihot.news';
const USER_AGENT = 'NewsCompass/1.0 (+https://aihot.news/)';

function decodeEntities(value) {
  const named = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' '
  };

  return String(value || '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === '#') {
      const hex = entity[1] && entity[1].toLowerCase() === 'x';
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      if (Number.isFinite(code)) {
        try {
          return String.fromCodePoint(code);
        } catch {
          return match;
        }
      }
      return match;
    }
    return named[entity.toLowerCase()] ?? match;
  });
}

function stripCdata(value) {
  return String(value || '')
    .replace(/^\s*<!\[CDATA\[/, '')
    .replace(/\]\]>\s*$/, '');
}

function textValue(xml, tag) {
  const match = String(xml).match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? decodeEntities(stripCdata(match[1])).trim() : '';
}

function stripHtml(value) {
  return decodeEntities(
    String(value || '')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>/gi, '</p> ')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSummary(description) {
  const blocks = [...String(description || '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean)
    .filter((paragraph) => !paragraph.startsWith('🔗') && !paragraph.startsWith('via AIHOT'));

  if (blocks.length) return blocks[0];
  return stripHtml(description);
}

function extractOriginalUrl(description) {
  const links = [...String(description || '').matchAll(/<a\s+[^>]*href="([^"]+)"/gi)];
  for (const link of links) {
    try {
      const url = new URL(decodeEntities(link[1]));
      if ((url.protocol === 'https:' || url.protocol === 'http:') && url.hostname !== AIHOT_HOST) {
        return url.href;
      }
    } catch {
      // Ignore malformed links in the feed.
    }
  }
  return '';
}

function extractSource(author) {
  let source = String(author || '').trim();
  source = source.replace(/^[^\s]+\s*\((.*)\)\s*$/, '$1').trim();
  source = source.replace(/^公众号\s*[:：]\s*/, '');
  source = source.replace(/^AIHOT\s*[:：]\s*/, '');
  return source || 'AIHOT';
}

function parseAiHotFeed(xml, { fetchedAt = new Date().toISOString(), limit = 18 } = {}) {
  const items = [...String(xml).matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .slice(0, limit)
    .map((match, index) => {
      const raw = match[1];
      const title = textValue(raw, 'title');
      const description = textValue(raw, 'description');
      const published = textValue(raw, 'pubDate');
      const publishedDate = new Date(published);
      const originalUrl = extractOriginalUrl(description);
      const aiHotUrl = textValue(raw, 'link');

      return {
        id: textValue(raw, 'guid') || `aihot-${index + 1}`,
        title,
        summary: extractSummary(description),
        category: textValue(raw, 'category') || 'AI',
        source: extractSource(textValue(raw, 'author')),
        publishedAt: Number.isNaN(publishedDate.getTime()) ? '' : publishedDate.toISOString(),
        aiHotUrl,
        originalUrl
      };
    })
    .filter((item) => item.title && item.aiHotUrl);

  return {
    source: 'AIHOT',
    sourceUrl: 'https://aihot.news/',
    feedTitle: textValue(xml, 'title') || 'AIHOT — 精选',
    fetchedAt,
    items
  };
}

function readFeedUrl(root) {
  if (process.env.AIHOT_FEED_URL) return process.env.AIHOT_FEED_URL.trim();
  const configPath = path.join(root, 'data', 'aihot-feed-url.txt');
  try {
    return fs.readFileSync(configPath, 'utf8').trim();
  } catch {
    return '';
  }
}

async function fetchAiHotFeed(feedUrl, { limit = 18, timeoutMs = 20000 } = {}) {
  let parsed;
  try {
    parsed = new URL(feedUrl);
  } catch {
    throw new Error('AIHOT feed URL is not configured correctly');
  }

  if (parsed.protocol !== 'https:' || parsed.hostname !== AIHOT_HOST) {
    throw new Error('AIHOT feed URL must use https://aihot.news/');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(parsed.href, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.5',
        'User-Agent': USER_AGENT
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`AIHOT returned HTTP ${response.status}`);
    }

    return parseAiHotFeed(await response.text(), { fetchedAt: new Date().toISOString(), limit });
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  parseAiHotFeed,
  fetchAiHotFeed,
  readFeedUrl
};
