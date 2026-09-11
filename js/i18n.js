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

  /* --- how it works --- */
  hiw_h:{en:"How it works",nl:"Hoe het werkt",ro:"Cum funcționează"},
};

// t(key, lang) — English is the fallback for a missing language AND a missing key.
window.ZB_T = function (key, lang) {
  var row = window.ZB_I18N[key];
  if (!row) return key;                       // unknown key: show the key, never blank
  return row[lang] || row.en || key;
};
