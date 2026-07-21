// Detect touch device or mobile screen size dynamically inside events
const shouldDisableEffects = () => {
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isMobileWidth = window.innerWidth <= 950;
    return isTouchDevice || isMobileWidth;
};

// Minimal JS for the spotlight effect on cards
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
        if (shouldDisableEffects()) return; // Disable spotlight on mobile/touch
        
        const rect = card.getBoundingClientRect();
        // Update CSS variables for the spotlight effect
        card.style.setProperty('--x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--y', `${e.clientY - rect.top}px`);
    });
});

// Video Hover Play/Pause Logic - Desktop only
const video1 = document.getElementById('projectVideo1');
const video2 = document.getElementById('projectVideo2');
const video3 = document.getElementById('projectVideo3');
const video4 = document.getElementById('projectVideo4');

const videoList = [video1, video2, video3, video4];

// Video Play/Pause Logic - Desktop (Hover) & Mobile (Tap)
const slider = document.querySelector('.slider');

videoList.forEach(function(video) {
    if (video) {
        // Desktop Hover Events
        video.addEventListener("mouseover", function() {
            if (shouldDisableEffects()) return;
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Catch AbortError from hover interrupt
                });
            }
        });
        
        video.addEventListener("mouseout", function() {
            if (shouldDisableEffects()) return;
            video.pause();
        });

        // Mobile/Touch Tap Events
        const item = video.closest('.item');
        video.addEventListener("click", function(e) {
            if (!shouldDisableEffects()) return;
            e.preventDefault();
            e.stopPropagation();

            if (video.paused) {
                // Pause all other videos and deactivate them
                videoList.forEach(v => {
                    if (v && v !== video) {
                        v.pause();
                        const otherItem = v.closest('.item');
                        if (otherItem) otherItem.classList.remove('active');
                    }
                });

                // Play this video
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        // Catch mobile play errors
                    });
                }
                if (item) item.classList.add('active');
                if (slider) slider.classList.add('paused');
            } else {
                // Pause this video
                video.pause();
                if (item) item.classList.remove('active');

                // Resume slider if no other video is playing
                const anyPlaying = videoList.some(v => v && !v.paused);
                if (!anyPlaying && slider) {
                    slider.classList.remove('paused');
                }
            }
        });
    }
});

// Resume slider & pause videos on click outside the projects slider on mobile
document.addEventListener('click', (e) => {
    if (!shouldDisableEffects()) return;
    if (slider && !slider.contains(e.target)) {
        videoList.forEach(v => {
            if (v) {
                v.pause();
                const item = v.closest('.item');
                if (item) item.classList.remove('active');
            }
        });
        slider.classList.remove('paused');
    }
});

/* ==========================================================================
   2D COSMIC DARK GALAXY BACKGROUND ENGINE
   Renders rotating galaxy spiral arms, core glow, cosmic dust & shooting stars
   ========================================================================== */
class DarkGalaxyCanvas {
    constructor() {
        this.canvas = document.getElementById('cosmic-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.galaxyStars = [];
        this.bgStars = [];
        this.shootingStars = [];
        this.rotationAngle = 0;

        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;

        this.init();
    }

    init() {
        this.resize();
        
        window.addEventListener('resize', () => this.resize());

        // Parallax cursor / touch interaction
        const handleMove = (x, y) => {
            this.targetMouseX = (x - window.innerWidth / 2) * 0.05;
            this.targetMouseY = (y - window.innerHeight / 2) * 0.05;
        };

        window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        // Start animation loop
        this.animate();

        // Spawn shooting stars periodically
        setInterval(() => {
            if (Math.random() < 0.7) {
                this.spawnShootingStar();
            }
        }, 3000);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);

        this.createBackgroundStars();
        this.createGalaxySpiral();
    }

