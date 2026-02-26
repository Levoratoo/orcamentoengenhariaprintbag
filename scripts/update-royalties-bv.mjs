import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Atualizando campos Royalties e BV Agência...\n')

  try {
    // Atualizar campos para não obrigatório
    console.log('1️⃣ Removendo obrigatoriedade dos campos...')
    const atualizado = await prisma.formularioPergunta.updateMany({
      where: {
        systemKey: {
          in: ['royalties', 'bv_agencia']
        }
      },
      data: {
        obrigatorio: false
      }
    })
    console.log(`   ✅ ${atualizado.count} campos atualizados\n`)

    // Verificar os campos atualizados
    console.log('2️⃣ Verificando campos atualizados:')
    const campos = await prisma.formularioPergunta.findMany({
      where: {
        systemKey: {
          in: ['royalties', 'bv_agencia']
        }
      },
      select: {
        systemKey: true,
        titulo: true,
        obrigatorio: true,
        ajuda: true
      },
      orderBy: {
        systemKey: 'asc'
      }
    })

    console.log('\n📋 Campos:')
    campos.forEach(campo => {
      console.log(`\n   • ${campo.systemKey}`)
      console.log(`     Título: ${campo.titulo}`)
      console.log(`     Obrigatório: ${campo.obrigatorio}`)
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
