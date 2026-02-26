// Schemas de validação Zod para o formulário de solicitação

import { z } from "zod"

const parseListaNumeros = (val: unknown): number[] | undefined => {
  if (val === null || val === undefined) return undefined
  if (Array.isArray(val)) {
    const numeros = val
      .map((item) => (typeof item === "number" ? item : parseFloat(String(item))))
      .filter((num) => Number.isFinite(num) && num > 0)
    return numeros.length > 0 ? numeros : undefined
  }
  if (typeof val === "number") {
    return Number.isFinite(val) && val > 0 ? [val] : undefined
  }
  if (typeof val === "string") {
    const limpo = val.trim()
    if (!limpo) return undefined
    const numeros = limpo
      .split(/[,\s;]+/)
      .map((item) => parseFloat(item))
      .filter((num) => Number.isFinite(num) && num > 0)
    return numeros.length > 0 ? numeros : undefined
  }
  return undefined
}

// 1 - DADOS DO PEDIDO
export const dadosGeraisSchema = z.object({
  vendedor: z.string().min(1, "Vendedor é obrigatório"),
  contato: z.string().min(1, "Contato é obrigatório"),
  marca: z.string().min(1, "Marca é obrigatória"),
  codigoMetrics: z.string().regex(/^\d+$/, "Código Metrics deve conter apenas números"),

  // Campos legados (mantidos para compatibilidade mas opcionais)
  empresa: z.string().optional(),
  unidade: z.string().optional(),
  nomeSolicitante: z.string().optional(),
  observacoesGerais: z.string().optional(),
  emailSolicitante: z.string().optional(),
  telefoneSolicitante: z.string().optional(),
  prazoDesejado: z.string().optional(),
})

// 2 – CONDIÇÕES DE VENDA
export const condicoesVendaSchema = z.object({
  tipoContrato: z.enum(["JIT", "PRG"], {
    required_error: "Tipo de Contato é obrigatório",
  }),
  imposto: z.enum(["ICMS - Revenda", "ICMS - Consumo Próprio", "ISS - Consumo Próprio"], {
    required_error: "Imposto é obrigatório",
  }),
  condicaoPagamento: z.enum([
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
    "Outra: Informar"
  ], {
    required_error: "Condição de Pagamento é obrigatória",
  }),
  condicaoPagamentoOutra: z.string().optional(),
  
  // %Royalties: Opcional - usuário pode deixar em branco
  royalties: z.string().optional().default(""),
  
  // BV Agência: Opcional - usuário pode deixar em branco
  bvAgencia: z.string().optional().default(""),
}).superRefine((data, ctx) => {
  // Validação: se Condição de Pagamento = "Outra: Informar", o campo condicaoPagamentoOutra deve ser preenchido
  if (data.condicaoPagamento === "Outra: Informar") {
    if (!data.condicaoPagamentoOutra || data.condicaoPagamentoOutra.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe a condição de pagamento",
        path: ["condicaoPagamentoOutra"],
      })
    }
  }

  // Validação de %Royalties: Se o usuário marcar "Sim", deve informar o percentual
  if (data.royalties && data.royalties.trim() !== "") {
    const royaltiesLower = data.royalties.toLowerCase().trim()
    const isSim = royaltiesLower === "sim"
    const temNumero = /\d+(?:[.,]\d+)?/.test(data.royalties)
    
    // Se marcou Sim mas não informou o número, adiciona erro (sem mensagem para não duplicar)
    if (isSim && !temNumero) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "",
        path: ["royalties"],
      })
    }
  }

  // Validação de BV Agência: Se o usuário marcar "Sim", deve informar o valor
  if (data.bvAgencia && data.bvAgencia.trim() !== "") {
    const bvAgenciaLower = data.bvAgencia.toLowerCase().trim()
    const isSim = bvAgenciaLower === "sim"
    const temNumero = /\d+(?:[.,]\d+)?/.test(data.bvAgencia)
    
    // Se marcou Sim mas não informou o número, adiciona erro (sem mensagem para não duplicar)
    if (isSim && !temNumero) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "",
        path: ["bvAgencia"],
      })
    }
  }
})

