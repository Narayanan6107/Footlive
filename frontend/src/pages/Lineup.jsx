import React, { useState, useEffect, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import '../styles/lineup.css';
const formations = [
    { id: '433', name: '4-3-3', positions: [ 
        { x: 50, y: 90 }, // GK
        { x: 15, y: 70 }, { x: 35, y: 70 }, { x: 65, y: 70 }, { x: 85, y: 70 }, // DEF
        { x: 30, y: 45 }, { x: 50, y: 40 }, { x: 70, y: 45 }, // MID
        { x: 25, y: 20 }, { x: 50, y: 15 }, { x: 75, y: 20 } // FWD
    ] },
    { id: '442', name: '4-4-2', positions: [ 
        { x: 50, y: 90 }, // GK
        { x: 15, y: 70 }, { x: 35, y: 70 }, { x: 65, y: 70 }, { x: 85, y: 70 }, // DEF
        { x: 15, y: 40 }, { x: 40, y: 40 }, { x: 60, y: 40 }, { x: 85, y: 40 }, // MID
        { x: 40, y: 15 }, { x: 60, y: 15 } // FWD
    ] },
    { id: '4231', name: '4-2-3-1', positions: [ 
        { x: 50, y: 90 }, // GK
        { x: 15, y: 70 }, { x: 35, y: 70 }, { x: 65, y: 70 }, { x: 85, y: 70 }, // DEF
        { x: 40, y: 55 }, { x: 60, y: 55 }, // CDM
        { x: 25, y: 35 }, { x: 50, y: 30 }, { x: 75, y: 35 }, // CAM/W
        { x: 50, y: 15 } // ST
    ] },
    { id: '352', name: '3-5-2', positions: [ 
        { x: 50, y: 90 }, // GK
        { x: 30, y: 70 }, { x: 50, y: 70 }, { x: 70, y: 70 }, // DEF
        { x: 10, y: 45 }, { x: 30, y: 40 }, { x: 50, y: 35 }, { x: 70, y: 40 }, { x: 90, y: 45 }, // MID
        { x: 40, y: 15 }, { x: 60, y: 15 } // FWD
    ] },
    { id: '532', name: '5-3-2', positions: [ 
        { x: 50, y: 90 }, // GK
        { x: 10, y: 75 }, { x: 30, y: 80 }, { x: 50, y: 80 }, { x: 70, y: 80 }, { x: 90, y: 75 }, // DEF
        { x: 30, y: 45 }, { x: 50, y: 40 }, { x: 70, y: 45 }, // MID
        { x: 40, y: 15 }, { x: 60, y: 15 } // FWD
    ] },
    { id: '4141', name: '4-1-4-1', positions: [ 
        { x: 50, y: 90 }, // GK
        { x: 15, y: 75 }, { x: 35, y: 75 }, { x: 65, y: 75 }, { x: 85, y: 75 }, // DEF
        { x: 50, y: 60 }, // CDM
        { x: 15, y: 40 }, { x: 35, y: 40 }, { x: 65, y: 40 }, { x: 85, y: 40 }, // MID
        { x: 50, y: 15 } // ST
    ] },
    { id: '343', name: '3-4-3', positions: [ 
        { x: 50, y: 90 }, // GK
        { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 }, // DEF
        { x: 15, y: 45 }, { x: 40, y: 45 }, { x: 60, y: 45 }, { x: 85, y: 45 }, // MID
        { x: 25, y: 15 }, { x: 50, y: 10 }, { x: 75, y: 15 } // FWD
    ] },
    { id: '451', name: '4-5-1', positions: [ 
        { x: 50, y: 90 }, // GK
        { x: 15, y: 75 }, { x: 35, y: 75 }, { x: 65, y: 75 }, { x: 85, y: 75 }, // DEF
        { x: 15, y: 45 }, { x: 30, y: 40 }, { x: 50, y: 35 }, { x: 70, y: 40 }, { x: 85, y: 45 }, // MID
        { x: 50, y: 15 } // FWD
    ] },
    { id: '3412', name: '3-4-1-2', positions: [ 
        { x: 50, y: 90 }, // GK
        { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 }, // DEF
        { x: 15, y: 50 }, { x: 40, y: 50 }, { x: 60, y: 50 }, { x: 85, y: 50 }, // MID
        { x: 50, y: 30 }, // CAM
        { x: 40, y: 10 }, { x: 60, y: 10 } // FWD
    ] },
    { id: '4312', name: '4-3-1-2', positions: [ 
        { x: 50, y: 90 }, // GK
        { x: 15, y: 75 }, { x: 35, y: 75 }, { x: 65, y: 75 }, { x: 85, y: 75 }, // DEF
        { x: 30, y: 50 }, { x: 50, y: 50 }, { x: 70, y: 50 }, // CM
        { x: 50, y: 30 }, // CAM
        { x: 40, y: 10 }, { x: 60, y: 10 } // ST
    ] },
];

const initialFormation = formations[0];

// --- Simple Components (Unchanged) ---
const SimpleButton = ({ children, onClick, variant = 'default', className = '' }) => (
    <button onClick={onClick} className={`simple-button simple-button-${variant} ${className}`}>
        {children}
    </button>
);
const SimpleBadge = ({ children, className = '' }) => (
    <div className={`simple-badge ${className}`}>{children}</div>
);
const SimpleSelect = ({ value, onValueChange, options }) => (
    <select 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
        className="simple-select"
    >
        {options.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
    </select>
);

// --- PlayerListCard Component (MODIFIED for Drag-and-Drop) ---
function PlayerListCard({ player, onDragStart }) {
    return (
        <div
            draggable="true" // Enable dragging
            onDragStart={(e) => onDragStart(e, player)} // Pass player data on drag start
            className="draggable-player"
        >
            <div className="draggable-player-content">
                <div className="player-number-circle">
                    {player.number}
                </div>
                <div className="player-info">
                    <div className="player-name">{player.name}</div>
                    <div className="player-position">{player.position}</div>
                </div>
            </div>
        </div>
    );
}

// --- PlayerSlotOnPitch Component (MODIFIED for Drag-and-Drop) ---
function PlayerSlotOnPitch({
    slot,
    onRemove,
    onDrop,
    onDragOver,
}) {
    // Add drag-target class when an item is being dragged over
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault(); // Necessary to allow drop
        setIsDragOver(true);
        onDragOver(e); // Propagate drag over event for pitch background effect
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        onDrop(e, slot.id); // Pass slot ID to the main drop handler
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`player-slot-pitch-container ${isDragOver ? 'drag-target' : ''}`}
            style={{ left: `${100 - slot.position.y}%`, top: `${slot.position.x}%` }}
        >
            {slot.player ? (
                <div
                    className="player-slot-filled group"
                >
                    <div className="player-slot-card">
                        <div className="player-slot-number">{slot.player.number}</div>
                        <div className="player-slot-name">
                            {slot.player.name.split(' ').pop()}
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(slot.id); }}
                        className="player-remove-button"
                    >
                        <Trash2 />
                    </button>
                </div>
            ) : (
                <div
                    className="player-slot-empty"
                >
                    <span className="add-icon">+</span>
                </div>
            )}
        </div>
    );
}

