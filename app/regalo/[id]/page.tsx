import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import RegaloDetailClient from './RegaloDetailClient';

export const dynamic = 'force-dynamic';

export default async function RegaloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: regalo, error } = await supabase
    .from('regalos_ruth')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !regalo) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-pastel-pink/20 text-pastel-text font-cormorant">
      <RegaloDetailClient initialRegalo={regalo} />
    </main>
  );
}
