import { Equipment, EquipmentType, EquipmentStats, Monster, PlayerStats, RPGState } from '../types';

const XP_TABLE = [0, 100, 300, 700, 1500, 3000, 6000, 12000, 24000, 50000, 100000];

export const getHpMax = (level: number) => {
  // Level 1: 100, Level 10: 10000
  return Math.floor(100 * Math.pow(100, (level - 1) / 9));
};

export const getMpMax = (level: number) => {
  // Level 1: 100, Level 10: 10000
  return Math.floor(100 * Math.pow(100, (level - 1) / 9));
};

export const generateEquipment = (monsterLevel: number): Equipment => {
  const tier = Math.min(5, Math.max(1, Math.floor(monsterLevel / 2) + 1));
  const types: EquipmentType[] = ['weapon', 'armor_upper', 'armor_lower'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const stats: EquipmentStats = {};
  const statCount = tier + Math.floor(Math.random() * 2); // Tier 1: 1-2 stats, Tier 5: 5-6 stats
  
  const possibleStats: (keyof EquipmentStats)[] = [
    'attack', 'defense', 'maxHp', 'maxMp', 'skillPower', 'lifeStealAtk', 'lifeStealSkill'
  ];
  
  const selectedStats = [...possibleStats].sort(() => 0.5 - Math.random()).slice(0, statCount);
  
  selectedStats.forEach(stat => {
    const baseValue = tier * 10;
    switch (stat) {
      case 'attack': stats.attack = Math.floor(baseValue * (1 + Math.random())); break;
      case 'defense': stats.defense = Math.floor(baseValue * (0.5 + Math.random())); break;
      case 'maxHp': stats.maxHp = Math.floor(baseValue * 20 * (0.8 + Math.random())); break;
      case 'maxMp': stats.maxMp = Math.floor(baseValue * 20 * (0.8 + Math.random())); break;
      case 'skillPower': stats.skillPower = Math.floor(tier * 5 * (0.5 + Math.random())); break;
      case 'lifeStealAtk': stats.lifeStealAtk = Math.floor(tier * 2 * (0.5 + Math.random())); break;
      case 'lifeStealSkill': stats.lifeStealSkill = Math.floor(tier * 2 * (0.5 + Math.random())); break;
    }
  });

  const prefixes = ['Rusty', 'Common', 'Fine', 'Exquisite', 'Legendary'];
  const names = {
    weapon: ['Sword', 'Axe', 'Staff', 'Dagger', 'Blade'],
    armor_upper: ['Tunic', 'Vest', 'Plate', 'Robe', 'Armor'],
    armor_lower: ['Pants', 'Greaves', 'Leggings', 'Boots', 'Skirt']
  };

  const name = `${prefixes[tier - 1]} ${names[type][Math.floor(Math.random() * names[type].length)]}`;

  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    type,
    tier,
    stats,
    description: `A tier ${tier} ${type.replace('_', ' ')}.`
  };
};

export const generateMonster = (playerLevel: number): Monster => {
  const level = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1);
  const hp = Math.floor(getHpMax(level) * 0.5);
  const atk = Math.floor(level * 15 * (0.8 + Math.random()));
  const def = Math.floor(level * 5 * (0.8 + Math.random()));
  
  const names = ['Slime', 'Goblin', 'Orc', 'Skeleton', 'Dragon', 'Wraith', 'Golem', 'Beholder'];
  const name = names[Math.floor(Math.random() * names.length)];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: `${name} (Lv.${level})`,
    level,
    hp,
    maxHp: hp,
    atk,
    def,
    xpReward: level * 50,
    image: `https://picsum.photos/seed/${name}/200/200`
  };
};

export const calculateTotalStats = (player: PlayerStats, equipped: RPGState['equipped']) => {
  const total = {
    attack: player.baseAtk,
    defense: player.baseDef,
    maxHp: player.maxHp,
    maxMp: player.maxMp,
    skillPower: 0,
    lifeStealAtk: 0,
    lifeStealSkill: 0,
  };

  Object.values(equipped).forEach(item => {
    if (item) {
      if (item.stats.attack) total.attack += item.stats.attack;
      if (item.stats.defense) total.defense += item.stats.defense;
      if (item.stats.maxHp) total.maxHp += item.stats.maxHp;
      if (item.stats.maxMp) total.maxMp += item.stats.maxMp;
      if (item.stats.skillPower) total.skillPower += item.stats.skillPower;
      if (item.stats.lifeStealAtk) total.lifeStealAtk += item.stats.lifeStealAtk;
      if (item.stats.lifeStealSkill) total.lifeStealSkill += item.stats.lifeStealSkill;
    }
  });

  return total;
};

export const checkLevelUp = (player: PlayerStats): PlayerStats => {
  let { level, xp, hp, mp } = player;
  while (level < 10 && xp >= XP_TABLE[level]) {
    level++;
    const newMaxHp = getHpMax(level);
    const newMaxMp = getMpMax(level);
    hp = newMaxHp;
    mp = newMaxMp;
  }
  return {
    ...player,
    level,
    xp,
    hp,
    maxHp: getHpMax(level),
    mp,
    maxMp: getMpMax(level),
    baseAtk: level * 10,
    baseDef: level * 5,
  };
};
