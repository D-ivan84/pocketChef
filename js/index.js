const NUMERO_RICETTE = 12;

async function mostraHome() {
    const pronta = await preparaPagina("home");
    if (!pronta) {
        return;
    }

    const utente = leggi("utenteCollegato", null);
    if (utente !== null) {
        const sottotitolo = document.getElementById("sottotitolo");
        if (sottotitolo) {
            sottotitolo.textContent = "Welcome back, " + utente + "! Here is a selection of recipes from around the world.";
        }
    }

    const tutte = Object.values(leggi("ricette", {}));

    const oggi = new Date().toISOString().slice(0, 10); // creo la data formato aaaa-mm-gg ed elimino l'orario
    const giorno = leggi("ricettaDelGiorno", null);
    let scelta = null;

    if (giorno !== null && giorno.data === oggi) {
        for (let k = 0; k < tutte.length; k++) {
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

    const griglia = document.getElementById("griglia-ricette");
    for (let i = 0; i < NUMERO_RICETTE && i < tutte.length; i++) {
        griglia.appendChild(creaCardRicetta(tutte[i]));
    }
    document.getElementById("sezione-altre").classList.remove("d-none");
}

mostraHome();
