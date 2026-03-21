import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import '../styles/Tboard.css';

const getAuthStatus = () => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username'); 
    const username = storedUsername || (token ? 'Tactician' : null); 
    return { isAuthenticated: !!token, username };
};

function Header({ currentPage }) {
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = React.useState(getAuthStatus());
  const [showProfilePopup, setShowProfilePopup] = React.useState(false);
  
  const refreshAuth = () => {
      setAuthStatus(getAuthStatus());
  };

  const navItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'matches', label: 'Matches', path: '/matches' },
    { id: 'tools', label: 'Tools', path: '/tools' },
    { id: 'predictions', label: 'Predictions', path: '/predictions' },
    { id: 'Chat Rooms', label: 'Chat Rooms', path: '/rooms' }
  ];

  const handleNavigation = (item) => {
    console.log(`Navigating to path: ${item.path}`);
    setShowProfilePopup(false); 
    navigate(item.path);
  };
  
  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      refreshAuth();
      setShowProfilePopup(false);
      navigate('/');
  };

  const handleProfileClick = () => {
      if (authStatus.isAuthenticated) {
          setShowProfilePopup(prev => !showProfilePopup);
      } else {
          navigate('/login');
      }
  };
  
  React.useEffect(() => {
      const handleStorageChange = () => {
          refreshAuth();
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <header className="header-sticky">
      <div className="header-container">
        <button
          onClick={() => handleNavigation(navItems[0])}
          className="header-logo-button"
        >
          <span className="logo-text">FOOTHUB</span>
        </button>

        <nav className="header-nav-desktop">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`nav-item-desktop ${
                currentPage === item.id ? 'active' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search teams, players..."
              className="search-input"
            />
          </div>

          <div className="profile-action-wrapper">
            <button
              onClick={handleProfileClick}
              className={`user-button ${authStatus.isAuthenticated ? 'logged-in' : 'logged-out'}`}
            >
              👤
            </button>
            
            {showProfilePopup && authStatus.isAuthenticated && (
                <div className="profile-popup">
                    <div className="popup-header">
                        Hello, {authStatus.username}!
                    </div>
                    <button className="popup-menu-item" onClick={() => navigate('/dashboard-placeholder')}>
                        Dashboard
                    </button>
                    <button className="popup-menu-item logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}
          </div>

          <button className="menu-button-mobile">
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}

// Formation templates for horizontal pitch
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
        { num: 7, pos: 'LW', x: 75, y: 80 }, 
        { num: 9, pos: 'ST', x: 88, y: 50 }, 
        { num: 11, pos: 'RW', x: 75, y: 20 }
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

const HOME_TEAM_COLOR = '#667eea';
const AWAY_TEAM_COLOR = '#e74c3c';

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
            number: pos.num + 11,
            position: pos.pos,
            color: AWAY_TEAM_COLOR,
            x: 100 - pos.x,
            y: 100 - pos.y, 
        });
    });

    return coins;
};

function PlayerCoin({ coin, onDragStart }) {
    const style = {
        left: `${coin.x}%`,
        top: `${coin.y}%`,
        backgroundColor: coin.color,
        cursor: 'grab',
    };

    return (
        <div
            draggable="true"
            onDragStart={(e) => onDragStart(e, coin)}
            onDragEnd={(e) => e.currentTarget.classList.remove('is-dragging')}
            className="player-coin"
            style={style}
            title={`${coin.position} - #${coin.number}`}
        >
            <span className="coin-number">{coin.number}</span>
            <span className="coin-position-label">{coin.position}</span>
        </div>
    );
}

export function Tboard() {
    const navigate = useNavigate();
    const [currentPage] = useState('tools');
    const [homeFormation, setHomeFormation] = useState('4-3-3');
    const [awayFormation, setAwayFormation] = useState('4-3-3');
    const [coins, setCoins] = useState(() => initializeCoins('4-3-3', '4-3-3'));
    const pitchRef = useRef(null);

    const handleDragStart = (e, coin) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.dataTransfer.setData('coinId', coin.id);
        
        const offsetX = e.clientX - (rect.left + rect.width / 2);
        const offsetY = e.clientY - (rect.top + rect.height / 2);

        e.dataTransfer.setData('offsetX', offsetX);
        e.dataTransfer.setData('offsetY', offsetY);
        
        e.currentTarget.classList.add('is-dragging');
    };

    const handleDragOver = (e) => {
        e.preventDefault(); 
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const coinId = e.dataTransfer.getData('coinId');
        const offsetX = parseFloat(e.dataTransfer.getData('offsetX'));
        const offsetY = parseFloat(e.dataTransfer.getData('offsetY'));

        const pitchRect = pitchRef.current.getBoundingClientRect();

        let newX = e.clientX - pitchRect.left - offsetX;
        let newY = e.clientY - pitchRect.top - offsetY;

        let newXPercent = Math.max(0, Math.min(100, (newX / pitchRect.width) * 100));
        let newYPercent = Math.max(0, Math.min(100, (newY / pitchRect.height) * 100));

        setCoins(prevCoins =>
            prevCoins.map(c =>
                c.id === coinId ? { ...c, x: newXPercent, y: newYPercent } : c
            )
        );
    };

    const handleHomeFormationChange = (formation) => {
        setHomeFormation(formation);
        setCoins(initializeCoins(formation, awayFormation));
    };

    const handleAwayFormationChange = (formation) => {
        setAwayFormation(formation);
        setCoins(initializeCoins(homeFormation, formation));
    };

    const handleReset = () => {
        setCoins(initializeCoins(homeFormation, awayFormation));
    };
    
    const handleDragEndCleanup = (e) => {
        e.target.classList.remove('is-dragging');
    };

    return (
        <div className="app-container">
            <Header currentPage={currentPage} />
            
            <div className="content-wrapper tboard-wrapper">
                <div className="tboard-content-container">
                    {/* Pitch Area */}
                    <div className="tboard-pitch-area-wrapper">
                        <div className="tboard-pitch-area" 
                             onDragOver={handleDragOver} 
                             onDrop={handleDrop} 
                             ref={pitchRef}
                        >
                            <div className="field">
                                <span className="halfway-line"></span>
                                <span className="centre-circle"></span>
                                <span className="centre-mark"></span>
                                
                                <div className="left">
                                    <span className="penalty-area"></span>
                                    <span className="penalty-mark"></span>
                                    <span className="penalty-arc"></span>
                                    <span className="goal-area"></span>
                                    <span className="corner-arc"></span>
                                </div>
                                <div className="right">
                                    <span className="penalty-area"></span>
                                    <span className="penalty-mark"></span>
                                    <span className="penalty-arc"></span>
                                    <span className="goal-area"></span>
                                    <span className="corner-arc"></span>
                                </div>

                                {/* Player Coins Layer */}
                                <div className="coins-layer">
                                    {coins.map(coin => (
                                        <PlayerCoin 
                                            key={coin.id} 
                                            coin={coin} 
                                            onDragStart={handleDragStart} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Info */}
                    <div className="team-info-bar">
                        <div className="team-info home">
                            <div className="team-color-badge home"></div>
                            <span>Home Team (Blue)</span>
                        </div>
                        <div className="team-info away">
                            <div className="team-color-badge away"></div>
                            <span>Away Team (Red)</span>
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="tboard-controls-bar">
                        <div className="bar-group">
                            <label className="formation-label">🔵 Home Team Formation:</label>
                            <div className="formation-buttons">
                                {Object.keys(FORMATIONS).map(formation => (
                                    <button
                                        key={`home-${formation}`}
                                        className={`formation-btn ${homeFormation === formation ? 'active' : ''}`}
                                        onClick={() => handleHomeFormationChange(formation)}
                                    >
                                        {formation}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bar-group">
                            <label className="formation-label">🔴 Away Team Formation:</label>
                            <div className="formation-buttons">
                                {Object.keys(FORMATIONS).map(formation => (
                                    <button
                                        key={`away-${formation}`}
                                        className={`formation-btn ${awayFormation === formation ? 'active' : ''}`}
                                        onClick={() => handleAwayFormationChange(formation)}
                                    >
                                        {formation}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bar-group">
                            <button className="action-btn primary" onClick={handleReset}>
                                🔄 Reset
                            </button>
                            <button className="action-btn" onClick={() => navigate('/tools')}>
                                ← Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tboard;