"use client"

import { UseFormReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SolicitacaoCompletaFormData } from "@/lib/validations/solicitacao"
import { modeloPermiteEnobrecimento, getEnobrecimentosPermitidos, getCatalogo } from "@/lib/catalogo"
import { Plus, X, Sparkles } from "lucide-react"

interface EtapaEnobrecimentosProps {
  form: UseFormReturn<SolicitacaoCompletaFormData>
}

export function EtapaEnobrecimentos({ form }: EtapaEnobrecimentosProps) {
  const { watch, setValue } = form
  const produtoModeloId = watch("produto.produtoModeloId")
  const enobrecimentos = watch("enobrecimentos") || []
  const catalogo = getCatalogo()

  const permiteEnobrecimento = produtoModeloId ? modeloPermiteEnobrecimento(produtoModeloId) : true
  const enobrecimentosPermitidos = produtoModeloId 
    ? getEnobrecimentosPermitidos(produtoModeloId) 
    : catalogo.enobrecimentoTipos

  const adicionarEnobrecimento = () => {
    const novosEnobrecimentos = [...enobrecimentos, { tipoId: "", dados: {}, observacoes: "" }]
    setValue("enobrecimentos", novosEnobrecimentos)
  }

  const removerEnobrecimento = (index: number) => {
    const novosEnobrecimentos = enobrecimentos.filter((_, i) => i !== index)
    setValue("enobrecimentos", novosEnobrecimentos)
  }

  const atualizarEnobrecimento = (index: number, campo: string, valor: any) => {
    const novosEnobrecimentos = [...enobrecimentos]
    novosEnobrecimentos[index] = {
      ...novosEnobrecimentos[index],
      [campo]: valor
    }
    setValue("enobrecimentos", novosEnobrecimentos)
  }

  const atualizarDadosEnobrecimento = (index: number, key: string, valor: any) => {
    const novosEnobrecimentos = [...enobrecimentos]
    novosEnobrecimentos[index] = {
      ...novosEnobrecimentos[index],
      dados: {
        ...novosEnobrecimentos[index].dados,
        [key]: valor
      }
    }
    setValue("enobrecimentos", novosEnobrecimentos)
  }

  if (!permiteEnobrecimento) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white mb-4">Enobrecimentos</h2>
        <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-[#27a75c]/50" />
          <p className="text-[#27a75c]/70">
            O modelo de produto selecionado não permite enobrecimentos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Enobrecimentos</h2>
        <Button
          type="button"
          onClick={adicionarEnobrecimento}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Enobrecimento
        </Button>
      </div>

      {enobrecimentos.length === 0 ? (
        <div className="p-8 rounded-xl bg-gray-800/30 border border-dashed border-gray-700 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-[#27a75c]/70 mb-4">Nenhum enobrecimento adicionado</p>
          <Button
            type="button"
            variant="outline"
            onClick={adicionarEnobrecimento}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Primeiro Enobrecimento
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {enobrecimentos.map((enob, index) => {
            const tipoSelecionado = catalogo.enobrecimentoTipos.find(t => t.id === enob.tipoId)
            
            return (
              <div 
                key={index} 
                className="rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden"
              >
                {/* Header do card */}
                <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#27a75c]" />
                    <span className="font-semibold text-white">
                      Enobrecimento {index + 1}
                      {tipoSelecionado && ` - ${tipoSelecionado.nome}`}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removerEnobrecimento(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Conteúdo */}
                <div className="p-4 space-y-4">
                  {/* Tipo de Enobrecimento */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Tipo de Enobrecimento *</Label>
                    <Select
                      value={enob.tipoId || ""}
                      onValueChange={(value) => atualizarEnobrecimento(index, "tipoId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de enobrecimento" />
                      </SelectTrigger>
                      <SelectContent>
                        {enobrecimentosPermitidos.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id}>
                            {tipo.nome}
                          </SelectItem>
                        ))}
                        <SelectItem value="outro">Outro (Desenvolvimento)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campos específicos baseados no tipo */}
                  {enob.tipoId && enob.tipoId !== "outro" && (
                    <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-white/[0.06]">
                      {/* Cor */}
                      <div className="space-y-2">
                        <Label className="text-gray-300">Cor</Label>
                        <Select
                          value={enob.dados?.cor || ""}
                          onValueChange={(value) => atualizarDadosEnobrecimento(index, "cor", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ouro">Ouro</SelectItem>
                            <SelectItem value="Prata">Prata</SelectItem>
                            <SelectItem value="Preto">Preto</SelectItem>
                            <SelectItem value="Branco">Branco</SelectItem>
                            <SelectItem value="Cobre">Cobre</SelectItem>
                            <SelectItem value="Holográfico">Holográfico</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Aplicação */}
                      <div className="space-y-2">
                        <Label className="text-gray-300">Aplicação</Label>
                        <Select
                          value={enob.dados?.aplicacao || ""}
                          onValueChange={(value) => atualizarDadosEnobrecimento(index, "aplicacao", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo de aplicação" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Logo">Logo</SelectItem>
                            <SelectItem value="Total">Total</SelectItem>
                            <SelectItem value="Parcial">Parcial</SelectItem>
                            <SelectItem value="Detalhe">Detalhe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Tamanho/Área */}
                      <div className="space-y-2">
                        <Label className="text-gray-300">Tamanho/Área</Label>
                        <Input
                          value={enob.dados?.tamanho || ""}
                          onChange={(e) => atualizarDadosEnobrecimento(index, "tamanho", e.target.value)}
                          placeholder="Ex: 5x3 cm, Logo completo"
                        />
                      </div>

                      {/* Posição */}
                      <div className="space-y-2">
                        <Label className="text-gray-300">Posição</Label>
                        <Select
                          value={enob.dados?.posicao || ""}
                          onValueChange={(value) => atualizarDadosEnobrecimento(index, "posicao", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Posição na embalagem" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Frente">Frente</SelectItem>
                            <SelectItem value="Verso">Verso</SelectItem>
                            <SelectItem value="Ambos">Frente e Verso</SelectItem>
                            <SelectItem value="Lateral">Lateral</SelectItem>
                            <SelectItem value="Fundo">Fundo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <Label className="text-gray-300">Observações / Detalhes Adicionais</Label>
                    <textarea
                      value={enob.observacoes || ""}
                      onChange={(e) => atualizarEnobrecimento(index, "observacoes", e.target.value)}
                      placeholder="Descreva detalhes específicos do enobrecimento..."
                      className="flex min-h-[80px] w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27a75c]"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

