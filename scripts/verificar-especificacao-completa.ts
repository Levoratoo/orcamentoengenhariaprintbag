/**
 * Script para verificar se o catálogo está de acordo com a especificação
 */

import catalogoData from "../data/catalogo-completo.json"

console.log("=== VERIFICAÇÃO DA ESPECIFICAÇÃO COMPLETA ===\n")

// Helper para encontrar modelo
function getModelo(tipoId: string, modeloId: string) {
  const tipo = catalogoData.produtoTipos.find(t => t.id === tipoId)
  if (!tipo) return null
  return tipo.modelos.find((m: any) => m.id === modeloId)
}

// ========================================
// SACO - FUNDO V
// ========================================
console.log("📦 SACO - FUNDO V")
const fundoV = getModelo("tipo_saco", "modelo_fundo_v") as any
if (fundoV) {
  console.log(`  Larguras: ${fundoV.largurasPadrao?.join(", ") || "N/A"}`)
  console.log(`  Esperado: 80, 105, 120, 135, 160, 200`)
  console.log(`  Alturas: ${fundoV.alturasPadrao?.join(", ") || "N/A"}`)
  console.log(`  Esperado: 100, 115, 140, 160, 165, 175, 190, 210, 240, 290, 330, 340, 360, 390, 430, 490`)
  console.log(`  Sanfonas: ${fundoV.sanfonasPadrao?.join(", ") || "N/A"}`)
  console.log(`  Esperado: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120`)
  console.log(`  Permite Alça: ${fundoV.permiteAlca} (esperado: false)`)
  console.log(`  Permite Acabamentos: ${fundoV.permiteAcabamentos} (esperado: false)`)
  console.log(`  Permite Enobrecimentos: ${fundoV.permiteEnobrecimentos} (esperado: false)`)
  console.log(`  Módulo Shrink: ${fundoV.moduloPadraoShrink} (esperado: 500)`)
}

// ========================================
// SACO - FUNDO QUADRADO
// ========================================
console.log("\n📦 SACO - FUNDO QUADRADO")
const fundoQuadrado = getModelo("tipo_saco", "modelo_fundo_quadrado") as any
if (fundoQuadrado) {
  console.log(`  Formatos: ${fundoQuadrado.formatosPermitidos?.length || 0} formatos`)
  console.log(`  Permite Alça: ${fundoQuadrado.permiteAlca} (esperado: false)`)
  console.log(`  Permite Acabamentos: ${fundoQuadrado.permiteAcabamentos} (esperado: true - Reforço de fundo)`)
  console.log(`  Permite Enobrecimentos: ${fundoQuadrado.permiteEnobrecimentos} (esperado: false)`)
  console.log(`  Módulo Shrink: ${fundoQuadrado.moduloPadraoShrink} (esperado: 100)`)
}

// ========================================
// CAIXA - TAMPA E FUNDO
// ========================================
console.log("\n📦 CAIXA - TAMPA E FUNDO")
const tampaFundo = getModelo("tipo_caixa", "modelo_tampa_fundo") as any
if (tampaFundo) {
  console.log(`  Formatos: ${tampaFundo.formatosPermitidos?.length || 0} formatos`)
  console.log(`  Permite Alça: ${tampaFundo.permiteAlca} (esperado: true - Dalva, Sintética)`)
  console.log(`  Permite Acabamentos: ${tampaFundo.permiteAcabamentos} (esperado: false)`)
  console.log(`  Permite Enobrecimentos: ${tampaFundo.permiteEnobrecimentos} (esperado: true)`)
  console.log(`  Enobrecimentos: ${tampaFundo.enobrecimentosPermitidos?.join(", ") || "N/A"}`)
  console.log(`  Módulo Pacote: ${tampaFundo.moduloPadraoPacote} (esperado: 50)`)
}

// ========================================
// GUARDANAPO - SACHET
// ========================================
console.log("\n📦 GUARDANAPO - SACHET")
const sachet = getModelo("tipo_guardanapo", "modelo_sachet") as any
if (sachet) {
  console.log(`  Formatos: ${sachet.formatosPermitidos?.join(", ") || "N/A"}`)
  console.log(`  Esperado: 50x185, 50x150`)
  console.log(`  Permite Alça: ${sachet.permiteAlca} (esperado: false)`)
  console.log(`  Permite Acabamentos: ${sachet.permiteAcabamentos} (esperado: false)`)
  console.log(`  Permite Enobrecimentos: ${sachet.permiteEnobrecimentos} (esperado: false)`)
  console.log(`  Módulo Caixa: ${sachet.moduloPadraoCaixa} (esperado: 2000)`)
}

