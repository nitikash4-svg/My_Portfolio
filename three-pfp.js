window.addEventListener('load', () => {
    initThreePfp();
});

function initThreePfp() {
    const container = document.getElementById('info-3d-container');
    if (!container) return;
    
    // Clear the container (this will remove any existing <img> tag)
    container.innerHTML = '';
    
    // Use fixed base resolution to match 14rem x 18rem (approx 224x288) 
    // because container.clientWidth might be much larger (30rem)
    let width = 224; 
    let height = 288; 
    
    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false); // false means don't force CSS styles
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    // Style the canvas to look like the image did
    renderer.domElement.style.width = '14rem';
    renderer.domElement.style.height = '18rem';
    renderer.domElement.style.objectFit = 'cover';
    renderer.domElement.style.borderRadius = '24px';
    renderer.domElement.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    renderer.domElement.style.marginRight = '-2rem';
    renderer.domElement.style.marginTop = '5rem';
    
    // Handle resizing correctly by reading the actual canvas size
    window.addEventListener('resize', () => {
        // Only update if the canvas actually changes size
        if (renderer.domElement.clientWidth && renderer.domElement.clientHeight) {
            width = renderer.domElement.clientWidth;
            height = renderer.domElement.clientHeight;
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    });

    const loader = new THREE.TextureLoader();
    loader.load('images/pfp.jpg', (texture) => {
        // Adjust geometry to match the image aspect ratio
        const imageAspect = texture.image.width / texture.image.height;
        const planeHeight = 3.8;
        const planeWidth = planeHeight * imageAspect;
        
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 32, 32);
        
        const uniforms = {
            uTime: { value: 0 },
            uTexture: { value: texture }
        };
        
        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        
        const fragmentShader = `
            uniform float uTime;
            uniform sampler2D uTexture;
            varying vec2 vUv;
            
            void main() {
                // Cyber scanning parameters
                float speed = 0.5;
                float barY = mod(uTime * speed, 1.2) - 0.1; 
                float dist = vUv.y - barY;
                
                // Chromatic aberration (RGB shift) near the scanline
                float aberration = smoothstep(0.05, 0.0, abs(dist)) * 0.015;
                
                vec4 texColor;
                texColor.r = texture2D(uTexture, vec2(vUv.x + aberration, vUv.y)).r;
                texColor.g = texture2D(uTexture, vUv).g;
                texColor.b = texture2D(uTexture, vec2(vUv.x - aberration, vUv.y)).b;
                texColor.a = texture2D(uTexture, vUv).a;
                
                // Laser core (very sharp bright line)
                float core = smoothstep(0.005, 0.0, abs(dist));
                
                // Trail glow (only above the line since it moves up)
                float trail = smoothstep(0.15, 0.0, dist) * step(0.0, dist);
                
                vec3 finalColor = texColor.rgb;
                
                // Cyber Neon Cyan color
                vec3 cyberColor = vec3(0.0, 0.9, 1.0);
                
                // Add intense laser core and soft trail
                finalColor += cyberColor * core * 1.2; 
                finalColor += cyberColor * trail * 0.4; 
                
                gl_FragColor = vec4(finalColor, texColor.a);
            }
        `;
        
        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        
        const clock = new THREE.Clock();
        
        function animate() {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            
            // Minor left and right rotation
            mesh.rotation.y = Math.sin(elapsedTime * 1.5) * 0.12;
            
            // Slight up/down tilt for more organic feel
            mesh.rotation.x = Math.sin(elapsedTime * 0.8) * 0.05;
            
            // Update time for the scanning shader
            uniforms.uTime.value = elapsedTime;
            
            // Only render if the canvas is actually visible (prevents WebGL 0x0 Framebuffer errors)
            if (renderer.domElement.clientWidth > 0 && renderer.domElement.clientHeight > 0) {
                renderer.render(scene, camera);
            }
        }
        
        animate();
    });
}
