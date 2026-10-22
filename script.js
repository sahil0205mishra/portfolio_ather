/**
 * Ather Energy - AI Generalist (Design) Portfolio Engine
 * Candidate: Sahil Mishra (SRM Institute of Science & Technology)
 */

document.addEventListener('DOMContentLoaded', () => {
  initCockpitSimulator();
  initGenerativeCanvas();
  initModals();
  initCopyLink();
});

/* ==========================================================================
   1. Interactive Ather Cockpit HMI Simulator
   ========================================================================== */

function initCockpitSimulator() {
  const speedEl = document.getElementById('clusterSpeed');
  const mainSpeedEl = document.getElementById('mainSpeedDisplay');
  const modeBadgeEl = document.getElementById('clusterModeBadge');
  const mainModeTextEl = document.getElementById('mainModeText');
  const energyFillEl = document.getElementById('energyFill');
  const mainPowerBarEl = document.getElementById('mainPowerBar');
  const rangeValEl = document.getElementById('clusterRange');
  const mainRangeTextEl = document.getElementById('mainRangeText');
  const efficiencyValEl = document.getElementById('clusterEfficiency');
  const throttleInput = document.getElementById('throttleInput');
  const simulateBtn = document.getElementById('simulateRideBtn');
  const modeButtons = document.querySelectorAll('.mode-btn');

  // Mode configurations
  const modeConfigs = {
    warp: {
      color: '#FF5500',
      glow: 'rgba(255, 85, 0, 0.45)',
      maxSpeed: 95,
      range: 72,
      efficiency: '38 Wh/km',
      name: 'WARP',
      badgeText: 'WARP MODE ACTIVE'
    },
    sport: {
      color: '#FFB300',
      glow: 'rgba(255, 179, 0, 0.4)',
      maxSpeed: 82,
      range: 88,
      efficiency: '31 Wh/km',
      name: 'SPORT',
      badgeText: 'SPORT MODE ACTIVE'
    },
    ride: {
      color: '#00E599',
      glow: 'rgba(0, 229, 153, 0.4)',
      maxSpeed: 70,
      range: 105,
      efficiency: '26 Wh/km',
      name: 'RIDE',
      badgeText: 'RIDE MODE ACTIVE'
    },
    smart: {
      color: '#00B4D8',
      glow: 'rgba(0, 180, 216, 0.4)',
      maxSpeed: 65,
      range: 125,
      efficiency: '22 Wh/km',
      name: 'SMARTECO',
      badgeText: 'SMARTECO MODE ACTIVE'
    },
    eco: {
      color: '#10B981',
      glow: 'rgba(16, 185, 129, 0.4)',
      maxSpeed: 55,
      range: 142,
      efficiency: '19 Wh/km',
      name: 'ECO',
      badgeText: 'ECO MODE ACTIVE'
    }
  };

  let currentMode = 'warp';
  let targetSpeed = 68;
  let currentSpeed = 0;
  let isSimulating = false;
  let simulationInterval = null;

  // Mode Selection Handler
  modeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mode = btn.dataset.mode;
      if (!modeConfigs[mode]) return;
      
      currentMode = mode;
      // sync all matching mode buttons across page
      modeButtons.forEach(b => {
        b.classList.toggle('active', b.dataset.mode === mode);
      });

      applyMode(mode);
    });
  });

  function applyMode(mode) {
    const config = modeConfigs[mode];
    if (modeBadgeEl) {
      modeBadgeEl.textContent = config.name;
      modeBadgeEl.style.borderColor = config.color;
      modeBadgeEl.style.color = config.color;
      modeBadgeEl.style.boxShadow = `0 0 12px ${config.glow}`;
    }

    if (mainModeTextEl) {
      mainModeTextEl.textContent = config.badgeText;
      mainModeTextEl.style.color = config.color;
    }

    if (rangeValEl) rangeValEl.textContent = `${config.range} km`;
    if (mainRangeTextEl) mainRangeTextEl.textContent = `${config.range} KM REMAINING`;
    if (efficiencyValEl) efficiencyValEl.textContent = config.efficiency;

    // Adjust speed if over new max
    if (targetSpeed > config.maxSpeed) {
      targetSpeed = config.maxSpeed;
      if (throttleInput) throttleInput.value = targetSpeed;
    }
    updateEnergyBars(currentSpeed, targetSpeed);
  }

  // Throttle Input Handler
  if (throttleInput) {
    throttleInput.addEventListener('input', (e) => {
      if (isSimulating) stopSimulation();
      const val = parseInt(e.target.value, 10);
      const max = modeConfigs[currentMode].maxSpeed;
      targetSpeed = Math.min(val, max);
    });
  }

  // Animation Loop for speed smoothing & energy bar
  function renderLoop() {
    // Smooth speed interpolation
    const diff = targetSpeed - currentSpeed;
    if (Math.abs(diff) > 0.4) {
      currentSpeed += diff * 0.12;
    } else {
      currentSpeed = targetSpeed;
    }

    const roundedSpeed = Math.round(currentSpeed);
    if (speedEl) speedEl.textContent = roundedSpeed;
    if (mainSpeedEl) mainSpeedEl.textContent = roundedSpeed;

    updateEnergyBars(currentSpeed, targetSpeed);
    requestAnimationFrame(renderLoop);
  }
  requestAnimationFrame(renderLoop);

  function updateEnergyBars(spd, tgt) {
    const config = modeConfigs[currentMode];
    const pct = Math.min(100, Math.max(8, (spd / config.maxSpeed) * 100));

    const isRegen = tgt < spd - 2;
    const bg = isRegen ? '#00E599' : `linear-gradient(90deg, #00E599, ${config.color})`;
    const glow = isRegen ? '0 0 12px #00E599' : `0 0 12px ${config.color}`;

    if (energyFillEl) {
      energyFillEl.style.width = `${pct}%`;
      energyFillEl.style.background = bg;
      energyFillEl.style.boxShadow = glow;
    }

    if (mainPowerBarEl) {
      mainPowerBarEl.style.width = `${pct}%`;
      mainPowerBarEl.style.background = bg;
      mainPowerBarEl.style.boxShadow = glow;
    }
  }

  // Ride Simulation Cycle
  if (simulateBtn) {
    simulateBtn.addEventListener('click', () => {
      if (isSimulating) {
        stopSimulation();
      } else {
        startSimulation();
      }
    });
  }

  function startSimulation() {
    isSimulating = true;
    simulateBtn.textContent = '⏹ Stop Ride Sim';
    simulateBtn.classList.add('active');

    const steps = [
      { speed: 20, mode: 'eco', duration: 1800 },
      { speed: 45, mode: 'ride', duration: 2200 },
      { speed: 78, mode: 'sport', duration: 2500 },
      { speed: 92, mode: 'warp', duration: 3000 },
      { speed: 30, mode: 'warp', duration: 2000 }, // regen braking
      { speed: 0, mode: 'smart', duration: 1500 }
    ];

    let stepIdx = 0;
    function nextStep() {
      if (!isSimulating) return;
      const s = steps[stepIdx];
      targetSpeed = s.speed;
      if (throttleInput) throttleInput.value = s.speed;

      // Click button for mode
      const targetBtn = document.querySelector(`.mode-btn[data-mode="${s.mode}"]`);
      if (targetBtn) targetBtn.click();

      stepIdx = (stepIdx + 1) % steps.length;
      simulationInterval = setTimeout(nextStep, s.duration);
    }
    nextStep();
  }

  function stopSimulation() {
    isSimulating = false;
    if (simulationInterval) clearTimeout(simulationInterval);
    if (simulateBtn) {
      simulateBtn.textContent = '⚡ Simulate EV Ride Cycle';
      simulateBtn.classList.remove('active');
    }
  }
}

