"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"

interface FormularioPergunta {
  id: string
  titulo: string
  ajuda?: string
  tipo: string
  obrigatorio: boolean
  ativo: boolean
  ordem: number
  isSystem: boolean
  systemKey?: string
  formularioEtapa: {
    id: string
    nome: string
  }
}

interface FormularioEtapa {
  id: string
  codigo: string
  nome: string
  ordem: number
  ativo: boolean
  isSystem: boolean
  perguntas: FormularioPergunta[]
}

export default function FormularioPage() {
  const searchParams = useSearchParams()
  const etapaIdParam = searchParams.get("etapa")
  
  const [etapas, setEtapas] = useState<FormularioEtapa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [etapaSelecionada, setEtapaSelecionada] = useState<string | null>(etapaIdParam)

  useEffect(() => {
    carregarEtapas()
  }, [])

  const carregarEtapas = async () => {
    try {
      setError(null)
      const response = await fetch("/api/engenharia/formulario/etapas")
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.erro || `Erro HTTP: ${response.status}`)
      }
      const data = await response.json()
      setEtapas(data)
      if (data.length > 0) {
        // Se tem etapa na URL e ela existe nos dados, usar ela
        if (etapaIdParam && data.some((e: FormularioEtapa) => e.id === etapaIdParam)) {
          setEtapaSelecionada(etapaIdParam)
        } else if (!etapaSelecionada) {
          // Senão, usar a primeira etapa
          setEtapaSelecionada(data[0].id)
        }
      } else if (data.length === 0) {
        setError("Nenhuma etapa encontrada. Execute o seed do banco de dados: npm run db:seed")
      }
    } catch (error: any) {
      console.error("Erro ao carregar etapas:", error)
      setError(error.message || "Erro ao carregar etapas. Verifique se o banco de dados está configurado e o seed foi executado.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAtivo = async (perguntaId: string, ativoAtual: boolean) => {
    try {
      const response = await fetch(`/api/engenharia/formulario/perguntas/${perguntaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !ativoAtual }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.erro || "Erro ao atualizar pergunta")
        return
      }

      carregarEtapas()
    } catch (error) {
      console.error("Erro ao atualizar pergunta:", error)
      alert("Erro ao atualizar pergunta")
    }
  }

  const handleRemover = async (pergunta: FormularioPergunta) => {
    // Verificar se é pergunta essencial
    const perguntasEssenciais = ["produto", "modelo", "quantidade"]
    const isEssencial = pergunta.systemKey && perguntasEssenciais.includes(pergunta.systemKey)

    if (isEssencial) {
      if (!confirm("Esta pergunta é importante para o pedido. Se desligar, o formulário pode ficar incompleto. Deseja desativar em vez de remover?")) {
        return
      }
      // Desativar em vez de remover
      await handleToggleAtivo(pergunta.id, pergunta.ativo)
      return
    }

    if (pergunta.isSystem) {
      if (!confirm("Esta é uma pergunta do sistema. Você pode desativá-la, mas não removê-la. Deseja desativar?")) {
        return
      }
      await handleToggleAtivo(pergunta.id, pergunta.ativo)
      return
    }

    if (!confirm(`Tem certeza que deseja remover a pergunta "${pergunta.titulo}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/engenharia/formulario/perguntas/${pergunta.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.erro || "Erro ao remover pergunta")
        return
      }

      carregarEtapas()
    } catch (error) {
      console.error("Erro ao remover pergunta:", error)
      alert("Erro ao remover pergunta")
    }
  }

  const etapaAtual = etapas.find(e => e.id === etapaSelecionada)
  const perguntasDaEtapa = etapaAtual?.perguntas || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-6xl mx-auto">
          <p>Carregando etapas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Erro ao carregar etapas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{error}</p>
              <div className="space-y-2">
                <p className="font-semibold">Para resolver:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Certifique-se de que o banco de dados está configurado no arquivo .env</li>
                  <li>Execute: <code className="bg-muted px-2 py-1 rounded">npm run db:generate</code></li>
                  <li>Execute: <code className="bg-muted px-2 py-1 rounded">npm run db:push</code></li>
                  <li>Execute: <code className="bg-muted px-2 py-1 rounded">npm run db:seed</code></li>
                </ol>
                <div className="mt-4 flex gap-2">
                  <Button onClick={carregarEtapas}>Tentar novamente</Button>
                  <Link href="/">
                    <Button variant="outline">Voltar para início</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Montar o formulário
            </h1>
            <p className="text-[#27a75c]/70">
              Configure as perguntas de cada etapa do formulário de solicitação
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">Voltar</Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Lista de Etapas */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold mb-4 text-white">Etapas</h2>
            {etapas.map((etapa) => (
              <Card
                key={etapa.id}
                className={`cursor-pointer transition-colors ${
                  etapaSelecionada === etapa.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setEtapaSelecionada(etapa.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{etapa.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {etapa.perguntas.length} pergunta{etapa.perguntas.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    {etapa.isSystem && (
                      <Badge variant="secondary" className="text-xs">
                        Sistema
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Perguntas da Etapa Selecionada */}
          <div className="md:col-span-2">
            {etapaAtual ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Perguntas desta etapa</CardTitle>
                      <CardDescription>{etapaAtual.nome}</CardDescription>
                    </div>
                    <Link href={`/engenharia/formulario/perguntas/nova?etapaId=${etapaAtual.id}`}>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Pergunta
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {perguntasDaEtapa.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhuma pergunta nesta etapa</p>
                      <Link href={`/engenharia/formulario/perguntas/nova?etapaId=${etapaAtual.id}`}>
                        <Button variant="outline" className="mt-4">
                          Criar primeira pergunta
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {perguntasDaEtapa.map((pergunta) => (
                        <Card key={pergunta.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{pergunta.titulo}</h3>
                                  {pergunta.isSystem && (
                                    <Badge variant="secondary" className="text-xs">
                                      Base
                                    </Badge>
                                  )}
                                  {pergunta.obrigatorio && (
                                    <Badge variant="destructive" className="text-xs">
                                      Obrigatório
                                    </Badge>
                                  )}
                                  {!pergunta.ativo && (
                                    <Badge variant="outline" className="text-xs">
                                      Desativado
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div>Tipo: {pergunta.tipo}</div>
                                  {pergunta.ajuda && (
                                    <div>Ajuda: {pergunta.ajuda}</div>
                                  )}
                                  <div>Ordem: {pergunta.ordem}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Link href={`/engenharia/formulario/perguntas/${pergunta.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleAtivo(pergunta.id, pergunta.ativo)}
                                  title={pergunta.ativo ? "Desativar" : "Ativar"}
                                >
                                  {pergunta.ativo ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemover(pergunta)}
                                  disabled={
                                    !!(
                                      pergunta.isSystem &&
                                      pergunta.systemKey &&
                                      ["produto", "modelo", "quantidade"].includes(pergunta.systemKey)
                                    )
                                  }
                                  title={
                                    pergunta.isSystem &&
                                    pergunta.systemKey &&
                                    ["produto", "modelo", "quantidade"].includes(pergunta.systemKey)
                                      ? "Não é possível remover perguntas essenciais"
                                      : "Remover"
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Selecione uma etapa para ver suas perguntas
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

