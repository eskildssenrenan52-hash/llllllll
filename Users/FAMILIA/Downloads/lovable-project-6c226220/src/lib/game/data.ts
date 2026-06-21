import type { Item, Monster, GameMap, Tile, TileType, MonsterType, CharacterClass, Player, CharacterStats, EliteTier } from './types'
import { buildAbilityStates } from './abilities'

// ─── Items Database ─────────────────────────────────────────────────────────

export const ITEMS: Record<string, Item> = {
  // Weapons
  wooden_sword: { id: 'wooden_sword', name: 'Espada de Madeira', type: 'weapon', rarity: 'common', icon: '🗡', description: 'Uma espada tosca de madeira.', stats: { attack: 3 }, value: 10 },
  iron_sword: { id: 'iron_sword', name: 'Espada de Ferro', type: 'weapon', rarity: 'common', icon: '⚔', description: 'Uma espada basica de ferro.', stats: { attack: 8 }, value: 80 },
  steel_sword: { id: 'steel_sword', name: 'Espada de Aco', type: 'weapon', rarity: 'uncommon', icon: '⚔', description: 'Forjada em aco resistente.', stats: { attack: 15, critChance: 5 }, value: 300 },
  knight_blade: { id: 'knight_blade', name: 'Lâmina do Cavaleiro', type: 'weapon', rarity: 'rare', icon: '⚔', description: 'A arma preferida dos cavaleiros da guarda.', stats: { attack: 28, defense: 4, critChance: 8 }, value: 1200 },
  titan_sword: { id: 'titan_sword', name: 'Espada do Titan', type: 'weapon', rarity: 'epic', icon: '⚔', description: 'Uma espada lendaria de poder titanico.', stats: { attack: 50, defense: 8, critChance: 12, critDamage: 20 }, value: 5000 },

  wooden_bow: { id: 'wooden_bow', name: 'Arco de Madeira', type: 'weapon', rarity: 'common', icon: '🏹', description: 'Um arco simples de madeira.', stats: { attack: 5, range: 3 }, value: 15 },
  iron_bow: { id: 'iron_bow', name: 'Arco de Ferro', type: 'weapon', rarity: 'common', icon: '🏹', description: 'Um arco reforçado com ferro.', stats: { attack: 12, range: 4 }, value: 100 },
  elven_bow: { id: 'elven_bow', name: 'Arco Élfico', type: 'weapon', rarity: 'rare', icon: '🏹', description: 'Fabricado por elfos mestres.', stats: { attack: 30, range: 5, critChance: 15 }, value: 1500 },
  titan_bow: { id: 'titan_bow', name: 'Arco do Titan', type: 'weapon', rarity: 'epic', icon: '🏹', description: 'Flechas que rasgam o ar como raios.', stats: { attack: 55, range: 6, critChance: 18, critDamage: 25 }, value: 5500 },

  // Necromancer weapons (foices / cajados sombrios)
  bone_scythe: { id: 'bone_scythe', name: 'Foice de Osso', type: 'weapon', rarity: 'common', icon: '🦴', description: 'Foice rudimentar feita de ossos.', stats: { attack: 5, magicPower: 7, range: 4 }, value: 25 },
  cursed_staff: { id: 'cursed_staff', name: 'Cajado Amaldicoado', type: 'weapon', rarity: 'uncommon', icon: '☠', description: 'Pulsa com energia necrotica.', stats: { attack: 8, magicPower: 22, range: 5 }, value: 350 },
  soul_reaper: { id: 'soul_reaper', name: 'Ceifador de Almas', type: 'weapon', rarity: 'rare', icon: '☠', description: 'Colhe a vida dos vivos.', stats: { attack: 14, magicPower: 42, critChance: 10, range: 5 }, value: 1900 },
  lich_staff: { id: 'lich_staff', name: 'Cajado do Lich', type: 'weapon', rarity: 'epic', icon: '☠', description: 'O poder da morte em forma de cajado.', stats: { attack: 22, magicPower: 75, critChance: 16, critDamage: 30, range: 6 }, value: 6200 },

  wooden_staff: { id: 'wooden_staff', name: 'Cajado de Madeira', type: 'weapon', rarity: 'common', icon: '🪄', description: 'Um cajado basico para iniciantes.', stats: { attack: 4, magicPower: 8 }, value: 20 },
  iron_staff: { id: 'iron_staff', name: 'Cajado de Ferro', type: 'weapon', rarity: 'common', icon: '🪄', description: 'Um cajado reforçado com ferro.', stats: { attack: 6, magicPower: 18 }, value: 120 },
  arcane_staff: { id: 'arcane_staff', name: 'Cajado Arcano', type: 'weapon', rarity: 'rare', icon: '🪄', description: 'Carregado de energia magica.', stats: { attack: 10, magicPower: 40, critChance: 10 }, value: 1800 },
  titan_staff: { id: 'titan_staff', name: 'Cajado do Titan', type: 'weapon', rarity: 'epic', icon: '🪄', description: 'O poder arcano em estado puro.', stats: { attack: 18, magicPower: 70, critChance: 15, critDamage: 30 }, value: 6000 },

  // Armor
  leather_armor: { id: 'leather_armor', name: 'Armadura de Couro', type: 'armor', rarity: 'common', icon: '🛡', description: 'Protecao basica de couro.', stats: { defense: 5, maxHp: 20 }, value: 60 },
  chainmail: { id: 'chainmail', name: 'Cota de Malha', type: 'armor', rarity: 'uncommon', icon: '🛡', description: 'Aneis metalicos entrelaçados.', stats: { defense: 12, maxHp: 40 }, value: 250 },
  plate_armor: { id: 'plate_armor', name: 'Armadura de Placas', type: 'armor', rarity: 'rare', icon: '🛡', description: 'Protecao maxima de metal.', stats: { defense: 25, maxHp: 80, speed: -1 }, value: 1000 },
  titan_armor: { id: 'titan_armor', name: 'Armadura do Titan', type: 'armor', rarity: 'epic', icon: '🛡', description: 'Forjada nos forges do abismo.', stats: { defense: 50, maxHp: 200, speed: -2 }, value: 5000 },

  // Helmets
  leather_helmet: { id: 'leather_helmet', name: 'Capacete de Couro', type: 'helmet', rarity: 'common', icon: '⛑', description: 'Protecao basica para a cabeca.', stats: { defense: 3, maxHp: 10 }, value: 40 },
  iron_helmet: { id: 'iron_helmet', name: 'Capacete de Ferro', type: 'helmet', rarity: 'uncommon', icon: '⛑', description: 'Capacete de ferro solido.', stats: { defense: 8, maxHp: 25 }, value: 180 },
  titan_helmet: { id: 'titan_helmet', name: 'Elmo do Titan', type: 'helmet', rarity: 'epic', icon: '⛑', description: 'Protecao lendaria.', stats: { defense: 30, maxHp: 100 }, value: 4000 },

  // Boots
  leather_boots: { id: 'leather_boots', name: 'Botas de Couro', type: 'boots', rarity: 'common', icon: '👢', description: 'Botas confortaveis.', stats: { speed: 1, defense: 2 }, value: 40 },
  iron_boots: { id: 'iron_boots', name: 'Botas de Ferro', type: 'boots', rarity: 'uncommon', icon: '👢', description: 'Botas pesadas mas resistentes.', stats: { speed: -1, defense: 8 }, value: 150 },
  swift_boots: { id: 'swift_boots', name: 'Botas Velozes', type: 'boots', rarity: 'rare', icon: '👢', description: 'Encantadas para maior velocidade.', stats: { speed: 4, defense: 4 }, value: 800 },

  // Rings
  copper_ring: { id: 'copper_ring', name: 'Anel de Cobre', type: 'ring', rarity: 'common', icon: '💍', description: 'Um simples anel de cobre.', stats: { maxMp: 10 }, value: 50 },
  magic_ring: { id: 'magic_ring', name: 'Anel Magico', type: 'ring', rarity: 'uncommon', icon: '💍', description: 'Um anel com encantamento basico.', stats: { maxMp: 30, magicPower: 8 }, value: 300 },
  power_ring: { id: 'power_ring', name: 'Anel do Poder', type: 'ring', rarity: 'rare', icon: '💍', description: 'Amplifica o poder do portador.', stats: { maxHp: 50, maxMp: 50, attack: 10, critChance: 5 }, value: 1500 },

  // Consumables
  small_potion: { id: 'small_potion', name: 'Pocao Pequena', type: 'consumable', rarity: 'common', icon: '🧪', description: 'Restaura 50 HP.', stats: { maxHp: 50 }, stackable: true, quantity: 1, value: 20 },
  potion: { id: 'potion', name: 'Pocao de Cura', type: 'consumable', rarity: 'common', icon: '🧪', description: 'Restaura 120 HP.', stats: { maxHp: 120 }, stackable: true, quantity: 1, value: 50 },
  great_potion: { id: 'great_potion', name: 'Pocao Grande', type: 'consumable', rarity: 'uncommon', icon: '🧪', description: 'Restaura 300 HP.', stats: { maxHp: 300 }, stackable: true, quantity: 1, value: 120 },
  mana_potion: { id: 'mana_potion', name: 'Elixir de Mana', type: 'consumable', rarity: 'common', icon: '🔮', description: 'Restaura 50 MP.', stats: { maxMp: 50 }, stackable: true, quantity: 1, value: 30 },

  // Materials
  slime_gel: { id: 'slime_gel', name: 'Gel de Slime', type: 'material', rarity: 'common', icon: '💚', description: 'Material de crafting basico.', stats: {}, stackable: true, quantity: 1, value: 5 },
  bone_shard: { id: 'bone_shard', name: 'Fragmento de Osso', type: 'material', rarity: 'common', icon: '🦴', description: 'Um estilhaço de osso.', stats: {}, stackable: true, quantity: 1, value: 8 },
  wolf_pelt: { id: 'wolf_pelt', name: 'Pele de Lobo', type: 'material', rarity: 'common', icon: '🐺', description: 'Pele quente de lobo.', stats: {}, stackable: true, quantity: 1, value: 15 },
  demon_horn: { id: 'demon_horn', name: 'Chifre Demonico', type: 'material', rarity: 'rare', icon: '😈', description: 'Chifre de um demonio.', stats: {}, stackable: true, quantity: 1, value: 200 },
  dragon_scale: { id: 'dragon_scale', name: 'Escama de Dragao', type: 'material', rarity: 'epic', icon: '🐉', description: 'Escama quase indestrutivel.', stats: {}, stackable: true, quantity: 1, value: 1000 },
}

