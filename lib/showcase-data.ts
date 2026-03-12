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
  version: number
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

export const SHOWCASE_STATE_VERSION = 2

const SHOWCASE_TOTAL_SOLICITACOES = 18

const SHOWCASE_CLIENTES = [
  {
    vendedor: "Pedro Levorato",
    marca: "Action Schutz",
    contato: "Sabrina Costa",
    empresa: "Printbag",
    unidade: "Sao Paulo",
    emailSolicitante: "sabrina@printbag.com.br",
    telefoneSolicitante: "(11) 99999-1111",
  },
  {
    vendedor: "Lucas Santos",
    marca: "Projeto Fashion",
    contato: "Mariana Alves",
    empresa: "Fashion Group",
    unidade: "Minas Gerais",
    emailSolicitante: "mariana@fashiongroup.com",
    telefoneSolicitante: "(31) 97777-3333",
  },
  {
    vendedor: "Camila Rocha",
    marca: "Cliente Demo",
    contato: "Camila Rocha",
    empresa: "Cliente Demo LTDA",
    unidade: "Rio de Janeiro",
    emailSolicitante: "camila@clientedemo.com.br",
    telefoneSolicitante: "(21) 98888-2222",
  },
  {
    vendedor: "Rafaela Mendes",
    marca: "Urban Move",
    contato: "Bruno Matos",
    empresa: "Urban Move SA",
    unidade: "Parana",
    emailSolicitante: "bruno@urbanmove.com.br",
    telefoneSolicitante: "(41) 97777-4545",
  },
  {
    vendedor: "Thiago Cunha",
    marca: "Studio Casa",
    contato: "Helena Prado",
    empresa: "Studio Casa Decor",
    unidade: "Santa Catarina",
    emailSolicitante: "helena@studiocasa.com.br",
    telefoneSolicitante: "(48) 96666-8787",
  },
  {
    vendedor: "Juliana Torres",
    marca: "Bianca Shoes",
    contato: "Rita Campos",
    empresa: "Bianca Shoes",
    unidade: "Bahia",
    emailSolicitante: "rita@biancashoes.com",
    telefoneSolicitante: "(71) 98888-9090",
  },
]

const SHOWCASE_CIDADES = [
  "Sao Paulo/SP",
  "Rio de Janeiro/RJ",
  "Belo Horizonte/MG",
  "Curitiba/PR",
  "Florianopolis/SC",
  "Salvador/BA",
  "Porto Alegre/RS",
  "Campinas/SP",
  "Goiania/GO",
]

