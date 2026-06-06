// Script pour ajouter des données de leçons à Firebase
// Usage : npm run seed:lessons
//
// Authentification (une des deux options) :
// 1) Admin SDK (recommandé) : FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
//    ou FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY dans .env
// 2) Compte admin existant : SEED_ADMIN_EMAIL + SEED_ADMIN_PASSWORD dans .env

const path = require('path');
const fs = require('fs');
require('dotenv').config();

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let writeLesson;
let writeLessonContent;

async function initFirebaseWriter() {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (serviceAccountPath || (clientEmail && privateKey)) {
        const admin = require('firebase-admin');
        if (!admin.apps.length) {
            let credential;
            if (serviceAccountPath) {
                const resolved = path.resolve(process.cwd(), serviceAccountPath);
                if (!fs.existsSync(resolved)) {
                    throw new Error(`Fichier service account introuvable : ${resolved}`);
                }
                credential = admin.credential.cert(require(resolved));
            } else {
                credential = admin.credential.cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, '\n')
                });
            }
            admin.initializeApp({ credential });
        }
        const db = admin.firestore();
        console.log('Mode : Firebase Admin SDK (contourne les règles Firestore)');
        writeLesson = (lesson) => db.collection('lessons').doc(lesson.id).set(lesson);
        writeLessonContent = (lessonId, content) =>
            db.collection('lessonContents').doc(lessonId).set(content);
        return;
    }

    const seedEmail = process.env.SEED_ADMIN_EMAIL;
    const seedPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!seedEmail || !seedPassword) {
        throw new Error(
            'Permissions insuffisantes : configurez le seed avec l\'une des options suivantes dans .env :\n' +
            '  - FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json (recommandé)\n' +
            '  - ou FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY\n' +
            '  - ou SEED_ADMIN_EMAIL + SEED_ADMIN_PASSWORD (compte avec isAdmin: true dans users/{uid})'
        );
    }

    const { initializeApp } = require('firebase/app');
    const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');
    const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log(`Mode : authentification admin (${seedEmail})`);
    const userCredential = await signInWithEmailAndPassword(auth, seedEmail, seedPassword);
    const adminDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!adminDoc.exists() || !adminDoc.data().isAdmin) {
        throw new Error(
            `Le compte ${seedEmail} n'a pas isAdmin: true dans Firestore (users/${userCredential.user.uid}). ` +
            'Activez le rôle admin dans la console Firebase ou via un autre administrateur.'
        );
    }

    console.log('Connexion admin OK');
    writeLesson = (lesson) => setDoc(doc(db, 'lessons', lesson.id), lesson);
    writeLessonContent = (lessonId, content) =>
        setDoc(doc(db, 'lessonContents', lessonId), content);
}

// Fonction pour nettoyer le contenu HTML pour Firestore
const sanitizeHtmlContent = (html) => {
    // Supprimer les indentations excessives et normaliser les espaces
    return html.replace(/\n\s+/g, '\n').trim();
};

