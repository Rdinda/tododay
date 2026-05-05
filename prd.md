# PRD — TodoDay: App de Foco e Execução Diária (Web)

> **Stack confirmada:** Next.js 14 + shadcn/ui + Prisma + PostgreSQL

> **Versão:** 1.1  
> **Status:** Em revisão  
> **Última atualização:** Maio 2026  
> **Responsável:** Product Owner

---

## 1. Visão do Produto

### 1.1 Resumo Executivo

**TodoDay** é um sistema web de priorização extrema e execução guiada, projetado para ajudar profissionais autônomos a definirem e concluírem até **3 tarefas críticas por dia** — com foco total na execução, não na organização.

**Tagline:** *"Faça o que importa. Todo dia."*

### 1.2 Problema Central

Ferramentas tradicionais como Todoist, Notion e ClickUp permitem — e até incentivam — complexidade excessiva:

| Problema | Impacto no Usuário |
|---|---|
| Listas infinitas de tarefas | Paralisia por análise |
| Gestão constante do backlog | Tempo gasto em organizar, não executar |
| Sem priorização forçada | Tarefas urgentes vs. importantes se misturam |
| Métricas ausentes | Usuário não sabe se foi produtivo de verdade |

**Resultado:** usuário *ocupado*, mas *improdutivo*.

### 1.3 Solução

Um sistema **"opinioso"** que força boas práticas:
- Máximo de **3 tarefas por dia**
- **1 missão principal** obrigatória
- Timer integrado baseado na **Técnica Pomodoro**
- Fechamento diário com reflexão rápida
- Sistema de **streak** baseado em resultados, não em uso

---

## 2. Objetivo e Métricas

### 2.1 Objetivo de Negócio

> Tornar-se a ferramenta de referência para profissionais autônomos que querem máxima produtividade com mínimo overhead cognitivo.

### 2.2 OKR do MVP

| Objective | Key Results |
|---|---|
| Validar aderência do produto | 200 usuários ativos em 30 dias |
| Provar valor real | ≥ 60% de taxa de conclusão da missão principal |
| Medir retenção | D7 ≥ 40%, D30 ≥ 20% |
| Validar o padrão de uso | Média ≤ 3 tarefas/dia |

### 2.3 Métricas de Sucesso

- **Taxa de conclusão da missão principal** (meta: ≥ 60%)
- **Retenção D7 / D30** (meta: 40% / 20%)
- **Streak médio** (meta: ≥ 3 dias consecutivos)
- **Tempo médio de sessão** (meta: 25–50 min/dia)
- **NPS** após 14 dias de uso (meta: ≥ 40)

---

## 3. Público-Alvo

### 3.1 Personas Primárias

#### Persona 1 — O Dev Independente
- **Perfil:** Dev freelancer, 25–35 anos
- **Dor:** Muitos projetos simultâneos, dificuldade em decidir o que executar
- **Job-to-be-done:** *"Quero terminar o dia sabendo que avancei no projeto mais importante"*

#### Persona 2 — O Founder Solo
- **Perfil:** Fundador de startup early-stage, 28–40 anos
- **Dor:** Tudo parece urgente, nada avança de verdade
- **Job-to-be-done:** *"Preciso saber ao final do dia se movi o negócio para frente"*

#### Persona 3 — O Freelancer Criativo
- **Perfil:** Designer, copywriter, consultor, 22–35 anos
- **Dor:** Procrastinação e excesso de abas abertas
- **Job-to-be-done:** *"Quero iniciar meu dia sabendo exatamente o que fazer"*

### 3.2 Anti-Personas (fora do escopo)

- Equipes e times (o app é **individual**)
- Usuários que precisam de gerenciamento de projetos complexos
- Usuários corporativos com fluxos de aprovação

---

## 4. Escopo do MVP

### 4.1 Funcionalidades Incluídas (In Scope)