// --- Main LineupBuilder Component (Refactored for DND and Filtering) ---

const Lineup = () => {
    const [teams, setTeams] = useState([]);
    const [allPlayers, setAllPlayers] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');

    const [selectedFormation, setSelectedFormation] = useState(initialFormation);
    const [slots, setSlots] = useState(
        initialFormation.positions.map((pos, idx) => ({
            id: `slot-${idx}`,
            player: null,
            position: pos,
        }))
    );

    // Fetch total teams
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/lineup/teams');
                const data = await res.json();
                setTeams(data);
                if (data.length > 0) setSelectedTeam(data[0]._id);
            } catch (err) {
                console.error("Error fetching teams", err);
            }
        };
        fetchTeams();
    }, []);

    // Fetch players when a team is selected
    useEffect(() => {
        const fetchPlayers = async () => {
            if (!selectedTeam) return;
            try {
                const res = await fetch(`http://localhost:5000/api/lineup/teams/${selectedTeam}/players`);
                const data = await res.json();
                // Map _id to id to match existing logic if needed
                const mappedData = data.map(p => ({ ...p, id: p._id }));
                setAllPlayers(mappedData);
            } catch (err) {
                console.error("Error fetching players", err);
            }
        };
        fetchPlayers();
    }, [selectedTeam]);
    
    // --- DND Handlers ---

    // 1. Set the data of the dragged player
    const handleDragStart = (e, player) => {
        e.dataTransfer.setData('playerId', player.id);
        
        // Add visual cue for the item being dragged (requires CSS)
        e.currentTarget.classList.add('is-dragging');
    };

    // 2. Remove visual cue
    const handleDragEnd = (e) => {
         e.currentTarget.classList.remove('is-dragging');
    };
    
    // 3. Handle the drop event on a pitch slot
    const handleDrop = (e, targetSlotId) => {
        e.preventDefault();
        const playerId = e.dataTransfer.getData('playerId');
        const playerToPlace = allPlayers.find(p => p.id === playerId);
        if (!playerToPlace) return;

        // Find the original slot if the player came from the pitch
        const sourceSlot = slots.find(s => s.player && s.player.id === playerId);
        
        let newSlots = [...slots];

        // Case 1: Player came from the pitch (SWAP/MOVE)
        if (sourceSlot) {
             // a. Clear the source slot
            newSlots = newSlots.map(slot => 
                slot.id === sourceSlot.id ? { ...slot, player: null } : slot
            );
            
            // b. Check if the target slot is occupied (SWAP logic)
            const targetSlot = newSlots.find(s => s.id === targetSlotId);
            if (targetSlot.player) {
                // Swap the player currently in the target slot back to the source slot
                newSlots = newSlots.map(slot => 
                    slot.id === sourceSlot.id ? { ...slot, player: targetSlot.player } : slot
                );
            }
        }
        
        // Case 2: Player came from the bench/list (PLACE) or finished a swap/move
        newSlots = newSlots.map(slot => 
            slot.id === targetSlotId ? { ...slot, player: playerToPlace } : slot
        );

        setSlots(newSlots);
    };
    
    // --- General Handlers ---

    const handleFormationChange = (formationId) => {
        const formation = formations.find((f) => f.id === formationId);
        if (formation) {
            setSelectedFormation(formation);
            setSlots(
                formation.positions.map((pos, idx) => ({
                    id: `slot-${idx}`,
                    player: null, // Clear all players when changing formation
                    position: pos,
                }))
            );
        }
    };

    const handleRemove = (slotId) => {
        setSlots((prev) =>
            prev.map((slot) => (slot.id === slotId ? { ...slot, player: null } : slot))
        );
    };

    const handleClearAll = () => {
        setSlots((prev) => prev.map((slot) => ({ ...slot, player: null })));
    };

    // --- Memoized State for Rendering ---

    const placedPlayerIds = useMemo(() => new Set(
        slots.filter((s) => s.player).map((s) => s.player.id)
    ), [slots]);

    // Filter available players by team and remove placed players
    const benchPlayers = useMemo(() => allPlayers.filter((p) => {
        const isPlaced = placedPlayerIds.has(p.id);
        return !isPlaced;
    }), [placedPlayerIds, allPlayers]);
    
    const playersSelectedCount = slots.filter((s) => s.player).length;
    const isComplete = playersSelectedCount === slots.length;

    return (
        <div className="lineup-builder-page">
            <Navbar />
            <div className="lineup-container">

                <div className="main-grid">
                    {/* Pitch Area */}
                    <div className="pitch-area-container">
                        {/* Football Pitch */}
                        <div className="football-pitch-wrapper">
                            <div className="football-pitch">
                                {/* Pitch Markings */}
                                <div className="pitch-markings">
                                    <div className="center-line" />
                                    <div className="center-circle" />
                                    <div className="center-dot" />
                                    <div className="penalty-box left" />
                                    <div className="penalty-box right" />
                                    <div className="goal-box left" />
                                    <div className="goal-box right" />
                                    <div className="goal left" />
                                    <div className="goal right" />
                                </div>

                                {/* Player Slots */}
                                {slots.map((slot) => (
                                    <PlayerSlotOnPitch
                                        key={slot.id}
                                        slot={slot}
                                        onRemove={handleRemove}
                                        onDrop={handleDrop}
                                        onDragOver={(e) => e.preventDefault()} // Enables drop on the slot
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Controls (Moved to bottom of pitch) */}
                        <div className="controls-panel">
                            <div className="control-group">
                                <label className="control-label">Formation</label>
                                <SimpleSelect 
                                    value={selectedFormation.id} 
                                    onValueChange={handleFormationChange} 
                                    options={formations} 
                                />
                            </div>
                            <div className="control-buttons">
                                <SimpleButton variant="outline" onClick={handleClearAll} className="clear-button">
                                    <Trash2 size={16} className="mr-2" /> Clear All
                                </SimpleButton>
                            </div>
                        </div>

                        
                    </div>

                    {/* Player Bench */}
                    <div className="bench-column">
                        <div className="bench-panel">
                            <h3 className="bench-title">Available Players</h3>
                            
                            {/* Team Filter */}
                            <div className="filter-panel">
                                <SimpleSelect 
                                    value={selectedTeam} 
                                    onValueChange={setSelectedTeam} 
                                    options={teams.map(t => ({ id: t._id, name: t.name }))} 
                                />
                            </div>
                            
                            <div className="player-list" onDragEnd={handleDragEnd}>
                                {benchPlayers.map((player) => (
                                    <PlayerListCard 
                                        key={player.id} 
                                        player={player} 
                                        onDragStart={handleDragStart} 
                                    />
                                ))}
                            </div>
                            
                            {benchPlayers.length === 0 && (
                                <div className="empty-bench-message">
                                    All players for this team are placed or not available.
                                </div>
                            )}
                        </div>

                        <div className="pro-tip-box">
                            <h4 className="pro-tip-title">Pro Tip: Swapping</h4>
                            <p className="pro-tip-text">
                                To swap players, simply drag a player from one pitch slot directly onto another pitch slot. The original player will move to the empty slot.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lineup;