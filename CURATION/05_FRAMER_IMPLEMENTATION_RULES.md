# Framer / Arena implementation rules
## Photography sphere, album system, and state preservation

### Canonical content model

The source of truth is `CURATION/03_PHOTOGRAPHY_ASSET_MANIFEST.json`. Do not duplicate image records in the sphere component or hard-code separate album arrays. The sphere and galleries read the same canonical photograph records.

**Collections** group related albums. **Albums** own a complete image sequence. **Photographs** belong to exactly one album. A photograph may additionally be marked as one of the 36 sphere previews.

### Required entities

**Collection**
- `collection_id`
- `display_title`
- `description`
- `sort_order`

**Album**
- `album_id`
- `collection_id`
- optional `parent_album_id`
- `display_title`
- `subtitle`
- `intro`
- `category`
- `cover_photo_id`
- `photo_ids` in album order
- `photo_count`

**Photograph**
- `photo_id`
- `source_path`
- `source_url`
- `display_title`
- `caption`
- `album_id`
- `collection_id`
- `category`
- optional `edition`
- `year` (null until verified)
- `sequence`
- `featured_in_sphere`
- optional `sphere_slot`
- `alt_text` (write after visual verification)

### Sphere must remain an independent presentation component

Keep the current 36-image sphere geometry, overlapping frame arrangement, pointer-to-rotation mapping, drag-to-steer interaction, easing, camera/scene settings, and all current physics. Do not rebuild or redesign these systems as part of the asset integration.

The sphere receives only the 36 records with `featured_in_sphere = true`, ordered by `sphere_slot`. It must not receive all 81 photographs.

### Interaction state

Maintain explicit navigation context:
- `sphere`
- `selected-photo`
- `album`
- `album-photo`

Keep the sphere transform and interaction state in a persistent parent state/store while album overlays are open. Closing an album must restore the exact transform and 36-item selection, not initialise a new sphere.

In sphere context, the previous/next controls traverse the 36 sphere entries. In album-photo context, previous/next traverse only the current album's `photo_ids`. Never use a global gallery array for album navigation.

When a sphere photograph is selected:
1. Resolve its `album_id`.
2. Open the selected-photo introduction using that record's title and caption.
3. Make **Explore album** open the full parent album.
4. Carry the selected `photo_id` into the album so the gallery can open at the chosen photograph.
5. Preserve a clear return route to the sphere.

When a photograph is selected inside an album, open the original image in the fullscreen viewer, with previous/next constrained to the album and close returning to the previous album position.

### Caption and metadata display

- Default sphere: no permanent captions over the photographs.
- Hover/focus: display the short photograph title and album label in a restrained treatment.
- Selected-photo introduction: title, category, verified year only if available, short caption, previous/next, close, and Explore album.
- Album introduction: cover, title, subtitle, collection label, description, photograph count, and gallery entry.
- Fullscreen image: original photograph, display title, album context, previous/next within that album, close.

Do not display a fabricated year. Hide the year row when `year = null`.

### Complete image coverage

All 81 photographs must remain accessible through the album system. The 36 sphere items are curated entry points, not the complete archive. The 45 album-only images are required content, not unused assets.

- Cosmito: one album with two editions; 14 images total (8 colour, 6 monochrome).
- Monochrome Studies contains two root-level photographs and the nested Mermaid album (2 images).
- Skate Up contains its five parent-level images and three nested subject albums: Mael (6), Willy (6), Yan (4).
- Independent Works contains all four root-level photographs; Portals and The Uprising are sphere entries.
- Youthful Exuberance contains nine frames in original scene order; three sphere entries.

### Integrity and quality gates

- No source files moved, renamed, replaced, or deleted.
- No image cropping, stretching, recolouring, or regeneration.
- Preserve aspect ratio and use `object-fit: contain` for fullscreen images.
- Use `object-fit: cover` only in fixed-size cards where the crop is intentional and the original remains available uncropped in the viewer.
- Add accurate, image-specific alt text after visual inspection; poetic titles are not alt text.
- Respect reduced-motion preferences and keyboard/focus navigation.
- Mobile must preserve album order and return-state behaviour.
- Do not modify existing sphere physics to implement album navigation.
