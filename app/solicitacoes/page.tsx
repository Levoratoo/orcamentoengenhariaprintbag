"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Plus, FileText, Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react"

interface Solicitacao {
  id: string
  empresa: string
  nomeSolicitante: string
  emailSolicitante: string
  statusWebhook: string
  createdAt: string
  itens: Array<{
    produtoTipo: { nome: string; id: string }
    produtoModelo: { nome: string }
  }>
}

interface Filtros {
  busca: string
  status: string
  dataInicio: string
  dataFim: string
  tipoProduto: string
  ordenarPor: string
  ordem: string
  pagina: number
}

interface TiposProduto {
  id: string
  nome: string
}

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [tiposProduto, setTiposProduto] = useState<TiposProduto[]>([])
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    porPagina: 20,
    total: 0,
    totalPaginas: 0,
  })
  const [filtros, setFiltros] = useState<Filtros>({
    busca: "",
    status: "",
    dataInicio: "",
    dataFim: "",
    tipoProduto: "",
    ordenarPor: "data",
    ordem: "desc",
    pagina: 1,
  })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const carregarSolicitacoes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtros.busca) params.append("busca", filtros.busca)
      if (filtros.status) params.append("status", filtros.status)
      if (filtros.dataInicio) params.append("dataInicio", filtros.dataInicio)
      if (filtros.dataFim) params.append("dataFim", filtros.dataFim)
      if (filtros.tipoProduto) params.append("tipoProduto", filtros.tipoProduto)
      params.append("ordenarPor", filtros.ordenarPor)
      params.append("ordem", filtros.ordem)
      params.append("pagina", filtros.pagina.toString())
      params.append("porPagina", "20")

      const response = await fetch(`/api/solicitacoes?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      const data = await response.json()
      
      if (data.solicitacoes && Array.isArray(data.solicitacoes)) {
        setSolicitacoes(data.solicitacoes)
        setPaginacao(data.paginacao || paginacao)
        if (data.filtros?.tiposProduto) {
          setTiposProduto(data.filtros.tiposProduto)
        }
      } else {
        console.error("Resposta da API inválida:", data)
        setSolicitacoes([])
      }
    } catch (err) {
      console.error("Erro ao carregar solicitações:", err)
      setSolicitacoes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarSolicitacoes()
  }, [filtros.pagina, filtros.ordenarPor, filtros.ordem, filtros.status, filtros.dataInicio, filtros.dataFim, filtros.tipoProduto])

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filtros.busca !== undefined) {
        setFiltros(prev => ({ ...prev, pagina: 1 }))
        carregarSolicitacoes()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [filtros.busca])

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      status: "",
      dataInicio: "",
      dataFim: "",
      tipoProduto: "",
      ordenarPor: "data",
      ordem: "desc",
      pagina: 1,
    })
  }

  const temFiltrosAtivos = filtros.status || filtros.dataInicio || filtros.dataFim || filtros.tipoProduto

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sucesso":
        return <Badge className="bg-[#27a75c]/20 text-[#27a75c] border-[#27a75c]/30">Enviado</Badge>
      case "erro":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Erro</Badge>
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>
    }
  }

  const handleDownloadPDF = async (solicitacaoId: string, empresaNome: string) => {
    try {
      const response = await fetch(`/api/solicitacoes/${solicitacaoId}/pdf`)
      if (!response.ok) {
        throw new Error("Erro ao baixar PDF")
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `orcamento-${empresaNome.replace(/[^a-zA-Z0-9]/g, "_")}-${solicitacaoId.substring(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao baixar PDF:", error)
      alert("Erro ao baixar o relatório PDF. Tente novamente.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27a75c]"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-[#27a75c] hover:text-white hover:bg-white/5 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Solicitações
              </h1>
              <p className="text-[#27a75c]/70">
                Visualize e gerencie todas as solicitações criadas
              </p>
            </div>
            <Link href="/solicitacoes/nova">
              <Button className="bg-gradient-to-r from-[#27a75c] to-[#00477a] hover:from-[#229a52] hover:to-[#003d6a] text-white gap-2">
                <Plus className="h-4 w-4" />
                Nova Solicitação
              </Button>
            </Link>
          </div>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="mb-6 space-y-4">
          {/* Busca */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por empresa, solicitante, e-mail..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                className="pl-10 bg-white/[0.03] border-white/[0.06] text-white"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {temFiltrosAtivos && (
                <Badge className="ml-2 bg-[#27a75c]/20 text-[#27a75c] border-[#27a75c]/30">
                  {[filtros.status, filtros.dataInicio, filtros.dataFim, filtros.tipoProduto].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            {temFiltrosAtivos && (
              <Button
                variant="ghost"
                onClick={limparFiltros}
                className="text-white/70 hover:text-white hover:bg-white/5"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>

          {/* Painel de Filtros */}
          {mostrarFiltros && (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro por Status */}
                <div className="space-y-2">
                  <Label className="text-sm text-[#27a75c]/70">Status</Label>
                  <Select
                    value={filtros.status || "all"}
                    onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value === "all" ? "" : value, pagina: 1 }))}
                  >
                    <SelectTrigger className="bg-white/[0.05] border-white/[0.1] text-white">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="sucesso">Enviado</SelectItem>
                      <SelectItem value="erro">Erro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Tipo de Produto */}
                <div className="space-y-2">
                  <Label className="text-sm text-[#27a75c]/70">Tipo de Produto</Label>
                  <Select
                    value={filtros.tipoProduto || "all"}
                    onValueChange={(value) => setFiltros(prev => ({ ...prev, tipoProduto: value === "all" ? "" : value, pagina: 1 }))}
                  >
                    <SelectTrigger className="bg-white/[0.05] border-white/[0.1] text-white">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {tiposProduto.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Data Início */}
                <div className="space-y-2">
                  <Label className="text-sm text-[#27a75c]/70">Data Início</Label>
                  <Input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value, pagina: 1 }))}
                    className="bg-white/[0.05] border-white/[0.1] text-white"
                  />
                </div>

                {/* Filtro por Data Fim */}
                <div className="space-y-2">
                  <Label className="text-sm text-[#27a75c]/70">Data Fim</Label>
                  <Input
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value, pagina: 1 }))}
                    className="bg-white/[0.05] border-white/[0.1] text-white"
                  />
                </div>
              </div>

              {/* Ordenação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/[0.06]">
                <div className="space-y-2">
                  <Label className="text-sm text-[#27a75c]/70">Ordenar por</Label>
                  <Select
                    value={filtros.ordenarPor}
                    onValueChange={(value) => setFiltros(prev => ({ ...prev, ordenarPor: value }))}
                  >
                    <SelectTrigger className="bg-white/[0.05] border-white/[0.1] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="empresa">Empresa</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-[#27a75c]/70">Ordem</Label>
                  <Select
                    value={filtros.ordem}
                    onValueChange={(value) => setFiltros(prev => ({ ...prev, ordem: value }))}
                  >
                    <SelectTrigger className="bg-white/[0.05] border-white/[0.1] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Decrescente</SelectItem>
                      <SelectItem value="asc">Crescente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contador de Resultados */}
        {!loading && (
          <div className="mb-4 text-sm text-[#27a75c]/70">
            {paginacao.total > 0 ? (
              <>
                Mostrando {((paginacao.pagina - 1) * paginacao.porPagina) + 1} a{" "}
                {Math.min(paginacao.pagina * paginacao.porPagina, paginacao.total)} de {paginacao.total} solicitações
              </>
            ) : (
              "Nenhuma solicitação encontrada"
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27a75c]"></div>
          </div>
        ) : !Array.isArray(solicitacoes) || solicitacoes.length === 0 ? (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-12 text-center">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-[#27a75c]/70 mb-6">
              {temFiltrosAtivos || filtros.busca
                ? "Nenhuma solicitação encontrada com os filtros aplicados"
                : "Nenhuma solicitação encontrada"}
            </p>
            {(temFiltrosAtivos || filtros.busca) && (
              <Button
                variant="outline"
                onClick={limparFiltros}
                className="mb-4 border-white/10 text-white hover:bg-white/5"
              >
                Limpar Filtros
              </Button>
            )}
            <Link href="/solicitacoes/nova">
              <Button className="bg-gradient-to-r from-[#27a75c] to-[#00477a] hover:from-[#229a52] hover:to-[#003d6a]">
                Criar Primeira Solicitação
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {solicitacoes.map((solicitacao) => (
                <div 
                  key={solicitacao.id} 
                  className="group rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {solicitacao.empresa}
                        </h3>
                        {getStatusBadge(solicitacao.statusWebhook)}
                      </div>
                      <p className="text-sm text-[#27a75c]/70 mb-1">
                        {solicitacao.nomeSolicitante} • {solicitacao.emailSolicitante}
                      </p>
                      {solicitacao.itens.length > 0 && (
                        <p className="text-sm text-[#27a75c]/60">
                          {solicitacao.itens[0].produtoTipo.nome} - {solicitacao.itens[0].produtoModelo.nome}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(solicitacao.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDownloadPDF(solicitacao.id, solicitacao.empresa)}
                        title="Baixar PDF"
                        className="text-[#27a75c] hover:text-white hover:bg-white/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Link href={`/solicitacoes/${solicitacao.id}`}>
                        <Button variant="ghost" className="text-[#27a75c] hover:text-white hover:bg-white/10">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {paginacao.totalPaginas > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-[#27a75c]/70">
                  Página {paginacao.pagina} de {paginacao.totalPaginas}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiltros(prev => ({ ...prev, pagina: prev.pagina - 1 }))}
                    disabled={paginacao.pagina === 1}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiltros(prev => ({ ...prev, pagina: prev.pagina + 1 }))}
                    disabled={paginacao.pagina === paginacao.totalPaginas}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
