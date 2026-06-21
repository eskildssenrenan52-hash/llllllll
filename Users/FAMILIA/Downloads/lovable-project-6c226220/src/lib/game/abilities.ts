import type { AbilityDef, AbilityState, CharacterClass } from './types'

// ─── Definicoes de Habilidades por Classe ───────────────────────────────────
// Cada classe tem 4 habilidades, desbloqueadas conforme o nivel da classe sobe.

export const ABILITIES: Record<string, AbilityDef> = {
  // ─── Cavaleiro (Knight) ───────────────────────────────────────────────────
  whirlwind: {
    id: 'whirlwind', name: 'Redemoinho', cls: 'knight',
    description: 'Gira a lamina causando dano massivo a todos os inimigos ao redor.',
    icon: 'WW', color: '#d8b048', manaCost: 18, cooldown: 180, unlockLevel: 1,
    effect: 'melee_aoe', damageMultiplier: 1.6, range: 0, radius: 80,
  },
  charge: {
    id: 'charge', name: 'Investida', cls: 'knight',
    description: 'Avanca na direcao atual atropelando inimigos no caminho.',
    icon: 'CH', color: '#e0a030', manaCost: 14, cooldown: 240, unlockLevel: 3,
    effect: 'dash', damageMultiplier: 1.8, range: 180, radius: 40,
  },
  war_cry: {
    id: 'war_cry', name: 'Grito de Guerra', cls: 'knight',
    description: 'Aumenta drasticamente o ataque e a defesa por um tempo.',
    icon: 'WC', color: '#ff7040', manaCost: 25, cooldown: 480, unlockLevel: 5,
    effect: 'buff', damageMultiplier: 0, range: 0, duration: 360,
  },
  earthquake: {
    id: 'earthquake', name: 'Terremoto', cls: 'knight',
    description: 'Golpeia o chao criando uma onda de choque devastadora.',
    icon: 'EQ', color: '#c08020', manaCost: 40, cooldown: 600, unlockLevel: 8,
    effect: 'nova', damageMultiplier: 3.0, range: 0, radius: 140,
  },

  // ─── Arqueiro (Archer) ────────────────────────────────────────────────────
  power_shot: {
    id: 'power_shot', name: 'Tiro Poderoso', cls: 'archer',
    description: 'Dispara uma flecha perfurante que atravessa inimigos.',
    icon: 'PS', color: '#60c040', manaCost: 12, cooldown: 120, unlockLevel: 1,
    effect: 'projectile', damageMultiplier: 2.2, range: 360,
  },
  multi_shot: {
    id: 'multi_shot', name: 'Chuva de Flechas', cls: 'archer',
    description: 'Dispara 5 flechas em leque na direcao atual.',
    icon: 'MS', color: '#80e050', manaCost: 20, cooldown: 240, unlockLevel: 3,
    effect: 'multi_projectile', damageMultiplier: 1.1, range: 320, projectileCount: 5,
  },
  evasion: {
    id: 'evasion', name: 'Passo Veloz', cls: 'archer',
    description: 'Aumenta muito a velocidade e o critico por um tempo.',
    icon: 'EV', color: '#40e0c0', manaCost: 22, cooldown: 420, unlockLevel: 5,
    effect: 'buff', damageMultiplier: 0, range: 0, duration: 300,
  },
  arrow_rain: {
    id: 'arrow_rain', name: 'Dilúvio de Flechas', cls: 'archer',
    description: 'Chove flechas numa grande area mirada, atingindo todos.',
    icon: 'AR', color: '#a0e060', manaCost: 38, cooldown: 540, unlockLevel: 8,
    effect: 'target_aoe', damageMultiplier: 2.6, range: 340, radius: 120,
  },

  // ─── Mago (Mage) ──────────────────────────────────────────────────────────
  fireball: {
    id: 'fireball', name: 'Bola de Fogo', cls: 'mage',
    description: 'Lanca uma bola de fogo que explode ao impacto.',
    icon: 'FB', color: '#ff6020', manaCost: 16, cooldown: 90, unlockLevel: 1,
    effect: 'projectile', damageMultiplier: 2.4, range: 360, aoeRadius: 50,
  },
  frost_nova: {
    id: 'frost_nova', name: 'Nova de Gelo', cls: 'mage',
    description: 'Explosao de gelo que fere e congela inimigos ao redor.',
    icon: 'FN', color: '#60c0ff', manaCost: 28, cooldown: 300, unlockLevel: 3,
    effect: 'nova', damageMultiplier: 2.0, range: 0, radius: 130,
  },
  arcane_heal: {
    id: 'arcane_heal', name: 'Cura Arcana', cls: 'mage',
    description: 'Restaura uma grande quantidade de HP instantaneamente.',
    icon: 'HL', color: '#40ff80', manaCost: 30, cooldown: 420, unlockLevel: 5,
    effect: 'heal', damageMultiplier: 0, range: 0, healPercent: 0.45,
  },
  meteor: {
    id: 'meteor', name: 'Meteoro', cls: 'mage',
    description: 'Invoca um meteoro flamejante numa area mirada.',
    icon: 'MT', color: '#ff4020', manaCost: 50, cooldown: 600, unlockLevel: 8,
    effect: 'target_aoe', damageMultiplier: 4.0, range: 360, radius: 110,
  },

  // ─── Necromante (Necromancer) ─────────────────────────────────────────────
  raise_dead: {
    id: 'raise_dead', name: 'Erguer Mortos', cls: 'necromancer',
    description: 'Invoca esqueletos guerreiros para lutar ao seu lado.',
    icon: 'RD', color: '#80ff90', manaCost: 30, cooldown: 360, unlockLevel: 1,
    effect: 'summon', damageMultiplier: 0, range: 0, summonCount: 2,
    summonType: 'skeleton_minion', duration: 1200,
  },
  bone_spear: {
    id: 'bone_spear', name: 'Lanca de Osso', cls: 'necromancer',
    description: 'Dispara uma lanca de osso perfurante que atravessa tudo.',
    icon: 'BS', color: '#d0e0c0', manaCost: 14, cooldown: 100, unlockLevel: 2,
    effect: 'projectile', damageMultiplier: 2.0, range: 340,
  },
  life_drain: {
    id: 'life_drain', name: 'Drenar Vida', cls: 'necromancer',
    description: 'Drena a vida dos inimigos proximos, curando voce.',
    icon: 'LD', color: '#c040c0', manaCost: 26, cooldown: 300, unlockLevel: 4,
    effect: 'life_drain', damageMultiplier: 1.6, range: 0, radius: 110, healPercent: 0.5,
  },
  death_nova: {
    id: 'death_nova', name: 'Explosao da Morte', cls: 'necromancer',
    description: 'Libera uma onda de energia necrotica e invoca espectros.',
    icon: 'DN', color: '#a020e0', manaCost: 48, cooldown: 600, unlockLevel: 7,
    effect: 'nova', damageMultiplier: 3.2, range: 0, radius: 150,
    summonCount: 2, summonType: 'wraith_minion', duration: 900,
  },
}