| ID | Funcionalidade | Prioridade |
|---|---|---|
| F01 | Criação da Missão do Dia | 🔴 Must Have |
| F02 | Modo Foco com Timer Pomodoro | 🔴 Must Have |
| F03 | Fechamento e Validação Diária | 🔴 Must Have |
| F04 | Sistema de Streak | 🟡 Should Have |
| F05 | Histórico de Dias | 🟡 Should Have |
| F06 | Autenticação de Usuário | 🔴 Must Have |
| F07 | Notificações/Lembretes (web push) | 🟢 Nice to Have |

### 4.2 Fora do Escopo do MVP (Out of Scope)

- Colaboração em equipe
- Integração com calendário (Google Calendar, Outlook)
- App mobile nativo
- Subtarefas ou checklist dentro de tarefas
- IA para sugestão de tarefas
- Export de dados

---

## 5. Funcionalidades Detalhadas

### F01 — Criação da Missão do Dia

**Descrição:** Fluxo guiado que força o usuário a definir sua prioridade máxima antes de qualquer outra coisa.

**Comportamento:**
- Ao acessar o app, o sistema verifica se já existe uma missão criada para hoje
  - **Não existe** → exibe o modal/tela de criação
  - **Existe** → exibe a missão atual e seu status
- **3 campos obrigatórios** de tarefas principais (`priority = HIGH`)
- Não é permitido iniciar o foco sem as 3 tarefas principais preenchidas
- Após iniciar o dia, o usuário pode adicionar tarefas extras de **prioridade baixa** (`priority = LOW`) sem limite
- Tarefas `LOW` aparecem em seção separada ("Tarefas adicionais")

**Critérios de Aceitação:**
- [ ] Bloqueia "Iniciar foco" se as 3 tarefas principais não estiverem preenchidas
- [ ] Permite adicionar tarefas LOW a qualquer momento durante o dia
- [ ] Tarefas HIGH e LOW são exibidas em seções distintas
- [ ] O streak é calculado apenas com base nas tarefas HIGH
- [ ] Data do dia é exibida claramente no contexto

---

### F02 — Modo Foco (Timer Pomodoro)

**Descrição:** Timer integrado que guia o usuário durante a execução da missão.

**Comportamento:**
- Timer padrão: **25 minutos** de foco + **5 minutos** de pausa
- Ciclos longos: após 4 pomodoros, pausa de 15 minutos
- Estados do timer: `idle` → `running` → `paused` → `break` → `done`
- Botões: **Iniciar**, **Pausar**, **Pular pausa**, **Abandonar sessão**
- Notificação sonora e visual ao fim de cada ciclo
- Registro de quantos pomodoros foram completados no dia

**Critérios de Aceitação:**
- [ ] Timer exibe countdown em tempo real
- [ ] Pausa e retomada funcionam sem perda de tempo
- [ ] Notificação é disparada ao fim do pomodoro
- [ ] Contagem de pomodoros do dia é persistida
- [ ] Timer não reinicia ao recarregar a página (estado salvo localmente)

---

### F03 — Fechamento e Validação Diária

**Descrição:** Ritual de encerramento do dia com reflexão rápida.

**Comportamento:**
- Botão "Encerrar dia" disponível a partir de determinado horário (padrão: 17h, configurável)
- Pergunta obrigatória: *"Você concluiu sua missão principal hoje?"* (Sim / Não)
- Campo opcional: nota rápida / reflexão (max. 280 caracteres)
- Um dia só pode ser encerrado **uma única vez**
- Status final do dia: `concluído` ou `falhado`

**Critérios de Aceitação:**
- [ ] Não permite encerrar o mesmo dia duas vezes
- [ ] Pergunta principal é obrigatória (Sim/Não)
- [ ] Nota é opcional mas limitada a 280 chars
- [ ] Streak é atualizado imediatamente após encerramento
- [ ] Tela de summary é exibida após encerramento

---

