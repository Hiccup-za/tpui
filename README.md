# Central - Test Plan Management

A web application for QA Engineers to create, review and share Test Plan documents.

## Tech Stack

- **Bun** - Package manager and runtime
- **TypeScript** - Type safety
- **Next.js 14** - React framework with App Router
- **Shadcn UI** - UI component library (Radix UI)
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Bun installed on your system

### Installation

1. Install dependencies:
```bash
bun install
```

2. Run the development server:
```bash
bun dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tpui/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home Dashboard
│   └── products/
│       └── [productId]/   # Product Dashboard (dynamic route)
├── components/
│   ├── layout/            # Layout components (Header, Sidebar, DashboardLayout)
│   ├── dashboard/         # Dashboard-specific components (ViewSwitcher)
│   ├── cards/             # Card components (ProductCard, TestPlanCard)
│   ├── user/              # User components (UserMenu)
│   └── ui/                # Shadcn UI components
├── lib/                   # Utility functions and mock data
├── types/                 # TypeScript type definitions
└── package.json
```

## Phase 1 Features

- Home Dashboard with view switcher (Empty/Populated views)
- Product Dashboard with view switcher (Empty/Populated views)
- Navigation between pages
- Mock data for products and test plans
- Responsive UI with Shadcn components

## Next Steps

Future phases will include:
- Backend integration with PostgreSQL
- Better Auth authentication
- CRUD operations for products and test plans
- Test case management
- Requirements management
