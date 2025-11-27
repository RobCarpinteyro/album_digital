
import React, { useState } from 'react';
import { CardData, Department } from '../types';
import Card from './Card';

interface TradeCenterProps {
  roster: CardData[];
  collection: number[];
  duplicates: Record<number, number>;
  onTrade: (lostCardIds: number[], gainedCardId: number) => void;
}

// Mock data for "Global Market"
const MOCK_MARKET_REQUESTS = [
    { user: 'Sara_Moda', needs: Department.MARKETING, offers: Department.SALES },
    { user: 'Mike_Gamer', needs: Department.IT, offers: Department.OPERATIONS },
    { user: 'Chef_Juan', needs: Department.FINANCE, offers: Department.HR },
];

const TradeCenter: React.FC<TradeCenterProps> = ({ roster, collection, duplicates, onTrade }) => {
  const [view, setView] = useState<'duplicates' | 'market'>('duplicates');
  const [selectedDupes, setSelectedDupes] = useState<number[]>([]);

  const duplicateCards = roster.filter(card => (duplicates[card.id] || 0) > 0);

  const handleSelectDupe = (id: number) => {
    if (selectedDupes.includes(id)) {
        setSelectedDupes(prev => prev.filter(d => d !== id));
    } else {
        if (selectedDupes.length < 3) {
            setSelectedDupes(prev => [...prev, id]);
        }
    }
  };

  const handleBurnTrade = () => {
    // Logic: Trade 3 duplicates for 1 random missing card
    const missingCards = roster.filter(c => !collection.includes(c.id));
    if (missingCards.length === 0) {
        alert("¡Ya tienes todas las cartas!");
        return;
    }
    
    if (selectedDupes.length !== 3) return;

    const randomNew = missingCards[Math.floor(Math.random() * missingCards.length)];
    onTrade(selectedDupes, randomNew.id);
    setSelectedDupes([]);
    alert(`¡Intercambio Exitoso! Recibiste a ${randomNew.name}.`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-header font-bold text-white">Centro de Intercambio</h2>
        <div className="flex gap-2 bg-white/10 p-1 rounded-lg">
            <button 
                onClick={() => setView('duplicates')}
                className={`px-4 py-2 rounded-md text-sm font-bold uppercase transition-colors ${view === 'duplicates' ? 'bg-brand-accent text-white' : 'text-white/50 hover:text-white'}`}
            >
                Mis Repetidas
            </button>
            <button 
                onClick={() => setView('market')}
                className={`px-4 py-2 rounded-md text-sm font-bold uppercase transition-colors ${view === 'market' ? 'bg-brand-accent text-white' : 'text-white/50 hover:text-white'}`}
            >
                Mercado Global
            </button>
        </div>
      </div>

      {view === 'duplicates' && (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* List */}
            <div className="flex-1">
                {duplicateCards.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-xl border-2 border-dashed border-white/10">
                        <div className="text-4xl mb-4">🕸️</div>
                        <p className="text-white/50">No tienes repetidas para cambiar aún.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {duplicateCards.map(card => (
                            <div key={card.id} className="relative">
                                <div 
                                    className={`transform transition-all duration-200 cursor-pointer ${selectedDupes.includes(card.id) ? 'scale-95 ring-4 ring-brand-accent rounded-lg' : 'hover:scale-105'}`}
                                    onClick={() => handleSelectDupe(card.id)}
                                >
                                    <Card data={card} isOwned={true} count={duplicates[card.id]} showCount={true} />
                                </div>
                                {selectedDupes.includes(card.id) && (
                                    <div className="absolute inset-0 bg-brand-accent/20 rounded-lg pointer-events-none flex items-center justify-center">
                                        <span className="text-3xl font-bold text-white drop-shadow-md">✓</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Panel */}
            <div className="w-full lg:w-80 bg-brand-purple p-6 rounded-xl border border-white/10 h-fit sticky top-24">
                <h3 className="text-xl font-header font-bold text-white mb-4">Reciclaje</h3>
                <p className="text-sm text-white/60 mb-6">
                    Selecciona <span className="text-brand-accent font-bold">3 repetidas</span> para cambiar por <span className="text-green-400 font-bold">1 carta nueva</span> garantizada.
                </p>

                <div className="flex justify-center gap-2 mb-8">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`w-16 h-24 rounded border-2 border-dashed flex items-center justify-center ${selectedDupes[i] ? 'border-brand-accent bg-brand-accent/10' : 'border-white/20 bg-black/20'}`}>
                            {selectedDupes[i] ? '🃏' : ''}
                        </div>
                    ))}
                </div>

                <button 
                    onClick={handleBurnTrade}
                    disabled={selectedDupes.length !== 3}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded shadow-lg transition-colors uppercase tracking-wider"
                >
                    Intercambiar
                </button>
            </div>
        </div>
      )}

      {view === 'market' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_MARKET_REQUESTS.map((req, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center font-bold text-white">
                            {req.user[0]}
                        </div>
                        <div>
                            <div className="font-bold text-white">{req.user}</div>
                            <div className="text-xs text-white/40">Activo hace 5m</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between bg-black/20 p-3 rounded">
                        <div className="text-center">
                            <div className="text-xs text-white/40 uppercase">Ofrece</div>
                            <div className="text-sm font-bold text-green-400">{req.offers}</div>
                        </div>
                        <div className="text-gray-500">⇄</div>
                        <div className="text-center">
                            <div className="text-xs text-white/40 uppercase">Busca</div>
                            <div className="text-sm font-bold text-brand-accent">{req.needs}</div>
                        </div>
                    </div>
                    <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded transition-colors">
                        Proponer Cambio
                    </button>
                </div>
            ))}
         </div>
      )}
    </div>
  );
};

export default TradeCenter;