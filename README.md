# Full Stack E-Commerce Web Application

A full-stack e-commerce web application built with **React + Vite** on the frontend and **FastAPI + PostgreSQL** on the backend.  
It includes separate **Admin** and **User** dashboards, product management, image uploads, wishlist, cart, search, filters, and a responsive UI.

## Features

- Role-based login for Admin and User
- Admin dashboard with:
  - View all users
  - Add new products
  - Upload multiple product images
  - Search and filter products
- User dashboard with:
  - View products
  - Wishlist
  - Cart
  - Search and filters
- Product image upload and preview
- Persistent storage using PostgreSQL
- Responsive and modern UI

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- FastAPI
- Python
- PostgreSQL
- SQLAlchemy

## Project Structure

``text
frontend/
  src/
    pages/
    services/
    components/

backend/
  main.py
  models.py
  schemas.py
  services.py
  db.py

Setup Instructions
1. Clone the repository
git clone https://github.com/your-username/your-repo.git
cd your-repo
2. Frontend setup
cd frontend
npm install
npm run dev
3. Backend setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8001
Environment Variables

Create a .env file in the backend if needed:

DATABASE_URL=postgresql://username:password@localhost:5432/your_db_name
API Endpoints
POST /login-auth/ — User login
GET /admin/users/ — Get all users
GET /products/ — Get all products
POST /products/ — Add a new product
DELETE /products/{id} — Delete a product
POST /upload-images — Upload product images
Screenshots

Add screenshots here later to show the UI.

Future Improvements
Product details modal
Image slider for multiple product images
Order management
Payment integration
Cloud image storage
Better analytics for admin dashboard
Author

Lokesh Appanabhotla
