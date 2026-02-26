# Arquitetura do Sistema Orçamentário

## 📐 Visão Geral

Sistema web interno para gerenciamento de solicitações de orçamento de produtos gráficos, construído com Next.js 14 (App Router), TypeScript, Prisma e PostgreSQL.

## 🏗️ Estrutura do Projeto

```
/
├── app/                          # Next.js App Router
│   ├── api/                      # APIs REST
│   │   └── solicitacoes/        # Endpoints de solicitações
│   │       ├── route.ts         # GET (lista) e POST (criar)
│   │       └── [id]/route.ts    # GET (detalhe)
│   ├── solicitacoes/            # Páginas de solicitações
│   │   ├── nova/                # Wizard de criação
│   │   ├── page.tsx             # Listagem
│   │   └── [id]/page.tsx        # Detalhamento
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Página inicial
│   └── globals.css              # Estilos globais
│
├── components/                  # Componentes React
│   ├── ui/                      # Componentes base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── card.tsx
│   │   └── ...
│   └── wizard/                  # Componentes do wizard
│       ├── Stepper.tsx          # Indicador de etapas
│       ├── EtapaDadosGerais.tsx
│       ├── EtapaProduto.tsx
│       ├── EtapaFormato.tsx
│       ├── EtapaSubstrato.tsx
│       ├── EtapaAlcaAcabamentos.tsx
│       ├── EtapaImpressaoEnobrecimentos.tsx
│       ├── EtapaAcondicionamento.tsx
│       └── EtapaRevisao.tsx
│
├── lib/                         # Funções auxiliares
│   ├── prisma.ts                # Cliente Prisma singleton
│   ├── catalogo.ts              # Serviço de catálogo (JSON → BD)
│   ├── webhook.ts               # Serviço de webhook
│   ├── utils.ts                 # Utilitários (cn, etc.)
│   └── validations/             # Schemas Zod
│       └── solicitacao.ts
│
├── types/                       # Tipos TypeScript
│   ├── catalog.ts               # Tipos do catálogo
│   └── solicitacao.ts           # Tipos de solicitação
│
├── data/                        # Dados iniciais
│   └── catalogo-inicial.json    # Catálogo em JSON
│
├── prisma/                      # Prisma ORM
│   ├── schema.prisma            # Schema do banco
│   └── seed.ts                  # Script de seed
│
└── [config files]               # package.json, tsconfig.json, etc.
```

## 🗄️ Modelagem de Dados

### Tabelas de Catálogo

- **ProdutoTipo**: Tipos de produto (SACO, SACOLA, CAIXA, etc.)
- **ProdutoModelo**: Modelos específicos (Elegance, Fundo V, etc.)
- **FormatoPadrao**: Formatos padrão com medidas
- **Substrato**: Tipos de papel/material e gramagens
- **ImpressaoModo**: Modos de impressão (P&B, CMYK, Pantone, etc.)
- **ImpressaoCombinacao**: Combinações de cores (1x0, 4x4, etc.)
- **EnobrecimentoTipo**: Tipos de enobrecimento (Hot Stamping, Relevo, etc.)
- **AlcaTipo**: Tipos de alça
- **Acondicionamento**: Tipos de acondicionamento
- **Modulo**: Módulos de quantidade

### Tabelas de Relação (Permissões)

- **ModeloSubstratoPermitido**: Quais substratos cada modelo aceita
- **ModeloImpressaoPermitida**: Quais impressões cada modelo aceita
- **ModeloEnobrecimentoPermitido**: Quais enobrecimentos cada modelo aceita
- **ModeloAcondicionamentoPermitido**: Quais acondicionamentos cada modelo aceita
- **ModeloFormatoPermitido**: Quais formatos cada modelo aceita

### Tabelas de Solicitação

- **Solicitacao**: Dados gerais da solicitação
  - Campos: empresa, unidade, solicitante, contatos, prazo, observações
  - Status do webhook e resposta recebida

- **SolicitacaoItem**: Item técnico da solicitação
  - Referências a produto, modelo, formato, substrato
  - Dados de alça, acabamentos, impressão
  - Acondicionamento e quantidade
  - Observações de desenvolvimento

- **SolicitacaoEnobrecimento**: Enobrecimentos selecionados (N:N)
  - Dados flexíveis em JSON por tipo

## 🔄 Fluxo de Dados

### Criação de Solicitação

1. **Frontend**: Usuário preenche wizard (8 etapas)
2. **Validação**: React Hook Form + Zod valida cada etapa
3. **Submissão**: POST `/api/solicitacoes` com dados completos
4. **Backend**:
   - Valida dados com Zod
   - Cria `Solicitacao` e `SolicitacaoItem` no banco
   - Dispara webhook de forma assíncrona
   - Atualiza status do webhook após resposta
