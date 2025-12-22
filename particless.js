const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

// Initial Canvas Size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
// Mouse settings with detailed properties
let mouse = { 
    x: null, 
    y: null, 
    radius: 180, 
    lastMoved: Date.now() 
};

// --- Event Listeners ---
window.addEventListener('mousemove', (e) => { 
    mouse.x = e.x; 
    mouse.y = e.y; 
    mouse.lastMoved = Date.now(); 
});

window.addEventListener('touchmove', (e) => { 
    mouse.x = e.touches[0].clientX; 
    mouse.y = e.touches[0].clientY; 
    mouse.lastMoved = Date.now(); 
});

window.addEventListener('resize', () => { 
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
    init(); 
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

const colors = [
    'rgba(0, 247, 255,',  // Cyan
    'rgba(255, 0, 230,',  // Pink
    'rgba(111, 0, 255,',  // Purple
    'rgba(0, 114, 255,'   // Royal Blue
];

function init() {
    particlesArray = [];
    
    // Detailed Font & Position Scaling
    let fontSize = window.innerWidth < 600 ? window.innerWidth * 0.15 : 100;
    if (fontSize > 120) fontSize = 120;
    let textY = window.innerWidth < 600 ? 180 : 210; 

    ctx.font = 'bold ' + fontSize + 'px Verdana';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    
    // Drawing Text for Scanning
    ctx.fillText('SHIV', canvas.width / 2, textY);
    ctx.fillText('COMPUTER', canvas.width / 2, textY + fontSize * 0.9);
    
    const textData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Scanning Text Particles
    let gap = window.innerWidth < 600 ? 6 : 5; 
    for (let y = 0; y < textData.height; y += gap) {
        for (let x = 0; x < textData.width; x += gap) {
            if (textData.data[(y * 4 * textData.width) + (x * 4) + 3] > 128) {
                let colorBase = colors[Math.floor(Math.random() * colors.length)];
                particlesArray.push(new Particle(x, y, colorBase, true));
            }
        }
    }

    // 2. Extra Filler Bubbles (Full Screen Coverage)
    let extraParticlesCount = (canvas.width * canvas.height) / 9000;
    for (let i = 0; i < extraParticlesCount; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let colorBase = colors[Math.floor(Math.random() * colors.length)];
        particlesArray.push(new Particle(x, y, colorBase, false));
    }
}

class Particle {
    constructor(x, y, color, isText) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseX = x;
        this.baseY = y;
        this.color = color;
        this.isText = isText;
        
        // Sizes
        this.minSize = 2.5; 
        this.maxSize = isText ? (Math.random() * 8 + 4) : (Math.random() * 25 + 12);
        this.size = this.maxSize;
        
        // Movement Physics
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.density = (Math.random() * 30) + 10;
        this.friction = 0.95;
        this.ease = 0.1;

        // Letters 'S' and 'C' Logic
        this.hasLetter = !isText && Math.random() > 0.6; 
        if (this.hasLetter) {
            this.letter = Math.random() > 0.5 ? 'S' : 'C';
            this.alpha = 0;
            this.fadeSpeed = 0.005 + Math.random() * 0.01;
            this.fadeDir = 1;
        }
    }

    draw() {
        ctx.beginPath();
        // Shiny 3D Gradient
        let gradient = ctx.createRadialGradient(
            this.x - this.size / 3, this.y - this.size / 3, this.size / 10, 
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); 
        gradient.addColorStop(0.4, this.color + '0.8)'); 
        gradient.addColorStop(1, this.color + '0.1)'); 

        ctx.fillStyle = gradient;
        
        // Glow for text particles
        if (this.isText && this.size < 5) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'white';
        }

        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Fading Letters S & C
        if (this.hasLetter) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.font = `bold ${this.size * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.letter, this.x, this.y);
            
            // Fading logic
            this.alpha += this.fadeSpeed * this.fadeDir;
            if (this.alpha > 0.9 || this.alpha < 0) this.fadeDir *= -1;
        }
    }

    update() {
        let isIdle = (Date.now() - mouse.lastMoved > 2500);

        // --- Mouse Interaction ---
        if (mouse.x !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                let force = (mouse.radius - distance) / mouse.radius;
                let directionX = (dx / distance) * force * this.density;
                let directionY = (dy / distance) * force * this.density;
                this.x -= directionX;
                this.y -= directionY;
            }
        }

        // --- Movement States ---
        if (isIdle && this.isText) {
            // Smoothly Form Text
            let dx_home = this.baseX - this.x;
            let dy_home = this.baseY - this.y;
            this.x += dx_home * this.ease;
            this.y += dy_home * this.ease;
            this.size += (this.minSize - this.size) * this.ease;
        } else {
            // Float Freely
            this.x += this.vx;
            this.y += this.vy;
            this.size += (this.maxSize - this.size) * 0.05;

            // Boundary Check
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        this.draw();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    requestAnimationFrame(animate);
}

// Initial start
init();
animate();
