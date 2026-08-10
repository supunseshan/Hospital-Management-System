"""
Builds a standard CRUD router (GET list, GET one, POST, PUT, DELETE) for a
Firestore collection. Individual module routers (patients, doctors, ...)
call this factory and then bolt on any module-specific endpoints.

IMPORTANT ROUTING NOTE:
Starlette/FastAPI matches routes in the order they were registered. A
generic "/{item_id}" route would swallow static paths like
"/search/{query}" or "/low-stock" if it were registered first (item_id
would just capture the literal string "low-stock"). To avoid that, this
factory registers the collection-level routes in two steps: call
`build_crud_router()` first, add any custom static-path routes on the
returned router, then call `router.finalize_item_routes()` LAST (each
module file does this at the bottom of the file).
"""
from fastapi import APIRouter, Depends, HTTPException

from app.services.firestore_service import FirestoreService
from app.core.security import require_roles


def build_crud_router(
    *,
    prefix: str,
    tag: str,
    collection: str,
    read_roles: list[str],
    write_roles: list[str],
    delete_roles: list[str],
) -> tuple[APIRouter, FirestoreService]:
    router = APIRouter(prefix=prefix, tags=[tag])
    service = FirestoreService(collection)

    @router.get("", dependencies=[Depends(require_roles(*read_roles))])
    def list_items(limit: int = 200):
        return service.list(limit=limit)

    @router.post("", dependencies=[Depends(require_roles(*write_roles))])
    def create_item(payload: dict):
        return service.create(payload)

    def finalize_item_routes():
        """Registers GET/PUT/DELETE '/{item_id}'. Call this AFTER adding any
        module-specific static-path routes (e.g. '/search/{query}',
        '/low-stock'), so those are matched first."""

        @router.get("/{item_id}", dependencies=[Depends(require_roles(*read_roles))])
        def get_item(item_id: str):
            item = service.get(item_id)
            if not item:
                raise HTTPException(status_code=404, detail="Not found")
            return item

        @router.put("/{item_id}", dependencies=[Depends(require_roles(*write_roles))])
        def update_item(item_id: str, payload: dict):
            updated = service.update(item_id, payload)
            if not updated:
                raise HTTPException(status_code=404, detail="Not found")
            return updated

        @router.delete("/{item_id}", dependencies=[Depends(require_roles(*delete_roles))])
        def delete_item(item_id: str):
            ok = service.delete(item_id)
            if not ok:
                raise HTTPException(status_code=404, detail="Not found")
            return {"deleted": True}

    router.finalize_item_routes = finalize_item_routes  # type: ignore[attr-defined]

    return router, service
