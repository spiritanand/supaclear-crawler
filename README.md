# SupaClear Crawler

![SupaClear Crawler Architecture](./Architecture.svg)

## Getting Started

To get started with the SupaClear Crawler, follow these steps:

1. Clone the repository:

```sh
git clone https://github.com/spiritanand/supaclear-crawler.git
```

2. Install dependencies:

```sh
cd supaclear-crawler
pnpm install
```

3. Start your PostgreSQL database:
4. Replace all the `.env.example` files with your own environment variables in the `web` and `crawler` directories.
5. Push the schema to the database:
   ```sh
   pnpm db:push
   ```
6. Start the crawler:
   ```sh
   cd apps/crawler
   pnpm start
   ```
7. Start the web application:
   ```sh
   cd apps/web
   pnpm dev
   ```

## Project Structure

This Turborepo includes the following packages and apps:

### Apps

- `crawler`: The main Node.js crawler that fetches and processes data.
- `web`: The Next.js web application that displays the crawled data

### Packages

- `@repo/ui`: A shared React component library used by the `web` application
- `@repo/database`: A package that defines the database schema using DrizzleORM

### Shared Configuration

- `@repo/eslint-config`: Shared `eslint` configurations
- `@repo/typescript-config`: Shared `tsconfig.json` configurations

## Technologies Used

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Next.js](https://nextjs.org/) for building the web application
- [React](https://reactjs.org/) for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Node.js](https://nodejs.org/) for the crawler
- [DrizzleORM](https://github.com/drizzle-team/drizzle-orm) for database management
