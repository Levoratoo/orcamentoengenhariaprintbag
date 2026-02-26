import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔧 Desativando campo 'Outro' duplicado...\n")
  
  // Desativar o campo "Outro" simples (mantendo apenas "Outro (Desenvolvimento)")
  const resultado = await prisma.formularioPergunta.update({
    where: { id: "cmk15itye00o6xa2aqfazjksa" }, // Campo "Outro" 
    data: { ativo: false }
  })
  
  console.log(`✅ Campo "${resultado.titulo}" desativado com sucesso!`)
  console.log(`   ID: ${resultado.id}`)
  console.log(`   systemKey: ${resultado.systemKey}`)
  
  // Verificar campos ativos restantes
  console.log("\n📋 Campos ativos em 'Entrega e quantidade':")
  const perguntasAtivas = await prisma.formularioPergunta.findMany({
    where: {
      formularioEtapa: { codigo: "entrega_quantidade" },
      ativo: true
    },
    orderBy: { ordem: "asc" }
  })
  
  for (const p of perguntasAtivas) {
    console.log(`  - ${p.titulo} (${p.systemKey})`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())



