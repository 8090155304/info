const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

// Canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
let mouse = { 
    x: canvas.width / 2, 
    y: canvas.height / 2, 
    radius: 180, 
    lastMoved: Date.now(),
    isActive: false
};

// Mouse and touch events
window.addEventListener('mousemove', (e) => { 
    mouse.x = e.x; 
    mouse.y = e.y; 
    mouse.lastMoved = Date.now();
    mouse.isActive = true;
});

window.addEventListener('touchmove', (e) => { 
    e.preventDefault();
    mouse.x = e.touches[0].clientX; 
    mouse.y = e.touches[0].clientY; 
    mouse.lastMoved = Date.now();
    mouse.isActive = true;
}, { passive: false });

// Mouse leave detection
window.addEventListener('mouseleave', () => {
    mouse.isActive = false;
});

// Resize handler
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    mouse.x = canvas.width / 2;
    mouse.y = canvas.height / 2;
    init();
});

// Modern gradient colors
const colors = [
    'rgba(0, 247, 255,',
    'rgba(255, 0, 230,',
    'rgba(111, 0, 255,',
    'rgba(0, 114, 255,',
    'rgba(255, 200, 0,',
    'rgba(0, 255, 150,'
];

function init() {
    particlesArray = [];
    
    // Responsive text sizing
    let fontSize;
    if (window.innerWidth < 480) {
        fontSize = Math.min(window.innerWidth * 0.12, 70);
    } else if (window.innerWidth < 768) {
        fontSize = Math.min(window.innerWidth * 0.1, 90);
    } else {
        fontSize = Math.min(window.innerWidth * 0.08, 120);
    }
    
    let lineHeight = fontSize * 1.2;
    let textY = canvas.height * 0.3;

    // Draw text for particle extraction
    ctx.font = `bold ${fontSize}px 'Segoe UI', 'Arial', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    
    // First line
    ctx.fillText('SHIV', canvas.width / 2, textY);
    
    // Second line
    ctx.fillText('COMPUTER', canvas.width / 2, textY + lineHeight);
    
    // Extract text data for particles
    const textData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. TEXT PARTICLES with responsive density
    let gap;
    if (window.innerWidth < 480) {
        gap = 8;
    } else if (window.innerWidth < 768) {
        gap = 6;
    } else {
        gap = 5;
    }
    
    for (let y = 0; y < textData.height; y += gap) {
        for (let x = 0; x < textData.width; x += gap) {
            const alpha = textData.data[(y * 4 * textData.width) + (x * 4) + 3];
            if (alpha > 128) {
                particlesArray.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)], true));
            }
        }
    }

    // 2. FLOATING BACKGROUND PARTICLES
    let extraCount = Math.floor((canvas.width * canvas.height) / 15000);
    
    for (let i = 0; i < extraCount; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        particlesArray.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)], false));
    }
}

class Particle {
    constructor(x, y, color, isText) {
        this.baseX = x;
        this.baseY = y;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.color = color;
        this.isText = isText;
        
        // Size based on particle type
        this.minSize = 1.5;
        this.maxSize = isText 
            ? (Math.random() * 6 + 3)
            : (Math.random() * 15 + 8);
        
        this.size = this.maxSize;
        
        // Movement
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2;
        this.density = (Math.random() * 15) + 5;
        
        // Letter effect for floating particles
        this.hasLetter = !isText && Math.random() > 0.7;
        if (this.hasLetter) {
            this.letter = Math.random() > 0.5 ? 'S' : 'C';
            this.alpha = Math.random() * 0.5;
            this.fadeSpeed = 0.003 + Math.random() * 0.005;
            this.fadeDir = Math.random() > 0.5 ? 1 : -1;
        }
    }

    draw() {
        // Create gradient for glow effect
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, this.color + '0.7)');
        gradient.addColorStop(1, this.color + '0)');
        
        // Draw particle
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw letter inside bubble
        if (this.hasLetter) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.font = `bold ${this.size * 0.7}px 'Segoe UI', Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.letter, this.x, this.y);
            
            // Update fade animation
            this.alpha += this.fadeSpeed * this.fadeDir;
            if (this.alpha > 0.8 || this.alpha < 0.2) {
                this.fadeDir *= -1;
            }
        }
    }

    update() {
        const currentTime = Date.now();
        const timeSinceMouseMove = currentTime - mouse.lastMoved;
        const isIdle = timeSinceMouseMove > 3000 || !mouse.isActive;
        
        // Mouse interaction
        if (mouse.isActive) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < mouse.radius) {
                const force = (mouse.radius - dist) / mouse.radius;
                this.x -= (dx / dist) * force * this.density;
                this.y -= (dy / dist) * force * this.density;
                this.size = this.maxSize;
            }
        }
        
        // Behavior based on state
        if (isIdle && this.isText) {
            // Return to text position
            this.x += (this.baseX - this.x) * 0.05;
            this.y += (this.baseY - this.y) * 0.05;
            this.size += (this.minSize - this.size) * 0.05;
        } else {
            // Floating movement
            this.x += this.vx;
            this.y += this.vy;
            this.size += (this.maxSize - this.size) * 0.03;
            
            // Screen boundary with bounce
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        this.draw();
    }
}

function animate() {
    // Clear with subtle fade effect for trails
    ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update particles
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    
    requestAnimationFrame(animate);
}

// Initialize when page loads
window.addEventListener('load', () => {
    init();
    animate();
});
