"use client"

import {
  SHOWCASE_STATIC_SOLICITACAO_IDS,
  ShowcaseState,
  getInitialShowcaseState,
} from "@/lib/showcase-data"
import { getCatalogo, getModeloPorId, getProdutoTipos } from "@/lib/catalogo"

const STORAGE_KEY = "orcamento-showcase-state-v1"
const PDF_FALLBACK = "PDF indisponível na vitrine estática. No ambiente completo o PDF é gerado no backend."

declare global {
  interface Window {
    __showcaseApiInstalled?: boolean
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}

function normalizePath(pathname: string): string {
  const index = pathname.indexOf("/api/")
  return index >= 0 ? pathname.slice(index) : pathname
}

function readState(): ShowcaseState {
  if (typeof window === "undefined") return getInitialShowcaseState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seed = getInitialShowcaseState()
      writeState(seed)
      return seed
    }
    const parsed = JSON.parse(raw) as ShowcaseState
    if (!parsed || !Array.isArray(parsed.solicitacoes) || !Array.isArray(parsed.etapas)) {
      const seed = getInitialShowcaseState()
      writeState(seed)
      return seed
    }
    return parsed
  } catch {
    const seed = getInitialShowcaseState()
    writeState(seed)
    return seed
  }
}

function writeState(state: ShowcaseState): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function parseBody(raw: string): Record<string, any> {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, any>
  } catch {
    return {}
  }
}

function dashboardResponse(state: ShowcaseState) {
  const total = state.solicitacoes.length
  const sucesso = state.solicitacoes.filter((s) => s.statusWebhook === "sucesso").length
  const erro = state.solicitacoes.filter((s) => s.statusWebhook === "erro").length
  const pendente = total - sucesso - erro

  return {
    resumo: {
      total,
      ultimos30Dias: total,
      ultimos7Dias: Math.min(total, 2),
      tempoMedioResposta: 4.2,
      periodoAnterior: Math.max(0, total - 1),
    },
    status: { sucesso, erro, pendente },
    solicitacoesPorDia: [
      { dia: "01/03", quantidade: 1 },
      { dia: "03/03", quantidade: 1 },
      { dia: "05/03", quantidade: 1 },
      { dia: "08/03", quantidade: 2 },
    ],
    produtosMaisSolicitados: [
      { produto: "Sacola Alça Fita", quantidade: 3 },
      { produto: "Envelope Comercial", quantidade: 1 },
    ],
    substratosMaisUsados: [
      { substrato: "Papel Kraft", quantidade: 2 },
      { substrato: "Cartão Triplex", quantidade: 1 },
    ],
    empresasMaisSolicitam: [
      { empresa: "Printbag", quantidade: 2 },
      { empresa: "Fashion Group", quantidade: 1 },
    ],
    tiposProduto: [
      { tipo: "Sacola", quantidade: 3 },
      { tipo: "Envelope", quantidade: 1 },
    ],
    modosImpressao: [
      { modo: "Offset", quantidade: 3 },
      { modo: "Digital", quantidade: 1 },
    ],
    enobrecimentos: [
      { enobrecimento: "Hot Stamping", quantidade: 1 },
      { enobrecimento: "Laminação Fosca", quantidade: 1 },
    ],
    acondicionamentos: [
      { acondicionamento: "Fardo", quantidade: 3 },
      { acondicionamento: "Caixa", quantidade: 1 },
    ],
    solicitacoesPorHora: [
      { hora: "09:00", quantidade: 1 },
      { hora: "12:00", quantidade: 1 },
      { hora: "15:00", quantidade: 1 },
      { hora: "18:00", quantidade: 1 },
    ],
    distribuicaoQuantidades: [
      { faixa: "1-1.999", quantidade: 1 },
      { faixa: "2.000-4.999", quantidade: 2 },
      { faixa: "5.000-9.999", quantidade: 1 },
      { faixa: "10.000+", quantidade: 0 },
    ],
    comparacaoPeriodos: [
      { dia: "01/03", atual: 1, anterior: 0 },
      { dia: "03/03", atual: 1, anterior: 1 },
      { dia: "05/03", atual: 1, anterior: 0 },
      { dia: "08/03", atual: 2, anterior: 1 },
    ],
    taxaSucessoPorDia: [
      { dia: "01/03", taxa: 100, total: 1, sucesso: 1 },
      { dia: "03/03", taxa: 0, total: 1, sucesso: 0 },
      { dia: "05/03", taxa: 100, total: 1, sucesso: 1 },
      { dia: "08/03", taxa: 50, total: 2, sucesso: 1 },
    ],
    metricasCombinadas: [
      { dia: "01/03", solicitacoes: 1, sucesso: 1, erro: 0 },
      { dia: "03/03", solicitacoes: 1, sucesso: 0, erro: 1 },
      { dia: "05/03", solicitacoes: 1, sucesso: 1, erro: 0 },
      { dia: "08/03", solicitacoes: 2, sucesso: 1, erro: 0 },
    ],
  }
}

