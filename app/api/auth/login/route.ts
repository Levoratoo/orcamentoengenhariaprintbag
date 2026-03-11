import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const LOGIN_VALIDO = "engenharia"
const SENHA_VALIDA = "Engenharia@2025"

export async function POST(request: Request) {
  try {
    const { login, senha } = await request.json()

    if (!login || !senha) {
      return NextResponse.json(
        { erro: "Login e senha sao obrigatorios" },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      )
    }

    if (login !== LOGIN_VALIDO || senha !== SENHA_VALIDA) {
      return NextResponse.json(
        { erro: "Login ou senha incorretos" },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      )
    }

    const protocolo = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "")
    const isHttps = protocolo.toLowerCase() === "https"

    const cookieStore = cookies()
    cookieStore.set("engenharia_auth", "authenticated", {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return NextResponse.json(
      { sucesso: true },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    )
  } catch (error: any) {
    console.error("Erro ao fazer login:", error)
    return NextResponse.json(
      { erro: "Erro ao processar login" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    )
  }
}
