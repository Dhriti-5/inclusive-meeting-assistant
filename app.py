# app.py

import streamlit as st
import requests
import os

# --- Page Configuration ---
st.set_page_config(
    page_title="Inclusive Meeting Assistant",
    page_icon="🤖",
    layout="wide"
)

# --- Backend API Configuration ---
# This is the URL where your FastAPI backend is running
BACKEND_URL = "http://127.0.0.1:8000/process-audio/"

# --- UI Components ---
st.title("Inclusive Meeting Assistant")
st.write("""
    Welcome! This tool transcribes, summarizes, and extracts action items from your meeting audio.
    Upload an audio file and enter your email to receive a detailed PDF summary.
""")

st.divider()

# Create two columns for a cleaner layout
col1, col2 = st.columns(2)

with col1:
    st.header("1. Upload Your Meeting Audio")
    # File uploader widget
    uploaded_file = st.file_uploader(
        "Choose an audio file (.wav, .mp3, .m4a)", 
        type=["wav", "mp3", "m4a"]
    )
    
    st.header("2. Enter Your Email")
    # Text input widget for email
    email = st.text_input("We'll send the summary PDF to this address.")

with col2:
    st.header("3. Process and Get Insights")
    st.write("Click the button below to start the analysis.")
    
    # The "Process" button
    if st.button("Process Meeting", type="primary", use_container_width=True):
        # --- Input Validation ---
        if uploaded_file is None:
            st.error("⚠️ Please upload an audio file first.")
        elif not email:
            st.error("⚠️ Please enter your email address.")
        else:
            # --- API Call ---
            with st.spinner("Processing... This may take a few minutes for long meetings. 🧠"):
                try:
                    # Prepare the file and data for the POST request
                    files = {'audio': (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type)}
                    data = {'email': email, 'lang': 'en'} # Language is hardcoded to 'en' for now
                    
                    # Make the request to your FastAPI backend
                    response = requests.post(BACKEND_URL, files=files, data=data)
                    
                    # --- Display Results ---
                    if response.status_code == 200:
                        st.success("✅ Processing Complete!")
                        results = response.json()
                        
                        st.subheader("📝 Summary")
                        st.write(results.get("summary_en", "No summary available."))
                        
                        st.subheader("📌 Action Items")
                        st.write(results.get("action_items", "No action items found."))

                        st.info("A detailed PDF has been sent to your email address.")

                    else:
                        # Display an error if the API call fails
                        st.error(f"❌ An error occurred: {response.text}")

                except requests.exceptions.RequestException as e:
                    st.error(f"❌ Could not connect to the backend. Please ensure it's running. Error: {e}")