var NUMERO_RICETTE = 12;

async function mostraHome() {
var pronta = await preparaPagina("home");
if (!pronta) {
return;
}

var utente = leggi("utenteCollegato", null);
if (utente !== null) {
var sottotitolo = document.getElementById("sottotitolo");
if (sottotitolo) {
sottotitolo.textContent = "Welcome back, " + utente + "! Here is a selection of recipes from around the world.";
}
}

var tutte = Object.values(leggi("ricette", {}));

// Ricetta del giorno: una al giorno, salvata con la data
var oggi = new Date().toISOString().slice(0, 10);
var giorno = leggi("ricettaDelGiorno", null);
var scelta = null;

if (giorno !== null && giorno.data === oggi) {
for (var k = 0; k < tutte.length; k++) {
if (String(tutte[k].id) === String(giorno.id)) {
scelta = tutte[k];
}
}
}

if (scelta === null && tutte.length > 0) {
scelta = tutte[Math.floor(Math.random() * tutte.length)];
salva("ricettaDelGiorno", { data: oggi, id: scelta.id });
}

if (scelta !== null) {
document.getElementById("contenitore-giorno").appendChild(creaCardRicetta(scelta));
document.getElementById("ricetta-del-giorno").classList.remove("d-none");
}

var griglia = document.getElementById("griglia-ricette");
for (var i = 0; i < NUMERO_RICETTE && i < tutte.length; i++) {
griglia.appendChild(creaCardRicetta(tutte[i]));
}
document.getElementById("sezione-altre").classList.remove("d-none");
}

mostraHome();