import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  List, 
  BarChart3, 
  Settings,
  ArrowRight,
  Sparkles
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background com gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#071018] via-[#0a1628] to-[#071018]" />
      
      {/* Efeitos de luz de fundo */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#27a75c]/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00477a]/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#27a75c]/5 to-[#00477a]/5 rounded-full blur-[100px]" />
      
      {/* Padrão de grid sutil */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(39, 167, 92, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(39, 167, 92, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-12">
          {/* Logo/Brand */}
          <div className="mb-12 flex items-center gap-3">
            <Image 
              src="/printbag-logo-svg.png" 
              alt="Printbag" 
              width={180} 
              height={50}
              className="h-10 w-auto"
            />
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-[#27a75c]/30 to-transparent" />
            <span className="text-xs font-medium text-white/70 uppercase tracking-widest">Sistema</span>
          </div>

          {/* Main Title */}
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#27a75c]/10 to-[#00477a]/10 border border-[#27a75c]/20 mb-8">
              <Sparkles className="w-4 h-4 text-[#27a75c]" />
              <span className="text-sm text-white">Gestão inteligente de orçamentos</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
              <span className="text-white">Sistema</span>
              <br />
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#27a75c] via-[#2db86a] to-[#00477a] animate-gradient">
                  Orçamentário
                </span>
                {/* Linha decorativa embaixo */}
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#27a75c] via-[#00477a] to-transparent rounded-full opacity-60" />
              </span>
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed max-w-xl">
              Gerencie solicitações de orçamento de forma simples e eficiente.
              Acompanhe métricas, gere relatórios e mantenha tudo organizado.
            </p>
          </div>

          {/* Quick Action */}
          <div className="flex items-center gap-4">
            <Link href="/solicitacoes/nova">
              <Button 
                size="lg" 
                className="relative overflow-hidden bg-gradient-to-r from-[#27a75c] to-[#00477a] hover:from-[#2db86a] hover:to-[#005a94] text-white border-0 h-14 px-8 text-base font-semibold rounded-2xl shadow-2xl shadow-[#27a75c]/30 transition-all duration-300 hover:shadow-[#27a75c]/50 hover:scale-105 group"
              >
                {/* Efeito de brilho no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  Nova Solicitação
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            
            <Link href="/solicitacoes">
              <Button 
                variant="outline" 
                size="lg"
                className="h-14 px-6 rounded-2xl border-white/30 text-white hover:text-white hover:bg-[#27a75c]/20 hover:border-[#27a75c]/60 transition-all duration-300"
              >
                Ver Solicitações
              </Button>
            </Link>
          </div>
        </div>

        {/* Cards Section */}
        <div className="max-w-6xl mx-auto px-6 pb-32">
          <div className="grid md:grid-cols-3 gap-5">
            {/* Card 1 - Solicitações */}
            <Link href="/solicitacoes" className="group">
              <div className="relative h-full p-7 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.15] backdrop-blur-sm hover:border-[#27a75c]/50 hover:shadow-2xl hover:shadow-[#27a75c]/20 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden">
                {/* Glow no hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#27a75c]/0 to-[#00477a]/0 group-hover:from-[#27a75c]/10 group-hover:to-[#00477a]/5 transition-all duration-500 rounded-3xl" />
                
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#27a75c]/20 to-[#00477a]/10 border border-[#27a75c]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <List className="w-7 h-7 text-[#27a75c]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#27a75c] transition-colors duration-300">
                    Solicitações
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed group-hover:text-white transition-colors">
                    Visualize e gerencie todas as solicitações de orçamento criadas
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-[#27a75c] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-sm font-medium">Acessar</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 2 - Dashboard */}
            <Link href="/dashboard" className="group">
              <div className="relative h-full p-7 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.15] backdrop-blur-sm hover:border-[#00477a]/50 hover:shadow-2xl hover:shadow-[#00477a]/20 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden">
                {/* Glow no hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00477a]/0 to-[#27a75c]/0 group-hover:from-[#00477a]/10 group-hover:to-[#27a75c]/5 transition-all duration-500 rounded-3xl" />
                
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00477a]/20 to-[#27a75c]/10 border border-[#00477a]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                    <BarChart3 className="w-7 h-7 text-[#4db8ff]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#4db8ff] transition-colors duration-300">
                    Dashboard
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed group-hover:text-white transition-colors">
                    Estatísticas, gráficos e métricas de desempenho em tempo real
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-[#4db8ff] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-sm font-medium">Acessar</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 3 - Engenharia */}
            <Link href="/engenharia/formulario" className="group">
              <div className="relative h-full p-7 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.15] backdrop-blur-sm hover:border-[#27a75c]/50 hover:shadow-2xl hover:shadow-[#27a75c]/20 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden">
                {/* Glow no hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#27a75c]/0 to-[#00477a]/0 group-hover:from-[#27a75c]/5 group-hover:to-[#00477a]/10 transition-all duration-500 rounded-3xl" />
                
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#27a75c]/20 to-[#00477a]/20 border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Settings className="w-7 h-7 text-white group-hover:rotate-180 transition-transform duration-700" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-white transition-colors duration-300">
                    Engenharia
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed group-hover:text-white transition-colors">
                    Configure etapas e perguntas do formulário de solicitação
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-sm font-medium">Acessar</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-5">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">© 2026 Printbag. Todos os direitos reservados.</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#27a75c] to-[#00477a] font-medium">
                Desenvolvido por Pedro Levorato
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
