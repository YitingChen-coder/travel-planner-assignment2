import type { Metadata } from 'next';
import Showcase from '../_components/Showcase';

export const metadata: Metadata = {
  title: 'The Quiet Way — Design System',
  description: 'Semantic tokens, accessible controls, travel patterns, and interface states for the calm travel direction.',
};

export default function Page() {
  return <Showcase direction="calm" />;
}