// 3 – ENTREGAS
export const entregasSchema = z.object({
  // Nº de Entregas (obrigatório apenas para PRG, será validado no schema principal)
  numeroEntregas: z.coerce.number().int().positive().optional(),
  
  // Frequência (depende do Tipo de Contato e Nº de Entregas)
  frequencia: z.string().optional(),
  frequenciaOutra: z.string().optional(),
  
  // Frete (sempre obrigatório quando a etapa de entregas está presente)
  frete: z.string().optional(),
  
  // Local único (aceita boolean do formulário)
  localUnico: z.boolean().default(true),
  
  // Pedido Mínimo CIF (obrigatório apenas se Local único = false/Não)
  pedidoMinimoCIF: z.string().optional(),
  
  // Cidade(s)/UF - sempre obrigatório quando etapa de entregas está presente
  cidadeUF: z.string().optional(),
  cidadesUF: z.string().optional(),
  
  // Quantidade para orçamento (novo campo unificado)
  quantidade: z.string().optional(),
  
  // Campos legados (mantidos para compatibilidade mas ocultos)
  quantidadeLocalUnico: z.number().int().positive().optional(),
  cidadesUFMultiplas: z.string().optional(),
  anexarListaLojas: z.boolean().default(false),
  quantidadeMultiplos: z.string().optional(),
  frequenciaUnica: z.boolean().default(true),
  quantidadeUnica: z.number().int().positive().optional(),
  quantidadeMultiplasEntregas: z.number().int().positive().optional(),
  freteQuantidades: z.preprocess((val) => parseListaNumeros(val), z.array(z.number().int().positive()).optional()),
  freteQuantidade: z.number().int().positive().optional(),
})

export const produtoSchema = z.object({
  produtoTipoId: z.string().min(1, "Tipo de produto é obrigatório"),
  produtoModeloId: z.string().min(1, "Modelo é obrigatório"),
  quantidade: z.string().min(1, "Quantidade é obrigatória"),
  variacaoEnvelope: z.string().optional(),
}).refine(
  (data) => {
    return true
  },
  { message: "Variação do envelope é obrigatória" }
)

// Helper para aceitar número ou string "outro"
const numeroOuOutro = z.union([
  z.number().positive(),
  z.string().refine(val => val === "outro" || val === "Outro (Desenvolvimento)" || !isNaN(Number(val)), {
    message: "Deve ser um número ou 'Outro (Desenvolvimento)'"
  })
]).optional()

export const formatoSchema = z.object({
  formatoPadraoId: z.string().optional(),
  formatoCustom: z.object({
    largura: numeroOuOutro,
    altura: numeroOuOutro,
    lateral: z.number().positive().optional(),
    sanfona: numeroOuOutro,
    observacoes: z.string().optional(),
  }).optional(),
  sacoFundoV: z.object({
    larguraPadrao: z.string().optional(),
    alturaPadrao: z.string().optional(),
    sanfonaPadrao: z.string().optional(),
  }).optional(),
  envelopeAbaAltura: z.number().positive().optional(),
  larguraOutro: z.boolean().optional(),
  larguraOutroDescricao: z.string().optional(),
  alturaOutro: z.boolean().optional(),
  alturaOutroDescricao: z.string().optional(),
  sanfonaOutro: z.boolean().optional(),
  sanfonaOutroDescricao: z.string().optional(),
  formatoOutro: z.boolean().optional(),
  formatoOutroDescricao: z.string().optional(),
}).refine(
  (data) => {
    if (data.formatoPadraoId && data.formatoPadraoId !== "outro" && data.formatoPadraoId !== "Outro (Desenvolvimento)") {
      return true
    }
    const larguraValida = data.formatoCustom?.largura && 
      data.formatoCustom.largura !== "outro" && 
      data.formatoCustom.largura !== "Outro (Desenvolvimento)"
    const alturaValida = data.formatoCustom?.altura && 
      data.formatoCustom.altura !== "outro" && 
      data.formatoCustom.altura !== "Outro (Desenvolvimento)"
    if (larguraValida || alturaValida) {
      return true
    }
    if (data.sacoFundoV?.larguraPadrao && 
        data.sacoFundoV.larguraPadrao !== "outro" && 
        data.sacoFundoV.larguraPadrao !== "Outro (Desenvolvimento)") {
      return true
    }
    if (data.formatoOutroDescricao && data.formatoOutroDescricao.trim().length > 0) {
      return true
    }
    if (data.larguraOutroDescricao && data.larguraOutroDescricao.trim().length > 0) {
      return true
    }
    if (data.alturaOutroDescricao && data.alturaOutroDescricao.trim().length > 0) {
      return true
    }
    if (data.sanfonaOutroDescricao && data.sanfonaOutroDescricao.trim().length > 0) {
      return true
    }
    return false
  },
  { message: "Selecione um formato, informe dimensões ou descreva o que precisa para desenvolvimento" }
)

