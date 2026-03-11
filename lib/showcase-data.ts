export interface ShowcaseSolicitacaoItem {
  produtoTipo: { id: string; nome: string; codigo: string } | null
  produtoModelo: { id: string; nome: string; codigo: string } | null
  variacaoEnvelope?: string | null
  formatoPadrao?: {
    id: string
    nome: string
    largura?: number | null
    altura?: number | null
    lateral?: number | null
  } | null
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
  substrato: { id: string; nome: string } | null
  substratoGramagem?: string | null
  alcaTipo?: { id: string; nome: string } | null
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
  impressaoModo?: { id: string; nome: string } | null
  impressaoCombinacao?: { id: string; nome: string } | null
  impressaoCamadas?: Record<string, unknown> | null
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
  acondicionamento?: { id: string; nome: string } | null
  modulo?: { id: string; nome: string } | null
  quantidade?: number | null
  desenvolvimentoObservacoes?: string | null
  enobrecimentos: Array<{
    enobrecimentoTipo: { id: string; nome: string } | null
    dados?: Record<string, unknown> | null
    observacoes?: string | null
  }>
}

export interface ShowcaseSolicitacao {
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
  statusWebhook: "pendente" | "sucesso" | "erro"
  responseWebhook?: string | null
  webhookEnviadoEm?: string | null
  createdAt: string
  itens: ShowcaseSolicitacaoItem[]
}

export interface ShowcasePergunta {
  id: string
  formularioEtapaId: string
  titulo: string
  ajuda?: string
  tipo: string
  obrigatorio: boolean
  ativo: boolean
  ordem: number
  opcoes: string[]
  campoMapeado?: string
  systemKey?: string
  isSystem: boolean
  configuracao?: {
    modelosPorProduto?: Record<string, string[]>
    tamanhosPorModelo?: Record<string, string[]>
  }
}

export interface ShowcaseEtapa {
  id: string
  codigo: string
  nome: string
  ordem: number
  ativo: boolean
  isSystem: boolean
  perguntas: ShowcasePergunta[]
}

export interface ShowcaseState {
  autenticado: boolean
  solicitacaoSequence: number
  perguntaSequence: number
  solicitacoes: ShowcaseSolicitacao[]
  etapas: ShowcaseEtapa[]
}

