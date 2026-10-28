function cambiaTema() {
  var attuale = document.documentElement.getAttribute("data-bs-theme");
  var nuovo = "dark";
  if (attuale === "dark") {
    nuovo = "light";
  }
  document.documentElement.setAttribute("data-bs-theme", nuovo);
  salva("tema", nuovo);
}
// Creo un elemento con classi e testo 
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
// Creo la card di una ricetta r e la restituisco
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

function ingredientiComeTesto(r) {
  var righe = [];
  for (var i = 0; i < r.ingredienti.length; i++) {
    righe.push((r.ingredienti[i].misura + " " + r.ingredienti[i].nome).trim());
  }
  return righe.join("\n");
}
function esci() {
  rimuovi("utenteCollegato");
  window.location.href = "index.html";
}

function aggiornaNavbar(paginaAttiva) {
  var utente = leggi("utenteCollegato", null);

  // Evidenzio la voce della pagina corrente
  var link = document.getElementById("link-" + paginaAttiva);
  if (link !== null) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }

  if (utente !== null) {
    document.getElementById("voce-ricettario").classList.remove("d-none");
    document.getElementById("voce-profilo").classList.remove("d-none");
    document.getElementById("bottone-accedi").classList.add("d-none");
    document.getElementById("bottone-esci").classList.remove("d-none");
  }

  document.getElementById("bottone-tema").addEventListener("click", cambiaTema);
  document.getElementById("bottone-esci").addEventListener("click", esci);
}

function aggiornaAvanzamento(fatte, totali) {
  var percentuale = Math.round((fatte / totali) * 100);
  var barra = document.getElementById("barra");
  barra.style.width = percentuale + "%";
  barra.parentElement.setAttribute("aria-valuenow", percentuale);
}

async function preparaPagina(paginaAttiva) {
  aggiornaNavbar(paginaAttiva);

  var info = leggi("infoArchivio", null);
  var ricette = leggi("ricette", null);

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

  document.getElementById("testo-caricamento").textContent =
    "Could not download all recipes. Please check your connection and retry.";
  var bottone = document.getElementById("bottone-riprova");
  bottone.classList.remove("d-none");
  bottone.addEventListener("click", function () {
    window.location.reload();
  });
  return false;
}