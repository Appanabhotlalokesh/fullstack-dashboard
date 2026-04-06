from pydantic import BaseModel

class SigninBase(BaseModel):
    name: str
    username: str
    email: str
    number: str
    address: str
    password: str
    role: str = "user"

class SigninCreate(SigninBase):
    pass

class Signin(SigninBase):
    id: int

    class Config:
        from_attributes = True   # for SQLAlchemy

class LoginRequest(BaseModel):
    username: str
    password: str