import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔧 Corrigindo perguntas problemáticas...\n")
  
  // 1. Corrigir "Outro (Desenvolvimento)" na etapa de Tamanho
  // O campoMapeado estava apontando para formato.formatoCustom (objeto) em vez de um campo de texto
  const tamanhoOutro = await prisma.formularioPergunta.updateMany({
    where: {
      systemKey: "formato_custom",
      campoMapeado: "formato.formatoCustom"
    },
    data: {
      campoMapeado: "formato.formatoOutroDescricao",
      tipo: "texto_longo",
      ajuda: "Descreva detalhadamente o formato que precisa ser desenvolvido"
    }
  })
  console.log(`✅ Tamanho > Outro (Desenvolvimento): ${tamanhoOutro.count} corrigido(s)`)
  
  // 2. Corrigir "Outro (Desenvolvimento)" em Enobrecimentos
  const enobOutro = await prisma.formularioPergunta.updateMany({
    where: {
      systemKey: "outro_enobrecimento",
      campoMapeado: "enobrecimentos.outro"
    },
    data: {
      campoMapeado: "desenvolvimentoObservacoes",
      tipo: "texto_longo",
      ajuda: "Descreva detalhadamente o enobrecimento que precisa ser desenvolvido"
    }
  })
  console.log(`✅ Enobrecimentos > Outro (Desenvolvimento): ${enobOutro.count} corrigido(s)`)
  
  // 3. Corrigir campos "Outro" em Acondicionamento
  const acondOutro = await prisma.formularioPergunta.updateMany({
    where: {
      systemKey: "outro_acondicionamento",
      campoMapeado: "acondicionamento.outro"
    },
    data: {
      campoMapeado: "acondicionamento.outroDescricao",
      tipo: "texto_longo",
      ajuda: "Descreva o acondicionamento desejado"
    }
  })
  console.log(`✅ Entrega > Outro: ${acondOutro.count} corrigido(s)`)
  
  const acondOutroDev = await prisma.formularioPergunta.updateMany({
    where: {
      systemKey: "outro_desenvolvimento_acondicionamento",
      campoMapeado: "acondicionamento.outroDesenvolvimento"
    },
    data: {
      campoMapeado: "acondicionamento.moduloOutroDescricao",
      tipo: "texto_longo",
      ajuda: "Descreva detalhadamente o que precisa ser desenvolvido"
    }
  })
  console.log(`✅ Entrega > Outro (Desenvolvimento): ${acondOutroDev.count} corrigido(s)`)
  
  // Mostrar perguntas corrigidas
  console.log("\n📋 Verificando correções:")
  const perguntas = await prisma.formularioPergunta.findMany({
    where: {
      titulo: {
        contains: "Outro"
      }
    },
    include: {
      formularioEtapa: true
    }
  })
  
  for (const p of perguntas) {
    console.log(`  - ${p.formularioEtapa.nome} > ${p.titulo}`)
    console.log(`    tipo: ${p.tipo}, campoMapeado: ${p.campoMapeado}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())



