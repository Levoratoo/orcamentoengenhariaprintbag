#!/usr/bin/env node
/**
 * Script para mover o campo "Quantidade" da etapa ENTREGAS para a etapa PRODUTO
 * 
 * Execução:
 *   node scripts/move-quantidade-to-produto.mjs
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Movendo campo "Quantidade" de ENTREGAS para PRODUTO...\n')

  try {
    // 1. Buscar etapas
    const etapaEntregas = await prisma.formularioEtapa.findFirst({
      where: { codigo: 'entregas' },
      include: { perguntas: true }
    })

    const etapaProduto = await prisma.formularioEtapa.findFirst({
      where: { codigo: 'produto' },
      include: { perguntas: true }
    })

    if (!etapaEntregas || !etapaProduto) {
      throw new Error('Etapas não encontradas')
    }

    // 2. Desativar campo "Quantidade" da etapa ENTREGAS
    const campoQuantidadeEntregas = etapaEntregas.perguntas.find(
      p => p.systemKey === 'quantidade_orcamento'
    )

    if (campoQuantidadeEntregas) {
      await prisma.formularioPergunta.update({
        where: { id: campoQuantidadeEntregas.id },
        data: {
          ativo: false,
          ordem: 99
        }
      })
      console.log('✅ Campo "Quantidade" desativado na etapa ENTREGAS')
    } else {
      console.log('ℹ️  Campo "Quantidade" não encontrado na etapa ENTREGAS')
    }

    // 3. Verificar se já existe campo "Quantidade" na etapa PRODUTO
    const campoQuantidadeProduto = etapaProduto.perguntas.find(
      p => p.systemKey === 'quantidade_orcamento'
    )

    if (campoQuantidadeProduto) {
      // Se já existe, apenas ativar e ajustar
      await prisma.formularioPergunta.update({
        where: { id: campoQuantidadeProduto.id },
        data: {
          ativo: true,
          obrigatorio: true,
          ordem: 3,
          campoMapeado: 'produto.quantidade'
        }
      })
      console.log('✅ Campo "Quantidade" atualizado na etapa PRODUTO')
    } else {
      // Se não existe, criar
      await prisma.formularioPergunta.create({
        data: {
          formularioEtapaId: etapaProduto.id,
          titulo: 'Quantidade',
          tipo: 'texto_curto',
          obrigatorio: true,
          ordem: 3,
          ativo: true,
          isSystem: true,
          systemKey: 'quantidade_orcamento',
          campoMapeado: 'produto.quantidade',
          ajuda: 'Informe as quantidades para orçamento. Separe por vírgula (ex: 3000, 4000, 6000)'
        }
      })
      console.log('✅ Campo "Quantidade" criado na etapa PRODUTO')
    }

    console.log('\n✅ Migração concluída com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao mover campo:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
