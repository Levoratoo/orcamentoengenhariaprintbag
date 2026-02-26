import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔧 Adicionando opções aos campos de Enobrecimentos...\n")
  
  // Buscar tipos de enobrecimento do catálogo
  const tiposEnobrecimento = await prisma.enobrecimentoTipo.findMany()
  const opcoesEnobrecimento = tiposEnobrecimento.map(t => t.nome)
  opcoesEnobrecimento.push("Outro (Desenvolvimento)")
  
  // 1. Campo "Enobrecimentos" (tipo principal)
  await prisma.formularioPergunta.updateMany({
    where: { systemKey: "tipo_enobrecimento" },
    data: { 
      opcoes: opcoesEnobrecimento,
      ajuda: "Selecione o tipo de enobrecimento desejado"
    }
  })
  console.log(`✅ Enobrecimentos: ${opcoesEnobrecimento.join(", ")}`)
  
  // 2. Campo "Cor"
  const coresEnobrecimento = [
    "Ouro",
    "Prata", 
    "Cobre",
    "Rose Gold",
    "Preto",
    "Branco",
    "Vermelho",
    "Azul",
    "Verde",
    "Holográfico",
    "Outro (Desenvolvimento)"
  ]
  await prisma.formularioPergunta.updateMany({
    where: { systemKey: "cor_enobrecimento" },
    data: { 
      opcoes: coresEnobrecimento,
      ajuda: "Cor do enobrecimento (Ouro, Prata, Preto, etc.)"
    }
  })
  console.log(`✅ Cor: ${coresEnobrecimento.join(", ")}`)
  
  // 3. Campo "Tipo" (detalhe)
  const tiposDetalhe = [
    "Brilhante",
    "Fosco",
    "Acetinado",
    "Texturizado",
    "Outro (Desenvolvimento)"
  ]
  await prisma.formularioPergunta.updateMany({
    where: { systemKey: "tipo_detalhe_enobrecimento" },
    data: { 
      opcoes: tiposDetalhe,
      ajuda: "Acabamento do enobrecimento"
    }
  })
  console.log(`✅ Tipo (detalhe): ${tiposDetalhe.join(", ")}`)
  
  // 4. Campo "Modelo"
  const modelos = [
    "Logo",
    "Texto",
    "Padrão",
    "Arte completa",
    "Borda",
    "Outro (Desenvolvimento)"
  ]
  await prisma.formularioPergunta.updateMany({
    where: { systemKey: "modelo_enobrecimento" },
    data: { 
      opcoes: modelos,
      ajuda: "Modelo/tipo de aplicação do enobrecimento"
    }
  })
  console.log(`✅ Modelo: ${modelos.join(", ")}`)
  
  // Verificar resultado
  console.log("\n📋 Verificando campos atualizados:")
  const perguntas = await prisma.formularioPergunta.findMany({
    where: {
      formularioEtapa: { codigo: "enobrecimentos" },
      tipo: "lista_opcoes"
    },
    orderBy: { ordem: "asc" }
  })
  
  for (const p of perguntas) {
    const opcoes = p.opcoes as string[]
    console.log(`  - ${p.titulo}: ${opcoes.length} opções`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())



