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

## Servidor sempre online (producao)

Use PM2 para manter o processo com reinicio automatico:

```bash
npm run pm2:start
```

`pm2:start` faz build e sobe em producao (`next start`).
Para atualizar versao com novo build, use:

```bash
npm run pm2:restart
```

Comandos uteis:

```bash
npm run pm2:status   # status do processo
npm run pm2:logs     # logs em tempo real
npm run pm2:restart  # rebuild + restart
npm run pm2:stop     # para o processo
npm run pm2:save     # salva lista de processos para restauracao futura
```

Para subir automaticamente apos reiniciar o Windows, crie uma tarefa agendada (PowerShell como Administrador):

```powershell
SCHTASKS /Create /TN "Orcamentario-PM2" /SC ONLOGON /TR "\"C:\Users\pedro.levorato\Documents\Orçamentario\scripts\start-pm2.cmd\"" /F
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







