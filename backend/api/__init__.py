try:
    from api.api import api_router
    import routers
    import services
    import models
    import schemas
except ImportError:
    from backend.api.api import api_router
    import backend.routers as routers
    import backend.services as services
    import backend.models as models
    import backend.schemas as schemas

__all__ = ["api_router", "routers", "services", "models", "schemas"]
