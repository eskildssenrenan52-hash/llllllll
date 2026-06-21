
import { useEffect, useRef, useCallback } from 'react'
import type { GameState } from '@/lib/game/types'
import { drawTile, drawCharacter, drawMonster, drawMinion, drawProjectile, drawAreaEffect } from '@/lib/game/sprites'

const TILE = 32

interface Props {
  gameState: GameState
  onCanvasClick: (worldX: number, worldY: number) => void
}

export default function GameCanvas({ gameState, onCanvasClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { currentMap, player, camera, tick, damageNumbers, particles, minions, projectiles, areaEffects } = gameState
    if (!currentMap || !player) return

    // Clear
    ctx.fillStyle = '#080a0e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(-camera.x, -camera.y)

    // ── Render tiles ──────────────────────────────────────────────────────────
    const startX = Math.floor(camera.x / TILE)
    const startY = Math.floor(camera.y / TILE)
    const endX = Math.min(currentMap.width, startX + Math.ceil(canvas.width / TILE) + 2)
    const endY = Math.min(currentMap.height, startY + Math.ceil(canvas.height / TILE) + 2)

    for (let ty = startY; ty < endY; ty++) {
      for (let tx = startX; tx < endX; tx++) {
        const tile = currentMap.tiles[ty]?.[tx]
        if (!tile) continue
        drawTile(ctx, tile.type, tx * TILE, ty * TILE, tick)
      }
    }

    // ── Render monsters ───────────────────────────────────────────────────────
    for (const monster of currentMap.monsters) {
      if (monster.isDead && monster.deathTimer <= 0) continue
      const mx = monster.position.x
      const my = monster.position.y

      // Cull off-screen
      if (
        mx + 64 < camera.x || mx > camera.x + canvas.width ||
        my + 64 < camera.y || my > camera.y + canvas.height
      ) continue

      const alpha = monster.isDead ? Math.max(0, monster.deathTimer / 80) : 1
      ctx.globalAlpha = alpha

      drawMonster(ctx, monster.type, monster.direction, monster.isMoving, monster.isAttacking, monster.animFrame, mx, my, 1)

      // Health bar (only if damaged)
      if (!monster.isDead && monster.hp < monster.maxHp) {
        const barW = 32
        const barH = 4
        const bx = mx
        const by = my - 10
        ctx.fillStyle = 'rgba(0,0,0,0.7)'
        ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2)
        ctx.fillStyle = '#3a0000'
        ctx.fillRect(bx, by, barW, barH)
        ctx.fillStyle = '#e03030'
        ctx.fillRect(bx, by, Math.round(barW * (monster.hp / monster.maxHp)), barH)
        ctx.fillStyle = 'rgba(255,80,80,0.5)'
        ctx.fillRect(bx, by, 3, barH)
      }

      // Name tag (on hover)
      if (gameState.hoveredMonster?.id === monster.id && !monster.isDead) {
        ctx.fillStyle = 'rgba(0,0,0,0.75)'
        ctx.fillRect(mx - 20, my - 26, 72, 14)
        ctx.fillStyle = '#e8d9b5'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`${monster.name} Lv${monster.level}`, mx + 16, my - 15)
        ctx.textAlign = 'left'
      }

      ctx.globalAlpha = 1
    }

    // ── Render minions ──────────────────────────────────────────────────────
    for (const minion of minions) {
      const mx = minion.position.x
      const my = minion.position.y
      if (
        mx + 64 < camera.x || mx > camera.x + canvas.width ||
        my + 64 < camera.y || my > camera.y + canvas.height
      ) continue

      // Esmaece quando perto de expirar
      ctx.globalAlpha = minion.lifespan < 120 ? Math.max(0.3, (minion.lifespan % 30) / 30) : 1
      drawMinion(ctx, minion.type, minion.direction, minion.isMoving, minion.isAttacking, minion.animFrame, mx, my, 0.85)
      ctx.globalAlpha = 1

      // Barra de vida do minion
      if (minion.hp < minion.maxHp) {
        const barW = 24
        ctx.fillStyle = 'rgba(0,0,0,0.7)'
        ctx.fillRect(mx + 2, my - 6, barW + 2, 4)
        ctx.fillStyle = '#80ff90'
        ctx.fillRect(mx + 3, my - 5, Math.round(barW * (minion.hp / minion.maxHp)), 2)
      }
    }

    // ── Render player ─────────────────────────────────────────────────────────
    const px = player.position.x
    const py = player.position.y

    // Player shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.beginPath()
    ctx.ellipse(px + 16, py + 30, 10, 4, 0, 0, Math.PI * 2)
    ctx.fill()

    drawCharacter(
      ctx,
      player.class,
      player.direction,
      player.isMoving,
      player.isAttacking,
      tick,
      px, py,
      1,
    )

    // Player name tag
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(px - 14, py - 20, 60, 13)
    ctx.fillStyle = '#f0c040'
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(player.name, px + 16, py - 9)
    ctx.textAlign = 'left'

    // ── Area effects (atras dos projeteis) ─────────────────────────────────────
    for (const fx of areaEffects) {
      drawAreaEffect(ctx, fx)
    }

    // ── Projectiles ─────────────────────────────────────────────────────────────
    for (const proj of projectiles) {
      if (
        proj.x + 32 < camera.x || proj.x > camera.x + canvas.width ||
        proj.y + 32 < camera.y || proj.y > camera.y + canvas.height
      ) continue
      drawProjectile(ctx, proj, tick)
    }

    // ── Particles ─────────────────────────────────────────────────────────────
    for (const p of particles) {
      const lifeRatio = p.life / p.maxLife
      ctx.globalAlpha = lifeRatio
      ctx.fillStyle = p.color
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
    }
    ctx.globalAlpha = 1

    // ── Damage numbers ────────────────────────────────────────────────────────
    for (const d of damageNumbers) {
      const lifeRatio = d.timer / 60
      const floatY = (1 - lifeRatio) * 30
      ctx.globalAlpha = lifeRatio

      let color = '#ffffff'
      let fontSize = 13
      if (d.type === 'crit') { color = '#ffcc00'; fontSize = 17 }
      else if (d.type === 'magic') { color = '#80a0ff' }
      else if (d.type === 'heal') { color = '#40ff80'; fontSize = 14 }
      else if (d.type === 'physical') { color = '#ff6060' }

      ctx.font = `bold ${fontSize}px monospace`
      ctx.strokeStyle = 'rgba(0,0,0,0.8)'
      ctx.lineWidth = 3
      ctx.textAlign = 'center'
      ctx.strokeText(d.type === 'crit' ? `CRIT! ${d.value}` : `${d.value}`, d.x, d.y - floatY)
      ctx.fillStyle = color
      ctx.fillText(d.type === 'crit' ? `CRIT! ${d.value}` : `${d.value}`, d.x, d.y - floatY)
      ctx.textAlign = 'left'
    }
    ctx.globalAlpha = 1

    ctx.restore()

    // ── Map name overlay (fades in) ────────────────────────────────────────────
    if (tick < 180) {
      const fade = Math.min(1, tick / 40) * (1 - Math.max(0, (tick - 140) / 40))
      ctx.globalAlpha = fade
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(canvas.width / 2 - 140, canvas.height / 2 - 24, 280, 40)
      ctx.fillStyle = '#f0c040'
      ctx.font = 'bold 20px serif'
      ctx.textAlign = 'center'
      ctx.fillText(currentMap.name, canvas.width / 2, canvas.height / 2 + 2)
      ctx.textAlign = 'left'
      ctx.globalAlpha = 1
    }
  }, [gameState])

  useEffect(() => {
    render()
  }, [render])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (e.clientX - rect.left) * scaleX
    const cy = (e.clientY - rect.top) * scaleY
    const worldX = cx + gameState.camera.x
    const worldY = cy + gameState.camera.y
    onCanvasClick(worldX, worldY)
  }, [gameState.camera, onCanvasClick])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (e.clientX - rect.left) * scaleX
    const cy = (e.clientY - rect.top) * scaleY
    const worldX = cx + gameState.camera.x
    const worldY = cy + gameState.camera.y

    // Update cursor for monsters
    const { currentMap } = gameState
    if (currentMap) {
      const hovered = currentMap.monsters.find(m => {
        if (m.isDead) return false
        return worldX >= m.position.x && worldX <= m.position.x + 32 &&
               worldY >= m.position.y && worldY <= m.position.y + 32
      })
      canvas.style.cursor = hovered ? 'crosshair' : 'default'
    }
  }, [gameState])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={540}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      className="block w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
