/* ============================================================
   ZB MeetUP Functions — push copy in EN/NL/RO
   ------------------------------------------------------------
   The in-app bell renders from a key + the viewer's language, so the stored
   notification `text` is ENGLISH. A push built from that text would arrive in
   English for every colleague, right after we shipped full NL/RO support.
   So the sender localises: it reads the RECIPIENT's users/{uid}.lang and
   builds the body here. English is always the fallback.

   These four notification strings MIRROR js/i18n.js — keep them in step.
   ============================================================ */
const T = {
  notif_request: {
    en: "{name} wants to meet you — open Meetups to accept.",
    nl: "{name} wil je ontmoeten — open Meetups om te accepteren.",
    ro: "{name} vrea să te cunoască — deschide Întâlniri pentru a accepta."
  },
  notif_accept: {
    en: "{name} accepted your match! Open the shared space to coordinate.",
    nl: "{name} heeft je match geaccepteerd! Open de gedeelde ruimte om af te stemmen.",
    ro: "{name} a acceptat potrivirea! Deschide spațiul comun ca să vă puneți de acord."
  },
  notif_msg: {
    en: "{name} sent you a message",
    nl: "{name} heeft je een bericht gestuurd",
    ro: "{name} ți-a trimis un mesaj"
  },
  notif_mention: {
    en: "{name} mentioned you in a comment",
    nl: "{name} heeft je genoemd in een reactie",
    ro: "{name} te-a menționat într-un comentariu"
  },
  notif_wallcomment: {
    en: "{name} commented on your meetup",
    nl: "{name} heeft op je meetup gereageerd",
    ro: "{name} a comentat la întâlnirea ta"
  },
  push_reminder: {
    en: "You still have a meetup to finish with {name} — add a photo and your answers to earn your points.",
    nl: "Je moet je meetup met {name} nog afronden — voeg een foto en je antwoorden toe om punten te verdienen.",
    ro: "Mai ai de finalizat întâlnirea cu {name} — adaugă o poză și răspunsurile tale ca să primești punctele."
  },
  push_nudge: {
    en: "Time to spin — meet someone new today.",
    nl: "Tijd om te draaien — ontmoet vandaag iemand nieuw.",
    ro: "E timpul să învârți — cunoaște pe cineva nou azi."
  },
  fallback_name: { en: "A colleague", nl: "Een collega", ro: "Un coleg" }
};

const LANGS = ["en", "nl", "ro"];

function t(key, lang, params) {
  const row = T[key];
  if (!row) return key;
  const l = LANGS.indexOf(lang) > -1 ? lang : "en";
  let out = row[l] || row.en || key;
  if (params) {
    Object.keys(params).forEach(k => {
      out = out.split("{" + k + "}").join(params[k] == null ? "" : String(params[k]));
    });
  }
  return out;
}

module.exports = { t, LANGS };
