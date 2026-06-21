import type {
  GameState, Player, Monster, Vec2, DamageNumber, Particle, ChatMessage, GameNotification,
  Item, CharacterClass, Direction, Projectile, AreaEffect, Minion, MinionType, ActiveBuff,
} from './types'
import { calculateXpToNext, recalcStats, ITEMS, createMonster, generateMap, BASE_STATS, START_WEAPONS } from './data'
import { getAbilityDef, getBuffForAbility, buildAbilityStates } from './abilities'

// ─── Combat ─────────────────────────────────────────────────────────────────

export function calculateDamage(attack: number, defense: number, critChance: number, critDamage: number): { value: number; isCrit: boolean } {
  const variance = 0.85 + Math.random() * 0.3
  const isCrit = Math.random() * 100 < critChance
  const raw = Math.max(1, attack - defense * 0.4) * variance
  const value = Math.round(isCrit ? raw * (critDamage / 100) : raw)
  return { value, isCrit }
}

let _idCounter = 0
function uid(prefix: string): string {
  _idCounter = (_idCounter + 1) % 1e9
  return `${prefix}_${Date.now().toString(36)}_${_idCounter}`
}

// Aplica dano a um monstro especifico e resolve morte/recompensas de forma centralizada.
// Usado por ataques basicos, projeteis, efeitos de area e minions.
export function damageMonster(
  state: GameState,
  monsterId: string,
  value: number,
  isCrit: boolean,
  dmgType: DamageNumber['type'] = 'physical',
  source: 'player' | 'minion' = 'player',
): GameState {
  if (!state.player || !state.currentMap) return state
  const monsters = state.currentMap.monsters
  const mIdx = monsters.findIndex(m => m.id === monsterId)
  if (mIdx === -1) return state
  const monster = monsters[mIdx]
  if (monster.isDead) return state

  const newHp = Math.max(0, monster.hp - value)
  const dmgNum: DamageNumber = {
    id: uid('dmg'),
    value,
    x: monster.position.x + 16 + (Math.random() - 0.5) * 10,
    y: monster.position.y - 8,
    timer: 60,
    type: isCrit ? 'crit' : dmgType,
  }

  const updatedMonster = { ...monster, hp: newHp, isAggrod: true }
  let newMonsters = monsters.map((m, i) => i === mIdx ? updatedMonster : m)
  let newPlayer = { ...state.player }
  let newMessages = [...state.chatMessages]
  let newDmgNums = [...state.damageNumbers, dmgNum]
  let newParticles = addHitParticles([...state.particles], monster.position, dmgType)
  let newNotifications = [...state.notifications]

  if (newHp <= 0) {
    newMonsters = newMonsters.map((m, i) => i === mIdx ? { ...updatedMonster, isDead: true, deathTimer: 80 } : m)
    newParticles = addDeathParticles(newParticles, monster.position)

    let xp = newPlayer.xp + monster.xpReward
    let gold = newPlayer.gold + monster.goldReward
    let level = newPlayer.level
    let xpToNext = newPlayer.xpToNext

    newMessages.push({
      id: uid('msg'),
      text: `Voce derrotou ${monster.name}! +${monster.xpReward} XP, +${monster.goldReward} Ouro`,
      type: 'combat',
      timestamp: Date.now(),
    })

    while (xp >= xpToNext) {
      xp -= xpToNext
      level++
      xpToNext = calculateXpToNext(level)
      newNotifications.push({ id: uid('lvl'), text: `Level ${level}! Parabens!`, type: 'level', timer: 180 })
      newMessages.push({ id: uid('msglvl'), text: `Voce subiu para o nivel ${level}!`, type: 'level', timestamp: Date.now() })
    }

    const drops: Item[] = []
    for (const drop of monster.drops) {
      if (Math.random() < drop.chance) drops.push({ ...drop.item })
    }
    let newInventory = [...newPlayer.inventory]
    for (const drop of drops) {
      const slotIdx = newInventory.findIndex(s => s && s.stackable && s.id === drop.id && (s.quantity ?? 0) < 99)
      if (slotIdx >= 0) {
        newInventory[slotIdx] = { ...newInventory[slotIdx]!, quantity: (newInventory[slotIdx]!.quantity ?? 0) + 1 }
      } else {
        const emptyIdx = newInventory.findIndex(s => s === null)
        if (emptyIdx >= 0) newInventory[emptyIdx] = drop
      }
      newMessages.push({ id: uid('drop'), text: `Item obtido: ${drop.name}`, type: 'loot', timestamp: Date.now() })
    }

    const updatedStats = recalcStats({ ...newPlayer, level, xp, xpToNext, inventory: newInventory })
    newPlayer = {
      ...newPlayer,
      level, xp, xpToNext, gold,
      inventory: newInventory,
      stats: updatedStats,
      hp: Math.min(newPlayer.hp + Math.round(updatedStats.maxHp * 0.05), updatedStats.maxHp),
      maxHp: updatedStats.maxHp,
    } as unknown as Player

    // XP de skill primaria (apenas em kills do jogador)
    if (source === 'player' && newPlayer.skills.length > 0) {
      const newSkills = [...newPlayer.skills]
      newSkills[0] = { ...newSkills[0], xp: newSkills[0].xp + Math.round(monster.xpReward * 0.5) }
      if (newSkills[0].xp >= newSkills[0].xpToNext) {
        newSkills[0] = {
          ...newSkills[0],
          xp: newSkills[0].xp - newSkills[0].xpToNext,
          level: newSkills[0].level + 1,
          xpToNext: Math.round(newSkills[0].xpToNext * 1.5),
        }
        newNotifications.push({ id: uid('skill'), text: `${newSkills[0].name} nivel ${newSkills[0].level}!`, type: 'skill', timer: 180 })
      }
      newPlayer = { ...newPlayer, skills: newSkills }
    }
  }

  return {
    ...state,
    player: newPlayer,
    currentMap: { ...state.currentMap, monsters: newMonsters },
    damageNumbers: newDmgNums,
    particles: newParticles,
    chatMessages: newMessages.slice(-50),
    notifications: newNotifications,
  }
}

