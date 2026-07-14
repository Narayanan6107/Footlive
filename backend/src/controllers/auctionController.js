import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, '../../data/FC26_20250921.csv');

// ──────────────────────────────────────────────
// Position → tier mapping
// ──────────────────────────────────────────────
const POSITION_TIERS = {
  GK:  'GK',
  // Defenders
  CB: 'DEF', LB: 'DEF', RB: 'DEF', LWB: 'DEF', RWB: 'DEF',
  // Midfielders
  CM: 'MID', CDM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID',
  // Attackers
  ST: 'ATT', CF: 'ATT', LW: 'ATT', RW: 'ATT', LF: 'ATT', RF: 'ATT',
};

const TIER_MULTIPLIER = { GK: 800, DEF: 900, MID: 1100, ATT: 1400 };
const SOFIFA_TEAM_CDN = 'https://cdn.sofifa.net/teams';
const IMAGE_PROXY_ROUTE = '/api/auction/image';

const COUNTRY_CODES = {
  Argentina: 'ar', Australia: 'au', Austria: 'at', Belgium: 'be', Brazil: 'br',
  Cameroon: 'cm', Canada: 'ca', Chile: 'cl', Colombia: 'co', Croatia: 'hr',
  Denmark: 'dk', Ecuador: 'ec', Egypt: 'eg', England: 'gb-eng', France: 'fr',
  Germany: 'de', Ghana: 'gh', Italy: 'it', Japan: 'jp', Korea: 'kr',
  Mexico: 'mx', Morocco: 'ma', Netherlands: 'nl', Nigeria: 'ng', Norway: 'no',
  Poland: 'pl', Portugal: 'pt', Senegal: 'sn', Serbia: 'rs', Spain: 'es',
  Sweden: 'se', Switzerland: 'ch', Turkey: 'tr', Ukraine: 'ua', Uruguay: 'uy',
  'United States': 'us', Wales: 'gb-wls', Scotland: 'gb-sct', 'Czech Republic': 'cz',
  'Republic of Ireland': 'ie', 'Northern Ireland': 'gb-nir', 'Saudi Arabia': 'sa',
  'Cote d\'Ivoire': 'ci', 'Ivory Coast': 'ci', 'Bosnia and Herzegovina': 'ba',
  Slovakia: 'sk', Slovenia: 'si', Hungary: 'hu', Romania: 'ro', Greece: 'gr',
  Paraguay: 'py', Peru: 'pe', Venezuela: 've', Algeria: 'dz', Tunisia: 'tn',
  Mali: 'ml', 'Burkina Faso': 'bf', Georgia: 'ge', Albania: 'al'
};

const POPULAR_PLAYER_NAMES = new Set([
  'K. Mbappe', 'K. Mbappé', 'E. Haaland', 'J. Bellingham', 'Vini Jr.', 'L. Messi',
  'Cristiano Ronaldo', 'K. De Bruyne', 'M. Salah', 'H. Kane', 'Lamine Yamal',
  'Rodri', 'B. Saka', 'Neymar Jr', 'F. Wirtz', 'J. Musiala', 'Pedri',
  'R. Lewandowski', 'V. van Dijk', 'T. Courtois', 'A. Griezmann',
  'M. Olise', 'A. Mac Allister', 'L. Martinez', 'J. Alvarez', 'D. Rice',
  'B. Foden', 'B. Palmer', 'M. Merino', 'M. Cucurella', 'Pedro Porro',
  'W. Saliba', 'L. Martinez', 'M. Maignan', 'Unai Simon', 'A. Tchouameni',
  'Vitinha', 'Joao Neves', 'F. Balogun', 'Pau Cubarsi', 'A. Isak',
  'C. Gakpo', 'Alisson', 'N. Williams Jr.', 'D. Olmo', 'L. Sane'
]);

const GUARANTEED_HEADLINERS = [
  'Kylian Mbappe', 'Kylian Mbappé', 'Lamine Yamal', 'Lionel Messi', 'Cristiano Ronaldo'
];

function getTier(positionsStr) {
  if (!positionsStr) return 'MID';
  const primary = positionsStr.split(',')[0].trim().toUpperCase();
  return POSITION_TIERS[primary] || 'MID';
}

function calcBasePrice(overall, tier) {
  let price = parseInt(overall, 10) * TIER_MULTIPLIER[tier];
  if (overall >= 85) price = Math.round(price * 1.2);
  else if (overall >= 80) price = Math.round(price * 1.1);
  return Math.round(price / 100) * 100;
}

function getCountryCode(nationality) {
  return COUNTRY_CODES[nationality] || '';
}

function proxiedImageUrl(url, fallback, name) {
  const params = new URLSearchParams({ url: url || '', fallback, name: name || '' });
  return `${IMAGE_PROXY_ROUTE}?${params.toString()}`;
}

