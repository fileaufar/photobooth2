const video = document.getElementById('video');
const startBtn = document.getElementById('start-btn');
const canvas = document.getElementById('canvas');
const finalImage = document.getElementById('final-image');
const downloadBtn = document.getElementById('download-btn');
const countdownEl = document.getElementById('countdown');

const totalPhotos = 4;
let capturedPhotos = [];

// Akses Kamera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { video.srcObject = stream; })
    .catch(err => { alert("Kamera tidak aktif"); });

startBtn.addEventListener('click', async () => {
    capturedPhotos = [];
    startBtn.innerText = "Siap-siap...";
    
    for (let i = 0; i < totalPhotos; i++) {
        await startCountdown(3);
        takeSnapshot();
    }
    
    drawFinalCoffeeStrip();
    startBtn.innerText = "Mulai Foto Lagi (4x)";
});

function startCountdown(seconds) {
    return new Promise(resolve => {
        let count = seconds;
        countdownEl.innerText = count;
        let timer = setInterval(() => {
            count--;
            if (count <= 0) {
                clearInterval(timer);
                countdownEl.innerText = "📸";
                setTimeout(() => { countdownEl.innerText = ""; }, 500);
                resolve();
            } else {
                countdownEl.innerText = count;
            }
        }, 1000);
    });
}

function takeSnapshot() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 800;
    tempCanvas.height = 600;

    // Mirroring & Draw
    tempCtx.translate(tempCanvas.width, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    
    capturedPhotos.push(tempCanvas.toDataURL('image/png'));
}

function drawFinalCoffeeStrip() {
    const ctx = canvas.getContext('2d');
    
    // Setting Ukuran Strip (Rasio 1:3.5)
    const stripWidth = 500;
    const stripHeight = 1600;
    const photoWidth = 420;
    const photoHeight = 315;
    const padding = 40;

    canvas.width = stripWidth;
    canvas.height = stripHeight;

    // 1. Background Frame (Warna Krem Kopi)
    ctx.fillStyle = "#fff4e6"; 
    ctx.fillRect(0, 0, stripWidth, stripHeight);

    // 2. Tambahkan Dekorasi (Border Cokelat Tua)
    ctx.strokeStyle = "#4b3832";
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, stripWidth - 20, stripHeight - 20);

    // 3. Masukkan Foto satu per satu
    capturedPhotos.forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const xPos = (stripWidth - photoWidth) / 2;
            const yPos = 80 + (index * (photoHeight + 40));

            // Efek Shadow Foto
            ctx.shadowColor = "rgba(0,0,0,0.3)";
            ctx.shadowBlur = 15;
            ctx.drawImage(img, xPos, yPos, photoWidth, photoHeight);
            ctx.shadowBlur = 0; // Reset shadow

            // Jika Foto Terakhir, Tambahkan Teks/Logo Kopi di Bawah
            if (index === totalPhotos - 1) {
                drawFooter(ctx, stripWidth, stripHeight);
            }
        };
    });
}

function drawFooter(ctx, w, h) {
    ctx.fillStyle = "#4b3832";
    ctx.font = "italic bold 30px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("☕ Coffee Break Moments", w / 2, h - 80);
    
    ctx.font = "18px Arial";
    ctx.fillText("Captured with Online Photobooth", w / 2, h - 50);

    // Konversi ke Image Download
    const finalData = canvas.toDataURL('image/png');
    finalImage.src = finalData;
    downloadBtn.href = finalData;
    downloadBtn.download = "coffee-photobooth.png";
    downloadBtn.style.display = "block";
}
