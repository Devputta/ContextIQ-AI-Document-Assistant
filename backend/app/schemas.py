from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class UserOut(BaseModel):
    id: str; username: str; email: EmailStr; createdAt: datetime

class AuthResponse(BaseModel):
    accessToken: str; user: UserOut

class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=80, pattern=r'^[A-Za-z0-9_.-]+$')
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginRequest(BaseModel):
    identifier: str = Field(min_length=1, max_length=320)
    password: str = Field(min_length=1, max_length=128)

class ChangePasswordRequest(BaseModel):
    currentPassword: str; newPassword: str = Field(min_length=8, max_length=128)

class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str; name: str; type: str; sizeBytes: int; createdAt: datetime; updatedAt: datetime
    status: str; errorMessage: str | None = None; chatAvailable: bool = False

class DocumentDetail(DocumentOut):
    content: str | None = None

class RenameRequest(BaseModel):
    name: str = Field(min_length=1, max_length=500)

class ChatRequest(BaseModel):
    document_id: str; question: str = Field(min_length=1, max_length=8000); conversation_id: str | None = None

class Source(BaseModel):
    document_id: str; document_name: str; chunk_id: str; page: int | None = None; section: str | None = None; text: str

class ChatResponse(BaseModel):
    answer: str; sources: list[Source]; conversationId: str

class ConversationOut(BaseModel):
    id: str; title: str; documentId: str; documentName: str; lastMessage: str | None
    updatedAt: datetime; messageCount: int

class MessageOut(BaseModel):
    id: str; role: str; content: str; sources: list[Source]; createdAt: datetime

class ConversationDetail(ConversationOut):
    messages: list[MessageOut]
