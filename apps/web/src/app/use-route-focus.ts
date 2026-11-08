import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';

/**
 * Page-change handling for client-side navigation:
 * - a link click (push) scrolls to the top, because the router does not;
 * - a link click or back/forward moves focus to the main landmark, so keyboard and
 *   screen-reader users start at the new page's content.
 * Skipped on the first render, for in-page hash jumps (the skip link), and for replace
 * navigations (search-as-you-type must keep focus in the box). Back and forward keep the
 * browser's own scroll restoration.
 */
export function useRouteFocus(targetId: string): void {
  const location = useLocation();
  const navigationType = useNavigationType();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (navigationType === 'REPLACE' || location.hash !== '') return;
    if (navigationType === 'PUSH') window.scrollTo(0, 0);
    document.getElementById(targetId)?.focus({ preventScroll: true });
  }, [location.key, location.hash, navigationType, targetId]);
}
