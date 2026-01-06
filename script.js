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
frameImg.src = 'assets/custom_frame.png'; // Path ke frame PNG kamu

// Pastikan frame sudah diload sebelum memulai sesi
let isFrameLoaded = false;
frameImg.onload = () => {
    isFrameLoaded = true;
    console.log("Custom Frame Loaded.");
};
frameImg.onerror = () => {
    console.error("Gagal memuat custom_frame.png. Pastikan file ada di assets/.");
    alert("Error: Custom frame tidak dapat dimuat!");
};

// Akses Kamera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { video.srcObject = stream; })
    .catch(err => { alert("Mohon izinkan akses kamera untuk memulai sesi."); });

// Pilih Filter
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        video.style.filter = currentFilter;
        console.log("Filter: " + currentFilter);
    });
});

// Jalankan Sesi Foto
startBtn.addEventListener('click', async () => {
    if (!isFrameLoaded) {
        alert("Frame belum siap. Mohon tunggu sebentar atau cek koneksi internet Anda.");
        return;
    }
    
    capturedPhotos = [];
    startBtn.disabled = true;
    startBtn.innerText = "Memulai Sesi...";

    for (let i = 0; i < totalPhotos; i++) {
        // 1. Countdown 3 detik
        for (let count = 3; count > 0; count--) {
            countdownEl.innerText = count;
            await new Promise(r => setTimeout(r, 1000));
        }
        countdownEl.innerText = "";

        // 2. Flash
        flashEl.style.opacity = "1";
        setTimeout(() => flashEl.style.opacity = "0", 100); // Kilat super cepat

        // 3. Ambil Foto
        takeSnapshot();

        // 4. Jeda antar foto 2 detik
        if (i < totalPhotos - 1) {
            countdownEl.style.fontSize = "30px";
            countdownEl.innerText = "Siap-siap untuk foto berikutnya...";
            await new Promise(r => setTimeout(r, 2000));
            countdownEl.style.fontSize = "100px";
        }
    }

    // 5. Pindah ke halaman hasil
    await drawFinalStrip();
    cameraScreen.style.display = "none";
    resultScreen.style.display = "block";
    startBtn.disabled = false; // Aktifkan lagi tombol setelah selesai
    startBtn.innerText = "Mulai Foto (4x)";
});

function takeSnapshot() {
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    tempCanvas.width = 800; // Resolusi capture tinggi
    tempCanvas.height = 600;

    ctx.filter = currentFilter; // Terapkan filter ke foto yang diambil
    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 800, 600);
    
    capturedPhotos.push(tempCanvas.toDataURL('image/png'));
}

async function drawFinalStrip() {
    const ctx = canvas.getContext('2d');
    
    // Pastikan ukuran canvas sinkron dengan ukuran file frame PNG
    canvas.width = frameImg.width;   
    canvas.height = frameImg.height;

    // 1. Bersihkan canvas total
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Tentukan posisi lubang foto (Sesuaikan dengan desain frame kamu)
    const photoPositions = [
        { x: 40, y: 50, w: 520, h: 390 },  
        { x: 40, y: 440, w: 520, h: 390 }, 
        { x: 40, y: 830, w: 520, h: 390 }, 
        { x: 40, y: 1220, w: 520, h: 390 } 
    ];

    // 3. GAMBAR FOTO (Lapisan Bawah)
    for (let i = 0; i < capturedPhotos.length; i++) {
        const img = new Image();
        img.src = capturedPhotos[i];
        
        await new Promise(resolve => {
            img.onload = () => {
                const pos = photoPositions[i];
                
                ctx.save(); // Simpan kondisi bersih
                
                // --- PAKSA FILTER DI SINI ---
                ctx.filter = currentFilter; 
                
                // Gambar foto ke area transparan frame
                ctx.drawImage(img, pos.x, pos.y, pos.w, pos.h);
                
                ctx.restore(); // Kembalikan ke kondisi tanpa filter (supaya frame tidak ikut ter-filter)
                resolve();
            };
        });
    }

    // 4. GAMBAR FRAME (Lapisan Atas)
    // Penting: Reset filter ke 'none' sebelum gambar frame agar warna frame asli tidak berubah
    ctx.filter = "none";
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 5. Finishing - Teks Footer (Opsional dengan Poppins)
    await document.fonts.ready;
    ctx.fillStyle = "#3a2a22"; // Jiwani Dark
    ctx.textAlign = "center";
    ctx.font = "bold 24px Poppins";
    // Gunakan posisi dinamis berdasarkan lebar frame
    // ctx.fillText("Jiwani Coffee Moments", canvas.width / 2, canvas.height - 60);

    // 6. Generate Hasil Akhir
    const finalData = canvas.toDataURL('image/png');
    finalImage.src = finalData;
    downloadBtn.href = finalData;
    downloadBtn.download = "jiwani_coffee_result.png";
}
