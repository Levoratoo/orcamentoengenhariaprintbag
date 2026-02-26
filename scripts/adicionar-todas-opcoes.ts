import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔧 Adicionando opções aos campos vazios...\n")
  
  // 1. Material > Substrato (alternativo)
  const substratos = await prisma.substrato.findMany()
  const opcoesSubstrato = substratos.map(s => s.nome)
  opcoesSubstrato.push("Outro (Desenvolvimento)")
  
  await prisma.formularioPergunta.updateMany({
    where: { systemKey: "substrato_alternativo" },
    data: { 
      opcoes: opcoesSubstrato,
      ajuda: "Substrato alternativo se necessário"
    }
  })
  console.log(`✅ Substrato alternativo: ${opcoesSubstrato.length} opções`)
  
  // 2. Alça > Aplicação
  const aplicacoesAlca = [
    "Colada",
    "Furada",
    "Rebatida",
    "Ilhós",
    "Outro (Desenvolvimento)"
  ]
  await prisma.formularioPergunta.updateMany({
    where: { systemKey: "aplicacao_alca" },
    data: { 
      opcoes: aplicacoesAlca,
      ajuda: "Tipo de aplicação da alça"
    }
  })
  console.log(`✅ Aplicação alça: ${aplicacoesAlca.join(", ")}`)
  
  // 3. Alça > Largura
  const largurasAlca = [
    "10mm",
    "15mm",
    "20mm",
    "25mm",
    "30mm",
    "35mm",
    "40mm",
    "Outro (Desenvolvimento)"
  ]
  await prisma.formularioPergunta.updateMany({
    where: { systemKey: "largura_algg" },
    data: { 
      opcoes: largurasAlca,
      ajuda: "Largura da alça em mm"
    }
  })
  // Tentar também com o systemKey correto
  await prisma.formularioPergunta.updateMany({
    where: { systemKey: "largura_alca" },
    data: { 
      opcoes: largurasAlca,
      ajuda: "Largura da alça em mm"
    }
  })
  console.log(`✅ Largura alça: ${largurasAlca.join(", ")}`)
  
  // 4. Alça > Cor
  const coresAlca = [
    "Branco",
    "Preto",
    "Natural/Cru",
    "Marrom",
    "Bege",
    "Azul",
    "Vermelho",
    "Verde",
    "Amarelo",
    "Rosa",
    "Cinza",
    "Outro (Desenvolvimento)"
  ]
  await prisma.formularioPergunta.updateMany({
    where: { systemKey: "cor_alca" },
    data: { 
      opcoes: coresAlca,
      ajuda: "Cor da alça"
    }
  })
  console.log(`✅ Cor alça: ${coresAlca.length} opções`)
  
  // 5. Acabamentos > tipo_acabamento (esse campo é redundante com os checkboxes, vou desativá-lo)
  await prisma.formularioPergunta.updateMany({
    where: { systemKey: "tipo_acabamento" },
    data: { 
      ativo: false // Desativar - acabamentos já são checkboxes individuais
    }
  })
  console.log(`✅ Acabamentos (tipo): Desativado (já tem checkboxes individuais)`)
  
  // 6. Acondicionamento
  const acondicionamentos = await prisma.acondicionamento.findMany()
  const opcoesAcondicionamento = acondicionamentos.map(a => a.nome)
  opcoesAcondicionamento.push("Outro (Desenvolvimento)")
  
  await prisma.formularioPergunta.updateMany({
    where: { systemKey: "acondicionamento" },
    data: { 
      opcoes: opcoesAcondicionamento,
      ajuda: "Tipo de acondicionamento/embalagem"
    }
  })
  console.log(`✅ Acondicionamento: ${opcoesAcondicionamento.join(", ")}`)
  
  // 7. Módulo
  const modulos = await prisma.modulo.findMany()
  const opcoesModulo = modulos.map(m => `${m.nome} (${m.quantidade} un)`)
  opcoesModulo.push("Outro (Desenvolvimento)")
  
  await prisma.formularioPergunta.updateMany({
    where: { systemKey: "modulo" },
    data: { 
      opcoes: opcoesModulo,
      ajuda: "Módulo de embalagem (quantidade por pacote)"
    }
  })
  console.log(`✅ Módulo: ${opcoesModulo.length} opções`)
  
  // Verificar resultado final
  console.log("\n📋 Verificação final - campos lista_opcoes ativos:")
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
  
  for (const p of perguntas) {
    const opcoes = p.opcoes as string[]
    const status = opcoes.length > 0 ? "✅" : "⚠️"
    console.log(`${status} ${p.formularioEtapa.nome} > ${p.titulo}: ${opcoes.length} opções`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())