// ─── Monster Definitions ────────────────────────────────────────────────────

// Multiplicadores de poder por tier de elite
const ELITE_MULT: Record<EliteTier, { hp: number; atk: number; xp: number; gold: number }> = {
  normal:   { hp: 1,    atk: 1,    xp: 1,   gold: 1 },
  elite:    { hp: 2.2,  atk: 1.5,  xp: 2.5, gold: 2.5 },
  champion: { hp: 4,    atk: 2.1,  xp: 5,   gold: 5 },
  boss:     { hp: 9,    atk: 3.2,  xp: 12,  gold: 12 },
}

const ELITE_PREFIX: Record<EliteTier, string> = {
  normal: '', elite: 'Elite ', champion: 'Campeao ', boss: 'CHEFE ',
}

// Monstros que atacam a distancia
const RANGED_TYPES: MonsterType[] = ['archer_enemy', 'mage_enemy', 'witch']

export function createMonster(type: MonsterType, level: number, x: number, y: number, elite: EliteTier = 'normal'): Monster {
  const templates: Record<MonsterType, Omit<Monster, 'id' | 'position' | 'targetPosition' | 'animFrame' | 'animTimer' | 'isDead' | 'deathTimer' | 'isMoving' | 'isAttacking' | 'attackCooldown' | 'isAggrod' | 'direction' | 'attackRange' | 'isRanged' | 'elite'>> = {
    slime: { type: 'slime', name: 'Slime', level, hp: 20 * level, maxHp: 20 * level, attack: 3 * level, defense: 1, speed: 1.5, xpReward: 10 * level, goldReward: 2 * level, aggroRange: 120, drops: [{ item: { ...ITEMS.slime_gel, quantity: 1 }, chance: 0.7 }, { item: { ...ITEMS.small_potion, quantity: 1 }, chance: 0.15 }] },
    skeleton: { type: 'skeleton', name: 'Esqueleto', level, hp: 30 * level, maxHp: 30 * level, attack: 7 * level, defense: 3, speed: 2, xpReward: 18 * level, goldReward: 5 * level, aggroRange: 150, drops: [{ item: { ...ITEMS.bone_shard, quantity: 1 }, chance: 0.8 }, { item: { ...ITEMS.iron_sword, quantity: 1 }, chance: 0.05 }] },
    goblin: { type: 'goblin', name: 'Goblin', level, hp: 25 * level, maxHp: 25 * level, attack: 6 * level, defense: 2, speed: 2.5, xpReward: 15 * level, goldReward: 8 * level, aggroRange: 140, drops: [{ item: { ...ITEMS.small_potion, quantity: 1 }, chance: 0.3 }, { item: { ...ITEMS.leather_armor, quantity: 1 }, chance: 0.04 }] },
    orc: { type: 'orc', name: 'Orc', level, hp: 60 * level, maxHp: 60 * level, attack: 12 * level, defense: 6, speed: 1.8, xpReward: 30 * level, goldReward: 15 * level, aggroRange: 130, drops: [{ item: { ...ITEMS.chainmail, quantity: 1 }, chance: 0.08 }, { item: { ...ITEMS.potion, quantity: 1 }, chance: 0.25 }] },
    wolf: { type: 'wolf', name: 'Lobo', level, hp: 35 * level, maxHp: 35 * level, attack: 9 * level, defense: 2, speed: 3.5, xpReward: 20 * level, goldReward: 6 * level, aggroRange: 160, drops: [{ item: { ...ITEMS.wolf_pelt, quantity: 1 }, chance: 0.75 }, { item: { ...ITEMS.leather_boots, quantity: 1 }, chance: 0.06 }] },
    spider: { type: 'spider', name: 'Aranha Venenosa', level, hp: 28 * level, maxHp: 28 * level, attack: 8 * level, defense: 2, speed: 2.8, xpReward: 22 * level, goldReward: 7 * level, aggroRange: 110, drops: [{ item: { ...ITEMS.mana_potion, quantity: 1 }, chance: 0.2 }, { item: { ...ITEMS.copper_ring, quantity: 1 }, chance: 0.04 }] },
    zombie: { type: 'zombie', name: 'Zumbi', level, hp: 45 * level, maxHp: 45 * level, attack: 8 * level, defense: 4, speed: 1.2, xpReward: 25 * level, goldReward: 10 * level, aggroRange: 100, drops: [{ item: { ...ITEMS.bone_shard, quantity: 1 }, chance: 0.5 }, { item: { ...ITEMS.potion, quantity: 1 }, chance: 0.2 }] },
    demon: { type: 'demon', name: 'Demonio', level, hp: 80 * level, maxHp: 80 * level, attack: 18 * level, defense: 8, speed: 2.2, xpReward: 50 * level, goldReward: 30 * level, aggroRange: 170, drops: [{ item: { ...ITEMS.demon_horn, quantity: 1 }, chance: 0.5 }, { item: { ...ITEMS.great_potion, quantity: 1 }, chance: 0.3 }, { item: { ...ITEMS.titan_armor, quantity: 1 }, chance: 0.02 }] },
    dragon: { type: 'dragon', name: 'Dragao Antigo', level, hp: 200 * level, maxHp: 200 * level, attack: 35 * level, defense: 15, speed: 1.5, xpReward: 200 * level, goldReward: 200 * level, aggroRange: 200, drops: [{ item: { ...ITEMS.dragon_scale, quantity: 1 }, chance: 0.8 }, { item: { ...ITEMS.titan_sword, quantity: 1 }, chance: 0.05 }, { item: { ...ITEMS.titan_armor, quantity: 1 }, chance: 0.05 }] },
    troll: { type: 'troll', name: 'Troll da Floresta', level, hp: 120 * level, maxHp: 120 * level, attack: 22 * level, defense: 10, speed: 1.6, xpReward: 80 * level, goldReward: 50 * level, aggroRange: 140, drops: [{ item: { ...ITEMS.great_potion, quantity: 1 }, chance: 0.35 }, { item: { ...ITEMS.plate_armor, quantity: 1 }, chance: 0.04 }] },
    witch: { type: 'witch', name: 'Bruxa Sombria', level, hp: 55 * level, maxHp: 55 * level, attack: 15 * level, defense: 5, speed: 2.0, xpReward: 40 * level, goldReward: 25 * level, aggroRange: 180, drops: [{ item: { ...ITEMS.arcane_staff, quantity: 1 }, chance: 0.06 }, { item: { ...ITEMS.mana_potion, quantity: 1 }, chance: 0.4 }, { item: { ...ITEMS.magic_ring, quantity: 1 }, chance: 0.05 }] },
    knight_enemy: { type: 'knight_enemy', name: 'Cavaleiro das Trevas', level, hp: 70 * level, maxHp: 70 * level, attack: 16 * level, defense: 12, speed: 2.0, xpReward: 60 * level, goldReward: 40 * level, aggroRange: 150, drops: [{ item: { ...ITEMS.knight_blade, quantity: 1 }, chance: 0.05 }, { item: { ...ITEMS.plate_armor, quantity: 1 }, chance: 0.05 }, { item: { ...ITEMS.potion, quantity: 1 }, chance: 0.4 }] },
    archer_enemy: { type: 'archer_enemy', name: 'Arqueiro Sombrio', level, hp: 40 * level, maxHp: 40 * level, attack: 14 * level, defense: 6, speed: 3.0, xpReward: 45 * level, goldReward: 30 * level, aggroRange: 200, drops: [{ item: { ...ITEMS.elven_bow, quantity: 1 }, chance: 0.04 }, { item: { ...ITEMS.leather_armor, quantity: 1 }, chance: 0.1 }] },
    mage_enemy: { type: 'mage_enemy', name: 'Mago das Sombras', level, hp: 35 * level, maxHp: 35 * level, attack: 12 * level, defense: 4, speed: 2.5, xpReward: 55 * level, goldReward: 35 * level, aggroRange: 190, drops: [{ item: { ...ITEMS.arcane_staff, quantity: 1 }, chance: 0.05 }, { item: { ...ITEMS.mana_potion, quantity: 1 }, chance: 0.5 }, { item: { ...ITEMS.magic_ring, quantity: 1 }, chance: 0.04 }] },
  }

  const template = templates[type]
  const mult = ELITE_MULT[elite]
  // Dificuldade aumentada: HP +35%, ataque +30%, e escalonamento mais agressivo
  const DIFF_HP = 1.35
  const DIFF_ATK = 1.3
  const isRanged = RANGED_TYPES.includes(type)

  const maxHp = Math.round(template.maxHp * DIFF_HP * mult.hp)
  const attack = Math.round(template.attack * DIFF_ATK * mult.atk)
  // Escala extra de defesa com o nivel para tornar lutas mais longas
  const defense = template.defense + Math.floor(level * 0.8)
  const eliteScale = elite === 'normal' ? 1 : elite === 'elite' ? 1.15 : elite === 'champion' ? 1.3 : 1.6

  return {
    ...template,
    name: `${ELITE_PREFIX[elite]}${template.name}`,
    maxHp,
    hp: maxHp,
    attack,
    defense,
    xpReward: Math.round(template.xpReward * mult.xp),
    goldReward: Math.round(template.goldReward * mult.gold),
    aggroRange: Math.round(template.aggroRange * (isRanged ? 1.3 : 1.1)),
    speed: template.speed * (elite === 'boss' ? 0.9 : 1),
    attackRange: isRanged ? 220 : 42 + Math.round(eliteScale * 4),
    isRanged,
    elite,
    id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    position: { x, y },
    targetPosition: { x, y },
    direction: 'down',
    isMoving: false,
    isAttacking: false,
    attackCooldown: 0,
    isAggrod: false,
    animFrame: Math.random() * 60,
    animTimer: 0,
    isDead: false,
    deathTimer: 0,
  }
}

