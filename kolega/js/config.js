// UnderGRAND E ne'š kolega!!! — talasi, neprijatelji, brzine, poeni i tekstovi. Sve što se podešava je ovde.
// Igralište je GW×GH logičkih piksela (4:3); jedan piksel sprajta = jedan logički piksel (bos je 2×).
const GW=240, GH=180;
const GROUND=174;                       // crvena linija tla
const PLAYER_Y=162, PLAYER_SPEED=95;    // odašiljač (12×10)
const SHOT_SPEED=230;                   // rif igrača, jedan na ekranu
const START_LIVES=3, LIFE_EVERY=2000;   // 3 = jedan u igri + dva u rezervi; novi život na svakih 2.000 poena (korisnik, 30. 10. 2026)

// Formacija 5 redova × 8. Korak = pomeraj za `step` piksela; na ivici se spusti za `drop` i okrene.
const FORM={cols:8, rows:5, dx:18, dy:15, step:3, drop:6, margin:5, size:12, top:22};
const ROW_TYPES=['tv','batinas','bot','inspektor','ometac']; // svi tipovi, redom za „Postavu“ (redovi nivoa su u LEVELS)
const ENEMIES={
  tv:{name:'Ćaci TV', pts:40, hp:1, shot:'naslov', role:'Ispaljuje lažne naslove: padaju polako, lepe se za zaklon i jače ga oštete.'},
  batinas:{name:'Batinaš u trenerci', pts:30, hp:2, shot:'munja', role:'Treba ga pogoditi dva puta. Ponekad iskoči iz stroja i jurne na tebe.'},
  bot:{name:'Bot farma', pts:20, hp:1, shot:'spam', role:'Kad ga pogodiš, ume da se iskopira u prazno mesto u stroju.'},
  inspektor:{name:'Inspektor sa pečatom', pts:10, hp:1, shot:'pecat', role:'Pečat koji pogodi zaklon briše ceo komad zaklona.'},
  ometac:{name:'Ometač signala', pts:10, hp:1, shot:'smetnja', role:'Kad stroj siđe nisko, ekran povremeno zašumi.'},
};
const BOT_COPY=.25; // šansa da se pogođeni bot iskopira

// Hici neprijatelja: brzina je deo brzine talasa (`bSpeed`), `crater` = koliko jako oštete zaklon.
const SHOTS={
  naslov:{speed:.5, crater:3.2, stick:1.1},   // lažni naslov: polako, zalepi se pa izgrize veću rupu
  munja:{speed:1, crater:1.8},
  spam:{speed:1.15, crater:1.6},
  pecat:{speed:.85, seal:true},               // briše ceo komad zaklona
  smetnja:{speed:1, crater:1.8},
  vest:{speed:1, crater:2},                   // „udarna vest“ iz trake bosa
  mastilo:{speed:1, seal:true},               // kap mastila iz Megakrkan Pečata
};

// Nivoi: svaki ima raspored redova formacije (odozgo), playlistu, pesmu i vrstu bosa, i tri talasa.
// Talas: stepMax/stepMin = vreme koraka formacije sa svim / jednim neprijateljem, fire = prosečno vreme između hitaca,
// maxB = najviše hitaca odjednom, dive = prosečno vreme između iskakanja batinaša.
const LEVELS=[
  {name:'Desk udarnih vesti', rows:['tv','batinas','bot','inspektor','ometac'],
   playlist:['udarna','autobusi','pistaljka'], bossSong:'megakrkan', boss:'caci', waves:[
    {title:'Talas 1', sub:'Desk udarnih vesti otvara program.', y0:30, stepMax:.45, stepMin:.05, fire:1.6, maxB:2, bSpeed:62, dive:16},
    {title:'Talas 2', sub:'Pojačanje stiže autobusima.', y0:36, stepMax:.36, stepMin:.045, fire:1.05, maxB:3, bSpeed:72, dive:11},
    {title:'Talas 3', sub:'Sendviči podeljeni, svi na teren.', y0:42, stepMax:.28, stepMin:.035, fire:.75, maxB:4, bSpeed:82, dive:6},
  ]},
  // Nivo 2: dva reda inspektora (više pečata, zakloni brže nestaju), sve brže i niže nego na nivou 1.
  {name:'Regulatorno telo', rows:['tv','inspektor','batinas','inspektor','bot'],
   playlist:['salter','dozvola','zapisnik'], bossSong:'pecat', boss:'pecat', waves:[
    {title:'Talas 1', sub:'Inspekcija stiže nenajavljeno.', y0:34, stepMax:.38, stepMin:.045, fire:1.3, maxB:3, bSpeed:70, dive:12},
    {title:'Talas 2', sub:'Traže dozvolu za dozvolu.', y0:40, stepMax:.3, stepMin:.04, fire:.9, maxB:4, bSpeed:80, dive:8},
    {title:'Talas 3', sub:'Svi papiri su u redu. Zato i dolaze.', y0:46, stepMax:.24, stepMin:.032, fire:.65, maxB:5, bSpeed:90, dive:5},
  ]},
  // Nivo 3 (poslednji): dva reda ometača (ekran češće zašumi), najbrži i najniži talasi.
  {name:'Brdo sa antenom', rows:['tv','ometac','batinas','bot','ometac'],
   playlist:['smetnja','antena','belisum'], bossSong:'ometac', boss:'ometac', waves:[
    {title:'Talas 1', sub:'Na brdu niče antena bez dozvole.', y0:38, stepMax:.34, stepMin:.04, fire:1.15, maxB:3, bSpeed:76, dive:10},
    {title:'Talas 2', sub:'Ometači rade prekovremeno.', y0:44, stepMax:.27, stepMin:.035, fire:.8, maxB:4, bSpeed:86, dive:7},
    {title:'Talas 3', sub:'Sve frekvencije su njihove. Osim jedne.', y0:50, stepMax:.22, stepMin:.03, fire:.58, maxB:5, bSpeed:96, dive:4.5},
  ]},
];
const DIVE={down:75, steer:28, up:60, sink:16, back:.5}; // batinaš: brzina pada, skretanje ka igraču, povratak, tonjenje ispod linije, šansa da se vrati

