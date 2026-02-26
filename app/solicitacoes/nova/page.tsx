"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Stepper } from "@/components/wizard/Stepper"
import { EtapaDinamica } from "@/components/wizard/EtapaDinamica"
import { EtapaRevisao } from "@/components/wizard/EtapaRevisao"
import { EtapaEnobrecimentos } from "@/components/wizard/EtapaEnobrecimentos"
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

export default function NovaSolicitacaoPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [highestStep, setHighestStep] = useState(1) // Etapa mais alta alcançada
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [etapas, setEtapas] = useState<FormularioEtapa[]>([])
  const [loading, setLoading] = useState(true)
  const [steps, setSteps] = useState<string[]>([])

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
      console.log("Carregando etapas do formulário...")
      const response = await fetch("/api/engenharia/formulario/etapas")
      console.log("Resposta recebida:", response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Erro na resposta:", errorData)
        throw new Error(errorData.erro || `Erro ao carregar etapas: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log("Dados recebidos:", data)
      
      // Verificar se data é um array
      if (!Array.isArray(data)) {
        console.error("Resposta não é um array:", data)
        throw new Error("Resposta inválida da API")
      }
      
      // Filtrar apenas etapas ativas e ordenar por ordem
      const etapasAtivas = data
        .filter((etapa: FormularioEtapa) => etapa.ativo)
        .sort((a: FormularioEtapa, b: FormularioEtapa) => a.ordem - b.ordem)
      
      console.log("Etapas ativas:", etapasAtivas)
      setEtapas(etapasAtivas)
      
      // Criar array de nomes das etapas para o stepper
      const nomesEtapas = etapasAtivas.map((etapa: FormularioEtapa) => etapa.nome)
      
      // Adicionar etapa de revisão no final apenas se não existir
      if (!nomesEtapas.includes("Revisão")) {
        nomesEtapas.push("Revisão")
      }
      
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

    // Etapas opcionais que não precisam de validação obrigatória
    const etapasOpcionais = ["acabamentos", "enobrecimentos", "alca_detalhes", "impressao", "revisao"]
    
    if (etapasOpcionais.includes(etapaAtual.codigo)) {
      if (currentStep < steps.length) {
        goToStep(currentStep + 1)
      }
      return
    }

    // Validar campos obrigatórios da etapa atual
    const camposParaValidar: (keyof SolicitacaoCompletaFormData)[] = []
    
    // Mapear perguntas obrigatórias para campos do schema
    const perguntasObrigatorias = etapaAtual.perguntas.filter(p => p.ativo && p.obrigatorio && p.campoMapeado)
    
    perguntasObrigatorias.forEach(pergunta => {
      if (pergunta.campoMapeado) {
        const partes = pergunta.campoMapeado.split(".")
        if (partes.length >= 1) {
          const secao = partes[0] as keyof SolicitacaoCompletaFormData
          if (!camposParaValidar.includes(secao)) {
            camposParaValidar.push(secao)
          }
        }
      }
    })

    // Se não há campos obrigatórios na etapa atual, avançar sem validação
    if (perguntasObrigatorias.length === 0 || camposParaValidar.length === 0) {
      if (currentStep < steps.length) {
        goToStep(currentStep + 1)
      }
      return
    }

    // Validação básica por etapa (fallback apenas se não mapeou campos)
    if (camposParaValidar.length === 0) {
      // Identificar a seção baseada no código da etapa
      const codigoEtapa = etapaAtual.codigo
      switch (codigoEtapa) {
        case "dados_pedido":
          camposParaValidar.push("dadosGerais")
          break
        case "produto":
          camposParaValidar.push("produto")
          break
        case "tamanho":
          camposParaValidar.push("formato")
          break
        case "material":
          camposParaValidar.push("substrato")
          break
        case "entrega_quantidade":
          camposParaValidar.push("acondicionamento")
          break
      }
    }

    // Se ainda não tem campos para validar, avançar
    if (camposParaValidar.length === 0) {
      if (currentStep < steps.length) {
        goToStep(currentStep + 1)
      }
      return
    }

    const isValid = await trigger(camposParaValidar)
    if (isValid && currentStep < steps.length) {
      goToStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (data: SolicitacaoCompletaFormData) => {
    setIsSubmitting(true)
    try {
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

      router.push(`/solicitacoes/${responseData.id}`)
    } catch (error: any) {
      alert(error.message || "Erro ao criar solicitação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    // Última etapa é sempre revisão
    if (currentStep === steps.length) {
      return <EtapaRevisao form={form} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
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
