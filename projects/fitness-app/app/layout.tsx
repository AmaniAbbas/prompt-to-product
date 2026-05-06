import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Fitness Coach Platform",
  description: "Manage clients, workouts, and progress",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
