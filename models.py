from db import Base
from sqlalchemy import Column, Integer, String

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
