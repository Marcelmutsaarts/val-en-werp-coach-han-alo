// Alle inhoud van de app. Teksten aanpassen? Dat kan hier, zonder de rest van de code te raken.

export const LEVELS = [
  { id: 'laag', name: 'Laag', bars: 1 },
  { id: 'hoog', name: 'Hoog', bars: 2 },
  { id: 'uitdagend', name: 'Uitdagend', bars: 3 },
];

export const DIRECTIONS = [
  { id: 'voorwaarts', name: 'Voorwaarts' },
  { id: 'achterwaarts', name: 'Achterwaarts' },
  { id: 'zijwaarts', name: 'Zijwaarts' },
];

export const SPORTS = [
  {
    id: 'judo',
    name: 'Judo',
    title: 'Judo',
    video: 'https://youtu.be/pgfKasoI5yc',
    text: 'Judo is een Japanse vechtsport waarbij de nadruk ligt op balans, controle en het veilig werpen of naar de grond brengen van de tegenstander. Respect, techniek en timing staan centraal binnen deze discipline. Wereldwijd zijn er meer dan vijftig miljoen judoka’s actief in ruim tweehonderd landen, met name in Japan, Frankrijk, Brazilië, Canada en Rusland. Typische worpen zijn de o-soto-gari (grote beenveeg), ippon seoi-nage (schouderworp), tai-otoshi (lichaamsvalworp) en koshi-guruma (heupworp). Op het YouTube-kanaal van de International Judo Federation vind je veel officiële techniekvideo’s en wedstrijden.',
  },
  {
    id: 'bjj',
    name: 'BJJ',
    title: 'Brazilian Jiu-Jitsu (BJJ)',
    video: 'https://youtu.be/MsD1ZdG8m8c',
    text: 'BJJ richt zich vooral op grondgevechten, controle en submissies zoals klemmen en verwurgingen. Techniek, hefboomwerking en timing zijn belangrijker dan fysieke kracht. Wereldwijd beoefenen ongeveer zes miljoen mensen BJJ, met grote aantallen in Brazilië, de Verenigde Staten en Japan. Veelvoorkomende takedowns zijn de double-leg takedown, hip throw, trip sweep en arm drag. Het YouTube-kanaal BJJ Fanatics geeft uitgebreide uitleg van basis- en gevorderde technieken.',
  },
  {
    id: 'wrestling',
    name: 'Wrestling',
    title: 'Grappling / wrestling (worstelen)',
    video: 'https://youtu.be/gp-hWr-opUc',
    text: 'Olympisch worstelen is een van de oudste sporten ter wereld en richt zich op het controleren, verplaatsen en naar de grond brengen van een tegenstander zonder trappen of stoten. De sport vraagt veel kracht, snelheid en uithoudingsvermogen. Ze is bijzonder populair in de Verenigde Staten, Rusland (vooral Dagestan), Iran en Turkije, met wereldwijd miljoenen beoefenaars. Bekende worpen zijn de single-leg takedown, double-leg takedown, suplex, body lock throw en ankle pick. Op het YouTube-kanaal van USA Wrestling staan technische trainingen en wedstrijdfragmenten.',
  },
  {
    id: 'wwe',
    name: 'WWE / catch',
    title: 'Catch wrestling / WWE',
    video: 'https://youtu.be/tYxJmEu4c0M',
    text: 'Show- of WWE-worstelen combineert traditionele worsteltechnieken met theatrale showelementen. Veiligheid, samenwerking en expressie staan centraal, met nadruk op spektakel en presentatie. De stijl ontstond in Engeland en werd wereldwijd populair via de Verenigde Staten en de professionele showworstelwereld. Typische worpen zijn de arm drag, hip toss, scoop slam, suplex en powerbomb, meestal in een veilige, aangepaste vorm. Het WWE Performance Center op YouTube geeft een kijkje achter de schermen van training en demonstratie.',
  },
  {
    id: 'aikido',
    name: 'Aikido',
    title: 'Aikido',
    sharesWeekWith: 'jiujitsu',
    video: 'https://youtu.be/vZXt0_Kf5GE',
    text: 'Aikido komt uit Japan en gebruikt de energie van de tegenstander om die uit balans te brengen. De bewegingen zijn vloeiend, gecontroleerd en gericht op harmonie in plaats van kracht. Wereldwijd beoefenen enkele honderdduizenden mensen aikido, vooral in Japan, Frankrijk, de Verenigde Staten en Nederland. Bekende technieken zijn irimi-nage (inkomworp), kote-gaeshi (polsklemworp), shiho-nage (vierwindworp) en tenchi-nage (hemel-en-aardeworp). Op het YouTube-kanaal van Aikido Journal staan veel demonstraties van klassieke en moderne stijlen.',
  },
  {
    id: 'jiujitsu',
    name: 'Jiu-Jitsu',
    title: 'Jiu-Jitsu',
    sharesWeekWith: 'aikido',
    video: 'https://youtu.be/o6Cm5ZitMk4',
    text: 'Jiu-Jitsu is een Japanse zelfverdedigingskunst waarin worpen, klemmen, stoten en trappen samenkomen. De nadruk ligt op efficiëntie, controle en weerbaarheid. De sport wordt veel beoefend in Japan, Nederland, Duitsland en de Verenigde Staten, met wereldwijd tienduizenden actieve beoefenaars. Typische worpen zijn o-goshi (heupworp), tomoe-nage (offerworp), tai-otoshi (lichaamsvalworp) en diverse beenvegen. Op het YouTube-kanaal van de Ju-Jitsu International Federation staan officiële technieken en wedstrijduitleg.',
  },
];

