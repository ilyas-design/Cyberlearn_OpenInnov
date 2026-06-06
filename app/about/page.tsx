"use client";

import React from "react";
import Image from "next/image";
import { Shield, Award, Users, BookOpen } from "lucide-react";
import styles from "./about.module.css";
import AnimateIn from "@/app/components/AnimateIn/AnimateIn";
import Page3DShell from "@/app/components/CyberBackground/Page3DShell";

const values = [
  {
    icon: Shield,
    title: "Protection",
    text: "Nous nous engageons à protéger les individus et les organisations en partageant les connaissances essentielles en cybersécurité.",
  },
  {
    icon: Award,
    title: "Excellence",
    text: "Nous visons l'excellence dans tous nos contenus éducatifs, en nous assurant qu'ils sont à jour et pertinents.",
  },
  {
    icon: Users,
    title: "Communauté",
    text: "Nous croyons en la force de la communauté et encourageons le partage des connaissances entre apprenants.",
  },
  {
    icon: BookOpen,
    title: "Éducation",
    text: "Nous sommes dédiés à fournir une éducation de qualité qui permet aux apprenants de développer des compétences pratiques.",
  },
];

export default function AboutPage() {
  return (
    <Page3DShell variant="grid">
    <div className={styles.container}>
      <AnimateIn animation="fade-up">
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Notre Mission</h1>
            <p className={styles.heroText}>
              CyberLearn a été fondé avec une vision claire : rendre l'éducation en cybersécurité accessible à tous.
              Dans un monde de plus en plus connecté, nous croyons que la connaissance des principes de sécurité
              informatique est essentielle pour chaque individu et organisation.
            </p>
          </div>
        </section>
      </AnimateIn>

      <section className={styles.values}>
        <AnimateIn animation="fade-up">
          <h2 className={styles.sectionTitle}>Nos Valeurs</h2>
        </AnimateIn>
        <div className={styles.valuesGrid}>
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <AnimateIn key={value.title} animation="scale" delay={index * 100}>
                <div className={styles.valueCard}>
                  <Icon className={styles.valueIcon} />
                  <h3 className={styles.valueTitle}>{value.title}</h3>
                  <p className={styles.valueText}>{value.text}</p>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </section>

      <section className={styles.story}>
        <AnimateIn animation="fade-up">
          <h2 className={styles.sectionTitle}>Notre Histoire</h2>
        </AnimateIn>
        <div className={styles.storyContent}>
          <AnimateIn animation="fade-right" delay={100}>
            <div className={styles.storyText}>
              <p>
                CyberLearn a été fondé en 2020 par Sophie Martin, une experte en cybersécurité passionnée par l'éducation.
                Face à l'augmentation des cybermenaces et au manque de ressources éducatives accessibles,
                Sophie a décidé de créer une plateforme qui rendrait l'apprentissage de la cybersécurité
                accessible à tous, des débutants aux professionnels.
              </p>
              <p>
                Au fil des années, CyberLearn s'est développé pour devenir une référence dans le domaine de
                l'éducation en cybersécurité, avec une communauté grandissante d'apprenants et d'experts.
                Notre équipe s'est agrandie, mais notre mission reste la même : démocratiser l'accès aux
                connaissances en cybersécurité pour un monde numérique plus sûr.
              </p>
            </div>
          </AnimateIn>
          <AnimateIn animation="fade-left" delay={200}>
            <div className={styles.storyImageContainer}>
              <Image
                src="/Images/White_log.png"
                alt="Logo CyberLearn"
                width={200}
                height={200}
                className={styles.storyImagePlaceholder}
                priority
              />
            </div>
          </AnimateIn>
        </div>
      </section>
    </div>
    </Page3DShell>
  );
}
