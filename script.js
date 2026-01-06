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
const frameImg = new Image();
frameImg.src = 'assets/custom_frame.png'; 

let isFrameLoaded = false;
frameImg.onload = () => { isFrameLoaded = true; };

// 1. AKSES KAMERA
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { video.srcObject = stream; })
    .catch(err => { alert("Mohon izinkan akses kamera."); });

// 2. PILIH FILTER (Update Preview Video)
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        video.style.filter = currentFilter; // Update tampilan di layar
    });
});

// 3. JALANKAN SESI FOTO
startBtn.addEventListener('click', async () => {
    if (!isFrameLoaded) {
        alert("Frame belum siap. Tunggu sebentar.");
        return;
    }
    
    capturedPhotos = [];
    startBtn.disabled = true;

    for (let i = 0; i < totalPhotos; i++) {
        for (let count = 3; count > 0; count--) {
            countdownEl.innerText = count;
            await new Promise(r => setTimeout(r, 1000));
        }
        countdownEl.innerText = "";

        // Efek Flash
        flashEl.style.opacity = "1";
        setTimeout(() => flashEl.style.opacity = "0", 100);

        // AMBIL FOTO (Penting: Filter diterapkan di sini)
        takeSnapshot();

        if (i < totalPhotos - 1) {
            countdownEl.style.fontSize = "30px";
            countdownEl.innerText = "Siap-siap...";
            await new Promise(r => setTimeout(r, 2000));
            countdownEl.style.fontSize = "100px";
        }
    }

    await drawFinalStrip();
    cameraScreen.style.display = "none";
    resultScreen.style.display = "block";
    startBtn.disabled = false;
});

// 4. FUNGSI AMBIL SNAPSHOT DENGAN FILTER
function takeSnapshot() {
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    tempCanvas.width = 800;
    tempCanvas.height = 600;

    // KUNCI: Terapkan filter ke canvas sementara SEBELUM drawImage
    ctx.filter = currentFilter; 

    // Mirroring
    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);
    
    // Gambar video ke canvas sementara
    ctx.drawImage(video, 0, 0, 800, 600);
    
    // Simpan hasil gambar yang SUDAH berfilter ke array
    capturedPhotos.push(tempCanvas.toDataURL('image/png'));
}

// 5. MENYUSUN HASIL AKHIR (Layering: Foto di bawah, Frame di atas)
async function drawFinalStrip() {
    const ctx = canvas.getContext('2d');
    
    canvas.width = frameImg.width;   
    canvas.height = frameImg.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Koordinat lubang transparan (Sesuaikan dengan frame kamu)
    const photoPositions = [
        { x: 40, y: 50, w: 520, h: 390 },  
        { x: 40, y: 440, w: 520, h: 390 }, 
        { x: 40, y: 830, w: 520, h: 390 }, 
        { x: 40, y: 1220, w: 520, h: 390 } 
    ];

    // GAMBAR FOTO (Lapisan Bawah)
    for (let i = 0; i < capturedPhotos.length; i++) {
        const img = new Image();
        img.src = capturedPhotos[i];
        await new Promise(resolve => {
            img.onload = () => {
                const pos = photoPositions[i];
                // Karena di takeSnapshot sudah diberi filter, di sini tidak perlu ctx.filter lagi
                ctx.drawImage(img, pos.x, pos.y, pos.w, pos.h);
                resolve();
            };
        });
    }

    // GAMBAR FRAME (Lapisan Atas/Overlay)
    ctx.filter = "none"; // Pastikan frame tidak ikut ter-filter
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // Tambahkan Teks Footer (Opsional - Font Poppins)
    await document.fonts.ready;
    ctx.fillStyle = "#3a2a22";
    ctx.textAlign = "center";
    ctx.font = "bold 24px Poppins";
    // ctx.fillText("Jiwani Coffee Moments", canvas.width / 2, canvas.height - 60);

    const finalData = canvas.toDataURL('image/png');
    finalImage.src = finalData;
    downloadBtn.href = finalData;
    downloadBtn.download = "jiwani_coffee_result.png";
}
