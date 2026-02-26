# 📋 Instruções para Atualizar os Campos da Etapa ENTREGAS

## Opção 1: Usando Prisma Studio (Mais Fácil)

1. Abra o Prisma Studio:
```bash
npm run db:studio
```

2. Navegue até a tabela `FormularioPergunta`

3. Encontre e edite os seguintes registros:

### Campos para DESATIVAR (marcar ativo = false):
- **systemKey**: `qtd_local_unico` → ativo = `false`
- **systemKey**: `cidades_uf_multiplas` → ativo = `false`  
- **systemKey**: `anexar_lista_lojas` → ativo = `false`

### Campo para ATUALIZAR:
- **systemKey**: `frete_quantidade`
  - titulo: `Quantidades`
  - tipo: `texto_curto`
  - ajuda: `Informe a tiragem do produto para orçamento. Separe por vírgula.`

---

## Opção 2: Usando SQL (No pgAdmin ou psql)

Copie e execute o SQL abaixo:

```sql
-- 1. Desativar campos removidos
UPDATE "FormularioPergunta" 
SET ativo = false
WHERE "systemKey" IN ('qtd_local_unico', 'cidades_uf_multiplas', 'anexar_lista_lojas');

-- 2. Atualizar campo Quantidades
UPDATE "FormularioPergunta" 
SET 
  titulo = 'Quantidades',
  tipo = 'texto_curto',
  ajuda = 'Informe a tiragem do produto para orçamento. Separe por vírgula.'
WHERE "systemKey" = 'frete_quantidade';

-- 3. Verificar se deu certo
SELECT "systemKey", titulo, tipo, ativo, ajuda 
FROM "FormularioPergunta" 
WHERE "systemKey" IN ('qtd_local_unico', 'cidades_uf_multiplas', 'anexar_lista_lojas', 'frete_quantidade')
ORDER BY "systemKey";
```

---

## Opção 3: Rodar o Seed Completo

Se preferir resetar todo o banco (⚠️ **CUIDADO**: vai apagar todos os dados):

```bash
npm run db:migrate -- --force
```

Depois rode o seed:

```bash
npm run db:seed
```

---

## ✅ Resultado Esperado

Após a atualização, os campos devem estar assim:

| systemKey | titulo | tipo | ativo | ajuda |
|-----------|--------|------|-------|-------|
| anexar_lista_lojas | Anexar Lista de Lojas | booleano | **false** | Marque se irá anexar lista de lojas |
| cidades_uf_multiplas | Cidades/UF (Múltiplas) | texto_longo | **false** | Liste as cidades/UF... |
| frete_quantidade | **Quantidades** | **texto_curto** | true | **Informe a tiragem do produto para orçamento. Separe por vírgula.** |
| qtd_local_unico | Quantidade (Local Único) | numero | **false** | Quantidade para entrega no local único |

