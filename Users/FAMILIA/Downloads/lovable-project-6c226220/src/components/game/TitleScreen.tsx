
import { useState, useEffect, useRef } from 'react'
import type { CharacterClass } from '@/lib/game/types'
import { drawCharacter } from '@/lib/game/sprites'

interface Props {
  onStart: (name: string, cls: CharacterClass) => void
  onLoad: () => boolean
}

const CLASS_INFO: Record<CharacterClass, { label: string; desc: string; stats: string[]; color: string }> = {
  knight: {
    label: 'Cavaleiro',
    desc: 'Guerreiro de combate corpo-a-corpo. Alta defesa e HP, mas lento e de curto alcance.',
    stats: ['HP: +++', 'MP: +', 'Ataque: ++', 'Defesa: +++', 'Velocidade: +'],
    color: '#c0c8d8',
  },
  archer: {
    label: 'Arqueiro',
    desc: 'Especialista em ataques a distancia. Rapido e com alto critico, mas fragil.',
    stats: ['HP: ++', 'MP: ++', 'Ataque: +++', 'Defesa: +', 'Velocidade: +++'],
    color: '#6a8040',
  },
  mage: {
    label: 'Mago',
    desc: 'Mestre das artes arcanas. Poder magico devastador, mas HP e defesa baixissimos.',
    stats: ['HP: +', 'MP: +++', 'Magia: +++', 'Defesa: +', 'Alcance: +++'],
    color: '#9040d0',
  },
  necromancer: {
    label: 'Necromante',
    desc: 'Senhor dos mortos. Invoca minions para lutar e drena a vida dos inimigos.',
    stats: ['HP: ++', 'MP: +++', 'Magia: +++', 'Invocacao: +++', 'Defesa: ++'],
    color: '#7a30b0',
  },
}

