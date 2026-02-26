"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Package,
  Building2,
  Layers,
  AlertCircle,
  Printer,
  Sparkles,
  Box,
  BarChart3,
  Activity
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  ComposedChart
} from "recharts"

interface DashboardData {
  resumo: {
    total: number
    ultimos30Dias: number
    ultimos7Dias: number
    tempoMedioResposta: number
    periodoAnterior: number
  }
  status: {
    sucesso: number
    erro: number
    pendente: number
  }
  solicitacoesPorDia: Array<{ dia: string; quantidade: number }>
  produtosMaisSolicitados: Array<{ produto: string; quantidade: number }>
  substratosMaisUsados: Array<{ substrato: string; quantidade: number }>
  empresasMaisSolicitam: Array<{ empresa: string; quantidade: number }>
  tiposProduto: Array<{ tipo: string; quantidade: number }>
  modosImpressao: Array<{ modo: string; quantidade: number }>
  enobrecimentos: Array<{ enobrecimento: string; quantidade: number }>
  acondicionamentos: Array<{ acondicionamento: string; quantidade: number }>
  solicitacoesPorHora: Array<{ hora: string; quantidade: number }>
  distribuicaoQuantidades: Array<{ faixa: string; quantidade: number }>
  comparacaoPeriodos: Array<{ dia: string; atual: number; anterior: number }>
  taxaSucessoPorDia: Array<{ dia: string; taxa: number; total: number; sucesso: number }>
  metricasCombinadas: Array<{ dia: string; solicitacoes: number; sucesso: number; erro: number }>
}

const CORES_STATUS = ["#27a75c", "#ef4444", "#f59e0b"]

