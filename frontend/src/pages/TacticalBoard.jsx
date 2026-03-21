import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { Pen, Hand, Undo, RotateCcw, Layout } from 'lucide-react';

const FORMATIONS = {
    '4-3-3': [
        { num: 1, pos: 'GK', x: 2, y: 50 },
        { num: 2, pos: 'RB', x: 20, y: 85 }, 
        { num: 4, pos: 'CB', x: 20, y: 63 }, 
        { num: 5, pos: 'CB', x: 20, y: 37 }, 
        { num: 3, pos: 'LB', x: 20, y: 15 }, 
        { num: 8, pos: 'CM', x: 50, y: 70 }, 
        { num: 6, pos: 'CDM', x: 50, y: 50 }, 
        { num: 10, pos: 'CM', x: 50, y: 30 }, 
        { num: 7, pos: 'RW', x: 75, y: 80 }, 
        { num: 9, pos: 'ST', x: 88, y: 50 }, 
        { num: 11, pos: 'LW', x: 75, y: 20 }
    ],
    '4-4-2': [
        { num: 1, pos: 'GK', x: 2, y: 50 },
        { num: 2, pos: 'RB', x: 20, y: 85 }, 
        { num: 4, pos: 'CB', x: 20, y: 63 }, 
        { num: 5, pos: 'CB', x: 20, y: 37 }, 
        { num: 3, pos: 'LB', x: 20, y: 15 }, 
        { num: 7, pos: 'RM', x: 52, y: 80 }, 
        { num: 8, pos: 'CM', x: 52, y: 60 }, 
        { num: 10, pos: 'CM', x: 52, y: 40 }, 
        { num: 11, pos: 'LM', x: 52, y: 20 }, 
        { num: 9, pos: 'ST', x: 82, y: 65 }, 
        { num: 6, pos: 'ST', x: 82, y: 35 }
    ],
    '5-3-2': [
        { num: 1, pos: 'GK', x: 2, y: 50 },
        { num: 2, pos: 'RB', x: 20, y: 88 }, 
        { num: 4, pos: 'CB', x: 20, y: 70 }, 
        { num: 5, pos: 'CB', x: 20, y: 50 }, 
        { num: 6, pos: 'CB', x: 20, y: 30 }, 
        { num: 3, pos: 'LB', x: 20, y: 12 }, 
        { num: 8, pos: 'CM', x: 50, y: 70 }, 
        { num: 10, pos: 'CAM', x: 50, y: 50 }, 
        { num: 11, pos: 'CM', x: 50, y: 30 }, 
        { num: 9, pos: 'ST', x: 82, y: 65 }, 
        { num: 7, pos: 'ST', x: 82, y: 35 }
    ],
    '3-5-2': [
        { num: 1, pos: 'GK', x: 2, y: 50 },
        { num: 4, pos: 'CB', x: 20, y: 75 }, 
        { num: 5, pos: 'CB', x: 20, y: 50 }, 
        { num: 6, pos: 'CB', x: 20, y: 25 }, 
        { num: 2, pos: 'RWB', x: 48, y: 88 }, 
        { num: 8, pos: 'CM', x: 50, y: 65 }, 
        { num: 10, pos: 'CAM', x: 50, y: 50 }, 
        { num: 11, pos: 'CM', x: 50, y: 35 }, 
        { num: 3, pos: 'LWB', x: 48, y: 12 }, 
        { num: 9, pos: 'ST', x: 82, y: 65 }, 
        { num: 7, pos: 'ST', x: 82, y: 35 }
    ],
    '4-2-3-1': [
        { num: 1, pos: 'GK', x: 2, y: 50 },
        { num: 2, pos: 'RB', x: 20, y: 85 }, 
        { num: 4, pos: 'CB', x: 20, y: 63 }, 
        { num: 5, pos: 'CB', x: 20, y: 37 }, 
        { num: 3, pos: 'LB', x: 20, y: 15 }, 
        { num: 6, pos: 'CDM', x: 40, y: 62 }, 
        { num: 8, pos: 'CDM', x: 40, y: 38 }, 
        { num: 10, pos: 'CAM', x: 65, y: 50 }, 
        { num: 7, pos: 'LM', x: 65, y: 22 }, 
        { num: 11, pos: 'RM', x: 65, y: 78 }, 
        { num: 9, pos: 'ST', x: 88, y: 50 }
    ]
};