export const substratoSchema = z.object({
  substratoId: z.string().optional(),
  substratoGramagem: z.string().optional(),
  outroDescricao: z.string().optional(),
  gramagemOutroDescricao: z.string().optional(),
}).refine(
  (data) => {
    if (data.substratoId && data.substratoId !== "outro" && data.substratoId !== "Outro (Desenvolvimento)") {
      return true
    }
    if (data.outroDescricao && data.outroDescricao.trim().length > 0) {
      return true
    }
    return false
  },
  { message: "Selecione um substrato ou descreva o que precisa para desenvolvimento" }
)

export const alcaSchema = z.object({
  tipoId: z.string().optional(),
  largura: z.string().optional(),
  cor: z.string().optional(),
  corCustom: z.string().optional(),
  aplicacao: z.string().optional(),
  comprimento: z.number().positive().optional(),
  unidadeComprimento: z.enum(["cm", "m"]).optional(),
  outroDescricao: z.string().optional(),
  larguraOutroDescricao: z.string().optional(),
  corOutroDescricao: z.string().optional(),
  aplicacaoOutroDescricao: z.string().optional(),
})

export const acabamentosSchema = z.object({
  reforcoFundo: z.boolean().default(false),
  reforcoFundoModelo: z.string().optional(),
  bocaPalhaco: z.boolean().default(false),
  furoFita: z.boolean().default(false),
  furoFitaModelo: z.string().optional(),
  duplaFace: z.boolean().default(false),
  velcro: z.boolean().default(false),
  velcroCor: z.string().optional(),
  velcroTamanho: z.number().positive().optional(),
  outroDescricao: z.string().optional(),
})

export const impressaoSchema = z.object({
  modoId: z.string().optional(),
  combinacaoId: z.string().optional(),
  camadas: z.object({
    externa: z.boolean().optional(),
    interna: z.boolean().optional(),
    apara: z.boolean().optional(),
    saco: z.boolean().optional(),
    sacola: z.boolean().optional(),
    etiqueta: z.boolean().optional(),
  }).optional(),
  percentualExterna: z.number().min(0).max(100).optional(),
  percentualInterna: z.number().min(0).max(100).optional(),
  apara: z.object({
    ativa: z.boolean().default(false),
    modoId: z.string().optional(),
    combinacaoId: z.string().optional(),
    percentual: z.number().min(0).max(100).optional(),
    observacoes: z.string().optional(),
  }).optional(),
  saco: z.object({
    ativa: z.boolean().default(false),
    modoId: z.string().optional(),
    combinacaoId: z.string().optional(),
  }).optional(),
  envelope: z.object({
    ativa: z.boolean().default(false),
    modoId: z.string().optional(),
    combinacaoId: z.string().optional(),
  }).optional(),
  corFita: z.string().optional(),
  corteRegistrado: z.boolean().default(false),
  corteRegistradoTerceirizado: z.boolean().default(false),
  observacoes: z.string().optional(),
  outroDescricao: z.string().optional(),
})

export const enobrecimentoSchema = z.object({
  tipoId: z.string().min(1, "Tipo de enobrecimento é obrigatório"),
  dados: z.record(z.any()).optional(),
  observacoes: z.string().optional(),
})

export const acondicionamentoSchema = z.object({
  tipoId: z.string().optional(),
  moduloId: z.string().optional(),
  quantidade: z.number().int().positive("Quantidade deve ser maior que zero"),
  outroDescricao: z.string().optional(),
  moduloOutroDescricao: z.string().optional(),
})

