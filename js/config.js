export const APP_VERSION = '2.1.1';
export const STORAGE_KEY = 'klokkevaerk_state_v2';
export const LEGACY_STORAGE_KEYS = ['klokkevaerk_state_v1'];

export const ROUTES = {
  home: '#/',
  learn: '#/learn',
  practice: '#/practice',
  lab: '#/lab',
  review: '#/review'
};

export const APP_NAME = 'Klokkemester';
export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  reducedMotion: false,
  helperRings: true,
  vibration: false,
  locale: 'da-DK'
};

export const REWARD_ICON = '🌟';

export const REVIEW_MISSION_TAG_MAP = {
  'minute-hour-confusion': 'm1',
  num8means40: 'm4',
  hourHandOnWholeNumberOnly: 'm2',
  halv_to_misread: 'm2',
  quarter_past_to_confusion: 'm3',
  analog_digital_split: 'm6',
  h24_context_error: 'm6',
  digital_hour_minute_order: 'dm1',
  leading_zero_confusion: 'dm1',
  before_after_reversal: 'dm3',
  early_late_reversal: 'dm4',
  day_segment_confusion: 'dm5',
  digital_analog_bridge_confusion: 'dm6'
};
