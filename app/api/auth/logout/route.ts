import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("engenharia_auth")

    return NextResponse.json({ sucesso: true })
  } catch (error: any) {
    console.error("Erro ao fazer logout:", error)
    return NextResponse.json(
      { erro: "Erro ao processar logout" },
      { status: 500 }
    )
  }
}



