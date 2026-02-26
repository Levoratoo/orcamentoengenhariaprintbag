import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("=== Corrigindo tipos dos campos de Tamanho ===\n")
  
  // Corrigir LARGURA
  const largura = await prisma.formularioPergunta.updateMany({
    where: { systemKey: "largura" },
    data: { tipo: "lista_opcoes" }
  })
  console.log(`LARGURA: ${largura.count} campo(s) atualizado(s) para lista_opcoes`)
  
  // Corrigir ALTURA
  const altura = await prisma.formularioPergunta.updateMany({
    where: { systemKey: "altura" },
    data: { tipo: "lista_opcoes" }
  })
  console.log(`ALTURA: ${altura.count} campo(s) atualizado(s) para lista_opcoes`)
  
  // Corrigir SANFONA
  const sanfona = await prisma.formularioPergunta.updateMany({
    where: { systemKey: "sanfona" },
    data: { tipo: "lista_opcoes" }
  })
  console.log(`SANFONA: ${sanfona.count} campo(s) atualizado(s) para lista_opcoes`)
  
  console.log("\n✅ Tipos corrigidos! Agora os campos vão mostrar dropdown com valores do catálogo.")
  console.log("   As opções serão carregadas dinamicamente baseado no modelo de produto selecionado.")
  
  // Verificar resultado
  const perguntas = await prisma.formularioPergunta.findMany({
    where: {
      OR: [
        { systemKey: "largura" },
        { systemKey: "altura" },
        { systemKey: "sanfona" },
      ],
    },
    select: {
      titulo: true,
      systemKey: true,
      tipo: true,
    },
  })
  
  console.log("\n=== Estado atual ===")
  for (const p of perguntas) {
    console.log(`${p.titulo}: tipo = ${p.tipo}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())



