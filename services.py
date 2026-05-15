from fastapi import HTTPException
from sqlalchemy.orm import Session
from models import Signin as signinModel
from schemas import SigninCreate
from auth import create_token
import json
from models import Product


def create_signin(db: Session, data: SigninCreate):
    signin_instance = signinModel(**data.model_dump())
    db.add(signin_instance)
    db.commit()
    db.refresh(signin_instance)
    return signin_instance


def get_all_signin(db: Session):
    return db.query(signinModel).all()


def get_signin(db: Session, signin_id: int):
    return db.query(signinModel).filter(signinModel.id == signin_id).first()


def update_signin(db: Session, signin: SigninCreate, signin_id: int):
    db_user = db.query(signinModel).filter(signinModel.id == signin_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in signin.model_dump().items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)

    return db_user


def delete_signin(db: Session, signin_id: int):
    db_user = db.query(signinModel).filter(signinModel.id == signin_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()

    return db_user


def signin_user(db: Session, username: str, password: str):

    print(f"\n🔥 Login attempt → {username}")

    user = db.query(signinModel).filter(signinModel.username == username).first()

    if not user:
        print("❌ User NOT found")
        raise HTTPException(status_code=404, detail="User not found")

    print("✅ User found in DB")

    if user.password != password:
        print("❌ Wrong password")
        raise HTTPException(status_code=401, detail="Invalid password")

    print("✅ Login successful")

    token = create_token({"sub": user.username})

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "number": user.number,
            "address": user.address,
            "role": user.role
        },
        "access_token": token,
        "token_type": "bearer"
    }

def get_all_users(db: Session):
    return db.query(signinModel).all()


from models import Product

def get_products(db, brand_name=None, model=None):
    products = db.query(Product).all()

    for p in products:
        if p.images:
            try:
                p.images = json.loads(p.images)
            except:
                p.images = []

    return products


def create_product(db, product):
    db_product = Product(
        brand_name=product.brand_name,
        model=product.model,
        price=product.price,
        ram=product.ram,
        rom=product.rom,
        images=json.dumps(product.images)        
    )

    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    return db_product


def delete_product(db, product_id):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        return {"error": "Product not found"}

    db.delete(product)
    db.commit()

    return {"message": "Deleted"}