import { fromEvent, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export default function isMobile(): Observable<boolean> {
  // Checks if screen size is less than 786 pixels
  const checkScreenSize = () => document.body.offsetWidth < 786;

  // Create observable from window resize event throttled so only fires every 500ms
  const screenSizeChanged$ = fromEvent(window, 'resize').pipe(
    // throttleTime(200),
    map(checkScreenSize)
  );

  return screenSizeChanged$.pipe(startWith(checkScreenSize()));
}
