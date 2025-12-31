"""
RAG (Retrieval-Augmented Generation) Engine for Meeting Chat
Handles document chunking, embedding, vector storage, and retrieval.
"""
import os
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import openai
from dotenv import load_dotenv

load_dotenv()

class MeetingRAGEngine:
    """RAG Engine for querying meeting transcripts"""
    
    def __init__(self, persist_directory: str = "./chroma_db"):
        """
        Initialize RAG Engine with ChromaDB and Sentence Transformer
        
        Args:
            persist_directory: Directory to persist ChromaDB collections
        """
        print("🔧 Initializing RAG Engine...")
        
        # Initialize ChromaDB client (persistent)
        self.client = chromadb.Client(Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory=persist_directory
        ))
        
        # Initialize Sentence Transformer for embeddings (free, local)
        # all-MiniLM-L6-v2: Fast, 384 dimensions, good for semantic search
        print("   📦 Loading embedding model (all-MiniLM-L6-v2)...")
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # OpenAI API key (optional - for GPT-based answers)
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
            print("   ✅ OpenAI API configured")
        else:
            print("   ⚠️  OpenAI API key not found - using retrieval-only mode")
        
        print("✅ RAG Engine initialized")
    
    def chunk_transcript(
        self, 
        transcript_segments: List[Dict[str, Any]], 
        chunk_size: int = 500, 
        overlap: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Chunk transcript into overlapping pieces for better retrieval
        
        Args:
            transcript_segments: List of segments with speaker, text, timestamp
            chunk_size: Target size for each chunk (characters)
            overlap: Character overlap between chunks
            
        Returns:
            List of chunks with metadata (speaker, timestamp, text)
        """
        chunks = []
        current_chunk = ""
        current_speakers = set()
        start_time = None
        end_time = None
        
        for segment in transcript_segments:
            speaker = segment.get("speaker", "Unknown")
            text = segment.get("text", "")
            timestamp = segment.get("timestamp", segment.get("start", 0))
            
            # Initialize start time for first segment
            if start_time is None:
                start_time = timestamp
            
            # Add segment to current chunk
            segment_text = f"[{speaker}]: {text}\n"
            current_chunk += segment_text
            current_speakers.add(speaker)
            end_time = timestamp
            
            # If chunk exceeds size, save it and start new one
            if len(current_chunk) >= chunk_size:
                chunks.append({
                    "text": current_chunk.strip(),
                    "speakers": list(current_speakers),
                    "start_time": start_time,
                    "end_time": end_time,
                    "chunk_id": len(chunks)
                })
                
                # Create overlap: keep last 'overlap' characters
                if overlap > 0 and len(current_chunk) > overlap:
                    current_chunk = current_chunk[-overlap:]
                else:
                    current_chunk = ""
                    current_speakers = set()
                    start_time = None
        
        # Add remaining chunk
        if current_chunk.strip():
            chunks.append({
                "text": current_chunk.strip(),
                "speakers": list(current_speakers),
                "start_time": start_time,
                "end_time": end_time,
                "chunk_id": len(chunks)
            })
        
        print(f"   📄 Created {len(chunks)} chunks from transcript")
        return chunks
    
    def embed_chunks(self, chunks: List[Dict[str, Any]]) -> List[List[float]]:
        """
        Generate embeddings for text chunks
        
        Args:
            chunks: List of chunk dictionaries with 'text' field
            
        Returns:
            List of embedding vectors
        """
        texts = [chunk["text"] for chunk in chunks]
        embeddings = self.embedding_model.encode(texts, show_progress_bar=True)
        return embeddings.tolist()
    
    def index_meeting(self, meeting_id: str, transcript_segments: List[Dict[str, Any]]):
        """
        Index a meeting transcript for RAG queries
        
        Args:
            meeting_id: Unique meeting identifier
            transcript_segments: List of transcript segments with speaker/text/timestamp
        """
        print(f"🔍 Indexing meeting {meeting_id} for RAG...")
        
        # 1. Chunk the transcript
        chunks = self.chunk_transcript(transcript_segments)
        
        if not chunks:
            print("   ⚠️  No chunks created - transcript may be empty")
            return
        
        # 2. Generate embeddings
        print("   🧮 Generating embeddings...")
        embeddings = self.embed_chunks(chunks)
        
        # 3. Create or get collection
        collection_name = f"meeting_{meeting_id}"
        try:
            # Delete if exists (for re-indexing)
            self.client.delete_collection(name=collection_name)
        except:
            pass
        
        collection = self.client.create_collection(
            name=collection_name,
            metadata={"meeting_id": meeting_id}
        )
        
        # 4. Upsert chunks to ChromaDB
        print("   💾 Storing in vector database...")
        collection.add(
            ids=[f"chunk_{i}" for i in range(len(chunks))],
            embeddings=embeddings,
            documents=[chunk["text"] for chunk in chunks],
            metadatas=[
                {
                    "chunk_id": chunk["chunk_id"],
                    "speakers": ",".join(chunk["speakers"]),
                    "start_time": chunk["start_time"],
                    "end_time": chunk["end_time"],
                    "meeting_id": meeting_id
                }
                for chunk in chunks
            ]
        )
        
        print(f"✅ Indexed {len(chunks)} chunks for meeting {meeting_id}")
    
    def query_meeting(
        self, 
        meeting_id: str, 
        question: str, 
        top_k: int = 3
    ) -> Dict[str, Any]:
        """
        Query a meeting transcript using semantic search
        
        Args:
            meeting_id: Meeting identifier
            question: User's question
            top_k: Number of most relevant chunks to retrieve
            
        Returns:
            Dict with answer, sources, and citations
        """
        collection_name = f"meeting_{meeting_id}"
        
        try:
            collection = self.client.get_collection(name=collection_name)
        except:
            return {
                "error": "Meeting not indexed",
                "message": f"No RAG index found for meeting {meeting_id}"
            }
        
        # 1. Embed the question
        question_embedding = self.embedding_model.encode([question])[0].tolist()
        
        # 2. Retrieve top-k most similar chunks
        results = collection.query(
            query_embeddings=[question_embedding],
            n_results=top_k
        )
        
        # 3. Extract context
        contexts = results["documents"][0] if results["documents"] else []
        metadatas = results["metadatas"][0] if results["metadatas"] else []
        
        if not contexts:
            return {
                "answer": "I couldn't find any relevant information in the meeting transcript.",
                "sources": [],
                "question": question
            }
        
        # 4. Build citations
        sources = []
        for i, (context, meta) in enumerate(zip(contexts, metadatas)):
            sources.append({
                "chunk_id": meta.get("chunk_id"),
                "text": context[:200] + "..." if len(context) > 200 else context,
                "speakers": meta.get("speakers", "").split(","),
                "timestamp": meta.get("start_time", 0),
                "relevance_rank": i + 1
            })
        
        # 5. Generate answer with LLM (if available)
        if self.openai_api_key:
            answer = self._generate_answer_with_llm(question, contexts)
        else:
            # Fallback: Return most relevant context as answer
            answer = f"Here's what was discussed:\n\n{contexts[0][:500]}"
        
        return {
            "answer": answer,
            "sources": sources,
            "question": question,
            "meeting_id": meeting_id
        }
    
    def _generate_answer_with_llm(self, question: str, contexts: List[str]) -> str:
        """
        Generate answer using OpenAI GPT with retrieved context
        
        Args:
            question: User's question
            contexts: Retrieved context chunks
            
        Returns:
            Generated answer
        """
        # Construct prompt with context
        context_text = "\n\n---\n\n".join(contexts)
        
        prompt = f"""You are an AI assistant helping users understand their meeting transcripts. 
Answer the user's question based ONLY on the provided context. If the answer is not in the context, say so clearly.

Context from meeting:
{context_text}

Question: {question}

Answer:"""
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful meeting assistant. Answer questions based only on the provided meeting context."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=300
            )
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            print(f"❌ LLM generation error: {e}")
            # Fallback to context-only answer
            return f"Based on the meeting transcript:\n\n{contexts[0][:400]}"
    
    def delete_meeting_index(self, meeting_id: str):
        """
        Delete the RAG index for a meeting
        
        Args:
            meeting_id: Meeting identifier
        """
        collection_name = f"meeting_{meeting_id}"
        try:
            self.client.delete_collection(name=collection_name)
            print(f"🗑️  Deleted RAG index for meeting {meeting_id}")
        except Exception as e:
            print(f"⚠️  Could not delete index: {e}")


# Global RAG engine instance (singleton)
_rag_engine = None

def get_rag_engine() -> MeetingRAGEngine:
    """Get or create global RAG engine instance"""
    global _rag_engine
    if _rag_engine is None:
        _rag_engine = MeetingRAGEngine()
    return _rag_engine
