import { SHOWCASE_STATIC_SOLICITACAO_IDS } from "@/lib/showcase-data"
import SolicitacaoDetalheClientPage from "./SolicitacaoDetalheClientPage"

export function generateStaticParams() {
  return SHOWCASE_STATIC_SOLICITACAO_IDS.map((id) => ({ id }))
}

export default function SolicitacaoDetalhePage() {
  return <SolicitacaoDetalheClientPage />
}