export function tryAttackMonster(state: GameState, monsterId: string): GameState {
  if (!state.player || !state.currentMap) return state
  const player = state.player
  const monster = state.currentMap.monsters.find(m => m.id === monsterId)
  if (!monster || monster.isDead) return state

  // Respeita o alcance de ataque do jogador
  const dx = monster.position.x - player.position.x
  const dy = monster.position.y - player.position.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const range = Math.max(40, player.stats.range || 48)
  if (dist > range) return state

  const usesMagic = player.class === 'mage' || player.class === 'necromancer'
  const baseAtk = usesMagic ? player.stats.attack + player.stats.magicPower : player.stats.attack
  const { value, isCrit } = calculateDamage(baseAtk, monster.defense, player.stats.critChance, player.stats.critDamage)

  // Classes a distancia disparam um projetil; corpo-a-corpo aplica dano instantaneo
  if (isRangedClass(player.class) && dist > 56) {
    const dir = directionFromVector(dx, dy)
    const proj = makePlayerProjectile(player, monster.position.x + 16, monster.position.y + 16, value, isCrit)
    return {
      ...state,
      player: { ...player, isAttacking: true, attackCooldown: attackCooldownFor(player), direction: dir },
      projectiles: [...state.projectiles, proj],
    }
  }

  const after = damageMonster(
    { ...state, player: { ...player, isAttacking: true, attackCooldown: attackCooldownFor(player), direction: directionFromVector(dx, dy) } },
    monsterId, value, isCrit, usesMagic ? 'magic' : 'physical', 'player',
  )
  return after
}

function isRangedClass(cls: CharacterClass): boolean {
  return cls === 'archer' || cls === 'mage' || cls === 'necromancer'
}

function attackCooldownFor(player: Player): number {
  // Ataque mais rapido com mais velocidade; magos um pouco mais lentos
  const base = player.class === 'knight' ? 32 : player.class === 'archer' ? 26 : 34
  return Math.max(14, Math.round(base - player.stats.speed))
}

function directionFromVector(dx: number, dy: number): Direction {
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left'
  return dy > 0 ? 'down' : 'up'
}

function makePlayerProjectile(player: Player, tx: number, ty: number, damage: number, isCrit: boolean): Projectile {
  const sx = player.position.x + 16
  const sy = player.position.y + 16
  const ang = Math.atan2(ty - sy, tx - sx)
  const speed = player.class === 'archer' ? 9 : 7
  const kind = player.class === 'archer' ? 'arrow' : player.class === 'necromancer' ? 'bone' : 'magic'
  const color = player.class === 'archer' ? '#d8e070' : player.class === 'necromancer' ? '#c0d0a0' : '#80a0ff'
  return {
    id: uid('proj'),
    x: sx, y: sy,
    vx: Math.cos(ang) * speed,
    vy: Math.sin(ang) * speed,
    life: 90,
    damage, isCrit,
    radius: kind === 'arrow' ? 3 : 5,
    color,
    type: kind as Projectile['type'],
    pierce: false,
    hitIds: [],
    owner: 'player',
  }
}

function addHitParticles(particles: Particle[], pos: Vec2, type: DamageNumber['type']): Particle[] {
  const color = type === 'magic' ? '#80a0ff' : type === 'crit' ? '#ffcc00' : '#ff8060'
  for (let i = 0; i < 4; i++) {
    particles.push({
      id: uid('hp'),
      x: pos.x + 16 + (Math.random() - 0.5) * 16,
      y: pos.y + 12 + (Math.random() - 0.5) * 16,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3 - 1,
      life: 18 + Math.random() * 10,
      maxLife: 28,
      size: 2 + Math.random() * 2,
      color,
      type: type === 'magic' ? 'magic' : 'spark',
    })
  }
  return particles
}

function addDeathParticles(particles: Particle[], pos: Vec2): Particle[] {
  const newParticles = [...particles]
  for (let i = 0; i < 12; i++) {
    newParticles.push({
      id: `p_${Date.now()}_${i}`,
      x: pos.x + 16 + (Math.random() - 0.5) * 20,
      y: pos.y + 16 + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 2,
      life: 40 + Math.random() * 20,
      maxLife: 60,
      size: 2 + Math.random() * 3,
      color: `hsl(${Math.random() * 60},80%,60%)`,
      type: 'blood',
    })
  }
  return newParticles
}

// ─── Monster AI ─────────────────────────────────────────────────────────────

