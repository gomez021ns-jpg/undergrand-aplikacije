// Punkman — table, neprijatelji i zajedničke konstante.
// Tekstovi su na srpskom; engleski je u polju `en` (čita ga tx() iz js/i18n.js).
// ---------- BOARDS ----------
const BOARDS=[
 {short:'Podrum', name:'Podrum za probe', pellet:'pin', pelletName:'zihernadle', bonus:'guitar', bonusName:'Gitara sa tri žice', bonusPts:300, diff:'najlakša', song:'podrum',
  en:{short:'Basement', name:'Rehearsal basement', pelletName:'safety pins', bonusName:'Three-string guitar', diff:'easiest'},
  pSpeed:7.0, gSpeed:6.0, fright:8, release:[0,3,7,12], modes:[7,20,7,20,5,20,5,999], raid:[8,12],
  floor:'#161619', wall:'#2a2e33', edge:'#93a6b0', door:'#ff2d7a'},
 {short:'Klub', name:'Klub', pellet:'badge', pelletName:'bedževi', bonus:'jacket', bonusName:'Kožna jakna', bonusPts:700, diff:'srednja', song:'klub',
  en:{short:'Club', name:'Club', pelletName:'badges', bonusName:'Leather jacket', diff:'medium'},
  pSpeed:7.5, gSpeed:6.9, fright:6, release:[0,2,5,9], modes:[7,20,7,20,5,999], raid:[6,10],
  floor:'#140e1a', wall:'#2b1236', edge:'#ff2d7a', door:'#ffd400'},
 {short:'Grad', name:'Grad', pellet:'tape', pelletName:'kasete', bonus:'demo', bonusName:'Demo-snimak', bonusPts:1500, diff:'najteža', song:'grad',
  en:{short:'City', name:'City', pelletName:'cassettes', bonusName:'Demo tape', diff:'hardest'},
  pSpeed:8.0, gSpeed:7.7, fright:4, release:[0,1,3,6], modes:[5,25,5,25,3,999], raid:[4,8],
  floor:'#111214', wall:'#3b1d15', edge:'#ffb000', door:'#ff2d7a'},
];
const GHOSTS=[
 {id:'murija', name:'Murija', color:'#3b6cff', role:'Juri pravo na tebe. Bez pitanja.', scatter:[W-2,-3],
  catch:'Murija te privela zbog remećenja javnog reda i mira.', eaten:'MURIJA BEŽI',
  en:{name:'The cops', role:'Comes straight at you. No questions asked.', catch:'The cops took you in for disturbing the peace.', eaten:'COPS ON THE RUN'}},
 {id:'menadzer', name:'Menadžer izdavačke kuće', color:'#a3abb4', role:'Postavlja zasede, četiri polja ispred tebe.', scatter:[1,-3],
  catch:'Menadžer te uhvatio. Potpisao si ugovor na sedam albuma.', eaten:'UGOVOR PONIŠTEN',
  en:{name:'Record label manager', role:'Sets up ambushes, four tiles ahead of you.', catch:'The manager got you. You signed a seven-album deal.', eaten:'CONTRACT VOID'}},
 {id:'zvezda', name:'Pop zvezda iz rijalitija', color:'#ffc23d', role:'Nepredvidiva. Malo juri, malo pozira kamerama.', scatter:[W,H+1],
  catch:'Pop zvezda te uvukla u rijaliti. Kamere su svuda.', eaten:'ISPALA IZ RIJALITIJA',
  en:{name:'Reality-show pop star', role:'Unpredictable. Chases a bit, poses for the cameras a bit.', catch:'The pop star dragged you onto a reality show. Cameras everywhere.', eaten:'VOTED OFF THE SHOW'}},
 {id:'inspektor', name:'Komunalni inspektor', color:'#93a54c', role:'Luta bez cilja, pa iznenada krene u raciju.', scatter:[0,H+1],
  catch:'Komunalni inspektor: kazna za buku posle 22h.', eaten:'ŽALBA USVOJENA',
  en:{name:'City inspector', role:'Wanders aimlessly, then suddenly starts a raid.', catch:'City inspector: a fine for noise after 10 p.m.', eaten:'APPEAL GRANTED'}},
];

// Pozicije u kućici relativno na vrata (dx od leve kolone vrata). Murija počinje ispred vrata.
const HOUSE_SLOTS={murija:null, menadzer:.5, zvezda:-1.5, inspektor:2.5};

const DIRS={U:[0,-1],L:[-1,0],D:[0,1],R:[1,0]}, OPP={U:'D',D:'U',L:'R',R:'L'}, ORDER=['U','L','D','R'];
const ANG={R:0,D:Math.PI/2,L:Math.PI,U:-Math.PI/2};
const SKIN='#f3d3b5', HAWK='#ff2d7a';
const LIFE_EVERY=7000; // novi život na svakih 7.000 poena
