import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Reorganizando campos da etapa ENTREGAS...\n')

  try {
    // 1. Desativar o campo frete_quantidade
    console.log('1️⃣ Desativando campo "frete_quantidade"...')
    await prisma.formularioPergunta.updateMany({
      where: { systemKey: 'frete_quantidade' },
      data: { ativo: false, ordem: 99 }
    })
    console.log('   ✅ Campo "frete_quantidade" desativado\n')

    // 2. Criar ou atualizar campo "quantidade_orcamento"
    console.log('2️⃣ Verificando campo "quantidade_orcamento"...')
    const etapaEntregas = await prisma.formularioEtapa.findFirst({
      where: { codigo: 'entregas' }
    })

    if (!etapaEntregas) {
      console.log('   ❌ Etapa "entregas" não encontrada!')
      return
    }

    const campoExistente = await prisma.formularioPergunta.findFirst({
      where: { 
        systemKey: 'quantidade_orcamento',
        formularioEtapaId: etapaEntregas.id
      }
    })

    if (campoExistente) {
      await prisma.formularioPergunta.update({
        where: { id: campoExistente.id },
        data: {
          titulo: 'Quantidade',
          tipo: 'texto_curto',
          obrigatorio: false,
          ordem: 8,
          ativo: true,
          campoMapeado: 'entregas.quantidade',
          ajuda: 'Informe as quantidades para orçamento. Separe por vírgula (ex: 3000, 4000, 6000)'
        }
      })
      console.log('   ✅ Campo "quantidade_orcamento" atualizado\n')
    } else {
      await prisma.formularioPergunta.create({
        data: {
          formularioEtapaId: etapaEntregas.id,
          titulo: 'Quantidade',
          tipo: 'texto_curto',
          obrigatorio: false,
          ordem: 8,
          ativo: true,
          isSystem: true,
          systemKey: 'quantidade_orcamento',
          campoMapeado: 'entregas.quantidade',
          ajuda: 'Informe as quantidades para orçamento. Separe por vírgula (ex: 3000, 4000, 6000)',
          opcoes: []
        }
      })
      console.log('   ✅ Campo "quantidade_orcamento" criado\n')
    }

    // 3. Atualizar ordem e tipos dos outros campos
    console.log('3️⃣ Atualizando outros campos...')
    
    await prisma.formularioPergunta.updateMany({
      where: { systemKey: 'numero_entregas' },
      data: { ordem: 1, tipo: 'numero' }
    })
    
    await prisma.formularioPergunta.updateMany({
      where: { systemKey: 'frequencia' },
      data: { ordem: 2 }
    })
    
    await prisma.formularioPergunta.updateMany({
      where: { systemKey: 'frequencia_outra' },
      data: { ordem: 3 }
    })
    
    await prisma.formularioPergunta.updateMany({
      where: { systemKey: 'frete' },
      data: { ordem: 4 }
    })
    
    await prisma.formularioPergunta.updateMany({
      where: { systemKey: 'local_unico' },
      data: { ordem: 5, tipo: 'sim_nao' }
    })
    
    await prisma.formularioPergunta.updateMany({
      where: { systemKey: 'pedido_minimo_cif' },
      data: { ordem: 6 }
    })
    
    await prisma.formularioPergunta.updateMany({
      where: { systemKey: 'cidade_uf' },
      data: { 
        ordem: 7,
        tipo: 'texto_longo',
        ajuda: 'Informe a(s) cidade(s) e UF. Para múltiplas cidades, separe por vírgula ou escreva "Lista de lojas"'
      }
    })

    console.log('   ✅ Campos atualizados\n')

    // 4. Verificar resultado final
    console.log('4️⃣ Verificando campos ativos da etapa ENTREGAS:')
    const camposAtivos = await prisma.formularioPergunta.findMany({
      where: {
        formularioEtapaId: etapaEntregas.id,
        ativo: true
      },
      select: {
        systemKey: true,
        titulo: true,
        tipo: true,
        ordem: true,
        ajuda: true
      },
      orderBy: { ordem: 'asc' }
    })

    console.log('\n📋 Campos ativos (em ordem):')
    camposAtivos.forEach((campo, index) => {
      console.log(`\n   ${index + 1}. ${campo.titulo} (${campo.systemKey})`)
      console.log(`      Tipo: ${campo.tipo} | Ordem: ${campo.ordem}`)
      console.log(`      Ajuda: ${campo.ajuda}`)
    })

    console.log('\n\n✅ Reorganização concluída com sucesso!')
  } catch (error) {
    console.error('❌ Erro:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