// Données des leçons
const lessons = [
    {
        id: "intro-prog",
        category: "Code",
        title: "Introduction à la Programmation",
        description: "Apprenez les bases de la programmation avec des exercices pratiques et des projets réels.",
        iconName: "Code",
        locked: false,
        tags: ["Débutant", "Programmation", "Bases"],
        order: 1
    },
    {
        id: "network-arch",
        category: "Réseaux",
        title: "Architecture des Réseaux",
        description: "Découvrez comment fonctionnent les réseaux informatiques et l'infrastructure d'Internet.",
        iconName: "Network",
        locked: false,
        tags: ["Intermédiaire", "Réseaux", "Internet"],
        order: 2
    },
    {
        id: "social-impact",
        category: "Social",
        title: "Impact Social du Numérique",
        description: "Explorez l'influence de la technologie sur la société et les enjeux éthiques.",
        iconName: "Users",
        locked: false,
        tags: ["Société", "Éthique", "Technologie"],
        order: 3
    },
    {
        id: "digital-lib",
        category: "Ressources",
        title: "Bibliothèque Numérique",
        description: "Accédez à une collection complète de ressources pédagogiques et tutoriels.",
        iconName: "BookOpen",
        locked: false,
        tags: ["Ressources", "Documentation", "Apprentissage"],
        order: 4
    },
    {
        id: "cyber-basics",
        category: "Cybersécurité",
        title: "Fondamentaux de la Cybersécurité",
        description: "Découvrez les principes fondamentaux de la cybersécurité et les meilleures pratiques.",
        iconName: "Lock",
        locked: false,
        tags: ["Cybersécurité", "Sécurité", "Fondamentaux"],
        order: 5,
        levelRequired: 1,
        xpReward: 50
    },
    {
        id: "data-protection",
        category: "Cybersécurité",
        title: "Protection des Données",
        description: "Apprenez à protéger vos données personnelles et professionnelles contre les menaces.",
        iconName: "Shield",
        locked: false,
        tags: ["Cybersécurité", "Données", "RGPD"],
        order: 6,
        levelRequired: 1,
        xpReward: 60
    },
    {
        id: "web-security",
        category: "Cybersécurité",
        title: "Sécurité Web",
        description: "Découvrez les vulnérabilités web courantes et comment sécuriser vos applications.",
        iconName: "Globe",
        locked: false,
        tags: ["Cybersécurité", "Web", "OWASP"],
        order: 7,
        levelRequired: 2,
        xpReward: 70
    },
    {
        id: "phishing-social",
        category: "Cybersécurité",
        title: "Phishing et Ingénierie Sociale",
        description: "Identifiez les arnaques par e-mail, SMS et appels, et apprenez à vous en protéger.",
        iconName: "AlertTriangle",
        locked: true,
        tags: ["Cybersécurité", "Phishing", "Ingénierie sociale"],
        order: 8,
        levelRequired: 2,
        xpReward: 65
    },
    {
        id: "password-auth",
        category: "Cybersécurité",
        title: "Mots de passe et Authentification",
        description: "Créez des mots de passe robustes et comprenez l'authentification multi-facteurs (MFA).",
        iconName: "Key",
        locked: true,
        tags: ["Cybersécurité", "Authentification", "MFA"],
        order: 9,
        levelRequired: 2,
        xpReward: 60
    },
    {
        id: "malware-basics",
        category: "Cybersécurité",
        title: "Malware et Ransomware",
        description: "Comprenez les virus, trojans, ransomware et les bonnes pratiques de défense.",
        iconName: "Terminal",
        locked: true,
        tags: ["Cybersécurité", "Malware", "Ransomware"],
        order: 10,
        levelRequired: 3,
        xpReward: 75
    },
    {
        id: "network-security",
        category: "Cybersécurité",
        title: "Sécurité Réseau",
        description: "Pare-feu, segmentation, VPN et détection des intrusions sur un réseau.",
        iconName: "Server",
        locked: true,
        tags: ["Cybersécurité", "Réseaux", "Pare-feu"],
        order: 11,
        levelRequired: 3,
        xpReward: 80
    },
    {
        id: "crypto-intro",
        category: "Cybersécurité",
        title: "Introduction à la Cryptographie",
        description: "Chiffrement symétrique, asymétrique, hachage et certificats TLS expliqués simplement.",
        iconName: "Cpu",
        locked: true,
        tags: ["Cybersécurité", "Cryptographie", "TLS"],
        order: 12,
        levelRequired: 4,
        xpReward: 85
    },
    {
        id: "incident-response",
        category: "Cybersécurité",
        title: "Réponse aux Incidents",
        description: "Préparez-vous à détecter, contenir et récupérer après une cyberattaque.",
        iconName: "Database",
        locked: true,
        tags: ["Cybersécurité", "SOC", "Incident"],
        order: 13,
        levelRequired: 4,
        xpReward: 90
    },
    {
        id: "pentest-ethics",
        category: "Cybersécurité",
        title: "Tests d'Intrusion et Éthique",
        description: "Découvrez le pentest légal, le cadre éthique et les phases d'un audit de sécurité.",
        iconName: "FileCode",
        locked: true,
        tags: ["Cybersécurité", "Pentest", "Éthique"],
        order: 14,
        levelRequired: 5,
        xpReward: 100
    }
];

