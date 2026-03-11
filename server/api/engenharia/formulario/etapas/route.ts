// API para listar e criar etapas do formulário
// GET: lista todas as etapas
// POST: cria uma nova etapa

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verificarAutenticacao } from "@/lib/auth"

export async function GET() {
  // GET é público - permite que usuários criem solicitações sem autenticação
  // Apenas POST (criação de etapas) requer autenticação
  try {
    // Verificar se o modelo existe (caso o Prisma Client não tenha sido gerado)
    const etapas = await prisma.formularioEtapa.findMany({
      include: {
        perguntas: {
          orderBy: {
            ordem: "asc",
          },
        },
      },
      orderBy: {
        ordem: "asc",
      },
    })

    // Se não houver etapas, retornar array vazio (não erro)
    return NextResponse.json(etapas || [])
  } catch (error: any) {
    console.error("Erro ao buscar etapas:", error)
    
    // Se o erro for porque a tabela não existe, dar mensagem mais clara
    if (error.message?.includes("does not exist") || error.message?.includes("Unknown model")) {
      return NextResponse.json(
        { 
          erro: "Tabelas do formulário não encontradas",
          detalhes: "Execute 'npm run db:push' para criar as tabelas e 'npm run db:seed' para popular com dados iniciais",
          codigo: "TABELA_NAO_EXISTE"
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { erro: "Erro ao buscar etapas", detalhes: error.message },
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
    
    const { codigo, nome, descricao, ordem, isSystem } = body

    if (!codigo || !nome || ordem === undefined) {
      return NextResponse.json(
        { erro: "Campos obrigatórios: codigo, nome, ordem" },
        { status: 400 }
      )
    }

    const etapa = await prisma.formularioEtapa.create({
      data: {
        codigo,
        nome,
        descricao,
        ordem: parseInt(ordem),
        isSystem: isSystem || false,
      },
      include: {
        perguntas: true,
      },
    })

    return NextResponse.json(etapa, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar etapa:", error)
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { erro: "Já existe uma etapa com este código" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { erro: "Erro ao criar etapa", detalhes: error.message },
      { status: 500 }
    )
  }
}