    // Deep space background stars (static/twinkling outside galaxy)
    createBackgroundStars() {
        const count = Math.floor((this.width * this.height) / 2500);
        this.bgStars = [];
        const colors = ['#ffffff', '#7ce9e6', '#b4a6fb', '#38bdf8', '#f472b6', '#fde047'];

        for (let i = 0; i < count; i++) {
            this.bgStars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 1.5 + 0.3,
                alpha: Math.random() * 0.8 + 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinkleDir: Math.random() < 0.5 ? 1 : -1,
                layer: Math.random() * 0.5 + 0.2
            });
        }
    }

    // Generate 2D Spiral Galaxy Structure
    createGalaxySpiral() {
        this.galaxyStars = [];
        const numStars = Math.min(1800, Math.floor((this.width * this.height) / 1000));
        const arms = 3; // 3 logarithmic spiral arms
        const armWidth = 0.4;
        const colors = [
            'rgba(255, 255, 255, ',
            'rgba(124, 233, 230, ',  // Cyan
            'rgba(180, 166, 251, ',  // Violet
            'rgba(56, 189, 248, ',   // Ice Blue
            'rgba(244, 114, 182, ',  // Pink
            'rgba(253, 224, 71, '    // Gold (Core)
        ];

        const maxRadius = Math.max(this.width, this.height) * 0.45;

        for (let i = 0; i < numStars; i++) {
            const distRatio = Math.pow(Math.random(), 2); // Dense towards galaxy core
            const distance = distRatio * maxRadius;

            // Spiral angle: theta = b * ln(r) + offset
            const armIndex = i % arms;
            const armAngle = (armIndex * 2 * Math.PI) / arms;
            const spiralAngle = distance * 0.006 + armAngle;

            // Scatter off the spiral arm axis
            const scatter = (Math.random() - 0.5) * distance * armWidth;
            const finalAngle = spiralAngle + (Math.random() - 0.5) * 0.3;

            // Orbital rotation speed (inner stars rotate slightly faster)
            const speed = (0.0003 + (1 - distRatio) * 0.0006);

            // Color selection based on distance to core
            let colorPrefix;
            if (distance < maxRadius * 0.15) {
                colorPrefix = Math.random() < 0.6 ? colors[5] : colors[0]; // Core gold/white
            } else if (distance < maxRadius * 0.4) {
                colorPrefix = colors[Math.floor(Math.random() * 3) + 1]; // Cyan/Violet/Ice blue
            } else {
                colorPrefix = colors[Math.floor(Math.random() * 4) + 1];
            }

            this.galaxyStars.push({
                distance,
                angle: finalAngle,
                scatter,
                speed,
                size: Math.random() * 1.8 + 0.4,
                baseAlpha: Math.random() * 0.7 + 0.3,
                alpha: Math.random() * 0.7 + 0.3,
                colorPrefix
            });
        }
    }

    spawnShootingStar() {
        this.shootingStars.push({
            x: Math.random() * this.width * 0.85,
            y: Math.random() * this.height * 0.4,
            length: Math.random() * 90 + 70,
            speed: Math.random() * 10 + 12,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
            alpha: 1,
            decay: Math.random() * 0.015 + 0.01
        });
    }

    animate() {
        // Parallax easing
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        this.ctx.clearRect(0, 0, this.width, this.height);

        const cx = this.width * 0.5 + this.mouseX;
        const cy = this.height * 0.45 + this.mouseY;
        const maxRadius = Math.max(this.width, this.height) * 0.45;

        // 1. Draw Deep Galaxy Core Glow Layers
        const coreGradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 0.7);
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        coreGradient.addColorStop(0.12, 'rgba(124, 233, 230, 0.25)');
        coreGradient.addColorStop(0.35, 'rgba(118, 50, 180, 0.18)');
        coreGradient.addColorStop(0.65, 'rgba(15, 23, 42, 0.10)');
        coreGradient.addColorStop(1, 'rgba(2, 1, 8, 0)');

        this.ctx.save();
        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, maxRadius * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        // 2. Draw Background Stars (twinkling)
        this.bgStars.forEach(star => {
            star.alpha += star.twinkleSpeed * star.twinkleDir;
            if (star.alpha > 0.9) { star.alpha = 0.9; star.twinkleDir = -1; }
            else if (star.alpha < 0.2) { star.alpha = 0.2; star.twinkleDir = 1; }

            const px = star.x + this.mouseX * star.layer;
            const py = star.y + this.mouseY * star.layer;

            this.ctx.save();
            this.ctx.globalAlpha = star.alpha;
            this.ctx.fillStyle = star.color;
            this.ctx.beginPath();
            this.ctx.arc(px, py, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // 3. Draw & Rotate 2D Galaxy Spiral Arms with Elliptical Perspective Tilt
        const tiltRatio = 0.55; // Y-axis compression for 2D galaxy disc tilt

        this.galaxyStars.forEach(star => {
            star.angle += star.speed; // Orbit rotation

            const rx = star.distance * Math.cos(star.angle) + star.scatter;
            const ry = (star.distance * Math.sin(star.angle) + star.scatter) * tiltRatio;

            const px = cx + rx;
            const py = cy + ry;

            this.ctx.save();
            this.ctx.fillStyle = star.colorPrefix + star.alpha + ')';
            if (star.size > 1.2) {
                this.ctx.shadowBlur = 4;
                this.ctx.shadowColor = star.colorPrefix + '0.8)';
            }

            this.ctx.beginPath();
            this.ctx.arc(px, py, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // 4. Draw Shooting Stars
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const ss = this.shootingStars[i];
            const tailX = ss.x - Math.cos(ss.angle) * ss.length;
            const tailY = ss.y - Math.sin(ss.angle) * ss.length;

            const grad = this.ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
            grad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
            grad.addColorStop(0.3, `rgba(124, 233, 230, ${ss.alpha * 0.8})`);
            grad.addColorStop(1, `rgba(124, 233, 230, 0)`);

            this.ctx.save();
            this.ctx.strokeStyle = grad;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(ss.x, ss.y);
            this.ctx.lineTo(tailX, tailY);
            this.ctx.stroke();

            this.ctx.fillStyle = `rgba(255, 255, 255, ${ss.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            ss.x += Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.alpha -= ss.decay;

            if (ss.alpha <= 0 || ss.x > this.width || ss.y > this.height) {
                this.shootingStars.splice(i, 1);
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

/* ==========================================================================
   THREE.JS MODERN BOXY CYBERPUNK PET ROBOT
   Renders a futuristic boxy cyberpunk pet robot with cyan & magenta neon accents,
   digital visor HUD, chest arc reactor, double thruster rings, and head-tracking.
   ========================================================================== */
class ThreePetRobot {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.robotGroup = null;
        this.head = null;
        this.visor = null;
        this.eyeLeft = null;
        this.eyeRight = null;
        this.hudLine = null;
        this.chestCore = null;
        this.thrusterRing1 = null;
        this.thrusterRing2 = null;

        this.targetRotationY = 0;
        this.targetRotationX = 0;
        this.blinkTimer = 0;

        this.init();
    }

    init() {
        if (typeof THREE === 'undefined') return;

        this.container.innerHTML = ''; // Clear container

        const width = this.container.clientWidth || 320;
        const height = this.container.clientHeight || 320;

        // Scene, Camera, Renderer
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(0, 0, 9.5);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Cyberpunk Lighting (Cyan + Magenta + Cool White)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const cyanLight = new THREE.DirectionalLight(0x00f3ff, 1.8);
        cyanLight.position.set(6, 8, 7);
        this.scene.add(cyanLight);

        const magentaLight = new THREE.PointLight(0xff007f, 2.2, 18);
        magentaLight.position.set(-6, -2, 5);
        this.scene.add(magentaLight);

        const fillLight = new THREE.PointLight(0x38bdf8, 1.0, 15);
        fillLight.position.set(0, -4, 4);
        this.scene.add(fillLight);

        // Robot Root Group
        this.robotGroup = new THREE.Group();
        this.scene.add(this.robotGroup);

        // Materials
        const darkGunmetalMat = new THREE.MeshStandardMaterial({
            color: 0x0f111a,
            metalness: 0.9,
            roughness: 0.2
        });

        const cyberArmorMat = new THREE.MeshStandardMaterial({
            color: 0x1e2235,
            metalness: 0.8,
            roughness: 0.25
        });

        const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
        const neonMagentaMat = new THREE.MeshBasicMaterial({ color: 0xff007f });

        // 1. Boxy Cyber Head Assembly
        this.head = new THREE.Group();
        this.robotGroup.add(this.head);

        // Main Boxy Cyber Helmet
        const headGeo = new THREE.BoxGeometry(1.9, 1.4, 1.5);
        const mainHead = new THREE.Mesh(headGeo, darkGunmetalMat);
        mainHead.position.set(0, 0.9, 0);
        this.head.add(mainHead);

        // Side Helmet Armor Plates
        const plateLeftGeo = new THREE.BoxGeometry(0.15, 1.1, 1.3);
        const plateLeft = new THREE.Mesh(plateLeftGeo, cyberArmorMat);
        plateLeft.position.set(-1.0, 0.9, 0);
        this.head.add(plateLeft);

        const plateRight = new THREE.Mesh(plateLeftGeo, cyberArmorMat);
        plateRight.position.set(1.0, 0.9, 0);
        this.head.add(plateRight);

        // Cyber Visor Screen (Recessed Front Glass)
        const visorGeo = new THREE.BoxGeometry(1.65, 0.85, 0.1);
        const visorMat = new THREE.MeshStandardMaterial({
            color: 0x030408,
            metalness: 0.95,
            roughness: 0.05
        });
        this.visor = new THREE.Mesh(visorGeo, visorMat);
        this.visor.position.set(0, 0.9, 0.72);
        this.head.add(this.visor);

        // Glowing Digital Cyber Eyes (Rectangular LED Pixels)
        const eyeGeo = new THREE.BoxGeometry(0.38, 0.15, 0.05);

        this.eyeLeft = new THREE.Mesh(eyeGeo, neonCyanMat);
        this.eyeLeft.position.set(-0.4, 0.95, 0.78);
        this.head.add(this.eyeLeft);

        this.eyeRight = new THREE.Mesh(eyeGeo, neonCyanMat);
        this.eyeRight.position.set(0.4, 0.95, 0.78);
        this.head.add(this.eyeRight);

        // Visor HUD Scanner Accent Line
        const hudGeo = new THREE.BoxGeometry(1.4, 0.03, 0.05);
        this.hudLine = new THREE.Mesh(hudGeo, neonMagentaMat);
        this.hudLine.position.set(0, 0.7, 0.78);
        this.head.add(this.hudLine);

        // Cyber Antennas / Side Ears
        const earFinGeo = new THREE.BoxGeometry(0.12, 0.65, 0.35);

        const earLeft = new THREE.Mesh(earFinGeo, darkGunmetalMat);
        earLeft.rotation.z = -0.3;
        earLeft.position.set(-1.15, 1.6, -0.1);
        this.head.add(earLeft);

        const earRight = new THREE.Mesh(earFinGeo, darkGunmetalMat);
        earRight.rotation.z = 0.3;
        earRight.position.set(1.15, 1.6, -0.1);
        this.head.add(earRight);

        // Glowing Antenna Tip Strips
        const tipGeo = new THREE.BoxGeometry(0.14, 0.15, 0.37);
        const tipLeft = new THREE.Mesh(tipGeo, neonMagentaMat);
        tipLeft.position.set(-1.25, 1.9, -0.1);
        this.head.add(tipLeft);

        const tipRight = new THREE.Mesh(tipGeo, neonCyanMat);
        tipRight.position.set(1.25, 1.9, -0.1);
        this.head.add(tipRight);

        // 2. Boxy Cyber Body / Torso
        const bodyGeo = new THREE.BoxGeometry(1.6, 1.3, 1.3);
        const body = new THREE.Mesh(bodyGeo, darkGunmetalMat);
        body.position.set(0, -0.5, 0);
        this.robotGroup.add(body);

        // Shoulder Armor Pads
        const shoulderGeo = new THREE.BoxGeometry(0.4, 0.7, 1.1);
        const shoulderL = new THREE.Mesh(shoulderGeo, cyberArmorMat);
        shoulderL.position.set(-1.0, -0.4, 0);
        this.robotGroup.add(shoulderL);

        const shoulderR = new THREE.Mesh(shoulderGeo, cyberArmorMat);
        shoulderR.position.set(1.0, -0.4, 0);
        this.robotGroup.add(shoulderR);

        // Cyber Chest Core Arc Reactor (Glowing Hexagonal Gem)
        const coreGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 6);
        coreGeo.rotateX(Math.PI / 2);
        this.chestCore = new THREE.Mesh(coreGeo, neonCyanMat);
        this.chestCore.position.set(0, -0.4, 0.68);
        this.robotGroup.add(this.chestCore);

        // 3. Hovering Cyber Matrix Thrusters Under Robot
        const ring1Geo = new THREE.TorusGeometry(1.2, 0.05, 16, 32);
        this.thrusterRing1 = new THREE.Mesh(ring1Geo, neonCyanMat);
        this.thrusterRing1.rotation.x = Math.PI / 2;
        this.thrusterRing1.position.y = -1.45;
        this.robotGroup.add(this.thrusterRing1);

        const ring2Geo = new THREE.TorusGeometry(0.85, 0.04, 16, 32);
        this.thrusterRing2 = new THREE.Mesh(ring2Geo, neonMagentaMat);
        this.thrusterRing2.rotation.x = Math.PI / 2;
        this.thrusterRing2.position.y = -1.65;
        this.robotGroup.add(this.thrusterRing2);

        // Mouse & Touch Tracking
        const handleMove = (x, y) => {
            const rect = this.container.getBoundingClientRect();
            const nx = ((x - rect.left) / rect.width) * 2 - 1;
            const ny = -((y - rect.top) / rect.height) * 2 + 1;

            this.targetRotationY = nx * 0.65;
            this.targetRotationX = -ny * 0.45;
        };

        window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        // Resize Listener
        window.addEventListener('resize', () => this.onResize());

        // Start Animation Loop
        this.animate();
    }

    onResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth || 320;
        const height = this.container.clientHeight || 320;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.003;

        // 1. Levitation Bobbing Up & Down
        this.robotGroup.position.y = Math.sin(time) * 0.22;

        // 2. Head & Body Rotation Inertia (Cursor/Touch tracking)
        this.robotGroup.rotation.y += (this.targetRotationY - this.robotGroup.rotation.y) * 0.06;
        this.robotGroup.rotation.x += (this.targetRotationX - this.robotGroup.rotation.x) * 0.06;

        // 3. Cyber Thruster Rings Spin in Opposite Directions & Pulse
        if (this.thrusterRing1 && this.thrusterRing2) {
            this.thrusterRing1.rotation.z += 0.025;
            this.thrusterRing2.rotation.z -= 0.035;

            const pulse = 1 + Math.sin(time * 3) * 0.06;
            this.thrusterRing1.scale.setScalar(pulse);
            this.thrusterRing2.scale.setScalar(pulse);
        }

        // 4. Chest Arc Reactor Pulsing Core Intensity
        if (this.chestCore) {
            this.chestCore.scale.setScalar(1 + Math.sin(time * 4) * 0.08);
        }

        // 5. Periodic Eye Blink & Visor HUD Scanline Movement
        this.blinkTimer += 0.016;
        if (this.blinkTimer > 3.5) {
            this.eyeLeft.scale.y = 0.1;
            this.eyeRight.scale.y = 0.1;
            if (this.blinkTimer > 3.65) {
                this.eyeLeft.scale.y = 1;
                this.eyeRight.scale.y = 1;
                this.blinkTimer = 0;
            }
        }

        if (this.hudLine) {
            this.hudLine.position.y = 0.7 + Math.sin(time * 2) * 0.12;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Model URLs: Desktop Spline Robot vs Mobile Three.js Pet Robot
const DESKTOP_ROBO_URL = 'https://prod.spline.design/1ta0qpkKcEijb6Ta/scene.splinecode';

let currentMode = null; // 'desktop' or 'mobile'
let activePetRobot = null;

// Dynamically load background robot and card avatar
const handleResize = () => {
    const roboContainer = document.getElementById('robo-3d-container');
    const infoContainer = document.getElementById('info-3d-container');
    
    if (roboContainer) {
        const isMobileWidth = window.innerWidth <= 950;
        const targetMode = isMobileWidth ? 'mobile' : 'desktop';
        
        if (currentMode !== targetMode) {
            roboContainer.innerHTML = ''; // Clear container
            currentMode = targetMode;

            if (isMobileWidth) {
                // Mobile: Instantiate custom interactive Three.js 3D Pet Robot
                activePetRobot = new ThreePetRobot('robo-3d-container');
            } else {
                // Desktop: Load Spline Desktop Robot
                activePetRobot = null;
                const roboViewer = document.createElement('spline-viewer');
                roboViewer.setAttribute('url', DESKTOP_ROBO_URL);
                roboContainer.appendChild(roboViewer);
            }
        } else if (isMobileWidth && activePetRobot) {
            activePetRobot.onResize();
        }
    }

    // Manage card avatar (always loaded on both mobile and desktop)
    if (infoContainer && !infoContainer.querySelector('spline-viewer')) {
        const infoViewer = document.createElement('spline-viewer');
        infoViewer.className = 'info-3D';
        infoViewer.setAttribute('url', 'https://prod.spline.design/Phq6mOvYUMPtCWsw/scene.splinecode');
        infoContainer.appendChild(infoViewer);
    }
};

// Initialize 2D cosmic galaxy background & 3D viewers when DOM is ready
const initApp = () => {
    new DarkGalaxyCanvas();
    handleResize();
};

window.addEventListener('resize', handleResize);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}




            
