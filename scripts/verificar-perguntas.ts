import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Buscar todas as perguntas
  const perguntas = await prisma.formularioPergunta.findMany({
    include: {
      formularioEtapa: true
    },
    orderBy: [
      { formularioEtapa: { ordem: "asc" } },
      { ordem: "asc" }
    ]
  })
  
  console.log("📋 Verificando perguntas problemáticas:\n")
  
  for (const p of perguntas) {
    const problemas: string[] = []
    
    // Verificar opcoes (pode ter objetos em vez de strings)
    if (p.opcoes && Array.isArray(p.opcoes)) {
      for (const op of p.opcoes) {
        if (typeof op === 'object') {
          problemas.push(`opcoes contém objeto: ${JSON.stringify(op)}`)
        }
      }
    }
    
    // Verificar configuracao
    if (p.configuracao && typeof p.configuracao === 'object') {
      // OK se for objeto de configuração
    }
    
    // Verificar campos que parecem duplicados ou desnecessários
    if (p.titulo.toLowerCase().includes("outro") && p.titulo.toLowerCase().includes("desenvolvimento")) {
      if (p.tipo !== "texto_longo" && p.tipo !== "texto_curto") {
        problemas.push(`Campo "Outro (Desenvolvimento)" deveria ser texto_longo, mas é: ${p.tipo}`)
      }
    }
    
    if (problemas.length > 0 || p.titulo.toLowerCase().includes("outro")) {
      console.log(`🔍 ${p.formularioEtapa.nome} > ${p.titulo}`)
      console.log(`   ID: ${p.id}`)
      console.log(`   Tipo: ${p.tipo}`)
      console.log(`   Ativo: ${p.ativo}`)
      console.log(`   SystemKey: ${p.systemKey || "N/A"}`)
      console.log(`   CampoMapeado: ${p.campoMapeado || "N/A"}`)
      console.log(`   Opcoes: ${JSON.stringify(p.opcoes)}`)
      if (problemas.length > 0) {
        console.log(`   ⚠️ PROBLEMAS: ${problemas.join(", ")}`)
      }
      console.log("")
    }
  }
  
  // Listar perguntas da etapa Tamanho especificamente
  console.log("\n📐 Perguntas da etapa TAMANHO:")
  const tamanhoPerguntas = perguntas.filter(p => p.formularioEtapa.codigo === "tamanho")
  for (const p of tamanhoPerguntas) {
    console.log(`  - ${p.titulo} (tipo: ${p.tipo}, ativo: ${p.ativo}, ordem: ${p.ordem})`)
    console.log(`    systemKey: ${p.systemKey || "N/A"}, campoMapeado: ${p.campoMapeado || "N/A"}`)
    console.log(`    opcoes: ${JSON.stringify(p.opcoes)}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())



