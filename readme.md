<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:4285F4,100:47A248&height=200&section=header&text=MK%20CODE%20CLUB&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=RAG%20Tutorial&descAlignY=58&descSize=22" width="100%"/>

<a href="https://www.youtube.com/@MKCodeClub">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&pause=1000&color=4285F4&center=true&vCenter=true&width=650&lines=Retrieval-Augmented+Generation+(RAG)+Tutorial;Build+a+PDF+Question-Answering+Chatbot;Google+Gemini+%2B+MongoDB+Atlas+Vector+Search" alt="Typing SVG" />
</a>

<br/>

[![YouTube](https://img.shields.io/badge/YouTube-MK%20CODE%20CLUB-red?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@MKCodeClub)
[![Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Vector%20Search-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
[![License](https://img.shields.io/badge/License-Learning%20Purpose-lightgrey?style=for-the-badge)](#license)

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:4285F4,100:47A248&height=3&width=1000" width="100%"/>

</div>

<br/>

## Overview

This project turns a PDF into a question-answering chatbot. It walks through the complete RAG pipeline, end to end:

1. Read text from a PDF document
2. Split the text into overlapping chunks
3. Generate a Gemini embedding for every chunk
4. Store the chunks and embeddings in MongoDB
5. Embed a user's question
6. Retrieve the most relevant chunks with MongoDB Atlas Vector Search
7. Ask Gemini to answer using the retrieved context

```text
sample.pdf
    |
    v
Chunk text -> Gemini embeddings -> MongoDB collection
                                          ^
                                          |
User question -> Gemini embedding -> Vector Search -> Gemini answer
```

<br/>

## Technologies

<div align="center">

| Tool | Purpose |
| :--: | :-- |
| [Google Gemini API](https://ai.google.dev/) | Embeddings and answer generation |
| [MongoDB Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/) | Vector storage and retrieval |
| [`@google/genai`](https://www.npmjs.com/package/@google/genai) | Gemini SDK |
| [`pdf-parse`](https://www.npmjs.com/package/pdf-parse) | PDF text extraction |
| [`dotenv`](https://www.npmjs.com/package/dotenv) | Environment configuration |

</div>

<br/>

## Project Structure

| File | Purpose |
| --- | --- |
| `knowledge_base.js` | Reads `sample.pdf`, chunks its text, creates embeddings, and loads documents into MongoDB |
| `main_rag_system.js` | Runs the interactive terminal chatbot and answers questions using vector retrieval |
| `package.json` | Project metadata and runtime dependencies |
| `.env` | Local API and database configuration — keep this file private |
| `sample.pdf` | The source document to index — add your own PDF to the project root |

<br/>

## Prerequisites

- A Google AI Studio API key with access to Gemini models and embeddings
- A MongoDB Atlas cluster with Vector Search enabled
- A PDF document to use as the knowledge base

<br/>

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your PDF

Place a PDF named `sample.pdf` in the project root, next to `knowledge_base.js`.

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
Gemini_Key=your_google_ai_studio_api_key
MongoDB=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
```

Do not commit `.env` or expose your API key and MongoDB connection string. The variable names are case-sensitive and must match the names used by the application.

### 4. Create the MongoDB vector index

The application uses database `rag-tutorial`, collection `documents`, and vector index name `vector_index`.

In MongoDB Atlas, open **Search & Vector Search** for the `documents` collection and create a vector search index with this definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 3072,
      "similarity": "cosine"
    }
  ]
}
```

Name the index `vector_index` and wait until its status is **Ready**. The `numDimensions` value matches the `gemini-embedding-001` embeddings used by this project. If you change the embedding model, update the index dimensions to match the new model.

<br/>

## Running the Tutorial

Run the loader first — it creates a fresh set of document records in the `documents` collection:

```bash
node knowledge_base.js
```

Then start the question-answering chatbot:

```bash
node main_rag_system.js
```

Ask questions about the content of your PDF. Type `exit` to close the chatbot.

```text
Welcome to Document QA Bot

Ask question: What is this document about?
```

<br/>

## How It Works

### Ingestion

`knowledge_base.js` normalizes the extracted PDF text and splits it into chunks of 600 characters with a 100-character overlap. Each chunk is embedded with `gemini-embedding-001` and saved as:

```json
{
  "chunkText": "...",
  "embedding": [0.0123, -0.0456]
}
```

### Retrieval and Generation

When a question is submitted, `main_rag_system.js`:

- Creates an embedding for the question
- Uses MongoDB Vector Search to retrieve the three closest chunks
- Places those chunks into the prompt context
- Asks `gemini-3.6-flash` to answer from that context
- Returns a fallback response when the answer is not present in the retrieved context

<br/>

## Learning Goals

By following this tutorial, you will understand the core RAG pipeline and how its main stages connect:

- Document loading and text extraction
- Chunking and overlap
- Vector embeddings
- Semantic retrieval
- Context-grounded generation
- Building a simple terminal-based AI application

<br/>

## Course Resource

This repository supports the **RAG TUTORIAL** content on **MK CODE CLUB**.

Subscribe and follow the channel for more programming and AI tutorials: **[MK CODE CLUB on YouTube](https://www.youtube.com/@MKCodeClub)**

<br/>

## License

This project is provided for learning and tutorial purposes.

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:47A248,100:4285F4&height=100&section=footer" width="100%"/>
</div>
