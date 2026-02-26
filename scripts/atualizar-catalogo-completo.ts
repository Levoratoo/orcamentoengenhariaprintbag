/**
 * Script para atualizar o catálogo com TODOS os dados da especificação
 * IMPORTANTE: Nunca exclui dados, apenas adiciona novos
 */

import * as fs from "fs"
import * as path from "path"

// Carregar catálogo atual
const catalogoPath = path.join(__dirname, "../data/catalogo-completo.json")
const catalogo = JSON.parse(fs.readFileSync(catalogoPath, "utf-8"))

console.log("=== Atualizando Catálogo Completo ===\n")

// ========================================
// 1. ATUALIZAR SUBSTRATOS
// ========================================
console.log("1. Atualizando SUBSTRATOS...")

// Verificar e adicionar gramagens que faltam
const substratoUpdates: Record<string, string[]> = {
  sub_fine_branco: ["35", "40", "50", "60"],
  sub_fine_kraft: ["35", "40", "50", "60"],
  sub_offset: ["120", "150", "180", "240"],
  sub_kraft: ["70", "80", "90", "100", "120", "140", "150", "186", "240", "300"],
  sub_greenbag: ["90"],
  sub_lin: ["90", "115", "130"],
  sub_duplex: ["190", "200", "210", "250", "275", "300", "325"],
  sub_triplex: ["200", "225", "240", "250", "275", "300", "325", "350"],
  sub_seda: ["20"],
  sub_bopp: [],
  sub_couche: ["210", "250", "300", "350"],
  sub_couche_brilho: ["210", "250", "300", "350"],
  sub_couche_fosco: ["210", "250", "300", "350"],
}

for (const substrato of catalogo.substratos) {
  const expected = substratoUpdates[substrato.id]
  if (expected) {
    const atual = new Set(substrato.gramagens)
    for (const g of expected) {
      if (!atual.has(g)) {
        substrato.gramagens.push(g)
        console.log(`  + ${substrato.nome}: adicionada gramagem ${g}g`)
      }
    }
    // Ordenar gramagens numericamente
    substrato.gramagens.sort((a: string, b: string) => parseInt(a) - parseInt(b))
  }
}

// ========================================
// 2. ATUALIZAR FORMATOS
// ========================================
console.log("\n2. Verificando FORMATOS...")

const formatosNecessarios = [
  // Saco Fundo Quadrado
  { id: "fmt_150x220x70", nome: "150 x 220 x 70", largura: 150, altura: 220, lateral: 70 },
  { id: "fmt_180x260x100", nome: "180 x 260 x 100", largura: 180, altura: 260, lateral: 100 },
  { id: "fmt_180x300x100", nome: "180 x 300 x 100", largura: 180, altura: 300, lateral: 100 },
  { id: "fmt_220x260x100", nome: "220 x 260 x 100", largura: 220, altura: 260, lateral: 100 },
  { id: "fmt_220x350x140", nome: "220 x 350 x 140", largura: 220, altura: 350, lateral: 140 },
  { id: "fmt_230x320x100", nome: "230 x 320 x 100", largura: 230, altura: 320, lateral: 100 },
  { id: "fmt_240x295x115", nome: "240 x 295 x 115", largura: 240, altura: 295, lateral: 115 },
  { id: "fmt_260x260x120", nome: "260 x 260 x 120", largura: 260, altura: 260, lateral: 120 },
  { id: "fmt_260x350x120", nome: "260 x 350 x 120", largura: 260, altura: 350, lateral: 120 },
  { id: "fmt_310x355x125", nome: "310 x 355 x 125", largura: 310, altura: 355, lateral: 125 },
  { id: "fmt_310x360x170", nome: "310 x 360 x 170", largura: 310, altura: 360, lateral: 170 },
  { id: "fmt_320x340x140", nome: "320 x 340 x 140", largura: 320, altura: 340, lateral: 140 },
  { id: "fmt_320x340x130", nome: "320 x 340 x 130", largura: 320, altura: 340, lateral: 130 },
  { id: "fmt_320x400x130", nome: "320 x 400 x 130", largura: 320, altura: 400, lateral: 130 },
  { id: "fmt_330x370x190", nome: "330 x 370 x 190", largura: 330, altura: 370, lateral: 190 },
  { id: "fmt_400x315x110", nome: "400 x 315 x 110", largura: 400, altura: 315, lateral: 110 },
  { id: "fmt_400x350x150", nome: "400 x 350 x 150", largura: 400, altura: 350, lateral: 150 },
  { id: "fmt_400x460x150", nome: "400 x 460 x 150", largura: 400, altura: 460, lateral: 150 },
  { id: "fmt_460x485x160", nome: "460 x 485 x 160", largura: 460, altura: 485, lateral: 160 },
]

