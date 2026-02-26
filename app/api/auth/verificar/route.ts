import { NextResponse } from "next/server"
import { verificarAutenticacao } from "@/lib/auth"

export async function GET() {
  const autenticado = await verificarAutenticacao()
  return NextResponse.json({ autenticado })
}



