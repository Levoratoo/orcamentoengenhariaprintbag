// Serviço para disparar webhook com JSON estruturado

import { SolicitacaoCompletaFormData } from "@/lib/validations/solicitacao"
import { SolicitacaoWebhookPayload } from "@/types/solicitacao"
import { getCatalogo, getModeloPorId } from "@/lib/catalogo"

export async function enviarWebhook(
  solicitacaoId: string,
  data: SolicitacaoCompletaFormData
): Promise<{ sucesso: boolean; resposta?: any; erro?: string }> {
  const webhookUrl = process.env.WEBHOOK_URL
  const timeout = parseInt(process.env.WEBHOOK_TIMEOUT_MS || "30000", 10)

  if (!webhookUrl) {
    return {
      sucesso: false,
      erro: "URL do webhook não configurada",
    }
  }

  try {
    const payload = construirPayloadWebhook(solicitacaoId, data)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const responseData = await response.text()
    let parsedResponse: any

    try {
      parsedResponse = JSON.parse(responseData)
    } catch {
      parsedResponse = responseData
    }

    if (!response.ok) {
      return {
        sucesso: false,
        resposta: parsedResponse,
        erro: `Erro HTTP ${response.status}: ${response.statusText}`,
      }
    }

    return {
      sucesso: true,
      resposta: parsedResponse,
    }
  } catch (error: any) {
    return {
      sucesso: false,
      erro: error.message || "Erro ao enviar webhook",
    }
  }
}

