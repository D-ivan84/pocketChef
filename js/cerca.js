async function mostraCerca() {
    const bottone = document.getElementById("cerca-bottone");
    const pronta = await preparaPagina("cerca");
    if (!pronta) {
        return;
    }

    const form = document.getElementById("form-cerca");
    const campoTesto = document.getElementById("cerca-testo");
    const campoTipo = document.getElementById("cerca-tipo");
    const campoCategoria = document.getElementById("cerca-categoria");
    const messaggio = document.getElementById("cerca-messaggio");
    const risultati = document.getElementById("risultati");

    const categorie = leggi("categorie", []);
    for (let i = 0; i < categorie.length; i++) {
        const opzione = document.createElement("option");
        opzione.value = categorie[i].nome;
        opzione.textContent = categorie[i].nome;
        campoCategoria.appendChild(opzione);
    }

    form.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const testo = campoTesto.value.trim().toLowerCase();
        const tipo = campoTipo.value;
        const categoria = campoCategoria.value;
        risultati.textContent = "";
        messaggio.classList.add("d-none");
        if (testo === "" && categoria === "") {
            messaggio.textContent = "Please enter a search term or choose a category.";
            messaggio.classList.remove("d-none");
            return;
        }

        const parole = testo.split(" ").filter(function (p) { // creo un array di parole divise da spazio
            return p !== "";
        });

        const tutteRicette = Object.values(leggi("ricette", {}));
        const trovate = [];
        for (let k = 0; k < tutteRicette.length; k++) {
            const r = tutteRicette[k];
            let ok = true;
            if (categoria !== "" && r.categoria !== categoria) {
                ok = false;
            }
            if (ok && testo !== "") {
                if (tipo === "lettera") {
                    ok = r.nome.toLowerCase().charAt(0) === testo.charAt(0);
                } else {
                    let campoRicerca = "";
                    switch (tipo) {
                        case "titolo":
                            campoRicerca = r.nome;
                            break;
                        case "ingrediente":
                            for (let j = 0; j < r.ingredienti.length; j++) {
                                campoRicerca += r.ingredienti[j].nome + " ";
                            }
                            break;
                        case "descrizione":
                            campoRicerca = r.nome + " " + r.tags.join(" ") + " " + r.istruzioni;
                            break;
                        default:
                            campoRicerca = r.nome;
                            break;
                    }

                    campoRicerca = campoRicerca.toLowerCase();
                    for (let p = 0; p < parole.length; p++) { // devono includere tutte le parole inserite
                        if (!campoRicerca.includes(parole[p])) {
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
            for (let m = 0; m < trovate.length; m++) {
                risultati.appendChild(creaCardRicetta(trovate[m]));
            }
        }
        messaggio.classList.remove("d-none");
    });
    bottone.disabled = false;
}
mostraCerca();
