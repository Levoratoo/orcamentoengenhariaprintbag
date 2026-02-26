"use client"

import { UseFormReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { SolicitacaoCompletaFormData } from "@/lib/validations/solicitacao"
import { 
  modeloPermiteAlca, 
  modeloPermiteAcabamentos,
  getModeloPorId,
  getTiposAlcaPermitidos,
  getAplicacoesAlcaPermitidas,
  getLargurasAlcaPermitidas,
  getCoresAlcaPermitidas,
  getAcabamentosPermitidos,
  getModelosReforcoFundo,
  getModelosFuroFita
} from "@/lib/catalogo"
import { getCatalogo } from "@/lib/catalogo"

interface EtapaAlcaAcabamentosProps {
  form: UseFormReturn<SolicitacaoCompletaFormData>
}

export function EtapaAlcaAcabamentos({ form }: EtapaAlcaAcabamentosProps) {
  const { watch, setValue, formState: { errors } } = form
  const produtoModeloId = watch("produto.produtoModeloId")
  const alca = watch("alca")
  const acabamentos = watch("acabamentos")

  const variacaoEnvelope = watch("produto.variacaoEnvelope")
  const permiteAlcaGeral = produtoModeloId ? modeloPermiteAlca(produtoModeloId) : false
  const modelo = produtoModeloId ? getModeloPorId(produtoModeloId) : undefined
  const isEnvelope = modelo?.codigo === "ENVELOPE"
  
  // Para ENVELOPE, verificar se a variação permite alça
  let permiteAlca = permiteAlcaGeral
  if (isEnvelope && variacaoEnvelope && modelo?.variacoes) {
    const variacao = modelo.variacoes.find((v: any) => v.tipo === variacaoEnvelope)
    permiteAlca = variacao?.permiteAlca !== false
  }
  
  const permiteAcabamentos = produtoModeloId ? modeloPermiteAcabamentos(produtoModeloId) : false
  const catalogo = getCatalogo()

  // Buscar opções permitidas do catálogo (se disponíveis) ou usar padrões
  const tiposAlcaPermitidos = produtoModeloId ? getTiposAlcaPermitidos(produtoModeloId) : []
  const aplicacoesAlcaPermitidas = produtoModeloId ? getAplicacoesAlcaPermitidas(produtoModeloId) : []
  const largurasAlcaPermitidas = produtoModeloId ? getLargurasAlcaPermitidas(produtoModeloId) : []
  const coresAlcaPermitidas = produtoModeloId ? getCoresAlcaPermitidas(produtoModeloId) : []
  const acabamentosPermitidos = produtoModeloId ? getAcabamentosPermitidos(produtoModeloId) : []
  const modelosReforcoFundo = produtoModeloId ? getModelosReforcoFundo(produtoModeloId) : []
  const modelosFuroFitaPermitidos = produtoModeloId ? getModelosFuroFita(produtoModeloId) : []

  // Valores padrão se não houver restrições específicas
  const coresAlca = coresAlcaPermitidas.length > 0 
    ? coresAlcaPermitidas.map(c => {
        if (c === "branca") return "Branca"
        if (c === "preta") return "Preta"
        if (c === "parda") return "Parda"
        if (c === "colorida_catalogo") return "Colorida (Catálogo)"
        if (c === "outro") return "Outro (Desenvolvimento)"
        return c
      })
    : ["Branca", "Preta", "Catálogo", "Outro (Desenvolvimento)"]
  
  const largurasAlca = largurasAlcaPermitidas.length > 0
    ? largurasAlcaPermitidas.map(l => l.toString())
    : ["1.0", "1.5", "2.0", "2.5", "3.0"]
  
  const aplicacoesAlca = aplicacoesAlcaPermitidas.length > 0
    ? aplicacoesAlcaPermitidas.map(a => {
        if (a === "com_ponteira") return "C/ Ponteira"
        if (a === "colada") return "Colada"
        if (a === "solta_pacote") return "Solta no pacote"
        if (a === "torcida") return "Torcida"
        return a
      })
    : ["Solta no pacote", "Colada", "Com ponteira", "Outro (Desenvolvimento)"]

  const modelosFuroFita = modelosFuroFitaPermitidos.length > 0
    ? modelosFuroFitaPermitidos.map(m => {
        if (m === "opcao_01") return "Opção 01"
        if (m === "opcao_02") return "Opção 02"
        if (m === "opcao_03") return "Opção 03"
        if (m === "opcao_04") return "Opção 04"
        if (m === "opcao_05") return "Opção 05"
        if (m === "opcao_06") return "Opção 06"
        if (m === "padrao_evolution_8x8") return "Padrão Evolution 8x8"
        return m
      })
    : ["Opção 01", "Opção 02", "Opção 03", "Opção 04", "Opção 05", "Opção 06", "Padrão Evolution 8x8"]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Alça e Acabamentos</h2>
      
      {!produtoModeloId ? (
        <p className="text-muted-foreground">Selecione primeiro o tipo e modelo de produto</p>
      ) : (
        <>
          {permiteAlca ? (
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="text-lg font-semibold">Alça</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="alcaTipo">Tipo de Alça</Label>
                  <Select
                    value={alca?.tipoId || ""}
                    onValueChange={(value) => setValue("alca.tipoId", value)}
                  >
                    <SelectTrigger id="alcaTipo">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposAlcaPermitidos.length > 0
                        ? catalogo.alcaTipos
                            .filter(tipo => tiposAlcaPermitidos.includes(tipo.id))
                            .map((tipo) => (
                              <SelectItem key={tipo.id} value={tipo.id}>
                                {tipo.nome}
                              </SelectItem>
                            ))
                        : catalogo.alcaTipos.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id}>
                              {tipo.nome}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alcaLargura">Largura (cm)</Label>
                  <Select
                    value={alca?.largura || ""}
                    onValueChange={(value) => setValue("alca.largura", value)}
                  >
                    <SelectTrigger id="alcaLargura">
                      <SelectValue placeholder="Selecione a largura" />
                    </SelectTrigger>
                    <SelectContent>
                      {largurasAlca.map((largura) => (
                        <SelectItem key={largura} value={largura}>
                          {largura} cm
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alcaCor">Cor</Label>
                  <Select
                    value={alca?.cor || ""}
                    onValueChange={(value) => {
                      setValue("alca.cor", value)
                      if (value !== "Outro (Desenvolvimento)") {
                        setValue("alca.corCustom", undefined)
                      }
                    }}
                  >
                    <SelectTrigger id="alcaCor">
                      <SelectValue placeholder="Selecione a cor" />
                    </SelectTrigger>
                    <SelectContent>
                      {coresAlca.map((cor) => (
                        <SelectItem key={cor} value={cor}>
                          {cor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {alca?.cor === "Outro (Desenvolvimento)" && (
                  <div className="space-y-2">
                    <Label htmlFor="alcaCorCustom">Cor (Desenvolvimento)</Label>
                    <Input
                      id="alcaCorCustom"
                      value={alca?.corCustom || ""}
                      onChange={(e) => setValue("alca.corCustom", e.target.value)}
                      placeholder="Descreva a cor desejada"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="alcaAplicacao">Forma de Aplicação</Label>
                  <Select
                    value={alca?.aplicacao || ""}
                    onValueChange={(value) => setValue("alca.aplicacao", value)}
                  >
                    <SelectTrigger id="alcaAplicacao">
                      <SelectValue placeholder="Selecione a forma de aplicação" />
                    </SelectTrigger>
                    <SelectContent>
                      {aplicacoesAlca.map((aplicacao) => (
                        <SelectItem key={aplicacao} value={aplicacao}>
                          {aplicacao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alcaComprimento">Comprimento (cm)</Label>
                  <Input
                    id="alcaComprimento"
                    type="number"
                    step="0.1"
                    value={alca?.comprimento || ""}
                    onChange={(e) => setValue("alca.comprimento", parseFloat(e.target.value) || undefined)}
                    placeholder="Informar comprimento"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Este modelo não permite alça. Os campos de alça estão desabilitados conforme catálogo técnico.
              </p>
            </div>
          )}

          {permiteAcabamentos ? (
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="text-lg font-semibold">Acabamentos</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reforcoFundo"
                  checked={acabamentos?.reforcoFundo || false}
                  onCheckedChange={(checked) => setValue("acabamentos.reforcoFundo", !!checked)}
                />
                <Label htmlFor="reforcoFundo" className="cursor-pointer">
                  Reforço de Fundo
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bocaPalhaco"
                  checked={acabamentos?.bocaPalhaco || false}
                  onCheckedChange={(checked) => setValue("acabamentos.bocaPalhaco", !!checked)}
                />
                <Label htmlFor="bocaPalhaco" className="cursor-pointer">
                  Boca de Palhaço
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furoFita"
                  checked={acabamentos?.furoFita || false}
                  onCheckedChange={(checked) => {
                    setValue("acabamentos.furoFita", !!checked)
                    if (!checked) {
                      setValue("acabamentos.furoFitaModelo", undefined)
                    }
                  }}
                />
                <Label htmlFor="furoFita" className="cursor-pointer">
                  Furo de Fita
                </Label>
              </div>

              {acabamentos?.furoFita && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="furoFitaModelo">Modelo de Furo de Fita</Label>
                  <Select
                    value={acabamentos?.furoFitaModelo || ""}
                    onValueChange={(value) => setValue("acabamentos.furoFitaModelo", value)}
                  >
                    <SelectTrigger id="furoFitaModelo">
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelosFuroFita.map((modelo) => (
                        <SelectItem key={modelo} value={modelo}>
                          {modelo}
                        </SelectItem>
                      ))}
                      <SelectItem value="outro">Outro (Informar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {acabamentos?.reforcoFundo && modelosReforcoFundo.length > 0 && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="reforcoFundoModelo">Modelo de Reforço de Fundo</Label>
                  <Select
                    value={acabamentos?.reforcoFundoModelo || ""}
                    onValueChange={(value) => setValue("acabamentos.reforcoFundoModelo", value)}
                  >
                    <SelectTrigger id="reforcoFundoModelo">
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelosReforcoFundo.map((modelo) => (
                        <SelectItem key={modelo} value={modelo}>
                          {modelo.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Campos específicos para ENVELOPE */}
              {modelo?.codigo === "ENVELOPE" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="duplaFace"
                      checked={acabamentos?.duplaFace || false}
                      onCheckedChange={(checked) => setValue("acabamentos.duplaFace", !!checked)}
                    />
                    <Label htmlFor="duplaFace" className="cursor-pointer">
                      Dupla Face
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="velcro"
                      checked={acabamentos?.velcro || false}
                      onCheckedChange={(checked) => {
                        setValue("acabamentos.velcro", !!checked)
                        if (!checked) {
                          setValue("acabamentos.velcroCor", undefined)
                          setValue("acabamentos.velcroTamanho", undefined)
                        }
                      }}
                    />
                    <Label htmlFor="velcro" className="cursor-pointer">
                      Velcro
                    </Label>
                  </div>

                  {acabamentos?.velcro && (
                    <div className="ml-6 space-y-2">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="velcroCor">Cor do Velcro</Label>
                          <Input
                            id="velcroCor"
                            value={acabamentos?.velcroCor || ""}
                            onChange={(e) => setValue("acabamentos.velcroCor", e.target.value)}
                            placeholder="Informar cor"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="velcroTamanho">Tamanho (mm)</Label>
                          <Select
                            value={acabamentos?.velcroTamanho?.toString() || ""}
                            onValueChange={(value) => setValue("acabamentos.velcroTamanho", parseFloat(value))}
                          >
                            <SelectTrigger id="velcroTamanho">
                              <SelectValue placeholder="Selecione o tamanho" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="16">16mm</SelectItem>
                              <SelectItem value="21">21mm</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Este modelo não permite acabamentos. Os campos de acabamentos estão desabilitados conforme catálogo técnico.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}