function ClassPreview({ cls, tick }: { cls: CharacterClass; tick: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, 64, 64)
    drawCharacter(ctx, cls, 'down', true, false, tick, 0, 0, 2)
  }, [cls, tick])

  return (
    <canvas
      ref={canvasRef}
      width={64}
      height={64}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

export default function TitleScreen({ onStart, onLoad }: Props) {
  const [name, setName] = useState('')
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('knight')
  const [screen, setScreen] = useState<'title' | 'create'>('title')
  const [tick, setTick] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 50)
    return () => clearInterval(id)
  }, [])

  // Background canvas
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = bgCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#060810'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Stars
    for (let i = 0; i < 120; i++) {
      const sx = ((i * 137.5 + tick * 0.1) % canvas.width)
      const sy = ((i * 97.3) % canvas.height)
      const brightness = 0.3 + Math.sin(tick * 0.05 + i) * 0.2
      ctx.fillStyle = `rgba(200,210,255,${brightness})`
      ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1)
    }

    // Distant mountains
    ctx.fillStyle = '#0e1428'
    const mPoints = [[0,340],[80,280],[180,310],[260,260],[360,295],[450,255],[540,290],[640,260],[720,285],[800,270],[800,400],[0,400]]
    ctx.beginPath()
    mPoints.forEach(([mx,my], i) => i === 0 ? ctx.moveTo(mx,my) : ctx.lineTo(mx,my))
    ctx.closePath()
    ctx.fill()

    // Closer mountains
    ctx.fillStyle = '#0a1020'
    const m2 = [[0,370],[60,330],[140,355],[220,320],[300,348],[380,315],[460,345],[540,318],[620,352],[700,325],[800,350],[800,400],[0,400]]
    ctx.beginPath()
    m2.forEach(([mx,my], i) => i === 0 ? ctx.moveTo(mx,my) : ctx.lineTo(mx,my))
    ctx.closePath()
    ctx.fill()

    // Moon glow
    const moonGlow = Math.sin(tick * 0.02) * 0.1 + 0.8
    ctx.fillStyle = `rgba(180,200,255,${moonGlow * 0.08})`
    ctx.beginPath(); ctx.arc(650, 80, 60, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = `rgba(210,225,255,${moonGlow * 0.15})`
    ctx.beginPath(); ctx.arc(650, 80, 35, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = `rgba(240,245,255,${moonGlow * 0.9})`
    ctx.beginPath(); ctx.arc(650, 80, 22, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'rgba(200,220,255,0.15)'
    ctx.beginPath(); ctx.arc(650, 80, 20, 0, Math.PI * 2); ctx.fill()

    // Title glow
    const titleGlow = Math.sin(tick * 0.04) * 0.3 + 0.7
    ctx.fillStyle = `rgba(201,149,42,${titleGlow * 0.06})`
    ctx.beginPath(); ctx.arc(400, 160, 180, 0, Math.PI * 2); ctx.fill()
  }, [tick])

  const handleStart = () => {
    if (!name.trim()) {
      setError('Digite um nome para o seu personagem.')
      return
    }
    if (name.trim().length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres.')
      return
    }
    onStart(name.trim(), selectedClass)
  }

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#060810' }}>
      <canvas
        ref={bgCanvasRef}
        width={800}
        height={400}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'pixelated', objectFit: 'cover' }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-start pt-8 px-4">
        {/* Title */}
        <div className="text-center mb-6">
          <h1
            className="text-6xl font-bold tracking-widest glow-gold"
            style={{
              fontFamily: 'serif',
              color: '#f0c040',
              textShadow: '0 0 30px rgba(240,192,64,0.6), 0 0 60px rgba(240,192,64,0.3), 0 4px 8px rgba(0,0,0,0.8)',
              letterSpacing: '0.15em',
            }}
          >
            RUCOY
          </h1>
          <h2
            className="text-2xl tracking-[0.4em] mt-1"
            style={{
              color: '#c8a060',
              textShadow: '0 0 15px rgba(200,160,96,0.5)',
              fontFamily: 'serif',
            }}
          >
            OFFLINE
          </h2>
          <p className="text-muted-foreground text-sm mt-2 tracking-wide">
            RPG de Fantasia — Aventura Offline
          </p>
        </div>

        {screen === 'title' ? (
          <div className="flex flex-col items-center gap-3 mt-4">
            <button
              onClick={() => setScreen('create')}
              className="w-56 py-3 text-lg font-bold rounded transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(201,149,42,0.2), rgba(201,149,42,0.1))',
                border: '2px solid #c9952a',
                color: '#f0c040',
                textShadow: '0 0 10px rgba(240,192,64,0.5)',
                boxShadow: '0 0 20px rgba(201,149,42,0.2)',
                fontFamily: 'serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(201,149,42,0.35), rgba(201,149,42,0.2))'
                e.currentTarget.style.boxShadow = '0 0 30px rgba(201,149,42,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(201,149,42,0.2), rgba(201,149,42,0.1))'
                e.currentTarget.style.boxShadow = '0 0 20px rgba(201,149,42,0.2)'
              }}
            >
              Novo Personagem
            </button>

            <button
              onClick={() => {
                const ok = onLoad()
                if (!ok) setError('Nenhum save encontrado.')
              }}
              className="w-56 py-3 text-lg font-bold rounded transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(42,74,138,0.2), rgba(42,74,138,0.1))',
                border: '2px solid #2a4a8a',
                color: '#80a0e0',
                fontFamily: 'serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(42,74,138,0.35), rgba(42,74,138,0.2))'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(42,74,138,0.2), rgba(42,74,138,0.1))'
              }}
            >
              Continuar
            </button>

            {error && (
              <p className="text-red-400 text-sm mt-1">{error}</p>
            )}

            <div className="mt-6 text-muted-foreground/50 text-xs text-center space-y-1">
              <p>WASD ou Setas para mover</p>
              <p>Clique nos inimigos para atacar</p>
              <p>Auto-ataque ao aproximar</p>
            </div>
          </div>
        ) : (
          <div
            className="rounded-lg p-5 w-full max-w-xl"
            style={{
              background: 'rgba(8,10,18,0.95)',
              border: '2px solid #2a3860',
              boxShadow: '0 0 60px rgba(0,0,0,0.9)',
            }}
          >
            <h3 className="text-lg font-bold gold-text mb-4 text-center">Criar Personagem</h3>

            {/* Name input */}
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-1">Nome do Personagem</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError('') }}
                maxLength={20}
                placeholder="Digite seu nome..."
                className="w-full px-3 py-2 rounded text-sm outline-none"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  border: '1px solid #2a3860',
                  color: '#e8d9b5',
                  fontFamily: 'monospace',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>

            {/* Class selection */}
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-2">Escolha sua Classe</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(CLASS_INFO) as CharacterClass[]).map((cls) => {
                  const info = CLASS_INFO[cls]
                  const isSelected = selectedClass === cls
                  return (
                    <button
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      className="relative p-3 rounded flex flex-col items-center gap-2 transition-all"
                      style={{
                        background: isSelected ? `${info.color}20` : 'rgba(0,0,0,0.5)',
                        border: `2px solid ${isSelected ? info.color : '#2a3060'}`,
                        boxShadow: isSelected ? `0 0 16px ${info.color}30` : 'none',
                      }}
                    >
                      <ClassPreview cls={cls} tick={tick} />
                      <span
                        className="text-sm font-bold"
                        style={{ color: isSelected ? info.color : '#8a9ab0' }}
                      >
                        {info.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Class description */}
              <div
                className="mt-3 p-3 rounded text-xs"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: `1px solid ${CLASS_INFO[selectedClass].color}40`,
                }}
              >
                <p className="text-foreground/80 mb-2">{CLASS_INFO[selectedClass].desc}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {CLASS_INFO[selectedClass].stats.map((s) => (
                    <span key={s} className="text-muted-foreground">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => { setScreen('title'); setError('') }}
                className="flex-1 py-2 rounded text-sm text-muted-foreground transition-all"
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #2a3060' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4a5090'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a3060'}
              >
                Voltar
              </button>
              <button
                onClick={handleStart}
                className="flex-1 py-2 rounded text-sm font-bold transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,149,42,0.25), rgba(201,149,42,0.1))',
                  border: '2px solid #c9952a',
                  color: '#f0c040',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,149,42,0.35)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(201,149,42,0.25), rgba(201,149,42,0.1))' }}
              >
                Comecar Aventura
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
