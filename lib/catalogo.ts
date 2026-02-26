// Serviço para carregar e trabalhar com o catálogo
// Inicialmente carrega de JSON, mas preparado para migrar para BD

// IMPORTANTE: Usar catalogo-completo.json que contém toda a estrutura detalhada
import catalogoData from "@/data/catalogo-completo.json";
import { CatalogoCompleto, ProdutoTipo, ProdutoModelo } from "@/types/catalog";

export function getCatalogo(): CatalogoCompleto {
  return catalogoData as CatalogoCompleto;
}

export function getProdutoTipos(): ProdutoTipo[] {
  return getCatalogo().produtoTipos;
}

export function getProdutoTipoPorCodigo(codigo: string): ProdutoTipo | undefined {
  return getProdutoTipos().find((tipo) => tipo.codigo === codigo);
}

export function getModelosPorTipo(tipoId: string): ProdutoModelo[] {
  const tipo = getProdutoTipos().find((t) => t.id === tipoId);
  return tipo?.modelos || [];
}

export function getModeloPorId(modeloId: string): ProdutoModelo | undefined {
  const tipos = getProdutoTipos();
  for (const tipo of tipos) {
    const modelo = tipo.modelos.find((m) => m.id === modeloId);
    if (modelo) return modelo;
  }
  const modeloIdNormalizado = modeloId.trim().toLowerCase();
  for (const tipo of tipos) {
    const modelo = tipo.modelos.find((m) => {
      if (m.codigo && m.codigo.toLowerCase() === modeloIdNormalizado) return true;
      return m.nome.toLowerCase() === modeloIdNormalizado;
    });
    if (modelo) return modelo;
  }
  return undefined;
}

export function getSubstratosPermitidos(modeloId: string) {
  const modelo = getModeloPorId(modeloId);
  if (!modelo) return [];
  
  const catalogo = getCatalogo();
  return catalogo.substratos.filter((sub) =>
    modelo.substratosPermitidos.includes(sub.id)
  );
}

export function getImpressoesPermitidas(modeloId: string) {
  const modelo = getModeloPorId(modeloId);
  if (!modelo) return [];
  
  const catalogo = getCatalogo();
  return catalogo.impressaoModos.filter((modo) =>
    modelo.impressoesPermitidas.includes(modo.id)
  );
}

// Alias para compatibilidade
export const getModosImpressaoPermitidos = getImpressoesPermitidas;

export function getEnobrecimentosPermitidos(modeloId: string) {
  const modelo = getModeloPorId(modeloId);
  if (!modelo) return [];
  
  const catalogo = getCatalogo();
  return catalogo.enobrecimentoTipos.filter((enob) =>
    modelo.enobrecimentosPermitidos.includes(enob.id)
  );
}

export function getAcondicionamentosPermitidos(modeloId: string) {
  const modelo = getModeloPorId(modeloId);
  if (!modelo) return [];
  
  const catalogo = getCatalogo();
  return catalogo.acondicionamentos.filter((acond) =>
    modelo.acondicionamentosPermitidos.includes(acond.id)
  );
}

export function getFormatosPermitidos(modeloId: string) {
  const modelo = getModeloPorId(modeloId);
  if (!modelo) return [];
  
  const catalogo = getCatalogo();
  return catalogo.formatosPadrao.filter((fmt) =>
    modelo.formatosPermitidos.includes(fmt.id)
  );
}

export function getTiragemMinima(tipoCodigo: string): number | null {
  const regras = getCatalogo().regras;
  return regras.tiragemMinima[tipoCodigo as keyof typeof regras.tiragemMinima] || null;
}

export function modeloPermiteAlca(modeloId: string): boolean {
  const modelo = getModeloPorId(modeloId);
  return modelo?.permiteAlca ?? false;
}

export function modeloPermiteEnobrecimento(modeloId: string): boolean {
  const modelo = getModeloPorId(modeloId);
  if (!modelo) return false;
  
  const regras = getCatalogo().regras;
  return !regras.modelosSemEnobrecimento.includes(modeloId);
}

export function modeloPermiteImpressao(modeloId: string): boolean {
  const modelo = getModeloPorId(modeloId);
  if (!modelo) return false;
  
  const regras = getCatalogo().regras;
  return !regras.modelosSemImpressao.includes(modeloId);
}

