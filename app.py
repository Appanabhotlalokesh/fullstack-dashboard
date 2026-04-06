import streamlit as st
import requests

API_URL = "http://localhost:8001/login-auth/"

st.title("Login page")

if "token" not in st.session_state:
    st.session_state.token = None
    st.session_state.user = None

if not st.session_state.token:

    username = st.text_input("Username")
    password = st.text_input("Password", type="password")

    if st.button("Login"):
        response = requests.post(
            API_URL,
            json={"username": username, "password": password}
        )

        if response.status_code == 200:
            data = response.json()
            st.session_state.token = data.get("access_token")
            st.session_state.user = data["user"]

            st.success("Login successful!")
            st.rerun()
        else:
            st.error("Invalid credentials.")

else:
    user = st.session_state.user

    st.sidebar.title("Panel")

    st.sidebar.markdown("### 👤 Admin Details")

    st.sidebar.write(f"**Username:** {user['username']}")
    st.sidebar.write(f"**Email:** {user['email']}")
    st.sidebar.write(f"**Number:** {user['number']}")
    st.sidebar.write(f"**Address:** {user['address']}")
    st.sidebar.write(f"**Role:** {user['role']}")

    st.sidebar.markdown("---")

    if st.sidebar.button("Logout"):
        st.session_state.token = None
        st.session_state.user = None
        st.rerun()

    if user["role"] == "admin":

        st.title("Admin Dashboard")
        st.subheader("All Users")

        response = requests.get("http://localhost:8001/admin/users/")

        if response.status_code == 200:
            users = response.json()

            for u in users:
                if u["role"] != "admin":  
                    st.write(f"""
                    **Username:** {u['username']}  
                    Email: {u['email']}  
                    Number: {u['number']}  
                    Address: {u['address']}  
                    Role: {u['role']}
                    """)
                    st.markdown("---")
        else:
            st.error("Failed to fetch users")

    else:

        st.title("User Dashboard")

        col1, col2 = st.columns(2)

        with col1:
            st.info(f"**Username:** {user['username']}")
            st.info(f"**Email:** {user['email']}")

        with col2:
            st.info(f"**Phone:** {user['number']}")
            st.info(f"**Address:** {user['address']}")

        st.markdown("---")

        if st.button("Show Token"):
            st.code(st.session_state.token)