function leggi(chiave, predefinito) {
  try {
    var testo = localStorage.getItem(chiave);
    if (testo === null) {
      return predefinito;
    }
    return JSON.parse(testo);
  } catch (e) {
    return predefinito;
  }
}

function salva(chiave, valore) {
  localStorage.setItem(chiave, JSON.stringify(valore));
}

function rimuovi(chiave) {
  localStorage.removeItem(chiave);
}

