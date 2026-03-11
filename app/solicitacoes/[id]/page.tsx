"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ArrowLeft, Send } from "lucide-react"

interface SolicitacaoDetalhada {
  id: string
  vendedor?: string | null
  marca?: string | null
  contato?: string | null
  codigoMetrics?: string | null
  empresa?: string | null
  unidade?: string | null
  nomeSolicitante?: string | null
  emailSolicitante?: string | null
  telefoneSolicitante?: string | null
  prazoDesejado?: string | null
  observacoesGerais?: string | null
  tipoContrato?: string | null
  imposto?: string | null
  condicaoPagamento?: string | null
  condicaoPagamentoOutra?: string | null
  royalties?: string | null
  bvAgencia?: string | null
  localUnico?: boolean | null
  cidadeUF?: string | null
  quantidadeLocalUnico?: number | null
  quantidadeUnica?: number | null
  quantidadeMultiplasEntregas?: number | null
  pedidoMinimoCIF?: string | null
  cidadesUFMultiplas?: string | null
  quantidadeMultiplos?: string | null
  numeroEntregas?: string | null
  frequencia?: string | null
  frequenciaOutra?: string | null
  frete?: string | null
  freteQuantidade?: number | null
  freteQuantidades?: number[] | null
  statusWebhook: string
  responseWebhook?: string | null
  webhookEnviadoEm?: string | null
  createdAt: string
  itens: Array<{
    produtoTipo: { nome: string; codigo: string } | null
    produtoModelo: { nome: string; codigo: string } | null
    variacaoEnvelope?: string | null
    formatoPadrao?: { nome: string; largura?: number | null; altura?: number | null; lateral?: number | null } | null
    formatoCustomLargura?: number | null
    formatoCustomAltura?: number | null
    formatoCustomLateral?: number | null
    formatoCustomObservacoes?: string | null
    larguraPadrao?: number | null
    alturaPadrao?: number | null
    sanfona?: number | null
    aba?: number | null
    alturaTampa?: number | null
    modeloEspecial?: string | null
    colagem?: string | null
    substrato: { nome: string } | null
    substratoGramagem?: string | null
    alcaTipo?: { nome: string } | null
    alcaLargura?: string | null
    alcaCor?: string | null
    alcaCorCustom?: string | null
    alcaAplicacao?: string | null
    alcaComprimento?: number | null
    reforcoFundo: boolean
    reforcoFundoModelo?: string | null
    bocaPalhaco: boolean
    furoFita: boolean
    furoFitaModelo?: string | null
    duplaFace?: boolean | null
    velcro?: boolean | null
    velcroCor?: string | null
    velcroTamanho?: number | null
    impressaoModo?: { nome: string } | null
    impressaoCombinacao?: { nome: string } | null
    impressaoCamadas?: any
    impressaoObservacoes?: string | null
    percentualImpressaoExterna?: number | null
    percentualImpressaoInterna?: number | null
    impressaoApara?: boolean | null
    percentualImpressaoApara?: number | null
    impressaoAparaObservacoes?: string | null
    impressaoSaco?: boolean | null
    impressaoEnvelope?: boolean | null
    corFita?: string | null
    corteRegistrado?: boolean | null
    corteRegistradoTerceirizado?: boolean | null
    acondicionamento?: { nome: string } | null
    modulo?: { nome: string } | null
    quantidade?: number | null
    desenvolvimentoObservacoes?: string | null
    enobrecimentos: Array<{
      enobrecimentoTipo: { nome: string } | null
      dados?: any
      observacoes?: string | null
    }>
  }>
}

