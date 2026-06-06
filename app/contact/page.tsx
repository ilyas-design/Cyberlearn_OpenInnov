"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import styles from "./contact.module.css";
import AnimateIn from "@/app/components/AnimateIn/AnimateIn";
import Page3DShell from "@/app/components/CyberBackground/Page3DShell";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simuler un envoi de formulaire
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }, 1500);
  };

  return (
    <Page3DShell variant="grid">
    <div className={styles.container}>
      <AnimateIn animation="fade-up">
        <div className={styles.header}>
          <h1 className={styles.title}>Contactez-nous</h1>
          <p className={styles.subtitle}>
            Vous avez des questions ou des suggestions ? N'hésitez pas à nous contacter.
          </p>
        </div>
      </AnimateIn>

      <div className={styles.contactContent}>
        <AnimateIn animation="fade-right" delay={100}>
        <div className={styles.contactInfo}>
          <h2 className={styles.infoTitle}>Informations de Contact</h2>
          
          <div className={styles.infoItem}>
            <Mail className={styles.infoIcon} />
            <div>
              <h3 className={styles.infoLabel}>Email</h3>
              <p className={styles.infoValue}>contact@cyberlearn.com</p>
            </div>
          </div>
          
          <div className={styles.infoItem}>
            <Phone className={styles.infoIcon} />
            <div>
              <h3 className={styles.infoLabel}>Téléphone</h3>
              <p className={styles.infoValue}>+33 1 23 45 67 89</p>
            </div>
          </div>
          
          <div className={styles.infoItem}>
            <MapPin className={styles.infoIcon} />
            <div>
              <h3 className={styles.infoLabel}>Adresse</h3>
              <p className={styles.infoValue}>
                123 Avenue de la Cybersécurité<br />
                75000 Paris, France
              </p>
            </div>
          </div>
          
          <div className={styles.socialLinks}>
            <h3 className={styles.socialTitle}>Suivez-nous</h3>
            <div className={styles.socialIcons}>
              {/* Placeholder pour les icônes sociales */}
              <div className={styles.socialIcon}>FB</div>
              <div className={styles.socialIcon}>TW</div>
              <div className={styles.socialIcon}>LI</div>
              <div className={styles.socialIcon}>IG</div>
            </div>
          </div>
        </div>
        </AnimateIn>

        <AnimateIn animation="fade-left" delay={200}>
        <div className={styles.contactForm}>
          <h2 className={styles.formTitle}>Envoyez-nous un message</h2>
          
          {submitSuccess ? (
            <div className={styles.successMessage}>
              <p>Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.</p>
              <button 
                className={styles.newMessageButton}
                onClick={() => setSubmitSuccess(false)}
              >
                Envoyer un nouveau message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.formLabel}>Nom complet</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="subject" className={styles.formLabel}>Sujet</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={styles.formSelect}
                  required
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="question">Question générale</option>
                  <option value="support">Support technique</option>
                  <option value="partnership">Partenariat</option>
                  <option value="feedback">Retour d'expérience</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.formLabel}>Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={styles.formTextarea}
                  rows={5}
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    <Send size={18} />
                    Envoyer le message
                  </>
                )}
              </button>
              
              {submitError && <p className={styles.errorMessage}>{submitError}</p>}
            </form>
          )}
        </div>
        </AnimateIn>
      </div>
    </div>
    </Page3DShell>
  );
} 