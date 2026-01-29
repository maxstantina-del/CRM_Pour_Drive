# 🚀 Quick Start - Simple CRM

Guide de démarrage rapide pour être opérationnel en 5 minutes.

---

## ⚡ Installation Rapide

```bash
# 1. Aller dans le dossier
cd "C:\Users\Max\Desktop\CRM_Pour_Drive-20260122T181907Z-3-001\CRM_Pour_Drive"

# 2. Installer (déjà fait)
# npm install

# 3. Lancer
npm run dev
```

✅ **L'application est sur:** http://localhost:5173

---

## 🎯 Première Utilisation

### 1. Tour Guidé
Au premier lancement, un **tour guidé** s'affiche automatiquement.
Suivez les 5 étapes pour découvrir l'application.

### 2. Créer votre Premier Lead
1. Cliquer sur **"Nouveau Lead"** (bouton bleu en haut)
2. Remplir au minimum le **nom du projet**
3. Ajouter email, téléphone, entreprise (optionnel)
4. Choisir l'étape: "Nouveau"
5. Cliquer sur **"Créer"**

### 3. Déplacer le Lead
1. Aller dans la vue **"Pipeline"** (menu gauche)
2. Voir votre lead dans la colonne "Nouveau"
3. Le faire glisser vers "Contacté"

### 4. Marquer comme Gagné
1. Déplacer le lead vers la colonne **"Gagné"**
2. 🎉 **Célébration !** Confetti et trophée s'affichent

---

## 📊 Les 5 Vues

### 1. Dashboard
Vue d'ensemble avec statistiques:
- Total leads, leads actifs, gagnés, perdus
- Taux de conversion
- Répartition par étape
- Valeur totale

### 2. Pipeline (Kanban)
Tableau visuel avec colonnes par étape:
- Nouveau → Contacté → Qualifié → RDV → Proposition → Négociation → Gagné/Perdu
- Drag & drop entre colonnes
- Compteur par colonne

### 3. Tableau
Vue table avec:
- Toutes les colonnes
- Tri par nom, étape, valeur, date
- Actions rapides (modifier, supprimer)

### 4. Aujourd'hui
Actions urgentes:
- 🔴 **En retard** - Actions passées non complétées
- 📅 **Aujourd'hui** - Actions à faire aujourd'hui

### 5. Paramètres
Configuration de l'application

---

## 💾 Import/Export

### Importer des Leads

**Option 1: CSV**
```csv
Nom,Contact,Email,Téléphone,Entreprise
ACME Project,John Doe,john@acme.com,0612345678,ACME Corp
```

**Option 2: Excel**
Créer un fichier Excel avec colonnes: Nom, Contact, Email, etc.

**Option 3: JSON**
```json
[
  {
    "name": "ACME Project",
    "contactName": "John Doe",
    "email": "john@acme.com",
    "phone": "0612345678",
    "company": "ACME Corp"
  }
]
```

**Étapes:**
1. Cliquer sur **"Import"** (en haut)
2. Sélectionner votre fichier
3. Vérifier l'aperçu
4. Cliquer sur **"Importer"**

### Exporter des Leads

**CSV:**
1. Cliquer sur **"Export CSV"**
2. Fichier téléchargé: `crm_export_YYYY-MM-DD.csv`

**Excel:**
1. Cliquer sur **"Excel"**
2. Fichier téléchargé: `crm_export_YYYY-MM-DD.xlsx`

**Backup Complet (JSON):**
1. Cliquer sur **"Backup"**
2. Sauvegarde de TOUT: pipelines + leads
3. Fichier: `crm_backup_YYYY-MM-DD.json`

---

## 🔄 Multi-Pipelines

### Créer un Pipeline
1. Cliquer sur le **"+"** à côté de "Pipelines" (menu gauche)
2. Entrer le nom: ex. "Clients 2026"
3. Valider

### Changer de Pipeline
1. Cliquer sur le nom du pipeline (menu gauche)
2. Sélectionner un autre pipeline
3. Les leads affichés changent automatiquement

**Cas d'usage:**
- Pipeline par année: "Clients 2025", "Clients 2026"
- Pipeline par produit: "Formation", "Conseil"
- Pipeline par région: "Paris", "Lyon", "Marseille"

