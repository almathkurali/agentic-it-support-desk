import os
from dotenv import load_dotenv
from rag.embedding_client import create_embedding

load_dotenv()

print("Script started")
print("Key loaded:", os.getenv("OPENAI_API_KEY") is not None)

embedding = create_embedding("wifi not working")

print("Embedding length:", len(embedding))
print("First 5 values:", embedding[:5])