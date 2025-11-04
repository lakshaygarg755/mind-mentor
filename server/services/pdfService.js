import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ChatGroq } from '@langchain/groq';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import transformersEmbeddings from './transformersEmbeddings.js';

dotenv.config();

// Initialize cache with 1 hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

// Initialize Groq
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  modelName: "llama-3.3-70b-versatile",
});

// Custom embeddings class that uses Transformers.js
class TransformersEmbeddingsAdapter {
  constructor() {
    this.transformersService = transformersEmbeddings;
  }

  async embedDocuments(texts) {
    try {
      const embeddings = await this.transformersService.embedDocuments(texts);
      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }

  async embedQuery(text) {
    try {
      const embeddings = await this.transformersService.embedQuery(text);
      return embeddings;
    } catch (error) {
      console.error('Error generating query embedding:', error);
      throw new Error(`Failed to generate query embedding: ${error.message}`);
    }
  }
}

// Initialize embeddings with Transformers.js service
const embeddings = new TransformersEmbeddingsAdapter();

// Vector store to hold embeddings
const vectorStores = new Map();

// Clean up old vector stores periodically to prevent memory leaks
setInterval(() => {
  if (vectorStores.size > 10) { // Keep max 10 PDFs in memory
    const oldestKey = vectorStores.keys().next().value;
    vectorStores.delete(oldestKey);
    console.log('🧹 Cleaned up old vector store to free memory');
  }
}, 300000); // Run every 5 minutes

// Define uploads directory path
const uploadsDir = path.join(process.cwd(), 'uploads');

// PDF parsing options for better performance
const PDF_OPTIONS = {
  pagerender: function(pageData) {
    return pageData.getTextContent().then(function(textContent) {
      let lastY, text = '';
      for (const item of textContent.items) {
        if (lastY == item.transform[5] || !lastY) {
          text += item.str;
        } else {
          text += '\n' + item.str;
        }
        lastY = item.transform[5];
      }
      return text;
    });
  },
  max: 0,
  version: 'v2.0.550'
};

// Define RAG prompt template - CHILD-FRIENDLY VERSION
const promptTemplate = ChatPromptTemplate.fromTemplate(`
You are a friendly, helpful AI teacher who loves helping kids learn! You explain things in a fun, simple way that children can easily understand. Always use kind, encouraging words and make learning exciting!

Context from the document:
{context}

Question: {question}

IMPORTANT RULES FOR CHILD-FRIENDLY RESPONSES:

1. LANGUAGE STYLE:
   - Use simple, everyday words instead of big, complicated ones
   - Talk like a friendly teacher or big sibling
   - Be encouraging and positive - say things like "Great question!" or "You're doing awesome!"
   - Use short sentences and easy explanations
   - Avoid scary or confusing technical terms

2. EXPLANATION METHOD:
   - Compare complex ideas to things kids know (like comparing atoms to tiny balls)
   - Use fun examples from everyday life
   - Break down big ideas into small, bite-sized pieces
   - Ask gentle questions to help kids think (like "Can you imagine...?")
   - Use words like "imagine," "picture this," or "think about"

3. RESPONSE STRUCTURE:
   - Start with a happy, direct answer
   - Explain step by step like telling a story
   - Use fun emojis and friendly formatting
   - End with something encouraging

4. SAFETY & APPROPRIATENESS:
   - Never use words that could scare or confuse children
   - Keep everything positive and age-appropriate
   - If something is tricky, say "This part is a bit grown-up, but here's what it means..."
   - Always be truthful but gentle

5. LEARNING FOCUS:
   - Help kids feel smart and capable
   - Connect new ideas to things they already know
   - Make learning feel like an adventure
   - Celebrate curiosity and questions

FORMAT YOUR CHILD-FRIENDLY RESPONSE:

🌟 Answer:
[Give a clear, happy answer right away]

📖 Let's Learn More:
[Explain in simple, fun ways with examples kids understand]

✨ Fun Facts:
[Share 2-3 cool, interesting things from the document]

📍 Where I Found This:
[Tell them which page(s) in the book/document]

🎉 You're Amazing!
[End with encouragement and maybe suggest what to explore next]

Remember: You're talking to a child who wants to learn and have fun! Make every answer feel like a friendly chat with a favorite teacher.

Answer: `);

// Ensure uploads directory exists
async function ensureUploadsDirectory() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    console.error('Error creating uploads directory:', err);
    throw new Error(`Failed to create uploads directory: ${err.message}`);
  }
}

/**
 * Process PDF file or buffer and create embeddings
 */
