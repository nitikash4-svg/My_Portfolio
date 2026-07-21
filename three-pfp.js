document.addEventListener('DOMContentLoaded', () => {
    initThreePfp();
});

function initThreePfp() {
    const container = document.getElementById('info-3d-container');
    if (!container) return;
    
    // Clear the container (this will remove any existing <img> tag)
    container.innerHTML = '';
    
    // We will get dimensions from the container itself.
    // Make sure container has some size. If it's a flex container, it might need explicit sizing for the canvas.
    // The container was styled with flex-end, but let's give it fixed width/height so canvas can fill it.
    let width = container.clientWidth || 224; // ~14rem fallback
    let height = container.clientHeight || 288; // ~18rem fallback
    
    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    // Style the canvas to look like the image did
    renderer.domElement.style.width = '14rem';
    renderer.domElement.style.height = '18rem';
    renderer.domElement.style.objectFit = 'cover';
    renderer.domElement.style.borderRadius = '12px';
    renderer.domElement.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    renderer.domElement.style.marginRight = '-2rem';
    renderer.domElement.style.marginTop = '5rem';
    
    // On mobile, the width/height of the container changes.
    // We need to handle resizing properly.
    window.addEventListener('resize', () => {
        width = container.clientWidth || 224;
        height = container.clientHeight || 288;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        // Remove fixed margins/widths if on mobile so media queries take over container styling.
        // For simplicity, we keep the inline styles on the canvas to mirror the old <img> tag styles.
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
                vec4 texColor = texture2D(uTexture, vUv);
                
                // Add a glowing scanning bar effect moving from bottom to top
                float barY = mod(uTime * 0.4, 1.2) - 0.1; // Loops between -0.1 and 1.1
                float dist = abs(vUv.y - barY);
                
                // Create a sharp glow using smoothstep
                float glow = smoothstep(0.08, 0.0, dist);
                
                // Add subtle scanlines over the whole image
                float scanlines = sin(vUv.y * 100.0) * 0.04;
                
                vec3 finalColor = texColor.rgb;
                
                // Apply scanlines (darken slightly)
                finalColor -= scanlines;
                
                // Apply bright cyan/blue scan bar glow
                vec3 glowColor = vec3(0.0, 0.8, 1.0); 
                finalColor += glowColor * glow * 0.6; // 0.6 is intensity
                
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
            
            renderer.render(scene, camera);
        }
        
        animate();
    });
}
