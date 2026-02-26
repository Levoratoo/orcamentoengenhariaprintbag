"use client"

import { UseFormReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SolicitacaoCompletaFormData } from "@/lib/validations/solicitacao"
import { getProdutoTipos, getModelosPorTipo, getModeloPorId } from "@/lib/catalogo"
import { useEffect } from "react"

interface EtapaProdutoProps {
  form: UseFormReturn<SolicitacaoCompletaFormData>
}

export function EtapaProduto({ form }: EtapaProdutoProps) {
  const { watch, setValue, formState: { errors } } = form
  const produtoTipoId = watch("produto.produtoTipoId")
  const produtoModeloId = watch("produto.produtoModeloId")
  const variacaoEnvelope = watch("produto.variacaoEnvelope")

  const produtoTipos = getProdutoTipos()
  const modelos = produtoTipoId ? getModelosPorTipo(produtoTipoId) : []
  const modelo = produtoModeloId ? getModeloPorId(produtoModeloId) : undefined
  const isEnvelope = modelo?.codigo === "ENVELOPE"
  const variacoesEnvelope = isEnvelope && modelo?.variacoes ? modelo.variacoes : []

  // Resetar modelo quando tipo mudar
  useEffect(() => {
    if (produtoTipoId && produtoModeloId) {
      const modeloExiste = modelos.some(m => m.id === produtoModeloId)
      if (!modeloExiste) {
        setValue("produto.produtoModeloId", "")
      }
    }
  }, [produtoTipoId, modelos, produtoModeloId, setValue])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Tipo de Produto</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="produtoTipo">Tipo de Produto *</Label>
          <Select
            value={produtoTipoId}
            onValueChange={(value) => {
              setValue("produto.produtoTipoId", value)
              setValue("produto.produtoModeloId", "") // Reset modelo
            }}
          >
            <SelectTrigger id="produtoTipo">
              <SelectValue placeholder="Selecione o tipo de produto" />
            </SelectTrigger>
            <SelectContent>
              {produtoTipos.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id}>
                  {tipo.nome} {tipo.descricao && `- ${tipo.descricao}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.produto?.produtoTipoId && (
            <p className="text-sm text-destructive">{errors.produto.produtoTipoId.message}</p>
          )}
        </div>

        {produtoTipoId && (
          <div className="space-y-2">
            <Label htmlFor="produtoModelo">Modelo *</Label>
            <Select
              value={produtoModeloId}
              onValueChange={(value) => setValue("produto.produtoModeloId", value)}
            >
              <SelectTrigger id="produtoModelo">
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                {modelos.map((modelo) => (
                  <SelectItem key={modelo.id} value={modelo.id}>
                    {modelo.nome} {modelo.descricao && `- ${modelo.descricao}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.produto?.produtoModeloId && (
              <p className="text-sm text-destructive">{errors.produto.produtoModeloId.message}</p>
            )}
          </div>
        )}

        {/* Seleção de variação para ENVELOPE */}
        {isEnvelope && variacoesEnvelope.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="variacaoEnvelope">Variação do Envelope *</Label>
            <Select
              value={variacaoEnvelope || ""}
              onValueChange={(value) => {
                setValue("produto.variacaoEnvelope", value)
                // Resetar formato e aba quando variacao mudar
                setValue("formato.formatoPadraoId", "")
                setValue("formato.aba", undefined)
              }}
            >
              <SelectTrigger id="variacaoEnvelope">
                <SelectValue placeholder="Selecione a variação" />
              </SelectTrigger>
              <SelectContent>
                {variacoesEnvelope.map((variacao: any) => (
                  <SelectItem key={variacao.tipo} value={variacao.tipo}>
                    {variacao.nome || variacao.tipo.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.produto?.variacaoEnvelope && (
              <p className="text-sm text-destructive">{errors.produto.variacaoEnvelope.message}</p>
            )}
            {isEnvelope && !variacaoEnvelope && (
              <p className="text-sm text-destructive">Selecione a variação do envelope</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}