/* ==========================================================================
   2. Interactive 3D Generative Topology Optimization Canvas (AeroMorph AI)
   ========================================================================== */

function initGenerativeCanvas() {
  const canvas = document.getElementById('topologyCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = canvas.parentElement.clientWidth;
  let height = canvas.height = canvas.parentElement.clientHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight;
  });

  // Generative model parameters
  let rotX = 0.45;
  let rotY = 0.65;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  // Sliders
  const weightSlider = document.getElementById('weightSlider');
  const rigiditySlider = document.getElementById('rigiditySlider');
  const iterSlider = document.getElementById('iterSlider');

  const weightVal = document.getElementById('weightVal');
  const rigidityVal = document.getElementById('rigidityVal');
  const iterVal = document.getElementById('iterVal');

  let massReduction = 14; // %
  let torsionalRigidity = 420; // Nm/deg
  let iterationCount = 64;
  let stressHeatmap = true;

  if (weightSlider) {
    weightSlider.addEventListener('input', (e) => {
      massReduction = parseInt(e.target.value, 10);
      if (weightVal) weightVal.textContent = `-${massReduction}%`;
    });
  }
  if (rigiditySlider) {
    rigiditySlider.addEventListener('input', (e) => {
      torsionalRigidity = parseInt(e.target.value, 10);
      if (rigidityVal) rigidityVal.textContent = `${torsionalRigidity} Nm/°`;
    });
  }
  if (iterSlider) {
    iterSlider.addEventListener('input', (e) => {
      iterationCount = parseInt(e.target.value, 10);
      if (iterVal) iterVal.textContent = `Epoch #${iterationCount}`;
    });
  }

  const stressBtn = document.getElementById('toggleStressBtn');
  if (stressBtn) {
    stressBtn.addEventListener('click', () => {
      stressHeatmap = !stressHeatmap;
      stressBtn.classList.toggle('active', stressHeatmap);
    });
  }

  // Mouse drag rotation
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    rotY += dx * 0.008;
    rotX += dy * 0.008;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });
  window.addEventListener('mouseup', () => { isDragging = false; });

  // Touch support for mobile evaluators
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    }
  });
  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - lastMouseX;
    const dy = e.touches[0].clientY - lastMouseY;
    rotY += dx * 0.008;
    rotX += dy * 0.008;
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
  });
  window.addEventListener('touchend', () => { isDragging = false; });

  // Generate 3D structural lattice vertices for EV & Aerospace Swingarm / Subframe
  function generateLatticeNodes() {
    const nodes = [];
    const segments = 12;
    for (let i = 0; i < segments; i++) {
      const u = (i / (segments - 1)) * 2 - 1; // -1 to 1
      const curve = Math.sin((i / (segments - 1)) * Math.PI) * 0.4;
      const density = (massReduction / 30);
      const necking = 1.0 - (density * 0.3 * Math.cos(u * Math.PI));

      // Main structural spar points
      nodes.push({ x: u * 140, y: -45 * necking + curve * 30, z: -35 * necking, stress: 0.2 + (Math.abs(u) * 0.6) });
      nodes.push({ x: u * 140, y: 45 * necking + curve * 30, z: -35 * necking, stress: 0.3 + (Math.abs(u) * 0.5) });
      nodes.push({ x: u * 140, y: 35 * necking + curve * 25, z: 35 * necking, stress: 0.1 + (Math.abs(u) * 0.4) });
      nodes.push({ x: u * 140, y: -35 * necking + curve * 25, z: 35 * necking, stress: 0.15 + (Math.abs(u) * 0.35) });

      // Generative topological internal webbing nodes
      if (i % 2 === 0) {
        nodes.push({ x: u * 140, y: curve * 30, z: 0, stress: 0.75 * (1 - Math.abs(u)) });
      }
    }
    return nodes;
  }

  function project3D(x, y, z) {
    // 3D rotation
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    // Rotate Y
    let x1 = x * cosY - z * sinY;
    let z1 = z * cosY + x * sinY;

    // Rotate X
    let y2 = y * cosX - z1 * sinX;
    let z2 = z1 * cosX + y * sinX;

    // Perspective projection
    const fov = 380;
    const depth = fov / (fov + z2 + 200);
    return {
      x: width / 2 + x1 * depth,
      y: height / 2 + y2 * depth,
      scale: depth,
      z: z2
    };
  }

  // Animation Loop for Topology Viewer
  function renderTopology() {
    ctx.clearRect(0, 0, width, height);

    // Subtle background engineering grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridStep = 32;
    for (let x = 0; x < width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Auto slow rotate if user isn't interacting
    if (!isDragging) {
      rotY += 0.003;
    }

    const nodes = generateLatticeNodes();
    const projected = nodes.map(n => ({
      ...project3D(n.x, n.y, n.z),
      stress: n.stress
    }));

    // Draw structural lattice struts
    ctx.lineWidth = 1.6;
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Connect neighbor nodes
        if (dist < 65) {
          const avgStress = (nodes[i].stress + nodes[j].stress) / 2;
          ctx.beginPath();
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[j].x, projected[j].y);

          if (stressHeatmap) {
            // FEA Von Mises stress color grading (Blue/Cyan -> Yellow -> Red)
            if (avgStress > 0.6) {
              ctx.strokeStyle = `rgba(255, 85, 0, ${0.4 + avgStress * 0.5})`;
            } else if (avgStress > 0.35) {
              ctx.strokeStyle = `rgba(0, 240, 255, ${0.35 + avgStress * 0.4})`;
            } else {
              ctx.strokeStyle = `rgba(0, 229, 153, ${0.25 + avgStress * 0.3})`;
            }
          } else {
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
          }
          ctx.stroke();
        }
      }
    }

    // Draw joint nodes
    projected.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5 * p.scale, 0, Math.PI * 2);
      ctx.fillStyle = stressHeatmap && p.stress > 0.6 ? '#FF5500' : '#00E599';
      ctx.fill();
    });

    requestAnimationFrame(renderTopology);
  }
  requestAnimationFrame(renderTopology);
}

