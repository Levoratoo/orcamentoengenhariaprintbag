"use client"

import { UseFormReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SolicitacaoCompletaFormData } from "@/lib/validations/solicitacao"
import { modeloPermiteImpressao, modeloPermiteEnobrecimento, getImpressoesPermitidas, getEnobrecimentosPermitidos } from "@/lib/catalogo"
import { Plus, X } from "lucide-react"

interface EtapaImpressaoEnobrecimentosProps {
  form: UseFormReturn<SolicitacaoCompletaFormData>
}

export function EtapaImpressaoEnobrecimentos({ form }: EtapaImpressaoEnobrecimentosProps) {
  const { watch, setValue, formState: { errors } } = form
  const produtoModeloId = watch("produto.produtoModeloId")
  const impressao = watch("impressao")
  const enobrecimentos = watch("enobrecimentos") || []

  const permiteImpressao = produtoModeloId ? modeloPermiteImpressao(produtoModeloId) : false
  const permiteEnobrecimento = produtoModeloId ? modeloPermiteEnobrecimento(produtoModeloId) : false

  const impressoesPermitidas = produtoModeloId ? getImpressoesPermitidas(produtoModeloId) : []
  const enobrecimentosPermitidos = produtoModeloId ? getEnobrecimentosPermitidos(produtoModeloId) : []

  const modoSelecionado = impressoesPermitidas.find(m => m.id === impressao?.modoId)
  const combinacoes = modoSelecionado?.combinacoes || []

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Impressão e Enobrecimentos</h2>
      
      {!produtoModeloId ? (
        <p className="text-muted-foreground">Selecione primeiro o tipo e modelo de produto</p>
      ) : (
        <>
          {permiteImpressao ? (
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="text-lg font-semibold">Impressão</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="impressaoModo">Modo de Impressão</Label>
                  <Select
                    value={impressao?.modoId || ""}
                    onValueChange={(value) => {
                      setValue("impressao.modoId", value)
                      setValue("impressao.combinacaoId", undefined) // Reset combinação
                    }}
                  >
                    <SelectTrigger id="impressaoModo">
                      <SelectValue placeholder="Selecione o modo" />
                    </SelectTrigger>
                    <SelectContent>
                      {impressoesPermitidas.map((modo) => (
                        <SelectItem key={modo.id} value={modo.id}>
                          {modo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {impressao?.modoId && combinacoes.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="impressaoCombinacao">Combinação de Cores</Label>
                    <Select
                      value={impressao?.combinacaoId || ""}
                      onValueChange={(value) => setValue("impressao.combinacaoId", value)}
                    >
                      <SelectTrigger id="impressaoCombinacao">
                        <SelectValue placeholder="Selecione a combinação" />
                      </SelectTrigger>
                      <SelectContent>
                        {combinacoes.map((combinacao) => (
                          <SelectItem key={combinacao.id} value={combinacao.id}>
                            {combinacao.nome} {combinacao.descricao && `- ${combinacao.descricao}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {impressao?.combinacaoId && (
                  <div className="space-y-2">
                    <Label>Camadas de Impressão</Label>
                    <div className="space-y-2">
                      {["externa", "interna", "apara", "saco", "sacola", "etiqueta"].map((camada) => (
                        <div key={camada} className="flex items-center space-x-2">
                          <Checkbox
                            id={`camada_${camada}`}
                            checked={impressao?.camadas?.[camada as keyof typeof impressao.camadas] || false}
                            onCheckedChange={(checked) => {
                              setValue(`impressao.camadas.${camada}`, !!checked)
                            }}
                          />
                          <Label htmlFor={`camada_${camada}`} className="cursor-pointer capitalize">
                            {camada}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="impressaoObservacoes">Observações sobre Impressão</Label>
                  <textarea
                    id="impressaoObservacoes"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={impressao?.observacoes || ""}
                    onChange={(e) => setValue("impressao.observacoes", e.target.value)}
                    placeholder="Observações adicionais sobre a impressão"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Este modelo não permite impressão. Os campos de impressão estão desabilitados conforme catálogo técnico.
              </p>
            </div>
          )}

          {permiteEnobrecimento ? (
            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Enobrecimentos</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={adicionarEnobrecimento}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Enobrecimento
                </Button>
              </div>

              {enobrecimentos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum enobrecimento adicionado</p>
              ) : (
                <div className="space-y-4">
                  {enobrecimentos.map((enob, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">
                          Enobrecimento {index + 1}
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removerEnobrecimento(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Tipo de Enobrecimento *</Label>
                        <Select
                          value={enob.tipoId || ""}
                          onValueChange={(value) => atualizarEnobrecimento(index, "tipoId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {enobrecimentosPermitidos.map((tipo) => (
                              <SelectItem key={tipo.id} value={tipo.id}>
                                {tipo.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Campos específicos por tipo de enobrecimento */}
                      {enob.tipoId && (
                        <div className="space-y-2 pl-4 border-l-2">
                          {enob.tipoId.includes("HOT_STAMPING") && (
                            <>
                              <Label>Cor</Label>
                              <Select
                                value={enob.dados?.cor || ""}
                                onValueChange={(value) => {
                                  atualizarEnobrecimento(index, "dados", {
                                    ...enob.dados,
                                    cor: value
                                  })
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a cor" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ouro">Ouro</SelectItem>
                                  <SelectItem value="prata">Prata</SelectItem>
                                  <SelectItem value="preto">Preto</SelectItem>
                                  <SelectItem value="outro">Outro (Desenvolvimento)</SelectItem>
                                </SelectContent>
                              </Select>
                            </>
                          )}

                          {enob.tipoId.includes("RELEVO") && (
                            <>
                              <Label>Tipo de Relevo</Label>
                              <Select
                                value={enob.dados?.tipo || ""}
                                onValueChange={(value) => {
                                  atualizarEnobrecimento(index, "dados", {
                                    ...enob.dados,
                                    tipo: value
                                  })
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="alto">Alto Relevo</SelectItem>
                                  <SelectItem value="baixo">Baixo Relevo</SelectItem>
                                </SelectContent>
                              </Select>
                            </>
                          )}

                          {enob.tipoId.includes("LAMINACAO") && (
                            <>
                              <Label>Tipo de Laminação</Label>
                              <Select
                                value={enob.dados?.tipoLaminação || ""}
                                onValueChange={(value) => {
                                  atualizarEnobrecimento(index, "dados", {
                                    ...enob.dados,
                                    tipoLaminação: value
                                  })
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="brilho">Brilho</SelectItem>
                                  <SelectItem value="fosco">Fosco</SelectItem>
                                  <SelectItem value="outro">Outro</SelectItem>
                                </SelectContent>
                              </Select>
                            </>
                          )}

                          {enob.tipoId.includes("VERNIZ_UV") && (
                            <>
                              <Label>Tipo de Verniz</Label>
                              <Select
                                value={enob.dados?.tipoVerniz || ""}
                                onValueChange={(value) => {
                                  atualizarEnobrecimento(index, "dados", {
                                    ...enob.dados,
                                    tipoVerniz: value
                                  })
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="total">Total</SelectItem>
                                  <SelectItem value="parcial">Parcial</SelectItem>
                                </SelectContent>
                              </Select>
                              {enob.dados?.tipoVerniz === "parcial" && (
                                <Input
                                  placeholder="Detalhar (Ex: Logo, Total, etc)"
                                  value={enob.dados?.detalhamento || ""}
                                  onChange={(e) => {
                                    atualizarEnobrecimento(index, "dados", {
                                      ...enob.dados,
                                      detalhamento: e.target.value
                                    })
                                  }}
                                />
                              )}
                            </>
                          )}

                          <div className="space-y-2">
                            <Label>Observações</Label>
                            <textarea
                              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={enob.observacoes || ""}
                              onChange={(e) => atualizarEnobrecimento(index, "observacoes", e.target.value)}
                              placeholder="Observações sobre este enobrecimento"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Este modelo não permite enobrecimentos. Os campos de enobrecimento estão desabilitados conforme catálogo técnico.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}







