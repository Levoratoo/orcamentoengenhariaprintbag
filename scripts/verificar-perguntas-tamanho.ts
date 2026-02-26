import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const perguntas = await prisma.formularioPergunta.findMany({
    where: {
      OR: [
        { systemKey: "largura" },
        { systemKey: "altura" },
        { systemKey: "sanfona" },
      ],
    },
    select: {
      id: true,
      titulo: true,
      systemKey: true,
      tipo: true,
      ativo: true,
      opcoes: true,
      formularioEtapa: {
        select: {
          nome: true,
        },
      },
    },
  })

  console.log("=== Perguntas de Tamanho (por systemKey) ===")
  for (const p of perguntas) {
    console.log(`\n${p.formularioEtapa.nome} > ${p.titulo}`)
    console.log(`  SystemKey: ${p.systemKey}`)
    console.log(`  Tipo: ${p.tipo}`)
    console.log(`  Ativo: ${p.ativo}`)
    console.log(`  Opções: ${JSON.stringify(p.opcoes)}`)
  }
  
  // Verificar também perguntas que têm "largura", "altura" ou "sanfona" no título
  const perguntasPorTitulo = await prisma.formularioPergunta.findMany({
    where: {
      OR: [
        { titulo: { contains: "Largura" } },
        { titulo: { contains: "Altura" } },
        { titulo: { contains: "Sanfona" } },
      ],
    },
    select: {
      id: true,
      titulo: true,
      systemKey: true,
      tipo: true,
      ativo: true,
      opcoes: true,
      formularioEtapa: {
        select: {
          nome: true,
        },
      },
    },
  })
  
  console.log("\n\n=== Perguntas com 'Largura/Altura/Sanfona' no título ===")
  for (const p of perguntasPorTitulo) {
    console.log(`\n${p.formularioEtapa.nome} > ${p.titulo}`)
    console.log(`  ID: ${p.id}`)
    console.log(`  SystemKey: ${p.systemKey}`)
    console.log(`  Tipo: ${p.tipo}`)
    console.log(`  Ativo: ${p.ativo}`)
    console.log(`  Opções: ${JSON.stringify(p.opcoes)}`)
  }
  
  // Verificar etapa "Tamanho"
  const etapaTamanho = await prisma.formularioEtapa.findFirst({
    where: { nome: "Tamanho" },
    include: { perguntas: true }
  })
  
  if (etapaTamanho) {
    console.log("\n\n=== Todas as perguntas da etapa 'Tamanho' ===")
    for (const p of etapaTamanho.perguntas) {
      console.log(`\n${p.titulo}`)
      console.log(`  ID: ${p.id}`)
      console.log(`  SystemKey: ${p.systemKey}`)
      console.log(`  Tipo: ${p.tipo}`)
      console.log(`  Ativo: ${p.ativo}`)
      console.log(`  Opções: ${JSON.stringify(p.opcoes)}`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