const formatosExistentes = new Set(catalogo.formatosPadrao.map((f: any) => f.id))
for (const fmt of formatosNecessarios) {
  if (!formatosExistentes.has(fmt.id)) {
    catalogo.formatosPadrao.push({
      id: fmt.id,
      codigo: fmt.id.replace("fmt_", "").toUpperCase(),
      nome: fmt.nome,
      largura: fmt.largura,
      altura: fmt.altura,
      lateral: fmt.lateral,
      aceitaDesenvolvimento: false
    })
    console.log(`  + Adicionado formato: ${fmt.nome}`)
  }
}

// ========================================
// 3. ATUALIZAR TIPOS DE ALÇA
// ========================================
console.log("\n3. Verificando TIPOS DE ALÇA...")

const alcasNecessarias = [
  { id: "alca_dalva", codigo: "DALVA_GORGURAO", nome: "Dalva Gorgurão" },
  { id: "alca_sintetica_sf", codigo: "SINTETICA_SF", nome: "Sintética 6/1 São Francisco" },
  { id: "alca_papel_torcido", codigo: "PAPEL_TORCIDO", nome: "Papel Torcido" },
]

const alcasExistentes = new Set(catalogo.alcaTipos.map((a: any) => a.id))
for (const alca of alcasNecessarias) {
  if (!alcasExistentes.has(alca.id)) {
    catalogo.alcaTipos.push({
      id: alca.id,
      codigo: alca.codigo,
      nome: alca.nome,
      descricao: `Alça tipo ${alca.nome}`
    })
    console.log(`  + Adicionada alça: ${alca.nome}`)
  }
}

// ========================================
// 4. ATUALIZAR MODOS DE IMPRESSÃO
// ========================================
console.log("\n4. Verificando MODOS DE IMPRESSÃO...")

// Verificar se existe Serigrafia
const serigrafiaExiste = catalogo.impressaoModos.some((m: any) => m.id === "imp_serigrafia")
if (!serigrafiaExiste) {
  catalogo.impressaoModos.push({
    id: "imp_serigrafia",
    codigo: "SERIGRAFIA",
    nome: "Serigrafia",
    combinacoes: [
      { id: "comb_serigrafia_1x0", codigo: "1x0", nome: "1x0", camadas: ["externa"] }
    ]
  })
  console.log("  + Adicionado modo: Serigrafia")
}

// ========================================
// 5. ATUALIZAR MODELOS ESPECÍFICOS
// ========================================
console.log("\n5. Atualizando MODELOS...")

// Função para encontrar modelo por ID
function getModelo(tipoId: string, modeloId: string) {
  const tipo = catalogo.produtoTipos.find((t: any) => t.id === tipoId)
  if (!tipo) return null
  return tipo.modelos.find((m: any) => m.id === modeloId)
}

// 5.1 SACO - FUNDO V
const fundoV = getModelo("tipo_saco", "modelo_fundo_v")
if (fundoV) {
  // Verificar larguras
  const largurasEsperadas = [80, 105, 120, 135, 160, 200]
  for (const l of largurasEsperadas) {
    if (!fundoV.largurasPadrao.includes(l)) {
      fundoV.largurasPadrao.push(l)
      console.log(`  + Fundo V: adicionada largura ${l}`)
    }
  }
  
  // Verificar alturas
  const alturasEsperadas = [100, 115, 140, 160, 165, 175, 190, 210, 240, 290, 330, 340, 360, 390, 430, 490]
  for (const a of alturasEsperadas) {
    if (!fundoV.alturasPadrao.includes(a)) {
      fundoV.alturasPadrao.push(a)
      console.log(`  + Fundo V: adicionada altura ${a}`)
    }
  }
  
  // Verificar sanfonas
  const sanfonasEsperadas = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]
  for (const s of sanfonasEsperadas) {
    if (!fundoV.sanfonasPadrao.includes(s)) {
      fundoV.sanfonasPadrao.push(s)
      console.log(`  + Fundo V: adicionada sanfona ${s}`)
    }
  }
  
  // Ordenar
  fundoV.largurasPadrao.sort((a: number, b: number) => a - b)
  fundoV.alturasPadrao.sort((a: number, b: number) => a - b)
  fundoV.sanfonasPadrao.sort((a: number, b: number) => a - b)
  
  // Garantir configurações
  fundoV.permiteAlca = false
  fundoV.permiteAcabamentos = false
  fundoV.permiteEnobrecimentos = false
  fundoV.moduloPadraoShrink = 500
}

