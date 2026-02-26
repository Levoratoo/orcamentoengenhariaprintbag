"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  getProdutoTipos, 
  getModelosPorTipo, 
  getLargurasPadrao, 
  getAlturasPadrao, 
  getSanfonasPadrao,
  getFormatosPermitidos,
  getSubstratosPermitidos,
  getTiposAlcaPermitidos,
  getAplicacoesAlcaPermitidas,
  getLargurasAlcaPermitidas,
  getCoresAlcaPermitidas,
  getCatalogo,
  getModosImpressaoPermitidos,
  getAcabamentosPermitidos,
  getModelosReforcoFundo,
  getModelosFuroFita
} from "@/lib/catalogo"

// Campos que podem ser configurados por modelo de produto
const CAMPOS_CONFIGURAVEIS_POR_MODELO = [
  "largura", "altura", "sanfona", "formato_padrao", // Tamanhos
  "substrato", "gramagem", // Material
  "tipo_alca", "aplicacao_alca", "largura_alca", "cor_alca", // Alça
  "tipo_impressao", // Impressão
  "tipo_acabamento", "reforco_fundo", "furo_fita" // Acabamentos
]

interface FormularioPergunta {
  id: string
  titulo: string
  ajuda?: string
  tipo: string
  obrigatorio: boolean
  ativo: boolean
  ordem: number
  opcoes: string[]
  configuracao?: any
  campoMapeado?: string
  isSystem: boolean
  systemKey?: string
  formularioEtapaId: string
  formularioEtapa: {
    id: string
    nome: string
  }
}

const TIPOS_PERGUNTA = [
  { value: "texto_curto", label: "Resposta curta" },
  { value: "texto_longo", label: "Resposta longa" },
  { value: "numero", label: "Número" },
  { value: "data", label: "Data" },
  { value: "lista_opcoes", label: "Lista de opções" },
  { value: "lista_produtos", label: "Lista de produtos" },
  { value: "lista_modelos", label: "Lista de modelos" },
  { value: "booleano", label: "Sim/Não (checkbox)" },
]

