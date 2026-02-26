"use client"

import { UseFormReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SolicitacaoCompletaFormData } from "@/lib/validations/solicitacao"
import { getFormatosPermitidos, getModeloPorId, getLargurasPadrao, getAlturasPadrao, getSanfonasPadrao } from "@/lib/catalogo"

interface EtapaFormatoProps {
  form: UseFormReturn<SolicitacaoCompletaFormData>
}

const normalizarValorSelect = (valor: unknown): string => {
  if (valor === null || valor === undefined) return ""
  return String(valor)
}

const normalizarOutroSelect = (valor: string): string => {
  if (valor === "Outro (Desenvolvimento)") return "outro"
  return valor
}

const montarOpcoesPadrao = (valores: number[], valorAtual: string, unidade: string) => {
  const opcoes = valores.map((valor) => ({
    value: valor.toString(),
    label: `${valor} ${unidade}`,
  }))
  if (!valorAtual || valorAtual === "outro") return opcoes
  const existe = opcoes.some((opcao) => opcao.value === valorAtual)
  if (existe) return opcoes
  return [...opcoes, { value: valorAtual, label: `${valorAtual} ${unidade} (salvo)` }]
}

export function EtapaFormato({ form }: EtapaFormatoProps) {
  const { watch, setValue, formState: { errors } } = form
  const produtoModeloId = watch("produto.produtoModeloId")
  const formatoPadraoId = watch("formato.formatoPadraoId")
  const formatoCustom = watch("formato.formatoCustom")

  const formatos = produtoModeloId ? getFormatosPermitidos(produtoModeloId) : []
  const modelo = produtoModeloId ? getModeloPorId(produtoModeloId) : undefined
  const isSacoFundoV = modelo?.codigo === "FUNDO_V"
  const isEnvelope = modelo?.codigo === "ENVELOPE"
  const variacaoEnvelope = watch("produto.variacaoEnvelope")
  const largurasPadrao = isSacoFundoV ? getLargurasPadrao(produtoModeloId) : []
  const alturasPadrao = isSacoFundoV ? getAlturasPadrao(produtoModeloId) : []
  const sanfonasPadrao = isSacoFundoV ? getSanfonasPadrao(produtoModeloId) : []
  const larguraPadraoAtual = normalizarOutroSelect(
    normalizarValorSelect(watch("formato.sacoFundoV.larguraPadrao"))
  )
  const alturaPadraoAtual = normalizarOutroSelect(
    normalizarValorSelect(watch("formato.sacoFundoV.alturaPadrao"))
  )
  const sanfonaPadraoAtual = normalizarOutroSelect(
    normalizarValorSelect(watch("formato.sacoFundoV.sanfonaPadrao"))
  )
  const largurasOpcoes = montarOpcoesPadrao(largurasPadrao, larguraPadraoAtual, "cm")
  const alturasOpcoes = montarOpcoesPadrao(alturasPadrao, alturaPadraoAtual, "cm")
  const sanfonasOpcoes = montarOpcoesPadrao(sanfonasPadrao, sanfonaPadraoAtual, "cm")
  
  // Filtrar formatos permitidos pela variação do envelope
  let formatosDisponiveis = formatos
  if (isEnvelope && variacaoEnvelope && modelo?.variacoes) {
    const variacao = modelo.variacoes.find((v: any) => v.tipo === variacaoEnvelope)
    if (variacao?.formatos) {
      formatosDisponiveis = formatos.filter(f => variacao.formatos.includes(f.id))
    }
  }
  
  const formatoSelecionado = formatosDisponiveis.find(f => f.id === formatoPadraoId)
  const usaFormatoCustom = formatoSelecionado?.aceitaDesenvolvimento || formatosDisponiveis.length === 0

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Formato</h2>
      
      {!produtoModeloId ? (
        <p className="text-muted-foreground">Selecione primeiro o tipo e modelo de produto</p>
      ) : isEnvelope && !variacaoEnvelope ? (
        <p className="text-muted-foreground">Selecione primeiro a variação do envelope</p>
      ) : (
        <div className="space-y-4">
          {/* Campos específicos para SACO FUNDO V */}
          {isSacoFundoV && (
            <div className="space-y-4 border rounded-lg p-4 bg-[#27a75c]/5">
              <Label className="text-base font-semibold">Especificações do Fundo V</Label>
              
              {largurasPadrao.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="larguraPadrao">Largura *</Label>
                  <Select
                    value={larguraPadraoAtual || ""}
                    onValueChange={(value) => {
                      setValue("formato.sacoFundoV.larguraPadrao", value === "outro" ? "outro" : value)
                    }}
                  >
                    <SelectTrigger id="larguraPadrao">
                      <SelectValue placeholder="Selecione a largura" />
                    </SelectTrigger>
                    <SelectContent>
                      {largurasOpcoes.map((opcao) => (
                        <SelectItem key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="outro">Outro (Desenvolvimento)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {alturasPadrao.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="alturaPadrao">Altura *</Label>
                  <Select
                    value={alturaPadraoAtual || ""}
                    onValueChange={(value) => {
                      setValue("formato.sacoFundoV.alturaPadrao", value === "outro" ? "outro" : value)
                    }}
                  >
                    <SelectTrigger id="alturaPadrao">
                      <SelectValue placeholder="Selecione a altura" />
                    </SelectTrigger>
                    <SelectContent>
                      {alturasOpcoes.map((opcao) => (
                        <SelectItem key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="outro">Outro (Desenvolvimento)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {sanfonasPadrao.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="sanfona">Sanfona *</Label>
                  <Select
                    value={sanfonaPadraoAtual || ""}
                    onValueChange={(value) => {
                      setValue("formato.sacoFundoV.sanfonaPadrao", value === "outro" ? "outro" : value)
                    }}
                  >
                    <SelectTrigger id="sanfona">
                      <SelectValue placeholder="Selecione a sanfona" />
                    </SelectTrigger>
                    <SelectContent>
                      {sanfonasOpcoes.map((opcao) => (
                        <SelectItem key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="outro">Outro (Desenvolvimento)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          {formatosDisponiveis.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="formatoPadrao">Formato Padrão</Label>
              <Select
                value={formatoPadraoId || ""}
                onValueChange={(value) => {
                  setValue("formato.formatoPadraoId", value)
                  // Limpar formato custom se selecionar padrão
                  if (value) {
                    setValue("formato.formatoCustom", undefined)
                  }
                  // Se for envelope, extrair a aba do formato
                  if (isEnvelope && value) {
                    const formatoSelecionado = formatosDisponiveis.find(f => f.id === value)
                    if (formatoSelecionado?.nome?.includes("Aba:")) {
                      const match = formatoSelecionado.nome.match(/Aba:\s*(\d+)/)
                      if (match) {
                        setValue("formato.envelopeAbaAltura", parseFloat(match[1]))
                      }
                    }
                  }
                }}
              >
                <SelectTrigger id="formatoPadrao">
                  <SelectValue placeholder="Selecione um formato padrão" />
                </SelectTrigger>
                <SelectContent>
                  {formatosDisponiveis.map((formato) => (
                    <SelectItem key={formato.id} value={formato.id}>
                      {formato.nome}
                      {formato.largura && formato.altura && (
                        ` (${formato.largura}x${formato.altura}${formato.lateral ? `x${formato.lateral}` : ""} cm)`
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Campo específico para ENVELOPE - mostrar aba se já estiver no formato ou permitir informar */}
          {isEnvelope && formatoPadraoId && (
            <div className="space-y-2 border rounded-lg p-4 bg-[#27a75c]/5">
              <Label htmlFor="aba">Altura da Aba (mm)</Label>
              <Input
                id="aba"
                type="number"
                step="0.1"
                value={watch("formato.envelopeAbaAltura") || ""}
                onChange={(e) => setValue("formato.envelopeAbaAltura", parseFloat(e.target.value) || undefined)}
                placeholder="Ex: 45, 60, 80, 90, 100"
              />
              <p className="text-xs text-muted-foreground">
                A altura da aba geralmente está indicada no formato selecionado. Se necessário, ajuste aqui.
              </p>
            </div>
          )}

          {usaFormatoCustom && (
            <div className="space-y-4 border rounded-lg p-4">
              <Label className="text-base font-semibold">Outro (Desenvolvimento)</Label>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="largura">Largura (cm) *</Label>
                  <Input
                    id="largura"
                    type="number"
                    step="0.1"
                    value={formatoCustom?.largura || ""}
                    onChange={(e) => {
                      setValue("formato.formatoCustom.largura", parseFloat(e.target.value) || 0)
                    }}
                    placeholder="Ex: 30.5"
                  />
                  {errors.formato?.formatoCustom?.largura && (
                    <p className="text-sm text-destructive">{errors.formato.formatoCustom.largura.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altura">Altura (cm) *</Label>
                  <Input
                    id="altura"
                    type="number"
                    step="0.1"
                    value={formatoCustom?.altura || ""}
                    onChange={(e) => {
                      setValue("formato.formatoCustom.altura", parseFloat(e.target.value) || 0)
                    }}
                    placeholder="Ex: 40.0"
                  />
                  {errors.formato?.formatoCustom?.altura && (
                    <p className="text-sm text-destructive">{errors.formato.formatoCustom.altura.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lateral">Lateral (cm)</Label>
                  <Input
                    id="lateral"
                    type="number"
                    step="0.1"
                    value={formatoCustom?.lateral || ""}
                    onChange={(e) => {
                      setValue("formato.formatoCustom.lateral", parseFloat(e.target.value) || undefined)
                    }}
                    placeholder="Ex: 10.0 (opcional)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formatoObservacoes">Observações Técnicas</Label>
                <textarea
                  id="formatoObservacoes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formatoCustom?.observacoes || ""}
                  onChange={(e) => {
                    setValue("formato.formatoCustom.observacoes", e.target.value)
                  }}
                  placeholder="Detalhes técnicos sobre o formato"
                />
              </div>
            </div>
          )}

          {errors.formato && !formatoPadraoId && !formatoCustom && (
            <p className="text-sm text-destructive">Selecione um formato padrão ou informe formato customizado</p>
          )}
        </div>
      )}
    </div>
  )
}
