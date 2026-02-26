// API para gerenciar uma pergunta específica
// GET: detalhes da pergunta
// PUT: atualizar pergunta
// DELETE: deletar pergunta (não permitido para perguntas essenciais do sistema)

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verificarAutenticacao } from "@/lib/auth"

// Perguntas essenciais que não podem ser removidas
const PERGUNTAS_ESSENCIAIS = ["produto", "modelo", "quantidade"]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar autenticação
  const autenticado = await verificarAutenticacao()
  if (!autenticado) {
    return NextResponse.json(
      { erro: "Não autorizado" },
      { status: 401 }
    )
  }

  try {
    const pergunta = await prisma.formularioPergunta.findUnique({
      where: { id: params.id },
      include: {
        formularioEtapa: true,
      },
    })

    if (!pergunta) {
      return NextResponse.json(
        { erro: "Pergunta não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(pergunta)
  } catch (error: any) {
    console.error("Erro ao buscar pergunta:", error)
    return NextResponse.json(
      { erro: "Erro ao buscar pergunta", detalhes: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar autenticação
  const autenticado = await verificarAutenticacao()
  if (!autenticado) {
    return NextResponse.json(
      { erro: "Não autorizado" },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const {
      titulo,
      ajuda,
      tipo,
      obrigatorio,
      ordem,
      opcoes,
      configuracao,
      campoMapeado,
      ativo,
    } = body

    // Verificar se a pergunta existe
    const perguntaExistente = await prisma.formularioPergunta.findUnique({
      where: { id: params.id },
    })

    if (!perguntaExistente) {
      return NextResponse.json(
        { erro: "Pergunta não encontrada" },
        { status: 404 }
      )
    }

    const pergunta = await prisma.formularioPergunta.update({
      where: { id: params.id },
      data: {
        ...(titulo !== undefined && { titulo }),
        ...(ajuda !== undefined && { ajuda }),
        ...(tipo !== undefined && { tipo }),
        ...(obrigatorio !== undefined && { obrigatorio }),
        ...(ordem !== undefined && { ordem: parseInt(ordem) }),
        ...(opcoes !== undefined && { opcoes }),
        ...(configuracao !== undefined && { configuracao }),
        ...(campoMapeado !== undefined && { campoMapeado }),
        ...(ativo !== undefined && { ativo }),
      },
      include: {
        formularioEtapa: true,
      },
    })

    return NextResponse.json(pergunta)
  } catch (error: any) {
    console.error("Erro ao atualizar pergunta:", error)
    return NextResponse.json(
      { erro: "Erro ao atualizar pergunta", detalhes: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar autenticação
  const autenticado = await verificarAutenticacao()
  if (!autenticado) {
    return NextResponse.json(
      { erro: "Não autorizado" },
      { status: 401 }
    )
  }

  try {
    const pergunta = await prisma.formularioPergunta.findUnique({
      where: { id: params.id },
    })

    if (!pergunta) {
      return NextResponse.json(
        { erro: "Pergunta não encontrada" },
        { status: 404 }
      )
    }

    // Não permitir deletar perguntas do sistema
    if (pergunta.isSystem) {
      // Verificar se é pergunta essencial
      const isEssencial = pergunta.systemKey && PERGUNTAS_ESSENCIAIS.includes(pergunta.systemKey)
      
      if (isEssencial) {
        return NextResponse.json(
          { 
            erro: "Não é possível remover esta pergunta",
            mensagem: "Esta pergunta é importante para o pedido. Se desligar, o formulário pode ficar incompleto.",
            sugestao: "Você pode desativar a pergunta em vez de removê-la"
          },
          { status: 400 }
        )
      }

      // Para perguntas do sistema não essenciais, permitir desativar mas não deletar
      return NextResponse.json(
        { 
          erro: "Não é possível remover perguntas do sistema",
          sugestao: "Você pode desativar a pergunta em vez de removê-la"
        },
        { status: 400 }
      )
    }

    await prisma.formularioPergunta.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ sucesso: true })
  } catch (error: any) {
    console.error("Erro ao deletar pergunta:", error)
    return NextResponse.json(
      { erro: "Erro ao deletar pergunta", detalhes: error.message },
      { status: 500 }
    )
  }
}







