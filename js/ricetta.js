async function mostraRicetta() {
    const pronta = await preparaPagina("ricetta");
    if (!pronta) {
        return;
    }

    const titolo = document.getElementById("ricetta-titolo");
    const errore = document.getElementById("ricetta-errore");
    const scheda = document.getElementById("scheda");

    const parametri = new URLSearchParams(window.location.search);
    const id = parametri.get("id");

    const ricette = Object.values(leggi("ricette", {}));
    let ricetta = null;
    for (let i = 0; i < ricette.length; i++) {
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

    const immagine = document.getElementById("ricetta-immagine");
    immagine.src = ricetta.immagine;
    immagine.alt = ricetta.nome;

    document.getElementById("ricetta-categoria").textContent = ricetta.categoria;
    document.getElementById("ricetta-area").textContent = ricetta.area;
    document.getElementById("ricetta-istruzioni").textContent = ricetta.istruzioni;

    const elenco = document.getElementById("ricetta-ingredienti");
    for (let j = 0; j < ricetta.ingredienti.length; j++) {
        const ing = ricetta.ingredienti[j];
        const riga = (ing.misura + " " + ing.nome).trim();
        elenco.appendChild(creaElemento("li", "", riga));
    }

    if (ricetta.youtube) {
        const video = document.getElementById("ricetta-youtube");
        video.href = ricetta.youtube;
        video.classList.remove("d-none");
    }

    function pulito(testo) {
        return testo.replaceAll("\r", "").trim();
    }
    const utente = leggi("utenteCollegato", null);
    const riquadro = document.getElementById("mia-versione");
    function aggiornaMiaVersione() {
        if (utente === null) {
            return;
        }

        const rigaNota = document.getElementById("mia-nota");
        riquadro.classList.add("d-none");
        rigaNota.classList.add("d-none");

        const testoNota = (leggi("note", {})[utente] || {})[id];
        if (testoNota) {
            rigaNota.textContent = "NOTE: " + testoNota;
            rigaNota.classList.remove("d-none");
        }

        // Riquadro "Mia Versione"
        const ricettarioUtente = leggi("ricettari", {})[utente] || [];
        const copia = ricettarioUtente.find(function (ric) { return String(ric.id) === id; });

        if (!copia) {
            return;
        }

        const ingUtente = copia.ingredientiPersonali;

        const modificata = pulito(copia.nomePersonale) !== pulito(ricetta.nome)
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
        const bottone = document.getElementById("ricetta-bottone-ricettario");
        const ricUtente = leggi("ricettari", {})[utente] || [];
        let presente = ricUtente.some(function (x) { return String(x.id) === id; });

        if (presente) {
            bottone.textContent = "Remove from cookbook";
        }
        bottone.classList.remove("d-none");

        bottone.addEventListener("click", function () {
            const ricettari = leggi("ricettari", {});
            let ricettarioUtente = ricettari[utente] || [];

            if (presente) {
                if (!confirm("Remove recipe from cookbook? Your custom changes will be lost.")) {
                    return;
                }
                ricettarioUtente = ricettarioUtente.filter(function (ric) { return String(ric.id) !== id; });

                const note = leggi("note", {});
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
    const contenitore = document.getElementById("ricetta-recensioni");
    const nessuna = document.getElementById("ricetta-nessuna-recensione");
    const formRec = document.getElementById("form-recensione");
    const erroreRec = document.getElementById("errore-recensione");

    function disegnaRecensioni() {
        contenitore.textContent = "";
        const recensioni = leggi("recensioni", []);
        let numRecensioni = 0;
        let recensionePresente = false;

        recensioni.forEach(function (rec) {
            if (String(rec.idRicetta) !== id) {
                return;
            }
            numRecensioni++;
            const blocco = creaElemento("div", "border rounded p-2 mb-2");
            blocco.appendChild(creaElemento("strong", "", rec.username));
            blocco.appendChild(creaElemento("span", "text-muted", " · prepared on " +
                rec.dataPreparazione.split("-").reverse().join("/")));
            blocco.appendChild(creaElemento("div", "", "Difficulty: " + rec.difficolta + "/5 · Taste: " + rec.gusto + "/5"));
            if (rec.commento) {
                blocco.appendChild(creaElemento("div", "", rec.commento));
            }

            if (utente !== null && rec.username === utente) {
                recensionePresente = true;
                const bRimuoviRec = creaElemento("button", "btn btn-primary btn-sm mt-2", "Remove my review");
                bRimuoviRec.type = "button";
                blocco.appendChild(bRimuoviRec);

                bRimuoviRec.addEventListener("click", function () {
                    if (!confirm("Remove your review?")) {
                        return;
                    }
                    let tutteRec = leggi("recensioni", []);
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
        const data = document.getElementById("rec-data").value;
        const difficolta = document.getElementById("rec-difficolta").value;
        const gusto = document.getElementById("rec-gusto").value;
        const commento = document.getElementById("rec-commento").value.trim();
        const oggi = new Date().toISOString().slice(0, 10);
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

        const recensioni = leggi("recensioni", []);
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
