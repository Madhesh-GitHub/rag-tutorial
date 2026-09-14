# RAG Tutorial

An end-to-end Retrieval-Augmented Generation (RAG) example built with **Node.js**, **Google Gemini**, and **MongoDB Atlas Vector Search**.

This repository contains the course resources for **RAG TUTORIAL** from **MK CODE CLUB**.

[Watch MK CODE CLUB on YouTube](https://www.youtube.com/@MKCodeClub)

## What You Will Build

This project turns a PDF into a question-answering chatbot:

1. Read text from a PDF document.
2. Split the text into overlapping chunks.
3. Generate a Gemini embedding for every chunk.
4. Store the chunks and embeddings in MongoDB.
5. Embed a user's question.
6. Retrieve the most relevant chunks with MongoDB Atlas Vector Search.
7. Ask Gemini to answer using the retrieved context.

```text
sample.pdf
		|
		v
Chunk text -> Gemini embeddings -> MongoDB collection
																			^
																			|
User question -> Gemini embedding -> Vector Search -> Gemini answer
```

## Technologies

- [Node.js](https://nodejs.org/)
- [Google Gemini API](https://ai.google.dev/)
- [MongoDB Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [`@google/genai`](https://www.npmjs.com/package/@google/genai)
- [`pdf-parse`](https://www.npmjs.com/package/pdf-parse)
- [`dotenv`](https://www.npmjs.com/package/dotenv)

## Project Structure

| File | Purpose |
| --- | --- |
| `knowledge_base.js` | Reads `sample.pdf`, chunks its text, creates embeddings, and loads documents into MongoDB. |
| `main_rag_system.js` | Runs the interactive terminal chatbot and answers questions using vector retrieval. |
| `package.json` | Project metadata and runtime dependencies. |
| `.env` | Local API and database configuration. Keep this file private. |
| `sample.pdf` | The source document to index. Add your own PDF to the project root. |

## Prerequisites

- Node.js 18 or newer
- A Google AI Studio API key with access to Gemini models and embeddings
- A MongoDB Atlas cluster with Vector Search enabled
- A PDF document to use as the knowledge base

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

## Run the Tutorial

Run the loader first. It creates a fresh set of document records in the `documents` collection:

```bash
node knowledge_base.js
```

Then start the question-answering chatbot:

```bash
node main_rag_system.js
```

Ask questions about the content of your PDF. Type `exit` to close the chatbot.

Example:

```text
Welcome to Document QA Bot

Ask question: What is this document about?
```

## How It Works

### Ingestion

`knowledge_base.js` normalizes the extracted PDF text and splits it into chunks of 600 characters with a 100-character overlap. Each chunk is embedded with `gemini-embedding-001` and saved as:

```json
{
	"chunkText": "...",
	"embedding": [0.0123, -0.0456]
}
```

### Retrieval and generation

When a question is submitted, `main_rag_system.js`:

- Creates an embedding for the question.
- Uses MongoDB Vector Search to retrieve the three closest chunks.
- Places those chunks into the prompt context.
- Asks `gemini-3.6-flash` to answer from that context.
- Returns a fallback response when the answer is not present in the retrieved context.

## Troubleshooting

### `sample.pdf` cannot be found

Put a file named `sample.pdf` in the project root. The loader currently reads this exact relative path.

### MongoDB connection errors

Check `MongoDB` in `.env`, allow your IP address in MongoDB Atlas, and confirm that the database user has permission to read and write the `rag-tutorial` database.

### `$vectorSearch` or `vector_index` errors

Confirm that the index is created on `rag-tutorial.documents`, is named `vector_index`, uses the field path `embedding`, and is ready. Also verify that its dimensions match the embedding model.

### Gemini authentication or model errors

Check that `Gemini_Key` is present, valid, and available to the configured Gemini models. Restart the Node process after changing `.env`.

### Re-running ingestion creates duplicate data

The loader inserts documents and does not clear the collection first. To rebuild the knowledge base, delete the existing documents from the `documents` collection before running `node knowledge_base.js` again.

## Learning Goals

By following this tutorial, you will understand the core RAG pipeline and how its main stages connect:

- Document loading and text extraction
- Chunking and overlap
- Vector embeddings
- Semantic retrieval
- Context-grounded generation
- Building a simple terminal-based AI application

## Course Resource

This repository supports the **RAG TUTORIAL** content on **MK CODE CLUB**.

Subscribe and follow the channel for more programming and AI tutorials:

**[MK CODE CLUB on YouTube](https://www.youtube.com/@MKCodeClub)**

## License

This project is provided for learning and tutorial purposes.
