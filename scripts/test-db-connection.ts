import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔄 Testando conexão com o banco...')
    await prisma.$connect()
    console.log('✅ Conexão estabelecida com sucesso!')
    
    const count = await prisma.formularioPergunta.count()
    console.log(`📊 Total de perguntas no banco: ${count}`)
  } catch (error) {
    console.error('❌ Erro ao conectar:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
