import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Verificando campos tipo lista_opcoes sem opções...\n")
  
  const perguntas = await prisma.formularioPergunta.findMany({
    where: {
      tipo: "lista_opcoes",
      ativo: true
    },
    include: {
      formularioEtapa: true
    },
    orderBy: [
      { formularioEtapa: { ordem: "asc" } },
      { ordem: "asc" }
    ]
  })
  
  let problemasEncontrados = 0
  
  for (const p of perguntas) {
    const opcoes = p.opcoes as string[]
    
    // Campos que carregam opções dinamicamente do catálogo (não precisam de opcoes no banco)
    const camposDinamicos = [
      "produto", "modelo", "formato_padrao", "largura", "altura", "sanfona",
      "substrato", "gramagem", "tipo_alca", "tipo_impressao", "combinacao_cores"
    ]
    
    if (opcoes.length === 0 && !camposDinamicos.includes(p.systemKey || "")) {
      console.log(`⚠️ ${p.formularioEtapa.nome} > ${p.titulo}`)
      console.log(`   systemKey: ${p.systemKey}`)
      console.log(`   campoMapeado: ${p.campoMapeado}`)
      console.log("")
      problemasEncontrados++
    }
  }
  
  if (problemasEncontrados === 0) {
    console.log("✅ Todos os campos lista_opcoes têm opções definidas ou são dinâmicos!")
  } else {
    console.log(`\n⚠️ ${problemasEncontrados} campo(s) precisam de opções`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())