/* ==========================================================================
   3. Modal System for In-Depth Project Case Studies & Vision Concepts
   ========================================================================== */

const caseStudyData = {
  deepguard: {
    title: 'DeepGuard – Multimodal Deepfake Detection & Visual AI Platform',
    category: 'Computer Vision • Deep Learning • Microservices Architecture',
    github: 'https://github.com/sahil0205mishra',
    stats: [
      { label: 'Ensemble Models', val: 'ViT + NPR + Universal' },
      { label: 'Detection Accuracy', val: '97.4%' },
      { label: 'Gateway Latency', val: '< 45 ms' },
      { label: 'Containerization', val: 'Docker Microservices' }
    ],
    overview: `DeepGuard is an advanced multimodal deepfake detection platform engineered by Sahil Mishra. It tackles synthetic media falsification across facial imagery and video streams using a multi-model ensemble pipeline deployed as resilient Docker microservices behind a high-throughput FastAPI gateway.`,
    aiArchitecture: `• <strong>Ensemble Model Pipeline:</strong> Combines NPR Deepfake, UniversalFakeDetect, and Cross-Efficient Vision Transformers (ViT) with Weighted Voting, Stacking, and Probability Averaging to capture subtle artifacts across frequency and spatial domains.
• <strong>Scalable Backend Microservices:</strong> Containerized Python/FastAPI microservices communicating through REST endpoints with asynchronous background batch processing.
• <strong>Production Readiness:</strong> Secured with JWT authentication, SQLAlchemy ORM, OpenCV video frame extractors, and automated CI/CD testing via GitHub Actions.`,
    deliverables: [
      'PyTorch & OpenCV inference pipeline for multi-frame synthetic artifact scanning',
      'Docker Compose orchestration for multi-container microservice scaling',
      'Modern React + Tailwind CSS client dashboard with confidence heatmaps',
      'RESTful API documentation and automated GitHub Actions workflow'
    ]
  },
  jobportal: {
    title: 'AI-Powered Job Portal – Full-Stack SaaS Application',
    category: 'Full-Stack SaaS • Generative AI • Scalable Cloud Systems',
    github: 'https://github.com/sahil0205mishra',
    stats: [
      { label: 'Tech Stack', val: 'React + Node + FastAPI' },
      { label: 'Database & ORM', val: 'PostgreSQL + Prisma' },
      { label: 'API Architecture', val: 'RESTful + JWT' },
      { label: 'Deployment', val: 'Docker + Render + Supabase' }
    ],
    overview: `A complete full-stack SaaS ecosystem engineered to connect talent and recruiters through intelligent matching algorithms. Features dual-service architecture combining high-speed Node.js/Express web services with Python/FastAPI microservices for AI-assisted resume parsing and candidate ranking.`,
    aiArchitecture: `• <strong>Dual-Service Backend Architecture:</strong> Node.js/Express handles core transactions, authentication, and user sessions, while a high-performance Python/FastAPI engine handles semantic embeddings and resume-to-job vector matching.
• <strong>Relational Data Modeling:</strong> PostgreSQL hosted on Supabase, schema managed with Prisma ORM ensuring type safety across migrations.
• <strong>Modern Front-End:</strong> Built with React, TypeScript, Vite, and Tailwind CSS for instant load times and clean responsive UI states.`,
    deliverables: [
      'Modular REST APIs with role-based access control (Candidates & Recruiters)',
      'Automated semantic candidate scoring and resume parsing service',
      'Production Docker configuration with zero-downtime deployment pipelines'
    ]
  },
  realestate: {
    title: 'Enterprise Real Estate Management System',
    category: 'Web Application • Transaction Management • Database Design',
    github: 'https://github.com/sahil0205mishra',
    stats: [
      { label: 'Architecture', val: 'PHP MVC + MySQL' },
      { label: 'Data Integrity', val: '100% ACID' },
      { label: 'Frontend', val: 'Vanilla JS + CSS' },
      { label: 'Target', val: 'Property Operations' }
    ],
    overview: `A robust web-based enterprise system designed to streamline real estate operations, property listings, tenant-owner workflows, and transactional recordkeeping with high operational reliability.`,
    aiArchitecture: `• <strong>Structured Data Layer:</strong> Relational MySQL database schema designed for third normal form (3NF) property ownership records, leasing contracts, and payment schedules.
• <strong>Responsive User Experience:</strong> Clean modular PHP templates styled with modern CSS and Vanilla JavaScript client-side validations.`,
    deliverables: [
      'Comprehensive CRUD management for multi-unit property portfolios',
      'Role-based permissions for agents, buyers, and administrators',
      'Search filters with dynamic price, location, and square-footage aggregations'
    ]
  },
  neurohmi: {
    title: 'PulseOS / NeuroHMI — Context-Adaptive Smart Cockpit HMI',
    category: 'Automotive & IoT UI/UX • Smart Cluster HMI • Predictive Intelligence',
    github: 'https://github.com/sahil0205mishra',
    stats: [
      { label: 'Eye Off Road Reduction', val: '-34%' },
      { label: 'Range Estimation Accuracy', val: '98.4%' },
      { label: 'Cluster Frame Rate', val: '60 FPS (Rock Solid)' },
      { label: 'ISO 15008 Glare Contrast', val: '12:1 Pass' }
    ],
    overview: `PulseOS is an intelligent automotive & connected mobility HMI concept. High-speed riders and drivers experience severe visual fatigue when scanning complex telemetry under direct sunlight. This project introduces contextual UI surfaces that automatically declutter based on vehicle speed, throttle dynamics, and ambient daylight.`,
    aiArchitecture: `• <strong>Contextual UI Simplification Engine:</strong> Above 45 km/h, secondary cluster elements progressively fade out, magnifying glanceable speed, turn cues, and critical thermal alerts.
• <strong>Neural Energy Range Estimator:</strong> Predictive regression combining terrain elevation profiles, driver weight distribution, wind resistance vectors, and ambient battery pack temperature.
• <strong>Automotive Compliance:</strong> Strict ISO 15008 ergonomics ensuring readability in midday sun and preventing night-time pupil shock.`,
    deliverables: [
      '7-inch Touchscreen Design System in Figma (8px grid, tokens for Dark/Light)',
      'Automotive typography hierarchy prioritizing glanceability at 0.4-second peripheral vision',
      'Micro-interactions designed for gloved touch and handlebar toggle switches',
      'Live interactive WebGL / Canvas cluster simulation engine'
    ]
  },
  aeromorph: {
    title: 'AeroMorph AI — Generative EV & Aerospace Topology Optimization',
    category: 'Computational Engineering • Generative 3D CAD • Aerodynamics',
    github: 'https://github.com/sahil0205mishra',
    stats: [
      { label: 'Subframe Mass Reduction', val: '-14.2%' },
      { label: 'Torsional Rigidity', val: '435 Nm/deg' },
      { label: 'Drag Coefficient (Cd)', val: '0.284' },
      { label: 'Manufacturing Pass', val: '100% Castable' }
    ],
    overview: `High-performance mobility platforms require maximum torsional stiffness while minimizing unsprung mass. AeroMorph AI couples generative 3D latent diffusion models with Finite Element Analysis (FEA) boundary conditions to generate organic, hyper-efficient structural subframe components.`,
    aiArchitecture: `• <strong>Physics-Informed Generative Pipeline:</strong> Latent 3D diffusion guided by stress-tensor matrices derived from ANSYS FEA simulation under multi-axis bump and hard cornering loads.
• <strong>Aerodynamic Fairing Morphing:</strong> CFD-guided parametric surfacing routing turbulent air through internal cooling ducts.
• <strong>Manufacturing Feasibility Filter:</strong> Strict draft-angle constraints embedded in loss functions ensuring components can be high-pressure die-cast without expensive secondary tooling.`,
    deliverables: [
      'Parametric 3D CAD models (.STEP / .OBJ) with FEA von Mises stress validation',
      'CFD wind tunnel flow visualization benchmarks',
      'Generative CMF (Color, Material, Finish) palette exploring sustainable lightweight alloys'
    ]
  },
  visionary: {
    title: 'Frontier AI & Physical Systems — Vision & New Concepts',
    category: 'Future Frontier • Autonomous Agents • Spatial Computing • Edge AI',
    github: 'https://github.com/sahil0205mishra',
    stats: [
      { label: 'Multi-Agent CAD', val: 'Prompt-to-STEP' },
      { label: 'Spatial AI', val: 'NeRF / 3D Gaussian' },
      { label: 'Edge Autonomy', val: '< 10ms On-Device' },
      { label: 'Symbiosis', val: 'NeuroAdaptive HMI' }
    ],
    overview: `A strategic blueprint of next-generation paradigms where AI transitions from passive text chatbots to active physical world agents, generative engineering copilots, and spatial computing interfaces.`,
    aiArchitecture: `• <strong>Concept 1: SynapseCAD (Autonomous Multi-Agent Generative Engineering):</strong> An autonomous agentic hierarchy where product intent is translated into parametric 3D CAD by reasoning agents that consult real-time FEA solvers, aerodynamic CFD engines, and CNC manufacturing rules.
• <strong>Concept 2: Spatial NeRF & Holographic Telepresence HMI:</strong> Utilizing 3D Gaussian Splatting and Neural Radiance Fields to project true holographic hazard vectors, blind-spot reconstructions, and predictive trajectories directly onto physical windscreens and smart visors.
• <strong>Concept 3: NeuroAdaptive Human-Machine Symbiosis:</strong> Closed-loop cognitive telemetry measuring driver/operator micro-fatigue, pupil dilation, and reaction jitter to dynamically scale UI information density and assistive braking intervention.
• <strong>Concept 4: Edge-Native Zero-Latency Small Language Models (SLMs):</strong> 1.5B–3B parameter quantized multimodal foundation models executing 100% offline on localized NPUs for mission-critical robotics, drone swarms, and autonomous vehicles.`,
    deliverables: [
      'System architecture blueprints for multi-agent CAD synthesis',
      'Spatial UI interaction paradigms for augmented reality heads-up displays',
      'Quantization and pruning benchmarks for ARM / NPU edge deployment'
    ]
  }
};

