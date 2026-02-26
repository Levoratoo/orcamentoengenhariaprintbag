"use client"

import { useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { SolicitacaoCompletaFormData } from "@/lib/validations/solicitacao"
import {
  getProdutoTipos,
  getModelosPorTipo,
  getModeloPorId,
  getLargurasPadrao,
  getAlturasPadrao,
  getSanfonasPadrao,
  getSubstratosPermitidos,
  getImpressoesPermitidas,
  getFormatosPermitidos,
  getCombinacoesPermitidas,
  getCatalogo,
  getTiposAlcaPermitidos,
  getAplicacoesAlcaPermitidas,
  getLargurasAlcaPermitidas,
  getCoresAlcaPermitidas,
  getAcabamentosPermitidos,
  getModelosReforcoFundo,
  getModelosFuroFita,
  getAcondicionamentosPermitidos,
} from "@/lib/catalogo"

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
  configuracao?: {
    modelosPorProduto?: Record<string, string[]> // produtoId -> array de nomes de modelos
    tamanhosPorModelo?: Record<string, string[]> // modeloId -> array de tamanhos/valores
  }
}

interface CampoDinamicoProps {
  pergunta: FormularioPergunta
  form: UseFormReturn<SolicitacaoCompletaFormData>
  valorProdutoTipoId?: string
}

