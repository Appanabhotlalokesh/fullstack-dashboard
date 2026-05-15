from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional, List
import os
import uuid
import cloudinary
import cloudinary.uploader
import services
import schemas
from db import get_db, engine
from models import Base

# APP START

app = FastAPI()
cloudinary.config(
    cloud_name="dzvwelszm",
    api_key="896372874661321",
    api_secret="mPHaRQ7Ab674O6UkRPUhnmudNgk"
)
Base.metadata.create_all(bind=engine)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# FOLDER (future use if real uploads needed)
UPLOAD_DIR = "uploads/products"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# USERS
@app.get("/admin/users/")
def get_users(db: Session = Depends(get_db)):
    return services.get_all_users(db)


@app.get("/signin/{id}", response_model=schemas.Signin)
def get_signin_by_id(id: int, db: Session = Depends(get_db)):
    user = services.get_signin(db, id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


@app.post("/upload-images")
async def upload_images(files: List[UploadFile] = File(...)):
    image_urls = []
    for file in files:
        _, file_ext = os.path.splitext(file.filename)
        if not file_ext:
            file_ext = ".jpg"
        file_name = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
        image_urls.append(f"/uploads/products/{file_name}")
    return {"urls": image_urls}

@app.post("/products/")
def add_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return services.create_product(db, product)

@app.put("/signin/{id}", response_model=schemas.Signin)
def update_signin(
    id: int,
    signin: schemas.SigninCreate,
    db: Session = Depends(get_db)
):
    return services.update_signin(db, signin, id)


@app.delete("/signin/{id}")
def delete_signin(
    id: int,
    db: Session = Depends(get_db)
):
    return services.delete_signin(db, id)


@app.post("/login-auth/")
def login_auth(
    data: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    return services.signin_user(
        db,
        data.username,
        data.password
    )

# ===================================================
# PRODUCTS
# ===================================================

@app.get("/products/")
def get_products(
    brand_name: Optional[str] = None,
    model: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return services.get_products(
        db,
        brand_name,
        model
    )


@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    return services.delete_product(
        db,
        product_id
    )