// 5.2 SACO - FUNDO QUADRADO
const fundoQuadrado = getModelo("tipo_saco", "modelo_fundo_quadrado")
if (fundoQuadrado) {
  fundoQuadrado.permiteAlca = false
  fundoQuadrado.permiteAcabamentos = true
  fundoQuadrado.permiteEnobrecimentos = false
  fundoQuadrado.moduloPadraoShrink = 100
  fundoQuadrado.acabamentosPermitidos = ["reforco_fundo"]
  fundoQuadrado.modelosReforcoFundo = ["solto_pacote"]
  console.log("  ✓ Fundo Quadrado: configurações atualizadas")
}

// 5.3 CAIXA - TAMPA E FUNDO
const tampaFundo = getModelo("tipo_caixa", "modelo_tampa_fundo")
if (tampaFundo) {
  tampaFundo.permiteAlca = true
  tampaFundo.permiteAcabamentos = false
  tampaFundo.permiteEnobrecimentos = true
  tampaFundo.moduloPadraoPacote = 50
  tampaFundo.hotStampingCores = ["ouro", "prata", "preto", "outro"]
  tampaFundo.relevotipos = ["alto", "baixo"]
  tampaFundo.gofragemModelos = ["padrao", "personalizada"]
  tampaFundo.laminacaoTipos = ["brilho", "fosco"]
  tampaFundo.exigeLaminacaoTriplex = true
  console.log("  ✓ Tampa e Fundo: configurações atualizadas")
}

// 5.4 GUARDANAPO - SACHET
const sachet = getModelo("tipo_guardanapo", "modelo_sachet")
if (sachet) {
  sachet.permiteAlca = false
  sachet.permiteAcabamentos = false
  sachet.permiteEnobrecimentos = false
  sachet.moduloPadraoCaixa = 2000
  console.log("  ✓ Sachet: configurações atualizadas")
}

// 5.5 ETIQUETA
const tipoEtiqueta = catalogo.produtoTipos.find((t: any) => t.id === "tipo_etiqueta")
if (tipoEtiqueta) {
  for (const modelo of tipoEtiqueta.modelos) {
    modelo.permiteAlca = false
    modelo.permiteAcabamentos = false
    modelo.permiteEnobrecimentos = true
    modelo.enobrecimentosPermitidos = ["enob_hot_stamping", "enob_laminacao", "enob_verniz_uv"]
    modelo.hotStampingCores = ["ouro", "prata", "outro"]
    modelo.laminacaoTipos = ["brilho", "fosco"]
    modelo.modulosPacoteRolo = [500, 1000]
  }
  console.log("  ✓ Etiquetas: configurações atualizadas")
}

// 5.6 SEDA
const tipoSeda = catalogo.produtoTipos.find((t: any) => t.id === "tipo_seda")
if (tipoSeda) {
  for (const modelo of tipoSeda.modelos) {
    modelo.permiteAlca = false
    modelo.permiteAcabamentos = false
    modelo.permiteEnobrecimentos = false
    modelo.moduloPadraoShrink = 500
    modelo.tiragemMinimaInterna = 30000
  }
  console.log("  ✓ Seda: configurações atualizadas")
}

// 5.7 FITA
const tipoFita = catalogo.produtoTipos.find((t: any) => t.id === "tipo_fita")
if (tipoFita) {
  for (const modelo of tipoFita.modelos) {
    modelo.permiteAlca = false
    modelo.permiteAcabamentos = false
    modelo.permiteEnobrecimentos = true
    modelo.enobrecimentosPermitidos = ["enob_hot_stamping"]
    modelo.hotStampingCores = ["ouro", "prata", "outro"]
    modelo.requerCorFita = true
  }
  console.log("  ✓ Fita: configurações atualizadas")
}

