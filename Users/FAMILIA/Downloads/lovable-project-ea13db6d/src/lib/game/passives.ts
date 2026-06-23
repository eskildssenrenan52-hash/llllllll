import type { Player, CharacterClass } from '@/lib/game/types'

export interface PassiveNode {
  id: string
  name: string
  description: string
  icon: string
  level: number
  stat: string
  value: number
  cls?: CharacterClass
}

export const PASSIVES: PassiveNode[] = [
  // Global passives (any class)
  { id: 'vitality1', name: 'Vitalidade I', description: '+50 HP máximo', icon: '❤', level: 3, stat: 'maxHp', value: 50 },
  { id: 'vitality2', name: 'Vitalidade II', description: '+120 HP máximo', icon: '❤', level: 8, stat: 'maxHp', value: 120 },
  { id: 'vitality3', name: 'Vitalidade III', description: '+300 HP máximo', icon: '❤', level: 18, stat: 'maxHp', value: 300 },
  { id: 'mana1', name: 'Arcano I', description: '+30 MP máximo', icon: '💧', level: 4, stat: 'maxMp', value: 30 },
  { id: 'mana2', name: 'Arcano II', description: '+80 MP máximo', icon: '💧', level: 12, stat: 'maxMp', value: 80 },
  { id: 'resilience', name: 'Resiliência', description: '+8 Defesa', icon: '🛡', level: 6, stat: 'defense', value: 8 },
  { id: 'resilience2', name: 'Resiliência II', description: '+20 Defesa', icon: '🛡', level: 16, stat: 'defense', value: 20 },
  { id: 'crit1', name: 'Olho de Falcão', description: '+5% chance de critico', icon: '🎯', level: 7, stat: 'critChance', value: 0.05 },
  { id: 'crit2', name: 'Precisão Mortal', description: '+10% chance de critico', icon: '🎯', level: 15, stat: 'critChance', value: 0.1 },
  { id: 'critdmg', name: 'Golpe Fatal', description: '+30% dano critico', icon: '💥', level: 10, stat: 'critDamage', value: 0.3 },
  { id: 'speed1', name: 'Passo Leve', description: '+0.4 velocidade', icon: '💨', level: 5, stat: 'speed', value: 0.4 },
  { id: 'speed2', name: 'Vento Veloz', description: '+0.8 velocidade', icon: '💨', level: 14, stat: 'speed', value: 0.8 },
  // Knight
  { id: 'knight_atk', name: 'Fúria do Cavaleiro', description: '+40 ataque', icon: '⚔', level: 9, stat: 'attack', value: 40, cls: 'knight' },
  { id: 'knight_def', name: 'Escudo de Aço', description: '+30 defesa', icon: '🛡', level: 11, stat: 'defense', value: 30, cls: 'knight' },
  // Archer
  { id: 'archer_atk', name: 'Olho Aguia', description: '+35 ataque', icon: '🏹', level: 9, stat: 'attack', value: 35, cls: 'archer' },
  { id: 'archer_crit', name: 'Flecha Certeira', description: '+12% critico', icon: '🏹', level: 13, stat: 'critChance', value: 0.12, cls: 'archer' },
  // Mage
  { id: 'mage_mp', name: 'Reservatório Arcano', description: '+100 MP', icon: '🔮', level: 9, stat: 'maxMp', value: 100, cls: 'mage' },
  { id: 'mage_magic', name: 'Poder Arcano', description: '+60 poder mágico', icon: '🔮', level: 13, stat: 'magicPower', value: 60, cls: 'mage' },
  // Necromancer
  { id: 'necro_atk', name: 'Toque da Morte', description: '+45 ataque', icon: '💀', level: 9, stat: 'attack', value: 45, cls: 'necromancer' },
  { id: 'necro_mp', name: 'Essência Sombria', description: '+80 MP', icon: '💀', level: 13, stat: 'maxMp', value: 80, cls: 'necromancer' },
  // Late game
  { id: 'supreme_atk', name: 'Força Suprema', description: '+100 ataque', icon: '🌟', level: 25, stat: 'attack', value: 100 },
  { id: 'supreme_hp', name: 'Corpo de Aço', description: '+500 HP', icon: '🌟', level: 30, stat: 'maxHp', value: 500 },
  { id: 'god_crit', name: 'Golpe Divino', description: '+50% dano critico', icon: '⚡', level: 35, stat: 'critDamage', value: 0.5 },
]

export function getUnlockedPassives(player: Player): PassiveNode[] {
  return PASSIVES.filter(p => {
    if (player.level < p.level) return false
    if (p.cls && p.cls !== player.class) return false
    return true
  })
}

export function applyPassivesToStats(player: Player): Player {
  const unlocked = getUnlockedPassives(player)
  const bonuses: Record<string, number> = {}
  for (const p of unlocked) {
    bonuses[p.stat] = (bonuses[p.stat] ?? 0) + p.value
  }
  return {
    ...player,
    stats: {
      ...player.stats,
      maxHp: player.stats.maxHp + (bonuses.maxHp ?? 0),
      maxMp: player.stats.maxMp + (bonuses.maxMp ?? 0),
      attack: player.stats.attack + (bonuses.attack ?? 0),
      defense: player.stats.defense + (bonuses.defense ?? 0),
      speed: player.stats.speed + (bonuses.speed ?? 0),
      critChance: Math.min(0.95, player.stats.critChance + (bonuses.critChance ?? 0)),
      critDamage: player.stats.critDamage + (bonuses.critDamage ?? 0),
      magicPower: player.stats.magicPower + (bonuses.magicPower ?? 0),
    },
  }
}
