# Financial Dashboard

This is a personal finance dashboard built with Next.js. It gives users a simple way to review account activity, monitor income vs. expenses, and spot spending patterns through a clean multi-page interface.

## Product Overview

The product is designed as a lightweight finance tracking experience with three core views:

- `Overview`: a high-level summary of total balance, income, expenses, balance trend, and category-based spending breakdown.
- `Transactions`: a searchable and sortable transaction table with filtering, export options, and admin-only transaction management.
- `Insights`: a summary page that highlights top spending categories, 30-day spending change, and a chart of the largest expense categories.

The app uses mock transaction data generated in the client, which makes it useful as a UI prototype, demo project, or starting point for a real finance product.

## Main Features

- Dashboard cards for total balance, total income, and total expenses
- Balance trend visualization over time
- Spending breakdown by category
- Search, filter, and sort for transaction history
- Export transactions as `CSV` or `JSON`
- Add and delete transactions in `Admin` mode
- Read-only experience in `Viewer` mode
- Light and dark theme toggle
- Responsive sidebar and mobile-friendly navigation

## How It Works

Application state is managed through a shared `FinanceContext`. That context stores:

- transactions
- current user role (`Viewer` or `Admin`)
- active theme (`light` or `dark`)

The interface updates in real time as transactions are added or removed. Insights and charts are derived from the current transaction list, so the product feels interactive without needing a backend.

## Who This Product Is For

Financial Dashboard is a good fit for:

- teams prototyping a finance or budgeting app
- developers who want a clean Next.js dashboard starter
- designers demonstrating analytics and transaction workflows
- students learning React state management, charts, and responsive UI patterns

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Recharts
- Lucide React

## Project Structure

```text
app/
  page.tsx                # overview dashboard
  transactions/page.tsx   # transaction management
  insights/page.tsx       # financial insights
components/
  Sidebar/Sidebar.tsx     # navigation, role toggle, theme toggle
lib/
  FinanceContext.tsx      # shared app state and mock data generation
```

## Running Locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Current Limitations

- no backend or database
- no authentication
- data resets on refresh
- insights are based on mock/generated transaction data
- role switching is UI-level only