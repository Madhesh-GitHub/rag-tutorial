
import fs from "fs";
import { PDFParse } from "pdf-parse";
import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";


// Load DOTENV
dotenv.config();

const ai = new GoogleGenAI( {apiKey: process.env.Gemini_Key});
const mongoClient = new MongoClient(process.env.MongoDB);


function createChunks(text, chunkSize, overlap){
    const cleanText = text.replace(/\s+/g, " ").trim();
    const chunks = [];
    let start = 0;
    while(start < cleanText.length){
        const end = Math.min(start + chunkSize, cleanText.length);
        chunks.push(cleanText.slice(start, end));
        start += chunkSize - overlap;
    }
    return chunks;
}


async function dataLoader(){
    try{
        console.log("Reading PDF...");
        const data = fs.readFileSync("./sample.pdf");
        const parser = new PDFParse({data: data});
        const parsedPDF = await parser.getText();
        // console.log(parsedPDF);

        const chunks = createChunks(parsedPDF.text, 600, 100);

        // load to mongodb
        await mongoClient.connect();
        const collectiion = mongoClient.db("rag-tutorial").collection("documents");

        for(let i = 0; i< chunks.length; i++){
            const chunk = chunks[i];

            const response = await ai.models.embedContent({model: "gemini-embedding-001", contents: chunk});
            const vector = response.embeddings[0].values;

            await collectiion.insertOne({
                chunkText : chunk,
                embedding : vector
            });
            console.log("Loaded chunk: ", i+1);
        }

    }
    catch(error){
        console.error("Error occured!", error);
    }
    finally{
        await mongoClient.close();
    }
}

dataLoader();