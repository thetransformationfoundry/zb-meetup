/* ============================================================
   ZB MeetUP — LIVE store (Firebase Auth + Cloud Firestore)
   Implements the same ZB_STORE API as store.js (demo).
   Uses the compat SDK loaded by index.html.
   ============================================================ */
(function () {
"use strict";
firebase.initializeApp(window.ZB_CONFIG.firebase);
const auth = firebase.auth();
const db = firebase.firestore();
const FV = firebase.firestore.FieldValue;
const nowTs = () => FV.serverTimestamp();
const SIGNUP_BONUS = 30;
const ICEBREAKER_BONUS = 10;
const SEED_VERSION = 3;   // 3 = +NL/RO translations (BRIEF-023). Bumping replaces the bank.
const todayStr = () => new Date().toISOString().slice(0,10);
// A spin record from a previous day means today's free spin has not been used yet.
const normSpin = sp => (sp && sp.date === todayStr()) ? { date:sp.date, freeAvailable: !!sp.freeAvailable }
                                                      : { date: todayStr(), freeAvailable: true };
const ADMINS = (window.ZB_CONFIG.ADMIN_EMAILS || []).map(e => e.toLowerCase());

// default question bank (always present; admin can add more)
// The question bank source of truth is Context/questions-source.md (Donnae, 2026-09-10):
// 34 Tier-1 IDEA questions asked in the meetup shared space and collected for the admin
// idea-bank, and 34 Tier-2 ICEBREAKER questions asked once at onboarding, shown to meetup
// partners as talking points, and NEVER exported (BRIEF-020). Verbatim from the source file.
const DEFAULTS = [
  { id:"t1q1", text:"If you were CEO of Zimmer Biomet for a day, what's the first thing you'd change?", tier:1, count:0, text_nl:"Als je één dag CEO van Zimmer Biomet was, wat zou je dan als eerste veranderen?", text_ro:"Dacă ai fi CEO al Zimmer Biomet pentru o zi, care ar fi primul lucru pe care l-ai schimba?" },
  { id:"t1q2", text:"If you were site leader / departmental director for a week, what would you fix first?", tier:1, count:0, text_nl:"Als je een week lang vestigingsleider / afdelingsdirecteur was, wat zou je dan als eerste aanpakken?", text_ro:"Dacă ai fi șef de sit / director de departament timp de o săptămână, ce ai rezolva mai întâi?" },
  { id:"t1q3", text:"What's one thing another department is doing that we should be doing?", tier:1, count:0, text_nl:"Wat doet een andere afdeling dat wij ook zouden moeten doen?", text_ro:"Ce face un alt departament și ar trebui să facem și noi?" },
  { id:"t1q4", text:"What do you think other departments would say we do best – and worst?", tier:1, count:0, text_nl:"Wat zouden andere afdelingen volgens jou zeggen dat wij het beste doen – en het slechtste?", text_ro:"Ce crezi că ar spune alte departamente că facem cel mai bine – și cel mai prost?" },
  { id:"t1q5", text:"What's the most valuable thing your department does that the rest of the business doesn't know about?", tier:1, count:0, text_nl:"Wat is het meest waardevolle dat jouw afdeling doet, maar dat de rest van het bedrijf niet weet?", text_ro:"Care este cel mai valoros lucru pe care îl face departamentul tău, dar despre care restul companiei nu știe?" },
  { id:"t1q6", text:"What's the one task in your week that feels like a waste of time – and how would you eliminate it?", tier:1, count:0, text_nl:"Welke taak in je week voelt als tijdverspilling – en hoe zou je die schrappen?", text_ro:"Care sarcină din săptămâna ta ți se pare o pierdere de timp – și cum ai elimina-o?" },
  { id:"t1q7", text:"Start / Stop / Continue: name one thing we should start doing, one we should stop, and one we should keep.", tier:1, count:0, text_nl:"Start / Stop / Doorgaan: noem één ding waar we mee moeten gaan beginnen, één waar we mee moeten stoppen en één wat we moeten behouden.", text_ro:"Start / Stop / Continuă: numește un lucru pe care ar trebui să-l începem, unul pe care să-l oprim și unul pe care să-l păstrăm." },
  { id:"t1q8", text:"Where do things get \"stuck\" between your team and another team? What would unblock it?", tier:1, count:0, text_nl:"Waar loopt het \"vast\" tussen jouw team en een ander team? Wat zou dat vlot trekken?", text_ro:"Unde se \"blochează\" lucrurile între echipa ta și altă echipă? Ce ar debloca situația?" },
  { id:"t1q9", text:"If you had €10,000 -  €100,000 to improve your workplace, what would you spend it on?", tier:1, count:0, text_nl:"Als je €10.000 - €100.000 had om je werkplek te verbeteren, waar zou je het aan uitgeven?", text_ro:"Dacă ai avea €10.000 - €100.000 pentru a-ți îmbunătăți locul de muncă, pe ce i-ai cheltui?" },
  { id:"t1q10", text:"What's one process you've seen at a previous employer that would work well here?", tier:1, count:0, text_nl:"Welk proces heb je bij een vorige werkgever gezien dat hier goed zou werken?", text_ro:"Ce proces ai văzut la un angajator anterior care ar funcționa bine aici?" },
  { id:"t1q11", text:"What's the most common mistake or block do you see – and what causes it?", tier:1, count:0, text_nl:"Welke fout of blokkade zie je het vaakst – en wat is de oorzaak?", text_ro:"Care este cea mai frecventă greșeală sau blocaj pe care îl vezi – și ce îl cauzează?" },
  { id:"t1q12", text:"What information do you need regularly that's hard to find or always arrives late?", tier:1, count:0, text_nl:"Welke informatie heb je regelmatig nodig die moeilijk te vinden is of altijd te laat komt?", text_ro:"De ce informații ai nevoie în mod regulat care sunt greu de găsit sau ajung mereu târziu?" },
  { id:"t1q13", text:"How would you bring AI into your daily work if it were available tomorrow?", tier:1, count:0, text_nl:"Hoe zou je AI in je dagelijkse werk gebruiken als het morgen beschikbaar was?", text_ro:"Cum ai folosi inteligența artificială (AI) în munca ta zilnică dacă ar fi disponibilă mâine?" },
  { id:"t1q14", text:"What's one repetitive task you'd hand over to a robot or AI without a second thought?", tier:1, count:0, text_nl:"Welke repetitieve taak zou je zonder aarzelen aan een robot of AI overlaten?", text_ro:"Ce sarcină repetitivă ai preda unui robot sau unei AI fără să stai pe gânduri?" },
  { id:"t1q15", text:"Which report, check or admin step could be automated so you can focus on more valuable work?", tier:1, count:0, text_nl:"Welk rapport, controle of administratieve stap zou geautomatiseerd kunnen worden zodat je je op waardevoller werk kunt richten?", text_ro:"Ce raport, verificare sau pas administrativ ar putea fi automatizat ca să te poți concentra pe muncă mai valoroasă?" },
  { id:"t1q16", text:"Have you used ZB AI Portal and what are your thoughts? How could it improve?", tier:1, count:0, text_nl:"Heb je de ZB AI Portal al gebruikt en wat vind je ervan? Hoe kan het verbeteren?", text_ro:"Ai folosit ZB AI Portal și ce părere ai? Cum ar putea fi îmbunătățit?" },
  { id:"t1q17", text:"What data do we collect that we're probably not using well enough?", tier:1, count:0, text_nl:"Welke gegevens verzamelen we die we waarschijnlijk niet goed genoeg benutten?", text_ro:"Ce date colectăm pe care probabil nu le folosim suficient de bine?" },
  { id:"t1q18", text:"What's the one piece of technology or equipment that would make your job easier?", tier:1, count:0, text_nl:"Welke technologie of welk gereedschap zou jouw werk makkelijker maken?", text_ro:"Ce tehnologie sau echipament ți-ar ușura munca?" },
  { id:"t1q19", text:"What's one thing that would make you look forward to coming to work more often?", tier:1, count:0, text_nl:"Wat zou ervoor zorgen dat je vaker met plezier naar je werk komt?", text_ro:"Ce lucru te-ar face să aștepți cu mai multă plăcere să vii la muncă?" },
  { id:"t1q20", text:"Which two departments should talk to each other more, and about what?", tier:1, count:0, text_nl:"Welke twee afdelingen zouden meer met elkaar moeten praten, en waarover?", text_ro:"Care două departamente ar trebui să comunice mai mult și despre ce?" },
  { id:"t1q21", text:"What do new colleagues struggle with most in their first weeks – how could onboarding be better?", tier:1, count:0, text_nl:"Waar worstelen nieuwe collega's het meeste mee in hun eerste weken – hoe kan de onboarding beter?", text_ro:"Cu ce se confruntă cel mai mult colegii noi în primele săptămâni – cum ar putea fi mai bună integrarea?" },
  { id:"t1q22", text:"What skill would you love to learn that would also help the company?", tier:1, count:0, text_nl:"Welke vaardigheid zou je graag leren die ook het bedrijf zou helpen?", text_ro:"Ce abilitate ți-ar plăcea să înveți și care ar ajuta și compania?" },
  { id:"t1q23", text:"How can management communicate better with the shop floor and commercial teams?", tier:1, count:0, text_nl:"Hoe kan het management beter communiceren met de werkvloer en de commerciële teams?", text_ro:"Cum poate conducerea să comunice mai bine cu personalul din depozit și cu echipele comerciale?" },
  { id:"t1q24", text:"What's one small thing that would noticeably improve the experience for other departments?", tier:1, count:0, text_nl:"Welk klein ding zou de ervaring voor andere afdelingen merkbaar verbeteren?", text_ro:"Ce lucru mic ar îmbunătăți vizibil experiența pentru alte departamente?" },
  { id:"t1q25", text:"If we could launch one new product, service or initiative in your department next year, what should it be?", tier:1, count:0, text_nl:"Als we volgend jaar één nieuw product, dienst of initiatief in jouw afdeling konden lanceren, wat zou dat moeten zijn?", text_ro:"Dacă am putea lansa un nou produs, serviciu sau inițiativă în departamentul tău anul viitor, care ar trebui să fie?" },
  { id:"t1q26", text:"A magic wand removes one rule, form or approval step tomorrow. Which one disappears, and what happens next?", tier:1, count:0, text_nl:"Een toverstok laat morgen één regel, formulier of goedkeuringsstap verdwijnen. Welke verdwijnt, en wat gebeurt er daarna?", text_ro:"O baghetă magică elimină mâine o regulă, un formular sau un pas de aprobare. Care dispare și ce se întâmplă apoi?" },
  { id:"t1q27", text:"Imagine a new colleague from the year 2040 visits Hazeldonk. What would make them laugh at how we work today?", tier:1, count:0, text_nl:"Stel je voor dat een nieuwe collega uit het jaar 2040 Hazeldonk bezoekt. Waar zouden ze om lachen als ze zien hoe we vandaag werken?", text_ro:"Imaginează-ți că un coleg nou din anul 2040 vizitează Hazeldonk. Ce l-ar face să râdă de felul în care lucrăm azi?" },
  { id:"t1q28", text:"If our biggest customer were a 12-year-old, how would you explain what we do – and what would they think is silly?", tier:1, count:0, text_nl:"Als onze grootste klant een 12-jarige was, hoe zou je uitleggen wat we doen – en wat zouden ze maar raar vinden?", text_ro:"Dacă cel mai mare client al nostru ar fi un copil de 12 ani, cum i-ai explica ce facem – și ce i s-ar părea caraghios?" },
  { id:"t1q29", text:"Pitch a completely ridiculous product or service for ZB. Then tell us the one serious idea hiding inside it.", tier:1, count:0, text_nl:"Bedenk een compleet belachelijk product of dienst voor ZB. Vertel dan welk serieus idee er achter verstopt zit.", text_ro:"Propune un produs sau serviciu complet ridicol pentru ZB. Apoi spune-ne ideea serioasă ascunsă în el." },
  { id:"t1q30", text:"If your department were a sports team, what position is unfilled and who should we sign?", tier:1, count:0, text_nl:"Als jouw afdeling een sportteam was, welke positie is niet ingevuld en wie zouden we moeten aantrekken?", text_ro:"Dacă departamentul tău ar fi o echipă sportivă, ce poziție e neocupată și pe cine ar trebui să transferăm?" },
  { id:"t1q31", text:"You've been made Minister of Tuesdays. What's the one thing that would make every Tuesday at ZB better?", tier:1, count:0, text_nl:"Je bent benoemd tot Minister van Dinsdagen. Wat zou je doen om elke dinsdag bij ZB beter te maken?", text_ro:"Ai fost numit Ministrul Marților. Ce lucru ar face fiecare marți la ZB mai bună?" },
  { id:"t1q32", text:"If we had to run the entire site with half the meetings, which ones survive and why?", tier:1, count:0, text_nl:"Als we de hele vestiging met de helft van de vergaderingen moesten runnen, welke blijven er over en waarom?", text_ro:"Dacă ar trebui să conducem întregul sit cu jumătate din ședințe, care ar supraviețui și de ce?" },
  { id:"t1q33", text:"A robot starts on your team on Monday. Write its job description in three lines.", tier:1, count:0, text_nl:"Er begint maandag een robot in jouw team. Beschrijf zijn functieomschrijving in drie regels.", text_ro:"Un robot începe lucrul în echipa ta luni. Scrie-i fișa postului în trei rânduri." },
  { id:"t1q34", text:"What would you rename your job title to if it had to describe what you actually do?", tier:1, count:0, text_nl:"Hoe zou je je functietitel hernoemen als die moest beschrijven wat je écht doet?", text_ro:"Cum ți-ai redenumi funcția dacă ar trebui să descrie ce faci de fapt?" },
  { id:"t2q1", text:"What did you want to be when you were 10 years old?", tier:2, count:0, text_nl:"Wat wilde je worden toen je 10 jaar oud was?", text_ro:"Ce voiai să te faci când aveai 10 ani?" },
  { id:"t2q2", text:"What was your very first job, and what did it teach you?", tier:2, count:0, text_nl:"Wat was je allereerste baan, en wat heeft die je geleerd?", text_ro:"Care a fost prima ta slujbă și ce te-a învățat?" },
  { id:"t2q3", text:"What's the best piece of career advice you've ever received?", tier:2, count:0, text_nl:"Wat is het beste carrièreadvies dat je ooit hebt gekregen?", text_ro:"Care este cel mai bun sfat de carieră pe care l-ai primit vreodată?" },
  { id:"t2q4", text:"What's something you're surprisingly good at that has nothing to do with your job?", tier:2, count:0, text_nl:"Waar ben je verrassend goed in dat niets met je werk te maken heeft?", text_ro:"La ce te pricepi surprinzător de bine, deși nu are legătură cu jobul tău?" },
  { id:"t2q5", text:"What would your colleagues be surprised to learn about you?", tier:2, count:0, text_nl:"Waarover zouden je collega's verrast zijn om over je te weten te komen?", text_ro:"Ce ar surprinde colegii tăi să afle despre tine?" },
  { id:"t2q6", text:"What's your go-to way to switch off after a long day?", tier:2, count:0, text_nl:"Hoe ontspan je het liefst na een lange dag?", text_ro:"Care e modul tău preferat de a te deconecta după o zi lungă?" },
  { id:"t2q7", text:"What's the best trip you've ever taken – and where's next on the list?", tier:2, count:0, text_nl:"Wat is de mooiste reis die je ooit hebt gemaakt – en wat staat er als volgende op je lijst?", text_ro:"Care este cea mai frumoasă călătorie pe care ai făcut-o – și care urmează pe listă?" },
  { id:"t2q8", text:"What's a hobby you've picked up (or dropped) in the last few years?", tier:2, count:0, text_nl:"Welke hobby heb je de afgelopen jaren opgepakt (of losgelaten)?", text_ro:"Ce hobby ai început (sau ai renunțat) în ultimii ani?" },
  { id:"t2q9", text:"What's your favourite thing to cook or eat – and who makes it best?", tier:2, count:0, text_nl:"Wat kook of eet je het liefst – en wie maakt het het lekkerst?", text_ro:"Ce îți place cel mai mult să gătești sau să mănânci – și cine îl face cel mai bine?" },
  { id:"t2q10", text:"Are you a morning person or a night owl – and does your job agree with that?", tier:2, count:0, text_nl:"Ben je een ochtendmens of een nachtbraker – en past je werk daarbij?", text_ro:"Ești o persoană matinală sau una de noapte – și jobul tău se potrivește cu asta?" },
  { id:"t2q11", text:"What's your most useless talent?", tier:2, count:0, text_nl:"Wat is je meest nutteloze talent?", text_ro:"Care e cel mai inutil talent al tău?" },
  { id:"t2q12", text:"If you could have any animal as a colleague, which would it be and what job would it do?", tier:2, count:0, text_nl:"Als je elk dier als collega kon hebben, welk dier zou het zijn en welk werk zou het doen?", text_ro:"Dacă ai putea avea orice animal drept coleg, care ar fi și ce muncă ar face?" },
  { id:"t2q13", text:"What's the worst haircut or fashion choice you've ever made?", tier:2, count:0, text_nl:"Wat is het ergste kapsel of de ergste modekeuze die je ooit hebt gemaakt?", text_ro:"Care e cea mai proastă tunsoare sau alegere vestimentară pe care ai făcut-o vreodată?" },
  { id:"t2q14", text:"If you had to eat one meal every day for the rest of your life, what would it be?", tier:2, count:0, text_nl:"Als je de rest van je leven elke dag hetzelfde gerecht moest eten, wat zou het zijn?", text_ro:"Dacă ar trebui să mănânci același fel de mâncare în fiecare zi pentru tot restul vieții, care ar fi?" },
  { id:"t2q15", text:"What's a song you know every word to, even though you'd never admit it?", tier:2, count:0, text_nl:"Welk liedje ken je woord voor woord, ook al zou je het nooit toegeven?", text_ro:"Ce cântec știi cuvânt cu cuvânt, deși nu ai recunoaște niciodată?" },
  { id:"t2q16", text:"What's the strangest thing in your fridge or desk drawer right now?", tier:2, count:0, text_nl:"Wat is het vreemdste dat nu in je koelkast of bureaula ligt?", text_ro:"Care e cel mai ciudat lucru din frigiderul sau sertarul tău chiar acum?" },
  { id:"t2q17", text:"Which fictional character would be the best (or worst) colleague?", tier:2, count:0, text_nl:"Welk fictief personage zou de beste (of slechtste) collega zijn?", text_ro:"Ce personaj fictiv ar fi cel mai bun (sau cel mai rău) coleg?" },
  { id:"t2q18", text:"If your life were a film, who would play you and what would it be called?", tier:2, count:0, text_nl:"Als je leven een film was, wie zou jou spelen en hoe zou de film heten?", text_ro:"Dacă viața ta ar fi un film, cine te-ar juca și cum s-ar numi?" },
  { id:"t2q19", text:"Which emoji do you overuse?", tier:2, count:0, text_nl:"Welke emoji gebruik je te veel?", text_ro:"Ce emoji folosești în exces?" },
  { id:"t2q20", text:"Would you rather work four 10-hour days or five 8-hour days?", tier:2, count:0, text_nl:"Werk je liever vier dagen van 10 uur of vijf dagen van 8 uur?", text_ro:"Ai prefera să lucrezi patru zile de 10 ore sau cinci zile de 8 ore?" },
  { id:"t2q21", text:"Would you rather have unlimited coffee or unlimited holiday?", tier:2, count:0, text_nl:"Wat zou je liever hebben: onbeperkt koffie of onbeperkt vakantie?", text_ro:"Ai prefera cafea nelimitată sau concediu nelimitat?" },
  { id:"t2q22", text:"Would you rather be able to speak every language or play every instrument?", tier:2, count:0, text_nl:"Zou je liever elke taal kunnen spreken of elk instrument kunnen bespelen?", text_ro:"Ai prefera să poți vorbi orice limbă sau să cânți la orice instrument?" },
  { id:"t2q23", text:"Beach, mountains or city?", tier:2, count:0, text_nl:"Strand, bergen of stad?", text_ro:"Plajă, munte sau oraș?" },
  { id:"t2q24", text:"Team teleport or team invisibility – and how would you use it at work?", tier:2, count:0, text_nl:"Team teleportatie of team onzichtbaarheid – en hoe zou je het op werk gebruiken?", text_ro:"Echipa teleportare sau echipa invizibilitate – și cum ai folosi-o la muncă?" },
  { id:"t2q25", text:"What's a small thing that always makes your day better?", tier:2, count:0, text_nl:"Welk klein ding maakt je dag altijd beter?", text_ro:"Ce lucru mic îți face mereu ziua mai bună?" },
  { id:"t2q26", text:"Which skill or hobby have you always wanted to try but never got around to?", tier:2, count:0, text_nl:"Welke vaardigheid of hobby wilde je altijd al proberen maar is er nooit van gekomen?", text_ro:"Ce abilitate sau hobby ai vrut mereu să încerci, dar nu ai apucat?" },
  { id:"t2q27", text:"What's the best concert, match or event you've ever been to?", tier:2, count:0, text_nl:"Wat is het beste concert, de beste wedstrijd of het beste evenement waar je ooit bent geweest?", text_ro:"Care e cel mai bun concert, meci sau eveniment la care ai fost?" },
  { id:"t2q28", text:"If you could have dinner with anyone – alive or historical – who's at the table?", tier:2, count:0, text_nl:"Als je met wie dan ook kon dineren – levend of historisch – wie zit er aan tafel?", text_ro:"Dacă ai putea lua cina cu oricine – în viață sau istoric – cine e la masă?" },
  { id:"t2q29", text:"What's a tradition you love, and one you secretly don't get?", tier:2, count:0, text_nl:"Welke traditie vind je geweldig, en welke snap je stiekem niet?", text_ro:"Ce tradiție îți place și care e una pe care, în secret, nu o înțelegi?" },
  { id:"t2q30", text:"Cats, dogs, or \"I have enough going on already\"?", tier:2, count:0, text_nl:"Katten, honden, of \"ik heb het al druk genoeg\"?", text_ro:"Pisici, câini sau „am deja destule pe cap\"?" },
  { id:"t2q31", text:"What's the last thing that made you laugh out loud?", tier:2, count:0, text_nl:"Wat is het laatste waar je hardop om moest lachen?", text_ro:"Care e ultimul lucru care te-a făcut să râzi în hohote?" },
  { id:"t2q32", text:"If you won the lottery tomorrow, what's the first (sensible) thing and the first (not-so-sensible) thing you'd do?", tier:2, count:0, text_nl:"Als je morgen de loterij wint, wat is het eerste (verstandige) en het eerste (minder verstandige) dat je zou doen?", text_ro:"Dacă ai câștiga la loterie mâine, care ar fi primul lucru (rezonabil) și primul (mai puțin rezonabil) pe care l-ai face?" },
  { id:"t2q33", text:"What's your signature move at a party – dancing, DJ-ing, kitchen-hanging or early exit?", tier:2, count:0, text_nl:"Wat is jouw kenmerkende move op een feest – dansen, dj'en, in de keuken hangen of vroeg vertrekken?", text_ro:"Care e specialitatea ta la o petrecere – dansul, mixatul, statul în bucătărie sau plecatul devreme?" },
  { id:"t2q34", text:"Which three words would your best friend use to describe you?", tier:2, count:0, text_nl:"Welke drie woorden zou je beste vriend(in) gebruiken om je te beschrijven?", text_ro:"Ce trei cuvinte ar folosi cel mai bun prieten al tău ca să te descrie?" },
];
const slug = n => (n||"").toLowerCase().replace(/\s*&\s*/g,"-and-").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const SEED_DEFS = [
  { names:"Anna & Mateo", scene:"walk",    hearts:12, comments:[{by:"Priya",text:"Love this @Anna!"}] },
  { names:"Priya & Tom",  scene:"lunch",   hearts:8,  comments:[] },
  { names:"Lena & Sven",  scene:"digital", hearts:15, comments:[{by:"Marco",text:"Great cross-team catch-up"}] },
  { names:"Ravi & Chloe", scene:"coffee",  hearts:6,  comments:[] },
  { names:"Marco & Ines", scene:"litter",  hearts:9,  comments:[] },
  { names:"Yuki & Ben",   scene:"coffee",  hearts:11, comments:[] },
];
const SEEDS = SEED_DEFS.map((p,i) => ({ id:"s"+(i+1), seed:true, names:p.names, scene:p.scene, photo:"assets/holding-demo-photos/"+slug(p.names)+".jpg", hearts:p.hearts, liked:false, comments:p.comments.map(c=>({...c})) }));

let cachedMe = null, _change = null, _unsub = [], _viewing = "";
// tiny TTL caches to keep read counts down
const cache = {};
function ttl(key, ms, loader) {
  const c = cache[key];
  if (c && (Date.now() - c.t) < ms) return Promise.resolve(c.v);
  return loader().then(v => { cache[key] = { t:Date.now(), v }; return v; });
}
const uidNow = () => auth.currentUser && auth.currentUser.uid;
const profileToPublic = d => ({ uid:d.uid, lang:d.lang || "en", name:d.name, first:d.first || (d.name||"").split(" ")[0], role:d.role, dept:d.dept, workClass:d.workClass, floor:!!d.floor, color:d.color, photo:d.photo||null, points:d.points||0, icebreakers:d.icebreakers||[] });

// Writes into ANOTHER user's notifications/{uid}/items subtree, so it depends on the
// published rule allowing a signed-in colleague to create (not read/edit) a notification
// for someone else. Never let a failed notification break the action that triggered it:
// before this was non-fatal, a denied write made createMatch/acceptMatch/sendMessage throw
// *after* their real write had already succeeded, so the UI never confirmed or refreshed.
async function addNotif(uid, o) {
  try {
    return await db.collection("notifications").doc(uid).collection("items")
      .add(Object.assign({ read:false, fromUid:uidNow() || null, createdAt:nowTs() }, o));
  } catch (e) {
    if (window.console) console.warn("[zb] notification not delivered to", uid, e && e.code);
    return null;
  }
}

function attachListeners() {
  detachListeners();
  const uid = uidNow(); if (!uid) return;
  const fire = () => { cache["posts"] = null; if (_change) _change(); };
  const debounced = (() => { let t; return () => { clearTimeout(t); t = setTimeout(fire, 250); }; })();
  _unsub.push(db.collection("matches").where("a","==",uid).onSnapshot(debounced, ()=>{}));
  _unsub.push(db.collection("matches").where("b","==",uid).onSnapshot(debounced, ()=>{}));
  _unsub.push(db.collection("notifications").doc(uid).collection("items").onSnapshot(debounced, ()=>{}));
}
function detachListeners() { _unsub.forEach(u => { try { u(); } catch(e){} }); _unsub = []; }

// One shared photo per meetup, stored as a base64 string on the match doc (`photo`).
// Legacy fallback: matches created before v=7 kept a per-uid `photos` map (a flag or a
// base64) — read the first value so in-flight meetups don't lose their completed photo step.
function matchPhoto(d) {
  if (typeof d.photo === "string" && d.photo) return d.photo;
  const legacy = d.photos ? Object.keys(d.photos).map(k => d.photos[k]).filter(Boolean) : [];
  const str = legacy.filter(v => typeof v === "string")[0];
  return str || (legacy.length ? true : null);
}

function mapMatch(id, d, uid) {
  const other = d.a === uid ? d.bProfile : d.aProfile;
  const otherUid = d.a === uid ? d.b : d.a;
  const cb = d.completedBy || {};
  const legacyDone = d.status === "completed";   // matches completed under the old both-at-once model
  const myAns = (d.answers && d.answers[uid]) || (d.questions||[]).map(()=>"") || [];
  const msgs = (d.messages || []).map(m => ({ by: m.by === uid ? "me" : "them", text:m.text }));
  const unread = Math.max(0, msgs.filter(m => m.by === "them").length - ((d.reads && d.reads[uid]) || 0));
  return { id, a:d.a, b:d.b, status:d.status, type:d.type, questions:d.questions || [], person:other,
           answers:myAns.slice(), photo: matchPhoto(d), messages:msgs, unread,
           completed: !!cb[uid] || legacyDone,
           otherCompleted: !!cb[otherUid] || legacyDone,
           photoAwarded: !!(d.photoAwarded && d.photoAwarded[uid]),
           incoming: (d.b === uid && d.status === "requested") };
}

const ZB_STORE = {
  mode: "firebase",
  ready: Promise.resolve(true),

  // ---- auth ----
  onAuth(cb) {
    this._authcb = cb;
    auth.onAuthStateChanged(async u => {
      if (u) { try { const s = await db.collection("users").doc(u.uid).get(); cachedMe = s.exists ? Object.assign({ uid:u.uid }, s.data()) : null; } catch(e){ cachedMe = null; } attachListeners(); }
      else { cachedMe = null; detachListeners(); }
      cb(u ? { uid:u.uid, email:u.email } : null);
    });
  },
  currentUser() { return auth.currentUser ? { uid:auth.currentUser.uid, email:auth.currentUser.email } : null; },
  // Off-domain sign-ups never reach Firebase. The hard gate is the published Firestore
  // rule on users/{uid} create (no profile => no app), see Context/DATA-MODEL.md.
  signUp(email, pass) {
    if (!window.ZB_DOMAIN_OK(email)) return Promise.reject({ code:"zb/domain-not-allowed" });
    return auth.createUserWithEmailAndPassword(email, pass);
  },
  signIn(email, pass) { return auth.signInWithEmailAndPassword(email, pass); },
  resetPassword(email) { return auth.sendPasswordResetEmail(email); },
  signOut() { detachListeners(); return auth.signOut(); },
  async deleteAccount() { const u = auth.currentUser; if (!u) return; try { await db.collection("users").doc(u.uid).delete(); } catch(e){} try { await u.delete(); } catch(e){ await auth.signOut(); } },

  // ---- profile ----
  async getMe() { const uid = uidNow(); if (!uid) return null; const s = await db.collection("users").doc(uid).get(); cachedMe = s.exists ? Object.assign({ uid }, s.data()) : null; return cachedMe ? { ...cachedMe } : null; },
  async saveMe(partial) {
    const uid = uidNow(); if (!uid) throw new Error("not signed in");
    const ref = db.collection("users").doc(uid);
    const existing = await ref.get();
    const data = Object.assign({}, partial);
    if (partial.name) data.first = partial.name.split(" ")[0];
    if (!existing.exists) {
      data.points = SIGNUP_BONUS; data.signupBonusGranted = true;   // BRIEF-017 signup bonus
      if (!data.lang) data.lang = "en";                             // BRIEF-023
      data.createdAt = nowTs(); data.email = auth.currentUser.email;
    }
    await ref.set(data, { merge:true });
    const s = await ref.get(); cachedMe = Object.assign({ uid }, s.data());
    cache["users"] = null;
    return { ...cachedMe };
  },
  isAdmin() { const e = (auth.currentUser && auth.currentUser.email || "").toLowerCase(); return Promise.resolve(ADMINS.includes(e)); },

  // ---- users / leaderboard (cached 20s to limit reads) ----
  _allUsers() { return ttl("users", 20000, () => db.collection("users").get().then(q => q.docs.map(d => Object.assign({ uid:d.id }, d.data())))); },
  async listUsers() { const uid = uidNow(); const all = await this._allUsers(); return all.filter(u => u.uid !== uid).map(profileToPublic); },
  async leaderboard() { const uid = uidNow(); const all = await this._allUsers(); return all.map(u => ({ name:u.name, points:u.points||0, color:u.color, photo:u.photo||null, me:u.uid===uid })).sort((a,b)=>b.points-a.points); },

  // ---- matches ----
  async myMatches() {
    const uid = uidNow(); if (!uid) return [];
    const [qa, qb] = await Promise.all([ db.collection("matches").where("a","==",uid).get(), db.collection("matches").where("b","==",uid).get() ]);
    const seen = {}; const out = [];
    [...qa.docs, ...qb.docs].forEach(doc => { if (seen[doc.id]) return; seen[doc.id] = 1; const d = doc.data(); if (d.status === "declined") return; out.push(mapMatch(doc.id, d, uid)); });
    out.sort((a,b) => 0);
    return out;
  },
  // ---- spin economy (BRIEF-017) ----
  // users/{uid}.spin = { date:"YYYY-MM-DD", freeAvailable:bool }, day-stamped so a free spin
  // cannot be minted by leaving and coming back. A new day always grants one free spin;
  // sending a request grants another. Everything else costs 1 point, floored and blocked at 0.
  async spinState() {
    const me = cachedMe || (await this.getMe()) || {};
    const s = normSpin(me.spin);
    return { points: me.points || 0, freeSpin: s.freeAvailable };
  },
  // Prices one spin. Returns { ok, free, points } — ok:false means the user is out of points.
  async paySpin() {
    const uid = uidNow(); const ref = db.collection("users").doc(uid);
    let res = { ok:false, free:false, points:0 };
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref); const d = snap.data() || {};
      const s = normSpin(d.spin); const points = d.points || 0;
      if (s.freeAvailable) {
        tx.update(ref, { spin:{ date:s.date, freeAvailable:false } });
        res = { ok:true, free:true, points };
      } else if (points >= 1) {
        tx.update(ref, { points: FV.increment(-1), spin:{ date:s.date, freeAvailable:false } });
        res = { ok:true, free:false, points: points - 1 };
      } else {
        res = { ok:false, free:false, points:0 };   // blocked, never negative
      }
    });
    if (res.ok) { cachedMe = null; cache["users"] = null; }
    return res;
  },
  // Sending a request makes the NEXT spin free, so chaining real meetups costs nothing.
  async grantFreeSpin() {
    const uid = uidNow(); const today = todayStr();
    await db.collection("users").doc(uid).set({ spin:{ date:today, freeAvailable:true } }, { merge:true });
    if (cachedMe) cachedMe.spin = { date:today, freeAvailable:true };
    return true;
  },
  // Existing accounts predate the 30-point signup bonus; grant it exactly once.
  async claimSignupBonus() {
    const uid = uidNow(); const ref = db.collection("users").doc(uid); let granted = false;
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref); const d = snap.data(); if (!d) return;
      if (d.signupBonusGranted) return;
      granted = true;
      tx.update(ref, { points: FV.increment(SIGNUP_BONUS), signupBonusGranted:true });
    });
    if (granted) { cachedMe = null; cache["users"] = null; }
    return granted;
  },
  async createMatch(other, type, questions) {
    const uid = uidNow(); const me = cachedMe || (await this.getMe());
    const doc = { a:uid, b:other.uid, aProfile:profileToPublic(Object.assign({ uid }, me)), bProfile:profileToPublic(other),
                  status:"requested", type, questions, answers:{}, photo:null, completedBy:{}, photoAwarded:{}, postId:null,
                  messages:[], reads:{}, createdAt:nowTs() };
    const ref = await db.collection("matches").add(doc);
    await addNotif(other.uid, { type:"request", icon:"users", text:(me.name||"A colleague")+" wants to meet you — open Meetups to accept.", target:"meetups" });
    return ref.id;
  },
  async acceptMatch(id) {
    const uid = uidNow(); const ref = db.collection("matches").doc(id);
    const d = (await ref.get()).data(); if (!d) return false;
    await ref.update({ status:"active", acceptedAt:nowTs() });
    const meName = (cachedMe && cachedMe.name) || "Your match";
    await addNotif(d.a, { type:"accept", icon:"check", text:meName+" accepted your match! Open the shared space to coordinate.", target:"meet:"+id });
    return true;
  },
  async declineMatch(id) { await db.collection("matches").doc(id).update({ status:"declined" }); return true; },
  async sendMessage(id, text) {
    const uid = uidNow(); const ref = db.collection("matches").doc(id);
    const d = (await ref.get()).data(); if (!d) return false;
    await ref.update({ messages: FV.arrayUnion({ by:uid, text, at:Date.now() }) });
    const other = d.a === uid ? d.b : d.a;
    await addNotif(other, { type:"msg", icon:"chat", text:((cachedMe&&cachedMe.name)||"Your match")+" sent you a message", target:"thread:"+id });
    return true;
  },
  async clearMatchUnread(id) { const uid = uidNow(); const ref = db.collection("matches").doc(id); const d = (await ref.get()).data(); if (d) await ref.update({ ["reads."+uid]: (d.messages||[]).length }); return true; },
  // One shared photo per meetup — either participant may set or replace it.
  // The photo is worth +5 to BOTH, but the Firestore rules only let me write MY OWN user doc
  // (users/{uid}: isMe(uid) || isAdmin()), so each side claims its own +5: I claim mine here,
  // the other participant claims theirs via claimPhotoAward() on their next load. Replacing
  // the photo never re-awards, because the photoAwarded flag is already set.
  async setMatchPhoto(id, photo, post) {
    const uid = uidNow(); const ref = db.collection("matches").doc(id);
    await db.runTransaction(async tx => {
      // all reads first — Firestore transactions require it
      const s = await tx.get(ref); const d = s.data(); if (!d) return;
      const completed = !!(d.completedBy && Object.keys(d.completedBy).length);
      let existing = null, existingRef = null;
      if (photo && completed && d.postId) {
        existingRef = db.collection("posts").doc(d.postId);
        const ps = await tx.get(existingRef); existing = ps.exists ? ps.data() : null;
      }

      const upd = { photo: photo || null };
      const claim = !!photo && !(d.photoAwarded && d.photoAwarded[uid]);
      if (claim) upd["photoAwarded."+uid] = true;

      // A photo can arrive AFTER completion (questions-only completion is legal since
      // BRIEF-005), so the single wall post has to catch up.
      if (photo && completed) {
        if (existing) {
          // Either participant may refresh the shared photo on the one wall post: the rule
          // allows a photo-ONLY diff from a participant of this post's match (BRIEF-013), so
          // the non-author skip that used to live here is gone. Nothing else on the post is
          // touched — that is what keeps the rule's narrow crack narrow.
          tx.update(existingRef, { photo });
        } else if (post) {
          const pref = db.collection("posts").doc();
          tx.set(pref, { authorUid:uid, matchId:id, names:post.names, scene:post.scene, photo,
                         hearts:0, heartedBy:[], comments:[], createdAt:nowTs() });
          upd.postId = pref.id;
        }
      }

      tx.update(ref, upd);
      if (claim) tx.update(db.collection("users").doc(uid), { points: FV.increment(5) });
    });
    cache["users"] = null; cache["posts"] = null;
    return true;
  },
  // Claim MY +5 for a shared photo (whoever added it). One-time, self-only, idempotent.
  async claimPhotoAward(id) {
    const uid = uidNow(); const ref = db.collection("matches").doc(id); let claimed = false;
    await db.runTransaction(async tx => {
      const s = await tx.get(ref); const d = s.data();
      if (!d || !matchPhoto(d)) return;
      if (d.photoAwarded && d.photoAwarded[uid]) return;
      claimed = true;
      tx.update(ref, { ["photoAwarded."+uid]: true });
      tx.update(db.collection("users").doc(uid), { points: FV.increment(5) });
    });
    if (claimed) cache["users"] = null;
    return claimed;
  },
  async setMatchAnswers(id, answers) { const uid = uidNow(); await db.collection("matches").doc(id).update({ ["answers."+uid]: answers }); return true; },
  // Completes only the CALLING user's side and awards only their own questions (+5).
  // The other participant's points never move here — they complete their own part.
  async completeMatch(id, post) {
    const uid = uidNow(); const ref = db.collection("matches").doc(id); let done = false;
    await db.runTransaction(async tx => {
      const s = await tx.get(ref); const d = s.data(); if (!d) return;
      if (d.completedBy && d.completedBy[uid]) return;    // my part is already done
      done = true;
      const other = d.a === uid ? d.b : d.a;
      const upd = { ["completedBy."+uid]: Date.now() };   // a map value, so not serverTimestamp()
      // match-level "completed" only once BOTH sides are in
      if (d.completedBy && d.completedBy[other]) { upd.status = "completed"; upd.completedAt = nowTs(); }
      tx.update(db.collection("users").doc(uid), { points: FV.increment(5) });   // my 3 answers
      const shared = typeof d.photo === "string" ? d.photo : null;
      const photo = post.photo || shared || null;
      if (!d.postId && photo) {                           // ONE wall post per meetup
        const pref = db.collection("posts").doc();
        tx.set(pref, { authorUid:uid, matchId:id, names:post.names, scene:post.scene, photo, hearts:0, heartedBy:[], comments:[], createdAt:nowTs() });
        upd.postId = pref.id;
      }
      tx.update(ref, upd);
    });
    cache["users"] = null;
    return done;
  },

  // ---- wall ----
  async listPosts() {
    const uid = uidNow();
    const real = await ttl("posts", 15000, () => db.collection("posts").orderBy("createdAt","desc").limit(30).get()
      .then(q => q.docs.map(doc => { const d = doc.data(); return { id:doc.id, seed:false, names:d.names, scene:d.scene, photo:d.photo||null, hearts:d.hearts||0, liked:(d.heartedBy||[]).includes(uid), comments:d.comments||[] }; })));
    return real.concat(SEEDS.map(s => ({ ...s, comments:s.comments.slice() })));
  },
  async heartPost(id) {
    if (String(id).startsWith("s")) { const w = SEEDS.find(x => x.id === id); if (w) { w.liked = !w.liked; w.hearts += w.liked ? 1 : -1; } return true; }
    const uid = uidNow(); const ref = db.collection("posts").doc(id);
    await db.runTransaction(async tx => { const s = await tx.get(ref); const d = s.data(); if (!d) return; const has = (d.heartedBy||[]).includes(uid); tx.update(ref, { heartedBy: has ? FV.arrayRemove(uid) : FV.arrayUnion(uid), hearts: FV.increment(has ? -1 : 1) }); });
    cache["posts"] = null; return true;
  },
  // BRIEF-011A: the author is byUid = the caller's own uid, which the published rule enforces.
  // The display name is NOT stored — it is rendered from users/{byUid} — so a direct write can
  // no longer post a comment under another colleague's name.
  async commentPost(id, text) {
    const uid = uidNow();
    const c = { byUid:uid, text, at:Date.now() };
    if (String(id).startsWith("s")) { const w = SEEDS.find(x => x.id === id); if (w) w.comments.push(c); return true; }
    await db.collection("posts").doc(id).update({ comments: FV.arrayUnion(c) }); cache["posts"] = null; return true;
  },

  // ---- notifications ----
  async listNotifs() {
    const uid = uidNow(); if (!uid) return [];
    const q = await db.collection("notifications").doc(uid).collection("items").orderBy("createdAt","desc").limit(30).get();
    return q.docs.map(d => Object.assign({ id:d.id }, d.data()));
  },
  async markNotifRead(id) { const uid = uidNow(); await db.collection("notifications").doc(uid).collection("items").doc(id).update({ read:true }); return true; },
  async markNotifsRead() { const uid = uidNow(); const q = await db.collection("notifications").doc(uid).collection("items").where("read","==",false).get(); const b = db.batch(); q.docs.forEach(d => b.update(d.ref, { read:true })); await b.commit(); return true; },
  clearNotifs() { return this.markNotifsRead(); },
  async welcome() { const uid = uidNow(); if (uid) await addNotif(uid, { type:"welcome", icon:"users", text:"Welcome to ZB MeetUP! Tap Spin to find your first match.", target:"spin" }); return true; },

  // ---- questions / admin ----
  // ---- question bank: real editable records (BRIEF-008) ----
  // Before this, DEFAULTS were hardcoded and merely concatenated with whatever an admin had
  // added, so the original seven could never be edited or deleted. Now:
  //   - once seeded (marker doc app/questionBank), the collection is AUTHORITATIVE, so an
  //     admin's deletions stick instead of the defaults reappearing;
  //   - until then DEFAULTS are returned as a read-only fallback, so meetups keep working for
  //     everyone even though no admin has opened the admin screen yet.
  async questionBank() {
    const [docs, seeded] = await Promise.all([
      ttl("qbank", 60000, () => db.collection("questionBank").get()
        .then(q => q.docs.map(d => Object.assign({ id:d.id }, d.data())))),
      ttl("qseed", 60000, () => db.collection("app").doc("questionBank").get()
        .then(d => d.exists && (((d.data()||{}).seedVersion||0) >= SEED_VERSION)).catch(() => false)),
    ]);
    if (seeded) return docs;
    return DEFAULTS.concat(docs);          // pre-seed behaviour, unchanged
  },
  // Turns the hardcoded defaults into editable docs. Admin-only, idempotent: it skips ids that
  // already exist, so running it twice cannot duplicate or resurrect a deleted question.
  // SEED_VERSION 2 = the 68 questions from Context/questions-source.md (BRIEF-020), replacing
  // the original 7. Bumping this REPLACES the collection: authorised because we are pre-launch
  // with no real answers. Answers already given would keep their snapshotted question text
  // anyway, but a future reseed should not be done casually.
  async seedQuestionBank() {
    if (!ADMINS.includes((auth.currentUser && auth.currentUser.email || "").toLowerCase()))
      throw { code:"zb/not-admin", message:"Admins only" };
    const marker = db.collection("app").doc("questionBank");
    const m = await marker.get();
    const at = (m.exists && (m.data()||{}).seedVersion) || (m.exists && (m.data()||{}).seeded ? 1 : 0);
    if (at >= SEED_VERSION) return false;
    const existing = await db.collection("questionBank").get();
    // Firestore batches cap at 500 writes; 68 + deletions is well inside one batch.
    const batch = db.batch();
    existing.docs.forEach(d => batch.delete(d.ref));               // clear the previous set
    DEFAULTS.forEach(q => batch.set(db.collection("questionBank").doc(q.id),
      { text:q.text, text_nl:q.text_nl || null, text_ro:q.text_ro || null,
        tier:q.tier, count:0, createdAt:nowTs() }));
    batch.set(marker, { seeded:true, seedVersion:SEED_VERSION, at:nowTs() }, { merge:true });
    await batch.commit();
    cache["qbank"] = null; cache["qseed"] = null;
    return true;
  },
  // ---- icebreakers (BRIEF-020) ----
  // Tier-2 answers live on the USER doc, shown to meetup partners as talking points. They are
  // deliberately NOT in matches/ and never read by adminAnswers(), so they cannot reach the
  // idea-bank or the CSV export.
  async saveIcebreakers(list) {
    const uid = uidNow(); if (!uid) throw new Error("not signed in");
    await db.collection("users").doc(uid).set({ icebreakers:list || [] }, { merge:true });
    cachedMe = null; cache["users"] = null;
    return true;
  },
  // One-time +10 for answering all three. Same guard pattern as the signup bonus.
  async claimIcebreakerBonus() {
    const uid = uidNow(); const ref = db.collection("users").doc(uid); let granted = false;
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref); const d = snap.data(); if (!d) return;
      if (d.icebreakerBonusGranted) return;
      if ((d.icebreakers || []).filter(x => x && (x.answer || "").trim()).length < 3) return;   // all three, or nothing
      granted = true;
      tx.update(ref, { points: FV.increment(ICEBREAKER_BONUS), icebreakerBonusGranted:true });
    });
    if (granted) { cachedMe = null; cache["users"] = null; }
    return granted;
  },
  async addQuestion(text, tier) {
    await db.collection("questionBank").add({ text, tier:(tier===1?1:2), count:0, createdAt:nowTs() });
    cache["qbank"] = null; return true;
  },
  async updateQuestion(id, patch) {
    const upd = {};
    if (typeof patch.text === "string") upd.text = patch.text;
    if (typeof patch.text_nl === "string") upd.text_nl = patch.text_nl;
    if (typeof patch.text_ro === "string") upd.text_ro = patch.text_ro;
    if (patch.tier === 1 || patch.tier === 2) upd.tier = patch.tier;
    if (!Object.keys(upd).length) return false;
    await db.collection("questionBank").doc(id).set(upd, { merge:true });
    cache["qbank"] = null; return true;
  },
  async deleteQuestion(id) {
    await db.collection("questionBank").doc(id).delete();
    cache["qbank"] = null; return true;
  },
  // ---- admin: the idea bank ----
  // Reads answers across ALL matches, which the published rule already allows for an admin:
  //   match /matches/{id} { allow read ...: if isAdmin() || <participant> ... }
  // isAdmin() does not depend on resource.data, so a whole-collection get() is permitted for an
  // admin and denied for everyone else. Gated here too, so a non-admin never even issues the read.
  async adminAnswers() {
    if (!ADMINS.includes((auth.currentUser && auth.currentUser.email || "").toLowerCase()))
      throw { code:"zb/not-admin", message:"Admins only" };
    const snap = await db.collection("matches").get();
    const byQ = new Map();
    snap.docs.forEach(doc => {
      const d = doc.data(); const qs = d.questions || []; const ans = d.answers || {};
      const nameOf = uid => uid === d.a ? ((d.aProfile && d.aProfile.name) || "A colleague")
                                        : ((d.bProfile && d.bProfile.name) || "A colleague");
      const when = d.completedAt || d.createdAt;
      const date = when && when.toDate ? when.toDate().toISOString().slice(0,10) : "";
      Object.keys(ans).forEach(uid => {
        (ans[uid] || []).forEach((text, i) => {
          text = (text || "").trim(); if (!text) return;
          const q = qs[i] || {}; const key = q.id || q.t || ("q" + i);
          if (!byQ.has(key)) byQ.set(key, { id:key, text:q.t || "(question not recorded)", tier:q.tier || null, answers:[] });
          byQ.get(key).answers.push({ text, by:nameOf(uid), byUid:uid, type:d.type || "", date, matchId:doc.id });
        });
      });
    });
    // Label each group with the question's CURRENT wording where it still exists in the bank:
    // answers are grouped by question id, so an admin editing the text (BRIEF-008) must not make
    // one question look like two. The answers themselves keep the wording colleagues were asked.
    const current = {}; (await this.questionBank()).forEach(q => current[q.id] = q.text);
    const questions = [...byQ.values()].map(q => Object.assign({}, q, {
      count:q.answers.length, text:current[q.id] || q.text })).sort((a,b) => b.count - a.count);
    return { questions, totalAnswers:questions.reduce((n,q)=>n+q.count,0), totalMatches:snap.size };
  },

  async listBugs() { const isAdmin = ADMINS.includes((auth.currentUser && auth.currentUser.email || "").toLowerCase()); if (!isAdmin) return []; const q = await db.collection("bugReports").orderBy("at","desc").limit(50).get(); return q.docs.map(d => d.data()); },
  async sendBug(text) { const uid = uidNow(); await db.collection("bugReports").add({ by:(cachedMe&&cachedMe.name)||"A user", byUid:uid, text, at:new Date().toLocaleDateString() }); return true; },
  async unreadMatches() { const ms = await this.myMatches(); return ms.reduce((s,m)=>s+(m.unread||0),0); },

  onChange(cb) { _change = cb; },
  setViewing(v) { _viewing = v; },
};

window.ZB_STORE = ZB_STORE;
})();
