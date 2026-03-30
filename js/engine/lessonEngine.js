const STEP_LABELS = {
  see: 'Se det',
  guided: 'Prøv det sammen',
  why: 'Hvorfor virker det',
  practice: 'Prøv selv',
  checkpoint: 'Tjek'
};

export const TRACK_ORDER = ['analog', 'digital'];

export const TRACK_META = {
  analog: {
    title: 'Analogt ur',
    introTitle: 'Lær det analoge ur trin for trin',
    introText: 'Du starter med visere, hele timer og halvtimer. Bagefter kan du øve dig i missionerne eller teste dit niveau.',
    placementLabel: 'Test mit analoge niveau'
  },
  digital: {
    title: 'Digitalt ur',
    introTitle: 'Lær det digitale ur trin for trin',
    introText: 'Du starter med HH:MM og 24-timers tid. Bagefter arbejder du med før og efter, tidligt og sent og dele af dagen.',
    placementLabel: 'Test mit digitale niveau'
  }
};

const minutes = (hour, minute) => (hour * 60) + minute;

const choiceOptions = (labels) => labels.map((label, index) => ({id: `option-${index}`, index, label}));

const createStep = (id, kind, config) => ({
  id,
  kind,
  label: STEP_LABELS[kind],
  simpleCopy: '',
  advancedCopy: '',
  clock: null,
  previewTime: null,
  readouts: {
    digital12: true,
    digital24: false,
    spoken: true,
    context: false
  },
  interaction: {type: 'none'},
  successCriteria: null,
  hints: [],
  successMessage: 'Det sidder.',
  workedExample: '',
  ...config
});

