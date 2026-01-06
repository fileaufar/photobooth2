const video = document.getElementById('video');
const startBtn = document.getElementById('start-btn');
const canvas = document.getElementById('canvas');
const finalImage = document.getElementById('final-image');
const downloadBtn = document.getElementById('download-btn');
const countdownEl = document.getElementById('countdown');
const flashEl = document.getElementById('flash-effect');
const cameraScreen = document.getElementById('camera-screen');
const resultScreen = document.getElementById('result-screen');

// AMBIL SEMUA TOMBOL FILTER
const filterBtns = document.querySelectorAll('.filter-btn');

const totalPhotos = 4;
let capturedPhotos = [];
let currentFilter = "none"; // Filter default
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// A. LOGIKA PILIH FILTER (Tambahkan ini agar tombol bisa diklik)
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Hapus status active dari tombol sebelumnya
        filterBtns.forEach(b => b.classList.remove('active'));
        // Tambah status active ke tombol yang diklik
        btn.classList.add('active');
        
        // Ambil nilai filter dari atribut data-filter
        currentFilter = btn.getAttribute('data-filter');
        
        // Terapkan ke video preview agar user bisa melihat perubahannya
        video.style.filter = currentFilter;
        console.log("Filter diganti ke:", currentFilter); // Cek di console browser (F12)
    });
});

// B. AKSES KAMERA
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { video.srcObject = stream; })
    .catch(err => { alert("Kamera tidak aktif"); });

// C. PROSES FOTO
startBtn.addEventListener('click', async () => {
    capturedPhotos = [];
    startBtn.disabled = true;
    
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
    
    showResultPage();
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

function triggerFlash() {
    flashEl.style.opacity = "1";
    setTimeout(() => { flashEl.style.opacity = "0"; }, 150);
}

function takeSnapshot() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 800;
    tempCanvas.height = 600;

    // TERAPKAN FILTER KE HASIL FOTO
    tempCtx.filter = currentFilter;

    tempCtx.translate(tempCanvas.width, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    
    capturedPhotos.push(tempCanvas.toDataURL('image/png'));
}

function showResultPage() {
    drawFinalCoffeeStrip();
    cameraScreen.style.display = "none";
    resultScreen.style.display = "block";
}

function drawFinalCoffeeStrip() {
    const ctx = canvas.getContext('2d');
    const stripWidth = 500;
    const stripHeight = 1600;
    const photoWidth = 420;
    const photoHeight = 315;

    canvas.width = stripWidth;
    canvas.height = stripHeight;

    ctx.fillStyle = "#fff4e6"; 
    ctx.fillRect(0, 0, stripWidth, stripHeight);
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
            ctx.drawImage(img, xPos, yPos, photoWidth, photoHeight);
            loadedImages++;
            if (loadedImages === totalPhotos) {
                drawFooter(ctx, stripWidth, stripHeight);
            }
        };
    });
}

function drawFooter(ctx, w, h) {
    // ... kode gambar teks kopi kamu ...
    ctx.fillStyle = "#4b3832";
    ctx.font = "italic bold 30px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("☕ Coffee Break Moments", w / 2, h - 80);

    // INI BAGIAN PENTINGNYA:
    const finalData = canvas.toDataURL('image/png'); // Mengambil data gambar dari canvas
    
    const finalImage = document.getElementById('final-image');
    const downloadBtn = document.getElementById('download-btn');

    finalImage.src = finalData;      // Menampilkan gambar di layar hasil
    downloadBtn.href = finalData;     // Memasukkan data gambar ke tombol download
    downloadBtn.download = "my-coffee-shot.png"; // Nama file saat diunduh
    
    // Memastikan tombol terlihat
    downloadBtn.style.display = "inline-block"; 
}