### F04 — Sistema de Streak

**Descrição:** Gamificação baseada em resultado, não em presença.

**Comportamento:**
- Streak aumenta **somente** quando a missão principal é concluída
- Se o usuário não encerrar o dia, o streak **não é afetado** (sem penalidade por ausência)
- Exibição: contador no header com animação de fogo 🔥
- Recorde histórico de streak também é exibido

**Critérios de Aceitação:**
- [ ] Streak só incrementa quando `completed_main = true`
- [ ] Streak é zerado somente quando `completed_main = false`
- [ ] Dias sem encerramento não afetam o streak
- [ ] Recorde histórico é persistido

---

### F05 — Histórico de Dias

**Descrição:** Visualização dos dias anteriores com seus status.

**Comportamento:**
- Lista cronológica dos últimos 30 dias
- Cada entrada exibe: data, missão principal, status, nota (se houver)
- Indicadores visuais: ✅ concluído / ❌ falhado / ⏳ em progresso / — sem registro
- Clique em um dia expande os detalhes

**Critérios de Aceitação:**
- [ ] Lista exibe os últimos 30 dias
- [ ] Status é visualmente diferenciado
- [ ] Clique expande detalhes do dia
- [ ] Dias sem registro aparecem como "—"

---

## 6. Fluxos de Usuário (User Flows)

### 6.1 Fluxo da Manhã (Crítico)

```
Usuário acessa o app
    ↓
Sistema verifica: missão já criada hoje?
    ├── NÃO → Exibe modal de criação da missão
    │       ↓
    │   Usuário define missão principal + até 2 secundárias
    │       ↓
    │   Salva → Vai para tela de execução
    │
    └── SIM → Exibe missão atual + status
```

### 6.2 Fluxo de Execução (Foco)

```
Tela de execução
    ↓
Usuário clica "Iniciar missão"
    ↓
Timer Pomodoro inicia (25 min)
    ↓
Ao fim do ciclo → Notificação
    ├── Pausar → Timer para, pode retomar
    ├── Concluir tarefa → Marca como feita, próxima tarefa fica ativa
    └── Pular pausa → Reinicia timer
```

### 6.3 Fluxo de Fechamento

```
Usuário clica "Encerrar dia"
    ↓
Sistema pergunta: "Concluiu a missão principal?"
    ↓
Resposta: Sim / Não
    ↓
Campo: nota opcional
    ↓
Salvar → Atualiza streak → Exibe summary do dia
```

### 6.4 Fluxo do Dia Seguinte

```
Usuário acessa no dia seguinte
    ↓
Header exibe: streak atual + recorde
    ↓
Resumo do dia anterior (se encerrado)
    ↓
Modal de nova missão abre automaticamente
```

---

## 7. Design e UX

### 7.1 Princípios de Design

1. **Zero distrações** — cada tela tem um único objetivo
2. **Fricção intencional** — o app deve fazer o usuário pensar antes de agir
3. **Recompensa visual** — feedback imediato e satisfatório ao concluir
4. **Mobile-first** — experiência otimizada para telas pequenas

### 7.2 Estrutura de Telas (MVP)

#### Tela 1 — Calendário Mensal (Tela Principal)

A tela inicial é um **calendário grande e expandido** mostrando todos os dias do mês atual. Cada célula do calendário indica o status daquele dia visualmente.

```
┌──────────────────────────────────────────────┐
│  HEADER                                      │
│  TodoDay           Maio 2026   🔥 Streak: 5  │
├──────────────────────────────────────────────┤
│  DOM   SEG   TER   QUA   QUI   SEX   SAB     │
│  ───   ───   ───   ───   ───   ───   ───     │
│   ·     ·     ·     ✅    ✅    ✅    ❌      │
│   ✅    ✅    ✅    ✅    ✅   [hoje]  ·      │
│   ·     ·     ·     ·     ·     ·     ·      │
│   ·     ·     ·     ·     ·     ·     ·      │
├──────────────────────────────────────────────┤
│  LEGENDA:  ✅ Concluído  ❌ Falhado  · Vazio  │
└──────────────────────────────────────────────┘
```