// Sorteia um tier de elite com base na chance (monstros mais raros = mais fortes)
export function rollEliteTier(bossChance = 0): EliteTier {
  const r = Math.random()
  if (bossChance > 0 && r < bossChance) return 'boss'
  if (r < 0.04) return 'champion'
  if (r < 0.16) return 'elite'
  return 'normal'
}

// ─── Map Generation ─────────────────────────────────────────────────────────

const NON_WALKABLE: TileType[] = [
  'water', 'deepwater', 'wall', 'dungeon_wall', 'dungeon_brick', 'lava', 'tree', 'rock',
  'house_wall', 'house_roof', 'fountain', 'lamp_post', 'market_stall', 'fence',
  'ice', 'frozen_tree', 'ice_rock', 'volcanic_rock', 'obsidian', 'volcanic_vent',
]

function makeTile(type: TileType): Tile {
  const walkable = !NON_WALKABLE.includes(type)
  return { type, walkable, transparent: true }
}

export function generateMap(id: string): GameMap {
  switch (id) {
    case 'city': return generateCityMap()
    case 'forest': return generateForestMap()
    case 'dungeon': return generateDungeonMap()
    case 'desert': return generateDesertMap()
    case 'swamp': return generateSwampMap()
    case 'tundra': return generateTundraMap()
    case 'volcano': return generateVolcanoMap()
    default: return generateCityMap()
  }
}