const PERGUNTAS_BASE: ShowcasePergunta[] = [
  {
    id: "perg-001",
    formularioEtapaId: "etapa-001",
    titulo: "Vendedor",
    ajuda: "Nome do vendedor responsável",
    tipo: "texto_curto",
    obrigatorio: true,
    ativo: true,
    ordem: 1,
    opcoes: [],
    campoMapeado: "dadosGerais.vendedor",
    systemKey: "vendedor",
    isSystem: true,
  },
  {
    id: "perg-002",
    formularioEtapaId: "etapa-001",
    titulo: "Marca",
    ajuda: "Marca/cliente final",
    tipo: "texto_curto",
    obrigatorio: true,
    ativo: true,
    ordem: 2,
    opcoes: [],
    campoMapeado: "dadosGerais.marca",
    systemKey: "marca",
    isSystem: true,
  },
  {
    id: "perg-003",
    formularioEtapaId: "etapa-001",
    titulo: "Contato",
    ajuda: "Contato principal",
    tipo: "texto_curto",
    obrigatorio: true,
    ativo: true,
    ordem: 3,
    opcoes: [],
    campoMapeado: "dadosGerais.contato",
    systemKey: "contato",
    isSystem: true,
  },
  {
    id: "perg-004",
    formularioEtapaId: "etapa-001",
    titulo: "Código Metrics",
    ajuda: "Somente números",
    tipo: "texto_curto",
    obrigatorio: true,
    ativo: true,
    ordem: 4,
    opcoes: [],
    campoMapeado: "dadosGerais.codigoMetrics",
    systemKey: "codigo_metrics",
    isSystem: true,
  },
  {
    id: "perg-005",
    formularioEtapaId: "etapa-002",
    titulo: "Tipo de Contrato",
    tipo: "lista_opcoes",
    obrigatorio: true,
    ativo: true,
    ordem: 1,
    opcoes: ["JIT", "PRG"],
    campoMapeado: "condicoesVenda.tipoContrato",
    systemKey: "tipo_contrato",
    isSystem: true,
  },
  {
    id: "perg-006",
    formularioEtapaId: "etapa-002",
    titulo: "Imposto",
    tipo: "lista_opcoes",
    obrigatorio: true,
    ativo: true,
    ordem: 2,
    opcoes: ["ICMS - Revenda", "ICMS - Consumo Próprio", "ISS - Consumo Próprio"],
    campoMapeado: "condicoesVenda.imposto",
    systemKey: "imposto",
    isSystem: true,
  },
  {
    id: "perg-007",
    formularioEtapaId: "etapa-002",
    titulo: "Condição de Pagamento",
    tipo: "lista_opcoes",
    obrigatorio: true,
    ativo: true,
    ordem: 3,
    opcoes: [
      "Depósito Antecipado",
      "7 dd",
      "15 dd",
      "28 dd",
      "30 dd",
      "45 dd",
      "60 dd",
      "30/45 dd",
      "30/60 dd",
      "30/45/60 dd",
      "Outra: Informar",
    ],
    campoMapeado: "condicoesVenda.condicaoPagamento",
    systemKey: "condicao_pagamento",
    isSystem: true,
  },
  {
    id: "perg-008",
    formularioEtapaId: "etapa-002",
    titulo: "Condição de Pagamento (Outra)",
    tipo: "texto_curto",
    obrigatorio: false,
    ativo: true,
    ordem: 4,
    opcoes: [],
    campoMapeado: "condicoesVenda.condicaoPagamentoOutra",
    systemKey: "condicao_pagamento_outra",
    isSystem: true,
  },
  {
    id: "perg-009",
    formularioEtapaId: "etapa-003",
    titulo: "Local Único",
    tipo: "sim_nao",
    obrigatorio: true,
    ativo: true,
    ordem: 1,
    opcoes: [],
    campoMapeado: "entregas.localUnico",
    systemKey: "local_unico",
    isSystem: true,
  },
  {
    id: "perg-010",
    formularioEtapaId: "etapa-003",
    titulo: "Cidade/UF",
    tipo: "texto_curto",
    obrigatorio: true,
    ativo: true,
    ordem: 2,
    opcoes: [],
    campoMapeado: "entregas.cidadeUF",
    systemKey: "cidade_uf",
    isSystem: true,
  },
  {
    id: "perg-011",
    formularioEtapaId: "etapa-003",
    titulo: "Nº de Entregas",
    tipo: "numero",
    obrigatorio: true,
    ativo: true,
    ordem: 3,
    opcoes: [],
    campoMapeado: "entregas.numeroEntregas",
    systemKey: "numero_entregas",
    isSystem: true,
  },
  {
    id: "perg-012",
    formularioEtapaId: "etapa-003",
    titulo: "Frequência",
    tipo: "lista_opcoes",
    obrigatorio: false,
    ativo: true,
    ordem: 4,
    opcoes: ["Única", "Semanal", "Quinzenal", "Mensal", "Outra: Informar"],
    campoMapeado: "entregas.frequencia",
    systemKey: "frequencia",
    isSystem: true,
  },
  {
    id: "perg-013",
    formularioEtapaId: "etapa-003",
    titulo: "Frequência (Outra)",
    tipo: "texto_curto",
    obrigatorio: false,
    ativo: true,
    ordem: 5,
    opcoes: [],
    campoMapeado: "entregas.frequenciaOutra",
    systemKey: "frequencia_outra",
    isSystem: true,
  },
  {
    id: "perg-014",
    formularioEtapaId: "etapa-003",
    titulo: "Frete",
    tipo: "lista_opcoes",
    obrigatorio: true,
    ativo: true,
    ordem: 6,
    opcoes: [
      "FOB - Contratação Transporte por CLIENTE",
      "CIF - Entrega por conta da PRINTBAG",
    ],
    campoMapeado: "entregas.frete",
    systemKey: "frete",
    isSystem: true,
  },
  {
    id: "perg-015",
    formularioEtapaId: "etapa-003",
    titulo: "Pedido Mínimo CIF",
    tipo: "texto_curto",
    obrigatorio: false,
    ativo: true,
    ordem: 7,
    opcoes: [],
    campoMapeado: "entregas.pedidoMinimoCIF",
    systemKey: "pedido_minimo_cif",
    isSystem: true,
  },
  {
    id: "perg-016",
    formularioEtapaId: "etapa-004",
    titulo: "Tipo de Produto",
    tipo: "lista_produtos",
    obrigatorio: true,
    ativo: true,
    ordem: 1,
    opcoes: [],
    campoMapeado: "produto.produtoTipoId",
    systemKey: "produto",
    isSystem: true,
  },
  {
    id: "perg-017",
    formularioEtapaId: "etapa-004",
    titulo: "Modelo",
    tipo: "lista_modelos",
    obrigatorio: true,
    ativo: true,
    ordem: 2,
    opcoes: [],
    campoMapeado: "produto.produtoModeloId",
    systemKey: "modelo",
    isSystem: true,
  },
  {
    id: "perg-018",
    formularioEtapaId: "etapa-004",
    titulo: "Quantidade para Orçamento",
    tipo: "texto_curto",
    obrigatorio: true,
    ativo: true,
    ordem: 3,
    opcoes: [],
    campoMapeado: "produto.quantidade",
    systemKey: "quantidade_orcamento",
    isSystem: true,
  },
  {
    id: "perg-019",
    formularioEtapaId: "etapa-005",
    titulo: "Formato",
    tipo: "lista_opcoes",
    obrigatorio: true,
    ativo: true,
    ordem: 1,
    opcoes: [],
    campoMapeado: "formato.formatoPadraoId",
    systemKey: "formato_padrao",
    isSystem: true,
  },
  {
    id: "perg-020",
    formularioEtapaId: "etapa-006",
    titulo: "Substrato",
    tipo: "lista_opcoes",
    obrigatorio: true,
    ativo: true,
    ordem: 1,
    opcoes: [],
    campoMapeado: "substrato.substratoId",
    systemKey: "substrato",
    isSystem: true,
  },
  {
    id: "perg-021",
    formularioEtapaId: "etapa-006",
    titulo: "Gramagem",
    tipo: "lista_opcoes",
    obrigatorio: false,
    ativo: true,
    ordem: 2,
    opcoes: [],
    campoMapeado: "substrato.substratoGramagem",
    systemKey: "gramagem",
    isSystem: true,
  },
  {
    id: "perg-022",
    formularioEtapaId: "etapa-007",
    titulo: "Tipo de Alça",
    tipo: "lista_opcoes",
    obrigatorio: false,
    ativo: true,
    ordem: 1,
    opcoes: [],
    campoMapeado: "alca.tipoId",
    systemKey: "tipo_alca",
    isSystem: true,
  },
  {
    id: "perg-023",
    formularioEtapaId: "etapa-008",
    titulo: "Modo de Impressão",
    tipo: "lista_opcoes",
    obrigatorio: false,
    ativo: true,
    ordem: 1,
    opcoes: [],
    campoMapeado: "impressao.modoId",
    systemKey: "tipo_impressao",
    isSystem: true,
  },
  {
    id: "perg-024",
    formularioEtapaId: "etapa-008",
    titulo: "Combinação de Cores",
    tipo: "lista_opcoes",
    obrigatorio: false,
    ativo: true,
    ordem: 2,
    opcoes: [],
    campoMapeado: "impressao.combinacaoId",
    systemKey: "combinacao_cores",
    isSystem: true,
  },
  {
    id: "perg-025",
    formularioEtapaId: "etapa-009",
    titulo: "Reforço de Fundo",
    tipo: "booleano",
    obrigatorio: false,
    ativo: true,
    ordem: 1,
    opcoes: [],
    campoMapeado: "acabamentos.reforcoFundo",
    systemKey: "reforco_fundo",
    isSystem: true,
  },
  {
    id: "perg-026",
    formularioEtapaId: "etapa-011",
    titulo: "Acondicionamento",
    tipo: "lista_opcoes",
    obrigatorio: true,
    ativo: true,
    ordem: 1,
    opcoes: [],
    campoMapeado: "acondicionamento.tipoId",
    systemKey: "acondicionamento",
    isSystem: true,
  },
  {
    id: "perg-027",
    formularioEtapaId: "etapa-011",
    titulo: "Módulo",
    tipo: "lista_opcoes",
    obrigatorio: false,
    ativo: true,
    ordem: 2,
    opcoes: [],
    campoMapeado: "acondicionamento.moduloId",
    systemKey: "modulo",
    isSystem: true,
  },
  {
    id: "perg-028",
    formularioEtapaId: "etapa-011",
    titulo: "Quantidade",
    tipo: "numero",
    obrigatorio: true,
    ativo: true,
    ordem: 3,
    opcoes: [],
    campoMapeado: "acondicionamento.quantidade",
    systemKey: "quantidade",
    isSystem: true,
  },
]

