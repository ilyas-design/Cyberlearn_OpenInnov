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
    },
    {
        id: "cloud-security",
        category: "Cybersécurité",
        title: "Sécurité Cloud",
        description: "Modèle de responsabilité partagée, IAM, chiffrement et bonnes pratiques AWS/Azure/GCP.",
        iconName: "Server",
        locked: true,
        tags: ["Cybersécurité", "Cloud", "IAM"],
        order: 15,
        levelRequired: 3,
        xpReward: 75
    },
    {
        id: "mobile-security",
        category: "Cybersécurité",
        title: "Sécurité Mobile",
        description: "Protégez smartphones et tablettes : MDM, applications, réseaux Wi-Fi et données sensibles.",
        iconName: "Shield",
        locked: true,
        tags: ["Cybersécurité", "Mobile", "BYOD"],
        order: 16,
        levelRequired: 2,
        xpReward: 65
    },
    {
        id: "email-security",
        category: "Cybersécurité",
        title: "Sécurité des E-mails",
        description: "SPF, DKIM, DMARC, filtrage anti-spam et bonnes pratiques de messagerie professionnelle.",
        iconName: "Globe",
        locked: true,
        tags: ["Cybersécurité", "E-mail", "Anti-spam"],
        order: 17,
        levelRequired: 2,
        xpReward: 60
    },
    {
        id: "osint-basics",
        category: "Cybersécurité",
        title: "OSINT et Veille",
        description: "Collecte d'informations publiques, veille sur les menaces et empreinte numérique.",
        iconName: "Network",
        locked: true,
        tags: ["Cybersécurité", "OSINT", "Veille"],
        order: 18,
        levelRequired: 3,
        xpReward: 70
    },
    {
        id: "secure-dev",
        category: "Cybersécurité",
        title: "Développement Sécurisé",
        description: "DevSecOps, revue de code, SAST/DAST et intégration de la sécurité dans le cycle de vie logiciel.",
        iconName: "Code",
        locked: true,
        tags: ["Cybersécurité", "DevSecOps", "SAST"],
        order: 19,
        levelRequired: 4,
        xpReward: 80
    },
    {
        id: "zero-trust",
        category: "Cybersécurité",
        title: "Architecture Zero Trust",
        description: "Ne jamais faire confiance, toujours vérifier : identité, micro-segmentation et accès conditionnel.",
        iconName: "Lock",
        locked: true,
        tags: ["Cybersécurité", "Zero Trust", "IAM"],
        order: 20,
        levelRequired: 5,
        xpReward: 95
    },
    {
        id: "iot-security",
        category: "Cybersécurité",
        title: "Sécurité IoT",
        description: "Objets connectés, firmware, réseaux domestiques et risques des appareils intelligents.",
        iconName: "Cpu",
        locked: true,
        tags: ["Cybersécurité", "IoT", "Domotique"],
        order: 21,
        levelRequired: 3,
        xpReward: 70
    },
    {
        id: "ransomware-defense",
        category: "Cybersécurité",
        title: "Défense contre les Ransomwares",
        description: "Comprendre les attaques par rançongiciel, les vecteurs d'infection et les stratégies de protection.",
        iconName: "AlertTriangle",
        locked: true,
        tags: ["Cybersécurité", "Ransomware", "Incident"],
        order: 22,
        levelRequired: 3,
        xpReward: 75
    },
    {
        id: "soc-fundamentals",
        category: "Cybersécurité",
        title: "Fondamentaux du SOC",
        description: "Centre des opérations de sécurité, détection, corrélation d'événements et réponse aux alertes.",
        iconName: "Shield",
        locked: true,
        tags: ["Cybersécurité", "SOC", "SIEM"],
        order: 23,
        levelRequired: 4,
        xpReward: 85
    },
    {
        id: "gdpr-compliance",
        category: "Conformité",
        title: "RGPD et Protection des Données",
        description: "Principes du RGPD, droits des personnes, obligations des organisations et sanctions.",
        iconName: "Database",
        locked: false,
        tags: ["Conformité", "RGPD", "Vie privée"],
        order: 24,
        levelRequired: 2,
        xpReward: 60
    },
    {
        id: "firewall-basics",
        category: "Réseaux",
        title: "Pare-feu et Filtrage Réseau",
        description: "Règles de pare-feu, NAT, zones de sécurité et bonnes pratiques de segmentation.",
        iconName: "Server",
        locked: false,
        tags: ["Réseaux", "Pare-feu", "Segmentation"],
        order: 25,
        levelRequired: 2,
        xpReward: 55
    },
    {
        id: "backup-recovery",
        category: "Cybersécurité",
        title: "Sauvegarde et Reprise d'Activité",
        description: "Stratégies 3-2-1, plans de continuité, tests de restauration et résilience opérationnelle.",
        iconName: "Globe",
        locked: false,
        tags: ["Cybersécurité", "Backup", "BCP"],
        order: 26,
        levelRequired: 2,
        xpReward: 55
    },
    {
        id: "social-engineering",
        category: "Cybersécurité",
        title: "Ingénierie Sociale Avancée",
        description: "Pretexting, baiting, tailgating et techniques de manipulation psychologique en cybersécurité.",
        iconName: "Users",
        locked: true,
        tags: ["Cybersécurité", "Social Engineering", "Humain"],
        order: 27,
        levelRequired: 3,
        xpReward: 70
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
    },
    "social-impact": {
        sections: [
            {
                title: "Le numérique et la société",
                content: sanitizeHtmlContent(`
# Impact Social du Numérique

La technologie transforme le travail, l'éducation, la démocratie et les relations sociales. Comprendre ces impacts aide à mieux appréhender les enjeux de cybersécurité et d'éthique numérique.

## Transformations majeures

- **Travail** : télétravail, automatisation, nouvelles compétences requises
- **Éducation** : e-learning, fracture numérique, accès inégal à la formation
- **Démocratie** : réseaux sociaux, désinformation, protection de la vie privée
- **Économie** : plateformes numériques, économie des données

## Fracture numérique

Tous les citoyens n'ont pas le même accès aux outils, à la formation ou à une connexion fiable. La cybersécurité doit rester accessible et inclusive.
`)
            },
            {
                title: "Enjeux éthiques",
                content: sanitizeHtmlContent(`
## Éthique et responsabilité

- **Vie privée** : collecte massive de données, surveillance, consentement éclairé
- **Intelligence artificielle** : biais algorithmiques, transparence, responsabilité
- **Environnement** : consommation énergétique des data centers et du numérique
- **Droits humains** : liberté d'expression vs modération, protection des mineurs

## Rôle du citoyen numérique

Chacun peut agir : vérifier les sources, respecter la vie privée d'autrui, signaler les contenus illicites et adopter une hygiène numérique responsable.
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Qu'est-ce que la fracture numérique ?",
                options: [
                    "Une faille de sécurité dans un réseau",
                    "Les inégalités d'accès aux technologies et compétences numériques",
                    "Un type de malware",
                    "Un protocole de chiffrement"
                ],
                correctAnswer: 1,
                explanation: "La fracture numérique désigne les disparités d'accès aux outils, à Internet et aux compétences numériques entre populations."
            },
            {
                id: "q2",
                text: "Quel enjeu éthique est directement lié aux biais dans les algorithmes d'IA ?",
                options: [
                    "La consommation énergétique des serveurs",
                    "L'équité et la non-discrimination dans les décisions automatisées",
                    "Le chiffrement TLS",
                    "La segmentation réseau"
                ],
                correctAnswer: 1,
                explanation: "Les biais algorithmiques peuvent conduire à des décisions injustes ou discriminatoires, un enjeu éthique central de l'IA."
            }
        ]
    },
    "digital-lib": {
        sections: [
            {
                title: "Ressources d'apprentissage",
                content: sanitizeHtmlContent(`
# Bibliothèque Numérique

Une bibliothèque numérique regroupe des ressources pédagogiques accessibles en ligne : cours, tutoriels, documentation et exercices pratiques.

## Types de ressources

- **Cours structurés** : parcours progressifs avec quiz et certifications
- **Documentation technique** : guides, RFC, documentation officielle
- **Tutoriels vidéo** : démonstrations pas à pas
- **Labs pratiques** : environnements sandbox pour s'entraîner en sécurité

## Critères de qualité

Privilégiez les sources fiables : sites officiels, organismes reconnus (ANSSI, OWASP, NIST) et contenus régulièrement mis à jour.
`)
            },
            {
                title: "Organiser son apprentissage",
                content: sanitizeHtmlContent(`
## Méthode efficace

1. **Définir un objectif** : certification, compétence métier, sensibilisation
2. **Planifier** : sessions régulières, notes, révisions
3. **Pratiquer** : labs, CTF, projets personnels
4. **Échanger** : forums, communautés, mentors

## Outils utiles

- Prise de notes (Obsidian, Notion)
- Signets et favoris dans CyberLearn
- Calendrier de révision espacée
- Suivi de progression (XP, badges, certificats)
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Quelle source est généralement la plus fiable pour la cybersécurité ?",
                options: [
                    "Un forum anonyme sans modération",
                    "L'ANSSI ou l'OWASP",
                    "Un e-mail non sollicité",
                    "Une publicité pop-up"
                ],
                correctAnswer: 1,
                explanation: "Les organismes reconnus comme l'ANSSI (France) ou l'OWASP publient des guides et bonnes pratiques vérifiés."
            },
            {
                id: "q2",
                text: "Pourquoi la pratique (labs, CTF) complète-t-elle la lecture de documentation ?",
                options: [
                    "Elle remplace totalement la théorie",
                    "Elle permet d'appliquer et ancrer les concepts en situation réelle",
                    "Elle évite d'avoir à lire",
                    "Elle n'a aucun intérêt pédagogique"
                ],
                correctAnswer: 1,
                explanation: "La mise en pratique renforce la compréhension et développe des réflexes utiles en situation professionnelle."
            }
        ]
    },
    "cloud-security": {
        sections: [
            {
                title: "Modèle de responsabilité partagée",
                content: sanitizeHtmlContent(`
# Sécurité Cloud

Le cloud offre flexibilité et scalabilité, mais la sécurité reste **partagée** entre le fournisseur et le client.

## Responsabilités du fournisseur

- Sécurité physique des data centers
- Hyperviseur et infrastructure réseau sous-jacente
- Services managés (selon l'offre)

## Responsabilités du client

- Configuration IAM et droits d'accès
- Chiffrement des données sensibles
- Sécurisation des applications déployées
- Sauvegardes et conformité métier

> Erreur fréquente : laisser un bucket S3 ouvert au public par mauvaise configuration.
`)
            },
            {
                title: "IAM et bonnes pratiques",
                content: sanitizeHtmlContent(`
## Identity and Access Management (IAM)

- Principe du **moindre privilège** pour chaque rôle et utilisateur
- **MFA** obligatoire pour les comptes administrateurs
- Rotation des clés API et secrets (jamais en clair dans le code)
- Audit des permissions avec des outils de **CSPM** (Cloud Security Posture Management)

## Chiffrement

- Chiffrement au repos (KMS, clés gérées par le client)
- Chiffrement en transit (TLS 1.2+)
- Journalisation centralisée (CloudTrail, Azure Monitor, Cloud Logging)
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Dans le modèle de responsabilité partagée, qui configure les droits d'accès aux ressources cloud ?",
                options: ["Uniquement le fournisseur cloud", "Le client", "Personne, c'est automatique", "Les régulateurs"],
                correctAnswer: 1,
                explanation: "Le client est responsable de la configuration IAM, des politiques d'accès et de la sécurité de ses déploiements."
            },
            {
                id: "q2",
                text: "Quel risque est typique d'un bucket de stockage mal configuré ?",
                options: [
                    "Augmentation automatique des performances",
                    "Exposition publique de données sensibles",
                    "Chiffrement involontaire par le fournisseur",
                    "Suppression des logs d'audit"
                ],
                correctAnswer: 1,
                explanation: "Une mauvaise ACL ou politique de bucket peut rendre des fichiers accessibles publiquement sur Internet."
            }
        ]
    },
    "mobile-security": {
        sections: [
            {
                title: "Menaces sur mobile",
                content: sanitizeHtmlContent(`
# Sécurité Mobile

Smartphones et tablettes stockent e-mails, authentifiants et données professionnelles. Ils sont des cibles privilégiées.

## Menaces courantes

- Applications malveillantes ou permissions excessives
- Réseaux Wi-Fi publics non sécurisés
- Vol ou perte de l'appareil
- **Jailbreak / root** qui affaiblit les protections OS
- **Smishing** (phishing par SMS)

## BYOD vs entreprise

Le **BYOD** (Bring Your Own Device) mélange vie personnelle et professionnelle : des politiques claires (MDM, conteneurisation) sont essentielles.
`)
            },
            {
                title: "Protection et MDM",
                content: sanitizeHtmlContent(`
## Mesures de protection

- Verrouillage par code/biométrie + chiffrement du stockage
- Mises à jour OS et applications
- Installation d'apps uniquement depuis stores officiels
- **MDM** (Mobile Device Management) : effacement à distance, politique de mot de passe

## Bonnes pratiques utilisateur

- Désactiver le Bluetooth/Wi-Fi inutilisés en public
- Ne pas stocker de mots de passe en clair dans des notes
- Signaler immédiatement la perte d'un appareil professionnel
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Qu'est-ce que le MDM permet à une entreprise ?",
                options: [
                    "Pirater les téléphones personnels librement",
                    "Gérer à distance la sécurité des appareils (politiques, effacement)",
                    "Remplacer le pare-feu réseau",
                    "Chiffrer Internet globalement"
                ],
                correctAnswer: 1,
                explanation: "Le MDM permet d'appliquer des politiques de sécurité et d'agir à distance (verrouillage, effacement) sur les appareils gérés."
            },
            {
                id: "q2",
                text: "Pourquoi le jailbreak/root d'un smartphone est-il risqué en entreprise ?",
                options: [
                    "Il améliore toujours la sécurité",
                    "Il contourne les protections du système et facilite l'installation de malware",
                    "Il active automatiquement le MFA",
                    "Il chiffre toutes les communications"
                ],
                correctAnswer: 1,
                explanation: "Root/jailbreak affaiblit le sandboxing et les contrôles de sécurité natifs du système d'exploitation mobile."
            }
        ]
    },
    "email-security": {
        sections: [
            {
                title: "Authentification des e-mails",
                content: sanitizeHtmlContent(`
# Sécurité des E-mails

La messagerie reste le vecteur n°1 des attaques (phishing, malware, fraude).

## Protocoles anti-usurpation

- **SPF** : liste les serveurs autorisés à envoyer pour un domaine
- **DKIM** : signature cryptographique des messages
- **DMARC** : politique de traitement si SPF/DKIM échouent (none, quarantine, reject)

Sans ces enregistrements DNS, un attaquant peut usurper facilement votre domaine (@votre-entreprise.com).
`)
            },
            {
                title: "Filtrage et bonnes pratiques",
                content: sanitizeHtmlContent(`
## Côté organisation

- Passerelle e-mail avec anti-spam et anti-phishing
- Formation des utilisateurs au signalement
- Désactivation des macros Office par défaut
- Chiffrement S/MIME ou PGP pour données sensibles (si pertinent)

## Côté utilisateur

- Vérifier l'expéditeur réel (en-têtes, domaine)
- Ne pas cliquer sur les liens urgents sans vérification
- Utiliser le bouton « Signaler le phishing »
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Quel protocole indique aux serveurs récepteurs quoi faire si SPF et DKIM échouent ?",
                options: ["HTTPS", "DMARC", "FTP", "SNMP"],
                correctAnswer: 1,
                explanation: "DMARC définit la politique (rejeter, mettre en quarantaine, etc.) lorsque l'authentification du message échoue."
            },
            {
                id: "q2",
                text: "À quoi sert SPF ?",
                options: [
                    "Chiffrer le contenu des e-mails",
                    "Autoriser explicitement quels serveurs peuvent envoyer pour un domaine",
                    "Scanner les pièces jointes sur le poste client",
                    "Remplacer les mots de passe"
                ],
                correctAnswer: 1,
                explanation: "SPF (Sender Policy Framework) publie en DNS la liste des serveurs de messagerie autorisés pour un domaine."
            }
        ]
    },
    "osint-basics": {
        sections: [
            {
                title: "Qu'est-ce que l'OSINT ?",
                content: sanitizeHtmlContent(`
# OSINT et Veille

**OSINT** (Open Source Intelligence) : collecte et analyse d'informations **publiquement disponibles** à des fins de renseignement, veille ou investigation légitime.

## Sources courantes

- Sites web, réseaux sociaux, registres publics
- Bases de fuites (Have I Been Pwned) pour vérifier des comptes
- Certificats TLS (Certificate Transparency)
- Métadonnées de fichiers et images (EXIF)

## Cadre légal et éthique

L'OSINT ne justifie pas l'accès non autorisé à des systèmes. Respectez la vie privée, le RGPD et le périmètre autorisé de votre mission.
`)
            },
            {
                title: "Veille sur les menaces",
                content: sanitizeHtmlContent(`
## Threat Intelligence

- Flux **CVE** et bulletins éditeurs (Microsoft Patch Tuesday, etc.)
- Alertes CERT/ANSSI
- Feeds IoC (indicateurs de compromission : hashes, domaines malveillants)

## Empreinte numérique

Auditez ce qu'un attaquant pourrait trouver sur votre organisation : noms d'employés, technologies exposées (Shodan), sous-domaines oubliés.

Réduisez la surface d'attaque : supprimer comptes inutilisés, limiter les infos sensibles en public.
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "L'OSINT utilise principalement des informations :",
                options: [
                    "Obtenues par piratage de bases de données",
                    "Publiquement accessibles et légales à consulter",
                    "Volées sur le dark web uniquement",
                    "Classifiées secret défense"
                ],
                correctAnswer: 1,
                explanation: "L'OSINT repose sur des sources ouvertes et légales : web, registres publics, publications officielles, etc."
            },
            {
                id: "q2",
                text: "Qu'est-ce qu'un IoC (Indicator of Compromise) ?",
                options: [
                    "Un type de pare-feu",
                    "Un signe technique qu'un système a pu être compromis (hash, IP, domaine…)",
                    "Un certificat TLS",
                    "Un algorithme de chiffrement"
                ],
                correctAnswer: 1,
                explanation: "Un IoC est un artefact observable (adresse IP, hash de fichier, URL) associé à une activité malveillante connue."
            }
        ]
    },
    "secure-dev": {
        sections: [
            {
                title: "DevSecOps",
                content: sanitizeHtmlContent(`
# Développement Sécurisé

Intégrer la sécurité **tôt** dans le cycle de vie logiciel réduit les coûts et les vulnérabilités en production.

## DevSecOps

- **Shift left** : tests de sécurité dès le développement
- Pipeline CI/CD avec contrôles automatisés
- Revue de code incluant les aspects sécurité
- Gestion des dépendances (SCA) pour détecter librairies vulnérables

## OWASP SAMM / BSIMM

Des modèles de maturité aident à structurer la progression sécurité d'une équipe de développement.
`)
            },
            {
                title: "SAST, DAST et bonnes pratiques",
                content: sanitizeHtmlContent(`
## Outils

- **SAST** : analyse statique du code source (SonarQube, Semgrep)
- **DAST** : tests dynamiques sur application running (OWASP ZAP, Burp)
- **SCA** : analyse des composants tiers (Dependabot, Snyk)

## Règles développeur

- Valider toutes les entrées, encoder les sorties
- Secrets dans variables d'environnement / vault
- Journaliser sans exposer de données sensibles
- Tests unitaires incluant cas limites et injections
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Que signifie « shift left » en DevSecOps ?",
                options: [
                    "Déplacer les serveurs vers la gauche du data center",
                    "Intégrer la sécurité plus tôt dans le cycle de développement",
                    "Utiliser uniquement des claviers AZERTY",
                    "Reporter les tests à la mise en production"
                ],
                correctAnswer: 1,
                explanation: "Shift left signifie traiter la sécurité en amont (conception, dev) plutôt qu'en fin de cycle ou après incident."
            },
            {
                id: "q2",
                text: "Quelle différence entre SAST et DAST ?",
                options: [
                    "SAST analyse le code source ; DAST teste l'application en exécution",
                    "SAST remplace les pare-feu ; DAST remplace les antivirus",
                    "Il n'y a aucune différence",
                    "DAST ne s'applique qu'au mobile"
                ],
                correctAnswer: 0,
                explanation: "SAST (Static) inspecte le code sans l'exécuter ; DAST (Dynamic) envoie des requêtes à une application running pour trouver des failles."
            }
        ]
    },
    "zero-trust": {
        sections: [
            {
                title: "Principes du Zero Trust",
                content: sanitizeHtmlContent(`
# Architecture Zero Trust

Le modèle **Zero Trust** part du principe : **jamais faire confiance, toujours vérifier**, même à l'intérieur du réseau.

## Principes clés (NIST SP 800-207)

1. Toutes les sources de données et services sont des ressources
2. La communication se fait **toujours** de façon sécurisée
3. L'accès est accordé **par session**, avec le moindre privilège
4. Les politiques s'appliquent dynamiquement (identité, appareil, contexte)
5. Surveillance et mesure continue de l'intégrité

Fini le modèle « château fort » : le périmètre réseau n'est plus la frontière de confiance.
`)
            },
            {
                title: "Mise en œuvre",
                content: sanitizeHtmlContent(`
## Composants

- **Identité forte** : IAM, MFA, SSO
- **Micro-segmentation** : accès granulaire service par service
- **Accès conditionnel** : posture de l'appareil, géolocalisation, risque
- **ZTNA** (Zero Trust Network Access) : remplace le VPN classique pour l'accès applicatif

## Migration progressive

Commencer par les actifs critiques, inventorier les identités, centraliser les logs, puis étendre la vérification continue à l'ensemble du parc.
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Quelle affirmation résume le mieux le Zero Trust ?",
                options: [
                    "Tout utilisateur interne est automatiquement de confiance",
                    "Chaque accès doit être authentifié, autorisé et vérifié en continu",
                    "Il suffit d'un pare-feu périmétrique performant",
                    "Seuls les administrateurs ont besoin de MFA"
                ],
                correctAnswer: 1,
                explanation: "Zero Trust exige une vérification explicite à chaque accès, sans confiance implicite basée sur la localisation réseau."
            },
            {
                id: "q2",
                text: "Qu'est-ce que la micro-segmentation ?",
                options: [
                    "Diviser le code en microservices uniquement",
                    "Isoler finement les flux réseau pour limiter le mouvement latéral",
                    "Réduire la taille des e-mails",
                    "Utiliser des microprocesseurs plus petits"
                ],
                correctAnswer: 1,
                explanation: "La micro-segmentation restreint les communications entre zones/workloads pour qu'une compromission ne se propage pas facilement."
            }
        ]
    },
    "iot-security": {
        sections: [
            {
                title: "Risques IoT",
                content: sanitizeHtmlContent(`
# Sécurité IoT

Caméras IP, assistants vocaux, capteurs industriels : les objets connectés multiplient la surface d'attaque.

## Vulnérabilités fréquentes

- Mots de passe par défaut non changés
- Firmware jamais mis à jour
- Communications non chiffrées
- Services exposés sur Internet (botnets **Mirai**)
- Données collectées sans consentement clair

## Contextes

- **Domotique** : maison connectée
- **Industrie** : IIoT, SCADA
- **Santé** : dispositifs médicaux connectés
`)
            },
            {
                title: "Sécuriser son écosystème IoT",
                content: sanitizeHtmlContent(`
## Bonnes pratiques

1. Changer les identifiants par défaut à la première installation
2. Segmenter le réseau (VLAN invité / IoT isolé)
3. Désactiver UPnP et ports inutiles sur la box
4. Acheter des marques avec mises à jour long terme
5. Surveiller le trafic anormal (caméra qui envoie des Go vers l'étranger)

## Côté entreprise

Inventaire des assets IoT, politique d'achat sécurisée, supervision centralisée et plan de réponse si un capteur est compromis.
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Pourquoi le botnet Mirai est-il célèbre dans l'histoire de l'IoT ?",
                options: [
                    "Il chiffrait les disques durs",
                    "Il compromettait des appareils IoT faiblement sécurisés pour des attaques DDoS massives",
                    "Il était un antivirus open source",
                    "Il protégeait les routeurs domestiques"
                ],
                correctAnswer: 1,
                explanation: "Mirai infectait des caméras et routeurs IoT avec mots de passe par défaut pour constituer un botnet DDoS."
            },
            {
                id: "q2",
                text: "Quelle mesure réduit le plus le risque IoT sur un réseau domestique ?",
                options: [
                    "Laisser tous les appareils sur le même réseau sans mot de passe Wi-Fi",
                    "Isoler les objets connectés sur un réseau/VLAN séparé",
                    "Désactiver toutes les mises à jour",
                    "Publier le mot de passe Wi-Fi sur les réseaux sociaux"
                ],
                correctAnswer: 1,
                explanation: "Segmenter les appareils IoT limite l'impact d'une compromission sur le reste du réseau (PC, NAS, etc.)."
            }
        ]
    },
    "ransomware-defense": {
        sections: [
            {
                title: "Qu'est-ce qu'un ransomware ?",
                content: sanitizeHtmlContent(`
<p>Un <strong>ransomware</strong> (rançongiciel) chiffre les fichiers d'une victime et exige une rançon pour les déchiffrer.</p>

<h3>Vecteurs courants</h3>
<ul>
    <li>Pièces jointes malveillantes dans des e-mails de phishing</li>
    <li>Exploitation de services exposés (RDP, VPN non patchés)</li>
    <li>Chaînes d'approvisionnement compromises</li>
</ul>

<p>Les groupes modernes pratiquent aussi la <strong>double extorsion</strong> : vol de données + menace de publication.</p>
`)
            },
            {
                title: "Prévention et réponse",
                content: sanitizeHtmlContent(`
<h3>Mesures préventives</h3>
<ul>
    <li>Sauvegardes hors ligne testées régulièrement (règle 3-2-1)</li>
    <li>MFA sur tous les accès distants</li>
    <li>Segmentation réseau et principe du moindre privilège</li>
    <li>Formation des utilisateurs au phishing</li>
</ul>

<h3>En cas d'incident</h3>
<ol>
    <li>Isoler les systèmes infectés du réseau</li>
    <li>Ne pas payer la rançon sans évaluation juridique</li>
    <li>Activer le plan de réponse aux incidents</li>
    <li>Notifier les autorités compétentes (ANSSI, CNIL selon le cas)</li>
</ol>
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Qu'est-ce que la double extorsion dans un ransomware ?",
                options: [
                    "Payer deux fois la même rançon",
                    "Chiffrer les données ET menacer de les publier si la rançon n'est pas payée",
                    "Attaquer deux entreprises en même temps",
                    "Utiliser deux algorithmes de chiffrement"
                ],
                correctAnswer: 1,
                explanation: "La double extorsion combine le chiffrement des données avec la menace de fuite publique pour augmenter la pression sur la victime."
            },
            {
                id: "q2",
                text: "Quelle mesure est la plus efficace pour récupérer après une attaque ransomware ?",
                options: [
                    "Payer immédiatement la rançon",
                    "Désactiver tous les pare-feu",
                    "Des sauvegardes hors ligne régulièrement testées",
                    "Partager les mots de passe sur un wiki interne"
                ],
                correctAnswer: 2,
                explanation: "Des sauvegardes isolées et testées permettent de restaurer les systèmes sans payer la rançon."
            }
        ]
    },
    "soc-fundamentals": {
        sections: [
            {
                title: "Rôle du SOC",
                content: sanitizeHtmlContent(`
<p>Un <strong>Security Operations Center (SOC)</strong> surveille en continu l'infrastructure, détecte les menaces et coordonne la réponse.</p>

<h3>Fonctions clés</h3>
<ul>
    <li>Collecte et corrélation des logs (SIEM)</li>
    <li>Triage et investigation des alertes</li>
    <li>Threat hunting proactif</li>
    <li>Coordination avec l'équipe IR (Incident Response)</li>
</ul>
`)
            },
            {
                title: "Outils et processus",
                content: sanitizeHtmlContent(`
<h3>Stack typique</h3>
<ul>
    <li><strong>SIEM</strong> : Splunk, Elastic, Sentinel</li>
    <li><strong>EDR/XDR</strong> : détection sur les endpoints</li>
    <li><strong>SOAR</strong> : automatisation des playbooks</li>
    <li><strong>Threat Intelligence</strong> : IOC, TTP MITRE ATT&CK</li>
</ul>

<p>Les analystes SOC travaillent en shifts 24/7 avec des runbooks pour classer les alertes (vrai positif, faux positif, escalade).</p>
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Quel outil centralise et corrèle les événements de sécurité dans un SOC ?",
                options: ["CRM", "SIEM", "ERP", "CMS"],
                correctAnswer: 1,
                explanation: "Le SIEM (Security Information and Event Management) agrège les logs et génère des alertes corrélées."
            },
            {
                id: "q2",
                text: "Quel est l'objectif principal du threat hunting ?",
                options: [
                    "Attendre passivement les alertes automatiques",
                    "Rechercher proactivement des menaces non détectées",
                    "Supprimer tous les logs anciens",
                    "Désactiver l'antivirus"
                ],
                correctAnswer: 1,
                explanation: "Le threat hunting consiste à chercher activement des indicateurs de compromission que les outils automatiques n'ont pas détectés."
            }
        ]
    },
    "gdpr-compliance": {
        sections: [
            {
                title: "Principes du RGPD",
                content: sanitizeHtmlContent(`
<p>Le <strong>Règlement Général sur la Protection des Données (RGPD)</strong> encadre le traitement des données personnelles dans l'UE.</p>

<h3>Principes fondamentaux</h3>
<ul>
    <li>Licéité, loyauté et transparence</li>
    <li>Limitation des finalités et minimisation des données</li>
    <li>Exactitude et limitation de la conservation</li>
    <li>Intégrité, confidentialité et responsabilité (accountability)</li>
</ul>
`)
            },
            {
                title: "Droits et obligations",
                content: sanitizeHtmlContent(`
<h3>Droits des personnes</h3>
<ul>
    <li>Accès, rectification, effacement (« droit à l'oubli »)</li>
    <li>Portabilité et opposition au traitement</li>
</ul>

<h3>Obligations des organisations</h3>
<ul>
    <li>Désigner un DPO si nécessaire</li>
    <li>Tenir un registre des traitements</li>
    <li>Notifier les violations sous 72h à la CNIL</li>
    <li>Analyse d'impact (DPIA) pour les traitements à risque</li>
</ul>
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Dans quel délai une violation de données doit-elle être notifiée à la CNIL ?",
                options: ["24 heures", "72 heures", "7 jours", "30 jours"],
                correctAnswer: 1,
                explanation: "Le RGPD impose une notification à l'autorité de contrôle dans les 72 heures après avoir pris connaissance de la violation."
            },
            {
                id: "q2",
                text: "Quel principe RGPD impose de ne collecter que les données strictement nécessaires ?",
                options: ["Portabilité", "Minimisation des données", "Transparence", "Accountability"],
                correctAnswer: 1,
                explanation: "Le principe de minimisation exige de limiter la collecte aux données adéquates, pertinentes et limitées au nécessaire."
            }
        ]
    },
    "firewall-basics": {
        sections: [
            {
                title: "Types de pare-feu",
                content: sanitizeHtmlContent(`
<p>Un <strong>pare-feu</strong> filtre le trafic réseau selon des règles définies.</p>

<h3>Catégories</h3>
<ul>
    <li><strong>Pare-feu stateful</strong> : suit les sessions (TCP/UDP)</li>
    <li><strong>NGFW</strong> : inspection applicative (L7), IPS intégré</li>
    <li><strong>Pare-feu hôte</strong> : sur chaque machine (Windows Firewall, iptables)</li>
</ul>
`)
            },
            {
                title: "Bonnes pratiques",
                content: sanitizeHtmlContent(`
<h3>Règles essentielles</h3>
<ul>
    <li>Politique <strong>deny by default</strong> : tout bloquer sauf le nécessaire</li>
    <li>Segmenter en zones (DMZ, interne, invité)</li>
    <li>Journaliser et revoir les règles régulièrement</li>
    <li>Limiter l'exposition des services admin (SSH, RDP)</li>
</ul>
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Quelle politique de pare-feu est recommandée par défaut ?",
                options: [
                    "Autoriser tout le trafic entrant",
                    "Refuser tout sauf les flux explicitement autorisés",
                    "Désactiver le pare-feu en production",
                    "Ouvrir le port 22 à Internet"
                ],
                correctAnswer: 1,
                explanation: "La politique « deny by default » minimise la surface d'attaque en n'autorisant que le trafic nécessaire."
            },
            {
                id: "q2",
                text: "Qu'est-ce qu'un NGFW par rapport à un pare-feu classique ?",
                options: [
                    "Un pare-feu sans règles",
                    "Un pare-feu de nouvelle génération avec inspection applicative (couche 7)",
                    "Un antivirus uniquement",
                    "Un routeur Wi-Fi domestique"
                ],
                correctAnswer: 1,
                explanation: "Les NGFW analysent le trafic au niveau applicatif et intègrent souvent IPS, filtrage URL et détection d'applications."
            }
        ]
    },
    "backup-recovery": {
        sections: [
            {
                title: "Règle 3-2-1",
                content: sanitizeHtmlContent(`
<p>La <strong>règle 3-2-1</strong> est la base d'une stratégie de sauvegarde solide :</p>
<ul>
    <li><strong>3</strong> copies de vos données</li>
    <li><strong>2</strong> types de supports différents</li>
    <li><strong>1</strong> copie hors site ou hors ligne (air-gapped)</li>
</ul>

<p>Cette approche protège contre la perte matérielle, les erreurs humaines et les ransomwares.</p>
`)
            },
            {
                title: "PCA et PRA",
                content: sanitizeHtmlContent(`
<h3>Plan de Continuité d'Activité (PCA)</h3>
<p>Maintenir les fonctions critiques pendant une crise majeure.</p>

<h3>Plan de Reprise d'Activité (PRA)</h3>
<p>Restaurer les systèmes IT après un sinistre avec des objectifs RTO (délai) et RPO (perte de données acceptée).</p>

<p><strong>Tester régulièrement</strong> les restaurations — une sauvegarde non testée n'est pas une sauvegarde fiable.</p>
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Que signifie le « 1 » dans la règle de sauvegarde 3-2-1 ?",
                options: [
                    "Une seule copie suffit",
                    "Une copie hors site ou hors ligne",
                    "Un seul administrateur",
                    "Une sauvegarde par jour"
                ],
                correctAnswer: 1,
                explanation: "Le « 1 » impose une copie isolée (hors site ou déconnectée) pour survivre à un sinistre local ou un ransomware."
            },
            {
                id: "q2",
                text: "Que mesure le RPO (Recovery Point Objective) ?",
                options: [
                    "Le temps pour redémarrer un serveur",
                    "La quantité maximale de données perdues acceptable",
                    "Le nombre d'administrateurs requis",
                    "Le coût d'un pare-feu"
                ],
                correctAnswer: 1,
                explanation: "Le RPO définit la fenêtre de données que l'organisation accepte de perdre en cas d'incident."
            }
        ]
    },
    "social-engineering": {
        sections: [
            {
                title: "Techniques d'ingénierie sociale",
                content: sanitizeHtmlContent(`
<p>L'<strong>ingénierie sociale</strong> exploite la confiance et les biais humains plutôt que des failles techniques.</p>

<h3>Techniques avancées</h3>
<ul>
    <li><strong>Pretexting</strong> : inventer un scénario crédible (faux support IT)</li>
    <li><strong>Baiting</strong> : laisser une clé USB infectée dans un parking</li>
    <li><strong>Tailgating</strong> : suivre un employé autorisé dans une zone sécurisée</li>
    <li><strong>Vishing</strong> : phishing par téléphone</li>
</ul>
`)
            },
            {
                title: "Défense organisationnelle",
                content: sanitizeHtmlContent(`
<h3>Contre-mesures</h3>
<ul>
    <li>Procédures de vérification d'identité (codes, callbacks)</li>
    <li>Formation continue et simulations de phishing</li>
    <li>Culture du signalement sans blâme</li>
    <li>Contrôles physiques (badges, sas de sécurité)</li>
</ul>

<p>Le facteur humain reste la cible privilégiée : la technologie seule ne suffit pas.</p>
`)
            }
        ],
        questions: [
            {
                id: "q1",
                text: "Qu'est-ce que le tailgating en sécurité physique ?",
                options: [
                    "Envoyer un e-mail de phishing",
                    "Suivre une personne autorisée pour entrer dans une zone restreinte",
                    "Chiffrer des fichiers",
                    "Scanner un réseau Wi-Fi"
                ],
                correctAnswer: 1,
                explanation: "Le tailgating consiste à profiter de l'ouverture d'une porte par un employé autorisé pour accéder à une zone protégée."
            },
            {
                id: "q2",
                text: "Quelle contre-mesure réduit le risque de vishing ?",
                options: [
                    "Révéler son mot de passe au téléphone",
                    "Raccrocher et rappeler via le numéro officiel de l'organisation",
                    "Cliquer sur tous les liens reçus par SMS",
                    "Désactiver la MFA"
                ],
                correctAnswer: 1,
                explanation: "Rappeler via un canal vérifié permet de confirmer l'identité de l'appelant sans se fier à un numéro affiché."
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