export function updateMonsterAI(state: GameState): GameState {
  if (!state.player || !state.currentMap) return state

  const player = state.player
  const map = state.currentMap
  const pendingProjectiles: Projectile[] = []
  let pendingDmgToPlayer = 0
  const minions = state.minions

  const monsters = map.monsters.map(m => {
    if (m.isDead) {
      return { ...m, deathTimer: m.deathTimer - 1 }
    }

    const dx = player.position.x + 16 - (m.position.x + 16)
    const dy = player.position.y + 16 - (m.position.y + 16)
    const dist = Math.sqrt(dx * dx + dy * dy)

    // Procura o alvo mais proximo: jogador ou minion
    let targetX = player.position.x + 16
    let targetY = player.position.y + 16
    let targetDist = dist
    let targetIsPlayer = true
    for (const minion of minions) {
      const mdx = minion.position.x + 16 - (m.position.x + 16)
      const mdy = minion.position.y + 16 - (m.position.y + 16)
      const md = Math.sqrt(mdx * mdx + mdy * mdy)
      if (md < targetDist) { targetDist = md; targetX = minion.position.x + 16; targetY = minion.position.y + 16; targetIsPlayer = false }
    }

    let updated = { ...m }
    updated.animTimer = m.animTimer + 1
    if (m.attackCooldown > 0) {
      updated.attackCooldown = m.attackCooldown - 1
      updated.isAttacking = false
    }

    if (dist < m.aggroRange || targetDist < m.aggroRange) updated.isAggrod = true
    if (dist > m.aggroRange * 2.4 && targetDist > m.aggroRange * 2.4) updated.isAggrod = false

    const tdx = targetX - (m.position.x + 16)
    const tdy = targetY - (m.position.y + 16)

    if (updated.isAggrod) {
      const inAttackRange = targetDist <= m.attackRange
      // Inimigos a distancia mantem distancia ideal; corpo-a-corpo cola no alvo
      const wantsToKite = m.isRanged && targetDist < m.attackRange * 0.55

      if (inAttackRange && !wantsToKite) {
        updated.isMoving = false
        if (m.attackCooldown <= 0) {
          updated.isAttacking = true
          const rate = m.elite === 'boss' ? 42 : m.elite === 'champion' ? 50 : 60
          updated.attackCooldown = rate + Math.random() * 20
          updated.direction = directionFromVector(tdx, tdy)

          if (m.isRanged) {
            // Dispara projetil em direcao ao alvo
            pendingProjectiles.push(makeMonsterProjectile(m, targetX, targetY))
          } else if (targetIsPlayer) {
            const { value } = calculateDamage(m.attack, player.stats.defense, 6, 150)
            pendingDmgToPlayer += value
          }
        }
      } else {
        const speed = m.speed * (m.isRanged ? 1.0 : 1.25)
        let moveX = tdx, moveY = tdy
        if (wantsToKite) { moveX = -tdx; moveY = -tdy }  // recua
        const md = Math.sqrt(moveX * moveX + moveY * moveY) || 1
        const nx = moveX / md * speed
        const ny = moveY / md * speed
        const newX = m.position.x + nx
        const newY = m.position.y + ny
        const tileX = Math.floor((newX + 16) / 32)
        const tileY = Math.floor((newY + 16) / 32)
        const walkable = tileX >= 0 && tileY >= 0 && tileX < map.width && tileY < map.height && map.tiles[tileY][tileX].walkable
        if (walkable) updated.position = { x: newX, y: newY }
        updated.isMoving = true
        updated.animFrame = m.animFrame + 1
        updated.direction = directionFromVector(nx, ny)
      }
    } else {
      // Perambula
      if (m.animTimer % 120 === 0) {
        const wAngle = Math.random() * Math.PI * 2
        const wSpeed = m.speed * 0.6
        const wx = m.position.x + Math.cos(wAngle) * wSpeed * 30
        const wy = m.position.y + Math.sin(wAngle) * wSpeed * 30
        updated.targetPosition = {
          x: Math.max(32, Math.min((map.width - 2) * 32, wx)),
          y: Math.max(32, Math.min((map.height - 2) * 32, wy)),
        }
      }
      const wdx = updated.targetPosition.x - m.position.x
      const wdy = updated.targetPosition.y - m.position.y
      const wdist = Math.sqrt(wdx * wdx + wdy * wdy)
      if (wdist > 4) {
        const wspeed = m.speed * 0.5
        updated.position = { x: m.position.x + (wdx / wdist) * wspeed, y: m.position.y + (wdy / wdist) * wspeed }
        updated.isMoving = true
        updated.animFrame = m.animFrame + 1
        updated.direction = directionFromVector(wdx, wdy)
      } else {
        updated.isMoving = false
      }
    }
    return updated
  })

  let newPlayer = pendingDmgToPlayer > 0 ? { ...player, hp: Math.max(0, player.hp - pendingDmgToPlayer) } : player
  let newDmgNums = state.damageNumbers
  if (pendingDmgToPlayer > 0) {
    newDmgNums = [...state.damageNumbers, {
      id: uid('pdmg'), value: pendingDmgToPlayer,
      x: player.position.x + 16, y: player.position.y - 12, timer: 60, type: 'physical',
    }]
  }

  return {
    ...state,
    player: newPlayer,
    currentMap: { ...map, monsters: monsters.filter(m => !m.isDead || m.deathTimer > 0) },
    projectiles: pendingProjectiles.length > 0 ? [...state.projectiles, ...pendingProjectiles] : state.projectiles,
    damageNumbers: newDmgNums,
  }
}

function makeMonsterProjectile(m: Monster, tx: number, ty: number): Projectile {
  const sx = m.position.x + 16
  const sy = m.position.y + 16
  const ang = Math.atan2(ty - sy, tx - sx)
  const speed = 5.5
  const isMagic = m.type === 'mage_enemy' || m.type === 'witch'
  return {
    id: uid('mproj'),
    x: sx, y: sy,
    vx: Math.cos(ang) * speed,
    vy: Math.sin(ang) * speed,
    life: 110,
    damage: m.attack,
    isCrit: false,
    radius: isMagic ? 5 : 3,
    color: isMagic ? '#c060ff' : '#d8c080',
    type: isMagic ? 'magic' : 'arrow',
    pierce: false,
    hitIds: [],
    owner: 'monster',
  }
}

