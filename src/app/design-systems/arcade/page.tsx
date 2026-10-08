import type { Metadata } from 'next';
import Showcase from '../_components/Showcase';

export const metadata: Metadata = {
  title: 'Play the World — Design System',
  description: 'Semantic tokens, accessible controls, travel patterns, and interface states for the arcade travel direction.',
};

export default function Page() {
  return <Showcase direction="arcade" />;
}