function escapeSvg(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getInitials(text = '') {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'FC';
}

function normalizeName(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function matchesAnyName(player, names) {
  const haystack = normalizeName(`${player.name} ${player.fullName}`);
  return names.some(name => haystack.includes(normalizeName(name)));
}

function fallbackSvg(type, name) {
  const safeName = escapeSvg(name);
  const safeInitials = escapeSvg(getInitials(name));
  if (type === 'club') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#facc15"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><circle cx="40" cy="40" r="37" fill="#111827" stroke="url(#g)" stroke-width="5"/><path d="M24 22h32v18c0 16-11 25-16 28-5-3-16-12-16-28V22z" fill="rgba(250,204,21,.18)" stroke="rgba(255,255,255,.35)" stroke-width="2"/><text x="40" y="46" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="800" fill="#fff">${safeInitials}</text></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><defs><radialGradient id="bg" cx=".5" cy=".2" r=".85"><stop stop-color="#facc15" stop-opacity=".38"/><stop offset=".6" stop-color="#1f2937"/><stop offset="1" stop-color="#020617"/></radialGradient></defs><rect width="240" height="240" rx="18" fill="url(#bg)"/><circle cx="120" cy="72" r="38" fill="#f8d19a"/><path d="M56 224c7-58 38-90 64-90s57 32 64 90H56z" fill="#7c3aed"/><path d="M82 146h76l-18 78h-40l-18-78z" fill="#111827" opacity=".45"/><text x="120" y="206" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="900" fill="#fff">${safeInitials}</text><title>${safeName}</title></svg>`;
}

// ──────────────────────────────────────────────
// CSV parser (manual, no extra deps)
// ──────────────────────────────────────────────
function parseCSV(rawText) {
  const lines = rawText.split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);

  const players = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h.trim()] = (values[idx] || '').trim(); });

    const overall = parseInt(row.overall, 10);
    if (isNaN(overall) || !row.short_name) continue;

    const tier = getTier(row.player_positions);
    const basePrice = calcBasePrice(overall, tier);

    players.push({
      id:           row.player_id,
      name:         row.short_name,
      fullName:     row.long_name,
      positions:    row.player_positions,
      primaryPos:   row.player_positions?.split(',')[0]?.trim() || 'CM',
      tier,
      overall,
      age:          parseInt(row.age, 10) || 0,
      nationality:  row.nationality_name,
      countryCode:   getCountryCode(row.nationality_name),
      flagUrl:       getCountryCode(row.nationality_name)
        ? `https://flagcdn.com/w40/${getCountryCode(row.nationality_name)}.png`
        : '',
      club:         row.club_name,
      clubLogoUrl:   row.club_team_id ? proxiedImageUrl(`${SOFIFA_TEAM_CDN}/${row.club_team_id}/60.png`, 'club', row.club_name) : proxiedImageUrl('', 'club', row.club_name),
      faceUrl:      row.player_face_url,
      faceImageUrl:  proxiedImageUrl(row.player_face_url, 'player', row.short_name),
      pace:         parseInt(row.pace, 10) || 0,
      shooting:     parseInt(row.shooting, 10) || 0,
      passing:      parseInt(row.passing, 10) || 0,
      dribbling:    parseInt(row.dribbling, 10) || 0,
      defending:    parseInt(row.defending, 10) || 0,
      physic:       parseInt(row.physic, 10) || 0,
      basePrice,
    });
  }
  return players;
}

// Handles quoted CSV fields correctly
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ──────────────────────────────────────────────
// Cache: parse once at startup
// ──────────────────────────────────────────────
let playerCache = null;