// Lista ordenada de habilidades por classe
export const CLASS_ABILITIES: Record<CharacterClass, string[]> = {
  knight: ['whirlwind', 'charge', 'war_cry', 'earthquake'],
  archer: ['power_shot', 'multi_shot', 'evasion', 'arrow_rain'],
  mage: ['fireball', 'frost_nova', 'arcane_heal', 'meteor'],
  necromancer: ['raise_dead', 'bone_spear', 'life_drain', 'death_nova'],
}

export function buildAbilityStates(cls: CharacterClass): AbilityState[] {
  return CLASS_ABILITIES[cls].map((id) => ({ id, currentCooldown: 0 }))
}

export function getAbilityDef(id: string): AbilityDef | undefined {
  return ABILITIES[id]
}

// Buffs aplicados por habilidades de buff
export function getBuffForAbility(abilityId: string): { name: string; stat: keyof import('./types').CharacterStats; amount: number; duration: number }[] {
  switch (abilityId) {
    case 'war_cry':
      return [
        { name: 'Grito de Guerra', stat: 'attack', amount: 20, duration: 360 },
        { name: 'Grito de Guerra', stat: 'defense', amount: 15, duration: 360 },
      ]
    case 'evasion':
      return [
        { name: 'Passo Veloz', stat: 'speed', amount: 3, duration: 300 },
        { name: 'Passo Veloz', stat: 'critChance', amount: 30, duration: 300 },
      ]
    default:
      return []
  }
}
