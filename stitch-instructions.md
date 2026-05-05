# Instruções para o Google Stitch — TodoDay (Frontend Visual)

Gere os componentes visuais do app **TodoDay** usando **Next.js 14 + shadcn/ui + Tailwind CSS**.
Não implemente lógica de negócio, chamadas de API ou validações — apenas o **visual e os estados de UI**.

---

## Design System

```css
/* Tema dark mode (padrão) */
--background: #0A0A0A;
--surface:    #141414;
--surface-2:  #1E1E1E;
--primary:    #6366F1;   /* indigo-500 */
--success:    #10B981;   /* emerald-500 */
--danger:     #EF4444;   /* red-500 */
--text:       #F5F5F5;
--muted:      #71717A;
--border:     #27272A;
```

- **Fonte:** Inter (Google Fonts)
- **Border radius padrão:** `rounded-xl` (12px)
- **Animações:** `duration-300 ease-out`
- **Componentes:** sempre de `@/components/ui/` (shadcn)

---

## Página 1 — Login (`app/(auth)/login/page.tsx`)

Tela centralizada, dark mode, sem sidebar.

**Elementos:**
- Logo: texto `TodoDay` em fonte bold + tagline *"Faça o que importa. Todo dia."* em `text-muted`
- Separador
- Botão grande: `Entrar com Google` (ícone Google + texto)
- Botão outline: `Entrar com e-mail`
- Rodapé: texto pequeno `Sem cartão de crédito. Sempre grátis.`

**Componentes shadcn:** `Button`, `Card`, `CardContent`, `Separator`

---

## Página 2 — Calendário Principal (`app/(app)/page.tsx`)

Tela principal do app. Ocupa a tela toda sem scroll lateral.

### Header
```
[ TodoDay ]                [ Maio 2026 ]          [ 🔥 5 ]
                        [ ‹ ]           [ › ]
```
- Logo à esquerda
- Mês/ano centralizado com botões `‹` e `›` para navegar
- Badge com streak à direita: `🔥 5` em destaque indigo

### Calendário Mensal

Grade 7 colunas × 5 ou 6 linhas, ocupa o restante da altura da tela.

**Cabeçalho da grade:** `DOM SEG TER QUA QUI SEX SAB` em `text-xs text-muted uppercase`

**Células do calendário — 5 estados visuais:**

| Estado | Visual |
|--------|--------|
| Vazio (sem registro) | Fundo `surface`, texto muted, sem ícone |
| Concluído | Fundo `emerald-500/10`, borda `emerald-500/40`, ponto verde |
| Falhado | Fundo `red-500/10`, borda `red-500/40`, ponto vermelho |
| Hoje | `ring-2 ring-indigo-500`, número em branco bold |
| Futuro | Opacidade 30%, cursor `not-allowed` |

**Cada célula exibe:**
- Número do dia (canto superior esquerdo)
- Indicador de status (ponto colorido ou ícone pequeno)
- Hover: leve elevação de fundo nas células clicáveis

**Ao clicar em uma célula** → abre o `DaySheet` (drawer lateral direito)

---

## Componente 3 — DaySheet (`components/day-sheet/DaySheet.tsx`)

`Sheet` do shadcn abrindo pela direita, largura `max-w-md`.

**Header do Sheet:** data formatada + botão fechar `×`

O sheet tem **3 modos visuais**:

### Modo A — Criação

Título: `"Quais são suas 3 missões de hoje?"`

```
┌─────────────────────────────┐
│  Missão 1 *                 │
│  [ _________________________]│
│                             │
│  Missão 2 *                 │
│  [ _________________________]│
│                             │
│  Missão 3 *                 │
│  [ _________________________]│
│                             │
│  [ Salvar missões ]  (btn)  │
└─────────────────────────────┘
```

- 3 `Input` rotulados "Missão 1", "Missão 2", "Missão 3" com `*` vermelho
- Botão primário `Salvar missões` desabilitado visualmente (cinza) enquanto campos estão vazios
- Componentes: `Input`, `Label`, `Button`

### Modo B — Execução

