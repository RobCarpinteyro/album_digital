
import React, { useState, useEffect, useRef } from 'react';
import { CardData, UserState, Department, Achievement, GlobalAssets } from './types';
import { fetchCompanyRoster, getMergedRoster } from './services/geminiService';
import { checkAchievements, ACHIEVEMENTS } from './services/achievements';
import Book from './components/Book';
import PackOpening from './components/PackOpening';
import TradeCenter from './components/TradeCenter';
import AdminPanel from './components/AdminPanel';

// Constants
const PACK_SIZE = 5;
const DEFAULT_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMTIwIj4KICA8ZyBmaWxsPSIjRkZGRkZGIiBmb250LWZhbWlseT0iJ0FyaWFsIEJsYWNrJywgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjkwMCI+CiAgICA8dGV4dCB4PSIxMCIgeT0iOTAiIGZvbnQtc2l6ZT0iMTAwIiBsZXR0ZXItc3BhY2luZz0iLTUiPkxJQ088L3RleHQ+CiAgICA8dGV4dCB4PSIyNjUiIHk9IjkwIiBmb250LXNpemU9IjEwMCI+bjwvdGV4dD4KICAgIDx0ZXh0IHg9IjMzNSIgeT0iNDAiIGZvbnQtc2l6ZT0iMjQiPsKuPC90ZXh0PgogIDwvZz4KPC9zdmc+";
const DEFAULT_BG = "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2069&auto=format&fit=crop";

const ADMIN_EMAIL = "carpinteyro@polarmultimedia.com";