// ─── Projectiles ───────────────────────────────────────────────────────────

export function updateProjectiles(state: GameState): GameState {
  if (!state.currentMap || !state.player) return state
  if (state.projectiles.length === 0) return state

  const map = state.currentMap
  let s: GameState = state
  const surviving: Projectile[] = []
  let player = state.player
  let extraDmgNums: DamageNumber[] = []

  for (const projInit of state.projectiles) {
    let proj = { ...projInit, x: projInit.x + projInit.vx, y: projInit.y + projInit.vy, life: projInit.life - 1 }
    let consumed = false

    // Colisao com bordas e obstaculos
    const tileX = Math.floor(proj.x / 32)
    const tileY = Math.floor(proj.y / 32)
    if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
      consumed = true
    } else if (!map.tiles[tileY][tileX].walkable) {
      consumed = true
    }

    if (proj.owner === 'player' && !consumed) {
      // Acerta monstros
      for (const m of s.currentMap!.monsters) {
        if (m.isDead || proj.hitIds.includes(m.id)) continue
        const mdx = m.position.x + 16 - proj.x
        const mdy = m.position.y + 16 - proj.y
        if (mdx * mdx + mdy * mdy <= (16 + proj.radius) * (16 + proj.radius)) {
          s = damageMonster(s, m.id, proj.damage, proj.isCrit, proj.type === 'magic' || proj.type === 'fireball' || proj.type === 'frost' ? 'magic' : 'physical', 'player')
          proj.hitIds = [...proj.hitIds, m.id]
          if (proj.aoeRadius && proj.aoeRadius > 0) {
            s = applyAoeDamage(s, proj.x, proj.y, proj.aoeRadius, Math.round(proj.damage * 0.7), proj.isCrit, proj.color, 'explosion')
          }
          if (!proj.pierce) { consumed = true; break }
        }
      }
    } else if (proj.owner === 'monster' && !consumed) {
      const pdx = player.position.x + 16 - proj.x
      const pdy = player.position.y + 16 - proj.y
      if (pdx * pdx + pdy * pdy <= (15 + proj.radius) * (15 + proj.radius)) {
        const { value } = calculateDamage(proj.damage, player.stats.defense, 5, 150)
        player = { ...player, hp: Math.max(0, player.hp - value) }
        extraDmgNums.push({ id: uid('pdmg'), value, x: player.position.x + 16, y: player.position.y - 12, timer: 60, type: proj.type === 'magic' ? 'magic' : 'physical' })
        consumed = true
      }
    }

    if (!consumed && proj.life > 0) surviving.push(proj)
  }

  return {
    ...s,
    player,
    projectiles: surviving,
    damageNumbers: extraDmgNums.length > 0 ? [...s.damageNumbers, ...extraDmgNums] : s.damageNumbers,
  }
}

function applyAoeDamage(state: GameState, x: number, y: number, radius: number, damage: number, isCrit: boolean, color: string, fxType: AreaEffect['type']): GameState {
  if (!state.currentMap) return state
  let s = state
  for (const m of state.currentMap.monsters) {
    if (m.isDead) continue
    const mdx = m.position.x + 16 - x
    const mdy = m.position.y + 16 - y
    if (mdx * mdx + mdy * mdy <= radius * radius) {
      s = damageMonster(s, m.id, damage, isCrit, 'magic', 'player')
    }
  }
  const fx: AreaEffect = {
    id: uid('fx'), x, y, radius, maxRadius: radius, life: 24, maxLife: 24,
    color, damage, isCrit, hitIds: [], type: fxType,
  }
  return { ...s, areaEffects: [...s.areaEffects, fx] }
}

// ─── Area Effects ────────────────────────────────────────────────────────────

export function updateAreaEffects(state: GameState): GameState {
  if (state.areaEffects.length === 0) return state
  const effects = state.areaEffects
    .map(fx => ({ ...fx, life: fx.life - 1, radius: Math.min(fx.maxRadius, fx.radius + (fx.maxRadius - fx.radius) * 0.3) }))
    .filter(fx => fx.life > 0)
  return { ...state, areaEffects: effects }
}

// ─── Minions ───────────────────────────────────────────────────────────────

