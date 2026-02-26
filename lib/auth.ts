import { cookies } from "next/headers"

export async function verificarAutenticacao(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get("engenharia_auth")
    return authCookie?.value === "authenticated"
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error)
    return false
  }
}