function initModals() {
  const modalBackdrop = document.getElementById('caseStudyModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBody = document.getElementById('modalBody');
  const triggerBtns = document.querySelectorAll('.open-case-study');

  if (!modalBackdrop || !modalBody) return;

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const studyKey = btn.dataset.study;
      const data = caseStudyData[studyKey];
      if (!data) return;

      modalBody.innerHTML = `
        <div class="modal-header-block" style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <span style="font-family: var(--font-mono); color: var(--ather-mint); font-size: 0.8rem; text-transform: uppercase;">${data.category}</span>
            <a href="${data.github || 'https://github.com/sahil0205mishra'}" target="_blank" rel="noopener noreferrer" class="btn-tag" style="text-decoration: none;">🐙 GitHub Repository</a>
          </div>
          <h2 style="font-size: 1.8rem; font-weight: 800; margin: 8px 0 12px; color: #fff;">${data.title}</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-top: 16px;">
            ${data.stats.map(s => `
              <div style="background: rgba(255,255,255,0.04); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
                <span style="display: block; font-size: 1.25rem; font-weight: 800; color: var(--ather-mint); font-family: var(--font-mono);">${s.val}</span>
                <span style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase;">${s.label}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 8px;">Executive Summary</h3>
          <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6;">${data.overview}</p>
        </div>

        <div style="margin-bottom: 24px; background: rgba(0, 240, 255, 0.04); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 12px; padding: 20px;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--ather-cyan); margin-bottom: 10px;">Architecture &amp; Engineering Pipeline</h3>
          <div style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.65;">
            ${data.aiArchitecture.replace(/\n/g, '<br/>')}
          </div>
        </div>

        <div>
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 10px;">Key Deliverables &amp; Outcomes</h3>
          <ul style="list-style: none; padding-left: 0;">
            ${data.deliverables.map(d => `
              <li style="padding: 8px 0; color: var(--text-secondary); font-size: 0.88rem; display: flex; align-items: flex-start; gap: 8px;">
                <span style="color: var(--ather-mint);">✦</span> <span>${d}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div style="margin-top: 32px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-dim);">Technical Project Showcase • Sahil Mishra</span>
          <div style="display: flex; gap: 10px;">
            <a href="${data.github || 'https://github.com/sahil0205mishra'}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="font-size: 0.78rem; padding: 6px 14px;">🐙 Source Code</a>
            <button class="btn-primary" onclick="window.print()" style="font-size: 0.78rem; padding: 6px 14px;">🖨 Print / Export Study</button>
          </div>
        </div>
      `;

      modalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) closeModal();
  });
}

/* ==========================================================================
   4. Copy Public Link with Zero Permission Restrictions
   ========================================================================== */

function initCopyLink() {
  const copyBtns = document.querySelectorAll('.copy-portfolio-link');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentUrl = window.location.href;
      navigator.clipboard.writeText(currentUrl).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Link Copied! (Publicly Accessible)';
        btn.style.background = '#00E599';
        btn.style.color = '#000';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.style.color = '';
        }, 3000);
      }).catch(() => {
        alert(`Portfolio Link: ${window.location.href}\n(Public permissions enabled)`);
      });
    });
  });
}
