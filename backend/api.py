from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import pydicom
from pydicom.filereader import dcmread

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = r'D:\Easiofy-HealthCare\Easiofy-HealthCare-main\backend\upload'
app.config['NEW_UPLOAD_FOLDER'] = r'D:\Easiofy-HealthCare\Easiofy-HealthCare-main\backend\new'

@app.route('/upload', methods=['POST'])
def upload_files():
    patient_name = request.form.get('patientName', 'Unknown')  # Assuming patient name is sent as part of form data
    files = request.files.getlist('files')
    for file in files:
        if file:
            # Get full original path from the client
            full_path = file.filename  # This should include directory structure like 'folder/subfolder/file.dcm'
            safe_path = secure_path(full_path)  # Create a secure path from the full path
            
            # Build full server path for original and processed files
            original_full_path = os.path.join(app.config['UPLOAD_FOLDER'], safe_path)
            processed_full_path = os.path.join(app.config['NEW_UPLOAD_FOLDER'], safe_path)
            
            # Ensure directories exist
            os.makedirs(os.path.dirname(original_full_path), exist_ok=True)
            os.makedirs(os.path.dirname(processed_full_path), exist_ok=True)
            
            # Save original file
            file.save(original_full_path)
            
            # Process file (e.g., anonymize)
            try:
                mask_dicom(original_full_path, processed_full_path, patient_name)
            except Exception as e:
                app.logger.error(f"Error processing file {full_path}: {e}")
                return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Files have been successfully processed and uploaded!"})

def secure_path(path):
    parts = path.split('/')
    safe_parts = [secure_filename(part) for part in parts]
    return os.path.join(*safe_parts)

def mask_dicom(original_file_path, new_file_path, patient_name):
    ds = dcmread(original_file_path)
    # Masking patient information
    ds.PatientName = patient_name  # Assuming you want to replace with the input patient name
    # Add other DICOM field modifications here as needed
    ds.save_as(new_file_path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
