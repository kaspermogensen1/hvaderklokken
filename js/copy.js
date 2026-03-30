export const STRINGS = {
  mode: {
    homeTitle: 'Start her',
    learn: 'Lær',
    practice: 'Øv',
    timeLab: 'Time Lab',
    review: 'Gentagelse'
  },
  track: {
    analog: 'Analogt ur',
    digital: 'Digitalt ur'
  },
  missionStatus: {
    locked: 'Lås op for at åbne missionen',
    unlocked: 'Klar',
    completed: 'Fuldført',
    skipped: 'Sprunget over'
  },
  common: {
    continue: 'Fortsæt',
    start: 'Start',
    next: 'Næste',
    done: 'Færdig',
    retry: 'Prøv igen',
    check: 'Tjek svar',
    unlockHint: 'Når mesterskab når målet, låses næste mission op.',
    noReview: 'Du har ingen åbne gentagelsesopgaver lige nu.',
    fromStart: 'Fortsæt fra begyndelsen',
    clear: 'Slet fremskridt',
    placementStart: 'Start placering',
    placementDone: 'Placering færdig',
    backToMissions: 'Til missioner',
    chooseTrack: 'Vælg hvad du vil lære',
    skipTask: 'Spring opgaven over',
    skipStep: 'Spring trin over',
    skipLesson: 'Spring dette emne over',
    comeBackLater: 'Tag senere igen',
    openGuide: 'Til læringsstien',
    openPlacement: 'Test mit niveau'
  },
  feedback: {
    correctHeader: 'Godt gået',
    wrongHeader: 'Næsten, men',
    hintPrefix: 'Forklaring:',
    genericCorrect: 'Det passer med tidsmønstret.',
    genericIncorrect: 'Prøv at koble timer, minutter og sproget sammen.',
    skipped: 'Opgaven blev sprunget over.',
    skippedHint: 'Du kan tage den igen senere uden at miste din plads.'
  },
  labels: {
    digital12: '12-tals format',
    digital24: '24-tals format',
    spoken: 'Muntligt udtryk',
    helperRings: 'Vis hjælpecirkler'
  },
  review: {
    title: 'Gentagelse af svære opgaver',
    missionHint: 'Fokus i dag:'
  },
  missions: {
    placeIntro: {
      title: 'Niveau 0: Placering',
      objective: 'Find ud af hvor læringsstarten skal være.'
    },
    m1: {title: 'Møde uret', objective: 'Forstå time- og minutviserens roller.'},
    m2: {title: 'Fuldtime og halvtime', objective: 'Lær hele timer og halvtimer med "halv".'},
    m3: {title: 'Kvart over og kvart i', objective: 'Placér minutter i kvarte-segmenterne.'},
    m4: {title: 'Hvert femte minut', objective: 'Forbind tal på uret med minutgrupper.'},
    m5: {title: 'Præcise minutter', objective: 'Lær 2:43, 9:08 og andre præcise tider.'},
    m6: {title: 'Oversæt mellem former', objective: 'Knyt analog, digital og sproglig tid tættere sammen.'},
    dm1: {title: 'Mød det digitale ur', objective: 'Læs HH:MM og hold styr på timer og minutter.'},
    dm2: {title: 'Mønstre i tiden', objective: 'Arbejd med :00, :15, :30 og :45.'},
    dm3: {title: 'Før og efter', objective: 'Sammenlign digitale tider og se hvad der kommer først.'},
    dm4: {title: 'Tidligt eller sent', objective: 'Vurdér tider i forhold til en aftale eller en starttid.'},
    dm5: {title: 'Dele af dagen', objective: 'Forbind tider med morgen, formiddag, eftermiddag og aften.'},
    dm6: {title: 'Bro til tale og ur', objective: 'Oversæt mellem digital tid, dagkontekst og analogt ur.'}
  },
  placement: {
    title: 'Velkommen',
    intro: 'Vælg et spor og start med små trin, eller test dit niveau og hop ind det rigtige sted.'
  },
  misconceptions: {
    'minute-hour-confusion': {
      title: 'Time- og minutviser forveksling',
      hint: 'Den korte hånd viser timer, den lange minutter.'
    },
    num8means40: {
      title: '8 vs 40 minutter',
      hint: 'Tænk i 60 minutter pr. time og mærk hvor tallet 8 står i forhold til uret.'
    },
    hourHandOnWholeNumberOnly: {
      title: 'Timehånden står fast',
      hint: 'Timehåndens position ændrer sig hele tiden mellem tallene.'
    },
    halv_to_misread: {
      title: 'Fejl omkring "halv"',
      hint: '"Halv to" er en halv-time før to, altså 1:30.'
    },
    quarter_past_to_confusion: {
      title: 'Over og i forvirring',
      hint: 'Kvart over to = 2:15, kvart i to = 1:45.'
    },
    analog_digital_split: {
      title: 'Analog og digital adskilt',
      hint: 'Analoge positioner og digital visning viser samme tid.'
    },
    h24_context_error: {
      title: '24-tals forvirring',
      hint: '2:30 om eftermiddagen svarer til 14:30 i 24-timersformat.'
    },
    digital_hour_minute_order: {
      title: 'Timer og minutter byttet rundt',
      hint: 'Tallene før kolon er timer. Tallene efter kolon er minutter.'
    },
    leading_zero_confusion: {
      title: 'Førende nul forvirrer',
      hint: '07:05 er 7 timer og 5 minutter, ikke 70 eller 75.'
    },
    before_after_reversal: {
      title: 'Før og efter byttes rundt',
      hint: 'Se først på timerne. Hvis de er ens, sammenligner du minutterne.'
    },
    early_late_reversal: {
      title: 'Tidligt og sent byttes rundt',
      hint: 'Før starttiden er tidligt. Efter starttiden er sent.'
    },
    day_segment_confusion: {
      title: 'Del af dagen forveksles',
      hint: '07:30 er morgen, 10:30 er formiddag, 14:30 er eftermiddag og 19:30 er aften.'
    },
    digital_analog_bridge_confusion: {
      title: 'Digital og analog kobles forkert',
      hint: '18:15 er det samme som 6:15 om aftenen og kvart over seks.'
    }
  }
};