// ========================================
// ETIQUETA
// ========================================
console.log("\n📦 ETIQUETA - MODELOS")
const tipoEtiqueta = catalogoData.produtoTipos.find(t => t.id === "tipo_etiqueta")
if (tipoEtiqueta) {
  for (const modelo of tipoEtiqueta.modelos as any[]) {
    console.log(`  ${modelo.nome}:`)
    console.log(`    Permite Alça: ${modelo.permiteAlca} (esperado: false)`)
    console.log(`    Permite Acabamentos: ${modelo.permiteAcabamentos} (esperado: false)`)
    console.log(`    Permite Enobrecimentos: ${modelo.permiteEnobrecimentos} (esperado: true)`)
  }
}

// ========================================
// SEDA
// ========================================
console.log("\n📦 SEDA - CORTE LOUCO")
const corteLouco = getModelo("tipo_seda", "modelo_corte_louco") as any
if (corteLouco) {
  console.log(`  Formatos: ${corteLouco.formatosPermitidos?.length || 0} formatos`)
  console.log(`  Esperado: 470x400, 700x500, 250x700, 500x600, 470x700, 500x500, 250x500`)
  console.log(`  Permite Alça: ${corteLouco.permiteAlca} (esperado: false)`)
  console.log(`  Permite Acabamentos: ${corteLouco.permiteAcabamentos} (esperado: false)`)
  console.log(`  Permite Enobrecimentos: ${corteLouco.permiteEnobrecimentos} (esperado: false)`)
  console.log(`  Tiragem Mínima: ${corteLouco.tiragemMinimaInterna} (esperado: 30000)`)
}

// ========================================
// FITA
// ========================================
console.log("\n📦 FITA - ROLO E PEDAÇOS")
const tipoFita = catalogoData.produtoTipos.find(t => t.id === "tipo_fita")
if (tipoFita) {
  for (const modelo of tipoFita.modelos as any[]) {
    console.log(`  ${modelo.nome}:`)
    console.log(`    Substratos: ${modelo.substratosPermitidos?.join(", ") || "N/A"}`)
    console.log(`    Esperado: Cetim, Gorgurão`)
    console.log(`    Impressão: ${modelo.impressoesPermitidas?.join(", ") || "N/A"}`)
    console.log(`    Esperado: Serigrafia, Sem Impressão, Outro`)
    console.log(`    Enobrecimentos: ${modelo.enobrecimentosPermitidos?.join(", ") || "N/A"}`)
    console.log(`    Esperado: Hot Stamping`)
  }
}

// ========================================
// SOLAPA
// ========================================
console.log("\n📦 SOLAPA - MALWEE E RIACHUELO")
const tipoSolapa = catalogoData.produtoTipos.find(t => t.id === "tipo_solapa")
if (tipoSolapa) {
  for (const modelo of tipoSolapa.modelos as any[]) {
    console.log(`  ${modelo.nome}:`)
    console.log(`    Formatos: ${modelo.formatosPermitidos?.length || 0} formatos`)
    console.log(`    Acabamentos: ${modelo.acabamentosPermitidos?.join(", ") || "N/A"}`)
    console.log(`    Esperado: Furo de Fita`)
    console.log(`    Dupla Face: ${modelo.permiteDuplaFace || false}`)
  }
}

// ========================================
// TAG
// ========================================
console.log("\n📦 TAG - MODELOS")
const tipoTag = catalogoData.produtoTipos.find(t => t.id === "tipo_tag")
if (tipoTag) {
  for (const modelo of tipoTag.modelos as any[]) {
    console.log(`  ${modelo.nome}:`)
    console.log(`    Acabamentos: ${modelo.acabamentosPermitidos?.join(", ") || "N/A"}`)
    console.log(`    Esperado: Furo de Fita`)
    console.log(`    Terceirizada: ${modelo.terceirizada || false} (esperado: true)`)
  }
}

// ========================================
// SACOLA - ELEGANCE
// ========================================
console.log("\n📦 SACOLA - ELEGANCE")
const elegance = getModelo("tipo_sacola", "modelo_elegance") as any
if (elegance) {
  console.log(`  Formatos Pequenos: ${elegance.formatosPequenos?.length || 0} (esperado: 10)`)
  console.log(`  Formatos Grandes: ${elegance.formatosGrandes?.length || 0} (esperado: 6)`)
  console.log(`  Tipos Alça: ${elegance.tiposAlcaPermitidos?.join(", ") || "N/A"}`)
  console.log(`  Esperado: Dalva Gorgurão, Sintética São Francisco`)
  console.log(`  Aplicações: ${elegance.aplicacoesAlcaPermitidas?.join(", ") || "N/A"}`)
  console.log(`  Esperado: com_ponteira, colada`)
  console.log(`  Larguras Alça: ${elegance.largurasAlcaPermitidas?.join(", ") || "N/A"}`)
  console.log(`  Esperado: 1.0, 1.5, 2.0, 2.5, 3.0`)
  console.log(`  Acabamentos: ${elegance.acabamentosPermitidos?.join(", ") || "N/A"}`)
  console.log(`  Esperado: reforco_fundo, furo_fita, boca_palhaco`)
  console.log(`  Enobrecimentos: ${elegance.enobrecimentosPermitidos?.join(", ") || "N/A"}`)
  console.log(`  Esperado: Hot Stamping, Relevo, Gofragem, Laminação`)
}

