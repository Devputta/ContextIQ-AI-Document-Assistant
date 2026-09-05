from pathlib import Path
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Query, Request
from fastapi.responses import FileResponse, PlainTextResponse
from sqlalchemy.orm import Session
from ..auth import get_current_user, decode_token
from ..db import Base, engine, get_db
from ..models import Document, User
from ..schemas import DocumentDetail, DocumentOut, RenameRequest
from ..settings import settings
from ..services.file_parser import parse_file
from ..services.rag import index_document, delete_document_vectors
Base.metadata.create_all(bind=engine)
router=APIRouter(tags=['documents'])
ALLOWED={'.pdf','.md','.markdown'}

def dto(d):
    typ='PDF' if Path(d.name).suffix.lower()=='.pdf' else 'MARKDOWN'
    return {'id':d.id,'name':d.name,'type':typ,'sizeBytes':d.size_bytes,'createdAt':d.created_at,'updatedAt':d.updated_at,'status':d.status,'errorMessage':d.error_message,'chatAvailable':d.status=='READY'}

def owned(doc_id,user,db):
    d=db.query(Document).filter(Document.id==doc_id,Document.owner_id==user.id).first()
    if not d: raise HTTPException(404,'Document not found.')
    return d

@router.post('/documents/upload',response_model=DocumentOut)
async def upload_document(file:UploadFile=File(...),db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    suffix=Path(file.filename or '').suffix.lower()
    if suffix not in ALLOWED: raise HTTPException(415,'Only PDF, .md, and .markdown files are supported.')
    target=Path(settings.upload_dir)/f'{uuid.uuid4()}{suffix}';size=0
    try:
        with target.open('wb') as out:
            while chunk:=await file.read(1024*1024):
                size+=len(chunk)
                if size>settings.max_upload_bytes: raise HTTPException(413,'File exceeds the configured maximum upload size.')
                out.write(chunk)
        d=Document(owner_id=user.id,name=file.filename or target.name,content_type=file.content_type or 'application/octet-stream',size_bytes=size,storage_path=str(target),status='PROCESSING');db.add(d);db.commit();db.refresh(d)
        try:
            index_document(d.id,user.id,d.name,str(target),d.content_type,db);d.status='READY';d.error_message=None;db.commit();db.refresh(d)
        except Exception as exc:
            db.rollback();d=db.get(Document,d.id);d.status='FAILED';d.error_message=str(exc)[:1000];db.commit();db.refresh(d)
        return dto(d)
    except HTTPException:
        target.unlink(missing_ok=True);raise
    except Exception as exc:
        target.unlink(missing_ok=True);raise HTTPException(500,'Upload failed.') from exc

@router.get('/documents',response_model=list[DocumentOut])
def list_documents(db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    return [dto(d) for d in db.query(Document).filter(Document.owner_id==user.id).order_by(Document.created_at.desc()).all()]

@router.get('/documents/{document_id}',response_model=DocumentDetail)
def get_document(document_id:str,db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    d=owned(document_id,user,db);result=dto(d);result['content']=None
    if Path(d.name).suffix.lower() in {'.md','.markdown'}:
        try: result['content']=parse_file(d.storage_path,d.content_type)[0]
        except Exception: pass
    return result

@router.get('/documents/{document_id}/content')
def content(document_id:str,db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    d=owned(document_id,user,db)
    if Path(d.name).suffix.lower() not in {'.md','.markdown'}: raise HTTPException(415,'Content endpoint is only for Markdown.')
    return PlainTextResponse(Path(d.storage_path).read_text(encoding='utf-8',errors='replace'))

@router.get('/documents/{document_id}/search')
def search_document(document_id:str,q:str=Query(min_length=1,max_length=200),db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    d=owned(document_id,user,db);term=q.casefold();hits=[]
    if Path(d.name).suffix.lower()=='.pdf':
        _,pages=parse_file(d.storage_path,d.content_type)
        for p in pages:
            if term in p['text'].casefold(): hits.append({'page':p['page'],'excerpt':p['text'][:300]})
    else:
        text,_=parse_file(d.storage_path,d.content_type);lines=text.splitlines();section=None
        for i,line in enumerate(lines):
            if line.startswith('#'): section=line.lstrip('#').strip()
            if term in line.casefold(): hits.append({'page':None,'section':section,'excerpt':line[:300]})
    return {'matches':hits[:50],'count':len(hits)}

@router.get('/documents/{document_id}/download')
def download(document_id:str, request:Request, token:str|None=Query(default=None), db:Session=Depends(get_db)):
    # Browser PDF iframes cannot attach Authorization headers, so accept either Authorization or a bearer query token.
    raw=request.headers.get('Authorization','')
    if raw.startswith('Bearer '): data=decode_token(raw[7:].strip())
    elif token: data=decode_token(token)
    else: raise HTTPException(401,'Authentication required.')
    user=db.get(User,data.get('sub'))
    if not user or user.session_version!=data.get('sv'): raise HTTPException(401,'Invalid authentication token.')
    d=owned(document_id,user,db);return FileResponse(d.storage_path,filename=d.name,media_type=d.content_type)

@router.patch('/documents/{document_id}')
def rename(document_id:str,req:RenameRequest,db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    d=owned(document_id,user,db);d.name=req.name.strip();db.commit();db.refresh(d);return dto(d)

@router.get('/documents/{document_id}/suggestions')
def suggestions(document_id:str,db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    d=owned(document_id,user,db)
    from ..models import DocumentChunk
    sections=[x.section for x in db.query(DocumentChunk).filter(DocumentChunk.document_id==d.id,DocumentChunk.section.isnot(None)).limit(8).all() if x.section]
    base=['What is this document about?','Summarize the main points.','What are the important requirements?','Explain this section in simple terms.']
    if sections:
        base=[f'What does the document say about {sections[0]}?',f'Summarize the {sections[0]} section.',f'What are the key requirements in {sections[min(1,len(sections)-1)]}?']+base[:1]
    return {'suggestions':list(dict.fromkeys(base))[:4]}

@router.delete('/documents/{document_id}')
def delete_document(document_id:str,db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    d=owned(document_id,user,db)
    try: delete_document_vectors(d.id,user.id)
    except Exception as exc: raise HTTPException(500,'Could not remove vector records.') from exc
    Path(d.storage_path).unlink(missing_ok=True);db.delete(d);db.commit();return {'deleted':True,'id':document_id}
