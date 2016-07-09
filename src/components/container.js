import { withPrefix } from '../util';
import background from './background'
import highlights from './highlights'

export default function container (styles, focusables) {
  const el = document.createElement('div');
  el.id = withPrefix('container');
  const shadowRoot = el.createShadowRoot();
  shadowRoot.innerHTML = styles;
  shadowRoot.appendChild(background(focusables));
  shadowRoot.appendChild(highlights(focusables));
  return el;
}
