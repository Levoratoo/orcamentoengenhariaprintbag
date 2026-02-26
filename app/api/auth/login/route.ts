import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const LOGIN_VALIDO = "engenharia"
const SENHA_VALIDA = "Engenharia@2025"

export async function POST(request: Request) {
  try {
    const { login, senha } = await request.json()

    if (!login || !senha) {
      return NextResponse.json(
        { erro: "Login e senha são obrigatórios" },
        { status: 400 }
      )
    }

    if (login === LOGIN_VALIDO && senha === SENHA_VALIDA) {
      // Criar cookie de autenticação
      const cookieStore = await cookies()
      cookieStore.set("engenharia_auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: "/",
      })

      return NextResponse.json({ sucesso: true })
    } else {
      return NextResponse.json(
        { erro: "Login ou senha incorretos" },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error("Erro ao fazer login:", error)
    return NextResponse.json(
      { erro: "Erro ao processar login" },
      { status: 500 }
    )
  }
}



