var URL_BASE = "https://www.themealdb.com/api/json/v1/1/";
function normalizzaRicetta(m) {
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
// Scarica le ricette di una lettera e restituisce un array (vuoto se non ce ne sono).
async function scaricaLettera(lettera) {
  var risposta = await fetch(URL_BASE + "search.php?f=" + lettera);
  if (!risposta.ok) {
    throw new Error("Errore HTTP " + risposta.status);  }
  var dati = await risposta.json();
  // Nessun risultato: l'API risponde 200 con {"meals": null}
  if (dati.meals === null) {
    return [];
  }
  return dati.meals.map(normalizzaRicetta);
}
var LETTERE = "abcdefghijklmnopqrstuvwxyz";
// Restituisce true se i dati sono completi, false se qualcosa è mancato.
// aggiornaAvanzamento (facoltativa) è una funzione che riceve (fatte, totali).
async function avviaDati(aggiornaAvanzamento) {
  if (leggi("cacheInfo", null) !== null) {
    return true;  }

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
      console.log("Lettera fallita:", LETTERE[i], e);
    }
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
    console.log("Categorie fallite:", e);
  }
  fatte++;
  if (typeof aggiornaAvanzamento === "function") {
    aggiornaAvanzamento(fatte, totali);
  }
  salva("ricette", ricette);
  if (errori === 0) {
    salva("cacheInfo", {
      scaricatoData: new Date().toISOString(),
      numRicette: Object.keys(ricette).length
    });
    return true; }
  return false;
}
// Scarica l'elenco delle categorie (Beef, Dessert, ...) e lo restituisce
async function scaricaCategorie() {
  var risposta = await fetch(URL_BASE + "categories.php");
  if (!risposta.ok) {
    throw new Error("Errore HTTP " + risposta.status);  }
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