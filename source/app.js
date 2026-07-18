// Minimal JS for the spotlight effect on cards
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        // Update CSS variables for the spotlight effect
        card.style.setProperty('--x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--y', `${e.clientY - rect.top}px`);
    });
});

// Video Hover Play/Pause Logic
const video1 = document.getElementById('projectVideo1');
const video2 = document.getElementById('projectVideo2');
const video3 = document.getElementById('projectVideo3');
const video4 = document.getElementById('projectVideo4');

const videoList = [video1, video2, video3, video4];

videoList.forEach(function(video) {
    if (video) {
        video.addEventListener("mouseover", function() {
            video.play();
        });
        video.addEventListener("mouseout", function() {
            video.pause();
        });
    }
});
