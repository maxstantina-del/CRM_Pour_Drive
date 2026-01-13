import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function createIcons() {
  try {
    console.log('📦 Préparation des icônes...');

    // Créer le dossier build si nécessaire
    const buildDir = join(rootDir, 'build');
    try {
      await fs.mkdir(buildDir, { recursive: true });
    } catch (err) {
      // Le dossier existe déjà
    }

    // Copier le logo en tant qu'icône
    console.log('🖼️  Copie du logo...');
    const logoPath = join(rootDir, 'public', 'logo.jpg');
    await fs.copyFile(logoPath, join(buildDir, 'icon.png'));
    console.log('✅ icon.png créé (electron-builder le convertira automatiquement)');

    console.log('🎉 Icônes prêtes dans le dossier build/');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createIcons();