const ETAPAS_BASE: ShowcaseEtapa[] = [
  { id: "etapa-001", codigo: "dados_pedido", nome: "Dados do Pedido", ordem: 1, ativo: true, isSystem: true, perguntas: [] },
  { id: "etapa-002", codigo: "condicoes_venda", nome: "Condições de Venda", ordem: 2, ativo: true, isSystem: true, perguntas: [] },
  { id: "etapa-003", codigo: "entregas", nome: "Entregas", ordem: 3, ativo: true, isSystem: true, perguntas: [] },
  { id: "etapa-004", codigo: "produto", nome: "Produto", ordem: 4, ativo: true, isSystem: true, perguntas: [] },
  { id: "etapa-005", codigo: "tamanho", nome: "Tamanho", ordem: 5, ativo: true, isSystem: true, perguntas: [] },
  { id: "etapa-006", codigo: "material", nome: "Material", ordem: 6, ativo: true, isSystem: true, perguntas: [] },
  { id: "etapa-007", codigo: "alca_detalhes", nome: "Alça e Detalhes", ordem: 7, ativo: true, isSystem: true, perguntas: [] },
  { id: "etapa-008", codigo: "impressao", nome: "Impressão", ordem: 8, ativo: true, isSystem: true, perguntas: [] },
  { id: "etapa-009", codigo: "acabamentos", nome: "Acabamentos", ordem: 9, ativo: true, isSystem: true, perguntas: [] },
  { id: "etapa-010", codigo: "enobrecimentos", nome: "Enobrecimentos", ordem: 10, ativo: true, isSystem: true, perguntas: [] },
  { id: "etapa-011", codigo: "entrega_quantidade", nome: "Entrega e Quantidade", ordem: 11, ativo: true, isSystem: true, perguntas: [] },
]