**Comportamento das células:**
- `·` — Dia sem registro (cinza neutro)
- `✅` — Missão principal concluída (verde)
- `❌` — Dia encerrado com falha (vermelho suave)
- `[hoje]` — Destaque especial com borda/anel
- Dias futuros — desabilitados (não clicáveis)

**Ao clicar em um dia** → abre um **Sheet/Drawer lateral** (shadcn `Sheet`) com o fluxo daquele dia:
- Se for hoje sem missão → modo criação
- Se for hoje com missão → modo execução
- Se for dia passado → modo visualização (read-only)

#### Tela 2 — Sheet: Fluxo do Dia (Drawer Lateral)

```
┌────────────────────────────────┐
│  ← Maio, 04                   │
│  ─────────────────────────── │
│  MISSÃO DO DIA                 │
│  [ Tarefa principal... ]  🔴   │
│  [ Tarefa 2... ]          ⬜   │
│  [ Tarefa 3... ]          ⬜   │
│  ─────────────────────────── │
│  TIMER POMODORO                │
│         24:30                  │
│  [ Iniciar ]  [ Pular pausa ]  │
│  ─────────────────────────── │
│  [ Encerrar dia ]              │
└────────────────────────────────┘
```

### 7.3 Design System

- **Tipografia:** Inter (Google Fonts)
- **Paleta:** Dark mode por padrão
  - Background: `#0F0F0F`
  - Surface: `#1A1A1A`
  - Primary: `#6366F1` (indigo)
  - Success: `#10B981`
  - Danger: `#EF4444`
  - Text: `#F5F5F5`
- **Animações:** sutis, max. 300ms, easing `ease-out`
- **Bordas:** `border-radius: 12px` padrão

---

## 8. Modelo de Dados

### 8.1 Entidades

```
User
├── id          UUID PK
├── email       VARCHAR UNIQUE NOT NULL
├── name        VARCHAR
├── timezone    VARCHAR DEFAULT 'America/Sao_Paulo'
└── created_at  TIMESTAMP

Day
├── id              UUID PK
├── user_id         UUID FK → User
├── date            DATE NOT NULL
├── status          ENUM(open, in_progress, done, failed) DEFAULT 'open'
├── completed_main  BOOLEAN DEFAULT false
├── note            VARCHAR(280)
├── streak_at_close INTEGER
└── created_at      TIMESTAMP

Task
├── id          UUID PK
├── day_id      UUID FK → Day
├── title       VARCHAR(255) NOT NULL
├── is_main     BOOLEAN DEFAULT false
├── status      ENUM(pending, in_progress, done, skipped)
├── order       SMALLINT
└── created_at  TIMESTAMP

PomodoroSession
├── id            UUID PK
├── day_id        UUID FK → Day
├── task_id       UUID FK → Task (nullable)
├── started_at    TIMESTAMP
├── ended_at      TIMESTAMP (nullable)
├── duration_min  SMALLINT DEFAULT 25
└── completed     BOOLEAN DEFAULT false
```

### 8.2 Constraints

- `UNIQUE(user_id, date)` na tabela `Day` (um registro por dia por usuário)
- `CHECK(order BETWEEN 1 AND 3)` na tabela `Task`
- Somente 1 `Task` com `is_main = true` por `Day`

---

## 9. Stack Técnica

### 9.1 Stack Recomendada

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | SSR, rotas, performance |
| **Estilização** | Tailwind CSS + **shadcn/ui** | Componentes acessíveis e customizáveis |
| **ORM** | **Prisma** | Type-safe, migrations, DX excelente |
| **Banco de dados** | PostgreSQL | Confiável, relacional |
| **Autenticação** | NextAuth.js | Flexível, integra com Prisma adapter |
| **Hospedagem** | Vercel | CI/CD automático, edge network |