// ========================================
// SACOLA - EVOLUTION
// ========================================
console.log("\n📦 SACOLA - EVOLUTION")
const evolution = getModelo("tipo_sacola", "modelo_evolution") as any
if (evolution) {
  console.log(`  Formatos: ${evolution.formatosPermitidos?.length || 0} (esperado: 7)`)
  console.log(`  Tipos Alça: ${evolution.tiposAlcaPermitidos?.join(", ") || "N/A"}`)
  console.log(`  Esperado: Dalva Gorgurão, Sintética, Papel Torcido`)
  console.log(`  Acabamentos: ${evolution.acabamentosPermitidos?.join(", ") || "N/A"}`)
  console.log(`  Esperado: reforco_fundo, furo_fita`)
  console.log(`  Tiragem Mín. Alça Colorida: ${evolution.tiragemMinimaAlcaColorida} (esperado: 10000)`)
}

// ========================================
// SACOLA - AUTOMÁTICA
// ========================================
console.log("\n📦 SACOLA - AUTOMÁTICA")
const automatica = getModelo("tipo_sacola", "modelo_automatica") as any
if (automatica) {
  console.log(`  Formatos Pequenos: ${automatica.formatosPequenos?.length || 0} (esperado: 10)`)
  console.log(`  Formatos Grandes: ${automatica.formatosGrandes?.length || 0} (esperado: 4)`)
  console.log(`  Módulo Pequeno: ${automatica.moduloPadraoPequeno} (esperado: 100)`)
  console.log(`  Módulo Grande: ${automatica.moduloPadraoGrande} (esperado: 50)`)
  console.log(`  Tipo Alça: ${automatica.tiposAlcaPermitidos?.join(", ") || "N/A"}`)
  console.log(`  Esperado: Papel Torcido (colada)`)
  console.log(`  Cores Alça: ${automatica.coresAlcaPermitidas?.join(", ") || "N/A"}`)
  console.log(`  Esperado: preta, branca, parda, colorida`)
  console.log(`  Permite Enobrecimentos: ${automatica.permiteEnobrecimentos} (esperado: false)`)
  console.log(`  Tiragem Mín. Alça Colorida: ${automatica.tiragemMinimaAlcaColorida} (esperado: 10000)`)
}

// ========================================
// ENVELOPE
// ========================================
console.log("\n📦 ENVELOPE")
const envelope = getModelo("tipo_envelope", "modelo_envelope") as any
if (envelope) {
  console.log(`  Formatos Pequenos: ${envelope.formatosPequenos?.length || 0} (esperado: 5)`)
  console.log(`  Formatos Grandes: ${envelope.formatosGrandes?.length || 0} (esperado: 2)`)
  console.log(`  Variações definidas: ${envelope.variacoes?.length || 0} (esperado: 4)`)
  console.log(`    - Com Alça SEM Trava Lateral`)
  console.log(`    - Com Alça COM Trava Lateral`)
  console.log(`    - Sem Alça SEM Trava Lateral`)
  console.log(`    - Sem Alça COM Trava Lateral`)
  console.log(`  Acabamentos: ${envelope.acabamentosPermitidos?.join(", ") || "N/A"}`)
  console.log(`  Esperado: reforco_fundo, furo_fita, boca_palhaco, dupla_face, velcro`)
  console.log(`  Tamanhos Velcro: ${envelope.tamanhosVelcro?.join(", ") || "N/A"}`)
  console.log(`  Esperado: 16mm, 21mm`)
}

// ========================================
// SUBSTRATOS
// ========================================
console.log("\n📄 SUBSTRATOS")
for (const sub of catalogoData.substratos) {
  console.log(`  ${sub.nome}: ${sub.gramagens.join(", ")}g`)
}

// ========================================
// RESUMO
// ========================================
console.log("\n=== RESUMO ===")
console.log(`Total de Tipos de Produto: ${catalogoData.produtoTipos.length}`)
let totalModelos = 0
for (const tipo of catalogoData.produtoTipos) {
  totalModelos += tipo.modelos.length
}
console.log(`Total de Modelos: ${totalModelos}`)
console.log(`Total de Formatos: ${catalogoData.formatosPadrao.length}`)
console.log(`Total de Substratos: ${catalogoData.substratos.length}`)
console.log(`Total de Modos de Impressão: ${catalogoData.impressaoModos.length}`)
console.log(`Total de Enobrecimentos: ${catalogoData.enobrecimentoTipos.length}`)
console.log(`Total de Tipos de Alça: ${catalogoData.alcaTipos.length}`)
console.log(`Total de Acondicionamentos: ${catalogoData.acondicionamentos.length}`)
console.log(`Total de Módulos: ${catalogoData.modulos.length}`)



