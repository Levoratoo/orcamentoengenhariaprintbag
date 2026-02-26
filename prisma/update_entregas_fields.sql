-- Atualizar campos da etapa de ENTREGAS
-- Desativar campos removidos
UPDATE "FormularioPergunta" 
SET ativo = false
WHERE "systemKey" IN ('qtd_local_unico', 'cidades_uf_multiplas', 'anexar_lista_lojas');

-- Atualizar campo Quantidades (Frete)
UPDATE "FormularioPergunta" 
SET 
  titulo = 'Quantidades',
  tipo = 'texto_curto',
  ajuda = 'Informe a tiragem do produto para orçamento. Separe por vírgula.'
WHERE "systemKey" = 'frete_quantidade';

-- Verificar os campos atualizados
SELECT "systemKey", titulo, tipo, ativo, ajuda 
FROM "FormularioPergunta" 
WHERE "systemKey" IN ('qtd_local_unico', 'cidades_uf_multiplas', 'anexar_lista_lojas', 'frete_quantidade')
ORDER BY "systemKey";