export default function DashboardPage() {
  const [dados, setDados] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/dashboard/estatisticas")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar estatísticas")
        return res.json()
      })
      .then((data) => {
        setDados(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Erro:", err)
        setErro(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27a75c]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (erro || !dados) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{erro || "Erro ao carregar dados"}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const dadosStatus = [
    { name: "Enviadas", value: dados.status.sucesso, color: "#27a75c" },
    { name: "Com Erro", value: dados.status.erro, color: "#ef4444" },
    { name: "Pendentes", value: dados.status.pendente, color: "#f59e0b" }
  ].filter(d => d.value > 0)

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-[#27a75c] hover:text-white hover:bg-white/5 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Dashboard
          </h1>
          <p className="text-[#27a75c]/70">
            Estatísticas e métricas das solicitações de orçamento
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl bg-gradient-to-br from-[#27a75c]/20 to-[#00477a]/10 border border-[#27a75c]/20 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#27a75c]/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-[#27a75c]" />
              </div>
              <span className="text-sm text-[#2cb866]">Total</span>
            </div>
            <p className="text-3xl font-bold text-white">{dados.resumo.total}</p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-[#27a75c]/20 to-[#00477a]/10 border border-[#27a75c]/20 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#27a75c]/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-[#27a75c]" />
              </div>
              <span className="text-sm text-[#2cb866]">Enviadas</span>
            </div>
            <p className="text-3xl font-bold text-white">{dados.status.sucesso}</p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
              <span className="text-sm text-amber-300">7 dias</span>
            </div>
            <p className="text-3xl font-bold text-white">{dados.resumo.ultimos7Dias}</p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-sm text-purple-300">Tempo médio</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {dados.resumo.tempoMedioResposta > 0 ? `${dados.resumo.tempoMedioResposta}s` : "-"}
            </p>
          </div>
        </div>

        {/* Gráficos Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfico de Área */}
          <div className="lg:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-[#27a75c]" />
              <h3 className="text-lg font-semibold text-white">Solicitações por Dia</h3>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dados.solicitacoesPorDia}>
                  <defs>
                    <linearGradient id="colorQtd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#27a75c" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#27a75c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#666" }} interval={4} />
                  <YAxis allowDecimals={false} tick={{ fill: "#666" }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1a1a1a", 
                      border: "1px solid #333",
                      borderRadius: "8px",
                      color: "#fff"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="quantidade" 
                    stroke="#27a75c" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorQtd)" 
                    name="Solicitações"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Pizza */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="h-5 w-5 text-[#27a75c]" />
              <h3 className="text-lg font-semibold text-white">Status</h3>
            </div>
            <div className="h-[280px]">
              {dadosStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dadosStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#00477a", 
                        border: "1px solid #27a75c",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ color: "#999" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#27a75c]/60">
                  Sem dados
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráficos Secundários - Linha 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Produtos */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Produtos Mais Solicitados</h3>
            </div>
            <div className="h-[250px]">
              {dados.produtosMaisSolicitados.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.produtosMaisSolicitados} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "#666" }} />
                    <YAxis type="category" dataKey="produto" tick={{ fontSize: 11, fill: "#999" }} width={70} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #333",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="quantidade" fill="#f97316" radius={[0, 4, 4, 0]} name="Quantidade" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#27a75c]/60">Sem dados</div>
              )}
            </div>
          </div>

          {/* Empresas */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Top Empresas</h3>
            </div>
            <div className="h-[250px]">
              {dados.empresasMaisSolicitam.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.empresasMaisSolicitam} layout="vertical" margin={{ left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "#666" }} />
                    <YAxis type="category" dataKey="empresa" tick={{ fontSize: 11, fill: "#999" }} width={50} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #333",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="quantidade" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Solicitações" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#27a75c]/60">Sem dados</div>
              )}
            </div>
          </div>
        </div>

        {/* Gráficos Secundários - Linha 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Substratos */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Substratos Mais Usados</h3>
            </div>
            <div className="h-[250px]">
              {dados.substratosMaisUsados.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.substratosMaisUsados} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "#666" }} />
                    <YAxis type="category" dataKey="substrato" tick={{ fontSize: 11, fill: "#999" }} width={70} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #333",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="quantidade" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Quantidade" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#27a75c]/60">Sem dados</div>
              )}
            </div>
          </div>

          {/* Tipos de Produto */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-pink-400" />
              <h3 className="text-lg font-semibold text-white">Distribuição por Tipo</h3>
            </div>
            <div className="h-[250px]">
              {dados.tiposProduto.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dados.tiposProduto}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="quantidade"
                      label={({ tipo, percent }) => `${tipo} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {dados.tiposProduto.map((entry, index) => {
                        const cores = ["#ec4899", "#f472b6", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa"]
                        return <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #333",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#27a75c]/60">Sem dados</div>
              )}
            </div>
          </div>
        </div>

        {/* Gráficos Secundários - Linha 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Modos de Impressão */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Printer className="h-5 w-5 text-[#27a75c]" />
              <h3 className="text-lg font-semibold text-white">Modos de Impressão</h3>
            </div>
            <div className="h-[250px]">
              {dados.modosImpressao.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.modosImpressao} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "#666" }} />
                    <YAxis type="category" dataKey="modo" tick={{ fontSize: 11, fill: "#999" }} width={70} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #333",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="quantidade" fill="#27a75c" radius={[0, 4, 4, 0]} name="Quantidade" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#27a75c]/60">Sem dados</div>
              )}
            </div>
          </div>

          {/* Enobrecimentos */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Enobrecimentos</h3>
            </div>
            <div className="h-[250px]">
              {dados.enobrecimentos.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.enobrecimentos} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "#666" }} />
                    <YAxis type="category" dataKey="enobrecimento" tick={{ fontSize: 11, fill: "#999" }} width={70} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #333",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="quantidade" fill="#eab308" radius={[0, 4, 4, 0]} name="Quantidade" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#27a75c]/60">Sem dados</div>
              )}
            </div>
          </div>
        </div>

        {/* Gráficos Secundários - Linha 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Acondicionamentos */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Box className="h-5 w-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Acondicionamentos</h3>
            </div>
            <div className="h-[250px]">
              {dados.acondicionamentos.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.acondicionamentos} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "#666" }} />
                    <YAxis type="category" dataKey="acondicionamento" tick={{ fontSize: 11, fill: "#999" }} width={70} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #333",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="quantidade" fill="#6366f1" radius={[0, 4, 4, 0]} name="Quantidade" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#27a75c]/60">Sem dados</div>
              )}
            </div>
          </div>

          {/* Distribuição de Quantidades */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Distribuição de Quantidades</h3>
            </div>
            <div className="h-[250px]">
              {dados.distribuicaoQuantidades.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.distribuicaoQuantidades}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="faixa" tick={{ fontSize: 11, fill: "#666" }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#666" }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #333",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="quantidade" fill="#ef4444" radius={[4, 4, 0, 0]} name="Quantidade" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#27a75c]/60">Sem dados</div>
              )}
            </div>
          </div>
        </div>

        {/* Gráficos de Linha - Linha 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Comparação Período a Período */}
          <div className="lg:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-[#27a75c]" />
              <h3 className="text-lg font-semibold text-white">Comparação Período a Período</h3>
            </div>
            <div className="h-[280px]">
              {dados.comparacaoPeriodos.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dados.comparacaoPeriodos}>
                    <defs>
                      <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#27a75c" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#27a75c" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAnterior" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#666" }} interval={4} />
                    <YAxis allowDecimals={false} tick={{ fill: "#666" }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #333",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                    <Legend wrapperStyle={{ color: "#999" }} />
                    <Line 
                      type="monotone" 
                      dataKey="atual" 
                      stroke="#27a75c" 
                      strokeWidth={2}
                      name="Últimos 30 dias"
                      dot={{ r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="anterior" 
                      stroke="#64748b" 
                      strokeWidth={2}
                      name="30 dias anteriores"
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#27a75c]/60">Sem dados</div>
              )}
            </div>
          </div>
        </div>

        {/* Gráficos de Linha - Linha 6 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Taxa de Sucesso do Webhook */}
          <div className="lg:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="h-5 w-5 text-[#27a75c]" />
              <h3 className="text-lg font-semibold text-white">Taxa de Sucesso do Webhook</h3>
            </div>
            <div className="h-[280px]">
              {dados.taxaSucessoPorDia.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dados.taxaSucessoPorDia}>
                    <defs>
                      <linearGradient id="colorTaxa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#27a75c" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#27a75c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#666" }} interval={4} />
                    <YAxis tick={{ fill: "#666" }} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #333",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                      formatter={(value: number) => [`${value}%`, "Taxa de Sucesso"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="taxa" 
                      stroke="#27a75c" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorTaxa)" 
                      name="Taxa de Sucesso (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#27a75c]/60">Sem dados</div>
              )}
            </div>
          </div>
        </div>

        {/* Gráficos de Linha - Linha 7 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico Combinado Múltiplas Métricas */}
          <div className="lg:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-[#27a75c]" />
              <h3 className="text-lg font-semibold text-white">Métricas Combinadas</h3>
            </div>
            <div className="h-[280px]">
              {dados.metricasCombinadas.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dados.metricasCombinadas}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#666" }} interval={4} />
                    <YAxis yAxisId="left" allowDecimals={false} tick={{ fill: "#666" }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #333",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                    <Legend wrapperStyle={{ color: "#999" }} />
                    <Bar yAxisId="left" dataKey="solicitacoes" fill="#27a75c" name="Total Solicitações" />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="sucesso" 
                      stroke="#27a75c" 
                      strokeWidth={2}
                      name="Sucesso"
                      dot={{ r: 3 }}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="erro" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Erro"
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#27a75c]/60">Sem dados</div>
              )}
            </div>
          </div>
        </div>

        {/* Gráficos de Linha - Linha 8 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Solicitações por Hora */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-teal-400" />
              <h3 className="text-lg font-semibold text-white">Solicitações por Hora</h3>
            </div>
            <div className="h-[250px]">
              {dados.solicitacoesPorHora.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.solicitacoesPorHora}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="hora" tick={{ fontSize: 10, fill: "#666" }} interval={2} />
                    <YAxis allowDecimals={false} tick={{ fill: "#666" }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #333",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="quantidade" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Solicitações" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#27a75c]/60">Sem dados</div>
              )}
            </div>
          </div>

          {/* Card de Comparação de Períodos */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-[#27a75c]" />
              <h3 className="text-lg font-semibold text-white">Crescimento</h3>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-4">
                <p className="text-sm text-[#27a75c]/70 mb-2">Últimos 30 dias</p>
                <p className="text-2xl font-bold text-white">{dados.resumo.ultimos30Dias}</p>
              </div>
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-4">
                <p className="text-sm text-slate-400/70 mb-2">30 dias anteriores</p>
                <p className="text-2xl font-bold text-white">{dados.resumo.periodoAnterior}</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-[#27a75c]/20 to-[#00477a]/10 border border-[#27a75c]/20 p-4">
                <p className="text-sm text-[#2cb866] mb-2">Variação</p>
                <p className="text-2xl font-bold text-white">
                  {dados.resumo.periodoAnterior > 0 
                    ? `${(((dados.resumo.ultimos30Dias - dados.resumo.periodoAnterior) / dados.resumo.periodoAnterior) * 100).toFixed(1)}%`
                    : dados.resumo.ultimos30Dias > 0 ? "+100%" : "0%"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
