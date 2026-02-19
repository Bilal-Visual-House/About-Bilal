import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/**
 * MUHAMMAD BILAL | PROFESSIONAL PORTFOLIO ENGINE
 */

const CONFIG = {
    isMobile: window.innerWidth < 768,
    dpr: Math.min(window.devicePixelRatio, 2),
    projectCount: window.innerWidth < 768 ? 6 : 12,
    physics: {
        g: 2100, // px/s^2 cinematic gravity
        k: 8,    // rotation damping
        y0: -900, // starting height
        theta0: -1.4, // ~80 deg back tilt
        threshold: 0.1,
        epsilon: 0.1
    },
    bloom: { strength: 1.2, radius: 0.4, threshold: 0.85 },
    portfolio: [
        { name: 'Banners', path: 'info/Banners/', ratio: 'wide', images: ['banner-1.jpg', 'banner-2.jpg', 'banner-3.jpg', 'banner-4.jpg', 'banner-5.jpg'] },
        { name: 'LOGOS', path: 'info/LOGOS/', ratio: 'square', images: ['logo-abha-eagles.png', 'logo-al-khobar-sharks.png', 'logo-aula-guardians.png', 'logo-chatgpt.png', 'logo-dammam-dragons.png', 'logo-daredevils.png', 'logo-doha-dynamos.png', 'logo-football-fest-1.jpg', 'logo-gt4.jpg', 'logo-infinity-talent-1.png', 'logo-jeddah-stallions.png', 'logo-lince-chargers-1.png', 'logo-lince-chargers-2.png', 'logo-pr-1.jpg', 'logo-pr-2.jpg', 'logo-riyadh-rattlers.png', 'logo-wa-1.jpg', 'logo-wa-2.jpg'] },
        { name: 'Packaging Design', path: 'info/Packaging Design/', ratio: 'portrait', images: ['packaging-catty-chinns-post.jpg', 'packaging-catty-chins-mockup.jpg', 'packaging-catty-chips-mockup.jpg', 'packaging-nimko-redesign.jpg', 'packaging-pingo-mockup.jpg', 'packaging-pingo-poster.jpg'] },
        { name: 'Social Media Post', path: 'info/Social Media Post/', ratio: 'square', images: ['social-1-day.jpg', 'social-2-days-post.jpg', 'social-2-days.jpg', 'social-3-days.jpg', 'social-burger.jpg', 'social-coffee.jpg', 'social-f2-post.jpg', 'social-giant-trophy.jpg', 'social-ielts.jpg', 'social-lahore.jpg', 'social-pakistan-team.jpg', 'social-sa-team.jpg', 'social-shahi-qila.jpg', 'social-shop-it.png', 'social-srilanka-team.jpg', 'social-wa-1.jpg', 'social-wa-2.jpg', 'social-wa-3.jpg', 'social-wa-4.jpg', 'social-wa-5.jpg', 'social-wa-6.jpg', 'social-wcf-afghanistan.jpg', 'social-wcf-back.jpg', 'social-wcf-bangladesh.jpg', 'social-wcf-saudi-green.jpg', 'social-wcf-saudi-white.jpg', 'social-wcf-trophy.jpg', 'social-wcf-west-indies.jpg'] },
        { name: 'Wam wear', path: 'info/Wam wear/', ratio: 'portrait', images: ['wam-wear-1.webp', 'wam-wear-2.jpg', 'wam-wear-3.webp', 'wam-wear-4.jpg'] },
        { name: 'More designs', path: 'info/More designs/', ratio: 'wide', images: ['design-1.jpg', 'design-2.jpg', 'design-3.jpg', 'design-4.jpg', 'design-5.jpg', 'design-6.jpg', 'design-7.jpg', 'design-8.jpg', 'design-nft-1.jpg', 'design-nft-2.jpg'] }
    ]
};

const SHADERS = {
    voidBg: {
        vertex: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
        fragment: `void main() { gl_FragColor = vec4(0.043, 0.043, 0.043, 1.0); }` // #0b0b0b equivalent
    }
};

class Experience {
    constructor() {
        // Fix scroll position bug: Ensure site starts at the top
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        console.log("INTRO start");
        this.canvas = document.querySelector('#experience-canvas');
        this.state = 'SITE';
        this.physicsRunning = false;
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.renderer.setPixelRatio(CONFIG.dpr);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.NoToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.z = 40;

        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2();

        // Manual Physics State
        this.physics = {
            time: 0,
            y: CONFIG.physics.y0,
            v: 0,
            theta: CONFIG.physics.theta0,
            isImpacted: false
        };

        this.projects = [];
        this.galleryManifest = [];
        this.currentGalleryIndex = 0;
        this.filteredImages = [];

        this.setup();
        this.bindEvents();
        this.animate();

        window.exp = this;
    }





