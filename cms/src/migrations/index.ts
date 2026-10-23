import * as migration_20261020_000035_initial from './20261020_000035_initial';
import * as migration_20261020_000342_page_body_start from './20261020_000342_page_body_start';
import * as migration_20261020_001420_settings_calculators_parameters from './20261020_001420_settings_calculators_parameters';
import * as migration_20261020_002800_model_specs from './20261020_002800_model_specs';
import * as migration_20261020_003022_posts_category_views from './20261020_003022_posts_category_views';
import * as migration_20261020_003053_posts_featured from './20261020_003053_posts_featured';
import * as migration_20261020_003356_videos from './20261020_003356_videos';
import * as migration_20261020_003715_page_price_refs from './20261020_003715_page_price_refs';
import * as migration_20261020_010000_site_sessions from './20261020_010000_site_sessions';
import * as migration_20261020_142916_family_type_card_styles from './20261020_142916_family_type_card_styles';
import * as migration_20261020_170702 from './20261020_170702';
import * as migration_20261020_174359_campos_amigables_sin_json from './20261020_174359_campos_amigables_sin_json';
import * as migration_20261020_180916_editables_contenido_seo from './20261020_180916_editables_contenido_seo';
import * as migration_20261022_201150_blog_feedback from './20261022_201150_blog_feedback';
import * as migration_20261023_140247_estructura_portada_pie from './20261023_140247_estructura_portada_pie';
import * as migration_20261023_152355_ficha_vehiculo_y_articulos from './20261023_152355_ficha_vehiculo_y_articulos';
import * as migration_20261023_162402_paginas_de_contenido from './20261023_162402_paginas_de_contenido';

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
    up: migration_20261020_002800_model_specs.up,
    down: migration_20261020_002800_model_specs.down,
    name: '20261020_002800_model_specs',
  },
  {
    up: migration_20261020_003022_posts_category_views.up,
    down: migration_20261020_003022_posts_category_views.down,
    name: '20261020_003022_posts_category_views',
  },
  {
    up: migration_20261020_003053_posts_featured.up,
    down: migration_20261020_003053_posts_featured.down,
    name: '20261020_003053_posts_featured',
  },
  {
    up: migration_20261020_003356_videos.up,
    down: migration_20261020_003356_videos.down,
    name: '20261020_003356_videos',
  },
  {
    up: migration_20261020_003715_page_price_refs.up,
    down: migration_20261020_003715_page_price_refs.down,
    name: '20261020_003715_page_price_refs',
  },
  {
    up: migration_20261020_010000_site_sessions.up,
    down: migration_20261020_010000_site_sessions.down,
    name: '20261020_010000_site_sessions',
  },
  {
    up: migration_20261020_142916_family_type_card_styles.up,
    down: migration_20261020_142916_family_type_card_styles.down,
    name: '20261020_142916_family_type_card_styles',
  },
  {
    up: migration_20261020_170702.up,
    down: migration_20261020_170702.down,
    name: '20261020_170702',
  },
  {
    up: migration_20261020_174359_campos_amigables_sin_json.up,
    down: migration_20261020_174359_campos_amigables_sin_json.down,
    name: '20261020_174359_campos_amigables_sin_json',
  },
  {
    up: migration_20261020_180916_editables_contenido_seo.up,
    down: migration_20261020_180916_editables_contenido_seo.down,
    name: '20261020_180916_editables_contenido_seo',
  },
  {
    up: migration_20261022_201150_blog_feedback.up,
    down: migration_20261022_201150_blog_feedback.down,
    name: '20261022_201150_blog_feedback',
  },
  {
    up: migration_20261023_140247_estructura_portada_pie.up,
    down: migration_20261023_140247_estructura_portada_pie.down,
    name: '20261023_140247_estructura_portada_pie',
  },
  {
    up: migration_20261023_152355_ficha_vehiculo_y_articulos.up,
    down: migration_20261023_152355_ficha_vehiculo_y_articulos.down,
    name: '20261023_152355_ficha_vehiculo_y_articulos',
  },
  {
    up: migration_20261023_162402_paginas_de_contenido.up,
    down: migration_20261023_162402_paginas_de_contenido.down,
    name: '20261023_162402_paginas_de_contenido'
  },
];
