(function () {
  const releases = [
    {
      version: "24-9-26", date: "24 septembrie 2026", current: true,
      changes: [{ title: "Zile fără antrenament", description: "În Prezență poți marca o zi fără antrenament pentru grupele alese sau întregul club, cu motiv opțional. Marcajele apar în istoric și în fișa lunară a sportivului, fără absențe și fără influență asupra procentului. Prezențele existente nu sunt suprascrise." }],
      bestArad: "De preluat: marcarea zilelor fără antrenament."
    },
    {
      version: "17-9-26",
      date: "17 septembrie 2026",
      current: false,
      changes: [
        { title: "Plățile sting întâi datoriile vechi", description: "Încasările acoperă taxele începând cu cea mai veche lună neachitată. Regula se aplică și plăților existente, fără schimbarea sumelor, datelor sau confirmărilor." },
        { title: "Istoric recalculat pe luni", description: "În Taxe și în fișa încasărilor se vede ce luni acoperă fiecare plată și ce mai este de achitat. Anularea taxei ține cont de plățile repartizate acelei luni." }
      ],
      bestArad: "De preluat: repartizarea plăților pe cele mai vechi datorii și istoricul recalculat."
    },
    {
      version: "15-9-26",
      date: "15 septembrie 2026",
      current: false,
      changes: [
        {
          title: "Restanța este explicată pe luni",
          description: "În coloana «Restanță / Avans» se poate vedea exact din ce luni provine suma, iar butonul «Corectează» deschide direct luna aleasă pentru sportivul respectiv."
        },
        {
          title: "Taxa poate fi anulată cu istoric",
          description: "Din «Modifică taxa lunii» se poate anula partea rămasă din taxa acelei luni. Motivul, suma, data și persoana care a făcut anularea rămân în istoricul sportivului, iar încasările existente nu sunt modificate."
        },
        {
          title: "Datele existente sunt păstrate",
          description: "Noua funcție nu schimbă automat taxele sau încasările deja înregistrate; corectarea se face numai la alegerea utilizatorului."
        }
      ],
      bestArad: "De preluat: detalierea restanței pe luni și anularea taxei cu motiv păstrat în istoric."
    },
    {
      version: "6-9-26",
      date: "6 septembrie 2026",
      current: false,
      changes: [
        {
          title: "Taxele sunt mai ușor de folosit",
          description: "În lista sportivilor se văd doar taxa stabilită și butonul «Modifică taxa lunii». Variantele pentru primele antrenamente, continuarea lunii, jumătate de taxă sau fără taxă apar numai când sunt necesare."
        },
        {
          title: "Încasarea obișnuită rămâne simplă",
          description: "Pentru un sportiv cu taxa stabilită nu trebuie schimbat nimic: se folosește direct butonul «Încasează»."
        }
      ],
      bestArad: "De preluat: afișarea simplificată a taxei lunii și opțiunile ascunse până la apăsarea butonului de modificare."
    },
    {
      version: "5-9-26",
      date: "5 septembrie 2026",
      current: false,
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
        },
        {
          title: "Taxă diferită doar într-o anumită lună",
          description: "În Taxe se poate alege rapid primul antrenament (50 lei), primele două antrenamente (100 lei), continuarea lunii la taxa normală, jumătate de taxă sau fără taxă. Alegerea se aplică numai lunii alese, încasările deja făcute se scad automat, iar luna următoare revine automat la taxa normală a sportivului."
        },
        {
          title: "Editarea taxei lunii nu mai întrerupe scrierea",
          description: "Suma se salvează după ce este completată, astfel încât rândul sportivului nu mai sare în listă după introducerea primei cifre."
        }
      ],
      bestArad: "De preluat: uniformizarea automată a numelor și grupelor, plus etapele de taxare pentru primele antrenamente și excepțiile valabile doar în luna aleasă."
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
