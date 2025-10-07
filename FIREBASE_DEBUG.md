# 🔧 Guide de débogage Firebase - Notes

## ✅ Correctifs appliqués

### 1. Création automatique du document utilisateur
- Nouveau fichier: `app/firebase/userProfile.ts` avec les fonctions:
  - `initializeUserDocument()` - Crée le document utilisateur à la connexion
  - `saveUserNotes()` - Sauvegarde les notes avec gestion d'erreurs
  - `getUserNotes()` - Récupère les notes avec logs détaillés

### 2. Initialisation à la connexion
- `AuthContext.tsx` appelle maintenant `initializeUserDocument()` quand un utilisateur se connecte
- Le document est créé avec cette structure:
```json
{
  "email": "user@example.com",
  "createdAt": "2025-10-07T...",
  "exp": 0,
  "level": 1,
  "completedLessons": [],
  "favorites": [],
  "notes": {},
  "badges": [],
  "lastLogin": "2025-10-07T..."
}
```

### 3. Simplification de NotesPanel
- Utilise maintenant les fonctions utilitaires au lieu d'appels directs à Firebase
- Meilleurs messages d'erreur et logs de débogage

## 🧪 Comment tester

### Étape 1: Vérifier que le document est créé
1. Déconnectez-vous du site
2. Reconnectez-vous
3. Ouvrez la console du navigateur (F12)
4. Vous devriez voir: `🔧 Création du document utilisateur: [votre-user-id]`
5. Puis: `✅ Document utilisateur créé avec succès`

### Étape 2: Ouvrir Firebase Console
1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet CyberLearn
3. Allez dans "Firestore Database"
4. Vous devriez voir une collection `users`
5. Cliquez dessus et trouvez votre document (votre UID)

### Étape 3: Tester la sauvegarde de notes
1. Ouvrez n'importe quelle leçon
2. Cliquez sur le bouton "Notes" (📑)
3. Écrivez quelque chose, par exemple: "Test de sauvegarde"
4. Cliquez sur "Sauvegarder"
5. Dans la console, vous devriez voir:
   ```
   💾 Sauvegarde des notes pour la leçon: [lesson-id]
   ✅ Notes sauvegardées avec succès
   ```

### Étape 4: Vérifier dans Firebase
1. Retournez dans Firebase Console
2. Rafraîchissez votre document utilisateur
3. Vous devriez voir un champ `notes` avec la structure:
   ```json
   {
     "notes": {
       "introduction-cybersecurite": "Test de sauvegarde"
     }
   }
   ```

### Étape 5: Tester le chargement
1. Fermez le panel de notes (bouton X)
2. Rafraîchissez la page (F5)
3. Dans la console, vous devriez voir:
   ```
   🔍 Chargement des notes pour la leçon: [lesson-id]
   📖 Notes récupérées: { userId: "...", lessonId: "...", found: true, length: 17 }
   ✅ Notes chargées: 17 caractères
   ```
4. Cliquez sur "Notes" - vos notes devraient être là!

## 🐛 Messages de débogage à surveiller

### Lors de la connexion
- ✅ `🔧 Création du document utilisateur: [uid]`
- ✅ `✅ Document utilisateur créé avec succès`
- OU `✅ Document utilisateur existe déjà`

### Lors du chargement d'une leçon
- ✅ `🔍 Chargement des notes pour la leçon: [lesson-id]`
- ✅ `📖 Notes récupérées: { ... found: true/false ... }`

### Lors de la sauvegarde
- ✅ `💾 Sauvegarde des notes pour la leçon: [lesson-id]`
- ✅ `💾 Notes sauvegardées: { userId, lessonId, noteLength }`
- ✅ Toast notification verte: "Notes sauvegardées ! ✓"

### En cas d'erreur
- ❌ `❌ Erreur lors de l'initialisation du document utilisateur: [error]`
- ❌ `❌ Erreur lors de la sauvegarde des notes: [error]`
- ❌ `❌ Erreur lors de la récupération des notes: [error]`

## 📋 Structure attendue dans Firestore

```
users (collection)
  └── [user-uid] (document)
      ├── email: "user@example.com"
      ├── createdAt: "2025-10-07T12:00:00.000Z"
      ├── lastLogin: "2025-10-07T13:30:00.000Z"
      ├── exp: 0
      ├── level: 1
      ├── completedLessons: []
      ├── favorites: []
      ├── badges: []
      └── notes: {
            "introduction-cybersecurite": "Mes notes pour cette leçon...",
            "reseaux-informatiques": "Autres notes...",
            ...
          }
```

## 🔒 Règles de sécurité Firestore

Assurez-vous que vos règles Firestore permettent aux utilisateurs de lire/écrire leur propre document:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## ⚡ Actions rapides si ça ne marche toujours pas

### 1. Forcer la création du document
Si vous vous êtes déjà connecté avant ce correctif, déconnectez-vous et reconnectez-vous pour déclencher `initializeUserDocument()`.

### 2. Créer manuellement le document
1. Allez dans Firebase Console
2. Firestore Database
3. Cliquez sur "Démarrer une collection"
4. Nom de collection: `users`
5. ID du document: [votre-uid] (trouvez-le dans la console avec `console.log(user.uid)`)
6. Ajoutez les champs manuellement:
   - `email` (string): votre email
   - `notes` (map): {}
   - `level` (number): 1
   - `exp` (number): 0

### 3. Vérifier les permissions
Assurez-vous que les règles Firestore autorisent l'utilisateur à écrire dans son document.

## 📞 Support

Si le problème persiste après ces étapes:
1. Partagez les logs de la console (messages avec 🔍, 💾, ✅, ❌)
2. Faites une capture d'écran de votre document Firestore
3. Vérifiez que vous êtes bien connecté (user != null)
4. Vérifiez que le lessonId est correct
