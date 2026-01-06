const video = document.getElementById('video');
const startBtn = document.getElementById('start-btn');
const canvas = document.getElementById('canvas');
const finalImage = document.getElementById('final-image');
const downloadBtn = document.getElementById('download-btn');
const countdownEl = document.getElementById('countdown');
const flashEl = document.getElementById('flash-effect');

const totalPhotos = 4;
let capturedPhotos = [];

// Fungsi pembantu untuk membuat jeda (delay)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Akses Kamera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { video.srcObject = stream; })
    .catch(err => { alert("Kamera tidak aktif atau izin ditolak"); });

startBtn.addEventListener('click', async () => {
    capturedPhotos = [];
    startBtn.disabled = true; // Matikan tombol saat proses berlangsung
    startBtn.innerText = "Sesi Dimulai...";
    
    for (let i = 0; i < totalPhotos; i++) {
        // 1. Jalankan Countdown 3 detik
        await startCountdown(3);
        
        // 2. Efek Flash (Kilatan Kamera)
        triggerFlash();
        
        // 3. Ambil Foto
        takeSnapshot();
        
        // 4. Jeda 2 detik sebelum foto berikutnya (kecuali foto terakhir)
        if (i < totalPhotos - 1) {
            countdownEl.style.fontSize = "30px";
            countdownEl.innerText = "Siap-siap...";
            await wait(2000); 
            countdownEl.style.fontSize = "120px"; // Balikkan ke ukuran besar untuk angka
        }
    }
    // ... (variabel yang sudah ada sebelumnya) ...
const filterBtns = document.querySelectorAll('.filter-btn');
let currentFilter = "none";

// Logika Ganti Filter
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Hapus class active dari tombol lain
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Simpan filter yang dipilih dan terapkan ke video preview
        currentFilter = btn.getAttribute('data-filter');
        video.style.filter = currentFilter;
    });
});

function takeSnapshot() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 800;
    tempCanvas.height = 600;

    // TERAPKAN FILTER KE CANVAS
    tempCtx.filter = currentFilter;

    // Mirroring & Draw
    tempCtx.translate(tempCanvas.width, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    
    capturedPhotos.push(tempCanvas.toDataURL('image/png'));
}

    
    // 5. Proses jadi Frame Kopi
    drawFinalCoffeeStrip();
    
    startBtn.disabled = false;
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
                countdownEl.innerText = ""; // Bersihkan angka saat jepret
                resolve();
            } else {
                countdownEl.innerText = count;
            }
        }, 1000);
    });
}

function triggerFlash() {
    flashEl.style.opacity = "1";
    setTimeout(() => {
        flashEl.style.opacity = "0";
    }, 150); // Kilatan cepat 150ms
}

function takeSnapshot() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 800;
    tempCanvas.height = 600;

    // Efek Mirror
    tempCtx.translate(tempCanvas.width, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    
    capturedPhotos.push(tempCanvas.toDataURL('image/png'));
}

function drawFinalCoffeeStrip() {
    const ctx = canvas.getContext('2d');
    const stripWidth = 500;
    const stripHeight = 1600;
    const photoWidth = 420;
    const photoHeight = 315;

    canvas.width = stripWidth;
    canvas.height = stripHeight;

    // Background Frame
    ctx.fillStyle = "#fff4e6"; 
    ctx.fillRect(0, 0, stripWidth, stripHeight);

    // Border Frame
    ctx.strokeStyle = "#4b3832";
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, stripWidth - 20, stripHeight - 20);

    let loadedImages = 0;
    capturedPhotos.forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const xPos = (stripWidth - photoWidth) / 2;
            const yPos = 80 + (index * (photoHeight + 40));

            ctx.shadowColor = "rgba(0,0,0,0.3)";
            ctx.shadowBlur = 15;
            ctx.drawImage(img, xPos, yPos, photoWidth, photoHeight);
            ctx.shadowBlur = 0;

            loadedImages++;
            if (loadedImages === totalPhotos) {
                drawFooter(ctx, stripWidth, stripHeight);
            }
        };
    });
}

function drawFooter(ctx, w, h) {
    ctx.fillStyle = "#4b3832";
    ctx.font = "italic bold 30px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("☕ cakepnaaa giii", w / 2, h - 80);
    
    ctx.font = "18px Arial";
    ctx.fillText("Captured with love", w / 2, h - 50);

    const finalData = canvas.toDataURL('image/png');
    finalImage.src = finalData;
    downloadBtn.href = finalData;
    downloadBtn.download = "coffee-photobooth.png";
    downloadBtn.style.display = "block";
}

// Ambil elemen layar
const cameraScreen = document.getElementById('camera-screen');
const resultScreen = document.getElementById('result-screen');

// ... (Simpan kode kamera, startBtn, dll tetap sama dengan sebelumnya) ...

startBtn.addEventListener('click', async () => {
    capturedPhotos = [];
    startBtn.disabled = true;
    startBtn.innerText = "Sesi Dimulai...";
    
    for (let i = 0; i < totalPhotos; i++) {
        await startCountdown(3);
        triggerFlash();
        takeSnapshot();
        
        if (i < totalPhotos - 1) {
            countdownEl.style.fontSize = "30px";
            countdownEl.innerText = "Siap-siap...";
            await wait(2000); 
            countdownEl.style.fontSize = "120px";
        }
    }
    
    // TAMPILKAN HALAMAN BARU
    showResultPage();
});

function showResultPage() {
    // 1. Proses gambar ke canvas (Frame Kopi)
    drawFinalCoffeeStrip();
    
    // 2. Sembunyikan layar kamera, Munculkan layar hasil
    cameraScreen.style.display = "none";
    resultScreen.style.display = "block";
}

// ... (Fungsi drawFinalCoffeeStrip dan drawFooter tetap sama) ...