// ─── City Map (bioma inicial seguro) ────────────────────────────────────────

function generateCityMap(): GameMap {
  const W = 50, H = 50
  const tiles: Tile[][] = []

  // Base de grama com jardins fixos
  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      // Padrão fixo de jardins
      const isGarden = (x + y) % 8 === 0 || (x * 2 + y) % 12 === 3
      tiles[y][x] = makeTile(isGarden ? 'garden' : 'grass')
    }
  }

  // Muralha externa da cidade
  for (let x = 0; x < W; x++) {
    tiles[0][x] = makeTile('wall')
    tiles[H - 1][x] = makeTile('wall')
  }
  for (let y = 0; y < H; y++) {
    tiles[y][0] = makeTile('wall')
    tiles[y][W - 1] = makeTile('wall')
  }

  // Avenidas de paralelepipedo em grade
  for (let x = 1; x < W - 1; x++) {
    for (const ry of [12, 25, 38]) {
      tiles[ry][x] = makeTile('cobblestone')
      tiles[ry + 1][x] = makeTile('cobblestone')
    }
  }
  for (let y = 1; y < H - 1; y++) {
    for (const rx of [12, 25, 38]) {
      tiles[y][rx] = makeTile('cobblestone')
      tiles[y][rx + 1] = makeTile('cobblestone')
    }
  }

  // Praca central com fonte
  const cx = 25, cy = 25
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      tiles[cy + dy][cx + dx] = makeTile('cobblestone')
    }
  }
  tiles[cy][cx] = makeTile('fountain')
  tiles[cy - 4][cx - 4] = makeTile('lamp_post')
  tiles[cy - 4][cx + 4] = makeTile('lamp_post')
  tiles[cy + 4][cx - 4] = makeTile('lamp_post')
  tiles[cy + 4][cx + 4] = makeTile('lamp_post')

  // Casas (blocos de telhado/parede com porta)
  const placeHouse = (hx: number, hy: number, w: number, h: number) => {
    for (let y = hy; y < hy + h; y++) {
      for (let x = hx; x < hx + w; x++) {
        if (x <= 0 || y <= 0 || x >= W - 1 || y >= H - 1) continue
        if (y === hy + h - 1) tiles[y][x] = makeTile('house_wall')
        else tiles[y][x] = makeTile('house_roof')
      }
    }
    // porta no centro inferior
    const doorX = hx + Math.floor(w / 2)
    if (doorX > 0 && doorX < W - 1 && hy + h - 1 < H - 1) {
      tiles[hy + h - 1][doorX] = makeTile('house_door')
    }
  }
  placeHouse(4, 4, 5, 4)
  placeHouse(16, 4, 6, 4)
  placeHouse(30, 5, 5, 4)
  placeHouse(41, 4, 4, 4)
  placeHouse(4, 17, 5, 4)
  placeHouse(41, 17, 5, 4)
  placeHouse(4, 30, 6, 4)
  placeHouse(17, 31, 5, 4)
  placeHouse(30, 30, 6, 4)
  placeHouse(41, 31, 4, 4)
  placeHouse(16, 41, 5, 4)
  placeHouse(30, 42, 5, 4)

  // Barracas de mercado perto da praca
  tiles[22][22] = makeTile('market_stall')
  tiles[22][28] = makeTile('market_stall')
  tiles[28][22] = makeTile('market_stall')
  tiles[28][28] = makeTile('market_stall')

  // Postes de luz pela cidade
  for (const [lx, ly] of [[12, 6], [38, 6], [6, 25], [44, 25], [12, 44], [38, 44]]) {
    if (tiles[ly]?.[lx]?.walkable) tiles[ly][lx] = makeTile('lamp_post')
  }

  // Portal para sair da cidade (vai para a floresta)
  tiles[cy][cx + 6] = makeTile('portal')

  // Monstros fixos em posições específicas
  const monsters: Monster[] = [
    createMonster('slime', 1, 8 * 32, 8 * 32, 'normal'),
    createMonster('slime', 1, 42 * 32, 8 * 32, 'normal'),
    createMonster('goblin', 1, 8 * 32, 42 * 32, 'normal'),
    createMonster('goblin', 1, 42 * 32, 42 * 32, 'normal'),
    createMonster('wolf', 2, 20 * 32, 6 * 32, 'normal'),
    createMonster('wolf', 2, 30 * 32, 44 * 32, 'normal'),
  ]

  return {
    id: 'city', name: 'Cidade de Valor',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: cx * 32, y: (cy + 8) * 32 }, { x: (cx + 3) * 32, y: cy * 32 }],
    ambience: 'city', musicTheme: 'city',
    minLevel: 1,
  }
}