export function CampoDinamico({ pergunta, form, valorProdutoTipoId }: CampoDinamicoProps) {
  const { watch, setValue, formState: { errors } } = form

  const produtoModeloId = watch("produto.produtoModeloId")
  const impressaoModoId = watch("impressao.modoId")
  const substratoId = watch("substrato.substratoId")
  const condicaoPagamento = watch("condicoesVenda.condicaoPagamento")
  const tipoContrato = watch("condicoesVenda.tipoContrato")
  const numeroEntregas = watch("entregas.numeroEntregas")
  const frequenciaEntregas = watch("entregas.frequencia")
  const localUnico = watch("entregas.localUnico")
  const freteQuantidades = watch("entregas.freteQuantidades")

  const modelo = produtoModeloId ? getModeloPorId(produtoModeloId) : null

  if (pergunta.systemKey === "largura" || pergunta.systemKey === "altura" || pergunta.systemKey === "sanfona") {
    const temLarguras = modelo && (modelo as any).largurasPadrao?.length > 0
    const temAlturas = modelo && (modelo as any).alturasPadrao?.length > 0
    const temSanfonas = modelo && (modelo as any).sanfonasPadrao?.length > 0

    if (pergunta.systemKey === "largura" && !temLarguras) return null
    if (pergunta.systemKey === "altura" && !temAlturas) return null
    if (pergunta.systemKey === "sanfona" && !temSanfonas) return null
  }

  const getValorAtual = () => {
    if (!pergunta.campoMapeado) return ""

    const partes = pergunta.campoMapeado.split(".")
    const valores = watch()
    let valor: any = valores

    for (const parte of partes) {
      if (valor && typeof valor === "object" && parte in valor) {
        valor = valor[parte]
      } else {
        return ""
      }
    }

    return valor || ""
  }

  const valorAtual = getValorAtual()

  const isOutroValor = (valor: unknown) => {
    if (valor === "outro" || valor === "Outro (Desenvolvimento)" || valor === "outro_desenvolvimento") {
      return true
    }
    if (typeof valor === "string") {
      const normalizado = valor.toLowerCase().trim()
      return (
        normalizado === "outro" ||
        normalizado === "fmt_personalizado" ||
        normalizado.includes("outro (desenvolvimento)") ||
        normalizado.includes("outro desenvolvimento")
      )
    }
    return false
  }

  const isOutroSelecionado = isOutroValor(valorAtual)

  const getCampoDescricaoOutro = () => {
    if (!pergunta.campoMapeado) return null

    const mapeamentoCampos: Record<string, string> = {
      "largura": "formato.larguraOutroDescricao",
      "altura": "formato.alturaOutroDescricao",
      "sanfona": "formato.sanfonaOutroDescricao",
      "formato_padrao": "formato.formatoOutroDescricao",
      "tipo_alca": "alca.outroDescricao",
      "largura_alca": "alca.larguraOutroDescricao",
      "cor_alca": "alca.corOutroDescricao",
      "aplicacao_alca": "alca.aplicacaoOutroDescricao",
      "substrato": "substrato.outroDescricao",
      "gramagem": "substrato.gramagemOutroDescricao",
      "tipo_impressao": "impressao.outroDescricao",
      "tipo_acabamento": "acabamentos.outroDescricao",
      "tipo_enobrecimento": "enobrecimentos.outroDescricao",
      "acondicionamento": "acondicionamento.outroDescricao",
      "modulo": "acondicionamento.moduloOutroDescricao",
    }

    if (pergunta.systemKey && mapeamentoCampos[pergunta.systemKey]) {
      return mapeamentoCampos[pergunta.systemKey]
    }

    const partes = pergunta.campoMapeado.split(".")
    if (partes.length >= 2) {
      const secao = partes[0]
      const campo = partes[partes.length - 1]
      const campoBase = campo.replace(/Id$/, "")
      return `${secao}.${campoBase}OutroDescricao`
    }

    return null
  }

  const campoDescricaoOutro = getCampoDescricaoOutro()

  const getValorDescricaoOutro = () => {
    if (!campoDescricaoOutro) return ""

    const partes = campoDescricaoOutro.split(".")
    const valores = watch()
    let valor: any = valores

    for (const parte of partes) {
      if (valor && typeof valor === "object" && parte in valor) {
        valor = valor[parte]
      } else {
        return ""
      }
    }

    return valor || ""
  }

  const valorDescricaoOutro = getValorDescricaoOutro()

  useEffect(() => {
    const isOutra = typeof condicaoPagamento === "string" &&
      (condicaoPagamento.toLowerCase().includes("outra") || condicaoPagamento === "Outra: Informar")
    if (pergunta.systemKey === "condicao_pagamento_outra" && !isOutra) {
      if (pergunta.campoMapeado) {
        setValue(pergunta.campoMapeado as any, "", { shouldValidate: false })
      }
    }
  }, [condicaoPagamento, pergunta.campoMapeado, pergunta.systemKey, setValue])

  useEffect(() => {
    if (tipoContrato === "JIT") {
      setValue("entregas.numeroEntregas", "Nao ha", { shouldValidate: false })
      setValue("entregas.frequencia", "Nao ha", { shouldValidate: false })
    } else if (tipoContrato === "PRG") {
      if (watch("entregas.numeroEntregas") === "Nao ha") {
        setValue("entregas.numeroEntregas", "", { shouldValidate: false })
      }
      if (watch("entregas.frequencia") === "Nao ha") {
        setValue("entregas.frequencia", "", { shouldValidate: false })
      }
    }
  }, [tipoContrato, setValue, watch])

  useEffect(() => {
    if (localUnico === true) {
      setValue("entregas.pedidoMinimoCIF", "Nao ha", { shouldValidate: false })
    } else if (localUnico === false && watch("entregas.pedidoMinimoCIF") === "Nao ha") {
      setValue("entregas.pedidoMinimoCIF", "", { shouldValidate: false })
    }
  }, [localUnico, setValue, watch])

  useEffect(() => {
    if (pergunta.systemKey === "frequencia_outra" && 
        frequenciaEntregas !== "Outra" && 
        frequenciaEntregas !== "Outra: Informar") {
      if (pergunta.campoMapeado) {
        setValue(pergunta.campoMapeado as any, "", { shouldValidate: false })
      }
    }
  }, [frequenciaEntregas, pergunta.campoMapeado, pergunta.systemKey, setValue])

  useEffect(() => {
    const numero = parseInt((numeroEntregas || "").toString(), 10)
    if (!Number.isNaN(numero)) {
      if (numero === 1) {
        setValue("entregas.frequencia", "\u00danica", { shouldValidate: false })
      } else if (numero > 1 && frequenciaEntregas) {
        const normalizada = frequenciaEntregas
          .toString()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
        if (normalizada === "unica") {
          setValue("entregas.frequencia", "", { shouldValidate: false })
        }
      }
    }
  }, [frequenciaEntregas, numeroEntregas, setValue])

  interface OpcaoDinamica {
    value: string
    label: string
  }

  const getOpcoesDinamicas = (): OpcaoDinamica[] => {
    const catalogo = getCatalogo()
    const chavesComOutro = new Set([
      "formato_padrao",
      "largura",
      "altura",
      "sanfona",
      "substrato",
      "gramagem",
      "tipo_alca",
      "aplicacao_alca",
      "largura_alca",
      "cor_alca",
      "tipo_impressao",
      "combinacao_cores",
      "tipo_acabamento",
      "reforco_fundo",
      "furo_fita",
      "tipo_enobrecimento",
      "acondicionamento",
      "modulo",
    ])
    const permiteOutro = pergunta.systemKey ? chavesComOutro.has(pergunta.systemKey) : false
    const isOutroOpcao = (opcao: OpcaoDinamica) => {
      const valor = opcao.value.toLowerCase()
      const label = opcao.label.toLowerCase()
      return (
        valor === "outro" ||
        valor === "outro_desenvolvimento" ||
        label === "outro (desenvolvimento)" ||
        label === "outro"
      )
    }
    const withOutro = (opcoes: OpcaoDinamica[]) => {
      const semOutro = opcoes.filter((op) => !isOutroOpcao(op))
      if (!permiteOutro) {
        return semOutro
      }
      const temOutro = opcoes.some((op) => isOutroOpcao(op))
      return temOutro ? opcoes : [...opcoes, { value: "outro", label: "Outro (Desenvolvimento)" }]
    }

    if (pergunta.opcoes && pergunta.opcoes.length > 0) {
      const opcoes = pergunta.opcoes.map(op => {
        if (op === "Outro (Desenvolvimento)" || op.toLowerCase() === "outro (desenvolvimento)") {
          return { value: "outro", label: "Outro (Desenvolvimento)" }
        }
        return { value: op, label: op }
      })

      return withOutro(opcoes)
    }

    const tamanhosPorModelo = pergunta.configuracao?.tamanhosPorModelo
    if (tamanhosPorModelo && produtoModeloId && tamanhosPorModelo[produtoModeloId]) {
      const tamanhos = tamanhosPorModelo[produtoModeloId]
      return withOutro(tamanhos.map(t => ({ value: t, label: t })))
    }

    switch (pergunta.systemKey) {
      case "tipo_contrato":
        return [
          { value: "JIT", label: "JIT" },
          { value: "PRG", label: "PRG" },
        ]

      case "imposto":
        return [
          { value: "ICMS - Revenda", label: "ICMS - Revenda" },
          { value: "ICMS - Consumo Pr\u00f3prio", label: "ICMS - Consumo Pr\u00f3prio" },
          { value: "ISS - Consumo Pr\u00f3prio", label: "ISS - Consumo Pr\u00f3prio" },
        ]

      case "condicao_pagamento":
        return [
          { value: "Dep�sito Antecipado", label: "Dep�sito Antecipado" },
          { value: "7 dd", label: "7 dd" },
          { value: "15 dd", label: "15 dd" },
          { value: "28 dd", label: "28 dd" },
          { value: "30 dd", label: "30 dd" },
          { value: "45 dd", label: "45 dd" },
          { value: "60 dd", label: "60 dd" },
          { value: "30/45 dd", label: "30/45 dd" },
          { value: "30/60 dd", label: "30/60 dd" },
          { value: "30/45/60 dd", label: "30/45/60 dd" },
          { value: "Outra: Informar", label: "Outra: Informar" },
        ]

      case "largura":
        if (produtoModeloId) {
          const larguras = getLargurasPadrao(produtoModeloId)
          return withOutro(larguras.map(l => ({ value: l.toString(), label: l.toString() })))
        }
        return withOutro([])

      case "altura":
        if (produtoModeloId) {
          const alturas = getAlturasPadrao(produtoModeloId)
          return withOutro(alturas.map(a => ({ value: a.toString(), label: a.toString() })))
        }
        return withOutro([])

      case "sanfona":
        if (produtoModeloId) {
          const sanfonas = getSanfonasPadrao(produtoModeloId)
          return withOutro(sanfonas.map(s => ({ value: s.toString(), label: s.toString() })))
        }
        return withOutro([])

      case "substrato":
        if (produtoModeloId) {
          const substratos = getSubstratosPermitidos(produtoModeloId)
          return withOutro(substratos.map(s => {
            const gramagensStr = s.gramagens.length > 0 ? ` (${s.gramagens.join(", ")}g)` : ""
            return { value: s.id, label: `${s.nome}${gramagensStr}` }
          }))
        }
        return withOutro([])

      case "gramagem":
        if (substratoId && produtoModeloId) {
          const substratos = getSubstratosPermitidos(produtoModeloId)
          const substrato = substratos.find(s => s.id === substratoId)
          if (substrato && substrato.gramagens.length > 0) {
            return withOutro(substrato.gramagens.map(g => ({ value: g, label: `${g}g` })))
          }
        }
        return withOutro([])

      case "combinacao_cores":
        if (impressaoModoId && produtoModeloId) {
          const combinacoes = getCombinacoesPermitidas(produtoModeloId, impressaoModoId)
          return withOutro(combinacoes.map(c => ({ value: c.id, label: c.codigo })))
        }
        return withOutro([])

      case "frequencia": {
        // Se JIT ou n� entregas = 1, n�o mostra o campo (j� tratado no return null acima)
        if (tipoContrato === "JIT") {
          return []
        }
        const opcoesBase = (pergunta.opcoes && pergunta.opcoes.length > 0)
          ? pergunta.opcoes
          : ["�nica", "Semanal", "Quinzenal", "Mensal", "Bimestral", "Trimestral", "Quadrimestral", "Semestral", "Outra: Informar"]
        const numero = parseInt((numeroEntregas || "").toString(), 10)
        if (!numero || Number.isNaN(numero)) {
          return []
        }
        const normalizar = (valor: string) =>
          valor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        
        // Se n� entregas > 1, remove "�nica" das op��es dispon�veis
        if (numero > 1) {
          return opcoesBase
            .filter((op) => normalizar(op) !== "unica")
            .map((op) => ({ value: op, label: op }))
        }
        
        // Se n� entregas = 1, retorna apenas "�nica" (mas o campo estar� oculto)
        const unicaLabel = opcoesBase.find((op) => normalizar(op) === "unica") || "�nica"
        return [{ value: unicaLabel, label: unicaLabel }]
      }

      case "formato_padrao":
        if (produtoModeloId) {
          const formatos = getFormatosPermitidos(produtoModeloId)
          const temOutroFormato = formatos.some(f =>
            f.nome === "Outro (Desenvolvimento)" ||
            f.nome.toLowerCase().includes("outro")
          )
          const formatosMapeados = formatos.map(f => ({ value: f.id, label: f.nome }))
          return temOutroFormato ? formatosMapeados : withOutro(formatosMapeados)
        }
        return withOutro([])

      case "tipo_impressao":
        if (produtoModeloId) {
          const modos = getImpressoesPermitidas(produtoModeloId)
          return modos.map(m => ({ value: m.id, label: m.nome }))
        }
        return catalogo.impressaoModos.map(m => ({ value: m.id, label: m.nome }))

      case "tipo_alca":
        if (produtoModeloId) {
          const tiposIds = getTiposAlcaPermitidos(produtoModeloId)
          const opcoes = tiposIds
            .map(id => catalogo.alcaTipos.find(a => a.id === id))
            .filter(Boolean)
            .map((a) => ({ value: (a as any).id, label: (a as any).nome }))
          return withOutro(opcoes)
        }
        return withOutro(catalogo.alcaTipos.map(a => ({ value: a.id, label: a.nome })))

      case "aplicacao_alca":
        if (produtoModeloId) {
          return withOutro(getAplicacoesAlcaPermitidas(produtoModeloId).map(a => ({ value: a, label: a })))
        }
        return withOutro([])

      case "largura_alca":
        if (produtoModeloId) {
          return withOutro(getLargurasAlcaPermitidas(produtoModeloId).map(l => ({ value: l.toString(), label: l.toString() })))
        }
        return withOutro([])

      case "cor_alca":
        if (produtoModeloId) {
          return withOutro(getCoresAlcaPermitidas(produtoModeloId).map(c => ({ value: c, label: c })))
        }
        return withOutro([])

      case "tipo_acabamento":
        if (produtoModeloId) {
          const nomesAcabamentos: Record<string, string> = {
            "reforco_fundo": "Refor\u00e7o de fundo",
            "furo_fita": "Furo de fita",
            "boca_palhaco": "Boca de palha\u00e7o",
            "dupla_face": "Dupla face",
            "velcro": "Velcro",
          }
          return withOutro(getAcabamentosPermitidos(produtoModeloId).map(id => ({
            value: id,
            label: nomesAcabamentos[id] || id,
          })))
        }
        return withOutro([])

      case "reforco_fundo":
        if (produtoModeloId) {
          const nomesModelos: Record<string, string> = {
            "opcao_01": "Op\u00e7\u00e3o 01",
            "opcao_02": "Op\u00e7\u00e3o 02",
            "opcao_03": "Op\u00e7\u00e3o 03",
            "opcao_04": "Op\u00e7\u00e3o 04",
            "opcao_05": "Op\u00e7\u00e3o 05",
            "opcao_06": "Op\u00e7\u00e3o 06",
            "padrao_evolution_8x8": "Op\u00e7\u00e3o Padr\u00e3o Evolution 8x8",
          }
          const modelos = getModelosReforcoFundo(produtoModeloId)
          if (modelos.length > 0) {
            return withOutro(modelos.map(id => ({ value: id, label: nomesModelos[id] || id })))
          }
        }
        return withOutro([])

      case "furo_fita":
        if (produtoModeloId) {
          const nomesFuros: Record<string, string> = {
            "opcao_01": "Op\u00e7\u00e3o 01",
            "opcao_02": "Op\u00e7\u00e3o 02",
            "opcao_03": "Op\u00e7\u00e3o 03",
            "opcao_04": "Op\u00e7\u00e3o 04",
            "opcao_05": "Op\u00e7\u00e3o 05",
            "opcao_06": "Op\u00e7\u00e3o 06",
            "padrao_evolution_8x8": "Op\u00e7\u00e3o Padr\u00e3o Evolution 8x8",
          }
          const modelosFuro = getModelosFuroFita(produtoModeloId)
          if (modelosFuro.length > 0) {
            return withOutro(modelosFuro.map(id => ({ value: id, label: nomesFuros[id] || id })))
          }
          const acabamentos = getAcabamentosPermitidos(produtoModeloId)
          if (acabamentos.includes("furo_fita")) {
            return withOutro([{ value: "furo_fita", label: "Furo de Fita" }])
          }
        }
        return withOutro([])

      case "acondicionamento":
        if (produtoModeloId) {
          const aconds = getAcondicionamentosPermitidos(produtoModeloId)
          return withOutro(aconds.map(a => ({ value: a.id, label: a.nome })))
        }
        return withOutro(catalogo.acondicionamentos.map(a => ({ value: a.id, label: a.nome })))

      case "modulo":
        return withOutro(catalogo.modulos.map(m => ({ value: m.id, label: m.nome })))

      default:
        return (pergunta.opcoes || []).map(op => ({ value: op, label: op }))
    }
  }

  const opcoesDinamicas = getOpcoesDinamicas()

  const atualizarValor = (novoValor: any) => {
    if (!pergunta.campoMapeado) return

    const caminho = pergunta.campoMapeado as any
    setValue(caminho, novoValor, { shouldValidate: true })

    if (!isOutroValor(novoValor)) {
      if (campoDescricaoOutro) {
        setValue(campoDescricaoOutro as any, "", { shouldValidate: false })
      }
    }
  }

  const atualizarDescricaoOutro = (descricao: string) => {
    if (!campoDescricaoOutro) return
    setValue(campoDescricaoOutro as any, descricao, { shouldValidate: true })
  }

  const renderCampo = () => {
    if (pergunta.systemKey === "royalties" || pergunta.systemKey === "bv_agencia") {
      const valorTexto = typeof valorAtual === "string" ? valorAtual.trim() : ""
      const valorLower = valorTexto.toLowerCase()
      const temNumero = valorLower !== "" && valorLower !== "sim" && valorLower !== "nao ha" && valorLower !== "nao"
      const isSim = valorLower === "sim" || temNumero
      const valorPercentual = temNumero ? valorTexto : ""

      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id={pergunta.id}
              checked={isSim}
              onCheckedChange={(checked) => {
                if (checked) {
                  if (!temNumero) {
                    atualizarValor("sim")
                  }
                } else {
                  // Deixa vazio quando desmarca (campo n�o obrigat�rio)
                  atualizarValor("")
                }
              }}
              className="border-white/[0.2] data-[state=checked]:bg-[#27a75c] data-[state=checked]:border-[#27a75c]"
            />
            <Label htmlFor={pergunta.id} className="cursor-pointer font-normal">
              Sim
            </Label>
          </div>
          {isSim && (
            <div className="mt-3 p-4 bg-[#27a75c]/10 border border-[#27a75c]/30 rounded-lg space-y-2">
              <Label className="text-[#27a75c] font-medium">
                Informe o percentual
                <span className="text-[#2cb866] ml-1">*</span>
              </Label>
              <Input
                type="number"
                step="0.1"
                min={0}
                value={valorPercentual}
                onChange={(e) => atualizarValor(e.target.value)}
                placeholder="Ex: 2,5"
              />
            </div>
          )}
        </div>
      )
    }

    if (pergunta.systemKey === "quantidade_orcamento") {
      const valorTexto = typeof valorAtual === "string" ? valorAtual : ""
      
      return (
        <Input
          type="text"
          value={valorTexto}
          onChange={(e) => atualizarValor(e.target.value)}
          placeholder="Ex: 3000, 4000, 6000"
          required={pergunta.obrigatorio}
        />
      )
    }

    if (pergunta.systemKey === "frete_quantidade") {
      const valorLista = Array.isArray(freteQuantidades) ? freteQuantidades : []
      const valorTexto = valorLista.length > 0
        ? valorLista.join(", ")
        : valorAtual
          ? String(valorAtual)
          : ""
      const normalizarLista = (texto: string) => {
        return texto
          .split(/[,\s;]+/)
          .map((item) => parseFloat(item))
          .filter((num) => Number.isFinite(num) && num > 0)
      }

      return (
        <Input
          type="text"
          value={valorTexto}
          onChange={(e) => {
            const texto = e.target.value
            const lista = normalizarLista(texto)
            const primeiro = lista.length > 0 ? lista[0] : undefined
            if (pergunta.campoMapeado) {
              const usarLista = pergunta.campoMapeado.endsWith("freteQuantidades")
              setValue(pergunta.campoMapeado as any, usarLista ? lista : primeiro, { shouldValidate: true })
            }
            setValue("entregas.freteQuantidades", lista.length > 0 ? lista : undefined, { shouldValidate: true })
            setValue("entregas.freteQuantidade", primeiro, { shouldValidate: false })
          }}
          placeholder={pergunta.ajuda || "Ex: 1000, 2000, 3000"}
          required={pergunta.obrigatorio}
        />
      )
    }

    if (pergunta.systemKey === "numero_entregas") {
      return (
        <Input
          type="number"
          step="1"
          min={1}
          value={valorAtual || ""}
          onChange={(e) => atualizarValor(e.target.value)}
          placeholder={pergunta.ajuda || "Informe o numero de entregas"}
          required={pergunta.obrigatorio}
        />
      )
    }

    switch (pergunta.tipo) {
      case "texto_curto":
        const isEmail = pergunta.systemKey === "email" || pergunta.campoMapeado?.includes("email")
        return (
          <Input
            type={isEmail ? "email" : "text"}
            value={valorAtual || ""}
            onChange={(e) => atualizarValor(e.target.value)}
            placeholder={pergunta.ajuda}
            required={pergunta.obrigatorio}
          />
        )

      case "texto_longo":
        return (
          <textarea
            value={valorAtual || ""}
            onChange={(e) => atualizarValor(e.target.value)}
            placeholder={pergunta.ajuda}
            required={pergunta.obrigatorio}
            className="flex min-h-[80px] w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27a75c] focus-visible:ring-offset-0 focus-visible:border-[#27a75c]/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          />
        )

      case "numero":
        const opcoesNumero = opcoesDinamicas.length > 0
          ? opcoesDinamicas
          : (pergunta.opcoes && pergunta.opcoes.length > 0
              ? pergunta.opcoes.map(op => ({ value: op, label: op }))
              : [])

        if (opcoesNumero.length > 0) {
          const valorAtualStr = valorAtual !== undefined && valorAtual !== null ? valorAtual.toString() : ""

          return (
            <Select
              value={valorAtualStr || ""}
              onValueChange={(value) => {
                if (value === "outro" || value === "Outro (Desenvolvimento)") {
                  atualizarValor("outro")
                } else if (value) {
                  const numValue = parseFloat(value)
                  atualizarValor(isNaN(numValue) ? value : numValue)
                } else {
                  atualizarValor(undefined)
                }
              }}
              disabled={opcoesNumero.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    opcoesNumero.length === 0
                      ? (produtoModeloId && pergunta.systemKey ? "Carregando opcoes..." : "Configure as opcoes na administracao")
                      : (pergunta.ajuda || "Selecione uma opcao")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {opcoesNumero.map((opcao) => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }

        const isPercentual = pergunta.systemKey?.includes("percentual")

        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.1"
              min={isPercentual ? 0 : undefined}
              max={isPercentual ? 100 : undefined}
              value={valorAtual || ""}
              onChange={(e) => atualizarValor(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder={pergunta.ajuda}
              required={pergunta.obrigatorio}
              className={isPercentual ? "flex-1" : ""}
            />
            {isPercentual && (
              <span className="text-muted-foreground font-medium">%</span>
            )}
          </div>
        )

      case "lista_opcoes":
        const opcoes = opcoesDinamicas.length > 0
          ? opcoesDinamicas
          : (pergunta.systemKey === "frequencia"
              ? []
              : (pergunta.opcoes || []).map(op => ({ value: op, label: op })))
        return (
          <Select
            value={valorAtual || ""}
            onValueChange={(value) => atualizarValor(value)}
            disabled={opcoes.length === 0}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  opcoes.length === 0
                    ? (produtoModeloId ? "Carregando opcoes..." : "Selecione primeiro o produto e modelo")
                    : (pergunta.ajuda || "Selecione uma opcao")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {opcoes.map((opcao) => (
                <SelectItem key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "lista_produtos":
        const produtosManuais = pergunta.opcoes && pergunta.opcoes.length > 0
          ? pergunta.opcoes.map(op => ({ value: op, label: op }))
          : []

        const produtosCatalogo = getProdutoTipos()
        const produtosFinais = produtosManuais.length > 0
          ? produtosManuais
          : produtosCatalogo.map(p => ({ value: p.id, label: p.nome }))

        return (
          <Select
            value={valorAtual || ""}
            onValueChange={(value) => {
              atualizarValor(value)
              if (pergunta.systemKey === "produto") {
                setValue("produto.produtoModeloId", "")
              }
            }}
            disabled={produtosFinais.length === 0}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  produtosFinais.length === 0
                    ? "Configure as opcoes na administracao"
                    : (pergunta.ajuda || "Selecione o produto")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {produtosFinais.map((produto) => (
                <SelectItem key={produto.value} value={produto.value}>
                  {produto.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "lista_modelos":
        const configModelosPorProduto = pergunta.configuracao?.modelosPorProduto
        let modelosFinais: OpcaoDinamica[] = []

        if (valorProdutoTipoId && configModelosPorProduto && configModelosPorProduto[valorProdutoTipoId]) {
          const modelosConfigurados = configModelosPorProduto[valorProdutoTipoId]
          const todosModelosDoProduto = getModelosPorTipo(valorProdutoTipoId)
          modelosFinais = todosModelosDoProduto
            .filter(m => modelosConfigurados.includes(m.nome))
            .map(m => ({ value: m.id, label: m.nome }))
        } else if (valorProdutoTipoId) {
          const modelosCatalogo = getModelosPorTipo(valorProdutoTipoId)
          modelosFinais = modelosCatalogo.map(m => ({ value: m.id, label: m.nome }))
        }

        const precisaProduto = !valorProdutoTipoId

        return (
          <Select
            value={valorAtual || ""}
            onValueChange={(value) => atualizarValor(value)}
            disabled={precisaProduto || modelosFinais.length === 0}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  precisaProduto
                    ? "Selecione primeiro o produto"
                    : modelosFinais.length === 0
                    ? (configModelosPorProduto && valorProdutoTipoId && !configModelosPorProduto[valorProdutoTipoId]
                        ? "Nenhum modelo configurado para este produto"
                        : "Configure as opcoes na administracao")
                    : (pergunta.ajuda || "Selecione o modelo")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {modelosFinais.map((modelo) => (
                <SelectItem key={modelo.value} value={modelo.value}>
                  {modelo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "booleano":
      case "checkbox":
        const valorBooleano = valorAtual === true || valorAtual === "true"
        return (
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id={pergunta.id}
              checked={valorBooleano}
              onCheckedChange={(checked) => atualizarValor(!!checked)}
            />
            <Label htmlFor={pergunta.id} className="cursor-pointer font-normal">
              {pergunta.ajuda || "Sim"}
            </Label>
          </div>
        )

      case "sim_nao":
        // Campo "Local �nico" usa checkbox em vez de dropdown
        if (pergunta.systemKey === "local_unico") {
          const valorBooleano = valorAtual === true || valorAtual === "true"
          return (
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id={pergunta.id}
                checked={valorBooleano}
                onCheckedChange={(checked) => atualizarValor(!!checked)}
                className="border-white/[0.2] data-[state=checked]:bg-[#27a75c] data-[state=checked]:border-[#27a75c]"
              />
              <Label htmlFor={pergunta.id} className="cursor-pointer font-normal">
                Sim
              </Label>
            </div>
          )
        }
        
        // Outros campos sim_nao usam dropdown
        return (
          <Select
            value={valorAtual === true ? "sim" : valorAtual === false ? "nao" : ""}
            onValueChange={(value) => atualizarValor(value === "sim")}
          >
            <SelectTrigger>
              <SelectValue placeholder={pergunta.ajuda || "Selecione"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">N\u00e3o</SelectItem>
            </SelectContent>
          </Select>
        )

      default:
        return (
          <Input
            value={valorAtual || ""}
            onChange={(e) => atualizarValor(e.target.value)}
            placeholder={`Tipo n\u00e3o suportado: ${pergunta.tipo}`}
            disabled
          />
        )
    }
  }

  const getErro = () => {
    if (!pergunta.campoMapeado) return null

    const partes = pergunta.campoMapeado.split(".")
    let erro: any = errors

    for (const parte of partes) {
      if (erro && typeof erro === "object" && parte in erro) {
        erro = erro[parte]
      } else {
        return null
      }
    }

    if (!erro?.message && pergunta.systemKey === "frete_quantidade") {
      const erroFrete = (errors as any)?.entregas?.freteQuantidades
      return erroFrete?.message || null
    }

    return erro?.message || null
  }

  const erro = getErro()

  if (pergunta.systemKey === "condicao_pagamento_outra" && condicaoPagamento !== "Outra: Informar") {
    return null
  }

  // L�GICA 1: Frequ�ncia - s� mostra se n� entregas > 1
  // Se n� entregas = 1, a frequ�ncia � automaticamente "�nica" e o campo n�o aparece
  if (pergunta.systemKey === "frequencia") {
    const numero = parseInt((numeroEntregas || "").toString(), 10)
    if (tipoContrato === "JIT" || !numero || Number.isNaN(numero) || numero <= 0) {
      return null
    }
  }

  // L�GICA 2: Frequ�ncia (Outra) - s� aparece se selecionar "Outra: Informar"
  if (pergunta.systemKey === "frequencia_outra" && 
      frequenciaEntregas !== "Outra: Informar" && 
      frequenciaEntregas !== "Outra") {
    return null
  }

  // L�GICA 3: Pedido M�nimo CIF - s� aparece se Local �nico = N�o (false)
  if (pergunta.systemKey === "pedido_minimo_cif" && localUnico !== false) {
    return null
  }

  // Ocultar campos removidos da etapa de entregas
  if (pergunta.systemKey === "qtd_local_unico") {
    return null
  }

  if (pergunta.systemKey === "cidades_uf_multiplas") {
    return null
  }

  if (pergunta.systemKey === "anexar_lista_lojas") {
    return null
  }

  if (pergunta.systemKey === "frete_quantidade") {
    return null
  }

  const tituloCampo = pergunta.systemKey === "frete_quantidade" ? "Quantidades" : pergunta.titulo
  const ajudaCampo = pergunta.systemKey === "frete_quantidade"
    ? "Informe a tiragem do produto para orcamento. Separe por virgula."
    : pergunta.ajuda

  const numeroEntregasNumero = parseInt((numeroEntregas || "").toString(), 10)
  const mostraLegendaFrequenciaUnica = pergunta.systemKey === "frequencia" &&
    !Number.isNaN(numeroEntregasNumero) &&
    numeroEntregasNumero === 1 &&
    tipoContrato === "PRG"

  if (!pergunta.ativo) {
    return null
  }

  const isCampoBooleano = (pergunta.tipo === "booleano" || pergunta.tipo === "checkbox") &&
    pergunta.systemKey !== "royalties" &&
    pergunta.systemKey !== "bv_agencia"

  return (
    <div className="space-y-2">
      {!isCampoBooleano && (
        <Label htmlFor={pergunta.id} className="text-gray-300 font-medium">
          {tituloCampo}
          {pergunta.obrigatorio && <span className="text-[#27a75c] ml-1">*</span>}
        </Label>
      )}
      {mostraLegendaFrequenciaUnica && (
        <p className="text-xs text-[#27a75c]/70">
          Como só existe uma entrega, habilitamos apenas “Única”. Para alterar a frequência, cadastre um número de entregas maior que 1.
        </p>
      )}
      {isCampoBooleano ? (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={pergunta.id}
            checked={valorAtual === true || valorAtual === "true"}
            onCheckedChange={(checked) => atualizarValor(!!checked)}
            className="border-white/[0.2] data-[state=checked]:bg-[#27a75c] data-[state=checked]:border-[#27a75c]"
          />
          <Label htmlFor={pergunta.id} className="cursor-pointer text-gray-300">
            {tituloCampo}
            {pergunta.obrigatorio && <span className="text-[#27a75c] ml-1">*</span>}
          </Label>
        </div>
      ) : (
        renderCampo()
      )}
      {ajudaCampo && !isCampoBooleano && !isOutroSelecionado && (
        <p className="text-sm text-[#27a75c]/60">{ajudaCampo}</p>
      )}

      {isOutroSelecionado && campoDescricaoOutro && (
        <div className="mt-3 p-4 bg-[#27a75c]/10 border border-[#27a75c]/30 rounded-lg space-y-2">
          <Label htmlFor={`${pergunta.id}-outro`} className="text-[#27a75c] font-medium">
            Descreva o que voce precisa para a Engenharia
            <span className="text-[#2cb866] ml-1">*</span>
          </Label>
          <textarea
            id={`${pergunta.id}-outro`}
            value={valorDescricaoOutro}
            onChange={(e) => atualizarDescricaoOutro(e.target.value)}
            placeholder="Descreva detalhadamente o que voce precisa que seja desenvolvido pela equipe de engenharia..."
            className="flex min-h-[100px] w-full rounded-md border border-[#27a75c]/30 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27a75c] focus-visible:ring-offset-0"
            required
          />
          <p className="text-xs text-[#27a75c]/70">
            Este campo sera enviado para a equipe de engenharia avaliar o desenvolvimento.
          </p>
        </div>
      )}

      {erro && (
        <p className="text-sm text-red-400">{erro}</p>
      )}
    </div>
  )
}



