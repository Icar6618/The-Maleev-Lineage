import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MedievalTree3DProps {
  canvasW: number;
  canvasH: number;
}

export const MedievalTree3D: React.FC<MedievalTree3DProps> = ({ canvasW, canvasH }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    // Soft subtle atmospheric depth
    scene.fog = new THREE.FogExp2(0x0c0906, 0.0009);

    // Perfectly framed camera so entire crown, trunk, roots, and earthen mound
    // sit comfortably within the view without any clipping or rectangular borders
    const camera = new THREE.PerspectiveCamera(45, canvasW / canvasH, 0.1, 3500);
    camera.position.set(0, 165, 1050);
    camera.lookAt(0, 165, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(canvasW, canvasH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 100% transparent background outside meshes
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Lighting — Castle Sanctuary Warm Torchlight + Sunlight
    const ambientLight = new THREE.AmbientLight(0x4a3319, 2.5);
    scene.add(ambientLight);

    // Sunbeam shining down onto crown
    const sunLight = new THREE.DirectionalLight(0xffecd1, 2.8);
    sunLight.position.set(200, 700, 350);
    scene.add(sunLight);

    // Warm castle torchlights
    const torchLeft = new THREE.PointLight(0xff7700, 4.0, 800);
    torchLeft.position.set(-240, 90, 160);
    scene.add(torchLeft);

    const torchRight = new THREE.PointLight(0xd97706, 4.0, 800);
    torchRight.position.set(240, 90, 160);
    scene.add(torchRight);

    // Ground level rim light for roots
    const groundLight = new THREE.PointLight(0xb45309, 2.4, 600);
    groundLight.position.set(0, -30, 200);
    scene.add(groundLight);

    // 3. Materials
    const barkMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d2010,
      roughness: 0.88,
      metalness: 0.12,
    });

    const rootMaterial = new THREE.MeshStandardMaterial({
      color: 0x331a0b,
      roughness: 0.92,
      metalness: 0.1,
    });

    const earthMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a110a,
      roughness: 0.98,
      metalness: 0.05,
      flatShading: true,
    });

    const mossMaterial = new THREE.MeshStandardMaterial({
      color: 0x143820,
      roughness: 0.92,
      metalness: 0.05,
      flatShading: true,
    });

    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b221a,
      roughness: 0.95,
      metalness: 0.15,
      flatShading: true,
    });

    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x143e2b,
      roughness: 0.82,
      metalness: 0.08,
      flatShading: true,
    });

    const crownLeavesMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f5439,
      roughness: 0.78,
      metalness: 0.12,
      flatShading: true,
    });

    const goldFoliageMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.45,
      metalness: 0.65,
      flatShading: true,
    });

    const acornMaterial = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.35,
      metalness: 0.5,
    });

    // 4. Procedural Continuous 3D Medieval Royal Oak
    const treeGroup = new THREE.Group();
    treeGroup.position.set(0, -60, -30);

    // =========================================================
    // A. EXPANSIVE 3D EARTHEN TERRAIN & MOUND (ЗЕМЛЯ)
    // Tapered natural hillock that smoothly curves down to ground level
    // =========================================================
    const moundRadius = 420;
    const earthGeo = new THREE.CylinderGeometry(moundRadius * 0.75, moundRadius, 28, 48);
    const ePos = earthGeo.attributes.position;
    for (let i = 0; i < ePos.count; i++) {
      const vx = ePos.getX(i);
      const vy = ePos.getY(i);
      const vz = ePos.getZ(i);
      const r = Math.hypot(vx, vz);
      const normR = Math.min(1, r / moundRadius);
      const dome = Math.cos(normR * Math.PI * 0.5) * 20;
      const bump = Math.sin(vx * 0.03) * Math.cos(vz * 0.03) * 8;
      ePos.setY(i, vy + dome + bump);
    }
    earthGeo.computeVertexNormals();

    const earthMound = new THREE.Mesh(earthGeo, earthMaterial);
    earthMound.position.y = -25;
    treeGroup.add(earthMound);

    // Mossy Upper Layer Mound
    const mossRadius = 350;
    const mossGeo = new THREE.CylinderGeometry(mossRadius * 0.7, mossRadius, 18, 40);
    const mPos = mossGeo.attributes.position;
    for (let i = 0; i < mPos.count; i++) {
      const vx = mPos.getX(i);
      const vy = mPos.getY(i);
      const vz = mPos.getZ(i);
      const r = Math.hypot(vx, vz);
      const normR = Math.min(1, r / mossRadius);
      const dome = Math.cos(normR * Math.PI * 0.5) * 15;
      const bump = Math.sin(vx * 0.04) * Math.cos(vz * 0.04) * 6;
      mPos.setY(i, vy + dome + bump);
    }
    mossGeo.computeVertexNormals();

    const mossMound = new THREE.Mesh(mossGeo, mossMaterial);
    mossMound.position.y = -8;
    treeGroup.add(mossMound);

    // Ancient Stone Dais Sanctuary in center of mound
    const daisGeo = new THREE.CylinderGeometry(180, 200, 14, 32);
    const daisMat = new THREE.MeshStandardMaterial({ color: 0x1f160f, roughness: 0.92 });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.y = 2;
    treeGroup.add(dais);

    // Gold Inlaid Runes Ring on Dais
    const daisRingGeo = new THREE.TorusGeometry(160, 2.5, 10, 48);
    const goldRingMat = new THREE.MeshStandardMaterial({ color: 0xc69214, roughness: 0.35, metalness: 0.8 });
    const daisRing = new THREE.Mesh(daisRingGeo, goldRingMat);
    daisRing.rotation.x = Math.PI / 2;
    daisRing.position.y = 10;
    treeGroup.add(daisRing);

    // Natural Castle Boulders & Stones around tree base
    const rockLocations = [
      { x: -150, y: -2, z: 95, r: 20, rx: 0.3, ry: 0.5 },
      { x: 160, y: -2, z: 85, r: 24, rx: -0.2, ry: 0.8 },
      { x: -180, y: -8, z: -60, r: 26, rx: 0.4, ry: -0.3 },
      { x: 190, y: -10, z: -45, r: 28, rx: -0.3, ry: 0.6 },
      { x: -75, y: 2, z: 130, r: 16, rx: 0.1, ry: 0.2 },
      { x: 85, y: 3, z: 125, r: 17, rx: -0.4, ry: 0.4 },
      { x: 0, y: -2, z: 155, r: 18, rx: 0.5, ry: 0.1 },
    ];
    rockLocations.forEach(rk => {
      const rockGeo = new THREE.DodecahedronGeometry(rk.r, 1);
      const rPos = rockGeo.attributes.position;
      for (let i = 0; i < rPos.count; i++) {
        const vx = rPos.getX(i);
        const vy = rPos.getY(i);
        const vz = rPos.getZ(i);
        rPos.setXYZ(i, vx * (1 + Math.sin(vx) * 0.15), vy * 0.75, vz * (1 + Math.cos(vz) * 0.15));
      }
      rockGeo.computeVertexNormals();
      const rock = new THREE.Mesh(rockGeo, rockMaterial);
      rock.position.set(rk.x, rk.y, rk.z);
      rock.rotation.set(rk.rx, rk.ry, 0);
      treeGroup.add(rock);
    });

    // Helper to generate seamless continuous branch/root tube
    const createTube = (points: THREE.Vector3[], rStart: number, mat: THREE.Material = barkMaterial) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const segments = 24;
      const radialSegments = 10;
      const geom = new THREE.TubeGeometry(curve, segments, rStart, radialSegments, false);
      geom.computeVertexNormals();
      return new THREE.Mesh(geom, mat);
    };

    // Helper to add seamless joint sphere
    const addJointSphere = (pos: THREE.Vector3, radius: number, mat: THREE.Material = barkMaterial) => {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 12), mat);
      sphere.position.copy(pos);
      treeGroup.add(sphere);
    };

    // =========================================================
    // B. MIGHTY SNAKING OAK ROOTS (КОРІННЯ ДУБА)
    // Massive serpentine roots snaking over the earth & rocks
    // =========================================================
    // 1. Far Left Primary Root System (Towards Paternal Grandparents)
    const leftRootMajor = [
      new THREE.Vector3(0, 40, 0),
      new THREE.Vector3(-45, 20, 20),
      new THREE.Vector3(-105, 8, 40),
      new THREE.Vector3(-175, -4, 60),
      new THREE.Vector3(-250, -14, 70),
      new THREE.Vector3(-330, -22, 80),
    ];
    treeGroup.add(createTube(leftRootMajor, 20, rootMaterial));
    addJointSphere(new THREE.Vector3(-105, 8, 40), 18, rootMaterial);
    addJointSphere(new THREE.Vector3(-175, -4, 60), 15, rootMaterial);

    // Left Secondary Sub-Root (Reaching out backward-left)
    const leftRootBack = [
      new THREE.Vector3(-105, 8, 40),
      new THREE.Vector3(-155, 2, -15),
      new THREE.Vector3(-225, -8, -45),
      new THREE.Vector3(-285, -18, -75),
    ];
    treeGroup.add(createTube(leftRootBack, 14, rootMaterial));

    // Left Front Tendril Root
    const leftRootFront = [
      new THREE.Vector3(-175, -4, 60),
      new THREE.Vector3(-215, -10, 110),
      new THREE.Vector3(-265, -20, 140),
    ];
    treeGroup.add(createTube(leftRootFront, 11, rootMaterial));

    // 2. Far Right Primary Root System (Towards Maternal Grandparents)
    const rightRootMajor = [
      new THREE.Vector3(0, 40, 0),
      new THREE.Vector3(45, 20, -20),
      new THREE.Vector3(105, 8, -40),
      new THREE.Vector3(175, -4, -60),
      new THREE.Vector3(250, -14, -70),
      new THREE.Vector3(330, -22, -80),
    ];
    treeGroup.add(createTube(rightRootMajor, 20, rootMaterial));
    addJointSphere(new THREE.Vector3(105, 8, -40), 18, rootMaterial);
    addJointSphere(new THREE.Vector3(175, -4, -60), 15, rootMaterial);

    // Right Secondary Sub-Root (Reaching forward-right)
    const rightRootFront = [
      new THREE.Vector3(105, 8, -40),
      new THREE.Vector3(155, 2, 25),
      new THREE.Vector3(225, -8, 55),
      new THREE.Vector3(285, -18, 85),
    ];
    treeGroup.add(createTube(rightRootFront, 14, rootMaterial));

    // Right Back Tendril Root
    const rightRootBack = [
      new THREE.Vector3(175, -4, -60),
      new THREE.Vector3(215, -10, -110),
      new THREE.Vector3(265, -20, -140),
    ];
    treeGroup.add(createTube(rightRootBack, 11, rootMaterial));

    // 3. Central Front Taproot (Snaking forward into sanctuary foreground)
    const centerFrontRoot = [
      new THREE.Vector3(0, 45, 10),
      new THREE.Vector3(10, 25, 55),
      new THREE.Vector3(-15, 10, 105),
      new THREE.Vector3(20, -2, 155),
      new THREE.Vector3(-10, -16, 200),
    ];
    treeGroup.add(createTube(centerFrontRoot, 16, rootMaterial));
    addJointSphere(new THREE.Vector3(10, 25, 55), 16, rootMaterial);

    // 4. Central Back Anchor Root (Deep anchor)
    const centerBackRoot = [
      new THREE.Vector3(0, 45, -10),
      new THREE.Vector3(-15, 20, -60),
      new THREE.Vector3(15, 4, -115),
      new THREE.Vector3(0, -14, -170),
    ];
    treeGroup.add(createTube(centerBackRoot, 17, rootMaterial));

    // Radial Buttress Root Collars around trunk base
    const rootAngles = [0.4, 1.2, 2.0, 2.8, 3.6, 4.4, 5.2, 6.0];
    rootAngles.forEach(ang => {
      const rootMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(11, 24, 100, 8),
        rootMaterial
      );
      rootMesh.position.set(Math.cos(ang) * 46, 28, Math.sin(ang) * 46);
      rootMesh.rotation.z = Math.cos(ang) * 0.58;
      rootMesh.rotation.x = Math.sin(ang) * 0.58;
      treeGroup.add(rootMesh);
    });

    // =========================================================
    // C. CONTINUOUS CENTRAL TRUNK (Roots to Fork at Y=230)
    // =========================================================
    const trunkMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(28, 58, 230, 16),
      barkMaterial
    );
    trunkMesh.position.set(0, 125, 0);
    treeGroup.add(trunkMesh);
    addJointSphere(new THREE.Vector3(0, 240, 0), 29);

    // D. Left Father-Line Continuous Bough
    const leftBranchPoints = [
      new THREE.Vector3(0, 240, 0),
      new THREE.Vector3(-60, 255, 15),
      new THREE.Vector3(-140, 270, 25),
      new THREE.Vector3(-220, 295, 15),
      new THREE.Vector3(-270, 320, 5),
    ];
    treeGroup.add(createTube(leftBranchPoints, 16, barkMaterial));
    addJointSphere(new THREE.Vector3(-140, 270, 25), 15);
    addJointSphere(new THREE.Vector3(-220, 295, 15), 11);

    const leftForkPoints = [
      new THREE.Vector3(-140, 270, 25),
      new THREE.Vector3(-180, 305, 40),
      new THREE.Vector3(-230, 335, 35),
    ];
    treeGroup.add(createTube(leftForkPoints, 11, barkMaterial));

    // E. Right Mother-Line Continuous Bough
    const rightBranchPoints = [
      new THREE.Vector3(0, 240, 0),
      new THREE.Vector3(60, 255, -15),
      new THREE.Vector3(140, 270, -25),
      new THREE.Vector3(220, 295, -15),
      new THREE.Vector3(270, 320, -5),
    ];
    treeGroup.add(createTube(rightBranchPoints, 16, barkMaterial));
    addJointSphere(new THREE.Vector3(140, 270, -25), 15);
    addJointSphere(new THREE.Vector3(220, 295, -15), 11);

    const rightForkPoints = [
      new THREE.Vector3(140, 270, -25),
      new THREE.Vector3(180, 305, -40),
      new THREE.Vector3(230, 335, -35),
    ];
    treeGroup.add(createTube(rightForkPoints, 11, barkMaterial));

    // F. Continuous Crown Boughs (Leading to Zenith)
    const crownLeftPoints = [
      new THREE.Vector3(0, 240, 0),
      new THREE.Vector3(-35, 280, 10),
      new THREE.Vector3(-65, 330, 20),
      new THREE.Vector3(-90, 380, 15),
    ];
    treeGroup.add(createTube(crownLeftPoints, 18, barkMaterial));
    addJointSphere(new THREE.Vector3(-35, 280, 10), 16);
    addJointSphere(new THREE.Vector3(-65, 330, 20), 12);

    const crownRightPoints = [
      new THREE.Vector3(0, 240, 0),
      new THREE.Vector3(35, 280, -10),
      new THREE.Vector3(65, 330, -20),
      new THREE.Vector3(90, 380, -15),
    ];
    treeGroup.add(createTube(crownRightPoints, 18, barkMaterial));
    addJointSphere(new THREE.Vector3(35, 280, -10), 16);
    addJointSphere(new THREE.Vector3(65, 330, -20), 12);

    const crownCenterPoints = [
      new THREE.Vector3(0, 240, 0),
      new THREE.Vector3(0, 290, 0),
      new THREE.Vector3(0, 350, 0),
      new THREE.Vector3(0, 410, 0),
    ];
    treeGroup.add(createTube(crownCenterPoints, 17, barkMaterial));
    addJointSphere(new THREE.Vector3(0, 290, 0), 16);
    addJointSphere(new THREE.Vector3(0, 350, 0), 13);

    // G. Royal Foliage Canopies
    const foliageClusters = [
      // Crown Apex
      { x: 0, y: 420, z: 0, r: 70, mat: crownLeavesMaterial },
      { x: -70, y: 390, z: 25, r: 58, mat: crownLeavesMaterial },
      { x: 70, y: 390, z: -25, r: 58, mat: crownLeavesMaterial },
      { x: 0, y: 455, z: 10, r: 46, mat: goldFoliageMaterial },

      // Left Canopy
      { x: -150, y: 295, z: 40, r: 62, mat: foliageMaterial },
      { x: -230, y: 320, z: 30, r: 54, mat: foliageMaterial },
      { x: -285, y: 345, z: 10, r: 48, mat: crownLeavesMaterial },
      { x: -190, y: 355, z: 50, r: 40, mat: goldFoliageMaterial },

      // Right Canopy
      { x: 150, y: 295, z: -40, r: 62, mat: foliageMaterial },
      { x: 230, y: 320, z: -30, r: 54, mat: foliageMaterial },
      { x: 285, y: 345, z: -10, r: 48, mat: crownLeavesMaterial },
      { x: 190, y: 355, z: -50, r: 40, mat: goldFoliageMaterial },
    ];

    foliageClusters.forEach(f => {
      const geo = new THREE.DodecahedronGeometry(f.r, 1);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const vz = pos.getZ(i);
        const noise = 1 + Math.sin(vx * 0.12) * Math.cos(vy * 0.12) * 0.14;
        pos.setXYZ(i, vx * noise, vy * noise, vz * noise);
      }
      geo.computeVertexNormals();

      const mesh = new THREE.Mesh(geo, f.mat);
      mesh.position.set(f.x, f.y, f.z);
      treeGroup.add(mesh);
    });

    // H. Golden Acorns Hanging Beneath Boughs
    const acornPositions = [
      { x: -90, y: 255, z: 35 },
      { x: 90, y: 255, z: -35 },
      { x: -45, y: 345, z: 25 },
      { x: 45, y: 345, z: -25 },
      { x: -180, y: 285, z: 25 },
      { x: 180, y: 285, z: -25 },
    ];

    acornPositions.forEach(p => {
      const acornGroup = new THREE.Group();
      const capMesh = new THREE.Mesh(new THREE.SphereGeometry(4.5, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), barkMaterial);
      acornGroup.add(capMesh);
      const nutMesh = new THREE.Mesh(new THREE.ConeGeometry(4, 9, 8), acornMaterial);
      nutMesh.rotation.x = Math.PI;
      nutMesh.position.y = -4.5;
      acornGroup.add(nutMesh);

      acornGroup.position.set(p.x, p.y, p.z);
      treeGroup.add(acornGroup);
    });

    scene.add(treeGroup);

    // 5. Floating Golden Embers / Medieval Castle Dust
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 660;
      particlePositions[i + 1] = Math.random() * 480;
      particlePositions[i + 2] = (Math.random() - 0.5) * 440;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 3.2,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Gentle continuous organic sway
      treeGroup.rotation.y = Math.sin(elapsed * 0.18) * 0.03;

      // Torch flickering
      torchLeft.intensity = 3.8 + Math.sin(elapsed * 11) * 0.4 + Math.cos(elapsed * 7) * 0.3;
      torchRight.intensity = 3.8 + Math.cos(elapsed * 9) * 0.4 + Math.sin(elapsed * 6) * 0.3;
      groundLight.intensity = 2.2 + Math.sin(elapsed * 8) * 0.3;

      // Particle upward drift
      const pPositions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        pPositions[i] += 0.22;
        if (pPositions[i] > 490) {
          pPositions[i] = 0;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [canvasW, canvasH]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: canvasW, height: canvasH }}
    />
  );
};
