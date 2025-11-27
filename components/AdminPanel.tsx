
import React, { useState, useEffect } from 'react';
import { CardData, Department, Rarity } from '../types';
import Card from './Card';

interface AdminPanelProps {
  roster: CardData[];
  onUpdateRoster: (updatedCard: CardData) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ roster, onUpdateRoster, onClose }) => {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<string>('ALL');
  
  // Form State
  const [editForm, setEditForm] = useState<CardData | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Select a card to edit
  useEffect(() => {
    if (selectedCardId) {
        const card = roster.find(c => c.id === selectedCardId);
        if (card) {
            setEditForm({ ...card });
            setImagePreview(card.imageUrl);
        }
    }
  }, [selectedCardId, roster]);

  // Helper to compress image
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 500; // Max width 500px is enough for card display
                
                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // Compress to JPEG at 70% quality
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                } else {
                    resolve(e.target?.result as string); // Fallback
                }
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editForm) {
        setIsProcessing(true);
        try {
            const compressedBase64 = await resizeImage(file);
            setImagePreview(compressedBase64);
            setEditForm({ ...editForm, imageUrl: compressedBase64 });
        } catch (error) {
            console.error("Error resizing image", error);
            alert("Error al procesar la imagen.");
        } finally {
            setIsProcessing(false);
        }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      if (!editForm) return;
      const { name, value } = e.target;
      
      setEditForm({
          ...editForm,
          [name]: name === 'power' ? parseInt(value) : value
      });
  };

  const handleSave = () => {
      if (editForm) {
          onUpdateRoster(editForm);
          // Don't show alert here, let App handle errors or success
      }
  };

  // Filter Logic
  const filteredRoster = roster.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) || card.id.toString().includes(searchTerm);
      const matchesDept = filterDept === 'ALL' || card.department === filterDept;
      return matchesSearch && matchesDept;
  });

  return (
    <div className="fixed inset-0 z-50 bg-brand-dark flex flex-col text-white">
      {/* Header */}
      <div className="h-16 bg-brand-purple border-b border-white/10 flex items-center justify-between px-6 shadow-lg">
          <div className="flex items-center gap-4">
              <h2 className="font-header text-2xl uppercase tracking-widest text-brand-accent">Panel de Administración</h2>
              <span className="bg-white/10 text-xs px-2 py-1 rounded font-mono">v1.1 Optimizada</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white uppercase font-bold text-sm">
              Cerrar Panel ✕
          </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
          
          {/* SIDEBAR LIST */}
          <div className="w-80 bg-black/20 border-r border-white/5 flex flex-col">
              <div className="p-4 border-b border-white/5 space-y-3">
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre o ID..." 
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-brand-accent outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select 
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white outline-none"
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                  >
                      <option value="ALL">Todos los Departamentos</option>
                      {Object.values(Department).map(d => (
                          <option key={d} value={d}>{d}</option>
                      ))}
                  </select>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {filteredRoster.map(card => (
                      <div 
                        key={card.id}
                        onClick={() => setSelectedCardId(card.id)}
                        className={`p-3 rounded cursor-pointer flex items-center gap-3 transition-colors ${selectedCardId === card.id ? 'bg-brand-accent text-white' : 'hover:bg-white/5 text-gray-300'}`}
                      >
                          <div className="font-mono text-xs opacity-50 w-6">#{card.id}</div>
                          <div className="truncate flex-1 font-bold text-sm">{card.name}</div>
                          {card.imageUrl.startsWith('data:') && <span className="text-[10px] bg-white text-black px-1 rounded">EDIT</span>}
                      </div>
                  ))}
              </div>
          </div>

          {/* MAIN EDITOR AREA */}
          <div className="flex-1 overflow-y-auto bg-brand-dark p-8">
              {editForm ? (
                  <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">
                      
                      {/* LEFT: FORM */}
                      <div className="flex-1 space-y-6">
                          <h3 className="text-xl font-header font-bold border-b border-white/10 pb-2 mb-6">Editar Tarjeta #{editForm.id}</h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Nombre</label>
                                  <input name="name" value={editForm.name} onChange={handleInputChange} className="w-full bg-black/30 border border-white/10 rounded p-2" />
                              </div>
                              <div>
                                  <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Rol / Puesto</label>
                                  <input name="role" value={editForm.role} onChange={handleInputChange} className="w-full bg-black/30 border border-white/10 rounded p-2" />
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Departamento</label>
                                    <select name="department" value={editForm.department} onChange={handleInputChange} className="w-full bg-black/30 border border-white/10 rounded p-2">
                                        {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Rareza</label>
                                    <select name="rarity" value={editForm.rarity} onChange={handleInputChange} className="w-full bg-black/30 border border-white/10 rounded p-2">
                                        {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                          </div>

                          <div>
                              <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Descripción (Reverso)</label>
                              <textarea name="description" rows={3} value={editForm.description} onChange={handleInputChange} className="w-full bg-black/30 border border-white/10 rounded p-2" />
                          </div>

                          <div>
                              <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Poder (Impacto) - {editForm.power}</label>
                              <input type="range" name="power" min="1" max="99" value={editForm.power} onChange={handleInputChange} className="w-full accent-brand-accent" />
                          </div>

                          <div className="bg-white/5 p-4 rounded border border-white/10 border-dashed">
                              <label className="block text-xs text-brand-accent uppercase font-bold mb-2">Cambiar Imagen de la Tarjeta</label>
                              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-accent file:text-white hover:file:bg-red-600" />
                              <p className="text-[10px] text-gray-500 mt-2">La imagen se redimensionará automáticamente para ahorrar espacio.</p>
                              {isProcessing && <p className="text-yellow-400 text-xs mt-1 animate-pulse">Procesando imagen...</p>}
                          </div>

                          <div className="pt-6">
                              <button onClick={handleSave} disabled={isProcessing} className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded uppercase tracking-widest shadow-lg transition-transform transform active:scale-95">
                                  Guardar Cambios
                              </button>
                          </div>
                      </div>

                      {/* RIGHT: PREVIEW */}
                      <div className="w-full lg:w-80 flex flex-col items-center">
                          <h4 className="text-sm text-gray-400 uppercase font-bold mb-4">Previsualización en Vivo</h4>
                          <div className="w-64 h-auto shadow-2xl">
                              {editForm && (
                                  <Card 
                                    data={{...editForm, imageUrl: imagePreview}} 
                                    isOwned={true} 
                                    count={1} 
                                    showCount={false} 
                                  />
                              )}
                          </div>
                          <p className="text-xs text-gray-500 mt-4 text-center">Haz clic en la tarjeta para ver el reverso.</p>
                      </div>

                  </div>
              ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white/20">
                      <div className="text-6xl mb-4">Cards CMS</div>
                      <p>Selecciona una tarjeta de la lista izquierda para editar.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default AdminPanel;
