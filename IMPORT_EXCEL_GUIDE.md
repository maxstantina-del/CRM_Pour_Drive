# 📥 Guide d'Import Excel pour le CRM

## Problème Résolu ✅

Le bug d'import Excel a été corrigé :
- ✅ Remplacement de `readAsBinaryString` (obsolète) par `readAsArrayBuffer`
- ✅ Détection flexible des colonnes (majuscules/minuscules, accents)
- ✅ Meilleure gestion des erreurs avec logs détaillés
- ✅ Messages d'erreur plus clairs

---

## 📊 Colonnes Reconnues

Le CRM reconnaît automatiquement ces noms de colonnes (insensible à la casse) :

| Champ CRM | Noms de Colonnes Acceptés |
|-----------|---------------------------|
| **Nom du projet** | `Nom du projet`, `Nom`, `Name`, `name`, `Projet`, `projet` |
| **Contact** | `Nom du contact`, `Contact`, `contact`, `Nom contact` |
| **Email** | `Email`, `email`, `E-mail`, `e-mail` |
| **Téléphone** | `Téléphone`, `Phone`, `phone`, `Tel`, `tel`, `Telephone` |
| **Entreprise** | `Entreprise`, `Company`, `company`, `entreprise`, `Société`, `société` |
| **SIRET** | `SIRET`, `Siret`, `siret` |
| **Adresse** | `Adresse`, `Address`, `address`, `adresse` |
| **Ville** | `Ville`, `City`, `city`, `ville` |
| **Code Postal** | `Code postal`, `Zip`, `zip`, `Code Postal`, `CP`, `cp` |
| **Pays** | `Pays`, `Country`, `country`, `pays` (défaut: France) |
| **Valeur** | `Valeur`, `Value`, `value`, `valeur`, `Montant`, `montant` |
| **Notes** | `Notes`, `notes`, `Note`, `note`, `Description`, `description` |

---

## 📝 Format Excel Requis

### Structure Minimale

Votre fichier Excel doit contenir :
1. **Première ligne** : En-têtes des colonnes
2. **Lignes suivantes** : Données des leads
3. **Au moins une colonne** : `Nom`, `Name`, `Entreprise` ou `Company`

### Exemple de Fichier Excel

| Nom | Contact | Email | Téléphone | Entreprise |
|-----|---------|-------|-----------|------------|
| Projet Solaire 10kW | Sophie Martin | sophie@ecosolar.fr | 0612345678 | EcoSolar SARL |
| Site Web E-commerce | Jean Dupont | jean@webagency.fr | 0698765432 | WebAgency |
| Formation React | Marie Leblanc | marie@techschool.fr | 0623456789 | TechSchool |

### Exemple Complet avec Tous les Champs

| Nom du projet | Nom du contact | Email | Téléphone | Entreprise | SIRET | Adresse | Ville | Code postal | Pays | Valeur | Notes |
|---------------|----------------|-------|-----------|------------|-------|---------|-------|-------------|------|--------|-------|
| Projet Solaire 10kW | Sophie Martin | sophie@ecosolar.fr | 0612345678 | EcoSolar SARL | 12345678901234 | 12 rue Verte | Lyon | 69001 | France | 25000 | Installation prévue en mars |
| Site Web E-commerce | Jean Dupont | jean@webagency.fr | 0698765432 | WebAgency | 98765432109876 | 45 avenue du Web | Paris | 75001 | France | 15000 | Besoin urgent |

---

## 🚀 Procédure d'Import

### 1. Préparer votre fichier Excel

- Format : `.xlsx` ou `.xls`
- Première ligne : En-têtes
- Au minimum : colonne "Nom" ou "Entreprise"
- Données : lignes 2 et suivantes

### 2. Importer dans le CRM

1. Cliquez sur **"Import"** (bouton en haut)
2. Sélectionnez votre fichier Excel
3. Cliquez sur **"Importer"**
4. ✅ Les leads sont ajoutés au pipeline actif

### 3. Vérifier l'Import

