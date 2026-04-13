import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, Heart, Zap, Package, Trash2, Trophy, ChevronRight, User, Skull } from 'lucide-react';
import { RPGState, Equipment, Monster, PlayerStats, EquipmentType } from '../../types';
import { generateMonster, generateEquipment, calculateTotalStats, checkLevelUp } from '../../utils/rpg';

interface RPGPanelProps {
  rpgState: RPGState;
  setRpgState: React.Dispatch<React.SetStateAction<RPGState>>;
  onCombatAction: (action: 'attack' | 'q' | 'w' | 'e' | 'r') => void;
}

export const RPGPanel: React.FC<RPGPanelProps> = ({ rpgState, setRpgState, onCombatAction }) => {
  const { player, inventory, equipped, currentMonster, combatLogs } = rpgState;
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [selectedEquipType, setSelectedEquipType] = useState<EquipmentType | null>(null);

  const totalStats = calculateTotalStats(player, equipped);

  const handleEquip = (index: number) => {
    const item = inventory[index];
    if (!item) return;

    const type = item.type;
    const currentlyEquipped = equipped[type];

    setRpgState(prev => {
      const newInventory = [...prev.inventory];
      newInventory[index] = currentlyEquipped;
      
      return {
        ...prev,
        inventory: newInventory,
        equipped: {
          ...prev.equipped,
          [type]: item
        }
      };
    });
    setSelectedItemIndex(null);
    setSelectedEquipType(null);
  };

  const handleUnequip = (type: EquipmentType) => {
    const item = equipped[type];
    if (!item) return;

    const emptySlot = inventory.indexOf(null);
    if (emptySlot === -1) {
      setRpgState(prev => ({
        ...prev,
        combatLogs: ["Inventory full! Cannot unequip.", ...prev.combatLogs].slice(0, 50)
      }));
      return;
    }

    setRpgState(prev => {
      const newInventory = [...prev.inventory];
      newInventory[emptySlot] = item;
      return {
        ...prev,
        inventory: newInventory,
        equipped: {
          ...prev.equipped,
          [type]: null
        }
      };
    });
    setSelectedEquipType(null);
    setSelectedItemIndex(null);
  };

  const handleDiscard = (index: number) => {
    setRpgState(prev => {
      const newInventory = [...prev.inventory];
      newInventory[index] = null;
      return { ...prev, inventory: newInventory };
    });
    setSelectedItemIndex(null);
  };

  const handleDiscardEquipped = (type: EquipmentType) => {
    setRpgState(prev => ({
      ...prev,
      equipped: {
        ...prev.equipped,
        [type]: null
      }
    }));
    setSelectedEquipType(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'd') {
        if (selectedItemIndex !== null) {
          handleDiscard(selectedItemIndex);
        } else if (selectedEquipType !== null) {
          handleDiscardEquipped(selectedEquipType);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIndex, selectedEquipType]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Player Stats & Monster Combat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player Stats */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                <User className="text-cyan-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black italic uppercase tracking-tighter">Level {player.level}</h3>
                <div className="w-32 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 transition-all duration-500" 
                    style={{ width: `${(player.xp / (player.level * 1000)) * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <StatBar icon={<Heart className="text-red-400" size={14} />} label="HP" current={player.hp} max={totalStats.maxHp} color="bg-red-500" />
            <StatBar icon={<Zap className="text-blue-400" size={14} />} label="MP" current={player.mp} max={totalStats.maxMp} color="bg-blue-500" />
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <StatItem icon={<Sword size={14} />} label="ATK" value={totalStats.attack} />
              <StatItem icon={<Shield size={14} />} label="DEF" value={totalStats.defense} />
              <StatItem icon={<Zap size={14} />} label="Skill %" value={`${totalStats.skillPower}%`} />
              <StatItem icon={<Heart size={14} />} label="Lifesteal" value={`${totalStats.lifeStealAtk}%`} />
            </div>
          </div>
        </div>

        {/* Combat Area */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col">
          {currentMonster ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-red-400">{currentMonster.name}</h3>
                <Skull className="text-red-500/50" size={20} />
              </div>
              
              <div className="flex-1 flex items-center justify-center mb-6">
                <motion.img 
                  key={currentMonster.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={currentMonster.image} 
                  alt={currentMonster.name}
                  className="w-32 h-32 rounded-2xl border-2 border-red-500/20 shadow-lg shadow-red-500/10"
                  referrerPolicy="no-referrer"
                />
              </div>

              <StatBar label="Monster HP" current={currentMonster.hp} max={currentMonster.maxHp} color="bg-red-600" />

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button 
                  onClick={() => onCombatAction('attack')}
                  className="bg-white text-black font-black uppercase py-3 rounded-xl hover:bg-cyan-400 transition-all active:scale-95 text-sm flex flex-col items-center"
                >
                  <span>Attack</span>
                  <span className="text-[10px] opacity-50">Key: A</span>
                </button>
                <button 
                  onClick={() => onCombatAction('q')}
                  disabled={player.mp < 30}
                  className={`font-black uppercase py-3 rounded-xl transition-all active:scale-95 text-sm flex flex-col items-center ${
                    player.mp >= 30 ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  <span>Heal</span>
                  <span className="text-[10px] opacity-50">Q (30 MP)</span>
                </button>
                <button 
                  onClick={() => onCombatAction('w')}
                  disabled={player.mp < 40}
                  className={`font-black uppercase py-3 rounded-xl transition-all active:scale-95 text-sm flex flex-col items-center ${
                    player.mp >= 40 ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  <span>Power Strike</span>
                  <span className="text-[10px] opacity-50">W (40 MP)</span>
                </button>
                <button 
                  onClick={() => onCombatAction('e')}
                  disabled={player.mp < 60}
                  className={`font-black uppercase py-3 rounded-xl transition-all active:scale-95 text-sm flex flex-col items-center ${
                    player.mp >= 60 ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  <span>Magic Burst</span>
                  <span className="text-[10px] opacity-50">E (60 MP)</span>
                </button>
                <button 
                  onClick={() => onCombatAction('r')}
                  disabled={player.mp < 100}
                  className={`col-span-2 font-black uppercase py-3 rounded-xl transition-all active:scale-95 text-sm flex flex-col items-center ${
                    player.mp >= 100 ? 'bg-orange-600 text-white hover:bg-orange-500' : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  <span>Ultimate</span>
                  <span className="text-[10px] opacity-50">R (100 MP)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <Skull className="text-white/20" size={32} />
              </div>
              <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No monster nearby</p>
              <button 
                onClick={() => setRpgState(prev => ({ ...prev, currentMonster: generateMonster(prev.player.level) }))}
                className="mt-6 bg-white/10 border border-white/10 text-white font-black uppercase px-6 py-3 rounded-xl hover:bg-white/20 transition-all"
              >
                Find Monster
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inventory & Equipment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment Slots */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-2">
            <Shield size={14} /> Equipment
          </h3>
          <div className="space-y-4">
            <EquipSlot 
              label="Weapon" 
              item={equipped.weapon} 
              isSelected={selectedEquipType === 'weapon'} 
              onClick={() => { setSelectedEquipType('weapon'); setSelectedItemIndex(null); }}
              onDoubleClick={() => handleUnequip('weapon')}
            />
            <EquipSlot 
              label="Body" 
              item={equipped.armor_upper} 
              isSelected={selectedEquipType === 'armor_upper'} 
              onClick={() => { setSelectedEquipType('armor_upper'); setSelectedItemIndex(null); }}
              onDoubleClick={() => handleUnequip('armor_upper')}
            />
            <EquipSlot 
              label="Legs" 
              item={equipped.armor_lower} 
              isSelected={selectedEquipType === 'armor_lower'} 
              onClick={() => { setSelectedEquipType('armor_lower'); setSelectedItemIndex(null); }}
              onDoubleClick={() => handleUnequip('armor_lower')}
            />
          </div>
        </div>

        {/* 4x4 Inventory */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-2">
            <Package size={14} /> Inventory (4x4)
          </h3>
          <div className="grid grid-cols-4 gap-3 aspect-square max-w-[320px] mx-auto">
            {inventory.map((item, i) => (
              <div 
                key={i}
                onDoubleClick={() => handleEquip(i)}
                onClick={() => setSelectedItemIndex(i)}
                className={`aspect-square rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center relative group ${
                  selectedItemIndex === i 
                    ? 'border-cyan-500 bg-cyan-500/10' 
                    : item 
                    ? 'border-white/10 bg-white/5 hover:border-white/30' 
                    : 'border-white/5 bg-black/20'
                }`}
              >
                {item ? (
                  <div className="text-center">
                    <div className={`text-xs font-black ${getTierColor(item.tier)}`}>T{item.tier}</div>
                    <div className="text-[8px] uppercase font-bold text-white/40 truncate px-1">{item.name.split(' ')[1]}</div>
                  </div>
                ) : (
                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                )}
                
                {/* Tooltip */}
                {item && selectedItemIndex === i && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black/90 border border-white/20 p-3 rounded-xl z-50 pointer-events-none backdrop-blur-xl shadow-2xl">
                    <div className={`text-xs font-black uppercase ${getTierColor(item.tier)}`}>{item.name}</div>
                    <div className="text-[10px] text-white/60 mt-1">{item.description}</div>
                    <div className="mt-2 space-y-1">
                      {Object.entries(item.stats).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-[10px] font-bold">
                          <span className="text-white/40 uppercase">{key}</span>
                          <span className="text-cyan-400">+{val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 text-[8px] text-white/20 uppercase text-center">
                      Double Click to Equip • Press D to Discard
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equipped Item Tooltip */}
      <AnimatePresence>
        {selectedEquipType && equipped[selectedEquipType] && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 right-8 w-64 bg-black/90 border border-white/20 p-4 rounded-2xl z-50 backdrop-blur-xl shadow-2xl"
          >
            <div className={`text-sm font-black uppercase ${getTierColor(equipped[selectedEquipType]!.tier)}`}>
              {equipped[selectedEquipType]!.name}
            </div>
            <div className="text-xs text-white/60 mt-1">{equipped[selectedEquipType]!.description}</div>
            <div className="mt-4 space-y-2">
              {Object.entries(equipped[selectedEquipType]!.stats).map(([key, val]) => (
                <div key={key} className="flex justify-between text-xs font-bold">
                  <span className="text-white/40 uppercase">{key}</span>
                  <span className="text-cyan-400">+{val}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-white/20 uppercase text-center">
              Double Click to Unequip • Press D to Discard
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combat Logs */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-4 h-32 overflow-y-auto font-mono text-[10px] space-y-1">
        {combatLogs.map((log, i) => (
          <div key={i} className={log.includes('damage') ? 'text-red-400' : log.includes('gain') ? 'text-green-400' : 'text-white/40'}>
            {log}
          </div>
        ))}
        {combatLogs.length === 0 && <div className="text-white/10 italic">Combat logs will appear here...</div>}
      </div>
    </div>
  );
};

const StatBar = ({ icon, label, current, max, color }: { icon?: React.ReactNode, label: string, current: number, max: number, color: string }) => (
  <div>
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
      <div className="flex items-center gap-1">{icon} {label}</div>
      <div className="tabular-nums">{current} / {max}</div>
    </div>
    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(current / max) * 100}%` }}
        className={`h-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
      />
    </div>
  </div>
);

const StatItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
    <div className="text-white/40">{icon}</div>
    <div>
      <div className="text-[8px] font-black uppercase text-white/20 leading-none">{label}</div>
      <div className="text-xs font-bold text-white leading-none mt-1">{value}</div>
    </div>
  </div>
);

const EquipSlot = ({ label, item, isSelected, onClick, onDoubleClick }: { label: string, item: Equipment | null, isSelected: boolean, onClick: () => void, onDoubleClick: () => void }) => (
  <div 
    onClick={onClick}
    onDoubleClick={onDoubleClick}
    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer group ${
      isSelected ? 'border-cyan-500 bg-cyan-500/10' : 'bg-white/5 border-white/5 hover:border-white/20'
    }`}
  >
    <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
      {item ? <Sword size={16} className={getTierColor(item.tier)} /> : <div className="w-1 h-1 bg-white/10 rounded-full" />}
    </div>
    <div className="flex-1">
      <div className="text-[8px] font-black uppercase text-white/20">{label}</div>
      <div className={`text-xs font-bold ${item ? 'text-white' : 'text-white/10'}`}>{item ? item.name : 'Empty'}</div>
    </div>
    {item && <div className={`text-[10px] font-black ${getTierColor(item.tier)}`}>T{item.tier}</div>}
  </div>
);

const getTierColor = (tier: number) => {
  switch (tier) {
    case 1: return 'text-white/60';
    case 2: return 'text-green-400';
    case 3: return 'text-blue-400';
    case 4: return 'text-purple-400';
    case 5: return 'text-orange-400';
    default: return 'text-white';
  }
};
