// API para gerar e baixar o PDF de uma solicitação específica
// Usando o mesmo layout do lib/pdf.ts

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jsPDF from "jspdf"

// Cores do tema Printbag
const VERDE_PRINCIPAL = [39, 167, 92] as [number, number, number]   // #27a75c
const AZUL_SECUNDARIO = [0, 71, 122] as [number, number, number]    // #00477a
const VERDE_CLARO = [39, 167, 92, 0.2] as [number, number, number]  // Verde suave para células
const VERDE_LABEL = [220, 245, 230] as [number, number, number]     // Verde bem claro para labels
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Buscar solicitação completa do banco
    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: params.id },
      include: {
        itens: {
          include: {
            produtoTipo: true,
            produtoModelo: true,
            formatoPadrao: true,
            substrato: true,
            alcaTipo: true,
            impressaoModo: true,
            impressaoCombinacao: true,
            acondicionamento: true,
            modulo: true,
            enobrecimentos: {
              include: {
                enobrecimentoTipo: true,
              },
            },
          },
        },
      },
    })

    if (!solicitacao) {
      return NextResponse.json(
        { erro: "Solicitação não encontrada" },
        { status: 404 }
      )
    }

    const item = solicitacao.itens[0]
    if (!item) {
      return NextResponse.json(
        { erro: "Solicitação sem itens" },
        { status: 400 }
      )
    }

    // Gerar PDF com o mesmo layout do lib/pdf.ts
    const doc = new jsPDF()
    
    const margin = 10
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const contentWidth = pageWidth - 2 * margin
    const footerHeight = 15 // Altura reservada para o rodapé
    const minSpaceBeforeNewPage = footerHeight + 3 // Espaço mínimo antes de criar nova página
    let y = margin

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
      checkNewPage(headerHeight + 3) // Verificar espaço para cabeçalho + margem
      // Desenhar gradiente do verde para o azul
      drawGradientRect(doc, margin, y, contentWidth, headerHeight, VERDE_PRINCIPAL, AZUL_SECUNDARIO, 80)
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(255, 255, 255)
      doc.text(title, margin + 3, y + 5)
      y += headerHeight
      return y
    }

    // Função para linha de campos (igual ao lib/pdf.ts)
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

    // Função para linha de observações
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
      doc.text(value, margin + labelWidth + 2, y + 3.5)
      
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
    
    // Texto PRINTBAG (lado esquerdo)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text("PRINTBAG", margin + 8, y + 15)
    
    // Título do documento (centro)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text("SOLICITAÇÃO DE ORÇAMENTO", margin + 58, y + 15)
    
    // Data (lado direito)
    const dataAtual = new Date().toLocaleDateString("pt-BR")
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(220, 255, 220)
    doc.text(`Data: ${dataAtual}`, pageWidth - margin - 35, y + 15)
    
    y += headerHeight + 3

    // ========== DADOS DO PEDIDO ==========
    y = drawFieldRow(y, [
      { label: "Empresa", value: solicitacao.empresa, width: 60 },
      { label: "Solicitante", value: solicitacao.nomeSolicitante, width: 60 },
      { label: "Unidade", value: solicitacao.unidade || "", width: 35 },
      { label: "Telefone", value: solicitacao.telefoneSolicitante || "", width: 35 }
    ])

    y = drawFieldRow(y, [
      { label: "E-mail", value: solicitacao.emailSolicitante, width: 100 },
      { label: "Prazo Desejado", value: solicitacao.prazoDesejado ? new Date(solicitacao.prazoDesejado).toLocaleDateString("pt-BR") : "", width: 45 },
      { label: "Codigo", value: solicitacao.id.substring(0, 8).toUpperCase(), width: 45 }
    ])

    if (solicitacao.observacoesGerais) {
      y = drawObsRow(y, "Observacoes", solicitacao.observacoesGerais)
    }

    y += 3

    // ========== PRODUTO ==========
    y = drawSectionHeader(y, "PRODUTO")

    y = drawFieldRow(y, [
      { label: "Tipo", value: item.produtoTipo?.nome || "", width: 95 },
      { label: "Modelo", value: item.produtoModelo?.nome || "", width: 95 }
    ])

    if (item.variacaoEnvelope) {
      y = drawObsRow(y, "Variacao", item.variacaoEnvelope)
    }

    y += 3

    // ========== TAMANHO / FORMATO ==========
    y = drawSectionHeader(y, "TAMANHO")
    
    let formatoNome = ""
    let largura = ""
    let altura = ""
    let lateral = ""
    
    if (item.formatoPadrao) {
      formatoNome = item.formatoPadrao.nome
      largura = item.formatoPadrao.largura?.toString() || ""
      altura = item.formatoPadrao.altura?.toString() || ""
      lateral = item.formatoPadrao.lateral?.toString() || ""
    }
    
    if (item.formatoCustomLargura || item.formatoCustomAltura || item.formatoCustomLateral) {
      formatoNome = formatoNome || "Customizado"
      largura = item.formatoCustomLargura?.toString() || largura
      altura = item.formatoCustomAltura?.toString() || altura
      lateral = item.formatoCustomLateral?.toString() || lateral
    }
    
    if (item.larguraPadrao || item.alturaPadrao || item.sanfona) {
      formatoNome = formatoNome || "Saco Fundo V"
      largura = item.larguraPadrao?.toString() || largura
      altura = item.alturaPadrao?.toString() || altura
      lateral = item.sanfona?.toString() || lateral
    }

    y = drawFieldRow(y, [
      { label: "Formato", value: formatoNome, width: 60 },
      { label: "Largura (mm)", value: largura, width: 40 },
      { label: "Altura (mm)", value: altura, width: 40 },
      { label: "Sanfona/Lateral", value: lateral, width: 50 }
    ])

    if (item.aba) {
      y = drawFieldRow(y, [
        { label: "Altura Aba (Envelope)", value: `${item.aba} mm`, width: 60 },
        { label: "", value: "", width: 130 }
      ])
    }

    if (item.alturaTampa) {
      y = drawObsRow(y, "Altura Tampa", `${item.alturaTampa} mm`)
    }

    if (item.modeloEspecial) {
      y = drawObsRow(y, "Modelo Especial", item.modeloEspecial)
    }

    if (item.colagem) {
      y = drawObsRow(y, "Colagem", item.colagem)
    }

    if (item.formatoCustomObservacoes) {
      y = drawObsRow(y, "Obs. Formato", item.formatoCustomObservacoes)
    }

    y += 3

    // ========== MATERIAL / SUBSTRATO ==========
    y = drawSectionHeader(y, "MATERIAL")
    
    y = drawFieldRow(y, [
      { label: "Substrato", value: item.substrato?.nome || "", width: 95 },
      { label: "Gramagem", value: item.substratoGramagem || "", width: 95 }
    ])

    y += 3

    // ========== ALÇA E DETALHES ==========
    y = drawSectionHeader(y, "ALCA E DETALHES")
    
    y = drawFieldRow(y, [
      { label: "Tipo de Alca", value: item.alcaTipo?.nome || "Sem alca", width: 55 },
      { label: "Largura", value: item.alcaLargura || "", width: 35 },
      { label: "Cor", value: item.alcaCorCustom || item.alcaCor || "", width: 40 },
      { label: "Aplicacao", value: item.alcaAplicacao || "", width: 30 },
      { label: "Comprimento", value: item.alcaComprimento ? `${item.alcaComprimento} cm` : "", width: 30 }
    ])

    y += 3

    // ========== IMPRESSÃO ==========
    y = drawSectionHeader(y, "IMPRESSAO")
    
    // Processar camadas
    const camadas = item.impressaoCamadas 
      ? (typeof item.impressaoCamadas === "string" 
          ? JSON.parse(item.impressaoCamadas) 
          : item.impressaoCamadas)
      : null
    
    const camadasAtivas: string[] = []
    if (camadas) {
      if (camadas.externa) camadasAtivas.push("Externa")
      if (camadas.interna) camadasAtivas.push("Interna")
      if (camadas.apara) camadasAtivas.push("Apara")
      if (camadas.saco) camadasAtivas.push("Saco")
      if (camadas.sacola) camadasAtivas.push("Sacola")
      if (camadas.etiqueta) camadasAtivas.push("Etiqueta")
    }
    
    y = drawFieldRow(y, [
      { label: "Modo", value: item.impressaoModo?.nome || "Sem impressao", width: 50 },
      { label: "Combinacao", value: item.impressaoCombinacao?.nome || "", width: 50 },
      { label: "Camadas", value: camadasAtivas.join(", ") || "-", width: 90 }
    ])

    y = drawFieldRow(y, [
      { label: "% Externa", value: item.percentualImpressaoExterna ? `${item.percentualImpressaoExterna}%` : "", width: 38 },
      { label: "% Interna", value: item.percentualImpressaoInterna ? `${item.percentualImpressaoInterna}%` : "", width: 38 },
      { label: "Cor Fita", value: item.corFita || "", width: 38 },
      { label: "Corte Reg.", value: item.corteRegistrado ? "Sim" : "Nao", width: 38 },
      { label: "Corte Terc.", value: item.corteRegistradoTerceirizado ? "Sim" : "Nao", width: 38 }
    ])

    if (item.impressaoObservacoes) {
      y = drawObsRow(y, "Obs. Impressao", item.impressaoObservacoes)
    }

    y += 3

    // ========== ACABAMENTOS ==========
    y = drawSectionHeader(y, "ACABAMENTOS")
    
    y = drawFieldRow(y, [
      { label: "Reforco Fundo", value: item.reforcoFundo ? "Sim" : "Nao", width: 38 },
      { label: "Modelo Reforco", value: item.reforcoFundoModelo || "", width: 38 },
      { label: "Boca Palhaco", value: item.bocaPalhaco ? "Sim" : "Nao", width: 38 },
      { label: "Furo Fita", value: item.furoFita ? "Sim" : "Nao", width: 38 },
      { label: "Modelo Furo", value: item.furoFitaModelo || "", width: 38 }
    ])

    y = drawFieldRow(y, [
      { label: "Dupla Face", value: item.duplaFace ? "Sim" : "Nao", width: 38 },
      { label: "Velcro", value: item.velcro ? "Sim" : "Nao", width: 38 },
      { label: "Cor Velcro", value: item.velcroCor || "", width: 57 },
      { label: "Tamanho Velcro", value: item.velcroTamanho ? `${item.velcroTamanho} mm` : "", width: 57 }
    ])

    y += 3

    // ========== ENOBRECIMENTOS ==========
    y = drawSectionHeader(y, "ENOBRECIMENTOS")
    
    if (item.enobrecimentos && item.enobrecimentos.length > 0) {
      item.enobrecimentos.forEach((enob, index) => {
        const dadosStr = enob.dados ? Object.entries(enob.dados as Record<string, unknown>).map(([k, v]) => `${k}: ${v}`).join(", ") : ""
        
        y = drawFieldRow(y, [
          { label: `Tipo ${index + 1}`, value: enob.enobrecimentoTipo?.nome || "", width: 50 },
          { label: "Detalhes", value: dadosStr, width: 70 },
          { label: "Obs", value: enob.observacoes || "", width: 70 }
        ])
      })
    } else {
      doc.setFontSize(8)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(100, 100, 100)
      doc.text("Nenhum enobrecimento selecionado", margin + 2, y + 5)
      y += 8
    }

    y += 3

    // ========== ENTREGA E QUANTIDADE ==========
    y = drawSectionHeader(y, "ENTREGA E QUANTIDADE")
    
    y = drawFieldRow(y, [
      { label: "Quantidade", value: item.quantidade?.toLocaleString("pt-BR") || "", width: 50 },
      { label: "Acondicionamento", value: item.acondicionamento?.nome || "", width: 70 },
      { label: "Modulo", value: item.modulo?.nome || "", width: 70 }
    ])

    y += 3

    // ========== OBSERVAÇÕES PARA ENGENHARIA ==========
    if (item.desenvolvimentoObservacoes) {
      checkNewPage(25)
      
      y = drawSectionHeader(y, "OBSERVAÇÕES PARA ENGENHARIA")
      
      // Coluna da Etapa (fundo verde suave)
      doc.setFillColor(...VERDE_LABEL)
      doc.rect(margin, y, 40, 10, "F")
      
      // Coluna do Campo (fundo azul suave)
      doc.setFillColor(220, 235, 250)
      doc.rect(margin + 40, y, 40, 10, "F")
      
      // Coluna da Descrição (fundo branco)
      doc.setFillColor(...BRANCO)
      doc.rect(margin + 80, y, contentWidth - 80, 10, "F")
      
      // Bordas com cor do tema
      doc.setDrawColor(39, 167, 92)
      doc.setLineWidth(0.2)
      doc.rect(margin, y, 40, 10)
      doc.rect(margin + 40, y, 40, 10)
      doc.rect(margin + 80, y, contentWidth - 80, 10)
      
      // Texto (label verde)
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(39, 167, 92)
      doc.text("Desenvolvimento", margin + 2, y + 6)
      
      // Texto (label azul)
      doc.setTextColor(0, 71, 122)
      doc.text("Obs. Geral", margin + 42, y + 6)
      
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(30, 30, 30)
      
      // Truncar se necessário
      let descricao = item.desenvolvimentoObservacoes
      const maxWidth = contentWidth - 85
      while (doc.getTextWidth(descricao) > maxWidth && descricao.length > 3) {
        descricao = descricao.slice(0, -4) + "..."
      }
      doc.text(descricao, margin + 82, y + 6)
      
      y += 10
    }

    // ========== RODAPÉ ==========
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      
      // Linha decorativa no rodapé
      doc.setDrawColor(39, 167, 92)
      doc.setLineWidth(0.3)
      doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight)
      
      // Texto do rodapé
      doc.setFontSize(7)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(0, 71, 122)
      doc.text(
        `Gerado em ${new Date().toLocaleString("pt-BR")} - Página ${i} de ${totalPages}`,
        margin,
        pageHeight - 5
      )
      
      // Texto da empresa no lado direito
      doc.setTextColor(39, 167, 92)
      doc.text("PRINTBAG", pageWidth - margin - 20, pageHeight - 5)
    }

    // Retornar PDF como buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))
    
    const nomeArquivo = `Solicitacao_${solicitacao.empresa.replace(/[^a-zA-Z0-9]/g, "_")}_${solicitacao.id.substring(0, 8)}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
      },
    })
  } catch (error: any) {
    console.error("Erro ao gerar PDF:", error)
    return NextResponse.json(
      { erro: "Erro ao gerar PDF", detalhes: error.message },
      { status: 500 }
    )
  }
}