    setup() {
        this.initPostProcessing();
        this.initLights();
        this.initHeroBackground();
        this.renderPortfolioStage();

        // Force visibility of the main content
        gsap.set("#scroll-container", { autoAlpha: 1 });
    }

    initPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), CONFIG.bloom.strength, CONFIG.bloom.radius, CONFIG.bloom.threshold);
        this.composer.addPass(this.bloomPass);
    }

    initLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambient);
        const sun = new THREE.DirectionalLight(0xffffff, 2);
        sun.position.set(5, 15, 10);
        this.scene.add(sun);
    }

    initHeroBackground() {
        // Particle field for cinematic background
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.15,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });

        this.particleField = new THREE.Points(geometry, material);
        this.scene.add(this.particleField);
    }



    renderPortfolioStage() {
        const container = document.getElementById('portfolio-container');
        container.innerHTML = `
            <div class="portfolio-scroll-wrapper">
                <div class="masonry-grid"></div>
            </div>
            <div class="show-more-container" style="display: none;">
                <button class="btn-show-more">Show More</button>
            </div>
        `;
        const grid = container.querySelector('.masonry-grid');
        this.showMoreBtn = container.querySelector('.btn-show-more');

        let allImages = [];
        CONFIG.portfolio.forEach(cat => {
            cat.images.forEach(img => {
                allImages.push({
                    path: cat.path + img,
                    name: img,
                    category: cat.name,
                    ratio: cat.ratio
                });
            });
        });

        // Store all for later
        this.galleryManifest = allImages;
        this.filteredImages = allImages; // Default all

        allImages.forEach((imgObj, idx) => {
            const item = document.createElement('div');
            item.className = `project-item ${imgObj.ratio}`;
            item.dataset.category = imgObj.category;
            item.dataset.index = idx;

            // Initially show only first 7 images
            const isInitial = idx < 7;
            item.style.display = isInitial ? 'block' : 'none';
            item.style.opacity = isInitial ? '1' : '0';

            item.innerHTML = `<img src="${imgObj.path}" loading="lazy" alt="${imgObj.name}">`;
            item.addEventListener('click', () => this.openGallery(imgObj.path));
            grid.appendChild(item);
        });

        this.showMoreBtn.addEventListener('click', () => this.showAllCurrent());
        this.updateShowMoreVisibility();
    }

    showAllCurrent() {
        const items = Array.from(document.querySelectorAll('.project-item'));
        const currentCategory = document.querySelector('.tab-btn.active')?.dataset.filter || 'ALL';

        const matchingHiddenItems = items.filter(item => {
            const isMatch = currentCategory === 'ALL' || item.dataset.category === currentCategory;
            return isMatch && item.style.display === 'none';
        });

        const toShow = matchingHiddenItems.slice(0, 6);

        toShow.forEach(item => {
            item.style.display = 'block';
            gsap.fromTo(item, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" });
        });

        this.updateShowMoreVisibility();
    }

    updateShowMoreVisibility() {
        const currentCategory = document.querySelector('.tab-btn.active')?.dataset.filter || 'ALL';

        // Hide "Show More" button if in "ALL" view
        if (currentCategory === 'ALL') {
            this.showMoreBtn.parentElement.style.display = 'none';
            return;
        }

        const items = Array.from(document.querySelectorAll('.project-item'));
        const matchingItems = items.filter(item => item.dataset.category === currentCategory);
        const visibleItems = matchingItems.filter(item => item.style.display !== 'none');

        if (matchingItems.length > visibleItems.length) {
            this.showMoreBtn.parentElement.style.display = 'flex';
        } else {
            this.showMoreBtn.parentElement.style.display = 'none';
        }
    }





    initScrollEngine() {
        // Initialize Lenis
        this.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        const scrollLoop = (time) => {
            if (this.lenis) this.lenis.raf(time);
            requestAnimationFrame(scrollLoop);
        };
        requestAnimationFrame(scrollLoop);

        // --- CINEMATIC HERO ENTRANCE ---
        const heroTl = gsap.timeline({ delay: 0.5 });

        // Clip-path / Mask Reveal logic
        heroTl.from('.hero-label', {
            y: 40,
            autoAlpha: 0,
            duration: 1.2,
            ease: "expo.out"
        });

        heroTl.from('.hero-title', {
            y: 100,
            skewY: 7,
            autoAlpha: 0,
            duration: 1.5,
            ease: "expo.out"
        }, "-=1.0");

        heroTl.from('.hero-subtitle', {
            y: 30,
            autoAlpha: 0,
            duration: 1.2,
            ease: "expo.out"
        }, "-=1.2");

        heroTl.from('.hero-description', {
            y: 20,
            autoAlpha: 0,
            duration: 1.2,
            ease: "expo.out"
        }, "-=1.0");

        heroTl.from('.hero-btn-primary, .hero-btn-ghost', {
            y: 20,
            autoAlpha: 0,
            stagger: 0.15,
            duration: 1.0,
            ease: "expo.out"
        }, "-=0.8");

        heroTl.from('.orb-scene', {
            scale: 0.8,
            autoAlpha: 0,
            duration: 2.0,
            ease: "expo.out"
        }, "-=1.5");

        // Global Section Reveal Pattern
        gsap.utils.toArray(".section").forEach(sec => {
            gsap.fromTo(sec.querySelector(".container"), { opacity: 0, y: 40 }, {
                scrollTrigger: { trigger: sec, start: "top 85%" },
                opacity: 1, y: 0, duration: 1.4, ease: "power2.out"
            });
        });

        // About Section Reveals
        gsap.to('#about .title-underline', {
            scrollTrigger: { trigger: "#about", start: "top 80%" },
            width: "80px", duration: 1.5, ease: "expo.out", delay: 0.5
        });

        gsap.from(".about-content .stagger-text", {
            scrollTrigger: { trigger: ".about-content", start: "top 85%" },
            opacity: 0, y: 30, stagger: 0.3, duration: 1.2, ease: "power2.out"
        });

        gsap.from(".about-portrait-frame", {
            scrollTrigger: { trigger: ".about-left", start: "top 80%" },
            opacity: 0, scale: 0.95, duration: 2, ease: "expo.out"
        });

        // Skills 3D Tilt Effect
        const cards = document.querySelectorAll('.skill-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xc = rect.width / 2;
                const yc = rect.height / 2;
                const dx = x - xc;
                const dy = y - yc;

                gsap.to(card, {
                    rotationY: dx / 10,
                    rotationX: -dy / 10,
                    transformPerspective: 1000,
                    ease: "power2.out",
                    duration: 0.6
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationY: 0,
                    rotationX: 0,
                    duration: 1,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });

        // Experience Pulse Animation
        const expItems = document.querySelectorAll('.timeline-item');
        expItems.forEach(item => {
            gsap.to(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 70%",
                    end: "bottom 30%",
                    toggleClass: "active-pulse",
                    markers: false
                }
            });
        });

        // About & Hero Tilt
        window.addEventListener('mousemove', e => {
            if (this.state !== 'SITE') return;
            const x = (e.clientX / window.innerWidth - 0.5) * 15;
            const y = (e.clientY / window.innerHeight - 0.5) * 15;

            const aboutFrame = document.querySelector('.about-portrait-frame');
            if (aboutFrame) gsap.to(aboutFrame, { rotationY: x, rotationX: -y, transformPerspective: 1000, duration: 0.8 });
        });

        // --- PREMIER SKILLS UPGRADE ---
        // 1. Heading Entrance
        gsap.from("#skills .section-title", {
            scrollTrigger: { trigger: "#skills", start: "top 80%" },
            opacity: 0,
            y: 40,
            letterSpacing: "0.05em",
            duration: 1.5,
            ease: "power3.out"
        });

        // 2. Center-Expanding Underline
        gsap.to('#skills .title-underline.center', {
            scrollTrigger: { trigger: "#skills", start: "top 80%" },
            width: "150px",
            duration: 1.5,
            ease: "expo.out",
            delay: 0.5
        });

        // 3. Apple-Style Card Entrance
        const skillCards = gsap.utils.toArray(".skill-card");
        gsap.from(skillCards, {
            scrollTrigger: { trigger: ".skills-grid", start: "top 88%" },
            opacity: 0,
            y: 45,
            scale: 0.94,
            stagger: 0.12,
            duration: 1.2,
            ease: "power3.out",
            clearProps: "all" // Ensure hover/tilt take over after entrance
        });

        // 4. Interactive 3D Tilt & Lighting Follow
        if (!CONFIG.isMobile) {
            skillCards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    // Update Lighting CSS Variables
                    card.style.setProperty('--x', `${(x / rect.width) * 100}%`);
                    card.style.setProperty('--y', `${(y / rect.height) * 100}%`);

                    // 3D Tilt Logic
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = (y - centerY) / centerY * -5.5; // Max ~6 degrees
                    const rotateY = (x - centerX) / centerX * 5.5;

                    gsap.to(card, {
                        rotationX: rotateX,
                        rotationY: rotateY,
                        transformPerspective: 1500,
                        duration: 0.5,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                });

                card.addEventListener('mouseleave', () => {
                    gsap.to(card, {
                        rotationX: 0,
                        rotationY: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        overwrite: "auto"
                    });
                });
            });
        }

        // Experience Section Reveals
        const expCards = gsap.utils.toArray(".exp-card");
        expCards.forEach(card => {
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleClass: "active-state",
                    markers: false
                }
            });

            gsap.from(card, {
                scrollTrigger: { trigger: card, start: "top 90%" },
                opacity: 0,
                y: 30,
                duration: 1.2,
                ease: "expo.out"
            });
        });
    }

    filterPortfolio(category) {
        if (this.isFiltering) return;
        this.isFiltering = true;

        const items = Array.from(document.querySelectorAll('.project-item'));
        const matchingItems = category === 'ALL'
            ? items
            : items.filter(el => el.dataset.category === category);

        const tl = gsap.timeline({
            onComplete: () => {
                this.isFiltering = false;
                this.updateShowMoreVisibility();
            }
        });

        // 1. Initial fade out of all items
        tl.to(items, {
            opacity: 0,
            y: 20,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => {
                items.forEach(item => item.style.display = 'none');
            }
        });

        // 2. Filter images for gallery
        tl.add(() => {
            this.filteredImages = category === 'ALL'
                ? this.galleryManifest
                : this.galleryManifest.filter(m => m.category === category);

            // Always show only first 7 images initially
            const toShow = matchingItems.slice(0, 7);
            toShow.forEach(item => {
                item.style.display = 'block';
            });
        });

        // 3. Cinematic Reveal
        const itemsToAnimate = matchingItems.slice(0, 7);
        tl.fromTo(itemsToAnimate,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.05,
                ease: "expo.out"
            }
        );
    }

    openGallery(src) {
        this.currentGalleryIndex = this.filteredImages.findIndex(m => m.path === src);
        const overlay = document.getElementById('gallery-overlay');
        const img = document.getElementById('gallery-img');
        const counter = document.getElementById('gallery-counter');

        img.src = src;
        counter.innerText = `${this.currentGalleryIndex + 1} / ${this.filteredImages.length}`;

        overlay.style.display = 'flex';
        gsap.killTweensOf([overlay, img]);

        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" });
        gsap.fromTo(img,
            { scale: 0.9, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.8, ease: "expo.out", delay: 0.1 }
        );
    }

    closeGallery() {
        gsap.to("#gallery-overlay", {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => document.getElementById('gallery-overlay').style.display = 'none'
        });
    }

    navigateGallery(dir) {
        this.currentGalleryIndex = (this.currentGalleryIndex + dir + this.filteredImages.length) % this.filteredImages.length;
        const img = document.getElementById('gallery-img'), cnt = document.getElementById('gallery-counter');

        gsap.to(img, {
            opacity: 0, x: dir > 0 ? -20 : 20, scale: 0.98, duration: 0.3, onComplete: () => {
                img.src = this.filteredImages[this.currentGalleryIndex].path;
                cnt.innerText = `${this.currentGalleryIndex + 1} / ${this.filteredImages.length}`;
                gsap.fromTo(img,
                    { opacity: 0, x: dir > 0 ? 20 : -20, scale: 0.98 },
                    { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: "expo.out" }
                );
            }
        });
    }

    bindEvents() {
        window.addEventListener('mousemove', e => { this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1; this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1; });
        window.addEventListener('resize', () => { this.camera.aspect = window.innerWidth / window.innerHeight; this.camera.updateProjectionMatrix(); this.renderer.setSize(window.innerWidth, window.innerHeight); this.composer.setSize(window.innerWidth, window.innerHeight); });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterPortfolio(btn.dataset.filter);
            });
        });

        document.querySelector('.overlay-close').addEventListener('click', () => this.closeGallery());
        document.querySelector('.nav-arrow.prev').addEventListener('click', () => this.navigateGallery(-1));
        document.querySelector('.nav-arrow.next').addEventListener('click', () => this.navigateGallery(1));
        window.addEventListener('keydown', e => { if (e.key === 'Escape') this.closeGallery(); if (e.key === 'ArrowLeft') this.navigateGallery(-1); if (e.key === 'ArrowRight') this.navigateGallery(1); });
        document.getElementById('gallery-overlay').addEventListener('click', e => { if (e.target === document.getElementById('gallery-overlay')) this.closeGallery(); });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const dt = 1 / 60; // Locked step for precision physics

        // Three.js Intro Physics Disabled (Now handled by CSS)
        /*
        if (this.physicsRunning && this.state === 'INTRO') {
           ...
        }
        */

        if (this.state === 'SITE') {
            if (this.particleField) {
                this.particleField.rotation.y += 0.001;
                this.particleField.rotation.x += 0.0005;
            }
            const scrollY = this.lenis ? this.lenis.scroll : 0;
            if (this.camera) {
                this.camera.position.x += (this.mouse.x * 5 - this.camera.position.x) * 0.01;
                this.camera.position.y += (-this.mouse.y * 5 - (this.camera.position.y + scrollY * 0.02)) * 0.01;
                this.camera.lookAt(0, -scrollY * 0.02, 0);
            }
        }

        if (this.state === 'SITE') {
            if (this.composer) {
                this.composer.render();
            } else if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        }
    }
}

new Experience();
