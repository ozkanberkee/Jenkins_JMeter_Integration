import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build


SCOPES = ['https://www.googleapis.com/auth/drive.file']


def authenticate():
    creds = None
    
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'client_secret.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    
    return creds


def main():
    creds = authenticate()
    service = build('drive', 'v3', credentials=creds)

    
    results = service.files().list(pageSize=10, fields="files(id, name)").execute()
    items = results.get('files', [])

    if not items:
        print('Hiç dosya bulunamadı.')
    else:
        print('Dosyalar:')
        for item in items:
            print(f'{item["name"]} ({item["id"]})')

if __name__ == '__main__':
    main()