function generateForestMap(): GameMap {
  const W = 64, H = 64
  const tiles: Tile[][] = []

  // Padrão fixo de floresta
  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      // Padrão determinístico usando função seno
      const v = (Math.sin(x * 0.1) + Math.cos(y * 0.1) + 2) / 4

      let type: TileType = 'grass'
      if (v < 0.2) type = 'water'
      else if (v < 0.3) type = 'sand'
      else if (v < 0.4) type = 'dirt'
      else if (v > 0.8) type = 'tree'
      else if (v > 0.7) {
        type = (x + y) % 3 === 0 ? 'rock' : ((x + y) % 5 === 0 ? 'tall_grass' : 'grass')
      } else if (v > 0.6) {
        type = (x * y) % 7 === 0 ? 'flower' : 'grass'
      } else {
        type = (x + y) % 10 === 0 ? 'tall_grass' : 'grass'
      }

      tiles[y][x] = makeTile(type)
    }
  }

  // Estrada pelo centro
  for (let x = 0; x < W; x++) {
    if (tiles[H/2][x].walkable) tiles[H/2][x] = makeTile('road')
    if (tiles[H/2+1][x].walkable) tiles[H/2+1][x] = makeTile('road')
  }
  for (let y = 0; y < H; y++) {
    if (tiles[y][W/2].walkable) tiles[y][W/2] = makeTile('road')
  }

  // Portal em posição fixa
  tiles[12][12] = makeTile('portal')

  // Monstros em posições fixas
  const monsters: Monster[] = [
    // Slimes (nível 2-3)
    createMonster('slime', 2, 8 * 32, 8 * 32, 'normal'),
    createMonster('slime', 2, 20 * 32, 6 * 32, 'normal'),
    createMonster('slime', 3, 40 * 32, 10 * 32, 'normal'),
    createMonster('slime', 2, 15 * 32, 25 * 32, 'normal'),
    createMonster('slime', 3, 50 * 32, 30 * 32, 'normal'),
    // Wolves (nível 3-4)
    createMonster('wolf', 3, 10 * 32, 15 * 32, 'normal'),
    createMonster('wolf', 4, 25 * 32, 20 * 32, 'normal'),
    createMonster('wolf', 3, 45 * 32, 18 * 32, 'normal'),
    createMonster('wolf', 4, 35 * 32, 40 * 32, 'normal'),
    // Goblins (nível 2-4)
    createMonster('goblin', 2, 18 * 32, 12 * 32, 'normal'),
    createMonster('goblin', 3, 30 * 32, 8 * 32, 'normal'),
    createMonster('goblin', 4, 42 * 32, 25 * 32, 'normal'),
    createMonster('goblin', 3, 12 * 32, 35 * 32, 'normal'),
    createMonster('goblin', 4, 55 * 32, 45 * 32, 'normal'),
    // Skeletons (nível 3-5)
    createMonster('skeleton', 3, 22 * 32, 30 * 32, 'normal'),
    createMonster('skeleton', 4, 38 * 32, 28 * 32, 'normal'),
    createMonster('skeleton', 5, 28 * 32, 45 * 32, 'normal'),
    createMonster('skeleton', 4, 48 * 32, 38 * 32, 'normal'),
    // Spiders (nível 3-4)
    createMonster('spider', 3, 16 * 32, 20 * 32, 'normal'),
    createMonster('spider', 4, 32 * 32, 15 * 32, 'normal'),
    createMonster('spider', 3, 44 * 32, 35 * 32, 'normal'),
    // Trolls (nível 5)
    createMonster('troll', 5, 52 * 32, 20 * 32, 'elite'),
    createMonster('troll', 5, 8 * 32, 50 * 32, 'elite'),
  ]
  // Chefe troll
  monsters.push(createMonster('troll', 6, (W - 8) * 32, (H - 8) * 32, 'boss'))

  return {
    id: 'forest', name: 'Floresta das Sombras',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: 32 * 5, y: 32 * 5 }, { x: 32 * 10, y: 32 * 10 }],
    ambience: 'forest', musicTheme: 'forest',
  }
}

