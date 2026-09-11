/* ============================================================
   ZB MeetUP — core UI copy in English / Dutch / Romanian.

   ONE dictionary: { key: { en, nl, ro } }. English is canonical and is
   always the fallback — a missing key or a missing language renders the
   English string, never a blank.

   SCOPED DELIBERATELY (BRIEF-023): the high-traffic surfaces only —
   onboarding, the icebreaker step, How It Works, spin/match, the meetup
   shared space, consent. Admin and low-traffic screens stay English for
   now; a full extraction before launch was judged too much regression
   risk.

   NL/RO are MACHINE-TRANSLATION DRAFTS pending native review (Dutch:
   Donnae; Romanian: a native speaker). Wording is expected to change —
   nothing in the app depends on the exact strings.
   ============================================================ */
window.ZB_I18N = {
  /* --- languages --- */
  lang_en:{en:"English",nl:"Engels",ro:"Engleză"},
  lang_nl:{en:"Dutch",nl:"Nederlands",ro:"Olandeză"},
  lang_ro:{en:"Romanian",nl:"Roemeens",ro:"Română"},
  lang_q:{en:"What language would you like to use?",nl:"Welke taal wil je gebruiken?",ro:"Ce limbă vrei să folosești?"},
  lang_sub:{en:"You can change this any time on your profile.",nl:"Je kunt dit altijd aanpassen in je profiel.",ro:"Poți schimba oricând din profilul tău."},
  lang_label:{en:"Language",nl:"Taal",ro:"Limbă"},

  /* --- common actions --- */
  continue:{en:"Continue",nl:"Doorgaan",ro:"Continuă"},
  save:{en:"Save",nl:"Opslaan",ro:"Salvează"},
  back:{en:"Back",nl:"Terug",ro:"Înapoi"},
  cancel:{en:"Cancel",nl:"Annuleren",ro:"Anulează"},
  skip_now:{en:"Skip for now",nl:"Nu nog niet",ro:"Mai târziu"},

  /* --- onboarding --- */
  ob_welcome_h:{en:"Welcome to ZB MeetUP",nl:"Welkom bij ZB MeetUP",ro:"Bine ai venit la ZB MeetUP"},
  ob_welcome_sub:{en:"Meet a new colleague each day — coffee, a walk, or a quick call. Let's get you set up.",nl:"Ontmoet elke dag een nieuwe collega — koffie, een wandeling of een kort gesprek. We zetten je account klaar.",ro:"Cunoaște un coleg nou în fiecare zi — o cafea, o plimbare sau un apel scurt. Hai să îți configurăm contul."},
  ob_email:{en:"Work email",nl:"Werk-e-mail",ro:"E-mail de serviciu"},
  ob_pass:{en:"Password",nl:"Wachtwoord",ro:"Parolă"},
  ob_pass_hint:{en:"At least 6 characters",nl:"Minimaal 6 tekens",ro:"Cel puțin 6 caractere"},
  ob_create:{en:"Create account",nl:"Account aanmaken",ro:"Creează cont"},
  ob_have_account:{en:"I already have an account — sign in",nl:"Ik heb al een account — inloggen",ro:"Am deja un cont — conectează-mă"},
  ob_forgot:{en:"Forgot password?",nl:"Wachtwoord vergeten?",ro:"Ai uitat parola?"},
  ob_name_h:{en:"What's your name?",nl:"Wat is je naam?",ro:"Cum te numești?"},
  ob_name_sub:{en:"This is how colleagues will see you.",nl:"Zo zien collega's je.",ro:"Așa te vor vedea colegii."},
  ob_name_ph:{en:"First and last name",nl:"Voor- en achternaam",ro:"Prenume și nume"},
  ob_role_h:{en:"Your role",nl:"Je functie",ro:"Rolul tău"},
  ob_role_sub:{en:"Your role and work setup — this is how we match you with the right colleagues.",nl:"Je functie en werkplek — hiermee koppelen we je aan de juiste collega's.",ro:"Rolul și modul de lucru — astfel te punem în legătură cu colegii potriviți."},
  ob_role_label:{en:"Your role",nl:"Je functie",ro:"Rolul tău"},
  ob_role_ph:{en:"Select your role…",nl:"Kies je functie…",ro:"Alege rolul tău…"},
  ob_role_required:{en:"Please choose your role",nl:"Kies je functie",ro:"Te rugăm să îți alegi rolul"},
  ob_wc_label:{en:"Work setup",nl:"Werkplek",ro:"Mod de lucru"},
  ob_wc_warehouse:{en:"GSCC Warehouse — On-site (floor)",nl:"GSCC Warehouse — op locatie (werkvloer)",ro:"Depozit GSCC — la sediu (în hală)"},
  ob_wc_onsite:{en:"On-site (office / desk)",nl:"Op locatie (kantoor)",ro:"La sediu (birou)"},
  ob_wc_partial:{en:"Partially remote",nl:"Deels op afstand",ro:"Parțial la distanță"},
  ob_wc_remote:{en:"Fully remote",nl:"Volledig op afstand",ro:"Complet la distanță"},
  ob_photo_h:{en:"Add a photo",nl:"Voeg een foto toe",ro:"Adaugă o poză"},
  ob_photo_sub:{en:"Take a photo or choose one — or keep your initials.",nl:"Maak een foto of kies er een — of houd je initialen.",ro:"Fă o poză sau alege una — sau păstrează iniţialele."},
  ob_photo_add:{en:"Add a photo",nl:"Foto toevoegen",ro:"Adaugă poză"},
  ob_photo_change:{en:"Change photo",nl:"Foto wijzigen",ro:"Schimbă poza"},
  ob_colour:{en:"…or pick an avatar colour",nl:"…of kies een avatarkleur",ro:"…sau alege o culoare de avatar"},
  ob_consent_h:{en:"One quick thing",nl:"Nog even dit",ro:"Un singur lucru"},
  ob_consent_sub:{en:"Your consent, so the app can work.",nl:"Je toestemming, zodat de app kan werken.",ro:"Consimțământul tău, ca aplicația să funcționeze."},
  ob_consent_tick:{en:"I understand and consent (GDPR).",nl:"Ik begrijp het en geef toestemming (AVG).",ro:"Am înțeles și îmi dau consimțământul (GDPR)."},
  ob_consent_need:{en:"Please tick consent to continue",nl:"Vink toestemming aan om door te gaan",ro:"Bifează consimțământul pentru a continua"},

  /* --- consent copy (the three-way split) --- */
  consent_intro:{en:"ZB MeetUP stores your profile, meetup photos and your answers so the app works.",nl:"ZB MeetUP bewaart je profiel, meetup-foto's en je antwoorden zodat de app werkt.",ro:"ZB MeetUP păstrează profilul, pozele de la întâlniri și răspunsurile tale pentru ca aplicația să funcționeze."},
  consent_photos:{en:"Meetup photos appear on the community wall.",nl:"Meetup-foto's verschijnen op de community-wall.",ro:"Pozele de la întâlniri apar pe peretele comunității."},
  consent_answers:{en:"Your meetup discussion answers are private to you and are reviewed by admins — they form the idea bank behind the prize.",nl:"Je antwoorden op de gespreksvragen zijn privé en worden door beheerders bekeken — ze vormen de ideeënbank achter de prijs.",ro:"Răspunsurile tale la întrebările de discuție sunt private și sunt analizate de administratori — formează banca de idei din spatele premiului."},
  consent_ice:{en:"Your icebreaker answers are shown only to colleagues you match with, as talking points. They are not collected by admins and not exported.",nl:"Je ijsbreker-antwoorden zijn alleen te zien voor collega's met wie je gematcht wordt, als gespreksonderwerp. Ze worden niet verzameld door beheerders en niet geëxporteerd.",ro:"Răspunsurile tale la întrebările de cunoaștere sunt vizibile doar colegilor cu care ești pus în legătură, ca subiecte de conversație. Nu sunt colectate de administratori și nu sunt exportate."},
  consent_delete:{en:"You can change or delete your answers, and delete your account, at any time.",nl:"Je kunt je antwoorden altijd wijzigen of verwijderen, en je account verwijderen.",ro:"Poți modifica sau șterge răspunsurile și îți poți șterge contul oricând."},

  /* --- icebreakers --- */
  ice_h:{en:"A little about you",nl:"Iets over jou",ro:"Câteva lucruri despre tine"},
  ice_sub:{en:"Three quick icebreakers so colleagues have something to talk about when you meet — answer all three and earn 10 points. Shared only with the people you match with — never on the wall, and not collected by admins.",nl:"Drie korte ijsbrekers zodat collega's iets hebben om over te praten als je elkaar ontmoet — antwoord op alle drie en verdien 10 punten. Alleen gedeeld met collega's met wie je gematcht wordt — nooit op de wall, en niet verzameld door beheerders.",ro:"Trei întrebări scurte, ca să aveți despre ce vorbi când vă întâlniți — răspunde la toate trei și primești 10 puncte. Vizibile doar colegilor cu care ești pus în legătură — niciodată pe perete și nu sunt colectate de administratori."},
  ice_note:{en:"Keep it work-appropriate — these are shown to colleagues you'll be meeting. You can change them later on the You screen.",nl:"Houd het gepast voor werk — collega's die je ontmoet zien dit. Je kunt het later aanpassen op het Jij-scherm.",ro:"Păstrează un ton potrivit pentru muncă — colegii pe care îi vei întâlni le vor vedea. Le poți schimba mai târziu în ecranul Tu."},
  ice_save_bonus:{en:"Save — earn 10 points",nl:"Opslaan — verdien 10 punten",ro:"Salvează — primești 10 puncte"},
  ice_answer_ph:{en:"Your answer…",nl:"Jouw antwoord…",ro:"Răspunsul tău…"},
  ice_break_h:{en:"Break the ice",nl:"Breek het ijs",ro:"Sparge gheața"},
  ice_break_sub:{en:"Answer 3 quick questions about yourself and earn 10 points. They're shown only to colleagues you match with — a head start on the conversation.",nl:"Beantwoord 3 korte vragen over jezelf en verdien 10 punten. Alleen te zien voor collega's met wie je gematcht wordt — een vliegende start van het gesprek.",ro:"Răspunde la 3 întrebări scurte despre tine și primești 10 puncte. Vizibile doar colegilor cu care ești pus în legătură — un start bun pentru conversație."},
  ice_answer3:{en:"Answer 3 questions",nl:"Beantwoord 3 vragen",ro:"Răspunde la 3 întrebări"},
  ice_finish:{en:"Finish your icebreakers",nl:"Maak je ijsbrekers af",ro:"Termină întrebările de cunoaștere"},
  ice_yours:{en:"Your icebreakers",nl:"Jouw ijsbrekers",ro:"Întrebările tale de cunoaștere"},
  ice_yours_sub:{en:"Shown to colleagues you match with, as talking points.",nl:"Te zien voor collega's met wie je gematcht wordt, als gespreksonderwerp.",ro:"Vizibile colegilor cu care ești pus în legătură, ca subiecte de conversație."},
  ice_edit:{en:"Edit answers",nl:"Antwoorden wijzigen",ro:"Editează răspunsurile"},

  /* --- spin / match --- */
  spin_today:{en:"TODAY'S MATCH",nl:"MATCH VAN VANDAAG",ro:"POTRIVIREA DE AZI"},
  spin_idle_h:{en:"Spin to meet someone new",nl:"Draai om iemand nieuws te ontmoeten",ro:"Învârte ca să cunoști pe cineva nou"},
  spin_matched_h:{en:"You matched!",nl:"Je hebt een match!",ro:"Ai o potrivire!"},
  spin_idle_sub:{en:"Tap the button below and we'll find you a colleague to grab a coffee or a call with.",nl:"Tik op de knop en we zoeken een collega voor een koffie of een gesprek.",ro:"Apasă butonul și îți găsim un coleg pentru o cafea sau un apel."},
  spin_btn:{en:"Spin the wheel",nl:"Draai het rad",ro:"Învârte roata"},
  spin_again_free:{en:"Spin again (free)",nl:"Opnieuw draaien (gratis)",ro:"Învârte din nou (gratis)"},
  spin_again_cost:{en:"Spin again (−1 pt)",nl:"Opnieuw draaien (−1 pt)",ro:"Învârte din nou (−1 pct)"},
  spin_send_to:{en:"Send request to",nl:"Verzoek sturen naar",ro:"Trimite cerere către"},
  spin_suggested:{en:"Suggested:",nl:"Voorstel:",ro:"Sugestie:"},
  spin_free_line:{en:"This spin is free.",nl:"Deze draai is gratis.",ro:"Această învârtire este gratuită."},
  spin_out:{en:"You're out of points — send a request, or earn points by meeting someone.",nl:"Je punten zijn op — stuur een verzoek of verdien punten door iemand te ontmoeten.",ro:"Ai rămas fără puncte — trimite o cerere sau câștigă puncte întâlnind pe cineva."},

  /* --- meetup shared space --- */
  meet_with:{en:"Meetup with",nl:"Meetup met",ro:"Întâlnire cu"},
  meet_shared:{en:"A shared space you both fill in",nl:"Een gedeelde ruimte die jullie samen invullen",ro:"Un spațiu comun pe care îl completați împreună"},
  meet_plan:{en:"Plan your meetup",nl:"Plan je meetup",ro:"Planifică întâlnirea"},
  meet_talking:{en:"Talking points",nl:"Gespreksonderwerpen",ro:"Subiecte de conversație"},
  meet_log:{en:"Log your meetup below — add a photo and answer the questions together, during or just after you meet, to earn your points.",nl:"Leg je meetup hieronder vast — voeg een foto toe en beantwoord de vragen samen, tijdens of net na de ontmoeting, om je punten te verdienen.",ro:"Înregistrează întâlnirea mai jos — adaugă o poză și răspundeți împreună la întrebări, în timpul sau imediat după întâlnire, ca să primiți punctele."},
  meet_photo_h:{en:"1 · Share a photo",nl:"1 · Deel een foto",ro:"1 · Împarte o poză"},
  meet_photo_sub:{en:"A quick pic of the two of you — or a Teams screenshot. One photo per meetup: either of you can add it, and you both see it.",nl:"Een snelle foto van jullie samen — of een Teams-screenshot. Eén foto per meetup: ieder van jullie kan hem toevoegen en jullie zien hem beiden.",ro:"O poză rapidă cu voi doi — sau o captură din Teams. O poză pe întâlnire: oricare dintre voi o poate adăuga și o vedeți amândoi."},
  meet_photo_add:{en:"Add meetup photo",nl:"Meetup-foto toevoegen",ro:"Adaugă poza întâlnirii"},
  meet_q_h:{en:"2 · Discussion questions",nl:"2 · Gespreksvragen",ro:"2 · Întrebări de discuție"},
  meet_q_private:{en:"Your answers stay private (admins only). The photo goes to the community wall.",nl:"Je antwoorden blijven privé (alleen beheerders). De foto komt op de community-wall.",ro:"Răspunsurile tale rămân private (doar administratorii). Poza ajunge pe peretele comunității."},
  meet_complete:{en:"Complete my part",nl:"Mijn deel afronden",ro:"Finalizează partea mea"},
  meet_complete_hint:{en:"Answer all 3 questions to complete your part.",nl:"Beantwoord alle 3 de vragen om je deel af te ronden.",ro:"Răspunde la toate 3 întrebările pentru a finaliza partea ta."},

  /* --- meetup leftovers (BRIEF-023A) --- */
  q_answer_ph:{en:"Your answer…",nl:"Jouw antwoord…",ro:"Răspunsul tău…"},
  key_idea:{en:"key idea",nl:"kernidee",ro:"idee-cheie"},
  meet_waiting:{en:"Waiting on {name} to finish their part — your points don't depend on it.",nl:"Wachten tot {name} zijn of haar deel afrondt — jouw punten zijn daar niet van afhankelijk.",ro:"Se așteaptă ca {name} să își finalizeze partea — punctele tale nu depind de asta."},
  meet_partner_done:{en:"{name} has finished their part.",nl:"{name} heeft zijn of haar deel afgerond.",ro:"{name} și-a finalizat partea."},
  meet_complete_ok:{en:"That's your +5 for the questions — the photo earns its own +5.",nl:"Dat is jouw +5 voor de vragen — de foto levert zijn eigen +5 op.",ro:"Acesta este +5 pentru întrebări — poza aduce propriile +5."},
  recap_your_answers:{en:"Your answers",nl:"Jouw antwoorden",ro:"Răspunsurile tale"},
  recap_private:{en:"Only you (and admins) can see these — never the other participant.",nl:"Alleen jij (en beheerders) kunnen deze zien — nooit de andere deelnemer.",ro:"Doar tu (și administratorii) le puteți vedea — niciodată celălalt participant."},
  recap_not_answered:{en:"Not answered",nl:"Niet beantwoord",ro:"Fără răspuns"},
  recap_photo:{en:"The photo",nl:"De foto",ro:"Poza"},
  recap_no_photo:{en:"No photo was added for this meetup.",nl:"Er is geen foto toegevoegd voor deze meetup.",ro:"Nu a fost adăugată nicio poză pentru această întâlnire."},
  recap_photo_note:{en:"One photo per meetup — either of you can change it, and it updates on the community wall for both.",nl:"Eén foto per meetup — ieder van jullie kan hem wijzigen en hij wordt voor jullie beiden bijgewerkt op de community-wall.",ro:"O poză pe întâlnire — oricare dintre voi o poate schimba și se actualizează pe peretele comunității pentru amândoi."},

  /* --- messages --- */
  msgs_h:{en:"Messages",nl:"Berichten",ro:"Mesaje"},
  msgs_card_sub:{en:"Coordinate your meetups with your matches",nl:"Stem je meetups af met je matches",ro:"Pune la punct întâlnirile cu potrivirile tale"},
  msgs_new:{en:"{n} new",nl:"{n} nieuw",ro:"{n} noi"},
  msgs_sub:{en:"Your match chats appear here.",nl:"Je matchgesprekken verschijnen hier.",ro:"Conversațiile cu potrivirile tale apar aici."},
  msgs_none:{en:"No chats yet — accept a match to start talking.",nl:"Nog geen gesprekken — accepteer een match om te beginnen.",ro:"Încă nicio conversație — acceptă o potrivire ca să începi."},
  msgs_convos:{en:"Your match conversations.",nl:"Je matchgesprekken.",ro:"Conversațiile tale."},
  msgs_say_hi:{en:"Say hi and pick a time",nl:"Zeg hallo en kies een tijd",ro:"Salută și stabiliți o oră"},
  msgs_ph:{en:"Message {name}…",nl:"Bericht aan {name}…",ro:"Mesaj pentru {name}…"},
  back_to_meetup:{en:"Back to meetup",nl:"Terug naar meetup",ro:"Înapoi la întâlnire"},

  /* --- wall --- */
  wall_h:{en:"Community wall",nl:"Community-wall",ro:"Peretele comunității"},
  wall_sub:{en:"Celebrating meetups across ZB.",nl:"We vieren meetups binnen heel ZB.",ro:"Sărbătorim întâlnirile din tot ZB."},
  wall_motd:{en:"Match of the day",nl:"Match van de dag",ro:"Potrivirea zilei"},
  wall_comment_ph:{en:"Add a comment… use @ to mention",nl:"Voeg een reactie toe… gebruik @ om iemand te noemen",ro:"Adaugă un comentariu… folosește @ pentru a menționa"},
  wall_just_now:{en:"just now",nl:"net nu",ro:"chiar acum"},

  /* --- leaderboard + prizes --- */
  ranks_h:{en:"Leaderboard",nl:"Ranglijst",ro:"Clasament"},
  ranks_sub:{en:"Getting to know colleagues, one meetup at a time.",nl:"Collega's leren kennen, één meetup per keer.",ro:"Ne cunoaștem colegii, o întâlnire pe rând."},
  prize_chip:{en:"Prizes · winners announced end of October 2026",nl:"Prijzen · winnaars bekend eind oktober 2026",ro:"Premii · câștigătorii anunțați la sfârșitul lui octombrie 2026"},
  prize_body:{en:"Every meetup earns you points — but there's more. A panel of <b>CB management judges</b> will pick the best <b>idea</b> shared in the discussions. Win <b>€250 for the best idea</b>, <b>€250</b> for topping the leaderboard, or <b>€150</b> as runner-up. Get to know your colleagues, brainstorm some fun ideas — and help make an impact on people's lives.",nl:"Elke meetup levert je punten op — maar er is meer. Een panel van <b>CB management judges</b> kiest het beste <b>idee</b> uit de gesprekken. Win <b>€250 voor het beste idee</b>, <b>€250</b> voor de hoogste plek op de ranglijst of <b>€150</b> als tweede. Leer je collega's kennen, bedenk samen leuke ideeën — en help impact te maken op het leven van mensen.",ro:"Fiecare întâlnire îți aduce puncte — dar mai e ceva. Un juriu de <b>CB management judges</b> va alege cea mai bună <b>idee</b> din discuții. Câștigă <b>€250 pentru cea mai bună idee</b>, <b>€250</b> pentru primul loc în clasament sau <b>€150</b> ca vicecampion. Cunoaște-ți colegii, gândiți idei bune împreună — și contribuiți la viețile oamenilor."},
  prize_best:{en:"BEST IDEA",nl:"BESTE IDEE",ro:"CEA MAI BUNĂ IDEE"},
  prize_top:{en:"TOP OF BOARD",nl:"HOOGSTE SCORE",ro:"PRIMUL LOC"},
  prize_runner:{en:"RUNNER-UP",nl:"TWEEDE PLAATS",ro:"LOCUL DOI"},

  /* --- notifications --- */
  notifs_h:{en:"Notifications",nl:"Meldingen",ro:"Notificări"},
  notifs_sub:{en:"Tap one to jump to it.",nl:"Tik erop om er naartoe te gaan.",ro:"Apasă pe una ca să ajungi acolo."},
  notifs_clear:{en:"Clear all",nl:"Alles wissen",ro:"Șterge tot"},
  notifs_none:{en:"You're all caught up.",nl:"Je bent helemaal bij.",ro:"Ești la zi."},
  notif_request:{en:"{name} wants to meet you — open Meetups to accept.",nl:"{name} wil je ontmoeten — open Meetups om te accepteren.",ro:"{name} vrea să te cunoască — deschide Întâlniri pentru a accepta."},
  notif_accept:{en:"{name} accepted your match! Open the shared space to coordinate.",nl:"{name} heeft je match geaccepteerd! Open de gedeelde ruimte om af te stemmen.",ro:"{name} a acceptat potrivirea! Deschide spațiul comun ca să vă puneți de acord."},
  notif_msg:{en:"{name} sent you a message",nl:"{name} heeft je een bericht gestuurd",ro:"{name} ți-a trimis un mesaj"},
  notif_welcome:{en:"Welcome to ZB MeetUP! Tap Spin to find your first match.",nl:"Welkom bij ZB MeetUP! Tik op Spin om je eerste match te vinden.",ro:"Bine ai venit la ZB MeetUP! Apasă Învârte pentru prima potrivire."},

  /* --- how it works (step bodies) --- */
  hiw_1_t:{en:"Get matched",nl:"Word gematcht",ro:"Fii pus în legătură"},
  hiw_1_b:{en:"Each day, tap Spin to be paired with a colleague from a different part of the business. Matches are made so they work for on-site and remote people alike. You start with a 30-point welcome bonus, and your first spin each day is free — spinning again to swap colleague costs 1 point, so give whoever comes up a chance.",nl:"Tik elke dag op Spin om gekoppeld te worden aan een collega uit een ander deel van het bedrijf. Matches werken zowel voor mensen op locatie als op afstand. Je begint met 30 welkomstpunten en je eerste draai per dag is gratis — opnieuw draaien om van collega te wisselen kost 1 punt, dus geef degene die verschijnt een kans.",ro:"În fiecare zi, apasă Învârte ca să fii pus în legătură cu un coleg din altă parte a companiei. Potrivirile funcționează atât pentru cei de la sediu, cât și pentru cei la distanță. Începi cu 30 de puncte bonus, iar prima învârtire din fiecare zi este gratuită — o nouă învârtire pentru a schimba colegul costă 1 punct, așa că dă-i o șansă celui care apare."},
  hiw_1_n:{en:"First spin each day is free",nl:"Eerste draai per dag is gratis",ro:"Prima învârtire zilnică e gratuită"},
  hiw_2_t:{en:"Say hi & plan",nl:"Zeg hallo & plan",ro:"Salută și planificați"},
  hiw_2_b:{en:"When you both accept, a shared space opens with a chat. Agree a time and place together.",nl:"Als jullie beiden accepteren, opent een gedeelde ruimte met een chat. Spreek samen een tijd en plek af.",ro:"Când amândoi acceptați, se deschide un spațiu comun cu un chat. Stabiliți împreună ora și locul."},
  hiw_3_t:{en:"Meet up",nl:"Ontmoet elkaar",ro:"Întâlniți-vă"},
  hiw_3_b:{en:"A coffee, a walk, a shared break — or a quick Teams call if one of you is remote.",nl:"Een koffie, een wandeling, een pauze samen — of een kort Teams-gesprek als een van jullie op afstand werkt.",ro:"O cafea, o plimbare, o pauză împreună — sau un apel scurt pe Teams dacă unul dintre voi lucrează la distanță."},
  hiw_4_t:{en:"Log it for points",nl:"Leg het vast voor punten",ro:"Înregistrează pentru puncte"},
  hiw_4_b:{en:"Share a photo of your meetup and answer three quick discussion questions together to earn points. Photos go to the community wall; your answers stay private.",nl:"Deel een foto van je meetup en beantwoord samen drie korte gespreksvragen om punten te verdienen. Foto's komen op de community-wall; je antwoorden blijven privé.",ro:"Împărtășiți o poză de la întâlnire și răspundeți împreună la trei întrebări scurte ca să primiți puncte. Pozele ajung pe peretele comunității; răspunsurile rămân private."},
  hiw_4_n:{en:"Answers stay private",nl:"Antwoorden blijven privé",ro:"Răspunsurile rămân private"},
  hiw_5_t:{en:"Climb & win",nl:"Klim & win",ro:"Urcă și câștigă"},
  hiw_5_b:{en:"Points climb the leaderboard. A panel of CB management judges picks the best idea shared in the discussions — €250 for that, €250 for topping the leaderboard and €150 for the runner-up. Winners announced end of October 2026.",nl:"Punten laten je klimmen op de ranglijst. Een panel van CB management judges kiest het beste idee uit de gesprekken — €250 daarvoor, €250 voor de hoogste plek op de ranglijst en €150 voor de tweede plaats. Winnaars bekend eind oktober 2026.",ro:"Punctele te urcă în clasament. Un juriu de CB management judges alege cea mai bună idee din discuții — €250 pentru aceasta, €250 pentru primul loc în clasament și €150 pentru locul doi. Câștigătorii vor fi anunțați la sfârșitul lui octombrie 2026."},
  hiw_5_n:{en:"€250 best idea · €250 top of board · €150 runner-up",nl:"€250 beste idee · €250 hoogste score · €150 tweede plaats",ro:"€250 cea mai bună idee · €250 primul loc · €150 locul doi"},
  hiw_cta:{en:"Got it — create my account",nl:"Duidelijk — maak mijn account",ro:"Am înțeles — creează contul"},

  /* --- how it works --- */
  hiw_h:{en:"How it works",nl:"Hoe het werkt",ro:"Cum funcționează"},
};

// t(key, lang, params) — English is the fallback for a missing language AND a missing key.
// params fills {placeholders}: t('meet_waiting', lang, {name:'Ana'}). Interpolating rather than
// concatenating translated fragments keeps word order correct in every language.
window.ZB_T = function (key, lang, params) {
  var row = window.ZB_I18N[key];
  if (!row) return key;                       // unknown key: show the key, never blank
  var out = row[lang] || row.en || key;
  if (params) Object.keys(params).forEach(function (k) {
    out = out.split("{" + k + "}").join(params[k] == null ? "" : String(params[k]));
  });
  return out;
};
