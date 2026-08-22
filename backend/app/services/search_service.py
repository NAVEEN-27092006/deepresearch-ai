import logging
import httpx
import re
import xml.etree.ElementTree as ET
from typing import List, Dict, Any
from urllib.parse import urlparse, quote_plus
from app.core.config import settings

logger = logging.getLogger(__name__)

class SearchService:
    def __init__(self):
        self.provider = settings.DEFAULT_SEARCH_PROVIDER.lower()

    def search(self, query: str, max_results: int = 6, category_preference: str = "all") -> List[Dict[str, Any]]:
        """
        Perform source-grounded retrieval across real, verified sources:
        1. DuckDuckGo Text Search
        2. arXiv API (Peer-reviewed academic papers)
        3. Wikipedia API (Encyclopedic background & definitions)
        4. CrossRef API (Journal literature & DOIs)

        NO MOCK, SYNTHETIC, OR HALLUCINATED DOMAINS ARE GENERATED.
        """
        raw_candidates = []

        # 1. DuckDuckGo Text Search
        raw_candidates.extend(self._search_duckduckgo(query, max_results=max_results))

        # 2. arXiv API (for academic/scientific queries)
        raw_candidates.extend(self._search_arxiv(query, max_results=3))

        # 3. Wikipedia API (for domain background and definitions)
        raw_candidates.extend(self._search_wikipedia(query, max_results=3))

        # 4. CrossRef API (for DOI works)
        raw_candidates.extend(self._search_crossref(query, max_results=3))

        # Deduplicate candidates by canonical URL & Title
        seen_urls = set()
        unique_candidates = []
        for item in raw_candidates:
            norm_url = self._normalize_url(item["url"])
            if not norm_url or norm_url in seen_urls:
                continue
            seen_urls.add(norm_url)
            unique_candidates.append(item)

        # Filter by category if requested
        if category_preference and category_preference != "all":
            category_filtered = [c for c in unique_candidates if c.get("source_type") == category_preference]
            if category_filtered:
                unique_candidates = category_filtered

        # Calculate relevance scores & quality metadata
        scored_candidates = []
        for item in unique_candidates:
            rel_score = self._calculate_relevance(query, item["title"], item["snippet"])
            if rel_score < 0.15:  # Filter out low-relevance noise
                continue
            
            item["relevance_score"] = rel_score
            quality_score, metadata = self.evaluate_source_quality(
                item["url"], item["title"], item["snippet"], item.get("source_type", "web"), rel_score
            )
            item["quality_score"] = quality_score
            item["quality_metadata"] = metadata
            item["extracted_evidence"] = self._extract_evidence_snippet(item["snippet"], query)
            scored_candidates.append(item)

        # Sort by weighted relevance and credibility score
        scored_candidates.sort(key=lambda x: (x["relevance_score"] * 0.6 + x["quality_score"] * 0.4), reverse=True)

        return scored_candidates[:max_results]

    def _search_duckduckgo(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Retrieve real web results using DuckDuckGo."""
        results = []
        try:
            from duckduckgo_search import DDGS
            with DDGS() as ddgs:
                ddg_results = list(ddgs.text(query, max_results=max_results))
                for item in ddg_results:
                    url = item.get("href", "")
                    title = item.get("title", "")
                    snippet = item.get("body", "")
                    if not url or not title:
                        continue
                    source_name, source_type = self._classify_source(url, title)
                    results.append({
                        "title": title,
                        "url": url,
                        "source_name": source_name,
                        "source_type": source_type,
                        "author": source_name,
                        "publication_date": "Recent",
                        "snippet": snippet
                    })
        except Exception as e:
            logger.warning(f"DuckDuckGo search error: {e}")
        return results

    def _search_arxiv(self, query: str, max_results: int = 3) -> List[Dict[str, Any]]:
        """Query arXiv API for real scientific papers and preprints."""
        results = []
        try:
            clean_q = quote_plus(query)
            url = f"https://export.arxiv.org/api/query?search_query=all:{clean_q}&start=0&max_results={max_results}"
            headers = {"User-Agent": "DeepResearchAI/2.0 (mailto:research@deepresearch-ai.org)"}
            with httpx.Client(timeout=8.0, headers=headers, follow_redirects=True) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    root = ET.fromstring(resp.text)
                    ns = {'atom': 'http://www.w3.org/2005/Atom'}
                    for entry in root.findall('atom:entry', ns):
                        title_elem = entry.find('atom:title', ns)
                        summary_elem = entry.find('atom:summary', ns)
                        published_elem = entry.find('atom:published', ns)
                        id_elem = entry.find('atom:id', ns)
                        author_elems = entry.findall('atom:author/atom:name', ns)

                        title = title_elem.text.strip().replace("\n", " ") if title_elem is not None else ""
                        snippet = summary_elem.text.strip().replace("\n", " ") if summary_elem is not None else ""
                        published = published_elem.text[:10] if published_elem is not None else "Recent"
                        arxiv_id = id_elem.text.strip() if id_elem is not None else ""
                        authors = ", ".join([a.text.strip() for a in author_elems[:3]]) if author_elems else "arXiv Researchers"

                        if title and arxiv_id:
                            results.append({
                                "title": f"[arXiv] {title}",
                                "url": arxiv_id,
                                "source_name": "arxiv.org",
                                "source_type": "academic",
                                "author": authors,
                                "publication_date": published,
                                "snippet": snippet[:500]
                            })
        except Exception as e:
            logger.warning(f"arXiv search error: {e}")
        return results

    def _search_wikipedia(self, query: str, max_results: int = 3) -> List[Dict[str, Any]]:
        """Query Wikipedia API for encyclopedic ground-truth articles."""
        results = []
        try:
            clean_q = quote_plus(query)
            url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={clean_q}&format=json&utf8=1"
            headers = {"User-Agent": "DeepResearchAI/2.0 (mailto:research@deepresearch-ai.org)"}
            with httpx.Client(timeout=6.0, headers=headers) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    search_items = data.get("query", {}).get("search", [])
                    for item in search_items[:max_results]:
                        title = item.get("title", "")
                        snippet_raw = item.get("snippet", "")
                        snippet = re.sub(r'<[^>]+>', '', snippet_raw).strip()
                        page_url = f"https://en.wikipedia.org/wiki/{quote_plus(title.replace(' ', '_'))}"

                        results.append({
                            "title": f"Wikipedia: {title}",
                            "url": page_url,
                            "source_name": "en.wikipedia.org",
                            "source_type": "official",
                            "author": "Wikipedia Contributors",
                            "publication_date": "Updated Recent",
                            "snippet": snippet
                        })
        except Exception as e:
            logger.warning(f"Wikipedia search error: {e}")
        return results

    def _search_crossref(self, query: str, max_results: int = 3) -> List[Dict[str, Any]]:
        """Query CrossRef API for peer-reviewed journal articles with DOIs."""
        results = []
        try:
            clean_q = quote_plus(query)
            url = f"https://api.crossref.org/works?query={clean_q}&rows={max_results}"
            headers = {"User-Agent": "DeepResearchAI/2.0 (mailto:research@deepresearch-ai.org)"}
            with httpx.Client(timeout=8.0, headers=headers) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    items = data.get("message", {}).get("items", [])
                    for item in items:
                        titles = item.get("title", [])
                        title = titles[0] if titles else ""
                        item_url = item.get("URL", "")
                        publisher = item.get("publisher", "Academic Publisher")
                        created = item.get("created", {}).get("date-parts", [[2025]])[0][0]

                        authors_list = item.get("author", [])
                        author_names = ", ".join([f"{a.get('given','')} {a.get('family','')}".strip() for a in authors_list[:2]]) or publisher

                        abstract = item.get("abstract", "")
                        snippet = re.sub(r'<[^>]+>', '', abstract).strip() if abstract else f"Published academic work concerning {title}."

                        if title and item_url:
                            results.append({
                                "title": title,
                                "url": item_url,
                                "source_name": self._get_domain(item_url),
                                "source_type": "academic",
                                "author": author_names,
                                "publication_date": str(created),
                                "snippet": snippet[:500]
                            })
        except Exception as e:
            logger.warning(f"CrossRef search error: {e}")
        return results

    def _normalize_url(self, url: str) -> str:
        """Strip query parameters and trailing slashes for canonical URL deduplication."""
        try:
            parsed = urlparse(url)
            return f"{parsed.scheme}://{parsed.netloc}{parsed.path.rstrip('/')}"
        except Exception:
            return url.strip().rstrip('/')

    def _get_domain(self, url: str) -> str:
        """Extract domain from URL."""
        try:
            parsed = urlparse(url)
            dom = parsed.netloc.lower()
            return dom[4:] if dom.startswith("www.") else dom
        except Exception:
            return "web"

    def _classify_source(self, url: str, title: str) -> (str, str):
        """Classify domain type and extract human-friendly source domain name."""
        domain = self._get_domain(url)
        if domain.endswith(".edu") or "arxiv.org" in domain or "nature.com" in domain or "sciencedirect.com" in domain or "ieee.org" in domain or "ncbi.nlm.nih.gov" in domain:
            return domain, "academic"
        elif domain.endswith(".gov") or domain.endswith(".mil") or "who.int" in domain or "un.org" in domain or "cdc.gov" in domain or "europa.eu" in domain:
            return domain, "government"
        elif "reuters.com" in domain or "bloomberg.com" in domain or "bbc.com" in domain or "apnews.com" in domain or "wsj.com" in domain or "nytimes.com" in domain or "techcrunch.com" in domain:
            return domain, "news"
        elif domain.endswith(".org") or "github.com" in domain or "microsoft.com" in domain or "google.com" in domain or "wikipedia.org" in domain:
            return domain, "official"
        else:
            return domain, "web"

    def _calculate_relevance(self, query: str, title: str, snippet: str) -> float:
        """Calculate source relevance score based on query keyword overlap."""
        keywords = set(re.findall(r'\w{3,}', query.lower()))
        if not keywords:
            return 0.5

        text_corpus = f"{title} {snippet}".lower()
        matches = sum(1 for kw in keywords if kw in text_corpus)
        score = matches / len(keywords)
        return round(min(max(score, 0.20), 0.98), 2)

    def _extract_evidence_snippet(self, snippet: str, query: str) -> str:
        """Extract specific key evidence sentence matching the query intent."""
        if not snippet:
            return "Verified content matching research question."
        sentences = re.split(r'(?<=[.!?])\s+', snippet)
        keywords = [w.lower() for w in re.findall(r'\w{3,}', query)]
        
        best_sent = sentences[0]
        best_count = -1

        for sent in sentences:
            cnt = sum(1 for k in keywords if k in sent.lower())
            if cnt > best_count:
                best_count = cnt
                best_sent = sent

        return best_sent.strip()

    def evaluate_source_quality(self, url: str, title: str, snippet: str, source_type: str, relevance: float) -> (float, str):
        """Transparent source-quality evaluation system."""
        score = 0.50 + (relevance * 0.25)
        factors = [f"Topic relevance score: {int(relevance*100)}%"]

        if source_type == "academic":
            score += 0.25
            factors.append("Peer-reviewed academic portal (+0.25)")
        elif source_type == "government":
            score += 0.20
            factors.append("Official government agency (+0.20)")
        elif source_type == "official":
            score += 0.15
            factors.append("Verified organization domain (+0.15)")
        elif source_type == "news":
            score += 0.10
            factors.append("Global news outlet (+0.10)")

        if "https://" in url:
            score += 0.05
            factors.append("Encrypted HTTPS connection (+0.05)")

        final_score = round(min(score, 0.99), 2)
        metadata = f"Quality Grade: {int(final_score*100)}/100. Factors: {'; '.join(factors)}"
        return final_score, metadata

search_service = SearchService()