---

## 🤖 Assistant IA

**Bouton flottant bleu** (en bas à droite)

### Commandes
- "Combien de leads ?"
- "Statistiques"
- "Comment créer un lead ?"

L'assistant répond à vos questions sur le CRM.

---

## 🎨 Fonctionnalités Bonus

### QR Code
1. Ouvrir un lead
2. Voir le QR code (coin droit)
3. Scanner pour avoir les coordonnées

### Célébration
Déplacer un lead vers "Gagné" → Confetti automatique 🎉

### Actions à Venir
1. Modifier un lead
2. Section "Actions à venir"
3. Ajouter: "Envoyer devis - 2026-02-15"
4. Cocher quand c'est fait

### Recherche
1. Vue "Tableau"
2. Barre de recherche en haut
3. Taper nom, email, entreprise...
4. Filtrage en temps réel

---

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl + N` | Nouveau lead |
| `Ctrl + I` | Import |
| `Ctrl + E` | Export |
| `Ctrl + B` | Backup |
| `Esc` | Fermer modal |

*(À venir)*

---

## 📱 Mobile

L'application est responsive ! Utilisez-la sur:
- 📱 Smartphone
- 📱 Tablette
- 💻 Desktop

Interface adaptée automatiquement.

---

## 🐛 Problèmes Courants

### "LocalStorage plein"
**Solution:** Exporter en backup puis supprimer vieux leads

### "Impossible d'importer"
**Vérifier:**
- Format fichier (CSV, JSON, Excel)
- Encodage UTF-8
- Colonne "Nom" présente

### "Lead ne se déplace pas"
**Actualiser la page:** `F5`

### "Célébration ne s'affiche pas"
**Vérifier:** Lead bien déplacé vers "Gagné" (pas "Perdu")

---

## 🔐 Sécurité

### Données Locales
Par défaut, tout est stocké dans votre navigateur (localStorage).
- ✅ Aucun serveur
- ✅ Données privées
- ✅ Fonctionne offline

### Supabase (Optionnel)
Si configuré, synchronisation cloud:
- ✅ Multi-appareils
- ✅ Sauvegarde automatique
- ✅ Temps réel

---

## 📞 Aide

### Documentation
- **Déploiement:** `DEPLOY.md`
- **Sentry:** `SENTRY_SETUP.md`
- **Tests:** `npm test`

### Support
- 📖 README complet: `README_GITHUB.md`
- 🐛 Issues: GitHub
- 💬 Questions: support@example.com

---

## 🚀 Déployer (5 min)

### Vercel

1. **Push sur GitHub:**
   ```bash
   git add .
   git commit -m "Ready to deploy"
   git push
   ```

2. **Déployer:**
   - https://vercel.com/new
   - Import repository
   - Deploy

3. **Configurer variables:**
   - Ajouter `VITE_SUPABASE_URL` si nécessaire
   - Ajouter `VITE_SENTRY_DSN` si nécessaire

**C'est tout !** 🎉

URL: `https://votre-crm.vercel.app`

---

## ✅ Checklist Débutant

- [ ] ✅ Installer et lancer (`npm run dev`)
- [ ] 🎯 Créer mon premier lead
- [ ] 🔄 Tester drag & drop
- [ ] 🎉 Voir la célébration (lead gagné)
- [ ] 📊 Explorer le Dashboard
- [ ] 📅 Ajouter une action à venir
- [ ] 💾 Faire un backup
- [ ] 📥 Tester l'import CSV
- [ ] 📱 Tester sur mobile
- [ ] 🚀 Déployer sur Vercel

---

## 🎓 Prochaines Étapes

1. **Importer vos vrais leads** (CSV/Excel)
2. **Configurer les étapes** selon votre process
3. **Créer plusieurs pipelines** si besoin
4. **Déployer en production** (Vercel)
5. **Configurer Sentry** pour monitoring
6. **Partager avec votre équipe**

---

**Temps de prise en main:** 15 minutes
**Temps pour être productif:** 30 minutes
**Temps pour maîtriser:** 1 heure

**Bonne utilisation ! 🚀**