export function updateMinions(state: GameState): GameState {
  if (!state.player || !state.currentMap) return state
  if (state.minions.length === 0) return state

  const map = state.currentMap
  let s = state
  const aliveMinions: Minion[] = []

  for (const minionInit of state.minions) {
    let minion = { ...minionInit }
    minion.lifespan = minion.lifespan > 0 ? minion.lifespan - 1 : 0
    if (minionInit.lifespan === 1) continue // expirou neste tick
    if (minion.hp <= 0) continue
    if (minion.attackCooldown > 0) minion.attackCooldown -= 1
    minion.animFrame += 1

    // Encontra monstro alvo mais proximo
    let target: Monster | null = null
    let bestDist = Infinity
    for (const m of s.currentMap!.monsters) {
      if (m.isDead) continue
      const dxx = m.position.x - minion.position.x
      const dyy = m.position.y - minion.position.y
      const d = Math.sqrt(dxx * dxx + dyy * dyy)
      if (d < bestDist) { bestDist = d; target = m }
    }

    if (target) {
      minion.targetMonsterId = target.id
      const dxx = target.position.x - minion.position.x
      const dyy = target.position.y - minion.position.y
      const dist = Math.sqrt(dxx * dxx + dyy * dyy) || 1

      if (dist <= minion.range) {
        minion.isMoving = false
        minion.isAttacking = true
        if (minion.attackCooldown <= 0) {
          minion.attackCooldown = 45
          const { value, isCrit } = calculateDamage(minion.attack, target.defense, 8, 150)
          s = damageMonster(s, target.id, value, isCrit, 'physical', 'minion')
        }
      } else {
        minion.isAttacking = false
        // Segue o alvo, mas nao se afasta demais do dono
        const ownerDx = s.player!.position.x - minion.position.x
        const ownerDy = s.player!.position.y - minion.position.y
        const ownerDist = Math.sqrt(ownerDx * ownerDx + ownerDy * ownerDy)
        let mvx = dxx / dist, mvy = dyy / dist
        if (ownerDist > 260) { mvx = ownerDx / ownerDist; mvy = ownerDy / ownerDist }
        const speed = 3.2
        const nx = minion.position.x + mvx * speed
        const ny = minion.position.y + mvy * speed
        const tileX = Math.floor((nx + 16) / 32)
        const tileY = Math.floor((ny + 16) / 32)
        if (tileX >= 0 && tileY >= 0 && tileX < map.width && tileY < map.height && map.tiles[tileY][tileX].walkable) {
          minion.position = { x: nx, y: ny }
        }
        minion.isMoving = true
        minion.direction = directionFromVector(mvx, mvy)
      }
    } else {
      // Sem alvo: segue o dono
      const ownerDx = s.player!.position.x - minion.position.x
      const ownerDy = s.player!.position.y - minion.position.y
      const ownerDist = Math.sqrt(ownerDx * ownerDx + ownerDy * ownerDy)
      minion.isAttacking = false
      if (ownerDist > 60) {
        const speed = 3
        const nx = minion.position.x + (ownerDx / ownerDist) * speed
        const ny = minion.position.y + (ownerDy / ownerDist) * speed
        minion.position = { x: nx, y: ny }
        minion.isMoving = true
        minion.direction = directionFromVector(ownerDx, ownerDy)
      } else {
        minion.isMoving = false
      }
    }
    aliveMinions.push(minion)
  }

  return { ...s, minions: aliveMinions }
}

// ─── Player Movement ─────────────────────────────────────────────────────────

export function movePlayer(state: GameState, keys: Set<string>): GameState {
  if (!state.player || !state.currentMap || state.isPaused || state.editorOpen) return state

  const player = state.player
  const map = state.currentMap
  // Ensure minimum speed so player never gets stuck
  const speed = Math.max(2.5, player.stats.speed)

  let dx = 0, dy = 0
  if (keys.has('ArrowLeft') || keys.has('KeyA')) dx -= 1
  if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1
  if (keys.has('ArrowUp') || keys.has('KeyW')) dy -= 1
  if (keys.has('ArrowDown') || keys.has('KeyS')) dy += 1

  if (dx !== 0 && dy !== 0) {
    dx *= 0.707
    dy *= 0.707
  }

  const newX = player.position.x + dx * speed
  const newY = player.position.y + dy * speed

  // Check if a pixel position is walkable
  const isWalkable = (px: number, py: number): boolean => {
    const tx = Math.floor(px / 32)
    const ty = Math.floor(py / 32)
    if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return false
    return map.tiles[ty][tx].walkable
  }

  // Collision check using a smaller hitbox (8px inset)
  const checkBox = (px: number, py: number): boolean => {
    const m = 8
    return (
      isWalkable(px + m,      py + m) &&
      isWalkable(px + 32 - m, py + m) &&
      isWalkable(px + m,      py + 32 - m) &&
      isWalkable(px + 32 - m, py + 32 - m)
    )
  }

  let finalX = player.position.x
  let finalY = player.position.y

  // Try full move first, then axis-separated (sliding)
  if (checkBox(newX, newY)) {
    finalX = newX
    finalY = newY
  } else {
    if (checkBox(newX, player.position.y)) finalX = newX
    if (checkBox(player.position.x, newY)) finalY = newY
  }

  const isMoving = dx !== 0 || dy !== 0
  let direction = player.direction
  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 ? 'right' : 'left'
  } else if (dy !== 0) {
    direction = dy > 0 ? 'down' : 'up'
  }

  // Camera — use actual canvas size clamping
  const VIEWPORT_W = typeof window !== 'undefined' ? window.innerWidth  : 1280
  const VIEWPORT_H = typeof window !== 'undefined' ? window.innerHeight : 720
  const camX = Math.max(0, Math.min(map.width  * 32 - VIEWPORT_W, finalX + 16 - VIEWPORT_W  / 2))
  const camY = Math.max(0, Math.min(map.height * 32 - VIEWPORT_H, finalY + 16 - VIEWPORT_H / 2))

  const attackCooldown = player.attackCooldown > 0 ? player.attackCooldown - 1 : 0

  return {
    ...state,
    player: {
      ...player,
      position: { x: finalX, y: finalY },
      direction,
      isMoving,
      attackCooldown,
      isAttacking: attackCooldown > 20,
    },
    camera: { x: camX, y: camY },
  }
}

// ─── Switch Class ─────────────────────────────────────────────────────────────

