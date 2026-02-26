import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema Orçamentário",
  description: "Sistema interno para solicitações de orçamento",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#0a0a0a] text-white min-h-screen`}>
        {/* Background gradient global - Verde #27a75c + Azul #00477a */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#00477a]/20 via-transparent to-[#27a75c]/10 pointer-events-none" />
        <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#27a75c]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00477a]/8 rounded-full blur-3xl pointer-events-none" />
        
        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </body>
    </html>
  )
}