function listResponse(state: ShowcaseState, url: URL) {
  const busca = (url.searchParams.get("busca") || "").trim().toLowerCase()
  const status = (url.searchParams.get("status") || "").trim()
  const tipoProduto = (url.searchParams.get("tipoProduto") || "").trim()
  const dataInicio = url.searchParams.get("dataInicio")
  const dataFim = url.searchParams.get("dataFim")
  const ordenarPor = url.searchParams.get("ordenarPor") || "data"
  const ordem = url.searchParams.get("ordem") === "asc" ? "asc" : "desc"
  const pagina = Math.max(1, Number(url.searchParams.get("pagina") || 1))
  const porPagina = Math.max(1, Number(url.searchParams.get("porPagina") || 20))

  let items = [...state.solicitacoes]

  if (busca) {
    items = items.filter((item) => {
      const empresa = (item.empresa || "").toLowerCase()
      const nome = (item.nomeSolicitante || item.contato || "").toLowerCase()
      const email = (item.emailSolicitante || "").toLowerCase()
      return empresa.includes(busca) || nome.includes(busca) || email.includes(busca)
    })
  }

  if (status) {
    items = items.filter((item) => item.statusWebhook === status)
  }

  if (tipoProduto) {
    items = items.filter((item) => item.itens?.[0]?.produtoTipo?.id === tipoProduto)
  }

  if (dataInicio) {
    const start = new Date(`${dataInicio}T00:00:00.000Z`).getTime()
    items = items.filter((item) => new Date(item.createdAt).getTime() >= start)
  }

  if (dataFim) {
    const end = new Date(`${dataFim}T23:59:59.999Z`).getTime()
    items = items.filter((item) => new Date(item.createdAt).getTime() <= end)
  }

  items.sort((a, b) => {
    let diff = 0
    if (ordenarPor === "empresa") diff = (a.empresa || "").localeCompare(b.empresa || "", "pt-BR")
    else if (ordenarPor === "status") diff = a.statusWebhook.localeCompare(b.statusWebhook, "pt-BR")
    else diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    return ordem === "asc" ? diff : diff * -1
  })

  const total = items.length
  const totalPaginas = total === 0 ? 0 : Math.ceil(total / porPagina)
  const fatia = items.slice((pagina - 1) * porPagina, pagina * porPagina)
  const tiposMap = new Map<string, string>()
  state.solicitacoes.forEach((s) => {
    const tipo = s.itens?.[0]?.produtoTipo
    if (tipo?.id && tipo?.nome) tiposMap.set(tipo.id, tipo.nome)
  })

  return {
    solicitacoes: fatia.map((item) => ({
      id: item.id,
      empresa: item.empresa || item.marca || "Sem empresa",
      nomeSolicitante: item.nomeSolicitante || item.contato || "Sem contato",
      emailSolicitante: item.emailSolicitante || "showcase@printbag.local",
      statusWebhook: item.statusWebhook,
      createdAt: item.createdAt,
      itens: item.itens.map((it) => ({
        produtoTipo: { id: it.produtoTipo?.id || "sem-tipo", nome: it.produtoTipo?.nome || "Sem tipo" },
        produtoModelo: { nome: it.produtoModelo?.nome || "Sem modelo" },
      })),
    })),
    paginacao: { pagina, porPagina, total, totalPaginas },
    filtros: {
      tiposProduto: Array.from(tiposMap.entries()).map(([id, nome]) => ({ id, nome })),
    },
  }
}

