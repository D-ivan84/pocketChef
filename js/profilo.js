function mostraProfilo() {
    const utenteCollegato = leggi("utenteCollegato", null);
    if (utenteCollegato === null) {
        window.location.replace("accesso.html");
        return;
    }
    aggiornaNavbar("profilo");
    const utenti = leggi("utenti", []);
    let utente = null;
    for (let i = 0; i < utenti.length; i++) {
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
    document.getElementById("profilo-confPassword").value = utente.password;
    document.getElementById("profilo-piatto").value = utente.piattoPreferito;
    const form = document.getElementById("form-modifica-profilo");
    form.addEventListener("submit", function (evento) {
        evento.preventDefault();
        const email = document.getElementById("profilo-email").value.trim();
        const password = document.getElementById("profilo-password").value;
        const confPassword = document.getElementById("profilo-confPassword").value;
        const piatto = document.getElementById("profilo-piatto").value.trim();
        const errore = document.getElementById("errore-profilo");
        const successo = document.getElementById("successo-profilo");
        errore.classList.add("d-none");
        successo.classList.add("d-none");

        if (email === "" || password === "" || confPassword === "" || piatto === "") {
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
        if (confPassword !== password) {
            errore.textContent = "Passwords do not match.";
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

    const bottoneElimina = document.getElementById("bottone-elimina");

    // eliminazione utente
    bottoneElimina.addEventListener("click", function () {
        const sicuro = confirm("Are you sure you want to delete your profile? Cookbook, notes and reviews will be lost.");
        if (!sicuro) {
            return;
        }
        const rimasti = [];
        for (let i = 0; i < utenti.length; i++) {
            if (utenti[i].username !== utenteCollegato) {
                rimasti.push(utenti[i]);
            }
        }
        salva("utenti", rimasti);

        const ricettari = leggi("ricettari", {});
        delete ricettari[utenteCollegato];
        salva("ricettari", ricettari);
        const note = leggi("note", {});
        delete note[utenteCollegato];
        salva("note", note);

        const recensioni = leggi("recensioni", []);
        const recensioniRimaste = [];
        for (let j = 0; j < recensioni.length; j++) {
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