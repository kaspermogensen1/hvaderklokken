export const DEFAULT_MISSION_POOL = [
  {type: 'read_clock', frequency: 1},
  {type: 'set_clock', frequency: 1},
  {type: 'match_representation', frequency: 1},
  {type: 'missing_piece', frequency: 1},
  {type: 'error_detective', frequency: 1}
];

export const MISSION_SKILL_TAGS = {
  m1: ['hands-identify', 'minute-hour-concept', 'clock-numbers'],
  m2: ['full-hours', 'halves', 'halv-phrasing'],
  m3: ['quarters', 'quarter-language', 'clock-quadrants'],
  m4: ['five-minute-markers', 'minute-groups'],
  m5: ['exact-minutes', 'minute-precision'],
  m6: ['translation'],
  dm1: ['digital-structure', 'leading-zeroes'],
  dm2: ['digital-patterns', 'quarter-patterns'],
  dm3: ['before-after', 'time-comparison'],
  dm4: ['early-late', 'schedule-sense'],
  dm5: ['day-segments', 'daily-rhythm'],
  dm6: ['digital-translation', 'digital-analog-bridge']
};

export const MISCONCEPTION_TO_SKILL = {
  'minute-hour-confusion': 'minute-hour-concept',
  num8means40: 'minute-groups',
  hourHandOnWholeNumberOnly: 'hands-identify',
  halv_to_misread: 'halv-phrasing',
  quarter_past_to_confusion: 'quarter-language',
  analog_digital_split: 'translation',
  h24_context_error: 'translation',
  digital_hour_minute_order: 'digital-structure',
  leading_zero_confusion: 'leading-zeroes',
  before_after_reversal: 'before-after',
  early_late_reversal: 'early-late',
  day_segment_confusion: 'day-segments',
  digital_analog_bridge_confusion: 'digital-analog-bridge'
};

export const OPTION_LABELS = {
  read_clock: 'Læs klokken',
  set_clock: 'Sæt klokken',
  match_representation: 'Find det tilsvarende',
  error_detective: 'Find fejlen',
  missing_piece: 'Manglende del',
  quick_review: 'Mikrosnit',
  boss_mission: 'Boss',
  read_digital_time: 'Læs digital tid',
  set_digital_time: 'Skriv digital tid',
  select_digital_time: 'Vælg digital tid',
  compare_times: 'Sammenlign tider',
  judge_early_late: 'Tidligt eller sent',
  classify_day_segment: 'Del af dagen',
  match_daily_context: 'Hverdagsmatch',
  translate_digital_to_spoken: 'Oversæt digital tid'
};

export const MISSION_DEFS_FALLBACK = [
  {
    id: 'm1',
    track: 'analog',
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
    track: 'analog',
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
    track: 'analog',
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
    track: 'analog',
    level: 4,
    title: 'Hvert femte minut',
    objective: 'Arbejde med minutter i fem minutters trin.',
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
    track: 'analog',
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
    track: 'analog',
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
  },
  {
    id: 'dm1',
    track: 'digital',
    level: 1,
    title: 'Mød det digitale ur',
    objective: 'Læs timer og minutter i HH:MM.',
    skills: ['digital-structure', 'leading-zeroes'],
    taskDistribution: {
      read_digital_time: 4,
      select_digital_time: 4
    },
    requiredMastery: 70,
    difficultyBand: 1,
    totalTasks: 8
  },
  {
    id: 'dm2',
    track: 'digital',
    level: 2,
    title: 'Mønstre i tiden',
    objective: 'Arbejd med :00, :15, :30 og :45.',
    skills: ['digital-patterns', 'quarter-patterns'],
    taskDistribution: {
      read_digital_time: 2,
      select_digital_time: 3,
      translate_digital_to_spoken: 3
    },
    requiredMastery: 74,
    difficultyBand: 2,
    totalTasks: 8
  },
  {
    id: 'dm3',
    track: 'digital',
    level: 3,
    title: 'Før og efter',
    objective: 'Sammenlign tider og se hvilken der kommer først.',
    skills: ['before-after', 'time-comparison'],
    taskDistribution: {
      compare_times: 6,
      read_digital_time: 2
    },
    requiredMastery: 76,
    difficultyBand: 3,
    totalTasks: 8
  },
  {
    id: 'dm4',
    track: 'digital',
    level: 4,
    title: 'Tidligt eller sent',
    objective: 'Vurder tid i forhold til en starttid.',
    skills: ['early-late', 'schedule-sense'],
    taskDistribution: {
      judge_early_late: 6,
      compare_times: 2
    },
    requiredMastery: 78,
    difficultyBand: 4,
    totalTasks: 8
  },
  {
    id: 'dm5',
    track: 'digital',
    level: 5,
    title: 'Dele af dagen',
    objective: 'Forbind tider med morgen, formiddag, eftermiddag og aften.',
    skills: ['day-segments', 'daily-rhythm'],
    taskDistribution: {
      classify_day_segment: 4,
      match_daily_context: 3,
      read_digital_time: 1
    },
    requiredMastery: 80,
    difficultyBand: 5,
    totalTasks: 8
  },
  {
    id: 'dm6',
    track: 'digital',
    level: 6,
    title: 'Bro til tale og ur',
    objective: 'Oversæt mellem digital tid, sproglig tid og analog visning.',
    skills: ['digital-translation', 'digital-analog-bridge'],
    taskDistribution: {
      translate_digital_to_spoken: 3,
      select_digital_time: 2,
      set_clock: 2,
      match_representation: 1
    },
    requiredMastery: 82,
    difficultyBand: 6,
    totalTasks: 8
  }
];
