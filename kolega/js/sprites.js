// UnderGRAND E ne'š kolega!!! — pixel-art likovi, preneti 1:1 sa dizajn-table.
// Sprajt = niz redova; svako slovo je jedan piksel u boji iz PAL ('.' = prazno).
// Neprijatelji, igrač i džip imaju dva frejma [frejm0, frejm1] koji se smenjuju u ritmu koraka formacije.
// Bosovi se crtaju funkcijama megakrkanCaci(f), megakrkanPecat(f), megakrkanOmetac(f): vraćaju redove za frejm f (0 ili 1).
// U prvoj beti treba samo Megakrkan Ćaci; pečat i ometač su tu za nivoe 2 i 3.

const PAL = {K:'#111018',W:'#f1efe8',G:'#ffc93c',P:'#ff4fa3',M:'#8a1f2a',R:'#e63946',S:'#f1b98a',B:'#8a4b2a',Y:'#ffd23f',C:'#39d0ff',D:'#3a3f4a',L:'#9aa1ad',O:'#ff8a1f',N:'#3ddc84',V:'#8b3dff',U:'#1f4f8a'};

// Crta sprajt na canvas: rows = niz stringova, (x,y) = gornji levi ugao, s = veličina jednog piksela.
function drawSprite(c, rows, x, y, s) {
  for (let j = 0; j < rows.length; j++) {
    const r = rows[j];
    for (let i = 0; i < r.length; i++) {
      const col = PAL[r[i]];
      if (col) { c.fillStyle = col; c.fillRect(Math.round(x + i * s), Math.round(y + j * s), Math.ceil(s), Math.ceil(s)); }
    }
  }
}

// tv = Ćaci TV (red 1, 40 p), batinas = Batinaš u trenerci (red 2, 30 p), bot = Bot farma (red 3, 20 p),
// inspektor = Inspektor sa pečatom (red 4, 10 p), ometac = Ometač signala (red 5, 10 p),
// igrac = Odašiljač UnderGRAND-a, dzip = Crni džip bez tablica (leteći bonus).
const SPR = {
  tv: [[
    '..L......L..',
    '...L....L...',
    '....L..L....',
    'DDDDDDDDDDDD',
    'DWWWWWWWWWDD',
    'DWRRWWWRRWLD',
    'DWWWWWWWWWDD',
    'DWWKKKKKWWLD',
    'DWWWWWWWWWDD',
    'DDDDDDDDDDDD',
    '.D........D.',
    '............'
  ], [
    '..L......L..',
    '...L....L...',
    '....L..L....',
    'DDDDDDDDDDDD',
    'DRRRRWRRRRDD',
    'DRRRRWRRRRLD',
    'DRRRRWRRRRDD',
    'DRRRRRRRRRLD',
    'DRRRRWRRRRDD',
    'DDDDDDDDDDDD',
    '.D........D.',
    '............'
  ]],
  batinas: [[
    '...DDDDDD...',
    '..DDDDDDDD..',
    '..DDSSSSDD..',
    '..DSKSSKSD..',
    '..DSSSSSSD..',
    '..DDSRRSDD..',
    '.DDDDDDDDDD.',
    'SDWDDDDDDWDS',
    'SDWDDDDDDWDS',
    '..WDD..DDW..',
    '..DDD..DDD..',
    '..LL....LL..'
  ], [
    '...DDDDDD...',
    '..DDDDDDDD..',
    '..DDSSSSDD..',
    '..DSKSSKSD..',
    '..DSSSSSSD..',
    'S.DDSRRSDD.S',
    'SDDDDDDDDDDS',
    '.DWDDDDDDWD.',
    '.DWDDDDDDWD.',
    '..WDD..DDW..',
    '..DDD..DDD..',
    '.LL......LL.'
  ]],
  bot: [[
    '.....OO.....',
    '.....LL.....',
    '..LLLLLLLL..',
    '..LCCLLCCL..',
    '..LCCLLCCL..',
    '..LLLLLLLL..',
    '..LLWLWLWL..',
    '..LLLLLLLL..',
    '...L....L...',
    '...LL..LL...',
    '............',
    '............'
  ], [
    '.....RR.....',
    '.....LL.....',
    '..LLLLLLLL..',
    '..LRRLLRRL..',
    '..LRRLLRRL..',
    '..LLLLLLLL..',
    '..LWLWLWLL..',
    '..LLLLLLLL..',
    '...L....L...',
    '..LL....LL..',
    '............',
    '............'
  ]],
  inspektor: [[
    '...DDDDDD...',
    '.DDDDDDDDDD.',
    '...SSSSSS...',
    '...WKSSKW...',
    '...SSSSSS...',
    '....SDDS....',
    '..LLLLLLLL..',
    '.SLLLLLLLLG.',
    '.SLLLLLLLLG.',
    '..LLL..LGGG.',
    '..DD....RRR.',
    '............'
  ], [
    '...DDDDDD...',
    '.DDDDDDDDDD.',
    '...SSSSSS...',
    '...WKSSKW...',
    '...SSSSSS...',
    '....SDDS....',
    '..LLLLLLLL..',
    '.SLLLLLLLLS.',
    '.SLLLLLLLL..',
    '..LLL..LL.G.',
    '..DD.....GGG',
    '.........RRR'
  ]],
  ometac: [[
    '.L........L.',
    '.L........L.',
    '.L..P..P..L.',
    '.LP..PP..PL.',
    'DDDDDDDDDDDD',
    'DGDDDDDDDDRD',
    'DDLLLLLLLLDD',
    'DDLKLKLKLLDD',
    'DDLLLLLLLLDD',
    'DDDDDDDDDDDD',
    '..D......D..',
    '............'
  ], [
    'PL........LP',
    '.L.P....P.L.',
    '.L..P..P..L.',
    '.L...PP...L.',
    'DDDDDDDDDDDD',
    'DRDDDDDDDDGD',
    'DDLLLLLLLLDD',
    'DDLLKLKLKLDD',
    'DDLLLLLLLLDD',
    'DDDDDDDDDDDD',
    '..D......D..',
    '............'
  ]],
  igrac: [[
    '.....RR.....',
    '.....LL.....',
    '....L..L....',
    '....LLLL....',
    '...L.LL.L...',
    '...LLLLLL...',
    '..L..LL..L..',
    '.RRRRRRRRRR.',
    'RRWWRRRRWWRR',
    'RRRRRRRRRRRR'
  ], [
    '..C..OO..C..',
    '.C...LL...C.',
    '....L..L....',
    '....LLLL....',
    '...L.LL.L...',
    '...LLLLLL...',
    '..L..LL..L..',
    '.RRRRRRRRRR.',
    'RRWWRRRRWWRR',
    'RRRRRRRRRRRR'
  ]],
  dzip: [[
    '...DDDDDDDD.....',
    '..DDCCDDCCDD....',
    '.DDDCCDDCCDDDDD.',
    'DDDDDDDDDDDDDDDD',
    'LDDDDDDDDDDDDDOD',
    'DDDDDDDDDDDDDDDD',
    '..LLL.....LLL...',
    '..LKL.....LKL...'
  ], [
    '...DDDDDDDD.....',
    '..DDCCDDCCDD....',
    '.DDDCCDDCCDDDDD.',
    'DDDDDDDDDDDDDDDD',
    'LDDDDDDDDDDDDDWD',
    'DDDDDDDDDDDDDDDD',
    '..LKL.....LKL...',
    '..LLL.....LLL...'
  ]]
};

