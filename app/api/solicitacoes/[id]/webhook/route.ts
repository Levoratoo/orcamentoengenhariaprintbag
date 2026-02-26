// API para reenviar webhook de uma solicita��ǜo espec��fica

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { enviarWebhook } from "@/lib/webhook"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Buscar solicita��ǜo completa do banco
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
        { erro: "Solicita��ǜo nǜo encontrada" },
        { status: 404 }
      )
    }

    // Converter dados do banco para o formato esperado pelo webhook
    const item = solicitacao.itens[0]
    if (!item) {
      return NextResponse.json(
        { erro: "Solicita��ǜo sem itens" },
        { status: 400 }
      )
    }

    // Construir dados no formato SolicitacaoCompletaFormData
    const data = {
      dadosGerais: {
        vendedor: solicitacao.vendedor || "",
        marca: solicitacao.marca || "",
        contato: solicitacao.contato || "",
        codigoMetrics: solicitacao.codigoMetrics || "",
        empresa: solicitacao.empresa || "",
        unidade: solicitacao.unidade || "",
        nomeSolicitante: solicitacao.nomeSolicitante || "",
        emailSolicitante: solicitacao.emailSolicitante || "",
        telefoneSolicitante: solicitacao.telefoneSolicitante || "",
        prazoDesejado: solicitacao.prazoDesejado?.toISOString().split("T")[0] || "",
        observacoesGerais: solicitacao.observacoesGerais || "",
      },
      condicoesVenda: {
        tipoContrato: solicitacao.tipoContrato || "",
        imposto: solicitacao.imposto || "",
        condicaoPagamento: solicitacao.condicaoPagamento || "",
        condicaoPagamentoOutra: solicitacao.condicaoPagamentoOutra || "",
        royalties: solicitacao.royalties || "",
        bvAgencia: solicitacao.bvAgencia || "",
      },
      entregas: {
        localUnico: solicitacao.localUnico ?? true,
        cidadeUF: solicitacao.cidadeUF || "",
        quantidadeLocalUnico: solicitacao.quantidadeLocalUnico || undefined,
        pedidoMinimoCIF: solicitacao.pedidoMinimoCIF || "",
        cidadesUFMultiplas: solicitacao.cidadesUFMultiplas || "",
        anexarListaLojas: solicitacao.anexarListaLojas ?? false,
        quantidadeMultiplos: solicitacao.quantidadeMultiplos || "",
        numeroEntregas: solicitacao.numeroEntregas || "",
        frequenciaUnica: solicitacao.frequenciaUnica ?? true,
        quantidadeUnica: solicitacao.quantidadeUnica || undefined,
        frequencia: solicitacao.frequencia || "",
        frequenciaOutra: solicitacao.frequenciaOutra || "",
        quantidadeMultiplasEntregas: solicitacao.quantidadeMultiplasEntregas || undefined,
        frete: solicitacao.frete || "",
        freteQuantidades: (solicitacao.freteQuantidades && solicitacao.freteQuantidades.length > 0)
          ? solicitacao.freteQuantidades
          : (solicitacao.freteQuantidade ? [solicitacao.freteQuantidade] : []),
        freteQuantidade: solicitacao.freteQuantidade || undefined,
      },
      produto: {
        produtoTipoId: item.produtoTipoId,
        produtoModeloId: item.produtoModeloId,
        variacaoEnvelope: item.variacaoEnvelope || "",
      },
      formato: {
        formatoPadraoId: item.formatoPadraoId || "",
        formatoCustom: {
          largura: item.formatoCustomLargura || undefined,
          altura: item.formatoCustomAltura || undefined,
          lateral: item.formatoCustomLateral || undefined,
          observacoes: item.formatoCustomObservacoes || "",
        },
        sacoFundoV: item.larguraPadrao || item.alturaPadrao || item.sanfona ? {
          larguraPadrao: item.larguraPadrao?.toString() || "",
          alturaPadrao: item.alturaPadrao?.toString() || "",
          sanfonaPadrao: item.sanfona?.toString() || "",
        } : undefined,
        envelopeAbaAltura: item.aba || undefined,
      },
      substrato: {
        substratoId: item.substratoId || "",
        substratoGramagem: item.substratoGramagem || "",
      },
      alca: item.alcaTipoId ? {
        tipoId: item.alcaTipoId,
        largura: item.alcaLargura || "",
        cor: item.alcaCor || "",
        corCustom: item.alcaCorCustom || "",
        aplicacao: item.alcaAplicacao || "",
        comprimento: item.alcaComprimento || undefined,
        unidadeComprimento: "cm" as const,
      } : undefined,
      acabamentos: {
        reforcoFundo: item.reforcoFundo,
        reforcoFundoModelo: item.reforcoFundoModelo || "",
        bocaPalhaco: item.bocaPalhaco,
        furoFita: item.furoFita,
        furoFitaModelo: item.furoFitaModelo || "",
        duplaFace: item.duplaFace || false,
        velcro: item.velcro || false,
        velcroCor: item.velcroCor || "",
        velcroTamanho: item.velcroTamanho || undefined,
      },
      impressao: item.impressaoModoId ? {
        modoId: item.impressaoModoId,
        combinacaoId: item.impressaoCombinacaoId || "",
        camadas: item.impressaoCamadas ? (typeof item.impressaoCamadas === "string" ? JSON.parse(item.impressaoCamadas) : item.impressaoCamadas) : undefined,
        percentualExterna: item.percentualImpressaoExterna || undefined,
        percentualInterna: item.percentualImpressaoInterna || undefined,
        corFita: item.corFita || "",
        corteRegistrado: item.corteRegistrado || false,
        corteRegistradoTerceirizado: item.corteRegistradoTerceirizado || false,
        observacoes: item.impressaoObservacoes || "",
      } : undefined,
      enobrecimentos: item.enobrecimentos.map(enob => ({
        tipoId: enob.enobrecimentoTipoId,
        dados: enob.dados || {},
        observacoes: enob.observacoes || "",
      })),
      acondicionamento: {
        tipoId: item.acondicionamentoId || "",
        moduloId: item.moduloId || "",
        quantidade: item.quantidade,
      },
      desenvolvimentoObservacoes: item.desenvolvimentoObservacoes || "",
    }

    // Enviar webhook
    const resultado = await enviarWebhook(solicitacao.id, data)

    // Atualizar status do webhook no banco
    await prisma.solicitacao.update({
      where: { id: solicitacao.id },
      data: {
        statusWebhook: resultado.sucesso ? "sucesso" : "erro",
        responseWebhook: JSON.stringify(resultado.resposta || resultado.erro),
        webhookEnviadoEm: new Date(),
      },
    })

    return NextResponse.json({
      sucesso: resultado.sucesso,
      mensagem: resultado.sucesso ? "Webhook enviado com sucesso" : "Erro ao enviar webhook",
      resposta: resultado.resposta,
      erro: resultado.erro,
    })
  } catch (error: any) {
    console.error("Erro ao reenviar webhook:", error)
    return NextResponse.json(
      { 
        sucesso: false,
        erro: "Erro ao reenviar webhook", 
        detalhes: error.message 
      },
      { status: 500 }
    )
  }
}

