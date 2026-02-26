import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Atualizar todas as perguntas para ativo = true
  const result = await prisma.formularioPergunta.updateMany({
    where: {
      ativo: false
    },
    data: {
      ativo: true
    }
  })
  
  console.log(`✅ ${result.count} perguntas foram ativadas!`)
  
  // Listar todas as perguntas
  const perguntas = await prisma.formularioPergunta.findMany({
    include: {
      formularioEtapa: true
    },
    orderBy: [
      { formularioEtapa: { ordem: "asc" } },
      { ordem: "asc" }
    ]
  })
  
  console.log("\n📋 Lista de perguntas:")
  for (const p of perguntas) {
    console.log(`  - [${p.ativo ? "✓" : "✗"}] ${p.formularioEtapa.nome} > ${p.titulo}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())



