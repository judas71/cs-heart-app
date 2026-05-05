# CS HEART Admin

Aplicație web simplă pentru administrarea clubului de baschet CS HEART.

## Deschidere

Deschide fișierul `index.html` în browser. Aplicația folosește `localStorage`, deci datele rămân salvate în browserul în care lucrezi.

## Funcții

- administrare sportivi: adăugare, editare, ștergere, status activ/inactiv
- prezență la antrenamente pe dată și grupă
- taxe lunare pe sportiv, cu sumă datorată, sumă plătită, dată și metodă
- rapoarte pentru restanțieri, prezențe și taxe plătite
- date demo și resetare rapidă din butonul `Date demo`

## Fișiere principale

- `index.html` pornește aplicația
- `styles.css` conține designul responsive
- `src/data.js` conține datele demo
- `src/storage.js` gestionează salvarea în browser
- `src/components.js` conține componentele de ecran
- `src/app.js` leagă aplicația și acțiunile principale
