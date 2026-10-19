// Istorija razvoja stare (Python) aplikacije, 0.1–2.6.0: sadržaj version_history.txt (prozor HISTORY).
// Ugrađeno kao tekst jer stranica otvorena duplim klikom (file://) ne može da učita .txt fajl.
window.UG_ISTORIJA = `UNDERGRAND STATISTICS
ISTORIJA RAZVOJA APLIKACIJE
========================================

Ovaj dokument belezi sta je radjeno u svakoj razvojnoj verziji aplikacije
UnderGRAND Statistics, redom od prve radne verzije do trenutne verzije.


VERZIJA 0.1
========================================
Prva radna verzija aplikacije.

Uradjeno:
- Napravljen osnovni Windows GUI za statistiku posecenosti.
- Dnevni unos broja posetilaca.
- Automatsko cuvanje podataka u lokalni JSON fajl: undergrand_stats.json.
- Automatski prikaz datuma.
- Nedeljni pregled od ponedeljka do nedelje.
- Automatski obracun ukupnog broja poseta za tekucu nedelju.
- Automatski obracun dnevnog proseka.
- Prikaz najposecenijeg dana.
- Prikaz najmanje posecenog dana.
- Mogucnost ispravke prethodnog unosa dvoklikom na dan.
- Podaci se cuvaju lokalno, bez potrebe za internetom.

Napomena:
Ovo je bila osnovna funkcionalna verzija kojom je provereno da unos,
cuvanje i nedeljni obracun rade.


VERZIJA 0.2
========================================
Prosirena statisticka verzija.

Dodato:
- Grafikon posecenosti po danima u toku nedelje.
- Istorija svih sacuvanih nedelja.
- Poredjenje tekuce nedelje sa prethodnom nedeljom.
- Automatski izracun procenta rasta/pada.
- Mesecni pregled.
- Mesecni zbir poseta.
- Mesecni dnevni prosek.
- Broj dana za koje je podatak unet.
- Mesecni grafikon.
- Izvoz kompletne statistike u CSV fajl.
- Generisanje nedeljnog izvestaja u TXT formatu.
- Prosiren i pregledniji interfejs.
- Tabovi: OVA NEDELJA, ISTORIJA NEDELJA i MESECNI PREGLED.


VERZIJA 0.3
========================================
Ubacivanje postojece istorije posecenosti.

U bazu je direktno ubaceno 49 dana podataka,
od 27.07.2026. do 13.09.2026.

Ubacene nedelje:

27.07.2026:
Pon 252 | Uto 260 | Sre 455 | Cet 344 | Pet 331 | Sub 254 | Ned 350

03.08.2026:
Pon 426 | Uto 319 | Sre 406 | Cet 258 | Pet 344 | Sub 289 | Ned 282

10.08.2026:
Pon 420 | Uto 388 | Sre 351 | Cet 308 | Pet 414 | Sub 427 | Ned 472

17.08.2026:
Pon 567 | Uto 426 | Sre 524 | Cet 378 | Pet 433 | Sub 402 | Ned 293

24.08.2026:
Pon 388 | Uto 522 | Sre 479 | Cet 561 | Pet 413 | Sub 441 | Ned 429

31.08.2026:
Pon 393 | Uto 409 | Sre 460 | Cet 367 | Pet 377 | Sub 354 | Ned 373

07.09.2026:
Pon 442 | Uto 440 | Sre 417 | Cet 332 | Pet 369 | Sub 318 | Ned 306

Ukupan broj poseta u tom periodu: 18.963
Ukupan broj dana: 49
Prosek: 387 poseta dnevno


VERZIJA 0.4
========================================
Prosirena verzija sa uvozom i pripremom za Windows EXE.

Dodato:
- UVEZI CSV funkcija.
- CSV format za masovni unos dnevnih podataka.
- CSV SABLON funkcija.
- IZVEZI CSV funkcija.
- NEDELJNI IZVESTAJ funkcija.
- Dugmad za pokretanje izvoza i uvoza iz glavnog interfejsa.
- Skripta Pokreni_UnderGRAND.bat.
- Skripta Napravi_EXE.bat.
- Priprema za samostalni Windows .EXE program pomocu PyInstaller-a.
- Dokumentacija README.txt.

Cilj verzije:
Da korisnik ne mora rucno da unosi veliki broj istorijskih podataka i da
se aplikacija pripremi za rad kao pravi Windows program.


VERZIJA 0.5
========================================
Ispravka ucitavanja JSON baze kod Windows EXE verzije.

Problem:
Kod PyInstaller one-file EXE verzije program moze da se pokrene iz
privremenog direktorijuma, zbog cega je prethodna verzija mogla da trazi
undergrand_stats.json na pogresnom mestu i prikaze praznu bazu.

Uradjeno:
- Promenjen nacin odredjivanja lokacije aplikacije.
- EXE verzija sada trazi undergrand_stats.json pored samog EXE fajla.
- Kod pokretanja iz .py fajla koristi folder u kome se nalazi Python fajl.
- Dodata provera ispravnosti JSON baze.
- Ako JSON ne moze da se ucita, prikazuje se greska umesto prazne baze.
- Dodat prikaz lokacije baze na dnu programa.
- Definisano pravilo da EXE i JSON baza moraju biti u istom folderu.


VERZIJA 0.6
========================================
Ispravka greske pri pokretanju programa.

Problem:
Program je pri startovanju javljao:
NameError: name 'db_status_var' is not defined

Uzrok:
Promenljiva db_status_var bila je koriscena u interfejsu pre nego sto je
bila kreirana.

Uradjeno:
- Ispravljen redosled kreiranja db_status_var.
- Program sada prvo kreira promenljivu, a zatim je prikazuje u interfejsu.
- Proverena Python sintaksa programa.
- Zadrzana funkcija prikaza lokacije JSON baze.
- Zadrzano ucitavanje baze iz foldera programa.
- Zadrzana istorija od 27.07.2026. do 13.09.2026.
- Zadrzano 49 dana / 18.963 posete.


VERZIJA 0.7
========================================
Poboljsanje prozora za izmenu dnevnog podatka.

Zahtev:
Kada se dvoklikne na dan radi izmene podatka, prozor "Izmena podatka"
treba da bude na sredini ekrana/programa, bez obzira na velicinu glavnog
prozora.

Uradjeno:
- Napravljen sistem za centriranje pomocnog prozora.
- Prozor "Izmena podatka" centrira se u odnosu na glavni UnderGRAND prozor.
- Centriranje radi u normalnom i maximized prikazu.
- Prozor je podesen kao modalni.
- Fokus ostaje na prozoru za izmenu dok se izmena ne sacuva ili prozor zatvori.
- Prozor za izmenu ostaje vezan za glavni prozor aplikacije.


VERZIJA 0.8
========================================
Poboljsanje nacina pokretanja aplikacije.

Zahtev:
Program pri startovanju treba odmah da bude u full screen/uvelicanom prikazu.

Uradjeno:
- Aplikacija se pri pokretanju automatski otvara kao Windows maximized prozor.
- Prozor odmah zauzima raspolozivu povrsinu ekrana.
- Naslovna traka i standardna Windows dugmad ostaju dostupni.
- Funkcionalnost aplikacije nije menjana.


VERZIJA 0.9
========================================
Zastita podataka i automatski backup.

Uradjeno:
- Automatsko pravljenje vremenski oznacene backup kopije JSON baze nakon
  svakog uspesnog cuvanja podataka.
- Backup kopije se cuvaju u folderu backups.
- Cuvaju se poslednjih 30 backup kopija.
- Starije backup kopije se automatski uklanjaju.
- Dodato dugme BACKUP za rucno pravljenje rezervne kopije.
- Dodato dugme FOLDER BACKUPA za brzo otvaranje foldera sa kopijama.
- Backup greska ne zaustavlja rad glavne aplikacije.


VERZIJA 0.9.1
========================================
Poboljsan prikaz alata za backup.

Uradjeno:
- Backup dugmad su izdvojena u poseban panel ALATI.
- Dugmad BACKUP i FOLDER BACKUPA su jasno vidljiva.
- Zadrzane su funkcije UVEZI CSV, CSV SABLON, IZVEZI CSV i NEDELJNI IZVESTAJ.
- Dodata oznaka verzije 0.9.1 u naslov aplikacije.
- Funkcionalnost backup sistema iz v0.9 je zadrzana.

Napomena:
Za novu verziju programa potrebno je pokrenuti Pokreni_UnderGRAND.bat
ili napraviti novi EXE preko Napravi_EXE.bat.


VERZIJA 0.9.2
========================================
Vizuelno poboljsanje dugmadi.

Uradjeno:
- Standardna pravougaona dugmad u panelu ALATI zamenjena zaobljenim dugmadima.
- Dodat diskretan hover efekat.
- Dugmad su vizuelno odvojena i laksa za koriscenje.
- Funkcionalnost svih postojecih dugmadi ostala je ista.
- Dodata oznaka verzije 0.9.2.


VERZIJA 0.9.3
========================================
Estetsko sredjivanje panela sa alatima.

Uradjeno:
- Panel ALATI organizovan je u tri grupe:
  PODACI / IZVESTAJI / ZASTITA PODATAKA
- Uredjeni razmaci i vizuelna hijerarhija dugmadi.
- Dodat suptilan efekat senke.
- Poboljsan hover efekat.
- Istaknuta najvaznija dugmad akcentnom bojom.
- Zadrzan tamni UnderGRAND izgled sa zutom kao akcentnom bojom.
- Sadrzaj i funkcionalnost dugmadi nisu menjani.
- Dodata oznaka verzije 0.9.3.


VERZIJA 0.9.4
========================================
Novo vizuelno sredjivanje dugmadi.

Zahtev:
Dugmad treba da budu u obliku zaobljenih "pill" kontrola.

Uradjeno:
- Dugmad imaju izrazenije zaobljene krajeve.
- Povecana je visina dugmadi radi modernijeg izgleda.
- Dodata suptilna senka.
- Poboljsan razmak izmedju dugmadi.
- Zadrzan tamni UnderGRAND stil i zuta akcentna boja.
- Hover efekat menja dugme u zutu boju.
- Funkcionalnost dugmadi nije menjana.


VERZIJA 0.9.5
========================================
Korekcija izgleda pill dugmadi.

Problem:
U v0.9.4 zaobljenje je bilo izvedeno pomocu glatkog poligona, sto je u
Tkinter Canvas-u na pojedinim velicinama davalo nepravilan izgled.

Uradjeno:
- Dugme sada koristi kapsula/pill oblik napravljen od pravougaonika i dva kruga.
- Krajevi su ravni i pravilno zaobljeni.
- Povecana je visina dugmadi na 42 px.
- Podesene su sire dimenzije radi boljeg citanja teksta.
- Zadrzana suptilna senka.
- Zadrzan hover efekat.
- Zadrzana zuto-crna UnderGRAND estetika.
- Funkcionalnost nije menjana.


VERZIJA 1.0.0
========================================
Prva funkcionalna verzija aplikacije.

- Rucni dnevni unos poseta.
- Osnovni nedeljni pregled.


VERZIJA 1.1.x
========================================
Istorija i pregled statistike.

- Dodata istorija nedelja.
- Dodat mesecni pregled.
- Uredjen prikaz tabela i statistickih kartica.


VERZIJA 1.2.x
========================================
Rad sa podacima i bazom.

- Dodat CSV uvoz i izvoz.
- Dodat CSV sablon za unos podataka.
- Poboljsan rad sa postojecim podacima.


VERZIJA 1.3.x
========================================
Dashboard i vizuelna organizacija.

- Uredjen dashboard i raspored elemenata.
- Dodat nedeljni izvestaj.
- Poboljsan vizuelni identitet UnderGRAND Statistics.


VERZIJA 1.4.x
========================================
Backup i zastita podataka.

- Dodate zastitne kopije baze.
- Automatsko cuvanje do 30 poslednjih backup-a.
- Dodat pristup folderu backup-a.


VERZIJA 1.5.x
========================================
Kompatibilnost i stabilnost.

- Uvedena kompatibilnost sa starijom bazom podataka.
- Poboljsana stabilnost ucitavanja i cuvanja podataka.


VERZIJA 1.6.x
========================================
Uvodjenje Zeno statistike.

- Uvedena Zeno statistika.
- Dodat uvoz Zeno nedeljnog e-maila.
- Dodat uvoz Zeno Google Takeout ZIP/MBOX arhive.
- Dodate Users, Sessions, Listening Time i prosečno vreme sesije.
- Dodato poredjenje sa prethodnim Zeno izvestajem.


VERZIJA 1.7.0
========================================
Zeno dobija zaseban pregled.

- Zeno statistika dobija zaseban tab.
- Dodata istorija Zeno nedeljnih izvestaja.
- Uredjene kartice i tabela za pregled Zeno podataka.


VERZIJA 1.7.5 BETA
========================================
Sredjivanje glavnog interfejsa i istorije.

- Uredjen header i toolbar.
- Dodat HISTORY prozor.
- Uredjen Trend nedelje.
- Ujednacene tabele i kartice.
- Zeno datum u prikazu predstavlja datum samog maila.


VERZIJA 1.7.6 BETA
========================================
CSV izvoz i standardizacija.

- CSV IZVOZ sada obuhvata statistiku sajta i Zeno statistiku.
- Zeno redovi se direktno izvoze iz sacuvanih Zeno podataka.
- Datum Zeno reda u CSV-u je datum samog Zeno maila.
- Ako nema Zeno podataka, izvoz to jasno prijavljuje.
- Naziv radne aplikacije/fajla standardizovan je na undergrand_statistic.
- Verzija se prikazuje pri pokretanju programa i u HISTORY prozoru.


VERZIJA 1.7.7 BETA
========================================
Interaktivna istorija nedelja i programska ikonica.

- Istorija nedelja je sada interaktivna.
- Klik na bilo koju nedelju prikazuje ispod nje posete po danima.
- Grafikon se automatski menja prema izabranoj nedelji.
- Dodat je UG icon program za naslov, taskbar i EXE.
- Verzija se prikazuje pri pokretanju programa i u HISTORY prozoru.


VERZIJA 1.7.8 BETA
========================================
Doradjivanje istorije, grafikona i vizuelnog identiteta.

- Doradjena interaktivna istorija nedelja.
- Dodati detalji po danima za izabranu nedelju.
- Grafikon se prilagodjava izabranoj nedelji.
- CSV izvoz obuhvata statistiku sajta i Zeno statistiku.
- Zeno datum u CSV izvozu predstavlja datum samog Zeno maila.
- Uvedena puna imena dana u prikazu.
- UG ikonica programa zadrzana je kao deo vizuelnog identiteta.


VERZIJA 1.7.9 BETA
========================================
Ispravka ucitavanja assets fajlova u Windows EXE verziji.

- Ispravljeno ucitavanje assets fajlova u zavrsnom EXE programu.
- Kompletan assets folder kopira se u dist prilikom build procesa.
- Dodata provera postojanja logo i ICO fajlova u finalnom dist folderu.
- Dodat fallback za PyInstaller _MEIPASS putanju.
- Verzija se prikazuje pri pokretanju programa i u HISTORY prozoru.


VERZIJA 2.0 FINAL
========================================
Veliko prosirenje Zeno statistike.

- Zeno statistika organizovana je u zaseban tab.
- Uveden pregled ZENO 4 NEDELJE kroz blokove od 28 dana.
- Za svaku nedelju prikazuju se Users, Sessions i Listening.
- Dodat grafikon Zeno statistike.
- Dodato poredjenje sa prethodnim 28-dnevnim periodom.
- Dodat CSV izvoz Zeno podataka.
- Omoguceno spajanje i cuvanje istorijskih Zeno podataka.
- Uvedena zastita od dupliranja vec sacuvanih podataka.
- Statistika nije vezana za kalendarski mesec, vec za definisane 28-dnevne periode.


VERZIJA 2.0.1 FINAL
========================================
Sredjivanje Zeno prikaza, tabela i grafikona.

- Ispravljen CSV problem sa newline karakterom.
- USERS, SESSIONS i SLUSANJE izdvojeni su kao posebna dugmad/akcije.
- Uklonjeni nepotrebni crni QLabel blokovi.
- Uklonjen nepotreban/dead CSS.
- Uvedeni naizmenicni redovi u tabelama.
- Dodate akcentne linije i uredjeniji headeri tabela.
- Dodati zaobljeni headeri i hover efekti tabela.
- Doradjeni grafikoni i njihovi gradijenti.
- Uredjeni razmaci i ukupna vizuelna hijerarhija.
- Najnoviji undergrand_statistic.py postavljen je kao razvojna osnova za dalje verzije.


VERZIJA 2.0.2 FINAL
========================================
Stabilizacija Zeno parsera i zastita baze.

- Zeno parser sada prihvata podatke za 2026. godinu i naredne godine.
- Azurirane poruke i provere vezane za datum Zeno poruke.
- Dodata potvrda prilikom restore backup baze.
- Pre restore postupka automatski se pravi nova backup kopija postojece baze.
- Greske se zapisuju u undergrand_errors.log.
- Prvi start bez postojece JSON baze vise ne izaziva gresku.
- Greske pri pravljenju backup kopije zapisuju se u log.
- Verzija je usmerena na logiku, stabilnost i bezbednije rukovanje podacima.


VERZIJA 2.1.0
========================================
Teme i novi raspored headera.

Header:
- Verzija v2.1.0 prikazana je uz naslov STATISTICS kao mala, diskretna oznaka.
- Desna strana headera sada sadrzi samo dve glavne akcije: TEMA i HISTORY.

Sistem tema:
- Dodate su tri kompletne teme:
  Klasika - zuto-crna
  Premium - zelena/zlatna
  Hladna - plavo/tirkizna
- Padajuci meni TEMA omogucava promenu izgleda programa u toku rada, bez restarta.
- Izabrana tema se cuva u JSON bazi i automatski ucitava pri sledecem pokretanju programa.
- Tematske boje primenjuju se i na rucno iscrtane grafikone, ukljucujuci BarChart i Zeno grafikon, a ne samo na interfejs.

Vizuelni identitet:
- Program koristi standardni UnderGRAND logo iz assets/undergrand_logo.png.
- Ikona aplikacije koristi assets/undergrand_statistic.ico.


VERZIJA 2.1.5
========================================
Stabilnost, zastita podataka i ispravke Zeno obrade.

Zastita podataka:
- Ako se JSON baza ne moze procitati, program je vise ne zamenjuje praznom bazom.
  Pokvareni fajl se cuva pod imenom undergrand_stats.json.corrupt-DATUM-VREME,
  a podaci se vracaju iz najnovijeg ispravnog backupa, uz poruku pri pokretanju.
- Jedan neispravan unos u bazi (pogresan datum ili vrednost) se preskace i
  belezi u log, umesto da se odbaci cela baza.
- Nova pravila za backup: cuva se poslednjih 10 kopija i najnovija kopija za
  svaki od poslednjih 30 dana (ranije samo poslednjih 30 kopija, koje su se
  brzo trosile). Promena teme vise ne pravi backup kopiju.
- Vracanje backupa (VRATI JSON): izabrani fajl se prvo proverava. Ako trenutno
  stanje ne moze da se sacuva kao backup, vracanje se ne izvrsava. Ako upis ne
  uspe, sve se vraca na prethodno stanje.
- Cuvanje podataka: ako upis na disk ne uspe, izmena se ponistava u programu i
  korisnik dobija poruku, pa prikaz uvek odgovara stvarnom stanju baze.
- Neocekivane greske se upisuju u undergrand_errors.log i prikazuju korisniku.

Zeno obrada:
- Parser cita i brojeve sa vise separatora hiljada (npr. 1,234,567), mailove u
  HTML formatu i mailove sa nepoznatim charsetom.
- Ako postoji vise izvestaja za istu nedelju, uvozi se kasnije poslat mail.
- Uvoz arhive ima prozor sa napretkom i dugmetom PREKINI.
- Ispravljeno brisanje privremenog foldera posle uvoza ZIP arhive na Windowsu.
- Poruke koje nije moguce obraditi se preskacu, prijavljuju i zapisuju u log.
- ZENO 4 NEDELJE: izvestaji se grupisu po obracunskoj nedelji (ponedeljak), a
  promena u odnosu na prethodni period poredi proseke po izvestaju. Nepotpun
  period (manje od 4 izvestaja) oznacen je kao npr. "2 od 4" i vise ne izgleda
  kao pad. Postojeci podaci se sada grupisu po nedelji, pa se granice perioda
  mogu razlikovati od prethodne verzije.
- Prosecan USERS vise se ne prikazuje kao 6.161.9, vec kao 6.161,9.
- Posle vracanja backupa bez Zeno podataka tabela detalja i grafikon se ciste.

Unos i CSV:
- Prazno polje + SACUVAJ brise unos za izabrani dan (uz potvrdu).
- Enter u polju za unos cuva vrednost.
- Neispravni znakovi u polju za unos vise ne prave gresku.
- IZVEZI CSV pravi fajl koji moze ponovo da se uveze (zaglavlje POSETIOCI).
- Uvoz CSV-a je atomican: baza se menja tek kada je ceo fajl obradjen. Trazi
  potvrdu pre prepisivanja postojecih dana i javlja koji su redovi preskoceni.
  Podrzani su separatori ; , i tabulator.
- Izvozi i nedeljni izvestaj hvataju greske (npr. fajl je otvoren u Excelu).
- Nedeljni izvestaj: ispravljeno poravnanje kolona za dan Ponedeljak.

Interfejs:
- Logo se vise ne ucitava sa diska pri svakoj promeni velicine prozora, pa je
  menjanje velicine glatkije.
- Grafikon poseta po danima je simetrican i ne izlazi preko desne ivice.
- Ujednacen format brojeva u celom programu: tacka za hiljade, zarez za decimale.
- Trend nedelje bez podataka prikazuje "-" umesto "0.0%".
- Ispravljen uzrok Qt upozorenja "QFont::setPointSize: Point size <= 0 (-1)":
  Windows 11 stil u Qt-u 6.11 racuna strelicu dugmeta sa menijem iz velicine
  fonta u tackama, a dugme TEMA je imalo font zadat u pikselima. Dugme TEMA sada
  ima font u tackama (8.25pt = 11px), pa je izgled potpuno isti.
- Ako se slicno Qt upozorenje ipak pojavi, ne ispisuje se u konzolu, vec se
  upisuje u undergrand_errors.log zajedno sa podacima o okruzenju (stil,
  fontovi, otvoreni prozori).
- Broj verzije nalazi se na jednom mestu u kodu (APP_VERSION) i isti je u
  naslovu prozora, headeru i HISTORY prozoru.
- HISTORY prozor trazi version_history.txt i pored programa i u paketu EXE-a.

Napomena:
Funkcije UVEZI CSV, CSV SABLON i FOLDER BACKUPA i dalje postoje u kodu, ali
nemaju dugme u glavnom interfejsu. Za novu verziju je potrebno pokrenuti
program ponovo ili napraviti novi EXE preko Napravi_EXE.bat, a novi
version_history.txt mora da stoji pored programa.


VERZIJA 2.2.0
========================================
Izmena prethodnih dana, podsetnik za dane bez unosa i prevlacenje Zeno fajlova.

Istorija nedelja:
- Ispod grafikona izabrane nedelje dodata je tabela DANI U NEDELJI (sedam dana).
- Dvoklik na dan otvara prozor za unos, izmenu ili brisanje poseta za taj dan.
  Moze da se unese i dan koji je preskocen. Za budude datume unos nije dozvoljen.
- Posle izmene u istoriji ostaje izabrana ista nedelja.
- Izmena se cuva kao i svaki drugi unos: ako upis na disk ne uspe, izmena se
  ponistava i prikazuje se poruka.

Dani bez unosa:
- Dan bez unosa oznacen je recju "nedostaje" u akcentnoj boji teme, u tabeli
  OVA NEDELJA i u tabeli DANI U NEDELJI. Boja prati izabranu temu.
- Kao nedostajuci se ne racunaju dan koji jos traje i dani pre prvog unosa u
  bazi, pa nova baza ne dobija nepotrebne opomene.

Podsetnik:
- Na tabu OVA NEDELJA pojavljuje se traka kada u poslednjih 7 dana ima dana bez
  unosa, npr. "Nedostaje unos za juce (19.09.)" ili "Nedostaje unos za 3 dana".
- Dugme UNESI bira najstariji dan bez unosa. Posle cuvanja nudi se sledeci, a
  traka nestaje kada je sve uneto.
- Ako program ostane otvoren preko ponoci, sam prelazi na novi dan (datum u
  polju za unos, podsetnik i tekuca nedelja).

Zeno uvoz:
- Zeno e-mail (.eml), .mbox ili Google Takeout .zip moze da se prevuce bilo gde
  u prozor programa. Na tabu ZENO STATISTIKA dodato je kratko uputstvo.
- Vise .eml fajlova odjednom (prevlacenjem ili preko dugmeta UVEZI ZENO E-MAIL):
  jedno cuvanje i jedan sazetak. Mailovi koji nisu Zeno izvestaj se preskacu i
  prijavljuju. Nepodrzani fajlovi se ignorisu uz obavestenje.


VERZIJA 2.2.1
========================================
Ispravka dugmeta UVEZI ZENO ARHIVU.

Problem:
U verziji 2.2.0 klik na dugme UVEZI ZENO ARHIVU nije radio nista: nije se
otvarao ni prozor za izbor fajla.

Uzrok:
Signal dugmeta (clicked) salje vrednost checked=False. Metoda uvoza je u 2.2.0
dobila opcioni parametar putanje, pa je ta vrednost tumacena kao "fajl nije
izabran" i uvoz se tiho prekidao.

Uradjeno:
- Dugme sada poziva metodu bez parametara. Uvoz sa poznate putanje (koristi ga
  prevlacenje fajlova u prozor) izdvojen je u posebnu metodu.
- Prevlacenje fajlova u prozor i dugme UVEZI ZENO E-MAIL nisu bili zahvaceni.
- Provereno je da svako dugme u programu radi pravim klikom (uvoz i izvoz, backup,
  vracanje, HISTORY, unos, UNESI, teme, dugmad na tabu ZENO 4 NEDELJE, klik i
  dvoklik na redove tabela).


VERZIJA 2.3.0
========================================
Nove teme: Zar i Svetla.

Teme:
- Zar (narandzasta/crna): topla ugljena podloga i narandzasti akcenat, bliska
  zutoj boji iz logotipa.
- Svetla (dnevna): svetla podloga za rad po danu ili za projektor. Akcenat je
  tamnije zlato, radi citljivosti na beloj podlozi. Logotip, koji ima tamnu
  pozadinu, stoji u tamnoj zaobljenoj plocici.
- Obe teme su u meniju TEMA, biraju se u toku rada bez restarta i pamte se kao i
  ostale teme.
- Boje teksta u novim temama provereni su prema standardu kontrasta (WCAG), pa je
  sav tekst citljiv i na tamnoj i na svetloj podlozi.

Tehnicki detalji:
- Palete dobijaju tri nova kljuca koji postoje u svim temama: btn_shadow (senka
  3D dugmeta), logo_bg i logo_pad (plocica iza logotipa) i accent_fill (popuna iza
  tamnog teksta: izabrani segment grafikona, hover dugmadi TEMA i HISTORY i izabrana
  stavka u meniju). Kod postojecih tema imaju iste vrednosti kao ranije, pa im se
  izgled ne menja.
- Ako se baza sa izabranom novom temom otvori starijom verzijom programa, ta
  verzija bezbedno prelazi na temu Klasika.


VERZIJA 2.4.0
========================================
Trend u boji: rast zeleno, pad crveno, promena ispod 1% sivo.

Trend:
- Rast u odnosu na prethodnu nedelju ili period prikazuje se zelenom bojom i
  strelicom nagore, pad crvenom bojom i strelicom nadole.
- Promena manja od 1% racuna se kao "bez promene": siva boja i strelica udesno,
  da sitan sum ne izgleda alarmantno. Prag je konstanta TREND_NEUTRAL_BAND u kodu.
- Strelica i znak (+ ili -) uvek ostaju uz boju, pa boja nije jedini pokazatelj
  (vazno za osobe koje ne razlikuju crvenu i zelenu).

Gde se vidi:
- Kartica UKUPNO OVE NEDELJE (mala napomena) i veliki prikaz PROMENA u traci
  TREND NEDELJE.
- Tab ZENO STATISTIKA: kolone USERS %, SESSIONS % i SLUSANJE %.
- Tab ZENO 4 NEDELJE: poredjenje sa prethodnim periodom razdvojeno je u tri kratke
  kolone (USERS %, SESSIONS %, SLUSANJE %) umesto jedne dugacke, pa se tekst vise
  ne lomi i ne seče. Naslovi kolona se lome u dva reda na uzem prozoru, a naslov
  PROSECNO / NEDELJA skracen je na PROSEK / NED. (objasnjenje je u tooltip-u).

Boje po temi:
- Svaka tema ima svoje boje rasta i pada: tamnije nijanse na Svetloj, ruzicastija
  crvena na temi Zar (da se ne mesa sa narandzastim akcentom) i svetlija zelena na
  Hladnoj (da se razlikuje od tirkiznog akcenta).
- Boje su proverene prema standardu kontrasta (WCAG) na svim pozadinama.
- Izabrani red u tabelama zadrzava boje trenda: koristi se svetlija (na Svetloj
  temi tamnija) varijanta iste boje, da ostane citljiva na pozadini izabranog reda.

Tehnicki detalji:
- Nova dva kljuca u svim paletama: trend_up i trend_down. Siva boja koristi
  postojecu boju sporednog teksta.
- Procente u tabelama crta poseban delegat (TrendDelegate), jer stylesheet inace
  namece jednu boju teksta izabranom redu.
- Uklonjeno je neiskorisceno pravilo trendDown iz stylesheet-a.


VERZIJA 2.5.0
========================================
Nedeljni izvestaj u PDF formatu i ispravka poredjenja sa prethodnom nedeljom.

Izvestaj:
- Dugme NEDELJNI IZVESTAJ sada pravi PDF (A4, jedna strana). TXT ostaje kao druga
  opcija u prozoru za cuvanje; format se bira nastavkom fajla.
- PDF sadrzi: sazetak (ukupno, dnevni prosek, najposeceniji i najslabiji dan i
  promena u odnosu na prethodnu nedelju), grafikon poseta po danima sa oznakom
  prethodne nedelje, tabelu po danima sa poredjenjem i promenom u boji i Zeno blok
  (USERS, SESSIONS, LISTENING TIME i prosecna sesija sa promenom).
- Za nedelju za koju Zeno izvestaj jos nije stigao koristi se poslednji raniji
  izvestaj, a to je navedeno u naslovu Zeno bloka.
- PDF je uvek u svetloj "stampa" paleti, bez obzira na izabranu temu programa.
  Logotip stoji na tamnoj traci u zaglavlju.
- Izvestaj moze da se napravi za bilo koju nedelju: pre cuvanja se bira nedelja
  (tekuca, prethodna ili starija sa unosima). Ako postoji samo tekuca nedelja,
  nista se ne pita.
- PDF se pravi bez ijedne dodatne biblioteke (koristi se Qt).

Ispravka poredjenja sa prethodnom nedeljom:
- Poredjenje sada uzima samo dane koji imaju unos u OBE nedelje. Ranije je dan koji
  nedostaje u tekucoj nedelji (a postoji u prethodnoj) pravio lazan pad: na primer
  -18,4% iako je svaki dan koji postoji u obe nedelje bio u porastu.
- Ispravka vazi i za karticu UKUPNO OVE NEDELJE i za traku TREND NEDELJE (oznaka
  sada glasi "Isti dani, samo dani sa unosom u obe nedelje"). Razlika se vidi samo
  kada neki dan nedostaje.
- Brojevi na ekranu i u izvestaju dolaze iz iste funkcije (week_summary), pa se
  uvek poklapaju.


VERZIJA 2.6.0
========================================
Ispravka: poslednji red u DANI U NEDELJI mogao je da bude odsečen.

Problem:
Na nekim racunarima (nizi prozor, manji ekran, ili kada Windows tema iscrta
redove tabele nesto vise nego sto je predvidjeno) poslednji red tabele DANI U
NEDELJI (na tabu ISTORIJA NEDELJE) nije se video, jer je bio ispod donje ivice
prozora, a tab nije imao sopstveni skrol.

Uzrok:
Ostali tabovi sa mnogo sadrzaja (OVA NEDELJA, ZENO 4 NEDELJE) imaju ceo sadrzaj
u scroll area, pa se ono sto ne stane jednostavno skroluje. Tab ISTORIJA NEDELJE
je bio jedini izuzetak.

Uradjeno:
- Ceo sadrzaj taba ISTORIJA NEDELJE sada je u scroll area, isto kao ostali
  tabovi. Kada sve stane u prozor, skrol se i ne pojavljuje; kada ne stane,
  ceo tab (ukljucujuci tabelu DANI U NEDELJI) moze da se skroluje do kraja.
- Ostali izgled i funkcionalnost taba nisu menjani.


TRENUTNO STANJE
========================================
Trenutna verzija aplikacije:
2.6.0

Istorija razvoja ovog dokumenta obuhvata razvoj od prve radne verzije
0.1 do aktuelne verzije 2.6.0.

========================================
KRAJ DOKUMENTA
========================================
`;
