// UnderGRAND — Potera do Horgoša: begunci (SVI IZMIŠLJENI, karikature po funkcijama, ne po osobama)
// Nikada prava imena, lica, stranke ni tablice. Tablica uvek "? ? ?".
// Ton (korisnik 13. 11. 2026): suva satira kroz zvaničan jezik - policijske šifre predmeta, dosije sa funkcijom i
// izmišljenim inicijalima, izgovori kao saopštenja za javnost. Bez igre reči na prezimena.
// sifra: kako ga zove centrala ("predmet ANEKS"); ime: kako piše u igri; inicijali: iz dosijea (izmišljeni)
// portret: opis za pikselasti portret 24x24 (crta se kodom kao portret dispečerke u maketi)
// dzip: boja karoserije i detalj; predmeti: šta izbacuje kroz prozor tokom potere
// izgovori: jedan se nasumično bira u sceni hapšenja
// razglednica: ako pobegne (vreme isteklo)

window.UG_BEGUNCI = [
  {
    deonica: 1,
    sifra: "ANEKS",
    ime: "Predmet ANEKS",
    inicijali: "D. F.",
    uloga: "v.d. direktora JP \"Putevi i kanali\", šesta godina u v.d. statusu",
    portret: "proseda kosa začešljana preko ćele, debele naočare, sivo odelo, kravata sa šarom",
    dzip: { boja: "#141418", detalj: "crni, zatamnjena stakla, rotacija na krovu koju nema pravo da ima" },
    predmeti: ["fascikla", "fascikla", "kofer"],
    brifing: "Centrala Jedinici 7. Predmet ANEKS: v.d. direktora koji je potpisao jedanaesti aneks ugovora o izgradnji, pa krenuo na sever. Revizija je u zgradi, on nije. Prijem.",
    izgovori: [
      "Ovo je bio radni sastanak u pokretu.",
      "Dvanaesti aneks je spreman. Treba mi samo sto.",
      "Ja sam samo potpisivao. Čitali su drugi."
    ],
    razglednica: { grad: "Beč", poruka: "Advokat kaže da sve ide po planu. Plan je bio da odem." }
  },
  {
    deonica: 2,
    sifra: "SAVET",
    ime: "Predmet SAVET",
    inicijali: "S. Z.",
    uloga: "posebni savetnik bez resora, ugovor o delu na neodređeno",
    portret: "zalizana kosa, preplanuo, sunčane naočare na čelu, otkopčana košulja, zlatni lanac",
    dzip: { boja: "#e8e8ec", detalj: "beli, sa zlatnim felnama i natpisom \"SAVETUJEM\" na zadnjem staklu" },
    predmeti: ["kesa_novca", "kofer", "kesa_novca"],
    brifing: "Predmet SAVET: posebni savetnik, honorar po savetu, nijedan savet nije napisan. Poslednji je, prema svedocima, glasio \"kreni odmah\". Ne ulazite u raspravu sa njim. Prijem.",
    izgovori: [
      "Ne komentarišem tokove novca dok traje vožnja.",
      "Moj savet je da me pustite. Taj je besplatan.",
      "Ovo nije bekstvo. Ovo je strateško povlačenje."
    ],
    razglednica: { grad: "Dubai", poruka: "Ovde nema revizije. Ni kiše. Ni pitanja." }
  },
  {
    deonica: 3,
    sifra: "KOFERI",
    ime: "Predmet KOFERI",
    inicijali: "M. B.",
    uloga: "ministar bez portfelja, sa četiri kofera",
    portret: "okrugao, rumen, mali brkovi, frizura kao kaciga, tamnoplavo odelo, značka na reveru bez simbola",
    dzip: { boja: "#1a1a20", detalj: "crni, krovni nosač prepun kofera vezanih kanapom" },
    predmeti: ["kofer", "kofer", "kofer", "kofer"],
    brifing: "Jedinica 7, predmet KOFERI. Ministar bez portfelja, na krovu džipa četiri kofera vezana kanapom. Prema operativnim podacima, u njima su lične stvari i jedna studija izvodljivosti. Prijem.",
    izgovori: [
      "U ovom vozilu sam samo putnik. I vlasnik. Ali pre svega putnik.",
      "Koferi su lični. Sadržaj je poverljiv.",
      "Krenuo sam na službeni put. Službeno sam zaboravio da javim."
    ],
    razglednica: { grad: "Carigrad", poruka: "Koferi su stigli pre mene. Sve je po proceduri." }
  },
  {
    deonica: 4,
    sifra: "NE ZNAM",
    ime: "Predmet NE ZNAM",
    inicijali: "G. N.",
    uloga: "gradonačelnik u tehničkom mandatu",
    portret: "uplašen pogled, kosa na razdeljak, šal oko vrata, jakna preko odela, mobilni telefon na uvetu",
    dzip: { boja: "#a8acb4", detalj: "srebrni, sa diplomatskim tablicama koje nisu njegove" },
    predmeti: ["fascikla", "kesa_novca", "kofer", "fascikla"],
    brifing: "Poslednji, Jedinice 7. Predmet NE ZNAM: gradonačelnik koji nije znao ni za jedan ugovor koji je potpisao. Ne zna ni čiji je džip. Do granice je malo. Prijem.",
    izgovori: [
      "Sačekajte zvanični izveštaj nadležnih. Ja ću ga napisati.",
      "Prvi put čujem za ovaj kofer. I za ovu fasciklu.",
      "Nisam znao da je ovo granica. Nisam znao ni da je ovo džip."
    ],
    razglednica: { grad: "Budimpešta", poruka: "Ne znam kako sam stigao. Ali stigao sam." }
  }
];

// Predmeti koje džip izbacuje: efekat na igrača ako ih udari
window.UG_PREDMETI = {
  kofer:      { naziv: "KOFER",       usporenje: 40, poeni: 500,  izgled: "smeđi kofer sa kaišem, okreće se u letu" },
  kesa_novca: { naziv: "KESA",        usporenje: 20, poeni: 1000, izgled: "platnena kesa, pri udarcu rasipa zelene novčanice" },
  fascikla:   { naziv: "POVERLJIVO",  usporenje: 10, poeni: 300,  izgled: "žuta fascikla, papiri se razleću po vetrobranu na 1 s" }
};
