"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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

interface FormularioEtapa {
  id: string
  nome: string
  ordem: number
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

export default function NovaPerguntaPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const etapaIdParam = searchParams.get("etapaId")
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [etapas, setEtapas] = useState<FormularioEtapa[]>([])
  const [formData, setFormData] = useState({
    formularioEtapaId: etapaIdParam || "",
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
  const [systemKeyParaTamanhos, setSystemKeyParaTamanhos] = useState("")

  useEffect(() => {
    carregarEtapas()
  }, [])

  // Carregar produtos/modelos automaticamente quando o tipo mudar
  useEffect(() => {
    if (formData.tipo === "lista_produtos" && formData.opcoes.length === 0) {
      // Carregar produtos do catálogo
      const todosProdutos = getProdutoTipos()
      const nomesProdutos = todosProdutos.map(p => p.nome)
      setFormData(prev => ({
        ...prev,
        opcoes: nomesProdutos
      }))
    }
    
    // Para lista_modelos, pré-popular com todos os produtos e seus modelos
    if (formData.tipo === "lista_modelos" && Object.keys(modelosPorProduto).length === 0) {
      const todosProdutos = getProdutoTipos()
      const novoModelosPorProduto: Record<string, string[]> = {}
      todosProdutos.forEach(produto => {
        const modelosDoProduto = getModelosPorTipo(produto.id)
        novoModelosPorProduto[produto.id] = modelosDoProduto.map(m => m.nome)
      })
      setModelosPorProduto(novoModelosPorProduto)
    }
  }, [formData.tipo])

  // Carregar modelos quando um produto for selecionado para configuração
  const produtos = getProdutoTipos()
  const modelosDisponiveis = produtoSelecionadoParaModelos 
    ? getModelosPorTipo(produtoSelecionadoParaModelos)
    : []

  const handleAdicionarProdutoParaModelos = () => {
    if (produtoSelecionadoParaModelos && !modelosPorProduto[produtoSelecionadoParaModelos]) {
      setModelosPorProduto(prev => ({
        ...prev,
        [produtoSelecionadoParaModelos]: []
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
    if (systemKeyParaTamanhos === "largura") {
      return getLargurasPadrao(modeloId).map(t => String(t))
    } else if (systemKeyParaTamanhos === "altura") {
      return getAlturasPadrao(modeloId).map(t => String(t))
    } else if (systemKeyParaTamanhos === "sanfona") {
      return getSanfonasPadrao(modeloId).map(t => String(t))
    } else if (systemKeyParaTamanhos === "formato_padrao") {
      return getFormatosPermitidos(modeloId).map(f => f.nome)
    } else if (systemKeyParaTamanhos === "substrato") {
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
    } else if (systemKeyParaTamanhos === "gramagem") {
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
    } else if (systemKeyParaTamanhos === "tipo_alca") {
      // Retornar tipos de alça permitidos para este modelo
      const tiposIds = getTiposAlcaPermitidos(modeloId)
      const catalogo = getCatalogo()
      return tiposIds.map(id => {
        const tipo = catalogo.alcaTipos.find((a: any) => a.id === id)
        return tipo ? tipo.nome : id
      })
    } else if (systemKeyParaTamanhos === "aplicacao_alca") {
      // Retornar aplicações de alça permitidas
      return getAplicacoesAlcaPermitidas(modeloId)
    } else if (systemKeyParaTamanhos === "largura_alca") {
      // Retornar larguras de alça permitidas
      const larguras = getLargurasAlcaPermitidas(modeloId)
      return larguras.map(l => `${l}`)
    } else if (systemKeyParaTamanhos === "cor_alca") {
      // Retornar cores de alça permitidas
      return getCoresAlcaPermitidas(modeloId)
    } else if (systemKeyParaTamanhos === "tipo_impressao") {
      // Retornar modos de impressão permitidos
      const modos = getModosImpressaoPermitidos(modeloId)
      return modos.map(m => m.nome)
    } else if (systemKeyParaTamanhos === "tipo_acabamento") {
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
    } else if (systemKeyParaTamanhos === "reforco_fundo") {
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
    } else if (systemKeyParaTamanhos === "furo_fita") {
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
    if (formData.tipo === "lista_modelos" && Object.keys(modelosPorProduto).length > 0) {
      setFormData(prev => ({
        ...prev,
        configuracao: {
          modelosPorProduto: modelosPorProduto
        }
      }))
    } else if (formData.tipo === "lista_modelos" && Object.keys(modelosPorProduto).length === 0) {
      // Limpar configuração se não tiver produtos configurados
      setFormData(prev => ({
        ...prev,
        configuracao: {}
      }))
    }
  }, [modelosPorProduto, formData.tipo])

  // Atualizar configuracao quando tamanhosPorModelo mudar
  useEffect(() => {
    if (systemKeyParaTamanhos && CAMPOS_CONFIGURAVEIS_POR_MODELO.includes(systemKeyParaTamanhos)) {
      setFormData(prev => ({
        ...prev,
        configuracao: Object.keys(tamanhosPorModelo).length > 0
          ? { ...prev.configuracao, tamanhosPorModelo: tamanhosPorModelo }
          : { ...prev.configuracao }
      }))
    }
  }, [tamanhosPorModelo, systemKeyParaTamanhos])

  const carregarEtapas = async () => {
    try {
      const response = await fetch("/api/engenharia/formulario/etapas")
      if (!response.ok) throw new Error("Erro ao carregar etapas")
      const data = await response.json()
      setEtapas(data)
      
      // Se não tiver etapaId na URL, pegar a primeira etapa
      if (!etapaIdParam && data.length > 0) {
        setFormData({ ...formData, formularioEtapaId: data[0].id })
      }
    } catch (error) {
      console.error("Erro ao carregar etapas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSalvar = async () => {
    if (!formData.titulo || !formData.formularioEtapaId) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/engenharia/formulario/perguntas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.erro || "Erro ao criar pergunta")
        return
      }

      router.push(`/engenharia/formulario?etapa=${formData.formularioEtapaId}`)
    } catch (error) {
      console.error("Erro ao criar pergunta:", error)
      alert("Erro ao criar pergunta")
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Nova Pergunta
            </h1>
            <p className="text-lg text-slate-600">
              Adicione uma nova pergunta ao formulário
            </p>
          </div>
          <Link href={`/engenharia/formulario?etapa=${formData.formularioEtapaId || etapaIdParam || ""}`}>
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configurações da Pergunta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="etapa">Etapa *</Label>
              <Select
                value={formData.formularioEtapaId}
                onValueChange={(value) => setFormData({ ...formData, formularioEtapaId: value })}
              >
                <SelectTrigger id="etapa">
                  <SelectValue placeholder="Selecione a etapa" />
                </SelectTrigger>
                <SelectContent>
                  {etapas.map((etapa) => (
                    <SelectItem key={etapa.id} value={etapa.id}>
                      {etapa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Pergunta *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Empresa / Unidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ajuda">Texto de Ajuda</Label>
              <Input
                id="ajuda"
                value={formData.ajuda}
                onChange={(e) => setFormData({ ...formData, ajuda: e.target.value })}
                placeholder="Texto explicativo que ajuda o usuário a preencher"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Pergunta *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_PERGUNTA.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(formData.tipo === "lista_opcoes" || formData.tipo === "lista_produtos" || formData.tipo === "numero") && 
             !systemKeyParaTamanhos && (
              <div className="space-y-2 border rounded-lg p-4">
                <Label>
                  {formData.tipo === "lista_produtos" ? "Produtos da Lista" :
                   "Opções da Lista"}
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  {formData.tipo === "lista_produtos"
                    ? "Adicione os produtos que aparecerão no dropdown. Se deixar vazio, o sistema carregará todos os produtos disponíveis."
                    : "Adicione as opções que aparecerão no dropdown. Para campos numéricos, você pode definir valores padrão."}
                </p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={novaOpcao}
                    onChange={(e) => setNovaOpcao(e.target.value)}
                    placeholder="Digite uma opção e pressione Enter"
                    onKeyPress={(e) => e.key === "Enter" && handleAdicionarOpcao()}
                  />
                  <Button type="button" onClick={handleAdicionarOpcao}>
                    Adicionar
                  </Button>
                </div>
                {formData.opcoes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Opções definidas ({formData.opcoes.length}):</p>
                    {formData.opcoes.map((opcao, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="flex-1">{opcao}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoverOpcao(index)}
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {formData.tipo === "lista_produtos" && formData.opcoes.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <span>💡</span>
                    <span>Produtos carregados do catálogo. Você pode editar, remover ou adicionar novos.</span>
                  </p>
                )}
              </div>
            )}

            {formData.tipo === "lista_modelos" && (
              <div className="space-y-4 border rounded-lg p-4">
                <div>
                  <Label>Configurar Modelos por Tipo de Produto</Label>
                  <p className="text-sm text-muted-foreground mb-4">
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
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione um tipo de produto para configurar" />
                      </SelectTrigger>
                      <SelectContent>
                        {produtos
                          .filter(p => !modelosPorProduto[p.id])
                          .map((produto) => (
                            <SelectItem key={produto.id} value={produto.id}>
                              {produto.nome}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      onClick={handleAdicionarProdutoParaModelos}
                      disabled={!produtoSelecionadoParaModelos}
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
                          <div key={produtoId} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{produto?.nome || produtoId}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoverProduto(produtoId)}
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
                                        ? "bg-primary/10 border-primary"
                                        : "bg-muted/50 border-border hover:bg-muted"
                                    }`}
                                    onClick={() => handleToggleModelo(produtoId, modelo.nome)}
                                  >
                                    <Checkbox
                                      checked={estaSelecionado}
                                      onCheckedChange={() => handleToggleModelo(produtoId, modelo.nome)}
                                      className="flex-shrink-0"
                                    />
                                    <Label className="cursor-pointer flex-1 text-sm break-words min-w-0">
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
                                    className="flex items-center gap-2 p-2 rounded border min-w-0"
                                  >
                                    <Checkbox
                                      checked={true}
                                      onCheckedChange={() => handleToggleModelo(produtoId, modeloCustom)}
                                      className="flex-shrink-0"
                                    />
                                    <Label className="cursor-pointer flex-1 text-sm break-words min-w-0">
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
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAdicionarModeloCustomizado(produtoId)}
                                disabled={!novoModeloPorProduto[produtoId]?.trim()}
                              >
                                Adicionar
                              </Button>
                            </div>
                            
                            {modelosSelecionados.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                {modelosSelecionados.length} modelo(s) selecionado(s)
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {Object.keys(modelosPorProduto).length === 0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-4">
                      Nenhum produto configurado. Selecione um produto acima para começar.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Seção de Configuração de Tamanhos por Modelo */}
            {(formData.tipo === "numero" || formData.tipo === "lista_opcoes") && (
              <div className="space-y-4 border rounded-lg p-4">
                <div>
                  <Label>Configurar Valores por Modelo de Produto (Opcional)</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Se este campo representa tamanhos, formatos ou valores específicos por modelo de produto, 
                    selecione o tipo e configure os valores permitidos para cada modelo.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Seletor de tipo de tamanho */}
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Tipo de Campo</Label>
                      <Select
                        value={systemKeyParaTamanhos}
                        onValueChange={(value) => {
                          setSystemKeyParaTamanhos(value)
                          // Limpar configuração anterior
                          setTamanhosPorModelo({})
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de campo (se aplicável)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nenhum">Nenhum (campo normal)</SelectItem>
                          <SelectItem value="largura">Largura</SelectItem>
                          <SelectItem value="altura">Altura</SelectItem>
                          <SelectItem value="sanfona">Sanfona</SelectItem>
                          <SelectItem value="formato_padrao">Formato Padrão</SelectItem>
                          <SelectItem value="substrato">Material/Substrato</SelectItem>
                          <SelectItem value="gramagem">Gramatura</SelectItem>
                          <SelectItem value="tipo_alca">Tipo de Alça</SelectItem>
                          <SelectItem value="aplicacao_alca">Aplicação de Alça</SelectItem>
                          <SelectItem value="largura_alca">Largura de Alça</SelectItem>
                          <SelectItem value="cor_alca">Cor de Alça</SelectItem>
                          <SelectItem value="tipo_impressao">Modo de Impressão</SelectItem>
                          <SelectItem value="tipo_acabamento">Tipo de Acabamento</SelectItem>
                          <SelectItem value="reforco_fundo">Modelo de Reforço de Fundo</SelectItem>
                          <SelectItem value="furo_fita">Modelo de Furo de Fita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Configuração por modelo - só aparece se selecionar um tipo de tamanho */}
                  {systemKeyParaTamanhos && systemKeyParaTamanhos !== "nenhum" && (
                    <>
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
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um modelo de produto para adicionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {getTodosModelos()
                              .filter(m => !tamanhosPorModelo[m.id])
                              .map((modelo) => (
                                <SelectItem key={modelo.id} value={modelo.id}>
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
                              <div key={modeloId} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">
                                    {modelo ? `${modelo.produtoNome} → ${modelo.nome}` : modeloId}
                                  </h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoverModeloTamanhos(modeloId)}
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
                                            ? "bg-primary/10 border-primary"
                                            : "bg-muted/50 border-border hover:bg-muted"
                                        }`}
                                        onClick={() => handleToggleTamanho(modeloId, tamanho)}
                                      >
                                        <Checkbox
                                          checked={estaSelecionado}
                                          onCheckedChange={() => handleToggleTamanho(modeloId, tamanho)}
                                          className="flex-shrink-0"
                                        />
                                        <Label className="cursor-pointer flex-1 text-sm break-words min-w-0">
                                          {tamanho}
                                        </Label>
                                      </div>
                                    )
                                  })}
                                  {/* Tamanhos adicionados manualmente */}
                                  {tamanhosSelecionados
                                    .filter(t => !tamanhosDoCatalogo.includes(t))
                                    .map((tamanhoCustom) => (
                                      <div
                                        key={tamanhoCustom}
                                        className="flex items-center gap-2 p-2 rounded border min-w-0"
                                      >
                                        <Checkbox
                                          checked={true}
                                          onCheckedChange={() => handleToggleTamanho(modeloId, tamanhoCustom)}
                                          className="flex-shrink-0"
                                        />
                                        <Label className="cursor-pointer flex-1 text-sm break-words min-w-0">
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
                                    placeholder={systemKeyParaTamanhos === "formato_padrao" ? "Novo formato" : "Novo valor"}
                                    onKeyPress={(e) => e.key === "Enter" && handleAdicionarTamanhoCustomizado(modeloId)}
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAdicionarTamanhoCustomizado(modeloId)}
                                    disabled={!novoTamanhoPorModelo[modeloId]?.trim()}
                                  >
                                    Adicionar
                                  </Button>
                                </div>
                                
                                {tamanhosSelecionados.length > 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    {tamanhosSelecionados.length} {systemKeyParaTamanhos === "formato_padrao" ? "formato(s)" : "valor(es)"} selecionado(s)
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {Object.keys(tamanhosPorModelo).length === 0 && (
                        <p className="text-sm text-muted-foreground italic text-center py-4">
                          Nenhum modelo configurado. Selecione um modelo acima para começar.
                        </p>
                      )}
                    </>
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
                />
                <Label htmlFor="obrigatorio" className="cursor-pointer">
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
                />
                <Label htmlFor="ativo" className="cursor-pointer">
                  Ligado (aparece no formulário)
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campoMapeado">Campo Mapeado (Técnico)</Label>
              <Input
                id="campoMapeado"
                value={formData.campoMapeado}
                onChange={(e) => setFormData({ ...formData, campoMapeado: e.target.value })}
                placeholder="Ex: dadosGerais.empresa"
              />
              <p className="text-sm text-muted-foreground">
                Caminho do campo no schema de dados
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSalvar} disabled={saving || !formData.titulo || !formData.formularioEtapaId}>
                {saving ? "Criando..." : "Criar Pergunta"}
              </Button>
              <Link href={`/engenharia/formulario?etapa=${formData.formularioEtapaId || etapaIdParam || ""}`}>
                <Button variant="outline">Cancelar</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

