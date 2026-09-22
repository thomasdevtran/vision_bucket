# Vision Bucket interface

The interface is for movie discovery, personal tracking, and conversation. Film
artwork and member writing take priority over introductory panels and decoration.

## Reference evidence

UI Radar's public UIZZE searches for movie-review screens and Letterboxd returned
no results. No UIZZE screenshot claims are made. The public
[Letterboxd Past Lives page](https://letterboxd.com/film/past-lives/) was inspected
directly: its poster anchors the film information, metadata is subordinate to the
title, and reviews are separated by simple rules. Those hierarchy decisions inform
this interface. Letterboxd's branding, three-circle logo, green/orange palette,
rating graphics, and member content are not copied.

## Visual choices

- Background #19181d, surface #222127, border #3b3743, text #f0edf4,
  secondary text #b6b0bf, muted lavender controls #c4b6e8.
- Literata for page titles, Source Sans 3 for text and controls. The existing
  Vision Bucket wordmark is retained. Georgia and system sans are fallbacks.
- Consistent 1120px content width; narrower reviews and film-detail reading areas.
- Poster shelves provide the main visual identity. Text stays outside the artwork.
- Underlined active navigation, rectangular controls, subtle borders, no glowing
  backgrounds, entry animations, or hover motion on static panels.
- Community pages display real demo conversations and dated reviews immediately.
  The discussion composer is expandable; movie tracking remains readily available.

## Required checks

Verify discovery, search results and empty state, movie details and tracking,
reviews, discussions and posting, and library. Check desktop and mobile widths,
keyboard links/focus, loading/error messages, and no horizontal page overflow.
Preserve the live TMDB catalog and local demo data. Commit and push reviewed changes.

## Validation

- Production demo build compiles; all 14 tests pass.
- Inspected discovery, discussions, review feed, film details, and library at
  desktop width and 390px; also checked the library/header at 320px.
- Verified live Inception search and a no-results query, library saving, local
  review posting, expandable discussion creation, and opening the created thread.
- Confirmed mobile page width stays within the viewport and navigation returns
  to the top. Browser console reported no errors during the inspected flows.
