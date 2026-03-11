// API para listar e criar perguntas do formulário
// GET: lista todas as perguntas (opcionalmente filtradas por etapa)
// POST: cria uma nova pergunta

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verificarAutenticacao } from "@/lib/auth"

export async function GET(request: NextRequest) {
  // Verificar autenticação
  const autenticado = await verificarAutenticacao()
  if (!autenticado) {
    return NextResponse.json(
      { erro: "Não autorizado" },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const etapaId = searchParams.get("etapaId")

    const where = etapaId ? { formularioEtapaId: etapaId } : {}

    const perguntas = await prisma.formularioPergunta.findMany({
      where,
      include: {
        formularioEtapa: true,
      },
      orderBy: [
        { formularioEtapa: { ordem: "asc" } },
        { ordem: "asc" },
      ],
    })

    return NextResponse.json(perguntas)
  } catch (error: any) {
    console.error("Erro ao buscar perguntas:", error)
    return NextResponse.json(
      { erro: "Erro ao buscar perguntas", detalhes: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      formularioEtapaId,
      titulo,
      ajuda,
      tipo,
      obrigatorio,
      ordem,
      opcoes,
      configuracao,
      campoMapeado,
      ativo = true,
    } = body

    if (!formularioEtapaId || !titulo || !tipo || ordem === undefined) {
      return NextResponse.json(
        { erro: "Campos obrigatórios: formularioEtapaId, titulo, tipo, ordem" },
        { status: 400 }
      )
    }

    // Verificar se a etapa existe
    const etapa = await prisma.formularioEtapa.findUnique({
      where: { id: formularioEtapaId },
    })

    if (!etapa) {
      return NextResponse.json(
        { erro: "Etapa não encontrada" },
        { status: 400 }
      )
    }

    const pergunta = await prisma.formularioPergunta.create({
      data: {
        formularioEtapaId,
        titulo,
        ajuda,
        tipo,
        obrigatorio: obrigatorio || false,
        ordem: parseInt(ordem),
        opcoes: opcoes || [],
        configuracao: configuracao || null,
        campoMapeado,
        ativo,
        isSystem: false, // Perguntas criadas manualmente não são do sistema
      },
      include: {
        formularioEtapa: true,
      },
    })

    return NextResponse.json(pergunta, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar pergunta:", error)
    return NextResponse.json(
      { erro: "Erro ao criar pergunta", detalhes: error.message },
      { status: 500 }
    )
  }
}







