async function mostraRicettario() {
// se non c'è un utente collegato, vado al login
var utente = leggi("utenteCollegato", null);
if (utente === null) {
window.location.replace("accesso.html");
return;
}

var pronta = await preparaPagina("ricettario");
if (!pronta) {
return;
}

var sottotitolo = document.getElementById("sottotitolo-ricettario");
var griglia = document.getElementById("griglia-ricettario");
var vuoto = document.getElementById("ricettario-vuoto");
var form = document.getElementById("form-modifica-ricetta");
var campoNome = document.getElementById("mod-nome");
var campoIngredienti = document.getElementById("mod-ingredienti");
var campoIstruzioni = document.getElementById("mod-istruzioni");
var campoNota = document.getElementById("mod-nota");
var errore = document.getElementById("errore-modifica");
var idInModifica = null;

function disegna() {
griglia.textContent = "";
var cache = leggi("ricette", {});
var lista = leggi("ricettari", {})[utente] || [];

if (lista.length === 0) {
  vuoto.classList.remove("d-none");
 sottotitolo.classList.add("d-none");
} else {
  vuoto.classList.add("d-none");
  sottotitolo.classList.remove("d-none");
}


lista.forEach(function (voce) {
var originale = cache[voce.id];
var colonna = creaCardRicetta({
id: voce.id,
nome: voce.nomePersonale,
categoria: originale.categoria,
immagine: originale.immagine
});

var blocco = creaElemento("div", "d-flex gap-2 mt-2");
var bModifica = creaElemento("button", "btn btn-secondary btn-sm", "Edit");
bModifica.type = "button";
var bRimuovi = creaElemento("button", "btn btn-primary btn-sm", "Remove");
bRimuovi.type = "button";

bModifica.addEventListener("click", function () {
idInModifica = voce.id;
campoNome.value = voce.nomePersonale;
// copie salvate prima della modifica degli ingredienti: parto dagli originali
if (voce.ingredientiPersonali === undefined) {
campoIngredienti.value = ingredientiComeTesto(originale);
} else {
campoIngredienti.value = voce.ingredientiPersonali;
}
campoIstruzioni.value = voce.istruzioniPersonali;
campoNota.value = (leggi("note", {})[utente] || {})[voce.id] || "";
errore.classList.add("d-none");
form.classList.remove("d-none");
window.scrollTo(0, 0);
});

bRimuovi.addEventListener("click", function () {
if (!confirm("Remove recipe from cookbook? Your custom changes will be lost.")) {
return;
}
var ricettari = leggi("ricettari", {});
ricettari[utente] = (ricettari[utente] || []).filter(function (x) {
return String(x.id) !== String(voce.id);
});
salva("ricettari", ricettari);
var note = leggi("note", {});
if (note[utente]) {
delete note[utente][voce.id];
salva("note", note);
}
if (String(idInModifica) === String(voce.id)) {
idInModifica = null;
form.classList.add("d-none");
}
disegna();
});

blocco.appendChild(bModifica);
blocco.appendChild(bRimuovi);
colonna.appendChild(blocco);
var testoNota = (leggi("note", {})[utente] || {})[voce.id];
if (testoNota) {
colonna.appendChild(creaElemento("p", "procedimento text-break small text-muted mt-2 mb-0", "NOTE: " + testoNota));
}
griglia.appendChild(colonna);
});
}

form.addEventListener("submit", function (evento) {
evento.preventDefault();
var nome = campoNome.value.trim();
var ingredienti = campoIngredienti.value.trim();
var istruzioni = campoIstruzioni.value.trim();
errore.classList.add("d-none");
if (nome === "") {
errore.textContent = "Name cannot be empty.";
errore.classList.remove("d-none");
return;
}
var ricettari = leggi("ricettari", {});
var lista = ricettari[utente] || [];
for (var i = 0; i < lista.length; i++) {
if (String(lista[i].id) === String(idInModifica)) {
lista[i].nomePersonale = nome;
lista[i].ingredientiPersonali = ingredienti;
lista[i].istruzioniPersonali = istruzioni;
}
}
salva("ricettari", ricettari);
var testoNota = campoNota.value.trim();
var note = leggi("note", {});
if (note[utente] === undefined) {
note[utente] = {};
}
if (testoNota === "") {
delete note[utente][idInModifica];
} else {
note[utente][idInModifica] = testoNota;
}
salva("note", note);
idInModifica = null;
form.classList.add("d-none");
disegna();
});

document.getElementById("mod-annulla").addEventListener("click", function () {
idInModifica = null;
form.classList.add("d-none");
});

disegna();
}

mostraRicettario();