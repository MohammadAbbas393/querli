import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Querli — Ask Your Database Anything',
  description:
    'AI database agent for non-technical teams. Connect your Postgres, MySQL or SQLite database and ask questions in plain English. Get beautiful charts and tables instantly. No SQL required.',
  keywords: 'natural language sql, ai database, text to sql, business intelligence, no-code analytics',
  openGraph: {
    title: 'Querli — Ask your database anything. No SQL required.',
    description: 'Connect your database, ask questions in plain English, get beautiful charts.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans bg-[#05020f] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  )
}
