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

// Dynamically load background robot and card avatar spline-viewers after DOM layout
// to prevent WebGL contexts initialization with 0x0 size.
const handleResize = () => {
    const roboContainer = document.getElementById('robo-3d-container');
    const infoContainer = document.getElementById('info-3d-container');
    
    // 1. Manage background robot (desktop only)
    if (roboContainer) {
        const isMobileWidth = window.innerWidth <= 950;
        if (!isMobileWidth) {
            // Desktop: load it if not already present
            if (!roboContainer.querySelector('spline-viewer')) {
                const roboViewer = document.createElement('spline-viewer');
                roboViewer.setAttribute('url', 'https://prod.spline.design/1ta0qpkKcEijb6Ta/scene.splinecode');
                roboContainer.appendChild(roboViewer);
            }
        } else {
            // Mobile: remove it if present
            const existingViewer = roboContainer.querySelector('spline-viewer');
            if (existingViewer) {
                existingViewer.remove();
            }
        }
    }

    // 2. Manage card avatar (always loaded on both mobile and desktop)
    if (infoContainer) {
        // Load it if not already present
        if (!infoContainer.querySelector('spline-viewer')) {
            const infoViewer = document.createElement('spline-viewer');
            infoViewer.className = 'info-3D';
            infoViewer.setAttribute('url', 'https://prod.spline.design/Phq6mOvYUMPtCWsw/scene.splinecode');
            infoContainer.appendChild(infoViewer);
        }
    }
};

// Listen for window resize
window.addEventListener('resize', handleResize);

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleResize);
} else {
    handleResize();
}


            
