import logging, time, uuid
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .settings import settings
from .db import Base, engine
from .routers.documents import router as documents_router
from .routers.chat import router as chat_router
from .routers.auth import router as auth_router

Base.metadata.create_all(bind=engine)
app=FastAPI(title='ContextIQ API',version='1.0.0',description='Context-aware RAG document assistant API')
app.add_middleware(CORSMiddleware,allow_origins=settings.cors_origin_list,allow_credentials=False,allow_methods=['*'],allow_headers=['*'])
logger=logging.getLogger('contextiq');logging.basicConfig(level=logging.INFO,format='%(asctime)s %(levelname)s %(message)s')
rate=defaultdict(list)
@app.middleware('http')
async def request_guard(request:Request,call_next):
    rid=str(uuid.uuid4());request.state.request_id=rid;key=f"{request.client.host if request.client else 'unknown'}:{request.url.path}";now=time.time();rate[key]=[x for x in rate[key] if now-x<60]
    if len(rate[key])>=120: return JSONResponse(status_code=429,content={'detail':'Too many requests. Please try again later.','requestId':rid},headers={'X-Request-ID':rid})
    rate[key].append(now)
    try:
        response=await call_next(request);response.headers['X-Request-ID']=rid;return response
    except Exception:
        logger.exception('Unhandled request error %s',rid);return JSONResponse(status_code=500,content={'detail':'Internal server error.','requestId':rid},headers={'X-Request-ID':rid})

app.include_router(auth_router,prefix='/api');app.include_router(documents_router,prefix='/api');app.include_router(chat_router,prefix='/api')
@app.get('/health',tags=['system'])
def health():
    from .db import SessionLocal
    db_ok=False
    try: SessionLocal().execute(__import__('sqlalchemy').text('SELECT 1'));db_ok=True
    except Exception: pass
    return {'status':'ok' if db_ok else 'degraded','api':True,'database':db_ok,'vectorDatabase':True,'llmConfigured':bool(settings.llm_model)}
