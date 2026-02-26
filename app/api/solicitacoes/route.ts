// API para gerenciar solicitações
// GET: lista todas as solicitações
// POST: cria uma nova solicitação

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { enviarWebhook } from "@/lib/webhook"
import { SolicitacaoCompletaFormData, solicitacaoCompletaSchema } from "@/lib/validations/solicitacao"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de busca e filtros
    const busca = searchParams.get("busca") || ""
    const status = searchParams.get("status") || ""
    const dataInicio = searchParams.get("dataInicio") || ""
    const dataFim = searchParams.get("dataFim") || ""
    const tipoProduto = searchParams.get("tipoProduto") || ""
    const ordenarPor = searchParams.get("ordenarPor") || "createdAt"
    const ordem = searchParams.get("ordem") || "desc"
    const pagina = parseInt(searchParams.get("pagina") || "1")
    const porPagina = parseInt(searchParams.get("porPagina") || "20")

    // Construir filtros
    const where: any = {}

    // Filtro de busca (texto livre)
    if (busca) {
      where.OR = [
        { empresa: { contains: busca, mode: "insensitive" } },
        { nomeSolicitante: { contains: busca, mode: "insensitive" } },
        { emailSolicitante: { contains: busca, mode: "insensitive" } },
        { unidade: { contains: busca, mode: "insensitive" } },
      ]
    }

    // Filtro por status
    if (status) {
      where.statusWebhook = status
    }

    // Filtro por data
    if (dataInicio || dataFim) {
      where.createdAt = {}
      if (dataInicio) {
        where.createdAt.gte = new Date(dataInicio)
      }
      if (dataFim) {
        const dataFimCompleta = new Date(dataFim)
        dataFimCompleta.setHours(23, 59, 59, 999)
        where.createdAt.lte = dataFimCompleta
      }
    }

    // Filtro por tipo de produto
    if (tipoProduto) {
      where.itens = {
        some: {
          produtoTipoId: tipoProduto
        }
      }
    }

    // Ordenação
    const orderBy: any = {}
    if (ordenarPor === "empresa") {
      orderBy.empresa = ordem
    } else if (ordenarPor === "data") {
      orderBy.createdAt = ordem
    } else if (ordenarPor === "status") {
      orderBy.statusWebhook = ordem
    } else {
      orderBy.createdAt = ordem
    }

    // Contar total para paginação
    const total = await prisma.solicitacao.count({ where })

    // Buscar com paginação
    const solicitacoes = await prisma.solicitacao.findMany({
      where,
      include: {
        itens: {
          include: {
            produtoTipo: true,
            produtoModelo: true,
          },
        },
      },
      orderBy,
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    })

    // Buscar tipos de produto para o filtro
    const tiposProduto = await prisma.produtoTipo.findMany({
      where: { ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    })

    return NextResponse.json({
      solicitacoes,
      paginacao: {
        pagina,
        porPagina,
        total,
        totalPaginas: Math.ceil(total / porPagina),
      },
      filtros: {
        tiposProduto,
      },
    })
  } catch (error: any) {
    console.error("Erro ao buscar solicitações:", error)
    return NextResponse.json(
      { erro: "Erro ao buscar solicitações", detalhes: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados
    let validatedData: SolicitacaoCompletaFormData
    try {
      validatedData = solicitacaoCompletaSchema.parse(body) as SolicitacaoCompletaFormData
    } catch (zodError: any) {
      console.error("Erro de validação Zod:", JSON.stringify(zodError.errors, null, 2))
      return NextResponse.json(
        { 
          erro: "Dados inválidos", 
          detalhes: zodError.errors,
          mensagem: zodError.errors?.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ")
        },
        { status: 400 }
      )
    }

    // ========== CONVERSÃO DE NOMES PARA IDs ==========
    // Quando o usuário seleciona opções pelo nome, precisamos converter para o ID do banco
    
    // Converter substrato (nome -> id)
    if (validatedData.substrato.substratoId && validatedData.substrato.substratoId !== "outro") {
      const substratoByName = await prisma.substrato.findFirst({ 
        where: { nome: validatedData.substrato.substratoId } 
      })
      if (substratoByName) {
        validatedData.substrato.substratoId = substratoByName.id
      }
    }

    // Converter formato padrão (nome -> id)
    if (validatedData.formato.formatoPadraoId && validatedData.formato.formatoPadraoId !== "outro") {
      const formatoByName = await prisma.formatoPadrao.findFirst({ 
        where: { nome: validatedData.formato.formatoPadraoId } 
      })
      if (formatoByName) {
        validatedData.formato.formatoPadraoId = formatoByName.id
      }
    }

    // Converter tipo de alça (nome -> id) - ignorar "Sem Alça" e "outro"
    const alcaTipoValor = validatedData.alca?.tipoId?.trim() || ""
    const isAlcaSemValor = alcaTipoValor === "" || alcaTipoValor === "outro" || 
                           alcaTipoValor === "Outro (Desenvolvimento)" || alcaTipoValor === "Sem Alça" ||
                           alcaTipoValor.toLowerCase().includes("sem alça") || alcaTipoValor.toLowerCase().includes("sem alca")
    if (validatedData.alca?.tipoId && !isAlcaSemValor) {
      const alcaByName = await prisma.alcaTipo.findFirst({ 
        where: { nome: validatedData.alca.tipoId } 
      })
      if (alcaByName) {
        validatedData.alca.tipoId = alcaByName.id
      }
    }

    // Converter modo de impressão (nome -> id)
    if (validatedData.impressao?.modoId && validatedData.impressao.modoId !== "outro" && validatedData.impressao.modoId !== "Sem Impressão") {
      const impressaoByName = await prisma.impressaoModo.findFirst({ 
        where: { nome: validatedData.impressao.modoId } 
      })
      if (impressaoByName) {
        validatedData.impressao.modoId = impressaoByName.id
        
        // Converter combinação de impressão (nome -> id)
        if (validatedData.impressao.combinacaoId && validatedData.impressao.combinacaoId !== "outro") {
          const combinacaoByName = await prisma.impressaoCombinacao.findFirst({ 
            where: { 
              nome: validatedData.impressao.combinacaoId,
              impressaoModoId: impressaoByName.id
            } 
          })
          if (combinacaoByName) {
            validatedData.impressao.combinacaoId = combinacaoByName.id
          }
        }
      }
    }

    // Converter acondicionamento (nome -> id)
    if (validatedData.acondicionamento.tipoId && validatedData.acondicionamento.tipoId !== "outro") {
      const acondByName = await prisma.acondicionamento.findFirst({ 
        where: { nome: validatedData.acondicionamento.tipoId } 
      })
      if (acondByName) {
        validatedData.acondicionamento.tipoId = acondByName.id
      }
    }

    // Converter módulo (nome ou "nome (quantidade)" -> id)
    if (validatedData.acondicionamento.moduloId && validatedData.acondicionamento.moduloId !== "outro") {
      // Tentar buscar pelo nome exato primeiro
      let moduloByName = await prisma.modulo.findFirst({ 
        where: { nome: validatedData.acondicionamento.moduloId } 
      })
      // Se não encontrar, tentar extrair o nome do formato "Nome (X un)"
      if (!moduloByName) {
        const nomeMatch = validatedData.acondicionamento.moduloId.match(/^(.+?)\s*\(/)
        if (nomeMatch) {
          moduloByName = await prisma.modulo.findFirst({ 
            where: { nome: nomeMatch[1].trim() } 
          })
        }
      }
      if (moduloByName) {
        validatedData.acondicionamento.moduloId = moduloByName.id
      }
    }

    // Converter enobrecimentos (nome -> id)
    if (validatedData.enobrecimentos && validatedData.enobrecimentos.length > 0) {
      for (const enob of validatedData.enobrecimentos) {
        if (enob.tipoId && enob.tipoId !== "outro") {
          const enobByName = await prisma.enobrecimentoTipo.findFirst({ 
            where: { nome: enob.tipoId } 
          })
          if (enobByName) {
            enob.tipoId = enobByName.id
          }
        }
      }
    }

    // ========== FIM DA CONVERSÃO ==========

    // Validar existência dos IDs de chaves estrangeiras obrigatórias
    const idsInvalidos: string[] = []
    
    // Validar produtoTipoId
    const produtoTipo = await prisma.produtoTipo.findUnique({ where: { id: validatedData.produto.produtoTipoId } })
    if (!produtoTipo) {
      idsInvalidos.push(`produtoTipoId: ${validatedData.produto.produtoTipoId}`)
    }

    // Validar produtoModeloId e verificar se pertence ao produtoTipoId
    const produtoModelo = await prisma.produtoModelo.findUnique({ where: { id: validatedData.produto.produtoModeloId } })
    if (!produtoModelo) {
      idsInvalidos.push(`produtoModeloId: ${validatedData.produto.produtoModeloId}`)
    } else if (produtoModelo.produtoTipoId !== validatedData.produto.produtoTipoId) {
      idsInvalidos.push(`produtoModeloId: ${validatedData.produto.produtoModeloId} não pertence ao produtoTipoId: ${validatedData.produto.produtoTipoId}`)
    }

    // Validar substratoId (se fornecido e não vazio, e não for "outro")
    const substratoId = validatedData.substrato.substratoId?.trim()
    if (substratoId && substratoId.length > 0 && substratoId !== "outro" && substratoId !== "Outro (Desenvolvimento)") {
      const substrato = await prisma.substrato.findUnique({ where: { id: substratoId } })
      if (!substrato) {
        idsInvalidos.push(`substratoId: ${substratoId}`)
      }
    }

    // Validar formatoPadraoId (se fornecido e não vazio, e não for "outro")
    const formatoPadraoId = validatedData.formato.formatoPadraoId?.trim()
    if (formatoPadraoId && formatoPadraoId.length > 0 && formatoPadraoId !== "outro" && formatoPadraoId !== "Outro (Desenvolvimento)") {
      const formatoPadrao = await prisma.formatoPadrao.findUnique({ where: { id: formatoPadraoId } })
      if (!formatoPadrao) {
        idsInvalidos.push(`formatoPadraoId: ${formatoPadraoId}`)
      }
    }

    // Validar alcaTipoId (se fornecido e não vazio, e não for "outro" ou "Sem Alça")
    const alcaTipoId = validatedData.alca?.tipoId?.trim()
    const isAlcaEspecial = !alcaTipoId || alcaTipoId === "" || alcaTipoId === "outro" || 
                           alcaTipoId === "Outro (Desenvolvimento)" || alcaTipoId === "Sem Alça" ||
                           alcaTipoId.toLowerCase().includes("sem alça") || alcaTipoId.toLowerCase().includes("sem alca")
    if (alcaTipoId && alcaTipoId.length > 0 && !isAlcaEspecial) {
      const alcaTipo = await prisma.alcaTipo.findUnique({ where: { id: alcaTipoId } })
      if (!alcaTipo) {
        idsInvalidos.push(`alcaTipoId: ${alcaTipoId}`)
      }
    }

    // Validar impressaoModoId (se fornecido e não vazio)
    const impressaoModoId = validatedData.impressao?.modoId?.trim()
    if (impressaoModoId && impressaoModoId.length > 0) {
      const impressaoModo = await prisma.impressaoModo.findUnique({ where: { id: impressaoModoId } })
      if (!impressaoModo) {
        idsInvalidos.push(`impressaoModoId: ${impressaoModoId}`)
      }
    }

    // Validar impressaoCombinacaoId (se fornecido e não vazio) e verificar se pertence ao impressaoModoId
    let impressaoCombinacaoIdVal = validatedData.impressao?.combinacaoId?.trim()
    const isOutro = impressaoCombinacaoIdVal === "outro" || impressaoCombinacaoIdVal === "Outro (Desenvolvimento)"
    
    // Ignorar se for "outro" ou variações
    if (impressaoCombinacaoIdVal && impressaoCombinacaoIdVal.length > 0 && !isOutro) {
      // Se não tem impressaoModoId, tentar recuperar a partir da combinação
      if (!impressaoModoId || impressaoModoId.length === 0) {
        // Primeiro tentar buscar pelo ID
        let impressaoCombinacao = await prisma.impressaoCombinacao.findUnique({ where: { id: impressaoCombinacaoIdVal } })
        
        // Se não encontrou pelo ID, tentar pelo nome
        if (!impressaoCombinacao) {
          impressaoCombinacao = await prisma.impressaoCombinacao.findFirst({ where: { nome: impressaoCombinacaoIdVal } })
          if (impressaoCombinacao) {
            // Atualizar o ID na validatedData
            if (validatedData.impressao) {
              validatedData.impressao.combinacaoId = impressaoCombinacao.id
              impressaoCombinacaoIdVal = impressaoCombinacao.id
            }
          }
        }
        
        if (impressaoCombinacao) {
          // Auto-preencher o modoId a partir da combinação
          if (validatedData.impressao) {
            validatedData.impressao.modoId = impressaoCombinacao.impressaoModoId
          }
        } else {
          idsInvalidos.push(`impressaoCombinacaoId: ${impressaoCombinacaoIdVal} não encontrado`)
        }
      } else {
        const impressaoCombinacao = await prisma.impressaoCombinacao.findUnique({ where: { id: impressaoCombinacaoIdVal } })
        if (!impressaoCombinacao) {
          // Tentar buscar pelo nome
          const combinacaoByName = await prisma.impressaoCombinacao.findFirst({ 
            where: { 
              nome: impressaoCombinacaoIdVal,
              impressaoModoId: impressaoModoId
            } 
          })
          if (combinacaoByName) {
            if (validatedData.impressao) {
              validatedData.impressao.combinacaoId = combinacaoByName.id
            }
          } else {
            idsInvalidos.push(`impressaoCombinacaoId: ${impressaoCombinacaoIdVal}`)
          }
        } else if (impressaoCombinacao.impressaoModoId !== impressaoModoId) {
          idsInvalidos.push(`impressaoCombinacaoId: ${impressaoCombinacaoIdVal} não pertence ao impressaoModoId: ${impressaoModoId}`)
        }
      }
    }

    // Validar impressaoAparaModoId (se fornecido e não vazio)
    const aparaModoId = validatedData.impressao?.apara?.modoId?.trim()
    if (aparaModoId && aparaModoId.length > 0) {
      const impressaoAparaModo = await prisma.impressaoModo.findUnique({ where: { id: aparaModoId } })
      if (!impressaoAparaModo) {
        idsInvalidos.push(`impressaoAparaModoId: ${aparaModoId}`)
      }
    }

    // Validar impressaoAparaCombinacaoId (se fornecido e não vazio)
    const aparaCombinacaoId = validatedData.impressao?.apara?.combinacaoId?.trim()
    if (aparaCombinacaoId && aparaCombinacaoId.length > 0) {
      if (!aparaModoId || aparaModoId.length === 0) {
        idsInvalidos.push(`impressaoAparaCombinacaoId requer impressaoAparaModoId`)
      } else {
        const impressaoAparaCombinacao = await prisma.impressaoCombinacao.findUnique({ where: { id: aparaCombinacaoId } })
        if (!impressaoAparaCombinacao) {
          idsInvalidos.push(`impressaoAparaCombinacaoId: ${aparaCombinacaoId}`)
        } else if (impressaoAparaCombinacao.impressaoModoId !== aparaModoId) {
          idsInvalidos.push(`impressaoAparaCombinacaoId: ${aparaCombinacaoId} não pertence ao impressaoAparaModoId: ${aparaModoId}`)
        }
      }
    }

    // Validar impressaoSacoModoId (se fornecido e não vazio)
    const sacoModoId = validatedData.impressao?.saco?.modoId?.trim()
    if (sacoModoId && sacoModoId.length > 0) {
      const impressaoSacoModo = await prisma.impressaoModo.findUnique({ where: { id: sacoModoId } })
      if (!impressaoSacoModo) {
        idsInvalidos.push(`impressaoSacoModoId: ${sacoModoId}`)
      }
    }

    // Validar impressaoSacoCombinacaoId (se fornecido e não vazio)
    const sacoCombinacaoId = validatedData.impressao?.saco?.combinacaoId?.trim()
    if (sacoCombinacaoId && sacoCombinacaoId.length > 0) {
      if (!sacoModoId || sacoModoId.length === 0) {
        idsInvalidos.push(`impressaoSacoCombinacaoId requer impressaoSacoModoId`)
      } else {
        const impressaoSacoCombinacao = await prisma.impressaoCombinacao.findUnique({ where: { id: sacoCombinacaoId } })
        if (!impressaoSacoCombinacao) {
          idsInvalidos.push(`impressaoSacoCombinacaoId: ${sacoCombinacaoId}`)
        } else if (impressaoSacoCombinacao.impressaoModoId !== sacoModoId) {
          idsInvalidos.push(`impressaoSacoCombinacaoId: ${sacoCombinacaoId} não pertence ao impressaoSacoModoId: ${sacoModoId}`)
        }
      }
    }

    // Validar impressaoEnvelopeModoId (se fornecido e não vazio)
    const envelopeModoId = validatedData.impressao?.envelope?.modoId?.trim()
    if (envelopeModoId && envelopeModoId.length > 0) {
      const impressaoEnvelopeModo = await prisma.impressaoModo.findUnique({ where: { id: envelopeModoId } })
      if (!impressaoEnvelopeModo) {
        idsInvalidos.push(`impressaoEnvelopeModoId: ${envelopeModoId}`)
      }
    }

    // Validar impressaoEnvelopeCombinacaoId (se fornecido e não vazio)
    const envelopeCombinacaoId = validatedData.impressao?.envelope?.combinacaoId?.trim()
    if (envelopeCombinacaoId && envelopeCombinacaoId.length > 0) {
      if (!envelopeModoId || envelopeModoId.length === 0) {
        idsInvalidos.push(`impressaoEnvelopeCombinacaoId requer impressaoEnvelopeModoId`)
      } else {
        const impressaoEnvelopeCombinacao = await prisma.impressaoCombinacao.findUnique({ where: { id: envelopeCombinacaoId } })
        if (!impressaoEnvelopeCombinacao) {
          idsInvalidos.push(`impressaoEnvelopeCombinacaoId: ${envelopeCombinacaoId}`)
        } else if (impressaoEnvelopeCombinacao.impressaoModoId !== envelopeModoId) {
          idsInvalidos.push(`impressaoEnvelopeCombinacaoId: ${envelopeCombinacaoId} não pertence ao impressaoEnvelopeModoId: ${envelopeModoId}`)
        }
      }
    }

    // Validar acondicionamentoId (se fornecido e não vazio)
    const acondicionamentoTipoId = validatedData.acondicionamento.tipoId?.trim()
    if (acondicionamentoTipoId && acondicionamentoTipoId.length > 0) {
      const acondicionamento = await prisma.acondicionamento.findUnique({ where: { id: acondicionamentoTipoId } })
      if (!acondicionamento) {
        idsInvalidos.push(`acondicionamentoId: ${acondicionamentoTipoId}`)
      }
    }

    // Validar moduloId (se fornecido e não vazio)
    const moduloId = validatedData.acondicionamento.moduloId?.trim()
    if (moduloId && moduloId.length > 0) {
      const modulo = await prisma.modulo.findUnique({ where: { id: moduloId } })
      if (!modulo) {
        idsInvalidos.push(`moduloId: ${moduloId}`)
      }
    }

    // Validar enobrecimentos (se fornecidos)
    if (validatedData.enobrecimentos && validatedData.enobrecimentos.length > 0) {
      for (let i = 0; i < validatedData.enobrecimentos.length; i++) {
        const enob = validatedData.enobrecimentos[i]
        const tipoId = enob.tipoId?.trim()
        // Ignorar se for "outro", vazio, ou variações
        const isOutroEnob = !tipoId || tipoId === "" || tipoId === "outro" || 
                            tipoId === "Outro (Desenvolvimento)" || tipoId.toLowerCase().includes("outro")
        if (tipoId && !isOutroEnob) {
          const enobrecimentoTipo = await prisma.enobrecimentoTipo.findUnique({ where: { id: tipoId } })
          if (!enobrecimentoTipo) {
            // Tentar buscar pelo nome
            const enobByName = await prisma.enobrecimentoTipo.findFirst({ where: { nome: tipoId } })
            if (enobByName) {
              enob.tipoId = enobByName.id
            } else {
              idsInvalidos.push(`enobrecimentoTipoId[${i}]: ${tipoId}`)
            }
          }
        }
      }
    }

    if (idsInvalidos.length > 0) {
      return NextResponse.json(
        { 
          erro: "IDs inválidos ou não encontrados no banco de dados", 
          campos: idsInvalidos,
          detalhes: "Um ou mais IDs de referência não existem no banco de dados. Verifique se os dados do catálogo foram populados corretamente executando: npx tsx prisma/seed.ts",
          sugestao: "Execute o seed do banco de dados para popular o catálogo: npx tsx prisma/seed.ts"
        },
        { status: 400 }
      )
    }

    // Helper para converter string vazia ou "outro" para null em campos de FK
    const fkOrNull = (val: string | undefined | null): string | null => {
      if (!val) return null
      const trimmed = val.trim()
      const lower = trimmed.toLowerCase()
      if (trimmed === "" || trimmed === "outro" || trimmed === "Outro (Desenvolvimento)" || 
          lower.includes("sem alça") || lower.includes("sem alca") || lower.includes("outro")) return null
      return trimmed
    }

    // Helper para converter valores numéricos (inclui tratar "outro" como null)
    const numOrNull = (val: any): number | null => {
      if (val === null || val === undefined) return null
      if (typeof val === "string") {
        const trimmed = val.trim()
        if (trimmed === "" || trimmed === "outro" || trimmed === "Outro (Desenvolvimento)") return null
        const num = parseFloat(trimmed)
        return isNaN(num) ? null : num
      }
      if (typeof val === "number") return val
      return null
    }

    // Preparar dados para criação (converter undefined/vazio para null)
    const itemData = {
      produtoTipoId: validatedData.produto.produtoTipoId,
      produtoModeloId: validatedData.produto.produtoModeloId,
      variacaoEnvelope: validatedData.produto.variacaoEnvelope || null,
      formatoPadraoId: fkOrNull(validatedData.formato.formatoPadraoId),
      formatoCustomLargura: numOrNull(validatedData.formato.formatoCustom?.largura),
      formatoCustomAltura: numOrNull(validatedData.formato.formatoCustom?.altura),
      formatoCustomLateral: numOrNull(validatedData.formato.formatoCustom?.lateral),
      formatoCustomObservacoes: validatedData.formato.formatoCustom?.observacoes || null,
      larguraPadrao: numOrNull(validatedData.formato.sacoFundoV?.larguraPadrao),
      alturaPadrao: numOrNull(validatedData.formato.sacoFundoV?.alturaPadrao),
      sanfona: numOrNull(validatedData.formato.sacoFundoV?.sanfonaPadrao),
      aba: validatedData.formato.envelopeAbaAltura ?? null,
      substratoId: fkOrNull(validatedData.substrato.substratoId) || validatedData.substrato.substratoId, // Substrato é obrigatório
      substratoGramagem: validatedData.substrato.substratoGramagem || null,
      alcaTipoId: fkOrNull(validatedData.alca?.tipoId),
      alcaLargura: validatedData.alca?.largura ?? null,
      alcaComprimento: validatedData.alca?.comprimento ?? null,
      alcaCor: validatedData.alca?.cor ?? null,
      alcaCorCustom: validatedData.alca?.corCustom ?? null,
      alcaAplicacao: validatedData.alca?.aplicacao ?? null,
      reforcoFundo: validatedData.acabamentos.reforcoFundo,
      reforcoFundoModelo: validatedData.acabamentos.reforcoFundoModelo || null,
      bocaPalhaco: validatedData.acabamentos.bocaPalhaco,
      furoFita: validatedData.acabamentos.furoFita,
      furoFitaModelo: validatedData.acabamentos.furoFitaModelo || null,
      duplaFace: validatedData.acabamentos.duplaFace || false,
      velcro: validatedData.acabamentos.velcro || false,
      velcroCor: validatedData.acabamentos.velcroCor ?? null,
      velcroTamanho: validatedData.acabamentos.velcroTamanho ?? null,
      impressaoModoId: fkOrNull(validatedData.impressao?.modoId),
      impressaoCombinacaoId: fkOrNull(validatedData.impressao?.combinacaoId),
      impressaoCamadas: validatedData.impressao?.camadas ? validatedData.impressao.camadas as any : null,
      impressaoObservacoes: validatedData.impressao?.observacoes || null,
      percentualImpressaoExterna: validatedData.impressao?.percentualExterna ?? null,
      percentualImpressaoInterna: validatedData.impressao?.percentualInterna ?? null,
      impressaoApara: validatedData.impressao?.apara?.ativa || false,
      impressaoAparaModoId: fkOrNull(validatedData.impressao?.apara?.modoId),
      impressaoAparaCombinacaoId: fkOrNull(validatedData.impressao?.apara?.combinacaoId),
      percentualImpressaoApara: validatedData.impressao?.apara?.percentual ?? null,
      impressaoAparaObservacoes: validatedData.impressao?.apara?.observacoes || null,
      impressaoSaco: validatedData.impressao?.saco?.ativa || false,
      impressaoSacoModoId: fkOrNull(validatedData.impressao?.saco?.modoId),
      impressaoSacoCombinacaoId: fkOrNull(validatedData.impressao?.saco?.combinacaoId),
      impressaoEnvelope: validatedData.impressao?.envelope?.ativa || false,
      impressaoEnvelopeModoId: fkOrNull(validatedData.impressao?.envelope?.modoId),
      impressaoEnvelopeCombinacaoId: fkOrNull(validatedData.impressao?.envelope?.combinacaoId),
      corFita: validatedData.impressao?.corFita ?? null,
      corteRegistrado: validatedData.impressao?.corteRegistrado || false,
      corteRegistradoTerceirizado: validatedData.impressao?.corteRegistradoTerceirizado || false,
      acondicionamentoId: fkOrNull(validatedData.acondicionamento.tipoId),
      moduloId: fkOrNull(validatedData.acondicionamento.moduloId),
      quantidade: validatedData.acondicionamento.quantidade,
      desenvolvimentoObservacoes: validatedData.desenvolvimentoObservacoes || null,
      enobrecimentos: {
        create: validatedData.enobrecimentos
          ?.filter((enob) => {
            // Filtrar enobrecimentos com tipoId válido (não "outro", não vazio)
            const tipoId = enob.tipoId?.trim() || ""
            const lower = tipoId.toLowerCase()
            return tipoId !== "" && tipoId !== "outro" && 
                   !lower.includes("outro") && !lower.includes("desenvolvimento")
          })
          .map((enob) => ({
            enobrecimentoTipoId: enob.tipoId,
            dados: enob.dados || null,
            observacoes: enob.observacoes || null,
          })) || [],
      },
    }

    const freteQuantidades = validatedData.entregas?.freteQuantidades && validatedData.entregas.freteQuantidades.length > 0
      ? validatedData.entregas.freteQuantidades
      : []
    const freteQuantidadeCompat = validatedData.entregas?.freteQuantidade ?? (freteQuantidades.length > 0 ? freteQuantidades[0] : null)

    // Criar solicitação no banco
    const solicitacao = await prisma.solicitacao.create({
      data: {
        // Novos campos principais (obrigatórios)
        vendedor: validatedData.dadosGerais.vendedor,
        marca: validatedData.dadosGerais.marca,
        contato: validatedData.dadosGerais.contato,
        codigoMetrics: validatedData.dadosGerais.codigoMetrics || null,
        
        // Campos legados (opcionais)
        empresa: validatedData.dadosGerais.empresa || null,
        unidade: validatedData.dadosGerais.unidade || null,
        nomeSolicitante: validatedData.dadosGerais.nomeSolicitante || null,
        emailSolicitante: validatedData.dadosGerais.emailSolicitante || null,
        telefoneSolicitante: validatedData.dadosGerais.telefoneSolicitante || null,
        prazoDesejado: validatedData.dadosGerais.prazoDesejado
          ? new Date(validatedData.dadosGerais.prazoDesejado)
          : null,
        observacoesGerais: validatedData.dadosGerais.observacoesGerais || null,
        
        // Condições de venda
        tipoContrato: validatedData.condicoesVenda?.tipoContrato || null,
        imposto: validatedData.condicoesVenda?.imposto || null,
        condicaoPagamento: validatedData.condicoesVenda?.condicaoPagamento || null,
        condicaoPagamentoOutra: validatedData.condicoesVenda?.condicaoPagamentoOutra || null,
        royalties: validatedData.condicoesVenda?.royalties || null,
        bvAgencia: validatedData.condicoesVenda?.bvAgencia || null,
        
        // Entregas
        localUnico: validatedData.entregas?.localUnico ?? true,
        cidadeUF: validatedData.entregas?.cidadeUF || null,
        quantidadeLocalUnico: validatedData.entregas?.quantidadeLocalUnico || null,
        pedidoMinimoCIF: validatedData.entregas?.pedidoMinimoCIF || null,
        cidadesUFMultiplas: validatedData.entregas?.cidadesUFMultiplas || null,
        anexarListaLojas: validatedData.entregas?.anexarListaLojas ?? false,
        quantidadeMultiplos: validatedData.entregas?.quantidadeMultiplos || null,
        numeroEntregas: validatedData.entregas?.numeroEntregas || null,
        frequenciaUnica: validatedData.entregas?.frequenciaUnica ?? true,
        quantidadeUnica: validatedData.entregas?.quantidadeUnica || null,
        frequencia: validatedData.entregas?.frequencia || null,
        frequenciaOutra: validatedData.entregas?.frequenciaOutra || null,
        quantidadeMultiplasEntregas: validatedData.entregas?.quantidadeMultiplasEntregas || null,
        frete: validatedData.entregas?.frete || null,
        freteQuantidade: freteQuantidadeCompat,
        freteQuantidades: freteQuantidades,
        
        statusWebhook: "pendente",
        itens: {
          create: itemData,
        },
      },
      include: {
        itens: {
          include: {
            enobrecimentos: {
              include: {
                enobrecimentoTipo: true,
              },
            },
          },
        },
      },
    })

    // Disparar webhook de forma assíncrona (não bloquear resposta)
    enviarWebhook(solicitacao.id, validatedData)
      .then((resultado) => {
        // Atualizar status do webhook no banco
        prisma.solicitacao.update({
          where: { id: solicitacao.id },
          data: {
            statusWebhook: resultado.sucesso ? "sucesso" : "erro",
            responseWebhook: JSON.stringify(resultado.resposta || resultado.erro),
            webhookEnviadoEm: new Date(),
          },
        }).catch((err) => {
          console.error("Erro ao atualizar status do webhook:", err)
        })
      })
      .catch((err) => {
        console.error("Erro ao enviar webhook:", err)
        prisma.solicitacao.update({
          where: { id: solicitacao.id },
          data: {
            statusWebhook: "erro",
            responseWebhook: err.message,
            webhookEnviadoEm: new Date(),
          },
        }).catch((updateErr) => {
          console.error("Erro ao atualizar status do webhook após erro:", updateErr)
        })
      })

    return NextResponse.json(solicitacao, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar solicitação:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: error.errors },
        { status: 400 }
      )
    }

    // Tratamento específico para erro de chave estrangeira do Prisma
    if (error.code === "P2003") {
      const fieldName = error.meta?.field_name || "campo desconhecido"
      const modelName = error.meta?.model_name || "modelo desconhecido"
      
      console.error("Erro P2003 - Violação de chave estrangeira:", {
        campo: fieldName,
        modelo: modelName,
        meta: error.meta,
        stack: error.stack
      })
      
      return NextResponse.json(
        { 
          erro: "Violação de chave estrangeira", 
          detalhes: `O campo '${fieldName}' no modelo '${modelName}' referencia um registro que não existe no banco de dados. Verifique se todos os IDs fornecidos são válidos e se o catálogo foi populado corretamente.`,
          codigo: error.code,
          campo: fieldName,
          modelo: modelName,
          meta: error.meta,
          sugestao: "As validações prévias deveriam ter capturado este erro. Se persistir, pode ser uma relação hierárquica (ex: combinação não pertence ao modo de impressão)."
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { erro: "Erro ao criar solicitação", detalhes: error.message },
      { status: 500 }
    )
  }
}






