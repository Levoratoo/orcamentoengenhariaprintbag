"use client"

import {
  SHOWCASE_STATE_VERSION,
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
    if (parsed.version !== SHOWCASE_STATE_VERSION) {
      const seed = getInitialShowcaseState()
      const migrated: ShowcaseState = {
        ...seed,
        autenticado: typeof parsed.autenticado === "boolean" ? parsed.autenticado : seed.autenticado,
      }
      writeState(migrated)
      return migrated
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

function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function getDayKey(date: Date): string {
  const dia = String(date.getDate()).padStart(2, "0")
  const mes = String(date.getMonth() + 1).padStart(2, "0")
  return `${dia}/${mes}`
}

function parseIsoDate(value?: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function topCountEntries(map: Map<string, number>, limit: number): Array<[string, number]> {
  return Array.from(map.entries())
    .filter(([nome]) => nome.trim().length > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

function dashboardResponse(state: ShowcaseState) {
  const hoje = startOfDay(new Date())
  const inicioAtual = addDays(hoje, -29)
  const inicioUltimos7 = addDays(hoje, -6)
  const fimAtual = addDays(hoje, 1)
  const inicioAnterior = addDays(inicioAtual, -30)
  const fimAnterior = inicioAtual

  const diasAtuais = Array.from({ length: 30 }, (_, index) => addDays(inicioAtual, index))
  const diasAnteriores = Array.from({ length: 30 }, (_, index) => addDays(inicioAnterior, index))

  const porDiaAtual = new Map<string, number>(diasAtuais.map((dia) => [getDayKey(dia), 0]))
  const porDiaAnterior = new Map<string, number>(diasAnteriores.map((dia) => [getDayKey(dia), 0]))
  const taxaSucessoPorDia = new Map<string, { total: number; sucesso: number; erro: number }>(
    diasAtuais.map((dia) => [getDayKey(dia), { total: 0, sucesso: 0, erro: 0 }])
  )

  const porHora = Array.from({ length: 24 }, () => 0)

  const status = { sucesso: 0, erro: 0, pendente: 0 }
  const produtosMap = new Map<string, number>()
  const substratosMap = new Map<string, number>()
  const empresasMap = new Map<string, number>()
  const tiposMap = new Map<string, number>()
  const modosMap = new Map<string, number>()
  const enobrecimentosMap = new Map<string, number>()
  const acondicionamentosMap = new Map<string, number>()
  const faixasQuantidade = {
    "0-100": 0,
    "101-500": 0,
    "501-1000": 0,
    "1001-5000": 0,
    "5000+": 0,
  }

  let ultimos30Dias = 0
  let ultimos7Dias = 0
  let periodoAnterior = 0
  let somaTempoRespostaMs = 0
  let totalTempoResposta = 0

  for (const solicitacao of state.solicitacoes) {
    status[solicitacao.statusWebhook]++

    const criadoEm = parseIsoDate(solicitacao.createdAt)
    if (!criadoEm) continue

    const nomeEmpresa =
      solicitacao.marca?.trim() ||
      solicitacao.empresa?.trim() ||
      solicitacao.vendedor?.trim() ||
      "Nao informado"
    empresasMap.set(nomeEmpresa, (empresasMap.get(nomeEmpresa) || 0) + 1)

    if (criadoEm >= inicioAtual && criadoEm < fimAtual) {
      ultimos30Dias++
      const dia = getDayKey(criadoEm)
      porDiaAtual.set(dia, (porDiaAtual.get(dia) || 0) + 1)
      porHora[criadoEm.getHours()]++

      const taxaDia = taxaSucessoPorDia.get(dia)
      if (taxaDia) {
        taxaDia.total += 1
        if (solicitacao.statusWebhook === "sucesso") taxaDia.sucesso += 1
        if (solicitacao.statusWebhook === "erro") taxaDia.erro += 1
      }
    }

    if (criadoEm >= inicioUltimos7 && criadoEm < fimAtual) {
      ultimos7Dias++
    }

    if (criadoEm >= inicioAnterior && criadoEm < fimAnterior) {
      periodoAnterior++
      const diaAnterior = getDayKey(criadoEm)
      porDiaAnterior.set(diaAnterior, (porDiaAnterior.get(diaAnterior) || 0) + 1)
    }

    if (solicitacao.statusWebhook === "sucesso") {
      const webhookEnviadoEm = parseIsoDate(solicitacao.webhookEnviadoEm)
      if (webhookEnviadoEm && webhookEnviadoEm >= criadoEm) {
        somaTempoRespostaMs += webhookEnviadoEm.getTime() - criadoEm.getTime()
        totalTempoResposta++
      }
    }

    for (const item of solicitacao.itens) {
      const tipoNome = item.produtoTipo?.nome || "?"
      const modeloNome = item.produtoModelo?.nome || "?"
      const produtoChave = `${tipoNome} - ${modeloNome}`
      produtosMap.set(produtoChave, (produtosMap.get(produtoChave) || 0) + 1)

      if (item.substrato?.nome) {
        const nomeSubstrato = item.substrato.nome
        substratosMap.set(nomeSubstrato, (substratosMap.get(nomeSubstrato) || 0) + 1)
      }

      if (item.produtoTipo?.nome) {
        const nomeTipo = item.produtoTipo.nome
        tiposMap.set(nomeTipo, (tiposMap.get(nomeTipo) || 0) + 1)
      }

      if (item.impressaoModo?.nome) {
        const nomeModo = item.impressaoModo.nome
        modosMap.set(nomeModo, (modosMap.get(nomeModo) || 0) + 1)
      }

      if (item.acondicionamento?.nome) {
        const nomeAcondicionamento = item.acondicionamento.nome
        acondicionamentosMap.set(nomeAcondicionamento, (acondicionamentosMap.get(nomeAcondicionamento) || 0) + 1)
      }

      for (const enob of item.enobrecimentos || []) {
        const nomeEnobrecimento = enob.enobrecimentoTipo?.nome
        if (!nomeEnobrecimento) continue
        enobrecimentosMap.set(nomeEnobrecimento, (enobrecimentosMap.get(nomeEnobrecimento) || 0) + 1)
      }

      const quantidade = typeof item.quantidade === "number" ? item.quantidade : null
      if (quantidade !== null) {
        if (quantidade <= 100) faixasQuantidade["0-100"]++
        else if (quantidade <= 500) faixasQuantidade["101-500"]++
        else if (quantidade <= 1000) faixasQuantidade["501-1000"]++
        else if (quantidade <= 5000) faixasQuantidade["1001-5000"]++
        else faixasQuantidade["5000+"]++
      }
    }
  }

  const solicitacoesPorDia = diasAtuais.map((dia) => {
    const chave = getDayKey(dia)
    return { dia: chave, quantidade: porDiaAtual.get(chave) || 0 }
  })

  const comparacaoPeriodos = diasAtuais.map((diaAtual, index) => {
    const chaveAtual = getDayKey(diaAtual)
    const chaveAnterior = getDayKey(diasAnteriores[index])
    return {
      dia: chaveAtual,
      atual: porDiaAtual.get(chaveAtual) || 0,
      anterior: porDiaAnterior.get(chaveAnterior) || 0,
    }
  })

  const taxaSucessoArray = diasAtuais.map((dia) => {
    const chave = getDayKey(dia)
    const dados = taxaSucessoPorDia.get(chave) || { total: 0, sucesso: 0, erro: 0 }
    return {
      dia: chave,
      taxa: dados.total > 0 ? Math.round((dados.sucesso / dados.total) * 100) : 0,
      total: dados.total,
      sucesso: dados.sucesso,
    }
  })

  const metricasCombinadas = diasAtuais.map((dia) => {
    const chave = getDayKey(dia)
    const dados = taxaSucessoPorDia.get(chave) || { total: 0, sucesso: 0, erro: 0 }
    return {
      dia: chave,
      solicitacoes: dados.total,
      sucesso: dados.sucesso,
      erro: dados.erro,
    }
  })

  const tempoMedioResposta =
    totalTempoResposta > 0 ? Math.round((somaTempoRespostaMs / totalTempoResposta) / 1000) : 0

  return {
    resumo: {
      total: state.solicitacoes.length,
      ultimos30Dias,
      ultimos7Dias,
      tempoMedioResposta,
      periodoAnterior,
    },
    status,
    solicitacoesPorDia,
    produtosMaisSolicitados: topCountEntries(produtosMap, 10).map(([produto, quantidade]) => ({
      produto,
      quantidade,
    })),
    substratosMaisUsados: topCountEntries(substratosMap, 5).map(([substrato, quantidade]) => ({
      substrato,
      quantidade,
    })),
    empresasMaisSolicitam: topCountEntries(empresasMap, 5).map(([empresa, quantidade]) => ({
      empresa,
      quantidade,
    })),
    tiposProduto: topCountEntries(tiposMap, 6).map(([tipo, quantidade]) => ({
      tipo,
      quantidade,
    })),
    modosImpressao: topCountEntries(modosMap, 8).map(([modo, quantidade]) => ({
      modo,
      quantidade,
    })),
    enobrecimentos: topCountEntries(enobrecimentosMap, 8).map(([enobrecimento, quantidade]) => ({
      enobrecimento,
      quantidade,
    })),
    acondicionamentos: topCountEntries(acondicionamentosMap, 6).map(([acondicionamento, quantidade]) => ({
      acondicionamento,
      quantidade,
    })),
    solicitacoesPorHora: porHora.map((quantidade, hora) => ({
      hora: `${String(hora).padStart(2, "0")}h`,
      quantidade,
    })),
    distribuicaoQuantidades: Object.entries(faixasQuantidade).map(([faixa, quantidade]) => ({
      faixa,
      quantidade,
    })),
    comparacaoPeriodos,
    taxaSucessoPorDia: taxaSucessoArray,
    metricasCombinadas,
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
