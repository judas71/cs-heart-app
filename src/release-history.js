(function () {
  const releases = [
    {
      version: "5-9-26",
      date: "5 septembrie 2026",
      current: true,
      changes: [
        {
          title: "Numele sportivilor sunt uniformizate automat",
          description: "Părintele poate completa numele cu litere mici sau mari; în evidența sportivilor, numele și prenumele sunt salvate automat cu majuscule."
        },
        {
          title: "Grupele nu se mai dublează din cauza literelor",
          description: "Denumirea grupei este uniformizată automat, astfel încât «Alina», «alina» și «ALINA» sunt tratate ca aceeași grupă: ALINA."
        },
        {
          title: "Aceeași regulă la creare și editare",
          description: "Protecția se aplică sportivilor creați din cererile online, celor adăugați manual și modificărilor ulterioare din fișa sportivului."
        }
      ],
      bestArad: "De preluat: aceeași uniformizare automată a numelor și grupelor."
    },
    {
      version: "4-9-26",
      date: "4 septembrie 2026",
      changes: [
        {
          title: "Taxele sportivilor inactivi",
          description: "Se păstrează situația taxei din luna în care sportivul devine inactiv, iar lunile următoare nu mai generează cotizații. La o eventuală revenire, taxarea reîncepe din luna reactivării."
        },
        {
          title: "Rectificarea evidenței existente",
          description: "Au fost recalculate soldurile celor 19 sportivi inactivi, fără modificarea încasărilor, taxelor sau prezențelor deja înregistrate."
        },
        {
          title: "Luna inactivării",
          description: "În fișa sportivului a fost adăugat câmpul «Inactiv începând cu luna», pentru verificare și corectare ulterioară."
        }
      ],
      bestArad: "De preluat: aceeași regulă de oprire a taxării și câmpul pentru luna inactivării."
    },
    {
      version: "3-9-26",
      date: "3 septembrie 2026",
      changes: [
        {
          title: "Previzualizarea formularelor",
          description: "Formularul de înscriere și cel de actualizare pot fi citite integral înainte de a fi trimise părinților."
        },
        {
          title: "Condițiile cotizației",
          description: "Au fost adăugate plata cash sau prin transfer, contul bancar și recomandarea clubului pentru plata prin transfer."
        },
        {
          title: "Data aplicării noii cotizații",
          description: "A fost precizat că valoarea de 250 lei pe lună se aplică începând cu 01.10.2026."
        }
      ],
      bestArad: "De adaptat înainte de preluare: denumirea clubului, banca, contul și valoarea cotizației."
    }
  ];

  window.CSHeartReleaseHistory = {
    currentVersion: releases[0].version,
    releases
  };
})();
