"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import Link from "next/link"

export default function EngenhariaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [autenticado, setAutenticado] = useState<boolean | null>(null)

  useEffect(() => {
    // Verificar autenticação via API
    fetch("/api/auth/verificar")
      .then((res) => res.json())
      .then((data) => {
        setAutenticado(data.autenticado)
        // Se não estiver autenticado e não estiver na página de login, redirecionar
        if (!data.autenticado && pathname !== "/engenharia/login") {
          router.push("/engenharia/login")
        }
      })
      .catch(() => {
        setAutenticado(false)
        if (pathname !== "/engenharia/login") {
          router.push("/engenharia/login")
        }
      })
  }, [pathname, router])

  // Se estiver na página de login, renderizar sem a barra de navegação
  if (pathname === "/engenharia/login") {
    return <>{children}</>
  }

  // Se ainda estiver verificando autenticação, mostrar loading
  if (autenticado === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] to-[#071018]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27a75c]"></div>
      </div>
    )
  }

  // Se não estiver autenticado, não renderizar (já redirecionou)
  if (!autenticado) {
    return null
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/engenharia/login")
    router.refresh()
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a1628] to-[#071018]">
      {/* Barra de navegação */}
      <div className="sticky top-0 z-50 bg-[#0a1628]/95 backdrop-blur-sm border-b border-[#27a75c]/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/engenharia/formulario">
              <h2 className="text-lg font-semibold text-[#27a75c]">Engenharia</h2>
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/">
              <span className="text-sm text-white/60 hover:text-[#27a75c] transition-colors">
                Voltar ao Sistema
              </span>
            </Link>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-[#27a75c] hover:bg-[#27a75c]/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
      {children}
    </div>
  )
}

