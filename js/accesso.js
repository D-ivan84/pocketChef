aggiornaNavbar("accesso");
// Se sono già collegato, login e registrazione non servono: vado in home
if (leggi("utenteCollegato", null) !== null) {
window.location.replace("index.html");
}

var formLogin = document.getElementById("form-login");
formLogin.addEventListener("submit", function (evento) {
evento.preventDefault(); //non ricarico la pagina

var username = document.getElementById("login-username").value.trim();
var password = document.getElementById("login-password").value;
var errore = document.getElementById("errore-login");

errore.classList.add("d-none"); // nascondo un eventuale errore precedente

// 1) Controllo i campi vuoti
if (username == "" || password == "") {
errore.textContent = "Please enter username and password!";
errore.classList.remove("d-none");
return; }

// 2) Cerco l'utente tra quelli registrati
var utenti = leggi("utenti", []);
var trovato = null;
for (var i = 0; i < utenti.length; i++) {
if (utenti[i].username.toLowerCase() == username.toLowerCase() &&
utenti[i].password == password) {
trovato = utenti[i];
} }

if (trovato === null) {
errore.textContent = "Incorrect username or password!";
errore.classList.remove("d-none");
return;
}

// 3) Login riuscito: ricordo chi è collegato e vado in home
salva("utenteCollegato", trovato.username);
window.location.href = "index.html";
});
// ---------- Registrazione ----------
var formRegistrazione = document.getElementById("form-registrazione");

formRegistrazione.addEventListener("submit", function (evento) {
evento.preventDefault();

var username = document.getElementById("reg-username").value.trim();
var email = document.getElementById("reg-email").value.trim();
var password = document.getElementById("reg-password").value;
var piatto = document.getElementById("reg-piatto").value.trim();
var errore = document.getElementById("errore-registrazione");

errore.classList.add("d-none");

// 1) Campi vuoti
if (username === "" || email === "" || password === "" || piatto === "") {
errore.textContent = "Please fill in all fields.";
errore.classList.remove("d-none");
return;
}

// 2) Email: controllo minimo (contiene @ e un punto)
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

// 4) Username già usato?
var utenti = leggi("utenti", []);
for (var i = 0; i < utenti.length; i++) {
if (utenti[i].username.toLowerCase() === username.toLowerCase()) {
errore.textContent = "This username is already taken.";
errore.classList.remove("d-none");
return;
}
}

// 5) Tutto ok: salvo il nuovo utente
utenti.push({
username: username,
email: email,
password: password,
piattoPreferito: piatto
});
salva("utenti", utenti);

// Ricettario inizialmente vuoto
var ricettari = leggi("ricettari", {});
ricettari[username] = [];
salva("ricettari", ricettari);

// Lo collego subito e vado in home
salva("utenteCollegato", username);
window.location.href = "index.html";
});