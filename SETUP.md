# Guia de Configuração e Uso do Sistema Orçamentário

Este documento explica como configurar e usar o sistema completo.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado e rodando (ou use um serviço como Supabase, Railway, etc.)
- npm ou yarn

## 🚀 Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/orcamentario?schema=public"

# Webhook
WEBHOOK_URL="https://seu-sistema.com/api/webhook"
WEBHOOK_TIMEOUT_MS=30000

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**IMPORTANTE**: Configure a `WEBHOOK_URL` com a URL do seu sistema que receberá as solicitações.

### 3. Configurar Banco de Dados

#### Opção A: Usando Prisma Migrate (Recomendado para produção)

```bash
# Gerar cliente Prisma
npm run db:generate

# Criar migration inicial
npm run db:migrate

# Popular banco com dados iniciais do catálogo
npm run db:seed
```

#### Opção B: Usando Prisma DB Push (Recomendado para desenvolvimento)

```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar schema diretamente ao banco (sem migrations)
npm run db:push

# Popular banco com dados iniciais do catálogo
npm run db:seed
```

### 4. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

## 📖 Como Usar

### Criar uma Nova Solicitação

1. Acesse `http://localhost:3000`
2. Clique em "Nova Solicitação" ou acesse `/solicitacoes/nova`
3. Preencha o formulário passo a passo (8 etapas):
   - **Etapa 1**: Dados gerais (empresa, solicitante, etc.)
   - **Etapa 2**: Tipo e modelo de produto
   - **Etapa 3**: Formato (padrão ou customizado)
   - **Etapa 4**: Substrato/papel e gramagem
   - **Etapa 5**: Alça e acabamentos (se permitido)
   - **Etapa 6**: Impressão e enobrecimentos (se permitido)
   - **Etapa 7**: Acondicionamento, módulo e quantidade
   - **Etapa 8**: Revisão final e envio

4. Após confirmar, a solicitação será:
   - Salva no banco de dados
   - Enviada via webhook para a URL configurada
   - Status do webhook será atualizado automaticamente

### Consultar Solicitações

1. Acesse `/solicitacoes` para ver a lista de todas as solicitações
2. Clique em "Ver Detalhes" para ver informações completas
3. Na página de detalhes, você pode ver:
   - Todos os dados preenchidos
   - Status do webhook (pendente, sucesso, erro)
   - Resposta recebida do webhook (para debug)

## 🔧 Configuração do Webhook

O sistema envia automaticamente um POST para a URL configurada em `WEBHOOK_URL` com um JSON estruturado.

### Formato do Payload

```json
{
  "solicitacao": {
    "id": "clx123...",
    "numero": "CLX12345",
    "empresa": "Nome da Empresa",
    "unidade": "Unidade (opcional)",
    "nomeSolicitante": "João Silva",
    "emailSolicitante": "joao@empresa.com",
    "telefoneSolicitante": "(00) 00000-0000",
    "prazoDesejado": "2024-12-31T00:00:00.000Z",
    "observacoesGerais": "Observações...",
    "criadoEm": "2024-01-15T10:30:00.000Z"
  },
  "itens": [
    {
      "produto": {
        "tipo": "Sacola",
        "modelo": "Elegance"
      },
      "formato": {
        "padrao": "Outro (Desenvolvimento)",
        "custom": {
          "largura": 30.5,
          "altura": 40.0,
          "lateral": 10.0,
          "observacoes": "Observações técnicas"
        }
      },
      "substrato": {
        "tipo": "Offset",
        "gramagem": "250"
      },
      "alca": { ... },
      "acabamentos": { ... },
      "impressao": { ... },
      "enobrecimentos": [ ... ],
      "acondicionamento": { ... },
      "desenvolvimento": { ... }
    }
  ]
}
```

### Tratamento de Erros

- Se o webhook falhar, o status será atualizado para "erro"
- A resposta (ou mensagem de erro) será salva em `responseWebhook`
- O sistema não bloqueia a criação da solicitação se o webhook falhar

## 📊 Estrutura do Catálogo

O catálogo inicial está em `data/catalogo-inicial.json`. Este arquivo contém:

- Tipos de produto (SACO, SACOLA, CAIXA, etc.)
- Modelos por tipo
- Formatos padrão
- Substratos e gramagens
- Modos de impressão e combinações
- Tipos de enobrecimento
- Tipos de alça
- Acondicionamentos
- Módulos
- Regras (tiragem mínima, modelos sem enobrecimento, etc.)

### Atualizar Catálogo

1. Edite `data/catalogo-inicial.json`
2. Execute `npm run db:seed` novamente (isso limpará e recriará todos os dados)

**NOTA**: Em produção, considere migrar o catálogo para ser gerenciado via interface administrativa.

## 🔄 Migração do Catálogo para Banco de Dados

Atualmente, o catálogo é carregado de JSON em `lib/catalogo.ts`. Para migrar para usar o banco:

1. Modifique `lib/catalogo.ts` para usar `prisma` em vez de carregar JSON
2. Remova a importação de `data/catalogo-inicial.json`
3. Faça queries ao banco usando Prisma

Exemplo:

```typescript
// Antes (JSON)
import catalogoData from "@/data/catalogo-inicial.json"
export function getProdutoTipos() {
  return catalogoData.produtoTipos
}

// Depois (Banco)
import { prisma } from "@/lib/prisma"
export async function getProdutoTipos() {
  return await prisma.produtoTipo.findMany({
    include: { modelos: true }
  })
}
```

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor de desenvolvimento

# Banco de Dados
npm run db:generate      # Gerar cliente Prisma
npm run db:push          # Aplicar schema (desenvolvimento)
npm run db:migrate       # Criar migration (produção)
npm run db:seed          # Popular banco com dados iniciais
npm run db:studio        # Abrir Prisma Studio (interface visual)

# Build
npm run build            # Build para produção
npm run start            # Iniciar servidor de produção
```

## 📝 Próximos Passos

- [ ] Implementar autenticação de usuários
- [ ] Criar interface administrativa para gerenciar catálogo
- [ ] Adicionar geração de PDF das solicitações
- [ ] Implementar dashboard com estatísticas
- [ ] Adicionar filtros e busca na listagem de solicitações
- [ ] Implementar edição de solicitações (se necessário)

## 🐛 Troubleshooting

### Erro ao conectar ao banco

- Verifique se o PostgreSQL está rodando
- Confirme que a `DATABASE_URL` está correta no `.env`
- Teste a conexão: `psql $DATABASE_URL`

### Webhook não está sendo enviado

- Verifique se `WEBHOOK_URL` está configurada no `.env`
- Verifique os logs do servidor para erros
- Confirme que a URL do webhook está acessível
- Verifique o status na página de detalhes da solicitação

### Catálogo não aparece no formulário

- Execute `npm run db:seed` para popular o banco
- Verifique se os dados foram criados: `npm run db:studio`
- Confirme que o arquivo `data/catalogo-inicial.json` existe

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.