function getPlayers() {
  if (!playerCache) {
    console.log('📂 Loading player CSV...');
    const raw = fs.readFileSync(CSV_PATH, 'utf-8');
    playerCache = parseCSV(raw);
    console.log(`✅ Loaded ${playerCache.length} players from CSV`);
  }
  return playerCache;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ──────────────────────────────────────────────
// Balanced pool builder
//
// Squad requires: 1 GK · 4 DEF · 3 MID · 3 ATT = 11
// Pool of 50 gives ~4-5× coverage per slot so the
// user always has real options at every position.
//
// Quota  →  GK:8  DEF:16  MID:14  ATT:12  (sum = 50)
//
// Rating band: 80–95 (premium / gold tier players)
//   • 80–84  → "good" tier  (~50% of pool)
//   • 85–89  → "great" tier (~35% of pool)
//   • 90–95  → "elite" tier (~15% of pool — rare treats)
// ──────────────────────────────────────────────
const TIER_QUOTA = { GK: 8, DEF: 16, MID: 14, ATT: 12 }; // sum = 50

// Weighted random pick from rating sub-bands so elites appear but aren't dominant
function weightedCandidates(tierPlayers) {
  const good  = tierPlayers.filter(p => p.overall >= 80 && p.overall <= 84);
  const great = tierPlayers.filter(p => p.overall >= 85 && p.overall <= 89);
  const elite = tierPlayers.filter(p => p.overall >= 90);

  // Approx ratios: 50% good, 35% great, 15% elite
  return [
    ...shuffle(good).slice(0, Math.ceil(good.length  * 0.80)),
    ...shuffle(great).slice(0, Math.ceil(great.length * 0.80)),
    ...shuffle(elite).slice(0, Math.ceil(elite.length * 0.80)),
  ];
}

function buildBalancedPool(players, totalCount = 50) {
  const baseSum = Object.values(TIER_QUOTA).reduce((a, b) => a + b, 0);
  const scale   = totalCount / baseSum;

  // Filter to premium band 80–95
  const premium = players.filter(p => p.overall >= 80 && p.overall <= 95);

  // Group by tier
  const byTier = { GK: [], DEF: [], MID: [], ATT: [] };
  for (const p of premium) {
    if (byTier[p.tier]) byTier[p.tier].push(p);
  }

  const pool = [];
  for (const [tier, quota] of Object.entries(TIER_QUOTA)) {
    const needed     = Math.round(quota * scale);
    const candidates = shuffle(weightedCandidates(byTier[tier]));

    if (candidates.length >= needed) {
      pool.push(...candidates.slice(0, needed));
    } else {
      // Fallback: expand to all 80+ if not enough in band
      const extras = shuffle(players.filter(p => p.tier === tier && p.overall >= 78))
        .slice(0, needed - candidates.length);
      pool.push(...candidates, ...extras);
    }
  }

  const headliners = shuffle(premium.filter(p => matchesAnyName(p, GUARANTEED_HEADLINERS)));
  const guaranteed = headliners.slice(0, 1);
  const popular = shuffle(premium.filter(p => POPULAR_PLAYER_NAMES.has(p.name) || matchesAnyName(p, Array.from(POPULAR_PLAYER_NAMES))));
  const gentleBoostCount = Math.min(popular.length, Math.max(2, Math.round(totalCount * 0.12)));
  const boosted = popular.slice(0, gentleBoostCount);
  const seen = new Set([...guaranteed, ...boosted].map(p => p.id));
  const blended = [...guaranteed, ...boosted.filter(p => !guaranteed.some(g => g.id === p.id)), ...pool.filter(p => !seen.has(p.id))].slice(0, totalCount);

  return shuffle(blended);
}

// ──────────────────────────────────────────────
// Controllers
// ──────────────────────────────────────────────

/**
 * GET /api/auction/players?count=50
 *
 * Returns a balanced, shuffled pool of players:
 *   • Correct positional proportions (GK/DEF/MID/ATT)
 *   • All players within a ±8 overall rating band
 *   • Shuffled so positions appear in random order
 */
export const getAuctionPlayers = (req, res) => {
  try {
    const players = getPlayers();
    const count   = Math.min(parseInt(req.query.count, 10) || 50, 200);

    const pool = buildBalancedPool(players, count);

    res.json({ success: true, count: pool.length, players: pool });
  } catch (err) {
    console.error('Auction players error:', err);
    res.status(500).json({ success: false, error: 'Failed to load players' });
  }
};

/**
 * GET /api/auction/image?url=...&fallback=player|club&name=...
 * Proxies auction images and returns a local SVG fallback for missing assets.
 */
export const getAuctionImage = async (req, res) => {
  const { url = '', fallback = 'player', name = '' } = req.query;

  try {
    if (url) {
      const parsed = new URL(url);
      const allowedHosts = new Set(['cdn.sofifa.net', 'flagcdn.com']);
      if (!allowedHosts.has(parsed.hostname)) {
        throw new Error('Unsupported image host');
      }

      const upstream = await fetch(parsed.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 FootliveAuction/1.0',
          Accept: 'image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (upstream.ok) {
        const contentType = upstream.headers.get('content-type') || 'image/png';
        const buffer = Buffer.from(await upstream.arrayBuffer());
        res.set({
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        });
        return res.send(buffer);
      }
    }
  } catch {
    // Fall through to generated fallback image.
  }

  res.set({
    'Content-Type': 'image/svg+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=86400',
  });
  res.send(fallbackSvg(fallback, name));
};

/**
 * GET /api/auction/players/random
 * Returns a single random player.
 */
export const getRandomPlayer = (req, res) => {
  try {
    const players = getPlayers();
    const player = players[Math.floor(Math.random() * players.length)];
    res.json({ success: true, player });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load player' });
  }
};

/**
 * GET /api/auction/meta
 * Returns price range info to help frontend set budget.
 */
export const getAuctionMeta = (req, res) => {
  try {
    const players = getPlayers();
    const prices = players.map(p => p.basePrice);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    res.json({
      success: true,
      meta: {
        totalPlayers: players.length,
        avgBasePrice: avg,
        minBasePrice: min,
        maxBasePrice: max,
        suggestedBudget: 100000,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Meta error' });
  }
};
