# Implementação do Wizard Dinâmico

## ✅ O que foi implementado

### 1. Componente CampoDinamico
**Arquivo:** `components/wizard/CampoDinamico.tsx`

Componente genérico que renderiza diferentes tipos de campo baseado no tipo da pergunta:

- ✅ **texto_curto** → Input de texto (com detecção automática de email)
- ✅ **texto_longo** → Textarea
- ✅ **numero** → Input numérico
- ✅ **data** → Input de data
- ✅ **lista_opcoes** → Select com opções configuradas
- ✅ **lista_produtos** → Select com produtos do catálogo
- ✅ **lista_modelos** → Select com modelos (dependente do produto selecionado)

**Funcionalidades:**
- Mapeamento automático usando `campoMapeado`
- Validação de campos obrigatórios
- Exibição de mensagens de ajuda
- Suporte a campos dependentes (ex: modelos dependem do produto)

### 2. Componente EtapaDinamica
**Arquivo:** `components/wizard/EtapaDinamica.tsx`

Componente que renderiza uma etapa completa usando perguntas do banco:

- ✅ Carrega perguntas da etapa
- ✅ Filtra apenas perguntas ativas
- ✅ Ordena perguntas por ordem
- ✅ Renderiza campos dinamicamente
- ✅ Passa dependências entre campos (ex: produtoTipoId para modelos)

### 3. Wizard Modificado
**Arquivo:** `app/solicitacoes/nova/page.tsx`

Wizard completamente refatorado para usar perguntas dinâmicas:

- ✅ Carrega etapas do banco de dados via API
- ✅ Cria steps dinamicamente baseado nas etapas
- ✅ Renderiza etapas usando componente dinâmico
- ✅ Validação dinâmica baseada em perguntas obrigatórias
- ✅ Fallback para etapas padrão se não conseguir carregar
- ✅ Mantém etapa de revisão no final

## 🔄 Fluxo de Funcionamento

1. **Carregamento Inicial:**
   - Wizard faz requisição para `/api/engenharia/formulario/etapas`
   - Filtra etapas ativas e ordena por ordem
   - Cria array de steps para o stepper

2. **Renderização de Etapas:**
   - Para cada etapa, renderiza `EtapaDinamica`
   - `EtapaDinamica` renderiza `CampoDinamico` para cada pergunta ativa
   - Campos são ordenados por `ordem`

3. **Mapeamento de Valores:**
   - `CampoDinamico` usa `campoMapeado` para saber onde salvar o valor
   - Exemplo: `"dadosGerais.empresa"` → `form.dadosGerais.empresa`
   - Valores são atualizados usando `setValue` do React Hook Form

4. **Validação:**
   - Validação básica por seção (dadosGerais, produto, etc.)
   - Campos obrigatórios são validados pelo schema Zod
   - Mensagens de erro são exibidas abaixo dos campos

## 📋 Mapeamento de Campos

### Campos do Sistema (systemKey)

| systemKey | campoMapeado | Tipo | Descrição |
|-----------|--------------|------|-----------|
| empresa | dadosGerais.empresa | texto_curto | Nome da empresa |
| nome_solicitante | dadosGerais.nomeSolicitante | texto_curto | Nome do solicitante |
| email | dadosGerais.emailSolicitante | texto_curto | E-mail (detectado automaticamente) |
| telefone | dadosGerais.telefoneSolicitante | texto_curto | Telefone |
| prazo | dadosGerais.prazoDesejado | data | Prazo desejado |
| observacoes_gerais | dadosGerais.observacoesGerais | texto_longo | Observações gerais |
| produto | produto.produtoTipoId | lista_produtos | Tipo de produto |
| modelo | produto.produtoModeloId | lista_modelos | Modelo do produto |
| quantidade | acondicionamento.quantidade | numero | Quantidade |

## 🎯 Como Funciona

### Exemplo: Campo "Empresa"

1. Pergunta no banco:
```json
{
  "titulo": "Empresa / Unidade",
  "tipo": "texto_curto",
  "obrigatorio": true,
  "campoMapeado": "dadosGerais.empresa",
  "systemKey": "empresa"
}
```

2. `CampoDinamico` renderiza:
```tsx
<Input
  type="text"
  value={watch("dadosGerais.empresa")}
  onChange={(e) => setValue("dadosGerais.empresa", e.target.value)}
/>
```

3. Valor é salvo no formulário:
```typescript
form.dadosGerais.empresa = "Nome da Empresa"
```

### Exemplo: Campo Dependente "Modelo"

1. Quando produto é selecionado:
   - `CampoDinamico` recebe `valorProdutoTipoId`
   - Carrega modelos usando `getModelosPorTipo(produtoTipoId)`
   - Select é habilitado e mostra apenas modelos do produto selecionado

2. Quando produto muda:
   - Modelo é resetado automaticamente
   - Select de modelos é desabilitado até novo produto ser selecionado

## 🔧 Configuração Necessária

Para que o wizard funcione corretamente:

1. **Banco de dados populado:**
   ```bash
   npm run db:seed
   ```

2. **Etapas e perguntas configuradas:**
   - Acesse `/engenharia/formulario`
   - Verifique se as etapas estão criadas
   - Verifique se as perguntas estão ativas

3. **Campos mapeados corretamente:**
   - Cada pergunta deve ter `campoMapeado` preenchido
   - Formato: `secao.campo` ou `secao.subSecao.campo`
   - Exemplo: `dadosGerais.empresa`, `produto.produtoTipoId`

## ⚠️ Limitações e Melhorias Futuras

### Limitações Atuais:
1. Validação ainda usa schema Zod fixo (não totalmente dinâmica)
2. Campos aninhados profundos (mais de 3 níveis) podem precisar de ajustes
3. Tipos de campo customizados precisam ser adicionados manualmente

### Melhorias Futuras:
1. **Validação Dinâmica Completa:**
   - Criar schema Zod dinamicamente baseado nas perguntas
   - Aplicar validações específicas por tipo (ex: email, número mínimo/máximo)

2. **Campos Condicionais:**
   - Implementar lógica para campos que aparecem condicionalmente
   - Usar campo `configuracao` para regras de dependência

3. **Mais Tipos de Campo:**
   - Checkbox
   - Radio buttons
   - Upload de arquivo
   - Campos calculados

4. **Validações Customizadas:**
   - Usar campo `configuracao` para regras específicas
   - Exemplo: quantidade mínima, formato de telefone, etc.

## 📝 Notas Importantes

- O wizard mantém compatibilidade com o schema atual (`SolicitacaoCompletaFormData`)
- Campos não mapeados não aparecem no formulário
- Perguntas desativadas (`ativo: false`) não são renderizadas
- A etapa de revisão sempre aparece no final, independente da configuração

## 🧪 Testes Recomendados

1. **Teste básico:**
   - Criar uma solicitação usando o wizard dinâmico
   - Verificar se os valores são salvos corretamente
   - Verificar se a validação funciona

2. **Teste de dependências:**
   - Selecionar produto e verificar se modelos aparecem
   - Mudar produto e verificar se modelo é resetado

3. **Teste de edição:**
   - Editar uma pergunta no painel da engenharia
   - Verificar se a mudança aparece no wizard
   - Verificar se renomear funciona

4. **Teste de novas perguntas:**
   - Criar nova pergunta no painel
   - Verificar se aparece no wizard
   - Verificar se valores são salvos corretamente









