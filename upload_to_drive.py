import os
import pickle
import google.auth
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.http import MediaFileUpload

# API erişim için gerekli olan 'token.pickle' ve 'credentials.json' dosyaları
SCOPES = ['https://www.googleapis.com/auth/drive.file']

def authenticate_google_account():
    creds = None
    # 'token.pickle' dosyası mevcutsa, önceki kimlik doğrulama bilgilerini yükle
    if os.path.exists('C:/ProgramData/Jenkins/.jenkins/workspace/JMeter_Integrate_Project/token.pickle'):
        with open('C:/ProgramData/Jenkins/.jenkins/workspace/JMeter_Integrate_Project/token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # Kimlik doğrulama gerektiriyorsa
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'C:/ProgramData/Jenkins/.jenkins/workspace/JMeter_Integrate_Project/client_secret.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Kimlik bilgilerini 'token.pickle' dosyasına kaydet
        with open('C:/ProgramData/Jenkins/.jenkins/workspace/JMeter_Integrate_Project/token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    return creds

def upload_file_to_drive(file_path):
    creds = authenticate_google_account()
    service = build('drive', 'v3', credentials=creds)

    # Dosya adı ve mime türünü ayarlayın
    file_metadata = {'name': os.path.basename(file_path)}
    media = MediaFileUpload(file_path, mimetype='application/zip')

    # Dosyayı Google Drive'a yükle
    file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()

    # Yüklenen dosyanın Google Drive linkini döndür
    file_id = file['id']
    file_link = f"https://drive.google.com/file/d/{file_id}/view?usp=sharing"
    return file_link

# Test: Dosya yolu
if __name__ == '__main__':
    file_path = 'C:/ProgramData/Jenkins/.jenkins/workspace/JMeter_Integrate_Project/report.zip'
    link = upload_file_to_drive(file_path)
    print(link)  # Linki sadece çıktı olarak al
