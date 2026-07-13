import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import './Auction.css';
import {
  Coins, Trophy, Medal, CheckCircle, ArrowUpCircle, Wallet,
  SkipForward, RefreshCw, Rocket, Clock, Star, Circle,
  AlertCircle, Shield
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────
const STARTING_BUDGET = 1_500_000;  // enough for 11 players rated 80-95
const TIMER_FULL      = 15;          // seconds before first bid
const BID_INCREMENT   = 5_000;       // minimum outbid step
const POOL_SIZE       = 50;
const TOTAL_SLOTS     = 11;
const BACKEND         = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TIER_COLOR   = { GK: '#f59e0b', DEF: '#3b82f6', MID: '#22c55e', ATT: '#ef4444' };
const PLAYER_COLORS = ['#7c3aed', '#e11d48'];
const STAT_COLOR   = v => v >= 85 ? '#22c55e' : v >= 75 ? '#84cc16' : v >= 65 ? '#eab308' : v >= 55 ? '#f97316' : '#ef4444';

function fmt(n) { return Number(n).toLocaleString(); }

// ─── Confetti ────────────────────────────────────────────────────────────────
const C_COLORS = ['#f59e0b','#7c3aed','#22c55e','#3b82f6','#ef4444','#ffd700','#a78bfa','#fb7185'];
function Confetti() {
  const pieces = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      background: C_COLORS[i % C_COLORS.length],
      width: `${6 + Math.random() * 8}px`,
      height: `${6 + Math.random() * 8}px`,
      borderRadius: Math.random() > 0.5 ? '50%' : '3px',
      animationDuration: `${1.5 + Math.random() * 2}s`,
      animationDelay: `${Math.random() * 0.8}s`,
    }
  }));
  return <div className="confetti-container">{pieces.map(p => <div key={p.id} className="confetti-piece" style={p.style} />)}</div>;
}

// ─── Timer Ring ─────────────────────────────────────────────────────────────
function TimerRing({ seconds }) {
  const r = 26, circ = 2 * Math.PI * r;
  const ratio  = seconds / TIMER_FULL;
  const offset = circ * (1 - ratio);
  const color  = ratio > 0.5 ? '#a78bfa' : ratio > 0.25 ? '#f59e0b' : '#ef4444';
  return (
    <div className="timer-wrap">
      <svg width="68" height="68" className="timer-ring-svg">
        <circle className="timer-ring-bg" cx="34" cy="34" r={r} strokeWidth="4" />
        <circle className="timer-ring-fg" cx="34" cy="34" r={r} strokeWidth="4"
          stroke={color} strokeDasharray={circ} strokeDashoffset={offset} />
        <text x="34" y="34" textAnchor="middle" dominantBaseline="central"
          fill="#fff" fontSize="15" fontWeight="800" fontFamily="Outfit,sans-serif"
          transform="rotate(90 34 34)">{seconds}</text>
      </svg>
      <span className="timer-label">seconds left</span>
    </div>
  );
}

// ─── Player Card ─────────────────────────────────────────────────────────────
function PlayerCard({ player, flipped }) {
  const color = TIER_COLOR[player?.tier] || '#a78bfa';
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
                  <img
                    src={`https://flagcdn.com/28x21/${(player?.nationality || '').toLowerCase().slice(0,2)}.png`}
                    alt={player?.nationality}
                    className="card-flag"
                    onError={e => { e.currentTarget.style.display='none'; }}
                  />
                </div>
                <div className="card-left-icon-img card-club-placeholder">
                  <Trophy size={13} color={color} />
                </div>
              </div>
            </div>
            <div className="card-photo-wrap">
              <img
                src={player?.faceUrl}
                alt={player?.name}
                className="card-photo"
                referrerPolicy="no-referrer"
                onError={e => { e.currentTarget.style.display = 'none'; }}
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
        src={player.faceUrl}
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
              disabled={disabled}
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
          <div className="setup-rule"><Coins size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} /><strong>1,500,000 tokens</strong> each to spend</div>
          <div className="setup-rule"><Star size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />Players rated <strong>80–95</strong> overall</div>
          <div className="setup-rule"><Clock size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} /><strong>15 seconds</strong> to place first bid — or player is skipped</div>
          <div className="setup-rule"><ArrowUpCircle size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />After first bid, both can <strong>outbid freely</strong> (+5,000 min)</div>
          <div className="setup-rule"><CheckCircle size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />Click <strong>Confirm</strong> to lock in the current highest bid</div>
          <div className="setup-rule"><Trophy size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />Sign <strong>11 players</strong> to complete your squad</div>
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

// ─── Results Modal ────────────────────────────────────────────────────────────
function ResultsModal({ players, poolExhausted, onPlayAgain }) {
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
        <button className="modal-btn-primary" onClick={onPlayAgain}><RefreshCw size={15} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />Play Again</button>
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
    fetchPool();
  }, [fetchPool]);

  // ── Reveal new card (runs on each new poolIndex) ───────────────────────────
  useEffect(() => {
    if (phase !== 'auction' || loading || pool.length === 0) return;
    soldRef.current = false;
    setFlipped(false);
    setCurrentBid(null);
    setTimer(TIMER_FULL);
    const t = setTimeout(() => setFlipped(true), 350);
    return () => clearTimeout(t);
  }, [phase, loading, poolIndex]);

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
    if (pl.wallet < amount) { showToast('Not enough tokens!', 'error'); return; }

    // Only stop the 15s interval on the FIRST bid
    if (!currentBid) clearInterval(timerRef.current);

    setCurrentBid({ playerIndex, amount });
    showToast(`${pl.name} bid ${fmt(amount)} tokens!`, 'info', 1500);
  }, [currentPlayer, currentBid, players]);

  // ── Confirm: lock in the sale — called by clicking "Confirm Purchase" ─────
  const handleConfirm = useCallback(() => {
    if (!currentBid || !currentPlayer) return;
    if (soldRef.current) return;           // double-click / double-call guard
    soldRef.current = true;

    const { playerIndex, amount } = currentBid;
    const snapshot = currentPlayer;        // capture current player before advance

    setPlayers(prev => {
      // Idempotency check: skip if this player is somehow already in the squad
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

      if (winner.squad.length >= TOTAL_SLOTS) {
        setTimeout(() => setPhase('results'), 700);
      } else {
        setTimeout(() => advancePlayer(), 500);
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
    setTimer(TIMER_FULL); setPoolOut(false); setToast(null);
    soldRef.current = false;
  };

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

      {phase === 'results' && (
        <ResultsModal players={players} poolExhausted={poolOut} onPlayAgain={resetAll} />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