function createSolicitacaoFromForm(data: Record<string, any>, id: string) {
  const catalogo = getCatalogo()
  const produtoTipoId = String(data?.produto?.produtoTipoId || "")
  const produtoModeloId = String(data?.produto?.produtoModeloId || "")
  const formatoId = String(data?.formato?.formatoPadraoId || "")
  const substratoId = String(data?.substrato?.substratoId || "")
  const modoId = String(data?.impressao?.modoId || "")
  const combinacaoId = String(data?.impressao?.combinacaoId || "")
  const alcaId = String(data?.alca?.tipoId || "")
  const acondicionamentoId = String(data?.acondicionamento?.tipoId || "")
  const moduloId = String(data?.acondicionamento?.moduloId || "")

  const tipo = getProdutoTipos().find((item) => item.id === produtoTipoId)
  const modelo = getModeloPorId(produtoModeloId)
  const formato = catalogo.formatosPadrao.find((item) => item.id === formatoId)
  const substrato = catalogo.substratos.find((item) => item.id === substratoId)
  const alca = catalogo.alcaTipos.find((item) => item.id === alcaId)
  const modo = catalogo.impressaoModos.find((item) => item.id === modoId)
  const combinacao = modo?.combinacoes.find((item) => item.id === combinacaoId)
  const acondicionamento = catalogo.acondicionamentos.find((item) => item.id === acondicionamentoId)
  const modulo = catalogo.modulos.find((item) => item.id === moduloId)

  return {
    id,
    vendedor: data?.dadosGerais?.vendedor || null,
    marca: data?.dadosGerais?.marca || null,
    contato: data?.dadosGerais?.contato || null,
    codigoMetrics: data?.dadosGerais?.codigoMetrics || null,
    empresa: data?.dadosGerais?.empresa || data?.dadosGerais?.marca || "Projeto Vitrine",
    unidade: data?.dadosGerais?.unidade || null,
    nomeSolicitante: data?.dadosGerais?.nomeSolicitante || data?.dadosGerais?.vendedor || null,
    emailSolicitante: data?.dadosGerais?.emailSolicitante || "showcase@printbag.local",
    telefoneSolicitante: data?.dadosGerais?.telefoneSolicitante || null,
    observacoesGerais: data?.dadosGerais?.observacoesGerais || null,
    tipoContrato: data?.condicoesVenda?.tipoContrato || null,
    imposto: data?.condicoesVenda?.imposto || null,
    condicaoPagamento: data?.condicoesVenda?.condicaoPagamento || null,
    condicaoPagamentoOutra: data?.condicoesVenda?.condicaoPagamentoOutra || null,
    royalties: data?.condicoesVenda?.royalties || null,
    bvAgencia: data?.condicoesVenda?.bvAgencia || null,
    localUnico: typeof data?.entregas?.localUnico === "boolean" ? data.entregas.localUnico : null,
    cidadeUF: data?.entregas?.cidadeUF || null,
    pedidoMinimoCIF: data?.entregas?.pedidoMinimoCIF || null,
    quantidadeMultiplos: data?.produto?.quantidade || null,
    numeroEntregas: data?.entregas?.numeroEntregas ? String(data.entregas.numeroEntregas) : null,
    frequencia: data?.entregas?.frequencia || null,
    frequenciaOutra: data?.entregas?.frequenciaOutra || null,
    frete: data?.entregas?.frete || null,
    freteQuantidade: Number(data?.entregas?.freteQuantidade) || null,
    freteQuantidades: Array.isArray(data?.entregas?.freteQuantidades) ? data.entregas.freteQuantidades : null,
    statusWebhook: "pendente" as const,
    responseWebhook: null,
    webhookEnviadoEm: null,
    createdAt: new Date().toISOString(),
    itens: [
      {
        produtoTipo: tipo ? { id: tipo.id, nome: tipo.nome, codigo: tipo.codigo } : null,
        produtoModelo: modelo ? { id: modelo.id, nome: modelo.nome, codigo: modelo.codigo } : null,
        variacaoEnvelope: data?.produto?.variacaoEnvelope || null,
        formatoPadrao: formato ? { id: formato.id, nome: formato.nome, largura: formato.largura, altura: formato.altura, lateral: formato.lateral } : null,
        substrato: substrato ? { id: substrato.id, nome: substrato.nome } : null,
        substratoGramagem: data?.substrato?.substratoGramagem || null,
        alcaTipo: alca ? { id: alca.id, nome: alca.nome } : null,
        alcaLargura: data?.alca?.largura || null,
        alcaCor: data?.alca?.cor || null,
        alcaCorCustom: data?.alca?.corCustom || null,
        alcaAplicacao: data?.alca?.aplicacao || null,
        alcaComprimento: Number(data?.alca?.comprimento) || null,
        reforcoFundo: Boolean(data?.acabamentos?.reforcoFundo),
        reforcoFundoModelo: data?.acabamentos?.reforcoFundoModelo || null,
        bocaPalhaco: Boolean(data?.acabamentos?.bocaPalhaco),
        furoFita: Boolean(data?.acabamentos?.furoFita),
        furoFitaModelo: data?.acabamentos?.furoFitaModelo || null,
        duplaFace: Boolean(data?.acabamentos?.duplaFace),
        velcro: Boolean(data?.acabamentos?.velcro),
        velcroCor: data?.acabamentos?.velcroCor || null,
        velcroTamanho: Number(data?.acabamentos?.velcroTamanho) || null,
        impressaoModo: modo ? { id: modo.id, nome: modo.nome } : null,
        impressaoCombinacao: combinacao ? { id: combinacao.id, nome: combinacao.nome } : null,
        impressaoCamadas: data?.impressao?.camadas || null,
        impressaoObservacoes: data?.impressao?.observacoes || null,
        percentualImpressaoExterna: Number(data?.impressao?.percentualExterna) || null,
        percentualImpressaoInterna: Number(data?.impressao?.percentualInterna) || null,
        impressaoApara: Boolean(data?.impressao?.apara?.ativa),
        percentualImpressaoApara: Number(data?.impressao?.apara?.percentual) || null,
        impressaoAparaObservacoes: data?.impressao?.apara?.observacoes || null,
        impressaoSaco: Boolean(data?.impressao?.saco?.ativa),
        impressaoEnvelope: Boolean(data?.impressao?.envelope?.ativa),
        corFita: data?.impressao?.corFita || null,
        corteRegistrado: Boolean(data?.impressao?.corteRegistrado),
        corteRegistradoTerceirizado: Boolean(data?.impressao?.corteRegistradoTerceirizado),
        acondicionamento: acondicionamento ? { id: acondicionamento.id, nome: acondicionamento.nome } : null,
        modulo: modulo ? { id: modulo.id, nome: modulo.nome } : null,
        quantidade: Number(data?.acondicionamento?.quantidade) || null,
        desenvolvimentoObservacoes: data?.desenvolvimentoObservacoes || null,
        enobrecimentos: (data?.enobrecimentos || []).map((item: any) => ({
          enobrecimentoTipo: catalogo.enobrecimentoTipos.find((t) => t.id === item?.tipoId)
            ? {
                id: item.tipoId,
                nome: catalogo.enobrecimentoTipos.find((t) => t.id === item?.tipoId)?.nome || item.tipoId,
              }
            : null,
          dados: item?.dados || null,
          observacoes: item?.observacoes || null,
        })),
      },
    ],
  }
}