// 5.8 SOLAPA
const tipoSolapa = catalogo.produtoTipos.find((t: any) => t.id === "tipo_solapa")
if (tipoSolapa) {
  for (const modelo of tipoSolapa.modelos) {
    modelo.permiteAlca = false
    modelo.permiteAcabamentos = true
    modelo.permiteEnobrecimentos = true
    modelo.acabamentosPermitidos = ["furo_fita"]
    modelo.enobrecimentosPermitidos = ["enob_hot_stamping", "enob_relevo", "enob_gofragem", "enob_laminacao", "enob_verniz_uv"]
    modelo.modulosPacote = [500, 1000]
    modelo.hotStampingCores = ["ouro", "prata", "outro"]
    modelo.permiteDuplaFace = true
  }
  console.log("  ✓ Solapa: configurações atualizadas")
}

// 5.9 TAG
const tipoTag = catalogo.produtoTipos.find((t: any) => t.id === "tipo_tag")
if (tipoTag) {
  for (const modelo of tipoTag.modelos) {
    modelo.permiteAlca = false
    modelo.permiteAcabamentos = true
    modelo.permiteEnobrecimentos = true
    modelo.acabamentosPermitidos = ["furo_fita"]
    modelo.enobrecimentosPermitidos = ["enob_hot_stamping", "enob_relevo", "enob_gofragem", "enob_laminacao", "enob_verniz_uv"]
    modelo.modulosPacote = [500, 1000]
    modelo.terceirizada = true
  }
  console.log("  ✓ Tag: configurações atualizadas")
}

// 5.10 SACOLA - ELEGANCE
const elegance = getModelo("tipo_sacola", "modelo_elegance")
if (elegance) {
  // Formatos pequenos (módulo 50)
  elegance.formatosPequenos = [
    "fmt_130x400x100", "fmt_160x160x65", "fmt_180x178x70", 
    "fmt_260x200x120", "fmt_260x260x120", "fmt_260x350x120", 
    "fmt_350x250x140", "fmt_350x300x140", "fmt_350x350x140", "fmt_350x420x140"
  ]
  // Formatos grandes (módulo 25)
  elegance.formatosGrandes = [
    "fmt_410x360x140", "fmt_500x360x127", "fmt_500x390x150", 
    "fmt_500x480x140", "fmt_540x392x120", "fmt_550x450x150"
  ]
  elegance.formatosPermitidos = [...elegance.formatosPequenos, ...elegance.formatosGrandes]
  elegance.moduloPadraoPacotePequeno = 50
  elegance.moduloPadraoPacoteGrande = 25
  
  elegance.tiposAlcaPermitidos = ["alca_dalva", "alca_sintetica_sf"]
  elegance.aplicacoesAlcaPermitidas = ["com_ponteira", "colada"]
  elegance.largurasAlcaPermitidas = [1.0, 1.5, 2.0, 2.5, 3.0]
  elegance.coresAlcaPermitidas = ["branca", "preta", "colorida_catalogo", "outro"]
  
  elegance.acabamentosPermitidos = ["reforco_fundo", "furo_fita", "boca_palhaco"]
  elegance.modelosReforcoFundo = ["solto_pacote", "solto_sacola_pe", "solto_fundo", "colado_fundo"]
  elegance.modelosFuroFita = ["opcao_01", "opcao_02", "opcao_03", "opcao_04", "opcao_05", "opcao_06", "padrao_evolution_8x8"]
  
  elegance.hotStampingCores = ["ouro", "prata", "preto", "outro"]
  elegance.relevotipos = ["alto", "baixo"]
  elegance.gofragemModelos = ["padrao", "personalizada"]
  elegance.laminacaoTipos = ["brilho", "fosco"]
  elegance.exigeLaminacaoTriplex = true
  
  console.log("  ✓ Elegance: configurações atualizadas")
}

