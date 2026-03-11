import { cookies } from "next/headers"

export async function verificarAutenticacao(): Promise<boolean> {
  try {
    const cookieStore = cookies()
    const authCookie = cookieStore.get("engenharia_auth")
    return authCookie?.value === "authenticated"
  } catch (error) {
    console.error("Erro ao verificar autenticacao:", error)
    return false
  }
}
