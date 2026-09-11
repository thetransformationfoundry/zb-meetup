/* ============================================================
   ZB MeetUP — DEMO store (in-browser only, no backend)
   Implements the same ZB_STORE API as store-firebase.js so the
   UI (app.js) is identical in demo and live modes.
   All methods return Promises. Data is in-memory (resets on reload).
   ============================================================ */
(function () {
  "use strict";

  const COLORS = ["#0079BD","#1E9E5A","#E8B923","#D64545","#7A5AF8","#0EA5A5","#E5731E","#C026A3","#2563EB","#57606A"];
  let ci = 0; const col = () => COLORS[(ci++) % COLORS.length];

  // Demo colleagues (the pool you get matched with)
  const USERS = [
    ["Mira","Halvorsen","GSCC Warehouse Clerk","Distribution","on-site",true],
    ["Tobias","Halvorsen","GSCC Warehouse Clerk","Distribution","on-site",true],
    ["Elin","Koster","GSCC - QARA","Quality & Reg Affairs","on-site",false],
    // DEMO ONLY — every one of these colleagues is FICTIONAL. They exist in this in-browser
    // store, are never written to Firestore, and are never seen by a live user. The roles are
    // real entries from ROLES so the demo exercises real matching; the people are invented.
    // Do NOT put a real colleague's name, role or work location here: this repo is public.
    ["Noor","Baaijens","GSCC Sls Sr Representative","Sales NL North","remote",false],
    ["Wessel","Duifhuis","GSCC Warehouse Clerk","Distribution","on-site",true],
    ["Ilse","Verkerk","GSCC Cust Experience Specialist","Customer Experience","partial",false],
    ["Bram","Roelofsen","GSCC Distribution Team Lead","Distribution","on-site",false],
    ["Sanne","Kolthoff","GSCC IT Sr Analyst","IT - EMEA","partial",false],
    ["Timo","Vermeulen","GSCC Pricing Sr Analyst","Pricing & Tenders","remote",false],
    ["Joris","Stevens","GSCC Rotating Kit Handling Assistant","Distribution","on-site",true],
    ["Maud","Hendriks","GSCC MedEd & Events Specialist","Marketing & Med Ed","partial",false],
    ["Lars","Wieringa","GSCC Field Svc Engineer","Sales NL South","remote",false],
    // the QARA pair the EMEA rule turns on: GSCC - QARA meets everyone, EMEA meets only these two
    ["Fenna","Bergsma","GSCC - QARA","Quality & Reg Affairs","partial",false],
    ["Margot","Lefevre","EMEA - QARA Commercial","Quality & Reg Affairs","remote",false],
    // a legacy role, to prove normalizeRole() migrates an existing user rather than stranding them
    ["Ruben","Vos","QARA Manager","Quality & Reg Affairs","partial",false],
  ].map(p => ({ uid:p[0]+p[1], name:p[0]+" "+p[1], first:p[0], role:p[2], dept:p[3], workClass:p[4], floor:p[5], color:col(), photo:null, points:20+Math.floor(Math.random()*70) }));

  // Demo icebreakers so the meetup "Talking points" card has something to show. Invented
  // answers for invented people (see the seed-name note above) — three Tier-2 questions each.
  const DEMO_ICE = [
    { id:"t2q23", question:"Beach, mountains or city?", answer:"Mountains, every time — quieter and better coffee." },
    { id:"t2q11", question:"What's your most useless talent?", answer:"I can name any Eurovision winner since 1998." },
    { id:"t2q25", question:"What's a small thing that always makes your day better?", answer:"The first coffee, before anyone emails." },
  ];
  const DEMO_LANGS = ["nl","en","ro","nl","en","ro","nl","en","ro","nl","ro","en","nl","ro","en"];
  USERS.forEach((u, i) => { u.icebreakers = DEMO_ICE.map(x => Object.assign({}, x));
    u.lang = DEMO_LANGS[i % DEMO_LANGS.length]; });   // BRIEF-023: show the language badge

  // Verbatim from Context/questions-source.md — see the live store for the tier contract.
  const QUESTIONS = [
    { id:"t1q1", text:"If you were CEO of Zimmer Biomet for a day, what's the first thing you'd change?", tier:1, count:0, text_nl:"Als je één dag CEO van Zimmer Biomet was, wat zou je dan als eerste veranderen?", text_ro:"Dacă ai fi CEO-ul Zimmer Biomet pentru o zi, care ar fi primul lucru pe care l-ai schimba?" },
    { id:"t1q2", text:"If you were site leader / departmental director for a week, what would you fix first?", tier:1, count:0, text_nl:"Als je een week lang vestigingsleider / afdelingsdirecteur was, wat zou je dan als eerste aanpakken?", text_ro:"Dacă ai fi timp de o săptămână șef punct de lucru / director de departament, ce problemă ai rezolva mai întâi?" },
    { id:"t1q3", text:"What's one thing another department is doing that we should be doing?", tier:1, count:0, text_nl:"Wat doet een andere afdeling dat wij ook zouden moeten doen?", text_ro:"Ce face un alt departament și ar trebui să facem și noi?" },
    { id:"t1q4", text:"What do you think other departments would say we do best – and worst?", tier:1, count:0, text_nl:"Wat zouden andere afdelingen volgens jou zeggen dat wij het beste doen – en het slechtste?", text_ro:"Ce crezi că ar spune alte departamente că facem cel mai bine – și cel mai puțin bine?" },
    { id:"t1q5", text:"What's the most valuable thing your department does that the rest of the business doesn't know about?", tier:1, count:0, text_nl:"Wat is het meest waardevolle dat jouw afdeling doet, maar dat de rest van het bedrijf niet weet?", text_ro:"Care este cel mai valoros lucru pe care îl face departamentul tău, dar despre care restul companiei nu știe?" },
    { id:"t1q6", text:"What's the one task in your week that feels like a waste of time – and how would you eliminate it?", tier:1, count:0, text_nl:"Welke taak in je week voelt als tijdverspilling – en hoe zou je die schrappen?", text_ro:"Care sarcină din săptămâna ta ți se pare o pierdere de timp – și cum ai elimina-o?" },
    { id:"t1q7", text:"Start / Stop / Continue: name one thing we should start doing, one we should stop, and one we should keep.", tier:1, count:0, text_nl:"Start / Stop / Doorgaan: noem één ding waar we mee moeten gaan beginnen, één waar we mee moeten stoppen en één wat we moeten behouden.", text_ro:"Start / Stop / Continuă: numește un lucru pe care ar trebui să începem să îl facem, unul pe care să nu îl mai facem și unul pe care să îl facem în continuare." },
    { id:"t1q8", text:"Where do things get \"stuck\" between your team and another team? What would unblock it?", tier:1, count:0, text_nl:"Waar loopt het \"vast\" tussen jouw team en een ander team? Wat zou dat vlot trekken?", text_ro:"Unde se \"blochează\" lucrurile între echipa ta și altă echipă? Ce anume ar debloca situația?" },
    { id:"t1q9", text:"If you had €10,000 -  €100,000 to improve your workplace, what would you spend it on?", tier:1, count:0, text_nl:"Als je €10.000 - €100.000 had om je werkplek te verbeteren, waar zou je het aan uitgeven?", text_ro:"Dacă ai avea €10.000 - €100.000 pentru a-ți îmbunătăți locul de muncă, pe ce i-ai cheltui?" },
    { id:"t1q10", text:"What's one process you've seen at a previous employer that would work well here?", tier:1, count:0, text_nl:"Welk proces heb je bij een vorige werkgever gezien dat hier goed zou werken?", text_ro:"Ce proces ai văzut la un angajator anterior și crezi că ar funcționa bine aici?" },
    { id:"t1q11", text:"What's the most common mistake or block do you see – and what causes it?", tier:1, count:0, text_nl:"Welke fout of blokkade zie je het vaakst – en wat is de oorzaak?", text_ro:"Care este cea mai frecventă greșeală sau blocaj pe care le observi – și care crezi că e cauza?" },
    { id:"t1q12", text:"What information do you need regularly that's hard to find or always arrives late?", tier:1, count:0, text_nl:"Welke informatie heb je regelmatig nodig die moeilijk te vinden is of altijd te laat komt?", text_ro:"De ce informații ai nevoie în mod frecvent, care sunt greu de găsit sau le primești mereu cu întârziere?" },
    { id:"t1q13", text:"How would you bring AI into your daily work if it were available tomorrow?", tier:1, count:0, text_nl:"Hoe zou je AI in je dagelijkse werk gebruiken als het morgen beschikbaar was?", text_ro:"Cum ai folosi inteligența artificială (AI) în munca ta zilnică, dacă ar fi disponibilă de mâine?" },
    { id:"t1q14", text:"What's one repetitive task you'd hand over to a robot or AI without a second thought?", tier:1, count:0, text_nl:"Welke repetitieve taak zou je zonder aarzelen aan een robot of AI overlaten?", text_ro:"Ce sarcină repetitivă ai preda unui robot sau unei forme de AI fără să stai pe gânduri?" },
    { id:"t1q15", text:"Which report, check or admin step could be automated so you can focus on more valuable work?", tier:1, count:0, text_nl:"Welk rapport, controle of administratieve stap zou geautomatiseerd kunnen worden zodat je je op waardevoller werk kunt richten?", text_ro:"Ce raport, verificare sau pas administrativ ar putea fi automatizate ca să te poți concentra pe o activitate mai valoroasă?" },
    { id:"t1q16", text:"Have you used ZB AI Portal and what are your thoughts? How could it improve?", tier:1, count:0, text_nl:"Heb je de ZB AI Portal al gebruikt en wat vind je ervan? Hoe kan het verbeteren?", text_ro:"Ai folosit Portalul AI ZB și ce părere ai? Cum ar putea fi îmbunătățit?" },
    { id:"t1q17", text:"What data do we collect that we're probably not using well enough?", tier:1, count:0, text_nl:"Welke gegevens verzamelen we die we waarschijnlijk niet goed genoeg benutten?", text_ro:"Ce date pe care le colectăm consideri că nu le folosim suficient de bine?" },
    { id:"t1q18", text:"What's the one piece of technology or equipment that would make your job easier?", tier:1, count:0, text_nl:"Welke technologie of welk gereedschap zou jouw werk makkelijker maken?", text_ro:"Ce tehnologie sau echipament ți-ar ușura munca?" },
    { id:"t1q19", text:"What's one thing that would make you look forward to coming to work more often?", tier:1, count:0, text_nl:"Wat zou ervoor zorgen dat je vaker met plezier naar je werk komt?", text_ro:"Ce lucru te-ar face să vii cu mai multă plăcere la muncă?" },
    { id:"t1q20", text:"Which two departments should talk to each other more, and about what?", tier:1, count:0, text_nl:"Welke twee afdelingen zouden meer met elkaar moeten praten, en waarover?", text_ro:"Care două departamente ar trebui să comunice mai mult și despre ce?" },
    { id:"t1q21", text:"What do new colleagues struggle with most in their first weeks – how could onboarding be better?", tier:1, count:0, text_nl:"Waar worstelen nieuwe collega's het meeste mee in hun eerste weken – hoe kan de onboarding beter?", text_ro:"Cu ce probleme se confruntă cel mai mult colegii noi în primele săptămâni – cum am putea face mai bună integrarea?" },
    { id:"t1q22", text:"What skill would you love to learn that would also help the company?", tier:1, count:0, text_nl:"Welke vaardigheid zou je graag leren die ook het bedrijf zou helpen?", text_ro:"Ce ți-ar plăcea să înveți nou și i-ar folosi și companiei noastre?" },
    { id:"t1q23", text:"How can management communicate better with the shop floor and commercial teams?", tier:1, count:0, text_nl:"Hoe kan het management beter communiceren met de werkvloer en de commerciële teams?", text_ro:"Cum ar putea conducerea să comunice mai bine cu personalul din depozit și cu echipele comerciale?" },
    { id:"t1q24", text:"What's one small thing that would noticeably improve the experience for other departments?", tier:1, count:0, text_nl:"Welk klein ding zou de ervaring voor andere afdelingen merkbaar verbeteren?", text_ro:"Ce lucru mărunt ar îmbunătăți considerabil experiența de lucru pentru alte departamente?" },
    { id:"t1q25", text:"If we could launch one new product, service or initiative in your department next year, what should it be?", tier:1, count:0, text_nl:"Als we volgend jaar één nieuw product, dienst of initiatief in jouw afdeling konden lanceren, wat zou dat moeten zijn?", text_ro:"Dacă am putea lansa un nou produs, serviciu sau inițiativă în departamentul tău anul viitor, care ar trebui să fie?" },
    { id:"t1q26", text:"A magic wand removes one rule, form or approval step tomorrow. Which one disappears, and what happens next?", tier:1, count:0, text_nl:"Een toverstok laat morgen één regel, formulier of goedkeuringsstap verdwijnen. Welke verdwijnt, en wat gebeurt er daarna?", text_ro:"O baghetă magică elimină mâine o regulă, un formular sau un pas de aprobare. Ce anume ar dispărea și care ar fi impactul?" },
    { id:"t1q27", text:"Imagine a new colleague from the year 2040 visits Hazeldonk. What would make them laugh at how we work today?", tier:1, count:0, text_nl:"Stel je voor dat een nieuwe collega uit het jaar 2040 Hazeldonk bezoekt. Waar zouden ze om lachen als ze zien hoe we vandaag werken?", text_ro:"Imaginează-ți că un coleg nou din anul 2040 vizitează Hazeldonk. Ce i s-ar părea amuzant la felul în care lucrăm astăzi?" },
    { id:"t1q28", text:"If our biggest customer were a 12-year-old, how would you explain what we do – and what would they think is silly?", tier:1, count:0, text_nl:"Als onze grootste klant een 12-jarige was, hoe zou je uitleggen wat we doen – en wat zouden ze maar raar vinden?", text_ro:"Dacă cel mai mare client al nostru ar fi un copil de 12 ani, cum i-ai explica ce facem – și ce i s-ar părea caraghios?" },
    { id:"t1q29", text:"Pitch a completely ridiculous product or service for ZB. Then tell us the one serious idea hiding inside it.", tier:1, count:0, text_nl:"Bedenk een compleet belachelijk product of dienst voor ZB. Vertel dan welk serieus idee er achter verstopt zit.", text_ro:"Propune un produs sau serviciu complet ridicol pentru ZB. Apoi spune-ne ideea serioasă ascunsă în el." },
    { id:"t1q30", text:"If your department were a sports team, what position is unfilled and who should we sign?", tier:1, count:0, text_nl:"Als jouw afdeling een sportteam was, welke positie is niet ingevuld en wie zouden we moeten aantrekken?", text_ro:"Dacă departamentul tău ar fi o echipă sportivă, ce poziție e neocupată și pe cine ar trebui să transferăm?" },
    { id:"t1q31", text:"You've been made Minister of Tuesdays. What's the one thing that would make every Tuesday at ZB better?", tier:1, count:0, text_nl:"Je bent benoemd tot Minister van Dinsdagen. Wat zou je doen om elke dinsdag bij ZB beter te maken?", text_ro:"Ai fost numit Ministrul Marților. Ce lucru ar face fiecare zi de marți mai bună la ZB?" },
    { id:"t1q32", text:"If we had to run the entire site with half the meetings, which ones survive and why?", tier:1, count:0, text_nl:"Als we de hele vestiging met de helft van de vergaderingen moesten runnen, welke blijven er over en waarom?", text_ro:"Dacă ar trebui să gestionăm întregul punct de lucru cu doar jumătate din ședințele actuale, care dintre ele ar rămâne și de ce?" },
    { id:"t1q33", text:"A robot starts on your team on Monday. Write its job description in three lines.", tier:1, count:0, text_nl:"Er begint maandag een robot in jouw team. Beschrijf zijn functieomschrijving in drie regels.", text_ro:"Un robot se alătură de luni echipei tale. Scrie-i fișa postului în trei rânduri." },
    { id:"t1q34", text:"What would you rename your job title to if it had to describe what you actually do?", tier:1, count:0, text_nl:"Hoe zou je je functietitel hernoemen als die moest beschrijven wat je écht doet?", text_ro:"Cum ți-ai redenumi funcția dacă ar trebui să descrie ce faci de fapt?" },
    { id:"t2q1", text:"What did you want to be when you were 10 years old?", tier:2, count:0, text_nl:"Wat wilde je worden toen je 10 jaar oud was?", text_ro:"Ce voiai să te faci când aveai 10 ani?" },
    { id:"t2q2", text:"What was your very first job, and what did it teach you?", tier:2, count:0, text_nl:"Wat was je allereerste baan, en wat heeft die je geleerd?", text_ro:"Care a fost prima ta slujbă și ce te-a învățat?" },
    { id:"t2q3", text:"What's the best piece of career advice you've ever received?", tier:2, count:0, text_nl:"Wat is het beste carrièreadvies dat je ooit hebt gekregen?", text_ro:"Care este cel mai bun sfat de carieră pe care l-ai primit vreodată?" },
    { id:"t2q4", text:"What's something you're surprisingly good at that has nothing to do with your job?", tier:2, count:0, text_nl:"Waar ben je verrassend goed in dat niets met je werk te maken heeft?", text_ro:"La ce te pricepi surprinzător de bine, deși nu are legătură cu jobul tău?" },
    { id:"t2q5", text:"What would your colleagues be surprised to learn about you?", tier:2, count:0, text_nl:"Waarover zouden je collega's verrast zijn om over je te weten te komen?", text_ro:"Ce ar surprinde colegii tăi să afle despre tine?" },
    { id:"t2q6", text:"What's your go-to way to switch off after a long day?", tier:2, count:0, text_nl:"Hoe ontspan je het liefst na een lange dag?", text_ro:"Care e modul tău preferat de a te deconecta după o zi lungă?" },
    { id:"t2q7", text:"What's the best trip you've ever taken – and where's next on the list?", tier:2, count:0, text_nl:"Wat is de mooiste reis die je ooit hebt gemaakt – en wat staat er als volgende op je lijst?", text_ro:"Care este cea mai frumoasă călătorie pe care ai făcut-o – și ce urmează pe listă?" },
    { id:"t2q8", text:"What's a hobby you've picked up (or dropped) in the last few years?", tier:2, count:0, text_nl:"Welke hobby heb je de afgelopen jaren opgepakt (of losgelaten)?", text_ro:"Ce hobby ai început (sau la care ai renunțat) în ultimii ani?" },
    { id:"t2q9", text:"What's your favourite thing to cook or eat – and who makes it best?", tier:2, count:0, text_nl:"Wat kook of eet je het liefst – en wie maakt het het lekkerst?", text_ro:"Ce îți place cel mai mult să gătești sau să mănânci – și cine îl prepară cel mai bine?" },
    { id:"t2q10", text:"Are you a morning person or a night owl – and does your job agree with that?", tier:2, count:0, text_nl:"Ben je een ochtendmens of een nachtbraker – en past je werk daarbij?", text_ro:"Ești genul care dă randament dimineața sau seara – și jobul tău se potrivește cu asta?" },
    { id:"t2q11", text:"What's your most useless talent?", tier:2, count:0, text_nl:"Wat is je meest nutteloze talent?", text_ro:"Care e cel mai inutil talent al tău?" },
    { id:"t2q12", text:"If you could have any animal as a colleague, which would it be and what job would it do?", tier:2, count:0, text_nl:"Als je elk dier als collega kon hebben, welk dier zou het zijn en welk werk zou het doen?", text_ro:"Dacă ai putea avea orice animal drept coleg, care ar fi și cu ce s-ar ocupa?" },
    { id:"t2q13", text:"What's the worst haircut or fashion choice you've ever made?", tier:2, count:0, text_nl:"Wat is het ergste kapsel of de ergste modekeuze die je ooit hebt gemaakt?", text_ro:"Care e cea mai proastă tunsoare sau alegere vestimentară pe care ai făcut-o vreodată?" },
    { id:"t2q14", text:"If you had to eat one meal every day for the rest of your life, what would it be?", tier:2, count:0, text_nl:"Als je de rest van je leven elke dag hetzelfde gerecht moest eten, wat zou het zijn?", text_ro:"Dacă ar trebui să mănânci același fel de mâncare în fiecare zi pentru tot restul vieții, care ar fi?" },
    { id:"t2q15", text:"What's a song you know every word to, even though you'd never admit it?", tier:2, count:0, text_nl:"Welk liedje ken je woord voor woord, ook al zou je het nooit toegeven?", text_ro:"Ce cântec știi cuvânt cu cuvânt, deși nu ai recunoaște niciodată?" },
    { id:"t2q16", text:"What's the strangest thing in your fridge or desk drawer right now?", tier:2, count:0, text_nl:"Wat is het vreemdste dat nu in je koelkast of bureaula ligt?", text_ro:"Care e cel mai ciudat lucru pe care îl ai acum în frigider sau în sertar?" },
    { id:"t2q17", text:"Which fictional character would be the best (or worst) colleague?", tier:2, count:0, text_nl:"Welk fictief personage zou de beste (of slechtste) collega zijn?", text_ro:"Ce personaj fictiv ar fi cel mai bun (sau cel mai rău) coleg?" },
    { id:"t2q18", text:"If your life were a film, who would play you and what would it be called?", tier:2, count:0, text_nl:"Als je leven een film was, wie zou jou spelen en hoe zou de film heten?", text_ro:"Dacă viața ta ar fi un film, cine te-ar juca și cum s-ar numi?" },
    { id:"t2q19", text:"Which emoji do you overuse?", tier:2, count:0, text_nl:"Welke emoji gebruik je te veel?", text_ro:"Ce emoji folosești în exces?" },
    { id:"t2q20", text:"Would you rather work four 10-hour days or five 8-hour days?", tier:2, count:0, text_nl:"Werk je liever vier dagen van 10 uur of vijf dagen van 8 uur?", text_ro:"Ai prefera să lucrezi patru zile de 10 ore sau cinci zile de 8 ore?" },
    { id:"t2q21", text:"Would you rather have unlimited coffee or unlimited holiday?", tier:2, count:0, text_nl:"Wat zou je liever hebben: onbeperkt koffie of onbeperkt vakantie?", text_ro:"Ai prefera cafea nelimitată sau concediu nelimitat?" },
    { id:"t2q22", text:"Would you rather be able to speak every language or play every instrument?", tier:2, count:0, text_nl:"Zou je liever elke taal kunnen spreken of elk instrument kunnen bespelen?", text_ro:"Ai prefera să poți vorbi orice limbă sau să cânți la orice instrument?" },
    { id:"t2q23", text:"Beach, mountains or city?", tier:2, count:0, text_nl:"Strand, bergen of stad?", text_ro:"Plajă, munte sau oraș?" },
    { id:"t2q24", text:"Team teleport or team invisibility – and how would you use it at work?", tier:2, count:0, text_nl:"Team teleportatie of team onzichtbaarheid – en hoe zou je het op werk gebruiken?", text_ro:"Echipa teleportare sau echipa invizibilitate – și cum ai folosi-o la muncă?" },
    { id:"t2q25", text:"What's a small thing that always makes your day better?", tier:2, count:0, text_nl:"Welk klein ding maakt je dag altijd beter?", text_ro:"Ce lucru mărunt îți face mereu ziua mai bună?" },
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

  const SEED_POSTS = [
    { names:"Anna & Mateo", scene:"walk",    hearts:12, comments:[{by:"Priya",text:"Love this @Anna!"}] },
    { names:"Priya & Tom",  scene:"lunch",   hearts:8,  comments:[] },
    { names:"Lena & Sven",  scene:"digital", hearts:15, comments:[{by:"Marco",text:"Great cross-team catch-up"}] },
    { names:"Ravi & Chloe", scene:"coffee",  hearts:6,  comments:[] },
    { names:"Marco & Ines", scene:"litter",  hearts:9,  comments:[] },
    { names:"Yuki & Ben",   scene:"coffee",  hearts:11, comments:[] },
  ];
  const slug = n => (n||"").toLowerCase().replace(/\s*&\s*/g,"-and-").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

  // ---- mutable demo state ----
  let ME = null;                 // profile once onboarded
  let MATCHES = [];              // {id,a,b,person,status,type,questionIds,questions,answers,photo,messages,createdAt}
  let NOTIFS = [];
  let POSTS = SEED_POSTS.map((p,i) => ({ id:"s"+(i+1), seed:true, names:p.names, scene:p.scene, photo:"assets/holding-demo-photos/"+slug(p.names)+".jpg", hearts:p.hearts, liked:false, comments:p.comments.map(c=>({...c})) }));
  const SIGNUP_BONUS = 30;
  const todayStr = () => new Date().toISOString().slice(0,10);
  // Day-stamped, like the live store: a previous day's record means today's free spin is unused.
  let SPIN = { date:"", freeAvailable:true };
  const normSpin = () => { if (SPIN.date !== todayStr()) SPIN = { date:todayStr(), freeAvailable:true }; return SPIN; };
  let mid = 1, wid = 100, nid = 1;
  const now = () => Date.now();
  const P = v => Promise.resolve(v);

  const ZB_STORE = {
    mode: "demo",
    ready: P(true),

    // ---- auth (demo: any credentials work; profile is null until onboarded) ----
    onAuth(cb) { this._authcb = cb; setTimeout(() => cb(this._email ? { uid:"me", email:this._email } : null), 0); },
    currentUser() { return this._email ? { uid:"me", email:this._email } : null; },
    signUp(email) {
      if (!window.ZB_DOMAIN_OK(email)) return Promise.reject({ code:"zb/domain-not-allowed" });
      this._email = email; if (this._authcb) this._authcb({ uid:"me", email }); return P(true);
    },
    signIn(email) { this._email = email; if (this._authcb) this._authcb({ uid:"me", email }); return P(true); },
    resetPassword() { return P(true); },
    signOut() { this._email = null; ME = null; MATCHES = []; NOTIFS = []; if (this._authcb) this._authcb(null); return P(true); },

    // ---- profile ----
    getMe() { return P(ME ? { ...ME } : null); },
    saveMe(partial) {
      ME = Object.assign(ME || { points:SIGNUP_BONUS, signupBonusGranted:true, lang:"en", color:"#0079BD" }, partial);   // BRIEF-017/023
      if (this._email && !ME.email) ME.email = this._email;
      if (this._authcb) this._authcb({ uid:"me", email:ME.email });
      return P({ ...ME });
    },
    isAdmin() { const e = (this._email||"").toLowerCase(); return P((window.ZB_CONFIG.ADMIN_EMAILS||[]).map(x=>x.toLowerCase()).includes(e)); },

    // ---- users / leaderboard ----
    listUsers() { return P(USERS.map(u => ({ ...u }))); },
    leaderboard() {
      const all = USERS.map(u => ({ name:u.name, points:u.points, color:u.color, photo:u.photo, me:false }));
      if (ME) all.push({ name:ME.name, points:ME.points, color:ME.color, photo:ME.photo, me:true });
      return P(all.sort((a,b) => b.points - a.points));
    },

    // ---- matches ----
    // Per-user view of each match: MY completion + MY photo award, plus the other side read-only.
    myMatches() {
      return P(MATCHES.map(m => Object.assign({}, m, {
        completed: !!(m.completedBy||{})["me"] || m.status === "completed",
        otherCompleted: !!(m.completedBy||{})[m.person.uid] || m.status === "completed",
        photoAwarded: !!(m.photoAwarded||{})["me"]
      })));
    },
    getMatch(id) { return P(MATCHES.find(m => m.id === id)); },
    // ---- spin economy (BRIEF-017) ----
    spinState() { const sp = normSpin(); return P({ points:(ME&&ME.points)||0, freeSpin:sp.freeAvailable }); },
    paySpin() {
      const sp = normSpin();
      if (sp.freeAvailable) { sp.freeAvailable = false; return P({ ok:true, free:true, points:(ME&&ME.points)||0 }); }
      if (ME && ME.points >= 1) { ME.points -= 1; return P({ ok:true, free:false, points:ME.points }); }
      return P({ ok:false, free:false, points:0 });        // blocked, never negative
    },
    grantFreeSpin() { const sp = normSpin(); sp.freeAvailable = true; return P(true); },
    claimSignupBonus() {
      if (!ME || ME.signupBonusGranted) return P(false);
      ME.signupBonusGranted = true; ME.points = (ME.points||0) + SIGNUP_BONUS; return P(true);
    },
    createMatch(other, type, questions) {
      // answers is sized to the questions actually asked (an admin can leave the bank <3)
      const m = { id:"m"+(mid++), a:"me", b:other.uid, person:other, status:"requested", type, questionIds:questions.map(q=>q.id||q.t), questions, answers:questions.map(()=>""), photo:null, completedBy:{}, photoAwarded:{}, postId:null, messages:[], createdAt:now() };
      MATCHES.push(m);
      // DEMO: simulate the other person accepting shortly after
      setTimeout(() => {
        const mm = MATCHES.find(x => x.id === m.id);
        if (mm && mm.status === "requested") { mm.status = "active"; this._notify({ type:"accept", icon:"check", text:other.name+" accepted your match! Open the shared space to coordinate.", target:"meet:"+mm.id }); if (this._change) this._change(); }
      }, 1600);
      return P(m.id);
    },
    acceptMatch(id) { const m = MATCHES.find(x=>x.id===id); if (m) m.status = "active"; return P(true); },
    declineMatch(id) { MATCHES = MATCHES.filter(x=>x.id!==id); return P(true); },
    sendMessage(id, text) {
      const m = MATCHES.find(x=>x.id===id); if (!m) return P(false);
      m.messages.push({ by:"me", text, at:now() });
      // DEMO: canned reply
      setTimeout(() => {
        const r = ["Sounds good! Tomorrow 10:30 by the coffee machine?","Perfect, see you then!","Great — looking forward to it."];
        m.messages.push({ by:"them", text:r[Math.floor(Math.random()*r.length)], at:now() });
        if (this._viewing !== "thread:"+id) m.unread = (m.unread||0)+1;
        this._notify({ type:"msg", icon:"chat", text:m.person.name+" replied to your message", target:"thread:"+id });
        if (this._change) this._change();
      }, 1400);
      return P(true);
    },
    // One shared photo per meetup — either participant may set or replace it.
    // First photo = +5 to BOTH participants, once. Replacing it never re-awards.
    setMatchPhoto(id, photo, post) {
      const m = MATCHES.find(x=>x.id===id); if (!m) return P(true);
      m.photo = photo || null;
      // A photo can now arrive AFTER completion (questions-only completion is legal since
      // BRIEF-005), so the single wall post has to catch up: refresh it if it exists, or
      // create it if this meetup was completed without one. Still one post per meetup.
      if (photo && Object.keys(m.completedBy||{}).length) {
        const existing = m.postId ? POSTS.find(x=>x.id===m.postId) : null;
        if (existing) existing.photo = photo;
        else if (post) {
          const pid = "p"+(wid++);
          POSTS.unshift({ id:pid, seed:false, matchId:id, names:post.names, scene:post.scene, photo, hearts:0, liked:false, comments:[] });
          m.postId = pid;
        }
      }
      if (photo && !m.photoAwarded["me"]) { m.photoAwarded["me"] = true; if (ME) ME.points += 5; }
      // the demo simulates the other participant's client claiming their own +5
      if (photo && !m.photoAwarded[m.person.uid]) {
        m.photoAwarded[m.person.uid] = true;
        const u = USERS.find(x=>x.uid===m.person.uid); if (u) u.points += 5;
      }
      return P(true);
    },
    // Claim MY unclaimed +5 for a shared photo the other person added (live: each client claims its own).
    claimPhotoAward(id) {
      const m = MATCHES.find(x=>x.id===id); if (!m || !m.photo) return P(false);
      if (m.photoAwarded["me"]) return P(false);
      m.photoAwarded["me"] = true; if (ME) ME.points += 5; return P(true);
    },
    setMatchAnswers(id, answers) { const m = MATCHES.find(x=>x.id===id); if (m) m.answers = answers; return P(true); },
    // Completes only the CALLING user's side and awards only their own questions (+5).
    // The other participant's points never move here — they complete their own part.
    completeMatch(id, post) {
      const m = MATCHES.find(x=>x.id===id); if (!m) return P(false);
      if (m.completedBy["me"]) return P(false);            // my part is already done
      m.completedBy["me"] = now();
      if (ME) ME.points += 5;                              // my 3 answers
      m.questions.forEach(q => { const b = QUESTIONS.find(x => x.text === (q.t||q.text)); if (b) b.count++; });
      // match-level "completed" only once BOTH sides are in (keeps it out of no-repeat matching either way)
      if (m.completedBy[m.person.uid]) { m.status = "completed"; m.completedAt = now(); }
      const shared = typeof m.photo === "string" ? m.photo : null;
      const photo = post.photo || shared || null;
      if (!m.postId && photo) {                            // ONE wall post per meetup
        const pid = "p"+(wid++);
        POSTS.unshift({ id:pid, seed:false, matchId:id, names:post.names, scene:post.scene, photo, hearts:0, liked:false, comments:[] });
        m.postId = pid;
      }
      return P(true);
    },

    // ---- wall ----
    listPosts() { return P(POSTS.map(p => ({ ...p }))); },
    heartPost(id) { const w = POSTS.find(x=>x.id===id); if (w) { w.liked = !w.liked; w.hearts += w.liked ? 1 : -1; } return P(true); },
    // byUid, not a display name — see the live store. "me" is the demo store's own uid.
    commentPost(id, text) { const w = POSTS.find(x=>x.id===id); if (w) w.comments.push({ byUid:"me", text, at:now() }); return P(true); },

    // ---- notifications ----
    listNotifs() { return P(NOTIFS.map(n => ({ ...n }))); },
    _notify(o) { NOTIFS.unshift(Object.assign({ id:"n"+(nid++), read:false, fromUid:null, at:now() }, o)); },
    markNotifsRead() { NOTIFS.forEach(n => n.read = true); return P(true); },
    markNotifRead(id) { const n = NOTIFS.find(x=>String(x.id)===String(id)); if (n) n.read = true; return P(true); },
    welcome() { this._notify({ type:"welcome", icon:"users", text:"Welcome to ZB MeetUP! Tap Spin to find your first match.", target:"spin" }); return P(true); },

    // ---- questions / admin ----
    questionBank() { return P(QUESTIONS.map(q => ({ ...q }))); },
    // ---- question bank: real editable records (BRIEF-008), mirroring the live store ----
    seedQuestionBank() {
      const e = (this._email||"").toLowerCase();
      if (!(window.ZB_CONFIG.ADMIN_EMAILS||[]).map(x=>x.toLowerCase()).includes(e))
        return Promise.reject({ code:"zb/not-admin", message:"Admins only" });
      return P(false);        // the demo list is already editable in place
    },
    // ---- icebreakers (BRIEF-020), mirroring the live store ----
    saveIcebreakers(list) { if (ME) ME.icebreakers = list || []; return P(true); },
    claimIcebreakerBonus() {
      if (!ME || ME.icebreakerBonusGranted) return P(false);
      if ((ME.icebreakers||[]).filter(x => x && (x.answer||"").trim()).length < 3) return P(false);
      ME.icebreakerBonusGranted = true; ME.points = (ME.points||0) + 10; return P(true);
    },
    addQuestion(text, tier) {
      QUESTIONS.push({ id:"q"+(Date.now().toString(36)), text, tier:(tier===1?1:2), count:0 });
      return P(true);
    },
    updateQuestion(id, patch) {
      const q = QUESTIONS.find(x => x.id === id); if (!q) return P(false);
      if (typeof patch.text === "string") q.text = patch.text;
      if (typeof patch.text_nl === "string") q.text_nl = patch.text_nl;
      if (typeof patch.text_ro === "string") q.text_ro = patch.text_ro;
      if (patch.tier === 1 || patch.tier === 2) q.tier = patch.tier;
      return P(true);
    },
    deleteQuestion(id) {
      const i = QUESTIONS.findIndex(x => x.id === id); if (i < 0) return P(false);
      QUESTIONS.splice(i,1); return P(true);
    },
    // ---- admin: the idea bank (same shape as the live store) ----
    adminAnswers() {
      const e = (this._email||"").toLowerCase();
      if (!(window.ZB_CONFIG.ADMIN_EMAILS||[]).map(x=>x.toLowerCase()).includes(e))
        return Promise.reject({ code:"zb/not-admin", message:"Admins only" });
      const byQ = new Map();
      MATCHES.forEach(m => {
        const qs = m.questions || [];
        (m.answers || []).forEach((text, i) => {
          text = (text || "").trim(); if (!text) return;
          const q = qs[i] || {}; const key = q.id || q.t || ("q" + i);
          if (!byQ.has(key)) byQ.set(key, { id:key, text:q.t || "(question not recorded)", tier:q.tier || null, answers:[] });
          byQ.get(key).answers.push({
            text, by:(ME && ME.name) || "You", byUid:"me", type:m.type || "",
            date:new Date(m.completedAt || m.createdAt || Date.now()).toISOString().slice(0,10), matchId:m.id });
        });
      });
      // same as live: group by id, label with the question's current wording
      const current = {}; QUESTIONS.forEach(q => current[q.id] = q.text);
      const questions = [...byQ.values()].map(q => Object.assign({}, q, {
        count:q.answers.length, text:current[q.id] || q.text })).sort((a,b) => b.count - a.count);
      return P({ questions, totalAnswers:questions.reduce((n,q)=>n+q.count,0), totalMatches:MATCHES.length });
    },
    listBugs() { return P((this._bugs||[]).slice()); },
    sendBug(text) { this._bugs = this._bugs || []; this._bugs.unshift({ by:ME ? ME.name : "You", text, at:new Date().toLocaleDateString() }); return P(true); },
    unreadMatches() { return P(MATCHES.filter(m => m.unread).reduce((s,m)=>s+m.unread,0)); },
    clearMatchUnread(id) { const m = MATCHES.find(x=>x.id===id); if (m) m.unread = 0; return P(true); },
    clearNotifs() { NOTIFS.forEach(n => n.read = true); return P(true); },
    deleteAccount() { return this.signOut(); },

    // app registers callbacks so async demo events (accept/reply) can trigger a re-render
    onChange(cb) { this._change = cb; },
    setViewing(v) { this._viewing = v; },
  };

  window.ZB_STORE = ZB_STORE;
})();