const SHOWCASE_ITENS_BASE: ShowcaseSolicitacaoItem[] = [
  {
    produtoTipo: { id: "sacola", nome: "Sacola", codigo: "SAC" },
    produtoModelo: { id: "sacola_fita", nome: "Sacola Alca Fita", codigo: "SAC-FITA" },
    formatoPadrao: { id: "formato-001", nome: "35x45x12", largura: 35, altura: 45, lateral: 12 },
    substrato: { id: "kraft", nome: "Papel Kraft" },
    substratoGramagem: "180",
    alcaTipo: { id: "fita", nome: "Fita de Gorgurao" },
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
    modulo: { id: "modulo-1", nome: "Modulo Padrao" },
    quantidade: 5000,
    enobrecimentos: [
      {
        enobrecimentoTipo: { id: "hot", nome: "Hot Stamping" },
        observacoes: "Aplicar dourado na frente.",
      },
    ],
  },
  {
    produtoTipo: { id: "envelope", nome: "Envelope", codigo: "ENV" },
    produtoModelo: { id: "envelope_comercial", nome: "Envelope Comercial", codigo: "ENV-COM" },
    formatoPadrao: { id: "formato-010", nome: "23x11", largura: 23, altura: 11, lateral: 0 },
    substrato: { id: "couche", nome: "Papel Couche" },
    substratoGramagem: "150",
    reforcoFundo: false,
    bocaPalhaco: false,
    furoFita: false,
    impressaoModo: { id: "digital", nome: "Digital" },
    impressaoCombinacao: { id: "4x4", nome: "4x4" },
    percentualImpressaoExterna: 100,
    acondicionamento: { id: "caixa", nome: "Caixa" },
    modulo: { id: "modulo-1", nome: "Modulo Padrao" },
    quantidade: 1400,
    enobrecimentos: [],
  },
  {
    produtoTipo: { id: "sacola", nome: "Sacola", codigo: "SAC" },
    produtoModelo: { id: "sacola_vertical", nome: "Sacola Vertical", codigo: "SAC-V" },
    formatoPadrao: { id: "formato-030", nome: "28x35x10", largura: 28, altura: 35, lateral: 10 },
    substrato: { id: "triplex", nome: "Cartao Triplex" },
    substratoGramagem: "250",
    alcaTipo: { id: "algodao", nome: "Cordao de Algodao" },
    alcaCor: "Cru",
    alcaAplicacao: "Ilhos",
    reforcoFundo: true,
    reforcoFundoModelo: "encaixado_fundo",
    bocaPalhaco: true,
    furoFita: true,
    furoFitaModelo: "opcao_02",
    impressaoModo: { id: "offset", nome: "Offset" },
    impressaoCombinacao: { id: "4x1", nome: "4x1" },
    percentualImpressaoExterna: 100,
    acondicionamento: { id: "fardo", nome: "Fardo" },
    modulo: { id: "modulo-2", nome: "Modulo Reforcado" },
    quantidade: 3800,
    enobrecimentos: [
      {
        enobrecimentoTipo: { id: "laminacao", nome: "Laminacao Fosca" },
        observacoes: "Somente face externa.",
      },
    ],
  },
  {
    produtoTipo: { id: "caixa", nome: "Caixa", codigo: "CX" },
    produtoModelo: { id: "caixa_luxo", nome: "Caixa Luxo", codigo: "CX-LUXO" },
    formatoPadrao: { id: "formato-041", nome: "20x18x8", largura: 20, altura: 18, lateral: 8 },
    substrato: { id: "duplex", nome: "Cartao Duplex" },
    substratoGramagem: "300",
    reforcoFundo: true,
    reforcoFundoModelo: "trava_automatica",
    bocaPalhaco: false,
    furoFita: false,
    impressaoModo: { id: "offset", nome: "Offset" },
    impressaoCombinacao: { id: "4x4", nome: "4x4" },
    percentualImpressaoExterna: 100,
    acondicionamento: { id: "caixa", nome: "Caixa" },
    modulo: { id: "modulo-3", nome: "Modulo Premium" },
    quantidade: 2200,
    enobrecimentos: [
      {
        enobrecimentoTipo: { id: "verniz", nome: "Verniz UV" },
        observacoes: "Aplicacao localizada no logo.",
      },
    ],
  },
  {
    produtoTipo: { id: "etiqueta", nome: "Etiqueta", codigo: "ETQ" },
    produtoModelo: { id: "etiqueta_fio", nome: "Etiqueta com Fio", codigo: "ETQ-FIO" },
    formatoPadrao: { id: "formato-052", nome: "8x5", largura: 8, altura: 5, lateral: 0 },
    substrato: { id: "cartao_supremo", nome: "Cartao Supremo" },
    substratoGramagem: "300",
    reforcoFundo: false,
    bocaPalhaco: false,
    furoFita: true,
    furoFitaModelo: "furo_central",
    impressaoModo: { id: "digital", nome: "Digital" },
    impressaoCombinacao: { id: "4x4", nome: "4x4" },
    percentualImpressaoExterna: 100,
    acondicionamento: { id: "caixa", nome: "Caixa" },
    modulo: { id: "modulo-1", nome: "Modulo Padrao" },
    quantidade: 9000,
    enobrecimentos: [
      {
        enobrecimentoTipo: { id: "relevo", nome: "Relevo" },
        observacoes: "Relevo seco no logotipo.",
      },
    ],
  },
]

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function dataIsoDiasAtras(diasAtras: number, hora: number, minuto: number): string {
  const data = new Date()
  data.setHours(hora, minuto, 0, 0)
  data.setDate(data.getDate() - diasAtras)
  return data.toISOString()
}

function getStatusPorIndice(index: number): ShowcaseSolicitacao["statusWebhook"] {
  if (index % 7 === 0) return "erro"
  if (index % 5 === 0) return "pendente"
  return "sucesso"
}

