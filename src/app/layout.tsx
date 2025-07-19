import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Temanmu',
  description: 'Hadir untuk membantu harimu lebih teratur — atur tugas, jadwalkan kegiatan, dan kelola produktivitasmu dengan mudah dalam satu aplikasi.',
  keywords: 'task manager, productivity, todo, organization, scheduling, teman, jadwal, tugas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}