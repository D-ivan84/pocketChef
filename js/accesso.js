aggiornaNavbar("accesso");

if (leggi("utenteCollegato", null) !== null) {
  window.location.replace("index.html");
}

const formLogin = document.getElementById("form-login");
formLogin.addEventListener("submit", function (evento) {
  evento.preventDefault(); // non ricarico la pagina

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;
  const errore = document.getElementById("errore-login");

  errore.classList.add("d-none"); 

  // Controllo i campi vuoti
  if (username == "" || password == "") {
    errore.textContent = "Please enter username and password!";
    errore.classList.remove("d-none");
    return;
  }

  // Cerco l'utente tra quelli registrati
  const utenti = leggi("utenti", []);
  let trovato = null;
  for (let i = 0; i < utenti.length; i++) {
    if (utenti[i].username.toLowerCase() == username.toLowerCase() &&
      utenti[i].password == password) {
      trovato = utenti[i]; 
      break;
    }
  }

  if (trovato === null) {
    errore.textContent = "Incorrect username or password!";
    errore.classList.remove("d-none");
    return;
  }

  salva("utenteCollegato", trovato.username);
  window.location.href = "index.html";
});

// ---------- Registrazione ----------
const formRegistrazione = document.getElementById("form-registrazione");

formRegistrazione.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const passwordConf = document.getElementById("reg-passwordConf").value;
  const piatto = document.getElementById("reg-piatto").value.trim();
  const errore = document.getElementById("errore-registrazione");

  errore.classList.add("d-none");

  if (username === "" || email === "" || password === "" || passwordConf === "" || piatto === "") {
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

  if (password !== passwordConf) {
    errore.textContent = "Passwords do not match.";
    errore.classList.remove("d-none");
    return;
  }

  // Controllo username già utilizzato
  const utenti = leggi("utenti", []);
  for (let i = 0; i < utenti.length; i++) {
    if (utenti[i].username.toLowerCase() === username.toLowerCase()) {
      errore.textContent = "This username is already taken.";
      errore.classList.remove("d-none");
      return;
    }
  }

  // Salvataggio nuovo utente
  utenti.push({
    username: username,
    email: email,
    password: password,
    piattoPreferito: piatto
  });
  salva("utenti", utenti);

  const ricettari = leggi("ricettari", {});
  ricettari[username] = [];
  salva("ricettari", ricettari);

  salva("utenteCollegato", username);
  window.location.href = "index.html";
});
