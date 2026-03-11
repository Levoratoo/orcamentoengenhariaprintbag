// API para gerenciar uma etapa específica
// GET: detalhes da etapa
// PUT: atualizar etapa
// DELETE: deletar etapa (não permitido para etapas do sistema)

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verificarAutenticacao } from "@/lib/auth"

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
    const etapa = await prisma.formularioEtapa.findUnique({
      where: { id: params.id },
      include: {
        perguntas: {
          orderBy: {
            ordem: "asc",
          },
        },
      },
    })

    if (!etapa) {
      return NextResponse.json(
        { erro: "Etapa não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(etapa)
  } catch (error: any) {
    console.error("Erro ao buscar etapa:", error)
    return NextResponse.json(
      { erro: "Erro ao buscar etapa", detalhes: error.message },
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
    const { nome, descricao, ordem, ativo } = body

    // Verificar se a etapa existe
    const etapaExistente = await prisma.formularioEtapa.findUnique({
      where: { id: params.id },
    })

    if (!etapaExistente) {
      return NextResponse.json(
        { erro: "Etapa não encontrada" },
        { status: 404 }
      )
    }

    const etapa = await prisma.formularioEtapa.update({
      where: { id: params.id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(ordem !== undefined && { ordem: parseInt(ordem) }),
        ...(ativo !== undefined && { ativo }),
      },
      include: {
        perguntas: {
          orderBy: {
            ordem: "asc",
          },
        },
      },
    })

    return NextResponse.json(etapa)
  } catch (error: any) {
    console.error("Erro ao atualizar etapa:", error)
    return NextResponse.json(
      { erro: "Erro ao atualizar etapa", detalhes: error.message },
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
    const etapa = await prisma.formularioEtapa.findUnique({
      where: { id: params.id },
    })

    if (!etapa) {
      return NextResponse.json(
        { erro: "Etapa não encontrada" },
        { status: 404 }
      )
    }

    // Não permitir deletar etapas do sistema
    if (etapa.isSystem) {
      return NextResponse.json(
        { 
          erro: "Não é possível remover etapas do sistema",
          sugestao: "Você pode desativar a etapa em vez de removê-la"
        },
        { status: 400 }
      )
    }

    await prisma.formularioEtapa.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ sucesso: true })
  } catch (error: any) {
    console.error("Erro ao deletar etapa:", error)
    return NextResponse.json(
      { erro: "Erro ao deletar etapa", detalhes: error.message },
      { status: 500 }
    )
  }
}







