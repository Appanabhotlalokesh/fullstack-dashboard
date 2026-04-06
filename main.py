from fastapi import FastAPI, Depends, HTTPException
import services, schemas
from db import get_db
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for now allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/admin/users/")
def get_users(db: Session = Depends(get_db)):
    return services.get_all_users(db)

@app.get("/signin/{id}", response_model=schemas.Signin)
def get_signin_by_id(id: int, db: Session = Depends(get_db)):
    user = services.get_signin(db, id)
    if user:
        return user
    raise HTTPException(status_code=404, detail="User not found")

@app.post("/signin/", response_model=schemas.Signin)
def create_new_signin(signin: schemas.SigninCreate, db: Session = Depends(get_db)):
    return services.create_signin(db, signin)

@app.put("/signin/{id}", response_model=schemas.Signin)
def update_signin(signin: schemas.SigninCreate, id: int, db: Session = Depends(get_db)):
    return services.update_signin(db, signin, id)

@app.delete("/signin/{id}")
def delete_signin(id: int, db: Session = Depends(get_db)):
    return services.delete_signin(db, id)

@app.post("/login-auth/")
def login_auth(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    return services.signin_user(db, data.username, data.password)