export const SPORTEN = {
  intro: 'Elk sportprofiel heeft een eigen benadering van werpen, vallen en controleren. In week 1 tot en met 5 staat elke les een sportprofiel centraal en krijg je vormen die bij die sport horen. Aikido en jiu-jitsu delen één week.',
  summary: 'Samen laten deze zes vechtsporten zien hoe veelzijdig werpen, valbreken en samenwerken kunnen zijn: van de gecontroleerde elegantie van aikido tot de expressieve show van WWE, en van de technische precisie van BJJ tot de kracht en timing van judo en worstelen.',
};

// [id, naam, sport, valrichting, niveau, video]
const T = [
  ['t1', 'O soto gari', 'judo', 'achterwaarts', 'laag', 'https://www.youtube.com/watch?v=KeIPk8O58zs'],
  ['t2', 'O uchi gari', 'judo', 'achterwaarts', 'laag', 'https://www.youtube.com/watch?v=I3BWf1ZoIuc'],
  ['t3', 'Ko uchi gari', 'judo', 'achterwaarts', 'laag', 'https://www.youtube.com/watch?v=5E20xuzaXNw'],
  ['t4', 'Shiho nage', 'aikido', 'achterwaarts', 'laag', 'https://youtu.be/T9vWR7EdQdM'],
  ['t5', 'Seated guard double kouchi', 'wrestling', 'achterwaarts', 'laag', 'https://youtu.be/QtJPO4AxLxI'],
  ['t6', 'Tripod sweep', 'bjj', 'achterwaarts', 'laag', 'https://youtube.com/shorts/GpCkOrK_kUI'],
  ['t7', 'Double leg (low)', 'bjj', 'achterwaarts', 'laag', 'https://youtu.be/wxNAEByjOoA'],
  ['t8', 'Underhook knee tap', 'wrestling', 'achterwaarts', 'laag', 'https://youtu.be/AaImfGwY6vQ'],
  ['t9', 'Hip lunge breakdown', 'wrestling', 'achterwaarts', 'laag', 'https://youtu.be/J5hUhxbO-Oo'],
  ['t10', 'Leg sweep ankle pick', 'wwe', 'achterwaarts', 'laag', 'https://www.youtube.com/watch?v=qxObQaTFHTU'],
  ['t11', 'Single leg (leg block)', 'bjj', 'achterwaarts', 'hoog', 'https://youtu.be/JKtXtEOvSdQ'],
  ['t12', 'Sweep single', 'bjj', 'achterwaarts', 'hoog', 'https://youtu.be/YBG9LkoAMoo'],
  ['t13', 'Double leg (high)', 'bjj', 'achterwaarts', 'hoog', 'https://youtu.be/NTnNuvx1pPs'],
  ['t14', 'Single leg', 'bjj', 'achterwaarts', 'hoog', 'https://youtu.be/4HBVdF5AXc0'],
  ['t15', 'Single leg trap takedown', 'wrestling', 'achterwaarts', 'hoog', 'https://youtu.be/JKtXtEOvSdQ'],
  ['t16', 'Imanari roll', 'bjj', 'achterwaarts', 'uitdagend', 'https://youtu.be/Zm7uOETsZ3g'],
  ['t17', 'Schoolboy takedown', 'wrestling', 'achterwaarts', 'uitdagend', 'https://youtu.be/TwNzw40dvYs'],
  ['t18', 'X-guard sweep', 'bjj', 'achterwaarts', 'uitdagend', 'https://youtu.be/4sEveMOIpqo'],
  ['t19', 'Kiss of the dragon', 'bjj', 'achterwaarts', 'uitdagend', 'https://youtu.be/-z_UYv5w_Qk'],
  ['t20', 'Body slam', 'wwe', 'achterwaarts', 'uitdagend', 'https://youtu.be/1I-y9FuBz-o'],
  ['t21', 'Stick attack counter', 'jiujitsu', 'achterwaarts', 'uitdagend', 'https://youtu.be/XLwtlcxy2eQ'],
  ['t22', 'O goshi', 'judo', 'voorwaarts', 'laag', 'https://www.youtube.com/watch?v=VLYKx-Fwhxg'],
  ['t23', 'Uki goshi', 'judo', 'voorwaarts', 'laag', 'https://youtu.be/5jVF6r366Kg'],
  ['t24', 'Snap down', 'wrestling', 'voorwaarts', 'laag', 'https://youtu.be/Jp96eJudDxQ'],
  ['t25', 'Headlock takeover', 'wwe', 'voorwaarts', 'laag', 'https://youtu.be/y8aEudoaZm0'],
  ['t26', 'Duck under to takedown', 'wwe', 'voorwaarts', 'laag', 'https://youtu.be/wTIbkWnK-nw'],
  ['t27', 'Hammerlock', 'wwe', 'voorwaarts', 'laag', 'https://youtu.be/i2LzI2m00lU'],
  ['t28', 'Snap takedown', 'jiujitsu', 'voorwaarts', 'laag', 'https://youtu.be/DxX3mvbM3tE'],
  ['t29', 'Ippon seoi nage', 'judo', 'voorwaarts', 'hoog', 'https://www.youtube.com/watch?v=OmKfUXAAdZ0'],
  ['t30', 'Kote gaeshi', 'aikido', 'voorwaarts', 'hoog', 'https://youtu.be/ll1GCzl4Bxg'],
  ['t31', 'Seatbelt throw', 'wrestling', 'voorwaarts', 'hoog', 'https://youtu.be/7LcTzACQ7Lo'],
  ['t32', 'Thai sweep', 'wrestling', 'voorwaarts', 'hoog', 'https://youtu.be/rS-EmsmWlSo'],
  ['t33', 'Sunset flip', 'wwe', 'voorwaarts', 'hoog', 'https://youtu.be/YL04EGORU5w'],
  ['t34', 'Clothesline', 'wwe', 'voorwaarts', 'hoog', 'https://youtu.be/yVBSU_hBoQQ'],
  ['t35', 'Shiho nage (variatie)', 'jiujitsu', 'voorwaarts', 'hoog', 'https://youtu.be/33mEgh5O4NM'],
  ['t36', 'Scissor roll (kani-basami)', 'bjj', 'voorwaarts', 'uitdagend', 'https://youtu.be/YncIOGDSps0'],
  ['t37', 'Two sleeve suplex', 'bjj', 'voorwaarts', 'uitdagend', 'https://youtu.be/Q0n9__dQYU8'],
  ['t38', 'Key lock roll', 'wrestling', 'voorwaarts', 'uitdagend', 'https://youtu.be/NExqwHV41j0'],
  ['t39', 'Tomoe nage (opofferworp)', 'judo', 'voorwaarts', 'uitdagend', 'https://youtu.be/880WbHvHv6A'],
  ['t40', 'Harai goshi (heupworp)', 'judo', 'voorwaarts', 'uitdagend', 'https://youtu.be/_gcIWtS-9Ms'],
  ['t41', 'Knee tap', 'wrestling', 'zijwaarts', 'laag', 'https://youtu.be/phKg556osOY'],
  ['t42', 'Ankle pick', 'bjj', 'zijwaarts', 'laag', 'https://youtu.be/FfCZQXZ6eqY'],
  ['t43', 'De ashi barai', 'judo', 'zijwaarts', 'laag', 'https://youtu.be/gW9LEvVmG2o'],
  ['t44', 'Ushiro goshi (rear throw)', 'judo', 'zijwaarts', 'hoog', 'https://youtu.be/pyzYfHXivs4'],
  ['t45', 'Koshi nage', 'aikido', 'zijwaarts', 'hoog', 'https://youtu.be/i8uu52XeZno'],
  ['t46', 'Gator roll takedown', 'wrestling', 'zijwaarts', 'hoog', 'https://youtube.com/shorts/nExjwHaYGO8'],
  ['t47', 'Single leg (drive / football tackle)', 'wrestling', 'zijwaarts', 'hoog', 'https://youtu.be/s3Mm2PcqwpE'],
  ['t48', 'Lateral drop suplex', 'wrestling', 'zijwaarts', 'uitdagend', 'https://youtube.com/shorts/wgV-5iWxTSo'],
  ['t49', 'Fireman’s carry', 'wrestling', 'zijwaarts', 'uitdagend', 'https://youtu.be/vHONX2Q3xAE'],
];