// Zakloni: 4 komada od kaseta (gore) i ploča (dole), 22×16, oštećuju se piksel po piksel.
const SHIELD={w:22, h:16, y:136, count:4};

// Leteći bonus: crni džip bez tablica.
const JEEP={every:[20,30], speed:40, y:5, pts:[50,100,150,200,300]};

// Power-upovi ispadaju iz pogođenih neprijatelja.
const POWER={chance:.05, fall:36, solHits:3};
const POWERS={
  pistaljka:{name:'Pištaljka', text:'Svi neprijatelji se vrate jedan red nagore.'},
  solidarnost:{name:'Solidarnost', text:'Živi štit od slušalaca iznad odašiljača, prima 3 pogotka.'},
  demanti:{name:'Zvanični demanti', text:'Briše sve neprijateljske hice sa ekrana.'},
};

// Bos nivoa 1: Megakrkan Ćaci (sprajt 34×24, crta se 2×). Prvo dve antene, pa ekran.
const BOSS={name:'Megakrkan Ćaci', sub:'Gađaj antene, pa ekran!', about:'ogroman televizor. Prvo obe antene, pa ekran.',
  scale:2, y:14, speed:26, speed2:42, antHp:5, scrHp:20, fire:2.3, fire2:1.35, burst:[3,5], burst2:[4,6], bSpeed:80, reprise:3,
  pts:{ant:50, antDown:500, scr:30, down:3000}};
// Bos nivoa 2: Megakrkan Pečat (sprajt 30×26, crta se 2×; lebdi samo pečat, redovi 0-17 = 60×36) - po korisnikovoj dizajn-tabli.
// Lebdi i kaplje mastilo (pečatira komade zaklona); na svakih `slam` s nacilja igrača (crvena meta na podu), pa udari:
// zgnječi zaklon i igrača ispod sebe i ostavi trag „ODUZETA FREKVENCIJA“. Ranjive su oči, samo dok je pečat podignut.
// Faza 2 (pola od `hp`): dva brža udarca zaredom (`drop2`, `stuck2`, `rise2`), meta i alarm kraće (`aim2`, dolazi brzinom `seek`).
// Olakšan 1. 11. 2026 (korisnik: „malo pretežak“): hp 30 → 24, oči šire za po piksel, meta i u fazi 2, `slam2` 3.2-4.2 → 4-5.
const PECAT={name:'Megakrkan Pečat', sub:'Gađaj oči dok je podignut! Kad nacilja - beži.', about:'džinovski pečat. Gađaj oči, samo dok je podignut; gde udari, zaklon nestaje.',
  scale:2, y:14, w:60, h:36, speed:34, speed2:50, hp:24, slam:[4.5,6], slam2:[4,5], aim:1.05, aim2:.5, drop:300, drop2:420, stuck:.7, stuck2:.4,
  rise:75, rise2:170, seek:240, ink:1.7, ink2:1.05, bSpeed:66, mark:8, pts:{hit:30, down:4000}};
// Bos nivoa 3 (poslednji): Megakrkan Ometač (sprajt 32×28, crta se 2× = 64×56). Četiri tanjira, ruše se redom odozdo nagore
// (`dishHp` svaki); tanjiri ispaljuju smetnje, a na svakih `jam` s „talas smetnji“ ugasi pojas ekrana (`jamWarn` upozorenje, pa `jamOn`).
// Faza 2 (pala oba donja tanjira): crvena lampica na vrhu se pali (`lampOn` s, pa ugasi `lampOff`) i dok svetli, kontrole kasne `lag` s.
const OMETAC={name:'Megakrkan Ometač', sub:'Tanjiri redom, odozdo nagore!', about:'antena na brdu. Ruši četiri tanjira redom, odozdo nagore; kad crvena lampica svetli, kontrole kasne.',
  scale:2, y:10, w:64, h:56, speed:18, speed2:28, dishHp:9, fire:1.35, fire2:.9, maxB:5, bSpeed:78,
  jam:[5,7], jam2:[3.4,4.4], jamWarn:.7, jamOn:1.4, jamOn2:1.8, jamW:56, lampOn:2.6, lampOff:[2.5,3.5], lag:.5,
  pts:{hit:30, dish:600, down:5000}};
const BOSSES={caci:BOSS, pecat:PECAT, ometac:OMETAC};

const MSG={
  title:'Brani etar. Signal se ne gasi.',
  over:'Signal ugašen. Na ovoj frekvenciji od sutra: rijaliti.',
  invaded:'Upali su u studio.',
  win:'Signal se ne gasi. UnderGRAND emituje dalje.',
  death:['Batinaši u holu!','Oduzeta frekvencija!','Prijava inspekciji!'],
  jeep:'Vozilo nepoznatog vlasnika!',
  sealed:'Zapečaćeno!',
  revoked:['ODUZETA','FREKVENCIJA'], // trag udarca Megakrkan Pečata
  copy:'Kopija!',
  reprise:'Repriza!',
  dish:'Tanjir pao!',
  lag:'Kontrole kasne!',
};
