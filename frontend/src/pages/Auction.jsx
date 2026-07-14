import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import './Auction.css';
import {
  Coins, Trophy, CheckCircle, ArrowUpCircle, Wallet,
  SkipForward, RefreshCw, Rocket, Clock, Star, Circle,
  Shield, Play, Zap, Users, ChevronRight, LayoutGrid, X
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────
const STARTING_BUDGET = 10_000_000;  // 10M tokens per manager
const TIMER_FULL      = 30;          // seconds before first bid
const BID_INCREMENT   = 5_000;       // minimum outbid step
const POOL_SIZE       = 150;         // large pool — auction runs until both have 11
const TOTAL_SLOTS     = 11;
const BACKEND         = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TIER_COLOR   = { GK: '#f59e0b', DEF: '#3b82f6', MID: '#22c55e', ATT: '#ef4444' };
const PLAYER_COLORS = ['#7c3aed', '#e11d48'];
const STAT_COLOR   = v => v >= 85 ? '#22c55e' : v >= 75 ? '#84cc16' : v >= 65 ? '#eab308' : v >= 55 ? '#f97316' : '#ef4444';
const IMAGE_PRELOAD_AHEAD = 8;
const imageCache = new Set();

// ─── Formation Definitions ───────────────────────────────────────────────────
const FORMATIONS = [
  { id: '433',  name: '4-3-3',   positions: [
    { x:50,y:90,label:'GK' },
    { x:15,y:72,label:'LB' },{ x:35,y:72,label:'CB' },{ x:65,y:72,label:'CB' },{ x:85,y:72,label:'RB' },
    { x:30,y:46,label:'CM' },{ x:50,y:41,label:'CM' },{ x:70,y:46,label:'CM' },
    { x:22,y:18,label:'LW' },{ x:50,y:13,label:'ST' },{ x:78,y:18,label:'RW' },
  ]},
  { id: '442',  name: '4-4-2',   positions: [
    { x:50,y:90,label:'GK' },
    { x:15,y:72,label:'LB' },{ x:35,y:72,label:'CB' },{ x:65,y:72,label:'CB' },{ x:85,y:72,label:'RB' },
    { x:15,y:42,label:'LM' },{ x:38,y:42,label:'CM' },{ x:62,y:42,label:'CM' },{ x:85,y:42,label:'RM' },
    { x:38,y:14,label:'ST' },{ x:62,y:14,label:'ST' },
  ]},
  { id: '4231', name: '4-2-3-1', positions: [
    { x:50,y:90,label:'GK' },
    { x:15,y:72,label:'LB' },{ x:35,y:72,label:'CB' },{ x:65,y:72,label:'CB' },{ x:85,y:72,label:'RB' },
    { x:38,y:56,label:'CDM'},{ x:62,y:56,label:'CDM'},
    { x:22,y:34,label:'LW' },{ x:50,y:30,label:'CAM'},{ x:78,y:34,label:'RW' },
    { x:50,y:13,label:'ST' },
  ]},
  { id: '352',  name: '3-5-2',   positions: [
    { x:50,y:90,label:'GK' },
    { x:28,y:72,label:'CB' },{ x:50,y:72,label:'CB' },{ x:72,y:72,label:'CB' },
    { x:10,y:46,label:'LWB'},{ x:30,y:41,label:'CM' },{ x:50,y:36,label:'CM' },{ x:70,y:41,label:'CM' },{ x:90,y:46,label:'RWB'},
    { x:38,y:14,label:'ST' },{ x:62,y:14,label:'ST' },
  ]},
  { id: '532',  name: '5-3-2',   positions: [
    { x:50,y:90,label:'GK' },
    { x:10,y:76,label:'LWB'},{ x:28,y:80,label:'CB' },{ x:50,y:80,label:'CB' },{ x:72,y:80,label:'CB' },{ x:90,y:76,label:'RWB'},
    { x:30,y:46,label:'CM' },{ x:50,y:41,label:'CM' },{ x:70,y:46,label:'CM' },
    { x:38,y:14,label:'ST' },{ x:62,y:14,label:'ST' },
  ]},
  { id: '4141', name: '4-1-4-1', positions: [
    { x:50,y:90,label:'GK' },
    { x:15,y:76,label:'LB' },{ x:35,y:76,label:'CB' },{ x:65,y:76,label:'CB' },{ x:85,y:76,label:'RB' },
    { x:50,y:60,label:'CDM'},
    { x:15,y:40,label:'LM' },{ x:35,y:40,label:'CM' },{ x:65,y:40,label:'CM' },{ x:85,y:40,label:'RM' },
    { x:50,y:13,label:'ST' },
  ]},
  { id: '343',  name: '3-4-3',   positions: [
    { x:50,y:90,label:'GK' },
    { x:28,y:76,label:'CB' },{ x:50,y:76,label:'CB' },{ x:72,y:76,label:'CB' },
    { x:15,y:46,label:'LM' },{ x:38,y:46,label:'CM' },{ x:62,y:46,label:'CM' },{ x:85,y:46,label:'RM' },
    { x:22,y:16,label:'LW' },{ x:50,y:11,label:'ST' },{ x:78,y:16,label:'RW' },
  ]},
  { id: '451',  name: '4-5-1',   positions: [
    { x:50,y:90,label:'GK' },
    { x:15,y:76,label:'LB' },{ x:35,y:76,label:'CB' },{ x:65,y:76,label:'CB' },{ x:85,y:76,label:'RB' },
    { x:12,y:44,label:'LM' },{ x:30,y:39,label:'CM' },{ x:50,y:35,label:'CM' },{ x:70,y:39,label:'CM' },{ x:88,y:44,label:'RM' },
    { x:50,y:13,label:'ST' },
  ]},
  { id: '3412', name: '3-4-1-2', positions: [
    { x:50,y:90,label:'GK' },
    { x:28,y:76,label:'CB' },{ x:50,y:76,label:'CB' },{ x:72,y:76,label:'CB' },
    { x:15,y:50,label:'LM' },{ x:38,y:50,label:'CM' },{ x:62,y:50,label:'CM' },{ x:85,y:50,label:'RM' },
    { x:50,y:30,label:'CAM'},
    { x:38,y:11,label:'ST' },{ x:62,y:11,label:'ST' },
  ]},
  { id: '4312', name: '4-3-1-2', positions: [
    { x:50,y:90,label:'GK' },
    { x:15,y:76,label:'LB' },{ x:35,y:76,label:'CB' },{ x:65,y:76,label:'CB' },{ x:85,y:76,label:'RB' },
    { x:28,y:50,label:'CM' },{ x:50,y:50,label:'CM' },{ x:72,y:50,label:'CM' },
    { x:50,y:30,label:'CAM'},
    { x:38,y:11,label:'ST' },{ x:62,y:11,label:'ST' },
  ]},
];

// ─── Auto-Formation Helpers ─────────────────────────────────────────────────
const POS_ROLE = {
  GK:'GK', CB:'DEF', LB:'DEF', RB:'DEF', LWB:'DEF', RWB:'DEF',
  CDM:'CDM', CM:'MID', CAM:'MID', LM:'MID', RM:'MID',
  LW:'ATT', RW:'ATT', ST:'ATT', CF:'ATT',
};
const SLOT_PREFS = {
  GK:  ['GK'],
  LB:  ['LB','LWB','CB','RB','CM'],
  CB:  ['CB','LB','RB','CDM','CM'],
  RB:  ['RB','RWB','CB','LB','CM'],
  LWB: ['LWB','LB','LM','CB'],
  RWB: ['RWB','RB','RM','CB'],
  CDM: ['CDM','CM','CB','CAM'],
  CM:  ['CM','CDM','CAM','LM','RM','CB'],
  LM:  ['LM','LWB','LW','CM','CAM'],
  RM:  ['RM','RWB','RW','CM','CAM'],
  CAM: ['CAM','CM','LW','RW','ST'],
  LW:  ['LW','LM','CAM','RW','ST'],
  RW:  ['RW','RM','CAM','LW','ST'],
  ST:  ['ST','CF','LW','RW','CAM'],
  CF:  ['CF','ST','CAM','LW','RW'],
};

function pickBestFormation(squad) {
  const squadRoles = {};
  squad.forEach(p => { const r = POS_ROLE[p.primaryPos] || 'MID'; squadRoles[r] = (squadRoles[r] || 0) + 1; });
  let best = FORMATIONS[0], bestScore = -Infinity;
  for (const f of FORMATIONS) {
    const formRoles = {};
    f.positions.forEach(pos => { const r = POS_ROLE[pos.label] || 'MID'; formRoles[r] = (formRoles[r] || 0) + 1; });
    let score = 0;
    for (const role of ['GK','DEF','CDM','MID','ATT']) score -= Math.abs((formRoles[role]||0)-(squadRoles[role]||0));
    if (score > bestScore) { bestScore = score; best = f; }
  }
  return best;
}

function autoFillSlots(squad, formation) {
  const slots = makeSlots(formation);
  const pool  = [...squad];
  const ROLE_ORDER = ['GK','DEF','CDM','MID','ATT'];
  const slotPriority = label => ROLE_ORDER.indexOf(POS_ROLE[label] || 'MID');
  const sorted = [...slots].sort((a, b) => slotPriority(a.pos.label) - slotPriority(b.pos.label));
  for (const slot of sorted) {
    const prefs = SLOT_PREFS[slot.pos.label] || [];
    let picked = null;
    for (const pos of prefs) {
      const idx = pool.findIndex(p => p.primaryPos === pos);
      if (idx >= 0) { picked = pool.splice(idx, 1)[0]; break; }
    }
    if (!picked && pool.length) picked = pool.splice(0, 1)[0];
    if (picked) slot.player = picked;
  }
  return slots;
}

// ─── Canvas Lineup Download ────────────────────────────────────────────────
function _rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arcTo(x+w,y, x+w,y+r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x+w,y+h, x+w-r,y+h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x,y+h, x,y+h-r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x,y, x+r,y, r);
  ctx.closePath();
}
function _drawCanvasPitch(ctx, px, py, pw, ph) {
  // green pitch with stripes
  const g = ctx.createLinearGradient(px,py,px,py+ph);
  g.addColorStop(0,'#1a4a2e'); g.addColorStop(0.25,'#1f5733');
  g.addColorStop(0.5,'#1a4a2e'); g.addColorStop(0.75,'#1f5733'); g.addColorStop(1,'#1a4a2e');
  ctx.fillStyle = g; _rrect(ctx, px, py, pw, ph, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
  _rrect(ctx, px, py, pw, ph, 8); ctx.stroke();
  // halfway
  ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath(); ctx.moveTo(px+pw*.1,py+ph*.5); ctx.lineTo(px+pw*.9,py+ph*.5); ctx.stroke();
  // center circle
  ctx.beginPath(); ctx.arc(px+pw/2,py+ph/2,pw*.1,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(px+pw/2,py+ph/2,2.5,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fill();
  // penalty boxes
  ctx.strokeStyle='rgba(255,255,255,0.4)';
  ctx.strokeRect(px+pw*.22, py, pw*.56, ph*.18);
  ctx.strokeRect(px+pw*.22, py+ph*.82, pw*.56, ph*.18);
  // goals
  ctx.fillStyle='rgba(255,255,255,0.08)';
  ctx.fillRect(px+pw*.38, py, pw*.24, ph*.04);
  ctx.strokeRect(px+pw*.38, py, pw*.24, ph*.04);
  ctx.fillRect(px+pw*.38, py+ph*.96, pw*.24, ph*.04);
  ctx.strokeRect(px+pw*.38, py+ph*.96, pw*.24, ph*.04);
}
function _drawPlayerToken(ctx, cx, cy, player, color) {
  const R = 20;
  // shadow
  ctx.save(); ctx.shadowColor='rgba(0,0,0,0.5)'; ctx.shadowBlur=8;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
  ctx.fillStyle = color; ctx.globalAlpha=0.92; ctx.fill();
  ctx.restore();
  // border
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
  ctx.strokeStyle='rgba(255,255,255,0.8)'; ctx.lineWidth=1.8; ctx.stroke();
  // overall rating
  const ovr = player?.overall?.toString() || '';
  ctx.fillStyle='#fff'; ctx.font='bold 11px Arial,sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(ovr, cx, cy);
  // name label
  const nm = (player?.name||'').split(' ').slice(-1)[0];
  const nmW = Math.min(ctx.measureText(nm).width + 10, 64);
  ctx.fillStyle='rgba(0,0,0,0.78)';
  _rrect(ctx, cx - nmW/2, cy+R+2, nmW, 13, 3); ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='bold 8px Arial,sans-serif'; ctx.textBaseline='top';
  ctx.fillText(nm, cx, cy+R+4);
}

function downloadLineupCanvas(players, lineups) {
  const CW = 1240, CH = 860;
  const canvas = document.createElement('canvas');
  canvas.width = CW; canvas.height = CH;
  const ctx = canvas.getContext('2d');

  // Background
  const bg = ctx.createLinearGradient(0,0,0,CH);
  bg.addColorStop(0,'#0d0d1f'); bg.addColorStop(1,'#070710');
  ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

  // Header
  ctx.textAlign='center';
  ctx.fillStyle='#ffd700'; ctx.font='bold 20px Arial,sans-serif';
  ctx.fillText('\u26BD  Auction Room — Squad Lineups', CW/2, 34);

  // Divider
  ctx.save(); ctx.setLineDash([6,5]);
  ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(CW/2,60); ctx.lineTo(CW/2,CH-12); ctx.stroke();
  ctx.restore();

  const pitchW=540, pitchH=730, pitchY=90;

  for (let i=0; i<2; i++) {
    const lineup  = lineups?.[i];
    const pl      = players[i];
    const color   = PLAYER_COLORS[i];
    const pitchX  = i===0 ? 25 : CW/2+35;

    // Manager name
    ctx.fillStyle=color; ctx.font='bold 19px Arial,sans-serif'; ctx.textAlign='center';
    ctx.fillText(pl.name, pitchX+pitchW/2, pitchY-32);
    // Formation name
    if (lineup) {
      ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='13px Arial,sans-serif';
      ctx.fillText(lineup.formation.name, pitchX+pitchW/2, pitchY-12);
    }
    // Draw pitch
    _drawCanvasPitch(ctx, pitchX, pitchY, pitchW, pitchH);

    // Draw players
    if (lineup) {
      lineup.formation.positions.forEach((pos, j) => {
        const p = lineup.orderedPlayers?.[j];
        if (!p) return;
        const cx = pitchX + (pos.x/100)*pitchW;
        const cy = pitchY  + (pos.y/100)*pitchH;
        _drawPlayerToken(ctx, cx, cy, p, color);
      });
    }
  }

  const link = document.createElement('a');
  link.download = 'auction-lineups.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function fmt(n) { return Number(n).toLocaleString(); }

function seededRand(seed) {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

function preloadImage(url) {
  if (!url || imageCache.has(url)) return;
  imageCache.add(url);
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
}

function assetUrl(url) {
  if (!url) return '';
  if (url.startsWith('/')) return `${BACKEND}${url}`;
  return url;
}

function playerImage(player) {
  return assetUrl(player?.faceImageUrl || player?.faceUrl);
}

function initials(text = '') {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'FC';
}

function BadgeImage({ src, alt, className, fallback }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <span className={`${className} badge-fallback`}>{fallback}</span>;
  return (
    <img
      src={assetUrl(src)}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

// ─── Confetti ────────────────────────────────────────────────────────────────
const C_COLORS = ['#f59e0b','#7c3aed','#22c55e','#3b82f6','#ef4444','#ffd700','#a78bfa','#fb7185'];
function Confetti() {
  const pieces = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    style: {
      left: `${seededRand(i + 1) * 100}%`,
      background: C_COLORS[i % C_COLORS.length],
      width: `${6 + seededRand(i + 2) * 8}px`,
      height: `${6 + seededRand(i + 3) * 8}px`,
      borderRadius: seededRand(i + 4) > 0.5 ? '50%' : '3px',
      animationDuration: `${1.5 + seededRand(i + 5) * 2}s`,
      animationDelay: `${seededRand(i + 6) * 0.8}s`,
    }
  }));
  return <div className="confetti-container">{pieces.map(p => <div key={p.id} className="confetti-piece" style={p.style} />)}</div>;
}

// ─── Timer Ring ─────────────────────────────────────────────────────────────
function TimerRing({ seconds }) {
  const r = 18, circ = 2 * Math.PI * r;
  const ratio  = seconds / TIMER_FULL;
  const offset = circ * (1 - ratio);
  const color  = ratio > 0.5 ? '#a78bfa' : ratio > 0.25 ? '#f59e0b' : '#ef4444';
  return (
    <div className="timer-wrap">
      <svg width="46" height="46" className="timer-ring-svg">
        <circle className="timer-ring-bg" cx="23" cy="23" r={r} strokeWidth="3" />
        <circle className="timer-ring-fg" cx="23" cy="23" r={r} strokeWidth="3"
          stroke={color} strokeDasharray={circ} strokeDashoffset={offset} />
        <text x="23" y="23" textAnchor="middle" dominantBaseline="central"
          fill="#fff" fontSize="11" fontWeight="800" fontFamily="Outfit,sans-serif"
          transform="rotate(90 23 23)">{seconds}</text>
      </svg>
      <span className="timer-label">seconds left</span>
    </div>
  );
}

// ─── Player Card ─────────────────────────────────────────────────────────────
function PlayerCard({ player, flipped }) {
  const color = TIER_COLOR[player?.tier] || '#a78bfa';
  const [loadedPhotoId, setLoadedPhotoId] = useState(null);
  const photoReady = loadedPhotoId === player?.id;
  const stats = player ? [
    { label: 'PAC', val: player.pace },
    { label: 'SHO', val: player.shooting },
    { label: 'PAS', val: player.passing },
    { label: 'DRI', val: player.dribbling },
    { label: 'DEF', val: player.defending },
    { label: 'PHY', val: player.physic },
  ] : [];

  return (
    <div className="card-scene">
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
        {/* BACK */}
        <div className="card-face card-back">
          <div className="card-back-pattern" />
          <span className="card-back-icon"><Shield size={40} strokeWidth={1.5} /></span>
          <span className="card-back-text">Next Player</span>
        </div>

        {/* FRONT — authentic FUT-style card */}
        <div className="card-face card-front" style={{ '--tier-color': color }}>
          <div className="card-holo" />

          {/* Top: left info column + large photo */}
          <div className="card-top">
            <div className="card-left-col">
              <div className="card-ovr">{player?.overall}</div>
              <div className="card-pos-text">{player?.primaryPos}</div>
              <div className="card-left-icons">
                <div className="card-left-icon-img">
                  <BadgeImage
                    src={player?.flagUrl}
                    alt={player?.nationality}
                    className="card-flag"
                    fallback={player?.countryCode?.toUpperCase() || initials(player?.nationality)}
                  />
                </div>
                <div className="card-left-icon-img card-club-icon">
                  <BadgeImage
                    src={player?.clubLogoUrl}
                    alt={player?.club}
                    className="card-club-logo"
                    fallback={initials(player?.club)}
                  />
                </div>
              </div>
            </div>
            <div className="card-photo-wrap">
              {!photoReady && <div className="card-photo-skeleton">{initials(player?.name)}</div>}
              <img
                src={playerImage(player)}
                alt={player?.name}
                className="card-photo"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                referrerPolicy="no-referrer"
                onLoad={() => setLoadedPhotoId(player?.id)}
                onError={e => { setLoadedPhotoId(player?.id); e.currentTarget.style.display = 'none'; }}
              />
              <div className="card-photo-gradient" />
            </div>
          </div>

          {/* Name bar */}
          <div className="card-name-bar">
            <span className="card-name">{player?.name}</span>
          </div>

          {/* Tier divider line */}
          <div className="card-divider" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

          {/* 6 stats across the bottom */}
          <div className="card-stats-row">
            {stats.map(s => (
              <div key={s.label} className="card-stat-block">
                <span className="card-stat-val" style={{ color: STAT_COLOR(s.val) }}>{s.val}</span>
                <span className="card-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Squad Mini Card ─────────────────────────────────────────────────────────
function SquadMiniCard({ player }) {
  const color = TIER_COLOR[player.tier];
  return (
    <div className="squad-player-mini" style={{ borderColor: `${color}22` }}>
      <img
        src={playerImage(player)}
        alt={player.name}
        className="squad-mini-photo"
        referrerPolicy="no-referrer"
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />
      <div className="squad-mini-info">
        <div className="squad-mini-name">{player.name}</div>
        <div className="squad-mini-sub">
          <span style={{ color, fontWeight: 700 }}>{player.primaryPos}</span>
          <span>·</span><span>{player.club}</span>
        </div>
        <div className="squad-mini-badges">
          <BadgeImage src={player.flagUrl} alt={player.nationality} className="squad-mini-flag" fallback={player.countryCode?.toUpperCase() || initials(player.nationality)} />
          <BadgeImage src={player.clubLogoUrl} alt={player.club} className="squad-mini-club" fallback={initials(player.club)} />
        </div>
      </div>
      <div className="squad-mini-overall">{player.overall}</div>
    </div>
  );
}

// ─── Player Squad Panel ───────────────────────────────────────────────────────
function PlayerPanel({ player, playerIndex, isRight }) {
  const accentColor = PLAYER_COLORS[playerIndex];
  const filled = player.squad.length;

  return (
    <div className={`player-panel ${isRight ? 'panel-right' : 'panel-left'}`}
      style={{ '--accent': accentColor }}>
      <div className="panel-header">
        <div className="panel-avatar" style={{ background: `${accentColor}22`, border: `2px solid ${accentColor}55` }}>
          <Circle size={18} fill={accentColor} color={accentColor} />
        </div>
        <div>
          <div className="panel-name">{player.name}</div>
          <div className="panel-wallet"><Coins size={13} style={{ display:'inline', verticalAlign:'middle', marginRight:4 }} />{fmt(player.wallet)}</div>
        </div>
        <div className="panel-squad-badge" style={{ background: `${accentColor}22`, color: accentColor }}>
          {filled}/{TOTAL_SLOTS}
        </div>
      </div>
      <div className="squad-progress-bar-wrap">
        <div className="squad-progress-bar" style={{ width: `${(filled/TOTAL_SLOTS)*100}%`, background: accentColor }} />
      </div>
      <div className="panel-spent">
        <span>Spent</span>
        <span style={{ color: accentColor, fontWeight: 700 }}><Coins size={13} style={{ display:'inline', verticalAlign:'middle', marginRight:4 }} />{fmt(player.spent)}</span>
      </div>
      <div className="panel-squad-list">
        {player.squad.map((p, i) => <SquadMiniCard key={i} player={p} />)}
        {Array.from({ length: Math.max(0, TOTAL_SLOTS - filled) }, (_, i) => (
          <div key={i} className="squad-empty-slot">
            <div className="slot-circle" style={{ borderColor: `${accentColor}30` }} />
            <span className="slot-text">Empty slot</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Per-player bid input box ────────────────────────────────────────────────────────────
const QUICK_ADDS = [5_000, 10_000, 25_000, 50_000, 100_000];

function PlayerBidBox({ player, idx, minAmount, isLeading, onBid, disabled }) {
  const color = PLAYER_COLORS[idx];
  const [amount, setAmount] = React.useState(minAmount);
  const squadFull = player.squad.length >= TOTAL_SLOTS;

  // Reset to minimum whenever the player card changes (minAmount prop changes)
  React.useEffect(() => { setAmount(minAmount); }, [minAmount]);

  const addAmount = (n) => setAmount(a => Math.min(a + n, player.wallet));
  const canBid = amount >= minAmount && player.wallet >= amount;

  if (isLeading) {
    return (
      <div className="player-bid-box pbx-leading" style={{ '--pbx-color': color }}>
        <div className="pbx-name" style={{ color }}><CheckCircle size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:5 }} />{player.name}</div>
        <div className="pbx-leading-amt"><Coins size={13} style={{ display:'inline', verticalAlign:'middle', marginRight:4 }} />{fmt(minAmount)}</div>
        <div className="pbx-leading-sub">Current highest bid</div>
      </div>
    );
  }

  return (
    <div className="player-bid-box" style={{ '--pbx-color': color }}>
      <div className="pbx-name" style={{ color }}>{player.name}</div>
      {squadFull && <div className="pbx-full-note">Squad complete</div>}

      {/* Amount input */}
      <div className="pbx-input-row">
        <span className="pbx-coin"><Coins size={16} /></span>
        <input
          id={`input-bid-p${idx + 1}`}
          type="number"
          className="pbx-input"
          style={{ '--pbx-color': color }}
          value={amount}
          min={minAmount}
          max={player.wallet}
          step={1000}
          disabled={squadFull}
          onChange={e => {
            const v = Number(e.target.value) || minAmount;
            setAmount(Math.max(minAmount, Math.min(player.wallet, v)));
          }}
        />
      </div>

      {/* Quick-add chips */}
      <div className="pbx-chips">
        {QUICK_ADDS.map(n => (
          <button
            key={n}
            className="pbx-chip"
            style={{ '--pbx-color': color }}
            disabled={disabled || player.wallet < amount + n}
            onClick={() => addAmount(n)}
          >
            +{n >= 1_000 ? `${n / 1_000}K` : n}
          </button>
        ))}
      </div>

      {/* Bid / Outbid button */}
      <button
        id={`btn-bid-p${idx + 1}`}
        className="pbx-bid-btn"
        style={{ '--pbx-color': color }}
        disabled={disabled || !canBid}
        onClick={() => onBid(idx, amount)}
      >
        {minAmount === (player.wallet >= 0 ? minAmount : 0) && !isLeading
          ? <><Wallet size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:5 }} />BID <Coins size={13} style={{ display:'inline', verticalAlign:'middle', marginInline:4 }} />{fmt(amount)}</>
          : <><ArrowUpCircle size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:5 }} />Outbid <Coins size={13} style={{ display:'inline', verticalAlign:'middle', marginInline:4 }} />{fmt(amount)}</>}
      </button>
    </div>
  );
}

// ─── Bid Controls ─────────────────────────────────────────────────────────────
// Phase A (no bid):   two PlayerBidBox side-by-side + Skip
// Phase B (bid done): Leading box (greyed) + Outbid box + Confirm button
function BidControls({ currentPlayer, currentBid, players, onBid, onSkip, onConfirm, disabled, flipped }) {
  if (!flipped || !currentPlayer) return null;

  const base = currentPlayer.basePrice;

  return (
    <div className="bid-controls">
      <div className="bid-boxes-row">
        {players.map((pl, idx) => {
          const isLeading = !!currentBid && currentBid.playerIndex === idx;
          // minimum amount: base price if no bid yet, else currentBid + increment
          const minAmt = currentBid ? currentBid.amount + BID_INCREMENT : base;

          return (
            <PlayerBidBox
              key={idx}
              player={pl}
              idx={idx}
              minAmount={isLeading ? currentBid.amount : minAmt}
              isLeading={isLeading}
              onBid={onBid}
              disabled={disabled || pl.squad.length >= TOTAL_SLOTS}
            />
          );
        })}
      </div>

      {/* Confirm button (only shown once a bid exists) */}
      {currentBid && (
        <button
          id="btn-confirm"
          className="btn-confirm"
          style={{ '--btn-color': PLAYER_COLORS[currentBid.playerIndex] }}
          disabled={disabled}
          onClick={onConfirm}
        >
          <CheckCircle size={15} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />Confirm — {players[currentBid.playerIndex].name} signs for <Coins size={13} style={{ display:'inline', verticalAlign:'middle', marginInline:4 }} />{fmt(currentBid.amount)}
        </button>
      )}

      {/* Skip only available before any bid */}
      {!currentBid && (
        <button id="btn-skip" className="btn-skip" disabled={disabled} onClick={onSkip}>
          <SkipForward size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:5 }} />Skip Player
        </button>
      )}
    </div>
  );
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [names, setNames] = useState(['Player 1', 'Player 2']);
  return (
    <div className="setup-overlay">
      <div className="setup-box">
        <div className="setup-icon"><Trophy size={40} strokeWidth={1.5} /></div>
        <h1 className="setup-title">Auction Room</h1>
        <p className="setup-sub">Two managers. One budget. Build the best squad.</p>
        <div className="setup-players">
          {[0, 1].map(i => (
            <div key={i} className="setup-player-field">
              <div className="setup-field-avatar" style={{ background: `${PLAYER_COLORS[i]}22`, color: PLAYER_COLORS[i] }}>
                <Circle size={18} fill={PLAYER_COLORS[i]} color={PLAYER_COLORS[i]} />
              </div>
              <input
                id={`input-player-${i + 1}`}
                className="setup-input"
                style={{ '--field-color': PLAYER_COLORS[i] }}
                value={names[i]}
                maxLength={20}
                onChange={e => { const n = [...names]; n[i] = e.target.value; setNames(n); }}
                onKeyDown={e => e.key === 'Enter' && names[0] && names[1] && onStart(names)}
                placeholder={`Manager ${i + 1} name`}
              />
            </div>
          ))}
        </div>
        <div className="setup-rules">
          <div className="setup-rule"><Coins size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} /><strong>10,000,000 tokens</strong> each to spend</div>
          <div className="setup-rule"><Star size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />Players rated <strong>80–95</strong> overall</div>
          <div className="setup-rule"><Clock size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} /><strong>15 seconds</strong> to place first bid — or player is skipped</div>
          <div className="setup-rule"><ArrowUpCircle size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />After first bid, both can <strong>outbid freely</strong> (+5,000 min)</div>
          <div className="setup-rule"><CheckCircle size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />Click <strong>Confirm</strong> to lock in the current highest bid</div>
          <div className="setup-rule"><Trophy size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} /><strong>Both managers</strong> must sign <strong>11 players</strong> to end the auction</div>
        </div>
        <button
          id="btn-start-auction"
          className="setup-btn"
          disabled={!names[0].trim() || !names[1].trim()}
          onClick={() => onStart(names.map(n => n.trim()))}
        >
          Start Auction <Rocket size={16} style={{ display:'inline', verticalAlign:'middle', marginLeft:6 }} />
        </button>
      </div>
    </div>
  );
}

// ─── Formation Picker Phase ───────────────────────────────────────────────────
function makeSlots(formation) {
  return formation.positions.map((pos, idx) => ({ id: `slot-${idx}`, player: null, pos }));
}

function FormationPickerPhase({ players, lineupStep, confirmedLineups, onConfirm, onDownload }) {
  const player       = players[lineupStep];
  const accentColor  = PLAYER_COLORS[lineupStep];
  const [formation,  setFormation]  = useState(FORMATIONS[0]);
  const [slots,      setSlots]      = useState(() => makeSlots(FORMATIONS[0]));
  const [selected,   setSelected]   = useState(null); // bench player id waiting to be placed
  const [dragPlayer, setDragPlayer] = useState(null);

  // When the step changes (player 2 takes over), reset
  useEffect(() => {
    setFormation(FORMATIONS[0]);
    setSlots(makeSlots(FORMATIONS[0]));
    setSelected(null);
  }, [lineupStep]);

  const changeFormation = (id) => {
    const f = FORMATIONS.find(f => f.id === id);
    if (!f) return;
    setFormation(f);
    setSlots(makeSlots(f));
    setSelected(null);
  };

  const placedIds = new Set(slots.filter(s => s.player).map(s => s.player.id || s.player.name));
  const bench     = player.squad.filter(p => !placedIds.has(p.id || p.name));
  const allFilled = slots.every(s => s.player !== null);

  // ── Auto-assign ─────────────────────────────────────────────────────────────
  const handleAutoAssign = () => {
    const bestFormation = pickBestFormation(player.squad);
    setFormation(bestFormation);
    setSlots(autoFillSlots(player.squad, bestFormation));
    setSelected(null);
  };

  // ── Click-to-place ──────────────────────────────────────────────────────────
  const handleBenchClick = (p) => {
    setSelected(prev => (prev === (p.id || p.name) ? null : (p.id || p.name)));
  };

  const handleSlotClick = (slotId) => {
    // If a bench player is selected, place it
    if (selected) {
      const p = player.squad.find(p => (p.id || p.name) === selected);
      if (!p) return;
      setSlots(prev => {
        let next = prev.map(s => s.id === slotId ? { ...s, player: p } : s);
        return next;
      });
      setSelected(null);
      return;
    }
    // If slot is filled and nothing selected — deselect slot (remove player)
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, player: null } : s));
  };

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  const handleBenchDragStart = (e, p) => {
    setDragPlayer({ player: p, fromSlot: null });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSlotDragStart = (e, slotId, p) => {
    setDragPlayer({ player: p, fromSlot: slotId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSlotDrop = (e, targetSlotId) => {
    e.preventDefault();
    if (!dragPlayer) return;
    const { player: p, fromSlot } = dragPlayer;
    setSlots(prev => {
      let next = [...prev];
      const targetIdx = next.findIndex(s => s.id === targetSlotId);
      const sourceIdx = fromSlot ? next.findIndex(s => s.id === fromSlot) : -1;
      const displaced = next[targetIdx].player;
      next[targetIdx] = { ...next[targetIdx], player: p };
      if (sourceIdx >= 0) next[sourceIdx] = { ...next[sourceIdx], player: displaced };
      return next;
    });
    setDragPlayer(null);
  };

  const handleClearAll = () => {
    setSlots(prev => prev.map(s => ({ ...s, player: null })));
    setSelected(null);
  };

  const handleConfirmClick = () => {
    const orderedPlayers = slots.map(s => s.player);
    onConfirm(lineupStep, formation, orderedPlayers);
  };

  return (
    <div className="fp-overlay">
      <div className="fp-box">
        {/* ── Step Header */}
        <div className="fp-step-header">
          <div className="fp-step-badges">
            {[0,1].map(i => (
              <div key={i} className={`fp-step-badge ${i === lineupStep ? 'active' : i < lineupStep ? 'done' : ''}`}
                style={i === lineupStep ? { '--fp-accent': PLAYER_COLORS[i] } : {}}
              >
                <Circle size={10} fill={i <= lineupStep ? PLAYER_COLORS[i] : '#333'} color={i <= lineupStep ? PLAYER_COLORS[i] : '#444'} />
                <span style={{ color: i === lineupStep ? PLAYER_COLORS[i] : i < lineupStep ? '#666' : '#444' }}>
                  {players[i].name}
                </span>
                {i < lineupStep && <CheckCircle size={12} color="#22c55e" />}
              </div>
            ))}
          </div>
          <div className="fp-title">
            <LayoutGrid size={18} color={accentColor} />
            <span style={{ color: accentColor }}>{player.name}</span>
            <span>'s Formation</span>
          </div>
          <div className="fp-formation-select-wrap">
            <select
              className="fp-formation-select"
              style={{ '--fp-accent': accentColor }}
              value={formation.id}
              onChange={e => changeFormation(e.target.value)}
            >
              {FORMATIONS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        </div>

        {/* ── Main Body: Pitch + Bench */}
        <div className="fp-body">

          {/* ── Pitch */}
          <div className="fp-pitch-wrap">
            <div className="fp-pitch">
              {/* Pitch markings */}
              <div className="fp-pitch-line fp-half" />
              <div className="fp-pitch-circle" />
              <div className="fp-pitch-dot" />
              <div className="fp-penalty-box top" />
              <div className="fp-penalty-box bottom" />
              <div className="fp-goal top" />
              <div className="fp-goal bottom" />

              {/* Position slots */}
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`fp-slot ${slot.player ? 'fp-slot-filled' : 'fp-slot-empty'} ${selected && !slot.player ? 'fp-slot-hinted' : ''}`}
                  style={{ left: `${slot.pos.x}%`, top: `${slot.pos.y}%` }}
                  onClick={() => handleSlotClick(slot.id)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleSlotDrop(e, slot.id)}
                >
                  {slot.player ? (
                    <div
                      className="fp-player-token"
                      style={{ '--tok-color': accentColor }}
                      draggable
                      onDragStart={e => handleSlotDragStart(e, slot.id, slot.player)}
                    >
                      <div className="fp-token-photo-wrap">
                        <img
                          src={playerImage(slot.player)}
                          alt={slot.player.name}
                          className="fp-token-photo"
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="fp-token-name">
                        {slot.player.name?.split(' ').slice(-1)[0] || slot.player.name}
                      </span>
                      <button
                        className="fp-token-remove"
                        onClick={e => { e.stopPropagation(); setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, player: null } : s)); }}
                      >
                        <X size={8} />
                      </button>
                    </div>
                  ) : (
                    <div className="fp-slot-label">{slot.pos.label}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Slot fill count */}
            <div className="fp-fill-count" style={{ color: accentColor }}>
              {slots.filter(s => s.player).length}/11 placed
            </div>
          </div>

          {/* ── Bench */}
          <div className="fp-bench">
            <div className="fp-bench-header">
              <Users size={14} />
              <span>Your Squad</span>
              <button className="fp-auto-btn" style={{ '--fp-accent': accentColor }} onClick={handleAutoAssign} title="Auto-pick best formation & fill positions">
                ⚡ Auto
              </button>
              <button className="fp-clear-btn" onClick={handleClearAll}>Clear</button>
            </div>
            <div className="fp-bench-list">
              {player.squad.map((p, i) => {
                const pid = p.id || p.name;
                const isPlaced   = placedIds.has(pid);
                const isSelected = selected === pid;
                return (
                  <div
                    key={i}
                    className={`fp-bench-card ${isPlaced ? 'fp-bench-placed' : ''} ${isSelected ? 'fp-bench-selected' : ''}`}
                    style={isSelected ? { '--fp-accent': accentColor } : {}}
                    draggable={!isPlaced}
                    onDragStart={e => !isPlaced && handleBenchDragStart(e, p)}
                    onClick={() => !isPlaced && handleBenchClick(p)}
                  >
                    <div className="fp-bench-photo-wrap">
                      <img
                        src={playerImage(p)}
                        alt={p.name}
                        className="fp-bench-photo"
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                        referrerPolicy="no-referrer"
                      />
                      {isPlaced && <div className="fp-bench-placed-overlay"><CheckCircle size={14} color="#22c55e" /></div>}
                    </div>
                    <div className="fp-bench-info">
                      <div className="fp-bench-name">{p.name}</div>
                      <div className="fp-bench-meta">
                        <span style={{ color: TIER_COLOR[p.tier], fontWeight:700 }}>{p.primaryPos}</span>
                        <span className="fp-bench-ovr">{p.overall}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Footer Actions */}
        <div className="fp-footer">
          <p className="fp-hint">
            {selected
              ? <><strong>Click a slot</strong> on the pitch to place the selected player   </>
              : 'Click a bench player then a slot — or drag & drop. Use ⚡ Auto to fill automatically.'}
          </p>
          <div className="fp-footer-actions">
            {lineupStep === 1 && confirmedLineups?.[0] && (
              <button
                className="fp-download-btn"
                title="Download both lineups as an image"
                onClick={() => onDownload?.(formation, slots)}
              >
                ⬇️ Download Lineups
              </button>
            )}
            <button
              className="fp-confirm-btn"
              style={{ '--fp-accent': accentColor }}
              disabled={!allFilled}
              onClick={handleConfirmClick}
            >
              <CheckCircle size={16} style={{ display:'inline', verticalAlign:'middle', marginRight:7 }} />
              {lineupStep === 0 ? `Confirm ${player.name}'s Lineup →` : 'Start Match Simulation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Results Modal ────────────────────────────────────────────────────────────
function ResultsModal({ players, poolExhausted, onPlayAgain, onPickFormation }) {
  const winner   = [...players].sort((a, b) => {
    if (b.squad.length !== a.squad.length) return b.squad.length - a.squad.length;
    return a.spent - b.spent;
  })[0];
  const winnerIdx = players.indexOf(winner);
  const color     = PLAYER_COLORS[winnerIdx];
  const isDraw    = players[0].squad.length === players[1].squad.length && players[0].spent === players[1].spent;

  return (
    <div className="modal-overlay">
      {!poolExhausted && <Confetti />}
      <div className="modal-box">
        <span className="modal-emoji">{poolExhausted ? <Clock size={48} strokeWidth={1.5} /> : <Trophy size={48} strokeWidth={1.5} />}</span>
        <h2 className="modal-title" style={{ color: isDraw ? '#ffd700' : color }}>
          {poolExhausted ? 'Auction Ended' : isDraw ? "It's a Draw!" : `${winner.name} Wins!`}
        </h2>
        <p className="modal-subtitle">
          {poolExhausted ? 'The player pool has been exhausted.' : 'Final squad comparison:'}
        </p>
        <div className="results-comparison">
          {players.map((pl, i) => (
            <div key={i} className="results-player-col" style={{ '--col-color': PLAYER_COLORS[i] }}>
              <div className="results-col-name" style={{ color: PLAYER_COLORS[i] }}>{pl.name}</div>
              <div className="results-col-stat"><span>Signed</span><strong>{pl.squad.length}</strong></div>
              <div className="results-col-stat"><span>Spent</span><strong><Coins size={13} style={{ display:'inline', verticalAlign:'middle', marginRight:4 }} />{fmt(pl.spent)}</strong></div>
              <div className="results-col-stat"><span>Remaining</span><strong><Coins size={13} style={{ display:'inline', verticalAlign:'middle', marginRight:4 }} />{fmt(pl.wallet)}</strong></div>
              <div className="results-squad-chips">
                {pl.squad.map((p, j) => (
                  <span key={j} className="modal-squad-chip"
                    style={{ borderColor: `${TIER_COLOR[p.tier]}44`, color: TIER_COLOR[p.tier] }}>
                    {p.primaryPos} {p.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="match-sim-question">Pick your formations and simulate the match!</p>
        <div className="modal-action-row">
          <button className="modal-btn-primary" onClick={onPickFormation}>
            <LayoutGrid size={15} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />Pick Formations &amp; Simulate
          </button>
          <button className="modal-btn-secondary" onClick={onPlayAgain}><RefreshCw size={15} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />Play Again</button>
        </div>
      </div>
    </div>
  );
}

function buildMatchSimulation(players, lineups) {
  const [home, away] = players;
  const defaultFormations = [
    { x: 8, y: 50 }, { x: 22, y: 22 }, { x: 22, y: 40 }, { x: 22, y: 60 }, { x: 22, y: 78 },
    { x: 42, y: 28 }, { x: 42, y: 50 }, { x: 42, y: 72 }, { x: 64, y: 25 }, { x: 68, y: 50 }, { x: 64, y: 75 }
  ];
  const tolandscape = (pos) => ({ x: (100 - pos.y) * 0.9, y: pos.x });
  const homeFormPts = lineups?.[0]?.formation?.positions?.map(tolandscape) || defaultFormations;
  const awayFormPts = lineups?.[1]?.formation?.positions?.map(tolandscape) || defaultFormations;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const pick = items => items[Math.floor(Math.random() * items.length)] || items[0];
  const metric = (team, keys, fallback = 65) => {
    if (!team.squad.length) return fallback;
    return team.squad.reduce((sum, p) => sum + keys.reduce((s, key) => s + (p[key] || fallback), 0) / keys.length, 0) / team.squad.length;
  };
  const profile = team => {
    const count = team.squad.length;
    const avg = metric(team, ['overall'], 65);
    const attack = metric(team, ['shooting', 'dribbling', 'pace'], 62);
    const midfield = metric(team, ['passing', 'dribbling', 'physic'], 62);
    const defense = metric(team, ['defending', 'physic'], 60);
    const keeper = metric({ squad: team.squad.filter(p => p.primaryPos === 'GK') }, ['overall'], Math.max(58, defense - 4));
    const completeness = Math.min(1, count / TOTAL_SLOTS);
    const missingPenalty = (TOTAL_SLOTS - count) * 10;
    const chemistry = completeness * 18;
    const power = avg * 0.38 + attack * 0.18 + midfield * 0.18 + defense * 0.16 + keeper * 0.1 + chemistry - missingPenalty;
    return { count, avg, attack, midfield, defense, keeper, completeness, power };
  };
  const scorer = team => {
    const attackers = team.squad.filter(p => ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(p.primaryPos));
    const pool = attackers.length ? attackers : team.squad;
    return pick(pool) || { name: team.name, primaryPos: 'XI' };
  };
  const defender = team => {
    const defenders = team.squad.filter(p => ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM'].includes(p.primaryPos));
    return pick(defenders.length ? defenders : team.squad) || { name: team.name, primaryPos: 'DEF' };
  };
  const sidePlayers = (team, side) => {
    const pts = side === 'home' ? homeFormPts : awayFormPts;
    // If lineup ordering provided, use that; otherwise fall back to squad order
    const orderedSquad = lineups?.[side === 'home' ? 0 : 1]?.orderedPlayers || team.squad;
    return orderedSquad.slice(0, TOTAL_SLOTS).map((player, i) => {
      const spot = pts[i] || defaultFormations[i] || defaultFormations[defaultFormations.length - 1];
      return {
        id: `${side}-${i}`,
        team: team.name,
        player,
        x: side === 'home' ? spot.x : 100 - spot.x,
        y: side === 'home' ? spot.y : 100 - spot.y,
        color: side === 'home' ? PLAYER_COLORS[0] : PLAYER_COLORS[1],
      };
    });
  };
  const homeProfile = profile(home);
  const awayProfile = profile(away);
  const attacks = [5, 9, 14, 18, 23, 29, 34, 39, 44, 49, 54, 59, 64, 70, 75, 80, 85, 89];
  const events = [];
  let homeGoals = 0;
  let awayGoals = 0;

  attacks.forEach((minute, index) => {
    const totalPower = Math.max(1, homeProfile.power + awayProfile.power);
    const homePossessionChance = clamp(0.5 + (homeProfile.power - awayProfile.power) / (totalPower * 2.1), 0.08, 0.92);
    const side = Math.random() < homePossessionChance ? 'home' : 'away';
    const team = side === 'home' ? home : away;
    const opponent = side === 'home' ? away : home;
    const teamProfile = side === 'home' ? homeProfile : awayProfile;
    const opponentProfile = side === 'home' ? awayProfile : homeProfile;
    const runner = scorer(team);
    const marker = defender(opponent);
    const direction = side === 'home' ? 1 : -1;
    const baseX = side === 'home' ? 48 + index * 2.3 : 52 - index * 2.3;
    const lane = 22 + Math.random() * 56;
    const playerMismatch = teamProfile.count - opponentProfile.count;
    const attackEdge =
      teamProfile.attack * 0.38 +
      teamProfile.midfield * 0.28 +
      runner.overall * 0.18 +
      teamProfile.completeness * 24 -
      opponentProfile.defense * 0.28 -
      opponentProfile.keeper * 0.18 -
      opponentProfile.completeness * 16 +
      playerMismatch * 8;
    const shotChance = clamp(0.3 + attackEdge / 150, 0.02, 0.9);
    const goalChance = clamp(0.08 + attackEdge / 220, 0.005, 0.58);
    const tackleChance = clamp(0.42 - attackEdge / 165, 0.05, 0.86);

    events.push({
      type: 'carry',
      minute: Math.max(1, minute - 2),
      side,
      team: team.name,
      player: runner,
      defender: marker,
      activeId: `${side}-${Math.max(0, team.squad.indexOf(runner))}`,
      defenderId: `${side === 'home' ? 'away' : 'home'}-${Math.max(0, opponent.squad.indexOf(marker))}`,
      x: clamp(baseX + direction * 10, 12, 88),
      y: lane,
      text: `${runner.name} carries through midfield`
    });

    if (Math.random() < tackleChance) {
      events.push({
        type: 'tackle',
        minute,
        side: side === 'home' ? 'away' : 'home',
        team: opponent.name,
        player: marker,
        defender: runner,
        activeId: `${side === 'home' ? 'away' : 'home'}-${Math.max(0, opponent.squad.indexOf(marker))}`,
        defenderId: `${side}-${Math.max(0, team.squad.indexOf(runner))}`,
        x: clamp(baseX + direction * 14, 12, 88),
        y: lane + (Math.random() * 14 - 7),
        text: `${marker.name} steps in with a heavy tackle`
      });
      return;
    }

    if (Math.random() < shotChance) {
      const shotX = side === 'home' ? 84 : 16;
      const shotY = 28 + Math.random() * 44;
      const scored = Math.random() < goalChance;
      if (scored) {
        if (side === 'home') homeGoals += 1;
        else awayGoals += 1;
      }
      events.push({
        type: scored ? 'goal' : 'save',
        minute: minute + 1,
        side,
        team: team.name,
        player: runner,
        defender: marker,
        activeId: `${side}-${Math.max(0, team.squad.indexOf(runner))}`,
        defenderId: `${side === 'home' ? 'away' : 'home'}-${Math.max(0, opponent.squad.indexOf(marker))}`,
        x: shotX,
        y: shotY,
        text: scored
          ? `${runner.name} scores after beating ${marker.name}`
          : `${runner.name} shoots, but ${marker.name} blocks the angle`
      });
    }
  });

  const winner = homeGoals === awayGoals ? null : homeGoals > awayGoals ? home : away;
  events.push({
    type: 'final',
    minute: 90,
    side: winner === home ? 'home' : winner === away ? 'away' : 'draw',
    team: winner?.name || 'Full Time',
    player: winner ? scorer(winner) : null,
    x: 50,
    y: 50,
    text: winner ? `${winner.name} protect the result at full time` : 'The match ends level after an honest rating-based simulation'
  });

  return {
    id: `${Date.now()}-${Math.random()}`,
    home,
    away,
    homeGoals,
    awayGoals,
    winner,
    profiles: { home: homeProfile, away: awayProfile },
    players: [...sidePlayers(home, 'home'), ...sidePlayers(away, 'away')],
    events: events.sort((a, b) => a.minute - b.minute),
    headline: winner
      ? `${winner.name} win ${homeGoals}-${awayGoals} from the squad ratings`
      : `${home.name} and ${away.name} draw ${homeGoals}-${awayGoals}`,
  };
}

function MatchSimulationModal({ result, players, lineups, onClose, onReplay }) {
  const [clock, setClock] = useState(0);
  const [running, setRunning] = useState(true);
  const liveEvents = result.events.filter(event => event.minute <= clock);
  const goals = liveEvents.filter(event => event.type === 'goal');
  const homeScore = goals.filter(event => event.side === 'home').length;
  const awayScore = goals.filter(event => event.side === 'away').length;
  const latest = liveEvents[liveEvents.length - 1];
  const ball = latest ? { x: latest.x, y: latest.y } : { x: 50, y: 50 };
  const finished = clock >= 90;
  const displayedPlayers = result.players.map(dot => {
    if (latest?.activeId === dot.id) {
      return { ...dot, x: ball.x, y: ball.y, state: latest.type };
    }
    if (latest?.defenderId === dot.id) {
      return {
        ...dot,
        x: Math.max(5, Math.min(95, ball.x + (latest.side === 'home' ? -4 : 4))),
        y: Math.max(8, Math.min(92, ball.y + 5)),
        state: 'defending'
      };
    }
    const drift = Math.sin((clock + dot.x + dot.y) / 9) * 1.8;
    return { ...dot, y: Math.max(8, Math.min(92, dot.y + drift)), state: 'shape' };
  });

  useEffect(() => {
    if (!running || finished) return undefined;
    const id = setInterval(() => {
      setClock(prev => Math.min(90, prev + 1));
    }, 600);
    return () => clearInterval(id);
  }, [running, finished]);

  return (
    <div className="modal-overlay">
      <div className="modal-box match-modal">
        <span className="modal-emoji"><Zap size={48} strokeWidth={1.5} /></span>
        <h2 className="modal-title" style={{ color: '#ffd700' }}>{finished ? result.headline : 'Live Auction XI Match'}</h2>
        <div className="match-scoreboard">
          <div>
            <span>{result.home.name}</span>
            <strong>{homeScore}</strong>
          </div>
          <span className="match-vs">{finished ? 'FT' : `${clock}' · 100x`}</span>
          <div>
            <strong>{awayScore}</strong>
            <span>{result.away.name}</span>
          </div>
        </div>
        <div className="match-engine-strip">
          <div>
            <strong>{result.profiles.home.count}/11</strong>
            <span>OVR {Math.round(result.profiles.home.avg)} · ATK {Math.round(result.profiles.home.attack)} · DEF {Math.round(result.profiles.home.defense)}</span>
          </div>
          <div>
            <strong>{result.profiles.away.count}/11</strong>
            <span>OVR {Math.round(result.profiles.away.avg)} · ATK {Math.round(result.profiles.away.attack)} · DEF {Math.round(result.profiles.away.defense)}</span>
          </div>
        </div>
        <div className="live-pitch">
          <div className="pitch-line pitch-half" />
          <div className="pitch-circle" />
          <div className="pitch-box pitch-box-left" />
          <div className="pitch-box pitch-box-right" />
          {displayedPlayers.map(dot => (
            <div
              key={dot.id}
              className={`pitch-player pitch-player-${dot.state}`}
              style={{ left: `${dot.x}%`, top: `${dot.y}%`, '--player-color': dot.color }}
              title={dot.player.name}
            >
              <img src={playerImage(dot.player)} alt="" />
              <span>{dot.player.primaryPos}</span>
            </div>
          ))}
          <div className="pitch-ball" style={{ left: `${ball.x}%`, top: `${ball.y}%` }} />
          {latest?.type === 'goal' && <div className="goal-flash" style={{ left: `${latest.x}%`, top: `${latest.y}%` }}>GOAL</div>}
          {latest?.type === 'tackle' && <div className="action-flash" style={{ left: `${latest.x}%`, top: `${latest.y}%` }}>TACKLE</div>}
          {latest?.type === 'save' && <div className="action-flash save-flash" style={{ left: `${latest.x}%`, top: `${latest.y}%` }}>BLOCK</div>}
        </div>
        <div className="match-timeline">
          {liveEvents.slice().reverse().map((event, i) => (
            <div key={i} className="match-event">
              <span className="match-minute">{event.minute}'</span>
              <div>
                <strong>{event.team}</strong>
                <p>{event.text}</p>
              </div>
            </div>
          ))}
          {!liveEvents.length && (
            <div className="match-event">
              <span className="match-minute">0'</span>
              <div>
                <strong>Kickoff</strong>
                <p>The drafted elevens are flying around the pitch at 100x speed.</p>
              </div>
            </div>
          )}
        </div>
        <div className="modal-action-row">
          <button className="modal-btn-primary" onClick={onReplay}><RefreshCw size={15} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />Sim Again</button>
          <button className="modal-btn-secondary" onClick={() => setRunning(r => !r)}>{running && !finished ? 'Pause' : 'Resume'}</button>
          {players && lineups && (
            <button className="modal-btn-secondary" onClick={() => downloadLineupCanvas(players, lineups)} title="Download both lineups as image">
              ⬇️ Lineups
            </button>
          )}
          <button className="modal-btn-secondary" onClick={onClose}>Back to Results</button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return <div className={`auction-toast toast-${type}`}>{msg}</div>;
}

// ─── Main Auction Component ───────────────────────────────────────────────────
export default function Auction() {
  const [phase,      setPhase]      = useState('setup');
  const [players,    setPlayers]    = useState([]);
  const [pool,       setPool]       = useState([]);
  const [poolIndex,  setPoolIndex]  = useState(0);
  const [flipped,    setFlipped]    = useState(false);
  const [currentBid, setCurrentBid] = useState(null);   // {playerIndex, amount} | null
  const [timer,      setTimer]      = useState(TIMER_FULL);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [toast,      setToast]      = useState(null);
  const [poolOut,    setPoolOut]    = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  // ── Lineup / formation picker state ──────────────────────────────────────
  const [lineupStep,   setLineupStep]   = useState(0);       // 0 = player 1, 1 = player 2
  const [lineups,      setLineups]      = useState([null, null]); // confirmed lineups

  const timerRef = useRef(null);
  const toastRef = useRef(null);
  // soldRef prevents the same player being committed to a squad twice
  const soldRef  = useRef(false);

  const currentPlayer = pool[poolIndex] || null;

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (msg, type = 'info', ms = 2000) => {
    clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), ms);
  };

  // ── Advance to next player ─────────────────────────────────────────────────
  const advancePlayer = useCallback(() => {
    clearInterval(timerRef.current);
    soldRef.current = false;
    setCurrentBid(null);
    setTimer(TIMER_FULL);
    setPoolIndex(prev => {
      const next = prev + 1;
      if (next >= pool.length) {
        setPoolOut(true);
        setPhase('results');
        return prev;
      }
      return next;
    });
  }, [pool.length]);

  // ── Fetch pool ────────────────────────────────────────────────────────────
  const fetchPool = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${BACKEND}/api/auction/players?count=${POOL_SIZE}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setPool(data.players);
      setPoolIndex(0);
      setFlipped(false);
      setCurrentBid(null);
    } catch {
      setError('Could not load players. Is the backend running on port 5000?');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Start auction ──────────────────────────────────────────────────────────
  const startAuction = useCallback((names) => {
    setPlayers(names.map(name => ({ name, wallet: STARTING_BUDGET, squad: [], spent: 0 })));
    setPhase('auction');
    setMatchResult(null);
    fetchPool();
  }, [fetchPool]);

  useEffect(() => {
    if (!pool.length) return;
    pool.slice(poolIndex, poolIndex + IMAGE_PRELOAD_AHEAD).forEach(player => {
      preloadImage(playerImage(player));
      preloadImage(player.flagUrl);
      preloadImage(player.clubLogoUrl);
    });
  }, [pool, poolIndex]);

  // ── Reveal new card (runs on each new poolIndex) ───────────────────────────
  useEffect(() => {
    if (phase !== 'auction' || loading || pool.length === 0) return;
    soldRef.current = false;
    setFlipped(false);
    setCurrentBid(null);
    setTimer(TIMER_FULL);
    const t = setTimeout(() => setFlipped(true), 350);
    return () => clearTimeout(t);
  }, [phase, loading, poolIndex, pool.length]);

  // ── 15s countdown — only runs BEFORE a bid; stops automatically when
  //    currentBid becomes non-null (effect won't re-run because flipped/
  //    poolIndex haven't changed, but we add currentBid as guard) ──────────
  useEffect(() => {
    if (phase !== 'auction' || !flipped || loading || currentBid) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          showToast('No bids — player skipped', 'info', 1500);
          setTimeout(() => advancePlayer(), 600);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  // advancePlayer is stable (useCallback with pool.length dep)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, flipped, loading, poolIndex]);

  // ── Bid: first bid stops the timer; subsequent bids are outbids ──────────
  const handleBid = useCallback((playerIndex, amount) => {
    if (!currentPlayer) return;
    // Can't bid if you're already the highest bidder
    if (currentBid && currentBid.playerIndex === playerIndex) return;

    const pl = players[playerIndex];
    if (pl.squad.length >= TOTAL_SLOTS) { showToast(`${pl.name}'s squad is already complete`, 'info'); return; }
    if (pl.wallet < amount) { showToast('Not enough tokens!', 'error'); return; }

    // Only stop the 15s interval on the FIRST bid
    if (!currentBid) clearInterval(timerRef.current);

    setCurrentBid({ playerIndex, amount });
    showToast(`${pl.name} bid ${fmt(amount)} tokens!`, 'info', 1500);
  }, [currentPlayer, currentBid, players]);

  // ── Confirm: lock in the sale ────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (!currentBid || !currentPlayer) return;
    if (soldRef.current) return;
    soldRef.current = true;

    const { playerIndex, amount } = currentBid;
    const snapshot = currentPlayer;

    setPlayers(prev => {
      const already = prev[playerIndex].squad.some(
        s => s.name === snapshot.name && s.overall === snapshot.overall
      );
      if (already) return prev;

      const next = prev.map((p, i) => {
        if (i !== playerIndex) return p;
        return {
          ...p,
          wallet: p.wallet - amount,
          spent:  p.spent  + amount,
          squad:  [...p.squad, snapshot],
        };
      });

      const winner = next[playerIndex];
      showToast(`${winner.name} signed ${snapshot.name}!`, 'success', 2500);

      // Auction ends only when BOTH managers have full squads
      if (next.every(p => p.squad.length >= TOTAL_SLOTS)) {
        setTimeout(() => setPhase('results'), 700);
      } else {
        setTimeout(() => advancePlayer(next), 500);
      }
      return next;
    });
  }, [currentBid, currentPlayer, advancePlayer]);

  // ── Skip ───────────────────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    if (currentBid) { showToast('Cannot skip — a bid is placed!', 'error'); return; }
    clearInterval(timerRef.current);
    showToast('Player skipped', 'info', 1200);
    advancePlayer();
  }, [currentBid, advancePlayer]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetAll = () => {
    clearInterval(timerRef.current);
    setPhase('setup'); setPlayers([]); setPool([]);
    setPoolIndex(0);  setFlipped(false); setCurrentBid(null);
    setTimer(TIMER_FULL); setPoolOut(false); setToast(null); setMatchResult(null);
    setLineupStep(0); setLineups([null, null]);
    soldRef.current = false;
  };

  // ── Enter lineup phase ────────────────────────────────────────────────────
  const startLineupPhase = useCallback(() => {
    setLineupStep(0);
    setLineups([null, null]);
    setPhase('lineup');
  }, []);

  // ── Called when a player confirms their formation ─────────────────────────
  const handleLineupConfirm = useCallback((step, formation, orderedPlayers) => {
    const updated = [lineups[0], lineups[1]];
    updated[step] = { formation, orderedPlayers };
    setLineups(updated);
    if (step === 0) {
      setLineupStep(1);
    } else {
      // Both confirmed — run simulation
      setPhase('results');
      setMatchResult(buildMatchSimulation(players, updated));
    }
  }, [lineups, players]);

  const simulateMatch = useCallback(() => {
    setMatchResult(buildMatchSimulation(players, lineups));
  }, [players, lineups]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div className="auction-page">
      <Navbar />
      <SetupScreen onStart={startAuction} />
    </div>
  );

  const auctionDone = phase === 'results';

  return (
    <div className="auction-page">
      <Navbar />

      {/* Header */}
      <header className="auction-header">
        <div className="auction-logo">
          <div className="auction-logo-dot" />
          Auction Room
        </div>
        <div className="auction-stats">
          {players.map((pl, i) => (
            <div key={i} className="stat-chip" style={{ borderColor: `${PLAYER_COLORS[i]}33` }}>
              <span className="label" style={{ color: PLAYER_COLORS[i] }}>{pl.name}</span>
              <span className="value"><Coins size={12} style={{ display:'inline', verticalAlign:'middle', marginRight:3 }} />{fmt(pl.wallet)}</span>
              <span className="label">· {pl.squad.length}/{TOTAL_SLOTS}</span>
            </div>
          ))}
          <div className="stat-chip">
            <span className="label">Player</span>
            <span className="value">{Math.min(poolIndex + 1, pool.length)}/{pool.length}</span>
          </div>
        </div>
      </header>

      {/* 3-Column Stage */}
      <main className="auction-stage-3col">
        {/* Left: Player 1 */}
        <PlayerPanel player={players[0]} playerIndex={0} isRight={false} />

        {/* Centre: Card + Bidding */}
        <div className="card-arena">
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1.5rem' }}>
              <div className="skeleton" style={{ width:300, height:420, borderRadius:24 }} />
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.85rem' }}>Loading player pool…</p>
            </div>
          ) : error ? (
            <div style={{ textAlign:'center', padding:'3rem' }}>
              <p style={{ color:'#ef4444', marginBottom:'1rem' }}>{error}</p>
              <button className="btn-skip" onClick={fetchPool}>Retry</button>
            </div>
          ) : (
            <PlayerCard player={currentPlayer} flipped={flipped} />
          )}

          {!loading && !error && (
            <>
              {/* Show timer ring only before any bid */}
              {!currentBid && flipped && (
                <TimerRing seconds={timer} />
              )}
              <BidControls
                currentPlayer={currentPlayer}
                currentBid={currentBid}
                players={players}
                onBid={handleBid}
                onSkip={handleSkip}
                onConfirm={handleConfirm}
                disabled={auctionDone || !flipped}
                flipped={flipped}
              />
            </>
          )}
        </div>

        {/* Right: Player 2 */}
        <PlayerPanel player={players[1]} playerIndex={1} isRight />
      </main>

      {phase === 'results' && !matchResult && (
        <ResultsModal players={players} poolExhausted={poolOut} onPlayAgain={resetAll} onPickFormation={startLineupPhase} />
      )}

      {phase === 'lineup' && (
        <FormationPickerPhase
          players={players}
          lineupStep={lineupStep}
          confirmedLineups={lineups}
          onConfirm={handleLineupConfirm}
          onDownload={(curFormation, curSlots) => {
            const p2 = { formation: curFormation, orderedPlayers: curSlots.map(s => s.player) };
            downloadLineupCanvas(players, [lineups[0], p2]);
          }}
        />
      )}

      {matchResult && (
        <MatchSimulationModal
          key={matchResult.id}
          result={matchResult}
          players={players}
          lineups={lineups}
          onClose={() => { setMatchResult(null); setPhase('results'); }}
          onReplay={simulateMatch}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
