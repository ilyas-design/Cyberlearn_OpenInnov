"use client";

import React from "react";
import Image from "next/image";
import { Shield, Award, Users, BookOpen } from "lucide-react";
import styles from "./about.module.css";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "TURNACO Jordan",
    role: "Developper Full Stack web site et database",
    bio: "Deuxieme année a l'ecole EPSI Paris Courbevoie",
    image: "/Images/jordan.png",
  },
  {
    id: 2,
    name: "LACHGAR Ilyas",
    role: "Developper Full Stack mobile",
    bio: "Deuxieme année a l'ecole EPSI Paris Courbevoie",
    image: "/Images/ilyas.png",
  },
];

export default function AboutPage() {
  return (
    <div className={styles.container}>
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

      <section className={styles.values}>
        <h2 className={styles.sectionTitle}>Nos Valeurs</h2>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <Shield className={styles.valueIcon} />
            <h3 className={styles.valueTitle}>Protection</h3>
            <p className={styles.valueText}>
              Nous nous engageons à protéger les individus et les organisations en partageant les connaissances essentielles en cybersécurité.
            </p>
          </div>

          <div className={styles.valueCard}>
            <Award className={styles.valueIcon} />
            <h3 className={styles.valueTitle}>Excellence</h3>
            <p className={styles.valueText}>
              Nous visons l'excellence dans tous nos contenus éducatifs, en nous assurant qu'ils sont à jour et pertinents.
            </p>
          </div>

          <div className={styles.valueCard}>
            <Users className={styles.valueIcon} />
            <h3 className={styles.valueTitle}>Communauté</h3>
            <p className={styles.valueText}>
              Nous croyons en la force de la communauté et encourageons le partage des connaissances entre apprenants.
            </p>
          </div>

          <div className={styles.valueCard}>
            <BookOpen className={styles.valueIcon} />
            <h3 className={styles.valueTitle}>Éducation</h3>
            <p className={styles.valueText}>
              Nous sommes dédiés à fournir une éducation de qualité qui permet aux apprenants de développer des compétences pratiques.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.story}>
        <h2 className={styles.sectionTitle}>Notre Histoire</h2>
        <div className={styles.storyContent}>
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
        </div>
      </section>

      <section className={styles.team}>
        <h2 className={styles.sectionTitle}>Notre Équipe</h2>
        <div className={styles.teamGrid}>
          {teamMembers.map((member) => (
            <div key={member.id} className={styles.teamCard}>
              <div className={styles.memberImageContainer}>
                <Image
                  src={member.image}
                  alt={member.name}
                  width={200}
                  height={200}
                  className={styles.memberImage}
                  priority
                />
              </div>
              <h3 className={styles.memberName}>{member.name}</h3>
              <p className={styles.memberRole}>{member.role}</p>
              <p className={styles.memberBio}>{member.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 