export async function processPdf(input) {
  try {
    let buffer;
    
    if (Buffer.isBuffer(input)) {
      buffer = input;
    } else {
      const normalizedPath = path.normalize(input);
      const uploadsPath = path.normalize(uploadsDir);
      
      if (!normalizedPath.startsWith(uploadsPath)) {
        throw new Error('Invalid file path. Files must be in the uploads directory.');
      }

      try {
        await fs.access(normalizedPath);
      } catch {
        throw new Error(`PDF file not found at path: ${normalizedPath}`);
      }

      buffer = await fs.readFile(normalizedPath);
    }

    // Parse PDF with optimized options
    const data = await pdfParse(buffer, PDF_OPTIONS);

    if (!data || !data.text) {
      throw new Error('PDF parsing resulted in no text content');
    }

    // Get the text content per page
    const pages = data.text.split(/\f/); // Split by form feed character which typically separates PDF pages

    // Split text into optimized chunks with page tracking
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 100,
      separators: ['\n\n', '\n', '. ', ' ', ''],
      lengthFunction: (text) => text.length,
    });

    // Process each page separately to maintain page numbers
    let documentChunks = [];
    for (let pageNum = 0; pageNum < pages.length; pageNum++) {
      const pageText = pages[pageNum];
      if (!pageText.trim()) continue; // Skip empty pages
      
      const pageChunks = await textSplitter.createDocuments([pageText]);
      const pageChunksWithMetadata = pageChunks.map(chunk => ({
        text: chunk.pageContent,
        metadata: {
          pageNumber: pageNum + 1,
          location: `page_${pageNum + 1}`
        }
      }));
      
      documentChunks = documentChunks.concat(pageChunksWithMetadata);
    }

    return {
      documentChunks,
      pageCount: data.numpages
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error(`Failed to process PDF document: ${error.message}`);
  }
}

/**
 * Chat with PDF using RAG
 */
export async function chatWithPdf(pdfInput, question, chatHistory = []) {
  try {
    let buffer;
    if (Buffer.isBuffer(pdfInput)) {
      buffer = pdfInput;
    } else {
      buffer = base64ToBuffer(pdfInput);
    }

    // Generate a hash of the PDF content for caching
    const crypto = await import('crypto');
    const pdfHash = crypto.createHash('md5').update(buffer).digest('hex');
    
    // Check if we have a cached vector store for this PDF
    let vectorStore = vectorStores.get(pdfHash);
    
    if (!vectorStore) {
      console.log('🔄 Creating new vector store for PDF...');
      
      // Process the PDF to get chunks
      const { documentChunks } = await processPdf(buffer);

      // Convert chunks to the format expected by the vector store
      const vectorStoreDocuments = documentChunks.map(chunk => ({
        pageContent: chunk.text,
        metadata: chunk.metadata
      }));

      // Create vector store from chunks using Transformers.js embeddings
      vectorStore = await MemoryVectorStore.fromDocuments(
        vectorStoreDocuments,
        embeddings
      );
      
      // Cache the vector store
      vectorStores.set(pdfHash, vectorStore);
      console.log('✅ Vector store created and cached');
    } else {
      console.log('✅ Using cached vector store');
    }

    // Cache key for the query
    const cacheKey = `pdf_query_${pdfHash}_${question}_${chatHistory.length}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log('✅ Using cached query result');
      return cachedResult;
    }

    // Retrieve relevant documents
    const retrievedDocs = await vectorStore.similaritySearch(question, 3);
    
    // Format documents content
    const context = retrievedDocs.map(doc => doc.pageContent).join('\n\n');

    // Create the RAG chain
    const chain = RunnableSequence.from([
      {
        context: () => context,
        question: (input) => input.question
      },
      promptTemplate,
      model,
      new StringOutputParser()
    ]);

    // Generate response
    const response = await chain.invoke({
      question: question
    });

    // Extract source pages
    const sourcePages = [...new Set(
      retrievedDocs.map(doc => doc.metadata.pageNumber)
    )].sort((a, b) => a - b);

    // Format sources for MongoDB storage
    const formattedSources = retrievedDocs.map(doc => ({
      page: doc.metadata.pageNumber,
      content: doc.pageContent.substring(0, 150) + '...' // Preview of content
    }));

    const result = {
      answer: response,
      sourcePages: sourcePages,
      sources: formattedSources
    };

    // Cache the result
    cache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error in PDF chat:', error);
    throw error;
  }
}

/**
 * Clean up uploaded file
 */
export async function cleanupFile(filePath) {
  try {
    const normalizedPath = path.normalize(filePath);
    await fs.unlink(normalizedPath);
    vectorStores.delete(normalizedPath);
  } catch (error) {
    console.error('Error cleaning up file:', error);
    // Don't throw error for cleanup failures
  }
}

// Initialize uploads directory when module loads
ensureUploadsDirectory().catch(console.error);