export function switchClass(state: GameState, newClass: CharacterClass): GameState {
  if (!state.player) return state
  const player = state.player
  if (player.class === newClass) return state

  // Salva o progresso da classe atual (incluindo habilidades)
  const updatedProgress = {
    ...player.classProgress,
    [player.class]: {
      ...player.classProgress[player.class],
      level: player.level,
      xp: player.xp,
      xpToNext: player.xpToNext,
      skills: [...player.skills],
      abilities: player.abilities.map(a => ({ ...a })),
      equipment: { ...player.equipment },
    },
  }

  // Carrega o progresso da nova classe
  const newProgress = updatedProgress[newClass]
  const newBaseStats = { ...BASE_STATS[newClass] }
  const newAbilities = newProgress.abilities && newProgress.abilities.length > 0
    ? newProgress.abilities.map(a => ({ ...a, currentCooldown: 0 }))
    : buildAbilityStates(newClass)
  const newPlayer: Player = {
    ...player,
    class: newClass,
    level: newProgress.level,
    xp: newProgress.xp,
    xpToNext: newProgress.xpToNext,
    skills: [...newProgress.skills],
    abilities: newAbilities,
    equipment: { ...newProgress.equipment },
    baseStats: newBaseStats,
    classProgress: updatedProgress,
    buffs: [],
    hp: Math.round(newBaseStats.maxHp * (newProgress.level * 0.08 + 0.92)),
    mp: Math.round(newBaseStats.maxMp * (newProgress.level * 0.08 + 0.92)),
  }
  newPlayer.stats = recalcStats(newPlayer)
  newPlayer.maxHp = newPlayer.stats.maxHp
  newPlayer.hp = Math.min(newPlayer.hp, newPlayer.stats.maxHp)

  return {
    ...state,
    player: newPlayer,
    minions: [], // minions antigos desaparecem ao trocar de classe
    chatMessages: [
      ...state.chatMessages,
      {
        id: uid('class'),
        text: `Classe trocada para ${CLASS_LABELS[newClass]} (Nivel ${newProgress.level})`,
        type: 'system',
        timestamp: Date.now(),
      },
    ],
  }
}

const CLASS_LABELS: Record<CharacterClass, string> = {
  knight: 'Cavaleiro', archer: 'Arqueiro', mage: 'Mago', necromancer: 'Necromante',
}

// ─── Cast Ability ──────────────────────────────────────────────────────────

// Encontra um ponto de mira: monstro vivo mais proximo dentro do alcance, senao a frente do jogador
function findAimPoint(state: GameState, range: number): { x: number; y: number; dir: Direction } {
  const player = state.player!
  const px = player.position.x + 16
  const py = player.position.y + 16
  let best: Monster | null = null
  let bestDist = Infinity
  for (const m of state.currentMap!.monsters) {
    if (m.isDead) continue
    const d = Math.hypot(m.position.x + 16 - px, m.position.y + 16 - py)
    if (d < bestDist && d <= range + 40) { bestDist = d; best = m }
  }
  if (best) {
    const tx = best.position.x + 16
    const ty = best.position.y + 16
    return { x: tx, y: ty, dir: directionFromVector(tx - px, ty - py) }
  }
  const dv = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }[player.direction]
  return { x: px + dv.x * range, y: py + dv.y * range, dir: player.direction }
}

