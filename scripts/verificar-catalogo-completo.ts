import catalogoData from "../data/catalogo-completo.json"

console.log("=== Verificação do Catálogo ===\n")

for (const tipo of catalogoData.produtoTipos) {
  console.log(`\n📦 TIPO: ${tipo.nome} (${tipo.codigo})`)
  
  for (const modelo of tipo.modelos) {
    console.log(`\n  📋 MODELO: ${modelo.nome}`)
    
    // Verificar larguras
    const larguras = (modelo as any).largurasPadrao
    if (larguras && larguras.length > 0) {
      console.log(`    ✅ Larguras: ${larguras.join(", ")}`)
    } else {
      console.log(`    ❌ Larguras: NÃO DEFINIDAS`)
    }
    
    // Verificar alturas
    const alturas = (modelo as any).alturasPadrao
    if (alturas && alturas.length > 0) {
      console.log(`    ✅ Alturas: ${alturas.join(", ")}`)
    } else {
      console.log(`    ❌ Alturas: NÃO DEFINIDAS`)
    }
    
    // Verificar sanfonas
    const sanfonas = (modelo as any).sanfonasPadrao
    if (sanfonas && sanfonas.length > 0) {
      console.log(`    ✅ Sanfonas: ${sanfonas.join(", ")}`)
    } else {
      console.log(`    ❌ Sanfonas: NÃO DEFINIDAS`)
    }
    
    // Verificar formatos
    const formatos = (modelo as any).formatosPermitidos
    if (formatos && formatos.length > 0) {
      const nomes = formatos.map((fId: string) => {
        const formato = catalogoData.formatosPadrao.find(f => f.id === fId)
        return formato?.nome || fId
      })
      console.log(`    ✅ Formatos: ${nomes.join(", ")}`)
    } else {
      console.log(`    ❌ Formatos: NÃO DEFINIDOS`)
    }
    
    // Verificar substratos
    const substratos = (modelo as any).substratosPermitidos
    if (substratos && substratos.length > 0) {
      const nomes = substratos.map((sId: string) => {
        const sub = catalogoData.substratos.find(s => s.id === sId)
        return sub?.nome || sId
      })
      console.log(`    ✅ Substratos: ${nomes.join(", ")}`)
    }
    
    // Verificar alça
    console.log(`    Permite Alça: ${(modelo as any).permiteAlca ? "SIM" : "NÃO"}`)
    console.log(`    Permite Acabamentos: ${(modelo as any).permiteAcabamentos ? "SIM" : "NÃO"}`)
    console.log(`    Permite Enobrecimentos: ${(modelo as any).permiteEnobrecimentos ? "SIM" : "NÃO"}`)
  }
}



