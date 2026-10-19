import type { ReactNode } from 'react';

/** A shared cut-paper label inside the existing semantic heading. */
export function AtlasHeadingLabel({ children }: { children: ReactNode }) {
  return <span className="atlas-heading-label">{children}</span>;
}
