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
    scene.fog = new THREE.FogExp2(0x0c0906, 0.0016);

    const camera = new THREE.PerspectiveCamera(45, canvasW / canvasH, 0.1, 2000);
    camera.position.set(0, 110, 560);
    camera.lookAt(0, 150, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(canvasW, canvasH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Lighting — Castle Sanctuary Warm Torchlight + Sunlight
    const ambientLight = new THREE.AmbientLight(0x4a3319, 2.2);
    scene.add(ambientLight);

    // Sunbeam shining down onto crown
    const sunLight = new THREE.DirectionalLight(0xffecd1, 2.8);
    sunLight.position.set(180, 480, 240);
    scene.add(sunLight);

    // Warm castle torchlights
    const torchLeft = new THREE.PointLight(0xff7700, 3.5, 450);
    torchLeft.position.set(-200, 80, 120);
    scene.add(torchLeft);

    const torchRight = new THREE.PointLight(0xd97706, 3.5, 450);
    torchRight.position.set(200, 80, 120);
    scene.add(torchRight);

    // 3. Materials
    const barkMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d2010,
      roughness: 0.88,
      metalness: 0.12,
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
    treeGroup.position.set(0, -65, -30);

    // Stone Dais / Kingdom Sanctuary Floor
    const daisGeo = new THREE.CylinderGeometry(250, 275, 18, 32);
    const daisMat = new THREE.MeshStandardMaterial({ color: 0x17100a, roughness: 0.95 });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.y = -9;
    treeGroup.add(dais);

    // Gold Inlaid Runes Ring on Dais
    const daisRingGeo = new THREE.TorusGeometry(210, 2.5, 10, 48);
    const goldRingMat = new THREE.MeshStandardMaterial({ color: 0xc69214, roughness: 0.35, metalness: 0.8 });
    const daisRing = new THREE.Mesh(daisRingGeo, goldRingMat);
    daisRing.rotation.x = Math.PI / 2;
    daisRing.position.y = 1;
    treeGroup.add(daisRing);

    // Helper to generate seamless continuous branch tube
    const createBranchTube = (points: THREE.Vector3[], rStart: number, _rEnd: number) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const segments = 24;
      const radialSegments = 10;
      const geom = new THREE.TubeGeometry(curve, segments, rStart, radialSegments, false);
      geom.computeVertexNormals();
      return new THREE.Mesh(geom, barkMaterial);
    };

    // Helper to add seamless joint sphere
    const addJointSphere = (pos: THREE.Vector3, radius: number) => {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 12), barkMaterial);
      sphere.position.copy(pos);
      treeGroup.add(sphere);
    };

    // A. Main Continuous Central Trunk (Roots to Fork at Y=230)
    const trunkMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(28, 56, 230, 16),
      barkMaterial
    );
    trunkMesh.position.set(0, 115, 0);
    treeGroup.add(trunkMesh);
    addJointSphere(new THREE.Vector3(0, 230, 0), 29);

    // B. Buttress Roots (Spreading solidly into stone dais)
    const rootAngles = [0, 0.75, 1.5, 2.25, 3.0, 3.8, 4.6, 5.4];
    rootAngles.forEach(ang => {
      const rootMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(10, 22, 95, 8),
        barkMaterial
      );
      rootMesh.position.set(Math.cos(ang) * 44, 20, Math.sin(ang) * 44);
      rootMesh.rotation.z = Math.cos(ang) * 0.58;
      rootMesh.rotation.x = Math.sin(ang) * 0.58;
      treeGroup.add(rootMesh);
    });

    // C. Left Father-Line Continuous Bough (Starting seamlessly from trunk fork at 0, 230, 0)
    const leftBranchPoints = [
      new THREE.Vector3(0, 230, 0),
      new THREE.Vector3(-60, 245, 15),
      new THREE.Vector3(-140, 260, 25),
      new THREE.Vector3(-220, 285, 15),
      new THREE.Vector3(-270, 310, 5),
    ];
    treeGroup.add(createBranchTube(leftBranchPoints, 16, 8));
    addJointSphere(new THREE.Vector3(-140, 260, 25), 15);
    addJointSphere(new THREE.Vector3(-220, 285, 15), 11);

    // Left Secondary Fork
    const leftForkPoints = [
      new THREE.Vector3(-140, 260, 25),
      new THREE.Vector3(-180, 295, 40),
      new THREE.Vector3(-230, 325, 35),
    ];
    treeGroup.add(createBranchTube(leftForkPoints, 11, 6));

    // D. Right Mother-Line Continuous Bough (Starting seamlessly from trunk fork at 0, 230, 0)
    const rightBranchPoints = [
      new THREE.Vector3(0, 230, 0),
      new THREE.Vector3(60, 245, -15),
      new THREE.Vector3(140, 260, -25),
      new THREE.Vector3(220, 285, -15),
      new THREE.Vector3(270, 310, -5),
    ];
    treeGroup.add(createBranchTube(rightBranchPoints, 16, 8));
    addJointSphere(new THREE.Vector3(140, 260, -25), 15);
    addJointSphere(new THREE.Vector3(220, 285, -15), 11);

    // Right Secondary Fork
    const rightForkPoints = [
      new THREE.Vector3(140, 260, -25),
      new THREE.Vector3(180, 295, -40),
      new THREE.Vector3(230, 325, -35),
    ];
    treeGroup.add(createBranchTube(rightForkPoints, 11, 6));

    // E. Continuous Crown Boughs (Leading to Zenith — NO HOLES / NO BREAKS!)
    // Center-left crown stem
    const crownLeftPoints = [
      new THREE.Vector3(0, 230, 0),
      new THREE.Vector3(-35, 270, 10),
      new THREE.Vector3(-65, 320, 20),
      new THREE.Vector3(-90, 370, 15),
    ];
    treeGroup.add(createBranchTube(crownLeftPoints, 18, 9));
    addJointSphere(new THREE.Vector3(-35, 270, 10), 16);
    addJointSphere(new THREE.Vector3(-65, 320, 20), 12);

    // Center-right crown stem
    const crownRightPoints = [
      new THREE.Vector3(0, 230, 0),
      new THREE.Vector3(35, 270, -10),
      new THREE.Vector3(65, 320, -20),
      new THREE.Vector3(90, 370, -15),
    ];
    treeGroup.add(createBranchTube(crownRightPoints, 18, 9));
    addJointSphere(new THREE.Vector3(35, 270, -10), 16);
    addJointSphere(new THREE.Vector3(65, 320, -20), 12);

    // Central Zenith Spire (Connecting solidly through center without gaps)
    const crownCenterPoints = [
      new THREE.Vector3(0, 230, 0),
      new THREE.Vector3(0, 280, 0),
      new THREE.Vector3(0, 340, 0),
      new THREE.Vector3(0, 400, 0),
    ];
    treeGroup.add(createBranchTube(crownCenterPoints, 17, 8));
    addJointSphere(new THREE.Vector3(0, 280, 0), 16);
    addJointSphere(new THREE.Vector3(0, 340, 0), 13);

    // F. Royal Foliage Canopies (Rich Dodecahedron Clusters)
    const foliageClusters = [
      // Crown Apex
      { x: 0, y: 410, z: 0, r: 68, mat: crownLeavesMaterial },
      { x: -70, y: 380, z: 25, r: 56, mat: crownLeavesMaterial },
      { x: 70, y: 380, z: -25, r: 56, mat: crownLeavesMaterial },
      { x: 0, y: 445, z: 10, r: 45, mat: goldFoliageMaterial }, // Golden Crown Spire

      // Left Canopy
      { x: -150, y: 285, z: 40, r: 60, mat: foliageMaterial },
      { x: -230, y: 310, z: 30, r: 52, mat: foliageMaterial },
      { x: -285, y: 335, z: 10, r: 46, mat: crownLeavesMaterial },
      { x: -190, y: 345, z: 50, r: 38, mat: goldFoliageMaterial },

      // Right Canopy
      { x: 150, y: 285, z: -40, r: 60, mat: foliageMaterial },
      { x: 230, y: 310, z: -30, r: 52, mat: foliageMaterial },
      { x: 285, y: 335, z: -10, r: 46, mat: crownLeavesMaterial },
      { x: 190, y: 345, z: -50, r: 38, mat: goldFoliageMaterial },
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

    // G. Golden Acorns Hanging Beneath Boughs
    const acornPositions = [
      { x: -90, y: 245, z: 35 },
      { x: 90, y: 245, z: -35 },
      { x: -45, y: 335, z: 25 },
      { x: 45, y: 335, z: -25 },
      { x: -180, y: 275, z: 25 },
      { x: 180, y: 275, z: -25 },
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
      particlePositions[i] = (Math.random() - 0.5) * 620;
      particlePositions[i + 1] = Math.random() * 460;
      particlePositions[i + 2] = (Math.random() - 0.5) * 400;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 2.4,
      transparent: true,
      opacity: 0.6,
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
      treeGroup.rotation.y = Math.sin(elapsed * 0.2) * 0.035;

      // Torch flickering
      torchLeft.intensity = 3.0 + Math.sin(elapsed * 11) * 0.4 + Math.cos(elapsed * 7) * 0.3;
      torchRight.intensity = 3.0 + Math.cos(elapsed * 9) * 0.4 + Math.sin(elapsed * 6) * 0.3;

      // Particle upward drift
      const pPositions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        pPositions[i] += 0.22;
        if (pPositions[i] > 480) {
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
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ width: canvasW, height: canvasH }}
    />
  );
};
