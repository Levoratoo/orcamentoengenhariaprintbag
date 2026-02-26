# Sistema Orçamentário - Ação Schutz

Sistema web interno para gerenciamento de solicitações de orçamento de produtos gráficos.

## Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Validação**: Zod + React Hook Form
- **UI**: shadcn/ui + Tailwind CSS

## Estrutura do Projeto

```
/app                    # Páginas e rotas (App Router)
  /api                  # APIs REST
  /solicitacoes         # Páginas de solicitações
/lib                    # Funções auxiliares e serviços
/types                  # Tipos TypeScript globais
/data                   # Catálogo inicial (JSON)
/components             # Componentes React reutilizáveis
/prisma                 # Schema e migrations do Prisma
```

## Configuração Inicial

1. **Instalar dependências**:
```bash
npm install
```

2. **Configurar variáveis de ambiente**:
```bash
cp .env.example .env
# Editar .env com suas configurações de banco e webhook
```

3. **Configurar banco de dados**:
```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar schema ao banco (desenvolvimento)
npm run db:push

# Ou criar migration (produção)
npm run db:migrate
```

4. **Iniciar servidor de desenvolvimento**:
```bash
npm run dev
```

## Configuração do Webhook

A URL do webhook deve ser configurada na variável de ambiente `WEBHOOK_URL` no arquivo `.env`.

O sistema enviará um POST para essa URL com um JSON estruturado contendo todos os dados da solicitação.

## Funcionalidades

- ✅ Wizard de criação de solicitação (8 etapas)
- ✅ Validações baseadas em catálogo técnico
- ✅ Persistência no banco de dados
- ✅ Disparo de webhook
- ✅ Listagem e detalhamento de solicitações

## Próximos Passos

- [ ] Autenticação de usuários
- [ ] Migração do catálogo de JSON para banco de dados
- [ ] Geração de PDF das solicitações
- [ ] Dashboard com estatísticas







