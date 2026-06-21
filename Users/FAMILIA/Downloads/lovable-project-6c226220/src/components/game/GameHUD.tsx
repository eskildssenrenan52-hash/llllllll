
import type { Player, GameMap, GameNotification, ChatMessage } from '@/lib/game/types'

interface Props {
  player: Player
  currentMap: GameMap
  notifications: GameNotification[]
  chatMessages: ChatMessage[]
  onOpenInventory: () => void
  onMapChange: (mapId: string) => void
  onSave: () => void
}

const CLASS_LABELS: Record<string, string> = {
  knight: 'Cavaleiro',
  archer: 'Arqueiro',
  mage: 'Mago',
}

const MAP_LIST = [
  { id: 'forest', name: 'Floresta', minLvl: 1 },
  { id: 'dungeon', name: 'Masmorra', minLvl: 5 },
  { id: 'desert', name: 'Deserto', minLvl: 8 },
  { id: 'swamp', name: 'Pantano', minLvl: 15 },
]

const MSG_COLORS: Record<string, string> = {
  system: '#8a9ab0',
  loot: '#f0c040',
  level: '#40ff80',
  combat: '#ff8060',
  info: '#c8c0b0',
}

export default function GameHUD({
  player,
  currentMap,
  notifications,
  chatMessages,
  onOpenInventory,
  onMapChange,
  onSave,
}: Props) {
  const hpPct = Math.max(0, Math.min(100, (player.hp / player.stats.maxHp) * 100))
  const mpPct = Math.max(0, Math.min(100, (player.mp / player.stats.maxMp) * 100))
  const xpPct = Math.max(0, Math.min(100, (player.xp / player.xpToNext) * 100))

  return (
    <>
      {/* Top-left: Player stats */}
      <div
        className="absolute top-2 left-2 w-56 select-none pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <div className="game-panel-ornate relative rounded p-3 text-xs">
          {/* Name + class + level */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm gold-text truncate">{player.name}</span>
            <span className="text-muted-foreground ml-1">{CLASS_LABELS[player.class]}</span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-muted-foreground">Nv.</span>
            <span className="font-bold text-primary">{player.level}</span>
            <span className="ml-2 text-muted-foreground">
              {player.gold}
              <span className="gold-text"> G</span>
            </span>
          </div>

          {/* HP Bar */}
          <div className="mb-1">
            <div className="flex justify-between mb-0.5">
              <span className="text-red-400 font-bold">HP</span>
              <span className="text-muted-foreground">{player.hp}/{player.stats.maxHp}</span>
            </div>
            <div className="w-full h-3 bg-black/60 rounded-sm border border-red-900/50 overflow-hidden">
              <div
                className="hp-bar h-full rounded-sm transition-all duration-100"
                style={{ width: `${hpPct}%` }}
              />
            </div>
          </div>

          {/* MP Bar */}
          <div className="mb-1">
            <div className="flex justify-between mb-0.5">
              <span className="text-blue-400 font-bold">MP</span>
              <span className="text-muted-foreground">{player.mp}/{player.stats.maxMp}</span>
            </div>
            <div className="w-full h-3 bg-black/60 rounded-sm border border-blue-900/50 overflow-hidden">
              <div
                className="mp-bar h-full rounded-sm transition-all duration-100"
                style={{ width: `${mpPct}%` }}
              />
            </div>
          </div>

          {/* XP Bar */}
          <div>
            <div className="flex justify-between mb-0.5">
              <span className="text-yellow-400 font-bold">XP</span>
              <span className="text-muted-foreground">{player.xp}/{player.xpToNext}</span>
            </div>
            <div className="w-full h-2 bg-black/60 rounded-sm border border-yellow-900/50 overflow-hidden">
              <div
                className="xp-bar h-full rounded-sm transition-all duration-100"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>

          {/* Skills */}
          <div className="mt-2 border-t border-border/40 pt-2">
            {player.skills.map((sk) => (
              <div key={sk.name} className="flex items-center gap-1 mb-0.5">
                <span className="text-muted-foreground w-14 truncate">{sk.name}</span>
                <span className="text-primary font-bold w-5 text-center">{sk.level}</span>
                <div className="flex-1 h-1.5 bg-black/60 rounded-sm overflow-hidden">
                  <div
                    className="xp-bar h-full rounded-sm"
                    style={{ width: `${(sk.xp / sk.xpToNext) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top-right: Map info + buttons */}
      <div
        className="absolute top-2 right-2 flex flex-col gap-1 items-end select-none"
        style={{ zIndex: 10 }}
      >
        <div className="game-panel-ornate relative rounded px-3 py-1.5 text-xs pointer-events-none">
          <span className="text-muted-foreground mr-1">Mapa:</span>
          <span className="text-primary font-bold">{currentMap.name}</span>
        </div>

        {/* Map navigation */}
        <div className="game-panel-ornate relative rounded p-1.5 flex flex-col gap-1 pointer-events-auto">
          <div className="text-xs text-muted-foreground px-1 mb-0.5">Mundos</div>
          {MAP_LIST.map((m) => (
            <button
              key={m.id}
              onClick={() => onMapChange(m.id)}
              disabled={player.level < m.minLvl}
              className={[
                'text-xs px-2 py-1 rounded transition-all border text-left',
                currentMap.id === m.id
                  ? 'border-primary bg-primary/20 text-primary'
                  : player.level < m.minLvl
                    ? 'border-border/30 text-muted-foreground/40 cursor-not-allowed'
                    : 'border-border/50 text-foreground hover:border-primary/50 hover:bg-primary/10',
              ].join(' ')}
            >
              {m.name}
              {player.level < m.minLvl && (
                <span className="ml-1 text-muted-foreground/50">Nv.{m.minLvl}</span>
              )}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-1 pointer-events-auto">
          <button
            onClick={onOpenInventory}
            className="game-panel-ornate relative rounded px-2 py-1 text-xs text-foreground hover:text-primary transition-colors border border-border/50 hover:border-primary/50"
          >
            Inventario [I]
          </button>
          <button
            onClick={onSave}
            className="game-panel-ornate relative rounded px-2 py-1 text-xs text-foreground hover:text-green-400 transition-colors border border-border/50 hover:border-green-500/50"
          >
            Salvar
          </button>
        </div>
      </div>

      {/* Bottom: Equipment slots */}
      <div
        className="absolute bottom-16 left-2 flex gap-1 select-none pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {(['weapon', 'armor', 'helmet', 'boots', 'ring'] as const).map((slot) => {
          const item = player.equipment[slot]
          const rarityColors: Record<string, string> = {
            common: '#8a9ab0',
            uncommon: '#40cc60',
            rare: '#4080ff',
            epic: '#c040ff',
            legendary: '#ff8c00',
          }
          return (
            <div
              key={slot}
              className="relative w-10 h-10 rounded border flex items-center justify-center text-lg"
              style={{
                background: 'rgba(8,10,16,0.9)',
                borderColor: item ? rarityColors[item.rarity] + '80' : '#2a3060',
                boxShadow: item ? `0 0 6px ${rarityColors[item.rarity]}40` : 'none',
              }}
              title={item ? `${item.name}\n${item.description}` : slot}
            >
              {item ? (
                <span className="text-base leading-none">{item.icon}</span>
              ) : (
                <span className="text-muted-foreground/30 text-xs">{slot[0].toUpperCase()}</span>
              )}
              <span
                className="absolute bottom-0 left-0 right-0 text-center text-[8px] leading-none pb-0.5 text-muted-foreground/50"
              >
                {slot[0].toUpperCase()}
              </span>
            </div>
          )
        })}
      </div>

      {/* Bottom-center: Combat log */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-72 pointer-events-none select-none"
        style={{ zIndex: 10 }}
      >
        <div
          className="rounded p-2 text-xs space-y-0.5"
          style={{ background: 'rgba(5,7,12,0.75)', border: '1px solid rgba(42,56,96,0.4)' }}
        >
          {chatMessages.slice(-5).map((msg) => (
            <div key={msg.id} style={{ color: MSG_COLORS[msg.type] || '#c8c0b0' }} className="truncate">
              {msg.text}
            </div>
          ))}
        </div>
      </div>

      {/* Controls hint */}
      <div
        className="absolute bottom-2 right-2 text-xs text-muted-foreground/50 select-none pointer-events-none text-right"
        style={{ zIndex: 10 }}
      >
        <div>WASD / Setas: Mover</div>
        <div>Clique no inimigo: Atacar</div>
        <div>I: Inventario</div>
      </div>

      {/* Notifications */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none select-none"
        style={{ zIndex: 20 }}
      >
        {notifications.map((n) => {
          const colors: Record<string, string> = {
            level: '#40ff80',
            item: '#f0c040',
            skill: '#60a0ff',
            achievement: '#ff8c00',
          }
          return (
            <div
              key={n.id}
              className="px-6 py-2 rounded text-sm font-bold text-center"
              style={{
                color: colors[n.type] || '#e8d9b5',
                textShadow: `0 0 16px ${colors[n.type] || '#e8d9b5'}`,
                background: 'rgba(0,0,0,0.6)',
                border: `1px solid ${colors[n.type] || '#e8d9b5'}40`,
                opacity: Math.min(1, n.timer / 30),
              }}
            >
              {n.text}
            </div>
          )
        })}
      </div>
    </>
  )
}
