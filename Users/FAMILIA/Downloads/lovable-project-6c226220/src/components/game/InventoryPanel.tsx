
import type { Player, Item } from '@/lib/game/types'

interface Props {
  player: Player
  onClose: () => void
  onUseItem: (slotIdx: number) => void
}

const RARITY_COLORS: Record<string, string> = {
  common: '#8a9ab0',
  uncommon: '#40cc60',
  rare: '#4080ff',
  epic: '#c040ff',
  legendary: '#ff8c00',
}

const RARITY_LABELS: Record<string, string> = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  epic: 'Epico',
  legendary: 'Lendario',
}

const STAT_LABELS: Record<string, string> = {
  maxHp: 'HP Max',
  maxMp: 'MP Max',
  attack: 'Ataque',
  defense: 'Defesa',
  speed: 'Velocidade',
  critChance: 'Crit %',
  critDamage: 'Crit DMG %',
  magicPower: 'Poder Magico',
  range: 'Alcance',
}

function ItemTooltip({ item }: { item: Item }) {
  return (
    <div
      className="absolute z-50 w-48 p-2 rounded text-xs shadow-xl pointer-events-none"
      style={{
        background: 'rgba(8,10,16,0.98)',
        border: `1px solid ${RARITY_COLORS[item.rarity]}60`,
        boxShadow: `0 0 16px ${RARITY_COLORS[item.rarity]}20, 0 4px 20px rgba(0,0,0,0.8)`,
        bottom: '110%',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <div className="font-bold mb-0.5" style={{ color: RARITY_COLORS[item.rarity] }}>
        {item.name}
      </div>
      <div className="text-muted-foreground mb-1" style={{ color: RARITY_COLORS[item.rarity] + 'aa' }}>
        {RARITY_LABELS[item.rarity]}
      </div>
      <div className="text-foreground/70 mb-1 leading-relaxed">{item.description}</div>
      {Object.entries(item.stats).map(([k, v]) => {
        if (!v || v === 0) return null
        return (
          <div key={k} className="flex justify-between">
            <span className="text-muted-foreground">{STAT_LABELS[k] || k}</span>
            <span className={Number(v) > 0 ? 'text-green-400' : 'text-red-400'}>
              {Number(v) > 0 ? '+' : ''}{v}
            </span>
          </div>
        )
      })}
      {item.stackable && item.quantity && (
        <div className="mt-1 text-muted-foreground">Qtd: {item.quantity}</div>
      )}
      <div className="mt-1 pt-1 border-t border-border/40 text-yellow-400">
        Valor: {item.value} G
      </div>
      <div className="mt-0.5 text-muted-foreground/60 text-[10px]">
        {['weapon','armor','helmet','boots','ring'].includes(item.type) ? 'Clique para equipar' : 'Clique para usar'}
      </div>
    </div>
  )
}

function InventorySlot({
  item,
  slotIdx,
  onUse,
}: {
  item: Item | null
  slotIdx: number
  onUse: (idx: number) => void
}) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => item && onUse(slotIdx)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-11 h-11 rounded flex items-center justify-center text-lg relative transition-all"
        style={{
          background: item ? 'rgba(12,16,26,0.9)' : 'rgba(6,8,14,0.7)',
          border: item
            ? `1px solid ${RARITY_COLORS[item.rarity]}60`
            : '1px solid rgba(42,56,96,0.4)',
          boxShadow: item ? `inset 0 0 8px ${RARITY_COLORS[item.rarity]}15` : 'none',
          cursor: item ? 'pointer' : 'default',
        }}
      >
        {item && (
          <>
            <span className="text-base leading-none">{item.icon}</span>
            {item.stackable && item.quantity && item.quantity > 1 && (
              <span
                className="absolute bottom-0 right-0.5 text-[9px] leading-none font-bold"
                style={{ color: '#f0c040', textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
              >
                {item.quantity}
              </span>
            )}
          </>
        )}
      </button>
      {hovered && item && <ItemTooltip item={item} />}
    </div>
  )
}

import React from 'react'

export default function InventoryPanel({ player, onClose, onUseItem }: Props) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: 30, background: 'rgba(0,0,0,0.65)' }}
    >
      <div
        className="relative rounded-lg p-4 w-[520px] max-h-[85vh] overflow-y-auto"
        style={{
          background: 'rgba(8,10,18,0.98)',
          border: '2px solid #2a3860',
          boxShadow: '0 0 60px rgba(0,0,0,0.9), inset 0 0 40px rgba(20,30,60,0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
          <h2 className="text-lg font-bold gold-text">Inventario</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Ouro: <span className="gold-text font-bold">{player.gold}</span>
            </span>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none w-6 h-6 flex items-center justify-center"
            >
              x
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Left: Equipment slots */}
          <div>
            <h3 className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Equipamento</h3>
            <div className="space-y-1">
              {(['weapon', 'armor', 'helmet', 'boots', 'ring'] as const).map((slot, idx) => {
                const item = player.equipment[slot]
                return (
                  <InventorySlot
                    key={slot}
                    item={item}
                    slotIdx={-(idx + 1)}
                    onUse={() => {}}
                  />
                )
              })}
            </div>

            {/* Stats panel */}
            <div className="mt-3 p-2 rounded" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(42,56,96,0.4)' }}>
              <h3 className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Atributos</h3>
              <div className="space-y-0.5 text-xs">
                {[
                  ['ATK', player.stats.attack],
                  ['DEF', player.stats.defense],
                  ['VEL', player.stats.speed],
                  ['HP Max', player.stats.maxHp],
                  ['MP Max', player.stats.maxMp],
                  ['Crit', `${player.stats.critChance}%`],
                  player.class === 'mage' ? ['Magia', player.stats.magicPower] : null,
                  player.class !== 'knight' ? ['Alcance', player.stats.range] : null,
                ].filter(Boolean).map((row) => row && (
                  <div key={row[0] as string} className="flex justify-between">
                    <span className="text-muted-foreground">{row[0]}</span>
                    <span className="text-foreground font-bold">{row[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="mt-3 p-2 rounded" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(42,56,96,0.4)' }}>
              <h3 className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Habilidades</h3>
              {player.skills.map((sk) => (
                <div key={sk.name} className="mb-2">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-foreground">{sk.name}</span>
                    <span className="text-primary font-bold">Nv.{sk.level}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/60 rounded-sm overflow-hidden">
                    <div
                      className="xp-bar h-full rounded-sm"
                      style={{ width: `${(sk.xp / sk.xpToNext) * 100}%` }}
                    />
                  </div>
                  <div className="text-right text-[10px] text-muted-foreground/50 mt-0.5">
                    {sk.xp}/{sk.xpToNext}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Item grid */}
          <div>
            <h3 className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
              Mochila ({player.inventory.filter(Boolean).length}/30)
            </h3>
            <div className="grid grid-cols-5 gap-1">
              {player.inventory.map((item, idx) => (
                <InventorySlot
                  key={idx}
                  item={item}
                  slotIdx={idx}
                  onUse={onUseItem}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-2">
              Clique em pocoes para usar. Clique em equipamentos para equipar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
