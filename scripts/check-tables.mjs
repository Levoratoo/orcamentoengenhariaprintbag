import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Verificando tabelas no banco...\n')
    
    // Verificar se existe alguma pergunta
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%pergunta%'
      ORDER BY table_name;
    `
    
    console.log('📋 Tabelas encontradas com "pergunta":', result)
    
    // Tentar contar perguntas
    const count = await prisma.$queryRaw`SELECT COUNT(*) as total FROM "FormularioPergunta";`
    console.log('\n📊 Total de perguntas:', count)
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