5. **Resposta**: Retorna solicitação criada com ID

### Consulta de Solicitações

1. **Listagem**: GET `/api/solicitacoes`
   - Retorna todas as solicitações com dados básicos
   - Ordenado por data (mais recente primeiro)

2. **Detalhamento**: GET `/api/solicitacoes/[id]`
   - Retorna solicitação completa com todas as relações
   - Inclui resposta do webhook para debug

## 🎨 Validações e Regras de Negócio

### Validações no Frontend (Zod)

- Dados gerais obrigatórios (empresa, solicitante, e-mail)
- Produto e modelo obrigatórios
- Formato: padrão OU customizado (pelo menos um)
- Substrato obrigatório
- Quantidade com tiragem mínima por tipo de produto
- Validação de campos condicionais (alça, impressão, enobrecimentos)

### Regras de Catálogo

As regras são aplicadas dinamicamente baseadas no modelo selecionado:

- **Campos desabilitados**: Se modelo não permite alça, campos de alça são ocultos
- **Opções filtradas**: Apenas substratos/impressões/enobrecimentos permitidos aparecem
- **Obrigatoriedades**: Laminação obrigatória para certos substratos
- **Tiragem mínima**: Validação de quantidade mínima por tipo de produto

### Validações no Backend

- Schema Zod completo antes de salvar
- Validação de IDs de referência (produto, modelo, etc.)
- Tratamento de erros com mensagens claras

## 🔌 Integração com Webhook

### Configuração

- URL configurável via `WEBHOOK_URL` no `.env`
- Timeout configurável via `WEBHOOK_TIMEOUT_MS`

### Processamento

1. Após criar solicitação, webhook é disparado de forma assíncrona
2. Não bloqueia a resposta ao usuário
3. Status atualizado no banco após receber resposta
4. Resposta salva para debug (sucesso ou erro)

### Formato do Payload

JSON estruturado com:
- Bloco `solicitacao`: Dados gerais
- Bloco `itens`: Array com especificações técnicas completas

## 📦 Catálogo: JSON → Banco de Dados

### Estado Atual

- Catálogo carregado de `data/catalogo-inicial.json`
- Funções em `lib/catalogo.ts` fazem queries ao JSON
- Seed script popula banco com dados do JSON

### Migração Futura

Para migrar para usar banco diretamente:

1. Modificar `lib/catalogo.ts` para usar Prisma
2. Transformar funções síncronas em assíncronas
3. Atualizar componentes que usam catálogo
4. Remover dependência do JSON

## 🎯 Decisões de Arquitetura

### Por que Next.js App Router?

- Roteamento integrado e simples
- Server Components e Server Actions
- APIs REST na mesma aplicação
- Otimizações automáticas

### Por que Prisma?

- Type-safety completo
- Migrations automáticas
- Relações bem definidas
- Prisma Studio para debug

### Por que Zod?

- Validação type-safe
- Schemas reutilizáveis
- Integração com React Hook Form
- Mensagens de erro customizáveis

### Por que shadcn/ui?

- Componentes acessíveis
- Customizáveis
- Baseados em Radix UI
- Tailwind CSS

## 🔐 Segurança (Futuro)

- Autenticação de usuários (NextAuth.js recomendado)
- Autorização por roles
- Validação de CSRF
- Rate limiting nas APIs
- Sanitização de inputs

## 📈 Escalabilidade

### Banco de Dados

- Índices nas foreign keys
- Índices em campos de busca (empresa, e-mail)
- Particionamento de `Solicitacao` por data (futuro)

### Performance

- Cache de catálogo (quando migrado para BD)
- Paginação na listagem de solicitações
- Lazy loading de componentes pesados
- Otimização de imagens (se necessário)

## 🧪 Testes (Futuro)

- Testes unitários: funções de catálogo, validações
- Testes de integração: APIs, webhook
- Testes E2E: fluxo completo do wizard
- Testes de regressão: validações de catálogo

## 📚 Manutenção

### Adicionar Novo Tipo de Produto

1. Adicionar em `data/catalogo-inicial.json`
2. Executar `npm run db:seed`
3. (Futuro) Interface administrativa

### Adicionar Nova Regra

1. Atualizar `lib/catalogo.ts` com nova função
2. Aplicar regra no componente apropriado
3. Documentar no catálogo técnico

### Atualizar Schema do Banco

1. Modificar `prisma/schema.prisma`
2. Executar `npm run db:migrate` (ou `db:push` em dev)
3. Atualizar tipos TypeScript se necessário