const ANALOG_LESSONS = [
  {
    id: 'l0',
    title: 'Mød uret',
    subtitle: 'Se forskel på den korte og den lange viser.',
    missionId: 'm1',
    steps: [
      createStep('l0-see', 'see', {
        title: 'Uret har to visere',
        simpleCopy: 'Den korte viser timer. Den lange viser minutter.',
        advancedCopy: 'Minutviseren tager en hel runde på én time. Timeviseren flytter sig langsomt hele tiden og hopper ikke kun, når en ny time begynder.',
        clock: {
          initialTime: minutes(2, 20),
          interactive: false,
          showHelpers: true,
          teachingState: {
            highlightedHands: ['hour', 'minute'],
            highlightedNumbers: [12],
            demo: {times: [minutes(2, 0), minutes(2, 10), minutes(2, 20), minutes(2, 30)], intervalMs: 1200}
          }
        },
        readouts: {digital12: true, digital24: false, spoken: false, context: false}
      }),
      createStep('l0-guided', 'guided', {
        title: 'Prøv at styre minutviseren',
        simpleCopy: 'Træk den lange viser op til 12. Når den står på 12, er der gået 0 minutter.',
        advancedCopy: 'Tallet 12 er startpunktet for minutter. Herfra tæller man rundt med uret: 5, 10, 15 og så videre.',
        clock: {
          initialTime: minutes(2, 25),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['minute'],
            highlightedHands: ['minute'],
            highlightedNumbers: [12],
            targetTime: minutes(2, 0),
            showMinuteLabels: true
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Sæt minutviseren på 12.',
          targetTime: minutes(2, 0),
          toleranceMinutes: 0,
          checkLabel: 'Tjek trin',
          hintTeachingState: {
            highlightedHands: ['minute'],
            highlightedNumbers: [12],
            targetTime: minutes(2, 0)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(2, 0), toleranceMinutes: 0},
        hints: [
          'Se efter den lange viser. Den skal pege direkte op på 12.',
          'Når den lange viser rammer 12, står minutterne på 0.'
        ],
        successMessage: 'Ja. Den lange viser står nu på 12 og viser 0 minutter.',
        workedExample: 'Eksempel: minutviseren peger lige op på 12, så minutdelen er 00.'
      }),
      createStep('l0-why', 'why', {
        title: 'Timeviseren glider mellem tallene',
        simpleCopy: 'Den korte viser peger ikke altid præcis på et tal. Den glider langsomt videre.',
        advancedCopy: 'Klokken 2:30 er timeviseren halvvejs mellem 2 og 3. Derfor er det forkert at sætte timeviseren helt fast på 2 eller 3, når minuten ikke er 00.',
        clock: {
          initialTime: minutes(2, 0),
          interactive: false,
          showHelpers: true,
          teachingState: {
            highlightedHands: ['hour'],
            highlightedNumbers: [2, 3],
            demo: {times: [minutes(2, 0), minutes(2, 15), minutes(2, 30), minutes(2, 45)], intervalMs: 1400}
          }
        },
        readouts: {digital12: true, digital24: false, spoken: true, context: false}
      }),
      createStep('l0-practice', 'practice', {
        title: 'Sæt en hel time',
        simpleCopy: 'Prøv selv at sætte klokken til 4:00.',
        advancedCopy: 'Ved hele timer står minutviseren på 12, og timeviseren står direkte på timetallet.',
        clock: {
          initialTime: minutes(1, 0),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            highlightedHands: ['hour', 'minute'],
            highlightedNumbers: [4, 12],
            targetTime: minutes(4, 0)
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Sæt uret til 4:00.',
          targetTime: minutes(4, 0),
          toleranceMinutes: 0,
          checkLabel: 'Tjek trin',
          hintTeachingState: {
            highlightedNumbers: [4, 12],
            targetTime: minutes(4, 0)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(4, 0), toleranceMinutes: 0},
        hints: [
          'Start med minutterne: ved 4:00 skal den lange viser stå på 12.',
          'Den korte viser skal stå på 4, når minutdelen er 00.'
        ],
        successMessage: 'Flot. Du satte både time og minutter rigtigt.',
        workedExample: '4:00 betyder timeviseren på 4 og minutviseren på 12.'
      }),
      createStep('l0-checkpoint', 'checkpoint', {
        title: 'Kan du læse hele timer?',
        simpleCopy: 'Sæt nu selv uret til 5:00.',
        advancedCopy: 'En hel time er den nemmeste analog-læsning: timeviseren på tallet, minutviseren på 12.',
        clock: {
          initialTime: minutes(8, 20),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            highlightedNumbers: [5, 12]
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Checkpoint: Sæt uret til 5:00.',
          targetTime: minutes(5, 0),
          toleranceMinutes: 0,
          checkLabel: 'Tjek checkpoint',
          hintTeachingState: {
            highlightedNumbers: [5, 12],
            targetTime: minutes(5, 0)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(5, 0), toleranceMinutes: 0},
        hints: [
          'Find først 12 til minutviseren.',
          'Find derefter 5 til timeviseren.'
        ],
        successMessage: 'Checkpoint klaret. Du kan læse og stille hele timer.',
        workedExample: 'På 5:00 står minutviseren på 12 og timeviseren på 5.'
      })
    ]
  },
  {
    id: 'l1',
    title: 'Hele timer',
    subtitle: 'Knyt analog tid til 00 og “klokken …”.',
    missionId: 'm1',
    steps: [
      createStep('l1-see', 'see', {
        title: 'Hele timer har 00 minutter',
        simpleCopy: 'Når minutviseren står på 12, er minutdelen 00.',
        advancedCopy: 'Digitalt skrives hele timer med `:00`. På analogt ur er det den samme regel: minutviseren står på 12.',
        clock: {
          initialTime: minutes(7, 0),
          interactive: false,
          showHelpers: true,
          teachingState: {
            highlightedHands: ['minute'],
            highlightedNumbers: [12, 7]
          }
        },
        readouts: {digital12: true, digital24: true, spoken: true, context: false}
      }),
      createStep('l1-guided', 'guided', {
        title: 'Byg 7:00',
        simpleCopy: 'Sæt uret til 7:00.',
        advancedCopy: 'Du kan tænke i to dele: 00 minutter først, derefter den rigtige time.',
        clock: {
          initialTime: minutes(5, 35),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            highlightedNumbers: [12, 7],
            targetTime: minutes(7, 0)
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Sæt uret til 7:00.',
          targetTime: minutes(7, 0),
          toleranceMinutes: 0,
          checkLabel: 'Tjek trin',
          hintTeachingState: {highlightedNumbers: [12, 7], targetTime: minutes(7, 0)}
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(7, 0), toleranceMinutes: 0},
        hints: [
          'Ved hele timer skal minutviseren stå på 12.',
          'Når minutterne er 00, viser den korte viser selve timen.'
        ],
        successMessage: 'Godt. 7:00 er sat rigtigt.',
        workedExample: '7:00 betyder 00 minutter og timeviseren direkte på 7.'
      }),
      createStep('l1-why', 'why', {
        title: 'Tre former for samme tid',
        simpleCopy: 'Et ur, et digitalt tal og en sætning kan vise det samme tidspunkt.',
        advancedCopy: 'Analog, digital og talt tid er bare forskellige måder at beskrive samme øjeblik på. Derfor skal de kunne oversættes frem og tilbage.',
        clock: {
          initialTime: minutes(11, 0),
          interactive: false,
          showHelpers: true,
          teachingState: {
            highlightedNumbers: [11, 12]
          }
        },
        readouts: {digital12: true, digital24: true, spoken: true, context: false}
      }),
      createStep('l1-practice', 'practice', {
        title: 'Prøv selv med 11:00',
        simpleCopy: 'Sæt klokken til 11:00.',
        advancedCopy: 'Brug samme regel igen: minutviseren på 12 og timeviseren på 11.',
        clock: {
          initialTime: minutes(2, 50),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            highlightedNumbers: [11, 12]
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Sæt uret til 11:00.',
          targetTime: minutes(11, 0),
          toleranceMinutes: 0,
          checkLabel: 'Tjek trin',
          hintTeachingState: {highlightedNumbers: [11, 12], targetTime: minutes(11, 0)}
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(11, 0), toleranceMinutes: 0},
        hints: [
          'Minutviseren først: op på 12.',
          'Find derefter 11 til timeviseren.'
        ],
        successMessage: 'Ja. 11:00 passer.',
        workedExample: '11:00 vises som timeviseren på 11 og minutviseren på 12.'
      }),
      createStep('l1-checkpoint', 'checkpoint', {
        title: 'Læs og sæt 3:00',
        simpleCopy: 'Checkpoint: Sæt uret til 3:00.',
        advancedCopy: 'Nu skal du bruge mønsteret uden hjælpetrin imellem.',
        clock: {
          initialTime: minutes(9, 25),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute']
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Checkpoint: Sæt uret til 3:00.',
          targetTime: minutes(3, 0),
          toleranceMinutes: 0,
          checkLabel: 'Tjek checkpoint',
          hintTeachingState: {highlightedNumbers: [3, 12], targetTime: minutes(3, 0)}
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(3, 0), toleranceMinutes: 0},
        hints: [
          'Hele timer har 00 minutter.',
          '00 minutter betyder minutviseren på 12.'
        ],
        successMessage: 'Checkpoint klaret. Hele timer sidder bedre nu.',
        workedExample: '3:00 betyder minutviseren på 12 og timeviseren på 3.'
      })
    ]
  },
  {
    id: 'l2',
    title: 'Halve timer',
    subtitle: 'Lær hvorfor “halv to” betyder 1:30.',
    missionId: 'm2',
    steps: [
      createStep('l2-see', 'see', {
        title: 'Halv betyder midt imellem',
        simpleCopy: '“Halv to” er en halv time før to. Det er 1:30.',
        advancedCopy: 'På dansk peger `halv` frem mod den næste time. Derfor betyder `halv tre` 2:30 og ikke 3:30.',
        clock: {
          initialTime: minutes(1, 30),
          interactive: false,
          showHelpers: true,
          teachingState: {
            highlightedNumbers: [1, 2, 6],
            highlightedHands: ['hour', 'minute']
          }
        },
        readouts: {digital12: true, digital24: false, spoken: true, context: false}
      }),
      createStep('l2-guided', 'guided', {
        title: 'Sæt halv to',
        simpleCopy: 'Sæt klokken til “halv to”.',
        advancedCopy: 'Minutviseren skal på 6, fordi 6 betyder 30 minutter. Timeviseren skal stå midt mellem 1 og 2.',
        clock: {
          initialTime: minutes(1, 0),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            highlightedNumbers: [1, 2, 6],
            targetTime: minutes(1, 30)
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Sæt uret til “halv to”.',
          targetTime: minutes(1, 30),
          toleranceMinutes: 0,
          checkLabel: 'Tjek trin',
          hintTeachingState: {highlightedNumbers: [1, 2, 6], targetTime: minutes(1, 30)}
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(1, 30), toleranceMinutes: 0},
        hints: [
          'Start med 30 minutter. Det er minutviseren på 6.',
          '“Halv to” er ikke to. Det er midt mellem 1 og 2.'
        ],
        successMessage: 'Præcis. “Halv to” er 1:30.',
        workedExample: 'Ved “halv to” står minutviseren på 6, og timeviseren er midt mellem 1 og 2.'
      }),
      createStep('l2-why', 'why', {
        title: 'Hvorfor siger man næste time?',
        simpleCopy: 'Når der er gået 30 minutter, er man halvvejs til den næste time.',
        advancedCopy: 'Se uret som en rejse fra 1 til 2. Ved 1:30 er du halvvejs fremme, så sproget peger på målet: to.',
        clock: {
          initialTime: minutes(1, 0),
          interactive: false,
          showHelpers: true,
          teachingState: {
            highlightedNumbers: [1, 2, 6],
            demo: {times: [minutes(1, 0), minutes(1, 15), minutes(1, 30), minutes(1, 45), minutes(2, 0)], intervalMs: 1100}
          }
        },
        readouts: {digital12: true, digital24: false, spoken: true, context: false}
      }),
      createStep('l2-practice', 'practice', {
        title: 'Prøv selv med halv fem',
        simpleCopy: 'Sæt klokken til “halv fem”.',
        advancedCopy: '“Halv fem” er 4:30. Du skal derfor tænke på timen før fem.',
        clock: {
          initialTime: minutes(5, 0),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            highlightedNumbers: [4, 5, 6]
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Sæt uret til “halv fem”.',
          targetTime: minutes(4, 30),
          toleranceMinutes: 0,
          checkLabel: 'Tjek trin',
          hintTeachingState: {highlightedNumbers: [4, 5, 6], targetTime: minutes(4, 30)}
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(4, 30), toleranceMinutes: 0},
        hints: [
          '6 på uret betyder 30 minutter.',
          '“Halv fem” betyder en halv time før 5, altså 4:30.'
        ],
        successMessage: 'Ja. “Halv fem” er 4:30.',
        workedExample: 'Ved “halv fem” er minutviseren på 6 og timeviseren mellem 4 og 5.'
      }),
      createStep('l2-checkpoint', 'checkpoint', {
        title: 'Checkpoint med halv tre',
        simpleCopy: 'Sæt uret til “halv tre”.',
        advancedCopy: 'Brug samme mønster igen: 30 minutter og timen før den, der bliver nævnt.',
        clock: {
          initialTime: minutes(3, 0),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute']
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Checkpoint: Sæt uret til “halv tre”.',
          targetTime: minutes(2, 30),
          toleranceMinutes: 0,
          checkLabel: 'Tjek checkpoint',
          hintTeachingState: {highlightedNumbers: [2, 3, 6], targetTime: minutes(2, 30)}
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(2, 30), toleranceMinutes: 0},
        hints: [
          '30 minutter er minutviseren på 6.',
          '“Halv tre” er midt mellem 2 og 3.'
        ],
        successMessage: 'Checkpoint klaret. Du læser nu danske halve timer korrekt.',
        workedExample: '“Halv tre” betyder 2:30: minutviseren på 6 og timeviseren mellem 2 og 3.'
      })
    ]
  },
  {
    id: 'l3',
    title: 'Kvart over og kvart i',
    subtitle: 'Del uret i kvarterer på 15 minutter.',
    missionId: 'm3',
    steps: [
      createStep('l3-see', 'see', {
        title: 'Et kvarter er 15 minutter',
        simpleCopy: 'Fra 12 til 3 er der et kvarter. Det er 15 minutter.',
        advancedCopy: 'Uret kan deles i fire lige store dele. Hver del er 15 minutter, så 15, 30, 45 og 60 passer til kvart, halv, kvart i og hel time.',
        clock: {
          initialTime: minutes(2, 15),
          interactive: false,
          showHelpers: true,
          teachingState: {
            highlightedNumbers: [12, 3, 6, 9],
            sector: {startMinute: 0, endMinute: 15, color: 'rgba(47, 99, 255, 0.18)'}
          }
        },
        readouts: {digital12: true, digital24: false, spoken: true, context: false}
      }),
      createStep('l3-guided', 'guided', {
        title: 'Sæt kvart over to',
        simpleCopy: 'Sæt uret til “kvart over to”.',
        advancedCopy: '“Over” betyder efter timen. Så du starter ved 2 og lægger 15 minutter til.',
        clock: {
          initialTime: minutes(2, 0),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            highlightedNumbers: [2, 3],
            targetTime: minutes(2, 15),
            sector: {startMinute: 0, endMinute: 15, color: 'rgba(47, 99, 255, 0.18)'}
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Sæt uret til “kvart over to”.',
          targetTime: minutes(2, 15),
          toleranceMinutes: 0,
          checkLabel: 'Tjek trin',
          hintTeachingState: {
            highlightedNumbers: [2, 3],
            targetTime: minutes(2, 15),
            sector: {startMinute: 0, endMinute: 15, color: 'rgba(47, 99, 255, 0.18)'}
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(2, 15), toleranceMinutes: 0},
        hints: [
          'Et kvarter er 15 minutter, så minutviseren skal stå på 3.',
          '“Over to” betyder lidt efter 2, ikke før 2.'
        ],
        successMessage: 'Rigtigt. “Kvart over to” er 2:15.',
        workedExample: '“Kvart over to” vises med minutviseren på 3 og timeviseren lidt efter 2.'
      }),
      createStep('l3-why', 'why', {
        title: 'Kvart i peger fremad',
        simpleCopy: '“Kvart i tre” er 15 minutter før tre. Det er 2:45.',
        advancedCopy: 'Som med `halv` peger `i` frem mod den kommende time. Derfor betyder `kvart i tre` 2:45 og ikke 3:45.',
        clock: {
          initialTime: minutes(2, 45),
          interactive: false,
          showHelpers: true,
          teachingState: {
            highlightedNumbers: [2, 3, 9],
            sector: {startMinute: 45, endMinute: 60, color: 'rgba(255, 127, 80, 0.22)'}
          }
        },
        readouts: {digital12: true, digital24: false, spoken: true, context: false}
      }),
      createStep('l3-practice', 'practice', {
        title: 'Prøv selv med kvart i seks',
        simpleCopy: 'Sæt uret til “kvart i seks”.',
        advancedCopy: '“Kvart i seks” betyder 5:45. Du er på vej mod 6, men du er ikke fremme endnu.',
        clock: {
          initialTime: minutes(6, 0),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            highlightedNumbers: [5, 6, 9]
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Sæt uret til “kvart i seks”.',
          targetTime: minutes(5, 45),
          toleranceMinutes: 0,
          checkLabel: 'Tjek trin',
          hintTeachingState: {
            highlightedNumbers: [5, 6, 9],
            targetTime: minutes(5, 45)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(5, 45), toleranceMinutes: 0},
        hints: [
          'Minutviseren på 9 betyder 45 minutter.',
          '“Kvart i seks” betyder, at du stadig er i timen før 6.'
        ],
        successMessage: 'Flot. “Kvart i seks” er 5:45.',
        workedExample: 'Ved “kvart i seks” står minutviseren på 9, og timeviseren er tæt på 6.'
      }),
      createStep('l3-checkpoint', 'checkpoint', {
        title: 'Checkpoint med kvart over otte',
        simpleCopy: 'Sæt uret til “kvart over otte”.',
        advancedCopy: 'Nu skal du selv oversætte et kvart-udtryk til ur.',
        clock: {
          initialTime: minutes(8, 50),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute']
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Checkpoint: Sæt uret til “kvart over otte”.',
          targetTime: minutes(8, 15),
          toleranceMinutes: 0,
          checkLabel: 'Tjek checkpoint',
          hintTeachingState: {
            highlightedNumbers: [8, 3],
            targetTime: minutes(8, 15)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(8, 15), toleranceMinutes: 0},
        hints: [
          'Et kvarter er 15 minutter.',
          '“Over otte” betyder, at timeviseren lige er kommet forbi 8.'
        ],
        successMessage: 'Checkpoint klaret. Kvarterne sidder bedre nu.',
        workedExample: '“Kvart over otte” er 8:15: minutviseren på 3 og timeviseren lidt efter 8.'
      })
    ]
  },
  {
    id: 'l4',
    title: 'Fem-minuttersmønstret',
    subtitle: 'Lær at tallene på uret også kan betyde 5, 10, 15 og så videre.',
    missionId: 'm4',
    steps: [
      createStep('l4-see', 'see', {
        title: 'Tallene kan læses som minutter',
        simpleCopy: '1 betyder 5 minutter, 2 betyder 10, 3 betyder 15 og så videre.',
        advancedCopy: 'Minutviseren hopper ikke direkte fra 1 til 2 minutter. Hvert tal markerer en gruppe på 5 minutter, fordi der er 60 minutter delt på 12 positioner.',
        clock: {
          initialTime: minutes(2, 25),
          interactive: false,
          showHelpers: true,
          teachingState: {
            highlightedNumbers: [12, 3, 6, 9],
            showMinuteLabels: true
          }
        },
        readouts: {digital12: true, digital24: false, spoken: true, context: false}
      }),
      createStep('l4-guided', 'guided', {
        title: 'Sæt 2:40',
        simpleCopy: 'Sæt uret til 2:40.',
        advancedCopy: '40 minutter betyder, at minutviseren skal til 8. Timeviseren skal derfor stå et godt stykke mellem 2 og 3.',
        clock: {
          initialTime: minutes(2, 0),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            showMinuteLabels: true,
            highlightedNumbers: [2, 3, 8],
            targetTime: minutes(2, 40)
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Sæt uret til 2:40.',
          targetTime: minutes(2, 40),
          toleranceMinutes: 0,
          checkLabel: 'Tjek trin',
          hintTeachingState: {
            showMinuteLabels: true,
            highlightedNumbers: [2, 3, 8],
            targetTime: minutes(2, 40)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(2, 40), toleranceMinutes: 0},
        hints: [
          '8 på uret betyder 40 minutter, ikke 8 minutter.',
          'Når der er gået 40 minutter, er timeviseren tættere på 3 end på 2.'
        ],
        successMessage: 'Ja. 2:40 har minutviseren på 8.',
        workedExample: '2:40 vises med minutviseren på 8 og timeviseren mellem 2 og 3.'
      }),
      createStep('l4-why', 'why', {
        title: 'Ankerpunkter hjælper',
        simpleCopy: '3 er 15, 6 er 30, 9 er 45 og 12 er 00.',
        advancedCopy: 'De fire store ankerpunkter gør det nemmere at regne de andre fem-minuttersmærker ud. Hvis du kender 3=15 og 6=30, kan du også lettere finde 4=20 og 5=25.',
        clock: {
          initialTime: minutes(9, 45),
          interactive: false,
          showHelpers: true,
          teachingState: {
            showMinuteLabels: true,
            highlightedNumbers: [12, 3, 6, 9]
          }
        },
        readouts: {digital12: true, digital24: false, spoken: false, context: false}
      }),
      createStep('l4-practice', 'practice', {
        title: 'Prøv selv med 9:25',
        simpleCopy: 'Sæt uret til 9:25.',
        advancedCopy: '25 minutter betyder minutviseren på 5. Timeviseren skal være lidt før halv ti.',
        clock: {
          initialTime: minutes(9, 0),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            showMinuteLabels: true,
            highlightedNumbers: [9, 10, 5]
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Sæt uret til 9:25.',
          targetTime: minutes(9, 25),
          toleranceMinutes: 0,
          checkLabel: 'Tjek trin',
          hintTeachingState: {
            showMinuteLabels: true,
            highlightedNumbers: [9, 10, 5],
            targetTime: minutes(9, 25)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(9, 25), toleranceMinutes: 0},
        hints: [
          '5 på uret betyder 25 minutter.',
          'Ved 9:25 står timeviseren lidt efter 9, men stadig før halv.'
        ],
        successMessage: 'Flot. 9:25 er sat korrekt.',
        workedExample: '9:25 vises med minutviseren på 5 og timeviseren lidt efter 9.'
      }),
      createStep('l4-checkpoint', 'checkpoint', {
        title: 'Checkpoint med 6:35',
        simpleCopy: 'Sæt uret til 6:35.',
        advancedCopy: 'Nu skal du selv bruge fem-minuttersmønstret.',
        clock: {
          initialTime: minutes(6, 5),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            showMinuteLabels: false
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Checkpoint: Sæt uret til 6:35.',
          targetTime: minutes(6, 35),
          toleranceMinutes: 0,
          checkLabel: 'Tjek checkpoint',
          hintTeachingState: {
            showMinuteLabels: true,
            highlightedNumbers: [6, 7],
            targetTime: minutes(6, 35)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(6, 35), toleranceMinutes: 0},
        hints: [
          '35 minutter betyder minutviseren på 7.',
          'Timeviseren er lidt over halvvejs fra 6 til 7.'
        ],
        successMessage: 'Checkpoint klaret. Fem-minuttersmønstret fungerer nu bedre.',
        workedExample: '6:35 betyder minutviseren på 7 og timeviseren et stykke mellem 6 og 7.'
      })
    ]
  },
  {
    id: 'l5',
    title: 'Præcise minutter',
    subtitle: 'Gå fra fem-minuttersankre til nøjagtige minutter.',
    missionId: 'm5',
    steps: [
      createStep('l5-see', 'see', {
        title: 'Find nærmeste femmer først',
        simpleCopy: 'Ved 2:43 kan du tænke: først 2:40, så tre minutter mere.',
        advancedCopy: 'Præcise tider er svære, fordi du både skal læse minutterne nøjagtigt og placere timeviseren korrekt mellem to tal. Derfor hjælper det at starte ved nærmeste fem-minuttersankre.',
        clock: {
          initialTime: minutes(2, 43),
          interactive: false,
          showHelpers: true,
          teachingState: {
            showMinuteLabels: true,
            highlightedNumbers: [2, 3, 8],
            targetTime: minutes(2, 43)
          }
        },
        readouts: {digital12: true, digital24: true, spoken: true, context: false}
      }),
      createStep('l5-guided', 'guided', {
        title: 'Sæt 2:43',
        simpleCopy: 'Sæt uret til 2:43.',
        advancedCopy: 'Start ved 40 minutter på 8 og flyt derefter tre små minutmarkeringer videre. Timeviseren skal samtidig stå tæt på 3, men ikke helt derhenne endnu.',
        clock: {
          initialTime: minutes(2, 40),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            showMinuteLabels: true,
            highlightedNumbers: [2, 3, 8],
            targetTime: minutes(2, 43)
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Sæt uret til 2:43.',
          targetTime: minutes(2, 43),
          toleranceMinutes: 0,
          checkLabel: 'Tjek trin',
          hintTeachingState: {
            showMinuteLabels: true,
            highlightedNumbers: [2, 3, 8],
            targetTime: minutes(2, 43)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(2, 43), toleranceMinutes: 0},
        hints: [
          'Tænk først 2:40. Det er minutviseren ved 8.',
          'Flyt så tre små minutter videre til 43.'
        ],
        successMessage: 'Rigtigt. Du fandt både ankerpunktet og de ekstra minutter.',
        workedExample: '2:43 er 2:40 plus tre minutter. Minutviseren står lidt efter 8, og timeviseren er tæt på 3.'
      }),
      createStep('l5-why', 'why', {
        title: 'Timeviseren skal også være præcis',
        simpleCopy: 'Når minutterne flytter sig, flytter timeviseren sig også lidt.',
        advancedCopy: 'Ved 11:57 er timeviseren næsten ved 12, men den er stadig i timen 11. Det er netop den type detalje, der gør præcise minutter udfordrende.',
        clock: {
          initialTime: minutes(11, 57),
          interactive: false,
          showHelpers: true,
          teachingState: {
            showMinuteLabels: true,
            highlightedNumbers: [11, 12],
            demo: {times: [minutes(11, 45), minutes(11, 50), minutes(11, 57), minutes(12, 0)], intervalMs: 1100}
          }
        },
        readouts: {digital12: true, digital24: true, spoken: true, context: false}
      }),
      createStep('l5-practice', 'practice', {
        title: 'Prøv selv med 9:08',
        simpleCopy: 'Sæt uret til 9:08.',
        advancedCopy: 'Her kan du tænke 9:05 først og derefter tre minutter mere. Timeviseren skal kun lige være startet på vejen fra 9 mod 10.',
        clock: {
          initialTime: minutes(9, 5),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            showMinuteLabels: true,
            highlightedNumbers: [9, 10, 1]
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Sæt uret til 9:08.',
          targetTime: minutes(9, 8),
          toleranceMinutes: 0,
          checkLabel: 'Tjek trin',
          hintTeachingState: {
            showMinuteLabels: true,
            highlightedNumbers: [9, 10, 1],
            targetTime: minutes(9, 8)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(9, 8), toleranceMinutes: 0},
        hints: [
          'Find først 9:05. Det er minutviseren på 1.',
          'Flyt derefter tre små minutter videre til 9:08.'
        ],
        successMessage: 'Ja. 9:08 kræver små præcise flyt.',
        workedExample: '9:08 er lidt efter 9:05. Minutviseren står lidt efter 1, og timeviseren er lige efter 9.'
      }),
      createStep('l5-checkpoint', 'checkpoint', {
        title: 'Checkpoint med 11:57',
        simpleCopy: 'Sæt uret til 11:57.',
        advancedCopy: 'Nu prøver du en svær præcis tid tæt på en ny time.',
        clock: {
          initialTime: minutes(11, 35),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            showMinuteLabels: false
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Checkpoint: Sæt uret til 11:57.',
          targetTime: minutes(11, 57),
          toleranceMinutes: 0,
          checkLabel: 'Tjek checkpoint',
          hintTeachingState: {
            showMinuteLabels: true,
            highlightedNumbers: [11, 12],
            targetTime: minutes(11, 57)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(11, 57), toleranceMinutes: 0},
        hints: [
          'Tænk 11:55 først. Det er minutviseren på 11.',
          'Flyt så to små minutter videre til 57, mens timeviseren bliver næsten ved 12.'
        ],
        successMessage: 'Checkpoint klaret. Du kan nu arbejde med præcise minutter.',
        workedExample: '11:57 er to minutter efter 11:55. Minutviseren står lidt efter 11, og timeviseren er næsten på 12.'
      })
    ]
  },
  {
    id: 'l6',
    title: 'Oversæt mellem former',
    subtitle: 'Se sammenhængen mellem analog, digital, talt tid og dagskontekst.',
    missionId: 'm6',
    steps: [
      createStep('l6-see', 'see', {
        title: '14:30 og halv tre er samme tid',
        simpleCopy: 'Et analogt ur viser stadig 2:30, selv om den digitale 24-timers tid er 14:30.',
        advancedCopy: 'Analogt ur bruger 12 tal rundt i en cirkel. Derfor må 24-timers information komme fra digital visning eller fra konteksten: morgen, eftermiddag, aften og nat.',
        clock: {
          initialTime: minutes(14, 30),
          interactive: false,
          showHelpers: true,
          teachingState: {
            highlightedNumbers: [2, 3, 6]
          }
        },
        readouts: {digital12: true, digital24: true, spoken: true, context: true}
      }),
      createStep('l6-guided', 'guided', {
        title: 'Sæt 18:15',
        simpleCopy: 'Sæt uret til 18:15.',
        advancedCopy: '18:15 er det samme som 6:15 om aftenen. På analogt ur viser du 6:15, mens 24-timersfeltet og konteksten fortæller, at det er om aftenen.',
        clock: {
          initialTime: minutes(18, 0),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            highlightedNumbers: [6, 3],
            targetTime: minutes(18, 15)
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Sæt uret til 18:15.',
          targetTime: minutes(18, 15),
          toleranceMinutes: 0,
          checkLabel: 'Tjek trin',
          hintTeachingState: {
            highlightedNumbers: [6, 3],
            targetTime: minutes(18, 15)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(18, 15), toleranceMinutes: 0},
        hints: [
          '18:15 svarer analogt til 6:15.',
          '15 minutter betyder minutviseren på 3.'
        ],
        successMessage: 'Godt. 18:15 og 6:15 er samme placering på analogt ur.',
        workedExample: '18:15 skrives digitalt med 24 timer, men analogt vises det som 6:15.'
      }),
      createStep('l6-why', 'why', {
        title: 'Kontekst gør 24-timers tid tydelig',
        simpleCopy: '07:45 og 19:45 ser ens ud på analogt ur, men hører til forskellige dele af dagen.',
        advancedCopy: 'Derfor er det nyttigt at koble tid til dagens rytme. Digital 24-timers tid fortæller præcist, om en tid ligger om morgenen eller om aftenen.',
        clock: {
          initialTime: minutes(19, 45),
          interactive: false,
          showHelpers: true,
          teachingState: {
            highlightedNumbers: [7, 8, 9]
          }
        },
        readouts: {digital12: true, digital24: true, spoken: true, context: true}
      }),
      createStep('l6-practice', 'practice', {
        title: 'Prøv selv med 07:45',
        simpleCopy: 'Sæt uret til 07:45.',
        advancedCopy: '07:45 er 7:45 om morgenen og kan også siges som “kvart i otte”.',
        clock: {
          initialTime: minutes(7, 0),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            highlightedNumbers: [7, 8, 9]
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Sæt uret til 07:45.',
          targetTime: minutes(7, 45),
          toleranceMinutes: 0,
          checkLabel: 'Tjek trin',
          hintTeachingState: {
            highlightedNumbers: [7, 8, 9],
            targetTime: minutes(7, 45)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(7, 45), toleranceMinutes: 0},
        hints: [
          '45 minutter betyder minutviseren på 9.',
          '07:45 er samme analogplacering som 7:45.'
        ],
        successMessage: 'Flot. Du koblede 24-timers tal til det analoge ur.',
        workedExample: '07:45 vises analogt som kvart i otte: minutviseren på 9 og timeviseren tæt på 8.'
      }),
      createStep('l6-checkpoint', 'checkpoint', {
        title: 'Checkpoint med 21:20',
        simpleCopy: 'Sæt uret til 21:20.',
        advancedCopy: 'Nu skal du forbinde 24-timers tal, analog placering og dansk udtryk selv.',
        clock: {
          initialTime: minutes(21, 0),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute']
          }
        },
        interaction: {
          type: 'clock',
          prompt: 'Checkpoint: Sæt uret til 21:20.',
          targetTime: minutes(21, 20),
          toleranceMinutes: 0,
          checkLabel: 'Tjek checkpoint',
          hintTeachingState: {
            showMinuteLabels: true,
            highlightedNumbers: [9, 10, 4],
            targetTime: minutes(21, 20)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(21, 20), toleranceMinutes: 0},
        hints: [
          '21:20 svarer analogt til 9:20 om aftenen.',
          '20 minutter betyder minutviseren på 4.'
        ],
        successMessage: 'Checkpoint klaret. Du oversætter nu bedre mellem flere tidsformer.',
        workedExample: '21:20 er 9:20 om aftenen: minutviseren på 4 og timeviseren lidt efter 9.'
      })
    ]
  }
];

const DIGITAL_LESSONS = [
  {
    id: 'd0',
    title: 'Mød det digitale ur',
    subtitle: 'Læs HH:MM og se forskel på timer og minutter.',
    missionId: 'dm1',
    steps: [
      createStep('d0-see', 'see', {
        title: 'Timer står før kolon',
        simpleCopy: 'I 07:05 står 07 for timer, og 05 står for minutter.',
        advancedCopy: 'Et digitalt ur viser tiden i to blokke. Først kommer timerne, derefter kolon, og til sidst minutdelen. 07:05 er derfor 7 timer og 5 minutter.',
        previewTime: minutes(7, 5),
        readouts: {digital12: false, digital24: true, spoken: true, context: true}
      }),
      createStep('d0-guided', 'guided', {
        title: 'Læs 07:05',
        simpleCopy: 'Vælg den forklaring der passer til 07:05.',
        advancedCopy: 'Læs først timerne før kolon og derefter minutterne efter kolon. 07:05 betyder derfor 7 timer og 5 minutter.',
        previewTime: minutes(7, 5),
        interaction: {
          type: 'choice',
          prompt: 'Hvad betyder 07:05?',
          options: choiceOptions(['7 timer og 5 minutter', '5 timer og 7 minutter', '7 timer og 50 minutter', '17 timer og 5 minutter']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: '7 timer og 5 minutter'},
        hints: [
          'Timerne står før kolon.',
          'Minutterne står efter kolon.'
        ],
        successMessage: 'Ja. 07:05 betyder 7 timer og 5 minutter.',
        workedExample: '07:05 består af 07 timer og 05 minutter.'
      }),
      createStep('d0-why', 'why', {
        title: 'Nul foran ændrer ikke tiden',
        simpleCopy: 'Vælg den digitale tid der passer til 7 timer og 5 minutter.',
        advancedCopy: 'Et nul foran gør bare timen eller minuttet til to cifre. 7 timer og 5 minutter skrives derfor 07:05 og ikke 7:50 eller 05:07.',
        previewTime: minutes(7, 5),
        interaction: {
          type: 'choice',
          prompt: 'Hvilken digital tid passer til 7 timer og 5 minutter?',
          options: choiceOptions(['07:05', '07:50', '05:07', '17:05']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: '07:05'},
        hints: [
          'Digital tid skrives altid med to cifre til timer og to til minutter.',
          '5 minutter skrives som 05.'
        ],
        successMessage: 'Rigtigt. 7 timer og 5 minutter skrives 07:05.',
        workedExample: '7 timer og 5 minutter skrives som 07:05.'
      }),
      createStep('d0-practice', 'practice', {
        title: 'Prøv selv med 14:20',
        simpleCopy: 'Vælg den forklaring der passer til 14:20.',
        advancedCopy: '14 står for timerne, og 20 står for minutterne. Du læser stadig fra venstre mod højre.',
        previewTime: minutes(14, 20),
        interaction: {
          type: 'choice',
          prompt: 'Hvad betyder 14:20?',
          options: choiceOptions(['14 timer og 20 minutter', '20 timer og 14 minutter', '14 timer og 2 minutter', '4 timer og 20 minutter']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: '14 timer og 20 minutter'},
        hints: [
          'Se først på tallet før kolon.',
          'Se derefter på tallet efter kolon.'
        ],
        successMessage: 'Godt. 14:20 betyder 14 timer og 20 minutter.',
        workedExample: '14:20 har 14 timer før kolon og 20 minutter bagefter.'
      }),
      createStep('d0-checkpoint', 'checkpoint', {
        title: 'Checkpoint med 09:45',
        simpleCopy: 'Vælg den digitale tid der passer til 9 timer og 45 minutter.',
        advancedCopy: 'Nu skal du selv koble tale og digital skrivemåde sammen uden mellemtrin.',
        previewTime: minutes(9, 45),
        interaction: {
          type: 'choice',
          prompt: 'Hvilken digital tid passer til 9 timer og 45 minutter?',
          options: choiceOptions(['09:45', '09:54', '19:45', '09:05']),
          checkLabel: 'Tjek checkpoint'
        },
        successCriteria: {type: 'choice-match', expectedValue: '09:45'},
        hints: [
          'Timerne skal stå før kolon.',
          '45 minutter skrives som 45 efter kolon.'
        ],
        successMessage: 'Checkpoint klaret. Du kan nu læse digital tid og kende forskel på timer og minutter.',
        workedExample: '09:45 skrives med 09 timer og 45 minutter.'
      })
    ]
  },
  {
    id: 'd1',
    title: 'Hele tider og mønstre',
    subtitle: 'Genkend :00, :15, :30 og :45 i digital tid.',
    missionId: 'dm2',
    steps: [
      createStep('d1-see', 'see', {
        title: 'Mønstre gør tider nemmere',
        simpleCopy: ':00, :15, :30 og :45 går igen mange steder i løbet af dagen.',
        advancedCopy: 'De fire mønstre hjælper dig med at se hele timer, kvarterer og halv. Når du kender dem, bliver både digital og talt tid lettere at koble sammen.',
        previewTime: minutes(12, 0),
        readouts: {digital12: false, digital24: true, spoken: true, context: true}
      }),
      createStep('d1-guided', 'guided', {
        title: 'Find :30',
        simpleCopy: 'Vælg den digitale tid der passer til halv fire om eftermiddagen.',
        advancedCopy: 'Halv fire om eftermiddagen er 15:30. Mønsteret :30 viser, at du er midt i timen.',
        previewTime: minutes(15, 30),
        interaction: {
          type: 'choice',
          prompt: 'Hvilken digital tid passer til halv fire om eftermiddagen?',
          options: choiceOptions(['15:30', '15:00', '15:45', '03:30']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: '15:30'},
        hints: [
          ':30 betyder halv.',
          'Om eftermiddagen bruger du 24-timers tid.'
        ],
        successMessage: 'Ja. Halv fire om eftermiddagen svarer til 15:30.',
        workedExample: '15:30 er halv fire om eftermiddagen.'
      }),
      createStep('d1-why', 'why', {
        title: 'Find kvarteret',
        simpleCopy: 'Vælg den tid der viser kvart over otte.',
        advancedCopy: 'Kvart over betyder 15 minutter efter timen. Derfor svarer kvart over otte til :15 og ikke :45.',
        previewTime: minutes(8, 15),
        interaction: {
          type: 'choice',
          prompt: 'Hvilken tid viser kvart over otte?',
          options: choiceOptions(['08:15', '08:45', '08:30', '08:05']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: '08:15'},
        hints: [
          ':15 er et kvarter efter timen.',
          ':45 er kvart i næste time.'
        ],
        successMessage: 'Rigtigt. Kvart over otte er 08:15.',
        workedExample: '08:15 er kvart over otte.'
      }),
      createStep('d1-practice', 'practice', {
        title: 'Prøv selv med kvart i syv',
        simpleCopy: 'Vælg den digitale tid der passer til kvart i syv om aftenen.',
        advancedCopy: 'Kvart i syv om aftenen er 18:45 i 24-timers tid, fordi du er 15 minutter før 19:00.',
        previewTime: minutes(18, 45),
        interaction: {
          type: 'choice',
          prompt: 'Hvilken digital tid passer til kvart i syv om aftenen?',
          options: choiceOptions(['18:45', '18:15', '19:45', '06:45']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: '18:45'},
        hints: [
          ':45 er kvart i næste time.',
          'Om aftenen bruger du 24-timers tid.'
        ],
        successMessage: 'Godt. Kvart i syv om aftenen svarer til 18:45.',
        workedExample: '18:45 er kvart i syv om aftenen.'
      }),
      createStep('d1-checkpoint', 'checkpoint', {
        title: 'Checkpoint med halv tre',
        simpleCopy: 'Vælg den rigtige digitale tid for halv tre om eftermiddagen.',
        advancedCopy: 'Halv tre om eftermiddagen er 14:30, fordi 24-timers tid viser hele dagens timer.',
        previewTime: minutes(14, 30),
        interaction: {
          type: 'choice',
          prompt: 'Hvilken digital tid passer til halv tre om eftermiddagen?',
          options: choiceOptions(['02:30', '13:30', '14:30', '15:30']),
          checkLabel: 'Tjek checkpoint'
        },
        successCriteria: {type: 'choice-match', expectedValue: '14:30'},
        hints: [
          'Om eftermiddagen er du efter klokken 12.',
          'Halv tre er 2:30 på analogt ur og 14:30 i 24 timer.'
        ],
        successMessage: 'Checkpoint klaret. Du genkender nu de faste digitale mønstre.',
        workedExample: 'Halv tre om eftermiddagen svarer til 14:30.'
      })
    ]
  },
  {
    id: 'd2',
    title: 'Før og efter',
    subtitle: 'Sammenlign to tider og se hvad der kommer først.',
    missionId: 'dm3',
    steps: [
      createStep('d2-see', 'see', {
        title: 'Du kan sammenligne digitale tider',
        simpleCopy: '07:50 kommer før 08:00.',
        advancedCopy: 'Når du sammenligner to tider, kigger du først på timerne. Hvis timerne er ens, ser du på minutterne.',
        previewTime: minutes(7, 50),
        readouts: {digital12: false, digital24: true, spoken: true, context: true}
      }),
      createStep('d2-guided', 'guided', {
        title: 'Er 07:50 før eller efter 08:00?',
        simpleCopy: 'Vælg om 07:50 ligger før eller efter 08:00.',
        advancedCopy: '7 er mindre end 8, så du behøver slet ikke sammenligne minutdelen her.',
        interaction: {
          type: 'choice',
          prompt: 'Er 07:50 før eller efter 08:00?',
          options: choiceOptions(['Før', 'Efter', 'Samme tid']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'comparison-match', expectedValue: 'Før'},
        hints: [
          'Se på timen først.',
          '7 kommer før 8.'
        ],
        successMessage: 'Rigtigt. 07:50 kommer før 08:00.',
        workedExample: '07:50 er før 08:00, fordi timen 7 kommer før timen 8.'
      }),
      createStep('d2-why', 'why', {
        title: 'Læg 10 minutter til',
        simpleCopy: 'Vælg tiden der kommer 10 minutter efter 09:20.',
        advancedCopy: 'Når du lægger minutter til, ændrer timen sig kun hvis du passerer :59. 09:20 plus 10 minutter bliver derfor 09:30.',
        previewTime: minutes(9, 30),
        interaction: {
          type: 'choice',
          prompt: 'Hvilken tid kommer 10 minutter efter 09:20?',
          options: choiceOptions(['09:30', '09:10', '10:20', '10:30']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: '09:30'},
        hints: [
          'Du skal lægge 10 til minutdelen.',
          '20 plus 10 giver 30.'
        ],
        successMessage: 'Ja. 10 minutter efter 09:20 er 09:30.',
        workedExample: '09:20 plus 10 minutter giver 09:30.'
      }),
      createStep('d2-practice', 'practice', {
        title: 'Prøv selv med 18:15 og 17:55',
        simpleCopy: 'Er 18:15 før eller efter 17:55?',
        advancedCopy: 'Her er minutterne mindre nyttige end timerne. Tiden med timen 18 ligger efter tiden med timen 17.',
        interaction: {
          type: 'choice',
          prompt: 'Er 18:15 før eller efter 17:55?',
          options: choiceOptions(['Før', 'Efter', 'Samme tid']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'comparison-match', expectedValue: 'Efter'},
        hints: [
          'Sammenlign timerne 18 og 17.',
          '18 ligger efter 17.'
        ],
        successMessage: 'Godt. 18:15 ligger efter 17:55.',
        workedExample: '18:15 kommer efter 17:55, fordi timen 18 ligger senere end timen 17.'
      }),
      createStep('d2-checkpoint', 'checkpoint', {
        title: 'Checkpoint med 15 minutter før',
        simpleCopy: 'Vælg tiden der kommer 15 minutter før 14:30.',
        advancedCopy: 'Et kvarter er 15 minutter. 14:30 minus 15 minutter giver 14:15.',
        previewTime: minutes(14, 15),
        interaction: {
          type: 'choice',
          prompt: 'Hvilken tid kommer 15 minutter før 14:30?',
          options: choiceOptions(['14:15', '14:45', '13:45', '15:15']),
          checkLabel: 'Tjek checkpoint'
        },
        successCriteria: {type: 'choice-match', expectedValue: '14:15'},
        hints: [
          'Du skal trække 15 fra minutdelen.',
          '30 minus 15 giver 15.'
        ],
        successMessage: 'Checkpoint klaret. Du kan nu arbejde med før og efter.',
        workedExample: '15 minutter før 14:30 er 14:15.'
      })
    ]
  },
  {
    id: 'd3',
    title: 'Tidligt, til tiden, sent',
    subtitle: 'Vurdér tider i forhold til en aftale.',
    missionId: 'dm4',
    steps: [
      createStep('d3-see', 'see', {
        title: 'Aftaler giver tid mening',
        simpleCopy: 'Hvis skolen starter 08:00, er 07:50 tidligt og 08:10 sent.',
        advancedCopy: 'Tidligt, til tiden og sent handler altid om en bestemt aftale. Derfor skal du kende måltiden først, før du kan vurdere svaret.',
        previewTime: minutes(8, 0),
        readouts: {digital12: false, digital24: true, spoken: true, context: true}
      }),
      createStep('d3-guided', 'guided', {
        title: 'Skolen starter 08:00',
        simpleCopy: 'Du kommer 07:50. Er du tidligt, til tiden eller sent?',
        advancedCopy: '07:50 ligger før 08:00, så du er tidligt på den.',
        interaction: {
          type: 'choice',
          prompt: 'Skolen starter 08:00. Du kommer 07:50. Er du tidligt, til tiden eller sent?',
          options: choiceOptions(['Tidligt', 'Til tiden', 'Sent']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: 'Tidligt'},
        hints: [
          '07:50 ligger før 08:00.',
          'Før starttid betyder tidligt.'
        ],
        successMessage: 'Rigtigt. 07:50 er tidligt i forhold til 08:00.',
        workedExample: 'Når du kommer før starttiden, er du tidligt på den.'
      }),
      createStep('d3-why', 'why', {
        title: 'Præcis på tiden',
        simpleCopy: 'Hvis begge tider er ens, er du til tiden.',
        advancedCopy: 'Det er først til tiden, når tidspunktet og starttiden er helt ens. Selv få minutter før eller efter ændrer vurderingen.',
        interaction: {
          type: 'choice',
          prompt: 'Fodbold starter 16:00. Du kommer 16:00. Er du tidligt, til tiden eller sent?',
          options: choiceOptions(['Tidligt', 'Til tiden', 'Sent']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: 'Til tiden'},
        hints: [
          'Sammenlign de to tider direkte.',
          'De er helt ens.'
        ],
        successMessage: 'Ja. Samme tid betyder til tiden.',
        workedExample: '16:00 og 16:00 er den samme tid. Derfor er du til tiden.'
      }),
      createStep('d3-practice', 'practice', {
        title: 'Prøv selv med aftensmad',
        simpleCopy: 'Aftensmad starter 18:00. Du kommer 18:10. Er du tidligt, til tiden eller sent?',
        advancedCopy: '18:10 ligger efter 18:00, så du er kommet sent i forhold til aftalen.',
        interaction: {
          type: 'choice',
          prompt: 'Aftensmad starter 18:00. Du kommer 18:10. Er du tidligt, til tiden eller sent?',
          options: choiceOptions(['Tidligt', 'Til tiden', 'Sent']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: 'Sent'},
        hints: [
          '18:10 ligger efter 18:00.',
          'Efter starttid betyder sent.'
        ],
        successMessage: 'Godt. 18:10 er sent i forhold til 18:00.',
        workedExample: 'Når du kommer efter starttiden, er du sent på den.'
      }),
      createStep('d3-checkpoint', 'checkpoint', {
        title: 'Checkpoint med 07:25',
        simpleCopy: 'Bussen går 07:30. Du står der 07:25. Er du tidligt, til tiden eller sent?',
        advancedCopy: '07:25 er fem minutter før 07:30, så du er tidligt på den.',
        interaction: {
          type: 'choice',
          prompt: 'Bussen går 07:30. Du står der 07:25. Er du tidligt, til tiden eller sent?',
          options: choiceOptions(['Tidligt', 'Til tiden', 'Sent']),
          checkLabel: 'Tjek checkpoint'
        },
        successCriteria: {type: 'choice-match', expectedValue: 'Tidligt'},
        hints: [
          '07:25 ligger før 07:30.',
          'Før betyder tidligt.'
        ],
        successMessage: 'Checkpoint klaret. Du kan nu vurdere tidligt, til tiden og sent.',
        workedExample: '07:25 er tidligt, fordi det ligger før 07:30.'
      })
    ]
  },
  {
    id: 'd4',
    title: 'Dele af dagen',
    subtitle: 'Forbind tider med nat, morgen, formiddag, eftermiddag og aften.',
    missionId: 'dm5',
    steps: [
      createStep('d4-see', 'see', {
        title: 'Tider hører til forskellige dele af dagen',
        simpleCopy: '07:30 er morgen, 10:30 er formiddag, 14:30 er eftermiddag og 19:30 er aften.',
        advancedCopy: 'Dagens rytme giver ekstra mening til klokkeslæt. Det samme tal kan derfor føles forskelligt alt efter om det ligger om morgenen, eftermiddagen eller aftenen.',
        previewTime: minutes(10, 30),
        readouts: {digital12: false, digital24: true, spoken: true, context: true}
      }),
      createStep('d4-guided', 'guided', {
        title: 'Hvilken del af dagen er 07:30?',
        simpleCopy: 'Vælg den rigtige del af dagen for 07:30.',
        advancedCopy: '07:30 ligger efter natten og før formiddagen. Derfor kalder vi det morgen.',
        interaction: {
          type: 'choice',
          prompt: 'Hvilken del af dagen er 07:30?',
          options: choiceOptions(['Nat', 'Morgen', 'Formiddag', 'Eftermiddag', 'Aften']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: 'Morgen'},
        hints: [
          '07:30 er efter klokken 05:00.',
          'Det er stadig tidligt på dagen.'
        ],
        successMessage: 'Rigtigt. 07:30 hører til om morgenen.',
        workedExample: '07:30 ligger om morgenen.'
      }),
      createStep('d4-why', 'why', {
        title: 'Formiddag ligger før frokost',
        simpleCopy: '10:30 hører til formiddag.',
        advancedCopy: 'Formiddag ligger efter morgen og før middag. Derfor er 10:30 formiddag og ikke eftermiddag.',
        interaction: {
          type: 'choice',
          prompt: 'Hvilken del af dagen er 10:30?',
          options: choiceOptions(['Nat', 'Morgen', 'Formiddag', 'Eftermiddag', 'Aften']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: 'Formiddag'},
        hints: [
          '10:30 er før middag.',
          'Det er efter morgen men før eftermiddag.'
        ],
        successMessage: 'Ja. 10:30 er formiddag.',
        workedExample: '10:30 hører til formiddag.'
      }),
      createStep('d4-practice', 'practice', {
        title: 'Prøv selv med 14:30',
        simpleCopy: 'Hvilken del af dagen er 14:30?',
        advancedCopy: '14:30 ligger efter middag og før aften. Derfor kalder vi det eftermiddag.',
        interaction: {
          type: 'choice',
          prompt: 'Hvilken del af dagen er 14:30?',
          options: choiceOptions(['Nat', 'Morgen', 'Formiddag', 'Eftermiddag', 'Aften']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: 'Eftermiddag'},
        hints: [
          '14:30 er efter klokken 12.',
          'Det er endnu ikke aften.'
        ],
        successMessage: 'Godt. 14:30 er eftermiddag.',
        workedExample: '14:30 ligger om eftermiddagen.'
      }),
      createStep('d4-checkpoint', 'checkpoint', {
        title: 'Checkpoint med 02:15',
        simpleCopy: 'Hvilken del af dagen er 02:15?',
        advancedCopy: '02:15 ligger midt om natten og hører derfor til nat.',
        interaction: {
          type: 'choice',
          prompt: 'Hvilken del af dagen er 02:15?',
          options: choiceOptions(['Nat', 'Morgen', 'Formiddag', 'Eftermiddag', 'Aften']),
          checkLabel: 'Tjek checkpoint'
        },
        successCriteria: {type: 'choice-match', expectedValue: 'Nat'},
        hints: [
          '02:15 er før 05:00.',
          'Tidligt om natten kaldes nat.'
        ],
        successMessage: 'Checkpoint klaret. Du kan nu placere tider i dagens dele.',
        workedExample: '02:15 ligger om natten.'
      })
    ]
  },
  {
    id: 'd5',
    title: 'Hverdagsrytme',
    subtitle: 'Knyt tider til ting der sker i løbet af dagen.',
    missionId: 'dm5',
    steps: [
      createStep('d5-see', 'see', {
        title: 'Tid giver mening i hverdagen',
        simpleCopy: 'Morgenmad, skole, fritid, aftensmad og sengetid ligger ofte på forskellige tider.',
        advancedCopy: 'Når du kobler klokkeslæt til hverdagen, bliver det lettere at mærke om et tidspunkt virker tidligt, sent eller helt passende.',
        previewTime: minutes(18, 0),
        readouts: {digital12: false, digital24: true, spoken: true, context: true}
      }),
      createStep('d5-guided', 'guided', {
        title: 'Hvornår passer morgenmad bedst?',
        simpleCopy: 'Vælg det tidspunkt der passer bedst til morgenmad.',
        advancedCopy: 'Morgenmad ligger typisk om morgenen og derfor før skole og længe før aftensmad.',
        interaction: {
          type: 'choice',
          prompt: 'Hvilket tidspunkt passer bedst til morgenmad?',
          options: choiceOptions(['07:15', '12:15', '18:15', '21:15']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: '07:15'},
        hints: [
          'Morgenmad ligger om morgenen.',
          '07:15 passer bedre end tider midt på dagen eller om aftenen.'
        ],
        successMessage: 'Rigtigt. 07:15 passer godt til morgenmad.',
        workedExample: 'Morgenmad passer bedst tidligt på dagen, fx 07:15.'
      }),
      createStep('d5-why', 'why', {
        title: 'Hvilken situation passer til 15:30?',
        simpleCopy: 'Vælg den situation der passer bedst til 15:30.',
        advancedCopy: '15:30 ligger om eftermiddagen og passer bedre til fritid eller at være færdig i skole end til morgenmad eller sengetid.',
        interaction: {
          type: 'choice',
          prompt: 'Hvilken situation passer bedst til 15:30?',
          options: choiceOptions(['Morgenmad', 'Skolefri og fritid', 'Sengetid', 'Midt om natten']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: 'Skolefri og fritid'},
        hints: [
          '15:30 ligger om eftermiddagen.',
          'Det passer bedre til aktiviteter efter skole.'
        ],
        successMessage: 'Ja. 15:30 passer bedst til fritid om eftermiddagen.',
        workedExample: '15:30 ligger godt til skolefri og fritid.'
      }),
      createStep('d5-practice', 'practice', {
        title: 'Prøv selv med sengetid',
        simpleCopy: 'Vælg den tid der passer bedst til sengetid.',
        advancedCopy: 'Sengetid ligger typisk om aftenen. Derfor er 20:30 mere sandsynlig end tider om morgenen eller midt på dagen.',
        interaction: {
          type: 'choice',
          prompt: 'Hvilket tidspunkt passer bedst til sengetid?',
          options: choiceOptions(['06:30', '11:30', '16:30', '20:30']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: '20:30'},
        hints: [
          'Sengetid er om aftenen.',
          '20:30 passer bedre end tider tidligere på dagen.'
        ],
        successMessage: 'Godt. 20:30 passer godt til sengetid.',
        workedExample: 'Sengetid passer bedst om aftenen, fx 20:30.'
      }),
      createStep('d5-checkpoint', 'checkpoint', {
        title: 'Checkpoint med aftensmad',
        simpleCopy: 'Vælg den tid der passer bedst til aftensmad.',
        advancedCopy: 'Aftensmad ligger som regel senere end skole og tidligere end sengetid, ofte omkring 18-tiden.',
        interaction: {
          type: 'choice',
          prompt: 'Hvilket tidspunkt passer bedst til aftensmad?',
          options: choiceOptions(['07:45', '12:00', '18:00', '22:00']),
          checkLabel: 'Tjek checkpoint'
        },
        successCriteria: {type: 'choice-match', expectedValue: '18:00'},
        hints: [
          'Aftensmad er senere end middag.',
          '18:00 ligger tidligt på aftenen.'
        ],
        successMessage: 'Checkpoint klaret. Du kobler nu digitale tider til hverdagens rytme.',
        workedExample: '18:00 passer godt til aftensmad.'
      })
    ]
  },
  {
    id: 'd6',
    title: 'Bro mellem former',
    subtitle: 'Oversæt mellem digital tid, talt tid og analog visning.',
    missionId: 'dm6',
    steps: [
      createStep('d6-see', 'see', {
        title: '18:15 og kvart over seks er samme tid',
        simpleCopy: 'Digital tid, talesprog og analogt ur kan vise samme tidspunkt på forskellige måder.',
        advancedCopy: '18:15 betyder 6:15 om aftenen på et analogt ur. Det samme øjeblik kan derfor beskrives med tal, tale og viserplacering.',
        previewTime: minutes(18, 15),
        readouts: {digital12: true, digital24: true, spoken: true, context: true}
      }),
      createStep('d6-guided', 'guided', {
        title: 'Oversæt 18:15',
        simpleCopy: 'Vælg den talt form der passer til 18:15.',
        advancedCopy: '18:15 ligger om aftenen og er et kvarter efter 6 på 12-timers uret. Derfor siger vi kvart over seks om aftenen.',
        interaction: {
          type: 'choice',
          prompt: 'Hvilket dansk udtryk passer til 18:15?',
          options: choiceOptions([
            'kvart over seks om aftenen',
            'kvart i seks om aftenen',
            'halv seks om aftenen',
            'kvart over atten'
          ]),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: 'kvart over seks om aftenen'},
        hints: [
          '18:15 svarer til 6:15 på 12-timers uret.',
          '15 minutter er kvart over.'
        ],
        successMessage: 'Rigtigt. 18:15 er kvart over seks om aftenen.',
        workedExample: '18:15 oversættes til kvart over seks om aftenen.'
      }),
      createStep('d6-why', 'why', {
        title: 'Fra tale til digital tid',
        simpleCopy: 'Vælg den 24-timers tid der passer til halv tre om eftermiddagen.',
        advancedCopy: 'Halv tre er 2:30 på 12-timers uret. Om eftermiddagen lægger du 12 til timen, så det bliver 14:30.',
        interaction: {
          type: 'choice',
          prompt: 'Hvilken 24-timers tid passer til halv tre om eftermiddagen?',
          options: choiceOptions(['02:30', '12:30', '14:30', '15:30']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: '14:30'},
        hints: [
          'Halv tre er 2:30 på 12-timers uret.',
          'Om eftermiddagen lægger du 12 til timen.'
        ],
        successMessage: 'Ja. Halv tre om eftermiddagen er 14:30.',
        workedExample: 'Halv tre om eftermiddagen svarer til 14:30.'
      }),
      createStep('d6-practice', 'practice', {
        title: 'Prøv selv med kvart i otte om morgenen',
        simpleCopy: 'Vælg den 24-timers tid der passer til kvart i otte om morgenen.',
        advancedCopy: 'Kvart i otte er 7:45 på 12-timers uret. Om morgenen bliver det derfor 07:45 i 24-timers tid.',
        interaction: {
          type: 'choice',
          prompt: 'Hvilken 24-timers tid passer til kvart i otte om morgenen?',
          options: choiceOptions(['07:45', '08:45', '19:45', '20:45']),
          checkLabel: 'Tjek trin'
        },
        successCriteria: {type: 'choice-match', expectedValue: '07:45'},
        hints: [
          'Kvart i otte er 15 minutter før 8.',
          'Om morgenen bliver timen ikke hævet med 12.'
        ],
        successMessage: 'Godt. Kvart i otte om morgenen er 07:45.',
        workedExample: 'Kvart i otte om morgenen svarer til 07:45.'
      }),
      createStep('d6-checkpoint', 'checkpoint', {
        title: 'Checkpoint med 21:00 på analogt ur',
        simpleCopy: 'Sæt det analoge ur til 21:00.',
        advancedCopy: '21:00 er 9:00 om aftenen på analogt ur. Minutviseren skal stå på 12, og timeviseren på 9.',
        clock: {
          initialTime: minutes(21, 30),
          interactive: true,
          showHelpers: true,
          teachingState: {
            allowedHands: ['hour', 'minute'],
            highlightedNumbers: [9, 12]
          }
        },
        readouts: {digital12: true, digital24: true, spoken: true, context: true},
        interaction: {
          type: 'clock',
          prompt: 'Checkpoint: Sæt det analoge ur til 21:00.',
          targetTime: minutes(21, 0),
          toleranceMinutes: 0,
          checkLabel: 'Tjek checkpoint',
          hintTeachingState: {
            highlightedNumbers: [9, 12],
            targetTime: minutes(21, 0)
          }
        },
        successCriteria: {type: 'clock-match', targetTime: minutes(21, 0), toleranceMinutes: 0},
        hints: [
          '21:00 svarer analogt til 9:00 om aftenen.',
          'Hele timer har minutviseren på 12.'
        ],
        successMessage: 'Checkpoint klaret. Du kan nu skifte mellem digital tid, tale og analog visning.',
        workedExample: '21:00 er 9:00 om aftenen på det analoge ur.'
      })
    ]
  }
];

const TRACKS = {
  analog: ANALOG_LESSONS.map((lesson) => ({...lesson, track: 'analog'})),
  digital: DIGITAL_LESSONS.map((lesson) => ({...lesson, track: 'digital'}))
};

function lessonsForTrack(track = 'analog') {
  return TRACKS[track] || TRACKS.analog;
}

function allLessons() {
  return [...TRACKS.analog, ...TRACKS.digital];
}

export function getTrackMeta(track) {
  return TRACK_META[track] || TRACK_META.analog;
}

export function createDefaultTrackProgress(track = 'analog') {
  const lessons = lessonsForTrack(track);
  return {
    entryChoice: '',
    hasSeenIntro: false,
    currentLessonId: lessons[0]?.id || '',
    currentStepIndex: 0,
    completedLessons: [],
    skippedLessons: [],
    skippedSteps: [],
    completedCheckpoints: {}
  };
}

export function createDefaultLearningPathState() {
  return {
    activeTrack: 'analog',
    hasChosenTrack: false,
    lastVisitedMode: 'guide',
    trackStates: {
      analog: createDefaultTrackProgress('analog'),
      digital: createDefaultTrackProgress('digital')
    }
  };
}

export function getTrackProgress(learningPath, track = 'analog') {
  const activeTrack = track || learningPath?.activeTrack || 'analog';
  if (!learningPath?.trackStates?.[activeTrack]) {
    return createDefaultTrackProgress(activeTrack);
  }
  return learningPath.trackStates[activeTrack];
}

export function getLessonDefinitions(track = 'analog') {
  return lessonsForTrack(track);
}

export function getLessonTrack(lessonId) {
  return TRACK_ORDER.find((track) => lessonsForTrack(track).some((lesson) => lesson.id === lessonId)) || 'analog';
}

export function getLessonById(lessonId, track = null) {
  if (track) {
    return lessonsForTrack(track).find((lesson) => lesson.id === lessonId) || lessonsForTrack(track)[0];
  }
  return allLessons().find((lesson) => lesson.id === lessonId) || TRACKS.analog[0];
}

export function getLessonIndex(track = 'analog', lessonId) {
  return lessonsForTrack(track).findIndex((lesson) => lesson.id === lessonId);
}

export function getNextLessonId(track = 'analog', lessonId) {
  const currentIndex = getLessonIndex(track, lessonId);
  const lessons = lessonsForTrack(track);
  if (currentIndex < 0 || currentIndex === lessons.length - 1) {
    return null;
  }
  return lessons[currentIndex + 1].id;
}

export function getPreviousLessonId(track = 'analog', lessonId) {
  const currentIndex = getLessonIndex(track, lessonId);
  if (currentIndex <= 0) {
    return null;
  }
  return lessonsForTrack(track)[currentIndex - 1].id;
}

export function isLessonUnlocked(trackProgress, lessonId, track = 'analog') {
  const lessons = lessonsForTrack(track);
  const lessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
  const currentIndex = Math.max(0, lessons.findIndex((lesson) => lesson.id === (trackProgress?.currentLessonId || lessons[0].id)));
  const learned = [
    ...(Array.isArray(trackProgress?.completedLessons) ? trackProgress.completedLessons : []),
    ...(Array.isArray(trackProgress?.skippedLessons) ? trackProgress.skippedLessons : [])
  ];
  const furthestReached = learned.reduce((maxIndex, learnedId) => {
    const index = lessons.findIndex((lesson) => lesson.id === learnedId);
    return index > maxIndex ? index : maxIndex;
  }, -1);

  return lessonIndex <= Math.max(currentIndex, furthestReached + 1);
}

export function evaluateLessonStep(step, response = {}) {
  if (!step?.successCriteria) {
    return {correct: true};
  }

  if (step.successCriteria.type === 'clock-match' || step.successCriteria.type === 'digital-match') {
    const target = step.successCriteria.targetTime;
    const actual = response.time;
    const tolerance = step.successCriteria.toleranceMinutes ?? 0;
    if (typeof actual !== 'number') {
      return {correct: false, delta: Infinity};
    }
    const delta = Math.abs(target - actual);
    return {correct: delta <= tolerance, delta};
  }

  if (step.successCriteria.type === 'choice-match' || step.successCriteria.type === 'comparison-match') {
    const actualValue = response?.selected?.label ?? response?.value ?? null;
    return {
      correct: actualValue === step.successCriteria.expectedValue,
      actualValue
    };
  }

  return {correct: false};
}
