import { SHOWCASE_STATIC_PERGUNTA_IDS } from "@/lib/showcase-data"
import EditarPerguntaClientPage from "./EditarPerguntaClientPage"

export function generateStaticParams() {
  return SHOWCASE_STATIC_PERGUNTA_IDS.map((id) => ({ id }))
}

export default function EditarPerguntaPage() {
  return <EditarPerguntaClientPage />
}
