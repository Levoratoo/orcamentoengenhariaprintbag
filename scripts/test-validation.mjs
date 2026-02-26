// Teste rápido da validação
import { z } from 'zod'

const condicoesVendaSchema = z.object({
  tipoContrato: z.enum(["JIT", "PRG"]),
  imposto: z.enum(["ICMS - Revenda", "ICMS - Consumo Próprio", "ISS - Consumo Próprio"]),
  condicaoPagamento: z.enum(["Depósito Antecipado", "7 dd", "15 dd", "28 dd", "30 dd", "45 dd", "60 dd", "30/45 dd", "30/60 dd", "30/45/60 dd", "Outra: Informar"]),
  condicaoPagamentoOutra: z.string().optional(),
  royalties: z.string().optional(),
  bvAgencia: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validação de %Royalties: Se o usuário marcar "Sim", deve informar o percentual
  if (data.royalties) {
    const royaltiesLower = data.royalties.toLowerCase().trim()
    const isSim = royaltiesLower === "sim"
    const temNumero = /\d+(?:[.,]\d+)?/.test(data.royalties)
    
    if (isSim && !temNumero) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o percentual",
        path: ["royalties"],
      })
    }
  }

  // Validação de BV Agência
  if (data.bvAgencia) {
    const bvAgenciaLower = data.bvAgencia.toLowerCase().trim()
    const isSim = bvAgenciaLower === "sim"
    const temNumero = /\d+(?:[.,]\d+)?/.test(data.bvAgencia)
    
    if (isSim && !temNumero) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o valor",
        path: ["bvAgencia"],
      })
    }
  }
})

console.log('🧪 Testando validação...\n')

// Teste 1: Campos vazios (deve passar)
console.log('Teste 1: Campos vazios')
try {
  const result1 = condicoesVendaSchema.parse({
    tipoContrato: "JIT",
    imposto: "ICMS - Revenda",
    condicaoPagamento: "30 dd",
    royalties: "",
    bvAgencia: ""
  })
  console.log('✅ PASSOU - Campos vazios são aceitos\n')
} catch (error) {
  console.log('❌ FALHOU:', error.errors)
}

// Teste 2: Campos undefined (deve passar)
console.log('Teste 2: Campos undefined')
try {
  const result2 = condicoesVendaSchema.parse({
    tipoContrato: "JIT",
    imposto: "ICMS - Revenda",
    condicaoPagamento: "30 dd"
  })
  console.log('✅ PASSOU - Campos undefined são aceitos\n')
} catch (error) {
  console.log('❌ FALHOU:', error.errors)
}

// Teste 3: Royalties = "sim" sem número (deve falhar)
console.log('Teste 3: Royalties = "sim" sem número')
try {
  const result3 = condicoesVendaSchema.parse({
    tipoContrato: "JIT",
    imposto: "ICMS - Revenda",
    condicaoPagamento: "30 dd",
    royalties: "sim"
  })
  console.log('❌ NÃO DEVERIA PASSAR')
} catch (error) {
  console.log('✅ FALHOU COMO ESPERADO - Precisa informar o número\n')
}

// Teste 4: Royalties com número (deve passar)
console.log('Teste 4: Royalties com número')
try {
  const result4 = condicoesVendaSchema.parse({
    tipoContrato: "JIT",
    imposto: "ICMS - Revenda",
    condicaoPagamento: "30 dd",
    royalties: "2.5"
  })
  console.log('✅ PASSOU - Royalties com número é aceito\n')
} catch (error) {
  console.log('❌ FALHOU:', error.errors)
}

console.log('✅ Todos os testes concluídos!')
