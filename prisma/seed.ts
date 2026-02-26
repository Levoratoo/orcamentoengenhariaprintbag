// Script para popular o banco de dados com dados iniciais do catálogo
// Execute com: npx tsx prisma/seed.ts

import { PrismaClient } from "@prisma/client"
import catalogoData from "../data/catalogo-completo.json"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...")

  // Limpar dados existentes (cuidado em produção!)
  console.log("🧹 Limpando dados existentes...")
  await prisma.solicitacaoEnobrecimento.deleteMany()
  await prisma.solicitacaoItem.deleteMany()
  await prisma.solicitacao.deleteMany()
  await prisma.formularioPergunta.deleteMany()
  await prisma.formularioEtapa.deleteMany()
  await prisma.modeloEnobrecimentoPermitido.deleteMany()
  await prisma.modeloAcondicionamentoPermitido.deleteMany()
  await prisma.modeloFormatoPermitido.deleteMany()
  await prisma.modeloImpressaoPermitida.deleteMany()
  await prisma.modeloSubstratoPermitido.deleteMany()
  await prisma.produtoModelo.deleteMany()
  await prisma.produtoTipo.deleteMany()
  await prisma.formatoPadrao.deleteMany()
  await prisma.substrato.deleteMany()
  await prisma.impressaoCombinacao.deleteMany()
  await prisma.impressaoModo.deleteMany()
  await prisma.enobrecimentoTipo.deleteMany()
  await prisma.alcaTipo.deleteMany()
  await prisma.acondicionamento.deleteMany()
  await prisma.modulo.deleteMany()

  const catalogo = catalogoData as any

  // Criar Tipos de Produto e Modelos
  console.log("📦 Criando tipos de produto e modelos...")
  for (const tipoData of catalogo.produtoTipos) {
    const tipo = await prisma.produtoTipo.create({
      data: {
        id: tipoData.id,
        codigo: tipoData.codigo,
        nome: tipoData.nome,
        descricao: tipoData.descricao,
      },
    })

    for (const modeloData of tipoData.modelos) {
      await prisma.produtoModelo.create({
        data: {
          id: modeloData.id,
          produtoTipoId: tipo.id,
          codigo: modeloData.codigo,
          nome: modeloData.nome,
          descricao: modeloData.descricao,
          permiteAlca: modeloData.permiteAlca,
        },
      })
    }
  }

  // Criar Formatos Padrão
  console.log("📐 Criando formatos padrão...")
  for (const formatoData of catalogo.formatosPadrao) {
    await prisma.formatoPadrao.create({
      data: {
        id: formatoData.id,
        codigo: formatoData.codigo,
        nome: formatoData.nome,
        largura: formatoData.largura,
        altura: formatoData.altura,
        lateral: formatoData.lateral,
        aceitaDesenvolvimento: formatoData.aceitaDesenvolvimento,
      },
    })
  }

  // Criar Substratos
  console.log("📄 Criando substratos...")
  for (const substratoData of catalogo.substratos) {
    await prisma.substrato.create({
      data: {
        id: substratoData.id,
        codigo: substratoData.codigo,
        nome: substratoData.nome,
        descricao: substratoData.descricao,
        gramagens: substratoData.gramagens,
        exigeLaminacao: substratoData.exigeLaminacao,
      },
    })
  }

  // Criar Modos de Impressão e Combinações
  console.log("🖨️ Criando modos de impressão...")
  for (const modoData of catalogo.impressaoModos) {
    const modo = await prisma.impressaoModo.create({
      data: {
        id: modoData.id,
        codigo: modoData.codigo,
        nome: modoData.nome,
        descricao: modoData.descricao,
      },
    })

    for (const combinacaoData of modoData.combinacoes) {
      await prisma.impressaoCombinacao.create({
        data: {
          id: combinacaoData.id,
          impressaoModoId: modo.id,
          codigo: combinacaoData.codigo,
          nome: combinacaoData.nome,
          descricao: combinacaoData.descricao,
          camadas: combinacaoData.camadas,
        },
      })
    }
  }

  // Criar Tipos de Enobrecimento
  console.log("✨ Criando tipos de enobrecimento...")
  for (const enobData of catalogo.enobrecimentoTipos) {
    await prisma.enobrecimentoTipo.create({
      data: {
        id: enobData.id,
        codigo: enobData.codigo,
        nome: enobData.nome,
        descricao: enobData.descricao,
      },
    })
  }

  // Criar Tipos de Alça
  console.log("🎒 Criando tipos de alça...")
  for (const alcaData of catalogo.alcaTipos) {
    await prisma.alcaTipo.create({
      data: {
        id: alcaData.id,
        codigo: alcaData.codigo,
        nome: alcaData.nome,
        descricao: alcaData.descricao,
      },
    })
  }

  // Criar Acondicionamentos
  console.log("📦 Criando acondicionamentos...")
  for (const acondData of catalogo.acondicionamentos) {
    await prisma.acondicionamento.create({
      data: {
        id: acondData.id,
        codigo: acondData.codigo,
        nome: acondData.nome,
        descricao: acondData.descricao,
      },
    })
  }

  // Criar Módulos
  console.log("🔢 Criando módulos...")
  for (const moduloData of catalogo.modulos) {
    await prisma.modulo.create({
      data: {
        id: moduloData.id,
        codigo: moduloData.codigo,
        nome: moduloData.nome,
        quantidade: moduloData.quantidade,
      },
    })
  }

  // Criar Relações de Permissão
  console.log("🔗 Criando relações de permissão...")
  for (const tipoData of catalogo.produtoTipos) {
    for (const modeloData of tipoData.modelos) {
      const modelo = await prisma.produtoModelo.findUnique({
        where: { id: modeloData.id },
      })

      if (!modelo) continue

      // Substratos permitidos
      for (const substratoId of modeloData.substratosPermitidos || []) {
        const substrato = await prisma.substrato.findUnique({ where: { id: substratoId } })
        if (!substrato) {
          console.warn(`⚠️ Substrato ${substratoId} não encontrado, pulando...`)
          continue
        }
        await prisma.modeloSubstratoPermitido.create({
          data: {
            produtoModeloId: modelo.id,
            substratoId,
          },
        })
      }

      // Impressões permitidas
      for (const impressaoId of modeloData.impressoesPermitidas || []) {
        const impressao = await prisma.impressaoModo.findUnique({ where: { id: impressaoId } })
        if (!impressao) {
          console.warn(`⚠️ Impressão ${impressaoId} não encontrada, pulando...`)
          continue
        }
        await prisma.modeloImpressaoPermitida.create({
          data: {
            produtoModeloId: modelo.id,
            impressaoModoId: impressaoId,
          },
        })
      }

      // Enobrecimentos permitidos
      for (const enobId of modeloData.enobrecimentosPermitidos || []) {
        const enob = await prisma.enobrecimentoTipo.findUnique({ where: { id: enobId } })
        if (!enob) {
          console.warn(`⚠️ Enobrecimento ${enobId} não encontrado, pulando...`)
          continue
        }
        await prisma.modeloEnobrecimentoPermitido.create({
          data: {
            produtoModeloId: modelo.id,
            enobrecimentoTipoId: enobId,
          },
        })
      }

      // Acondicionamentos permitidos
      for (const acondId of modeloData.acondicionamentosPermitidos || []) {
        const acond = await prisma.acondicionamento.findUnique({ where: { id: acondId } })
        if (!acond) {
          console.warn(`⚠️ Acondicionamento ${acondId} não encontrado, pulando...`)
          continue
        }
        await prisma.modeloAcondicionamentoPermitido.create({
          data: {
            produtoModeloId: modelo.id,
            acondicionamentoId: acondId,
          },
        })
      }

      // Formatos permitidos
      for (const formatoId of modeloData.formatosPermitidos || []) {
        const formato = await prisma.formatoPadrao.findUnique({ where: { id: formatoId } })
        if (!formato) {
          console.warn(`⚠️ Formato ${formatoId} não encontrado, pulando...`)
          continue
        }
        await prisma.modeloFormatoPermitido.create({
          data: {
            produtoModeloId: modelo.id,
            formatoPadraoId: formatoId,
          },
        })
      }
    }
  }

  // Criar Etapas e Perguntas Base do Formulário
  console.log("📋 Criando etapas e perguntas base do formulário...")
  
  // Etapa 1: Dados do pedido
  const etapa1 = await prisma.formularioEtapa.create({
    data: {
      codigo: "dados_pedido",
      nome: "Dados do Pedido",
      ordem: 1,
      isSystem: true,
      perguntas: {
        create: [
          {
            titulo: "Vendedor",
            tipo: "texto_curto",
            obrigatorio: true,
            ordem: 1,
            isSystem: true,
            systemKey: "vendedor",
            campoMapeado: "dadosGerais.vendedor",
            ajuda: "Nome completo da pessoa responsável pelo pedido",
          },
          {
            titulo: "Marca",
            tipo: "texto_curto",
            obrigatorio: true,
            ordem: 2,
            isSystem: true,
            systemKey: "marca",
            campoMapeado: "dadosGerais.marca",
            ajuda: "Nome da marca/cliente",
          },
          {
            titulo: "Contato",
            tipo: "texto_curto",
            obrigatorio: true,
            ordem: 3,
            isSystem: true,
            systemKey: "contato",
            campoMapeado: "dadosGerais.contato",
            ajuda: "Informação de contato (telefone/e-mail)",
          },
          {
            titulo: "Código Metrics",
            tipo: "texto_curto",
            obrigatorio: true,
            ordem: 4,
            isSystem: true,
            systemKey: "codigo_metrics",
            campoMapeado: "dadosGerais.codigoMetrics",
            ajuda: "Código do sistema Metrics (se houver)",
          },
          {
            titulo: "Empresa / Unidade",
            tipo: "texto_curto",
            obrigatorio: false,
            ordem: 5,
            isSystem: true,
            systemKey: "empresa",
            campoMapeado: "dadosGerais.empresa",
            ajuda: "Nome da empresa ou unidade que está fazendo o pedido",
            ativo: false,
          },
          {
            titulo: "Nome de quem está pedindo",
            tipo: "texto_curto",
            obrigatorio: false,
            ordem: 6,
            isSystem: true,
            systemKey: "nome_solicitante",
            campoMapeado: "dadosGerais.nomeSolicitante",
            ajuda: "Nome completo da pessoa responsável pelo pedido",
            ativo: false,
          },
          {
            titulo: "Observações",
            tipo: "texto_longo",
            obrigatorio: false,
            ordem: 10,
            isSystem: true,
            systemKey: "observacoes_gerais",
            campoMapeado: "dadosGerais.observacoesGerais",
            ajuda: "Observações gerais sobre o pedido",
          },
        ],
      },
    },
  })

  // Etapa 1.5: Condições de Venda
  const etapa1b = await prisma.formularioEtapa.create({
    data: {
      codigo: "condicoes_venda",
      nome: "Condições de Venda",
      ordem: 2,
      isSystem: true,
      perguntas: {
        create: [
          {
            titulo: "Tipo de Contrato",
            tipo: "lista_opcoes",
            obrigatorio: true,
            ordem: 1,
            isSystem: true,
            systemKey: "tipo_contrato",
            campoMapeado: "condicoesVenda.tipoContrato",
            ajuda: "Atenção! Boleto mínimo R$500,00",
            opcoes: ["PRG", "JIT"],
          },
          {
            titulo: "Imposto",
            tipo: "lista_opcoes",
            obrigatorio: true,
            ordem: 2,
            isSystem: true,
            systemKey: "imposto",
            campoMapeado: "condicoesVenda.imposto",
            ajuda: "Selecione o tipo de imposto",
            opcoes: ["ICMS - Consumo Próprio", "ICMS - Revenda", "ISS - Consumo Próprio"],
          },
          {
            titulo: "Condição de Pagamento",
            tipo: "lista_opcoes",
            obrigatorio: true,
            ordem: 3,
            isSystem: true,
            systemKey: "condicao_pagamento",
            campoMapeado: "condicoesVenda.condicaoPagamento",
            ajuda: "Selecione a condição de pagamento",
            opcoes: ["Depósito Antecipado", "7 dd", "15 dd", "28 dd", "30 dd", "45 dd", "60 dd", "30/45 dd", "30/60 dd", "30/45/60 dd", "Outra"],
          },
          {
            titulo: "Condição de Pagamento (Outra)",
            tipo: "texto_curto",
            obrigatorio: false,
            ordem: 4,
            isSystem: true,
            systemKey: "condicao_pagamento_outra",
            campoMapeado: "condicoesVenda.condicaoPagamentoOutra",
            ajuda: "Se selecionou 'Outra', informe aqui",
          },
          {
            titulo: "% Royalties",
            tipo: "texto_curto",
            obrigatorio: false,
            ordem: 5,
            isSystem: true,
            systemKey: "royalties",
            campoMapeado: "condicoesVenda.royalties",
            ajuda: "Informe o percentual de royalties ou 'Não há'",
          },
          {
            titulo: "BV Agência",
            tipo: "texto_curto",
            obrigatorio: false,
            ordem: 6,
            isSystem: true,
            systemKey: "bv_agencia",
            campoMapeado: "condicoesVenda.bvAgencia",
            ajuda: "Informe BV da agência ou 'Não há'",
          },
        ],
      },
    },
  })

  // Etapa 1.6: Entregas
  const etapa1c = await prisma.formularioEtapa.create({
    data: {
      codigo: "entregas",
      nome: "Entregas",
      ordem: 3,
      isSystem: true,
      perguntas: {
        create: [
          {
            titulo: "Nº de Entregas",
            tipo: "numero",
            obrigatorio: false,
            ordem: 1,
            isSystem: true,
            systemKey: "numero_entregas",
            campoMapeado: "entregas.numeroEntregas",
            ajuda: "Informe o número de entregas",
          },
          {
            titulo: "Frequência",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 2,
            isSystem: true,
            systemKey: "frequencia",
            campoMapeado: "entregas.frequencia",
            ajuda: "Frequência das entregas",
            opcoes: ["Única", "Semanal", "Quinzenal", "Mensal", "Bimestral", "Trimestral", "Quadrimestral", "Semestral", "Outra: Informar"],
          },
          {
            titulo: "Frequência (Outra)",
            tipo: "texto_curto",
            obrigatorio: false,
            ordem: 3,
            isSystem: true,
            systemKey: "frequencia_outra",
            campoMapeado: "entregas.frequenciaOutra",
            ajuda: "Informe a frequência desejada",
          },
          {
            titulo: "Frete",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 4,
            isSystem: true,
            systemKey: "frete",
            campoMapeado: "entregas.frete",
            ajuda: "Tipo de frete",
            opcoes: ["FOB - Contratação Transporte por CLIENTE", "CIF - Entrega por conta da PRINTBAG"],
          },
          {
            titulo: "Local Único",
            tipo: "sim_nao",
            obrigatorio: false,
            ordem: 5,
            isSystem: true,
            systemKey: "local_unico",
            campoMapeado: "entregas.localUnico",
            ajuda: "A entrega será em um único local?",
          },
          {
            titulo: "Pedido Mínimo CIF",
            tipo: "texto_curto",
            obrigatorio: false,
            ordem: 6,
            isSystem: true,
            systemKey: "pedido_minimo_cif",
            campoMapeado: "entregas.pedidoMinimoCIF",
            ajuda: "Informe o pedido mínimo CIF (apenas se Local Único = Não)",
          },
          {
            titulo: "Cidade(s)/UF",
            tipo: "texto_longo",
            obrigatorio: false,
            ordem: 7,
            isSystem: true,
            systemKey: "cidade_uf",
            campoMapeado: "entregas.cidadeUF",
            ajuda: "Informe a(s) cidade(s) e UF. Para múltiplas cidades, separe por vírgula ou escreva 'Lista de lojas'",
          },
          // Campo Quantidade movido para etapa PRODUTO
          // Campos legados (desativados)
          {
            titulo: "Quantidade (Local Único)",
            tipo: "numero",
            obrigatorio: false,
            ordem: 99,
            ativo: false,
            isSystem: true,
            systemKey: "qtd_local_unico",
            campoMapeado: "entregas.quantidadeLocalUnico",
            ajuda: "Campo removido",
          },
          {
            titulo: "Cidades/UF (Múltiplas)",
            tipo: "texto_longo",
            obrigatorio: false,
            ordem: 99,
            ativo: false,
            isSystem: true,
            systemKey: "cidades_uf_multiplas",
            campoMapeado: "entregas.cidadesUFMultiplas",
            ajuda: "Campo removido",
          },
          {
            titulo: "Anexar Lista de Lojas",
            tipo: "booleano",
            obrigatorio: false,
            ordem: 99,
            ativo: false,
            isSystem: true,
            systemKey: "anexar_lista_lojas",
            campoMapeado: "entregas.anexarListaLojas",
            ajuda: "Campo removido",
          },
          {
            titulo: "Quantidades (Frete)",
            tipo: "texto_curto",
            obrigatorio: false,
            ordem: 99,
            ativo: false,
            isSystem: true,
            systemKey: "frete_quantidade",
            campoMapeado: "entregas.freteQuantidades",
            ajuda: "Campo removido - usar 'Quantidade' ao invés",
          },
        ],
      },
    },
  })

  // Etapa 4: Produto
  const etapa2 = await prisma.formularioEtapa.create({
    data: {
      codigo: "produto",
      nome: "Produto",
      ordem: 4,
      isSystem: true,
      perguntas: {
        create: [
          {
            titulo: "TIPO",
            tipo: "lista_produtos",
            obrigatorio: true,
            ordem: 1,
            isSystem: true,
            systemKey: "produto",
            campoMapeado: "produto.produtoTipoId",
            ajuda: "Selecione o tipo de produto desejado",
          },
          {
            titulo: "Modelo",
            tipo: "lista_modelos",
            obrigatorio: true,
            ordem: 2,
            isSystem: true,
            systemKey: "modelo",
            campoMapeado: "produto.produtoModeloId",
            ajuda: "Selecione o modelo do produto (depende do produto selecionado)",
          },
          {
            titulo: "Quantidade",
            tipo: "texto_curto",
            obrigatorio: true,
            ordem: 3,
            isSystem: true,
            systemKey: "quantidade_orcamento",
            campoMapeado: "produto.quantidade",
            ajuda: "Informe as quantidades para orçamento. Separe por vírgula (ex: 3000, 4000, 6000)",
          },
        ],
      },
    },
  })

  // Etapa 5: Tamanho
  const etapa3 = await prisma.formularioEtapa.create({
    data: {
      codigo: "tamanho",
      nome: "Tamanho",
      ordem: 5,
      isSystem: true,
      perguntas: {
        create: [
          {
            titulo: "Formatos",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 1,
            isSystem: true,
            systemKey: "formato_padrao",
            campoMapeado: "formato.formatoPadraoId",
            ajuda: "Selecione um formato padrão ou informe medidas customizadas",
            ativo: true,
          },
          {
            titulo: "LARGURA",
            tipo: "numero",
            obrigatorio: false,
            ordem: 2,
            isSystem: true,
            systemKey: "largura",
            campoMapeado: "formato.formatoCustom.largura",
            ajuda: "Largura em milímetros",
            ativo: true,
          },
          {
            titulo: "ALTURA",
            tipo: "numero",
            obrigatorio: false,
            ordem: 3,
            isSystem: true,
            systemKey: "altura",
            campoMapeado: "formato.formatoCustom.altura",
            ajuda: "Altura em milímetros",
            ativo: true,
          },
          {
            titulo: "SANFONA",
            tipo: "numero",
            obrigatorio: false,
            ordem: 4,
            isSystem: true,
            systemKey: "sanfona",
            campoMapeado: "formato.formatoCustom.sanfona",
            ajuda: "Sanfona em milímetros (se aplicável)",
            ativo: false,
          },
          {
            titulo: "Outro (Desenvolvimento)",
            tipo: "texto_curto",
            obrigatorio: false,
            ordem: 5,
            isSystem: true,
            systemKey: "formato_custom",
            campoMapeado: "formato.formatoCustom",
            ajuda: "Informe medidas customizadas se não houver formato padrão",
            ativo: false,
          },
        ],
      },
    },
  })

  // Etapa 6: Material
  const etapa4 = await prisma.formularioEtapa.create({
    data: {
      codigo: "material",
      nome: "Material",
      ordem: 6,
      isSystem: true,
      perguntas: {
        create: [
          {
            titulo: "Papel",
            tipo: "lista_opcoes",
            obrigatorio: true,
            ordem: 1,
            isSystem: true,
            systemKey: "substrato",
            campoMapeado: "substrato.substratoId",
            ajuda: "Selecione o tipo de substrato/material",
          },
          {
            titulo: "Gramatura",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 2,
            isSystem: true,
            systemKey: "gramagem",
            campoMapeado: "substrato.substratoGramagem",
            ajuda: "Gramatura do papel em g/m²",
          },
          {
            titulo: "Substrato",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 3,
            isSystem: true,
            systemKey: "substrato_alternativo",
            campoMapeado: "substrato.substratoAlternativo",
            ajuda: "Outro tipo de substrato (se aplicável)",
            ativo: false,
          },
          {
            titulo: "Observação técnica do material",
            tipo: "texto_longo",
            obrigatorio: false,
            ordem: 4,
            isSystem: true,
            systemKey: "observacoes_material",
            campoMapeado: "substrato.observacoes",
            ajuda: "Observações técnicas sobre o material",
            ativo: false,
          },
        ],
      },
    },
  })

  // Etapa 7: Alça e detalhes
  const etapa5 = await prisma.formularioEtapa.create({
    data: {
      codigo: "alca_detalhes",
      nome: "Alça e detalhes",
      ordem: 7,
      isSystem: true,
      perguntas: {
        create: [
          {
            titulo: "Alça",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 1,
            isSystem: true,
            systemKey: "tipo_alca",
            campoMapeado: "alca.tipoId",
            ajuda: "Selecione o tipo de alça (se aplicável ao produto)",
            ativo: true,
          },
          {
            titulo: "Aplicação",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 2,
            isSystem: true,
            systemKey: "aplicacao_alca",
            campoMapeado: "alca.aplicacao",
            ajuda: "Tipo de aplicação da alça (ex: C/ Ponteira, Colada, etc.)",
            ativo: false,
          },
          {
            titulo: "Largura",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 3,
            isSystem: true,
            systemKey: "largura_alca",
            campoMapeado: "alca.largura",
            ajuda: "Largura da alça (ex: 1,0 1,5 2,0 2,5 3,0)",
            ativo: false,
          },
          {
            titulo: "Comprimento",
            tipo: "numero",
            obrigatorio: false,
            ordem: 4,
            isSystem: true,
            systemKey: "comprimento_alca",
            campoMapeado: "alca.comprimento",
            ajuda: "Informe o comprimento da alça",
            ativo: false,
          },
          {
            titulo: "Unidade do Comprimento",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 5,
            isSystem: true,
            systemKey: "unidade_comprimento_alca",
            campoMapeado: "alca.unidadeComprimento",
            ajuda: "Selecione a unidade de medida",
            opcoes: ["cm", "m"],
            ativo: false,
          },
          {
            titulo: "Cor",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 6,
            isSystem: true,
            systemKey: "cor_alca",
            campoMapeado: "alca.cor",
            ajuda: "Cor da alça (Branca, Preta, Colorida)",
            ativo: false,
          },
        ],
      },
    },
  })

  // Etapa 8: Impressão
  const etapa6 = await prisma.formularioEtapa.create({
    data: {
      codigo: "impressao",
      nome: "Impressão",
      ordem: 8,
      isSystem: true,
      perguntas: {
        create: [
          {
            titulo: "Impressão",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 1,
            isSystem: true,
            systemKey: "tipo_impressao",
            campoMapeado: "impressao.modoId",
            ajuda: "Selecione o modo de impressão (Preto Branco, CMYK, Pantone, etc.)",
            ativo: true,
          },
          {
            titulo: "Qntd de Cores",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 2,
            isSystem: true,
            systemKey: "combinacao_cores",
            campoMapeado: "impressao.combinacaoId",
            ajuda: "Selecione a combinação de cores (ex: 1x0, 2x0, 4x0, 1x1, 2x2, etc.)",
            ativo: true,
          },
          {
            titulo: "% Impressão Externa",
            tipo: "numero",
            obrigatorio: false,
            ordem: 3,
            isSystem: true,
            systemKey: "percentual_externo",
            campoMapeado: "impressao.percentualExterna",
            ajuda: "Percentual de impressão externa (0 a 100%)",
            ativo: false,
          },
          {
            titulo: "% Impressão Interna",
            tipo: "numero",
            obrigatorio: false,
            ordem: 4,
            isSystem: true,
            systemKey: "percentual_interno",
            campoMapeado: "impressao.percentualInterna",
            ajuda: "Percentual de impressão interna (0 a 100%)",
            ativo: false,
          },
          {
            titulo: "Detalhar",
            tipo: "texto_longo",
            obrigatorio: false,
            ordem: 5,
            isSystem: true,
            systemKey: "detalhar_impressao",
            campoMapeado: "impressao.detalhar",
            ajuda: "Detalhes adicionais sobre a impressão",
            ativo: false,
          },
          {
            titulo: "Observações da impressão",
            tipo: "texto_longo",
            obrigatorio: false,
            ordem: 6,
            isSystem: true,
            systemKey: "observacoes_impressao",
            campoMapeado: "impressao.observacoes",
            ajuda: "Observações sobre a impressão",
            ativo: false,
          },
        ],
      },
    },
  })

  // Etapa 9: Acabamentos
  const etapa7 = await prisma.formularioEtapa.create({
    data: {
      codigo: "acabamentos",
      nome: "Acabamentos",
      ordem: 9,
      isSystem: true,
      perguntas: {
        create: [
          {
            titulo: "Acabamentos",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 1,
            isSystem: true,
            systemKey: "tipo_acabamento",
            campoMapeado: "acabamentos.tipoId",
            ajuda: "Selecione o tipo de acabamento",
            ativo: false, // Desativado - acabamentos já são exibidos como checkboxes individuais
          },
          {
            titulo: "Reforço de fundo",
            tipo: "booleano",
            obrigatorio: false,
            ordem: 2,
            isSystem: true,
            systemKey: "reforco_fundo",
            campoMapeado: "acabamentos.reforcoFundo",
            ajuda: "Informe se deseja reforço de fundo",
            opcoes: [],
            ativo: true,
          },
          {
            titulo: "Boca de palhaço",
            tipo: "booleano",
            obrigatorio: false,
            ordem: 4,
            isSystem: true,
            systemKey: "boca_palhaco",
            campoMapeado: "acabamentos.bocaPalhaco",
            ajuda: "Informe se deseja boca de palhaço",
            opcoes: [],
            ativo: true,
          },
          {
            titulo: "Furo de Fita",
            tipo: "booleano",
            obrigatorio: false,
            ordem: 5,
            isSystem: true,
            systemKey: "furo_fita",
            campoMapeado: "acabamentos.furoFita",
            ajuda: "Informe se deseja furo de fita",
            opcoes: [],
            ativo: true,
          },
          {
            titulo: "Dupla face",
            tipo: "booleano",
            obrigatorio: false,
            ordem: 6,
            isSystem: true,
            systemKey: "dupla_face",
            campoMapeado: "acabamentos.duplaFace",
            ajuda: "Informe se deseja dupla face",
            opcoes: [],
            ativo: true,
          },
          {
            titulo: "Velcro",
            tipo: "booleano",
            obrigatorio: false,
            ordem: 7,
            isSystem: true,
            systemKey: "velcro",
            campoMapeado: "acabamentos.velcro",
            ajuda: "Informe se deseja velcro",
            opcoes: [],
            ativo: true,
          },
        ],
      },
    },
  })

  // Etapa 10: Enobrecimentos
  const etapa8_enob = await prisma.formularioEtapa.create({
    data: {
      codigo: "enobrecimentos",
      nome: "Enobrecimentos",
      ordem: 10,
      isSystem: true,
      perguntas: {
        create: [
          {
            titulo: "Enobrecimentos",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 1,
            isSystem: true,
            systemKey: "tipo_enobrecimento",
            campoMapeado: "enobrecimentos.tipoId",
            ajuda: "Selecione o tipo de enobrecimento (Hot Stamping, Relevo, Gofragem, Laminação, Verniz UV)",
            ativo: true,
          },
          {
            titulo: "Cor",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 2,
            isSystem: true,
            systemKey: "cor_enobrecimento",
            campoMapeado: "enobrecimentos.cor",
            ajuda: "Cor do enobrecimento (Ouro, Prata, Preto, etc.)",
            ativo: false,
          },
          {
            titulo: "Tamanho",
            tipo: "texto_curto",
            obrigatorio: false,
            ordem: 3,
            isSystem: true,
            systemKey: "tamanho_enobrecimento",
            campoMapeado: "enobrecimentos.tamanho",
            ajuda: "Tamanho do enobrecimento (informar)",
            ativo: false,
          },
          {
            titulo: "Tipo",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 4,
            isSystem: true,
            systemKey: "tipo_detalhe_enobrecimento",
            campoMapeado: "enobrecimentos.tipoDetalhe",
            ajuda: "Tipo específico (ex: Alto Relevo, Baixo Relevo, Padrão, Personalizada, Brilho, Fosco)",
            ativo: false,
          },
          {
            titulo: "Modelo",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 5,
            isSystem: true,
            systemKey: "modelo_enobrecimento",
            campoMapeado: "enobrecimentos.modelo",
            ajuda: "Modelo do enobrecimento",
            ativo: false,
          },
          {
            titulo: "Detalhar",
            tipo: "texto_longo",
            obrigatorio: false,
            ordem: 6,
            isSystem: true,
            systemKey: "detalhar_enobrecimento",
            campoMapeado: "enobrecimentos.detalhar",
            ajuda: "Detalhes adicionais sobre o enobrecimento (ex: Logo, Total, etc.)",
            ativo: false,
          },
          {
            titulo: "Outro (Desenvolvimento)",
            tipo: "texto_curto",
            obrigatorio: false,
            ordem: 7,
            isSystem: true,
            systemKey: "outro_enobrecimento",
            campoMapeado: "enobrecimentos.outro",
            ajuda: "Outro tipo de enobrecimento (informar)",
            ativo: false,
          },
        ],
      },
    },
  })

  // Etapa 11: Acondicionamento (quantidade final)
  const etapa9 = await prisma.formularioEtapa.create({
    data: {
      codigo: "entrega_quantidade",
      nome: "Acondicionamento",
      ordem: 11,
      isSystem: true,
      perguntas: {
        create: [
          {
            titulo: "Quantidade",
            tipo: "numero",
            obrigatorio: true,
            ordem: 1,
            isSystem: true,
            systemKey: "quantidade",
            campoMapeado: "acondicionamento.quantidade",
            ajuda: "Quantidade total de unidades do pedido",
          },
          {
            titulo: "Acondicionamento",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 2,
            isSystem: true,
            systemKey: "acondicionamento",
            campoMapeado: "acondicionamento.tipoId",
            ajuda: "Selecione o tipo de acondicionamento (Pacote, Caixa de Papelão, Rolo, Cartela, etc.)",
            ativo: true,
          },
          {
            titulo: "Módulo",
            tipo: "lista_opcoes",
            obrigatorio: false,
            ordem: 3,
            isSystem: true,
            systemKey: "modulo",
            campoMapeado: "acondicionamento.moduloId",
            ajuda: "Módulo de quantidade (ex: Padrão 25un, 50un, 100un, 500un, 1000un, Definir melhor aproveitamento)",
            ativo: true,
          },
          {
            titulo: "Outro",
            tipo: "texto_curto",
            obrigatorio: false,
            ordem: 4,
            isSystem: true,
            systemKey: "outro_acondicionamento",
            campoMapeado: "acondicionamento.outro",
            ajuda: "Outro tipo de acondicionamento (informar)",
            ativo: false,
          },
          {
            titulo: "Outro (Desenvolvimento)",
            tipo: "texto_curto",
            obrigatorio: false,
            ordem: 5,
            isSystem: true,
            systemKey: "outro_desenvolvimento_acondicionamento",
            campoMapeado: "acondicionamento.outroDesenvolvimento",
            ajuda: "Outro tipo de acondicionamento que requer desenvolvimento (informar)",
            ativo: false,
          },
        ],
      },
    },
  })

  // Etapa 10: Revisão
  const etapa10 = await prisma.formularioEtapa.create({
    data: {
      codigo: "revisao",
      nome: "Revisão",
      ordem: 10,
      isSystem: true,
      perguntas: {
        create: [
          {
            titulo: "Confirmação",
            tipo: "texto_longo",
            obrigatorio: false,
            ordem: 1,
            isSystem: true,
            systemKey: "revisao",
            campoMapeado: "revisao.confirmacao",
            ajuda: "Revise todas as informações antes de enviar",
            ativo: true,
          },
        ],
      },
    },
  })

  console.log("✅ Seed concluído com sucesso!")
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