const HOME_TEAM_COLOR = '#0052cc';
const AWAY_TEAM_COLOR = '#e74c3c';

const MINIMUM_DISTANCE = 4; // minimum distance percentage to avoid overlap

const initializeCoins = (homeFormation = '4-3-3', awayFormation = '4-3-3') => {
    let coins = [];
    const homePositions = FORMATIONS[homeFormation];
    const awayPositions = FORMATIONS[awayFormation];
    
    homePositions.forEach((pos) => {
        coins.push({
            id: `h${pos.num}`,
            team: 'home',
            number: pos.num,
            position: pos.pos,
            color: HOME_TEAM_COLOR,
            x: pos.x,
            y: pos.y, 
        });
    });

    awayPositions.forEach((pos) => {
        coins.push({
            id: `a${pos.num}`,
            team: 'away',
            number: pos.num + 11, // Unique numbers conceptually
            position: pos.pos,
            color: AWAY_TEAM_COLOR,
            x: 100 - pos.x,
            y: 100 - pos.y, 
        });
    });

    return coins;
};

// SVG Pitch Component
const PitchBackground = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#2d6a4f" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" />
        <circle cx="50" cy="50" r="10" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
        <circle cx="50" cy="50" r="0.8" fill="#ffffff" fillOpacity="0.8" />
        
        {/* Left Penalty Area */}
        <rect x="0" y="20" width="16" height="60" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
        <rect x="0" y="35" width="5" height="30" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
        <circle cx="11" cy="50" r="0.5" fill="#ffffff" fillOpacity="0.8" />
        <path d="M 16 41 A 10 10 0 0 1 16 59" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
        
        {/* Right Penalty Area */}
        <rect x="84" y="20" width="16" height="60" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
        <rect x="95" y="35" width="5" height="30" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
        <circle cx="89" cy="50" r="0.5" fill="#ffffff" fillOpacity="0.8" />
        <path d="M 84 41 A 10 10 0 0 0 84 59" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
        
        {/* Corner Arcs */}
        <path d="M 0 3 A 3 3 0 0 0 3 0" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
        <path d="M 0 97 A 3 3 0 0 1 3 100" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
        <path d="M 100 3 A 3 3 0 0 1 97 0" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
        <path d="M 100 97 A 3 3 0 0 0 97 100" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
    </svg>
);

