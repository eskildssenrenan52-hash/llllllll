export type CharacterClass = 'knight' | 'archer' | 'mage' | 'necromancer'

export type Direction = 'up' | 'down' | 'left' | 'right'

export type TileType =
  | 'grass' | 'dirt' | 'stone' | 'water' | 'deepwater'
  | 'sand' | 'snow' | 'lava' | 'wall' | 'floor'
  | 'tree' | 'rock' | 'chest' | 'portal'
  | 'dungeon_floor' | 'dungeon_wall' | 'dungeon_brick'
  | 'road' | 'bridge' | 'tall_grass' | 'flower'
  // City biome tiles
  | 'cobblestone' | 'house_wall' | 'house_roof' | 'house_door'
  | 'fountain' | 'lamp_post' | 'market_stall' | 'fence' | 'garden'
  // Tundra biome tiles
  | 'ice' | 'frozen_tree' | 'ice_rock' | 'snow_rock'
  // Volcano biome tiles
  | 'volcanic_rock' | 'ash' | 'obsidian' | 'magma_crust' | 'volcanic_vent'

export type MonsterType =
  | 'slime' | 'skeleton' | 'goblin' | 'orc' | 'wolf'
  | 'spider' | 'zombie' | 'demon' | 'dragon' | 'troll'
  | 'witch' | 'knight_enemy' | 'archer_enemy' | 'mage_enemy'

export type ItemType = 'weapon' | 'armor' | 'helmet' | 'boots' | 'ring' | 'consumable' | 'material'
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface Vec2 { x: number; y: number }

export interface Item {
  id: string
  name: string
  type: ItemType
  rarity: ItemRarity
  icon: string
  description: string
  stats: Partial<CharacterStats>
  stackable?: boolean
  quantity?: number
  level?: number
  value: number
}

export interface CharacterStats {
  maxHp: number
  maxMp: number
  attack: number
  defense: number
  speed: number
  critChance: number
  critDamage: number
  magicPower: number
  range: number
}

export interface ClassProgress {
  level: number
  xp: number
  xpToNext: number
  skills: SkillLevel[]
  abilities: AbilityState[]
  equipment: {
    weapon: Item | null
    armor: Item | null
    helmet: Item | null
    boots: Item | null
    ring: Item | null
  }
}

// ─── Abilities System ───────────────────────────────────────────────────────

export type AbilityEffectType =
  | 'melee_aoe'      // dano em area corpo-a-corpo ao redor do jogador
  | 'projectile'     // projetil unico em linha reta na direcao
  | 'multi_projectile' // varios projeteis em leque
  | 'nova'           // explosao radial a partir do jogador
  | 'target_aoe'     // dano em area no ponto/alvo mirado
  | 'dash'           // avanco causando dano no caminho
  | 'summon'         // invoca minions (necromante)
  | 'heal'           // cura o jogador
  | 'buff'           // buff temporario de status
  | 'life_drain'     // dano que cura o jogador

export interface AbilityDef {
  id: string
  name: string
  description: string
  cls: CharacterClass
  icon: string
  color: string
  manaCost: number
  cooldown: number          // em ticks (~60/s)
  unlockLevel: number       // nivel da classe necessario
  effect: AbilityEffectType
  damageMultiplier: number  // multiplica o ataque/magia base
  range: number             // alcance em pixels
  radius?: number           // raio de efeito para AoE/nova
  projectileCount?: number  // numero de projeteis
  summonCount?: number      // numero de minions invocados
  summonType?: MinionType
  duration?: number         // duracao para buffs/summons
  healPercent?: number      // % de cura
  aoeRadius?: number        // raio de explosao ao impacto (projeteis)
}

export interface AbilityState {
  id: string
  currentCooldown: number   // ticks restantes
}

export type MinionType = 'skeleton_minion' | 'zombie_minion' | 'wraith_minion'

export interface Minion {
  id: string
  type: MinionType
  ownerId: string
  level: number
  hp: number
  maxHp: number
  attack: number
  position: Vec2
  targetMonsterId: string | null
  direction: Direction
  isMoving: boolean
  isAttacking: boolean
  attackCooldown: number
  lifespan: number          // ticks restantes antes de sumir (0 = permanente ate morrer)
  animFrame: number
  range: number
}

export interface Projectile {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  damage: number
  isCrit: boolean
  radius: number
  color: string
  type: 'arrow' | 'fireball' | 'bone' | 'frost' | 'magic'
  pierce: boolean
  hitIds: string[]
  owner: 'player' | 'monster'
  aoeRadius?: number        // se > 0, explode causando dano em area ao acertar
}

