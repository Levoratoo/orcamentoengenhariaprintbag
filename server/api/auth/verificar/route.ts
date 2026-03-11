import { NextResponse } from "next/server"
import { verificarAutenticacao } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const autenticado = await verificarAutenticacao()
  return NextResponse.json(
    { autenticado },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  )
}
