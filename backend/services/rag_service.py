"""
AgriSense Agricultural RAG Service
Retrieves verified static tomato agronomic knowledge, disease etiology, and threshold literature.
"""

from typing import List, Dict, Any
from services.knowledge_base import query_knowledge_base, TOMATO_KNOWLEDGE_DOCS

def retrieve_agronomy_knowledge(query: str, top_k: int = 2) -> List[Dict[str, Any]]:
    """
    Queries the verified static agricultural knowledge base for the given topic.
    """
    return query_knowledge_base(query=query, top_k=top_k)

def get_all_topics() -> List[str]:
    """
    Returns list of indexed agricultural knowledge topics.
    """
    return [doc["topic"] for doc in TOMATO_KNOWLEDGE_DOCS]
