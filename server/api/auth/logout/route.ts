import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const protocolo = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "")
    const isHttps = protocolo.toLowerCase() === "https"

    const response = NextResponse.json(
      { sucesso: true },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    )

    response.cookies.set("engenharia_auth", "", {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error: any) {
    console.error("Erro ao fazer logout:", error)
    return NextResponse.json(
      { erro: "Erro ao processar logout" },
      { status: 500 }
    )
  }
}
