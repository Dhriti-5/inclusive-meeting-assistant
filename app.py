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
# This is the URL where your FastAPI backend is running
BACKEND_URL = "http://127.0.0.1:8000/process-audio/"

st.title("🚀 Inclusive Meeting Assistant")
st.write("A production-grade SaaS platform for autonomous meeting capture and intelligent conversation analysis.")

# --- Audio File Processing ---
st.header("Analyze a Recorded Meeting")
    
    # Your existing UI code for audio processing goes here
    uploaded_file = st.file_uploader(
        "Choose an audio file (.wav, .mp3, .m4a)", 
        type=["wav", "mp3", "m4a"],
        key="audio_uploader"
    )
    email = st.text_input("Enter your email for the PDF report.", key="audio_email")

    if st.button("Process Audio", type="primary", use_container_width=True):
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
                    response = requests.post(BACKEND_URL, files=files, data=data, timeout=300)
                    
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