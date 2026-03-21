import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Edit2, Mail, Trophy, Target, Calendar, Shield, Settings, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: '',
    favoriteFormation: '4-3-3'
  });

  useEffect(() => {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    // Simulated user data - in real app, fetch from API
    setUserData({
      username: username || 'Manager',
      userId: userId,
      email: localStorage.getItem('email') || 'manager@footlive.com',
      bio: 'A highly tactical fan waiting to make their mark.',
      favoriteFormation: '4-3-3',
      joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      stats: {
        predictions: 42,
        accuracy: 76,
        friends: 128,
        badges: 5
      }
    });

    setEditData({
      bio: 'A highly tactical fan waiting to make their mark.',
      favoriteFormation: '4-3-3'
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const handleSaveProfile = () => {
    setUserData(prev => ({
      ...prev,
      ...editData
    }));
    setIsEditing(false);
  };

  if (!userData) {
    return (
      <div className="bg-[#0e0e0e] min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse text-gray-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white">
      <Navbar />
      
      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white hover:text-gray-300 mb-10 transition-colors font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        {/* Main Profile Container */}
        <div className="glass rounded-[32px] p-10 border border-white/10 overflow-hidden">
          {/* Hero Section with Avatar */}
          <div className="flex items-start justify-between mb-12 pb-12 border-b border-white/10">
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 rounded-2xl bg-white flex items-center justify-center text-black text-6xl font-black flex-shrink-0">
                {userData.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-5xl font-black text-white mb-3">{userData.username}</h1>
                <p className="text-gray-400 flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-white" />
                  <span className="font-semibold">Elite Tactical Fan</span>
                </p>
                <p className="text-gray-500 text-sm">Member since {userData.joinedDate}</p>
              </div>
            </div>
            <button
              onClick={() => !isEditing && setIsEditing(true)}
              className={`p-4 rounded-xl transition-all transition-colors ${
                isEditing 
                  ? 'bg-white text-black' 
                  : 'hover:bg-[#222] bg-[#111] border border-[#222] text-gray-400'
              }`}
            >
              <Edit2 size={24} />
            </button>
          </div>

          {/* Account Info Cards */}
          <div className=" md:grid-cols-2 gap-6 mb-12">
            {/* Email Card */}
            <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Mail size={18} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email Address</span>
              </div>
              <p className="text-white font-semibold text-lg">{userData.email}</p>
            </div>

          </div>

          {/* Tactical Philosophy Card */}
          <div className="mb-8">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
              <Target size={16} className="inline mr-2 text-white" />
              Your Tactical Philosophy
            </label>
            {isEditing ? (
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full bg-[#111] border border-[#333] text-white rounded-2xl py-4 px-4 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/10 transition-all placeholder-gray-600 text-sm resize-none h-28"
                placeholder="Share your football philosophy..."
              />
            ) : (
              <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
                <p className="text-gray-300 leading-relaxed">{editData.bio}</p>
              </div>
            )}
          </div>

          {/* Formation Selection Card */}
          <div className="mb-10">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
              <Trophy size={16} className="inline mr-2 text-white" />
              Preferred Formation
            </label>
            {isEditing ? (
              <select
                value={editData.favoriteFormation}
                onChange={(e) => setEditData(prev => ({ ...prev, favoriteFormation: e.target.value }))}
                className="w-full md:w-80 bg-[#111] border border-[#333] text-white rounded-2xl py-4 px-4 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/10 transition-all font-semibold text-lg"
              >
                <option>4-3-3</option>
                <option>4-2-3-1</option>
                <option>3-5-2</option>
                <option>5-3-2</option>
                <option>4-4-2</option>
                <option>3-4-3</option>
              </select>
            ) : (
              <div className="bg-[#111] border border-[#222] rounded-2xl py-4 px-6 inline-block">
                <p className="text-white font-black text-2xl">{editData.favoriteFormation}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-8 border-t border-white/10">
            {isEditing && (
              <>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-white hover:bg-gray-200 text-black font-black py-4 rounded-2xl transition-all transform active:scale-95"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-[#222] hover:bg-[#333] text-white font-black py-4 rounded-2xl transition-all"
                >
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
