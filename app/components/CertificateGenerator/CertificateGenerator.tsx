'use client';

import { useRef } from 'react';
import { Award, Download } from 'lucide-react';
import styles from './CertificateGenerator.module.css';
import toast from 'react-hot-toast';

interface CertificateGeneratorProps {
    userName: string;
    courseName: string;
    completionDate: Date;
    level: number;
    totalLessons: number;
}

export default function CertificateGenerator({
    userName,
    courseName,
    completionDate,
    level,
    totalLessons
}: CertificateGeneratorProps) {
    const certificateRef = useRef<HTMLDivElement>(null);

    const downloadCertificate = async () => {
        if (!certificateRef.current) return;

        try {
            // Méthode simple: utiliser html2canvas (à ajouter aux dépendances si besoin)
            // Pour l'instant, on va créer une version basique avec window.print

            // Créer une nouvelle fenêtre pour l'impression
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                toast.error('Veuillez autoriser les pop-ups pour télécharger le certificat');
                return;
            }

            const certificateHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Certificat - ${courseName}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;700&display=swap');
                        
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 2rem;
                        }
                        
                        .certificate {
                            width: 800px;
                            background: white;
                            padding: 3rem;
                            border: 15px solid #0024FF;
                            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                            position: relative;
                        }
                        
                        .certificate::before {
                            content: '';
                            position: absolute;
                            top: 20px;
                            left: 20px;
                            right: 20px;
                            bottom: 20px;
                            border: 2px solid #0AFFD4;
                        }
                        
                        .header {
                            text-align: center;
                            margin-bottom: 2rem;
                        }
                        
                        .logo {
                            font-size: 3rem;
                            color: #0024FF;
                            margin-bottom: 1rem;
                        }
                        
                        .title {
                            font-family: 'Playfair Display', serif;
                            font-size: 2.5rem;
                            color: #0024FF;
                            margin-bottom: 0.5rem;
                            letter-spacing: 2px;
                        }
                        
                        .subtitle {
                            font-family: 'Lato', sans-serif;
                            font-size: 1.2rem;
                            color: #666;
                            letter-spacing: 1px;
                        }
                        
                        .content {
                            text-align: center;
                            margin: 3rem 0;
                            font-family: 'Lato', sans-serif;
                        }
                        
                        .content p {
                            font-size: 1.1rem;
                            color: #333;
                            margin-bottom: 1.5rem;
                            line-height: 1.8;
                        }
                        
                        .userName {
                            font-family: 'Playfair Display', serif;
                            font-size: 2.5rem;
                            color: #0024FF;
                            margin: 2rem 0;
                            border-bottom: 2px solid #0AFFD4;
                            display: inline-block;
                            padding-bottom: 0.5rem;
                        }
                        
                        .courseName {
                            font-size: 1.5rem;
                            font-weight: bold;
                            color: #0024FF;
                            margin: 1.5rem 0;
                        }
                        
                        .details {
                            display: flex;
                            justify-content: space-around;
                            margin: 3rem 0;
                            padding: 1.5rem;
                            background: linear-gradient(135deg, rgba(0, 36, 255, 0.05), rgba(10, 255, 212, 0.05));
                            border-radius: 10px;
                        }
                        
                        .detail {
                            text-align: center;
                        }
                        
                        .detailLabel {
                            font-size: 0.9rem;
                            color: #666;
                            margin-bottom: 0.5rem;
                        }
                        
                        .detailValue {
                            font-size: 1.3rem;
                            font-weight: bold;
                            color: #0024FF;
                        }
                        
                        .footer {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-end;
                            margin-top: 3rem;
                            padding-top: 2rem;
                            border-top: 2px solid #0AFFD4;
                        }
                        
                        .signature {
                            text-align: center;
                        }
                        
                        .signatureLine {
                            width: 200px;
                            border-top: 2px solid #333;
                            margin-bottom: 0.5rem;
                        }
                        
                        .signatureName {
                            font-weight: bold;
                            color: #333;
                        }
                        
                        .signatureTitle {
                            font-size: 0.9rem;
                            color: #666;
                        }
                        
                        .seal {
                            width: 100px;
                            height: 100px;
                            border: 3px solid #0024FF;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 2rem;
                            color: #0024FF;
                        }
                        
                        @media print {
                            body {
                                background: white;
                            }
                            .certificate {
                                box-shadow: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="certificate">
                        <div class="header">
                            <div class="logo">🎓</div>
                            <h1 class="title">CERTIFICAT</h1>
                            <p class="subtitle">DE RÉUSSITE</p>
                        </div>
                        
                        <div class="content">
                            <p>Ce certificat est décerné à</p>
                            <div class="userName">${userName}</div>
                            <p>Pour avoir complété avec succès</p>
                            <div class="courseName">${courseName}</div>
                            
                            <div class="details">
                                <div class="detail">
                                    <div class="detailLabel">Date de Completion</div>
                                    <div class="detailValue">${completionDate.toLocaleDateString('fr-FR')}</div>
                                </div>
                                <div class="detail">
                                    <div class="detailLabel">Niveau Atteint</div>
                                    <div class="detailValue">Niveau ${level}</div>
                                </div>
                                <div class="detail">
                                    <div class="detailLabel">Leçons Complétées</div>
                                    <div class="detailValue">${totalLessons}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <div class="signature">
                                <div class="signatureLine"></div>
                                <div class="signatureName">Direction CyberLearn</div>
                                <div class="signatureTitle">Directeur Pédagogique</div>
                            </div>
                            <div class="seal">
                                🏆
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(certificateHTML);
            printWindow.document.close();

            // Attendre que le contenu soit chargé
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    toast.success('Certificat prêt à être téléchargé !');
                }, 500);
            };

        } catch (error) {
            console.error('Erreur lors de la génération du certificat:', error);
            toast.error('Erreur lors de la génération du certificat');
        }
    };

    return (
        <div className={styles.certificateContainer}>
            <div className={styles.certificatePreview} ref={certificateRef}>
                <div className={styles.certificateCard}>
                    <div className={styles.certificateHeader}>
                        <Award size={48} className={styles.icon} />
                        <h2 className={styles.title}>Certificat de Réussite</h2>
                    </div>

                    <div className={styles.certificateBody}>
                        <p className={styles.text}>Ce certificat atteste que</p>
                        <h3 className={styles.userName}>{userName}</h3>
                        <p className={styles.text}>a complété avec succès</p>
                        <h4 className={styles.courseName}>{courseName}</h4>

                        <div className={styles.details}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Date:</span>
                                <span className={styles.detailValue}>
                                    {completionDate.toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Niveau:</span>
                                <span className={styles.detailValue}>{level}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Leçons:</span>
                                <span className={styles.detailValue}>{totalLessons}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                className={styles.downloadButton}
                onClick={downloadCertificate}
            >
                <Download size={20} />
                Télécharger le Certificat
            </button>
        </div>
    );
}
