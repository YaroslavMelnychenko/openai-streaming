import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import Pusher from "pusher";

dotenv.config();

const app = express();
const port = 3000;

const pusher = new Pusher({
    appId: "",
    key: "",
    secret: "",
    cluster: "eu",
    useTLS: true
});

app.use(express.json());

app.post("/chat", async (req, res) => {
    try {
        
        const openai = new OpenAI(process.env.OPENAI_API_KEY);

        const stream = await openai.chat.completions.create({
            model: "gpt-4-1106-preview",
            messages: [{ role: "user", content: "Generate an article about any IT theme in ~500 symbols" }],
            stream: true,
        });

        res.send("OK");

        for await (const chunk of stream) {
            let message = chunk.choices[0]?.delta?.content || "";

            console.log(message);

            await pusher.trigger("openai", "new-response", {
                message
            });
        }
    } catch (err) {
        console.log(err);

        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});