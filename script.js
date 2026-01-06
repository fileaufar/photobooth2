const video = document.getElementById('video');
const startBtn = document.getElementById('start-btn');
const canvas = document.getElementById('canvas');
const finalImage = document.getElementById('final-image');
const downloadBtn = document.getElementById('download-btn');
const countdownEl = document.getElementById('countdown');
const flashEl = document.getElementById('flash-effect');
const cameraScreen = document.getElementById('camera-screen');
const resultScreen = document.getElementById('result-screen');
const filterBtns = document.querySelectorAll('.filter-btn');

let capturedPhotos = [];
let currentFilter = "none";
const totalPhotos = 4;

// Akses Kamera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { video.srcObject = stream; })
    .catch(err => { alert("Mohon izinkan akses kamera."); });

// Pilih Filter
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        video.style.filter = currentFilter;
    });
});

// Jalankan Sesi Foto
startBtn.addEventListener('click', async () => {
    capturedPhotos = [];
    startBtn.disabled = true;
    startBtn.innerText = "Processing...";

    for (let i = 0; i < totalPhotos; i++) {
        // 1. Countdown 3 detik
        for (let count = 3; count > 0; count--) {
            countdownEl.innerText = count;
            await new Promise(r => setTimeout(r, 1000));
        }
        countdownEl.innerText = "";

        // 2. Flash
        flashEl.style.opacity = "1";
        setTimeout(() => flashEl.style.opacity = "0", 100);

        // 3. Ambil Foto
        takeSnapshot();

        // 4. Jeda antar foto 2 detik
        if (i < totalPhotos - 1) {
            countdownEl.style.fontSize = "30px";
            countdownEl.innerText = "Siap-siap...";
            await new Promise(r => setTimeout(r, 2000));
            countdownEl.style.fontSize = "100px";
        }
    }

    // Pindah ke halaman hasil
    await drawFinalStrip();
    cameraScreen.style.display = "none";
    resultScreen.style.display = "block";
});

function takeSnapshot() {
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    tempCanvas.width = 800;
    tempCanvas.height = 600;

    ctx.filter = currentFilter;
    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 800, 600);
    
    capturedPhotos.push(tempCanvas.toDataURL('image/png'));
}

// ... (Bagian atas script tetap sama seperti sebelumnya) ...

async function drawFinalStrip() {
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 1600;

    // 1. Gambar Background
    ctx.fillStyle = "#fff4e6";
    ctx.fillRect(0, 0, 500, 1600);
    
    // 2. Gambar Border
    ctx.strokeStyle = "#4b3832";
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, 480, 1580);

    // 3. Masukkan Foto satu per satu
    for (let i = 0; i < capturedPhotos.length; i++) {
        const img = new Image();
        img.src = capturedPhotos[i];
        await new Promise(r => img.onload = r);
        
        const xPos = 40;
        const yPos = 60 + (i * 360);
        const w = 420;
        const h = 315;

        // Pastikan shadow tidak ikut ter-filter
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 15;
        
        // Terapkan filter yang dipilih saat ini ke konteks canvas
        ctx.filter = currentFilter; 
        
        ctx.drawImage(img, xPos, yPos, w, h);
        ctx.restore(); // Kembalikan ke settingan awal (tanpa filter) untuk foto berikutnya
    }

    // 4. Tambahkan Teks Footer dengan Font Poppins
    ctx.fillStyle = "#4b3832";
    // Gunakan font Poppins (pastikan sudah diload di HTML)
    ctx.font = "bold italic 25px Poppins"; 
    ctx.textAlign = "center";
    ctx.fillText("☕ Everyone Has Their Own Space", 250, 1540);

    // 5. Konversi ke Data URL untuk Download
    const finalData = canvas.toDataURL('image/png');
    finalImage.src = finalData;
    downloadBtn.href = finalData;
    downloadBtn.download = "coffee_photobooth_poppins.png";
}
