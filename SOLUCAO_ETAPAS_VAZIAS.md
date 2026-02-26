# Solução: Etapas não aparecem no Painel da Engenharia

## Problema
As etapas não estão aparecendo na página `/engenharia/formulario`.

## Causa
Isso acontece quando:
1. O Prisma Client não foi gerado após adicionar as novas tabelas
2. As tabelas não foram criadas no banco de dados
3. O seed não foi executado para popular as etapas iniciais

## Solução Passo a Passo

### 1. Gerar o Prisma Client
```bash
npm run db:generate
```

**Se der erro de permissão:**
- Feche o servidor Next.js se estiver rodando
- Feche o Prisma Studio se estiver aberto
- Tente novamente

### 2. Aplicar o Schema ao Banco de Dados
```bash
npm run db:push
```

Isso criará as tabelas `formulario_etapa` e `formulario_pergunta` no banco.

### 3. Popular com Dados Iniciais
```bash
npm run db:seed
```

Isso criará:
- 9 etapas padrão
- Todas as perguntas base em cada etapa

### 4. Verificar se Funcionou
1. Acesse `http://localhost:3000/engenharia/formulario`
2. Você deve ver as 9 etapas na lista à esquerda
3. Ao clicar em uma etapa, as perguntas devem aparecer

## Verificação Rápida

Se ainda não funcionar, verifique:

1. **Banco de dados está configurado?**
   - Verifique o arquivo `.env` e confirme que `DATABASE_URL` está correto

2. **Tabelas foram criadas?**
   - Execute no banco: `SELECT * FROM formulario_etapa;`
   - Se retornar erro, execute `npm run db:push` novamente

3. **Seed foi executado?**
   - Execute: `SELECT COUNT(*) FROM formulario_etapa;`
   - Deve retornar 9 etapas
   - Se retornar 0, execute `npm run db:seed` novamente

## Comandos Completos (em ordem)

```bash
# 1. Gerar Prisma Client
npm run db:generate

# 2. Criar tabelas no banco
npm run db:push

# 3. Popular com dados iniciais
npm run db:seed

# 4. Iniciar servidor (se não estiver rodando)
npm run dev
```

## Se o Problema Persistir

1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do servidor Next.js
3. Verifique se há erros no terminal ao executar os comandos acima