**Console Développeur (F12)** affichera :
```
Excel headers detected: ["Nom", "Contact", "Email", ...]
First row sample: {Nom: "Projet Solaire 10kW", ...}
3 leads parsed from Excel file
Importing 3 leads...
```

**Notification** :
```
✅ 3 leads importés
```

---

## 🐛 Résolution de Problèmes

### Problème 1 : "Aucun lead trouvé dans le fichier"

**Cause** : Aucune colonne "Nom", "Name", "Entreprise" ou "Company" détectée

**Solution** :
- Vérifiez que la première ligne contient les en-têtes
- Renommez au moins une colonne en "Nom" ou "Entreprise"
- Exemple : `Projet` → `Nom`

### Problème 2 : "Erreur lors de l'import"

**Cause** : Fichier corrompu ou format non supporté

**Solution** :
1. Ouvrez la console (F12) pour voir l'erreur détaillée
2. Vérifiez que le fichier est bien `.xlsx` ou `.xls`
3. Essayez de réenregistrer le fichier Excel ("Enregistrer sous...")
4. Vérifiez qu'il n'y a pas de caractères spéciaux dans les noms de colonnes

### Problème 3 : Leads importés mais vides

**Cause** : Colonnes non reconnues

**Solution** :
1. Consultez la console (F12) : `Excel headers detected: [...]`
2. Comparez avec la liste des colonnes reconnues ci-dessus
3. Renommez vos colonnes pour correspondre

### Problème 4 : Certains leads manquent

**Cause** : Leads sans nom, entreprise et contact sont ignorés

**Solution** :
1. Console (F12) affichera : `Lead skipped (no name, company or contact)`
2. Ajoutez au moins un nom, une entreprise ou un contact pour chaque lead

---

## 📋 Template Excel

### Télécharger un Template

Créez un fichier Excel avec ces colonnes :

```
Nom | Contact | Email | Téléphone | Entreprise
```

Ou version complète :

```
Nom du projet | Nom du contact | Email | Téléphone | Entreprise | SIRET | Adresse | Ville | Code postal | Pays | Valeur | Notes
```

### Exemple de Contenu

```csv
Nom du projet,Contact,Email,Téléphone,Entreprise
Projet A,Jean Dupont,jean@example.com,0612345678,Acme Corp
Projet B,Marie Martin,marie@example.com,0698765432,Tech Solutions
Projet C,Paul Dubois,paul@example.com,0623456789,Innovation SAS
```

---

## 🔍 Logs de Débogage

Pour diagnostiquer les problèmes d'import :

1. **Ouvrez la console** : `F12` → Onglet "Console"

2. **Logs affichés pendant l'import** :
   ```
   Starting import for file: leads.xlsx Size: 12345 bytes
   Excel headers detected: ["Nom", "Contact", "Email"]
   First row sample: {Nom: "Projet A", Contact: "Jean"}
   3 leads parsed from Excel file
   Importing 3 leads...
   ```

3. **Si problème** :
   ```
   Lead skipped (no name, company or contact): {pipelineId: "..."}
   Excel parsing error: Error message...
   ```

---

## ✅ Checklist Avant Import

- [ ] Fichier au format `.xlsx` ou `.xls`
- [ ] Première ligne = en-têtes
- [ ] Au moins une colonne "Nom" ou "Entreprise"
- [ ] Données présentes dans les lignes suivantes
- [ ] Pas de cellules fusionnées
- [ ] Pas de mise en forme complexe (tableaux, graphiques)
- [ ] Encodage correct (pas de caractères bizarres)

---

## 📞 Support

Si l'import ne fonctionne toujours pas :

1. Consultez les logs dans la console (F12)
2. Vérifiez la structure du fichier Excel
3. Essayez avec un fichier simple (3-4 colonnes, 2-3 lignes)
4. Exportez d'abord un CSV depuis le CRM pour voir le format attendu

---

**Dernière mise à jour** : 28 janvier 2026
**Version CRM** : 2.0.0
**Bug corrigé** : Import Excel avec `readAsArrayBuffer`
