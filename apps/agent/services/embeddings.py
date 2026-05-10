import os
import logging
from functools import lru_cache
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

# ── Embedding Model (loaded once, lightweight ~80MB) ──────────────────────
_embedding_model: SentenceTransformer | None = None

def get_embedding_model() -> SentenceTransformer:
    """Returns a small, fast sentence-transformer for cosine similarity scoring."""
    global _embedding_model
    if _embedding_model is None:
        logger.info("Loading sentence-transformers/all-MiniLM-L6-v2 ...")
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("Embedding model loaded.")
    return _embedding_model


def compute_similarity(text_a: str, text_b: str) -> float:
    """Compute cosine similarity between two texts. Returns 0-100 score."""
    model = get_embedding_model()
    embeddings = model.encode([text_a, text_b], normalize_embeddings=True)
    # Dot product of normalized vectors = cosine similarity
    similarity = float(embeddings[0] @ embeddings[1])
    # Scale from [-1, 1] to [0, 100]
    return round(max(0, min(100, (similarity + 1) * 50)), 1)


# ── LLM Model (lazy-loaded, heavier ~2GB, only for resume optimization) ──
_llm_pipeline = None

def get_llm_pipeline():
    """Lazy-load a small HuggingFace text-generation pipeline."""
    global _llm_pipeline
    if _llm_pipeline is None:
        logger.info("Loading TinyLlama-1.1B-Chat (this may take a moment on first run)...")
        from transformers import pipeline
        _llm_pipeline = pipeline(
            "text-generation",
            model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
            torch_dtype="auto",
            device_map="cpu",
            max_new_tokens=512,
        )
        logger.info("TinyLlama LLM loaded.")
    return _llm_pipeline


def generate_text(prompt: str, max_tokens: int = 1024) -> str:
    """Generate text using the local LLM."""
    pipe = get_llm_pipeline()
    # TinyLlama uses ChatML format
    messages = [
        {"role": "system", "content": "You are a precise data extraction agent. You ONLY extract facts present in the text. You DO NOT invent or assume any information. If data is missing, leave it as an empty string or empty list."},
        {"role": "user", "content": prompt},
    ]
    try:
        # do_sample=False makes the output deterministic (greedy decoding), reducing hallucinations.
        result = pipe(messages, max_new_tokens=max_tokens, do_sample=False)
        generated = result[0]["generated_text"]
        # The pipeline returns the full conversation; extract just the assistant's reply
        if isinstance(generated, list):
            # Chat format: list of message dicts
            for msg in reversed(generated):
                if msg.get("role") == "assistant":
                    return msg["content"]
            return str(generated[-1].get("content", ""))
        return str(generated)
    except Exception as e:
        logger.error(f"LLM generation error: {e}")
        return f"(Generation failed: {e})"


# ── Backward-compatible wrapper for existing code that calls get_llm() ──
class LocalLLMWrapper:
    """Mimics the LangChain LLM .invoke() interface using the local pipeline."""
    def invoke(self, prompt: str):
        text = generate_text(prompt)
        return _LLMResult(text)

class _LLMResult:
    def __init__(self, content: str):
        self.content = content

class GeminiFallbackWrapper:
    """
    Tries Gemini first. On ANY runtime error (rate limits, network, etc),
    automatically falls back to local TinyLlama so the user never sees a failure.
    """
    def __init__(self, gemini_llm):
        self._gemini = gemini_llm
        self._local = LocalLLMWrapper()
    
    def invoke(self, prompt: str):
        try:
            result = self._gemini.invoke(prompt)
            return result
        except Exception as e:
            logger.warning(f"Gemini failed at runtime: {e}. Falling back to local TinyLlama.")
            return self._local.invoke(prompt)

def get_llm():
    """Returns a Gemini-with-fallback wrapper if API key is present, otherwise TinyLlama directly."""
    api_key = os.environ.get("GOOGLE_API_KEY")
    if api_key and not api_key.startswith("["):
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            logger.info("Using Gemini (with TinyLlama fallback) for LLM tasks.")
            gemini = ChatGoogleGenerativeAI(
                model="gemini-flash-latest",
                google_api_key=api_key,
                temperature=0,
                max_output_tokens=4096
            )
            return GeminiFallbackWrapper(gemini)
        except Exception as e:
            logger.warning(f"Failed to load Gemini: {e}. Using TinyLlama only.")
    
    return LocalLLMWrapper()

def get_embeddings():
    """Returns the sentence-transformer model for embeddings."""
    return get_embedding_model()
