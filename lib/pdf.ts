// Função para gerar PDF da solicitação - Layout profissional completo
import jsPDF from "jspdf"
import { SolicitacaoCompletaFormData } from "@/lib/validations/solicitacao"
import { getCatalogo, getModeloPorId } from "@/lib/catalogo"

// Cores do tema - Verde #27a75c + Azul #00477a
const VERDE_PRINCIPAL = [39, 167, 92] as [number, number, number]  // #27a75c
const AZUL_SECUNDARIO = [0, 71, 122] as [number, number, number]  // #00477a
const VERDE_LABEL = [220, 245, 230] as [number, number, number]   // Verde bem claro para labels
const BRANCO = [255, 255, 255] as [number, number, number]

// Função para desenhar retângulo com gradiente horizontal
const drawGradientRect = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  colorStart: [number, number, number],
  colorEnd: [number, number, number],
  steps: number = 100
) => {
  const stepWidth = width / steps
  for (let i = 0; i < steps; i++) {
    const ratio = i / steps
    const r = Math.round(colorStart[0] + (colorEnd[0] - colorStart[0]) * ratio)
    const g = Math.round(colorStart[1] + (colorEnd[1] - colorStart[1]) * ratio)
    const b = Math.round(colorStart[2] + (colorEnd[2] - colorStart[2]) * ratio)
    doc.setFillColor(r, g, b)
    doc.rect(x + i * stepWidth, y, stepWidth + 0.5, height, "F")
  }
}

// Logo Printbag em Base64 (será carregada dinamicamente)
let logoBase64: string | null = null