function generateDungeonMap(): GameMap {
  const W = 48, H = 48
  const tiles: Tile[][] = []

  // Fill with walls
  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      tiles[y][x] = makeTile('dungeon_wall')
    }
  }

  // Salas fixas predefinidas
  const rooms = [
    { x: 2, y: 2, w: 8, h: 6 },    // Sala inicial
    { x: 14, y: 2, w: 6, h: 5 },   // Sala 2
    { x: 26, y: 3, w: 7, h: 6 },   // Sala 3
    { x: 38, y: 2, w: 6, h: 7 },   // Sala 4
    { x: 3, y: 14, w: 7, h: 5 },   // Sala 5
    { x: 15, y: 12, w: 8, h: 7 },  // Sala central
    { x: 30, y: 14, w: 6, h: 6 },   // Sala 7
    { x: 39, y: 13, w: 5, h: 6 },   // Sala 8
    { x: 4, y: 24, w: 6, h: 6 },   // Sala 9
    { x: 16, y: 25, w: 7, h: 5 },   // Sala 10
    { x: 28, y: 24, w: 8, h: 7 },   // Sala 11
    { x: 40, y: 26, w: 5, h: 5 },   // Sala 12
    { x: 6, y: 36, w: 7, h: 6 },    // Sala 13
    { x: 20, y: 35, w: 6, h: 7 },   // Sala 14
    { x: 32, y: 37, w: 8, h: 5 },   // Sala final (boss)
  ]

  // Carregar as salas
  for (const room of rooms) {
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        if (x >= 0 && x < W && y >= 0 && y < H) {
          tiles[y][x] = makeTile('dungeon_floor')
        }
      }
    }
  }

  // Corredores fixos conectando as salas
  const corridors = [
    // Sala 1 -> Sala 2
    { x1: 6, y1: 8, x2: 17, y2: 4 },
    // Sala 2 -> Sala 3
    { x1: 17, y1: 4, x2: 29, y2: 6 },
    // Sala 3 -> Sala 4
    { x1: 29, y1: 6, x2: 41, y2: 5 },
    // Sala 1 -> Sala 5
    { x1: 6, y1: 8, x2: 6, y2: 16 },
    // Sala 5 -> Sala central
    { x1: 6, y1: 16, x2: 19, y2: 15 },
    // Sala central -> Sala 7
    { x1: 19, y1: 15, x2: 33, y2: 17 },
    // Sala 7 -> Sala 8
    { x1: 33, y1: 17, x2: 41, y2: 16 },
    // Sala 5 -> Sala 9
    { x1: 6, y1: 16, x2: 7, y2: 27 },
    // Sala 9 -> Sala 10
    { x1: 7, y1: 27, x2: 19, y2: 27 },
    // Sala central -> Sala 10
    { x1: 19, y1: 15, x2: 19, y2: 27 },
    // Sala 10 -> Sala 11
    { x1: 19, y1: 27, x2: 32, y2: 27 },
    // Sala 11 -> Sala 12
    { x1: 32, y1: 27, x2: 42, y2: 28 },
    // Sala 9 -> Sala 13
    { x1: 7, y1: 27, x2: 9, y2: 39 },
    // Sala 13 -> Sala 14
    { x1: 9, y1: 39, x2: 23, y2: 38 },
    // Sala 14 -> Sala final
    { x1: 23, y1: 38, x2: 36, y2: 39 },
  ]

  // Desenhar corredores
  for (const cor of corridors) {
    // Corredor horizontal
    for (let x = Math.min(cor.x1, cor.x2); x <= Math.max(cor.x1, cor.x2); x++) {
      if (x >= 0 && x < W && cor.y1 >= 0 && cor.y1 < H) {
        tiles[cor.y1][x] = makeTile('dungeon_floor')
      }
    }
    // Corredor vertical
    for (let y = Math.min(cor.y1, cor.y2); y <= Math.max(cor.y1, cor.y2); y++) {
      if (y >= 0 && y < H && cor.x2 >= 0 && cor.x2 < W) {
        tiles[y][cor.x2] = makeTile('dungeon_floor')
      }
    }
  }

  // Portal na última sala
  const lastRoom = rooms[rooms.length - 1]
  tiles[Math.floor(lastRoom.y + lastRoom.h/2)][Math.floor(lastRoom.x + lastRoom.w/2)] = makeTile('portal')

  // Monstros fixos em posições estratégicas
  const monsters: Monster[] = [
    // Sala 2
    createMonster('skeleton', 5, 17 * 32, 4 * 32, 'normal'),
    createMonster('skeleton', 6, 16 * 32, 5 * 32, 'normal'),
    // Sala 3
    createMonster('zombie', 5, 29 * 32, 6 * 32, 'normal'),
    createMonster('zombie', 6, 30 * 32, 5 * 32, 'normal'),
    // Sala 4
    createMonster('orc', 7, 41 * 32, 5 * 32, 'elite'),
    // Sala 5
    createMonster('skeleton', 5, 7 * 32, 16 * 32, 'normal'),
    createMonster('skeleton', 6, 6 * 32, 17 * 32, 'normal'),
    // Sala central
    createMonster('knight_enemy', 7, 19 * 32, 15 * 32, 'elite'),
    createMonster('mage_enemy', 6, 20 * 32, 16 * 32, 'normal'),
    createMonster('witch', 7, 18 * 32, 17 * 32, 'normal'),
    // Sala 7
    createMonster('zombie', 6, 33 * 32, 17 * 32, 'normal'),
    createMonster('orc', 7, 34 * 32, 16 * 32, 'normal'),
    // Sala 8
    createMonster('demon', 8, 42 * 32, 16 * 32, 'elite'),
    // Sala 9
    createMonster('skeleton', 5, 7 * 32, 27 * 32, 'normal'),
    createMonster('zombie', 6, 8 * 32, 28 * 32, 'normal'),
    // Sala 10
    createMonster('knight_enemy', 7, 19 * 32, 27 * 32, 'elite'),
    createMonster('skeleton', 6, 20 * 32, 28 * 32, 'normal'),
    // Sala 11
    createMonster('orc', 7, 32 * 32, 27 * 32, 'normal'),
    createMonster('demon', 8, 33 * 32, 28 * 32, 'elite'),
    createMonster('witch', 7, 34 * 32, 26 * 32, 'normal'),
    // Sala 12
    createMonster('mage_enemy', 8, 42 * 32, 28 * 32, 'elite'),
    // Sala 13
    createMonster('zombie', 6, 9 * 32, 39 * 32, 'normal'),
    createMonster('skeleton', 7, 10 * 32, 40 * 32, 'normal'),
    // Sala 14
    createMonster('orc', 8, 23 * 32, 38 * 32, 'elite'),
    createMonster('demon', 8, 24 * 32, 39 * 32, 'normal'),
    createMonster('knight_enemy', 9, 25 * 32, 37 * 32, 'elite'),
  ]
  // Chefe demônio na última sala
  monsters.push(createMonster('demon', 10, Math.floor(lastRoom.x + lastRoom.w / 2) * 32, Math.floor(lastRoom.y + lastRoom.h / 2) * 32, 'boss'))

  return {
    id: 'dungeon', name: 'Masmorra das Trevas',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: rooms[0].x * 32 + 32, y: rooms[0].y * 32 + 32 }],
    ambience: 'dungeon', musicTheme: 'dungeon',
    minLevel: 5,
  }
}

function generateDesertMap(): GameMap {
  const W = 60, H = 60
  const tiles: Tile[][] = []

  // Padrão fixo de deserto
  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      // Padrão determinístico
      const v = (Math.sin(x * 0.08) * Math.cos(y * 0.08) + 1) / 2
      let type: TileType = 'sand'
      if (v < 0.15) type = 'lava'
      else if (v < 0.2) type = 'stone'
      else if (v > 0.75) type = 'rock'
      tiles[y][x] = makeTile(type)
    }
  }

  // Oasis fixo no centro
  const ox = Math.floor(W / 2), oy2 = Math.floor(H / 2)
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      if (dx*dx+dy*dy <= 9) tiles[oy2+dy][ox+dx] = makeTile('water')
      else if (dx*dx+dy*dy <= 16) tiles[oy2+dy][ox+dx] = makeTile('grass')
    }
  }
  tiles[oy2][ox+4] = makeTile('portal')

  // Monstros em posições fixas
  const monsters: Monster[] = [
    // Goblins (nível 8-9)
    createMonster('goblin', 8, 10 * 32, 10 * 32, 'normal'),
    createMonster('goblin', 9, 15 * 32, 8 * 32, 'normal'),
    createMonster('goblin', 8, 45 * 32, 12 * 32, 'normal'),
    createMonster('goblin', 9, 50 * 32, 15 * 32, 'normal'),
    // Orcs (nível 9-11)
    createMonster('orc', 9, 8 * 32, 25 * 32, 'normal'),
    createMonster('orc', 10, 20 * 32, 22 * 32, 'elite'),
    createMonster('orc', 11, 40 * 32, 25 * 32, 'normal'),
    createMonster('orc', 10, 52 * 32, 28 * 32, 'elite'),
    // Demons (nível 10-12)
    createMonster('demon', 10, 12 * 32, 40 * 32, 'elite'),
    createMonster('demon', 11, 25 * 32, 45 * 32, 'normal'),
    createMonster('demon', 12, 35 * 32, 42 * 32, 'elite'),
    createMonster('demon', 11, 48 * 32, 50 * 32, 'normal'),
    // Trolls (nível 11-12)
    createMonster('troll', 11, 18 * 32, 35 * 32, 'elite'),
    createMonster('troll', 12, 42 * 32, 38 * 32, 'elite'),
  ]

  return {
    id: 'desert', name: 'Deserto das Chamas',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: ox * 32, y: oy2 * 32 }],
    ambience: 'desert', musicTheme: 'desert',
    minLevel: 8,
  }
}