function withPerguntas(etapas: ShowcaseEtapa[], perguntas: ShowcasePergunta[]): ShowcaseEtapa[] {
  return etapas.map((etapa) => ({
    ...etapa,
    perguntas: perguntas
      .filter((pergunta) => pergunta.formularioEtapaId === etapa.id)
      .sort((a, b) => a.ordem - b.ordem),
  }))
}

export function getSeedEtapas(): ShowcaseEtapa[] {
  return withPerguntas(
    ETAPAS_BASE.map((etapa) => ({ ...etapa })),
    PERGUNTAS_BASE.map((pergunta) => ({ ...pergunta }))
  )
}

export const SHOWCASE_STATIC_SOLICITACAO_IDS = Array.from({ length: 25 }, (_, index) => {
  const n = String(index + 1).padStart(3, "0")
  return `demo-${n}`
})

export const SHOWCASE_STATIC_PERGUNTA_IDS = Array.from({ length: 300 }, (_, index) => {
  const n = String(index + 1).padStart(3, "0")
  return `perg-${n}`
})

export function getSeedSolicitacoes(): ShowcaseSolicitacao[] {
  return [
    {
      id: "demo-001",
      vendedor: "Pedro Levorato",
      marca: "Action Schutz",
      contato: "Sabrina Costa",
      codigoMetrics: "102938",
      empresa: "Printbag",
      unidade: "São Paulo",
      nomeSolicitante: "Sabrina Costa",
      emailSolicitante: "sabrina@printbag.com.br",
      telefoneSolicitante: "(11) 99999-1111",
      observacoesGerais: "Projeto vitrine para recrutadores.",
      tipoContrato: "PRG",
      imposto: "ICMS - Revenda",
      condicaoPagamento: "30 dd",
      royalties: "2.5",
      bvAgencia: "1.0",
      localUnico: false,
      cidadeUF: "São Paulo/SP",
      pedidoMinimoCIF: "3000",
      quantidadeMultiplos: "3000, 5000, 8000",
      numeroEntregas: "3",
      frequencia: "Mensal",
      frete: "CIF - Entrega por conta da PRINTBAG",
      freteQuantidades: [3000, 5000, 8000],
      statusWebhook: "sucesso",
      responseWebhook: "Payload recebido com sucesso",
      webhookEnviadoEm: "2026-03-01T12:45:00.000Z",
      createdAt: "2026-02-27T14:30:00.000Z",
      itens: [
        {
          produtoTipo: { id: "sacola", nome: "Sacola", codigo: "SAC" },
          produtoModelo: { id: "sacola_fita", nome: "Sacola Alça Fita", codigo: "SAC-FITA" },
          formatoPadrao: { id: "formato-001", nome: "35x45x12", largura: 35, altura: 45, lateral: 12 },
          substrato: { id: "kraft", nome: "Papel Kraft" },
          substratoGramagem: "180",
          alcaTipo: { id: "fita", nome: "Fita de Gorgurão" },
          alcaLargura: "20",
          alcaCor: "Preta",
          alcaAplicacao: "Embutida",
          reforcoFundo: true,
          reforcoFundoModelo: "colado_fundo",
          bocaPalhaco: false,
          furoFita: false,
          impressaoModo: { id: "offset", nome: "Offset" },
          impressaoCombinacao: { id: "4x0", nome: "4x0" },
          percentualImpressaoExterna: 100,
          acondicionamento: { id: "fardo", nome: "Fardo" },
          modulo: { id: "modulo-1", nome: "Módulo Padrão" },
          quantidade: 5000,
          enobrecimentos: [
            {
              enobrecimentoTipo: { id: "hot", nome: "Hot Stamping" },
              observacoes: "Aplicar dourado somente na frente.",
            },
          ],
        },
      ],
    },
    {
      id: "demo-002",
      vendedor: "Equipe Comercial",
      marca: "Cliente Demo",
      contato: "Camila Rocha",
      codigoMetrics: "778899",
      empresa: "Cliente Demo LTDA",
      unidade: "Rio de Janeiro",
      nomeSolicitante: "Camila Rocha",
      emailSolicitante: "camila@clientedemo.com.br",
      telefoneSolicitante: "(21) 98888-2222",
      observacoesGerais: "Aguardando aprovação de arte final.",
      tipoContrato: "JIT",
      imposto: "ISS - Consumo Próprio",
      condicaoPagamento: "15 dd",
      localUnico: true,
      cidadeUF: "Rio de Janeiro/RJ",
      quantidadeMultiplos: "1200",
      frete: "FOB - Contratação Transporte por CLIENTE",
      statusWebhook: "pendente",
      createdAt: "2026-03-03T09:10:00.000Z",
      itens: [
        {
          produtoTipo: { id: "envelope", nome: "Envelope", codigo: "ENV" },
          produtoModelo: { id: "envelope_comercial", nome: "Envelope Comercial", codigo: "ENV-COM" },
          formatoPadrao: { id: "formato-010", nome: "23x11", largura: 23, altura: 11, lateral: 0 },
          substrato: { id: "couche", nome: "Papel Couché" },
          substratoGramagem: "150",
          reforcoFundo: false,
          bocaPalhaco: false,
          furoFita: false,
          impressaoModo: { id: "digital", nome: "Digital" },
          impressaoCombinacao: { id: "4x4", nome: "4x4" },
          percentualImpressaoExterna: 100,
          acondicionamento: { id: "caixa", nome: "Caixa" },
          modulo: { id: "modulo-1", nome: "Módulo Padrão" },
          quantidade: 1200,
          enobrecimentos: [],
        },
      ],
    },
    {
      id: "demo-003",
      vendedor: "Lucas Santos",
      marca: "Projeto Fashion",
      contato: "Mariana Alves",
      codigoMetrics: "445566",
      empresa: "Fashion Group",
      unidade: "Minas Gerais",
      nomeSolicitante: "Mariana Alves",
      emailSolicitante: "mariana@fashiongroup.com",
      telefoneSolicitante: "(31) 97777-3333",
      observacoesGerais: "Ajustar tonalidade da alça para pantone institucional.",
      tipoContrato: "PRG",
      imposto: "ICMS - Consumo Próprio",
      condicaoPagamento: "45 dd",
      localUnico: false,
      cidadeUF: "Belo Horizonte/MG",
      pedidoMinimoCIF: "2000",
      quantidadeMultiplos: "2000, 4000",
      numeroEntregas: "2",
      frequencia: "Quinzenal",
      frete: "CIF - Entrega por conta da PRINTBAG",
      statusWebhook: "erro",
      responseWebhook: "Timeout no endpoint remoto",
      webhookEnviadoEm: "2026-03-05T16:20:00.000Z",
      createdAt: "2026-03-05T15:40:00.000Z",
      itens: [
        {
          produtoTipo: { id: "sacola", nome: "Sacola", codigo: "SAC" },
          produtoModelo: { id: "sacola_vertical", nome: "Sacola Vertical", codigo: "SAC-V" },
          formatoPadrao: { id: "formato-030", nome: "28x35x10", largura: 28, altura: 35, lateral: 10 },
          substrato: { id: "triplex", nome: "Cartão Triplex" },
          substratoGramagem: "250",
          alcaTipo: { id: "algodao", nome: "Cordão de Algodão" },
          alcaCor: "Cru",
          alcaAplicacao: "Ilhós",
          reforcoFundo: true,
          reforcoFundoModelo: "encaixado_fundo",
          bocaPalhaco: true,
          furoFita: true,
          furoFitaModelo: "opcao_02",
          impressaoModo: { id: "offset", nome: "Offset" },
          impressaoCombinacao: { id: "4x1", nome: "4x1" },
          percentualImpressaoExterna: 100,
          acondicionamento: { id: "fardo", nome: "Fardo" },
          modulo: { id: "modulo-2", nome: "Módulo Reforçado" },
          quantidade: 4000,
          enobrecimentos: [
            {
              enobrecimentoTipo: { id: "laminacao", nome: "Laminação Fosca" },
              observacoes: "Somente face externa.",
            },
          ],
        },
      ],
    },
  ]
}

export function getInitialShowcaseState(): ShowcaseState {
  return {
    autenticado: true,
    solicitacaoSequence: 4,
    perguntaSequence: 29,
    solicitacoes: getSeedSolicitacoes(),
    etapas: getSeedEtapas(),
  }
}
