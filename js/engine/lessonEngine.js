const STEP_LABELS = {
  see: 'Se det',
  guided: 'Prøv det sammen',
  why: 'Hvorfor virker det',
  practice: 'Prøv selv',
  checkpoint: 'Tjek'
};

const minutes = (hour, minute) => (hour * 60) + minute;

const createStep = (id, kind, config) => ({
  id,
  kind,
  label: STEP_LABELS[kind],
  simpleCopy: '',
  advancedCopy: '',
  clock: null,
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

const LESSONS = [
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

export function createDefaultLearningPathState() {
  return {
    entryChoice: '',
    hasSeenBeginnerIntro: false,
    currentLessonId: LESSONS[0].id,
    currentStepIndex: 0,
    completedLessons: [],
    completedCheckpoints: {},
    lastVisitedMode: 'guide'
  };
}

export function getLessonDefinitions() {
  return LESSONS;
}

export function getLessonById(lessonId) {
  return LESSONS.find((lesson) => lesson.id === lessonId) || LESSONS[0];
}

export function getLessonIndex(lessonId) {
  return LESSONS.findIndex((lesson) => lesson.id === lessonId);
}

export function getNextLessonId(lessonId) {
  const currentIndex = getLessonIndex(lessonId);
  if (currentIndex < 0 || currentIndex === LESSONS.length - 1) {
    return null;
  }
  return LESSONS[currentIndex + 1].id;
}

export function getPreviousLessonId(lessonId) {
  const currentIndex = getLessonIndex(lessonId);
  if (currentIndex <= 0) {
    return null;
  }
  return LESSONS[currentIndex - 1].id;
}

export function isLessonUnlocked(learningPath, lessonId) {
  const lessonIndex = getLessonIndex(lessonId);
  const currentIndex = Math.max(0, getLessonIndex(learningPath?.currentLessonId || LESSONS[0].id));
  const completedLessons = Array.isArray(learningPath?.completedLessons) ? learningPath.completedLessons : [];
  const furthestCompleted = completedLessons.reduce((maxIndex, completedId) => {
    const index = getLessonIndex(completedId);
    return index > maxIndex ? index : maxIndex;
  }, -1);

  return lessonIndex <= Math.max(currentIndex, furthestCompleted + 1);
}

export function evaluateLessonStep(step, response = {}) {
  if (!step?.successCriteria) {
    return {correct: true};
  }

  if (step.successCriteria.type === 'clock-match') {
    const target = step.successCriteria.targetTime;
    const actual = response.time;
    const tolerance = step.successCriteria.toleranceMinutes ?? 0;
    if (typeof actual !== 'number') {
      return {correct: false, delta: Infinity};
    }
    const delta = Math.abs(target - actual);
    return {correct: delta <= tolerance, delta};
  }

  return {correct: false};
}
