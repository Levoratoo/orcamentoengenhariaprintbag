import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando status dos campos Royalties e BV Agência...\n')

  const campos = await prisma.formularioPergunta.findMany({
    where: {
      systemKey: {
        in: ['royalties', 'bv_agencia']
      }
    },
    select: {
      id: true,
      systemKey: true,
      titulo: true,
      obrigatorio: true,
      ativo: true
    }
  })

  console.log('📋 Status atual:')
  campos.forEach(campo => {
    console.log(`\n   ${campo.titulo} (${campo.systemKey}):`)
    console.log(`     ID: ${campo.id}`)
    console.log(`     Obrigatório: ${campo.obrigatorio} ${campo.obrigatorio ? '❌' : '✅'}`)
    console.log(`     Ativo: ${campo.ativo}`)
  })
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
