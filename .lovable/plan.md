

## Backfill Spanish Translations for All Services

### Current State
17 services exist, all with `name_es` and `description_es` as NULL. When toggled to Spanish, the site falls back to English text.

### Plan

**Single database migration** to UPDATE all 17 rows with Spanish translations:

| name_en | name_es | description_es (summary) |
|---|---|---|
| Cake | Pastel | Pasteles personalizados para cualquier ocasión |
| Private Chef Experience | Experiencia de Chef Privado | Cocina costarricense auténtica... |
| Luxury Airport Transfer | Traslado de Lujo al Aeropuerto | Servicio premium de transporte... |
| In-Villa Spa & Wellness | Spa y Bienestar en la Villa | Lleve el spa a su villa... |
| Special Celebration Setup | Montaje para Celebración Especial | Transforme su villa para cumpleaños... |
| ATV Jungle Adventure | Aventura en ATV por la Selva | Explore Costa Rica fuera de lo común... |
| La Fortuna Waterfall Hike | Caminata a la Catarata La Fortuna | Caminata guiada... |
| Private Catamaran | Catamarán Privado | Crucero exclusivo al atardecer... |
| Surfing (Advanced) | Surf (Avanzado) | Excursión de surf para surfistas avanzados |
| Beach Club VIP Access | Acceso VIP al Club de Playa | Acceso exclusivo a club de playa premium... |
| Fishing Tours | Tours de Pesca | Tours de pesca a su medida |
| Zip-lining Adventure | Aventura de Tirolesa | Emocionante recorrido de canopy... |
| Coffee Tours | Tours de Café | Recorra fincas de café de manera interactiva |
| Golf Carts | Carritos de Golf | Alquiler de carritos de golf |
| Arenal Volcano & Hot Springs | Volcán Arenal y Aguas Termales | Tour guiado de día completo... |
| Local Performers | Artistas Locales | Desde músicos hasta magos |
| Flower Arrangements | Arreglos Florales | Arreglos florales, grandes o pequeños |

### Files Changed
- **Migration SQL**: One `UPDATE` per service row, setting `name_es` and `description_es`

No code changes needed — the Experiences page already reads `name_es`/`description_es` and falls back to English.

