'use client';

import type { AnchorHTMLAttributes } from 'react';
import { appHref } from '@/src/lib/navigation';

/** Native links avoid the deployed Vinext Link transition failure. */
export default function AppLink({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={appHref(href)} {...props} />;
}
