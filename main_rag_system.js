

import readline from "readline";
import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({apiKey: process.env.Gemini_Key});
const mongoClient = new MongoClient(process.env.MongoDB);
const rl = readline.createInterface({input: process.stdin, output: process.stdout});


async function findRelevantChunks(collection, question){
    const qsEmbedding = await ai.models.embedContent({model:"gemini-embedding-001", contents: question});
    const qsVector = qsEmbedding.embeddings[0].values;

    const pipeline = [
        {
            $vectorSearch: {index: "vector_index", path: "embedding", queryVector: qsVector, numCandidates: 10, limit: 3  }
        },
        {
            $project: {_id: 0, chunkText: 1}
        }
    ]

    const results = await collection.aggregate(pipeline).toArray();
    return results;
}

async function askQuestion(collection, question){
    const retrievedChunks = await findRelevantChunks(collection, question);
    // console.log(retrievedChunks);
    const inString = retrievedChunks.map(chunk => chunk.chunkText).join("\n\n===\n\n");
    const prompt = `You are a intelligent chatbot for NovaTech. Answer the question based on the context that given below. If answer cannot be found in the given
    context, then say "I don't have the relevant information about the question"
    Context: ${inString}, User Question: ${question}, Answer:`;

    // gemini llm
    const gemini_response = await ai.models.generateContent({ model: "gemini-3.6-flash", contents: prompt});
    return gemini_response.text;
}

async function main(){
    await mongoClient.connect();
    const collection = mongoClient.db("rag-tutorial").collection("documents");
    console.log("\nWelcome to Document QA Bot\n");

    const promptUser = () =>{
        rl.question("Ask question: ", async(input) => {
            if(input.trim().toLowerCase() === "exit"){
                rl.close();
                return;
            }

            try{
                const answer = await askQuestion(collection, input);
                console.log("\nResponse: ", answer, "\n");

            }
            catch(error){
                console.log(error.message);
            }
            promptUser();
        });
    };
    promptUser();
}

main();