export function castAbility(state: GameState, slotIndex: number): GameState {
  if (!state.player || !state.currentMap) return state
  if (state.isPaused || state.editorOpen) return state
  const player = state.player
  const abilityState = player.abilities[slotIndex]
  if (!abilityState) return state
  const def = getAbilityDef(abilityState.id)
  if (!def) return state

  // Verifica desbloqueio, cooldown e mana
  if (player.level < def.unlockLevel) {
    return pushNotice(state, `${def.name} desbloqueia no nivel ${def.unlockLevel}`, 'skill')
  }
  if (abilityState.currentCooldown > 0) return state
  if (player.mp < def.manaCost) {
    return pushNotice(state, 'Mana insuficiente!', 'skill')
  }

  // Consome mana e ativa cooldown
  const newAbilities = player.abilities.map((a, i) => i === slotIndex ? { ...a, currentCooldown: def.cooldown } : a)
  let p: Player = { ...player, mp: player.mp - def.manaCost, abilities: newAbilities, isAttacking: true, attackCooldown: 18 }
  const px = p.position.x + 16
  const py = p.position.y + 16
  const magicAtk = p.stats.attack + p.stats.magicPower
  const physAtk = p.stats.attack

  let s: GameState = { ...state, player: p }
  const aim = findAimPoint(s, def.range || p.stats.range)
  p = { ...p, direction: aim.dir }
  s = { ...s, player: p }

  const baseDmg = (def.cls === 'mage' || def.cls === 'necromancer') ? magicAtk : physAtk

  switch (def.effect) {
    case 'melee_aoe':
    case 'nova': {
      const radius = def.radius || 100
      const dmg = Math.round(baseDmg * def.damageMultiplier)
      const isCrit = Math.random() * 100 < p.stats.critChance
      s = applyAoeDamage(s, px, py, radius, isCrit ? Math.round(dmg * (p.stats.critDamage / 100)) : dmg, isCrit, def.color, def.effect === 'nova' ? 'nova' : 'whirlwind')
      // Summon adicional (death_nova)
      if (def.summonCount && def.summonType) {
        s = summonMinions(s, def.summonType, def.summonCount, def.duration || 900)
      }
      break
    }
    case 'target_aoe': {
      const radius = def.radius || 90
      const dmg = Math.round(baseDmg * def.damageMultiplier)
      const isCrit = Math.random() * 100 < p.stats.critChance
      s = applyAoeDamage(s, aim.x, aim.y, radius, isCrit ? Math.round(dmg * (p.stats.critDamage / 100)) : dmg, isCrit, def.color, 'explosion')
      break
    }
    case 'projectile':
    case 'multi_projectile': {
      const count = def.effect === 'multi_projectile' ? (def.projectileCount || 5) : 1
      const ang0 = Math.atan2(aim.y - py, aim.x - px)
      const spread = 0.5
      const newProjs: Projectile[] = []
      for (let i = 0; i < count; i++) {
        const ang = count === 1 ? ang0 : ang0 - spread / 2 + (spread / (count - 1)) * i
        const isCrit = Math.random() * 100 < p.stats.critChance
        let dmg = Math.round(baseDmg * def.damageMultiplier)
        if (isCrit) dmg = Math.round(dmg * (p.stats.critDamage / 100))
        const speed = 9
        newProjs.push({
          id: uid('aproj'),
          x: px, y: py,
          vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
          life: Math.round((def.range || 340) / speed) + 6,
          damage: dmg, isCrit,
          radius: def.cls === 'archer' ? 4 : 6,
          color: def.color,
          type: def.cls === 'archer' ? 'arrow' : def.cls === 'necromancer' ? 'bone' : 'fireball',
          pierce: def.cls === 'archer' || def.cls === 'necromancer',
          hitIds: [],
          owner: 'player',
          aoeRadius: def.aoeRadius,
        })
      }
      s = { ...s, projectiles: [...s.projectiles, ...newProjs] }
      break
    }
    case 'dash': {
      const dv = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }[aim.dir]
      const dist = def.range || 160
      const targetX = p.position.x + dv.x * dist
      const targetY = p.position.y + dv.y * dist
      // Dano ao longo do caminho
      const dmg = Math.round(physAtk * def.damageMultiplier)
      s = applyAoeDamage(s, px + dv.x * dist * 0.5, py + dv.y * dist * 0.5, def.radius || 50, dmg, false, def.color, 'whirlwind')
      // Move o jogador se o destino for caminhavel
      const tileX = Math.floor((targetX + 16) / 32)
      const tileY = Math.floor((targetY + 16) / 32)
      const map = s.currentMap!
      if (tileX >= 0 && tileY >= 0 && tileX < map.width && tileY < map.height && map.tiles[tileY][tileX].walkable) {
        p = { ...p, position: { x: targetX, y: targetY } }
        s = { ...s, player: p }
      }
      break
    }
    case 'life_drain': {
      const radius = def.radius || 110
      const dmg = Math.round(magicAtk * def.damageMultiplier)
      let healed = 0
      for (const m of s.currentMap!.monsters) {
        if (m.isDead) continue
        if (Math.hypot(m.position.x + 16 - px, m.position.y + 16 - py) <= radius) {
          healed += Math.round(dmg * (def.healPercent || 0.5))
          s = damageMonster(s, m.id, dmg, false, 'magic', 'player')
        }
      }
      const fx: AreaEffect = { id: uid('fx'), x: px, y: py, radius, maxRadius: radius, life: 24, maxLife: 24, color: def.color, damage: dmg, isCrit: false, hitIds: [], type: 'nova' }
      const np = s.player!
      const newHp = Math.min(np.stats.maxHp, np.hp + healed)
      s = {
        ...s,
        player: { ...np, hp: newHp },
        areaEffects: [...s.areaEffects, fx],
        damageNumbers: healed > 0 ? [...s.damageNumbers, { id: uid('heal'), value: healed, x: px, y: py - 16, timer: 60, type: 'heal' }] : s.damageNumbers,
      }
      break
    }
    case 'heal': {
      const np = s.player!
      const healAmount = Math.round(np.stats.maxHp * (def.healPercent || 0.4))
      s = {
        ...s,
        player: { ...np, hp: Math.min(np.stats.maxHp, np.hp + healAmount) },
        damageNumbers: [...s.damageNumbers, { id: uid('heal'), value: healAmount, x: px, y: py - 16, timer: 60, type: 'heal' }],
      }
      break
    }
    case 'buff': {
      const buffs = getBuffForAbility(def.id)
      const np = s.player!
      const activeBuffs: ActiveBuff[] = buffs.map(b => ({ id: uid('buff'), name: b.name, timer: b.duration, stat: b.stat, amount: b.amount }))
      const merged = [...np.buffs.filter(b => b.name !== def.name), ...activeBuffs]
      const buffedPlayer = { ...np, buffs: merged }
      buffedPlayer.stats = recalcStats(buffedPlayer)
      s = { ...s, player: buffedPlayer }
      break
    }
    case 'summon': {
      if (def.summonType && def.summonCount) {
        s = summonMinions(s, def.summonType, def.summonCount, def.duration || 1200)
      }
      break
    }
  }

  return pushNotice(s, def.name, 'skill', 60)
}

function summonMinions(state: GameState, type: MinionType, count: number, lifespan: number): GameState {
  const player = state.player!
  const level = player.level
  const baseAtk = Math.round((player.stats.attack + player.stats.magicPower) * 0.6 + level * 2)
  const baseHp = Math.round(40 + level * 12)
  const newMinions: Minion[] = []
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2
    newMinions.push({
      id: uid('minion'),
      type,
      ownerId: player.name,
      level,
      hp: baseHp, maxHp: baseHp,
      attack: baseAtk,
      position: { x: player.position.x + Math.cos(ang) * 36, y: player.position.y + Math.sin(ang) * 36 },
      targetMonsterId: null,
      direction: 'down',
      isMoving: false,
      isAttacking: false,
      attackCooldown: 0,
      lifespan,
      animFrame: Math.random() * 30,
      range: type === 'wraith_minion' ? 40 : 36,
    })
  }
  // Limite de minions ativos
  const MAX_MINIONS = 6
  const combined = [...state.minions, ...newMinions].slice(-MAX_MINIONS)
  return { ...state, minions: combined }
}

function pushNotice(state: GameState, text: string, type: GameNotification['type'], timer = 90): GameState {
  return {
    ...state,
    notifications: [...state.notifications, { id: uid('note'), text, type, timer }],
  }
}

// ─── Tick Update ─────────────────────────────────────────────────────────────

