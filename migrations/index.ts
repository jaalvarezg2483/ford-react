import * as migration_20261020_000035_initial from './20261020_000035_initial';
import * as migration_20261020_000342_page_body_start from './20261020_000342_page_body_start';
import * as migration_20261020_001420_settings_calculators_parameters from './20261020_001420_settings_calculators_parameters';
import * as migration_20261020_010000_site_sessions from './20261020_010000_site_sessions';

export const migrations = [
  {
    up: migration_20261020_000035_initial.up,
    down: migration_20261020_000035_initial.down,
    name: '20261020_000035_initial',
  },
  {
    up: migration_20261020_000342_page_body_start.up,
    down: migration_20261020_000342_page_body_start.down,
    name: '20261020_000342_page_body_start',
  },
  {
    up: migration_20261020_001420_settings_calculators_parameters.up,
    down: migration_20261020_001420_settings_calculators_parameters.down,
    name: '20261020_001420_settings_calculators_parameters',
  },
  {
    up: migration_20261020_010000_site_sessions.up,
    down: migration_20261020_010000_site_sessions.down,
    name: '20261020_010000_site_sessions'
  },
];
