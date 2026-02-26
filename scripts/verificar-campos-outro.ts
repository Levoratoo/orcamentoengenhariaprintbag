import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Verificando campos 'Outro' na etapa Entrega e quantidade...\n")
  
  const perguntas = await prisma.formularioPergunta.findMany({
    where: {
      formularioEtapa: {
        codigo: "entrega_quantidade"
      },
      ativo: true
    },
    include: { formularioEtapa: true },
    orderBy: { ordem: "asc" }
  })
  
  for (const p of perguntas) {
    console.log(`${p.ordem}. ${p.titulo}`)
    console.log(`   ID: ${p.id}`)
    console.log(`   tipo: ${p.tipo}`)
    console.log(`   systemKey: ${p.systemKey}`)
    console.log(`   campoMapeado: ${p.campoMapeado}`)
    console.log(`   ajuda: ${p.ajuda}`)
    console.log("")
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())