// Função para carregar a logo
async function carregarLogo(): Promise<string | null> {
  if (logoBase64) return logoBase64
  
  try {
    const response = await fetch("/printbag-logo-svg.png")
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        logoBase64 = reader.result as string
        resolve(logoBase64)
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function gerarPDF(data: SolicitacaoCompletaFormData): Promise<void> {
  // Carregar logo antes de gerar o PDF
  const logo = await carregarLogo()
  const doc = new jsPDF()
  const catalogo = getCatalogo()
  
  // Buscar dados do catálogo
  const produtoTipo = catalogo.produtoTipos.find(t => t.id === data.produto.produtoTipoId)
  const produtoModelo = getModeloPorId(data.produto.produtoModeloId)
  const substrato = catalogo.substratos.find(s => s.id === data.substrato.substratoId)
  const formato = catalogo.formatosPadrao.find(f => f.id === data.formato.formatoPadraoId)
  const impressaoModo = catalogo.impressaoModos.find(m => m.id === data.impressao?.modoId)
  const impressaoCombinacao = impressaoModo?.combinacoes.find(c => c.id === data.impressao?.combinacaoId)
  const acondicionamento = catalogo.acondicionamentos.find(a => a.id === data.acondicionamento.tipoId)
  const modulo = catalogo.modulos.find(m => m.id === data.acondicionamento.moduloId)
  const tipoAlca = data.alca?.tipoId ? catalogo.alcaTipos.find(t => t.id === data.alca?.tipoId) : null

  const margin = 10
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - 2 * margin
  const footerHeight = 15 // Altura reservada para o rodapé
  const minSpaceBeforeNewPage = footerHeight + 3 // Espaço mínimo antes de criar nova página
  let y = margin

  // Helper para verificar "Outro (Desenvolvimento)"
  const isOutro = (val: any) => val === "outro" || val === "Outro (Desenvolvimento)"

  // Função para verificar se precisa nova página (melhorada para evitar quebras)
  const checkNewPage = (neededHeight: number) => {
    // Calcular altura disponível considerando margem inferior para rodapé
    const availableHeight = pageHeight - y - minSpaceBeforeNewPage
    
    // Se o elemento não cabe na página atual e não estamos no topo
    if (neededHeight > availableHeight && y > margin) {
      doc.addPage()
      y = margin
      return true
    }
    
    // Se o elemento não cabe mesmo no topo de uma nova página, criar página mesmo assim
    if (neededHeight > pageHeight - margin - minSpaceBeforeNewPage && y === margin) {
      // Elemento muito grande, mas vamos tentar desenhar mesmo assim
      return false
    }
    
    return false
  }

  // Função auxiliar para desenhar célula
  const drawCell = (
    x: number, 
    yPos: number, 
    width: number, 
    height: number, 
    label: string, 
    value: string | number | boolean | null | undefined, 
    bgColor: [number, number, number] = BRANCO,
    labelBg: [number, number, number] = VERDE_LABEL
  ) => {
    // Converter valor para string
    let displayValue = ""
    if (value === null || value === undefined) {
      displayValue = ""
    } else if (typeof value === "boolean") {
      displayValue = value ? "Sim" : "Não"
    } else if (typeof value === "number") {
      displayValue = value.toString()
    } else {
      displayValue = String(value)
    }
    
    // Fundo do label (verde suave)
    doc.setFillColor(...labelBg)
    doc.rect(x, yPos, width, height / 2, "F")
    
    // Fundo do valor
    doc.setFillColor(...bgColor)
    doc.rect(x, yPos + height / 2, width, height / 2, "F")
    
    // Borda com cor do tema
    doc.setDrawColor(39, 167, 92)
    doc.setLineWidth(0.2)
    doc.rect(x, yPos, width, height)
    doc.line(x, yPos + height / 2, x + width, yPos + height / 2)
    
    // Texto do label (cor azul escuro)
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 71, 122)
    doc.text(label, x + 2, yPos + 4)
    
    // Texto do valor (truncar se necessário)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(30, 30, 30)
    const maxWidth = width - 4
    while (doc.getTextWidth(displayValue) > maxWidth && displayValue.length > 3) {
      displayValue = displayValue.slice(0, -4) + "..."
    }
    doc.text(displayValue, x + 2, yPos + height / 2 + 4)
  }

  // Função para desenhar seção com título (com gradiente)
  const drawSectionHeader = (yPos: number, title: string): number => {
    const headerHeight = 7
    const spacing = 3
    checkNewPage(headerHeight + spacing) // Verificar espaço para cabeçalho + margem
    // Desenhar gradiente do verde para o azul
    drawGradientRect(doc, margin, y, contentWidth, headerHeight, VERDE_PRINCIPAL, AZUL_SECUNDARIO, 80)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text(title, margin + 3, y + 5)
    y += headerHeight
    return y
  }

  // Função para linha de campos
  const drawFieldRow = (
    yPos: number, 
    fields: Array<{label: string, value: string | number | boolean | null | undefined, width: number}>
  ): number => {
    const height = 10
    checkNewPage(height) // Verificar espaço antes de desenhar
    let x = margin
    fields.forEach(field => {
      drawCell(x, y, field.width, height, field.label, field.value)
      x += field.width
    })
    y += height
    return y
  }

  // Função para linha de observações dentro de um bloco (label verde + valor branco ao lado)
  const drawObsRow = (yPos: number, label: string, value: string): number => {
    if (!value) return y
    
    const height = 5
    checkNewPage(height) // Verificar espaço antes de desenhar
    const labelWidth = 50
    
    // Label com fundo verde suave
    doc.setFillColor(...VERDE_LABEL)
    doc.rect(margin, y, labelWidth, height, "F")
    
    // Valor com fundo branco
    doc.setFillColor(...BRANCO)
    doc.rect(margin + labelWidth, y, contentWidth - labelWidth, height, "F")
    
    // Bordas com cor do tema
    doc.setDrawColor(39, 167, 92)
    doc.setLineWidth(0.2)
    doc.rect(margin, y, labelWidth, height)
    doc.rect(margin + labelWidth, y, contentWidth - labelWidth, height)
    
    // Texto do label (azul escuro)
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 71, 122)
    doc.text(label, margin + 2, y + 3.5)
    
    // Texto do valor
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(30, 30, 30)
    // Quebrar texto se necessário
    const lines = doc.splitTextToSize(value, contentWidth - labelWidth - 4)
    doc.text(lines[0], margin + labelWidth + 2, y + 3.5)
    if (lines.length > 1) {
      const extraLineHeight = 5
      y += extraLineHeight
      checkNewPage(extraLineHeight)
      doc.text(lines[1], margin + labelWidth + 2, y + 3.5)
    }
    
    y += height
    return y
  }

  // ========== CABEÇALHO COM GRADIENTE ==========
  const headerHeight = 25
  const headerSpacing = 3
  
  // Verificar espaço antes de desenhar o cabeçalho
  checkNewPage(headerHeight + headerSpacing)
  
  // Desenhar gradiente do verde para o azul no cabeçalho
  drawGradientRect(doc, margin, y, contentWidth, headerHeight, VERDE_PRINCIPAL, AZUL_SECUNDARIO, 150)
  
  // Borda elegante ao redor do cabeçalho
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.3)
  doc.rect(margin, y, contentWidth, headerHeight)
  
  // Linha decorativa interna
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.1)
  doc.line(margin + 50, y + 5, margin + 50, y + headerHeight - 5)
  
  // "PRINTBAG" à esquerda em branco
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("PRINTBAG", margin + 8, y + 15)
  
  // Título centralizado "SOLICITAÇÃO DE ORÇAMENTO"
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("SOLICITAÇÃO DE ORÇAMENTO", margin + 58, y + 15)
  
  // Data no canto direito
  const dataAtual = new Date().toLocaleDateString("pt-BR")
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(220, 255, 220)
  doc.text(`Data: ${dataAtual}`, pageWidth - margin - 35, y + 15)
  
  y += headerHeight + 3

  // ========== DADOS DO PEDIDO ==========
  y = drawFieldRow(y, [
    { label: "Vendedor", value: data.dadosGerais.vendedor || "", width: 65 },
    { label: "Marca", value: data.dadosGerais.marca || "", width: 65 },
    { label: "Contato", value: data.dadosGerais.contato || "", width: 60 }
  ])

  y = drawFieldRow(y, [
    { label: "Codigo Metrics", value: data.dadosGerais.codigoMetrics || "", width: 95 },
    { label: "Data", value: new Date().toLocaleDateString("pt-BR"), width: 95 }
  ])

  // Observações dentro do bloco de dados gerais
  if (data.dadosGerais.observacoesGerais) {
    y = drawObsRow(y, "Observacoes", data.dadosGerais.observacoesGerais)
  }

  y += 3

  // ========== CONDIÇÕES DE VENDA ==========
  if (data.condicoesVenda && (data.condicoesVenda.tipoContrato || data.condicoesVenda.imposto || data.condicoesVenda.condicaoPagamento)) {
    y = drawSectionHeader(y, "CONDICOES DE VENDA")

    y = drawFieldRow(y, [
      { label: "Tipo Contrato", value: data.condicoesVenda.tipoContrato || "", width: 50 },
      { label: "Imposto", value: data.condicoesVenda.imposto || "", width: 70 },
      { label: "Cond. Pagamento", value: data.condicoesVenda.condicaoPagamento || "", width: 70 }
    ])

    if (data.condicoesVenda.condicaoPagamentoOutra || data.condicoesVenda.royalties || data.condicoesVenda.bvAgencia) {
      y = drawFieldRow(y, [
        { label: "Cond. Outra", value: data.condicoesVenda.condicaoPagamentoOutra || "", width: 63 },
        { label: "% Royalties", value: data.condicoesVenda.royalties || "Nao ha", width: 63 },
        { label: "BV Agencia", value: data.condicoesVenda.bvAgencia || "Nao ha", width: 64 }
      ])
    }

    y += 3
  }

  // ========== ENTREGAS ==========
  if (data.entregas && (data.entregas.cidadeUF || data.entregas.frete || data.entregas.numeroEntregas)) {
    y = drawSectionHeader(y, "ENTREGAS")
    
    y = drawFieldRow(y, [
      { label: "Local Unico", value: data.entregas.localUnico ? "Sim" : "Nao", width: 40 },
      { label: "Cidade/UF", value: data.entregas.cidadeUF || "", width: 75 },
      { label: "Quantidade", value: data.entregas.quantidadeLocalUnico?.toString() || "", width: 75 }
    ])

    if (!data.entregas.localUnico && data.entregas.cidadesUFMultiplas) {
      y = drawFieldRow(y, [
        { label: "Pedido Min. CIF", value: data.entregas.pedidoMinimoCIF || "", width: 63 },
        { label: "Cidades/UF", value: data.entregas.cidadesUFMultiplas || "", width: 127 }
      ])
    }

    y = drawFieldRow(y, [
      { label: "N Entregas", value: data.entregas.numeroEntregas || "", width: 45 },
      { label: "Frequencia", value: data.entregas.frequencia || data.entregas.frequenciaOutra || "", width: 50 },
      { label: "Frete", value: data.entregas.frete || "", width: 95 }
    ])

    const freteQuantidadesTexto = data.entregas.freteQuantidades && data.entregas.freteQuantidades.length > 0
      ? data.entregas.freteQuantidades.join(", ")
      : data.entregas.freteQuantidade
        ? data.entregas.freteQuantidade.toString()
        : ""
    if (freteQuantidadesTexto) {
      y = drawFieldRow(y, [
        { label: "Quantidades Frete", value: freteQuantidadesTexto, width: 190 }
      ])
    }

    y += 3
  }

  // ========== PRODUTO ==========
  y = drawSectionHeader(y, "PRODUTO")

  y = drawFieldRow(y, [
    { label: "Tipo", value: produtoTipo?.nome || "", width: 95 },
    { label: "Modelo", value: produtoModelo?.nome || "", width: 95 }
  ])

  const quantidadeProduto = data.acondicionamento?.quantidade ?? null
  if (quantidadeProduto) {
    y = drawFieldRow(y, [
      { label: "Quantidade", value: `${quantidadeProduto.toLocaleString("pt-BR")} un`, width: 190 }
    ])
  }

  y += 3

  // ========== TAMANHO / FORMATO ==========
  y = drawSectionHeader(y, "TAMANHO")
  
  let formatoNome = ""
  let largura = ""
  let altura = ""
  let lateral = ""
  
  if (formato) {
    formatoNome = `${formato.nome}${data.formato.formatoOutroDescricao ? ` - ${data.formato.formatoOutroDescricao}` : ""}`
    largura = formato.largura?.toString() || ""
    altura = formato.altura?.toString() || ""
    lateral = formato.lateral?.toString() || ""
  } else if (isOutro(data.formato.formatoPadraoId)) {
    formatoNome = `Outro${data.formato.formatoOutroDescricao ? ` - ${data.formato.formatoOutroDescricao}` : ""}`
  }
  
  if (data.formato.formatoCustom) {
    if (!formatoNome) formatoNome = "Customizado"
    
    largura = isOutro(data.formato.formatoCustom.largura)
      ? `Outro${data.formato.larguraOutroDescricao ? ` - ${data.formato.larguraOutroDescricao}` : ""}`
      : data.formato.formatoCustom.largura?.toString() || ""
    
    altura = isOutro(data.formato.formatoCustom.altura)
      ? `Outro${data.formato.alturaOutroDescricao ? ` - ${data.formato.alturaOutroDescricao}` : ""}`
      : data.formato.formatoCustom.altura?.toString() || ""
    
    lateral = isOutro(data.formato.formatoCustom.sanfona)
      ? `Outro${data.formato.sanfonaOutroDescricao ? ` - ${data.formato.sanfonaOutroDescricao}` : ""}`
      : data.formato.formatoCustom.lateral?.toString() || data.formato.formatoCustom.sanfona?.toString() || ""
  }
  
  if (data.formato.sacoFundoV) {
    formatoNome = formatoNome || "Saco Fundo V"
    largura = isOutro(data.formato.sacoFundoV.larguraPadrao)
      ? `Outro${data.formato.larguraOutroDescricao ? ` - ${data.formato.larguraOutroDescricao}` : ""}`
      : data.formato.sacoFundoV.larguraPadrao || ""
    altura = isOutro(data.formato.sacoFundoV.alturaPadrao)
      ? `Outro${data.formato.alturaOutroDescricao ? ` - ${data.formato.alturaOutroDescricao}` : ""}`
      : data.formato.sacoFundoV.alturaPadrao || ""
    lateral = isOutro(data.formato.sacoFundoV.sanfonaPadrao)
      ? `Outro${data.formato.sanfonaOutroDescricao ? ` - ${data.formato.sanfonaOutroDescricao}` : ""}`
      : data.formato.sacoFundoV.sanfonaPadrao || ""
  }

  y = drawFieldRow(y, [
    { label: "Formato", value: formatoNome, width: 60 },
    { label: "Largura (mm)", value: largura, width: 40 },
    { label: "Altura (mm)", value: altura, width: 40 },
    { label: "Sanfona/Lateral", value: lateral, width: 50 }
  ])

  if (data.formato.envelopeAbaAltura) {
    y = drawFieldRow(y, [
      { label: "Altura Aba (Envelope)", value: `${data.formato.envelopeAbaAltura} mm`, width: 60 },
      { label: "", value: "", width: 130 }
    ])
  }

  // Observações dentro do bloco de tamanho
  if (data.formato.formatoCustom?.observacoes) {
    y = drawObsRow(y, "Obs. Formato", data.formato.formatoCustom.observacoes)
  }

  y += 3

  // ========== MATERIAL / SUBSTRATO ==========
  y = drawSectionHeader(y, "MATERIAL")
  
  const substratoNome = substrato?.nome 
    ? substrato.nome 
    : isOutro(data.substrato.substratoId)
      ? `Outro${data.substrato.outroDescricao ? ` - ${data.substrato.outroDescricao}` : ""}`
      : ""
  
  const gramagem = isOutro(data.substrato.substratoGramagem)
    ? `Outro${data.substrato.gramagemOutroDescricao ? ` - ${data.substrato.gramagemOutroDescricao}` : ""}`
    : data.substrato.substratoGramagem ? `${data.substrato.substratoGramagem}` : ""
  
  y = drawFieldRow(y, [
    { label: "Substrato", value: substratoNome, width: 95 },
    { label: "Gramagem", value: gramagem, width: 95 }
  ])

  y += 3

  // ========== ALÇA E DETALHES ==========
  y = drawSectionHeader(y, "ALCA E DETALHES")
  
  const alcaTipoNome = tipoAlca?.nome 
    ? tipoAlca.nome 
    : isOutro(data.alca?.tipoId)
      ? `Outro${data.alca?.outroDescricao ? ` - ${data.alca.outroDescricao}` : ""}`
      : data.alca?.tipoId || "Sem alca"
  
  const alcaLargura = isOutro(data.alca?.largura)
    ? `Outro${data.alca?.larguraOutroDescricao ? ` - ${data.alca.larguraOutroDescricao}` : ""}`
    : data.alca?.largura || ""
  
  const alcaCor = isOutro(data.alca?.cor)
    ? `Outro${data.alca?.corOutroDescricao ? ` - ${data.alca.corOutroDescricao}` : ""}`
    : data.alca?.corCustom 
      ? `${data.alca.cor} - ${data.alca.corCustom}`
      : data.alca?.cor || ""
  
  const alcaAplicacao = isOutro(data.alca?.aplicacao)
    ? `Outro${data.alca?.aplicacaoOutroDescricao ? ` - ${data.alca.aplicacaoOutroDescricao}` : ""}`
    : data.alca?.aplicacao || ""
  
  const alcaComprimento = data.alca?.comprimento 
    ? `${data.alca.comprimento} ${data.alca.unidadeComprimento || "cm"}`
    : ""
  
  y = drawFieldRow(y, [
    { label: "Tipo de Alca", value: alcaTipoNome, width: 55 },
    { label: "Largura", value: alcaLargura, width: 35 },
    { label: "Cor", value: alcaCor, width: 40 },
    { label: "Aplicacao", value: alcaAplicacao, width: 30 },
    { label: "Comprimento", value: alcaComprimento, width: 30 }
  ])

  y += 3

  // ========== IMPRESSÃO ==========
  y = drawSectionHeader(y, "IMPRESSAO")
  
  const impressaoModoNome = impressaoModo?.nome 
    ? impressaoModo.nome 
    : isOutro(data.impressao?.modoId)
      ? `Outro${data.impressao?.outroDescricao ? ` - ${data.impressao.outroDescricao}` : ""}`
      : data.impressao?.modoId || "Sem impressao"
  
  const impressaoCombNome = impressaoCombinacao?.nome 
    ? impressaoCombinacao.nome 
    : isOutro(data.impressao?.combinacaoId)
      ? "Outro (Desenvolvimento)"
      : data.impressao?.combinacaoId || ""
  
  // Camadas ativas
  const camadasAtivas: string[] = []
  if (data.impressao?.camadas?.externa) camadasAtivas.push("Externa")
  if (data.impressao?.camadas?.interna) camadasAtivas.push("Interna")
  if (data.impressao?.camadas?.apara) camadasAtivas.push("Apara")
  if (data.impressao?.camadas?.saco) camadasAtivas.push("Saco")
  if (data.impressao?.camadas?.sacola) camadasAtivas.push("Sacola")
  if (data.impressao?.camadas?.etiqueta) camadasAtivas.push("Etiqueta")
  
  y = drawFieldRow(y, [
    { label: "Modo", value: impressaoModoNome, width: 50 },
    { label: "Combinacao", value: impressaoCombNome, width: 50 },
    { label: "Camadas", value: camadasAtivas.join(", ") || "Nenhuma", width: 90 }
  ])

  // Percentuais e outros detalhes
  const percExterna = data.impressao?.percentualExterna ? `${data.impressao.percentualExterna}%` : ""
  const percInterna = data.impressao?.percentualInterna ? `${data.impressao.percentualInterna}%` : ""
  const corFita = data.impressao?.corFita || ""
  const corteReg = data.impressao?.corteRegistrado ? "Sim" : "Nao"
  const corteTerc = data.impressao?.corteRegistradoTerceirizado ? "Sim" : "Nao"
  
  y = drawFieldRow(y, [
    { label: "% Externa", value: percExterna, width: 38 },
    { label: "% Interna", value: percInterna, width: 38 },
    { label: "Cor Fita", value: corFita, width: 38 },
    { label: "Corte Reg.", value: corteReg, width: 38 },
    { label: "Corte Terc.", value: corteTerc, width: 38 }
  ])

  // Apara
  if (data.impressao?.apara?.ativa) {
    y = drawFieldRow(y, [
      { label: "Apara - Modo", value: data.impressao.apara.modoId || "", width: 50 },
      { label: "Apara - Comb.", value: data.impressao.apara.combinacaoId || "", width: 50 },
      { label: "Apara - %", value: data.impressao.apara.percentual ? `${data.impressao.apara.percentual}%` : "", width: 40 },
      { label: "Apara - Obs", value: data.impressao.apara.observacoes || "", width: 50 }
    ])
  }

  // Saco
  if (data.impressao?.saco?.ativa) {
    y = drawFieldRow(y, [
      { label: "Saco - Modo", value: data.impressao.saco.modoId || "", width: 95 },
      { label: "Saco - Comb.", value: data.impressao.saco.combinacaoId || "", width: 95 }
    ])
  }

  // Envelope
  if (data.impressao?.envelope?.ativa) {
    y = drawFieldRow(y, [
      { label: "Envelope - Modo", value: data.impressao.envelope.modoId || "", width: 95 },
      { label: "Envelope - Comb.", value: data.impressao.envelope.combinacaoId || "", width: 95 }
    ])
  }

  // Observações dentro do bloco de impressão
  if (data.impressao?.observacoes) {
    y = drawObsRow(y, "Obs. Impressao", data.impressao.observacoes)
  }

  y += 3

  // ========== ACABAMENTOS ==========
  y = drawSectionHeader(y, "ACABAMENTOS")
  
  y = drawFieldRow(y, [
    { label: "Reforco Fundo", value: data.acabamentos.reforcoFundo ? "Sim" : "Nao", width: 38 },
    { label: "Modelo Reforco", value: data.acabamentos.reforcoFundoModelo || "", width: 38 },
    { label: "Boca Palhaco", value: data.acabamentos.bocaPalhaco ? "Sim" : "Nao", width: 38 },
    { label: "Furo Fita", value: data.acabamentos.furoFita ? "Sim" : "Nao", width: 38 },
    { label: "Modelo Furo", value: data.acabamentos.furoFitaModelo || "", width: 38 }
  ])

  y = drawFieldRow(y, [
    { label: "Dupla Face", value: data.acabamentos.duplaFace ? "Sim" : "Nao", width: 38 },
    { label: "Velcro", value: data.acabamentos.velcro ? "Sim" : "Nao", width: 38 },
    { label: "Cor Velcro", value: data.acabamentos.velcroCor || "", width: 57 },
    { label: "Tamanho Velcro", value: data.acabamentos.velcroTamanho ? `${data.acabamentos.velcroTamanho} mm` : "", width: 57 }
  ])

  // Outro acabamento dentro do bloco
  if (data.acabamentos.outroDescricao) {
    y = drawObsRow(y, "Outro Acabamento", data.acabamentos.outroDescricao)
  }

  y += 3

  // ========== ENOBRECIMENTOS ==========
  y = drawSectionHeader(y, "ENOBRECIMENTOS")
  
  if (data.enobrecimentos && data.enobrecimentos.length > 0) {
    data.enobrecimentos.forEach((enob, index) => {
      const tipo = catalogo.enobrecimentoTipos.find(t => t.id === enob.tipoId)
      // Combinar dados e observações em um único campo
      const dadosArr: string[] = []
      if (enob.dados) {
        Object.entries(enob.dados).forEach(([k, v]) => {
          if (v) dadosArr.push(`${k}: ${v}`)
        })
      }
      if (enob.observacoes) {
        dadosArr.push(enob.observacoes)
      }
      const obsStr = dadosArr.join(" | ")
      
      y = drawFieldRow(y, [
        { label: `Tipo ${index + 1}`, value: tipo?.nome || enob.tipoId || "", width: 60 },
        { label: "Observacoes", value: obsStr, width: 130 }
      ])
    })
  } else {
    const textHeight = 8
    checkNewPage(textHeight)
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.setTextColor(100, 100, 100)
    doc.text("Nenhum enobrecimento selecionado", margin + 2, y + 5)
    y += textHeight
  }

  y += 3

  // ========== ENTREGA E QUANTIDADE ==========
  y = drawSectionHeader(y, "ENTREGA E QUANTIDADE")
  
  const acondNome = acondicionamento?.nome 
    ? acondicionamento.nome 
    : isOutro(data.acondicionamento.tipoId)
      ? `Outro${data.acondicionamento.outroDescricao ? ` - ${data.acondicionamento.outroDescricao}` : ""}`
      : data.acondicionamento.tipoId || ""
  
  const moduloNome = modulo?.nome 
    ? modulo.nome 
    : isOutro(data.acondicionamento.moduloId)
      ? `Outro${data.acondicionamento.moduloOutroDescricao ? ` - ${data.acondicionamento.moduloOutroDescricao}` : ""}`
      : data.acondicionamento.moduloId || ""
  
  y = drawFieldRow(y, [
    { label: "Quantidade", value: data.acondicionamento.quantidade?.toLocaleString("pt-BR") || "", width: 50 },
    { label: "Acondicionamento", value: acondNome, width: 70 },
    { label: "Modulo", value: moduloNome, width: 70 }
  ])

  y += 3

  // ========== OBSERVAÇÕES PARA ENGENHARIA ==========
  // Coletar todas as descrições de "Outro (Desenvolvimento)" com etapa e campo
  const observacoesEngenharia: Array<{etapa: string, campo: string, descricao: string}> = []

  // Etapa: Tamanho
  if (data.formato.formatoOutroDescricao) {
    observacoesEngenharia.push({ etapa: "Tamanho", campo: "Formato", descricao: data.formato.formatoOutroDescricao })
  }
  if (data.formato.larguraOutroDescricao) {
    observacoesEngenharia.push({ etapa: "Tamanho", campo: "Largura", descricao: data.formato.larguraOutroDescricao })
  }
  if (data.formato.alturaOutroDescricao) {
    observacoesEngenharia.push({ etapa: "Tamanho", campo: "Altura", descricao: data.formato.alturaOutroDescricao })
  }
  if (data.formato.sanfonaOutroDescricao) {
    observacoesEngenharia.push({ etapa: "Tamanho", campo: "Sanfona", descricao: data.formato.sanfonaOutroDescricao })
  }
  
  // Etapa: Material
  if (data.substrato.outroDescricao) {
    observacoesEngenharia.push({ etapa: "Material", campo: "Substrato", descricao: data.substrato.outroDescricao })
  }
  if (data.substrato.gramagemOutroDescricao) {
    observacoesEngenharia.push({ etapa: "Material", campo: "Gramagem", descricao: data.substrato.gramagemOutroDescricao })
  }
  
  // Etapa: Alça e Detalhes
  if (data.alca?.outroDescricao) {
    observacoesEngenharia.push({ etapa: "Alca e Detalhes", campo: "Tipo de Alca", descricao: data.alca.outroDescricao })
  }
  if (data.alca?.larguraOutroDescricao) {
    observacoesEngenharia.push({ etapa: "Alca e Detalhes", campo: "Largura", descricao: data.alca.larguraOutroDescricao })
  }
  if (data.alca?.corOutroDescricao) {
    observacoesEngenharia.push({ etapa: "Alca e Detalhes", campo: "Cor", descricao: data.alca.corOutroDescricao })
  }
  if (data.alca?.aplicacaoOutroDescricao) {
    observacoesEngenharia.push({ etapa: "Alca e Detalhes", campo: "Aplicacao", descricao: data.alca.aplicacaoOutroDescricao })
  }
  
  // Etapa: Impressão
  if (data.impressao?.outroDescricao) {
    observacoesEngenharia.push({ etapa: "Impressao", campo: "Modo", descricao: data.impressao.outroDescricao })
  }
  
  // Etapa: Acabamentos
  if (data.acabamentos.outroDescricao) {
    observacoesEngenharia.push({ etapa: "Acabamentos", campo: "Outro", descricao: data.acabamentos.outroDescricao })
  }
  
  // Nota: Observações de enobrecimentos já aparecem na seção ENOBRECIMENTOS, não duplicar aqui
  
  // Etapa: Entrega e Quantidade
  if (data.acondicionamento.outroDescricao) {
    observacoesEngenharia.push({ etapa: "Entrega e Qtd", campo: "Acondicionamento", descricao: data.acondicionamento.outroDescricao })
  }
  if (data.acondicionamento.moduloOutroDescricao) {
    observacoesEngenharia.push({ etapa: "Entrega e Qtd", campo: "Modulo", descricao: data.acondicionamento.moduloOutroDescricao })
  }
  
  // Observações gerais de desenvolvimento (campo específico para engenharia)
  if (data.desenvolvimentoObservacoes) {
    observacoesEngenharia.push({ etapa: "Desenvolvimento", campo: "Obs. Geral", descricao: data.desenvolvimentoObservacoes })
  }

  if (observacoesEngenharia.length > 0) {
    y = drawSectionHeader(y, "OBSERVAÇÕES PARA ENGENHARIA")
    
    // Desenhar cada observação como uma linha de tabela
    observacoesEngenharia.forEach(obs => {
      const rowHeight = 10
      checkNewPage(rowHeight) // Verificar espaço antes de desenhar
      
      // Coluna da Etapa (fundo verde suave)
      doc.setFillColor(...VERDE_LABEL)
      doc.rect(margin, y, 40, rowHeight, "F")
      
      // Coluna do Campo (fundo azul suave)
      doc.setFillColor(220, 235, 250)
      doc.rect(margin + 40, y, 40, rowHeight, "F")
      
      // Coluna da Descrição (fundo branco)
      doc.setFillColor(...BRANCO)
      doc.rect(margin + 80, y, contentWidth - 80, rowHeight, "F")
      
      // Bordas com cor do tema
      doc.setDrawColor(39, 167, 92)
      doc.setLineWidth(0.2)
      doc.rect(margin, y, 40, rowHeight)
      doc.rect(margin + 40, y, 40, rowHeight)
      doc.rect(margin + 80, y, contentWidth - 80, rowHeight)
      
      // Texto da Etapa (verde)
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(39, 167, 92)
      doc.text(obs.etapa, margin + 2, y + 6)
      
      // Texto do Campo (azul)
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 71, 122)
      doc.text(obs.campo, margin + 42, y + 6)
      
      // Texto da Descrição
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(30, 30, 30)
      // Quebrar texto se necessário
      const maxWidth = contentWidth - 85
      const lines = doc.splitTextToSize(obs.descricao, maxWidth)
      doc.text(lines[0], margin + 82, y + 6)
      
      y += rowHeight
      
      // Se o texto quebrou em múltiplas linhas, adicionar espaço extra
      if (lines.length > 1) {
        const extraLineHeight = 5
        checkNewPage(extraLineHeight)
        doc.text(lines[1], margin + 82, y + 6)
        y += extraLineHeight
      }
    })
  }

  // ========== RODAPÉ ==========
  // Adicionar rodapé em todas as páginas ANTES de salvar
  const totalPages = doc.getNumberOfPages()
  const footerY = pageHeight - footerHeight
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    
    // Linha decorativa no rodapé
    doc.setDrawColor(39, 167, 92)
    doc.setLineWidth(0.3)
    doc.line(margin, footerY, pageWidth - margin, footerY)
    
    // Texto do rodapé
    doc.setFontSize(7)
    doc.setFont("helvetica", "italic")
    doc.setTextColor(0, 71, 122)
    const footerText = `Gerado em ${new Date().toLocaleString("pt-BR")} - Página ${i} de ${totalPages}`
    doc.text(footerText, margin, footerY + 5)
    
    // Texto da empresa no lado direito
    doc.setTextColor(39, 167, 92)
    doc.setFont("helvetica", "bold")
    doc.text("PRINTBAG", pageWidth - margin - 20, footerY + 5)
  }

  // Gerar nome do arquivo
  const empresaNome = (data.dadosGerais.marca || data.dadosGerais.vendedor || "Solicitacao").replace(/[^a-zA-Z0-9]/g, "_")
  const nomeArquivo = `Solicitacao_${empresaNome}_${new Date().toISOString().split("T")[0]}.pdf`

  // Salvar PDF
  doc.save(nomeArquivo)
}



