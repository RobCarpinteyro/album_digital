
import React, { useState, useEffect } from 'react';
import { CardData } from '../types';
import Card from './Card';

interface PackOpeningProps {
  newCards: CardData[];
  onClose: () => void;
  userCollection: number[];
  userDuplicates: Record<number, number>;
  logoUrl: string;
}

const PackOpening: React.FC<PackOpeningProps> = ({ newCards, onClose, userCollection, userDuplicates, logoUrl }) => {
  const [phase, setPhase] = useState<'idle' | 'shaking' | 'revealing' | 'summary'>('idle');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    // Auto start the shake
    const timer = setTimeout(() => setPhase('shaking'), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'shaking') {
        const timer = setTimeout(() => setPhase('revealing'), 1000);
        return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleNextCard = () => {
    if (currentCardIndex < newCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setPhase('summary');
    }
  };

  const getCardCount = (id: number) => {
    let count = 0;
    if (userCollection.includes(id)) count = 1;
    if (userDuplicates[id]) count += userDuplicates[id];
    return count;
  };

  if (phase === 'idle' || phase === 'shaking') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
         <div className={`relative w-64 h-80 bg-gradient-to-b from-brand-accent to-brand-dark rounded-xl border-4 border-gold shadow-[0_0_50px_rgba(233,69,96,0.6)] flex items-center justify-center cursor-pointer ${phase === 'shaking' ? 'animate-shake' : ''}`}>
            <div className="text-center">
                <img src={logoUrl} alt="LICON" className="h-16 object-contain mx-auto mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                <h2 className="font-header text-3xl font-bold text-white uppercase tracking-wider">Sobre<br/>Diario</h2>
                <p className="text-white/60 text-sm mt-2">Toca para abrir</p>
            </div>
         </div>
      </div>
    );
  }

  if (phase === 'revealing') {
      const card = newCards[currentCardIndex];
      const count = getCardCount(card.id);
      const isNew = count === 1;

      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95" onClick={handleNextCard}>
            <h2 className="text-white/50 text-xl mb-8 font-header uppercase tracking-widest animate-pulse">
                Carta {currentCardIndex + 1} / {newCards.length}
            </h2>
            <div className="w-64 h-auto animate-pop">
                <Card 
                  data={card} 
                  isOwned={true} 
                  count={count} 
                  showCount={true}
                  isNew={isNew}
                />
            </div>
            <div className="mt-8 flex flex-col items-center">
                {isNew ? (
                    <span className="text-green-400 font-bold text-lg uppercase tracking-widest animate-bounce">¡Carta Nueva!</span>
                ) : (
                    <span className="text-yellow-500 font-bold text-lg uppercase tracking-widest">¡Repetida!</span>
                )}
                <p className="mt-2 text-white/40 text-sm">Toca para continuar</p>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
        <div className="bg-brand-purple border border-white/10 rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-header font-bold text-white mb-2">¡Sobre Abierto!</h2>
                <p className="text-gray-400">Estas cartas han sido añadidas a tu colección.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {newCards.map((card, idx) => {
                    const count = getCardCount(card.id);
                    const isNew = count === 1;
                    return (
                        <div key={idx} className="transform hover:scale-105 transition-transform duration-200">
                            <Card 
                              data={card} 
                              isOwned={true} 
                              count={count} 
                              showCount={true} 
                              isNew={isNew}
                            />
                        </div>
                    );
                })}
            </div>

            <button 
                onClick={onClose}
                className="w-full py-4 bg-brand-accent hover:bg-red-600 text-white font-bold rounded-lg uppercase tracking-wider transition-colors"
            >
                Guardar en Álbum
            </button>
        </div>
    </div>
  );
};

export default PackOpening;
