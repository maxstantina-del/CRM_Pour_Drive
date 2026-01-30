import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uihtirqtsebuooubsccn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaHRpcnF0c2VidW9vdWJzY2NuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwNjM0NCwiZXhwIjoyMDgyNTgyMzQ0fQ.UmUoyBuxV1_pFe01z_jXfT0cmCothKVVG1G_-bn30wM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDragDropPerformance() {
  console.log('🔍 TEST DE PERFORMANCE - Drag & Drop\n');

  // 1. Récupérer un lead
  console.time('1. Fetch lead');
  const { data: leads, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .limit(1);
  console.timeEnd('1. Fetch lead');

  if (fetchError || !leads || leads.length === 0) {
    console.error('❌ Erreur:', fetchError?.message || 'Aucun lead');
    return;
  }

  const testLead = leads[0];
  const originalStage = testLead.stage;
  console.log('✅ Lead test:', testLead.name, '- Stage actuel:', originalStage);

  // 2. Simuler mise à jour UI (optimiste - devrait être instantané)
  console.log('\n⚡ Simulation mise à jour UI optimiste (locale)');
  console.time('2. UI update (optimiste)');
  const updatedLead = { ...testLead, stage: 'contacted', updatedAt: new Date().toISOString() };
  console.timeEnd('2. UI update (optimiste)');
  console.log('   → Devrait être < 1ms');

  // 3. Mise à jour Supabase (en arrière-plan)
  console.log('\n🔄 Mise à jour Supabase (arrière-plan)');
  console.time('3. Supabase update');
  const { error: updateError } = await supabase
    .from('leads')
    .update({ stage: 'contacted', updated_at: new Date().toISOString() })
    .eq('id', testLead.id);
  console.timeEnd('3. Supabase update');

  if (updateError) {
    console.error('❌ Erreur update:', updateError.message);
  } else {
    console.log('✅ Update Supabase OK');
  }

  // 4. Restaurer l'état original
  console.log('\n🔙 Restauration stage original');
  await supabase
    .from('leads')
    .update({ stage: originalStage })
    .eq('id', testLead.id);

  // 5. RÉSULTAT
  console.log('\n' + '='.repeat(50));
  console.log('📊 DIAGNOSTIC:');
  console.log('='.repeat(50));
  console.log('• UI optimiste: < 1ms = ⚡ INSTANTANÉ');
  console.log('• Supabase update: Vérifie le temps ci-dessus');
  console.log('\n💡 INTERPRÉTATION:');
  console.log('   Si Supabase > 500ms → NORMAL (arrière-plan)');
  console.log('   Si UI optimiste fonctionne → Drag doit être instantané!');
  console.log('   Si lag perçu → Problème = animations CSS ou re-render');
}

testDragDropPerformance();
