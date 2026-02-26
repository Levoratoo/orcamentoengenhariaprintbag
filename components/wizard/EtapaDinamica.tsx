"use client"

import { UseFormReturn } from "react-hook-form"
import { SolicitacaoCompletaFormData } from "@/lib/validations/solicitacao"
import { CampoDinamico } from "./CampoDinamico"

interface FormularioPergunta {
  id: string
  titulo: string
  ajuda?: string
  tipo: string
  obrigatorio: boolean
  ativo: boolean
  ordem: number
  opcoes: string[]
  campoMapeado?: string
  systemKey?: string
}

interface FormularioEtapa {
  id: string
  codigo: string
  nome: string
  ordem: number
  perguntas: FormularioPergunta[]
}

interface EtapaDinamicaProps {
  etapa: FormularioEtapa
  form: UseFormReturn<SolicitacaoCompletaFormData>
}

export function EtapaDinamica({ etapa, form }: EtapaDinamicaProps) {
  const { watch } = form
  
  // Obter produtoTipoId para campos dependentes (ex: lista_modelos)
  const produtoTipoId = watch("produto.produtoTipoId")
  
  // Filtrar apenas perguntas ativas e ordenar por ordem
  const perguntasAtivas = etapa.perguntas
    .filter(p => p.ativo)
    .sort((a, b) => a.ordem - b.ordem)

  if (perguntasAtivas.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4 text-white">{etapa.nome}</h2>
        <p className="text-[#27a75c]/70">Nenhuma pergunta configurada para esta etapa.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-white">{etapa.nome}</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {perguntasAtivas.map((pergunta) => (
          <CampoDinamico
            key={pergunta.id}
            pergunta={pergunta}
            form={form}
            valorProdutoTipoId={pergunta.systemKey === "modelo" ? produtoTipoId : undefined}
          />
        ))}
      </div>
    </div>
  )
}







