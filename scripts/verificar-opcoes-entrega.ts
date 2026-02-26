import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Verificando opções dos campos de Entrega e quantidade...\n")
  
  const perguntas = await prisma.formularioPergunta.findMany({
    where: {
      formularioEtapa: { codigo: "entrega_quantidade" },
      ativo: true,
      tipo: "lista_opcoes"
    },
    orderBy: { ordem: "asc" }
  })
  
  for (const p of perguntas) {
    const opcoes = p.opcoes as string[]
    console.log(`📋 ${p.titulo} (${p.systemKey})`)
    console.log(`   Opções (${opcoes.length}):`)
    if (opcoes.length > 0) {
      opcoes.forEach(op => console.log(`     - ${op}`))
    } else {
      console.log(`     ⚠️ NENHUMA OPÇÃO!`)
    }
    console.log("")
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())



