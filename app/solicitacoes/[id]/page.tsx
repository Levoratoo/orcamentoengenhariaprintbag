"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ArrowLeft, Send } from "lucide-react"

interface SolicitacaoDetalhada {
  id: string
  empresa: string
  unidade?: string
  nomeSolicitante: string
  emailSolicitante: string
  telefoneSolicitante?: string
  prazoDesejado?: string
  observacoesGerais?: string
  statusWebhook: string
  responseWebhook?: string
  webhookEnviadoEm?: string
  createdAt: string
  itens: Array<{
    produtoTipo: { nome: string; codigo: string }
    produtoModelo: { nome: string; codigo: string }
    variacaoEnvelope?: string
    formatoPadrao?: { nome: string; largura?: number; altura?: number; lateral?: number }
    formatoCustomLargura?: number
    formatoCustomAltura?: number
    formatoCustomLateral?: number
    formatoCustomObservacoes?: string
    larguraPadrao?: number
    alturaPadrao?: number
    sanfona?: number
    aba?: number
    alturaTampa?: number
    modeloEspecial?: string
    colagem?: string
    substrato: { nome: string }
    substratoGramagem?: string
    alcaTipo?: { nome: string }
    alcaLargura?: string
    alcaCor?: string
    alcaCorCustom?: string
    alcaAplicacao?: string
    alcaComprimento?: number
    reforcoFundo: boolean
    reforcoFundoModelo?: string
    bocaPalhaco: boolean
    furoFita: boolean
    furoFitaModelo?: string
    duplaFace?: boolean
    velcro?: boolean
    velcroCor?: string
    velcroTamanho?: number
    impressaoModo?: { nome: string }
    impressaoCombinacao?: { nome: string }
    impressaoCamadas?: any
    impressaoObservacoes?: string
    percentualImpressaoExterna?: number
    percentualImpressaoInterna?: number
    impressaoApara?: boolean
    percentualImpressaoApara?: number
    impressaoAparaObservacoes?: string
    impressaoSaco?: boolean
    impressaoEnvelope?: boolean
    corFita?: string
    corteRegistrado?: boolean
    corteRegistradoTerceirizado?: boolean
    acondicionamento?: { nome: string }
    modulo?: { nome: string }
    quantidade: number
    desenvolvimentoObservacoes?: string
    enobrecimentos: Array<{
      enobrecimentoTipo: { nome: string }
      dados?: any
      observacoes?: string
    }>
  }>
}

