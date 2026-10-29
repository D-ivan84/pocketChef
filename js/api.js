var URL_BASE = "https://www.themealdb.com/api/json/v1/1/";
function normalizzaRicetta(m) { //elimino gli ingredienti vuoti
  var ingredienti = [];
  for (var i = 1; i <= 20; i++) {
    var nome = m["strIngredient" + i];
    var misura = m["strMeasure" + i];

    if (nome && nome.trim() !== "") { 
      var misuraPulita = "";
      if (misura) {
        misuraPulita = misura.trim();   }
      ingredienti.push({ nome: nome.trim(), misura: misuraPulita });
    }
  }
  var tags = [];
  if (m.strTags) {
    tags = m.strTags.split(",");  }
  return {
    id: m.idMeal,
    nome: m.strMeal,
    categoria: m.strCategory,
    area: m.strArea,
    istruzioni: m.strInstructions,
    immagine: m.strMealThumb,
    tags: tags,
    youtube: m.strYoutube,
    ingredienti: ingredienti };
}

async function scaricaLettera(lettera) {
  var risposta = await fetch(URL_BASE + "search.php?f=" + lettera);
  if (!risposta.ok) {
    throw new Error("HTTP Error " + risposta.status);  }
  var dati = await risposta.json();
  if (dati.meals === null) {
    return [];
  }
  return dati.meals.map(normalizzaRicetta);
}

async function scaricaCategorie() {
  var risposta = await fetch(URL_BASE + "categories.php");
  if (!risposta.ok) {
    throw new Error("HTTP Error " + risposta.status);  }
  var dati = await risposta.json();

  var categorie = []; //creo un nuovo array categorie 
  for (var i = 0; i < dati.categories.length; i++) {
    var c = dati.categories[i];
    categorie.push({
      id: c.idCategory,
      nome: c.strCategory,
      immagine: c.strCategoryThumb,
      descrizione: c.strCategoryDescription
    });
  }
  return categorie;}

var LETTERE = "abcdefghijklmnopqrstuvwxyz";
// Restituisce true se i dati sono completi, false se manca qualcosa
async function avviaDati(aggiornaAvanzamento) {
  var info = leggi("infoArchivio", null);
  var ricetteInMemoria = leggi("ricette", null);
  // Se entrambi esistono e ricette non è vuoto, i dati sono già pronti
  if (info !== null && ricetteInMemoria !== null && Object.keys(ricetteInMemoria).length > 0) {
    return true;
  }
  var ricette = {};
  var errori = 0;
  var totali = LETTERE.length + 1;   // 26 lettere + 1 richiesta delle categorie
  var fatte = 0;
  for (var i = 0; i < LETTERE.length; i++) {
    try {
      var lista = await scaricaLettera(LETTERE[i]);
      for (var j = 0; j < lista.length; j++) {
        ricette[lista[j].id] = lista[j];
      }
    } catch (e) {
      errori++;
      console.log("Failed letter:", LETTERE[i], e);    }
    fatte++;
    if (typeof aggiornaAvanzamento === "function") {
      aggiornaAvanzamento(fatte, totali);
    }
  }
  try {
    var categorie = await scaricaCategorie();
    salva("categorie", categorie);
  } catch (e) {
    errori++;
    console.log("Failed category:", e);  }
  fatte++;
  if (typeof aggiornaAvanzamento === "function") {
    aggiornaAvanzamento(fatte, totali);  }
  salva("ricette", ricette);
  if (errori === 0) {
    salva("infoArchivio", {
      scaricatoData: new Date().toISOString(),
      numRicette: Object.keys(ricette).length
    });
    return true; }
  return false;
}
