// Tiny DOM helpers.
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k in node && typeof v !== 'string') node[k] = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  node.append(...children);
  return node;
}

// Waits for two frames so a class removal triggers a transition.
export const nextFrame = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));
