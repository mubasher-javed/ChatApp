import { fromEvent } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export default function getDivHeight() {
  const messageDiv = document.getElementById('messages-box');

  const getInitialHeight = () => messageDiv?.offsetHeight;

  const divHeightChanged$ = fromEvent(window, 'resize').pipe(
    map(getInitialHeight)
  );

  return divHeightChanged$.pipe(startWith(getInitialHeight()));
}
