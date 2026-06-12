export const PREDEFINED_RESPONSES: Record<string, { fr: string; en: string }> = {
  "Comment débuter en cybersécurité ?": {
    fr: "Nous vous recommandons de commencer par les cours de base dans la section 'Fondamentaux de la Cybersécurité'. Vous y apprendrez les concepts essentiels et les bonnes pratiques.",
    en: "We recommend starting with the foundational courses in the 'Cybersecurity Fundamentals' section. You'll learn essential concepts and best practices there.",
  },
  "Quels sont les prérequis techniques ?": {
    fr: "Pour suivre nos cours, vous devez avoir des connaissances de base en informatique et en réseaux. Une familiarité avec Linux est un plus, mais nous proposons aussi une introduction à ces outils.",
    en: "To follow our courses, you need basic computer and networking knowledge. Familiarity with Linux is a plus, but we also offer an introduction to these tools.",
  },
  "Je n'arrive pas à accéder à un cours": {
    fr: "Vérifiez que vous êtes bien connecté à votre compte. Si le problème persiste, vous pouvez contacter notre support technique via la page Contact.",
    en: "Make sure you are logged into your account. If the problem persists, contact our technical support via the Contact page.",
  },
  "Comment signaler un bug ?": {
    fr: "Si vous rencontrez un bug technique, merci de nous le signaler via la page Contact en précisant : la page concernée, les étapes pour reproduire le bug, et votre configuration.",
    en: "If you encounter a technical bug, please report it via the Contact page with: the affected page, steps to reproduce, and your configuration.",
  },
  "Où trouver les exercices pratiques ?": {
    fr: "Chaque leçon contient des exercices pratiques à la fin. Nous proposons aussi des labs virtuels dans la section 'Environnements d'entraînement'.",
    en: "Each lesson includes practical exercises at the end. We also offer virtual labs in the 'Training Environments' section.",
  },
  "Comment obtenir de l'aide ?": {
    fr: "Vous pouvez obtenir de l'aide de plusieurs façons : consulter notre FAQ, rejoindre notre forum communautaire, ou contacter directement notre équipe support.",
    en: "You can get help in several ways: check our FAQ, join our community forum, or contact our support team directly.",
  },
};

export const SUGGESTED_QUESTIONS = Object.keys(PREDEFINED_RESPONSES);

export function buildChatbotPrompt(message: string, locale: "fr" | "en"): string {
  const systemPrompt =
    locale === "fr"
      ? `Tu es l'assistant virtuel de CyberLearn, une plateforme d'apprentissage en cybersécurité.
Réponds en français, de manière claire et concise.
Aide les utilisateurs avec : les cours et leçons, les prérequis techniques, l'accès aux exercices, les problèmes de compte, et le signalement de bugs.
Si tu ne sais pas, oriente l'utilisateur vers la page Contact.`
      : `You are CyberLearn's virtual assistant, a cybersecurity learning platform.
Reply in English, clearly and concisely.
Help users with: courses and lessons, technical prerequisites, access to exercises, account issues, and bug reporting.
If unsure, direct the user to the Contact page.`;

  return `${systemPrompt}\n\nUser question: ${message}`;
}

export function getFallbackResponse(message: string, locale: "fr" | "en"): string | null {
  const predefined = PREDEFINED_RESPONSES[message];
  if (predefined) {
    return predefined[locale];
  }

  return locale === "fr"
    ? "Le service de chat IA est momentanément indisponible. Essayez une question suggérée ci-dessous ou contactez-nous via la page Contact."
    : "The AI chat service is temporarily unavailable. Try a suggested question below or contact us via the Contact page.";
}
