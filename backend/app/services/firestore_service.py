"""
Generic Firestore CRUD helper.

Every module (patients, doctors, appointments, medical records, lab,
pharmacy, billing, staff...) stores its records in its own Firestore
collection but needs the same basic operations, so we centralize
create / list / get / update / delete / search here instead of
repeating it in every router.
"""
from __future__ import annotations  # keeps type hints lazy so the `list` method below
# doesn't shadow the builtin `list` used in its own return-type annotations.
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from google.cloud.firestore_v1 import FieldFilter

from app.core.firebase import get_db


class FirestoreService:
    def __init__(self, collection: str):
        self.collection = collection

    def _col(self):
        return get_db().collection(self.collection)

    def create(self, data: dict[str, Any], doc_id: Optional[str] = None) -> dict[str, Any]:
        doc_id = doc_id or str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        payload = {**data, "id": doc_id, "created_at": now, "updated_at": now}
        self._col().document(doc_id).set(payload)
        return payload

    def list(self, limit: int = 200, filters: Optional[list[tuple[str, str, Any]]] = None) -> list[dict[str, Any]]:
        query = self._col()
        if filters:
            for field, op, value in filters:
                query = query.where(filter=FieldFilter(field, op, value))
        docs = query.limit(limit).stream()
        return [d.to_dict() for d in docs]

    def get(self, doc_id: str) -> Optional[dict[str, Any]]:
        doc = self._col().document(doc_id).get()
        return doc.to_dict() if doc.exists else None

    def update(self, doc_id: str, data: dict[str, Any]) -> Optional[dict[str, Any]]:
        ref = self._col().document(doc_id)
        if not ref.get().exists:
            return None
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        ref.update(data)
        return ref.get().to_dict()

    def delete(self, doc_id: str) -> bool:
        ref = self._col().document(doc_id)
        if not ref.get().exists:
            return False
        ref.delete()
        return True

    def search(self, field: str, value: str, limit: int = 50) -> list[dict[str, Any]]:
        """Simple prefix search used for patient/doctor name search boxes."""
        query = (
            self._col()
            .order_by(field)
            .start_at([value])
            .end_at([value + "\uf8ff"])
            .limit(limit)
        )
        return [d.to_dict() for d in query.stream()]
