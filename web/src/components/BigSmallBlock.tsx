import type { BlockProps } from 'astro-portabletext/types';
import type { ReactNode } from 'react';

interface Props extends BlockProps {
  children?: ReactNode;
}

export default function BigSmallBlock({ children, node }: Props) {
  const cls = node.style === 'big' ? 'big' : 'small';
  return <p className={cls}>{children}</p>;
}
