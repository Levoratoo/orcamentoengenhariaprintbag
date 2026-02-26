"use client"

import { UseFormReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SolicitacaoCompletaFormData } from "@/lib/validations/solicitacao"
import { getSubstratosPermitidos } from "@/lib/catalogo"
import { getCatalogo } from "@/lib/catalogo"

interface EtapaSubstratoProps {
  form: UseFormReturn<SolicitacaoCompletaFormData>
}

export function EtapaSubstrato({ form }: EtapaSubstratoProps) {
  const { watch, setValue, formState: { errors } } = form
  const produtoModeloId = watch("produto.produtoModeloId")
  const substratoId = watch("substrato.substratoId")
  const substratoGramagem = watch("substrato.substratoGramagem")

  const substratos = produtoModeloId ? getSubstratosPermitidos(produtoModeloId) : []
  const substratoSelecionado = substratos.find(s => s.id === substratoId)
  const catalogo = getCatalogo()
  const substratoCompleto = catalogo.substratos.find(s => s.id === substratoId)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Substrato / Papel</h2>
      
      {!produtoModeloId ? (
        <p className="text-muted-foreground">Selecione primeiro o tipo e modelo de produto</p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="substrato">Substrato *</Label>
            <Select
              value={substratoId || ""}
              onValueChange={(value) => {
                setValue("substrato.substratoId", value)
                setValue("substrato.substratoGramagem", "") // Reset gramagem
              }}
            >
              <SelectTrigger id="substrato">
                <SelectValue placeholder="Selecione o substrato" />
              </SelectTrigger>
              <SelectContent>
                {substratos.map((substrato) => (
                  <SelectItem key={substrato.id} value={substrato.id}>
                    {substrato.nome}
                    {substrato.exigeLaminacao && (
                      <span className="ml-2 text-xs text-orange-600">(Exige laminação)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.substrato?.substratoId && (
              <p className="text-sm text-destructive">{errors.substrato.substratoId.message}</p>
            )}
            {substratoSelecionado?.exigeLaminacao && (
              <p className="text-sm text-orange-600 font-medium">
                ⚠️ Este substrato exige laminação obrigatória. Você precisará selecionar laminação na etapa de enobrecimentos.
              </p>
            )}
          </div>

          {substratoId && substratoCompleto && substratoCompleto.gramagens.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="gramagem">Gramagem</Label>
              <Select
                value={substratoGramagem || ""}
                onValueChange={(value) => setValue("substrato.substratoGramagem", value)}
              >
                <SelectTrigger id="gramagem">
                  <SelectValue placeholder="Selecione a gramagem" />
                </SelectTrigger>
                <SelectContent>
                  {substratoCompleto.gramagens.map((gramagem) => (
                    <SelectItem key={gramagem} value={gramagem}>
                      {gramagem} g/m²
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}







