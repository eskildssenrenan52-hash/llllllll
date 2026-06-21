
import { useEffect, useRef, useCallback, useState } from 'react'
import type { GameState, CharacterClass, GameScreen, EditorState, GameMap } from '@/lib/game/types'
import {
  movePlayer,
  updateMonsterAI,
  updateMinions,
  updateProjectiles,
  updateAreaEffects,
  tickUpdate,
  tryAutoAttack,
  tryAttackMonster,
  castAbility,
  switchClass,
  useItem,
  changeMap,
  saveGame,
  loadGame,
} from '@/lib/game/engine'
import { createPlayer, generateMap } from '@/lib/game/data'
import GameCanvas from './GameCanvas'
import GameHUD from './GameHUD'
import InventoryPanel from './InventoryPanel'
import TitleScreen from './TitleScreen'
import WorldEditor from './WorldEditor'
import AbilityBar from './AbilityBar'
import ClassSwitcher from './ClassSwitcher'

// ─── Estado inicial do editor ──────────────────────────────────────────────

function buildInitialEditorState(): EditorState {
  return {
    isOpen: false,
    activeTool: 'paint',
    selectedTile: 'grass',
    selectedMonsterType: 'slime',
    selectedMonsterLevel: 1,
    brushSize: 1,
    showGrid: true,
    showCollisions: false,
    showMonsters: true,
    showSpawns: true,
    mapName: '',
    history: [],
    historyIndex: -1,
    selectionStart: null,
    selectionEnd: null,
  }
}