> **Componentes shadcn/ui utilizados:** `Calendar`, `Sheet`, `Button`, `Badge`, `Dialog`, `Progress`, `Separator`, `Textarea`

### 9.2 Alternativa Mais Simples (prototipagem rápida)

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js |
| Backend + DB + Auth | Supabase (all-in-one) |
| Storage local | localStorage (timer state) |

### 9.3 Dependências Principais

```json
{
  "next": "^14",
  "react": "^18",
  "@supabase/supabase-js": "^2",
  "date-fns": "^3",
  "zustand": "^4",
  "framer-motion": "^11"
}
```

---

## 10. Regras de Negócio

| ID | Regra |
|---|---|
| RN01 | O usuário **deve** definir exatamente 3 tarefas principais por dia (obrigatório para iniciar o foco) |
| RN02 | Tarefas de prioridade baixa podem ser adicionadas ao longo do dia sem limite de quantidade |
| RN02b | As 3 tarefas principais devem ser definidas de uma vez no início do dia |
| RN03 | Um dia só pode ser encerrado uma vez |
| RN04 | Streak incrementa somente com `completed_main = true` |
| RN05 | Dias sem encerramento não penalizam o streak |
| RN06 | Tarefas não podem ser editadas após o início do timer (configurável) |
| RN07 | Novos dias só podem ser criados após meia-noite (timezone do usuário) |
| RN08 | O timer persiste o estado no localStorage para resistir a refreshes |

---

## 11. Gestão de Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| App virar "mais um task manager" | Alta | Crítico | Manter restrições rígidas no produto |
| Baixa retenção pós-D7 | Média | Alto | Push notifications + emails de reengajamento |
| Complexidade técnica do timer | Baixa | Médio | Usar Web Worker ou biblioteca existente |
| Churn por falta de mobile | Média | Médio | PWA como first step antes do app nativo |
| Scope creep no MVP | Alta | Alto | Revisão semanal do PRD com o time |

---

## 12. Roadmap

### Fase 1 — MVP (Semanas 1–4)

- [x] Autenticação (email + senha)
- [ ] Criação da missão do dia
- [ ] Timer Pomodoro
- [ ] Fechamento do dia
- [ ] Streak básico

### Fase 2 — Consolidação (Semanas 5–8)

- [ ] Histórico visual (últimos 30 dias)
- [ ] Streak com animações e recorde histórico
- [ ] PWA (installable, offline básico)
- [ ] Push notifications (lembrete manhã + encerramento)

### Fase 3 — Crescimento (Semanas 9–16)

- [ ] Dashboard de produtividade pessoal
- [ ] Export de dados (CSV)
- [ ] Sugestões inteligentes baseadas em histórico
- [ ] Compartilhamento de streak (social proof)
- [ ] App mobile (React Native ou Flutter)

---

## 13. Critérios de Lançamento (Definition of Done — MVP)

Para considerar o MVP pronto para lançamento:

- [ ] Todas as features Must Have implementadas e testadas
- [ ] Testes end-to-end nos 3 fluxos principais (manhã, foco, fechamento)
- [ ] Performance: LCP < 2.5s, FID < 100ms
- [ ] Mobile responsivo (375px+)
- [ ] Acessibilidade básica (WCAG 2.1 AA nos elementos principais)
- [ ] Dados de 5 usuários beta com feedback positivo
- [ ] Zero bugs críticos em produção

---

## 14. Referências e Inspirações

- **Método:** Técnica Pomodoro (Francesco Cirillo)
- **Filosofia:** "Most Important Task" (MITs) — David Allen / GTD
- **Produtos referência:** Sunsama (ritual diário), Focusmate (accountability), Forest (gamificação de foco)
- **Anti-referências:** Notion, Jira (complexidade excessiva)