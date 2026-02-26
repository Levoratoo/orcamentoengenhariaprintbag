// API para buscar estatísticas do dashboard

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { subDays, startOfDay, endOfDay, format, getHours } from "date-fns"
import { ptBR } from "date-fns/locale"

export async function GET() {
  try {
    const hoje = new Date()
    const ultimos30Dias = subDays(hoje, 30)
    const ultimos7Dias = subDays(hoje, 7)

    // ========================================
    // 1. TOTAL DE SOLICITAÇÕES
    // ========================================
    const totalSolicitacoes = await prisma.solicitacao.count()
    
    const solicitacoesUltimos30Dias = await prisma.solicitacao.count({
      where: {
        createdAt: {
          gte: ultimos30Dias
        }
      }
    })

    const solicitacoesUltimos7Dias = await prisma.solicitacao.count({
      where: {
        createdAt: {
          gte: ultimos7Dias
        }
      }
    })

    // ========================================
    // 2. STATUS DAS SOLICITAÇÕES
    // ========================================
    const statusCount = await prisma.solicitacao.groupBy({
      by: ["statusWebhook"],
      _count: {
        id: true
      }
    })

    const statusMap: Record<string, number> = {
      sucesso: 0,
      erro: 0,
      pendente: 0
    }

    statusCount.forEach((s) => {
      statusMap[s.statusWebhook] = s._count.id
    })

    // ========================================
    // 3. SOLICITAÇÕES POR DIA (últimos 30 dias)
    // ========================================
    const solicitacoesPorDia = await prisma.solicitacao.findMany({
      where: {
        createdAt: {
          gte: ultimos30Dias
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: "asc"
      }
    })

    // Agrupar por dia
    const porDiaMap: Record<string, number> = {}
    
    // Inicializar todos os dias com 0
    for (let i = 29; i >= 0; i--) {
      const dia = subDays(hoje, i)
      const chave = format(dia, "dd/MM", { locale: ptBR })
      porDiaMap[chave] = 0
    }
    
    // Contar solicitações por dia
    solicitacoesPorDia.forEach((s) => {
      const chave = format(s.createdAt, "dd/MM", { locale: ptBR })
      if (porDiaMap[chave] !== undefined) {
        porDiaMap[chave]++
      }
    })

    const solicitacoesPorDiaArray = Object.entries(porDiaMap).map(([dia, quantidade]) => ({
      dia,
      quantidade
    }))

    // ========================================
    // 4. PRODUTOS MAIS SOLICITADOS
    // ========================================
    const produtosMaisSolicitados = await prisma.solicitacaoItem.groupBy({
      by: ["produtoTipoId", "produtoModeloId"],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: "desc"
        }
      },
      take: 10
    })

    // Buscar nomes dos produtos
    const produtosComNomes = await Promise.all(
      produtosMaisSolicitados.map(async (p) => {
        const tipo = await prisma.produtoTipo.findUnique({
          where: { id: p.produtoTipoId },
          select: { nome: true }
        })
        const modelo = await prisma.produtoModelo.findUnique({
          where: { id: p.produtoModeloId },
          select: { nome: true }
        })
        return {
          produto: `${tipo?.nome || "?"} - ${modelo?.nome || "?"}`,
          quantidade: p._count.id
        }
      })
    )

    // ========================================
    // 5. TEMPO MÉDIO DE RESPOSTA DO WEBHOOK
    // ========================================
    const solicitacoesComWebhook = await prisma.solicitacao.findMany({
      where: {
        statusWebhook: "sucesso",
        webhookEnviadoEm: {
          not: null
        }
      },
      select: {
        createdAt: true,
        webhookEnviadoEm: true
      }
    })

    let tempoMedioMs = 0
    if (solicitacoesComWebhook.length > 0) {
      const totalMs = solicitacoesComWebhook.reduce((acc, s) => {
        if (s.webhookEnviadoEm) {
          return acc + (s.webhookEnviadoEm.getTime() - s.createdAt.getTime())
        }
        return acc
      }, 0)
      tempoMedioMs = totalMs / solicitacoesComWebhook.length
    }

    // Converter para segundos
    const tempoMedioSegundos = Math.round(tempoMedioMs / 1000)

    // ========================================
    // 6. SUBSTRATOS MAIS USADOS
    // ========================================
    const substratosMaisUsados = await prisma.solicitacaoItem.groupBy({
      by: ["substratoId"],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: "desc"
        }
      },
      take: 5
    })

    const substratosComNomes = await Promise.all(
      substratosMaisUsados.map(async (s) => {
        const substrato = await prisma.substrato.findUnique({
          where: { id: s.substratoId },
          select: { nome: true }
        })
        return {
          substrato: substrato?.nome || "?",
          quantidade: s._count.id
        }
      })
    )

    // ========================================
    // 7. EMPRESAS QUE MAIS SOLICITAM
    // ========================================
    const empresasMaisSolicitam = await prisma.solicitacao.groupBy({
      by: ["empresa"],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: "desc"
        }
      },
      take: 5
    })

    const empresasArray = empresasMaisSolicitam.map((e) => ({
      empresa: e.empresa,
      quantidade: e._count.id
    }))

    // ========================================
    // 8. DISTRIBUIÇÃO POR TIPO DE PRODUTO
    // ========================================
    const tiposProduto = await prisma.solicitacaoItem.groupBy({
      by: ["produtoTipoId"],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: "desc"
        }
      }
    })

    const tiposProdutoComNomes = await Promise.all(
      tiposProduto.map(async (t) => {
        const tipo = await prisma.produtoTipo.findUnique({
          where: { id: t.produtoTipoId },
          select: { nome: true }
        })
        return {
          tipo: tipo?.nome || "?",
          quantidade: t._count.id
        }
      })
    )

    // ========================================
    // 9. MODOS DE IMPRESSÃO MAIS USADOS
    // ========================================
    const modosImpressao = await prisma.solicitacaoItem.groupBy({
      by: ["impressaoModoId"],
      _count: {
        id: true
      },
      where: {
        impressaoModoId: {
          not: null
        }
      },
      orderBy: {
        _count: {
          id: "desc"
        }
      },
      take: 8
    })

    const modosImpressaoComNomes = await Promise.all(
      modosImpressao.map(async (m) => {
        const modo = await prisma.impressaoModo.findUnique({
          where: { id: m.impressaoModoId! },
          select: { nome: true }
        })
        return {
          modo: modo?.nome || "?",
          quantidade: m._count.id
        }
      })
    )

    // ========================================
    // 10. ENOBRECIMENTOS MAIS SOLICITADOS
    // ========================================
    const enobrecimentos = await prisma.solicitacaoEnobrecimento.groupBy({
      by: ["enobrecimentoTipoId"],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: "desc"
        }
      },
      take: 8
    })

    const enobrecimentosComNomes = await Promise.all(
      enobrecimentos.map(async (e) => {
        const tipo = await prisma.enobrecimentoTipo.findUnique({
          where: { id: e.enobrecimentoTipoId },
          select: { nome: true }
        })
        return {
          enobrecimento: tipo?.nome || "?",
          quantidade: e._count.id
        }
      })
    )

    // ========================================
    // 11. ACONDICIONAMENTOS MAIS USADOS
    // ========================================
    const acondicionamentos = await prisma.solicitacaoItem.groupBy({
      by: ["acondicionamentoId"],
      _count: {
        id: true
      },
      where: {
        acondicionamentoId: {
          not: null
        }
      },
      orderBy: {
        _count: {
          id: "desc"
        }
      },
      take: 6
    })

    const acondicionamentosComNomes = await Promise.all(
      acondicionamentos.map(async (a) => {
        const acond = await prisma.acondicionamento.findUnique({
          where: { id: a.acondicionamentoId! },
          select: { nome: true }
        })
        return {
          acondicionamento: acond?.nome || "?",
          quantidade: a._count.id
        }
      })
    )

    // ========================================
    // 12. SOLICITAÇÕES POR HORA DO DIA
    // ========================================
    const solicitacoesPorHora = await prisma.solicitacao.findMany({
      where: {
        createdAt: {
          gte: ultimos30Dias
        }
      },
      select: {
        createdAt: true
      }
    })

    const porHoraMap: Record<number, number> = {}
    for (let i = 0; i < 24; i++) {
      porHoraMap[i] = 0
    }

    solicitacoesPorHora.forEach((s) => {
      const hora = getHours(s.createdAt)
      porHoraMap[hora]++
    })

    const solicitacoesPorHoraArray = Object.entries(porHoraMap).map(([hora, quantidade]) => ({
      hora: `${hora.toString().padStart(2, "0")}h`,
      quantidade
    }))

    // ========================================
    // 13. DISTRIBUIÇÃO DE QUANTIDADES
    // ========================================
    const itensComQuantidade = await prisma.solicitacaoItem.findMany({
      select: {
        quantidade: true
      }
    })

    const faixasQuantidade = {
      "0-100": 0,
      "101-500": 0,
      "501-1000": 0,
      "1001-5000": 0,
      "5000+": 0
    }

    itensComQuantidade.forEach((item) => {
      const qtd = item.quantidade
      if (qtd <= 100) faixasQuantidade["0-100"]++
      else if (qtd <= 500) faixasQuantidade["101-500"]++
      else if (qtd <= 1000) faixasQuantidade["501-1000"]++
      else if (qtd <= 5000) faixasQuantidade["1001-5000"]++
      else faixasQuantidade["5000+"]++
    })

    const distribuicaoQuantidades = Object.entries(faixasQuantidade).map(([faixa, quantidade]) => ({
      faixa,
      quantidade
    }))

    // ========================================
    // 14. COMPARAÇÃO PERÍODO A PERÍODO
    // ========================================
    const periodoAnterior30Dias = subDays(ultimos30Dias, 30)
    const solicitacoesPeriodoAnterior = await prisma.solicitacao.count({
      where: {
        createdAt: {
          gte: periodoAnterior30Dias,
          lt: ultimos30Dias
        }
      }
    })

    // Solicitações por dia do período anterior
    const solicitacoesPeriodoAnteriorPorDia = await prisma.solicitacao.findMany({
      where: {
        createdAt: {
          gte: periodoAnterior30Dias,
          lt: ultimos30Dias
        }
      },
      select: {
        createdAt: true
      }
    })

    const porDiaMapAnterior: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const dia = subDays(ultimos30Dias, i)
      const chave = format(dia, "dd/MM", { locale: ptBR })
      porDiaMapAnterior[chave] = 0
    }

    solicitacoesPeriodoAnteriorPorDia.forEach((s) => {
      const chave = format(s.createdAt, "dd/MM", { locale: ptBR })
      if (porDiaMapAnterior[chave] !== undefined) {
        porDiaMapAnterior[chave]++
      }
    })

    const solicitacoesPorDiaAnterior = Object.entries(porDiaMapAnterior).map(([dia, quantidade]) => ({
      dia,
      quantidade
    }))

    // Combinar dados para comparação
    const comparacaoPeriodos = solicitacoesPorDiaArray.map((atual, index) => ({
      dia: atual.dia,
      atual: atual.quantidade,
      anterior: solicitacoesPorDiaAnterior[index]?.quantidade || 0
    }))

    // ========================================
    // 15. TAXA DE SUCESSO DO WEBHOOK AO LONGO DO TEMPO
    // ========================================
    const solicitacoesComStatus = await prisma.solicitacao.findMany({
      where: {
        createdAt: {
          gte: ultimos30Dias
        }
      },
      select: {
        createdAt: true,
        statusWebhook: true
      }
    })

    const taxaSucessoPorDia: Record<string, { total: number; sucesso: number }> = {}
    
    for (let i = 29; i >= 0; i--) {
      const dia = subDays(hoje, i)
      const chave = format(dia, "dd/MM", { locale: ptBR })
      taxaSucessoPorDia[chave] = { total: 0, sucesso: 0 }
    }

    solicitacoesComStatus.forEach((s) => {
      const chave = format(s.createdAt, "dd/MM", { locale: ptBR })
      if (taxaSucessoPorDia[chave]) {
        taxaSucessoPorDia[chave].total++
        if (s.statusWebhook === "sucesso") {
          taxaSucessoPorDia[chave].sucesso++
        }
      }
    })

    const taxaSucessoArray = Object.entries(taxaSucessoPorDia).map(([dia, dados]) => ({
      dia,
      taxa: dados.total > 0 ? Math.round((dados.sucesso / dados.total) * 100) : 0,
      total: dados.total,
      sucesso: dados.sucesso
    }))

    // ========================================
    // 16. GRÁFICO COMBINADO MÚLTIPLAS MÉTRICAS
    // ========================================
    const metricasCombinadas = solicitacoesPorDiaArray.map((dia) => {
      const taxaDia = taxaSucessoArray.find(t => t.dia === dia.dia)
      return {
        dia: dia.dia,
        solicitacoes: dia.quantidade,
        sucesso: taxaDia?.sucesso || 0,
        erro: taxaDia ? taxaDia.total - taxaDia.sucesso : 0
      }
    })

    // ========================================
    // RESPOSTA
    // ========================================
    return NextResponse.json({
      resumo: {
        total: totalSolicitacoes,
        ultimos30Dias: solicitacoesUltimos30Dias,
        ultimos7Dias: solicitacoesUltimos7Dias,
        tempoMedioResposta: tempoMedioSegundos,
        periodoAnterior: solicitacoesPeriodoAnterior
      },
      status: {
        sucesso: statusMap.sucesso,
        erro: statusMap.erro,
        pendente: statusMap.pendente
      },
      solicitacoesPorDia: solicitacoesPorDiaArray,
      produtosMaisSolicitados: produtosComNomes,
      substratosMaisUsados: substratosComNomes,
      empresasMaisSolicitam: empresasArray,
      tiposProduto: tiposProdutoComNomes,
      modosImpressao: modosImpressaoComNomes,
      enobrecimentos: enobrecimentosComNomes,
      acondicionamentos: acondicionamentosComNomes,
      solicitacoesPorHora: solicitacoesPorHoraArray,
      distribuicaoQuantidades: distribuicaoQuantidades,
      comparacaoPeriodos: comparacaoPeriodos,
      taxaSucessoPorDia: taxaSucessoArray,
      metricasCombinadas: metricasCombinadas
    })
  } catch (error: any) {
    console.error("Erro ao buscar estatísticas:", error)
    return NextResponse.json(
      { erro: "Erro ao buscar estatísticas", detalhes: error.message },
      { status: 500 }
    )
  }
}

