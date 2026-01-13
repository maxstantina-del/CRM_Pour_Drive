# 🚀 Workflow de Développement Simple CRM

## 📋 Scripts disponibles

### ⚡ `Dev Rapide.bat` - POUR LE DÉVELOPPEMENT (RECOMMANDÉ)
**Utilise celui-ci pendant que tu développes !**

✅ **Avantages :**
- Rechargement automatique (hot-reload)
- Modifications visibles instantanément
- Pas besoin de rebuilder à chaque fois
- Beaucoup plus rapide (0 seconde d'attente)

❌ **Inconvénients :**
- Lance dans le navigateur (pas en app desktop)
- Utilise localStorage (pas SQLite)

🎯 **Quand l'utiliser :**
- Pendant que tu codes et testes des modifications
- Pour vérifier rapidement un changement d'interface
- Pour déboguer un problème

### 🔨 `Build et Installer.bat` - BUILD COMPLET (2-3 minutes)
**Utilise celui-ci pour tester la version finale desktop**

✅ **Ce qu'il fait :**
1. Compile tout le projet
2. Crée les installateurs Windows
3. Désinstalle l'ancienne version
4. Installe la nouvelle version
5. Lance l'application desktop

🎯 **Quand l'utiliser :**
- Quand tu veux tester la version desktop complète
- Avant de livrer une version
- Pour vérifier que l'icône/logo s'affiche bien
- Pour tester les fonctionnalités SQLite

### ⚡ `Reinstaller CRM.bat` - RÉINSTALLATION RAPIDE (10 secondes)
**Utilise celui-ci si tu as déjà fait le build**

✅ **Ce qu'il fait :**
1. Désinstalle l'ancienne version
2. Installe la version déjà buildée
3. Lance l'app

🎯 **Quand l'utiliser :**
- Après avoir utilisé `Build et Installer.bat` une première fois
- Quand l'app bug et tu veux la réinstaller proprement
- Pour installer rapidement la dernière version buildée

---

## 🎯 Workflow Recommandé pour la Beta

### 1️⃣ Phase de Développement (90% du temps)
```bash
Double-clique sur "Dev Rapide.bat"
↓
Modifie le code
↓
Sauvegarde (Ctrl+S)
↓
La page se recharge automatiquement
↓
Vérifie les changements
↓
Répète jusqu'à satisfaction
```

### 2️⃣ Test de la Version Desktop (10% du temps)
```bash
Double-clique sur "Build et Installer.bat"
↓
Attends 2-3 minutes
↓
L'app desktop se lance
↓
Teste les fonctionnalités
↓
Si besoin de modifications, retourne à l'étape 1
```

---

## 💡 Exemples de Scénarios

### Scénario A : "Je veux changer la couleur d'un bouton"
```
✅ Utilise "Dev Rapide.bat"
→ Modifie le CSS
→ Sauvegarde
→ Vois le changement instantanément
```

### Scénario B : "Je veux tester le QR code"
```
✅ Utilise "Dev Rapide.bat"
→ Modifie le composant QR
→ Sauvegarde
→ Teste dans le navigateur
→ Si OK, lance "Build et Installer.bat" pour tester sur mobile
```

### Scénario C : "Je veux tester l'installation complète"
```
✅ Utilise "Build et Installer.bat"
→ Attends le build
→ Teste l'app desktop
```

### Scénario D : "L'app desktop bug, je veux la réinstaller"
```
✅ Utilise "Reinstaller CRM.bat"
→ 10 secondes
→ App réinstallée
```

---

## 🔧 Commandes NPM (si besoin)

Si tu préfères la ligne de commande :

```bash
# Dev avec hot-reload
npm run dev

# Build complet
npm run build:win

# Dev Electron (si tu veux tester en desktop avec hot-reload)
npm run dev:electron
```

---

## 📝 Notes Importantes

1. **Mode Dev (Dev Rapide.bat)** :
   - Ouvre dans le navigateur sur `http://localhost:5179`
   - Utilise localStorage (données dans le navigateur)
   - Hot-reload activé (changements instantanés)

2. **Mode Production (Build et Installer.bat)** :
   - Crée une vraie app desktop
   - Utilise SQLite (base de données fichier)
   - Nécessite une réinstallation à chaque modification

3. **Données** :
   - Les données en mode dev (localStorage) et prod (SQLite) sont séparées
   - Tu devras réimporter ton CSV à chaque fois que tu testes la version desktop
   - C'est normal pendant la phase de développement

---

## 🎯 Résumé Ultra-Rapide

| Situation | Script à utiliser | Temps |
|-----------|------------------|-------|
| 🔨 Je développe | `Dev Rapide.bat` | 0s (instant) |
| 🧪 Je teste la version finale | `Build et Installer.bat` | 2-3 min |
| 🔄 Je veux réinstaller | `Reinstaller CRM.bat` | 10s |

**👉 Pendant la beta, utilise `Dev Rapide.bat` 90% du temps !**