export function tickUpdate(state: GameState): GameState {
  let s = { ...state, tick: state.tick + 1 }

  // Update damage numbers
  s.damageNumbers = s.damageNumbers
    .map(d => ({ ...d, timer: d.timer - 1 }))
    .filter(d => d.timer > 0)

  // Update particles
  s.particles = s.particles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.15,
      life: p.life - 1,
    }))
    .filter(p => p.life > 0)

  // Update notifications
  s.notifications = s.notifications
    .map(n => ({ ...n, timer: n.timer - 1 }))
    .filter(n => n.timer > 0)

  // Cooldown de habilidades + buffs
  if (s.player) {
    let p = s.player
    const abilities = p.abilities.map(a => a.currentCooldown > 0 ? { ...a, currentCooldown: a.currentCooldown - 1 } : a)
    let buffsChanged = false
    const buffs = p.buffs
      .map(b => ({ ...b, timer: b.timer - 1 }))
      .filter(b => {
        if (b.timer <= 0) { buffsChanged = true; return false }
        return true
      })
    p = { ...p, abilities, buffs }
    if (buffsChanged) {
      p.stats = recalcStats(p)
      p.maxHp = p.stats.maxHp
      p.hp = Math.min(p.hp, p.stats.maxHp)
    }
    s.player = p
  }

  // MP regen
  if (s.player && s.tick % 60 === 0) {
    const maxMp = s.player.stats.maxMp
    s.player = {
      ...s.player,
      mp: Math.min(maxMp, s.player.mp + Math.ceil(maxMp * 0.02)),
    }
  }

  // HP regen (very slow)
  if (s.player && s.tick % 300 === 0) {
    const maxHp = s.player.stats.maxHp
    s.player = {
      ...s.player,
      hp: Math.min(maxHp, s.player.hp + Math.ceil(maxHp * 0.01)),
    }
  }

  return s
}

// ─── Auto Attack ─────────────────────────────────────────────────────────────

export function tryAutoAttack(state: GameState): GameState {
  if (!state.player || !state.currentMap) return state
  if (state.player.attackCooldown > 0) return state

  const player = state.player
  const attackRange = player.stats.range || 48

  // Find nearest monster in range
  const monstersInRange = state.currentMap.monsters
    .filter(m => !m.isDead)
    .map(m => {
      const dx = m.position.x + 16 - (player.position.x + 16)
      const dy = m.position.y + 16 - (player.position.y + 16)
      return { monster: m, dist: Math.sqrt(dx * dx + dy * dy) }
    })
    .filter(({ dist }) => dist <= attackRange)
    .sort((a, b) => a.dist - b.dist)

  if (monstersInRange.length > 0) {
    return tryAttackMonster(state, monstersInRange[0].monster.id)
  }

  return state
}

// ─── Use Item ─────────────────────────────────────────────────────────────────

export function useItem(state: GameState, slotIdx: number): GameState {
  if (!state.player) return state
  const item = state.player.inventory[slotIdx]
  if (!item) return state

  let player = { ...state.player }
  const newInventory = [...player.inventory]

  if (item.type === 'consumable') {
    // Apply stats (HP/MP heal)
    if (item.stats.maxHp) {
      player.hp = Math.min(player.stats.maxHp, player.hp + item.stats.maxHp)
    }
    if (item.stats.maxMp) {
      player.mp = Math.min(player.stats.maxMp, player.mp + item.stats.maxMp)
    }
    // Consume
    if (item.stackable && item.quantity && item.quantity > 1) {
      newInventory[slotIdx] = { ...item, quantity: item.quantity - 1 }
    } else {
      newInventory[slotIdx] = null
    }
    player.inventory = newInventory

    const healDmg: DamageNumber = {
      id: `heal_${Date.now()}`,
      value: item.stats.maxHp || item.stats.maxMp || 0,
      x: player.position.x + 16,
      y: player.position.y - 16,
      timer: 60,
      type: 'heal',
    }
    return { ...state, player, damageNumbers: [...state.damageNumbers, healDmg] }
  }

  if (['weapon', 'armor', 'helmet', 'boots', 'ring'].includes(item.type)) {
    const slot = item.type as 'weapon' | 'armor' | 'helmet' | 'boots' | 'ring'
    const current = player.equipment[slot]
    const newEquipment = { ...player.equipment, [slot]: item }
    newInventory[slotIdx] = current
    player = { ...player, equipment: newEquipment, inventory: newInventory }
    player.stats = recalcStats(player)
    return { ...state, player }
  }

  return state
}

// ─── Change Map ───────────────────────────────────────────────────────────────

export function changeMap(state: GameState, mapId: string): GameState {
  const newMap = generateMap(mapId)
  const spawn = newMap.spawnPoints[0] || { x: 96, y: 96 }
  return {
    ...state,
    currentMap: newMap,
    player: state.player ? { ...state.player, position: { x: spawn.x, y: spawn.y } } : null,
    camera: { x: 0, y: 0 },
    damageNumbers: [],
    particles: [],
  }
}

// ─── Save / Load ─────────────────────────────────────────────────────────────

export function saveGame(state: GameState): void {
  if (!state.player) return
  const save = {
    player: state.player,
    mapId: state.currentMap?.id || 'forest',
    version: 1,
  }
  try {
    localStorage.setItem('rucoy_save', JSON.stringify(save))
  } catch {}
}

export function loadGame(): { player: Player; mapId: string } | null {
  try {
    const raw = localStorage.getItem('rucoy_save')
    if (!raw) return null
    const save = JSON.parse(raw)
    if (!save.player || !save.mapId) return null
    return { player: save.player, mapId: save.mapId }
  } catch {
    return null
  }
}
