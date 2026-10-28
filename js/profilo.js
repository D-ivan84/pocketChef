function mostraProfilo() {
var utenteCollegato = leggi("utenteCollegato", null);
if (utenteCollegato === null) {
window.location.replace("accesso.html");
return;
}

aggiornaNavbar("profilo");

var utenti = leggi("utenti", []);
var utente = null;
for (var i = 0; i < utenti.length; i++) {
if (utenti[i].username === utenteCollegato) {
utente = utenti[i];
}
}

if (utente === null) {
rimuovi("utenteCollegato");
window.location.replace("accesso.html");
return;
}

document.getElementById("profilo-username").textContent = utente.username;
document.getElementById("profilo-email").value = utente.email;
document.getElementById("profilo-password").value = utente.password;
document.getElementById("profilo-piatto").value = utente.piattoPreferito;
var form = document.getElementById("form-modifica-profilo");

form.addEventListener("submit", function (evento) {
evento.preventDefault();

var email = document.getElementById("profilo-email").value.trim();
var password = document.getElementById("profilo-password").value;
var piatto = document.getElementById("profilo-piatto").value.trim();
var errore = document.getElementById("errore-profilo");
var successo = document.getElementById("successo-profilo");
errore.classList.add("d-none");
successo.classList.add("d-none");

if (email === "" || password === "" || piatto === "") {
errore.textContent = "Please fill in all fields.";
errore.classList.remove("d-none");
return;
}

if (!email.includes("@") || !email.includes(".")) {
errore.textContent = "Please enter a valid email address.";
errore.classList.remove("d-none");
return;
}
if (password.length < 4) {
errore.textContent = "Password must be at least 4 characters long.";
errore.classList.remove("d-none");
return;
}

utente.email = email;
utente.password = password;
utente.piattoPreferito = piatto;
salva("utenti", utenti);

successo.textContent = "Changes saved.";
successo.classList.remove("d-none");
});

var bottoneElimina = document.getElementById("bottone-elimina");

//eliminazione utente
bottoneElimina.addEventListener("click", function () {
var sicuro = confirm("Are you sure you want to delete your profile? Cookbook, notes and reviews will be lost.");
if (!sicuro) {
return;
}
var rimasti = [];
for (var i = 0; i < utenti.length; i++) {
if (utenti[i].username !== utenteCollegato) {
rimasti.push(utenti[i]);
}
}
salva("utenti", rimasti);

var ricettari = leggi("ricettari", {});
delete ricettari[utenteCollegato];
salva("ricettari", ricettari);
var note = leggi("note", {});
delete note[utenteCollegato];
salva("note", note);

var recensioni = leggi("recensioni", []);
var recensioniRimaste = [];
for (var j = 0; j < recensioni.length; j++) {
if (recensioni[j].username !== utenteCollegato) {
recensioniRimaste.push(recensioni[j]);
}
}
salva("recensioni", recensioniRimaste);
rimuovi("utenteCollegato");
window.location.href = "index.html";
});
}
mostraProfilo();