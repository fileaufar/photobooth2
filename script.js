const video = document.getElementById('video');
const startBtn = document.getElementById('start-btn');
const canvas = document.getElementById('canvas');
const finalImage = document.getElementById('final-image');
const downloadBtn = document.getElementById('download-btn');
const countdownEl = document.getElementById('countdown');

const totalPhotos = 4; // Berapa foto yang diambil
let capturedPhotos = [];

// 1. Akses Kamera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { video.srcObject = stream; })
    .catch(err => { alert("Kamera tidak diizinkan atau tidak ditemukan"); });

// 2. Fungsi Ambil Foto
startBtn.addEventListener('click', async () => {
    capturedPhotos = [];
    startBtn.disabled = true;
    
    for (let i = 0; i < totalPhotos; i++) {
        await startCountdown(3); // Timer 3 detik tiap foto
        takeSnapshot();
    }
    
    drawFinalStrip();
    startBtn.disabled = false;
});

function startCountdown(seconds) {
    return new Promise(resolve => {
        let count = seconds;
        countdownEl.innerText = count;
        let timer = setInterval(() => {
            count--;
            if (count <= 0) {
                clearInterval(timer);
                countdownEl.innerText = "";
                resolve();
            } else {
                countdownEl.innerText = count;
            }
        }, 1000);
    });
}

function takeSnapshot() {
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Gambar dari video ke canvas
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); // Mirroring
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    capturedPhotos.push(canvas.toDataURL('image/png'));
}

// 3. Gabungkan Semua Foto & Download
function drawFinalStrip() {
    const ctx = canvas.getContext('2d');
    const imgWidth = 300;
    const imgHeight = 225;
    const padding = 20;

    // Set ukuran canvas hasil (Vertikal strip)
    canvas.width = imgWidth + (padding * 2);
    canvas.height = (imgHeight * totalPhotos) + (padding * (totalPhotos + 1));

    ctx.fillStyle = "white"; // Warna Background Frame
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    capturedPhotos.forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const yOffset = padding + (index * (imgHeight + padding));
            ctx.drawImage(img, padding, yOffset, imgWidth, imgHeight);
            
            if (index === totalPhotos - 1) {
                const finalData = canvas.toDataURL('image/png');
                finalImage.src = finalData;
                downloadBtn.href = finalData;
                downloadBtn.download = "photobooth-result.png";
                downloadBtn.style.display = "inline-block";
            }
        };
    });
}