// 5.11 SACOLA - EVOLUTION
const evolution = getModelo("tipo_sacola", "modelo_evolution")
if (evolution) {
  evolution.formatosPermitidos = [
    "fmt_260x200x120", "fmt_260x260x120", "fmt_260x350x120", 
    "fmt_350x250x140", "fmt_350x300x140", "fmt_350x350x140", "fmt_350x420x140"
  ]
  evolution.moduloPadraoPacote = 50
  
  evolution.tiposAlcaPermitidos = ["alca_dalva", "alca_sintetica_sf", "alca_papel_torcido"]
  evolution.aplicacoesAlcaPermitidas = ["com_ponteira", "torcida", "colada"]
  evolution.largurasAlcaPermitidas = [1.0, 1.5, 2.0, 2.5, 3.0]
  evolution.coresAlcaPermitidas = ["branca", "preta", "parda", "colorida_catalogo", "outro"]
  
  evolution.acabamentosPermitidos = ["reforco_fundo", "furo_fita"]
  evolution.modelosReforcoFundo = ["solto_pacote", "solto_sacola_pe", "encaixado_fundo"]
  evolution.modelosFuroFita = ["opcao_01", "opcao_02", "opcao_03", "opcao_04", "opcao_05", "opcao_06", "padrao_evolution_8x8"]
  
  evolution.hotStampingCores = ["ouro", "prata", "preto", "outro"]
  evolution.relevotipos = ["alto", "baixo"]
  evolution.gofragemModelos = ["padrao", "exclusiva"]
  
  evolution.tiragemMinimaAlcaColorida = 10000
  
  console.log("  ✓ Evolution: configurações atualizadas")
}

// 5.12 SACOLA - AUTOMÁTICA
const automatica = getModelo("tipo_sacola", "modelo_automatica")
if (automatica) {
  automatica.formatosPequenos = [
    "fmt_150x220x70", "fmt_180x260x100", "fmt_220x260x100", 
    "fmt_230x320x100", "fmt_260x260x120", "fmt_260x350x120", 
    "fmt_310x360x170", "fmt_320x340x130", "fmt_320x400x130", "fmt_330x370x190"
  ]
  automatica.formatosGrandes = [
    "fmt_400x315x110", "fmt_400x350x150", "fmt_400x460x150", "fmt_460x485x160"
  ]
  automatica.formatosPermitidos = [...automatica.formatosPequenos, ...automatica.formatosGrandes]
  automatica.moduloPadraoPequeno = 100
  automatica.moduloPadraoGrande = 50
  
  automatica.permiteEnobrecimentos = false
  automatica.enobrecimentosPermitidos = []
  
  automatica.tiposAlcaPermitidos = ["alca_papel_torcido"]
  automatica.aplicacoesAlcaPermitidas = ["colada"]
  automatica.coresAlcaPermitidas = ["preta", "branca", "parda", "colorida_catalogo", "outro"]
  
  automatica.acabamentosPermitidos = ["reforco_fundo"]
  automatica.modelosReforcoFundo = ["solto_pacote"]
  
  automatica.tiragemMinimaAlcaColorida = 10000
  
  console.log("  ✓ Automática: configurações atualizadas")
}

// 5.13 ENVELOPE
const envelope = getModelo("tipo_envelope", "modelo_envelope")
if (envelope) {
  envelope.formatosPequenos = [
    "fmt_170x200x70_aba45", "fmt_220x245x120_aba60", 
    "fmt_350x250x120_aba60", "fmt_350x400x140_aba90", "fmt_380x430x150_aba90"
  ]
  envelope.formatosGrandes = [
    "fmt_450x310x90_aba80", "fmt_500x400x200_aba100"
  ]
  envelope.formatosPermitidos = [...envelope.formatosPequenos, ...envelope.formatosGrandes]
  
  envelope.tiposAlcaPermitidos = ["alca_dalva", "alca_sintetica_sf"]
  envelope.aplicacoesAlcaPermitidas = ["com_ponteira"]
  envelope.largurasAlcaPermitidas = [1.0, 1.5, 2.0, 2.5, 3.0]
  envelope.coresAlcaPermitidas = ["branca", "preta", "colorida_catalogo", "outro"]
  
  envelope.acabamentosPermitidos = ["reforco_fundo", "furo_fita", "boca_palhaco", "dupla_face", "velcro"]
  envelope.modelosReforcoFundo = ["solto_pacote", "solto_sacola_pe", "solto_fundo"]
  envelope.modelosFuroFita = ["opcao_01", "opcao_02", "opcao_03", "opcao_04", "opcao_05", "opcao_06", "padrao_evolution_8x8"]
  envelope.tamanhosVelcro = [16, 21]
  
  envelope.hotStampingCores = ["ouro", "prata", "preto", "outro"]
  envelope.relevotipos = ["alto", "baixo"]
  envelope.gofragemModelos = ["padrao", "personalizada"]
  envelope.laminacaoTipos = ["brilho", "fosco"]
  envelope.exigeLaminacaoTriplex = true
  
  console.log("  ✓ Envelope: configurações atualizadas")
}

// ========================================
// 6. ATUALIZAR MÓDULOS
// ========================================
console.log("\n6. Verificando MÓDULOS...")