const App: React.FC = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState<CardData[]>([]);
  
  // Auth State
  const [sessionActive, setSessionActive] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');

  // User State
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('licon_legends_user_v1');
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

  // Global Assets State (Admin Managed)
  const [globalAssets, setGlobalAssets] = useState<GlobalAssets>(() => {
    const savedAssets = localStorage.getItem('licon_global_assets');
    return savedAssets ? JSON.parse(savedAssets) : {};
  });

  const [currentPage, setCurrentPage] = useState<'album' | 'trade' | 'profile' | 'admin'>('album');
  const [bookResetKey, setBookResetKey] = useState(0); // Key to force re-mount (reset to cover)
  const [newPackCards, setNewPackCards] = useState<CardData[] | null>(null);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const [showSettings, setShowSettings] = useState(false); // Legacy modal

  // Derived Assets
  const activeLogo = globalAssets.logoUrl || DEFAULT_LOGO;
  const activeBg = globalAssets.backgroundUrl || DEFAULT_BG;

  // Init Roster
  useEffect(() => {
    const loadData = async () => {
      // First get generated/static roster
      const initialData = await fetchCompanyRoster();
      // Then merge with any Admin overrides saved in local storage
      const mergedData = getMergedRoster(initialData);
      setRoster(mergedData);
      setLoading(false);
    };
    loadData();
  }, []);

  // Persist User
  useEffect(() => {
    localStorage.setItem('licon_legends_user_v1', JSON.stringify(user));
  }, [user]);

  // Persist Global Assets
  useEffect(() => {
    localStorage.setItem('licon_global_assets', JSON.stringify(globalAssets));
  }, [globalAssets]);

  // Check initial auth state
  useEffect(() => {
    if (user.isRegistered) {
      setAuthMode('login');
    } else {
      setAuthMode('register');
    }
  }, []);

  // Achievement Check Loop
  useEffect(() => {
    if (!sessionActive || loading) return;

    const newIds = checkAchievements(user, roster);
    if (newIds.length > 0) {
        const newlyUnlockedAchievements = ACHIEVEMENTS.filter(a => newIds.includes(a.id));
        
        let totalPacks = 0;
        newlyUnlockedAchievements.forEach(a => totalPacks += a.rewardPacks);

        setUser(prev => ({
            ...prev,
            achievements: [...prev.achievements, ...newIds],
            packsAvailable: prev.packsAvailable + totalPacks
        }));

        setAchievementToast(newlyUnlockedAchievements[0]);
        setTimeout(() => setAchievementToast(null), 5000);
    }
  }, [user.collection, roster, sessionActive, loading]);

  const handleAssetUpload = (key: 'logoUrl' | 'coverUrl' | 'backgroundUrl', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64 = reader.result as string;
        setGlobalAssets(prev => ({
            ...prev,
            [key]: base64
        }));
    };
    reader.readAsDataURL(file);
  };

  const handleRosterUpdate = (updatedCard: CardData) => {
      // Update State immediately for UI
      setRoster(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
      
      try {
          const storedOverrides = JSON.parse(localStorage.getItem('licon_custom_cards') || '{}');
          storedOverrides[updatedCard.id] = updatedCard;
          localStorage.setItem('licon_custom_cards', JSON.stringify(storedOverrides));
          alert('Cambios guardados exitosamente.');
      } catch (e: any) {
          console.error("Storage error:", e);
          if (e.name === 'QuotaExceededError' || e.code === 22) {
              alert("¡ALERTA DE ALMACENAMIENTO LLENO!\n\nNo se pudo guardar permanentemente esta tarjeta porque el navegador no tiene más espacio.\n\nIntenta borrar datos de navegación o usar imágenes más pequeñas.");
          } else {
              alert("Error al guardar en el dispositivo.");
          }
      }
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newUserState: UserState = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      isRegistered: true,
      collection: [],
      duplicates: {},
      lastPackOpened: null,
      achievements: [],
      packsAvailable: 2 // Give 2 packs initially to ensure they get 1-5 and 6-10
    };

    setUser(newUserState);
    setSessionActive(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.isRegistered && user.email.toLowerCase() === loginEmail.toLowerCase()) {
        setSessionActive(true);
        setLoginError('');
    } else {
        setLoginError('Correo no encontrado o no coincide con el registro guardado.');
    }
  };

  const openPack = () => {
    if (roster.length === 0) return;
    
    const isDaily = canOpenDailyPack();
    const isInventory = user.packsAvailable > 0;

    if (!isDaily && !isInventory) return;

    const pack: CardData[] = [];

    // --- DEMO MODE LOGIC ---
    // Pack 1: IDs 1-5
    if (user.collection.length === 0) {
        const demoIds = [1, 2, 3, 4, 5];
        demoIds.forEach(id => {
            const card = roster.find(c => c.id === id);
            if (card) pack.push(card);
        });
    }
    // Pack 2: IDs 6-10 (Only if they have exactly 5 cards, likely the first pack)
    else if (user.collection.length === 5 && user.collection.includes(1) && user.collection.includes(5)) {
        const demoIds2 = [6, 7, 8, 9, 10];
        demoIds2.forEach(id => {
            const card = roster.find(c => c.id === id);
            if (card) pack.push(card);
        });
    }
    
    // Fill with random if demo logic didn't run or didn't fill pack
    while(pack.length < PACK_SIZE) {
         const randomIdx = Math.floor(Math.random() * roster.length);
         const randomCard = roster[randomIdx];
         if (!pack.find(p => p.id === randomCard.id)) {
             pack.push(randomCard);
         }
    }

    setNewPackCards(pack);
    
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
        lostIds.forEach(id => {
            if (newDuplicates[id] > 0) {
                newDuplicates[id]--;
                if (newDuplicates[id] === 0) delete newDuplicates[id];
            }
        });
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

  const resetToCover = () => {
    setCurrentPage('album');
    setBookResetKey(prev => prev + 1);
  };

  const canOpenDailyPack = () => {
    // Simple daily logic for demo purposes (always true or check date)
    // For now, we rely on packsAvailable mostly for the demo flow
    return user.packsAvailable === 0; // Allow 1 free daily if no packs available, otherwise use inventory
  };

  const totalOwned = user.collection.length;
  const totalCards = roster.length;
  const completionPercentage = totalCards > 0 ? Math.round((totalOwned / totalCards) * 100) : 0;

  const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center bg-brand-dark text-white flex-col gap-6 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src={activeBg} className="w-full h-full object-cover opacity-30 blur-sm" alt="Loading" />
                <div className="absolute inset-0 bg-black/60"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center">
                <img src={activeLogo} className="h-20 mb-8 animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" alt="LICON" />
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-white/10 border-t-brand-accent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xs animate-pulse">⚽</div>
                </div>
                <div className="mt-6 font-header text-xl uppercase tracking-[0.2em] text-white animate-pulse">
                    Generando Roster...
                </div>
                <p className="text-xs text-white/40 mt-2">Conectando con la base de datos de la Selección Licon 2026</p>
            </div>
        </div>
    );
  }

  if (!sessionActive) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img src={activeBg} alt="Fondo" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-brand-dark/50 to-black/40"></div>
        </div>
        <div className="bg-brand-purple/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 relative z-10 animate-pop">
            <div className="flex flex-col items-center mb-8">
                <img src={activeLogo} alt="LICON" className="h-20 md:h-24 object-contain mb-4 drop-shadow-lg" />
                <h2 className="font-legends text-3xl md:text-4xl text-white uppercase tracking-[0.2em] drop-shadow-md text-center">LEGENDS</h2>
                <p className="text-gray-300 text-sm mt-2 font-sans tracking-wide">Álbum Oficial de Colección</p>
            </div>

            <div className="flex bg-black/40 p-1 rounded-lg mb-6">
                <button 
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-2 rounded font-bold uppercase text-xs transition-colors ${authMode === 'login' ? 'bg-brand-accent text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    Ingresar
                </button>
                <button 
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 py-2 rounded font-bold uppercase text-xs transition-colors ${authMode === 'register' ? 'bg-brand-accent text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    Registro
                </button>
            </div>

            {authMode === 'login' ? (
                 <form onSubmit={handleLogin} className="space-y-6">
                    {user.isRegistered && (
                        <div className="bg-green-500/20 border border-green-500/50 p-3 rounded text-center">
                            <p className="text-green-300 text-xs">¡Bienvenido de nuevo, <strong>{user.name}</strong>!</p>
                        </div>
                    )}
                    {!user.isRegistered && (
                         <div className="bg-yellow-500/20 border border-yellow-500/50 p-3 rounded text-center">
                            <p className="text-yellow-300 text-xs">No hay datos. Regístrate.</p>
                        </div>
                    )}
                    <div>
                        <input 
                            type="email" 
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required 
                            className="w-full bg-black/30 border border-gray-600 rounded p-3 text-white outline-none" 
                            placeholder="usuario@licon.com" 
                        />
                        {loginError && <p className="text-red-500 text-xs mt-2">{loginError}</p>}
                    </div>
                    <button type="submit" className="w-full bg-white text-brand-dark hover:bg-gray-200 font-bold py-4 rounded shadow-lg uppercase tracking-widest">Entrar</button>
                </form>
            ) : (
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <input name="name" required className="w-full bg-black/30 border border-gray-600 rounded p-3 text-white outline-none" placeholder="Tu Nombre" />
                    </div>
                    <div>
                        <input name="email" type="email" required className="w-full bg-black/30 border border-gray-600 rounded p-3 text-white outline-none" placeholder="usuario@licon.com" />
                    </div>
                    <button type="submit" className="w-full bg-brand-accent hover:bg-red-600 text-white font-bold py-4 rounded shadow-lg uppercase tracking-widest">Comenzar</button>
                </form>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-brand-dark overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
             <img src={activeBg} alt="Soccer Field" className="w-full h-full object-cover opacity-100" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>
        </div>

        {/* ADMIN CMS OVERLAY */}
        {currentPage === 'admin' && isAdmin && (
            <div className="fixed inset-0 z-[100]">
                <AdminPanel 
                    roster={roster} 
                    onUpdateRoster={handleRosterUpdate}
                    onClose={() => setCurrentPage('album')} 
                />
            </div>
        )}

        {/* Legacy Assets Modal */}
        {showSettings && isAdmin && (
            <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
                <div className="bg-brand-purple p-6 rounded-lg max-w-lg w-full border border-white/20 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-header text-white">Assets Globales</h3>
                        <button onClick={() => setShowSettings(false)}>✕</button>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-black/20 p-3 rounded">
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Logo LICON (PNG/SVG)</label>
                            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleAssetUpload('logoUrl', e.target.files[0])} className="text-xs text-white" />
                        </div>
                        <div className="bg-black/20 p-3 rounded">
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Portada Álbum</label>
                            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleAssetUpload('coverUrl', e.target.files[0])} className="text-xs text-white" />
                        </div>
                        <div className="bg-black/20 p-3 rounded">
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Fondo Principal</label>
                            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleAssetUpload('backgroundUrl', e.target.files[0])} className="text-xs text-white" />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {achievementToast && (
             <div className="fixed top-24 right-4 z-50 bg-gradient-to-r from-gold to-yellow-600 text-brand-dark p-4 rounded-lg shadow-2xl animate-pop border-2 border-white flex gap-4 items-center max-w-xs">
                <div className="text-4xl">{achievementToast.icon}</div>
                <div>
                    <div className="text-xs font-bold uppercase tracking-wider">¡Logro Desbloqueado!</div>
                    <div className="font-header font-bold text-lg leading-tight">{achievementToast.title}</div>
                    <div className="text-xs opacity-80 mt-1">Premio: {achievementToast.rewardPacks} Sobres</div>
                </div>
             </div>
        )}

        {newPackCards && (
            <PackOpening 
              newCards={newPackCards} 
              onClose={() => setNewPackCards(null)} 
              userCollection={user.collection}
              userDuplicates={user.duplicates}
              logoUrl={activeLogo}
            />
        )}

        <nav className="sticky top-0 z-40 bg-brand-purple/95 backdrop-blur border-b border-white/10 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
                <div className="flex items-center gap-4 cursor-pointer" onClick={resetToCover}>
                    <img src={activeLogo} alt="LICON" className="h-7 md:h-10 object-contain" />
                    <div className="h-8 w-px bg-white/20 hidden md:block"></div>
                    <span className="font-legends text-xl md:text-2xl text-white tracking-widest pt-1 hidden md:block drop-shadow-lg">LEGENDS</span>
                </div>
                
                <div className="flex items-center gap-4 md:gap-6">
                     {/* Collection Counter */}
                     <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Colección</span>
                        <span className="text-sm font-legends text-white tracking-wide"><span className="text-brand-accent">{totalOwned}</span> / {totalCards}</span>
                     </div>

                     {/* ADMIN BUTTONS */}
                     {isAdmin && (
                         <div className="flex items-center gap-2 border-r border-white/20 pr-4 mr-2">
                             <button onClick={() => setShowSettings(true)} className="text-white/50 hover:text-brand-accent text-xs font-bold uppercase" title="Global Assets">
                                 Assets
                             </button>
                             <button onClick={() => setCurrentPage('admin')} className="bg-brand-accent text-white text-xs font-bold px-2 py-1 rounded uppercase animate-pulse hover:bg-white hover:text-brand-accent transition-colors" title="CMS Completo">
                                 Admin Panel
                             </button>
                         </div>
                     )}

                    <button 
                        onClick={openPack}
                        disabled={!canOpenDailyPack() && user.packsAvailable === 0}
                        className={`relative flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
                            (canOpenDailyPack() || user.packsAvailable > 0) 
                            ? 'bg-gradient-to-r from-gold to-yellow-600 text-black hover:scale-105 shadow-[0_0_15px_rgba(255,215,0,0.4)]' 
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <span>⚡ Abrir Sobre</span>
                        {user.packsAvailable > 0 && (
                             <span className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] absolute -top-2 -right-2 border-2 border-brand-purple">{user.packsAvailable}</span>
                        )}
                    </button>

                    <div className="flex bg-black/30 p-1 rounded-lg">
                        <button onClick={() => setCurrentPage('album')} className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${currentPage === 'album' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Álbum</button>
                        <button onClick={() => setCurrentPage('trade')} className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${currentPage === 'trade' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Cambios</button>
                        <button onClick={() => setCurrentPage('profile')} className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${currentPage === 'profile' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Perfil</button>
                        <button onClick={() => setSessionActive(false)} className="px-3 py-1.5 rounded text-xs font-bold uppercase text-red-400 hover:text-red-300 ml-1">↩</button>
                    </div>
                </div>
            </div>
        </nav>

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-20">
            {currentPage === 'album' && (
                <Book key={bookResetKey} roster={roster} user={user} globalAssets={globalAssets} />
            )}
            {currentPage === 'trade' && (
                <div className="bg-brand-dark/90 min-h-full border-t-4 border-gold">
                    <TradeCenter roster={roster} collection={user.collection} duplicates={user.duplicates} onTrade={handleTrade} />
                </div>
            )}
            {currentPage === 'profile' && (
                <div className="max-w-4xl mx-auto p-8 text-white bg-brand-dark/90 border border-white/10 min-h-full rounded-lg mt-8 backdrop-blur-sm">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-accent to-purple-600 border-4 border-white/10 flex items-center justify-center text-4xl font-bold shadow-xl">
                            {user.name[0]}
                        </div>
                        <div>
                            <h1 className="text-3xl font-header font-bold uppercase">{user.name}</h1>
                            <p className="text-white/50">{user.email}</p>
                            {isAdmin && <span className="text-xs text-gold font-bold border border-gold px-1 rounded ml-2">ADMINISTRADOR</span>}
                            <div className="mt-2 text-brand-accent font-bold">{completionPercentage}% Completado</div>
                        </div>
                    </div>
                    <h2 className="text-2xl font-header font-bold uppercase border-b border-white/10 pb-2 mb-6">Logros</h2>
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
