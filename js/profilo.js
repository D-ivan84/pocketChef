function mostraProfilo() {
// Pagina riservata: se non c'è un utente collegato, vado al login
var utenteCollegato = leggi("utenteCollegato", null);
if (utenteCollegato === null) {
window.location.replace("accesso.html");
return;
}

aggiornaNavbar("profilo");

// Cerco l'utente collegato tra quelli registrati
var utenti = leggi("utenti", []);
var utente = null;
for (var i = 0; i < utenti.length; i++) {
if (utenti[i].username === utenteCollegato) {
utente = utenti[i];
}
}

// Utente collegato ma non presente in "utenti" (dati incoerenti): lo scollego
if (utente === null) {
rimuovi("utenteCollegato");
window.location.replace("accesso.html");
return;
}

// Precompilo la pagina
document.getElementById("profilo-username").textContent = utente.username;
document.getElementById("profilo-email").value = utente.email;
document.getElementById("profilo-password").value = utente.password;
document.getElementById("profilo-piatto").value = utente.piattoPreferito;

// ---------- Salvataggio modifiche ----------
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

// 1) Campi vuoti
if (email === "" || password === "" || piatto === "") {
errore.textContent = "Please fill in all fields.";
errore.classList.remove("d-none");
return;
}

// 2) Email: controllo minimo
if (!email.includes("@") || !email.includes(".")) {
errore.textContent = "Please enter a valid email address.";
errore.classList.remove("d-none");
return;
}

// 3) Password: almeno 4 caratteri
if (password.length < 4) {
errore.textContent = "Password must be at least 4 characters long.";
errore.classList.remove("d-none");
return;
}

// 4) Tutto ok: modifico l'utente e salvo l'intera lista
utente.email = email;
utente.password = password;
utente.piattoPreferito = piatto;
salva("utenti", utenti);

successo.textContent = "Changes saved.";
successo.classList.remove("d-none");
});

// ---------- Eliminazione profilo ----------
var bottoneElimina = document.getElementById("bottone-elimina");

bottoneElimina.addEventListener("click", function () {
// confirm() apre una finestra con OK / Annulla: restituisce true o false
var sicuro = confirm("Are you sure you want to delete your profile? Cookbook, notes and reviews will be lost.");
if (!sicuro) {
return;
}

// 1) Tolgo l'utente dalla lista (copio in "rimasti" tutti gli altri)
var rimasti = [];
for (var i = 0; i < utenti.length; i++) {
if (utenti[i].username !== utenteCollegato) {
rimasti.push(utenti[i]);
}
}
salva("utenti", rimasti);

// 2) Tolgo ricettario e note (oggetti con chiave = username)
var ricettari = leggi("ricettari", {});
delete ricettari[utenteCollegato];
salva("ricettari", ricettari);

var note = leggi("note", {});
delete note[utenteCollegato];
salva("note", note);

// 3) Tolgo le recensioni scritte da lui (array: stesso schema del punto 1)
var recensioni = leggi("recensioni", []);
var recensioniRimaste = [];
for (var j = 0; j < recensioni.length; j++) {
if (recensioni[j].username !== utenteCollegato) {
recensioniRimaste.push(recensioni[j]);
}
}
salva("recensioni", recensioniRimaste);

// 4) Scollego e torno in home
rimuovi("utenteCollegato");
window.location.href = "index.html";
});
}

mostraProfilo();