function Campo({ label, valor }: { label: string; valor?: string | number | boolean | null }) {
  if (valor === undefined || valor === null || valor === "" || valor === false) return null
  const valorStr = typeof valor === "boolean" ? "Sim" : String(valor)
  return (
    <div className="flex justify-between py-2 border-b border-white/[0.06] last:border-0">
      <span className="text-[#27a75c]">{label}</span>
      <span className="text-white">{valorStr}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

export default function SolicitacaoDetalhePage() {
  const params = useParams()
  const [solicitacao, setSolicitacao] = useState<SolicitacaoDetalhada | null>(null)
  const [loading, setLoading] = useState(true)
  const [enviandoWebhook, setEnviandoWebhook] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/solicitacoes/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setSolicitacao(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error("Erro ao carregar solicitação:", err)
          setLoading(false)
        })
    }
  }, [params.id])

  const handleDownloadPDF = async () => {
    if (!solicitacao) return
    try {
      const response = await fetch(`/api/solicitacoes/${solicitacao.id}/pdf`)
      if (!response.ok) throw new Error("Erro ao baixar PDF")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `orcamento-${solicitacao.empresa.replace(/[^a-zA-Z0-9]/g, "_")}-${solicitacao.id.substring(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao baixar PDF:", error)
      alert("Erro ao baixar o relatório PDF.")
    }
  }

  const handleEnviarWebhook = async () => {
    console.log("handleEnviarWebhook chamado", { solicitacao: solicitacao?.id })
    if (!solicitacao) {
      console.log("Solicitação não encontrada")
      return
    }
    console.log("Iniciando envio de webhook...")
    setEnviandoWebhook(true)
    try {
      console.log(`Enviando POST para /api/solicitacoes/${solicitacao.id}/webhook`)
      const response = await fetch(`/api/solicitacoes/${solicitacao.id}/webhook`, {
        method: "POST",
      })
      console.log("Resposta recebida:", response.status, response.statusText)
      const data = await response.json()
      console.log("Dados da resposta:", data)
      
      if (data.sucesso) {
        alert("Webhook enviado com sucesso!")
        // Recarregar dados da solicitação para atualizar o status
        const res = await fetch(`/api/solicitacoes/${solicitacao.id}`)
        const updated = await res.json()
        setSolicitacao(updated)
      } else {
        alert(`Erro ao enviar webhook: ${data.erro || data.detalhes || "Erro desconhecido"}`)
      }
    } catch (error: any) {
      console.error("Erro ao enviar webhook:", error)
      alert(`Erro ao enviar webhook: ${error.message || "Erro desconhecido"}`)
    } finally {
      setEnviandoWebhook(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27a75c]"></div>
        </div>
      </div>
    )
  }

  if (!solicitacao) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-12 text-center">
            <p className="text-[#27a75c]/70 mb-4">Solicitação não encontrada</p>
            <Link href="/solicitacoes">
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                Voltar para Lista
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sucesso":
        return <Badge className="bg-[#27a75c]/20 text-[#27a75c] border-[#27a75c]/30">Enviado com Sucesso</Badge>
      case "erro":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Erro no Envio</Badge>
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>
    }
  }

  const item = solicitacao.itens[0]
  const camadasImpressao = item?.impressaoCamadas 
    ? (typeof item.impressaoCamadas === "string" ? JSON.parse(item.impressaoCamadas) : item.impressaoCamadas)
    : null

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/solicitacoes">
            <Button variant="ghost" className="gap-2 text-[#27a75c] hover:text-white hover:bg-white/5 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">Detalhes</h1>
                {getStatusBadge(solicitacao.statusWebhook)}
              </div>
              <p className="text-[#27a75c]/60">
                ID: {solicitacao.id.substring(0, 8).toUpperCase()} • {new Date(solicitacao.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log("Botão clicado! ID:", solicitacao?.id)
                  handleEnviarWebhook()
                }}
                disabled={enviandoWebhook}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium px-4 py-2 border border-white/10 bg-transparent text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                type="button"
              >
                <Send className="h-4 w-4" />
                {enviandoWebhook ? "Enviando..." : "Enviar Webhook"}
              </button>
              <Button onClick={handleDownloadPDF} variant="outline" className="gap-2 border-white/10 text-white hover:bg-white/5">
                <Download className="h-4 w-4" />
                Baixar PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Section title="Dados do Pedido">
            <Campo label="Empresa" valor={solicitacao.empresa} />
            <Campo label="Unidade" valor={solicitacao.unidade} />
            <Campo label="Solicitante" valor={solicitacao.nomeSolicitante} />
            <Campo label="E-mail" valor={solicitacao.emailSolicitante} />
            <Campo label="Telefone" valor={solicitacao.telefoneSolicitante} />
            <Campo label="Prazo Desejado" valor={solicitacao.prazoDesejado ? new Date(solicitacao.prazoDesejado).toLocaleDateString("pt-BR") : undefined} />
            <Campo label="Observações" valor={solicitacao.observacoesGerais} />
          </Section>

          <Section title="Produto">
            <Campo label="Tipo" valor={item?.produtoTipo?.nome} />
            <Campo label="Modelo" valor={item?.produtoModelo?.nome} />
            <Campo label="Variação" valor={item?.variacaoEnvelope} />
          </Section>

          <Section title="Tamanho">
            {item?.formatoPadrao && (
              <Campo label="Formato Padrão" valor={`${item.formatoPadrao.nome}${item.formatoPadrao.largura ? ` (${item.formatoPadrao.largura}x${item.formatoPadrao.altura}${item.formatoPadrao.lateral ? `x${item.formatoPadrao.lateral}` : ""} mm)` : ""}`} />
            )}
            <Campo label="Largura" valor={item?.formatoCustomLargura ? `${item.formatoCustomLargura} mm` : undefined} />
            <Campo label="Altura" valor={item?.formatoCustomAltura ? `${item.formatoCustomAltura} mm` : undefined} />
            <Campo label="Lateral" valor={item?.formatoCustomLateral ? `${item.formatoCustomLateral} mm` : undefined} />
            <Campo label="Largura Padrão" valor={item?.larguraPadrao ? `${item.larguraPadrao} mm` : undefined} />
            <Campo label="Altura Padrão" valor={item?.alturaPadrao ? `${item.alturaPadrao} mm` : undefined} />
            <Campo label="Sanfona" valor={item?.sanfona ? `${item.sanfona} mm` : undefined} />
            <Campo label="Observações" valor={item?.formatoCustomObservacoes} />
          </Section>

          <Section title="Material">
            <Campo label="Substrato" valor={item?.substrato?.nome} />
            <Campo label="Gramagem" valor={item?.substratoGramagem} />
          </Section>

          <Section title="Alça">
            {item?.alcaTipo ? (
              <>
                <Campo label="Tipo" valor={item.alcaTipo.nome} />
                <Campo label="Largura" valor={item.alcaLargura} />
                <Campo label="Cor" valor={item.alcaCorCustom || item.alcaCor} />
                <Campo label="Aplicação" valor={item.alcaAplicacao} />
                <Campo label="Comprimento" valor={item.alcaComprimento ? `${item.alcaComprimento} cm` : undefined} />
              </>
            ) : (
              <p className="text-[#27a75c]/60">Sem alça</p>
            )}
          </Section>

          <Section title="Impressão">
            <Campo label="Modo" valor={item?.impressaoModo?.nome || "Sem impressão"} />
            <Campo label="Combinação" valor={item?.impressaoCombinacao?.nome} />
            <Campo label="% Externa" valor={item?.percentualImpressaoExterna ? `${item.percentualImpressaoExterna}%` : undefined} />
            <Campo label="% Interna" valor={item?.percentualImpressaoInterna ? `${item.percentualImpressaoInterna}%` : undefined} />
            <Campo label="Cor da Fita" valor={item?.corFita} />
            <Campo label="Corte Registrado" valor={item?.corteRegistrado ? (item.corteRegistradoTerceirizado ? "Sim (Terceirizado)" : "Sim") : undefined} />
            <Campo label="Observações" valor={item?.impressaoObservacoes} />
          </Section>

          <Section title="Acabamentos">
            <Campo label="Reforço de Fundo" valor={item?.reforcoFundo ? (item.reforcoFundoModelo || "Sim") : undefined} />
            <Campo label="Boca de Palhaço" valor={item?.bocaPalhaco} />
            <Campo label="Furo de Fita" valor={item?.furoFita ? (item.furoFitaModelo || "Sim") : undefined} />
            <Campo label="Dupla Face" valor={item?.duplaFace} />
            <Campo label="Velcro" valor={item?.velcro} />
            {!item?.reforcoFundo && !item?.bocaPalhaco && !item?.furoFita && !item?.duplaFace && !item?.velcro && (
              <p className="text-[#27a75c]/60">Nenhum acabamento</p>
            )}
          </Section>

          <Section title="Enobrecimentos">
            {item?.enobrecimentos && item.enobrecimentos.length > 0 ? (
              <div className="space-y-3">
                {item.enobrecimentos.map((enob, index) => (
                  <div key={index} className="border-l-2 border-purple-500 pl-4 py-1">
                    <p className="font-medium text-purple-400">{enob.enobrecimentoTipo?.nome}</p>
                    {enob.observacoes && <p className="text-sm text-[#27a75c]/70 mt-1">{enob.observacoes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#27a75c]/60">Nenhum enobrecimento</p>
            )}
          </Section>

          <Section title="Acondicionamento">
            <Campo label="Tipo" valor={item?.acondicionamento?.nome} />
            <Campo label="Módulo" valor={item?.modulo?.nome} />
            <Campo label="Quantidade" valor={item?.quantidade ? `${item.quantidade.toLocaleString("pt-BR")} unidades` : undefined} />
          </Section>

          {item?.desenvolvimentoObservacoes && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 overflow-hidden">
              <div className="px-5 py-3 border-b border-amber-500/20 bg-amber-500/10">
                <h3 className="font-semibold text-amber-400">Observações para Engenharia</h3>
              </div>
              <div className="p-5">
                <p className="text-gray-300 whitespace-pre-wrap">{item.desenvolvimentoObservacoes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
