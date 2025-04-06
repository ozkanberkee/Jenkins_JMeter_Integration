import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Google Drive API'yi kullanmak için gerekli olan izinler
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# token.pickle dosyasını oluştur
def authenticate():
    creds = None
    # Daha önce token.pickle dosyası oluşturulmuşsa, bu dosyadan kimlik bilgilerini yükle
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    # Kimlik bilgileri yoksa veya geçerli değilse, yeniden kimlik doğrulaması yap
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'client_secret.json', SCOPES)  # client_secrets.json, yukarıda oluşturduğunuz OAuth istemci dosyasının adı
            creds = flow.run_local_server(port=0)
        # Kimlik bilgilerini token.pickle dosyasına kaydet
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    
    return creds

# Google Drive API istemcisine bağlan
def main():
    creds = authenticate()
    service = build('drive', 'v3', credentials=creds)

    # Google Drive'dan dosya listele
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