function construirPayloadWebhook(
  solicitacaoId: string,
  data: SolicitacaoCompletaFormData
): any {
  const catalogo = getCatalogo()
  const produtoTipo = catalogo.produtoTipos.find(t => t.id === data.produto.produtoTipoId)
  const produtoModelo = getModeloPorId(data.produto.produtoModeloId)
  const substrato = catalogo.substratos.find(s => s.id === data.substrato.substratoId)
  const formato = catalogo.formatosPadrao.find(f => f.id === data.formato.formatoPadraoId)
  const alcaTipo = catalogo.alcaTipos.find(t => t.id === data.alca?.tipoId)
  const impressaoModo = catalogo.impressaoModos.find(m => m.id === data.impressao?.modoId)
  const impressaoCombinacao = impressaoModo?.combinacoes.find(c => c.id === data.impressao?.combinacaoId)
  const acondicionamento = catalogo.acondicionamentos.find(a => a.id === data.acondicionamento.tipoId)
  const modulo = catalogo.modulos.find(m => m.id === data.acondicionamento.moduloId)

  // Helper para verificar "Outro (Desenvolvimento)"
  const isOutro = (val: any) => val === "outro" || val === "Outro (Desenvolvimento)"

  // Coletar observações de desenvolvimento
  const observacoesDesenvolvimento: Array<{etapa: string, campo: string, descricao: string}> = []
  
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
  if (data.substrato.outroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Material", campo: "Substrato", descricao: data.substrato.outroDescricao })
  }
  if (data.substrato.gramagemOutroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Material", campo: "Gramagem", descricao: data.substrato.gramagemOutroDescricao })
  }
  if (data.alca?.outroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Alça", campo: "Tipo", descricao: data.alca.outroDescricao })
  }
  if (data.alca?.larguraOutroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Alça", campo: "Largura", descricao: data.alca.larguraOutroDescricao })
  }
  if (data.alca?.corOutroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Alça", campo: "Cor", descricao: data.alca.corOutroDescricao })
  }
  if (data.alca?.aplicacaoOutroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Alça", campo: "Aplicação", descricao: data.alca.aplicacaoOutroDescricao })
  }
  if (data.impressao?.outroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Impressão", campo: "Modo", descricao: data.impressao.outroDescricao })
  }
  if (data.acabamentos?.outroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Acabamentos", campo: "Outro", descricao: data.acabamentos.outroDescricao })
  }
  if (data.acondicionamento.outroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Entrega", campo: "Acondicionamento", descricao: data.acondicionamento.outroDescricao })
  }
  if (data.acondicionamento.moduloOutroDescricao) {
    observacoesDesenvolvimento.push({ etapa: "Entrega", campo: "Módulo", descricao: data.acondicionamento.moduloOutroDescricao })
  }
  if (data.desenvolvimentoObservacoes) {
    observacoesDesenvolvimento.push({ etapa: "Geral", campo: "Observações", descricao: data.desenvolvimentoObservacoes })
  }

  const freteQuantidades = data.entregas?.freteQuantidades && data.entregas.freteQuantidades.length > 0
    ? data.entregas.freteQuantidades
    : data.entregas?.freteQuantidade
      ? [data.entregas.freteQuantidade]
      : null

  return {
    // ===== DADOS DA SOLICITAÇÃO =====
    solicitacao: {
      id: solicitacaoId,
      numero: solicitacaoId.substring(0, 8).toUpperCase(),
      criadoEm: new Date().toISOString(),
    },

    // ===== DADOS DO PEDIDO =====
    dadosPedido: {
      vendedor: data.dadosGerais.vendedor,
      marca: data.dadosGerais.marca,
      contato: data.dadosGerais.contato,
      codigoMetrics: data.dadosGerais.codigoMetrics || null,
      empresa: data.dadosGerais.empresa || null,
      unidade: data.dadosGerais.unidade || null,
      solicitante: data.dadosGerais.nomeSolicitante || null,
      email: data.dadosGerais.emailSolicitante || null,
      telefone: data.dadosGerais.telefoneSolicitante || null,
      prazoDesejado: data.dadosGerais.prazoDesejado 
        ? new Date(data.dadosGerais.prazoDesejado).toLocaleDateString("pt-BR")
        : null,
      observacoes: data.dadosGerais.observacoesGerais || null,
    },
    
    // ===== CONDIÇÕES DE VENDA =====
    condicoesVenda: {
      tipoContrato: data.condicoesVenda?.tipoContrato || null,
      imposto: data.condicoesVenda?.imposto || null,
      condicaoPagamento: data.condicoesVenda?.condicaoPagamento || null,
      condicaoPagamentoOutra: data.condicoesVenda?.condicaoPagamentoOutra || null,
      royalties: data.condicoesVenda?.royalties || null,
      bvAgencia: data.condicoesVenda?.bvAgencia || null,
    },
    
    // ===== ENTREGAS =====
    entregas: {
      localUnico: data.entregas?.localUnico ?? true,
      cidadeUF: data.entregas?.cidadeUF || null,
      quantidadeLocalUnico: data.entregas?.quantidadeLocalUnico || null,
      pedidoMinimoCIF: data.entregas?.pedidoMinimoCIF || null,
      cidadesUFMultiplas: data.entregas?.cidadesUFMultiplas || null,
      numeroEntregas: data.entregas?.numeroEntregas || null,
      frequencia: data.entregas?.frequencia || data.entregas?.frequenciaOutra || null,
      freteQuantidades: freteQuantidades,
      freteQuantidade: data.entregas?.freteQuantidade || (freteQuantidades && freteQuantidades.length > 0 ? freteQuantidades[0] : null),
    },

    // ===== PRODUTO =====
    produto: {
      tipo: produtoTipo?.nome || data.produto.produtoTipoId,
      modelo: produtoModelo?.nome || data.produto.produtoModeloId,
    },

    // ===== TAMANHO =====
    tamanho: {
      formatoPadrao: formato?.nome || (isOutro(data.formato.formatoPadraoId) ? "Outro (Desenvolvimento)" : data.formato.formatoPadraoId) || null,
      formatoDimensoes: formato ? `${formato.largura}x${formato.altura}${formato.lateral ? `x${formato.lateral}` : ""} cm` : null,
      largura: isOutro(data.formato.formatoCustom?.largura) 
        ? `Outro - ${data.formato.larguraOutroDescricao || ""}` 
        : data.formato.formatoCustom?.largura || null,
      altura: isOutro(data.formato.formatoCustom?.altura) 
        ? `Outro - ${data.formato.alturaOutroDescricao || ""}` 
        : data.formato.formatoCustom?.altura || null,
      lateral: data.formato.formatoCustom?.lateral || null,
      sanfona: isOutro(data.formato.formatoCustom?.sanfona) 
        ? `Outro - ${data.formato.sanfonaOutroDescricao || ""}` 
        : data.formato.formatoCustom?.sanfona || null,
      sacoFundoV: data.formato.sacoFundoV || null,
      envelopeAbaAltura: data.formato.envelopeAbaAltura || null,
      observacoesFormato: data.formato.formatoCustom?.observacoes || null,
    },

    // ===== MATERIAL =====
    material: {
      substrato: substrato?.nome || (isOutro(data.substrato.substratoId) ? `Outro - ${data.substrato.outroDescricao || ""}` : data.substrato.substratoId) || null,
      gramagem: isOutro(data.substrato.substratoGramagem) 
        ? `Outro - ${data.substrato.gramagemOutroDescricao || ""}` 
        : data.substrato.substratoGramagem || null,
    },

    // ===== ALÇA E DETALHES =====
    alca: {
      tipo: alcaTipo?.nome || (isOutro(data.alca?.tipoId) ? `Outro - ${data.alca?.outroDescricao || ""}` : data.alca?.tipoId) || null,
      largura: isOutro(data.alca?.largura) 
        ? `Outro - ${data.alca?.larguraOutroDescricao || ""}` 
        : data.alca?.largura || null,
      cor: isOutro(data.alca?.cor) 
        ? `Outro - ${data.alca?.corOutroDescricao || ""}` 
        : data.alca?.cor || null,
      corCustom: data.alca?.corCustom || null,
      aplicacao: isOutro(data.alca?.aplicacao) 
        ? `Outro - ${data.alca?.aplicacaoOutroDescricao || ""}` 
        : data.alca?.aplicacao || null,
      comprimento: data.alca?.comprimento || null,
      unidadeComprimento: data.alca?.unidadeComprimento || "cm",
    },

    // ===== IMPRESSÃO =====
    impressao: {
      modo: impressaoModo?.nome || (isOutro(data.impressao?.modoId) ? `Outro - ${data.impressao?.outroDescricao || ""}` : data.impressao?.modoId) || null,
      combinacao: impressaoCombinacao?.nome || (isOutro(data.impressao?.combinacaoId) ? "Outro (Desenvolvimento)" : data.impressao?.combinacaoId) || null,
      camadas: {
        externa: data.impressao?.camadas?.externa || false,
        interna: data.impressao?.camadas?.interna || false,
        apara: data.impressao?.camadas?.apara || false,
        saco: data.impressao?.camadas?.saco || false,
        sacola: data.impressao?.camadas?.sacola || false,
        etiqueta: data.impressao?.camadas?.etiqueta || false,
      },
      percentualExterna: data.impressao?.percentualExterna || null,
      percentualInterna: data.impressao?.percentualInterna || null,
      apara: data.impressao?.apara?.ativa ? {
        modo: data.impressao.apara.modoId || null,
        combinacao: data.impressao.apara.combinacaoId || null,
        percentual: data.impressao.apara.percentual || null,
        observacoes: data.impressao.apara.observacoes || null,
      } : null,
      saco: data.impressao?.saco?.ativa ? {
        modo: data.impressao.saco.modoId || null,
        combinacao: data.impressao.saco.combinacaoId || null,
      } : null,
      envelope: data.impressao?.envelope?.ativa ? {
        modo: data.impressao.envelope.modoId || null,
        combinacao: data.impressao.envelope.combinacaoId || null,
      } : null,
      corFita: data.impressao?.corFita || null,
      corteRegistrado: data.impressao?.corteRegistrado || false,
      corteRegistradoTerceirizado: data.impressao?.corteRegistradoTerceirizado || false,
      observacoes: data.impressao?.observacoes || null,
    },

    // ===== ACABAMENTOS =====
    acabamentos: {
      reforcoFundo: data.acabamentos.reforcoFundo || false,
      reforcoFundoModelo: data.acabamentos.reforcoFundoModelo || null,
      bocaPalhaco: data.acabamentos.bocaPalhaco || false,
      furoFita: data.acabamentos.furoFita || false,
      furoFitaModelo: data.acabamentos.furoFitaModelo || null,
      duplaFace: data.acabamentos.duplaFace || false,
      velcro: data.acabamentos.velcro || false,
      velcroCor: data.acabamentos.velcroCor || null,
      velcroTamanho: data.acabamentos.velcroTamanho || null,
      outro: data.acabamentos.outroDescricao || null,
    },

    // ===== ENOBRECIMENTOS =====
    enobrecimentos: (data.enobrecimentos || []).map(enob => {
      const tipo = catalogo.enobrecimentoTipos.find(t => t.id === enob.tipoId)
      return {
        tipo: tipo?.nome || enob.tipoId,
        dados: enob.dados || null,
        observacoes: enob.observacoes || null,
      }
    }),

    // ===== ENTREGA E QUANTIDADE =====
    entrega: {
      quantidade: data.acondicionamento.quantidade,
      acondicionamento: acondicionamento?.nome || (isOutro(data.acondicionamento.tipoId) ? `Outro - ${data.acondicionamento.outroDescricao || ""}` : data.acondicionamento.tipoId) || null,
      modulo: modulo?.nome || (isOutro(data.acondicionamento.moduloId) ? `Outro - ${data.acondicionamento.moduloOutroDescricao || ""}` : data.acondicionamento.moduloId) || null,
    },

    // ===== OBSERVAÇÕES PARA ENGENHARIA =====
    observacoesEngenharia: observacoesDesenvolvimento,

    // ===== DADOS BRUTOS (para referência) =====
    dadosBrutos: data,
  }
}





