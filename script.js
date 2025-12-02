// Định nghĩa các biến DOM
const message = document.getElementById('message');
const showButton = document.getElementById('showButton');
const videoContainer = document.getElementById('videoContainer');
const birthdayVideo = document.getElementById('birthdayVideo');

// Khởi tạo Canvas Confetti
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let particles = [];
const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

// Cấu hình Confetti và Animation (giữ nguyên từ phiên bản trước)
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function ConfettiParticle() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = Math.random() * 8 + 2;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.tilt = Math.floor(Math.random() * 10) - 10;
    this.tiltAngle = 0;
    this.tiltAngleIncrement = Math.random() * 0.1 + 0.05;
    this.velocity = {
        x: (Math.random() - 0.5) * 15,
        y: (Math.random() * -18) - 5
    };
    this.gravity = 0.5;
    this.dampening = 0.9;
}

ConfettiParticle.prototype.update = function() {
    this.velocity.y += this.gravity;
    this.velocity.x *= this.dampening;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.tiltAngle += this.tiltAngleIncrement;
    this.tilt = Math.sin(this.tiltAngle) * 25;
};

ConfettiParticle.prototype.draw = function() {
    ctx.beginPath();
    ctx.lineWidth = this.radius * 2;
    ctx.strokeStyle = this.color;
    ctx.moveTo(this.x + this.tilt, this.y);
    ctx.lineTo(this.x, this.y + this.tilt);
    ctx.stroke();
};

function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.y < canvas.height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }

    if (particles.length > 0) {
        requestAnimationFrame(animateConfetti);
    }
}

function shootConfetti() {
    const count = 75;
    for (let i = 0; i < count; i++) {
        particles.push(new ConfettiParticle());
    }
    animateConfetti();
}

// --- LOGIC MỚI CHO TƯƠNG TÁC THIỆP ---

// Hàm hiển thị thông điệp và pháo hoa
function showMessageAndConfetti() {
    // Ẩn video và container
    videoContainer.classList.add('hidden-element');

    // Hiển thị thông điệp
    message.classList.remove('hidden-element');
    setTimeout(() => {
        // Đợi một chút để transition hoạt động mượt mà
        message.classList.add('visible');
    }, 100);

    // Kích hoạt pháo hoa
    shootConfetti();
}

// Sự kiện khi video kết thúc
birthdayVideo.addEventListener('ended', () => {
    showMessageAndConfetti();
});

// Sự kiện khi người dùng tắt video (bấm nút dừng hoặc thoát fullscreen)
birthdayVideo.addEventListener('pause', () => {
    // Nếu video bị dừng và chưa kết thúc, hỏi người dùng có muốn bỏ qua không
    if (birthdayVideo.currentTime < birthdayVideo.duration && !message.classList.contains('visible')) {
        // Thay thế cho alert()
        if (window.confirm('Bạn có muốn bỏ qua video và xem thông điệp chúc mừng không?')) {
            // Tắt video và hiển thị thông điệp
            birthdayVideo.pause();
            birthdayVideo.currentTime = 0;
            showMessageAndConfetti();
        } else {
            // Tiếp tục chơi video
            birthdayVideo.play().catch(e => console.error("Could not resume play:", e));
        }
    }
});

// Hàm được gọi khi nhấn nút "Mở quà"
function revealMessage() {
    // 1. Ẩn nút "Mở quà"
    showButton.classList.add('hidden-element');

    // 2. Hiện container video và phát video
    videoContainer.classList.remove('hidden-element');

    // Chơi video (nếu có nguồn hợp lệ)
    if (birthdayVideo.src || birthdayVideo.querySelector('source') && birthdayVideo.querySelector('source').src) {
        // Đảm bảo video bắt đầu từ đầu
        birthdayVideo.currentTime = 0;

        // Xử lý Autoplay
        birthdayVideo.play().catch(error => {
            console.warn("Autoplay bị chặn. Yêu cầu người dùng bấm Play.");
            // Hiển thị thông báo nếu Autoplay bị chặn
            const titleElement = document.getElementById('title');
            titleElement.textContent = "Nhấn Play để xem món quà đầu tiên!";

            // Thêm nút Play thủ công để người dùng tương tác
            const manualPlayButton = document.createElement('button');
            manualPlayButton.textContent = '▶️ Xem Video';
            manualPlayButton.className = 'mt-4 px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300';
            manualPlayButton.onclick = () => {
                birthdayVideo.play().then(() => {
                    manualPlayButton.remove();
                    titleElement.textContent = "Chúc mừng sinh nhật em!";
                }).catch(e => console.error("Lỗi phát video:", e));
            };
            videoContainer.after(manualPlayButton);
        });
    }

    // Chặn sự kiện click lặp lại
    showButton.onclick = null;
}