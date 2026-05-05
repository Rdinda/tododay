<p align="center">
  <img src="public/logo.png" alt="TodoDay Logo" width="80" height="80" style="border-radius: 16px;" />
</p>

<h1 align="center">TodoDay</h1>

<p align="center">
  <strong>Foque no que importa. Todo dia, 3 tarefas principais.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

---

## 📋 About

**TodoDay** is a minimalist daily task management app designed to help you focus on what matters most. Every day, you define your **3 main tasks** and track your progress with a built-in **Pomodoro timer**.

Key principles:
- 🎯 **Focus** — Limit yourself to 3 high-priority tasks per day
- 🔄 **Flexibility** — Migrate unfinished tasks to future days
- 📊 **Accountability** — Visual calendar shows your daily track record
- ⏱️ **Deep work** — Built-in Pomodoro timer for focused sessions

## ✨ Features

- **Daily Task Management** — Set 3 main tasks per day and track completion
- **Task Migration** — Move unfinished tasks to another day with a date picker
- **Pomodoro Timer** — Integrated timer with session tracking
- **Calendar View** — Monthly overview with color-coded task status (green = done, amber = pending)
- **Day Closing** — End-of-day review with notes and status tracking
- **Streak Tracking** — Monitor your consistency over time
- **Extra Tasks** — Add additional low-priority tasks alongside your main 3
- **Skeleton Loading** — Polished loading states for a smooth UX
- **Passcode Auth** — Simple server-side authentication with HTTP-only cookies
- **Offline-first DB** — SQLite database, no external database required

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Database** | SQLite via [Prisma 7](https://www.prisma.io/) + better-sqlite3 |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (Base UI) |
| **Date Picker** | [react-day-picker](https://react-day-picker.js.org/) |
| **Runtime** | Node.js 20+ |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) (recommended) or npm

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Rdinda/tododay.git
   cd tododay
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   TODODAY_ACCESS_PASSCODE="your-secure-passcode"
   ```

4. **Setup the database:**

   ```bash
   pnpm dlx prisma generate
   pnpm dlx prisma db push
   ```

5. **Start the dev server:**

   ```bash
   pnpm dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000) and login with your passcode.

## 📁 Project Structure

```
tododay/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with auth
│   ├── page.tsx            # Main calendar page
│   └── login/              # Login page
├── components/
│   ├── calendar/           # Calendar grid component
│   ├── day-sheet/          # Day panel (execution, view, skeleton)
│   ├── auth/               # Login form
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── day-actions.ts      # Server actions (CRUD, migration)
│   └── prisma.ts           # Prisma client singleton
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── dev.db              # SQLite database (auto-generated)
├── public/                 # Static assets (logo)
└── middleware.ts           # Auth middleware
```

## 🗃 Database Schema

```
User ──┐
       │ 1:N
       ▼
      Day ──┐
       │    │ 1:N
       │    ▼
       │  Task (HIGH/LOW priority, PENDING/DONE/SKIPPED status)
       │
       └──┐ 1:N
          ▼
       PomodoroSession
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Run `pnpm lint` before submitting PRs
- Keep components focused and reusable
- Use Server Actions for all database operations

## 📝 Roadmap

- [ ] OAuth authentication (Google, GitHub)
- [ ] Weekly/monthly analytics dashboard
- [ ] PWA support for mobile
- [ ] Task templates and recurring tasks
- [ ] Dark/light theme toggle
- [ ] Data export (JSON/CSV)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Rdinda">Rdinda</a>
</p>
