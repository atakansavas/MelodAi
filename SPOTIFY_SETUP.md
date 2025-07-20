# Spotify Entegrasyonu Kurulum Rehberi

Bu rehber, Melodia uygulamasında Spotify login entegrasyonunu tam olarak çalışır hale getirmek için gerekli adımları içerir.

## 1. Spotify Developer Dashboard Ayarları

### 1.1 Spotify Developer Hesabı Oluşturma

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)'a gidin
2. Spotify hesabınızla giriş yapın
3. "Create App" butonuna tıklayın

### 1.2 Uygulama Bilgilerini Doldurma

- **App name**: Melodia (veya istediğiniz isim)
- **App description**: Müzik analizi ve AI asistan uygulaması
- **Website**: `https://your-website.com` (opsiyonel)
- **Redirect URIs**: `spoti://auth/callback`
- **API/SDKs**: Web API'yi seçin

### 1.3 Client Credentials Alma

Uygulama oluşturulduktan sonra:

1. Dashboard'da uygulamanızı seçin
2. **Settings** sekmesine gidin
3. **Client ID** ve **Client Secret** değerlerini kopyalayın

## 2. Environment Variables Ayarlama

### 2.1 .env Dosyası Oluşturma

Proje root dizininde `.env` dosyası oluşturun:

```bash
# Spotify Configuration
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# AI API Configuration (if needed)
EXPO_PUBLIC_AI_API_URL=your_ai_api_url_here
EXPO_PUBLIC_AI_API_KEY=your_ai_api_key_here
```

### 2.2 Değerleri Güncelleme

- `your_spotify_client_id_here` yerine Spotify Developer Dashboard'dan aldığınız Client ID'yi yazın
- `your_spotify_client_secret_here` yerine Client Secret'ı yazın

## 3. Uygulama Konfigürasyonu

### 3.1 Expo Konfigürasyonu

`app.json` dosyasında scheme ayarının doğru olduğundan emin olun:

```json
{
  "expo": {
    "scheme": "spoti",
    "ios": {
      "bundleIdentifier": "com.yourcompany.melodia"
    },
    "android": {
      "package": "com.yourcompany.melodia"
    }
  }
}
```

### 3.2 Redirect URI Ayarları

Spotify Developer Dashboard'da:

1. **Settings** sekmesine gidin
2. **Redirect URIs** bölümüne `spoti://auth/callback` ekleyin
3. **Save** butonuna tıklayın

## 4. Gerekli Scopes

Uygulama şu Spotify scopes'larını kullanır:

- `user-read-recently-played`: Son çalınan şarkıları okuma
- `user-read-private`: Kullanıcı profil bilgilerini okuma
- `user-read-email`: Email adresini okuma
- `user-top-read`: En çok dinlenen şarkıları okuma
- `playlist-read-private`: Özel playlist'leri okuma
- `playlist-read-collaborative`: İşbirlikçi playlist'leri okuma

## 5. Test Etme

### 5.1 Uygulamayı Başlatma

```bash
npm start
# veya
yarn start
```

### 5.2 Login Testi

1. Uygulamayı açın
2. "Spotify ile Giriş Yap" butonuna tıklayın
3. Spotify hesabınızla giriş yapın
4. Gerekli izinleri verin
5. Başarılı giriş sonrası onboarding ekranına yönlendirilmelisiniz

## 6. Hata Ayıklama

### 6.1 Yaygın Hatalar

**"Invalid redirect URI" hatası:**

- Spotify Developer Dashboard'da redirect URI'nin doğru olduğundan emin olun
- `spoti://auth/callback` formatında olmalı

**"Invalid client" hatası:**

- Client ID ve Client Secret'ın doğru olduğundan emin olun
- .env dosyasının doğru konumda olduğundan emin olun

**"Scope not allowed" hatası:**

- Spotify Developer Dashboard'da gerekli scopes'ların aktif olduğundan emin olun

### 6.2 Debug Logları

Uygulama çalışırken console'da şu logları görebilirsiniz:

- Auth request detayları
- Token exchange sonuçları
- Kullanıcı bilgileri

## 7. Production Deployment

### 7.1 Production Redirect URI

Production için farklı bir redirect URI kullanmanız gerekebilir:

- `https://your-app.com/auth/callback` (web için)
- `your-app://auth/callback` (mobile için)

### 7.2 Environment Variables

Production ortamında environment variables'ları güvenli bir şekilde yönetin:

- Expo EAS Build için EAS Secrets kullanın
- Vercel/Netlify gibi platformlarda environment variables ayarlayın

## 8. Güvenlik Notları

- Client Secret'ı asla client-side kodda expose etmeyin
- Production'da HTTPS kullanın
- Token'ları güvenli bir şekilde saklayın (expo-secure-store kullanılıyor)
- Düzenli olarak token'ları refresh edin

## 9. Ek Kaynaklar

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Spotify OAuth 2.0 Guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/)
