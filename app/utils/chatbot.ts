import OpenAI from "openai";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";

/* Pick one of the Azure OpenAI models from the GitHub Models service */
const modelName = "gpt-4o-mini";

export async function main(userMessage: string) {
    const client = new OpenAI({ baseURL: endpoint, apiKey: token });

    try {
        const response = await client.chat.completions.create({
            messages: [
                { role: "system", content: "Vous êtes CyberLearn Assistant, un assistant spécialisé dans la cybersécurité. Vous aidez les utilisateurs à comprendre les concepts de cybersécurité et répondez à leurs questions de manière claire et pédagogique." },
                { role: "user", content: userMessage }
            ],
            model: modelName,
            temperature: 0.7,
            max_tokens: 500,
            top_p: 1
        });

        return response.choices[0].message.content;
    } catch (err) {
        console.error("The sample encountered an error:", err);
        return getFallbackResponse();
    }
}

function getFallbackResponse() {
    const fallbackResponses = [
        "Je suis désolé, je ne peux pas répondre à votre question pour le moment. Veuillez réessayer plus tard.",
        "Une erreur s'est produite. Pourriez-vous reformuler votre question ?",
        "Je rencontre des difficultés techniques. N'hésitez pas à contacter notre support si le problème persiste."
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}
