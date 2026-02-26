# Implementação do Painel da Engenharia - Formulário Configurável

## ✅ O que foi implementado

### 1. Schema do Banco de Dados
- ✅ Tabela `FormularioEtapa` - Armazena as etapas do formulário
- ✅ Tabela `FormularioPergunta` - Armazena as perguntas de cada etapa
- ✅ Campos `isSystem` e `systemKey` para identificar perguntas essenciais
- ✅ Campo `campoMapeado` para mapear perguntas aos campos do schema de solicitação

### 2. Seed Inicial
- ✅ Criação automática de 9 etapas padrão:
  1. Dados do pedido
  2. Produto
  3. Tamanho
  4. Material
  5. Alça e detalhes
  6. Impressão
  7. Acabamentos
  8. Entrega e quantidade
  9. Revisão
- ✅ Criação de perguntas base em cada etapa
- ✅ Perguntas essenciais marcadas com `isSystem=true` e `systemKey`

### 3. APIs REST
- ✅ `GET /api/engenharia/formulario/etapas` - Listar etapas
- ✅ `POST /api/engenharia/formulario/etapas` - Criar etapa
- ✅ `GET /api/engenharia/formulario/etapas/[id]` - Detalhes da etapa
- ✅ `PUT /api/engenharia/formulario/etapas/[id]` - Atualizar etapa
- ✅ `DELETE /api/engenharia/formulario/etapas/[id]` - Deletar etapa (bloqueado para etapas do sistema)
- ✅ `GET /api/engenharia/formulario/perguntas` - Listar perguntas
- ✅ `POST /api/engenharia/formulario/perguntas` - Criar pergunta
- ✅ `GET /api/engenharia/formulario/perguntas/[id]` - Detalhes da pergunta
- ✅ `PUT /api/engenharia/formulario/perguntas/[id]` - Atualizar pergunta
- ✅ `DELETE /api/engenharia/formulario/perguntas/[id]` - Deletar pergunta (bloqueado para perguntas essenciais)

### 4. Interface de Administração
- ✅ Página `/engenharia/formulario` - Lista etapas e perguntas
- ✅ Visualização de perguntas por etapa
- ✅ Edição de perguntas (`/engenharia/formulario/perguntas/[id]`)
- ✅ Criação de novas perguntas (`/engenharia/formulario/perguntas/nova`)
- ✅ Toggle ligado/desligado para perguntas
- ✅ Validação para não remover perguntas essenciais
- ✅ Badges visuais para identificar perguntas do sistema

### 5. Funcionalidades Implementadas
- ✅ Renomear perguntas base (editar título)
- ✅ Editar ajuda, obrigatório, ligado/desligado, ordem
- ✅ Criar novas perguntas normalmente
- ✅ Desativar perguntas essenciais (em vez de remover)
- ✅ Mensagens de aviso para perguntas essenciais

## ⚠️ O que ainda precisa ser feito

### 1. Modificar o Wizard para usar perguntas dinâmicas
**Status:** Pendente

O wizard atual (`/solicitacoes/nova`) ainda usa componentes hardcoded. Precisa ser modificado para:
- Carregar etapas e perguntas do banco de dados
- Renderizar campos dinamicamente baseado no tipo de pergunta
- Mapear valores para o schema de solicitação usando `campoMapeado`

**Arquivos a modificar:**
- `app/solicitacoes/nova/page.tsx` - Carregar etapas do banco
- Criar componente genérico `components/wizard/CampoDinamico.tsx` para renderizar campos
- Modificar validação Zod para ser dinâmica

### 2. Renderização Dinâmica de Campos
**Status:** Pendente

Criar componente que renderiza diferentes tipos de campo:
- `texto_curto` → Input
- `texto_longo` → Textarea
- `numero` → Input type="number"
- `data` → Input type="date"
- `lista_opcoes` → Select com opções
- `lista_produtos` → Select com produtos do catálogo
- `lista_modelos` → Select com modelos (dependente do produto)

### 3. Validação Dinâmica
**Status:** Pendente

- Criar schema Zod dinamicamente baseado nas perguntas ativas
- Validar campos obrigatórios conforme configuração
- Aplicar validações específicas por tipo (ex: email para campo de email)

### 4. Mapeamento de Valores
**Status:** Pendente

- Implementar lógica para mapear valores do formulário dinâmico para o schema `SolicitacaoCompletaFormData`
- Usar `campoMapeado` para determinar onde salvar cada valor

## 📋 Como usar o que foi implementado

### 1. Executar Migrations e Seed
```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar schema ao banco
npm run db:push

# Popular com dados iniciais (inclui etapas e perguntas base)
npm run db:seed
```

### 2. Acessar o Painel da Engenharia
1. Acesse `http://localhost:3000`
2. Clique em "Montar Formulário" ou acesse `/engenharia/formulario`
3. Selecione uma etapa para ver suas perguntas
4. Clique em "Editar" para modificar uma pergunta
5. Clique em "Nova Pergunta" para criar uma nova

### 3. Editar Perguntas Base
- Todas as perguntas base aparecem na lista
- Você pode renomear, editar ajuda, obrigatório, ordem, etc.
- Perguntas essenciais (produto, modelo, quantidade) não podem ser removidas, apenas desativadas

## 🔧 Estrutura de Dados

### FormularioEtapa
```typescript
{
  id: string
  codigo: string // "dados_pedido", "produto", etc.
  nome: string // "Dados do pedido"
  ordem: number
  ativo: boolean
  isSystem: boolean
  perguntas: FormularioPergunta[]
}
```

### FormularioPergunta
```typescript
{
  id: string
  formularioEtapaId: string
  titulo: string // Editável
  ajuda?: string
  tipo: "texto_curto" | "texto_longo" | "numero" | "data" | "lista_opcoes" | "lista_produtos" | "lista_modelos"
  obrigatorio: boolean
  ativo: boolean
  ordem: number
  opcoes: string[] // Para tipo lista_opcoes
  isSystem: boolean
  systemKey?: string // "empresa", "produto", "modelo", "quantidade"
  campoMapeado?: string // "dadosGerais.empresa"
}
```

## 🎯 Próximos Passos Recomendados

1. **Implementar renderização dinâmica** - Modificar wizard para usar perguntas do banco
2. **Testar fluxo completo** - Criar solicitação usando formulário dinâmico
3. **Adicionar mais tipos de campo** - Se necessário (ex: checkbox, radio, etc.)
4. **Implementar dependências** - Campos que aparecem condicionalmente
5. **Adicionar validações customizadas** - Usar campo `configuracao` para regras específicas

## 📝 Notas Importantes

- Perguntas essenciais (`produto`, `modelo`, `quantidade`) não podem ser removidas
- Perguntas do sistema podem ser desativadas, mas não deletadas
- O campo `campoMapeado` é usado para saber onde salvar o valor no schema de solicitação
- O seed cria automaticamente todas as etapas e perguntas base ao executar `npm run db:seed`