// Contenu détaillé des leçons
const lessonContents = {
    "intro-prog": {
        sections: [
            {
                title: "Introduction à la Programmation",
                content: sanitizeHtmlContent(`
<p>La programmation est l'art de donner des instructions à un ordinateur pour qu'il exécute des tâches spécifiques. C'est un domaine fascinant qui combine logique, créativité et résolution de problèmes.</p>

<h3>Pourquoi apprendre à programmer ?</h3>
<ul>
    <li>Développer une pensée logique et analytique</li>
    <li>Créer des applications et des sites web</li>
    <li>Automatiser des tâches répétitives</li>
    <li>Améliorer ses perspectives professionnelles</li>
</ul>

<p>Dans cette leçon, nous allons explorer les concepts fondamentaux de la programmation qui s'appliquent à presque tous les langages.</p>
`)
            },
            {
                title: "Variables et Types de Données",
                content: sanitizeHtmlContent(`
<p>Les variables sont des conteneurs pour stocker des données. Chaque variable a un type qui détermine quelle sorte de données elle peut contenir.</p>

<h3>Types de données courants :</h3>
<ul>
    <li><strong>Entiers</strong> : nombres sans décimales (1, 42, -7)</li>
    <li><strong>Flottants</strong> : nombres avec décimales (3.14, -0.001)</li>
    <li><strong>Chaînes de caractères</strong> : texte ("Bonjour", "CyberLearn")</li>
    <li><strong>Booléens</strong> : valeurs vrai/faux (true, false)</li>
</ul>

<h3>Exemple en JavaScript :</h3>
<pre>
// Déclaration de variables
let age = 25;               // Entier
let prix = 19.99;           // Flottant
let nom = "Alice";          // Chaîne de caractères
let estInscrit = true;      // Booléen
</pre>

<p>Les variables nous permettent de stocker et de manipuler des données tout au long de notre programme.</p>
`)
            },
            {
                title: "Structures de Contrôle",
                content: sanitizeHtmlContent(`
<p>Les structures de contrôle déterminent l'ordre dans lequel les instructions sont exécutées dans un programme.</p>

<h3>Conditions (if/else)</h3>
<p>Les conditions permettent d'exécuter différentes parties de code selon qu'une condition est vraie ou fausse.</p>

<pre>
// Exemple de condition
let age = 18;

if (age >= 18) {
    console.log("Vous êtes majeur.");
} else {
    console.log("Vous êtes mineur.");
}
</pre>

<h3>Boucles</h3>
<p>Les boucles permettent de répéter des instructions plusieurs fois.</p>

<pre>
// Boucle for
for (let i = 0; i < 5; i++) {
    console.log("Itération " + i);
}

// Boucle while
let compteur = 0;
while (compteur < 3) {
    console.log("Compteur : " + compteur);
    compteur++;
}
</pre>

<p>Les structures de contrôle sont essentielles pour créer des programmes dynamiques qui peuvent prendre des décisions et répéter des tâches.</p>
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Quel type de données utiliseriez-vous pour stocker le nom d'un utilisateur ?",
                options: [
                    "Entier (int)",
                    "Flottant (float)",
                    "Chaîne de caractères (string)",
                    "Booléen (boolean)"
                ],
                correctAnswer: 2,
                explanation: "Les noms d'utilisateurs sont du texte, donc on utilise des chaînes de caractères (string) pour les stocker."
            },
            {
                id: "q2",
                text: "Quelle structure de contrôle utiliseriez-vous pour répéter une action 10 fois ?",
                options: [
                    "Une condition if/else",
                    "Une boucle for ou while",
                    "Une fonction",
                    "Une variable"
                ],
                correctAnswer: 1,
                explanation: "Les boucles (for ou while) sont utilisées pour répéter des actions un certain nombre de fois."
            },
            {
                id: "q3",
                text: "Qu'est-ce qu'une variable en programmation ?",
                options: [
                    "Une fonction mathématique",
                    "Un conteneur pour stocker des données",
                    "Un type de boucle",
                    "Une condition"
                ],
                correctAnswer: 1,
                explanation: "Une variable est un conteneur nommé qui permet de stocker des données qui peuvent être utilisées et modifiées dans un programme."
            }
        ]
    },
    "network-arch": {
        sections: [
            {
                title: "Introduction aux Réseaux",
                content: sanitizeHtmlContent(`
<p>Les réseaux informatiques permettent à des ordinateurs et autres appareils de communiquer entre eux. Ils constituent l'infrastructure fondamentale d'Internet et des systèmes de communication modernes.</p>

<h3>Types de réseaux</h3>
<ul>
    <li><strong>LAN (Local Area Network)</strong> : réseau local, comme celui d'une maison ou d'un bureau</li>
    <li><strong>WAN (Wide Area Network)</strong> : réseau étendu couvrant une grande zone géographique</li>
    <li><strong>Internet</strong> : le plus grand réseau mondial, reliant des milliards d'appareils</li>
</ul>

<p>Comprendre les réseaux est essentiel pour appréhender la cybersécurité et le fonctionnement d'Internet.</p>
`)
            },
            {
                title: "Modèle OSI et TCP/IP",
                content: sanitizeHtmlContent(`
<p>Le modèle OSI (Open Systems Interconnection) est un cadre conceptuel qui standardise les fonctions d'un système de communication en sept couches distinctes.</p>

<h3>Les 7 couches du modèle OSI :</h3>
<ol>
    <li><strong>Physique</strong> : transmission des bits bruts sur un canal de communication</li>
    <li><strong>Liaison de données</strong> : transfert fiable de données entre deux nœuds</li>
    <li><strong>Réseau</strong> : routage des paquets de données à travers différents réseaux</li>
    <li><strong>Transport</strong> : transfert fiable de données entre les points d'extrémité</li>
    <li><strong>Session</strong> : gestion des sessions entre applications</li>
    <li><strong>Présentation</strong> : traduction, chiffrement et compression des données</li>
    <li><strong>Application</strong> : interface avec les applications et les utilisateurs</li>
</ol>

<p>Le modèle TCP/IP est une version simplifiée du modèle OSI, utilisée dans Internet. Il comprend quatre couches : Accès réseau, Internet, Transport et Application.</p>
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Quel type de réseau couvre généralement une maison ou un petit bureau ?",
                options: [
                    "WAN (Wide Area Network)",
                    "MAN (Metropolitan Area Network)",
                    "LAN (Local Area Network)",
                    "PAN (Personal Area Network)"
                ],
                correctAnswer: 2,
                explanation: "Un LAN (Local Area Network) est un réseau qui couvre une zone géographique limitée comme une maison, un bureau ou un campus."
            },
            {
                id: "q2",
                text: "Combien de couches comporte le modèle OSI ?",
                options: [
                    "4 couches",
                    "5 couches",
                    "6 couches",
                    "7 couches"
                ],
                correctAnswer: 3,
                explanation: "Le modèle OSI comporte 7 couches : Physique, Liaison de données, Réseau, Transport, Session, Présentation et Application."
            }
        ]
    },
    "cyber-basics": {
        sections: [
            {
                title: "Qu'est-ce que la cybersécurité ?",
                content: sanitizeHtmlContent(`
# Fondamentaux de la Cybersécurité

La **cybersécurité** regroupe l'ensemble des pratiques, technologies et processus visant à protéger les systèmes, réseaux et données contre les accès non autorisés ou les attaques.

## Les trois piliers (triade CIA)

- **Confidentialité** : seules les personnes autorisées accèdent aux informations
- **Intégrité** : les données ne sont ni modifiées ni détruites de façon non autorisée
- **Disponibilité** : les systèmes restent accessibles quand on en a besoin

## Menaces courantes

- Vol d'identifiants et fuites de données
- Ransomware et malware
- Phishing et ingénierie sociale
- Attaques sur les applications web

Adopter une posture de sécurité commence par la sensibilisation et l'hygiène numérique au quotidien.
`)
            },
            {
                title: "Hygiène numérique",
                content: sanitizeHtmlContent(`
## Bonnes pratiques essentielles

1. **Mettre à jour** systèmes d'exploitation, navigateurs et applications
2. **Sauvegarder** régulièrement les données importantes (règle 3-2-1)
3. **Limiter les droits** : ne pas utiliser un compte administrateur pour la navigation
4. **Se méfier** des pièces jointes et liens inconnus
5. **Signaler** les incidents à votre responsable IT ou équipe sécurité

## Principe du moindre privilège

Chaque utilisateur et chaque service ne doit disposer que des droits strictement nécessaires à sa tâche. Cela limite l'impact d'une compromission.
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Que signifie la « confidentialité » dans la triade CIA ?",
                options: [
                    "Les systèmes sont toujours en ligne",
                    "Les données ne peuvent être lues que par les personnes autorisées",
                    "Les fichiers ne peuvent jamais être supprimés",
                    "Tous les employés ont accès à tout"
                ],
                correctAnswer: 1,
                explanation: "La confidentialité garantit que l'information n'est accessible qu'aux personnes ou processus autorisés."
            },
            {
                id: "q2",
                text: "Quelle pratique réduit le plus le risque après une compromission de compte ?",
                options: [
                    "Utiliser le même mot de passe partout",
                    "Désactiver les mises à jour",
                    "Appliquer le principe du moindre privilège",
                    "Partager ses identifiants avec un collègue"
                ],
                correctAnswer: 2,
                explanation: "Le moindre privilège limite ce qu'un attaquant peut faire avec un compte compromis."
            }
        ]
    },
    "data-protection": {
        sections: [
            {
                title: "Protéger les données personnelles",
                content: sanitizeHtmlContent(`
# Protection des Données

Les données personnelles (nom, e-mail, localisation, historique…) sont protégées en Europe par le **RGPD**. Toute organisation qui les traite doit respecter des obligations légales.

## Principes clés du RGPD

- **Licéité** : base légale pour collecter (consentement, contrat, intérêt légitime…)
- **Minimisation** : ne collecter que le nécessaire
- **Limitation de conservation** : ne pas garder indéfiniment
- **Sécurité** : mesures techniques et organisationnelles adaptées

## Classification des données

| Niveau | Exemple | Mesure |
|--------|---------|--------|
| Public | Site web marketing | Diffusion libre |
| Interne | Procédures RH | Accès employés |
| Confidentiel | Données clients | Chiffrement, contrôle d'accès |
| Secret | Clés API, mots de passe | Coffre-fort, MFA |
`)
            },
            {
                title: "Chiffrement et sauvegardes",
                content: sanitizeHtmlContent(`
## Chiffrement

- **Au repos** : disque chiffré (BitLocker, FileVault), bases de données sensibles
- **En transit** : HTTPS/TLS pour tout échange sur Internet

## Sauvegardes (règle 3-2-1)

- **3** copies des données
- **2** types de supports différents
- **1** copie hors site (cloud ou autre localisation)

Testez régulièrement la **restauration** : une sauvegarde non testée n'est pas une garantie.
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Quel principe RGPD impose de ne collecter que les données strictement utiles ?",
                options: ["Portabilité", "Minimisation", "Transparence", "Anonymisation"],
                correctAnswer: 1,
                explanation: "La minimisation des données limite la collecte au strict nécessaire pour la finalité du traitement."
            },
            {
                id: "q2",
                text: "Que signifie le « 1 » dans la règle de sauvegarde 3-2-1 ?",
                options: [
                    "Une seule copie sur le même disque",
                    "Une copie hors site",
                    "Un seul administrateur",
                    "Un mot de passe unique"
                ],
                correctAnswer: 1,
                explanation: "La règle 3-2-1 recommande une copie de sauvegarde stockée hors du site principal (géographiquement ou logiquement séparée)."
            }
        ]
    },
    "web-security": {
        sections: [
            {
                title: "Vulnérabilités web courantes",
                content: sanitizeHtmlContent(`
# Sécurité Web

Les applications web sont des cibles fréquentes. L'**OWASP Top 10** liste les failles les plus critiques.

## Failles fréquentes

1. **Injection** (SQL, commandes) : entrées utilisateur non filtrées
2. **XSS** (Cross-Site Scripting) : exécution de script dans le navigateur d'une victime
3. **CSRF** : action non voulue déclenchée via une session authentifiée
4. **Broken Access Control** : accès à des ressources sans autorisation
5. **Mauvaise configuration** : en-têtes, permissions, comptes par défaut

## Bonnes pratiques développeur

- Valider et encoder toutes les entrées côté serveur
- Utiliser des requêtes préparées (ORM / prepared statements)
- Activer **Content-Security-Policy** et cookies \`HttpOnly\`, \`Secure\`
`)
            },
            {
                title: "Authentification et sessions",
                content: sanitizeHtmlContent(`
## Sessions sécurisées

- Identifiants de session **aléatoires** et longs
- Expiration après inactivité
- Invalidation à la déconnexion

## API et JWT

Ne stockez jamais de secrets dans le code source. Utilisez des variables d'environnement et des gestionnaires de secrets. Vérifiez toujours les **claims** et la signature des tokens.
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Quelle attaque consiste à injecter du JavaScript affiché à d'autres utilisateurs ?",
                options: ["SQL Injection", "XSS", "DDoS", "Phishing"],
                correctAnswer: 1,
                explanation: "Le Cross-Site Scripting (XSS) permet d'exécuter du code JavaScript dans le contexte du navigateur de la victime."
            },
            {
                id: "q2",
                text: "Comment prévenir efficacement l'injection SQL ?",
                options: [
                    "Masquer les erreurs à l'écran uniquement",
                    "Utiliser des requêtes préparées / paramétrées",
                    "Changer le port de la base de données",
                    "Désactiver HTTPS"
                ],
                correctAnswer: 1,
                explanation: "Les requêtes préparées séparent la structure SQL des données utilisateur, empêchant l'exécution de code malveillant."
            }
        ]
    },
    "phishing-social": {
        sections: [
            {
                title: "Reconnaître le phishing",
                content: sanitizeHtmlContent(`
# Phishing et Ingénierie Sociale

Le **phishing** trompe la victime pour qu'elle révèle des identifiants, clique sur un lien malveillant ou télécharge un fichier infecté.

## Signaux d'alerte

- Urgence artificielle (« votre compte sera fermé dans 1 h »)
- Expéditeur suspect ou domaine proche d'une marque (\`paypa1.com\`)
- Fautes d'orthographe, mise en forme inhabituelle
- Liens qui ne correspondent pas au texte affiché (survoler sans cliquer)
- Pièces jointes inattendues (.zip, .exe, macro Office)

## Variantes

- **Spear phishing** : ciblage personnalisé (nom, poste, collègues)
- **Vishing** : arnaque par téléphone
- **Smishing** : arnaque par SMS
`)
            },
            {
                title: "Se protéger et réagir",
                content: sanitizeHtmlContent(`
## Conduite à tenir

1. Ne jamais cliquer en urgence : vérifier par un autre canal (téléphone officiel, intranet)
2. Signaler le message à la sécurité / bouton « Signaler le phishing »
3. Changer le mot de passe si vous avez cliqué ou saisi des identifiants
4. Activer le **MFA** pour limiter l'usage de mots de passe volés

L'ingénierie sociale exploite la confiance et la pression émotionnelle : la méfiance professionnelle est une compétence clé.
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Quel élément est le plus typique d'un e-mail de phishing ?",
                options: [
                    "Message sans aucun lien",
                    "Urgence et demande d'action immédiate",
                    "Signature d'un collègue connu sans contexte",
                    "Pièce jointe attendue pour un projet en cours"
                ],
                correctAnswer: 1,
                explanation: "Les attaquants créent un sentiment d'urgence pour empêcher la victime de vérifier l'authenticité du message."
            },
            {
                id: "q2",
                text: "Que faire si vous avez cliqué sur un lien de phishing et saisi votre mot de passe ?",
                options: [
                    "Attendre la prochaine mise à jour Windows",
                    "Changer le mot de passe et activer/signaler l'incident",
                    "Transférer l'e-mail à tous vos collègues",
                    "Répondre à l'expéditeur pour demander des excuses"
                ],
                correctAnswer: 1,
                explanation: "Il faut révoquer l'accès potentiel (changement de mot de passe, MFA) et alerter l'équipe sécurité rapidement."
            }
        ]
    },
    "password-auth": {
        sections: [
            {
                title: "Mots de passe robustes",
                content: sanitizeHtmlContent(`
# Mots de passe et Authentification

Un mot de passe faible reste l'une des principales portes d'entrée des attaquants.

## Créer un bon mot de passe

- **Longueur** : 14 caractères ou plus (phrase de passe)
- **Unicité** : un mot de passe différent par service
- **Gestionnaire** : Bitwarden, 1Password, KeePass… pour stocker et générer

## Ce qu'il faut éviter

- Dates de naissance, noms d'animaux, \`Password123!\`
- Réutilisation entre personnel et professionnel
- Partage par e-mail ou chat

Les listes de mots de passe **compromis** (Have I Been Pwned) permettent de vérifier si un compte a fuité.
`)
            },
            {
                title: "Authentification multi-facteurs (MFA)",
                content: sanitizeHtmlContent(`
## Facteurs d'authentification

1. **Ce que vous savez** : mot de passe, PIN
2. **Ce que vous possédez** : téléphone, clé FIDO2, carte
3. **Ce que vous êtes** : biométrie

Le **MFA** combine au moins deux facteurs. Privilégiez les applications TOTP ou clés matérielles plutôt que le SMS seul (risque de SIM swap).

## SSO et fédération

Les solutions **Single Sign-On** (SAML, OIDC) centralisent l'authentification et facilitent la révocation des accès.
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Quelle pratique améliore le plus la sécurité des mots de passe ?",
                options: [
                    "Changer le mot de passe tous les 30 jours sans critère de longueur",
                    "Utiliser un gestionnaire avec mots de passe uniques et longs",
                    "Écrire tous les mots de passe sur un post-it sous l'écran",
                    "Ajouter un chiffre à la fin du même mot de passe partout"
                ],
                correctAnswer: 1,
                explanation: "Un gestionnaire permet des mots de passe longs, uniques et aléatoires sans charge mentale pour l'utilisateur."
            },
            {
                id: "q2",
                text: "Quel facteur correspond à une clé de sécurité FIDO2 ?",
                options: ["Facteur de connaissance", "Facteur de possession", "Facteur d'inherence", "Facteur de localisation"],
                correctAnswer: 1,
                explanation: "Une clé physique est un facteur de possession (« ce que vous possédez »)."
            }
        ]
    },
    "malware-basics": {
        sections: [
            {
                title: "Types de malware",
                content: sanitizeHtmlContent(`
# Malware et Ransomware

Le **malware** (logiciel malveillant) vise à espionner, voler, détruire ou extorquer.

## Familles principales

- **Virus** : s'attache à un fichier hôte et se propage
- **Ver** : se propage seul sur le réseau
- **Trojan** : se déguise en logiciel légitime
- **Spyware / keylogger** : capture frappes et activité
- **Ransomware** : chiffre les fichiers et demande une rançon

## Vecteurs d'infection

Pièces jointes, téléchargements piratés, clés USB, vulnérabilités non corrigées, macros Office malveillantes.
`)
            },
            {
                title: "Défense et réaction",
                content: sanitizeHtmlContent(`
## Mesures de protection

- Antivirus / EDR à jour
- Désactiver les macros non signées
- Segmentation réseau et sauvegardes isolées (protection anti-ransomware)
- Formation des utilisateurs

## En cas d'infection suspectée

1. Déconnecter du réseau (pas d'extinction brutale si forensic prévu)
2. Alerter le SOC / IT
3. Ne **jamais** payer la rançon sans cadre légal et décision management
4. Restaurer depuis sauvegarde propre après analyse
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Qu'est-ce qu'un ransomware ?",
                options: [
                    "Un pare-feu matériel",
                    "Un malware qui chiffre les données et demande une rançon",
                    "Un protocole de chiffrement TLS",
                    "Un type de phishing par SMS"
                ],
                correctAnswer: 1,
                explanation: "Le ransomware chiffre généralement les fichiers de la victime et exige un paiement pour (prétendument) les déchiffrer."
            },
            {
                id: "q2",
                text: "Quelle mesure limite le plus l'impact d'un ransomware ?",
                options: [
                    "Désactiver les sauvegardes pour gagner de l'espace",
                    "Sauvegardes régulières testées et isolées du réseau principal",
                    "Utiliser le compte administrateur au quotidien",
                    "Ouvrir toutes les pièces jointes pour vérifier"
                ],
                correctAnswer: 1,
                explanation: "Des sauvegardes immuables ou hors ligne permettent de restaurer sans payer la rançon."
            }
        ]
    },
    "network-security": {
        sections: [
            {
                title: "Pare-feu et segmentation",
                content: sanitizeHtmlContent(`
# Sécurité Réseau

La sécurité réseau contrôle **qui** peut communiquer **avec quoi** et **comment**.

## Pare-feu

- **Filtrage** des flux entrant/sortant selon règles (IP, port, protocole)
- **Stateful** : suit l'état des connexions
- **WAF** : spécialisé applications web (couche 7)

## Segmentation

Diviser le réseau en zones (DMZ, production, invités) limite le mouvement latéral d'un attaquant après une compromission.
`)
            },
            {
                title: "VPN, IDS et bonnes pratiques",
                content: sanitizeHtmlContent(`
## VPN

Chiffre le trafic entre un poste distant et le réseau entreprise. Préférer des solutions modernes (WireGuard, IKEv2) avec MFA.

## Détection (IDS/IPS)

- **IDS** : alerte sur comportements suspects
- **IPS** : bloque en plus des alertes

## Hygiène réseau

- Changer les mots de passe par défaut des équipements
- Désactiver les services inutiles
- Surveiller les logs et la configuration Wi-Fi (WPA3, réseau invité isolé)
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "À quoi sert principalement la segmentation réseau ?",
                options: [
                    "Augmenter la vitesse Internet",
                    "Limiter la propagation d'un attaquant dans le réseau",
                    "Remplacer les mots de passe",
                    "Chiffrer les e-mails"
                ],
                correctAnswer: 1,
                explanation: "La segmentation isole les zones critiques pour qu'une compromission sur un segment n'atteigne pas tout le réseau."
            },
            {
                id: "q2",
                text: "Quelle différence entre IDS et IPS ?",
                options: [
                    "L'IDS bloque automatiquement tout trafic",
                    "L'IPS peut bloquer le trafic malveillant en plus de détecter",
                    "L'IDS remplace le pare-feu",
                    "L'IPS ne génère pas d'alertes"
                ],
                correctAnswer: 1,
                explanation: "Un IPS (Intrusion Prevention System) ajoute une capacité de blocage active par rapport à un IDS purement détectif."
            }
        ]
    },
    "crypto-intro": {
        sections: [
            {
                title: "Chiffrement symétrique et asymétrique",
                content: sanitizeHtmlContent(`
# Introduction à la Cryptographie

La cryptographie protège **confidentialité**, **intégrité** et parfois **non-répudiation**.

## Chiffrement symétrique

Une **même clé** chiffre et déchiffre (AES-256). Rapide, adapté aux gros volumes de données.

## Chiffrement asymétrique

Paire **clé publique / clé privée** (RSA, ECC). La clé publique chiffre ou vérifie ; la clé privée déchiffre ou signe.

## Hachage

Fonction à sens unique (SHA-256) : empreinte fixe, irréversible. Utilisé pour mots de passe (avec sel + pepper) et intégrité des fichiers.
`)
            },
            {
                title: "Certificats et TLS",
                content: sanitizeHtmlContent(`
## TLS / HTTPS

Lors d'une connexion HTTPS, le serveur présente un **certificat** signé par une autorité de certification (CA) de confiance. Le client vérifie l'identité du serveur et négocie une clé de session symétrique.

## Bonnes pratiques

- Ne jamais inventer sa propre crypto
- Utiliser des bibliothèques standards (OpenSSL, libsodium)
- Révoquer les certificats compromis
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Quel algorithme est typiquement utilisé pour chiffrer de gros volumes de données rapidement ?",
                options: ["RSA seul", "AES (chiffrement symétrique)", "Base64", "MD5 pour chiffrer"],
                correctAnswer: 1,
                explanation: "AES est un chiffrement symétrique rapide, utilisé en pratique avec TLS pour le bulk data."
            },
            {
                id: "q2",
                text: "À quoi sert une fonction de hachage cryptographique ?",
                options: [
                    "Chiffrer et déchiffrer des messages réversibles",
                    "Produire une empreinte fixe difficile à inverser",
                    "Remplacer un pare-feu",
                    "Générer des certificats TLS"
                ],
                correctAnswer: 1,
                explanation: "Un hachage (SHA-256, etc.) produit une empreinte unique ; on ne peut pas retrouver le message original à partir du hash."
            }
        ]
    },
    "incident-response": {
        sections: [
            {
                title: "Cycle de réponse aux incidents",
                content: sanitizeHtmlContent(`
# Réponse aux Incidents

Une réponse structurée réduit les dégâts et le temps d'arrêt.

## Phases (NIST / SANS)

1. **Préparation** : politiques, contacts, outils, exercices tabletop
2. **Détection et analyse** : logs SIEM, alertes EDR, signalement utilisateur
3. **Containment** : isoler les machines, bloquer comptes, couper C2
4. **Éradication** : supprimer malware, corriger vulnérabilité
5. **Récupération** : restaurer services, surveillance renforcée
6. **Leçons apprises** : rapport post-incident, mise à jour des procédures
`)
            },
            {
                title: "Communication et preuves",
                content: sanitizeHtmlContent(`
## Forensic et chaîne de custody

Préserver les logs et images disque avant modification. Documenter qui a accédé aux preuves et quand.

## Communication de crise

- Canal officiel pour les employés et clients
- Ne pas divulguer de détails techniques sensibles publiquement
- Respect des obligations **notification breach** (RGPD : 72 h vers l'autorité si risque pour les personnes)
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Quelle est la première action de containment typique sur un poste compromis ?",
                options: [
                    "Formater immédiatement sans trace",
                    "Isoler le poste du réseau tout en préservant les preuves si possible",
                    "Publier l'incident sur les réseaux sociaux",
                    "Payer la rançon discrètement"
                ],
                correctAnswer: 1,
                explanation: "L'isolation limite la propagation tout en permettant une analyse forensic si le poste n'est pas éteint brutalement."
            },
            {
                id: "q2",
                text: "Sous le RGPD, dans quel délai notifier l'autorité en cas de violation de données à risque ?",
                options: ["24 heures", "72 heures", "30 jours", "Un an"],
                correctAnswer: 1,
                explanation: "Le RGPD impose en principe une notification à l'autorité de contrôle dans les 72 heures après prise de connaissance de la violation."
            }
        ]
    },
    "pentest-ethics": {
        sections: [
            {
                title: "Qu'est-ce qu'un test d'intrusion ?",
                content: sanitizeHtmlContent(`
# Tests d'Intrusion et Éthique

Un **test d'intrusion** (pentest) simule une attaque réelle pour identifier des failles avant les malveillants.

## Types de tests

- **Boîte noire** : aucune information interne
- **Boîte grise** : compte utilisateur limité
- **Boîte blanche** : accès documentation et code source

## Cadre légal

Sans **autorisation écrite** explicite (périmètre, dates, techniques autorisées), les mêmes actions constituent une infraction (accès frauduleux, etc.).
`)
            },
            {
                title: "Méthodologie et éthique",
                content: sanitizeHtmlContent(`
## Phases courantes

1. Reconnaissance (OSINT)
2. Scan et énumération
3. Exploitation contrôlée
4. Post-exploitation (si dans le périmètre)
5. Rapport avec criticité (CVSS) et recommandations

## Éthique professionnelle

- Ne pas accéder aux données hors périmètre
- Signaler immédiatement une faille critique découverte hors scope
- Respecter la confidentialité du rapport
- Certifications reconnues : CEH, OSCP, PNPT…
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Qu'est-ce qui rend un pentest légal ?",
                options: [
                    "Utiliser Kali Linux",
                    "Une autorisation écrite définissant le périmètre et les règles",
                    "Tester uniquement le week-end",
                    "Publier les résultats sur Twitter"
                ],
                correctAnswer: 1,
                explanation: "Sans mandat contractuel et périmètre clair, un pentest peut être considéré comme un accès illégal aux systèmes."
            },
            {
                id: "q2",
                text: "Quel type de pentest ne fournit aucune information préalable à l'équipe d'audit ?",
                options: ["Boîte blanche", "Boîte noire", "Boîte grise", "Audit de code seul"],
                correctAnswer: 1,
                explanation: "En boîte noire, l'auditeur simule un attaquant externe sans documentation interne."
            }
        ]
    }
};

async function seedLessons() {
    await initFirebaseWriter();

    console.log("Début de l'ajout des leçons à Firebase...");
    let errors = 0;

    for (const lesson of lessons) {
        console.log(`Tentative d'ajout de la leçon : ${lesson.title}...`);
        try {
            await writeLesson(lesson);
            console.log(`Leçon ajoutée avec succès : ${lesson.title}`);
        } catch (err) {
            errors++;
            console.error(`Erreur lors de l'ajout de la leçon ${lesson.title}:`, err.message || err);
        }
    }

    for (const [lessonId, content] of Object.entries(lessonContents)) {
        console.log(`Tentative d'ajout du contenu pour la leçon : ${lessonId}...`);
        try {
            await writeLessonContent(lessonId, content);
            console.log(`Contenu ajouté avec succès pour la leçon : ${lessonId}`);
        } catch (err) {
            errors++;
            console.error(`Erreur lors de l'ajout du contenu pour la leçon ${lessonId}:`, err.message || err);
        }
    }

    if (errors > 0) {
        throw new Error(`${errors} erreur(s) lors du seed. Vérifiez les logs ci-dessus.`);
    }
    console.log(`Terminé : ${lessons.length} leçons, ${Object.keys(lessonContents).length} contenus.`);
}

seedLessons()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\nÉchec du seed :', error.message || error);
        process.exit(1);
    }); 