export const TECHNIQUES = T.map(([id, name, sport, dir, level, video]) => ({ id, name, sport, dir, level, video }));

export const TECHNIEKEN = {
  intro: 'Samen met je docent oefen je elke les de technieken van een ander sportprofiel: judo, BJJ, wrestling, WWE/catch wrestling, aikido en jiu-jitsu. Aikido en jiu-jitsu delen één week. Hier vind je al die technieken en meer. Zoek, filter, bewaar en zet ze direct in je choreo. Je kunt ook zelf technieken met een YouTube-link toevoegen.',
  safety: 'Oefen je een nieuwe techniek? Vraag je docent om hulp bij veilig vallen en bij de opbouw van de techniek.',
};

export const TOETS = {
  title: 'Van staand naar de grond',
  intro: 'De afsluiting is een show, demonstratie of verhaallijn en geldt als summatieve toets. Je attitude tijdens de lessen telt mee. De demonstratie wordt als geheel beoordeeld: zonder aarzelen en op hoog tempo uitgevoerd.',
  uitvoering: 'Je voert de afsluiting uit in een viertal. Binnen het viertal vorm je zes verschillende tweetallen. Elk tweetal presenteert samen twee verschillende technieken die passen bij jullie thema.',
  bevat: [
    'Minimaal één val- en één werpmoment uit elk sportprofiel.',
    'Showelementen zoals muziek, kleding en regie die passen bij het thema.',
    'Veiligheid, samenwerking en presentatie staan centraal.',
  ],
  laatZien: [
    'beheersing van val- en werptechnieken',
    'toepassing van showelementen',
    'een creatieve, verzorgde uitvoering binnen een gekozen stijl of verhaal',
  ],
  uitval: 'De duo’s moeten de show ook kunnen uitvoeren wanneer iemand uit de groep uitvalt.',
  summatief: [
    { t: 'Veilig laag vallen', d: 'Veilig laag vallen en valbreken vanuit diverse lage worpen of situaties.' },
    { t: 'Veilig hoog vallen', d: 'Veilig hoog vallen en valbreken vanuit diverse hoge worpen of situaties.' },
    { t: 'Veilig werpen (laag en hoog)', d: 'Verschillende lage en hoge worpen veilig inzetten en uitvoeren.' },
    { t: 'Showelement', d: 'De demonstratie bevat showelementen (aankleding, sfeer, timing, ritme, regie) die de uitvoering visueel aantrekkelijk en overtuigend maken.' },
  ],
  formatief: [
    { t: 'Uitdagende technieken', d: 'Jezelf uitdagen met complexe of technisch moeilijke worpen en valbreektechnieken.' },
    { t: 'Combinaties', d: 'Worpen en valtechnieken combineren in een vloeiende opeenvolging.' },
    { t: 'Snelheid', d: 'Worpen en valtechnieken met toenemende snelheid en controle uitvoeren.' },
    { t: 'Extra showelementen of regie', d: 'Extra showelementen of regie toevoegen om de presentatie te versterken.' },
  ],
  attitude: 'Je toont een positieve, respectvolle en veilige houding tijdens de lessen en de uitvoering. Je werkt actief, samenwerkingsgericht en verantwoordelijk, gaat zorgvuldig om met medestudenten en materiaal, en toont doorzettingsvermogen en sportiviteit in elke oefensituatie.',
};

