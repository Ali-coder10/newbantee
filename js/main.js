// 1. Loader Logic
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loader = document.getElementById('loader');
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                initThreeJS(); // Start heavy 3D after load
            }, 2600);
        });

        // 2. Sticky Header
        window.addEventListener('scroll', () => {
            const header = document.getElementById('header');
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // 3. 3D Card Tilt Effect
        const cards = document.querySelectorAll('.tilt-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });

        // 4. Counter Animation
        const counters = document.querySelectorAll('.counter');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    let count = 0;
                    const updateCount = () => {
                        const increment = target / 40;
                        if(count < target) {
                            count += increment;
                            entry.target.innerText = Math.ceil(count);
                            setTimeout(updateCount, 50);
                        } else {
                            entry.target.innerText = target;
                        }
                    };
                    updateCount();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(counter => observer.observe(counter));

        // 5. Three.js Hero Scene (Candles & Orbs with ORANGE glow)
        function initThreeJS() {
            const canvas = document.getElementById('three-canvas');
            const scene = new THREE.Scene();
            
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 2, 15);

            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
            scene.add(ambientLight);

            // Orange Core Light
            const orangeLight = new THREE.PointLight(0xFF6B00, 2, 50);
            orangeLight.position.set(5, 5, 5);
            scene.add(orangeLight);

            const cyanLight = new THREE.PointLight(0x00E5FF, 1, 50);
            cyanLight.position.set(-5, -5, 5);
            scene.add(cyanLight);

            // Candlesticks
            const candles = [];
            const materialBear = new THREE.MeshStandardMaterial({ 
                color: 0xFF6B00, emissive: 0xFF6B00, emissiveIntensity: 0.4, roughness: 0.2 
            });
            const materialBull = new THREE.MeshStandardMaterial({ 
                color: 0x00E5FF, emissive: 0x00E5FF, emissiveIntensity: 0.4, roughness: 0.2 
            });
            const wickMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 });

            for (let i = 0; i < 20; i++) {
                const isBull = Math.random() > 0.5;
                const bodyHeight = 1 + Math.random() * 3;
                const bodyGeo = new THREE.BoxGeometry(0.4, bodyHeight, 0.4);
                const wickGeo = new THREE.CylinderGeometry(0.03, 0.03, bodyHeight + 1);
                
                const body = new THREE.Mesh(bodyGeo, isBull ? materialBull : materialBear);
                const wick = new THREE.Mesh(wickGeo, wickMaterial);
                
                const candleGroup = new THREE.Group();
                candleGroup.add(wick);
                candleGroup.add(body);
                
                // Position in an arc
                candleGroup.position.x = (i - 10) * 1.5;
                candleGroup.position.y = (Math.random() - 0.5) * 5;
                candleGroup.position.z = Math.sin(i * 0.5) * 3 - 5;
                
                scene.add(candleGroup);
                candles.push({
                    mesh: candleGroup,
                    speed: 0.01 + Math.random() * 0.02,
                    offset: Math.random() * Math.PI * 2
                });
            }

            // Floating Orbs
            const orbs = [];
            const orbGeo = new THREE.SphereGeometry(0.15, 16, 16);
            for(let i=0; i<15; i++) {
                const orbMat = new THREE.MeshStandardMaterial({
                    color: Math.random() > 0.5 ? 0xFF6B00 : 0xFFD700,
                    emissive: Math.random() > 0.5 ? 0xFF6B00 : 0xFFD700,
                    emissiveIntensity: 1
                });
                const orb = new THREE.Mesh(orbGeo, orbMat);
                orb.position.set((Math.random()-0.5)*20, (Math.random()-0.5)*10, (Math.random()-0.5)*10);
                scene.add(orb);
                orbs.push({ mesh: orb, speed: 0.005 + Math.random()*0.01 });
            }

            // Animation Loop
            let time = 0;
            function animate() {
                requestAnimationFrame(animate);
                time += 0.01;

                candles.forEach(c => {
                    c.mesh.position.y += Math.sin(time * 2 + c.offset) * 0.01;
                    c.mesh.rotation.y += c.speed * 0.5;
                });

                orbs.forEach((o, index) => {
                    o.mesh.position.x += Math.sin(time + index) * 0.02;
                    o.mesh.position.y += Math.cos(time + index) * 0.02;
                });

                // Subtle Scene Rotation
                scene.rotation.y = Math.sin(time * 0.5) * 0.05;

                renderer.render(scene, camera);
            }
            animate();

            // Resize Handler
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
            
            // Mouse Parallax Effect
            document.addEventListener('mousemove', (e) => {
                const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
                const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
                
                scene.rotation.x = mouseY * 0.05;
                scene.rotation.y = mouseX * 0.05;
                
                const heroContent = document.querySelector('.hero-content');
                heroContent.style.transform = `translate(${mouseX * 10}px, ${-mouseY * 10}px)`;
            });
        }