function generateSwampMap(): GameMap {
  const W = 56, H = 56
  const tiles: Tile[][] = []

  // Padrão fixo de pântano
  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      // Padrão determinístico
      const v = (Math.sin(x * 0.1 + y * 0.05) * Math.cos(x * 0.05 + y * 0.1) + 1) / 2
      let type: TileType = 'grass'
      if (v < 0.35) type = 'water'
      else if (v < 0.42) type = 'dirt'
      else if (v > 0.7) type = 'tree'
      else if (v > 0.6) type = 'tall_grass'
      else if ((x + y) % 12 === 0) type = 'flower'
      tiles[y][x] = makeTile(type)
    }
  }

  tiles[8][8] = makeTile('portal')

  // Monstros em posições fixas
  const monsters: Monster[] = [
    // Zombies (nível 12-14)
    createMonster('zombie', 12, 12 * 32, 15 * 32, 'normal'),
    createMonster('zombie', 13, 20 * 32, 10 * 32, 'normal'),
    createMonster('zombie', 14, 35 * 32, 18 * 32, 'elite'),
    createMonster('zombie', 13, 45 * 32, 25 * 32, 'normal'),
    createMonster('zombie', 14, 15 * 32, 35 * 32, 'elite'),
    // Spiders (nível 13-15)
    createMonster('spider', 13, 25 * 32, 12 * 32, 'normal'),
    createMonster('spider', 14, 40 * 32, 10 * 32, 'normal'),
    createMonster('spider', 15, 30 * 32, 25 * 32, 'elite'),
    createMonster('spider', 14, 48 * 32, 35 * 32, 'normal'),
    // Witches (nível 14-16)
    createMonster('witch', 14, 18 * 32, 28 * 32, 'elite'),
    createMonster('witch', 15, 38 * 32, 30 * 32, 'normal'),
    createMonster('witch', 16, 42 * 32, 45 * 32, 'elite'),
    // Demons (nível 15-17)
    createMonster('demon', 15, 22 * 32, 40 * 32, 'elite'),
    createMonster('demon', 16, 35 * 32, 42 * 32, 'elite'),
    // Dragons menores (nível 16-17)
    createMonster('dragon', 16, 28 * 32, 15 * 32, 'elite'),
    createMonster('dragon', 17, 45 * 32, 20 * 32, 'elite'),
  ]
  // Dragão chefe no centro
  monsters.push(createMonster('dragon', 18, (W / 2) * 32, (H / 2) * 32, 'boss'))

  return {
    id: 'swamp', name: 'Pantano Amaldicoado',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: 32 * 4, y: 32 * 4 }],
    ambience: 'swamp', musicTheme: 'swamp',
    minLevel: 15,
  }
}

function generateTundraMap(): GameMap {
  const W = 58, H = 58
  const tiles: Tile[][] = []

  // Padrão fixo de tundra
  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      // Padrão determinístico
      const v = (Math.sin(x * 0.12) * Math.cos(y * 0.08) + 1) / 2
      let type: TileType = 'snow'
      if (v < 0.15) type = 'ice'
      else if (v < 0.22) type = 'snow'
      else if (v > 0.8) type = 'frozen_tree'
      else if (v > 0.72) type = 'ice_rock'
      else if (v > 0.65) type = 'snow_rock'
      tiles[y][x] = makeTile(type)
    }
  }

  // Cabana aquecida no centro (refugio)
  const cx = Math.floor(W / 2), cy = Math.floor(H / 2)
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) === 2 || Math.abs(dy) === 2) {
        tiles[cy+dy][cx+dx] = makeTile('wall')
      } else {
        tiles[cy+dy][cx+dx] = makeTile('floor')
      }
    }
  }
  tiles[cy+2][cx] = makeTile('floor')
  tiles[cy][cx+3] = makeTile('portal')

  // Monstros em posições fixas
  const monsters: Monster[] = [
    // Wolves (nível 10-12)
    createMonster('wolf', 10, 8 * 32, 10 * 32, 'normal'),
    createMonster('wolf', 11, 15 * 32, 8 * 32, 'normal'),
    createMonster('wolf', 12, 45 * 32, 12 * 32, 'elite'),
    createMonster('wolf', 11, 50 * 32, 20 * 32, 'normal'),
    createMonster('wolf', 12, 12 * 32, 35 * 32, 'elite'),
    // Skeletons (nível 11-13)
    createMonster('skeleton', 11, 20 * 32, 15 * 32, 'normal'),
    createMonster('skeleton', 12, 35 * 32, 18 * 32, 'normal'),
    createMonster('skeleton', 13, 40 * 32, 35 * 32, 'elite'),
    createMonster('skeleton', 12, 48 * 32, 45 * 32, 'normal'),
    // Trolls (nível 13-15)
    createMonster('troll', 13, 18 * 32, 28 * 32, 'elite'),
    createMonster('troll', 14, 38 * 32, 30 * 32, 'elite'),
    createMonster('troll', 15, 25 * 32, 45 * 32, 'elite'),
    // Demons (nível 14-16)
    createMonster('demon', 14, 30 * 32, 25 * 32, 'elite'),
    createMonster('demon', 15, 42 * 32, 40 * 32, 'elite'),
    createMonster('demon', 16, 15 * 32, 48 * 32, 'elite'),
  ]
  // Troll gigante como chefe
  monsters.push(createMonster('troll', 20, cx * 32 + 96, cy * 32 + 64, 'boss'))

  return {
    id: 'tundra', name: 'Tundra Congelada',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: 32 * 5, y: 32 * 5 }],
    ambience: 'tundra', musicTheme: 'tundra',
    minLevel: 12,
  }
}

