from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import pydicom
from pydicom.filereader import dcmread
import firebase_admin
from firebase_admin import credentials, storage, db
from cryptography.fernet import Fernet

app = Flask(__name__)
CORS(app)

cred = credentials.Certificate('./firebase-key.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'dicom-admin.appspot.com',
    'databaseURL': 'https://dicom-admin-default-rtdb.firebaseio.com'  
})

ref = db.reference()

app.config['UPLOAD_FOLDER'] = r'D:\Easiofy-HealthCare\Easiofy-HealthCare-main\backend\upload'
app.config['NEW_UPLOAD_FOLDER'] = r'D:\Easiofy-HealthCare\Easiofy-HealthCare-main\backend\new'

# Generate a key for encryption and save it securely; only needs to be done once
key = Fernet.generate_key()
cipher_suite = Fernet(key)

@app.route('/upload', methods=['POST'])
def upload_files():
    results = []
    bucket = storage.bucket()
    adminName1 = request.form['adminName1']
    patientId = request.form['patientId']
    timestamp = request.form['timestamp']
    rootFolderPath = f"superadmin/admins/{adminName1}/patients/{patientId}/folder_{timestamp}/"

    db_ref = ref.child(f"superadmin/admins/{adminName1}/patients/{patientId}")
    db_ref.update({'FolderPath': rootFolderPath})

    # Generate a new key for this session and create cipher suite
    key = Fernet.generate_key()
    cipher_suite = Fernet(key)

    # Convert key to a string to store in the database
    key_str = key.decode('utf-8')
    db_ref.update({'EncryptedKey': key_str})

    for file in request.files.getlist('files'):
        webkit_path = file.filename
        safe_path = secure_path(webkit_path)
        immediate_directory = os.path.basename(os.path.dirname(webkit_path)) if os.path.dirname(webkit_path) else ""
        safe_immediate_directory = secure_filename(immediate_directory)
        
        original_full_path = os.path.join(app.config['UPLOAD_FOLDER'], safe_path)
        processed_full_path = os.path.join(app.config['NEW_UPLOAD_FOLDER'], safe_immediate_directory, os.path.basename(safe_path))

        try:
            os.makedirs(os.path.dirname(original_full_path), exist_ok=True)
            os.makedirs(os.path.dirname(processed_full_path), exist_ok=True)
            file.save(original_full_path)
            mask_dicom(original_full_path, processed_full_path)

            # Encrypt the file
            with open(processed_full_path, 'rb') as f:
                file_data = f.read()
                encrypted_data = cipher_suite.encrypt(file_data)

            # Save the encrypted file temporarily
            encrypted_file_path = processed_full_path + '.enc'
            with open(encrypted_file_path, 'wb') as f:
                f.write(encrypted_data)

            firebase_path = f"{rootFolderPath}{safe_immediate_directory}/{os.path.basename(safe_path)}.enc"
            blob = bucket.blob(firebase_path)
            blob.upload_from_filename(encrypted_file_path)
            file_url = blob.public_url
            results.append({"filename": firebase_path, "url": file_url})

        except Exception as e:
            app.logger.error(f"Error with file {webkit_path} during processing or upload: {e}")
            return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Files have been successfully processed, encrypted, and uploaded!", "files": results})

def secure_path(path):
    parts = path.split('/')
    safe_parts = [secure_filename(part) for part in parts]
    return os.path.join(*safe_parts)


def mask_value(value):
 
    value = str(value) 
    return f"{value[0]}{'*'*(len(value)-2)}{value[-1]}" if len(value) > 1 else value

def mask_date(date):
    return f"{date[0]}{'*'*(len(date)-2)}{date[-1]}" if date and len(date) == 8 else date

def mask_dicom(original_file_path, new_file_path):
    ds = dcmread(original_file_path)
    if 'PatientName' in ds:
        ds.PatientName = mask_value(ds.PatientName)
    if 'PatientID' in ds:
        ds.PatientID = mask_value(ds.PatientID)
    if 'PatientBirthDate' in ds:
        ds.PatientBirthDate = mask_date(ds.PatientBirthDate)
    ds.save_as(new_file_path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