export interface AreaEffect {
  id: string
  x: number
  y: number
  radius: number
  maxRadius: number
  life: number
  maxLife: number
  color: string
  damage: number
  isCrit: boolean
  hitIds: string[]
  type: 'nova' | 'explosion' | 'whirlwind' | 'frost'
}

export interface Player {
  name: string
  class: CharacterClass
  level: number
  xp: number
  xpToNext: number
  hp: number
  mp: number
  maxHp?: number
  stats: CharacterStats
  baseStats: CharacterStats
  gold: number
  position: Vec2
  direction: Direction
  isMoving: boolean
  isAttacking: boolean
  attackCooldown: number
  inventory: (Item | null)[]
  equipment: {
    weapon: Item | null
    armor: Item | null
    helmet: Item | null
    boots: Item | null
    ring: Item | null
  }
  skills: SkillLevel[]
  abilities: AbilityState[]
  // Per-class independent progress
  classProgress: Record<CharacterClass, ClassProgress>
  // buffs temporarios
  buffs: ActiveBuff[]
}

export interface ActiveBuff {
  id: string
  name: string
  timer: number
  stat: keyof CharacterStats
  amount: number
}

export interface SkillLevel {
  name: string
  level: number
  xp: number
  xpToNext: number
  icon: string
}

export interface Monster {
  id: string
  type: MonsterType
  name: string
  level: number
  hp: number
  maxHp: number
  attack: number
  defense: number
  speed: number
  xpReward: number
  goldReward: number
  position: Vec2
  targetPosition: Vec2
  direction: Direction
  isMoving: boolean
  isAttacking: boolean
  attackCooldown: number
  aggroRange: number
  isAggrod: boolean
  drops: ItemDropEntry[]
  animFrame: number
  animTimer: number
  isDead: boolean
  deathTimer: number
  // Combate avancado
  attackRange: number       // alcance de ataque do monstro
  isRanged: boolean         // ataca a distancia (atira projeteis)
  elite: EliteTier          // raridade/poder do monstro
}

export type EliteTier = 'normal' | 'elite' | 'champion' | 'boss'

export interface ItemDropEntry {
  item: Item
  chance: number
}

export interface Tile {
  type: TileType
  walkable: boolean
  transparent: boolean
  animated?: boolean
  animFrame?: number
}

export interface GameMap {
  id: string
  name: string
  width: number
  height: number
  tiles: Tile[][]
  monsters: Monster[]
  spawnPoints: Vec2[]
  ambience: string
  musicTheme: string
  minLevel?: number
}

export interface DamageNumber {
  id: string
  value: number
  x: number
  y: number
  timer: number
  type: 'physical' | 'magic' | 'heal' | 'crit'
}

export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: 'spark' | 'smoke' | 'blood' | 'magic' | 'leaf' | 'fire' | 'water'
}

export type GameScreen = 'title' | 'create' | 'playing' | 'paused' | 'inventory' | 'dead' | 'editor'

// ─── Editor Types ─────────────────────────────────────────────────────────────

export type EditorTool =
  | 'paint'       // pintar tiles
  | 'erase'       // apagar (colocar grass)
  | 'fill'        // flood fill
  | 'spawn'       // adicionar ponto de spawn
  | 'monster'     // colocar monstro
  | 'select'      // selecionar região
  | 'eyedropper'  // pegar tile do mapa
  | 'line'        // desenhar linha
  | 'rect'        // retângulo (contorno)
  | 'rect_fill'   // retângulo preenchido
  | 'circle'      // círculo preenchido

export interface EditorState {
  isOpen: boolean
  activeTool: EditorTool
  selectedTile: TileType
  selectedMonsterType: MonsterType
  selectedMonsterLevel: number
  brushSize: number
  showGrid: boolean
  showCollisions: boolean
  showMonsters: boolean
  showSpawns: boolean
  mapName: string
  history: Tile[][][]  // undo history (snapshots of tiles)
  historyIndex: number
  selectionStart: Vec2 | null
  selectionEnd: Vec2 | null
}

export interface GameState {
  screen: GameScreen
  player: Player | null
  currentMap: GameMap | null
  camera: Vec2
  tick: number
  damageNumbers: DamageNumber[]
  particles: Particle[]
  minions: Minion[]
  projectiles: Projectile[]
  areaEffects: AreaEffect[]
  chatMessages: ChatMessage[]
  notifications: GameNotification[]
  selectedItem: Item | null
  hoveredMonster: Monster | null
  mousePos: Vec2
  isPaused: boolean
  editorOpen: boolean
  editorState: EditorState
}

export interface ChatMessage {
  id: string
  text: string
  type: 'system' | 'loot' | 'level' | 'combat' | 'info'
  timestamp: number
}

export interface GameNotification {
  id: string
  text: string
  type: 'level' | 'item' | 'skill' | 'achievement'
  timer: number
}