const modulosNecessarios = [
  { id: "mod_25", codigo: "25", nome: "25 unidades", quantidade: 25 },
  { id: "mod_50", codigo: "50", nome: "50 unidades", quantidade: 50 },
  { id: "mod_100", codigo: "100", nome: "100 unidades", quantidade: 100 },
  { id: "mod_500", codigo: "500", nome: "500 unidades", quantidade: 500 },
  { id: "mod_1000", codigo: "1000", nome: "1000 unidades", quantidade: 1000 },
  { id: "mod_2000", codigo: "2000", nome: "2000 unidades", quantidade: 2000 },
  { id: "mod_informar", codigo: "INFORMAR", nome: "Informar", quantidade: null },
  { id: "mod_1_rolo", codigo: "1_ROLOPORPACOTE", nome: "1 rolo por pacote", quantidade: null },
  { id: "mod_definir_aproveitamento", codigo: "DEFINIR_APROVEITAMENTO", nome: "Definir melhor aproveitamento", quantidade: null },
]

const modulosExistentes = new Set(catalogo.modulos.map((m: any) => m.id))
for (const modulo of modulosNecessarios) {
  if (!modulosExistentes.has(modulo.id)) {
    catalogo.modulos.push(modulo)
    console.log(`  + Adicionado módulo: ${modulo.nome}`)
  }
}

// ========================================
// 7. ATUALIZAR ACONDICIONAMENTOS
// ========================================
console.log("\n7. Verificando ACONDICIONAMENTOS...")

const acondicionamentosNecessarios = [
  { id: "acond_pacote", codigo: "PACOTE", nome: "Pacote" },
  { id: "acond_shrink", codigo: "SHRINK", nome: "Pacote Shrink" },
  { id: "acond_caixa", codigo: "CAIXA", nome: "Caixa de Papelão" },
  { id: "acond_rolo", codigo: "ROLO", nome: "Rolo" },
  { id: "acond_cartela", codigo: "CARTELA", nome: "Cartela" },
]

const acondExistentes = new Set(catalogo.acondicionamentos.map((a: any) => a.id))
for (const acond of acondicionamentosNecessarios) {
  if (!acondExistentes.has(acond.id)) {
    catalogo.acondicionamentos.push(acond)
    console.log(`  + Adicionado acondicionamento: ${acond.nome}`)
  }
}

// ========================================
// 8. ATUALIZAR ENOBRECIMENTOS
// ========================================
console.log("\n8. Verificando ENOBRECIMENTOS...")

const enobNecessarios = [
  { id: "enob_hot_stamping", codigo: "HOT_STAMPING", nome: "Hot Stamping", coresPadrao: ["ouro", "prata", "preto"] },
  { id: "enob_relevo", codigo: "RELEVO", nome: "Relevo", tipos: ["alto", "baixo"] },
  { id: "enob_gofragem", codigo: "GOFRAGEM", nome: "Gofragem", modelos: ["padrao", "personalizada", "exclusiva"] },
  { id: "enob_laminacao", codigo: "LAMINACAO", nome: "Laminação", tipos: ["brilho", "fosco", "outro"] },
  { id: "enob_verniz_uv", codigo: "VERNIZ_UV", nome: "Verniz UV", tipos: ["total", "parcial"] },
]

const enobExistentes = new Set(catalogo.enobrecimentoTipos.map((e: any) => e.id))
for (const enob of enobNecessarios) {
  if (!enobExistentes.has(enob.id)) {
    catalogo.enobrecimentoTipos.push({
      id: enob.id,
      codigo: enob.codigo,
      nome: enob.nome,
      descricao: `${enob.nome}`,
      ...(enob.coresPadrao && { coresPadrao: enob.coresPadrao, permiteOutro: true }),
      ...(enob.tipos && { tipos: enob.tipos }),
      ...(enob.modelos && { modelos: enob.modelos }),
    })
    console.log(`  + Adicionado enobrecimento: ${enob.nome}`)
  }
}

// ========================================
// SALVAR CATÁLOGO ATUALIZADO
// ========================================
console.log("\n=== Salvando catálogo atualizado ===")

fs.writeFileSync(catalogoPath, JSON.stringify(catalogo, null, 2), "utf-8")

console.log("\n✅ Catálogo atualizado com sucesso!")
console.log("Arquivo: data/catalogo-completo.json")



