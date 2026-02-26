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







