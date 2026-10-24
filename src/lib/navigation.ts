import { isPagesRuntime } from './runtime';

/** Pages keeps hash routes; the Worker uses normal same-origin document navigation. */
export function appHref(path: string) {
  return isPagesRuntime() && path.startsWith('/') ? `#${path}` : path;
}

const navigation = {
  push(path: string) { window.location.assign(appHref(path)); },
  replace(path: string) { window.location.replace(appHref(path)); },
  refresh() {
    if (isPagesRuntime()) window.dispatchEvent(new HashChangeEvent('hashchange'));
    else window.location.reload();
  },
};

// Stable identity preserves existing callback dependencies and Pages state.
export function useAppNavigation() { return navigation; }
