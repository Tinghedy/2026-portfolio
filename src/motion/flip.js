/**
 * Shared state for the card → case-page FLIP (see CaseOverlay.jsx).
 *
 * - pending:   { id, state, rect } captured on click and consumed once by
 *              the overlay when it mounts. state = Flip.getState() of the
 *              card's image box (the cover flies from here); rect = its
 *              getBoundingClientRect() (the surface grows from here).
 * - animating: true while the open/close animation runs; extra clicks,
 *              Esc and Back-button closes are ignored meanwhile.
 *
 * Card and case-page hero are paired by data-flip-id={work.id};
 * the card's box also carries data-flip-source={work.id}.
 */
export const flip = {
  pending: null,
  animating: false,
};

export const flipSource = (id) =>
  document.querySelector(`[data-flip-source="${CSS.escape(id)}"]`);
