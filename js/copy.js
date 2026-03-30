export const STRINGS = {
  mode: {
    homeTitle: 'Start her',
    learn: 'Lær',
    practice: 'Øv',
    timeLab: 'Time Lab',
    review: 'Gentagelse'
  },
  missionStatus: {
    locked: 'Lås op for at åbne missionen',
    unlocked: 'Klar',
    completed: 'Fuldført'
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
    backToMissions: 'Til missioner'
  },
  feedback: {
    correctHeader: 'Godt gået',
    wrongHeader: 'Næsten, men',
    hintPrefix: 'Forklaring:',
    genericCorrect: 'Det passer med urenes struktur.',
    genericIncorrect: 'Det er et almindeligt problem. Se på relationen mellem de to hænder.'
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
    m1: { title: 'Møde uret', objective: 'Forstå time- og minutviserens roller.' },
    m2: { title: 'Fuldtime og halvtime', objective: 'Lær hele timer og halvtimer med "halv".' },
    m3: { title: 'Kvart over og kvart i', objective: 'Placér minutter i kvarte-segmenterne.' },
    m4: { title: 'Hvert femte minut', objective: 'Forbind tal på uret med minutgrupper.' },
    m5: { title: 'Præcise minutter', objective: 'Lær 2:43, 9:08 og andre præcise tider.' },
    m6: { title: 'Oversæt mellem former', objective: 'Knyt analog, digital og sproglig tid tættere sammen.' }
  },
  placement: {
    title: 'Velkommen',
    intro:
      'Velkommen til Klokkemester! Start med en kort opstartsmission, så får du din personlige startmission.'
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
  bossIncorrect: 'Boss-opgaven kræver at både time- og minutdelen passer.'
};
