from db import Base
from sqlalchemy import Column, Integer, String, JSON

class Signin(Base):
    __tablename__ = "signin"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    username = Column(String)
    address = Column(String)
    password = Column(String)
    email = Column(String)
    number = Column(String)
    role = Column(String, default="user")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String)
    model = Column(String)
    price = Column(Integer)
    ram = Column(String)
    rom = Column(String)

    # store multiple images as JSON string
    images = Column(String)