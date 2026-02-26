import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔧 Adicionando opções aos campos restantes...\n")
  
  // 1. Formatos - carregar do catálogo
  const formatos = await prisma.formatoPadrao.findMany()
  const opcoesFormatos = formatos.map(f => f.nome)
  opcoesFormatos.push("Outro (Desenvolvimento)")
  
  await prisma.formularioPergunta.updateMany({
    where: { systemKey: "formato_padrao" },
    data: { opcoes: opcoesFormatos }
  })
  console.log(`✅ Formatos: ${opcoesFormatos.length} opções`)
  
  // 2. Papel/Substrato principal
  const substratos = await prisma.substrato.findMany()
  const opcoesSubstrato = substratos.map(s => s.nome)
  opcoesSubstrato.push("Outro (Desenvolvimento)")
  
  // Atualizar campo "Papel" 
  await prisma.formularioPergunta.updateMany({
    where: { 
      OR: [
        { systemKey: "papel" },
        { systemKey: "substrato" },
        { titulo: "Papel" }
      ]
    },
    data: { opcoes: opcoesSubstrato }
  })
  console.log(`✅ Papel/Substrato: ${opcoesSubstrato.length} opções`)
  
  // 3. Gramatura
  const gramaturas = [
    "90g",
    "120g",
    "150g",
    "180g",
    "210g",
    "230g",
    "250g",
    "270g",
    "300g",
    "350g",
    "400g",
    "Outro (Desenvolvimento)"
  ]
  await prisma.formularioPergunta.updateMany({
    where: { 
      OR: [
        { systemKey: "gramagem" },
        { systemKey: "gramatura" },
        { titulo: "Gramatura" }
      ]
    },
    data: { opcoes: gramaturas }
  })
  console.log(`✅ Gramatura: ${gramaturas.length} opções`)
  
  // 4. Tipos de Alça
  const tiposAlca = await prisma.alcaTipo.findMany()
  const opcoesTiposAlca = tiposAlca.map(a => a.nome)
  opcoesTiposAlca.push("Sem Alça")
  opcoesTiposAlca.push("Outro (Desenvolvimento)")
  
  await prisma.formularioPergunta.updateMany({
    where: { 
      OR: [
        { systemKey: "tipo_alca" },
        { titulo: "Alça" }
      ],
      tipo: "lista_opcoes"
    },
    data: { opcoes: opcoesTiposAlca }
  })
  console.log(`✅ Tipos de Alça: ${opcoesTiposAlca.join(", ")}`)
  
  // 5. Modos de Impressão
  const modosImpressao = await prisma.impressaoModo.findMany()
  const opcoesImpressao = modosImpressao.map(m => m.nome)
  opcoesImpressao.push("Sem Impressão")
  opcoesImpressao.push("Outro (Desenvolvimento)")
  
  await prisma.formularioPergunta.updateMany({
    where: { 
      OR: [
        { systemKey: "tipo_impressao" },
        { titulo: "Impressão" }
      ],
      tipo: "lista_opcoes"
    },
    data: { opcoes: opcoesImpressao }
  })
  console.log(`✅ Impressão: ${opcoesImpressao.join(", ")}`)
  
  // 6. Quantidade de Cores / Combinações
  const combinacoes = [
    "1x0",
    "2x0",
    "3x0",
    "4x0",
    "1x1",
    "2x1",
    "2x2",
    "4x1",
    "4x4",
    "Outro (Desenvolvimento)"
  ]
  await prisma.formularioPergunta.updateMany({
    where: { 
      OR: [
        { systemKey: "combinacao_cores" },
        { titulo: "Qntd de Cores" }
      ]
    },
    data: { opcoes: combinacoes }
  })
  console.log(`✅ Qtd Cores: ${combinacoes.join(", ")}`)
  
  // Verificação final
  console.log("\n📋 Verificação final:")
  const perguntas = await prisma.formularioPergunta.findMany({
    where: {
      tipo: "lista_opcoes",
      ativo: true
    },
    include: { formularioEtapa: true },
    orderBy: [
      { formularioEtapa: { ordem: "asc" } },
      { ordem: "asc" }
    ]
  })
  
  let vazios = 0
  for (const p of perguntas) {
    const opcoes = p.opcoes as string[]
    if (opcoes.length === 0) {
      console.log(`⚠️ ${p.formularioEtapa.nome} > ${p.titulo}: SEM OPÇÕES`)
      vazios++
    }
  }
  
  if (vazios === 0) {
    console.log("✅ Todos os campos lista_opcoes agora têm opções!")
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())