// Power-upovi (jedan frejm): pistaljka, solidarnost, demanti.
const PW = {
  pistaljka: [
    '......W.W...',
    '.GGGGGG.W.W.',
    'GGGGGGGG....',
    'GGKGGGGGGGG.',
    'GGGGGGGGGGG.',
    '.GGGG.......',
    '..GG........',
    '............'
  ],
  solidarnost: [
    '.Y...O...C..',
    '.S...S...S..',
    'SSSSSSSSSSS.',
    '.R...V...N..',
    '.R...V...N..',
    'D.D.D.D.D.D.',
    '............'
  ],
  demanti: [
    'WWWWWWW..',
    'WLLLLLW..',
    'WWWWWWW..',
    'WLLLLNW..',
    'WWWWNNW..',
    'WNWNNWW..',
    'WNNNWWW..',
    'WWNWWWW..',
    'WWWWWWW..',
    '.........'
  ]
};

// ---------- BOSOVI (crtaju se kodom) ----------
function grid(w, h) { let g = []; for (let y = 0; y < h; y++) { let row = []; for (let x = 0; x < w; x++) row.push('.'); g.push(row); } return g; }
function rect(g, x, y, w, h, c) {
  for (let j = y; j < y + h; j++) {
    if (j < 0 || j >= g.length) continue;
    for (let i = x; i < x + w; i++) { if (i < 0 || i >= g[0].length) continue; g[j][i] = c; }
  }
}
function px(g, x, y, c) { rect(g, x, y, 1, 1, c); }
function toRows(g) { return g.map(function (r) { return r.join(''); }); }