function generateVolcanoMap(): GameMap {
  const W = 62, H = 62
  const tiles: Tile[][] = []

  // Padrão fixo de vulcão
  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      // Padrão determinístico
      const v = (Math.sin(x * 0.15) * Math.cos(y * 0.09) + 1) / 2
      let type: TileType = 'ash'
      if (v < 0.18) type = 'lava'
      else if (v < 0.25) type = 'magma_crust'
      else if (v > 0.85) type = 'volcanic_rock'
      else if (v > 0.78) type = 'obsidian'
      else if (v > 0.7) type = 'volcanic_vent'
      tiles[y][x] = makeTile(type)
    }
  }

  // Plataforma central com portal
  const cx = Math.floor(W / 2), cy = Math.floor(H / 2)
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      if (dx*dx+dy*dy <= 16) {
        tiles[cy+dy][cx+dx] = makeTile('volcanic_rock')
      }
    }
  }
  tiles[cy][cx] = makeTile('portal')

  // Monstros em posições fixas
  const monsters: Monster[] = [
    // Demons (nível 14-17)
    createMonster('demon', 14, 10 * 32, 12 * 32, 'normal'),
    createMonster('demon', 15, 20 * 32, 10 * 32, 'elite'),
    createMonster('demon', 16, 40 * 32, 15 * 32, 'normal'),
    createMonster('demon', 17, 52 * 32, 18 * 32, 'elite'),
    createMonster('demon', 16, 15 * 32, 35 * 32, 'normal'),
    createMonster('demon', 17, 45 * 32, 40 * 32, 'elite'),
    // Dragons (nível 16-19)
    createMonster('dragon', 16, 25 * 32, 20 * 32, 'elite'),
    createMonster('dragon', 17, 38 * 32, 25 * 32, 'elite'),
    createMonster('dragon', 18, 30 * 32, 42 * 32, 'elite'),
    createMonster('dragon', 19, 48 * 32, 50 * 32, 'elite'),
    // Trolls (nível 15-18)
    createMonster('troll', 15, 18 * 32, 30 * 32, 'elite'),
    createMonster('troll', 16, 42 * 32, 35 * 32, 'elite'),
    createMonster('troll', 17, 22 * 32, 48 * 32, 'elite'),
    createMonster('troll', 18, 50 * 32, 45 * 32, 'elite'),
    // Witches (nível 16-18)
    createMonster('witch', 16, 28 * 32, 15 * 32, 'elite'),
    createMonster('witch', 17, 35 * 32, 45 * 32, 'elite'),
    createMonster('witch', 18, 44 * 32, 28 * 32, 'elite'),
  ]
  // Dragão ancestral como chefe final
  monsters.push(createMonster('dragon', 25, (cx - 6) * 32, (cy - 6) * 32, 'boss'))

  return {
    id: 'volcano', name: 'Vulcão Infernal',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: 32 * 4, y: 32 * 4 }],
    ambience: 'volcano', musicTheme: 'volcano',
    minLevel: 18,
  }
}

// ─── Player Factory ─────────────────────────────────────────────────────────

export const BASE_STATS: Record<CharacterClass, CharacterStats> = {
  // range agora representa o alcance maximo de ataque em pixels (1 tile = 32px)
  knight:      { maxHp: 130, maxMp: 50, attack: 13, defense: 11, speed: 3.2, critChance: 5, critDamage: 150, magicPower: 2, range: 48 },
  archer:      { maxHp: 85, maxMp: 70, attack: 11, defense: 5, speed: 4.5, critChance: 15, critDamage: 175, magicPower: 4, range: 224 },
  mage:        { maxHp: 65, maxMp: 130, attack: 6, defense: 3, speed: 3.5, critChance: 10, critDamage: 200, magicPower: 22, range: 256 },
  necromancer: { maxHp: 90, maxMp: 110, attack: 8, defense: 6, speed: 3.6, critChance: 8, critDamage: 180, magicPower: 18, range: 192 },
}

export const START_WEAPONS: Record<CharacterClass, string> = {
  knight: 'wooden_sword',
  archer: 'wooden_bow',
  mage: 'wooden_staff',
  necromancer: 'bone_scythe',
}

const PRIMARY_SKILL: Record<CharacterClass, { name: string; icon: string }> = {
  knight: { name: 'Melee', icon: 'M' },
  archer: { name: 'Distancia', icon: 'D' },
  mage: { name: 'Magia', icon: 'G' },
  necromancer: { name: 'Necromancia', icon: 'N' },
}

function makeClassProgress(cls: CharacterClass): import('./types').ClassProgress {
  return {
    level: 1,
    xp: 0,
    xpToNext: 100,
    skills: [
      { name: PRIMARY_SKILL[cls].name, level: 1, xp: 0, xpToNext: 50, icon: PRIMARY_SKILL[cls].icon },
      { name: 'Defesa', level: 1, xp: 0, xpToNext: 50, icon: 'S' },
      { name: 'Vitalidade', level: 1, xp: 0, xpToNext: 50, icon: 'V' },
    ],
    abilities: buildAbilityStates(cls),
    equipment: {
      weapon: { ...ITEMS[START_WEAPONS[cls]] },
      armor: null, helmet: null, boots: null, ring: null,
    },
  }
}

export function createPlayer(name: string, cls: CharacterClass): Player {
  const stats = { ...BASE_STATS[cls] }
  const inventory = Array(30).fill(null) as (Item | null)[]
  inventory[0] = { ...ITEMS.small_potion, quantity: 5 }
  inventory[1] = { ...ITEMS.mana_potion, quantity: 3 }
  inventory[2] = { ...ITEMS[START_WEAPONS[cls]] }

  const classProgress: Record<CharacterClass, import('./types').ClassProgress> = {
    knight: makeClassProgress('knight'),
    archer: makeClassProgress('archer'),
    mage: makeClassProgress('mage'),
    necromancer: makeClassProgress('necromancer'),
  }

  const clsProgress = classProgress[cls]

  return {
    name,
    class: cls,
    level: clsProgress.level,
    xp: clsProgress.xp,
    xpToNext: clsProgress.xpToNext,
    hp: stats.maxHp,
    mp: stats.maxMp,
    stats: { ...stats },
    baseStats: { ...stats },
    gold: 50,
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    isAttacking: false,
    attackCooldown: 0,
    inventory,
    equipment: { ...clsProgress.equipment },
    skills: [...clsProgress.skills],
    abilities: [...clsProgress.abilities],
    classProgress,
    buffs: [],
  }
}

export function calculateXpToNext(level: number): number {
  return Math.floor(100 * Math.pow(1.4, level - 1))
}

export function recalcStats(player: Player): CharacterStats {
  const base = { ...player.baseStats }
  const eq = player.equipment

  const allEquipped = [eq.weapon, eq.armor, eq.helmet, eq.boots, eq.ring].filter(Boolean) as Item[]
  for (const item of allEquipped) {
    for (const [key, val] of Object.entries(item.stats)) {
      if (val !== undefined) {
        (base as Record<string, number>)[key] = ((base as Record<string, number>)[key] || 0) + (val as number)
      }
    }
  }

  // Level scaling (um pouco mais forte para acompanhar a dificuldade)
  const lvlBonus = (player.level - 1) * 0.12
  base.maxHp = Math.round(base.maxHp * (1 + lvlBonus))
  base.maxMp = Math.round(base.maxMp * (1 + lvlBonus))
  base.attack = Math.round(base.attack * (1 + lvlBonus))
  base.defense = Math.round(base.defense * (1 + lvlBonus))
  base.magicPower = Math.round(base.magicPower * (1 + lvlBonus))

  // Buffs temporarios
  if (player.buffs && player.buffs.length > 0) {
    for (const buff of player.buffs) {
      (base as Record<string, number>)[buff.stat] = ((base as Record<string, number>)[buff.stat] || 0) + buff.amount
    }
  }

  return base
}
