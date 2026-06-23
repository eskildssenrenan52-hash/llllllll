# 🎮 Guia de Uso - Estilo Rucoy Online

## Novo Layout dos Modais

### Barra Modal (Topo Direito) 📍

A nova barra modal pixelada está localizada no **topo direito** da tela durante o jogo.

**Ícones Disponíveis:**

| Ícone | Nome | Hotkey | Cor | Função |
|-------|------|--------|-----|--------|
| 🗺 | Mundo | M | Azul | Selecionar mundo |
| 🎒 | Inventário | I | Cinza | Ver items |
| 📊 | Status | S | Cyan | Ver stats |
| 📜 | Missões | Q | Dourado | Ver quests |
| 🏆 | Conquistas | A | Roxo | Ver achievements |
| 🌳 | Passivas | P | Azul-claro | Árvore passiva |
| ⚒ | Ferraria | C | Laranja | Crafting |
| ❓ | Ajuda | H | Cinza | Ajuda |
| 💾 | Salvar | G | Verde | Salvar jogo |

### Hotkeys Rápidas

Pressione as teclas abaixo para abrir/fechar modais instantaneamente:

```
M - Mundo (novo modal)
I - Inventário
S - Status
Q - Missões
A - Conquistas
P - Passivas
C - Ferraria
H - Ajuda
G - Salvar
F2 - Editor de Mundo
F9 - Dev Panel
ESC - Fechar todos os modais
```

---

## Modal do Mundo 🗺️

### Como Usar

1. **Abra o modal**: Pressione **M** ou clique no ícone 🗺
2. **Navegue**: Veja o grid de mundos disponíveis
3. **Viaje**: Clique em qualquer mundo desbloqueado

### Informações do Mundo

Cada mundo mostra:
- **Ícone temático**: Identifica o tipo de mundo
- **Nome**: Nome do local
- **Descrição**: Tipo de inimigos e dificuldade
- **Nível Mínimo**: Requerimento de nível
- **Status**: 
  - ✓ AQUI = Você está neste mundo
  - 🔒 BLOQUEADO = Nível insuficiente

### Mundos por Dificuldade

**Iniciantes (Nv 1-5)**
- 🏰 Cidade - Local seguro
- 🌲 Floresta - Primeiras aventuras

**Intermediário (Nv 5-15)**
- 🌳 Floresta Antiga
- 🏚 Masmorra
- 🏜 Deserto
- ❄ Tundra

**Avançado (Nv 15-25)**
- 🌋 Vulcão
- 🌌 Abismo
- 💎 Caverna de Cristal (Andares 1-3)

**Endgame (Nv 20+)**
- 👻 Ruínas Assombradas (Andares 1-3)
- ☁ Reinos do Céu (Andares 1-3)

---

## Sistema de Drops 💎

### Como Funciona

Quando você derrota um inimigo, existe uma chance de ele dropar um item:

**Chance Base por Nível:**
- Nv 1-5: 15-20% chance
- Nv 6-10: 20-25% chance
- Nv 11-15: 25-30% chance
- Nv 16+: até 40% chance

**Modificadores:**
- Champion: 2x chance
- Boss: 3x chance (máx 80%)

### Raridades

```
⚪ Common    - Comum, fraco
🟢 Uncommon  - Incomum, decente
🔵 Rare      - Raro, bom
🟣 Epic      - Épico, muito bom
⭐ Legendary - Lendário, supremo
```

### Tabela de Raridade por Nível

| Nv | Common | Uncommon | Rare | Epic | Lendário |
|----|--------|----------|------|------|----------|
| 1-5 | 75-95% | 5-25% | 0% | 0% | 0% |
| 6-10 | 50-70% | 25-30% | 0-10% | 0% | 0% |
| 11-15 | 38-48% | 24-28% | 22-30% | 2-8% | 0% |
| 16-20 | 25-35% | 18-23% | 32-37% | 10-18% | 0-2% |
| 21+ | 14-22% | 13-17% | 30-38% | 21-29% | 2-10% |

### Requisitos de Item

- **Uncommon**: Inimigo Nv 3+
- **Rare**: Inimigo Nv 8+
- **Epic**: Inimigo Nv 15+
- **Legendary**: Inimigo Nv 22+ E Elite (Champion/Boss)

### Bônus de Stats

Items droppados ganham bônus baseado no nível do inimigo:
- +10% stats por nível acima do base
- Nível do item = Nível do inimigo - 2 (mínimo 1)

**Exemplo:**
- Inimigo Nv 20 droppa arma
- Arma recebe +20% damage
- Nível da arma: 18

---

## Dicas Práticas 💡

### Para Coletar Items Melhores

1. **Aumente seu nível**: Inimigos mais fortes = items melhores
2. **Procure Bosses**: 3x chance de drop, raridades melhores
3. **Explore mundos altos**: Nv 30+ = 50%+ chance de Epic/Legendary
4. **Mate Champions**: 2x chance e pulam raridades comuns

### Para Completar Mundos

1. Comece na Cidade (Nv 1)
2. Grinde na Floresta até Nv 5
3. Desbloqueie Masmorra/Deserto (Nv 5-8)
4. Suba para Vulcão/Cavernas (Nv 15+)
5. Enfrente os Reinos Finais (Nv 25+)

### Organização do Inventário

- **Items Comuns**: Venda ou craftar
- **Items Raros**: Equipe ou guarde
- **Items Épicos**: Prioridade máxima
- **Items Lendários**: Use ou guarde para coleção

---

## Troubleshooting 🔧

### Não consigo ver a barra modal

✅ Verifique se está no jogo (não na tela de título)
✅ A barra está no canto superior direito
✅ Se não aparecer, pressione ESC e tente novamente

### Hotkeys não funcionam

✅ Certifique-se que não tem um modal aberto com input
✅ Pressione ESC para fechar tudo
✅ Tente novamente

### Mundo está bloqueado

✅ Verifique o nível mínimo necessário
✅ Grinde XP matando inimigos
✅ Use Dev Panel (F9) para testar (apenas dev mode)

### Item desapareceu

✅ Verifique se inventário está cheio
✅ Items excedentes caem no chão
✅ Volte ao local e colete-os

---

## Recursos Visuais 🎨

### Cores dos Modais

```css
/* Mundo */
#4080ff - Azul céu

/* Inventário */
#8090b0 - Cinza azulado

/* Status */
#40a0b0 - Cyan aquático

/* Missões */
#c0a030 - Dourado

/* Conquistas */
#9060d0 - Roxo místico

/* Passivas */
#4080c0 - Azul real

/* Ferraria */
#c06020 - Laranja queimado

/* Ajuda */
#607080 - Cinza neutro

/* Salvar */
#406040 - Verde floresta
```

### Efeitos Visuais

- **Glow**: Ativo quando modal aberto
- **Hover**: Brilho suave ao passar mouse
- **Click**: Feedback visual de clique
- **Transition**: Animação suave 150ms

---

## Performance Tips ⚡

- Feche modais desnecessários para melhor FPS
- Use hotkeys em vez de cliques para melhor responsividade
- O jogo roda melhor com 60 FPS stable
- Reduza partículas em mundos muito ocupados

---

**Última atualização:** Junho 23, 2026
**Versão:** 1.0 - Release
**Status:** ✅ Pronto para uso

Divirta-se explorando os novos modais e coletando items! 🎮✨
