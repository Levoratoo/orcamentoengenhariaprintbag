"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SolicitacaoCompletaFormData } from "@/lib/validations/solicitacao"
import { getAcondicionamentosPermitidos, getTiragemMinima, getModeloPorId } from "@/lib/catalogo"
import { getCatalogo } from "@/lib/catalogo"

interface EtapaAcondicionamentoProps {
  form: UseFormReturn<SolicitacaoCompletaFormData>
}

export function EtapaAcondicionamento({ form }: EtapaAcondicionamentoProps) {
  const { watch, setValue, formState: { errors } } = form
  const produtoTipoId = watch("produto.produtoTipoId")
  const produtoModeloId = watch("produto.produtoModeloId")
  const formatoPadraoId = watch("formato.formatoPadraoId")
  const acondicionamento = watch("acondicionamento")

  const acondicionamentos = produtoModeloId ? getAcondicionamentosPermitidos(produtoModeloId) : []
  const catalogo = getCatalogo()
  const modulos = catalogo.modulos
  const modelo = produtoModeloId ? getModeloPorId(produtoModeloId) : undefined
  const isEnvelope = modelo?.codigo === "ENVELOPE"

  // Buscar tiragem mínima do tipo de produto
  const produtoTipo = catalogo.produtoTipos.find(t => t.id === produtoTipoId)
  const tiragemMinima = produtoTipo ? getTiragemMinima(produtoTipo.codigo) : null

  // Para ENVELOPE, buscar módulo padrão baseado no formato
  let moduloPadraoEnvelope: number | null = null
  if (isEnvelope && formatoPadraoId && modelo?.regrasPorFormato) {
    const regrasFormato = (modelo.regrasPorFormato as any)[formatoPadraoId]
    if (regrasFormato?.moduloPadrao) {
      moduloPadraoEnvelope = regrasFormato.moduloPadrao
    }
  }

  const moduloSelecionado = modulos.find(m => m.id === acondicionamento?.moduloId)
  const quantidadeModulo = moduloSelecionado?.quantidade

  // Sugerir módulo padrão para ENVELOPE quando formato for selecionado
  useEffect(() => {
    if (isEnvelope && moduloPadraoEnvelope && !acondicionamento?.moduloId) {
      const moduloPadrao = modulos.find(m => m.quantidade === moduloPadraoEnvelope)
      if (moduloPadrao) {
        setValue("acondicionamento.moduloId", moduloPadrao.id)
        setValue("acondicionamento.quantidade", moduloPadrao.quantidade || 0)
      }
    }
  }, [isEnvelope, moduloPadraoEnvelope, acondicionamento?.moduloId, modulos, setValue])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Acondicionamento, Módulo e Tiragem</h2>
      
      {!produtoModeloId ? (
        <p className="text-muted-foreground">Selecione primeiro o tipo e modelo de produto</p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="acondicionamento">Tipo de Acondicionamento</Label>
            <Select
              value={acondicionamento?.tipoId || ""}
              onValueChange={(value) => setValue("acondicionamento.tipoId", value)}
            >
              <SelectTrigger id="acondicionamento">
                <SelectValue placeholder="Selecione o tipo de acondicionamento" />
              </SelectTrigger>
              <SelectContent>
                {acondicionamentos.map((acond) => (
                  <SelectItem key={acond.id} value={acond.id}>
                    {acond.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modulo">
              Módulo
              {isEnvelope && moduloPadraoEnvelope && (
                <span className="text-sm text-muted-foreground ml-2">
                  (Padrão: {moduloPadraoEnvelope}un para este formato)
                </span>
              )}
            </Label>
            <Select
              value={acondicionamento?.moduloId || ""}
              onValueChange={(value) => {
                setValue("acondicionamento.moduloId", value)
                // Se o módulo tem quantidade fixa, atualizar quantidade
                const modulo = modulos.find(m => m.id === value)
                if (modulo?.quantidade) {
                  setValue("acondicionamento.quantidade", modulo.quantidade)
                }
              }}
            >
              <SelectTrigger id="modulo">
                <SelectValue placeholder="Selecione o módulo" />
              </SelectTrigger>
              <SelectContent>
                {modulos.map((modulo) => (
                  <SelectItem key={modulo.id} value={modulo.id}>
                    {modulo.nome}
                    {isEnvelope && moduloPadraoEnvelope && modulo.quantidade === moduloPadraoEnvelope && (
                      <span className="text-xs text-muted-foreground ml-2">(Padrão)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade">
              Quantidade {tiragemMinima && `(Mínimo: ${tiragemMinima.toLocaleString()} un)`} *
            </Label>
            <Input
              id="quantidade"
              type="number"
              min={tiragemMinima || 1}
              value={acondicionamento?.quantidade || ""}
              onChange={(e) => {
                const valor = parseInt(e.target.value) || 0
                setValue("acondicionamento.quantidade", valor)
              }}
              placeholder="Informe a quantidade"
            />
            {errors.acondicionamento?.quantidade && (
              <p className="text-sm text-destructive">{errors.acondicionamento.quantidade.message}</p>
            )}
            {tiragemMinima && acondicionamento?.quantidade && acondicionamento.quantidade < tiragemMinima && (
              <p className="text-sm text-orange-600 font-medium">
                ⚠️ A tiragem mínima para este tipo de produto é {tiragemMinima.toLocaleString()} unidades.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