```
┌─────────────────────────────┐
│  MISSÕES DO DIA             │
│  ☐  Finalizar feature X     │  ← HIGH
│  ☐  Revisar PRs             │  ← HIGH
│  ☑  Escrever testes         │  ← HIGH (riscado + verde)
│                             │
│  ─────────────────────────  │
│  TIMER                      │
│  ████████████░░░░  24:30    │
│  [ Iniciar ] [ Pular pausa ]│
│  🍅 2 pomodoros hoje        │
│  ─────────────────────────  │
│                             │
│  TAREFAS ADICIONAIS         │
│  ☐  Responder e-mails       │  ← LOW
│  [ + Adicionar tarefa ]     │
│                             │
│  [ Encerrar dia ]  (outline)│
└─────────────────────────────┘
```

- Seção "Missões do dia": 3 itens `HIGH` com `Checkbox` + título
- Tarefa concluída: texto com `line-through text-muted`
- Seção "Timer": display grande `MM:SS` + `Progress` bar + botões
- Contador de pomodoros com emoji 🍅
- Seção "Tarefas adicionais": itens `LOW` + botão `+ Adicionar tarefa` (ghost/outline pequeno)
- Footer: botão `Encerrar dia` outline, cor danger no hover
- Componentes: `Checkbox`, `Progress`, `Button`, `Separator`, `Badge`

### Modo C — Visualização (dias passados)

```
┌─────────────────────────────┐
│  Terça, 29 de Abril         │
│  [ Concluído ✅ ]  (badge)  │
│                             │
│  MISSÕES DO DIA             │
│  ✅  Finalizar feature X    │
│  ✅  Revisar PRs            │
│  ❌  Escrever testes        │
│                             │
│  NOTA DO DIA                │
│  "Consegui! Foi difícil..." │
│                             │
│  🍅 4 pomodoros             │
└─────────────────────────────┘
```

- Todos os campos read-only
- Badge de status: `Concluído` (verde) ou `Falhado` (vermelho) ou `Sem registro` (cinza)
- Ícones ✅/❌ por tarefa
- Nota do dia em bloco de texto com fundo `surface-2`
- Componentes: `Badge`, `Card`, `CardContent`

---

## Componente 4 — PomodoroTimer (`components/day-sheet/PomodoroTimer.tsx`)

Visual isolado, sem lógica:

```
       24:30
████████████░░░░░░░░  (Progress bar indigo)

[ ▶ Iniciar ]  [ ⏭ Pular pausa ]

🍅 2 pomodoros hoje
```

- Display do tempo: fonte monospace, `text-5xl font-mono font-bold`
- Barra `Progress` larga, cor indigo
- Dois botões lado a lado
- Label abaixo com contagem de pomodoros

**Estados visuais do timer:**

| Estado | Botões visíveis | Cor da barra |
|--------|----------------|--------------|
| `idle` | `▶ Iniciar` | Indigo |
| `running` | `⏸ Pausar` · `⏭ Pular pausa` | Indigo animada |
| `paused` | `▶ Retomar` · `⏭ Pular pausa` | Indigo estático |
| `break` | `⏭ Pular pausa` | Emerald (verde) |

---

## Componente 5 — Dialog de Encerramento

`Dialog` central ao clicar em "Encerrar dia".

```
┌──────────────────────────────┐
│  Encerrar o dia?             │
│                              │
│  Você concluiu suas missões  │
│  principais hoje?            │
│                              │
│  [ ✅ Sim, concluí! ]        │
│  [ ❌ Não desta vez ]        │
│                              │
│  Nota (opcional):            │
│  [ _____________________ ]   │
│  (max. 280 caracteres)       │
└──────────────────────────────┘
```

- Dois botões grandes (Sim em verde, Não em vermelho suave)
- `Textarea` opcional para nota
- Contador de caracteres visível `0/280`
- Componentes: `Dialog`, `DialogContent`, `DialogHeader`, `Button`, `Textarea`

---

## Instruções Finais

1. Gere **um componente por vez**, começando pelo calendário
2. Use sempre **TypeScript** com props tipadas
3. Use apenas **dados mockados** (arrays estáticos) para popular a UI
4. Todos os estados visuais descritos acima devem estar visíveis na geração (use props para alternar)
5. Siga rigorosamente o **design system** definido acima
6. Não adicione lógica de fetch, useState para dados ou validações — apenas visual
