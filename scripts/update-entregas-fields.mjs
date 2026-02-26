import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Atualizando campos da etapa de ENTREGAS...\n')

  try {
    // 1. Desativar campos removidos
    console.log('1️⃣ Desativando campos removidos...')
    const desativados = await prisma.formularioPergunta.updateMany({
      where: {
        systemKey: {
          in: ['qtd_local_unico', 'cidades_uf_multiplas', 'anexar_lista_lojas']
        }
      },
      data: {
        ativo: false
      }
    })
    console.log(`   ✅ ${desativados.count} campos desativados\n`)

    // 2. Atualizar campo Quantidades (Frete)
    console.log('2️⃣ Atualizando campo "Quantidades"...')
    const atualizado = await prisma.formularioPergunta.updateMany({
      where: {
        systemKey: 'frete_quantidade'
      },
      data: {
        titulo: 'Quantidades',
        tipo: 'texto_curto',
        ajuda: 'Informe a tiragem do produto para orçamento. Separe por vírgula.'
      }
    })
    console.log(`   ✅ ${atualizado.count} campo atualizado\n`)

    // 3. Verificar os campos atualizados
    console.log('3️⃣ Verificando campos atualizados:')
    const campos = await prisma.formularioPergunta.findMany({
      where: {
        systemKey: {
          in: ['qtd_local_unico', 'cidades_uf_multiplas', 'anexar_lista_lojas', 'frete_quantidade']
        }
      },
      select: {
        systemKey: true,
        titulo: true,
        tipo: true,
        ativo: true,
        ajuda: true
      },
      orderBy: {
        systemKey: 'asc'
      }
    })

    console.log('\n📋 Campos atualizados:')
    campos.forEach(campo => {
      console.log(`\n   • ${campo.systemKey}`)
      console.log(`     Título: ${campo.titulo}`)
      console.log(`     Tipo: ${campo.tipo}`)
      console.log(`     Ativo: ${campo.ativo}`)
      console.log(`     Ajuda: ${campo.ajuda}`)
    })

    console.log('\n\n✅ Atualização concluída com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao atualizar campos:', error)
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
