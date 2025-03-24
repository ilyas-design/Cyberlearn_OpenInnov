'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';

interface Message {
    text: string;
    isBot: boolean;
}

const predefinedMessages = {
    "Comment débuter en cybersécurité ?": "Nous vous recommandons de commencer par les cours de base dans la section 'Fondamentaux de la Cybersécurité'. Vous y apprendrez les concepts essentiels et les bonnes pratiques.",
    "Quels sont les prérequis techniques ?": "Pour suivre nos cours, vous devez avoir des connaissances de base en informatique et en réseaux. Une familiarité avec Linux est un plus, mais nous proposons aussi une introduction à ces outils.",
    "Je n'arrive pas à accéder à un cours": "Vérifiez que vous êtes bien connecté à votre compte. Si le problème persiste, vous pouvez contacter notre support technique via la page Contact.",
    "Comment signaler un bug ?": "Si vous rencontrez un bug technique, merci de nous le signaler via la page Contact en précisant : la page concernée, les étapes pour reproduire le bug, et votre configuration.",
    "Où trouver les exercices pratiques ?": "Chaque leçon contient des exercices pratiques à la fin. Nous proposons aussi des labs virtuels dans la section 'Environnements d'entraînement'.",
    "Comment obtenir de l'aide ?": "Vous pouvez obtenir de l'aide de plusieurs façons : consulter notre FAQ, rejoindre notre forum communautaire, ou contacter directement notre équipe support."
};

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    const scrollToMessage = () => {
        if (lastMessageRef.current && messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const message = lastMessageRef.current;

            // Calculer la position pour centrer le message
            const containerHeight = container.clientHeight;
            const messageHeight = message.clientHeight;
            const scrollPosition = message.offsetTop - (containerHeight / 2) + (messageHeight / 2);

            container.scrollTo({
                top: scrollPosition,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToMessage();
        }
    }, [messages]);

    const handlePredefinedMessage = (question: string) => {
        const newMessages = [
            ...messages,
            { text: question, isBot: false },
            { text: predefinedMessages[question as keyof typeof predefinedMessages], isBot: true }
        ];
        setMessages(newMessages);
    };

    return (
        <div className={styles.chatbotContainer}>
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <h3>SUPPORT</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className={styles.closeButton}
                        >
                            ×
                        </button>
                    </div>
                    <div
                        className={styles.messagesContainer}
                        ref={messagesContainerRef}
                    >
                        {messages.length === 0 && (
                            <div className={`${styles.message} ${styles.botMessage}`}>
                                Bonjour ! Comment puis-je vous aider aujourd'hui ?
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                ref={index === messages.length - 1 ? lastMessageRef : null}
                                className={`${styles.message} ${message.isBot ? styles.botMessage : styles.userMessage}`}
                            >
                                {message.text}
                            </div>
                        ))}
                    </div>
                    <div className={styles.predefinedButtons}>
                        {Object.keys(predefinedMessages).map((question) => (
                            <button
                                key={question}
                                onClick={() => handlePredefinedMessage(question)}
                                className={styles.predefinedButton}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <button
                className={styles.chatButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Ouvrir le support"
            >
                ?
            </button>
        </div>
    );
} 