const TacticalBoard = () => {
    const navigate = useNavigate();
    const [homeFormation, setHomeFormation] = useState('4-3-3');
    const [awayFormation, setAwayFormation] = useState('4-3-3');
    const [coins, setCoins] = useState(() => initializeCoins('4-3-3', '4-3-3'));
    const [isDrawMode, setIsDrawMode] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    const pitchRef = useRef(null);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const resizeCanvas = () => {
            if (canvasRef.current && pitchRef.current) {
                const { width, height } = pitchRef.current.getBoundingClientRect();
                const ctx = canvasRef.current.getContext('2d');
                // Preserve drawing data before resize if needed, though typically resize clears in simple implementations
                const data = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
                
                canvasRef.current.width = width;
                canvasRef.current.height = height;
                
                if (data.width > 0 && data.height > 0) {
                   // Optional: draw previous state scaled or unscaled
                   ctx.putImageData(data, 0, 0); 
                }
                
                ctx.scale(1, 1);
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#facc15'; // yellow marker
                ctx.lineWidth = 4;
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [isFullScreen]); // Re-run when fullscreen toggles to match new dimensions

    const getOverlappingCoin = (newX, newY, excludeId) => {
        // Since we are working with percentages (0-100), we need to ensure the aspect ratio doesn't distort distance checks heavily,
        // but for simplicity we assume a roughly 3:2 pitch aspect ratio and normalize visually
        const AspectRatioCorrection = 1.5; 
        
        return coins.find(c => {
            if (c.id === excludeId) return false;
            const dx = (c.x - newX) * AspectRatioCorrection;
            const dy = (c.y - newY);
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < MINIMUM_DISTANCE;
        });
    };

    const handleDragStart = (e, coin) => {
        if (isDrawMode) {
            e.preventDefault();
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        e.dataTransfer.setData('coinId', coin.id);
        
        const offsetX = e.clientX - (rect.left + rect.width / 2);
        const offsetY = e.clientY - (rect.top + rect.height / 2);

        e.dataTransfer.setData('offsetX', offsetX);
        e.dataTransfer.setData('offsetY', offsetY);
        e.dataTransfer.effectAllowed = 'move';
        
        // Use a transparent image for drag image to hide the default browser drag ghost if we wanted perfectly custom,
        // but default ghost is fine for now.
    };

    const handleDragOver = (e) => {
        if (!isDrawMode) {
            e.preventDefault();
        }
    };

    const handleDrop = (e) => {
        if (isDrawMode) return;
        e.preventDefault();
        
        const coinId = e.dataTransfer.getData('coinId');
        if (!coinId) return;

        const offsetX = parseFloat(e.dataTransfer.getData('offsetX'));
        const offsetY = parseFloat(e.dataTransfer.getData('offsetY'));

        const pitchRect = pitchRef.current.getBoundingClientRect();

        let newX = e.clientX - pitchRect.left - offsetX;
        let newY = e.clientY - pitchRect.top - offsetY;

        let newXPercent = Math.max(2, Math.min(98, (newX / pitchRect.width) * 100));
        let newYPercent = Math.max(2, Math.min(98, (newY / pitchRect.height) * 100));

        // Collision logic
        const overlap = getOverlappingCoin(newXPercent, newYPercent, coinId);
        if (overlap) {
            // Revert drop or nudge? We'll just ignore the drop so it snaps back, or calculate a safe spot
            // Let's just slightly nudge or prevent. We'll prevent drop if overlapping roughly
            let safe = false;
            // Simple spiral search for a safe spot
            let r = MINIMUM_DISTANCE;
            let angle = 0;
            while(!safe && r < MINIMUM_DISTANCE * 3) {
                newXPercent += Math.cos(angle) * r;
                newYPercent += Math.sin(angle) * r;
                newXPercent = Math.max(2, Math.min(98, newXPercent));
                newYPercent = Math.max(2, Math.min(98, newYPercent));
                
                if (!getOverlappingCoin(newXPercent, newYPercent, coinId)) {
                    safe = true;
                } else {
                    angle += Math.PI / 4;
                    if(angle >= Math.PI * 2) {
                        angle = 0;
                        r += MINIMUM_DISTANCE / 2;
                    }
                }
            }
            if(!safe) return; // if still not safe, just abort the drop
        }

        setCoins(prevCoins =>
            prevCoins.map(c =>
                c.id === coinId ? { ...c, x: parseFloat(newXPercent.toFixed(2)), y: parseFloat(newYPercent.toFixed(2)) } : c
            )
        );
    };

    // Canvas drawing handlers
    const startDrawing = (e) => {
        if (!isDrawMode || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing || !isDrawMode || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.closePath();
        }
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const handleHomeFormationChange = (e) => {
        const formation = e.target.value;
        setHomeFormation(formation);
        setCoins(initializeCoins(formation, awayFormation));
        clearCanvas();
    };

    const handleAwayFormationChange = (e) => {
        const formation = e.target.value;
        setAwayFormation(formation);
        setCoins(initializeCoins(homeFormation, formation));
        clearCanvas();
    };

    const handleReset = () => {
        setCoins(initializeCoins(homeFormation, awayFormation));
        clearCanvas();
    };

    return (
        <div className="bg-[#0e0e0e] h-screen text-white overflow-hidden flex flex-col">
            <Navbar />
            
            <main className="flex-1 flex flex-col max-w-full mx-auto w-full px-4 pt-4 pb-4 min-h-0">
                <div className={`bg-[#111] border border-[#222] rounded-3xl p-4 lg:p-6 flex flex-col lg:flex-row gap-6 shadow-2xl flex-1 min-h-0 overflow-hidden ${isFullScreen ? 'fixed inset-0 z-[100] m-0 rounded-none border-none' : ''}`}>
                    
                    {/* Pitch Container */}
                    <div className="flex-1 relative bg-[#1a2e1d] rounded-xl overflow-hidden shadow-inner border border-white/10 select-none h-full">
                        
                        {/* The SVG lines of the pitch */}
                        <PitchBackground />

                        {/* Drawing Canvas */}
                        <canvas
                            ref={canvasRef}
                            className={`absolute inset-0 w-full h-full z-10 ${isDrawMode ? 'cursor-crosshair' : 'pointer-events-none'}`}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                        />

                        {/* Drop Target wrapper */}
                        <div 
                            ref={pitchRef}
                            className="absolute inset-0 z-0"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {/* Players */}
                            {coins.map((coin) => (
                                <div
                                    key={coin.id}
                                    draggable={!isDrawMode}
                                    onDragStart={(e) => handleDragStart(e, coin)}
                                    className={`absolute flex items-center justify-center rounded-full font-bold text-xs md:text-sm text-white border-2 border-white/80 shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform ${isDrawMode ? 'cursor-default pointer-events-none' : 'cursor-grab active:cursor-grabbing hover:scale-110'}`}
                                    style={{
                                        left: `${coin.x}%`,
                                        top: `${coin.y}%`,
                                        width: '4%', // roughly matches COIN_SIZE visually
                                        paddingBottom: '4%', // aspect ratio trick to keep it square
                                        transform: 'translate(-50%, -50%)',
                                        backgroundColor: coin.color,
                                    }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {coin.number}
                                    </div>
                                    <span className="absolute -bottom-5 text-[10px] md:text-xs font-semibold whitespace-nowrap text-white/90 drop-shadow-md">
                                        {coin.position}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Configuration */}
                    <div className="w-full lg:w-72 flex flex-col gap-4 overflow-y-auto no-scrollbar">
                        
                        {/* Tool Buttons moved here */}
                        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#333] flex flex-col gap-3">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Controls</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => setIsDrawMode(false)}
                                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all border text-xs font-bold ${
                                        !isDrawMode 
                                            ? 'bg-white text-black border-white' 
                                            : 'bg-[#222] text-gray-400 border-[#333] hover:text-white'
                                    }`}
                                >
                                    <Hand size={16} /> Drag
                                </button>
                                <button 
                                    onClick={() => setIsDrawMode(true)}
                                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all border text-xs font-bold ${
                                        isDrawMode 
                                            ? 'bg-[#facc15] text-black border-[#facc15]' 
                                            : 'bg-[#222] text-gray-400 border-[#333] hover:text-[#facc15]'
                                    }`}
                                >
                                    <Pen size={16} /> Draw
                                </button>
                                <button 
                                    onClick={clearCanvas}
                                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#222] text-gray-400 border border-[#333] hover:text-white hover:bg-[#333] transition-all text-xs font-bold"
                                >
                                    <Undo size={16} /> Clear
                                </button>
                                <button 
                                    onClick={handleReset}
                                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#222] text-gray-400 border border-[#333] hover:text-white hover:bg-[#333] transition-all text-xs font-bold"
                                >
                                    <RotateCcw size={16} /> Reset
                                </button>
                            </div>
                            <button 
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all border text-xs font-bold ${
                                    isFullScreen 
                                        ? 'bg-blue-600 text-white border-blue-600' 
                                        : 'bg-[#222] text-gray-400 border-[#333] hover:text-white'
                                }`}
                            >
                                {isFullScreen ? <RotateCcw size={16} className="rotate-45" /> : <Layout size={16} />} {isFullScreen ? "Exit Fullscreen" : "Full Screen Mode"}
                            </button>
                        </div>
                        
                        <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#333]">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#0052cc]"></span>
                                Home Team
                            </h3>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Formation</label>
                                <select 
                                    value={homeFormation}
                                    onChange={handleHomeFormationChange}
                                    className="w-full bg-[#222] border border-[#444] rounded-lg px-4 py-2.5 text-white outline-none focus:border-white transition-colors"
                                >
                                    {Object.keys(FORMATIONS).map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#333]">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#e74c3c]"></span>
                                Away Team
                            </h3>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Formation</label>
                                <select 
                                    value={awayFormation}
                                    onChange={handleAwayFormationChange}
                                    className="w-full bg-[#222] border border-[#444] rounded-lg px-4 py-2.5 text-white outline-none focus:border-white transition-colors"
                                >
                                    {Object.keys(FORMATIONS).map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a]/50 border border-[#333]/50 rounded-2xl p-5 mt-auto">
                            <h4 className="text-sm font-bold text-gray-300 mb-2">Instructions</h4>
                            <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
                                <li>Use <strong className="text-white">Drag</strong> mode to position players perfectly.</li>
                                <li>Players automatically snap away to prevent overlapping.</li>
                                <li>Switch to <strong className="text-[#facc15]">Draw</strong> mode to sketch running paths or zones.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TacticalBoard;