function megakrkanCaci(f) {
  let g = grid(34, 24);
  for (let i = 0; i < 5; i++) { px(g, 12 + i, i, 'L'); px(g, 22 - i, i, 'L'); }
  px(g, 12, 0, f ? 'R' : 'O'); px(g, 22, 0, f ? 'O' : 'R');
  rect(g, 0, 5, 34, 17, 'D');
  rect(g, 2, 7, 25, 13, 'U');
  rect(g, 28, 7, 4, 13, 'K');
  rect(g, 29, 8, 2, 2, 'L'); rect(g, 29, 12, 2, 2, 'L');
  for (let gy = 16; gy < 20; gy += 2) rect(g, 28, gy, 4, 1, 'L');
  rect(g, 3, 8, 5, 2, f ? 'R' : 'M');
  rect(g, 10, 7, 8, 2, 'K');
  rect(g, 10, 9, 8, 6, 'S');
  rect(g, 11, 9, 2, 1, 'K'); rect(g, 15, 9, 2, 1, 'K');
  rect(g, 11, 10, 2, 1, 'W'); px(g, 12, 10, 'K'); rect(g, 15, 10, 2, 1, 'W'); px(g, 15, 10, 'K');
  if (f) { rect(g, 12, 12, 4, 2, 'K'); rect(g, 13, 13, 2, 1, 'R'); } else { rect(g, 12, 13, 4, 1, 'K'); }
  rect(g, 7, 15, 14, 2, 'D');
  px(g, 12, 15, 'W'); px(g, 15, 15, 'W');
  rect(g, 13, 15, 2, 2, 'R');
  rect(g, 2, 17, 25, 3, 'R');
  for (let x = 2; x < 27; x++) { if ((x + (f ? 2 : 0)) % 4 < 2) px(g, x, 18, 'W'); }
  rect(g, 6, 22, 3, 2, 'D'); rect(g, 25, 22, 3, 2, 'D');
  return toRows(g);
}

function megakrkanPecat(f) {
  let g = grid(30, 26);
  let off = f ? 7 : 0;
  rect(g, 0, 25, 30, 1, 'L');
  if (!f) {
    rect(g, 5, 21, 20, 1, 'R'); rect(g, 5, 24, 20, 1, 'R'); rect(g, 5, 21, 1, 4, 'R'); rect(g, 24, 21, 1, 4, 'R');
    for (let x1 = 7; x1 < 23; x1 += 2) px(g, x1, 22, 'R');
    for (let x2 = 8; x2 < 23; x2 += 3) px(g, x2, 23, 'R');
  }
  rect(g, 11, off, 8, 4, 'B'); rect(g, 12, off, 2, 1, 'O');
  rect(g, 13, 4 + off, 4, 6, 'B');
  rect(g, 4, 10 + off, 22, 5, 'G'); rect(g, 4, 10 + off, 22, 1, 'O');
  rect(g, 8, 11 + off, 4, 2, 'W'); px(g, 10, 12 + off, 'K'); px(g, 11, 12 + off, 'K');
  rect(g, 18, 11 + off, 4, 2, 'W'); px(g, 18, 12 + off, 'K'); px(g, 19, 12 + off, 'K');
  rect(g, 12, 13 + off, 6, 1, 'K');
  rect(g, 5, 15 + off, 20, 3, 'R');
  for (let x3 = 5; x3 < 25; x3++) { if (x3 % 3 === 0) px(g, x3, 16 + off, 'M'); }
  if (f) {
    [[1, 20], [2, 21], [0, 22], [28, 20], [27, 21], [29, 22]].forEach(function (p) { px(g, p[0], p[1], 'W'); });
    [[3, 23], [26, 23], [1, 24], [28, 24]].forEach(function (p) { px(g, p[0], p[1], 'L'); });
  }
  return toRows(g);
}

function megakrkanOmetac(f) {
  let g = grid(32, 28);
  rect(g, 15, 0, 2, 6, 'L');
  px(g, 15, 0, f ? 'R' : 'M'); px(g, 16, 0, f ? 'R' : 'M');
  for (let y = 6; y < 26; y++) {
    let w = 1 + Math.floor((y - 6) / 3);
    let xl = 15 - w, xr = 16 + w;
    px(g, xl, y, 'L'); px(g, xr, y, 'L');
    if ((y - 6) % 4 === 0) rect(g, xl, y, xr - xl + 1, 1, 'D');
    let k = (y - 6) % 4;
    px(g, xl + 1 + k, y, 'D'); px(g, xr - 1 - k, y, 'D');
  }
  function dish(cx, cy, dir, armTo) {
    px(g, cx, cy, 'W'); px(g, cx + dir, cy + 1, 'W'); px(g, cx + dir, cy + 2, 'W'); px(g, cx, cy + 3, 'W');
    let a = cx - dir, b = armTo;
    let lo = Math.min(a, b), hi = Math.max(a, b);
    rect(g, lo, cy + 1, hi - lo + 1, 1, 'L');
    for (let i = 0; i < 4; i++) {
      let wx = cx + dir * (2 + i);
      let wy = cy + ((i + f) % 2 === 0 ? 1 : 2);
      px(g, wx, wy, 'P');
      px(g, cx + dir * (2 + i), cy + ((i + f) % 2 === 0 ? 2 : 1) + (i > 1 ? 0 : 0), i === 3 ? 'C' : 'P');
    }
  }
  dish(10, 8, -1, 13);
  dish(21, 8, 1, 18);
  dish(7, 16, -1, 10);
  dish(24, 16, 1, 21);
  rect(g, 4, 26, 24, 2, 'D');
  for (let x = 4; x < 28; x++) { if (Math.floor((x + f) / 2) % 2 === 0) px(g, x, 27, 'O'); }
  return toRows(g);
}
