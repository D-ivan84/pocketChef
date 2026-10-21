async function mostraCerca() {
var bottone = document.getElementById("cerca-bottone");
var pronta = await preparaPagina("cerca");
if (!pronta) {
return;
}

var form = document.getElementById("form-cerca");
var campoTesto = document.getElementById("cerca-testo");
var campoTipo = document.getElementById("cerca-tipo");
var campoCategoria = document.getElementById("cerca-categoria");
var messaggio = document.getElementById("cerca-messaggio");
var risultati = document.getElementById("risultati");
// 1) Menu categorie: una <option> per ogni categoria della cache
var categorie = leggi("categorie", []);
for (var i = 0; i < categorie.length; i++) {
var opzione = document.createElement("option");
opzione.value = categorie[i].nome;
opzione.textContent = categorie[i].nome;
campoCategoria.appendChild(opzione);
}

// 2) Ricerca al submit
form.addEventListener("submit", function (evento) {
evento.preventDefault();

var testo = campoTesto.value.trim().toLowerCase();
var tipo = campoTipo.value;
var categoria = campoCategoria.value;
risultati.textContent = "";
messaggio.classList.add("d-none");
if (testo === "" && categoria === "") {
messaggio.textContent = "Please enter a search term or choose a category.";
messaggio.classList.remove("d-none");
return;
}

// "pollo riso" -> ["pollo", "", "riso"] -> tolgo le parole vuote
var parole = testo.split(" ").filter(function (p) {
return p !== "";
});
var tutte = Object.values(leggi("ricette", {}));
var trovate = [];
for (var k = 0; k < tutte.length; k++) {
var r = tutte[k];
var ok = true;
if (categoria !== "" && r.categoria !== categoria) {
ok = false;
}

if (ok && testo !== "") {
if (tipo === "lettera") {
ok = r.nome.toLowerCase().charAt(0) === testo.charAt(0);
} else {
// la stringa in cui cercare dipende dal tipo
var dove = r.nome;
if (tipo === "ingrediente") {
dove = "";
for (var j = 0; j < r.ingredienti.length; j++) {
dove = dove + r.ingredienti[j].nome + " ";
}
} else if (tipo === "testo") {
dove = r.nome + " " + r.tags.join(" ") + " " + r.istruzioni;
}
dove = dove.toLowerCase();

// ogni parola deve esserci (AND)
for (var p = 0; p < parole.length; p++) {
if (!dove.includes(parole[p])) {
ok = false;
}
}
}
}


if (ok) {
trovate.push(r);
}
}

if (trovate.length === 0) {
messaggio.textContent = "No recipes found.";
} else {
messaggio.textContent = "Recipes found: " + trovate.length;
for (var m = 0; m < trovate.length; m++) {
risultati.appendChild(creaCardRicetta(trovate[m]));
}
}
messaggio.classList.remove("d-none");
});
// dati pronti e ascoltatore collegato: ora si può cercare
bottone.disabled = false;
}
mostraCerca();