export default function EditarPerguntaPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pergunta, setPergunta] = useState<FormularioPergunta | null>(null)
  const [formData, setFormData] = useState({
    titulo: "",
    ajuda: "",
    tipo: "texto_curto",
    obrigatorio: false,
    ativo: true,
    ordem: 1,
    opcoes: [] as string[],
    campoMapeado: "",
    configuracao: {} as any,
  })
  const [novaOpcao, setNovaOpcao] = useState("")
  const [produtoSelecionadoParaModelos, setProdutoSelecionadoParaModelos] = useState("")
  const [modelosPorProduto, setModelosPorProduto] = useState<Record<string, string[]>>({})
  const [novoModeloPorProduto, setNovoModeloPorProduto] = useState<Record<string, string>>({})
  
  // Estados para configuração de valores por modelo (tamanhos, materiais, etc.)
  const [tamanhosPorModelo, setTamanhosPorModelo] = useState<Record<string, string[]>>({})
  const [novoTamanhoPorModelo, setNovoTamanhoPorModelo] = useState<Record<string, string>>({})

  useEffect(() => {
    if (params.id) {
      carregarPergunta()
    }
  }, [params.id])

  // Carregar produtos automaticamente quando o tipo mudar e não tiver opções
  useEffect(() => {
    // Só carregar se não tiver opções definidas
    if (formData.tipo === "lista_produtos" && formData.opcoes.length === 0) {
      const produtos = getProdutoTipos()
      const nomesProdutos = produtos.map(p => p.nome)
      if (nomesProdutos.length > 0) {
        setFormData(prev => ({
          ...prev,
          opcoes: nomesProdutos
        }))
      }
    }
    // Para lista_modelos, não carregar automaticamente - usuário deve configurar por produto
  }, [formData.tipo])

  const carregarPergunta = async () => {
    try {
      const response = await fetch(`/api/engenharia/formulario/perguntas/${params.id}`)
      if (!response.ok) throw new Error("Erro ao carregar pergunta")
      const data = await response.json()
      setPergunta(data)
      
      let opcoesIniciais = data.opcoes || []
      
      // Se não tem opções e é lista_produtos, carregar do catálogo
      if (opcoesIniciais.length === 0 && data.tipo === "lista_produtos") {
        const produtos = getProdutoTipos()
        opcoesIniciais = produtos.map(p => p.nome)
      }
      
      // Carregar configuração de modelos por produto se existir
      if (data.tipo === "lista_modelos") {
        if (data.configuracao?.modelosPorProduto && Object.keys(data.configuracao.modelosPorProduto).length > 0) {
          // Se já tem configuração salva, usar ela
          setModelosPorProduto(data.configuracao.modelosPorProduto)
        } else {
          // Se não tem configuração, carregar todos os produtos com todos os modelos
          const todosOsProdutos: Record<string, string[]> = {}
          const produtosDisponiveis = getProdutoTipos()
          produtosDisponiveis.forEach(produto => {
            const modelosDoProduto = getModelosPorTipo(produto.id)
            todosOsProdutos[produto.id] = modelosDoProduto.map(m => m.nome)
          })
          setModelosPorProduto(todosOsProdutos)
        }
      }
      
      // Carregar configuração de valores por modelo (para campos configuráveis)
      // SEMPRE carrega todos os modelos do catálogo, mesclando com configuração existente
      if (CAMPOS_CONFIGURAVEIS_POR_MODELO.includes(data.systemKey)) {
        const configuracaoSalva = data.configuracao?.tamanhosPorModelo || {}
        const todosValores: Record<string, string[]> = {}
        
        // Carregar TODOS os modelos com seus valores do catálogo
        const produtosDisponiveis = getProdutoTipos()
        produtosDisponiveis.forEach(produto => {
          const modelosDoProduto = getModelosPorTipo(produto.id)
          modelosDoProduto.forEach(modelo => {
            // Se já tem configuração salva para este modelo, usar ela
            if (configuracaoSalva[modelo.id]) {
              todosValores[modelo.id] = configuracaoSalva[modelo.id]
            } else {
              // Senão, carregar do catálogo
              let valores: string[] = []
              if (data.systemKey === "largura") {
                valores = getLargurasPadrao(modelo.id).map(t => String(t))
              } else if (data.systemKey === "altura") {
                valores = getAlturasPadrao(modelo.id).map(t => String(t))
              } else if (data.systemKey === "sanfona") {
                valores = getSanfonasPadrao(modelo.id).map(t => String(t))
              } else if (data.systemKey === "formato_padrao") {
                valores = getFormatosPermitidos(modelo.id).map(f => f.nome)
              } else if (data.systemKey === "substrato") {
                const substratos = getSubstratosPermitidos(modelo.id)
                substratos.forEach(sub => {
                  if (sub.gramagens && sub.gramagens.length > 0) {
                    sub.gramagens.forEach(gram => {
                      valores.push(`${sub.nome} ${gram}g`)
                    })
                  } else {
                    valores.push(sub.nome)
                  }
                })
              } else if (data.systemKey === "gramagem") {
                const substratos = getSubstratosPermitidos(modelo.id)
                substratos.forEach(sub => {
                  if (sub.gramagens && sub.gramagens.length > 0) {
                    sub.gramagens.forEach(gram => {
                      const valor = `${gram}g`
                      if (!valores.includes(valor)) {
                        valores.push(valor)
                      }
                    })
                  }
                })
                // Ordenar numericamente
                valores.sort((a, b) => parseInt(a) - parseInt(b))
              } else if (data.systemKey === "tipo_alca") {
                const tiposIds = getTiposAlcaPermitidos(modelo.id)
                const catalogo = getCatalogo()
                tiposIds.forEach(id => {
                  const tipo = catalogo.alcaTipos.find(a => a.id === id)
                  valores.push(tipo ? tipo.nome : id)
                })
              } else if (data.systemKey === "aplicacao_alca") {
                valores.push(...getAplicacoesAlcaPermitidas(modelo.id))
              } else if (data.systemKey === "largura_alca") {
                const larguras = getLargurasAlcaPermitidas(modelo.id)
                valores.push(...larguras.map(l => `${l}`))
              } else if (data.systemKey === "cor_alca") {
                valores.push(...getCoresAlcaPermitidas(modelo.id))
              } else if (data.systemKey === "tipo_impressao") {
                const modos = getModosImpressaoPermitidos(modelo.id)
                valores.push(...modos.map(m => m.nome))
              } else if (data.systemKey === "tipo_acabamento") {
                const acabamentos = getAcabamentosPermitidos(modelo.id)
                // Mapear IDs para nomes amigáveis
                const nomesAcabamentos: Record<string, string> = {
                  "reforco_fundo": "Reforço de fundo",
                  "furo_fita": "Furo de fita",
                  "boca_palhaco": "Boca de palhaço",
                  "dupla_face": "Dupla face",
                  "velcro": "Velcro"
                }
                valores.push(...acabamentos.map(id => nomesAcabamentos[id] || id))
              } else if (data.systemKey === "reforco_fundo") {
                const modelosReforco = getModelosReforcoFundo(modelo.id)
                // Mapear IDs para nomes amigáveis
                const nomesModelos: Record<string, string> = {
                  "solto_pacote": "Solto no pacote",
                  "solto_sacola_pe": "Solto na sacola (em pé)",
                  "solto_fundo": "Solto no fundo",
                  "encaixado_fundo": "Encaixado no fundo",
                  "colado_fundo": "Colado no fundo",
                  "colado_exigencia_elegance": "Colado (exigência linha Elegance)"
                }
                valores.push(...modelosReforco.map(id => nomesModelos[id] || id))
              } else if (data.systemKey === "furo_fita") {
                const modelosFuro = getModelosFuroFita(modelo.id)
                // Se tem modelos específicos, usa eles; senão, apenas oferece Sim/Não para quem tem acabamento
                if (modelosFuro && modelosFuro.length > 0) {
                  const nomesFuros: Record<string, string> = {
                    "opcao_01": "Opção 01",
                    "opcao_02": "Opção 02",
                    "opcao_03": "Opção 03",
                    "opcao_04": "Opção 04",
                    "opcao_05": "Opção 05",
                    "opcao_06": "Opção 06",
                    "padrao_evolution_8x8": "Opção Padrão Evolution 8x8"
                  }
                  valores.push(...modelosFuro.map(id => nomesFuros[id] || id))
                } else {
                  // Verificar se o modelo tem furo_fita nos acabamentos
                  const acabamentos = getAcabamentosPermitidos(modelo.id)
                  if (acabamentos.includes("furo_fita")) {
                    valores.push("Furo de Fita")
                  }
                }
              }
              if (valores.length > 0) {
                todosValores[modelo.id] = valores
              }
            }
          })
        })
        setTamanhosPorModelo(todosValores)
      }
      
      setFormData({
        titulo: data.titulo,
        ajuda: data.ajuda || "",
        tipo: data.tipo,
        obrigatorio: data.obrigatorio,
        ativo: data.ativo,
        ordem: data.ordem,
        opcoes: opcoesIniciais,
        campoMapeado: data.campoMapeado || "",
        configuracao: data.configuracao || {},
      })
    } catch (error) {
      console.error("Erro ao carregar pergunta:", error)
      alert("Erro ao carregar pergunta")
    } finally {
      setLoading(false)
    }
  }

  // Carregar modelos quando um produto for selecionado para configuração
  const produtos = getProdutoTipos()

  const handleAdicionarProdutoParaModelos = () => {
    if (produtoSelecionadoParaModelos && !modelosPorProduto[produtoSelecionadoParaModelos]) {
      // Adicionar o produto com todos os seus modelos já selecionados
      const modelosDoProduto = getModelosPorTipo(produtoSelecionadoParaModelos)
      setModelosPorProduto(prev => ({
        ...prev,
        [produtoSelecionadoParaModelos]: modelosDoProduto.map(m => m.nome)
      }))
      setProdutoSelecionadoParaModelos("")
    }
  }

  const handleToggleModelo = (produtoId: string, modeloNome: string) => {
    setModelosPorProduto(prev => {
      const modelosAtuais = prev[produtoId] || []
      const temModelo = modelosAtuais.includes(modeloNome)
      return {
        ...prev,
        [produtoId]: temModelo
          ? modelosAtuais.filter(m => m !== modeloNome)
          : [...modelosAtuais, modeloNome]
      }
    })
  }

  const handleRemoverProduto = (produtoId: string) => {
    setModelosPorProduto(prev => {
      const novo = { ...prev }
      delete novo[produtoId]
      return novo
    })
  }

  const handleAdicionarModeloCustomizado = (produtoId: string) => {
    const novoModelo = novoModeloPorProduto[produtoId]?.trim()
    if (novoModelo && !modelosPorProduto[produtoId]?.includes(novoModelo)) {
      setModelosPorProduto(prev => ({
        ...prev,
        [produtoId]: [...(prev[produtoId] || []), novoModelo]
      }))
      setNovoModeloPorProduto(prev => ({
        ...prev,
        [produtoId]: ""
      }))
    }
  }

  // Funções para manipular valores por modelo
  const handleToggleTamanho = (modeloId: string, tamanho: string) => {
    setTamanhosPorModelo(prev => {
      const tamanhosAtuais = prev[modeloId] || []
      const temTamanho = tamanhosAtuais.includes(tamanho)
      return {
        ...prev,
        [modeloId]: temTamanho
          ? tamanhosAtuais.filter(t => t !== tamanho)
          : [...tamanhosAtuais, tamanho]
      }
    })
  }

  const handleRemoverModeloTamanhos = (modeloId: string) => {
    setTamanhosPorModelo(prev => {
      const novo = { ...prev }
      delete novo[modeloId]
      return novo
    })
  }

  const handleAdicionarTamanhoCustomizado = (modeloId: string) => {
    const novoTamanho = novoTamanhoPorModelo[modeloId]?.trim()
    if (novoTamanho && !tamanhosPorModelo[modeloId]?.includes(novoTamanho)) {
      setTamanhosPorModelo(prev => ({
        ...prev,
        [modeloId]: [...(prev[modeloId] || []), novoTamanho]
      }))
      setNovoTamanhoPorModelo(prev => ({
        ...prev,
        [modeloId]: ""
      }))
    }
  }

  // Helper para obter todos os modelos disponíveis
  const getTodosModelos = () => {
    const modelos: { id: string; nome: string; produtoNome: string }[] = []
    const produtosDisponiveis = getProdutoTipos()
    produtosDisponiveis.forEach(produto => {
      const modelosDoProduto = getModelosPorTipo(produto.id)
      modelosDoProduto.forEach(modelo => {
        modelos.push({ id: modelo.id, nome: modelo.nome, produtoNome: produto.nome })
      })
    })
    return modelos
  }

  // Helper para obter valores do catálogo para um modelo baseado no tipo de campo
  const getValoresDoCatalogo = (modeloId: string): string[] => {
    if (pergunta?.systemKey === "largura") {
      return getLargurasPadrao(modeloId).map(t => String(t))
    } else if (pergunta?.systemKey === "altura") {
      return getAlturasPadrao(modeloId).map(t => String(t))
    } else if (pergunta?.systemKey === "sanfona") {
      return getSanfonasPadrao(modeloId).map(t => String(t))
    } else if (pergunta?.systemKey === "formato_padrao") {
      return getFormatosPermitidos(modeloId).map(f => f.nome)
    } else if (pergunta?.systemKey === "substrato") {
      // Retornar substratos com suas gramagens no formato "Nome XXg"
      const substratos = getSubstratosPermitidos(modeloId)
      const valores: string[] = []
      substratos.forEach(sub => {
        if (sub.gramagens && sub.gramagens.length > 0) {
          sub.gramagens.forEach(gram => {
            valores.push(`${sub.nome} ${gram}g`)
          })
        } else {
          valores.push(sub.nome)
        }
      })
      return valores
    } else if (pergunta?.systemKey === "gramagem") {
      // Retornar todas as gramaturas disponíveis para os substratos deste modelo
      const substratos = getSubstratosPermitidos(modeloId)
      const valores: string[] = []
      substratos.forEach(sub => {
        if (sub.gramagens && sub.gramagens.length > 0) {
          sub.gramagens.forEach(gram => {
            const valor = `${gram}g`
            if (!valores.includes(valor)) {
              valores.push(valor)
            }
          })
        }
      })
      // Ordenar numericamente
      valores.sort((a, b) => parseInt(a) - parseInt(b))
      return valores
    } else if (pergunta?.systemKey === "tipo_alca") {
      // Retornar tipos de alça permitidos para este modelo
      const tiposIds = getTiposAlcaPermitidos(modeloId)
      const catalogo = getCatalogo()
      return tiposIds.map(id => {
        const tipo = catalogo.alcaTipos.find(a => a.id === id)
        return tipo ? tipo.nome : id
      })
    } else if (pergunta?.systemKey === "aplicacao_alca") {
      // Retornar aplicações de alça permitidas
      return getAplicacoesAlcaPermitidas(modeloId)
    } else if (pergunta?.systemKey === "largura_alca") {
      // Retornar larguras de alça permitidas
      const larguras = getLargurasAlcaPermitidas(modeloId)
      return larguras.map(l => `${l}`)
    } else if (pergunta?.systemKey === "cor_alca") {
      // Retornar cores de alça permitidas
      return getCoresAlcaPermitidas(modeloId)
    } else if (pergunta?.systemKey === "tipo_impressao") {
      // Retornar modos de impressão permitidos
      const modos = getModosImpressaoPermitidos(modeloId)
      return modos.map(m => m.nome)
    } else if (pergunta?.systemKey === "tipo_acabamento") {
      // Retornar acabamentos permitidos
      const acabamentos = getAcabamentosPermitidos(modeloId)
      const nomesAcabamentos: Record<string, string> = {
        "reforco_fundo": "Reforço de fundo",
        "furo_fita": "Furo de fita",
        "boca_palhaco": "Boca de palhaço",
        "dupla_face": "Dupla face",
        "velcro": "Velcro"
      }
      return acabamentos.map(id => nomesAcabamentos[id] || id)
    } else if (pergunta?.systemKey === "reforco_fundo") {
      // Retornar modelos de reforço de fundo permitidos
      const modelos = getModelosReforcoFundo(modeloId)
      const nomesModelos: Record<string, string> = {
        "solto_pacote": "Solto no pacote",
        "solto_sacola_pe": "Solto na sacola (em pé)",
        "solto_fundo": "Solto no fundo",
        "encaixado_fundo": "Encaixado no fundo",
        "colado_fundo": "Colado no fundo",
        "colado_exigencia_elegance": "Colado (exigência linha Elegance)"
      }
      return modelos.map(id => nomesModelos[id] || id)
    } else if (pergunta?.systemKey === "furo_fita") {
      // Retornar modelos de furo de fita permitidos
      const modelosFuro = getModelosFuroFita(modeloId)
      if (modelosFuro && modelosFuro.length > 0) {
        const nomesFuros: Record<string, string> = {
          "opcao_01": "Opção 01",
          "opcao_02": "Opção 02",
          "opcao_03": "Opção 03",
          "opcao_04": "Opção 04",
          "opcao_05": "Opção 05",
          "opcao_06": "Opção 06",
          "padrao_evolution_8x8": "Opção Padrão Evolution 8x8"
        }
        return modelosFuro.map(id => nomesFuros[id] || id)
      } else {
        // Verificar se o modelo tem furo_fita nos acabamentos
        const acabamentos = getAcabamentosPermitidos(modeloId)
        if (acabamentos.includes("furo_fita")) {
          return ["Furo de Fita"]
        }
      }
      return []
    }
    return []
  }

  // Atualizar configuracao quando modelosPorProduto mudar
  useEffect(() => {
    if (formData.tipo === "lista_modelos") {
      setFormData(prev => ({
        ...prev,
        configuracao: Object.keys(modelosPorProduto).length > 0
          ? { modelosPorProduto: modelosPorProduto }
          : {}
      }))
    }
  }, [modelosPorProduto, formData.tipo])

  // Atualizar configuracao quando tamanhosPorModelo mudar
  useEffect(() => {
    if (pergunta && CAMPOS_CONFIGURAVEIS_POR_MODELO.includes(pergunta.systemKey || "")) {
      setFormData(prev => ({
        ...prev,
        configuracao: Object.keys(tamanhosPorModelo).length > 0
          ? { ...prev.configuracao, tamanhosPorModelo: tamanhosPorModelo }
          : { ...prev.configuracao }
      }))
    }
  }, [tamanhosPorModelo, pergunta])

  const handleSalvar = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/engenharia/formulario/perguntas/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.erro || "Erro ao salvar pergunta")
        return
      }

      router.push(`/engenharia/formulario?etapa=${pergunta?.formularioEtapaId}`)
    } catch (error) {
      console.error("Erro ao salvar pergunta:", error)
      alert("Erro ao salvar pergunta")
    } finally {
      setSaving(false)
    }
  }

  const handleAdicionarOpcao = () => {
    if (novaOpcao.trim()) {
      setFormData({
        ...formData,
        opcoes: [...formData.opcoes, novaOpcao.trim()],
      })
      setNovaOpcao("")
    }
  }

  const handleRemoverOpcao = (index: number) => {
    setFormData({
      ...formData,
      opcoes: formData.opcoes.filter((_, i) => i !== index),
    })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-white/70">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!pergunta) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-[#111c2e] border-[#27a75c]/20">
            <CardContent className="py-12 text-center">
              <p className="text-white/60 mb-4">Pergunta não encontrada</p>
              <Link href="/engenharia/formulario">
                <Button className="bg-[#27a75c] hover:bg-[#27a75c]/90 text-white">Voltar</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Editar Pergunta
            </h1>
            <p className="text-lg text-white/60">
              {pergunta.formularioEtapa.nome}
            </p>
          </div>
          <Link href={`/engenharia/formulario?etapa=${pergunta.formularioEtapaId}`}>
            <Button variant="outline" className="border-[#27a75c]/50 text-[#27a75c] hover:bg-[#27a75c]/10 hover:text-[#27a75c]">Voltar</Button>
          </Link>
        </div>

        <Card className="bg-[#111c2e] border-[#27a75c]/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-white">Configurações da Pergunta</CardTitle>
              {pergunta.isSystem && (
                <Badge className="bg-[#00477a] text-white hover:bg-[#00477a]/90">Pergunta Base</Badge>
              )}
            </div>
            <CardDescription>
              {pergunta.isSystem && (
                <span className="text-orange-400">
                  Esta é uma pergunta base do sistema. Você pode renomeá-la e ajustar suas configurações, mas não pode removê-la.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-white/90">Título da Pergunta *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Empresa / Unidade"
                className="bg-[#0a1628] border-[#27a75c]/30 text-white placeholder:text-white/40 focus:border-[#27a75c] focus:ring-[#27a75c]/20"
              />
              <p className="text-sm text-white/50">
                Este é o texto que aparecerá no formulário
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ajuda" className="text-white/90">Texto de Ajuda</Label>
              <Input
                id="ajuda"
                value={formData.ajuda}
                onChange={(e) => setFormData({ ...formData, ajuda: e.target.value })}
                placeholder="Texto explicativo que ajuda o usuário a preencher"
                className="bg-[#0a1628] border-[#27a75c]/30 text-white placeholder:text-white/40 focus:border-[#27a75c] focus:ring-[#27a75c]/20"
              />
              <p className="text-sm text-white/50">
                Aparece como dica abaixo do campo
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-white/90">Tipo de Pergunta *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger id="tipo" className="bg-[#0a1628] border-[#27a75c]/30 text-white focus:border-[#27a75c] focus:ring-[#27a75c]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111c2e] border-[#27a75c]/30">
                  {TIPOS_PERGUNTA.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value} className="text-white hover:bg-[#27a75c]/20 focus:bg-[#27a75c]/20 focus:text-white">
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(formData.tipo === "lista_opcoes" || formData.tipo === "lista_produtos" || formData.tipo === "numero") && 
             !CAMPOS_CONFIGURAVEIS_POR_MODELO.includes(pergunta?.systemKey || "") && (
              <div className="space-y-2 border border-[#27a75c]/20 rounded-lg p-4 bg-[#0a1628]/50">
                <Label className="text-white/90">
                  {formData.tipo === "lista_produtos" ? "Produtos da Lista" :
                   "Opções da Lista"}
                </Label>
                <p className="text-sm text-white/50 mb-2">
                  {formData.tipo === "lista_produtos"
                    ? "Adicione os produtos que aparecerão no dropdown. Se deixar vazio, o sistema carregará todos os produtos disponíveis."
                    : "Adicione as opções que aparecerão no dropdown"}
                </p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={novaOpcao}
                    onChange={(e) => setNovaOpcao(e.target.value)}
                    placeholder="Digite uma opção e pressione Enter"
                    onKeyPress={(e) => e.key === "Enter" && handleAdicionarOpcao()}
                    className="bg-[#0a1628] border-[#27a75c]/30 text-white placeholder:text-white/40 focus:border-[#27a75c] focus:ring-[#27a75c]/20"
                  />
                  <Button type="button" onClick={handleAdicionarOpcao} className="bg-[#27a75c] hover:bg-[#27a75c]/90 text-white">
                    Adicionar
                  </Button>
                </div>
                {formData.opcoes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white/80">Opções definidas ({formData.opcoes.length}):</p>
                    {formData.opcoes.map((opcao, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-[#00477a]/20 rounded border border-[#00477a]/30">
                        <span className="flex-1 text-white/90">{opcao}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoverOpcao(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {formData.tipo === "lista_produtos" && formData.opcoes.length > 0 && (
                  <p className="text-sm text-white/50 mt-2 flex items-center gap-1">
                    <span>💡</span>
                    <span>Produtos carregados do catálogo. Você pode editar, remover ou adicionar novos.</span>
                  </p>
                )}
              </div>
            )}

            {formData.tipo === "lista_modelos" && (
              <div className="space-y-4 border border-[#27a75c]/20 rounded-lg p-4 bg-[#0a1628]/50">
                <div>
                  <Label className="text-white/90">Configurar Modelos por Tipo de Produto</Label>
                  {pergunta.isSystem && pergunta.systemKey && (
                    <span className="text-sm text-white/50 font-normal ml-2">
                      (Pergunta do sistema: {pergunta.systemKey})
                    </span>
                  )}
                  <p className="text-sm text-white/50 mb-4">
                    Defina quais modelos aparecerão quando cada tipo de produto for selecionado. 
                    Se não configurar nenhum produto, o sistema mostrará todos os modelos do produto selecionado.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Selecionar produto para configurar */}
                  <div className="flex gap-2">
                    <Select
                      value={produtoSelecionadoParaModelos}
                      onValueChange={setProdutoSelecionadoParaModelos}
                    >
                      <SelectTrigger className="flex-1 bg-[#0a1628] border-[#27a75c]/30 text-white focus:border-[#27a75c] focus:ring-[#27a75c]/20">
                        <SelectValue placeholder="Selecione um tipo de produto para configurar" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111c2e] border-[#27a75c]/30">
                        {produtos
                          .filter(p => !modelosPorProduto[p.id])
                          .map((produto) => (
                            <SelectItem key={produto.id} value={produto.id} className="text-white hover:bg-[#27a75c]/20 focus:bg-[#27a75c]/20 focus:text-white">
                              {produto.nome}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      onClick={handleAdicionarProdutoParaModelos}
                      disabled={!produtoSelecionadoParaModelos}
                      className="bg-[#27a75c] hover:bg-[#27a75c]/90 text-white disabled:opacity-50"
                    >
                      Adicionar Produto
                    </Button>
                  </div>

                  {/* Lista de produtos configurados */}
                  {Object.keys(modelosPorProduto).length > 0 && (
                    <div className="space-y-3">
                      {Object.entries(modelosPorProduto).map(([produtoId, modelosSelecionados]) => {
                        const produto = produtos.find(p => p.id === produtoId)
                        const modelosDoProduto = produto ? getModelosPorTipo(produtoId) : []
                        
                        return (
                          <div key={produtoId} className="border border-[#00477a]/30 rounded-lg p-4 space-y-3 bg-[#00477a]/10">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-white">{produto?.nome || produtoId}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoverProduto(produtoId)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              >
                                Remover
                              </Button>
                            </div>
                            
                            {/* Modelos do catálogo */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {modelosDoProduto.map((modelo) => {
                                const estaSelecionado = modelosSelecionados.includes(modelo.nome)
                                return (
                                  <div
                                    key={modelo.id}
                                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors min-w-0 ${
                                      estaSelecionado
                                        ? "bg-[#27a75c]/20 border-[#27a75c]"
                                        : "bg-[#0a1628]/50 border-white/10 hover:bg-[#0a1628]"
                                    }`}
                                    onClick={() => handleToggleModelo(produtoId, modelo.nome)}
                                  >
                                    <Checkbox
                                      checked={estaSelecionado}
                                      onCheckedChange={() => handleToggleModelo(produtoId, modelo.nome)}
                                      className="flex-shrink-0 border-[#27a75c]/50 data-[state=checked]:bg-[#27a75c] data-[state=checked]:border-[#27a75c]"
                                    />
                                    <Label className="cursor-pointer flex-1 text-sm break-words min-w-0 text-white/80">
                                      {modelo.nome}
                                    </Label>
                                  </div>
                                )
                              })}
                              {/* Modelos adicionados manualmente (não estão no catálogo) */}
                              {modelosSelecionados
                                .filter(m => !modelosDoProduto.some(mp => mp.nome === m))
                                .map((modeloCustom) => (
                                  <div
                                    key={modeloCustom}
                                    className="flex items-center gap-2 p-2 rounded border border-[#27a75c] bg-[#27a75c]/20 min-w-0"
                                  >
                                    <Checkbox
                                      checked={true}
                                      onCheckedChange={() => handleToggleModelo(produtoId, modeloCustom)}
                                      className="flex-shrink-0 border-[#27a75c]/50 data-[state=checked]:bg-[#27a75c] data-[state=checked]:border-[#27a75c]"
                                    />
                                    <Label className="cursor-pointer flex-1 text-sm break-words min-w-0 text-white/80">
                                      {modeloCustom}
                                    </Label>
                                  </div>
                                ))}
                            </div>

                            {/* Campo para adicionar modelo customizado */}
                            <div className="flex gap-2 mt-3">
                              <Input
                                value={novoModeloPorProduto[produtoId] || ""}
                                onChange={(e) => setNovoModeloPorProduto(prev => ({
                                  ...prev,
                                  [produtoId]: e.target.value
                                }))}
                                placeholder="Nome do novo modelo"
                                onKeyPress={(e) => e.key === "Enter" && handleAdicionarModeloCustomizado(produtoId)}
                                className="flex-1 bg-[#0a1628] border-[#27a75c]/30 text-white placeholder:text-white/40 focus:border-[#27a75c] focus:ring-[#27a75c]/20"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAdicionarModeloCustomizado(produtoId)}
                                disabled={!novoModeloPorProduto[produtoId]?.trim()}
                                className="border-[#27a75c]/50 text-[#27a75c] hover:bg-[#27a75c]/10 hover:text-[#27a75c] disabled:opacity-50"
                              >
                                Adicionar
                              </Button>
                            </div>
                            
                            {modelosSelecionados.length > 0 && (
                              <p className="text-sm text-white/50">
                                {modelosSelecionados.length} modelo(s) selecionado(s)
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {Object.keys(modelosPorProduto).length === 0 && (
                    <p className="text-sm text-white/50 italic text-center py-4">
                      Nenhum produto configurado. Selecione um produto acima para começar.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Seção de Configuração de Valores por Modelo */}
            {pergunta && CAMPOS_CONFIGURAVEIS_POR_MODELO.includes(pergunta.systemKey || "") && (
              <div className="space-y-4 border-t border-[#27a75c]/20 pt-4 mt-4">
                <div>
                  <Label className="text-white/90">
                    Configurar {
                      pergunta.systemKey === "formato_padrao" ? "Formatos" :
                      pergunta.systemKey === "substrato" ? "Materiais" :
                      pergunta.systemKey === "gramagem" ? "Gramaturas" :
                      pergunta.systemKey === "tipo_alca" ? "Tipos de Alça" :
                      pergunta.systemKey === "aplicacao_alca" ? "Aplicações de Alça" :
                      pergunta.systemKey === "largura_alca" ? "Larguras de Alça" :
                      pergunta.systemKey === "cor_alca" ? "Cores de Alça" :
                      pergunta.systemKey === "tipo_impressao" ? "Modos de Impressão" :
                      pergunta.systemKey === "tipo_acabamento" ? "Acabamentos" :
                      pergunta.systemKey === "reforco_fundo" ? "Modelos de Reforço de Fundo" :
                      pergunta.systemKey === "furo_fita" ? "Modelos de Furo de Fita" :
                      "Tamanhos"
                    } por Modelo de Produto
                  </Label>
                  <span className="text-sm text-white/50 font-normal ml-2">
                    (Campo: {pergunta.systemKey})
                  </span>
                  <p className="text-sm text-white/50 mb-4">
                    Defina quais {
                      pergunta.systemKey === "formato_padrao" ? "formatos" :
                      pergunta.systemKey === "substrato" ? "materiais" :
                      pergunta.systemKey === "gramagem" ? "gramaturas" :
                      pergunta.systemKey === "tipo_alca" ? "tipos de alça" :
                      pergunta.systemKey === "aplicacao_alca" ? "aplicações de alça" :
                      pergunta.systemKey === "largura_alca" ? "larguras de alça" :
                      pergunta.systemKey === "cor_alca" ? "cores de alça" :
                      pergunta.systemKey === "tipo_impressao" ? "modos de impressão" :
                      pergunta.systemKey === "tipo_acabamento" ? "acabamentos" :
                      pergunta.systemKey === "reforco_fundo" ? "modelos de reforço de fundo" :
                      pergunta.systemKey === "furo_fita" ? "modelos de furo de fita" :
                      "valores"
                    } aparecerão quando cada modelo de produto for selecionado.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Selecionar modelo para configurar */}
                  <div>
                    <Select
                      value=""
                      onValueChange={(modeloId) => {
                        if (modeloId && !tamanhosPorModelo[modeloId]) {
                          const valores = getValoresDoCatalogo(modeloId)
                          setTamanhosPorModelo(prev => ({
                            ...prev,
                            [modeloId]: valores
                          }))
                        }
                      }}
                    >
                      <SelectTrigger className="bg-[#0a1628] border-[#27a75c]/30 text-white focus:border-[#27a75c] focus:ring-[#27a75c]/20">
                        <SelectValue placeholder="Selecione um modelo de produto para adicionar..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111c2e] border-[#27a75c]/30">
                        {getTodosModelos()
                          .filter(m => !tamanhosPorModelo[m.id])
                          .map((modelo) => (
                            <SelectItem key={modelo.id} value={modelo.id} className="text-white hover:bg-[#27a75c]/20 focus:bg-[#27a75c]/20 focus:text-white">
                              {modelo.produtoNome} → {modelo.nome}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lista de modelos configurados */}
                  {Object.keys(tamanhosPorModelo).length > 0 && (
                    <div className="space-y-3">
                      {Object.entries(tamanhosPorModelo).map(([modeloId, tamanhosSelecionados]) => {
                        const todosModelos = getTodosModelos()
                        const modelo = todosModelos.find(m => m.id === modeloId)
                        const tamanhosDoCatalogo = getValoresDoCatalogo(modeloId)
                        
                        return (
                          <div key={modeloId} className="border border-[#00477a]/30 rounded-lg p-4 space-y-3 bg-[#00477a]/10">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-white">
                                {modelo ? `${modelo.produtoNome} → ${modelo.nome}` : modeloId}
                              </h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoverModeloTamanhos(modeloId)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              >
                                Remover
                              </Button>
                            </div>
                            
                            {/* Tamanhos do catálogo */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {tamanhosDoCatalogo.map((tamanho) => {
                                const estaSelecionado = tamanhosSelecionados.includes(tamanho)
                                return (
                                  <div
                                    key={tamanho}
                                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors min-w-0 ${
                                      estaSelecionado
                                        ? "bg-[#27a75c]/20 border-[#27a75c]"
                                        : "bg-[#0a1628]/50 border-white/10 hover:bg-[#0a1628]"
                                    }`}
                                    onClick={() => handleToggleTamanho(modeloId, tamanho)}
                                  >
                                    <Checkbox
                                      checked={estaSelecionado}
                                      onCheckedChange={() => handleToggleTamanho(modeloId, tamanho)}
                                      className="flex-shrink-0 border-[#27a75c]/50 data-[state=checked]:bg-[#27a75c] data-[state=checked]:border-[#27a75c]"
                                    />
                                    <Label className="cursor-pointer flex-1 text-sm break-words min-w-0 text-white/80">
                                      {tamanho}
                                    </Label>
                                  </div>
                                )
                              })}
                              {/* Tamanhos adicionados manualmente (não estão no catálogo) */}
                              {tamanhosSelecionados
                                .filter(t => !tamanhosDoCatalogo.includes(t))
                                .map((tamanhoCustom) => (
                                  <div
                                    key={tamanhoCustom}
                                    className="flex items-center gap-2 p-2 rounded border border-[#27a75c] bg-[#27a75c]/20 min-w-0"
                                  >
                                    <Checkbox
                                      checked={true}
                                      onCheckedChange={() => handleToggleTamanho(modeloId, tamanhoCustom)}
                                      className="flex-shrink-0 border-[#27a75c]/50 data-[state=checked]:bg-[#27a75c] data-[state=checked]:border-[#27a75c]"
                                    />
                                    <Label className="cursor-pointer flex-1 text-sm break-words min-w-0 text-white/80">
                                      {tamanhoCustom}
                                    </Label>
                                  </div>
                                ))}
                            </div>

                            {/* Campo para adicionar tamanho customizado */}
                            <div className="flex gap-2 mt-3">
                              <Input
                                value={novoTamanhoPorModelo[modeloId] || ""}
                                onChange={(e) => setNovoTamanhoPorModelo(prev => ({
                                  ...prev,
                                  [modeloId]: e.target.value
                                }))}
                                placeholder={
                                  pergunta.systemKey === "formato_padrao" ? "Novo formato" : 
                                  pergunta.systemKey === "substrato" ? "Novo material" :
                                  pergunta.systemKey === "gramagem" ? "Nova gramatura" :
                                  pergunta.systemKey === "tipo_alca" ? "Novo tipo de alça" :
                                  pergunta.systemKey === "aplicacao_alca" ? "Nova aplicação" :
                                  pergunta.systemKey === "largura_alca" ? "Nova largura" :
                                  pergunta.systemKey === "cor_alca" ? "Nova cor" :
                                  pergunta.systemKey === "tipo_impressao" ? "Novo modo" :
                                  pergunta.systemKey === "tipo_acabamento" ? "Novo acabamento" :
                                  pergunta.systemKey === "reforco_fundo" ? "Novo modelo de reforço" :
                                  pergunta.systemKey === "furo_fita" ? "Novo modelo de furo" :
                                  "Novo valor"
                                }
                                onKeyPress={(e) => e.key === "Enter" && handleAdicionarTamanhoCustomizado(modeloId)}
                                className="flex-1 bg-[#0a1628] border-[#27a75c]/30 text-white placeholder:text-white/40 focus:border-[#27a75c] focus:ring-[#27a75c]/20"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAdicionarTamanhoCustomizado(modeloId)}
                                disabled={!novoTamanhoPorModelo[modeloId]?.trim()}
                                className="border-[#27a75c]/50 text-[#27a75c] hover:bg-[#27a75c]/10 hover:text-[#27a75c] disabled:opacity-50"
                              >
                                Adicionar
                              </Button>
                            </div>
                            
                            {tamanhosSelecionados.length > 0 && (
                              <p className="text-sm text-white/50">
                                {tamanhosSelecionados.length} {
                                  pergunta.systemKey === "formato_padrao" ? "formato(s)" : 
                                  pergunta.systemKey === "substrato" ? "material(is)" :
                                  pergunta.systemKey === "gramagem" ? "gramatura(s)" :
                                  pergunta.systemKey === "tipo_alca" ? "tipo(s) de alça" :
                                  pergunta.systemKey === "aplicacao_alca" ? "aplicação(ões)" :
                                  pergunta.systemKey === "largura_alca" ? "largura(s)" :
                                  pergunta.systemKey === "cor_alca" ? "cor(es)" :
                                  pergunta.systemKey === "tipo_impressao" ? "modo(s)" :
                                  pergunta.systemKey === "tipo_acabamento" ? "acabamento(s)" :
                                  pergunta.systemKey === "reforco_fundo" ? "modelo(s) de reforço" :
                                  pergunta.systemKey === "furo_fita" ? "modelo(s) de furo" :
                                  "valor(es)"
                                } selecionado(s)
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {Object.keys(tamanhosPorModelo).length === 0 && (
                    <p className="text-sm text-white/50 italic text-center py-4">
                      Nenhum modelo configurado. Selecione um modelo acima para começar.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="obrigatorio"
                  checked={formData.obrigatorio}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, obrigatorio: checked as boolean })
                  }
                  className="border-[#27a75c]/50 data-[state=checked]:bg-[#27a75c] data-[state=checked]:border-[#27a75c]"
                />
                <Label htmlFor="obrigatorio" className="cursor-pointer text-white/80">
                  Campo obrigatório
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ativo: checked as boolean })
                  }
                  className="border-[#27a75c]/50 data-[state=checked]:bg-[#27a75c] data-[state=checked]:border-[#27a75c]"
                />
                <Label htmlFor="ativo" className="cursor-pointer text-white/80">
                  Ligado (aparece no formulário)
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campoMapeado" className="text-white/90">Campo Mapeado (Técnico)</Label>
              <Input
                id="campoMapeado"
                value={formData.campoMapeado}
                onChange={(e) => setFormData({ ...formData, campoMapeado: e.target.value })}
                placeholder="Ex: dadosGerais.empresa"
                disabled={pergunta.isSystem}
                className="bg-[#0a1628] border-[#27a75c]/30 text-white placeholder:text-white/40 focus:border-[#27a75c] focus:ring-[#27a75c]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-sm text-white/50">
                Caminho do campo no schema de dados (apenas para perguntas customizadas)
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSalvar} disabled={saving || !formData.titulo} className="bg-[#27a75c] hover:bg-[#27a75c]/90 text-white disabled:opacity-50">
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Link href={`/engenharia/formulario?etapa=${pergunta.formularioEtapaId}`}>
                <Button variant="outline" className="border-[#00477a]/50 text-white/70 hover:bg-[#00477a]/20 hover:text-white">Cancelar</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

