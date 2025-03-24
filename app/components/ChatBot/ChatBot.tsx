"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { main } from '@/app/utils/chatbot';
import styles from './ChatBot.module.css';

interface Message {
    text: string;
    isBot: boolean;
    timestamp: Date;
    isLoading?: boolean;
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            text: "Bonjour ! Je suis votre assistant CyberLearn. Comment puis-je vous aider aujourd'hui ?",
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Ajouter le message de l'utilisateur
        const userMessage = {
            text: message,
            isBot: false,
            timestamp: new Date()
        };

        // Ajouter un message de chargement
        const loadingMessage = {
            text: "...",
            isBot: true,
            timestamp: new Date(),
            isLoading: true
        };

        setMessages(prev => [...prev, userMessage, loadingMessage]);
        setMessage('');

        try {
            // Obtenir la réponse de l'API
            const response = await main(message);

            // Remplacer le message de chargement par la réponse
            setMessages(prev => [
                ...prev.slice(0, -1),
                {
                    text: response || "Désolé, je n'ai pas pu générer une réponse.",
                    isBot: true,
                    timestamp: new Date()
                }
            ]);
        } catch (error) {
            console.error('Erreur avec l\'API:', error);
            setMessages(prev => [
                ...prev.slice(0, -1),
                {
                    text: "Une erreur s'est produite. Veuillez réessayer plus tard.",
                    isBot: true,
                    timestamp: new Date()
                }
            ]);
        }
    };

    return (
        <div className={styles.chatbotContainer}>
            {!isOpen && (
                <button
                    className={styles.chatButton}
                    onClick={() => setIsOpen(true)}
                    aria-label="Ouvrir le chat"
                >
                    <MessageSquare />
                </button>
            )}

            {isOpen && (
                <div className={`${styles.chatWindow} ${isMinimized ? styles.minimized : ''}`}>
                    <div className={styles.chatHeader}>
                        <h3>CyberLearn Assistant</h3>
                        <div className={styles.chatControls}>
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                aria-label={isMinimized ? "Maximiser" : "Minimiser"}
                            >
                                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Fermer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.chatMessages}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`${styles.message} ${msg.isBot ? styles.botMessage : styles.userMessage} ${msg.isLoading ? styles.loading : ''}`}
                            >
                                <div className={styles.messageContent}>
                                    <p>
                                        {msg.isLoading ? (
                                            <span className={styles.loadingDots}>...</span>
                                        ) : (
                                            msg.text
                                        )}
                                    </p>
                                    <span className={styles.timestamp}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className={styles.chatInput}>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Posez votre question..."
                            aria-label="Message"
                        />
                        <button type="submit" aria-label="Envoyer">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
} 