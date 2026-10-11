# Aircraft images and specification audit — 2026-10-12

17 company/model-matched official images: China Airlines 7, EVA 6, STARLUX 4. China Airlines and EVA assets are official renders, not real-flight photographs; STARLUX assets are labelled official promotional images. Rights remain with the respective airlines; no open licence is claimed. Source page, original image URL, verification date, and credit are retained per image in fleet.json. Asset refresh helper validates image bytes before saving.

Added currently published EVA and STARLUX seat layouts, preserving EVA 777 multiple configurations and distinguishing the currently published 787-9 layout from a claim about all individual aircraft. China Airlines current seat-map page exposes multiple A321neo/A350 layouts, so a universal seat count is not assigned. Cargo passenger seating is not applicable.

Engine sources: GE Aerospace for EVA 777-300ER/787 family; CFM and Rolls-Royce for STARLUX A321neo/A330neo. Historical purchase counts are not copied into current fleet totals. Newly verified sources are listed in data/sources.json. Other aircraft counts retain their original as-of dates.

Validation: source schema, all 17 image loads, four responsive widths at 150%, error fallback, existing navigation and reading controls. No new numerical chart was inferred from images or configuration counts.