export const solicitacaoCompletaSchema = z.object({
  dadosGerais: dadosGeraisSchema,
  condicoesVenda: condicoesVendaSchema.optional(),
  entregas: entregasSchema.optional(),
  produto: produtoSchema,
  formato: formatoSchema,
  substrato: substratoSchema,
  alca: alcaSchema.optional(),
  acabamentos: acabamentosSchema,
  impressao: impressaoSchema.optional(),
  enobrecimentos: z.array(enobrecimentoSchema).default([]),
  acondicionamento: acondicionamentoSchema,
  desenvolvimentoObservacoes: z.string().optional(),
}).superRefine((data, ctx) => {
  const isPRG = data.condicoesVenda?.tipoContrato === "PRG"
  const isJIT = data.condicoesVenda?.tipoContrato === "JIT"

  // Validações específicas para contratos PRG e JIT
  if (isPRG || isJIT) {
    if (!data.entregas) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dados de entregas são obrigatórios",
        path: ["entregas"],
      })
      return
    }

    const entregas = data.entregas

    // Validação: Frete é obrigatório
    if (!entregas.frete || entregas.frete.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Frete é obrigatório",
        path: ["entregas", "frete"],
      })
    } else {
      const fretesValidos = [
        "FOB - Contratação Transporte por CLIENTE",
        "CIF - Entrega por conta da PRINTBAG"
      ]
      if (!fretesValidos.includes(entregas.frete)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecione uma opção de frete válida",
          path: ["entregas", "frete"],
        })
      }
    }

    // Validação: Cidade(s)/UF é obrigatório
    const temCidade = (entregas.cidadeUF && entregas.cidadeUF.trim() !== "") || 
                      (entregas.cidadesUF && entregas.cidadesUF.trim() !== "")
    if (!temCidade) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cidade(s)/UF é obrigatório",
        path: ["entregas", "cidadeUF"],
      })
    }

    // Quantidade foi movida para etapa PRODUTO - não validar aqui

    // Validação: Nº de Entregas
    if (isPRG) {
      // Para PRG: Nº de Entregas é obrigatório e deve ser > 0
      const numeroEntregasStr = entregas.numeroEntregas ? entregas.numeroEntregas.toString() : ""
      const numeroEntregasNum = parseInt(numeroEntregasStr, 10)
      
      if (!numeroEntregasStr || numeroEntregasStr.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nº de Entregas é obrigatório para contrato PRG",
          path: ["entregas", "numeroEntregas"],
        })
      } else if (Number.isNaN(numeroEntregasNum) || numeroEntregasNum <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nº de Entregas deve ser maior que 0",
          path: ["entregas", "numeroEntregas"],
        })
      } else {
        // Validação de Frequência baseada no Nº de Entregas
        if (numeroEntregasNum === 1) {
          // Se Nº de Entregas = 1, Frequência deve ser "Única" (se preenchida)
          if (entregas.frequencia && entregas.frequencia !== "Única") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Frequência deve ser 'Única' quando Nº de Entregas = 1",
              path: ["entregas", "frequencia"],
            })
          }
        } else if (numeroEntregasNum > 1) {
          // Se Nº de Entregas > 1, Frequência é obrigatória e não pode ser "Única"
          if (!entregas.frequencia || entregas.frequencia.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Frequência é obrigatória quando Nº de Entregas > 1",
              path: ["entregas", "frequencia"],
            })
          } else if (entregas.frequencia === "Única") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Frequência não pode ser 'Única' quando Nº de Entregas > 1",
              path: ["entregas", "frequencia"],
            })
          }

          // Se Frequência = "Outra: Informar", o campo frequenciaOutra é obrigatório
          if (entregas.frequencia === "Outra: Informar") {
            if (!entregas.frequenciaOutra || entregas.frequenciaOutra.trim() === "") {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Informe a frequência",
                path: ["entregas", "frequenciaOutra"],
              })
            }
          }
        }
      }
    }
    // Para JIT: Nº de Entregas e Frequência não se aplicam (Não há)

    // Validação: Pedido Mínimo CIF
    if (entregas.localUnico === false) {
      // Se Local único = false (Não), Pedido Mínimo CIF é obrigatório
      if (!entregas.pedidoMinimoCIF || entregas.pedidoMinimoCIF.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Pedido Mínimo CIF é obrigatório quando Local único = Não",
          path: ["entregas", "pedidoMinimoCIF"],
        })
      }
    }
    // Se Local único = true (Sim), Pedido Mínimo CIF não se aplica (Não há)
  }
})

export type DadosGeraisFormData = z.infer<typeof dadosGeraisSchema>
export type CondicoesVendaFormData = z.infer<typeof condicoesVendaSchema>
export type EntregasFormData = z.infer<typeof entregasSchema>
export type ProdutoFormData = z.infer<typeof produtoSchema>
export type FormatoFormData = z.infer<typeof formatoSchema>
export type SubstratoFormData = z.infer<typeof substratoSchema>
export type AlcaFormData = z.infer<typeof alcaSchema>
export type AcabamentosFormData = z.infer<typeof acabamentosSchema>
export type ImpressaoFormData = z.infer<typeof impressaoSchema>
export type EnobrecimentoFormData = z.infer<typeof enobrecimentoSchema>
export type AcondicionamentoFormData = z.infer<typeof acondicionamentoSchema>
export type SolicitacaoCompletaFormData = z.infer<typeof solicitacaoCompletaSchema>
