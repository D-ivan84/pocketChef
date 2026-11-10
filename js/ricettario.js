async function mostraRicettario() {
  const utente = leggi("utenteCollegato", null);
  if (utente === null) {
    window.location.replace("accesso.html");
    return;
  }

  const pronta = await preparaPagina("ricettario");
  if (!pronta) {
    return;
  }

  const sottotitolo = document.getElementById("sottotitolo-ricettario");
  const griglia = document.getElementById("griglia-ricettario");
  const vuoto = document.getElementById("ricettario-vuoto");
  const form = document.getElementById("form-modifica-ricetta");
  const campoNome = document.getElementById("mod-nome");
  const campoIngredienti = document.getElementById("mod-ingredienti");
  const campoIstruzioni = document.getElementById("mod-istruzioni");
  const campoNota = document.getElementById("mod-nota");
  const errore = document.getElementById("errore-modifica");
  let idInModifica = null;

  function disegna() {
    griglia.textContent = "";
    const ricette = leggi("ricette", {});
    const ricettari = leggi("ricettari", {});
    const ricettarioUtente = ricettari[utente] || [];

    if (ricettarioUtente.length === 0) {
      vuoto.classList.remove("d-none");
      sottotitolo.classList.add("d-none");
    } else {
      vuoto.classList.add("d-none");
      sottotitolo.classList.remove("d-none");
    }

    ricettarioUtente.forEach(function (ricettaUtente) {
      const ricettaOriginale = ricette[ricettaUtente.id];

      if (!ricettaOriginale) {
        return;
      }

      const colonna = creaCardRicetta({
        id: ricettaUtente.id,
        nome: ricettaUtente.nomePersonale,
        categoria: ricettaOriginale.categoria,
        immagine: ricettaOriginale.immagine
      });

      const blocco = creaElemento("div", "d-flex gap-2 mt-2");
      const bModifica = creaElemento("button", "btn btn-secondary btn-sm", "Edit");
      bModifica.type = "button";
      const bRimuovi = creaElemento("button", "btn btn-primary btn-sm", "Remove");
      bRimuovi.type = "button";

      blocco.appendChild(bModifica);
      blocco.appendChild(bRimuovi);
      colonna.appendChild(blocco);
      const testoNota = (leggi("note", {})[utente] || {})[ricettaUtente.id];
      if (testoNota) {
        const p = creaElemento("p", "text-break small text-muted mt-2 mb-0", "NOTE: " + testoNota);
        colonna.appendChild(p);
      }
      griglia.appendChild(colonna);

      bModifica.addEventListener("click", function () {
        idInModifica = ricettaUtente.id;
        campoNome.value = ricettaUtente.nomePersonale;
        campoIngredienti.value = ricettaUtente.ingredientiPersonali;
        campoIstruzioni.value = ricettaUtente.istruzioniPersonali;

        const tutteNote = leggi("note", {});
        const noteUtente = tutteNote[utente] || {};
        campoNota.value = noteUtente[ricettaUtente.id] || "";

        errore.classList.add("d-none");
        form.classList.remove("d-none");
        window.scrollTo(0, 0);
      });

      bRimuovi.addEventListener("click", function () {
        if (!confirm("Remove recipe from cookbook? Your custom changes will be lost.")) {
          return;
        }
        const ricettari = leggi("ricettari", {});
        ricettari[utente] = (ricettari[utente] || []).filter(function (ric) {
          return String(ric.id) !== String(ricettaUtente.id);
        });
        salva("ricettari", ricettari);
        const note = leggi("note", {});
        if (note[utente]) {
          delete note[utente][ricettaUtente.id];
          salva("note", note);
        }
        if (String(idInModifica) === String(ricettaUtente.id)) {
          idInModifica = null;
          form.classList.add("d-none");
        }
        disegna();
      });
    });
  }

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const nome = campoNome.value.trim();
    const ingredienti = campoIngredienti.value.trim();
    const istruzioni = campoIstruzioni.value.trim();
    errore.classList.add("d-none");

    if (nome === "") {
      errore.textContent = "Name cannot be empty.";
      errore.classList.remove("d-none");
      return;
    }

    const ricettari = leggi("ricettari", {});
    const ricettarioUtente = ricettari[utente] || [];
    for (let i = 0; i < ricettarioUtente.length; i++) {
      if (String(ricettarioUtente[i].id) === String(idInModifica)) {
        ricettarioUtente[i].nomePersonale = nome;
        ricettarioUtente[i].ingredientiPersonali = ingredienti;
        ricettarioUtente[i].istruzioniPersonali = istruzioni;
      }
    }
    salva("ricettari", ricettari);

    const testoNota = campoNota.value.trim();
    const note = leggi("note", {});
    if (!note[utente]) {
      note[utente] = {};
    }
    if (testoNota === "") {
      delete note[utente][idInModifica];
    } else {
      note[utente][idInModifica] = testoNota;
    }
    salva("note", note);

    idInModifica = null;
    form.classList.add("d-none");
    disegna();
  });

  document.getElementById("mod-annulla").addEventListener("click", function () {
    idInModifica = null;
    form.classList.add("d-none");
  });
  disegna();
}

mostraRicettario();
