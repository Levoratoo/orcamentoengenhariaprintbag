import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("📋 Perguntas de ENOBRECIMENTOS:\n")
  
  const perguntas = await prisma.formularioPergunta.findMany({
    where: {
      formularioEtapa: {
        codigo: "enobrecimentos"
      }
    },
    include: {
      formularioEtapa: true
    },
    orderBy: { ordem: "asc" }
  })
  
  for (const p of perguntas) {
    console.log(`${p.ordem}. ${p.titulo}`)
    console.log(`   tipo: ${p.tipo}`)
    console.log(`   systemKey: ${p.systemKey || "N/A"}`)
    console.log(`   campoMapeado: ${p.campoMapeado || "N/A"}`)
    console.log(`   opcoes: ${JSON.stringify(p.opcoes)}`)
    console.log(`   ativo: ${p.ativo}`)
    console.log("")
  }
  
  // Verificar se há tipos de enobrecimento no catálogo
  const tiposEnobrecimento = await prisma.enobrecimentoTipo.findMany()
  console.log("\n🎨 Tipos de Enobrecimento no catálogo:")
  for (const t of tiposEnobrecimento) {
    console.log(`  - ${t.nome} (${t.codigo})`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())



