import type { Metadata } from 'next';
import JuegoClient from './JuegoClient';

export const metadata: Metadata = {
  title: 'Palabras Desordenadas - Baby Shower de Miranda',
  description: 'Minijuego interactivo de palabras desordenadas para el Baby Shower de Miranda.',
};

export default function JuegoPage() {
  return <JuegoClient />;
}