export const FEEDBACK_MESSAGES = {
  minuteHourCorrect: 'Godt set. Du valgte korrekt tid.',
  minuteHourIncorrect: 'Kontrollér hvilke hånd der viser minutter, og hvilke der viser timer.',
  readCorrect: 'Rigtig læsning.',
  readIncorrect: 'Stil spørgsmålet: Hvilken hånd peger på minutter? Derefter tæller du minutter rundt fra toppen.',
  setCorrect: 'Finjustering i den rigtige retning.',
  setIncorrect: 'Skub hænderne lidt og se hvordan begge værdier ændrer sig sammen.',
  matchCorrect: 'De to former viser det samme tidspunkt.',
  matchIncorrect: 'Sammenlign minutdelen først, og kig derefter på timen.',
  errorCorrect: 'Du fandt den forkerte del af uret.',
  errorIncorrect: 'Se på om fejlen ligger i timerne eller minutterne.',
  missingCorrect: 'Du udfyldte den manglende tidsform korrekt.',
  missingIncorrect: 'Forbind det skrevne tidspunkt med placeringen på uret.',
  reviewCorrect: 'Fint. Den svære type sidder bedre nu.',
  reviewIncorrect: 'Den her skal gentages senere, så mønsteret bliver tydeligt.',
  bossCorrect: 'Flot. Du klarede boss-opgaven.',
  bossIncorrect: 'Boss-opgaven kræver at både time- og minutdelen passer.',
  digitalReadCorrect: 'Ja. Du læste timerne og minutterne i den rigtige rækkefølge.',
  digitalReadIncorrect: 'Se på tallene før og efter kolon. Timer kommer først, minutter bagefter.',
  digitalSetCorrect: 'Godt. Du skrev den digitale tid korrekt.',
  digitalSetIncorrect: 'Skriv først timen og derefter minutdelen som to cifre.',
  digitalSelectCorrect: 'Godt. Du fandt den rigtige digitale tid.',
  digitalSelectIncorrect: 'Kig efter timerne før kolon og minutterne efter kolon.',
  compareCorrect: 'Rigtigt. Du fandt relationen mellem de to tidspunkter.',
  compareIncorrect: 'Sammenlign timer først, og brug minutterne hvis timerne er ens.',
  earlyLateCorrect: 'Ja. Du vurderede tidspunktet i forhold til aftalen korrekt.',
  earlyLateIncorrect: 'Tænk på om tidspunktet ligger før, præcis på eller efter starttiden.',
  daySegmentCorrect: 'Godt. Du placerede tidspunktet i den rigtige del af dagen.',
  daySegmentIncorrect: 'Brug dagens rytme: morgen, formiddag, eftermiddag og aften følger efter hinanden.',
  contextCorrect: 'Det passer godt til situationen.',
  contextIncorrect: 'Se på om tidspunktet giver mening i hverdagen.',
  digitalSpokenCorrect: 'Ja. Du oversatte den digitale tid til dansk talesprog.',
  digitalSpokenIncorrect: 'Brug både tidsudtrykket og delen af dagen for at finde det rigtige svar.'
};
