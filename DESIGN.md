# Ready Now Tradie Hire: design notes

## Brief
Directory where builders, tradies and locals across wider Sydney find a tradie and call them direct. Free to list for now. Audience: builders and homeowners searching on a phone, often on site. The site's job: get a search, and get tradies to list. The layout follows the client-approved Figma v3 (hipages-style directory). This pass is a polish, not a redesign.

## Concepts considered
1. **The site board** (profession's material): the hero works like a whiteboard on a site shed. The trade word rolls through every trade the directory covers, like the count on a tape measure, and settles. Anchor: "ready now" plus a directory of named trades. Originality 3, fit 5, feasibility 5, portability 3.
2. **Hi-vis sweep** (material): a reflective-tape stripe sweeps across headings on scroll. Originality 3, fit 3, feasibility 4, portability 4 (any construction brand).
3. **The truck wrap** (place): the grey and blue from Sam's truck as panels that slide in. Originality 2, fit 4, feasibility 4, portability 4.

Picked 1: it states what the directory covers in the first second, and it doubles as a search prompt.

## Concept card
- Idea: every trade you might need, ready now, one search away.
- Metaphor: the trade count rolling on a tape measure, then locking.
- Signature: the hero's trade word rolls through the trades and snaps into place. It drives the search placeholder and lights the matching Popular link. Tap the word to search that trade.
- Emotion: busy, local and ready. Like a site at 7am.
- Motion verb: snap into place like a tape measure locking.
- Screenshot: the hero mid-roll, "Find local / electricians / ready now." over the site photo.

## System
- Palette (existing, from the truck wrap): ink #16181B, fog #F6F7F9, line #E3E7EC, blue-600 #1F6FA8 (actions), blue-500 #4894C4 (accent on dark), charcoal #4A4D52.
- Type: Poppins (display and body), IBM Plex Mono (labels). Display tracking -0.035em.
- Shape: pill buttons and chips, 16px card radius.
- Motion: one ease family, `power3.out` for settle, `back.out(1.4)` for the snap. Big moves 0.7s, small 0.25s. GSAP ticker is the only clock.
- Idle state: the trade roll keeps going every 2.6s while the hero is on screen. Paused off screen and under reduced motion.

## Decisions
- Reduced motion: the word stays on "tradies" and nothing rolls.
- The closed mobile menu sheet is `visibility:hidden` by design, so the audit's reduced-motion hidden-text count picks it up. That's expected.
- The live tradie count chip keeps its space from the first paint (no layout shift).
- Nav logo is the TRADIE HIRE wordmark on every page.