function Campo({ label, valor }: { label: string; valor?: string | number | boolean | null }) {
  if (valor === undefined || valor === null || valor === "") return null
  const valorStr = typeof valor === "boolean" ? (valor ? "Sim" : "Nao") : String(valor)
  return (
    <div className="flex justify-between py-2 border-b border-white/[0.06] last:border-0 gap-4">
      <span className="text-[#27a75c]">{label}</span>
      <span className="text-white text-right">{valorStr}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function SolicitacaoDetalhePage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [solicitacao, setSolicitacao] = useState<SolicitacaoDetalhada | null>(null)
  const [loading, setLoading] = useState(true)
  const [enviandoWebhook, setEnviandoWebhook] = useState(false)

  useEffect(() => {
    if (!id) return

    fetch(`/api/solicitacoes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setSolicitacao(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Erro ao carregar solicitacao:", err)
        setLoading(false)
      })
  }, [id])

  const handleDownloadPDF = async () => {
    if (!solicitacao) return
    try {
      const response = await fetch(`/api/solicitacoes/${solicitacao.id}/pdf`)
      if (!response.ok) throw new Error("Erro ao baixar PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const nomeBaseArquivo = (solicitacao.marca || solicitacao.empresa || solicitacao.vendedor || "solicitacao")
        .replace(/[^a-zA-Z0-9]/g, "_")
      link.download = `orcamento-${nomeBaseArquivo}-${solicitacao.id.substring(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao baixar PDF:", error)
      alert("Erro ao baixar o relatorio PDF.")
    }
  }

  const handleEnviarWebhook = async () => {
    if (!solicitacao) return
    setEnviandoWebhook(true)
    try {
      const response = await fetch(`/api/solicitacoes/${solicitacao.id}/webhook`, {
        method: "POST",
      })
      const data = await response.json()

      if (data.sucesso) {
        alert("Webhook enviado com sucesso!")
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
            <p className="text-[#27a75c]/70 mb-4">Solicitacao nao encontrada</p>
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

  const item = solicitacao.itens?.[0]
  const quantidadeEntregasRaw =
    solicitacao.quantidadeLocalUnico ??
    solicitacao.quantidadeUnica ??
    solicitacao.quantidadeMultiplasEntregas ??
    solicitacao.freteQuantidade ??
    solicitacao.quantidadeMultiplos ??
    undefined
  const quantidadeEntregas =
    typeof quantidadeEntregasRaw === "number"
      ? quantidadeEntregasRaw.toLocaleString("pt-BR")
      : quantidadeEntregasRaw
  const frequenciaEntrega = solicitacao.frequenciaOutra || solicitacao.frequencia
  const freteQuantidadesTexto =
    solicitacao.freteQuantidades && solicitacao.freteQuantidades.length > 0
      ? solicitacao.freteQuantidades.join(", ")
      : solicitacao.freteQuantidade
        ? String(solicitacao.freteQuantidade)
        : undefined

  const semAcabamentos =
    !item?.reforcoFundo &&
    !item?.bocaPalhaco &&
    !item?.furoFita &&
    !item?.duplaFace &&
    !item?.velcro

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
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
            <Campo label="Vendedor" valor={solicitacao.vendedor || solicitacao.nomeSolicitante} />
            <Campo label="Marca" valor={solicitacao.marca || solicitacao.empresa} />
            <Campo label="Contato" valor={solicitacao.contato || solicitacao.telefoneSolicitante || solicitacao.emailSolicitante} />
            <Campo label="Codigo Metrics" valor={solicitacao.codigoMetrics} />
            <Campo label="Solicitado em" valor={new Date(solicitacao.createdAt).toLocaleDateString("pt-BR")} />
            <Campo label="Observacoes" valor={solicitacao.observacoesGerais} />
          </Section>

          <Section title="Condicoes de Venda">
            <Campo label="Tipo de Contrato" valor={solicitacao.tipoContrato} />
            <Campo label="Imposto" valor={solicitacao.imposto} />
            <Campo label="Condicao de Pagamento" valor={solicitacao.condicaoPagamento} />
            <Campo label="Condicao de Pagamento (Outra)" valor={solicitacao.condicaoPagamentoOutra} />
            <Campo label="% Royalties" valor={solicitacao.royalties} />
            <Campo label="BV Agencia" valor={solicitacao.bvAgencia} />
            {!solicitacao.tipoContrato && !solicitacao.imposto && !solicitacao.condicaoPagamento && (
              <p className="text-[#27a75c]/60">Nenhuma condicao de venda informada</p>
            )}
          </Section>

          <Section title="Entregas">
            <Campo
              label="Local Unico"
              valor={
                solicitacao.localUnico === undefined || solicitacao.localUnico === null
                  ? undefined
                  : (solicitacao.localUnico ? "Sim" : "Nao")
              }
            />
            <Campo label="Cidade/UF" valor={solicitacao.cidadeUF} />
            <Campo label="Quantidade" valor={quantidadeEntregas} />
            <Campo label="Pedido Minimo CIF" valor={solicitacao.pedidoMinimoCIF} />
            <Campo label="Cidades/UF Multiplas" valor={solicitacao.cidadesUFMultiplas} />
            <Campo label="N Entregas" valor={solicitacao.numeroEntregas} />
            <Campo label="Frequencia" valor={frequenciaEntrega} />
            <Campo label="Frete" valor={solicitacao.frete} />
            <Campo label="Quantidades Frete" valor={freteQuantidadesTexto} />
            {!solicitacao.cidadeUF && !solicitacao.frete && !solicitacao.numeroEntregas && (
              <p className="text-[#27a75c]/60">Nenhuma informacao de entrega</p>
            )}
          </Section>

          <Section title="Produto">
            <Campo label="Tipo" valor={item?.produtoTipo?.nome} />
            <Campo label="Modelo" valor={item?.produtoModelo?.nome} />
            <Campo label="Quantidade (Orcamento)" valor={solicitacao.quantidadeMultiplos} />
            <Campo label="Variacao" valor={item?.variacaoEnvelope} />
          </Section>

          <Section title="Tamanho">
            {item?.formatoPadrao && (
              <Campo
                label="Formato Padrao"
                valor={`${item.formatoPadrao.nome}${item.formatoPadrao.largura ? ` (${item.formatoPadrao.largura}x${item.formatoPadrao.altura}${item.formatoPadrao.lateral ? `x${item.formatoPadrao.lateral}` : ""} mm)` : ""}`}
              />
            )}
            <Campo label="Largura" valor={item?.formatoCustomLargura ? `${item.formatoCustomLargura} mm` : undefined} />
            <Campo label="Altura" valor={item?.formatoCustomAltura ? `${item.formatoCustomAltura} mm` : undefined} />
            <Campo label="Lateral" valor={item?.formatoCustomLateral ? `${item.formatoCustomLateral} mm` : undefined} />
            <Campo label="Largura Padrao" valor={item?.larguraPadrao ? `${item.larguraPadrao} mm` : undefined} />
            <Campo label="Altura Padrao" valor={item?.alturaPadrao ? `${item.alturaPadrao} mm` : undefined} />
            <Campo label="Sanfona" valor={item?.sanfona ? `${item.sanfona} mm` : undefined} />
            <Campo label="Observacoes" valor={item?.formatoCustomObservacoes} />
          </Section>

          <Section title="Material">
            <Campo label="Substrato" valor={item?.substrato?.nome} />
            <Campo label="Gramagem" valor={item?.substratoGramagem} />
          </Section>

          <Section title="Alca e Detalhes">
            {item?.alcaTipo ? (
              <>
                <Campo label="Tipo" valor={item.alcaTipo.nome} />
                <Campo label="Largura" valor={item.alcaLargura} />
                <Campo label="Cor" valor={item.alcaCorCustom || item.alcaCor} />
                <Campo label="Aplicacao" valor={item.alcaAplicacao} />
                <Campo label="Comprimento" valor={item.alcaComprimento ? `${item.alcaComprimento} cm` : undefined} />
              </>
            ) : (
              <p className="text-[#27a75c]/60">Sem alca</p>
            )}
          </Section>

          <Section title="Impressao">
            <Campo label="Modo" valor={item?.impressaoModo?.nome || "Sem impressao"} />
            <Campo label="Combinacao" valor={item?.impressaoCombinacao?.nome} />
            <Campo label="% Externa" valor={item?.percentualImpressaoExterna ? `${item.percentualImpressaoExterna}%` : undefined} />
            <Campo label="% Interna" valor={item?.percentualImpressaoInterna ? `${item.percentualImpressaoInterna}%` : undefined} />
            <Campo label="Cor da Fita" valor={item?.corFita} />
            <Campo label="Corte Registrado" valor={item?.corteRegistrado ? (item.corteRegistradoTerceirizado ? "Sim (Terceirizado)" : "Sim") : undefined} />
            <Campo label="Observacoes" valor={item?.impressaoObservacoes} />
          </Section>

          <Section title="Acabamentos">
            <Campo label="Reforco de Fundo" valor={item?.reforcoFundo ? (item.reforcoFundoModelo || "Sim") : undefined} />
            <Campo label="Boca de Palhaco" valor={item?.bocaPalhaco ? "Sim" : undefined} />
            <Campo label="Furo de Fita" valor={item?.furoFita ? (item.furoFitaModelo || "Sim") : undefined} />
            <Campo label="Dupla Face" valor={item?.duplaFace ? "Sim" : undefined} />
            <Campo label="Velcro" valor={item?.velcro ? "Sim" : undefined} />
            {semAcabamentos && (
              <p className="text-[#27a75c]/60">Nenhum acabamento selecionado</p>
            )}
          </Section>

          <Section title="Enobrecimentos">
            {item?.enobrecimentos && item.enobrecimentos.length > 0 ? (
              <div className="space-y-3">
                {item.enobrecimentos.map((enob, index) => (
                  <div key={index} className="rounded-lg border border-[#27a75c]/20 bg-[#27a75c]/5 p-3">
                    <p className="font-medium text-[#27a75c]">{enob.enobrecimentoTipo?.nome}</p>
                    {enob.observacoes && <p className="text-sm text-[#27a75c]/70 mt-1">{enob.observacoes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#27a75c]/60">Nenhum enobrecimento selecionado</p>
            )}
          </Section>

          <Section title="Entrega e Quantidade">
            <Campo label="Acondicionamento" valor={item?.acondicionamento?.nome} />
            <Campo label="Modulo" valor={item?.modulo?.nome} />
            <Campo label="Quantidade" valor={item?.quantidade ? `${item.quantidade.toLocaleString("pt-BR")} unidades` : undefined} />
          </Section>

          {item?.desenvolvimentoObservacoes && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 overflow-hidden">
              <div className="px-5 py-3 border-b border-amber-500/20 bg-amber-500/10">
                <h3 className="font-semibold text-amber-400">Observacoes para Engenharia</h3>
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
