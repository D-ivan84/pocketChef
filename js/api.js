const URL_BASE = "https://www.themealdb.com/api/json/v1/1/";

function normalizzaRicetta(m) { // elimino gli ingredienti vuoti
  const ingredienti = [];
  for (let i = 1; i <= 20; i++) {
    const nome = m["strIngredient" + i];
    const misura = m["strMeasure" + i];

    if (nome && nome.trim() !== "") { 
      let misuraPulita = "";
      if (misura) {
        misuraPulita = misura.trim();
      }
      ingredienti.push({ nome: nome.trim(), misura: misuraPulita });
    }
  }
  let tags = [];
  if (m.strTags) {
    tags = m.strTags.split(",");
  }
  return {
    id: m.idMeal,
    nome: m.strMeal,
    categoria: m.strCategory,
    area: m.strArea,
    istruzioni: m.strInstructions,
    immagine: m.strMealThumb,
    tags: tags,
    youtube: m.strYoutube,
    ingredienti: ingredienti
  };
}

async function scaricaLettera(lettera) {
  const risposta = await fetch(URL_BASE + "search.php?f=" + lettera);
  if (!risposta.ok) {
    throw new Error("HTTP Error " + risposta.status);
  }
  const dati = await risposta.json();
  if (dati.meals === null) {
    return [];
  }
  return dati.meals.map(normalizzaRicetta);
}

async function scaricaCategorie() {
  const risposta = await fetch(URL_BASE + "categories.php");
  if (!risposta.ok) {
    throw new Error("HTTP Error " + risposta.status);
  }
  const dati = await risposta.json();

  const categorie = []; // creo un nuovo array categorie 
  for (let i = 0; i < dati.categories.length; i++) {
    const c = dati.categories[i];
    categorie.push({
      id: c.idCategory,
      nome: c.strCategory,
      immagine: c.strCategoryThumb,
      descrizione: c.strCategoryDescription
    });
  }
  return categorie;
}

const LETTERE = "abcdefghijklmnopqrstuvwxyz";

// Restituisce true se i dati sono completi, false se manca qualcosa
async function avviaDati(aggiornaAvanzamento) {
  const info = leggi("infoArchivio", null);
  const ricetteInMemoria = leggi("ricette", null);
  // Se entrambi esistono e ricette non è vuoto, i dati sono già pronti
  if (info !== null && ricetteInMemoria !== null && Object.keys(ricetteInMemoria).length > 0) {
    return true;
  }
  const ricette = {};
  let errori = 0;
  const totali = LETTERE.length + 1; // 26 lettere + 1 richiesta delle categorie
  let fatte = 0;
  for (let i = 0; i < LETTERE.length; i++) {
    try {
      const lista = await scaricaLettera(LETTERE[i]);
      for (let j = 0; j < lista.length; j++) {
        ricette[lista[j].id] = lista[j];
      }
    } catch (e) {
      errori++;
      console.log("Failed letter:", LETTERE[i], e);
    }
    fatte++;
    if (typeof aggiornaAvanzamento === "function") {
      aggiornaAvanzamento(fatte, totali);
    }
  }
  try {
    const categorie = await scaricaCategorie();
    salva("categorie", categorie);
  } catch (e) {
    errori++;
    console.log("Failed category:", e);
  }
  fatte++;
  if (typeof aggiornaAvanzamento === "function") {
    aggiornaAvanzamento(fatte, totali);
  }
  salva("ricette", ricette);
  if (errori === 0) {
    salva("infoArchivio", {
      scaricatoData: new Date().toISOString(),
      numRicette: Object.keys(ricette).length
    });
    return true;
  }
  return false;
}
