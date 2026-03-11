"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Stepper } from "@/components/wizard/Stepper"
import { SolicitacaoCompletaFormData, solicitacaoCompletaSchema } from "@/lib/validations/solicitacao"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
}

interface FormularioEtapa {
  id: string
  codigo: string
  nome: string
  ordem: number
  ativo: boolean
  perguntas: FormularioPergunta[]
}

function EtapaLoadingFallback() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-white">Carregando etapa...</h2>
      <p className="text-[#27a75c]/70">
        Aguarde enquanto carregamos os campos desta etapa.
      </p>
    </div>
  )
}

const EtapaDinamica = dynamic(
  () => import("@/components/wizard/EtapaDinamica").then((mod) => mod.EtapaDinamica),
  {
    loading: () => <EtapaLoadingFallback />,
  }
)

const EtapaRevisao = dynamic(
  () => import("@/components/wizard/EtapaRevisao").then((mod) => mod.EtapaRevisao),
  {
    loading: () => <EtapaLoadingFallback />,
  }
)

const EtapaEnobrecimentos = dynamic(
  () => import("@/components/wizard/EtapaEnobrecimentos").then((mod) => mod.EtapaEnobrecimentos),
  {
    loading: () => <EtapaLoadingFallback />,
  }
)

export default function NovaSolicitacaoPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [highestStep, setHighestStep] = useState(1) // Etapa mais alta alcançada
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [savedSolicitacaoId, setSavedSolicitacaoId] = useState<string | null>(null)
  const [autoSaveAttempted, setAutoSaveAttempted] = useState(false)
  const [etapas, setEtapas] = useState<FormularioEtapa[]>([])
  const [loading, setLoading] = useState(true)
  const [steps, setSteps] = useState<string[]>([])
  const savePromiseRef = useRef<Promise<string> | null>(null)

  const form = useForm<SolicitacaoCompletaFormData>({
    resolver: zodResolver(solicitacaoCompletaSchema),
    defaultValues: {
      dadosGerais: {
        empresa: "",
        unidade: "",
        nomeSolicitante: "",
        emailSolicitante: "",
        telefoneSolicitante: "",
        observacoesGerais: "",
        // Novos campos
        vendedor: "",
        marca: "",
        contato: "",
        codigoMetrics: "",
      },
      condicoesVenda: {
        tipoContrato: "",
        imposto: "",
        condicaoPagamento: "",
        condicaoPagamentoOutra: "",
        royalties: "",
        bvAgencia: "",
      },
      entregas: {
        localUnico: true,
        cidadeUF: "",
        quantidadeLocalUnico: undefined,
        pedidoMinimoCIF: "",
        cidadesUFMultiplas: "",
        anexarListaLojas: false,
        quantidadeMultiplos: "",
        numeroEntregas: "",
        frequenciaUnica: true,
        quantidadeUnica: undefined,
        frequencia: "",
        frequenciaOutra: "",
        quantidadeMultiplasEntregas: undefined,
        frete: "",
        freteQuantidades: [],
        freteQuantidade: undefined,
      },
      produto: {
        produtoTipoId: "",
        produtoModeloId: "",
        quantidade: "",
      },
      formato: {
        formatoPadraoId: "",
      },
      substrato: {
        substratoId: "",
        substratoGramagem: "",
      },
      acabamentos: {
        reforcoFundo: false,
        bocaPalhaco: false,
        furoFita: false,
      },
      enobrecimentos: [],
      acondicionamento: {
        quantidade: 0,
      },
    },
    mode: "onChange",
  })

  useEffect(() => {
    carregarEtapas()
  }, [])

  const carregarEtapas = async () => {
    try {
      const response = await fetch("/api/engenharia/formulario/etapas")
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.erro || `Erro ao carregar etapas: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Verificar se data é um array
      if (!Array.isArray(data)) {
        throw new Error("Resposta inválida da API")
      }
      
      // Filtrar apenas etapas ativas e ordenar por ordem.
      // A etapa "revisao" vinda do banco é ignorada aqui, pois a revisão
      // final é controlada no frontend como etapa virtual sempre no fim.
      const etapasAtivas = data
        .filter((etapa: FormularioEtapa) => etapa.ativo && etapa.codigo !== "revisao")
        .sort((a: FormularioEtapa, b: FormularioEtapa) => a.ordem - b.ordem)
      
      setEtapas(etapasAtivas)
      
      // Criar array de nomes das etapas para o stepper
      const nomesEtapas = etapasAtivas.map((etapa: FormularioEtapa) => etapa.nome)
      
      // Sempre incluir revisão por último para garantir que todas as etapas
      // dinâmicas (inclusive acondicionamento) sejam preenchidas antes.
      nomesEtapas.push("Revisão")
      
      setSteps(nomesEtapas)
    } catch (error: any) {
      console.error("Erro ao carregar etapas:", error)
      alert(`Erro ao carregar formulário: ${error.message || "Erro desconhecido"}. Verifique o console para mais detalhes.`)
      // Fallback para etapas padrão se não conseguir carregar
      setSteps([
        "Dados Gerais",
        "Tipo de Produto",
        "Formato",
        "Substrato",
        "Alça e Acabamentos",
        "Impressão e Enobrecimentos",
        "Acondicionamento",
        "Revisão"
      ])
    } finally {
      setLoading(false)
    }
  }

  const { watch, trigger, formState: { errors } } = form

  const goToStep = (step: number) => {
    setCurrentStep(step)
    // Atualizar a etapa mais alta se avançou
    if (step > highestStep) {
      setHighestStep(step)
    }
  }

  const handleNext = async () => {
    // Validar etapa atual antes de avançar
    const etapaAtual = etapas[currentStep - 1]
    
    if (!etapaAtual) {
      // Se não há etapa configurada, avançar sem validação
      if (currentStep < steps.length) {
        goToStep(currentStep + 1)
      }
      return
    }

    const etapasSemValidacao = ["revisao"]
    if (etapasSemValidacao.includes(etapaAtual.codigo)) {
      if (currentStep < steps.length) {
        goToStep(currentStep + 1)
      }
      return
    }

    // Sempre validar a etapa atual pelos campos mapeados ativos,
    // independente do "obrigatório" da configuração visual.
    const secoesParaValidar = new Set<keyof SolicitacaoCompletaFormData>()
    const perguntasMapeadas = etapaAtual.perguntas.filter(p => p.ativo && p.campoMapeado)

    perguntasMapeadas.forEach(pergunta => {
      if (pergunta.campoMapeado) {
        const partes = pergunta.campoMapeado.split(".")
        if (partes.length > 0) {
          const secao = partes[0] as keyof SolicitacaoCompletaFormData
          secoesParaValidar.add(secao)
        }
      }
    })

    // Fallback por código da etapa (caso alguma pergunta esteja sem mapeamento)
    if (secoesParaValidar.size === 0) {
      const secoesPorCodigo: Record<string, (keyof SolicitacaoCompletaFormData)[]> = {
        dados_pedido: ["dadosGerais"],
        condicoes_venda: ["condicoesVenda"],
        entregas: ["entregas"],
        produto: ["produto"],
        tamanho: ["formato"],
        material: ["substrato"],
        alca_detalhes: ["alca"],
        impressao: ["impressao"],
        acabamentos: ["acabamentos"],
        enobrecimentos: ["enobrecimentos"],
        acondicionamento: ["acondicionamento"],
        entrega_quantidade: ["acondicionamento"],
      }

      const secoesFallback = secoesPorCodigo[etapaAtual.codigo] || []
      secoesFallback.forEach((secao) => secoesParaValidar.add(secao))
    }

    const camposParaValidar = Array.from(secoesParaValidar)
    if (camposParaValidar.length === 0) {
      if (currentStep < steps.length) {
        goToStep(currentStep + 1)
      }
      return
    }

    const isValid = await trigger(camposParaValidar, { shouldFocus: true })
    if (isValid && currentStep < steps.length) {
      goToStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const criarSolicitacao = useCallback(async (data: SolicitacaoCompletaFormData) => {
    const response = await fetch("/api/solicitacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const responseData = await response.json().catch(() => ({}))

    if (!response.ok) {
      const mensagemErro = responseData.erro || "Erro ao criar solicitação"
      const detalhes = responseData.detalhes ? `\n\nDetalhes: ${JSON.stringify(responseData.detalhes)}` : ""
      const campos = responseData.campos ? `\n\nCampos com problema: ${responseData.campos.join(", ")}` : ""
      throw new Error(`${mensagemErro}${detalhes}${campos}`)
    }

    if (!responseData?.id) {
      throw new Error("Solicitação criada sem ID de retorno.")
    }

    return String(responseData.id)
  }, [])

  const persistirSolicitacao = useCallback(async (data: SolicitacaoCompletaFormData) => {
    if (savedSolicitacaoId) {
      return savedSolicitacaoId
    }

    if (savePromiseRef.current) {
      return savePromiseRef.current
    }

    const savePromise = (async () => {
      const id = await criarSolicitacao(data)
      setSavedSolicitacaoId(id)
      return id
    })()

    savePromiseRef.current = savePromise

    try {
      return await savePromise
    } finally {
      savePromiseRef.current = null
    }
  }, [criarSolicitacao, savedSolicitacaoId])

  useEffect(() => {
    if (steps.length === 0) return

    if (currentStep === steps.length) return

    if (autoSaveAttempted) {
      setAutoSaveAttempted(false)
    }
  }, [autoSaveAttempted, currentStep, steps.length])

  useEffect(() => {
    if (loading) return
    if (steps.length === 0) return
    if (currentStep !== steps.length) return
    if (savedSolicitacaoId) return
    if (autoSaveAttempted) return
    if (isSubmitting) return
    if (isAutoSaving) return

    setAutoSaveAttempted(true)
    setIsAutoSaving(true)

    persistirSolicitacao(form.getValues())
      .catch((error) => {
        console.error("Erro no auto-save da solicitação:", error)
        alert(error?.message || "Não foi possível salvar automaticamente ao chegar na revisão.")
      })
      .finally(() => {
        setIsAutoSaving(false)
      })
  }, [
    autoSaveAttempted,
    currentStep,
    form,
    isAutoSaving,
    isSubmitting,
    loading,
    persistirSolicitacao,
    savedSolicitacaoId,
    steps.length,
  ])

  const handleSubmit = async (data: SolicitacaoCompletaFormData) => {
    setIsSubmitting(true)
    try {
      const id = await persistirSolicitacao(data)
      router.push(`/solicitacoes/${id}`)
    } catch (error: any) {
      alert(error.message || "Erro ao criar solicitação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    // Última etapa é sempre revisão
    if (currentStep === steps.length) {
      return (
        <EtapaRevisao
          form={form}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onBack={() => goToStep(Math.max(1, steps.length - 1))}
        />
      )
    }

    // Renderizar etapa dinâmica
    const etapaAtual = etapas[currentStep - 1]
    
    if (!etapaAtual) {
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4 text-white">Carregando etapa...</h2>
          <p className="text-[#27a75c]/70">
            Aguarde enquanto carregamos as perguntas desta etapa.
          </p>
        </div>
      )
    }

    // Usar componente específico para enobrecimentos
    if (etapaAtual.codigo === "enobrecimentos") {
      return <EtapaEnobrecimentos form={form} />
    }

    return <EtapaDinamica etapa={etapaAtual} form={form} />
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-[#27a75c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#27a75c]/70">Carregando formulário...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-[#27a75c] hover:text-white hover:bg-white/[0.05]">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o início
            </Button>
          </Link>
        </div>
        
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/[0.06]">
            <h1 className="text-2xl font-bold text-white mb-2">Nova Solicitação de Orçamento</h1>
            <p className="text-[#27a75c]/70">
              Preencha o formulário passo a passo para criar uma nova solicitação
            </p>
          </div>
          
          {/* Content */}
          <div className="p-8 space-y-6">
            {steps.length > 0 && (
              <Stepper 
                currentStep={currentStep} 
                totalSteps={steps.length} 
                steps={steps} 
                highestStep={highestStep}
                onStepClick={(step) => setCurrentStep(step)}
              />
            )}
            
            <div className="min-h-[400px] py-6">
              {renderStep()}
            </div>

            {currentStep < steps.length && (
              <div className="flex justify-between pt-6 border-t border-white/[0.06]">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="border-white/[0.1] bg-transparent text-gray-300 hover:bg-white/[0.05] hover:text-white disabled:opacity-30"
                >
                  Anterior
                </Button>
                <Button 
                  onClick={handleNext}
                  className="bg-gradient-to-r from-[#27a75c] to-[#00477a] hover:from-[#229a52] hover:to-[#003d6a] text-white border-0"
                >
                  Próximo
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



