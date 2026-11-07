# Val & Werp Coach · HAN ALO

Studieapp voor de module valbreken en werpen van de HAN ALO (7 weken, show in week 7).

Studenten vinden er de toetsinstructie, de leerlijn valbreken, de zes sportprofielen en een bibliotheek met technieken. In **Mijn show** bouwen ze met hun viertal de showchoreografie:

- de zes duo's worden automatisch gemaakt;
- per duo kies je technieken en zet je erbij wie werpt en wie valt;
- de toetscheck laat zien of elk duo twee technieken heeft, of alle sportprofielen erin zitten en of iedereen laag en hoog valt en werpt;
- met de uitvalcheck zie je wat er overblijft als iemand ziek is;
- de oefenmodus loopt de show stap voor stap door, met grote knoppen en het scherm aan;
- je deelt een show via een link of bestand, en drukt een draaiboek af of bewaart het als PDF.

## Techniek

- Statische site zonder build-stap: HTML, CSS en JavaScript-modules.
- Alle gegevens blijven in de browser van de student (`localStorage`). Er is geen database en geen account.
- Werkt offline nadat de app één keer is geopend (service worker).

## Inhoud aanpassen

Alle teksten, weken, sportprofielen en technieken staan in `data.js`. Pas dat bestand aan en upload het opnieuw. Vercel zet de nieuwe versie dan automatisch online.

## Bestanden

| Bestand | Inhoud |
| --- | --- |
| `index.html` | Pagina en navigatie |
| `styles.css` | Vormgeving (HAN-magenta op zwart en wit) |
| `data.js` | Alle inhoud |
| `app.js` | Opstart en navigatie |
| `views.js` | Toets, Valbreken, Sporten, Technieken |
| `choreo.js` | Mijn show |
| `store.js` | Opslag, import en export |
| `ui.js` | Dialogen, iconen, video |
| `sw.js` | Offline werken |
