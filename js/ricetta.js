async function mostraRicetta() {
    var pronta = await preparaPagina("ricetta");
    if (!pronta) {
        return;
    }

    var titolo = document.getElementById("ricetta-titolo");
    var errore = document.getElementById("ricetta-errore");
    var scheda = document.getElementById("scheda");

    var parametri = new URLSearchParams(window.location.search);
    var id = parametri.get("id");

    var ricette = Object.values(leggi("ricette", {}));
    var ricetta = null;
    for (var i = 0; i < ricette.length; i++) {
        if (String(ricette[i].id) === id) {
            ricetta = ricette[i];
            break;
        }
    }

    if (ricetta === null) {
        errore.textContent = "Recipe not found.";
        errore.classList.remove("d-none");
        return;
    }

    titolo.textContent = ricetta.nome;
    document.title = ricetta.nome + " · Chef in Tasca";

    var immagine = document.getElementById("ricetta-immagine");
    immagine.src = ricetta.immagine;
    immagine.alt = ricetta.nome;

    document.getElementById("ricetta-categoria").textContent = ricetta.categoria;
    document.getElementById("ricetta-area").textContent = ricetta.area;
    document.getElementById("ricetta-istruzioni").textContent = ricetta.istruzioni;

    var elenco = document.getElementById("ricetta-ingredienti");
    for (var j = 0; j < ricetta.ingredienti.length; j++) {
        var ing = ricetta.ingredienti[j];
        var riga = (ing.misura + " " + ing.nome).trim();
        elenco.appendChild(creaElemento("li", "", riga));
    }

    if (ricetta.youtube) {
        var video = document.getElementById("ricetta-youtube");
        video.href = ricetta.youtube;
        video.classList.remove("d-none");
    }

    function pulito(testo) {
        return testo.replaceAll("\r", "").trim();
    }
    var utente = leggi("utenteCollegato", null);
    var riquadro = document.getElementById("mia-versione");
    function aggiornaMiaVersione() {
        if (utente === null) {
            return;
        }

        var rigaNota = document.getElementById("mia-nota");
        riquadro.classList.add("d-none");
        rigaNota.classList.add("d-none");

        var testoNota = (leggi("note", {})[utente] || {})[id];
        if (testoNota) {
            rigaNota.textContent = "NOTE: " + testoNota;
            rigaNota.classList.remove("d-none");
        }

        //Riquadro "Mia Versione"
        var ricettarioUtente = leggi("ricettari", {})[utente] || [];
        var copia = ricettarioUtente.find(function (ric) { return String(ric.id) === id;});

        if (!copia) {
            return;
        }

        var ingUtente = copia.ingredientiPersonali;

        var modificata = pulito(copia.nomePersonale) !== pulito(ricetta.nome)
            || pulito(ingUtente) !== pulito(ingredientiComeTesto(ricetta))
            || pulito(copia.istruzioniPersonali) !== pulito(ricetta.istruzioni);

        // Se non ci sono modifiche ai testi della ricetta, non mostro il riquadro
        if (!modificata) {
            return;
        }

        document.getElementById("mia-nome").textContent = copia.nomePersonale;
        document.getElementById("mia-ingredienti").textContent = ingUtente;
        document.getElementById("mia-istruzioni").textContent = copia.istruzioniPersonali;

        riquadro.classList.remove("d-none");
    }

    if (utente === null) {
        document.getElementById("ricetta-invito").classList.remove("d-none");
    } else {
        var bottone = document.getElementById("ricetta-bottone-ricettario");
        var ricUtente = leggi("ricettari", {})[utente] || [];
        var presente = ricUtente.some(function (x) { return String(x.id) === id; });

        if (presente) {
            bottone.textContent = "Remove from cookbook";
        }
        bottone.classList.remove("d-none");

        bottone.addEventListener("click", function () {
            var ricettari = leggi("ricettari", {});
            var ricettarioUtente = ricettari[utente] || [];

            if (presente) {
                if (!confirm("Remove recipe from cookbook? Your custom changes will be lost.")) {
                    return;
                }
                ricettarioUtente = ricettarioUtente.filter(function (ric) { return String(ric.id) !== id; });

                var note = leggi("note", {});
                if (note[utente]) {
                    delete note[utente][id];
                    salva("note", note);
                }

                bottone.textContent = "Add to cookbook";
            } else {
                ricettarioUtente.push({
                    id: ricetta.id,
                    aggiuntaIl: new Date().toISOString().slice(0, 10),
                    nomePersonale: ricetta.nome,
                    ingredientiPersonali: ingredientiComeTesto(ricetta),
                    istruzioniPersonali: ricetta.istruzioni
                });
                bottone.textContent = "Remove from cookbook";
            }

            presente = !presente;
            ricettari[utente] = ricettarioUtente;
            salva("ricettari", ricettari);
            aggiornaMiaVersione();
        });
    }
    aggiornaMiaVersione();

    // Recensioni
    var contenitore = document.getElementById("ricetta-recensioni");
    var nessuna = document.getElementById("ricetta-nessuna-recensione");
    var formRec = document.getElementById("form-recensione");
    var erroreRec = document.getElementById("errore-recensione");

    function disegnaRecensioni() {
        contenitore.textContent = "";
        var recensioni = leggi("recensioni", []);
        var numRecensioni = 0;
        var recensionePresente = false;

        recensioni.forEach(function (rec) {
            if (String(rec.idRicetta) !== id) {
                return;
            }
            numRecensioni++;
            var blocco = creaElemento("div", "border rounded p-2 mb-2");
            blocco.appendChild(creaElemento("strong", "", rec.username));
            blocco.appendChild(creaElemento("span", "text-muted", " · prepared on " +
                rec.dataPreparazione.split("-").reverse().join("/")));
            blocco.appendChild(creaElemento("div", "", "Difficulty: " + rec.difficolta + "/5 · Taste: " + rec.gusto + "/5"));
            if (rec.commento) {
                blocco.appendChild(creaElemento("div", "", rec.commento));
            }

            if (utente !== null && rec.username === utente) {
                recensionePresente = true;
                var bRimuoviRec = creaElemento("button", "btn btn-primary btn-sm mt-2", "Remove my review");
                bRimuoviRec.type = "button";
                blocco.appendChild(bRimuoviRec);

                bRimuoviRec.addEventListener("click", function () {
                    if (!confirm("Remove your review?")) {
                        return;
                    }
                    var tutteRec = leggi("recensioni", []);
                    tutteRec = tutteRec.filter(function (x) { return x.id !== rec.id; });
                    salva("recensioni", tutteRec);
                    disegnaRecensioni();
                });
                
            }

            contenitore.appendChild(blocco);
        });

        if (numRecensioni === 0) {
            nessuna.classList.remove("d-none");
        } else {
            nessuna.classList.add("d-none");
        }

        if (utente !== null && !recensionePresente) {
            formRec.classList.remove("d-none");
        } else {
            formRec.classList.add("d-none");
        }
    }

    formRec.addEventListener("submit", function (evento) {
        evento.preventDefault();
        var data = document.getElementById("rec-data").value;
        var difficolta = document.getElementById("rec-difficolta").value;
        var gusto = document.getElementById("rec-gusto").value;
        var commento = document.getElementById("rec-commento").value.trim();
        var oggi = new Date().toISOString().slice(0, 10);
        erroreRec.classList.add("d-none");

        if (data === "" || difficolta === "" || gusto === "") {
            erroreRec.textContent = "Please choose the date and both ratings.";
            erroreRec.classList.remove("d-none");
            return;
        }

        if (data > oggi) {
            erroreRec.textContent = "Preparation date cannot be in the future.";
            erroreRec.classList.remove("d-none");
            return;
        }

        var recensioni = leggi("recensioni", []);
        recensioni.push({
            id: Date.now(),
            idRicetta: ricetta.id,
            username: utente,
            dataPreparazione: data,
            difficolta: Number(difficolta),
            gusto: Number(gusto),
            commento: commento,
            creataIl: new Date().toISOString()
        });
        salva("recensioni", recensioni);

        formRec.reset();
        disegnaRecensioni();
    });

    disegnaRecensioni();

    scheda.classList.remove("d-none");
}

mostraRicetta();