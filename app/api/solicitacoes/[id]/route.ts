// API para buscar detalhes de uma solicitação específica

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: params.id },
      include: {
        itens: {
          include: {
            produtoTipo: true,
            produtoModelo: true,
            formatoPadrao: true,
            substrato: true,
            alcaTipo: true,
            impressaoModo: true,
            impressaoCombinacao: true,
            acondicionamento: true,
            modulo: true,
            enobrecimentos: {
              include: {
                enobrecimentoTipo: true,
              },
            },
          },
        },
      },
    })

    if (!solicitacao) {
      return NextResponse.json(
        { erro: "Solicitação não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(solicitacao)
  } catch (error: any) {
    console.error("Erro ao buscar solicitação:", error)
    return NextResponse.json(
      { erro: "Erro ao buscar solicitação", detalhes: error.message },
      { status: 500 }
    )
  }
}







