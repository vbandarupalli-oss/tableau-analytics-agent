from __future__ import annotations

import asyncio
import time
from typing import Any, Dict, Optional, Tuple


class TTLCache:
    """Simple in-memory TTL cache. Thread-safe via asyncio.Lock."""

    def __init__(self, default_ttl: int = 300) -> None:
        self._store: Dict[str, Tuple[Any, float]] = {}
        self._lock = asyncio.Lock()
        self._default_ttl = default_ttl

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            value, expires_at = entry
            if time.monotonic() > expires_at:
                del self._store[key]
                return None
            return value

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        expires_at = time.monotonic() + (ttl if ttl is not None else self._default_ttl)
        async with self._lock:
            self._store[key] = (value, expires_at)

    async def delete(self, key: str) -> None:
        async with self._lock:
            self._store.pop(key, None)

    async def clear(self) -> None:
        async with self._lock:
            self._store.clear()

    async def purge_expired(self) -> int:
        now = time.monotonic()
        async with self._lock:
            expired = [k for k, (_, exp) in self._store.items() if now > exp]
            for k in expired:
                del self._store[k]
        return len(expired)


# Module-level shared cache (TTL 5 min) — used by tool executor for repeated Tableau calls
tool_cache = TTLCache(default_ttl=300)