export function modeloPermiteAcabamentos(modeloId: string): boolean {
  const modelo = getModeloPorId(modeloId);
  if (!modelo) return false;
  
  const regras = getCatalogo().regras;
  if (regras.modelosSemAcabamentos?.includes(modeloId)) return false;
  
  return modelo.permiteAcabamentos !== false;
}

export function modeloPermiteEnobrecimentoExplicito(modeloId: string): boolean {
  const modelo = getModeloPorId(modeloId);
  if (!modelo) return false;
  
  return modelo.permiteEnobrecimentos !== false;
}

export function modeloPermiteImpressaoApara(modeloId: string): boolean {
  const modelo = getModeloPorId(modeloId);
  return modelo?.permiteImpressaoApara === true;
}

export function getLargurasPadrao(modeloId: string): number[] {
  const modelo = getModeloPorId(modeloId);
  return modelo?.largurasPadrao || [];
}

export function getAlturasPadrao(modeloId: string): number[] {
  const modelo = getModeloPorId(modeloId);
  return modelo?.alturasPadrao || [];
}

export function getSanfonasPadrao(modeloId: string): number[] {
  const modelo = getModeloPorId(modeloId);
  return modelo?.sanfonasPadrao || [];
}

export function getTiposAlcaPermitidos(modeloId: string): string[] {
  const modelo = getModeloPorId(modeloId);
  return modelo?.tiposAlcaPermitidos || [];
}

export function getAplicacoesAlcaPermitidas(modeloId: string): string[] {
  const modelo = getModeloPorId(modeloId);
  return modelo?.aplicacoesAlcaPermitidas || [];
}

export function getLargurasAlcaPermitidas(modeloId: string): number[] {
  const modelo = getModeloPorId(modeloId);
  return modelo?.largurasAlcaPermitidas || [];
}

export function getCoresAlcaPermitidas(modeloId: string): string[] {
  const modelo = getModeloPorId(modeloId);
  return modelo?.coresAlcaPermitidas || [];
}

export function getAcabamentosPermitidos(modeloId: string): string[] {
  const modelo = getModeloPorId(modeloId);
  return modelo?.acabamentosPermitidos || [];
}

export function getModelosReforcoFundo(modeloId: string): string[] {
  const modelo = getModeloPorId(modeloId);
  return modelo?.modelosReforcoFundo || [];
}

export function getModelosFuroFita(modeloId: string): string[] {
  const modelo = getModeloPorId(modeloId);
  return modelo?.modelosFuroFita || [];
}

export function getTiragemMinimaAlcaColorida(modeloId: string): number | null {
  const modelo = getModeloPorId(modeloId);
  if (modelo?.tiragemMinimaAlcaColorida) {
    return modelo.tiragemMinimaAlcaColorida;
  }
  const regras = getCatalogo().regras;
  return regras.tiragemMinimaAlcaColorida || null;
}

// Função para obter combinações de cores permitidas para um modelo e modo de impressão específicos
export function getCombinacoesPermitidas(modeloId: string, modoImpressaoId: string): any[] {
  const modelo = getModeloPorId(modeloId);
  if (!modelo || !modoImpressaoId) return [];

  const catalogo = getCatalogo();
  const normalizar = (valor: string) =>
    valor
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const modoIdNormalizado = normalizar(modoImpressaoId.trim());

  const modo = catalogo.impressaoModos.find((m) => {
    if (m.id === modoImpressaoId) return true;
    const codigoNormalizado = m.codigo ? normalizar(m.codigo) : "";
    const nomeNormalizado = m.nome ? normalizar(m.nome) : "";
    return codigoNormalizado === modoIdNormalizado || nomeNormalizado === modoIdNormalizado;
  });
  if (!modo) return [];

  // Se o modelo tem combinacoes especificas definidas, filtrar por elas
  const combinacoesPermitidas =
    modelo.combinacoesImpressao?.[modo.id] || modelo.combinacoesImpressao?.[modoImpressaoId];
  if (combinacoesPermitidas && combinacoesPermitidas.length > 0) {
    return (modo.combinacoes || []).filter(
      (comb) =>
        combinacoesPermitidas.includes(comb.codigo) ||
        combinacoesPermitidas.includes(comb.id)
    );
  }

  // Caso contrario, retornar todas as combinacoes do modo
  return modo.combinacoes || [];
}

