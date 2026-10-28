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

    var categorie = leggi("categorie", []);
    for (var i = 0; i < categorie.length; i++) {
        var opzione = document.createElement("option");
        opzione.value = categorie[i].nome;
        opzione.textContent = categorie[i].nome;
        campoCategoria.appendChild(opzione);
    }

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

        var parole = testo.split(" ").filter(function (p) { //creo un array di parole divise da spazio
            return p !== "";
        });

        var tutteRicette = Object.values(leggi("ricette", {}));
        var trovate = [];
        for (var k = 0; k < tutteRicette.length; k++) {
            var r = tutteRicette[k];
            var ok = true;
            if (categoria !== "" && r.categoria !== categoria) {
                ok = false;
            }
            if (ok && testo !== "") {
                if (tipo === "lettera") {
                    ok = r.nome.toLowerCase().charAt(0) === testo.charAt(0);
                } else {
                    var campoRicerca = "";
                    switch (tipo) {
                        case "titolo":
                            campoRicerca = r.nome;
                            break;
                        case "ingrediente":
                            for (var j = 0; j < r.ingredienti.length; j++) {
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
                    for (var p = 0; p < parole.length; p++) { //devono includere tutte le parole inserite
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
            for (var m = 0; m < trovate.length; m++) {
                risultati.appendChild(creaCardRicetta(trovate[m]));
            }
        }
        messaggio.classList.remove("d-none");
    });
    bottone.disabled = false;
}
mostraCerca();