from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from .db import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(80), unique=True, nullable=False, index=True)
    email = Column(String(320), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    session_version = Column(Integer, default=0, nullable=False)
    documents = relationship('Document', back_populates='owner', cascade='all, delete-orphan')
    conversations = relationship('Conversation', back_populates='user', cascade='all, delete-orphan')

class Document(Base):
    __tablename__ = 'documents'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey('users.id'), nullable=True, index=True)
    name = Column(String(500), nullable=False)
    content_type = Column(String(200), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    storage_path = Column(String(1000), nullable=False)
    status = Column(String(30), nullable=False, default='UPLOADING')
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    owner = relationship('User', back_populates='documents')
    conversations = relationship('Conversation', back_populates='document', cascade='all, delete-orphan')
    chunks = relationship('DocumentChunk', back_populates='document', cascade='all, delete-orphan')

class DocumentChunk(Base):
    __tablename__ = 'document_chunks'
    id = Column(String, primary_key=True)
    document_id = Column(String, ForeignKey('documents.id', ondelete='CASCADE'), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page = Column(Integer, nullable=True)
    section = Column(String(500), nullable=True)
    text = Column(Text, nullable=False)
    document = relationship('Document', back_populates='chunks')
    __table_args__ = (UniqueConstraint('document_id', 'chunk_index', name='uq_document_chunk_index'),)

class Conversation(Base):
    __tablename__ = 'conversations'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    document_id = Column(String, ForeignKey('documents.id', ondelete='CASCADE'), nullable=False, index=True)
    title = Column(String(200), nullable=False, default='New conversation')
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    user = relationship('User', back_populates='conversations')
    document = relationship('Document', back_populates='conversations')
    messages = relationship('Message', back_populates='conversation', cascade='all, delete-orphan', order_by='Message.created_at')

class Message(Base):
    __tablename__ = 'messages'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False, index=True)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    sources_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    conversation = relationship('Conversation', back_populates='messages')