async function readRawBody(input: RequestInfo | URL, init?: RequestInit): Promise<string> {
  if (typeof init?.body === "string") return init.body
  if (input instanceof Request) {
    try {
      return await input.clone().text()
    } catch {
      return ""
    }
  }
  return ""
}

export function installShowcaseMockFetch(): void {
  if (typeof window === "undefined" || window.__showcaseApiInstalled) return
  window.__showcaseApiInstalled = true

  const nativeFetch = window.fetch.bind(window)

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase()
    const rawUrl = typeof input === "string" || input instanceof URL ? String(input) : input.url
    const url = new URL(rawUrl, window.location.origin)
    const path = normalizePath(url.pathname)

    if (!path.startsWith("/api/")) {
      return nativeFetch(input, init)
    }

    const state = readState()
    const rawBody = await readRawBody(input, init)
    const body = parseBody(rawBody)

    if (path === "/api/auth/verificar" && method === "GET") {
      return jsonResponse({ autenticado: state.autenticado })
    }

    if (path === "/api/auth/login" && method === "POST") {
      if (!String(body.login || "").trim() || !String(body.senha || "").trim()) {
        return jsonResponse({ erro: "Informe login e senha." }, 400)
      }
      const next = { ...state, autenticado: true }
      writeState(next)
      return jsonResponse({ sucesso: true, autenticado: true })
    }

    if (path === "/api/auth/logout" && method === "POST") {
      const next = { ...state, autenticado: false }
      writeState(next)
      return jsonResponse({ sucesso: true })
    }

    if (path === "/api/dashboard/estatisticas" && method === "GET") {
      return jsonResponse(dashboardResponse(state))
    }

    if (path === "/api/solicitacoes" && method === "GET") {
      return jsonResponse(listResponse(state, url))
    }

    if (path === "/api/solicitacoes" && method === "POST") {
      const nextNumber = Math.min(state.solicitacaoSequence, SHOWCASE_STATIC_SOLICITACAO_IDS.length)
      const id = SHOWCASE_STATIC_SOLICITACAO_IDS[Math.max(0, nextNumber - 1)]
      const criada = createSolicitacaoFromForm(body, id)
      const next: ShowcaseState = {
        ...state,
        solicitacaoSequence: Math.min(state.solicitacaoSequence + 1, SHOWCASE_STATIC_SOLICITACAO_IDS.length),
        solicitacoes: [criada, ...state.solicitacoes.filter((item) => item.id !== id)],
      }
      writeState(next)
      return jsonResponse(criada, 201)
    }

    const matchDetalhe = path.match(/^\/api\/solicitacoes\/([^/]+)$/)
    if (matchDetalhe && method === "GET") {
      const id = decodeURIComponent(matchDetalhe[1])
      const solicitacao = state.solicitacoes.find((item) => item.id === id)
      if (!solicitacao) return jsonResponse({ erro: "Solicitação não encontrada." }, 404)
      return jsonResponse(solicitacao)
    }

    if (path.match(/^\/api\/solicitacoes\/[^/]+\/pdf$/) && method === "GET") {
      return new Response(new Blob([PDF_FALLBACK], { type: "text/plain;charset=utf-8" }), {
        status: 200,
        headers: { "Content-Type": "application/pdf" },
      })
    }

    const matchWebhook = path.match(/^\/api\/solicitacoes\/([^/]+)\/webhook$/)
    if (matchWebhook && method === "POST") {
      const id = decodeURIComponent(matchWebhook[1])
      const solicitacao = state.solicitacoes.find((item) => item.id === id)
      if (!solicitacao) return jsonResponse({ sucesso: false, erro: "Solicitação não encontrada." }, 404)
      const next: ShowcaseState = {
        ...state,
        solicitacoes: state.solicitacoes.map((item) =>
          item.id === id
            ? {
                ...item,
                statusWebhook: "sucesso",
                responseWebhook: "Webhook simulado enviado com sucesso.",
                webhookEnviadoEm: new Date().toISOString(),
              }
            : item
        ),
      }
      writeState(next)
      return jsonResponse({ sucesso: true })
    }

    if (path === "/api/engenharia/formulario/etapas" && method === "GET") {
      return jsonResponse(
        state.etapas.map((etapa) => ({
          ...etapa,
          perguntas: etapa.perguntas.map((pergunta) => ({
            ...pergunta,
            formularioEtapaId: etapa.id,
            formularioEtapa: { id: etapa.id, nome: etapa.nome },
          })),
        }))
      )
    }

    if (path === "/api/engenharia/formulario/perguntas" && method === "POST") {
      const etapaId = String(body.formularioEtapaId || "")
      const etapaIndex = state.etapas.findIndex((item) => item.id === etapaId)
      if (etapaIndex < 0) return jsonResponse({ erro: "Etapa inválida." }, 400)
      const id = `perg-${String(state.perguntaSequence).padStart(3, "0")}`
      const novaPergunta = {
        id,
        formularioEtapaId: etapaId,
        titulo: String(body.titulo || "Nova pergunta"),
        ajuda: body.ajuda ? String(body.ajuda) : "",
        tipo: String(body.tipo || "texto_curto"),
        obrigatorio: Boolean(body.obrigatorio),
        ativo: body.ativo !== false,
        ordem: Number(body.ordem) || state.etapas[etapaIndex].perguntas.length + 1,
        opcoes: Array.isArray(body.opcoes) ? body.opcoes.map((item: unknown) => String(item)) : [],
        campoMapeado: body.campoMapeado ? String(body.campoMapeado) : "",
        systemKey: body.systemKey ? String(body.systemKey) : undefined,
        isSystem: false,
        configuracao: body.configuracao && typeof body.configuracao === "object" ? body.configuracao : {},
      }
      const next = clone(state)
      next.perguntaSequence += 1
      next.etapas[etapaIndex].perguntas.push(novaPergunta)
      writeState(next)
      return jsonResponse(
        {
          ...novaPergunta,
          formularioEtapa: { id: next.etapas[etapaIndex].id, nome: next.etapas[etapaIndex].nome },
        },
        201
      )
    }

    const matchPergunta = path.match(/^\/api\/engenharia\/formulario\/perguntas\/([^/]+)$/)
    if (matchPergunta) {
      const perguntaId = decodeURIComponent(matchPergunta[1])
      const next = clone(state)
      const etapa = next.etapas.find((item) => item.perguntas.some((pergunta) => pergunta.id === perguntaId))
      if (!etapa) return jsonResponse({ erro: "Pergunta não encontrada." }, 404)
      const perguntaIndex = etapa.perguntas.findIndex((pergunta) => pergunta.id === perguntaId)
      const pergunta = etapa.perguntas[perguntaIndex]

      if (method === "GET") {
        return jsonResponse({
          ...pergunta,
          formularioEtapa: { id: etapa.id, nome: etapa.nome },
        })
      }

      if (method === "PUT") {
        etapa.perguntas[perguntaIndex] = {
          ...pergunta,
          titulo: body.titulo !== undefined ? String(body.titulo) : pergunta.titulo,
          ajuda: body.ajuda !== undefined ? String(body.ajuda) : pergunta.ajuda,
          tipo: body.tipo !== undefined ? String(body.tipo) : pergunta.tipo,
          obrigatorio: body.obrigatorio !== undefined ? Boolean(body.obrigatorio) : pergunta.obrigatorio,
          ativo: body.ativo !== undefined ? Boolean(body.ativo) : pergunta.ativo,
          ordem: body.ordem !== undefined ? Number(body.ordem) : pergunta.ordem,
          opcoes: Array.isArray(body.opcoes) ? body.opcoes.map((item: unknown) => String(item)) : pergunta.opcoes,
          campoMapeado: body.campoMapeado !== undefined ? String(body.campoMapeado) : pergunta.campoMapeado,
          configuracao: body.configuracao && typeof body.configuracao === "object" ? body.configuracao : pergunta.configuracao,
        }
        writeState(next)
        return jsonResponse({
          ...etapa.perguntas[perguntaIndex],
          formularioEtapa: { id: etapa.id, nome: etapa.nome },
        })
      }

      if (method === "DELETE") {
        if (pergunta.isSystem) return jsonResponse({ erro: "Pergunta base não pode ser removida na vitrine." }, 400)
        etapa.perguntas = etapa.perguntas.filter((item) => item.id !== perguntaId)
        writeState(next)
        return jsonResponse({ sucesso: true })
      }
    }

    return jsonResponse({ erro: `Endpoint mock não implementado: ${path}` }, 404)
  }) as typeof fetch
}
