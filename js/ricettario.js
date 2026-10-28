async function mostraRicettario() {
  var utente = leggi("utenteCollegato", null);
  if (utente === null) {
    window.location.replace("accesso.html");
    return;
  }

  var pronta = await preparaPagina("ricettario");
  if (!pronta) {
    return;
  }

  var sottotitolo = document.getElementById("sottotitolo-ricettario");
  var griglia = document.getElementById("griglia-ricettario");
  var vuoto = document.getElementById("ricettario-vuoto");
  var form = document.getElementById("form-modifica-ricetta");
  var campoNome = document.getElementById("mod-nome");
  var campoIngredienti = document.getElementById("mod-ingredienti");
  var campoIstruzioni = document.getElementById("mod-istruzioni");
  var campoNota = document.getElementById("mod-nota");
  var errore = document.getElementById("errore-modifica");
  var idInModifica = null;

  function disegna() {
    griglia.textContent = "";
    var ricette = leggi("ricette", {});
    var ricettari = leggi("ricettari", {});
    var ricettarioUtente = ricettari[utente] || [];

    if (ricettarioUtente.length === 0) {
      vuoto.classList.remove("d-none");
      sottotitolo.classList.add("d-none");
    } else {
      vuoto.classList.add("d-none");
      sottotitolo.classList.remove("d-none");
    }

    ricettarioUtente.forEach(function (ricettaUtente) {
      var ricettaOriginale = ricette[ricettaUtente.id];

      // Controllo se la ricetta non è in "ricette"
      if (!ricettaOriginale) {
        return;
      }

      var colonna = creaCardRicetta({
        id: ricettaUtente.id,
        nome: ricettaUtente.nomePersonale,
        categoria: ricettaOriginale.categoria,
        immagine: ricettaOriginale.immagine
      });

      var blocco = creaElemento("div", "d-flex gap-2 mt-2");
      var bModifica = creaElemento("button", "btn btn-secondary btn-sm", "Edit");
      bModifica.type = "button";
      var bRimuovi = creaElemento("button", "btn btn-primary btn-sm", "Remove");
      bRimuovi.type = "button";

      blocco.appendChild(bModifica);
      blocco.appendChild(bRimuovi);
      colonna.appendChild(blocco);
      var testoNota = (leggi("note", {})[utente] || {})[ricettaUtente.id];
      if (testoNota) {
        var p = creaElemento("p", "text-break small text-muted mt-2 mb-0", "NOTE: " + testoNota);
        colonna.appendChild(p);
      }
      griglia.appendChild(colonna);

      bModifica.addEventListener("click", function () {
        idInModifica = ricettaUtente.id;
        campoNome.value = ricettaUtente.nomePersonale;
        campoIngredienti.value = ricettaUtente.ingredientiPersonali;
        campoIstruzioni.value = ricettaUtente.istruzioniPersonali;

        var tutteNote = leggi("note", {});
        var noteUtente = tutteNote[utente] || {};
        campoNota.value = noteUtente[ricettaUtente.id] || "";

        errore.classList.add("d-none");
        form.classList.remove("d-none");
        window.scrollTo(0, 0);
      });

      bRimuovi.addEventListener("click", function () {
        if (!confirm("Remove recipe from cookbook? Your custom changes will be lost.")) {
          return;  }
        var ricettari = leggi("ricettari", {});
        ricettari[utente] = (ricettari[utente] || []).filter(function (ric) {
          return String(ric.id) !== String(ricettaUtente.id);
        });
        salva("ricettari", ricettari);
        var note = leggi("note", {});
        if (note[utente]) {
          delete note[utente][ricettaUtente.id];
          salva("note", note);  }
        if (String(idInModifica) === String(ricettaUtente.id)) {
          idInModifica = null;
          form.classList.add("d-none");   }
        disegna();
      });

    });
  }

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    var nome = campoNome.value.trim();
    var ingredienti = campoIngredienti.value.trim();
    var istruzioni = campoIstruzioni.value.trim();
    errore.classList.add("d-none");

    if (nome === "") {
      errore.textContent = "Name cannot be empty.";
      errore.classList.remove("d-none");
      return;
    }

    var ricettari = leggi("ricettari", {});
    var ricettarioUtente = ricettari[utente] || [];
    for (var i = 0; i < ricettarioUtente.length; i++) {
      if (String(ricettarioUtente[i].id) === String(idInModifica)) {
        ricettarioUtente[i].nomePersonale = nome;
        ricettarioUtente[i].ingredientiPersonali = ingredienti;
        ricettarioUtente[i].istruzioniPersonali = istruzioni;
      }
    }
    salva("ricettari", ricettari);

    var testoNota = campoNota.value.trim();
    var note = leggi("note", {});
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