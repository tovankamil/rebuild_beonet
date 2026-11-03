import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import {
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  RotateCcw,
  Compass,
  Trophy,
  Network,
  Monitor,
  Lock,
  Smartphone,
  Sparkles,
  X,
  ChevronRight,
  Info,
  HelpCircle,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { officeAudio } from './officeAudio';
import {
  createFloorTexture,
  createSkyscraperTexture,
  createHoloScreenTexture,
  createTikTokScreenTexture,
  createVaultKeypadTexture,
  createGlowPointTexture,
} from './proceduralTextures';

// Hotspot definitions with routes & metadata
export const HOTSPOT_CONFIG = {
  genealogy: {
    id: 'genealogy',
    title: 'Pohon Jaringan Binary',
    subtitle: 'Visualisasi Pohon Kemitraan & Volume Kaki',
    tag: 'STRUKTUR JARINGAN',
    color: '#00f2fe',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: Network,
    route: '#/genealogy',
    actionText: 'Buka Binary Tree',
    description: 'Pantau pertumbuhan mitra kaki kiri & kanan, spillover real-time, dan omset PV jaringan Anda.',
    kpi: 'Kiri: 12.450 PV | Kanan: 14.200 PV',
    focusTarget: new THREE.Vector3(-4.5, 2.0, -1.2),
    cameraPos: new THREE.Vector3(-4.5, 2.8, 2.8),
  },
  'rank-rewards': {
    id: 'rank-rewards',
    title: 'Rank & Prestasi Juara',
    subtitle: 'Lemari Trofi & Penghargaan Peringkat',
    tag: 'PENGHARGAAN JUARA',
    color: '#f59e0b',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: Trophy,
    route: '#/rank-rewards',
    actionText: 'Lihat Hadiah Rank',
    description: 'Klaim hadiah kenaikan peringkat: gadget, tour luar negeri, hingga reward mobil & rumah mewah.',
    kpi: 'Peringkat Saat Ini: Diamond Leader 🏆',
    focusTarget: new THREE.Vector3(-7.2, 2.5, -4.5),
    cameraPos: new THREE.Vector3(-5.2, 2.8, -1.5),
  },
  overview: {
    id: 'overview',
    title: 'Meja Kerja Eksekutif',
    subtitle: 'Terminal Performa & Ringkasan Harian',
    tag: 'DASHBOARD UTAMA',
    color: '#10b981',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: Monitor,
    route: '#/overview',
    actionText: 'Buka Overview Mitra',
    description: 'Pusat kontrol performa harian, grafik omset penjualan, notifikasi real-time, dan bonus hari ini.',
    kpi: 'Estimasi Bonus Hari Ini: Rp 4.750.000',
    focusTarget: new THREE.Vector3(0, 1.4, 0),
    cameraPos: new THREE.Vector3(0, 2.5, 4.2),
  },
  withdrawal: {
    id: 'withdrawal',
    title: 'Brankas Saldo & Komisi',
    subtitle: 'Cyber Vault & Penarikan Dana Instan',
    tag: 'DOMPET BISNIS',
    color: '#fbbf24',
    badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    icon: Lock,
    route: '#/withdrawal',
    actionText: 'Tarik Saldo Komisi',
    description: 'Penyimpanan komisi aman terenkripsi. Lakukan transfer instan ke rekening bank terdaftar Anda.',
    kpi: 'Saldo Siap Cair: Rp 48.500.000',
    focusTarget: new THREE.Vector3(6.2, 1.8, -4.5),
    cameraPos: new THREE.Vector3(4.5, 2.2, -1.2),
  },
  leads: {
    id: 'leads',
    title: 'Pusat Leads TikTok & CRM',
    subtitle: 'Layar Kinerja Iklan & Automasi Calon Mitra',
    tag: 'MARKETING DIGITAL',
    color: '#ec4899',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    icon: Smartphone,
    route: '#/leads',
    actionText: 'Kelola Leads & CRM',
    description: 'Pusat integrasi TikTok Ads, leads capture otomatis, dan sistem auto-followup WhatsApp calon mitra.',
    kpi: '+142 Leads Baru Hari Ini (Konversi 64%)',
    focusTarget: new THREE.Vector3(6.5, 2.0, 2.2),
    cameraPos: new THREE.Vector3(4.2, 2.4, 3.8),
  },
};

export const CAMERA_PRESETS = [
  { id: 'overview360', label: 'Overview 360°', icon: Compass, target: new THREE.Vector3(0, 1.4, 0), pos: new THREE.Vector3(0, 4.2, 11) },
  { id: 'overview', label: 'Meja Kerja', icon: Monitor, target: HOTSPOT_CONFIG.overview.focusTarget, pos: HOTSPOT_CONFIG.overview.cameraPos },
  { id: 'genealogy', label: 'Pohon Jaringan', icon: Network, target: HOTSPOT_CONFIG.genealogy.focusTarget, pos: HOTSPOT_CONFIG.genealogy.cameraPos },
  { id: 'withdrawal', label: 'Brankas Kas', icon: Lock, target: HOTSPOT_CONFIG.withdrawal.focusTarget, pos: HOTSPOT_CONFIG.withdrawal.cameraPos },
  { id: 'rank-rewards', label: 'Lemari Trofi', icon: Trophy, target: HOTSPOT_CONFIG['rank-rewards'].focusTarget, pos: HOTSPOT_CONFIG['rank-rewards'].cameraPos },
  { id: 'leads', label: 'TikTok Leads', icon: Smartphone, target: HOTSPOT_CONFIG.leads.focusTarget, pos: HOTSPOT_CONFIG.leads.cameraPos },
];

export default function VirtualOffice3DView({
  currentUser = {},
  onNavigate,
  onOpenRankRewards,
  onClose,
  isModal = false,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Component UI States
  const [isNightMode, setIsNightMode] = useState(true);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePreset, setActivePreset] = useState('overview360');
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [projectedPins, setProjectedPins] = useState({});

  // Three.js instances ref
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const interactiveObjectsRef = useRef([]);
  const lightsRef = useRef({});
  const materialsRef = useRef([]);
  const texturesRef = useRef([]);

  // Camera Orbit & Transition State
  const cameraStateRef = useRef({
    currentPos: new THREE.Vector3(0, 4.2, 11),
    targetPos: new THREE.Vector3(0, 4.2, 11),
    currentLookAt: new THREE.Vector3(0, 1.4, 0),
    targetLookAt: new THREE.Vector3(0, 1.4, 0),
    isTransitioning: false,
    transitionProgress: 1,
    // Orbit angles
    theta: 0,
    phi: 0.35,
    radius: 11,
    isPointerDown: false,
    pointerStartX: 0,
    pointerStartY: 0,
    pinchDistStart: 0,
    lastHoverId: null,
  });

  // Handle Action Navigation Trigger
  const triggerHotspotAction = useCallback((hotspotId) => {
    officeAudio.playClickSound();
    const config = HOTSPOT_CONFIG[hotspotId];
    if (!config) return;

    if (hotspotId === 'rank-rewards' && onOpenRankRewards) {
      onOpenRankRewards();
      return;
    }

    if (onNavigate) {
      onNavigate(config.id);
    } else {
      window.location.hash = config.route;
    }

    if (isModal && onClose && (hotspotId !== 'overview' || window.innerWidth < 768)) {
      // Optional modal close on navigation
    }
  }, [onNavigate, onOpenRankRewards, onClose, isModal]);

  // Camera Preset Switch
  const applyCameraPreset = useCallback((presetId) => {
    officeAudio.playCameraPresetSound();
    setActivePreset(presetId);
    const preset = CAMERA_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const state = cameraStateRef.current;
    state.targetPos.copy(preset.pos);
    state.targetLookAt.copy(preset.target);
    state.isTransitioning = true;
    state.transitionProgress = 0;

    // Recalculate spherical angles from preset position
    const offset = new THREE.Vector3().subVectors(preset.pos, preset.target);
    state.radius = offset.length();
    state.theta = Math.atan2(offset.x, offset.z);
    state.phi = Math.asin(THREE.MathUtils.clamp(offset.y / state.radius, -0.9, 0.9));

    // If preset corresponds to a hotspot, select it
    if (HOTSPOT_CONFIG[presetId]) {
      setSelectedHotspot(presetId);
    } else {
      setSelectedHotspot(null);
    }
  }, []);

  // Audio Toggle
  const toggleAudio = useCallback(() => {
    const newState = officeAudio.toggleAmbience();
    setIsAudioActive(newState);
  }, []);

  // Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // -------------------------------------------------------------
  // THREE.JS SCENE INITIALIZATION & BUILD
  // -------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isNightMode ? 0x060919 : 0xbae6fd);
    scene.fog = new THREE.FogExp2(isNightMode ? 0x060919 : 0xdbeafe, isNightMode ? 0.022 : 0.012);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 4.2, 11);
    camera.lookAt(0, 1.4, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Arrays to collect for disposal
    const geometriesToDispose = [];
    const materialsToDispose = [];
    const texturesToDispose = [];

    const registerGeometry = (geo) => { geometriesToDispose.push(geo); return geo; };
    const registerMaterial = (mat) => { materialsToDispose.push(mat); materialsRef.current.push(mat); return mat; };
    const registerTexture = (tex) => { texturesToDispose.push(tex); texturesRef.current.push(tex); return tex; };

    // ---------------------------------------------------------
    // LIGHTING SETUP
    // ---------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(
      isNightMode ? 0x1e293b : 0xffffff,
      isNightMode ? 1.2 : 2.2
    );
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      isNightMode ? 0x38bdf8 : 0xffedd5,
      isNightMode ? 1.6 : 3.2
    );
    directionalLight.position.set(8, 12, 10);
    scene.add(directionalLight);

    // Ceiling Spotlight over Desk
    const deskSpotlight = new THREE.SpotLight(0x00f2fe, isNightMode ? 3.5 : 1.8, 16, Math.PI / 4, 0.4);
    deskSpotlight.position.set(0, 5.4, 0);
    deskSpotlight.target.position.set(0, 1.2, 0);
    scene.add(deskSpotlight);
    scene.add(deskSpotlight.target);

    // Dynamic Colored Pointlights
    const cyanPoint = new THREE.PointLight(0x00f2fe, isNightMode ? 3.0 : 1.5, 10);
    cyanPoint.position.set(-4.5, 2.5, -1.2); // Over Binary Tree
    scene.add(cyanPoint);

    const goldPoint = new THREE.PointLight(0xf59e0b, isNightMode ? 2.8 : 1.5, 9);
    goldPoint.position.set(-7.2, 2.8, -4.5); // Inside Trophy Cabinet
    scene.add(goldPoint);

    const vaultPoint = new THREE.PointLight(0xfbbf24, isNightMode ? 2.5 : 1.4, 8);
    vaultPoint.position.set(6.2, 2.2, -4.5); // Over Vault
    scene.add(vaultPoint);

    const pinkPoint = new THREE.PointLight(0xec4899, isNightMode ? 2.6 : 1.4, 9);
    pinkPoint.position.set(6.5, 2.5, 2.2); // Over TikTok Screen
    scene.add(pinkPoint);

    lightsRef.current = { ambientLight, directionalLight, deskSpotlight, cyanPoint, goldPoint, vaultPoint, pinkPoint };

    // ---------------------------------------------------------
    // ARCHITECTURAL PENTHOUSE ROOM
    // ---------------------------------------------------------
    // 1. Reflective Marble Floor
    const floorTex = registerTexture(createFloorTexture(isNightMode));
    const floorGeo = registerGeometry(new THREE.PlaneGeometry(24, 20));
    const floorMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: isNightMode ? 0.25 : 0.35,
        metalness: isNightMode ? 0.75 : 0.4,
      })
    );
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    scene.add(floor);

    // 2. Ceiling with Inset Glowing Cove
    const ceilingGeo = registerGeometry(new THREE.PlaneGeometry(24, 20));
    const ceilingMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        color: isNightMode ? 0x090e1c : 0xf8fafc,
        roughness: 0.8,
      })
    );
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 5.6, 0);
    scene.add(ceiling);

    // Ceiling Neon Inset Strip
    const coveGeo = registerGeometry(new THREE.RingGeometry(3.5, 3.55, 32));
    const coveMat = registerMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x00f2fe,
        side: THREE.DoubleSide,
      })
    );
    const coveMesh = new THREE.Mesh(coveGeo, coveMat);
    coveMesh.rotation.x = Math.PI / 2;
    coveMesh.position.set(0, 5.58, 0);
    scene.add(coveMesh);

    // 3. Left Wall (Titanium & Acoustic Carbon Panel)
    const leftWallGeo = registerGeometry(new THREE.BoxGeometry(0.3, 5.6, 20));
    const leftWallMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        color: isNightMode ? 0x0b1120 : 0xe2e8f0,
        roughness: 0.6,
        metalness: 0.3,
      })
    );
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.position.set(-11.9, 2.8, 0);
    scene.add(leftWall);

    // LED Vertical Strip on Left Wall
    const ledStripGeo = registerGeometry(new THREE.BoxGeometry(0.04, 5.2, 0.08));
    const ledStripMat = registerMaterial(new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    const ledStrip = new THREE.Mesh(ledStripGeo, ledStripMat);
    ledStrip.position.set(-11.7, 2.8, -4.5);
    scene.add(ledStrip);

    // 4. Panoramic Glass Windows (Back Wall & Right Wall)
    const glassFrameMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.2,
        metalness: 0.9,
      })
    );
    const glassPaneMat = registerMaterial(
      new THREE.MeshPhysicalMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: isNightMode ? 0.15 : 0.25,
        roughness: 0.1,
        transmission: 0.9,
        ior: 1.5,
      })
    );

    // Back Window Pillars (Z = -9.8)
    for (let x = -10; x <= 10; x += 3.5) {
      const pillarGeo = registerGeometry(new THREE.BoxGeometry(0.18, 5.6, 0.18));
      const pillar = new THREE.Mesh(pillarGeo, glassFrameMat);
      pillar.position.set(x, 2.8, -9.8);
      scene.add(pillar);
    }
    const backGlassGeo = registerGeometry(new THREE.PlaneGeometry(22, 5.5));
    const backGlass = new THREE.Mesh(backGlassGeo, glassPaneMat);
    backGlass.position.set(0, 2.8, -9.75);
    scene.add(backGlass);

    // Right Window Pillars (X = 11.8)
    for (let z = -9; z <= 9; z += 3.5) {
      const pillarGeo = registerGeometry(new THREE.BoxGeometry(0.18, 5.6, 0.18));
      const pillar = new THREE.Mesh(pillarGeo, glassFrameMat);
      pillar.position.set(11.8, 2.8, z);
      scene.add(pillar);
    }
    const rightGlassGeo = registerGeometry(new THREE.PlaneGeometry(18, 5.5));
    const rightGlass = new THREE.Mesh(rightGlassGeo, glassPaneMat);
    rightGlass.rotation.y = -Math.PI / 2;
    rightGlass.position.set(11.75, 2.8, 0);
    scene.add(rightGlass);

    // ---------------------------------------------------------
    // EXTERIOR 3D PROCEDURAL SKYLINE (Parallax Skyscrapers outside)
    // ---------------------------------------------------------
    const skylineGroup = new THREE.Group();
    const skyscraperTex = registerTexture(createSkyscraperTexture('mixed', isNightMode));
    const towerMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        map: skyscraperTex,
        roughness: 0.4,
        metalness: 0.5,
      })
    );

    // Antenna Beacon light spheres
    const beaconMeshes = [];

    // Generate ~36 skyscraper towers outside window
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 1.4 - 0.2;
      const dist = 22 + (i % 6) * 5;
      const x = Math.sin(angle) * dist + (i % 3 - 1) * 3;
      const z = -Math.cos(angle) * dist - 12;

      const widthB = 3.5 + (i % 4) * 1.5;
      const depthB = 3.5 + (i % 3) * 1.5;
      const heightB = 14 + (i * 7) % 24;

      const towerGeo = registerGeometry(new THREE.BoxGeometry(widthB, heightB, depthB));
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(x, heightB / 2 - 4, z);
      skylineGroup.add(tower);

      // Add antenna with blinking beacon on top of tall towers
      if (heightB > 22) {
        const antennaGeo = registerGeometry(new THREE.CylinderGeometry(0.06, 0.1, 4, 8));
        const antennaMat = registerMaterial(new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
        const antenna = new THREE.Mesh(antennaGeo, antennaMat);
        antenna.position.set(x, heightB - 4 + 2, z);
        skylineGroup.add(antenna);

        const beaconGeo = registerGeometry(new THREE.SphereGeometry(0.35, 12, 12));
        const beaconMat = registerMaterial(new THREE.MeshBasicMaterial({ color: 0xff3b30 }));
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(x, heightB - 4 + 4.1, z);
        skylineGroup.add(beacon);
        beaconMeshes.push(beacon);
      }
    }
    scene.add(skylineGroup);

    // Elevated Highway Light Trails (Curved laser trails)
    const curvePoints1 = [];
    for (let t = -30; t <= 30; t += 3) {
      curvePoints1.push(new THREE.Vector3(t, 1.2 + Math.sin(t * 0.1) * 0.5, -22 - Math.cos(t * 0.05) * 8));
    }
    const highwayCurve1 = new THREE.CatmullRomCurve3(curvePoints1);
    const highwayGeo1 = registerGeometry(new THREE.TubeGeometry(highwayCurve1, 40, 0.15, 8, false));
    const highwayMat1 = registerMaterial(new THREE.MeshBasicMaterial({ color: 0x00f2fe }));
    const highwayMesh1 = new THREE.Mesh(highwayGeo1, highwayMat1);
    scene.add(highwayMesh1);

    const curvePoints2 = [];
    for (let t = -30; t <= 30; t += 3) {
      curvePoints2.push(new THREE.Vector3(t, 2.8 + Math.cos(t * 0.08) * 0.6, -26 - Math.sin(t * 0.05) * 8));
    }
    const highwayCurve2 = new THREE.CatmullRomCurve3(curvePoints2);
    const highwayGeo2 = registerGeometry(new THREE.TubeGeometry(highwayCurve2, 40, 0.15, 8, false));
    const highwayMat2 = registerMaterial(new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    const highwayMesh2 = new THREE.Mesh(highwayGeo2, highwayMat2);
    scene.add(highwayMesh2);

    // Star Dust Field in Night Sky
    if (isNightMode) {
      const starGeo = registerGeometry(new THREE.BufferGeometry());
      const starCount = 350;
      const starPos = new Float32Array(starCount * 3);
      for (let s = 0; s < starCount; s++) {
        starPos[s * 3] = (Math.random() - 0.5) * 120;
        starPos[s * 3 + 1] = 10 + Math.random() * 50;
        starPos[s * 3 + 2] = -25 - Math.random() * 60;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const glowPointTex = registerTexture(createGlowPointTexture());
      const starMat = registerMaterial(
        new THREE.PointsMaterial({
          map: glowPointTex,
          size: 0.8,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        })
      );
      const starField = new THREE.Points(starGeo, starMat);
      scene.add(starField);
    }

    // ---------------------------------------------------------
    // 5 INTERACTIVE 3D OBJECTS & HOTSPOTS
    // ---------------------------------------------------------
    const interactiveList = [];

    // =========================================================
    // HOTSPOT 1: HOLOGRAM BINARY TREE GLOBE (id: 'genealogy')
    // =========================================================
    const treeGroup = new THREE.Group();
    treeGroup.position.set(-4.5, 0, -1.2);
    treeGroup.userData = { id: 'genealogy' };

    // Pedestal Base
    const treeBaseGeo = registerGeometry(new THREE.CylinderGeometry(1.2, 1.4, 0.35, 32));
    const treeBaseMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.85,
        roughness: 0.2,
      })
    );
    const treeBase = new THREE.Mesh(treeBaseGeo, treeBaseMat);
    treeBase.position.y = 0.175;
    treeGroup.add(treeBase);

    // Emissive Cyan Base Ring
    const treeRingGeo = registerGeometry(new THREE.TorusGeometry(1.15, 0.05, 12, 48));
    const treeRingMat = registerMaterial(new THREE.MeshBasicMaterial({ color: 0x00f2fe }));
    const treeRing = new THREE.Mesh(treeRingGeo, treeRingMat);
    treeRing.rotation.x = Math.PI / 2;
    treeRing.position.y = 0.36;
    treeGroup.add(treeRing);

    // Hologram Projector Light Cone
    const coneGeo = registerGeometry(new THREE.CylinderGeometry(1.0, 0.2, 1.6, 32, 1, true));
    const coneMat = registerMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x00f2fe,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })
    );
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.position.y = 1.15;
    treeGroup.add(coneMesh);

    // Floating Binary Globe Core
    const globeCoreGroup = new THREE.Group();
    globeCoreGroup.position.y = 2.2;

    // Outer Wireframe Sphere
    const globeWireGeo = registerGeometry(new THREE.IcosahedronGeometry(1.0, 2));
    const globeWireMat = registerMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x00f2fe,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
      })
    );
    const globeWire = new THREE.Mesh(globeWireGeo, globeWireMat);
    globeCoreGroup.add(globeWire);

    // Inner Binary Tree Nodes & Branches
    const rootNodeGeo = registerGeometry(new THREE.SphereGeometry(0.18, 16, 16));
    const rootNodeMat = registerMaterial(new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    const rootNode = new THREE.Mesh(rootNodeGeo, rootNodeMat);
    rootNode.position.set(0, 0.45, 0);
    globeCoreGroup.add(rootNode);

    // Left & Right Child Nodes
    const leftChildGeo = registerGeometry(new THREE.SphereGeometry(0.13, 14, 14));
    const leftChildMat = registerMaterial(new THREE.MeshBasicMaterial({ color: 0x00f2fe }));
    const leftChild = new THREE.Mesh(leftChildGeo, leftChildMat);
    leftChild.position.set(-0.45, 0.05, 0.1);
    globeCoreGroup.add(leftChild);

    const rightChildGeo = registerGeometry(new THREE.SphereGeometry(0.13, 14, 14));
    const rightChildMat = registerMaterial(new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    const rightChild = new THREE.Mesh(rightChildGeo, rightChildMat);
    rightChild.position.set(0.45, 0.05, -0.1);
    globeCoreGroup.add(rightChild);

    // Subnodes
    const subnodePositions = [
      [-0.65, -0.38, 0.2],
      [-0.25, -0.38, -0.15],
      [0.25, -0.38, 0.15],
      [0.65, -0.38, -0.2],
    ];
    subnodePositions.forEach((pos, idx) => {
      const subGeo = registerGeometry(new THREE.SphereGeometry(0.08, 12, 12));
      const subMat = registerMaterial(new THREE.MeshBasicMaterial({ color: idx % 2 === 0 ? 0x00f2fe : 0x10b981 }));
      const subMesh = new THREE.Mesh(subGeo, subMat);
      subMesh.position.set(...pos);
      globeCoreGroup.add(subMesh);
    });

    // Connecting Branch Lines (LineSegments)
    const branchPoints = [
      new THREE.Vector3(0, 0.45, 0), new THREE.Vector3(-0.45, 0.05, 0.1),
      new THREE.Vector3(0, 0.45, 0), new THREE.Vector3(0.45, 0.05, -0.1),
      new THREE.Vector3(-0.45, 0.05, 0.1), new THREE.Vector3(-0.65, -0.38, 0.2),
      new THREE.Vector3(-0.45, 0.05, 0.1), new THREE.Vector3(-0.25, -0.38, -0.15),
      new THREE.Vector3(0.45, 0.05, -0.1), new THREE.Vector3(0.25, -0.38, 0.15),
      new THREE.Vector3(0.45, 0.05, -0.1), new THREE.Vector3(0.65, -0.38, -0.2),
    ];
    const branchGeo = registerGeometry(new THREE.BufferGeometry().setFromPoints(branchPoints));
    const branchMat = registerMaterial(new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 }));
    const branchLines = new THREE.LineSegments(branchGeo, branchMat);
    globeCoreGroup.add(branchLines);

    // Orbiting Gimbal Ring 1 & 2
    const gimbalGeo1 = registerGeometry(new THREE.TorusGeometry(1.22, 0.015, 8, 48));
    const gimbalMat1 = registerMaterial(new THREE.MeshBasicMaterial({ color: 0x00f2fe }));
    const gimbal1 = new THREE.Mesh(gimbalGeo1, gimbalMat1);
    globeCoreGroup.add(gimbal1);

    const gimbalGeo2 = registerGeometry(new THREE.TorusGeometry(1.32, 0.015, 8, 48));
    const gimbalMat2 = registerMaterial(new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    const gimbal2 = new THREE.Mesh(gimbalGeo2, gimbalMat2);
    gimbal2.rotation.x = Math.PI / 3;
    globeCoreGroup.add(gimbal2);

    // Raycast hit target sphere
    const treeHitGeo = registerGeometry(new THREE.SphereGeometry(1.35, 16, 16));
    const treeHitMat = registerMaterial(new THREE.MeshBasicMaterial({ visible: false }));
    const treeHitMesh = new THREE.Mesh(treeHitGeo, treeHitMat);
    treeHitMesh.position.y = 2.2;
    treeHitMesh.userData = { id: 'genealogy' };
    treeGroup.add(treeHitMesh);
    interactiveList.push(treeHitMesh);

    treeGroup.add(globeCoreGroup);
    scene.add(treeGroup);

    // =========================================================
    // HOTSPOT 2: DINDING PRESTASI & TROPHY SHOWCASE (id: 'rank-rewards')
    // =========================================================
    const trophyGroup = new THREE.Group();
    trophyGroup.position.set(-7.2, 0, -4.5);
    trophyGroup.userData = { id: 'rank-rewards' };

    // Glass Showcase Frame
    const caseFrameGeo = registerGeometry(new THREE.BoxGeometry(2.4, 4.6, 1.4));
    const caseFrameMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.9,
        roughness: 0.2,
      })
    );
    const caseFrame = new THREE.Mesh(caseFrameGeo, caseFrameMat);
    caseFrame.position.y = 2.3;
    trophyGroup.add(caseFrame);

    // Glass Panels
    const caseGlassGeo = registerGeometry(new THREE.BoxGeometry(2.1, 4.2, 1.2));
    const caseGlassMat = registerMaterial(
      new THREE.MeshPhysicalMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.25,
        roughness: 0.1,
        transmission: 0.85,
      })
    );
    const caseGlass = new THREE.Mesh(caseGlassGeo, caseGlassMat);
    caseGlass.position.y = 2.3;
    trophyGroup.add(caseGlass);

    // Interior Glass Display Shelf
    const shelfGeo = registerGeometry(new THREE.BoxGeometry(1.9, 0.08, 1.0));
    const shelfMat = registerMaterial(new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.y = 1.9;
    trophyGroup.add(shelf);

    // 3D Gold Trophy Assembly (Floating & Rotating)
    const trophyCoreGroup = new THREE.Group();
    trophyCoreGroup.position.set(0, 2.5, 0);

    // Trophy Base Pedestal
    const tropBaseGeo = registerGeometry(new THREE.CylinderGeometry(0.32, 0.4, 0.25, 8));
    const tropBaseMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.8,
        roughness: 0.2,
      })
    );
    const tropBase = new THREE.Mesh(tropBaseGeo, tropBaseMat);
    trophyCoreGroup.add(tropBase);

    // Trophy Riser & Cup (High-gloss gold)
    const goldTrophyMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.95,
        roughness: 0.15,
        emissive: 0x78350f,
        emissiveIntensity: 0.3,
      })
    );
    const stemGeo = registerGeometry(new THREE.CylinderGeometry(0.08, 0.12, 0.3, 16));
    const stem = new THREE.Mesh(stemGeo, goldTrophyMat);
    stem.position.y = 0.25;
    trophyCoreGroup.add(stem);

    const cupGeo = registerGeometry(new THREE.CylinderGeometry(0.38, 0.15, 0.55, 24));
    const cup = new THREE.Mesh(cupGeo, goldTrophyMat);
    cup.position.y = 0.65;
    trophyCoreGroup.add(cup);

    // Cup Handles (2 Torus Arcs)
    const handleGeo = registerGeometry(new THREE.TorusGeometry(0.22, 0.035, 12, 24, Math.PI));
    const leftHandle = new THREE.Mesh(handleGeo, goldTrophyMat);
    leftHandle.rotation.z = -Math.PI / 2;
    leftHandle.position.set(-0.35, 0.65, 0);
    trophyCoreGroup.add(leftHandle);

    const rightHandle = new THREE.Mesh(handleGeo, goldTrophyMat);
    rightHandle.rotation.z = Math.PI / 2;
    rightHandle.position.set(0.35, 0.65, 0);
    trophyCoreGroup.add(rightHandle);

    // Floating Golden Star on top of Trophy
    const starGeo = registerGeometry(new THREE.OctahedronGeometry(0.18, 0));
    const starMat = registerMaterial(new THREE.MeshBasicMaterial({ color: 0xfffbeb }));
    const starMesh = new THREE.Mesh(starGeo, starMat);
    starMesh.position.y = 1.15;
    trophyCoreGroup.add(starMesh);

    trophyGroup.add(trophyCoreGroup);

    // Raycast Hit Box for Trophy
    const trophyHitGeo = registerGeometry(new THREE.BoxGeometry(2.2, 4.4, 1.3));
    const trophyHitMat = registerMaterial(new THREE.MeshBasicMaterial({ visible: false }));
    const trophyHit = new THREE.Mesh(trophyHitGeo, trophyHitMat);
    trophyHit.position.y = 2.3;
    trophyHit.userData = { id: 'rank-rewards' };
    trophyGroup.add(trophyHit);
    interactiveList.push(trophyHit);

    scene.add(trophyGroup);

    // =========================================================
    // HOTSPOT 3: MEJA EKSEKUTIF & TERMINAL HOLOGRAM (id: 'overview')
    // =========================================================
    const deskGroup = new THREE.Group();
    deskGroup.position.set(0, 0, 0);
    deskGroup.userData = { id: 'overview' };

    // Luxury Executive Desk Surface
    const deskTopGeo = registerGeometry(new THREE.BoxGeometry(4.2, 0.12, 1.9));
    const deskTopMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        color: isNightMode ? 0x090e18 : 0x334155,
        roughness: 0.3,
        metalness: 0.7,
      })
    );
    const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
    deskTop.position.y = 1.1;
    deskGroup.add(deskTop);

    // Modern Cantilever Desk Legs
    const legGeo = registerGeometry(new THREE.BoxGeometry(0.12, 1.1, 1.8));
    const legMat = registerMaterial(new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 }));
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-1.95, 0.55, 0);
    deskGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(1.95, 0.55, 0);
    deskGroup.add(rightLeg);

    // Executive Chair (behind desk at Z = -1.2)
    const chairGroup = new THREE.Group();
    chairGroup.position.set(0, 0, -1.2);
    const seatGeo = registerGeometry(new THREE.BoxGeometry(0.9, 0.1, 0.85));
    const chairMat = registerMaterial(new THREE.MeshStandardMaterial({ color: 0x0b1120, roughness: 0.6 }));
    const seat = new THREE.Mesh(seatGeo, chairMat);
    seat.position.y = 0.8;
    chairGroup.add(seat);

    const backGeo = registerGeometry(new THREE.BoxGeometry(0.85, 1.1, 0.1));
    const back = new THREE.Mesh(backGeo, chairMat);
    back.position.set(0, 1.35, -0.4);
    chairGroup.add(back);
    deskGroup.add(chairGroup);

    // Laptop Terminal on Desk
    const laptopBaseGeo = registerGeometry(new THREE.BoxGeometry(0.65, 0.02, 0.45));
    const laptopMat = registerMaterial(new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9 }));
    const laptopBase = new THREE.Mesh(laptopBaseGeo, laptopMat);
    laptopBase.position.set(0, 1.17, 0.15);
    deskGroup.add(laptopBase);

    // Floating Curved Holographic Screen
    const holoScreenTex = registerTexture(
      createHoloScreenTexture(currentUser?.name || 'Mitra Eksekutif Bionet', currentUser?.rank || 'Diamond Leader')
    );
    const holoScreenGeo = registerGeometry(new THREE.PlaneGeometry(2.7, 1.35));
    const holoScreenMat = registerMaterial(
      new THREE.MeshBasicMaterial({
        map: holoScreenTex,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      })
    );
    const holoScreenMesh = new THREE.Mesh(holoScreenGeo, holoScreenMat);
    holoScreenMesh.position.set(0, 2.15, -0.05);
    deskGroup.add(holoScreenMesh);

    // Hologram Projection Emitter Disc on Desk
    const emitterGeo = registerGeometry(new THREE.CylinderGeometry(0.35, 0.35, 0.02, 32));
    const emitterMat = registerMaterial(new THREE.MeshBasicMaterial({ color: 0x00f2fe }));
    const emitter = new THREE.Mesh(emitterGeo, emitterMat);
    emitter.position.set(0, 1.165, -0.05);
    deskGroup.add(emitter);

    // Raycast Hit Box for Desk
    const deskHitGeo = registerGeometry(new THREE.BoxGeometry(4.4, 2.4, 2.2));
    const deskHitMat = registerMaterial(new THREE.MeshBasicMaterial({ visible: false }));
    const deskHit = new THREE.Mesh(deskHitGeo, deskHitMat);
    deskHit.position.y = 1.6;
    deskHit.userData = { id: 'overview' };
    deskGroup.add(deskHit);
    interactiveList.push(deskHit);

    scene.add(deskGroup);

    // =========================================================
    // HOTSPOT 4: CYBER VAULT / BRANKAS KOMISI (id: 'withdrawal')
    // =========================================================
    const vaultGroup = new THREE.Group();
    vaultGroup.position.set(6.2, 0, -4.5);
    vaultGroup.userData = { id: 'withdrawal' };

    // Heavy Titanium Vault Box
    const vaultBoxGeo = registerGeometry(new THREE.BoxGeometry(2.1, 2.7, 1.9));
    const vaultBoxMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x090e17,
        metalness: 0.92,
        roughness: 0.25,
      })
    );
    const vaultBox = new THREE.Mesh(vaultBoxGeo, vaultBoxMat);
    vaultBox.position.y = 1.35;
    vaultGroup.add(vaultBox);

    // Vault Door Face Keypad & Readout Screen
    const vaultTex = registerTexture(createVaultKeypadTexture());
    const vaultFaceGeo = registerGeometry(new THREE.PlaneGeometry(1.8, 1.8));
    const vaultFaceMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        map: vaultTex,
        roughness: 0.3,
        metalness: 0.7,
      })
    );
    const vaultFace = new THREE.Mesh(vaultFaceGeo, vaultFaceMat);
    vaultFace.position.set(0, 1.35, 0.96);
    vaultGroup.add(vaultFace);

    // Rotating Vault 6-Spoke Wheel
    const wheelCoreGroup = new THREE.Group();
    wheelCoreGroup.position.set(0, 0.9, 0.98);

    const wheelRimGeo = registerGeometry(new THREE.TorusGeometry(0.38, 0.04, 12, 32));
    const wheelMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.95,
        roughness: 0.15,
      })
    );
    const wheelRim = new THREE.Mesh(wheelRimGeo, wheelMat);
    wheelCoreGroup.add(wheelRim);

    // 3 Spoke Cylinders
    for (let sp = 0; sp < 3; sp++) {
      const spokeGeo = registerGeometry(new THREE.CylinderGeometry(0.025, 0.025, 0.76, 8));
      const spoke = new THREE.Mesh(spokeGeo, wheelMat);
      spoke.rotation.z = (sp * Math.PI) / 3;
      wheelCoreGroup.add(spoke);
    }
    vaultGroup.add(wheelCoreGroup);

    // Gold Bullion Bars Stack beside Vault
    const goldBarMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.95,
        roughness: 0.18,
      })
    );
    const barGeo = registerGeometry(new THREE.BoxGeometry(0.55, 0.16, 0.3));
    const barPositions = [
      [-1.3, 0.08, 0.2],
      [-1.3, 0.08, -0.2],
      [-1.3, 0.24, 0],
    ];
    barPositions.forEach((pos) => {
      const barMesh = new THREE.Mesh(barGeo, goldBarMat);
      barMesh.position.set(...pos);
      vaultGroup.add(barMesh);
    });

    // Raycast Hit Box for Vault
    const vaultHitGeo = registerGeometry(new THREE.BoxGeometry(2.6, 3.0, 2.3));
    const vaultHitMat = registerMaterial(new THREE.MeshBasicMaterial({ visible: false }));
    const vaultHit = new THREE.Mesh(vaultHitGeo, vaultHitMat);
    vaultHit.position.y = 1.4;
    vaultHit.userData = { id: 'withdrawal' };
    vaultGroup.add(vaultHit);
    interactiveList.push(vaultHit);

    scene.add(vaultGroup);

    // =========================================================
    // HOTSPOT 5: TIKTOK VIRAL SCREEN (id: 'leads')
    // =========================================================
    const tiktokGroup = new THREE.Group();
    tiktokGroup.position.set(6.5, 0, 2.2);
    tiktokGroup.userData = { id: 'leads' };

    // Vertical Stand Base
    const standBaseGeo = registerGeometry(new THREE.CylinderGeometry(0.75, 0.85, 0.12, 32));
    const standMat = registerMaterial(new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 }));
    const standBase = new THREE.Mesh(standBaseGeo, standMat);
    standBase.position.y = 0.06;
    tiktokGroup.add(standBase);

    // Vertical Stand Pole
    const poleGeo = registerGeometry(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 16));
    const pole = new THREE.Mesh(poleGeo, standMat);
    pole.position.y = 0.96;
    tiktokGroup.add(pole);

    // Screen Housing Frame (9:16 Aspect Ratio)
    const frameGeo = registerGeometry(new THREE.BoxGeometry(1.68, 2.92, 0.08));
    const frameMat = registerMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.85,
        roughness: 0.2,
      })
    );
    const screenFrame = new THREE.Mesh(frameGeo, frameMat);
    screenFrame.position.y = 2.2;
    tiktokGroup.add(screenFrame);

    // Glowing Neon Bezel (Magenta & Cyan)
    const bezelGeo = registerGeometry(new THREE.BoxGeometry(1.72, 2.96, 0.04));
    const bezelMat = registerMaterial(
      new THREE.MeshBasicMaterial({
        color: 0xec4899,
        wireframe: true,
      })
    );
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.position.y = 2.2;
    tiktokGroup.add(bezel);

    // Vertical TikTok Screen Texture Display
    const tiktokTex = registerTexture(createTikTokScreenTexture());
    const tiktokScreenGeo = registerGeometry(new THREE.PlaneGeometry(1.58, 2.8));
    const tiktokScreenMat = registerMaterial(
      new THREE.MeshBasicMaterial({
        map: tiktokTex,
        side: THREE.DoubleSide,
      })
    );
    const tiktokScreenMesh = new THREE.Mesh(tiktokScreenGeo, tiktokScreenMat);
    tiktokScreenMesh.position.set(0, 2.2, 0.045);
    tiktokGroup.add(tiktokScreenMesh);

    // Rotating TikTok Vinyl Sound Disc in Corner
    const vinylGeo = registerGeometry(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 24));
    const vinylMat = registerMaterial(new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.95 }));
    const vinylMesh = new THREE.Mesh(vinylGeo, vinylMat);
    vinylMesh.rotation.x = Math.PI / 2;
    vinylMesh.position.set(0.55, 1.1, 0.06);
    tiktokGroup.add(vinylMesh);

    // Raycast Hit Box for TikTok Screen
    const tiktokHitGeo = registerGeometry(new THREE.BoxGeometry(1.8, 3.2, 0.6));
    const tiktokHitMat = registerMaterial(new THREE.MeshBasicMaterial({ visible: false }));
    const tiktokHit = new THREE.Mesh(tiktokHitGeo, tiktokHitMat);
    tiktokHit.position.y = 2.2;
    tiktokHit.userData = { id: 'leads' };
    tiktokGroup.add(tiktokHit);
    interactiveList.push(tiktokHit);

    scene.add(tiktokGroup);

    // Save interactive meshes
    interactiveObjectsRef.current = interactiveList;

    // ---------------------------------------------------------
    // ANIMATION & RENDER LOOP
    // ---------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // 1. Hologram Binary Tree Animation
      if (globeCoreGroup) {
        globeCoreGroup.rotation.y += delta * 0.45;
        gimbal1.rotation.y += delta * 0.8;
        gimbal2.rotation.z -= delta * 0.6;
        globeCoreGroup.position.y = 2.2 + Math.sin(elapsed * 1.8) * 0.06;
      }

      // 2. Trophy Animation
      if (trophyCoreGroup) {
        trophyCoreGroup.rotation.y += delta * 0.6;
        trophyCoreGroup.position.y = 2.5 + Math.sin(elapsed * 2.2) * 0.08;
        if (starMesh) starMesh.rotation.y += delta * 1.5;
      }

      // 3. Desk Hologram Screen Floating
      if (holoScreenMesh) {
        holoScreenMesh.position.y = 2.15 + Math.sin(elapsed * 1.5) * 0.04;
      }

      // 4. Vault Wheel Rotation & Pulse
      if (wheelCoreGroup) {
        wheelCoreGroup.rotation.z += delta * 0.15;
      }

      // 5. TikTok Vinyl Disc Rotation
      if (vinylMesh) {
        vinylMesh.rotation.z += delta * 2.5;
      }

      // Blinking Sky Beacon Lights
      beaconMeshes.forEach((b, idx) => {
        b.visible = Math.sin(elapsed * 3.5 + idx) > 0;
      });

      // 6. Camera Orbit Damping & Transition Lerp
      const cState = cameraStateRef.current;

      if (cState.isTransitioning) {
        cState.transitionProgress += delta * 1.8;
        const t = Math.min(cState.transitionProgress, 1);
        const smoothT = t * t * (3 - 2 * t); // smoothstep ease

        cState.currentPos.lerpVectors(camera.position, cState.targetPos, smoothT);
        cState.currentLookAt.lerpVectors(camera.position, cState.targetLookAt, smoothT);

        camera.position.copy(cState.currentPos);
        camera.lookAt(cState.currentLookAt);

        if (t >= 1) {
          cState.isTransitioning = false;
        }
      } else {
        // Idle Auto-rotation
        if (isAutoRotate && !cState.isPointerDown) {
          cState.theta += delta * 0.12;
        }

        // Spherical coordinates position calculation
        const sinPhi = Math.sin(cState.phi);
        const cosPhi = Math.cos(cState.phi);
        const sinTheta = Math.sin(cState.theta);
        const cosTheta = Math.cos(cState.theta);

        const desiredX = cState.targetLookAt.x + cState.radius * cosPhi * sinTheta;
        const desiredY = cState.targetLookAt.y + cState.radius * sinPhi;
        const desiredZ = cState.targetLookAt.z + cState.radius * cosPhi * cosTheta;

        const desiredPos = new THREE.Vector3(desiredX, desiredY, desiredZ);
        cState.currentPos.lerp(desiredPos, 0.08);

        camera.position.copy(cState.currentPos);
        camera.lookAt(cState.targetLookAt);
      }

      // 7. Calculate 2D Screen Projections for HUD Hotspot Pins
      const newPins = {};
      const screenW = container.clientWidth;
      const screenH = container.clientHeight;

      Object.entries(HOTSPOT_CONFIG).forEach(([key, cfg]) => {
        const v = cfg.focusTarget.clone();
        v.y += 0.8; // float above hotspot
        v.project(camera);

        // Check if point is in front of camera
        if (v.z < 1) {
          const screenX = (v.x * 0.5 + 0.5) * screenW;
          const screenY = (-(v.y * 0.5) + 0.5) * screenH;
          newPins[key] = { x: screenX, y: screenY, visible: true };
        } else {
          newPins[key] = { visible: false };
        }
      });
      setProjectedPins(newPins);

      // 8. Render Scene
      renderer.render(scene, camera);
    };

    animate();

    // ---------------------------------------------------------
    // RESIZE LISTENER
    // ---------------------------------------------------------
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // ---------------------------------------------------------
    // CLEANUP ON UNMOUNT
    // ---------------------------------------------------------
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();

      // Dispose Geometries
      geometriesToDispose.forEach((geo) => geo.dispose());

      // Dispose Materials
      materialsToDispose.forEach((mat) => mat.dispose());

      // Dispose Textures
      texturesToDispose.forEach((tex) => tex.dispose());

      // Dispose Renderer
      renderer.dispose();
    };
  }, [isNightMode, currentUser]);

  // -------------------------------------------------------------
  // POINTER & TOUCH EVENT HANDLERS (Custom Orbit & Raycast)
  // -------------------------------------------------------------
  const handlePointerDown = (e) => {
    const state = cameraStateRef.current;
    state.isPointerDown = true;
    state.pointerStartX = e.clientX;
    state.pointerStartY = e.clientY;
    state.isTransitioning = false;
  };

  const handlePointerMove = (e) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const state = cameraStateRef.current;

    // Handle Drag Orbit
    if (state.isPointerDown) {
      const deltaX = e.clientX - state.pointerStartX;
      const deltaY = e.clientY - state.pointerStartY;
      state.pointerStartX = e.clientX;
      state.pointerStartY = e.clientY;

      state.theta -= deltaX * 0.005;
      state.phi = THREE.MathUtils.clamp(state.phi + deltaY * 0.005, 0.05, 1.45);
    }

    // Handle Raycast Hover
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x, y }, camera);

    const intersects = raycaster.intersectObjects(interactiveObjectsRef.current, false);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const hotspotId = hitObj.userData?.id;
      if (hotspotId && HOTSPOT_CONFIG[hotspotId]) {
        if (state.lastHoverId !== hotspotId) {
          officeAudio.playHoverSound();
          state.lastHoverId = hotspotId;
        }
        setHoveredHotspot(hotspotId);
        container.style.cursor = 'pointer';
        return;
      }
    }

    state.lastHoverId = null;
    setHoveredHotspot(null);
    container.style.cursor = state.isPointerDown ? 'grabbing' : 'grab';
  };

  const handlePointerUp = (e) => {
    const state = cameraStateRef.current;
    state.isPointerDown = false;
  };

  const handleCanvasClick = (e) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x, y }, camera);

    const intersects = raycaster.intersectObjects(interactiveObjectsRef.current, false);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const hotspotId = hitObj.userData?.id;
      if (hotspotId && HOTSPOT_CONFIG[hotspotId]) {
        setSelectedHotspot(hotspotId);
        applyCameraPreset(hotspotId);
      }
    }
  };

  // Zoom with Mouse Wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const state = cameraStateRef.current;
    state.radius = THREE.MathUtils.clamp(state.radius + e.deltaY * 0.008, 4.0, 16.0);
    state.isTransitioning = false;
  };

  // Touch Support (Pinch to Zoom)
  const handleTouchStart = (e) => {
    const state = cameraStateRef.current;
    if (e.touches.length === 1) {
      state.isPointerDown = true;
      state.pointerStartX = e.touches[0].clientX;
      state.pointerStartY = e.touches[0].clientY;
      state.isTransitioning = false;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      state.pinchDistStart = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e) => {
    const state = cameraStateRef.current;
    if (e.touches.length === 1 && state.isPointerDown) {
      const deltaX = e.touches[0].clientX - state.pointerStartX;
      const deltaY = e.touches[0].clientY - state.pointerStartY;
      state.pointerStartX = e.touches[0].clientX;
      state.pointerStartY = e.touches[0].clientY;

      state.theta -= deltaX * 0.006;
      state.phi = THREE.MathUtils.clamp(state.phi + deltaY * 0.006, 0.05, 1.45);
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const deltaDist = state.pinchDistStart - dist;
      state.radius = THREE.MathUtils.clamp(state.radius + deltaDist * 0.02, 4.0, 16.0);
      state.pinchDistStart = dist;
    }
  };

  const handleTouchEnd = () => {
    const state = cameraStateRef.current;
    state.isPointerDown = false;
  };

  // Active Hotspot detail (either hovered or selected)
  const activeHotspotId = hoveredHotspot || selectedHotspot;
  const activeHotspotData = activeHotspotId ? HOTSPOT_CONFIG[activeHotspotId] : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] overflow-hidden select-none bg-slate-950 text-white font-sans"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleCanvasClick}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: 'grab' }}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* ------------------------------------------------------------- */}
      {/* FLOATING 3D HOTSPOT BADGES (Projected from 3D to 2D Screen) */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Object.entries(HOTSPOT_CONFIG).map(([key, config]) => {
          const pin = projectedPins[key];
          if (!pin || !pin.visible) return null;
          const isHovered = hoveredHotspot === key;
          const isSelected = selectedHotspot === key;
          const IconComponent = config.icon;

          return (
            <div
              key={key}
              style={{
                transform: `translate3d(${pin.x}px, ${pin.y}px, 0) translate(-50%, -50%)`,
              }}
              className="absolute pointer-events-auto transition-transform duration-150 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHotspot(key);
                applyCameraPreset(key);
              }}
              onMouseEnter={() => setHoveredHotspot(key)}
              onMouseLeave={() => setHoveredHotspot(null)}
            >
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300 shadow-xl ${
                  isHovered || isSelected
                    ? 'scale-110 bg-slate-900/90 border-cyan-400 text-white shadow-cyan-500/30'
                    : 'bg-slate-950/75 border-slate-700/80 text-slate-200 hover:border-cyan-400/80'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full animate-ping"
                  style={{ backgroundColor: config.color }}
                />
                <IconComponent size={14} style={{ color: config.color }} />
                <span className="text-xs font-semibold tracking-wide whitespace-nowrap">
                  {config.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER HUD OVERLAY */}
      {/* ------------------------------------------------------------- */}
      <header className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
        {/* Title & Mitra Badge */}
        <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-emerald-500 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap size={20} className="text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                BIONET VIRTUAL OFFICE 3D
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                PENTHOUSE SUITE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>{currentUser?.name || 'Mitra Eksekutif'}</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-semibold">{currentUser?.rank || 'Diamond Leader'}</span>
            </p>
          </div>
        </div>

        {/* Action Controls Pill Bar */}
        <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl">
          {/* Ambience Audio Toggle */}
          <button
            onClick={toggleAudio}
            title={isAudioActive ? 'Matikan Suara Ambience' : 'Aktifkan Synth Ambience Ruang'}
            className={`p-2 rounded-xl transition-all ${
              isAudioActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {isAudioActive ? <Volume2 size={18} className="animate-pulse" /> : <VolumeX size={18} />}
          </button>

          {/* Day / Cyberpunk Night Mode Toggle */}
          <button
            onClick={() => setIsNightMode((prev) => !prev)}
            title={isNightMode ? 'Ubah ke Mode Siang Luxury' : 'Ubah ke Mode Neon Cyberpunk'}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {isNightMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-cyan-400" />}
          </button>

          {/* Auto Rotation Toggle */}
          <button
            onClick={() => setIsAutoRotate((prev) => !prev)}
            title={isAutoRotate ? 'Hentikan Putar Otomatis' : 'Aktifkan Rotasi Otomatis 360°'}
            className={`p-2 rounded-xl transition-all ${
              isAutoRotate
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <RotateCcw size={18} className={isAutoRotate ? 'animate-spin' : ''} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title="Layar Penuh"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {/* Help Popover Toggle */}
          <button
            onClick={() => setShowHelpModal(true)}
            title="Panduan Navigasi 3D"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <HelpCircle size={18} />
          </button>

          {/* Modal Close Button */}
          {isModal && onClose && (
            <button
              onClick={onClose}
              title="Tutup Ruang Kantor 3D"
              className="p-2 ml-1 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-all"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* FLOATING HOTSPOT TARGET INSPECTOR CARD */}
      {/* ------------------------------------------------------------- */}
      {activeHotspotData && (
        <div className="absolute top-24 left-4 max-w-sm pointer-events-auto animate-in fade-in slide-in-from-left duration-200">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 p-4 rounded-2xl shadow-2xl">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={`px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider rounded-md border ${activeHotspotData.badgeBg}`}>
                {activeHotspotData.tag}
              </span>
              <button
                onClick={() => {
                  setHoveredHotspot(null);
                  setSelectedHotspot(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex items-center gap-2.5 mb-1.5">
              <div
                className="p-2 rounded-xl bg-white/5 border border-white/10"
                style={{ color: activeHotspotData.color }}
              >
                <activeHotspotData.icon size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {activeHotspotData.title}
                </h3>
                <p className="text-xs text-slate-400">{activeHotspotData.subtitle}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {activeHotspotData.description}
            </p>

            <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Status Live:</span>
              <span className="text-cyan-300 font-mono">{activeHotspotData.kpi}</span>
            </div>

            <button
              onClick={() => triggerHotspotAction(activeHotspotData.id)}
              className="mt-3 w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide text-black flex items-center justify-center gap-1.5 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: activeHotspotData.color,
                boxShadow: `0 8px 24px -6px ${activeHotspotData.color}66`,
              }}
            >
              <span>{activeHotspotData.actionText}</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM CONTROLS & CAMERA ANGLE PRESETS */}
      {/* ------------------------------------------------------------- */}
      <footer className="absolute bottom-4 left-4 right-4 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-auto">
        {/* Quick Hint Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl border border-white/10 px-3.5 py-2 rounded-2xl text-[11px] text-slate-400">
          <Eye size={14} className="text-cyan-400" />
          <span>Klik & Geser mouse untuk rotasi 360° • Scroll roda untuk zoom • Klik objek untuk akses</span>
        </div>

        {/* Camera Preset Quick Bar */}
        <div className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-slate-900/85 backdrop-blur-2xl border border-white/10 p-1.5 rounded-2xl shadow-2xl overflow-x-auto scrollbar-none">
          {CAMERA_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyCameraPreset(preset.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* HELP GUIDE MODAL */}
      {/* ------------------------------------------------------------- */}
      {showHelpModal && (
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="bg-slate-900 border border-white/15 p-6 rounded-3xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Compass size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">Panduan Navigasi 3D</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 mb-6">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                <span className="text-lg">🖱️</span>
                <div>
                  <strong className="text-white block mb-0.5">Rotasi Sudut Pandang</strong>
                  Klik dan geser mouse (atau seret 1 jari di HP) untuk memutar ruangan 360 derajat.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                <span className="text-lg">🔍</span>
                <div>
                  <strong className="text-white block mb-0.5">Zoom In & Out</strong>
                  Gunakan scroll roda mouse (atau cubit 2 jari di layar sentuh) untuk mendekat/menjauh.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                <span className="text-lg">🎯</span>
                <div>
                  <strong className="text-white block mb-0.5">Interaksi Hotspot</strong>
                  Arahkan kursor atau sentuh 5 objek interaktif untuk melihat ringkasan KPI dan langsung membuka halaman terkait.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                <span className="text-lg">🎵</span>
                <div>
                  <strong className="text-white block mb-0.5">Audio Ambience Relaxing</strong>
                  Aktifkan audio synth untuk merasakan atmosfer kantor eksekutif mewah cyberpunk.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-lg shadow-cyan-500/20"
            >
              Mengerti & Lanjutkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
