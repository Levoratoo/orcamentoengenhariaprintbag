// Tipos relacionados ao catálogo de produtos
// Baseado no FORMULÁRIO.rtf e planilha Excel

export type ProdutoTipoCodigo = 
  | "SACO"
  | "SACOLA"
  | "CAIXA"
  | "GUARDANAPO"
  | "ETIQUETA"
  | "FITA"
  | "SEDA"
  | "SOLAPA"
  | "TAG"
  | "ENVELOPE";

export type ImpressaoModoCodigo =
  | "SEM"
  | "PB"
  | "CMYK"
  | "PANTONE"
  | "CMYK_PANTONE"
  | "SERIGRAFIA";

export type EnobrecimentoTipoCodigo =
  | "HOT_STAMPING"
  | "RELEVO"
  | "GOFRAGEM"
  | "LAMINACAO"
  | "VERNIZ_UV";

export type AcondicionamentoCodigo =
  | "PACOTE"
  | "SHRINK"
  | "CAIXA"
  | "ROLO"
  | "CARTELA";

export interface ProdutoTipo {
  id: string;
  codigo: ProdutoTipoCodigo;
  nome: string;
  descricao?: string;
  modelos: ProdutoModelo[];
}

export interface ProdutoModelo {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  permiteAlca: boolean;
  permiteAcabamentos?: boolean; // Se false, desabilita acabamentos
  permiteEnobrecimentos?: boolean; // Se false, desabilita enobrecimentos
  substratosPermitidos: string[]; // IDs dos substratos
  impressoesPermitidas: string[]; // IDs dos modos de impressão
  enobrecimentosPermitidos: string[]; // IDs dos tipos de enobrecimento
  acondicionamentosPermitidos: string[]; // IDs dos acondicionamentos
  formatosPermitidos: string[]; // IDs dos formatos
  // Campos específicos por modelo
  largurasPadrao?: number[]; // Para SACO FUNDO V
  alturasPadrao?: number[]; // Para SACO FUNDO V
  sanfonasPadrao?: number[]; // Para SACO FUNDO V
  permiteImpressaoApara?: boolean; // Para sacolas e sacos
  permiteImpressaoSaco?: boolean; // Para sacolas
  permiteImpressaoSacola?: boolean; // Para sacolas
  permiteImpressaoEnvelope?: boolean; // Para envelopes
  tiposAlcaPermitidos?: string[]; // IDs dos tipos de alça permitidos
  aplicacoesAlcaPermitidas?: string[]; // Aplicações permitidas
  largurasAlcaPermitidas?: number[]; // Larguras permitidas
  coresAlcaPermitidas?: string[]; // Cores permitidas
  acabamentosPermitidos?: string[]; // Tipos de acabamento permitidos
  modelosReforcoFundo?: string[]; // Modelos de reforço de fundo
  modelosFuroFita?: string[]; // Modelos de furo de fita
  tiragemMinimaAlcaColorida?: number; // Tiragem mínima para alça colorida
  combinacoesImpressao?: Record<string, string[]>; // Modo -> combinações permitidas (ex: { imp_pb: ["1x0"] })
  formatosEspeciais?: any[]; // Formatos especiais com detalhes (tampa, colagem, etc.)
  desenvolvimento?: boolean; // Se é desenvolvimento
  terceirizada?: boolean; // Se é terceirizada
  requerCorFita?: boolean; // Se requer cor da fita
  variacoes?: any[]; // Variações do modelo (ex: envelope com/sem alça)
  tamanhosVelcro?: number[]; // Tamanhos de velcro permitidos
}

export interface FormatoPadrao {
  id: string;
  codigo: string;
  nome: string;
  largura?: number;
  altura?: number;
  lateral?: number;
  aceitaDesenvolvimento: boolean;
}

export interface Substrato {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  gramagens: string[];
  exigeLaminacao: boolean;
}

export interface ImpressaoModo {
  id: string;
  codigo: ImpressaoModoCodigo;
  nome: string;
  combinacoes: ImpressaoCombinacao[];
}

export interface ImpressaoCombinacao {
  id: string;
  codigo: string;
  nome: string;
  camadas: string[];
}

export interface EnobrecimentoTipo {
  id: string;
  codigo: EnobrecimentoTipoCodigo;
  nome: string;
  descricao?: string;
}

export interface AlcaTipo {
  id: string;
  codigo: string;
  nome: string;
}

export interface Acondicionamento {
  id: string;
  codigo: AcondicionamentoCodigo;
  nome: string;
}

export interface Modulo {
  id: string;
  codigo: string;
  nome: string;
  quantidade?: number;
}

// Regras de negócio do catálogo
export interface RegrasCatalogo {
  tiragemMinima: Partial<Record<ProdutoTipoCodigo, number>>; // Ex: { SEDA: 30000 }
  modelosSemEnobrecimento: string[]; // IDs de modelos que não permitem enobrecimento
  modelosSemImpressao: string[]; // IDs de modelos que não permitem impressão
  modelosSemAcabamentos?: string[]; // IDs de modelos que não permitem acabamentos
  modelosSemAlca?: string[]; // IDs de modelos que não permitem alça
  substratosExigemLaminacao?: string[]; // IDs de substratos que exigem laminação
  tiragemMinimaAlcaColorida?: number; // Tiragem mínima para alça colorida
  papelImpressaoApara?: string; // Papel padrão para impressão de apara
  modelosPermitemImpressaoApara?: string[]; // IDs de modelos que permitem impressão de apara
}

// Catálogo completo (estrutura para JSON inicial)
export interface CatalogoCompleto {
  produtoTipos: ProdutoTipo[];
  formatosPadrao: FormatoPadrao[];
  substratos: Substrato[];
  impressaoModos: ImpressaoModo[];
  enobrecimentoTipos: EnobrecimentoTipo[];
  alcaTipos: AlcaTipo[];
  acondicionamentos: Acondicionamento[];
  modulos: Modulo[];
  regras: RegrasCatalogo;
}


