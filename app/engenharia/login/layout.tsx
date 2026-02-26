// Layout específico para login - não aplica o layout pai
// Este layout não verifica autenticação e não mostra a barra de navegação
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

