"use client"

import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SolicitacaoCompletaFormData } from "@/lib/validations/solicitacao"
import { getCatalogo, getModeloPorId } from "@/lib/catalogo"
import { Download } from "lucide-react"

interface EtapaRevisaoProps {
  form: UseFormReturn<SolicitacaoCompletaFormData>
  onSubmit: (data: SolicitacaoCompletaFormData) => Promise<void>
  isSubmitting: boolean
  onBack: () => void
}

export function EtapaRevisao({ form, onSubmit, isSubmitting, onBack }: EtapaRevisaoProps) {
  const data = form.watch()
  const catalogo = getCatalogo()

  // Buscar dados do catálogo
  const produtoTipo = catalogo.produtoTipos.find(t => t.id === data.produto.produtoTipoId)
  const produtoModelo = getModeloPorId(data.produto.produtoModeloId)
  const substrato = catalogo.substratos.find(s => s.id === data.substrato.substratoId)
  const formato = catalogo.formatosPadrao.find(f => f.id === data.formato.formatoPadraoId)
  const alcaTipo = catalogo.alcaTipos.find(t => t.id === data.alca?.tipoId)
  const impressaoModo = catalogo.impressaoModos.find(m => m.id === data.impressao?.modoId)
  const impressaoCombinacao = impressaoModo?.combinacoes.find(c => c.id === data.impressao?.combinacaoId)
  const acondicionamento = catalogo.acondicionamentos.find(a => a.id === data.acondicionamento.tipoId)
  const modulo = catalogo.modulos.find(m => m.id === data.acondicionamento.moduloId)
  const freteQuantidadesTexto = data.entregas?.freteQuantidades && data.entregas.freteQuantidades.length > 0
    ? data.entregas.freteQuantidades.join(", ")
    : data.entregas?.freteQuantidade
      ? String(data.entregas.freteQuantidade)
      : undefined

  const getPrimeiroErro = (value: unknown): string | null => {
    if (!value || typeof value !== "object") {
      return null
    }

    const erro = value as Record<string, unknown>
    if (typeof erro.message === "string" && erro.message.trim() !== "") {
      return erro.message
    }

    for (const nested of Object.values(erro)) {
      const nestedMessage = getPrimeiroErro(nested)
      if (nestedMessage) {
        return nestedMessage
      }
    }

    return null
  }

  const handleSubmit = form.handleSubmit(
    onSubmit,
    (errors) => {
      console.error("Validação bloqueou confirmação:", errors)
      const primeiroErro = getPrimeiroErro(errors)
      if (primeiroErro) {
        alert(`Revise os campos obrigatórios antes de confirmar.\n\n${primeiroErro}`)
      } else {
        alert("Revise os campos obrigatórios antes de confirmar.")
      }
    }
  )

  const handleGerarPDF = async () => {
    const { gerarPDF } = await import("@/lib/pdf")
    await gerarPDF(data)
  }

  const sectionCardClass = "bg-gradient-to-br from-white/[0.05] to-white/[0.02] border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.2)]"
  const sectionHeaderClass = "bg-white/[0.02] py-3.5 border-b border-white/[0.08]"
  const sectionTitleClass = "text-base font-semibold tracking-tight text-white"

  // Helper para renderizar campo se tiver valor
  const Campo = ({ label, valor }: { label: string; valor?: string | number | boolean | null }) => {
    if (valor === undefined || valor === null || valor === "" || valor === false) return null
    const valorStr = typeof valor === "boolean" ? "Sim" : String(valor)
    return (
      <div className="grid grid-cols-[170px_1fr] items-start gap-3 py-2.5 border-b border-white/[0.06] last:border-0">
        <span className="text-[11px] uppercase tracking-wider text-[#27a75c]/80 font-semibold">{label}</span>
        <span className="text-sm text-white leading-relaxed break-words">{valorStr}</span>
      </div>
    )
  }

  // Coletar TODAS as observações de "Outro (Desenvolvimento)" de todas as etapas
  const observacoesDesenvolvimento: Array<{etapa: string, campo: string, descricao: string}> = []
  
  // Etapa: Tamanho
  if (data.formato.formatoOutroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Tamanho", campo: "Formato", descricao: data.formato.formatoOutroDescricao })
  }
  if (data.formato.larguraOutroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Tamanho", campo: "Largura", descricao: data.formato.larguraOutroDescricao })
  }
  if (data.formato.alturaOutroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Tamanho", campo: "Altura", descricao: data.formato.alturaOutroDescricao })
  }
  if (data.formato.sanfonaOutroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Tamanho", campo: "Sanfona", descricao: data.formato.sanfonaOutroDescricao })
  }
  
  // Etapa: Material
  if (data.substrato.outroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Material", campo: "Substrato", descricao: data.substrato.outroDescricao })
  }
  if (data.substrato.gramagemOutroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Material", campo: "Gramagem", descricao: data.substrato.gramagemOutroDescricao })
  }
  
  // Etapa: Alça e Detalhes
  if (data.alca?.outroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Alça e Detalhes", campo: "Tipo de Alça", descricao: data.alca.outroDescricao })
  }
  if (data.alca?.larguraOutroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Alça e Detalhes", campo: "Largura", descricao: data.alca.larguraOutroDescricao })
  }
  if (data.alca?.corOutroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Alça e Detalhes", campo: "Cor", descricao: data.alca.corOutroDescricao })
  }
  if (data.alca?.aplicacaoOutroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Alça e Detalhes", campo: "Aplicação", descricao: data.alca.aplicacaoOutroDescricao })
  }
  
  // Etapa: Impressão
  if (data.impressao?.outroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Impressão", campo: "Modo de Impressão", descricao: data.impressao.outroDescricao })
  }
  
  // Etapa: Acabamentos
  if (data.acabamentos?.outroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Acabamentos", campo: "Outro Acabamento", descricao: data.acabamentos.outroDescricao })
  }
  
  // Etapa: Enobrecimentos
  // (verificar se tem algum enobrecimento com observações de desenvolvimento)
  data.enobrecimentos?.forEach((enob, index) => {
    if (enob.observacoes) {
      const tipo = catalogo.enobrecimentoTipos.find(t => t.id === enob.tipoId)
      observacoesDesenvolvimento.push({ 
        etapa: "Enobrecimentos", 
        campo: tipo?.nome || `Enobrecimento ${index + 1}`, 
        descricao: enob.observacoes 
      })
    }
  })
  
  // Etapa: Entrega e Quantidade
  if (data.acondicionamento.outroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Entrega e Quantidade", campo: "Acondicionamento", descricao: data.acondicionamento.outroDescricao })
  }
  if (data.acondicionamento.moduloOutroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Entrega e Quantidade", campo: "Módulo", descricao: data.acondicionamento.moduloOutroDescricao })
  }
  
  // Observações gerais de desenvolvimento (campo específico para engenharia)
  if (data.desenvolvimentoObservacoes) {
    observacoesDesenvolvimento.push({ etapa: "Desenvolvimento", campo: "Obs. Geral", descricao: data.desenvolvimentoObservacoes })
  }
  
  const temObservacoesDesenvolvimento = observacoesDesenvolvimento.length > 0

  return (
    <div className="space-y-6">
      <div className="border-b border-white/[0.08] pb-5">
        <span className="inline-flex items-center rounded-full border border-[#27a75c]/30 bg-[#27a75c]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#27a75c]">
          Resumo da Solicitação
        </span>
        <h2 className="mt-3 text-2xl font-bold text-white">Revisão Final</h2>
        <p className="text-[#27a75c]/80 mt-1.5">
          Confira os dados abaixo antes de confirmar o envio.
        </p>
      </div>

      <div className="grid gap-4">
        {/* DADOS DO PEDIDO */}
        <Card className={sectionCardClass}>
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Dados do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Campo label="Empresa" valor={data.dadosGerais.empresa} />
            <Campo label="Unidade" valor={data.dadosGerais.unidade} />
            <Campo label="Solicitante" valor={data.dadosGerais.nomeSolicitante} />
            <Campo label="Vendedor" valor={data.dadosGerais.vendedor} />
            <Campo label="Marca" valor={data.dadosGerais.marca} />
            <Campo label="Contato" valor={data.dadosGerais.contato} />
            <Campo label="Código Metrics" valor={data.dadosGerais.codigoMetrics} />
            <Campo label="Solicitado em" valor={new Date().toLocaleDateString("pt-BR")} />
            <Campo label="Observações" valor={data.dadosGerais.observacoesGerais} />
          </CardContent>
        </Card>

        {/* CONDIÇÕES DE VENDA */}
        {data.condicoesVenda && (
          <Card className={sectionCardClass}>
            <CardHeader className={sectionHeaderClass}>
              <CardTitle className={sectionTitleClass}>Condições de Venda</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Campo label="Tipo de Contrato" valor={data.condicoesVenda.tipoContrato} />
              <Campo label="Imposto" valor={data.condicoesVenda.imposto} />
              <Campo label="Condição de Pagamento" valor={data.condicoesVenda.condicaoPagamento} />
              <Campo label="Cond. Pagamento (Outra)" valor={data.condicoesVenda.condicaoPagamentoOutra} />
              <Campo label="% Royalties" valor={data.condicoesVenda.royalties} />
              <Campo label="BV Agência" valor={data.condicoesVenda.bvAgencia} />
            </CardContent>
          </Card>
        )}

        {/* ENTREGAS */}
        {data.entregas && (
          <Card className={sectionCardClass}>
            <CardHeader className={sectionHeaderClass}>
              <CardTitle className={sectionTitleClass}>Entregas</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Campo label="Local Único" valor={data.entregas.localUnico ? "Sim" : "Não"} />
              <Campo label="Cidade/UF" valor={data.entregas.cidadeUF} />
              <Campo label="Quantidade" valor={data.entregas.quantidadeLocalUnico} />
              <Campo label="Pedido Mínimo CIF" valor={data.entregas.pedidoMinimoCIF} />
              <Campo label="Cidades/UF Múltiplas" valor={data.entregas.cidadesUFMultiplas} />
              <Campo label="Anexar Lista de Lojas" valor={data.entregas.anexarListaLojas} />
              <Campo label="Nº de Entregas" valor={data.entregas.numeroEntregas} />
              <Campo label="Frequência" valor={data.entregas.frequencia} />
              <Campo label="Frequência (Outra)" valor={data.entregas.frequenciaOutra} />
              <Campo label="Frete" valor={data.entregas.frete} />
              <Campo label="Quantidades Frete" valor={freteQuantidadesTexto} />
            </CardContent>
          </Card>
        )}

        {/* PRODUTO */}
        <Card className={sectionCardClass}>
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Produto</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Campo label="Tipo" valor={produtoTipo?.nome} />
            <Campo label="Modelo" valor={produtoModelo?.nome} />
            <Campo label="Quantidade (Orçamento)" valor={data.produto.quantidade} />
            <Campo label="Variação" valor={data.produto.variacaoEnvelope} />
          </CardContent>
        </Card>

        {/* TAMANHO / FORMATO */}
        <Card className={sectionCardClass}>
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Tamanho</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {formato ? (
              <Campo 
                label="Formato Padrão" 
                valor={`${formato.nome} ${formato.largura && formato.altura ? `(${formato.largura}x${formato.altura}${formato.lateral ? `x${formato.lateral}` : ""} cm)` : ""}${data.formato.formatoOutroDescricao ? ` - ${data.formato.formatoOutroDescricao}` : ""}`} 
              />
            ) : data.formato.formatoPadraoId === "outro" && data.formato.formatoOutroDescricao ? (
              <Campo label="Formato" valor={`Outro (Desenvolvimento) - ${data.formato.formatoOutroDescricao}`} />
            ) : null}
            {data.formato.formatoCustom && (
              <>
                <Campo 
                  label="Largura" 
                  valor={
                    data.formato.formatoCustom.largura === "outro" || data.formato.formatoCustom.largura === "Outro (Desenvolvimento)"
                      ? `Outro (Desenvolvimento)${data.formato.larguraOutroDescricao ? ` - ${data.formato.larguraOutroDescricao}` : ""}`
                      : data.formato.formatoCustom.largura ? `${data.formato.formatoCustom.largura} mm` : undefined
                  } 
                />
                <Campo 
                  label="Altura" 
                  valor={
                    data.formato.formatoCustom.altura === "outro" || data.formato.formatoCustom.altura === "Outro (Desenvolvimento)"
                      ? `Outro (Desenvolvimento)${data.formato.alturaOutroDescricao ? ` - ${data.formato.alturaOutroDescricao}` : ""}`
                      : data.formato.formatoCustom.altura ? `${data.formato.formatoCustom.altura} mm` : undefined
                  } 
                />
                <Campo 
                  label="Lateral" 
                  valor={data.formato.formatoCustom.lateral ? `${data.formato.formatoCustom.lateral} mm` : undefined} 
                />
                <Campo 
                  label="Sanfona" 
                  valor={
                    data.formato.formatoCustom.sanfona === "outro" || data.formato.formatoCustom.sanfona === "Outro (Desenvolvimento)"
                      ? `Outro (Desenvolvimento)${data.formato.sanfonaOutroDescricao ? ` - ${data.formato.sanfonaOutroDescricao}` : ""}`
                      : data.formato.formatoCustom.sanfona ? `${data.formato.formatoCustom.sanfona} mm` : undefined
                  } 
                />
                <Campo label="Observações" valor={data.formato.formatoCustom.observacoes} />
              </>
            )}
            {data.formato.sacoFundoV && (
              <>
                <Campo 
                  label="Largura Padrão" 
                  valor={
                    data.formato.sacoFundoV.larguraPadrao === "outro" || data.formato.sacoFundoV.larguraPadrao === "Outro (Desenvolvimento)"
                      ? `Outro (Desenvolvimento)${data.formato.larguraOutroDescricao ? ` - ${data.formato.larguraOutroDescricao}` : ""}`
                      : data.formato.sacoFundoV.larguraPadrao
                  } 
                />
                <Campo 
                  label="Altura Padrão" 
                  valor={
                    data.formato.sacoFundoV.alturaPadrao === "outro" || data.formato.sacoFundoV.alturaPadrao === "Outro (Desenvolvimento)"
                      ? `Outro (Desenvolvimento)${data.formato.alturaOutroDescricao ? ` - ${data.formato.alturaOutroDescricao}` : ""}`
                      : data.formato.sacoFundoV.alturaPadrao
                  } 
                />
                <Campo 
                  label="Sanfona Padrão" 
                  valor={
                    data.formato.sacoFundoV.sanfonaPadrao === "outro" || data.formato.sacoFundoV.sanfonaPadrao === "Outro (Desenvolvimento)"
                      ? `Outro (Desenvolvimento)${data.formato.sanfonaOutroDescricao ? ` - ${data.formato.sanfonaOutroDescricao}` : ""}`
                      : data.formato.sacoFundoV.sanfonaPadrao
                  } 
                />
              </>
            )}
            <Campo label="Altura Aba (Envelope)" valor={data.formato.envelopeAbaAltura ? `${data.formato.envelopeAbaAltura} mm` : undefined} />
          </CardContent>
        </Card>

        {/* MATERIAL / SUBSTRATO */}
        <Card className={sectionCardClass}>
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Material</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Campo 
              label="Substrato" 
              valor={
                substrato?.nome 
                  ? substrato.nome 
                  : data.substrato.substratoId === "outro" || data.substrato.substratoId === "Outro (Desenvolvimento)"
                    ? `Outro (Desenvolvimento)${data.substrato.outroDescricao ? ` - ${data.substrato.outroDescricao}` : ""}`
                    : undefined
              } 
            />
            <Campo 
              label="Gramagem" 
              valor={
                data.substrato.substratoGramagem === "outro" || data.substrato.substratoGramagem === "Outro (Desenvolvimento)"
                  ? `Outro (Desenvolvimento)${data.substrato.gramagemOutroDescricao ? ` - ${data.substrato.gramagemOutroDescricao}` : ""}`
                  : data.substrato.substratoGramagem ? `${data.substrato.substratoGramagem}` : undefined
              } 
            />
          </CardContent>
        </Card>

        {/* ALÇA E DETALHES */}
        <Card className={sectionCardClass}>
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Alça e Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Campo 
              label="Tipo de Alça" 
              valor={
                alcaTipo?.nome 
                  ? alcaTipo.nome 
                  : data.alca?.tipoId === "outro" || data.alca?.tipoId === "Outro (Desenvolvimento)"
                    ? `Outro (Desenvolvimento)${data.alca?.outroDescricao ? ` - ${data.alca.outroDescricao}` : ""}`
                    : data.alca?.tipoId
              } 
            />
            <Campo 
              label="Largura" 
              valor={
                data.alca?.largura === "outro" || data.alca?.largura === "Outro (Desenvolvimento)"
                  ? `Outro (Desenvolvimento)${data.alca?.larguraOutroDescricao ? ` - ${data.alca.larguraOutroDescricao}` : ""}`
                  : data.alca?.largura
              } 
            />
            <Campo 
              label="Cor" 
              valor={
                data.alca?.cor === "outro" || data.alca?.cor === "Outro (Desenvolvimento)"
                  ? `Outro (Desenvolvimento)${data.alca?.corOutroDescricao ? ` - ${data.alca.corOutroDescricao}` : ""}`
                  : data.alca?.cor === "Outro (Desenvolvimento)" && data.alca?.corCustom
                    ? `${data.alca.cor} - ${data.alca.corCustom}`
                    : data.alca?.cor
              } 
            />
            <Campo label="Cor Customizada" valor={data.alca?.corCustom && data.alca?.cor !== "Outro (Desenvolvimento)" ? data.alca.corCustom : undefined} />
            <Campo 
              label="Aplicação" 
              valor={
                data.alca?.aplicacao === "outro" || data.alca?.aplicacao === "Outro (Desenvolvimento)"
                  ? `Outro (Desenvolvimento)${data.alca?.aplicacaoOutroDescricao ? ` - ${data.alca.aplicacaoOutroDescricao}` : ""}`
                  : data.alca?.aplicacao
              } 
            />
            <Campo 
              label="Comprimento" 
              valor={data.alca?.comprimento ? `${data.alca.comprimento} ${data.alca.unidadeComprimento || "cm"}` : undefined} 
            />
          </CardContent>
        </Card>

        {/* IMPRESSÃO */}
        <Card className={sectionCardClass}>
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Impressão</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Campo 
              label="Modo" 
              valor={
                impressaoModo?.nome 
                  ? impressaoModo.nome 
                  : data.impressao?.modoId === "outro" || data.impressao?.modoId === "Outro (Desenvolvimento)"
                    ? `Outro (Desenvolvimento)${data.impressao?.outroDescricao ? ` - ${data.impressao.outroDescricao}` : ""}`
                    : data.impressao?.modoId
              } 
            />
            <Campo 
              label="Combinação" 
              valor={
                impressaoCombinacao?.nome 
                  ? impressaoCombinacao.nome 
                  : data.impressao?.combinacaoId === "outro" || data.impressao?.combinacaoId === "Outro (Desenvolvimento)"
                    ? "Outro (Desenvolvimento)"
                    : data.impressao?.combinacaoId
              } 
            />
            {data.impressao?.camadas && (
              <>
                <Campo label="Camada Externa" valor={data.impressao.camadas.externa} />
                <Campo label="Camada Interna" valor={data.impressao.camadas.interna} />
                <Campo label="Apara" valor={data.impressao.camadas.apara} />
                <Campo label="Saco" valor={data.impressao.camadas.saco} />
                <Campo label="Sacola" valor={data.impressao.camadas.sacola} />
                <Campo label="Etiqueta" valor={data.impressao.camadas.etiqueta} />
              </>
            )}
            <Campo label="% Externa" valor={data.impressao?.percentualExterna ? `${data.impressao.percentualExterna}%` : undefined} />
            <Campo label="% Interna" valor={data.impressao?.percentualInterna ? `${data.impressao.percentualInterna}%` : undefined} />
            {data.impressao?.apara?.ativa && (
              <>
                <div className="text-sm font-semibold text-[#27a75c] mt-2 mb-1">Apara:</div>
                <Campo label="Modo Apara" valor={data.impressao.apara.modoId} />
                <Campo label="Combinação Apara" valor={data.impressao.apara.combinacaoId} />
                <Campo label="% Apara" valor={data.impressao.apara.percentual ? `${data.impressao.apara.percentual}%` : undefined} />
                <Campo label="Obs. Apara" valor={data.impressao.apara.observacoes} />
              </>
            )}
            {data.impressao?.saco?.ativa && (
              <>
                <div className="text-sm font-semibold text-[#27a75c] mt-2 mb-1">Saco:</div>
                <Campo label="Modo Saco" valor={data.impressao.saco.modoId} />
                <Campo label="Combinação Saco" valor={data.impressao.saco.combinacaoId} />
              </>
            )}
            {data.impressao?.envelope?.ativa && (
              <>
                <div className="text-sm font-semibold text-[#27a75c] mt-2 mb-1">Envelope:</div>
                <Campo label="Modo Envelope" valor={data.impressao.envelope.modoId} />
                <Campo label="Combinação Envelope" valor={data.impressao.envelope.combinacaoId} />
              </>
            )}
            <Campo label="Cor da Fita" valor={data.impressao?.corFita} />
            <Campo label="Corte Registrado" valor={data.impressao?.corteRegistrado} />
            <Campo label="Corte Terceirizado" valor={data.impressao?.corteRegistradoTerceirizado} />
            <Campo label="Observações" valor={data.impressao?.observacoes} />
          </CardContent>
        </Card>

        {/* ACABAMENTOS */}
        <Card className={sectionCardClass}>
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Acabamentos</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Campo label="Reforço de Fundo" valor={data.acabamentos.reforcoFundo} />
            <Campo label="Modelo Reforço" valor={data.acabamentos.reforcoFundoModelo} />
            <Campo label="Boca de Palhaço" valor={data.acabamentos.bocaPalhaco} />
            <Campo label="Furo de Fita" valor={data.acabamentos.furoFita} />
            <Campo label="Modelo Furo Fita" valor={data.acabamentos.furoFitaModelo} />
            <Campo label="Dupla Face" valor={data.acabamentos.duplaFace} />
            <Campo label="Velcro" valor={data.acabamentos.velcro} />
            <Campo label="Cor Velcro" valor={data.acabamentos.velcroCor} />
            <Campo label="Tamanho Velcro" valor={data.acabamentos.velcroTamanho ? `${data.acabamentos.velcroTamanho} mm` : undefined} />
            {data.acabamentos.outroDescricao && (
              <Campo label="Outro" valor={`Outro (Desenvolvimento) - ${data.acabamentos.outroDescricao}`} />
            )}
            {!data.acabamentos.reforcoFundo && !data.acabamentos.bocaPalhaco && !data.acabamentos.furoFita && 
             !data.acabamentos.duplaFace && !data.acabamentos.velcro && !data.acabamentos.outroDescricao && (
              <div className="text-[#27a75c]/60 italic">Nenhum acabamento selecionado</div>
            )}
          </CardContent>
        </Card>

        {/* ENOBRECIMENTOS */}
        <Card className={sectionCardClass}>
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Enobrecimentos</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {data.enobrecimentos && data.enobrecimentos.length > 0 ? (
              <div className="space-y-4">
                {data.enobrecimentos.map((enob, index) => {
                  const tipo = catalogo.enobrecimentoTipos.find(t => t.id === enob.tipoId)
                  return (
                    <div key={index} className="rounded-xl border border-[#27a75c]/25 bg-gradient-to-r from-[#27a75c]/12 to-[#00477a]/10 p-3.5">
                      <div className="font-semibold text-[#27a75c]">{tipo?.nome || enob.tipoId}</div>
                      {enob.dados && Object.keys(enob.dados).length > 0 && (
                        <div className="text-sm text-gray-300 mt-1">
                          {Object.entries(enob.dados).map(([key, value]) => (
                            <div key={key}><span className="font-medium text-[#27a75c]">{key}:</span> {String(value)}</div>
                          ))}
                        </div>
                      )}
                      {enob.observacoes && (
                        <div className="text-sm mt-1 text-white"><span className="font-medium text-[#27a75c]">Observações:</span> {enob.observacoes}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-[#27a75c]/60 italic">Nenhum enobrecimento selecionado</div>
            )}
          </CardContent>
        </Card>

        {/* ENTREGA E QUANTIDADE */}
        <Card className={sectionCardClass}>
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Entrega e Quantidade</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Campo 
              label="Acondicionamento" 
              valor={
                acondicionamento?.nome 
                  ? acondicionamento.nome 
                  : data.acondicionamento.tipoId === "outro" || data.acondicionamento.tipoId === "Outro (Desenvolvimento)"
                    ? `Outro (Desenvolvimento)${data.acondicionamento.outroDescricao ? ` - ${data.acondicionamento.outroDescricao}` : ""}`
                    : data.acondicionamento.tipoId
              } 
            />
            <Campo 
              label="Módulo" 
              valor={
                modulo?.nome 
                  ? modulo.nome 
                  : data.acondicionamento.moduloId === "outro" || data.acondicionamento.moduloId === "Outro (Desenvolvimento)"
                    ? `Outro (Desenvolvimento)${data.acondicionamento.moduloOutroDescricao ? ` - ${data.acondicionamento.moduloOutroDescricao}` : ""}`
                    : data.acondicionamento.moduloId
              } 
            />
            <Campo label="Quantidade" valor={`${data.acondicionamento.quantidade.toLocaleString("pt-BR")} unidades`} />
          </CardContent>
        </Card>

        {/* OBSERVAÇÕES PARA ENGENHARIA - Lista de todos os "Outro (Desenvolvimento)" */}
        {temObservacoesDesenvolvimento && (
          <Card className="bg-gradient-to-br from-[#27a75c]/10 to-[#00477a]/10 border-[#27a75c]/30 shadow-[0_12px_32px_rgba(0,0,0,0.2)]">
            <CardHeader className="bg-gradient-to-r from-[#27a75c]/15 to-[#00477a]/15 py-3.5 border-b border-white/[0.08]">
              <CardTitle className={sectionTitleClass}>Observações para Engenharia</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {observacoesDesenvolvimento.map((obs, index) => (
                  <div key={index} className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5">
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="bg-gradient-to-r from-[#27a75c] to-[#00477a] text-white text-[11px] px-2 py-1 rounded-md font-semibold uppercase tracking-wide whitespace-nowrap">
                        {obs.etapa}
                      </span>
                      <span className="font-semibold text-[#27a75c]">{obs.campo}:</span>
                      <span className="text-gray-200">{obs.descricao}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* BOTÕES DE AÇÃO */}
      <div className="flex flex-col gap-3 pt-6 border-t border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-white/[0.14] bg-white/[0.03] text-gray-200 hover:bg-white/[0.08] hover:text-white"
        >
          Voltar para Edição
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleGerarPDF}
            disabled={isSubmitting}
            className="border-white/[0.14] bg-white/[0.03] text-gray-200 hover:bg-white/[0.08] hover:text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Salvar PDF
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="bg-gradient-to-r from-[#27a75c] to-[#00477a] hover:from-[#229a52] hover:to-[#003d6a] text-white border-0"
          >
            {isSubmitting ? "Enviando..." : "Confirmar e Enviar"}
          </Button>
        </div>
      </div>
    </div>
  )
}

