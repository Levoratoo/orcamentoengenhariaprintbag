import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Listando TODAS as tabelas do banco...\n')
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `
    
    console.log('📋 Tabelas encontradas:')
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`)
    })
    
    console.log(`\n📊 Total: ${tables.length} tabelas`)
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
