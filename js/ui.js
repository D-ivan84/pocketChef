// Passa dal tema chiaro a quello scuro (e viceversa) e ricorda la scelta.
function cambiaTema() {
  var attuale = document.documentElement.getAttribute("data-bs-theme");
  var nuovo = "dark";
  if (attuale === "dark") {
    nuovo = "light";
  }
  document.documentElement.setAttribute("data-bs-theme", nuovo);
  salva("tema", nuovo);
}

// Crea un elemento, gli dà le classi e il testo (entrambi facoltativi).
function creaElemento(tag, classi, testo) {
  var el = document.createElement(tag);
  if (classi) {
    el.className = classi;
  }
  if (testo) {
    el.textContent = testo;
  }
  return el;
}

// Crea la card di una ricetta r e la restituisce (non la mette nella pagina).
function creaCardRicetta(r) {
  var colonna = creaElemento("div", "col-6 col-md-3");

  var link = creaElemento("a", "text-decoration-none");
  link.href = "ricetta.html?id=" + r.id;

  var etichetta = creaElemento("div", "etichetta");

  var img = creaElemento("img");
  img.src = r.immagine;
  img.alt = r.nome;

  var corpo = creaElemento("div", "corpo");
  corpo.appendChild(creaElemento("p", "titolo", r.nome));
  corpo.appendChild(creaElemento("p", "text-muted small mb-0", r.categoria));

  etichetta.appendChild(img);
  etichetta.appendChild(corpo);
  link.appendChild(etichetta);
  colonna.appendChild(link);

  return colonna;
}

// Trasforma gli ingredienti di una ricetta in un testo, un ingrediente per riga.
function ingredientiComeTesto(r) {
  var righe = [];
  for (var i = 0; i < r.ingredienti.length; i++) {
    righe.push((r.ingredienti[i].misura + " " + r.ingredienti[i].nome).trim());
  }
  return righe.join("\n");
}

// ---------- Navbar ----------
// Toglie l'utente collegato e torna alla home.
function esci() {
  rimuovi("utenteCollegato");
  window.location.href = "index.html";
}

// Adatta la navbar (scritta in HTML) alla pagina e all'utente.
// paginaAttiva: "home", "cerca", "ricettario" o "profilo".
function aggiornaNavbar(paginaAttiva) {
  var utente = leggi("utenteCollegato", null);

  // Evidenzio la voce della pagina corrente
  var link = document.getElementById("link-" + paginaAttiva);
  if (link !== null) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }

  // Se c'è un utente collegato, mostro le voci riservate e il bottone Esci
  if (utente !== null) {
    document.getElementById("voce-ricettario").classList.remove("d-none");
    document.getElementById("voce-profilo").classList.remove("d-none");
    document.getElementById("bottone-accedi").classList.add("d-none");
    document.getElementById("bottone-esci").classList.remove("d-none");
  }

  // Collego i bottoni (senza parentesi: passo la funzione, non la eseguo)
  document.getElementById("bottone-tema").addEventListener("click", cambiaTema);
  document.getElementById("bottone-esci").addEventListener("click", esci);
}

// ---------- Caricamento dei dati ----------

// Allarga la barra. avviaDati la richiama dopo ogni richiesta
// passandole quante ne ha fatte e quante sono in tutto.
function aggiornaAvanzamento(fatte, totali) {
  var percentuale = Math.round((fatte / totali) * 100);
  var barra = document.getElementById("barra");
  barra.style.width = percentuale + "%";
  barra.parentElement.setAttribute("aria-valuenow", percentuale);
}

// Prepara la navbar e i dati. Restituisce true se la pagina può mostrare le ricette.
async function preparaPagina(paginaAttiva) {
  aggiornaNavbar(paginaAttiva);

  var info = leggi("cacheInfo", null);
  var ricette = leggi("ricette", null);

  // Cache completa e integra: niente caricamento
  if (info !== null && ricette !== null && Object.keys(ricette).length > 0) {
    return true;
  }

  var caricamento = document.getElementById("caricamento");
  caricamento.classList.remove("d-none");

  var riuscito = await avviaDati(aggiornaAvanzamento);

  if (riuscito) {
    caricamento.classList.add("d-none");
    return true;
  }

  // Errore nel download
  document.getElementById("testo-caricamento").textContent =
    "Could not download all recipes. Please check your connection and retry.";
  var bottone = document.getElementById("bottone-riprova");
  bottone.classList.remove("d-none");
  bottone.addEventListener("click", function () {
    window.location.reload();
  });
  return false;
}