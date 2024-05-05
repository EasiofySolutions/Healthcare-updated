from flask import Flask, request, jsonify, Response, stream_with_context
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import pydicom
from io import BytesIO
from pydicom.filereader import dcmread
from pydicom.filewriter import write_file
import firebase_admin
from firebase_admin import credentials, storage, db
from threading import Lock
import time
import json

app = Flask(__name__)
CORS(app)

cred = credentials.Certificate('./backend/firebase-key.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'dicom-admin.appspot.com',
    'databaseURL': 'https://dicom-admin-default-rtdb.firebaseio.com'  
})

ref = db.reference()

@app.route('/upload', methods=['POST'])
def upload_files():
    results = []
    bucket = storage.bucket()
    adminName1 = request.form['adminName1']
    patientId = request.form['patientId']
    timestamp = request.form['timestamp']
    rootFolderPath = f"superadmin/admins/{adminName1}/patients/{patientId}/folder_{timestamp}/"
    all_uploads_success = True  

    for file in request.files.getlist('files'):
        try:
            ds = dcmread(file.stream)
            ds = mask_dicom(ds)
            memory_file = BytesIO()
            write_file(memory_file, ds, write_like_original=False)
            memory_file.seek(0)

            webkit_path = file.filename
            safe_path = secure_path(webkit_path)
            immediate_directory = os.path.basename(os.path.dirname(webkit_path)) if os.path.dirname(webkit_path) else ""
            safe_immediate_directory = secure_filename(immediate_directory)
            firebase_path = f"{rootFolderPath}{safe_immediate_directory}/{os.path.basename(safe_path)}"
            blob = bucket.blob(firebase_path)
            blob.upload_from_file(memory_file, content_type='application/dicom')
            file_url = blob.public_url
            results.append({"filename": firebase_path, "url": file_url})
        except Exception as e:
            app.logger.error(f"Error processing or uploading file: {e}")
            all_uploads_success = False
            break

    if all_uploads_success:
       
        db_ref = ref.child(f"superadmin/admins/{adminName1}/patients/{patientId}")
        db_ref.update({'FolderPath': rootFolderPath})
        return jsonify({"message": "Files have been successfully processed and uploaded!", "files": results})
    else:
        return jsonify({"error": "Failed to process or upload one or more files"}), 500
    


def secure_path(path):
    return secure_filename(path)

progress_lock = Lock()
progress = {}
@app.route('/uploadortho', methods=['POST'])
def upload_files_ortho():
    results = []
    bucket = storage.bucket()
    adminName1 = request.form['adminName1']
    patientId = request.form['patientId']
    rootFolderPathortho = request.form['folderpath']
    files = request.files.getlist('files')

    total_files = len(files)
    progress[patientId] = {"total": total_files, "completed": 0}
    all_uploads_success = True

    for idx, file in enumerate(files):
        try:
            file_stream = BytesIO(file.read())
            ds = dcmread(file_stream)

            ds = mask_dicom(ds)

            memory_file = BytesIO()
            ds.save_as(memory_file, write_like_original=False)
            memory_file.seek(0)

            # Extract and sanitize the series folder path
            webkit_path = file.filename
            safe_path = secure_path(webkit_path)
            immediate_directory = os.path.dirname(webkit_path)
            safe_immediate_directory = secure_filename(immediate_directory) if immediate_directory else ""
            firebase_path = f"{rootFolderPathortho}{safe_immediate_directory}/{os.path.basename(safe_path)}"

            # Upload to Firebase Storage
            blob = bucket.blob(firebase_path)
            blob.upload_from_file(memory_file, content_type='application/dicom')
            file_url = blob.public_url
            results.append({"filename": firebase_path, "url": file_url})

            with progress_lock:
                progress[patientId]["completed"] += 1
        except Exception as e:
            app.logger.error(f"Error processing or uploading file: {e}")
            all_uploads_success = False
            break

    if all_uploads_success:
        db_ref = db.reference(f"superadmin/admins/{adminName1}/patients/{patientId}")
        try:
            db_ref.update({'FolderPath': rootFolderPathortho})
            return jsonify({"message": "Files have been successfully processed and uploaded!", "files": results})
        except Exception as e:
            app.logger.error(f"Failed to update Firebase Realtime Database: {e}")
            return jsonify({"error": "Failed to update the database"}), 500
    else:
        return jsonify({"error": "Failed to process or upload one or more files"}), 500

@app.route('/progress/<patient_id>', methods=['GET'])
def progress_status(patient_id):
    def event_stream(patient_id):
        while True:
            with progress_lock:
                progress_info = progress.get(patient_id, {"total": 0, "completed": 0})
                json_progress_info = json.dumps(progress_info)
            yield f"data: {json_progress_info}\n\n"
            time.sleep(1)

    return Response(stream_with_context(event_stream(patient_id)), content_type='text/event-stream')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})


def mask_dicom(ds):
    if 'PatientName' in ds and ds.PatientName:
        ds.PatientName = mask_value(ds.PatientName)
    if 'PatientID' in ds and ds.PatientID:
        ds.PatientID = mask_value(ds.PatientID)
    if 'PatientBirthDate' in ds and ds.PatientBirthDate:
        ds.PatientBirthDate = mask_date(ds.PatientBirthDate)
    return ds


def secure_path(path):
    parts = path.split('/')
    safe_parts = [secure_filename(part) for part in parts]
    return os.path.join(*safe_parts)


def mask_value(value):
    if isinstance(value, pydicom.valuerep.PersonName):
        value = str(value)  

    masked_value = value[0] + '*' * (len(value) - 2) + value[-1] if len(value) > 1 else value
    return masked_value

def mask_date(date):
    return f"{date[0]}{'*'*(len(date)-2)}{date[-1]}" if date and len(date) == 8 else date

if __name__ == '__main__':
    app.run(debug=True, port=5000)

