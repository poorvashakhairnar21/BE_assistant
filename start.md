# Next.js Chat UI Setup

This guide will walk you through setting up and running a Next.js project with a chat UI using shadcn/ui components.

## Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- npm (comes with Node.js)

## Installation Steps

### 1. Create a new Next.js project

Open your terminal and run:

```sh
npx create-next-app@latest chat-ui
```

Choose the following options when prompted:

1. TypeScript: Yes
2. ESLint: Yes
3. Tailwind CSS: Yes
4. `src/` directory: No
5. App Router: Yes
6. Import alias: Yes (default)

### 2. Navigate to the project directory

```sh
cd chat-ui
```

### 3. Install additional dependencies

```sh
npm install lucide-react @radix-ui/react-scroll-area @radix-ui/react-separator
```

### 4. Install shadcn/ui components

```sh
npx shadcn@latest init
```

Choose the following options:

1. TypeScript: Yes
2. Style: Default
3. Base color: Slate
4. CSS variables: Yes
5. Customize default theme: No
6. Use CSS variables for colors: Yes
7. Tailwind.config.js location: (default)
8. components.json location: (default)
9. Use import aliases: Yes

### 5. Add required shadcn/ui components

```sh
npx shadcn@latest add button input scroll-area separator
```

### 6. Replace `app/page.tsx` content

Create or update `app/page.tsx` with:

```tsx
import ChatUI from '../components/chat-ui'

export default function Home() {
  return <ChatUI />
}
```

### 7. Create Chat UI component

Create a new file `components/chat-ui.tsx` and paste your ChatUI component code.

### 8. Update `app/layout.tsx`

Modify `app/layout.tsx` to include Tailwind classes:

```tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chat UI',
  description: 'A modern chat interface built with Next.js and shadcn/ui',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
```

### 9. Start the development server

```sh
npm run dev
```

### 10. Open the application

Navigate to `http://localhost:3000` in your browser to see the Chat UI.

## Next Steps

This is currently a static UI. To make it fully functional, consider:
- Implementing state management for chat history and messages
- Adding API routes to handle chat interactions
- Integrating with a backend or AI model for generating responses

Let me know if you need any help with these additional steps!