export const FASES = [
  { name: 'Imitatie', grade: 'onvoldoende', text: 'Een vaardigheid na observatie proberen te doen en accepteren dat het resultaat nog niet altijd goed is.' },
  { name: 'Oefenen', grade: 'matig', text: 'De vaardigheid verbeteren door lessen te volgen, instructies te krijgen, erover te lezen en te oefenen.' },
  { name: 'Verfijnen', grade: 'voldoende', text: 'De vaardigheid verfijnen tot je haar zelfstandig op hoog niveau kunt uitvoeren en aan anderen kunt demonstreren.' },
  { name: 'Combineren', grade: 'ruim voldoende', text: 'Nieuwe (deel)vaardigheden toevoegen, waardoor iets nieuws of eigens ontstaat.' },
  { name: 'Automatiseren', grade: 'goed', text: 'De vaardigheid doorontwikkelen tot ze geheel geautomatiseerd en onbewust verloopt, zodat er ruimte ontstaat voor nieuwe ontwikkelingen.' },
];

export const VALBREKEN = {
  intro: 'De leerlijn valbreken is methodisch, veilig en didactisch opgebouwd: van laag naar hoog, van eenvoudig naar complex en van individueel naar samenwerkend. In week 1 tot en met 5 staat daarnaast elke les een sportprofiel centraal. In week 6 pas je alles toe en breng je het samen; in week 7 voer je de show uit.',
  weeks: [
    { title: 'Voorwaarts vallen', text: 'Basisvaltechnieken (voorwaarts) vanuit lage posities.', tag: 'Sportprofiel' },
    { title: 'Achterwaarts vallen', text: 'Basisvaltechnieken (achterwaarts) vanuit lage posities.', tag: 'Sportprofiel' },
    { title: 'Zijwaarts vallen', text: 'Basisvaltechnieken (zijwaarts) vanuit lage posities.', tag: 'Sportprofiel' },
    { title: 'Op commando en sneller', text: 'Toenemende moeilijkheid: valreacties op commando, hogere snelheid.', tag: 'Sportprofiel' },
    { title: 'Combineren en samenwerken', text: 'Toenemende moeilijkheid: combinaties en samenwerking.', tag: 'Sportprofiel' },
    { title: 'Toepassen en integreren', text: 'Toepassing en integratie in spel- en lessituaties, in dynamische, creatieve en didactisch verantwoorde vormen.', tag: 'Show opbouwen' },
    { title: 'De show', text: 'Oefenen en uitvoeren van de show/demonstratie (evaluatie).', tag: 'Toets' },
  ],
  tip: 'Zet na elke sportles meteen de technieken die je wilt gebruiken in je choreo. Dan staat je show in week 6 al grotendeels en kun je die week besteden aan doorlopen, tempo en regie.',
  safety: [
    'Houd je kin op de borst als je valt.',
    'Sla actief af met arm en handpalm om de klap te verdelen.',
    'Begin langzaam en bouw het tempo geleidelijk op.',
    'Communiceer altijd goed met je partner.',
  ],
  videos: [
    { title: 'Rol vormen', url: 'https://youtu.be/U9PXtqwI57M' },
    { title: 'Basis valbreken', url: 'https://youtu.be/Tbi1Y9zRQsg' },
    { title: 'Zijwaarts (shoulder) rollen', url: 'https://youtu.be/exkwjkM0P7U' },
    { title: 'Barrel roll', url: 'https://youtu.be/eAwidAAZAmw' },
    { title: 'Cartwheel out', url: 'https://youtu.be/tY2DMllpQWk' },
    { title: 'Cartwheel out (kort)', url: 'https://youtube.com/shorts/KWmzHMSaAvE' },
  ],
  why: {
    intro: 'Valbreken is een basisvaardigheid voor veiligheid, motoriek en zelfvertrouwen. In het bewegingsonderwijs leren leerlingen niet alleen vallen zonder pijn, maar ook omgaan met risico’s en controle houden over hun lichaam.',
    points: [
      { t: 'Veiligheid en blessurepreventie', d: 'Kinderen vallen regelmatig: tijdens gym, op het schoolplein, bij sport of buitenspelen. Met valbreekvaardigheden weten ze hoe ze spanning opbouwen, de klap opvangen met armen en schouders en het hoofd beschermen. Dat verkleint de kans op blessures aanzienlijk.' },
      { t: 'Motorische ontwikkeling en lichaamsbesef', d: 'Valbreken traint coördinatie, balans, timing en rotatie: fundamentele motorische vaardigheden voor veel andere sporten, zoals turnen, judo, freerunnen en voetbal. Leerlingen leren hun lichaamszwaartepunt beheersen, spanning opbouwen en gecontroleerd bewegen.' },
      { t: 'Omgaan met spanning, angst en vertrouwen', d: 'Vallen vraagt lef en controle. Leerlingen leren omgaan met spanning, angst overwinnen en vertrouwen op hun eigen kunnen, en op hun docent of partner. Dat versterkt zelfvertrouwen en mentale veerkracht.' },
      { t: 'Sociale en pedagogische waarde', d: 'Veel valbreekvormen gebeuren in tweetallen of groepjes. Leerlingen leren samenwerken, elkaar vertrouwen en verantwoordelijkheid nemen voor veiligheid. Dat draagt bij aan een positief pedagogisch klimaat in de gymles.' },
    ],
  },
};
