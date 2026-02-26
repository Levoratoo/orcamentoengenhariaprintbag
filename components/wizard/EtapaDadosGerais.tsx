"use client"

import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SolicitacaoCompletaFormData } from "@/lib/validations/solicitacao"

interface EtapaDadosGeraisProps {
  form: UseFormReturn<SolicitacaoCompletaFormData>
}

export function EtapaDadosGerais({ form }: EtapaDadosGeraisProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Dados Gerais da Solicitação</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="empresa">Empresa *</Label>
          <Input
            id="empresa"
            {...register("dadosGerais.empresa")}
            placeholder="Nome da empresa"
          />
          {errors.dadosGerais?.empresa && (
            <p className="text-sm text-destructive">{errors.dadosGerais.empresa.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unidade">Unidade</Label>
          <Input
            id="unidade"
            {...register("dadosGerais.unidade")}
            placeholder="Unidade (opcional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nomeSolicitante">Nome do Solicitante *</Label>
          <Input
            id="nomeSolicitante"
            {...register("dadosGerais.nomeSolicitante")}
            placeholder="Nome completo"
          />
          {errors.dadosGerais?.nomeSolicitante && (
            <p className="text-sm text-destructive">{errors.dadosGerais.nomeSolicitante.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailSolicitante">E-mail *</Label>
          <Input
            id="emailSolicitante"
            type="email"
            {...register("dadosGerais.emailSolicitante")}
            placeholder="email@exemplo.com"
          />
          {errors.dadosGerais?.emailSolicitante && (
            <p className="text-sm text-destructive">{errors.dadosGerais.emailSolicitante.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefoneSolicitante">Telefone</Label>
          <Input
            id="telefoneSolicitante"
            {...register("dadosGerais.telefoneSolicitante")}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prazoDesejado">Prazo Desejado</Label>
          <Input
            id="prazoDesejado"
            type="date"
            {...register("dadosGerais.prazoDesejado")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoesGerais">Observações Gerais</Label>
        <textarea
          id="observacoesGerais"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register("dadosGerais.observacoesGerais")}
          placeholder="Observações adicionais sobre a solicitação"
        />
      </div>
    </div>
  )
}







