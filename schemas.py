from pydantic import BaseModel
from typing import List

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

class ProductCreate(BaseModel):
    brand_name: str
    model: str
    price: int
    ram: str
    rom: str
    images: List[str]


class Product(ProductCreate):
    id: int

    class Config:
        from_attributes = True