function getSolicitacaoSeed(index: number, id: string): ShowcaseSolicitacao {
  const cliente = SHOWCASE_CLIENTES[index % SHOWCASE_CLIENTES.length]
  const itemBase = cloneValue(SHOWCASE_ITENS_BASE[index % SHOWCASE_ITENS_BASE.length])
  const contratoPRG = index % 2 === 0
  const localUnico = index % 3 !== 0
  const diasAtras = index < 12 ? index * 2 : 31 + (index - 12) * 2
  const createdAt = dataIsoDiasAtras(diasAtras, 8 + (index % 10), (index * 11) % 60)
  const statusWebhook = getStatusPorIndice(index)

  const quantidadeBase = itemBase.quantidade || 1200
  const variacaoQuantidade = (index % 4) * 350
  const quantidadePrincipal = quantidadeBase + variacaoQuantidade
  const quantidadeSecundaria = quantidadePrincipal + 1400

  itemBase.quantidade = quantidadePrincipal

  const webhookComMinutos = new Date(createdAt)
  webhookComMinutos.setMinutes(webhookComMinutos.getMinutes() + (index % 6) + 2)

  return {
    id,
    vendedor: cliente.vendedor,
    marca: cliente.marca,
    contato: cliente.contato,
    codigoMetrics: String(100000 + index * 97),
    empresa: cliente.empresa,
    unidade: cliente.unidade,
    nomeSolicitante: cliente.contato,
    emailSolicitante: cliente.emailSolicitante,
    telefoneSolicitante: cliente.telefoneSolicitante,
    observacoesGerais: `Pedido demonstrativo ${index + 1} para validar painel e listagem.`,
    tipoContrato: contratoPRG ? "PRG" : "JIT",
    imposto: contratoPRG ? "ICMS - Revenda" : "ISS - Consumo Proprio",
    condicaoPagamento: contratoPRG ? "30 dd" : "15 dd",
    royalties: contratoPRG ? "2.0" : "",
    bvAgencia: contratoPRG ? "1.0" : "",
    localUnico,
    cidadeUF: localUnico
      ? SHOWCASE_CIDADES[index % SHOWCASE_CIDADES.length]
      : `${SHOWCASE_CIDADES[index % SHOWCASE_CIDADES.length]}; ${SHOWCASE_CIDADES[(index + 3) % SHOWCASE_CIDADES.length]}`,
    pedidoMinimoCIF: localUnico ? null : String(Math.max(1000, quantidadePrincipal - 400)),
    quantidadeMultiplos: contratoPRG ? `${quantidadePrincipal}, ${quantidadeSecundaria}` : String(quantidadePrincipal),
    numeroEntregas: contratoPRG ? String((index % 3) + 2) : null,
    frequencia: contratoPRG ? (index % 4 === 0 ? "Quinzenal" : "Mensal") : null,
    frete: localUnico
      ? "FOB - Contratacao Transporte por CLIENTE"
      : "CIF - Entrega por conta da PRINTBAG",
    freteQuantidade: localUnico ? quantidadePrincipal : null,
    freteQuantidades: localUnico ? null : [quantidadePrincipal, quantidadeSecundaria],
    statusWebhook,
    responseWebhook:
      statusWebhook === "sucesso"
        ? "Payload recebido com sucesso"
        : statusWebhook === "erro"
          ? "Timeout no endpoint remoto"
          : null,
    webhookEnviadoEm: statusWebhook === "pendente" ? null : webhookComMinutos.toISOString(),
    createdAt,
    itens: [itemBase],
  }
}

export function getSeedSolicitacoes(): ShowcaseSolicitacao[] {
  return SHOWCASE_STATIC_SOLICITACAO_IDS
    .slice(0, SHOWCASE_TOTAL_SOLICITACOES)
    .map((id, index) => getSolicitacaoSeed(index, id))
}

export function getInitialShowcaseState(): ShowcaseState {
  const solicitacoes = getSeedSolicitacoes()

  return {
    version: SHOWCASE_STATE_VERSION,
    autenticado: true,
    solicitacaoSequence: Math.min(solicitacoes.length + 1, SHOWCASE_STATIC_SOLICITACAO_IDS.length),
    perguntaSequence: 29,
    solicitacoes,
    etapas: getSeedEtapas(),
  }
}
