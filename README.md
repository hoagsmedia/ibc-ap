# Island Beer Club - Modern Web Application

A complete modernization of the Island Beer Club website built with SvelteKit 2, Svelte 5, and modern web technologies.

## 🚀 Features

- **Modern Frontend**: SvelteKit 2 with Svelte 5 Runes
- **Authentication**: Lucia Auth with session-based authentication
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn-svelte components
- **Type Safety**: Full TypeScript implementation
- **Image Uploads**: Profile image management
- **Responsive Design**: Mobile-first responsive layout

## 🛠️ Tech Stack

- **Framework**: SvelteKit 2
- **Frontend**: Svelte 5 with Runes
- **Styling**: Tailwind CSS 4.0
- **Components**: shadcn-svelte
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Lucia Auth
- **Forms**: SvelteKit Superforms with Zod validation
- **Testing**: Vitest
- **TypeScript**: Strict type checking

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended) or npm

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ibc-app
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy the example environment file and configure your database:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your database credentials:

```bash
# For local development (PostgreSQL)
DATABASE_URL_LOCAL="postgresql://username@localhost:5432/database_name"

# For production
DATABASE_URL="postgresql://username:password@host:port/database_name"
```

### 4. Database Setup

Generate and push the database schema:

```bash
pnpm db:push
```

### 5. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:5173` to see the application.

## 🗃️ Database Management

- **Push Schema**: `pnpm db:push`
- **Generate Migration**: `pnpm db:migrate`
- **Database Studio**: `pnpm db:studio`

## 🧪 Testing

```bash
pnpm test
```

## 🔒 Security

- Environment variables are properly excluded from git
- Passwords are hashed with Argon2
- Session-based authentication with secure cookies
- File upload validation and sanitization
- SQL injection protection via Drizzle ORM

## 📝 License

This project is private and proprietary to Island Beer Club.

- [ ] Added schemas for user login and profile update
- [ ] Profile Page
- [ ] Dashboard page
- [ ] Settings page
- [ ] Notifications page