function buildInitialState(playerName: string, cls: CharacterClass, mapId = 'forest'): GameState {
  const map = generateMap(mapId)
  const spawn = map.spawnPoints[0] || { x: 160, y: 160 }
  const player = createPlayer(playerName, cls)
  player.position = { ...spawn }
  return {
    screen: 'playing',
    player,
    currentMap: map,
    camera: { x: 0, y: 0 },
    tick: 0,
    damageNumbers: [],
    particles: [],
    minions: [],
    projectiles: [],
    areaEffects: [],
    chatMessages: [
      { id: 'start', text: 'Bem-vindo ao Rucoy Offline! Use WASD para mover.', type: 'system', timestamp: Date.now() },
      { id: 'tip', text: 'Aproxime-se de inimigos para atacar automaticamente.', type: 'info', timestamp: Date.now() },
      { id: 'editor_tip', text: 'Pressione F2 ou clique em EDITOR para abrir o Editor de Mundo.', type: 'info', timestamp: Date.now() },
    ],
    notifications: [],
    selectedItem: null,
    hoveredMonster: null,
    mousePos: { x: 0, y: 0 },
    isPaused: false,
    editorOpen: false,
    editorState: buildInitialEditorState(),
  }
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    screen: 'title',
    player: null,
    currentMap: null,
    camera: { x: 0, y: 0 },
    tick: 0,
    damageNumbers: [],
    particles: [],
    minions: [],
    projectiles: [],
    areaEffects: [],
    chatMessages: [],
    notifications: [],
    selectedItem: null,
    hoveredMonster: null,
    mousePos: { x: 0, y: 0 },
    isPaused: false,
    editorOpen: false,
    editorState: buildInitialEditorState(),
  })

  const [showInventory, setShowInventory] = useState(false)
  const keysRef = useRef<Set<string>>(new Set())
  const rafRef = useRef<number>(0)
  const stateRef = useRef(gameState)
  stateRef.current = gameState

  // ── Game loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState.screen !== 'playing') return

    let lastTime = performance.now()

    const loop = (now: number) => {
      const dt = now - lastTime
      lastTime = now

      if (dt < 100) {
        setGameState((prev) => {
          if (prev.screen !== 'playing' || prev.isPaused || prev.editorOpen) return prev
          let s = tickUpdate(prev)
          s = movePlayer(s, keysRef.current)
          s = updateMonsterAI(s)
          s = updateMinions(s)
          s = updateProjectiles(s)
          s = updateAreaEffects(s)
          s = tryAutoAttack(s)

          if (s.player && s.player.hp <= 0) {
            return {
              ...s,
              screen: 'dead' as GameScreen,
              notifications: [
                ...s.notifications,
                { id: `dead_${Date.now()}`, text: 'Voce foi derrotado!', type: 'level', timer: 300 },
              ],
            }
          }

          return s
        })
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [gameState.screen])

  // ── Keyboard input ────────────────────────────────────────────────────────
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)

      // F2 — toggle editor
      if (e.code === 'F2') {
        e.preventDefault()
        setGameState((prev) => {
          if (!prev.currentMap || prev.screen !== 'playing') return prev
          const isOpen = !prev.editorOpen
          return {
            ...prev,
            editorOpen: isOpen,
            isPaused: isOpen,
            chatMessages: [
              ...prev.chatMessages,
              {
                id: `ed_${Date.now()}`,
                text: isOpen
                  ? 'Editor de Mundo aberto. Jogo pausado.'
                  : 'Editor fechado. Alteracoes aplicadas ao mapa.',
                type: 'system',
                timestamp: Date.now(),
              },
            ],
          }
        })
        return
      }

      if (e.code === 'KeyI' && !stateRef.current.editorOpen) {
        setShowInventory((v) => !v)
        e.preventDefault()
      }
      // Ability hotkeys 1-4
      if (!stateRef.current.editorOpen && !stateRef.current.isPaused) {
        const slotMatch = /^Digit([1-4])$/.exec(e.code)
        if (slotMatch) {
          const slot = parseInt(slotMatch[1], 10) - 1
          setGameState((prev) => castAbility(prev, slot))
          e.preventDefault()
          return
        }
      }
      if (e.code === 'Escape') {
        setShowInventory(false)
      }
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        if (!stateRef.current.editorOpen) e.preventDefault()
      }
    }
    const onUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  // ── Handlers do jogo ──────────────────────────────────────────────────────
  const handleStart = useCallback((name: string, cls: CharacterClass) => {
    setGameState(buildInitialState(name, cls))
    setShowInventory(false)
  }, [])

  const handleLoad = useCallback((): boolean => {
    const save = loadGame()
    if (!save) return false
    const map = generateMap(save.mapId)
    setGameState({
      screen: 'playing',
      player: save.player,
      currentMap: map,
      camera: { x: 0, y: 0 },
      tick: 0,
      damageNumbers: [],
      particles: [],
      minions: [],
      projectiles: [],
      areaEffects: [],
      chatMessages: [
        { id: 'load', text: 'Jogo carregado! Bem-vindo de volta.', type: 'system', timestamp: Date.now() },
        { id: 'editor_tip2', text: 'Pressione F2 para abrir o Editor de Mundo.', type: 'info', timestamp: Date.now() },
      ],
      notifications: [],
      selectedItem: null,
      hoveredMonster: null,
      mousePos: { x: 0, y: 0 },
      isPaused: false,
      editorOpen: false,
      editorState: buildInitialEditorState(),
    })
    setShowInventory(false)
    return true
  }, [])

  const handleCanvasClick = useCallback((worldX: number, worldY: number) => {
    setGameState((prev) => {
      if (!prev.currentMap || prev.editorOpen) return prev
      const monster = prev.currentMap.monsters.find((m) => {
        if (m.isDead) return false
        return worldX >= m.position.x - 8 && worldX <= m.position.x + 40 &&
               worldY >= m.position.y - 8 && worldY <= m.position.y + 40
      })
      if (monster) return tryAttackMonster(prev, monster.id)
      return prev
    })
  }, [])

  const handleMapChange = useCallback((mapId: string) => {
    setGameState((prev) => {
      if (!prev.player) return prev
      if (prev.currentMap?.id === mapId) return prev
      const newState = changeMap(prev, mapId)
      return {
        ...newState,
        chatMessages: [
          ...prev.chatMessages,
          { id: `map_${Date.now()}`, text: `Viajando para: ${newState.currentMap?.name}...`, type: 'system', timestamp: Date.now() },
        ],
        tick: 0,
        editorState: buildInitialEditorState(),
      }
    })
  }, [])

  const handleSave = useCallback(() => {
    const state = stateRef.current
    saveGame(state)
    setGameState((prev) => ({
      ...prev,
      chatMessages: [
        ...prev.chatMessages,
        { id: `save_${Date.now()}`, text: 'Jogo salvo com sucesso!', type: 'system', timestamp: Date.now() },
      ],
      notifications: [
        ...prev.notifications,
        { id: `savenot_${Date.now()}`, text: 'Jogo Salvo!', type: 'item', timer: 120 },
      ],
    }))
  }, [])

  const handleUseItem = useCallback((slotIdx: number) => {
    setGameState((prev) => useItem(prev, slotIdx))
  }, [])

  const handleRespawn = useCallback(() => {
    setGameState((prev) => {
      if (!prev.player) return prev
      const map = generateMap('forest')
      const spawn = map.spawnPoints[0] || { x: 160, y: 160 }
      return {
        ...prev,
        screen: 'playing',
        player: {
          ...prev.player,
          hp: Math.round(prev.player.stats.maxHp * 0.3),
          position: { ...spawn },
        },
        currentMap: map,
        camera: { x: 0, y: 0 },
        damageNumbers: [],
        particles: [],
        chatMessages: [
          { id: `resp_${Date.now()}`, text: 'Voce renasceu na Floresta das Sombras.', type: 'system', timestamp: Date.now() },
        ],
        notifications: [],
        tick: 0,
        editorOpen: false,
        editorState: buildInitialEditorState(),
      }
    })
  }, [])

  // ── Handlers do editor ────────────────────────────────────────────────────

  const handleEditorMapChange = useCallback((updatedMap: GameMap) => {
    setGameState((prev) => ({ ...prev, currentMap: updatedMap }))
  }, [])

  const handleEditorStateChange = useCallback((newEditorState: EditorState) => {
    setGameState((prev) => ({ ...prev, editorState: newEditorState }))
  }, [])

  const handleEditorClose = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      editorOpen: false,
      isPaused: false,
      chatMessages: [
        ...prev.chatMessages,
        {
          id: `ed_done_${Date.now()}`,
          text: 'Editor fechado. Alteracoes aplicadas ao mapa atual.',
          type: 'system',
          timestamp: Date.now(),
        },
      ],
    }))
  }, [])

  const openEditor = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentMap || prev.screen !== 'playing') return prev
      return {
        ...prev,
        editorOpen: true,
        isPaused: true,
        chatMessages: [
          ...prev.chatMessages,
          { id: `ed_open_${Date.now()}`, text: 'Editor de Mundo aberto. Jogo pausado.', type: 'system', timestamp: Date.now() },
        ],
      }
    })
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────
  if (gameState.screen === 'title') {
    return (
      <div className="w-full h-full relative">
        <TitleScreen onStart={handleStart} onLoad={handleLoad} />
      </div>
    )
  }

  const isDead = gameState.screen === 'dead'

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: '#080a0e' }}>

      {/* Editor de Mundo — ocupa a tela inteira quando aberto */}
      {gameState.editorOpen && gameState.currentMap && (
        <WorldEditor
          map={gameState.currentMap}
          editorState={gameState.editorState}
          onEditorStateChange={handleEditorStateChange}
          onMapChange={handleEditorMapChange}
          onClose={handleEditorClose}
        />
      )}

      {/* Canvas do jogo — visível apenas quando editor está fechado */}
      {!gameState.editorOpen && gameState.player && gameState.currentMap && (
        <GameCanvas
          gameState={gameState}
          onCanvasClick={handleCanvasClick}
        />
      )}

      {/* HUD */}
      {!gameState.editorOpen && gameState.player && gameState.currentMap && !isDead && (
        <GameHUD
          player={gameState.player}
          currentMap={gameState.currentMap}
          notifications={gameState.notifications}
          chatMessages={gameState.chatMessages}
          onOpenInventory={() => setShowInventory((v) => !v)}
          onMapChange={handleMapChange}
          onSave={handleSave}
        />
      )}

      {/* Barra de habilidades (bottom-center) */}
      {!gameState.editorOpen && gameState.player && gameState.currentMap && !isDead && (
        <AbilityBar
          player={gameState.player}
          onCast={(slot) => setGameState((prev) => castAbility(prev, slot))}
        />
      )}

      {/* Troca de classe (top-right, abaixo do editor btn) */}
      {!gameState.editorOpen && gameState.player && gameState.currentMap && !isDead && (
        <div style={{ position: 'absolute', top: 8, right: 100, zIndex: 60 }}>
          <ClassSwitcher
            player={gameState.player}
            onSwitch={(cls) => setGameState((prev) => switchClass(prev, cls))}
          />
        </div>
      )}

      {/* Botão flutuante para abrir o editor */}
      {!gameState.editorOpen && gameState.screen === 'playing' && gameState.currentMap && (
        <button
          onClick={openEditor}
          title="Abrir Editor de Mundo (F2)"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 60,
            background: 'rgba(6,9,16,0.92)',
            border: '1px solid #2a3860',
            color: '#c9952a',
            borderRadius: 4,
            padding: '4px 12px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: 1,
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 0 10px rgba(0,0,0,0.6)',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c9952a'; e.currentTarget.style.boxShadow = '0 0 10px rgba(201,149,42,0.3)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a3860'; e.currentTarget.style.boxShadow = '0 0 10px rgba(0,0,0,0.6)' }}
        >
          <span style={{ fontSize: 13 }}>⚒</span>
          <span>EDITOR</span>
          <span style={{ fontSize: 9, color: '#5a7a9a', marginLeft: 2 }}>F2</span>
        </button>
      )}

      {/* Inventário */}
      {showInventory && !gameState.editorOpen && gameState.player && (
        <InventoryPanel
          player={gameState.player}
          onClose={() => setShowInventory(false)}
          onUseItem={(idx) => { handleUseItem(idx) }}
        />
      )}

      {/* Tela de morte */}
      {isDead && !gameState.editorOpen && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ zIndex: 50, background: 'rgba(60,0,0,0.85)' }}
        >
          <div
            className="text-center p-8 rounded-lg"
            style={{
              background: 'rgba(8,4,4,0.95)',
              border: '2px solid #8a1010',
              boxShadow: '0 0 60px rgba(140,16,16,0.4)',
            }}
          >
            <h2
              className="text-4xl font-bold mb-2"
              style={{
                color: '#cc1010',
                textShadow: '0 0 20px rgba(200,16,16,0.8)',
                fontFamily: 'serif',
              }}
            >
              Voce foi Derrotado
            </h2>
            {gameState.player && (
              <p className="text-muted-foreground mb-6 text-sm">
                {gameState.player.name} — Nivel {gameState.player.level} — {gameState.player.gold} Ouro
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRespawn}
                className="px-6 py-3 rounded font-bold transition-all"
                style={{
                  background: 'rgba(140,16,16,0.3)',
                  border: '2px solid #8a1010',
                  color: '#ff6060',
                  fontFamily: 'serif',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(140,16,16,0.5)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(140,16,16,0.3)' }}
              >
                Renascer
              </button>
              <button
                onClick={() => { setGameState((p) => ({ ...p, screen: 'title' })); setShowInventory(false) }}
                className="px-6 py-3 rounded font-bold transition-all"
                style={{
                  background: 'rgba(42,48,80,0.3)',
                  border: '2px solid #2a3060',
                  color: '#8a9ab0',
                  fontFamily: 'serif',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(42,48,80,0.5)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(42,48,80,0.3)' }}
              >
                Menu Principal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
