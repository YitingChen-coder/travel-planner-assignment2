import type { Metadata } from 'next';
import Showcase from '../_components/Showcase';

export const metadata: Metadata = {
  title: 'Elsewhere — A Travel Journal — Design System',
  description: 'Semantic tokens, accessible controls, travel patterns, and interface states for the editorial travel direction.',
};

export default function Page() {
  return <Showcase direction="editorial" />;
}
