export const DEFAULT_MISSION_POOL = [
  {
    type: 'read_clock',
    frequency: 1
  },
  {
    type: 'set_clock',
    frequency: 1
  },
  {
    type: 'match_representation',
    frequency: 1
  },
  {
    type: 'missing_piece',
    frequency: 1
  },
  {
    type: 'error_detective',
    frequency: 1
  }
];

export const MISSION_SKILL_TAGS = {
  m1: ['hands-identify', 'minute-hour-concept', 'clock-numbers'],
  m2: ['full-hours', 'halves', 'halv-phrasing'],
  m3: ['quarters', 'quarter-language', 'clock-quadrants'],
  m4: ['five-minute-markers', 'minute-groups'],
  m5: ['exact-minutes', 'minute-precision'],
  m6: ['translation'],
};

export const MISCONCEPTION_TO_SKILL = {
  'minute-hour-confusion': 'minute-hour-concept',
  num8means40: 'minute-groups',
  hourHandOnWholeNumberOnly: 'hands-identify',
  halv_to_misread: 'halv-phrasing',
  quarter_past_to_confusion: 'quarter-language',
  analog_digital_split: 'translation',
  h24_context_error: 'translation'
};

export const OPTION_LABELS = {
  read_clock: 'Læs klokken',
  set_clock: 'Sæt klokken',
  match_representation: 'Find det tilsvarende',
  error_detective: 'Find fejlen',
  missing_piece: 'Manglende del',
  quick_review: 'Mikrosnit',
  boss_mission: 'Boss'
};

export const MISSION_DEFS_FALLBACK = [
  {
    id: 'm1',
    level: 1,
    title: 'Møde uret',
    objective: 'Forstå time- og minutviser.',
    skills: ['hands-identify', 'clock-direction'],
    taskDistribution: {
      read_clock: 3,
      set_clock: 2,
      match_representation: 1,
      quick_review: 1
    },
    requiredMastery: 70,
    difficultyBand: 1,
    totalTasks: 7
  },
  {
    id: 'm2',
    level: 2,
    title: 'Fuldtime og halvtime',
    objective: 'Lær hele timer og halvtime.',
    skills: ['full-hours', 'halves', 'halv-phrasing'],
    taskDistribution: {
      read_clock: 2,
      set_clock: 2,
      match_representation: 2,
      missing_piece: 2
    },
    requiredMastery: 75,
    difficultyBand: 2,
    totalTasks: 8
  },
  {
    id: 'm3',
    level: 3,
    title: 'Kvart over og kvart i',
    objective: 'Træn kvartudtryk.',
    skills: ['quarters', 'quarter-language'],
    taskDistribution: {
      read_clock: 2,
      set_clock: 2,
      match_representation: 2,
      error_detective: 2
    },
    requiredMastery: 75,
    difficultyBand: 3,
    totalTasks: 8
  },
  {
    id: 'm4',
    level: 4,
    title: 'Hvert femte minut',
    objective: 'Arbejde med minutter i fem minutter trin.',
    skills: ['five-minute-markers', 'minute-groups'],
    taskDistribution: {
      read_clock: 3,
      set_clock: 2,
      missing_piece: 2,
      quick_review: 1
    },
    requiredMastery: 80,
    difficultyBand: 4,
    totalTasks: 8
  },
  {
    id: 'm5',
    level: 5,
    title: 'Præcise minutter',
    objective: 'Lær tiden mellem fem-minutters mærker.',
    skills: ['exact-minutes', 'minute-precision'],
    taskDistribution: {
      read_clock: 3,
      set_clock: 3,
      error_detective: 2,
      match_representation: 2
    },
    requiredMastery: 82,
    difficultyBand: 5,
    totalTasks: 10
  },
  {
    id: 'm6',
    level: 6,
    title: 'Oversæt mellem former',
    objective: 'Knyt analog, digital og sproglig tid tættere sammen.',
    skills: ['translation', 'cross-form'],
    taskDistribution: {
      match_representation: 4,
      set_clock: 2,
      read_clock: 2,
      boss_mission: 2
    },
    requiredMastery: 84,
    difficultyBand: 6,
    totalTasks: 10
  }
];
