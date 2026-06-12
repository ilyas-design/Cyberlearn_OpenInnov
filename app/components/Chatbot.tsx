'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SUGGESTED_QUESTIONS } from '../lib/chatbotContext';
import styles from './Chatbot.module.css';

interface Message {
    text: string;
    isBot: boolean;
    isLoading?: boolean;
}

export default function Chatbot() {
    const { locale, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToMessage = () => {
        if (lastMessageRef.current && messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const message = lastMessageRef.current;
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

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isSending) return;

        setInput('');
        setIsSending(true);

        const userMessage: Message = { text: trimmed, isBot: false };
        const loadingMessage: Message = { text: t('chatbot.thinking'), isBot: true, isLoading: true };

        setMessages((prev) => [...prev, userMessage, loadingMessage]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed, locale }),
            });

            const data = await response.json();
            const reply = data.response ?? t('chatbot.error');

            setMessages((prev) => {
                const withoutLoading = prev.filter((msg) => !msg.isLoading);
                return [...withoutLoading, { text: reply, isBot: true }];
            });
        } catch {
            setMessages((prev) => {
                const withoutLoading = prev.filter((msg) => !msg.isLoading);
                return [...withoutLoading, { text: t('chatbot.error'), isBot: true }];
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        sendMessage(input);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage(input);
        }
    };

    return (
        <div className={styles.chatbotContainer}>
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <h3>{t('chatbot.title')}</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className={styles.closeButton}
                            aria-label={t('chatbot.close')}
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
                                {t('chatbot.greeting')}
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                ref={index === messages.length - 1 ? lastMessageRef : null}
                                className={`${styles.message} ${message.isBot ? styles.botMessage : styles.userMessage} ${message.isLoading ? styles.loadingMessage : ''}`}
                            >
                                {message.text}
                            </div>
                        ))}
                    </div>
                    <form className={styles.inputArea} onSubmit={handleSubmit}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value.slice(0, 2000))}
                            maxLength={2000}
                            onKeyDown={handleKeyDown}
                            placeholder={t('chatbot.placeholder')}
                            className={styles.textInput}
                            disabled={isSending}
                            aria-label={t('chatbot.placeholder')}
                        />
                        <button
                            type="submit"
                            className={styles.sendButton}
                            disabled={isSending || !input.trim()}
                            aria-label={t('chatbot.send')}
                        >
                            →
                        </button>
                    </form>
                    <div className={styles.faqSection}>
                        <p className={styles.faqTitle}>{t('chatbot.suggestions')}</p>
                        <ul className={styles.faqList}>
                            {SUGGESTED_QUESTIONS.map((question) => (
                                <li key={question}>
                                    <button
                                        type="button"
                                        onClick={() => sendMessage(question)}
                                        className={styles.faqItem}
                                        disabled={isSending}
                                    >
                                        <span className={styles.faqIcon} aria-hidden="true">?</span>
                                        <span className={styles.faqText}>{question}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            <button
                className={styles.chatButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={t('chatbot.open')}
            >
                ?
            </button>
        </div>
    );
}
