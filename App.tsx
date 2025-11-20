
import React, { useState, useEffect } from 'react';
import { CardData, UserState, Department, Achievement } from './types';
import { fetchCompanyRoster } from './services/geminiService';
import { checkAchievements, ACHIEVEMENTS } from './services/achievements';
import Book from './components/Book';
import PackOpening from './components/PackOpening';
import TradeCenter from './components/TradeCenter';

// Constants
const PACK_SIZE = 5;

const App: React.FC = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState<CardData[]>([]);
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('corporate_legends_user_v2');
    return saved ? JSON.parse(saved) : {
      name: '',
      email: '',
      isRegistered: false,
      collection: [],
      duplicates: {},
      lastPackOpened: null,
      achievements: [],
      packsAvailable: 0
    };
  });

  const [currentPage, setCurrentPage] = useState<'album' | 'trade' | 'profile'>('album');
  const [newPackCards, setNewPackCards] = useState<CardData[] | null>(null);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);

  // Init Roster
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchCompanyRoster();
      setRoster(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // Persist User
  useEffect(() => {
    localStorage.setItem('corporate_legends_user_v2', JSON.stringify(user));
  }, [user]);

  // Achievement Check Loop
  useEffect(() => {
    if (!user.isRegistered || loading) return;

    const newIds = checkAchievements(user, roster);
    if (newIds.length > 0) {
        const newlyUnlockedAchievements = ACHIEVEMENTS.filter(a => newIds.includes(a.id));
        
        // Calculate total rewards
        let totalPacks = 0;
        newlyUnlockedAchievements.forEach(a => totalPacks += a.rewardPacks);

        setUser(prev => ({
            ...prev,
            achievements: [...prev.achievements, ...newIds],
            packsAvailable: prev.packsAvailable + totalPacks
        }));

        // Show toast for the first one (simplified)
        setAchievementToast(newlyUnlockedAchievements[0]);
        setTimeout(() => setAchievementToast(null), 5000);
    }
  }, [user.collection, roster, user.isRegistered, loading]);

  // Handlers
  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setUser(prev => ({
      ...prev,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      isRegistered: true,
      packsAvailable: 1 // Bonus starter pack
    }));
  };

  const openPack = () => {
    if (roster.length === 0) return;
    
    // Determine source of pack (Inventory vs Daily)
    const isDaily = canOpenDailyPack();
    const isInventory = user.packsAvailable > 0;

    if (!isDaily && !isInventory) return;

    // Generate 5 semi-random cards
    const pack: CardData[] = [];
    for (let i = 0; i < PACK_SIZE; i++) {
        const randomIdx = Math.floor(Math.random() * roster.length);
        pack.push(roster[randomIdx]);
    }

    setNewPackCards(pack);
    
    // Update User State
    setUser(prev => {
        const newCollection = [...prev.collection];
        const newDuplicates = { ...prev.duplicates };

        pack.forEach(card => {
            if (newCollection.includes(card.id)) {
                newDuplicates[card.id] = (newDuplicates[card.id] || 0) + 1;
            } else {
                newCollection.push(card.id);
            }
        });

        return {
            ...prev,
            collection: newCollection,
            duplicates: newDuplicates,
            lastPackOpened: isDaily ? Date.now() : prev.lastPackOpened,
            packsAvailable: (!isDaily && isInventory) ? prev.packsAvailable - 1 : prev.packsAvailable
        };
    });
  };

  const handleTrade = (lostIds: number[], gainedId: number) => {
    setUser(prev => {
        const newDuplicates = { ...prev.duplicates };
        
        // Remove traded duplicates
        lostIds.forEach(id => {
            if (newDuplicates[id] > 0) {
                newDuplicates[id]--;
                if (newDuplicates[id] === 0) delete newDuplicates[id];
            }
        });

        // Add new card
        const newCollection = [...prev.collection];
        if (!newCollection.includes(gainedId)) {
            newCollection.push(gainedId);
        } else {
            newDuplicates[gainedId] = (newDuplicates[gainedId] || 0) + 1;
        }

        return {
            ...prev,
            collection: newCollection,
            duplicates: newDuplicates
        };
    });
  };

  // Helpers
  const canOpenDailyPack = () => {
    return true; // DEBUG MODE: Always true
    // if (!user.lastPackOpened) return true;
    // const COOLDOWN_MS = 1000 * 60 * 60 * 24; 
    // return Date.now() - user.lastPackOpened > COOLDOWN_MS;
  };

  const totalOwned = user.collection.length;
  const totalCards = roster.length;
  const completionPercentage = totalCards > 0 ? Math.round((totalOwned / totalCards) * 100) : 0;

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center bg-brand-dark text-white flex-col gap-4">
            <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
            <div className="font-header uppercase tracking-widest animate-pulse">Generating Company Roster...</div>
        </div>
    );
  }

  // Login Screen
  if (!user.isRegistered) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1486406140926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center bg-blend-overlay bg-black/60">
        <div className="bg-brand-purple/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/10">
            <div className="text-center mb-8">
                <h1 className="font-header text-4xl font-bold text-white mb-2">Corporate<br/><span className="text-brand-accent">Legends</span></h1>
                <p className="text-gray-300 text-sm">Start your employee collection journey.</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-6">
                <div>
                    <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Full Name</label>
                    <input name="name" required className="w-full bg-black/30 border border-gray-600 rounded p-3 text-white focus:border-brand-accent outline-none transition-colors" placeholder="John Doe" />
                </div>
                <div>
                    <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Work Email</label>
                    <input name="email" type="email" required className="w-full bg-black/30 border border-gray-600 rounded p-3 text-white focus:border-brand-accent outline-none transition-colors" placeholder="john@nebulacorp.com" />
                </div>
                <button type="submit" className="w-full bg-brand-accent hover:bg-red-600 text-white font-bold py-4 rounded shadow-lg uppercase tracking-widest transition-transform transform hover:scale-[1.02]">
                    Create Album
                </button>
            </form>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen flex flex-col relative bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-brand-dark">
        {/* Achievement Toast */}
        {achievementToast && (
             <div className="fixed top-24 right-4 z-50 bg-gradient-to-r from-gold to-yellow-600 text-brand-dark p-4 rounded-lg shadow-2xl animate-pop border-2 border-white flex gap-4 items-center max-w-xs">
                <div className="text-4xl">{achievementToast.icon}</div>
                <div>
                    <div className="text-xs font-bold uppercase tracking-wider">Achievement Unlocked!</div>
                    <div className="font-header font-bold text-lg leading-tight">{achievementToast.title}</div>
                    <div className="text-xs opacity-80 mt-1">Reward: {achievementToast.rewardPacks} Packs</div>
                </div>
             </div>
        )}

        {/* Overlay for Pack Opening */}
        {newPackCards && (
            <PackOpening newCards={newPackCards} onClose={() => setNewPackCards(null)} />
        )}

        {/* Navigation Bar */}
        <nav className="sticky top-0 z-40 bg-brand-purple/95 backdrop-blur border-b border-white/10 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2" onClick={() => setCurrentPage('album')}>
                    <div className="w-8 h-8 bg-brand-accent rounded flex items-center justify-center font-bold text-white cursor-pointer shadow-lg">CL</div>
                    <span className="font-header font-bold text-xl hidden md:block cursor-pointer text-white tracking-wider">Corporate Legends</span>
                </div>
                
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Pack Button */}
                    <button 
                        onClick={openPack}
                        disabled={!canOpenDailyPack() && user.packsAvailable === 0}
                        className={`relative flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
                            (canOpenDailyPack() || user.packsAvailable > 0) 
                            ? 'bg-gradient-to-r from-gold to-yellow-600 text-black hover:scale-105 shadow-[0_0_15px_rgba(255,215,0,0.4)]' 
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <span>⚡ Open Pack</span>
                        {user.packsAvailable > 0 && (
                             <span className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] absolute -top-2 -right-2 border-2 border-brand-purple">
                                {user.packsAvailable}
                             </span>
                        )}
                    </button>

                    {/* Tabs */}
                    <div className="flex bg-black/30 p-1 rounded-lg">
                        <button 
                            onClick={() => setCurrentPage('album')}
                            className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${currentPage === 'album' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Album
                        </button>
                        <button 
                            onClick={() => setCurrentPage('trade')}
                            className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${currentPage === 'trade' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Trade
                        </button>
                        <button 
                            onClick={() => setCurrentPage('profile')}
                            className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${currentPage === 'profile' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Profile
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {currentPage === 'album' && (
                <Book roster={roster} user={user} />
            )}

            {currentPage === 'trade' && (
                <div className="bg-brand-dark/80 min-h-full">
                    <TradeCenter 
                        roster={roster} 
                        collection={user.collection} 
                        duplicates={user.duplicates} 
                        onTrade={handleTrade}
                    />
                </div>
            )}

            {currentPage === 'profile' && (
                <div className="max-w-4xl mx-auto p-8 text-white">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-accent to-purple-600 border-4 border-white/10 flex items-center justify-center text-4xl font-bold shadow-xl">
                            {user.name[0]}
                        </div>
                        <div>
                            <h1 className="text-3xl font-header font-bold uppercase">{user.name}</h1>
                            <p className="text-white/50">{user.email}</p>
                            <div className="mt-2 text-brand-accent font-bold">{completionPercentage}% Collection Complete</div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-header font-bold uppercase border-b border-white/10 pb-2 mb-6">Achievements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ACHIEVEMENTS.map(ach => {
                            const isUnlocked = user.achievements.includes(ach.id);
                            return (
                                <div key={ach.id} className={`p-4 rounded-xl border transition-all ${isUnlocked ? 'bg-white/10 border-brand-accent' : 'bg-black/20 border-transparent opacity-50'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`text-3xl ${!isUnlocked && 'grayscale'}`}>{ach.icon}</div>
                                        <div>
                                            <div className="font-bold font-header uppercase tracking-wide flex items-center gap-2">
                                                {ach.title}
                                                {isUnlocked && <span className="text-brand-accent text-xs">✓</span>}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{ach.description}</p>
                                            {isUnlocked && <div className="text-xs text-gold mt-2 font-bold">Reward: {ach.rewardPacks} Packs (Claimed)</div>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </main>
    </div>
  );
};

export default App;
