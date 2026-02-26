// Tipos relacionados a solicitações de orçamento

import { ProdutoTipoCodigo } from "./catalog";

export type StatusWebhook = "pendente" | "sucesso" | "erro";

export interface SolicitacaoDadosGerais {
  empresa: string;
  unidade?: string;
  nomeSolicitante: string;
  emailSolicitante: string;
  telefoneSolicitante?: string;
  prazoDesejado?: Date | string;
  observacoesGerais?: string;
}

export interface SolicitacaoFormato {
  formatoPadraoId?: string;
  formatoCustom?: {
    largura: number;
    altura: number;
    lateral?: number;
    observacoes?: string;
  };
}

export interface SolicitacaoAlca {
  tipoId?: string;
  largura?: string;
  cor?: string;
  corCustom?: string;
  aplicacao?: string;
}

export interface SolicitacaoAcabamentos {
  reforcoFundo: boolean;
  bocaPalhaco: boolean;
  furoFita: boolean;
  furoFitaModelo?: string;
}

export interface SolicitacaoImpressao {
  modoId?: string;
  combinacaoId?: string;
  camadas?: {
    externa?: boolean;
    interna?: boolean;
    apara?: boolean;
    saco?: boolean;
    sacola?: boolean;
    etiqueta?: boolean;
  };
  observacoes?: string;
}

export interface SolicitacaoEnobrecimento {
  tipoId: string;
  dados?: {
    cor?: string;
    tamanho?: string;
    tipo?: string; // Ex: "alto relevo", "baixo relevo"
    padrao?: string; // Para gofragem
    tipoLaminação?: string; // "brilho", "fosco", "outro"
    tipoVerniz?: string; // "total", "parcial"
    detalhamento?: string; // Para verniz parcial
  };
  observacoes?: string;
}

export interface SolicitacaoAcondicionamento {
  tipoId?: string;
  moduloId?: string;
  quantidade: number;
}

export interface SolicitacaoItemCompleto {
  produtoTipoId: string;
  produtoModeloId: string;
  formato: SolicitacaoFormato;
  substratoId: string;
  substratoGramagem?: string;
  alca?: SolicitacaoAlca;
  acabamentos: SolicitacaoAcabamentos;
  impressao?: SolicitacaoImpressao;
  enobrecimentos: SolicitacaoEnobrecimento[];
  acondicionamento: SolicitacaoAcondicionamento;
  desenvolvimentoObservacoes?: string;
}

export interface SolicitacaoCompleta {
  dadosGerais: SolicitacaoDadosGerais;
  itens: SolicitacaoItemCompleto[];
}

// JSON estruturado para webhook
export interface SolicitacaoWebhookPayload {
  solicitacao: {
    id: string;
    numero: string; // ID formatado como número
    empresa: string;
    unidade?: string;
    nomeSolicitante: string;
    emailSolicitante: string;
    telefoneSolicitante?: string;
    prazoDesejado?: string;
    observacoesGerais?: string;
    criadoEm: string;
  };
  itens: Array<{
    produto: {
      tipo: string;
      modelo: string;
    };
    formato: {
      padrao?: string;
      custom?: {
        largura: number;
        altura: number;
        lateral?: number;
        observacoes?: string;
      };
    };
    substrato: {
      tipo: string;
      gramagem?: string;
    };
    alca?: SolicitacaoAlca;
    acabamentos: SolicitacaoAcabamentos;
    impressao?: SolicitacaoImpressao;
    enobrecimentos: SolicitacaoEnobrecimento[];
    acondicionamento: SolicitacaoAcondicionamento;
    desenvolvimento?: {
      observacoes?: string;
    };
  }>;
}







