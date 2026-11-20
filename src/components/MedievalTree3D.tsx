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
    scene.fog = new THREE.FogExp2(0x0c0906, 0.0018);

    const camera = new THREE.PerspectiveCamera(45, canvasW / canvasH, 0.1, 2000);
    camera.position.set(0, 80, 520);
    camera.lookAt(0, 140, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(canvasW, canvasH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Lighting (Medieval Torchlight + Royal Sunbeam)
    const ambientLight = new THREE.AmbientLight(0x38281a, 1.8);
    scene.add(ambientLight);

    // Celestial golden sunbeam from above-right
    const sunLight = new THREE.DirectionalLight(0xffdf99, 2.5);
    sunLight.position.set(200, 450, 250);
    scene.add(sunLight);

    // Flickering torchlight left (warm amber)
    const torchLeft = new THREE.PointLight(0xff8c00, 3, 400);
    torchLeft.position.set(-180, 60, 100);
    scene.add(torchLeft);

    // Flickering torchlight right (warm crimson)
    const torchRight = new THREE.PointLight(0xd97706, 3, 400);
    torchRight.position.set(180, 60, 100);
    scene.add(torchRight);

    // 3. Materials
    // Ancient Weathered Oak Bark
    const barkMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d2010,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });

    // Royal Foliage Material (Emerald & Deep Olive)
    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x1b4332,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    });

    // Sunlit Crown Leaves Material
    const crownLeavesMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f,
      roughness: 0.75,
      metalness: 0.15,
      flatShading: true,
    });

    // Royal Gold Leaf Highlight Material
    const goldLeafMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.35,
      metalness: 0.8,
    });

    // Acorn Material
    const acornMaterial = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.4,
      metalness: 0.6,
    });

    // 4. Procedural 3D Medieval Oak Tree
    const treeGroup = new THREE.Group();
    treeGroup.position.set(0, -60, -40);

    // Stone Dais / Kingdom Sanctuary Base
    const daisGeo = new THREE.CylinderGeometry(240, 260, 16, 24);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x1a140f,
      roughness: 0.95,
      metalness: 0.1,
    });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.y = -8;
    treeGroup.add(dais);

    // Inner Royal Ring on Dais
    const daisRingGeo = new THREE.TorusGeometry(200, 2, 8, 36);
    const goldRingMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.4, metalness: 0.7 });
    const daisRing = new THREE.Mesh(daisRingGeo, goldRingMat);
    daisRing.rotation.x = Math.PI / 2;
    daisRing.position.y = 1;
    treeGroup.add(daisRing);

    // Massive Trunk (Gnarled oak segmented pillar)
    const trunkSegments = [
      { rTop: 36, rBot: 68, h: 60, y: 30, rx: 0.04, rz: -0.03 },
      { rTop: 28, rBot: 36, h: 70, y: 95, rx: -0.06, rz: 0.05 },
      { rTop: 22, rBot: 28, h: 70, y: 165, rx: 0.05, rz: -0.04 },
      { rTop: 16, rBot: 22, h: 70, y: 235, rx: -0.03, rz: 0.02 },
    ];

    trunkSegments.forEach(seg => {
      const geo = new THREE.CylinderGeometry(seg.rTop, seg.rBot, seg.h, 12);
      const mesh = new THREE.Mesh(geo, barkMaterial);
      mesh.position.y = seg.y;
      mesh.rotation.x = seg.rx;
      mesh.rotation.z = seg.rz;
      treeGroup.add(mesh);
    });

    // Spreading Buttress Roots (Корені-контрфорси)
    const rootAngles = [0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6];
    rootAngles.forEach(ang => {
      const rootGeo = new THREE.CylinderGeometry(8, 18, 90, 8);
      const rootMesh = new THREE.Mesh(rootGeo, barkMaterial);
      rootMesh.position.set(Math.cos(ang) * 45, 15, Math.sin(ang) * 45);
      rootMesh.rotation.z = Math.cos(ang) * 0.6;
      rootMesh.rotation.x = Math.sin(ang) * 0.6;
      treeGroup.add(rootMesh);
    });

    // Main Gnarled Medieval Boughs (Гілляки Королівського Дуба)
    const boughs = [
      // Left Father Branch (Heavy muscular bough)
      { x: -75, y: 190, z: 15, rTop: 11, rBot: 16, len: 130, rotZ: 1.15, rotY: 0.2 },
      { x: -160, y: 235, z: 30, rTop: 7, rBot: 11, len: 90, rotZ: 0.85, rotY: -0.2 },
      { x: -210, y: 285, z: 20, rTop: 4, rBot: 7, len: 75, rotZ: 0.5, rotY: 0.3 },

      // Right Mother Branch (Heavy muscular bough)
      { x: 75, y: 190, z: -15, rTop: 11, rBot: 16, len: 130, rotZ: -1.15, rotY: -0.2 },
      { x: 160, y: 235, z: -30, rTop: 7, rBot: 11, len: 90, rotZ: -0.85, rotY: 0.2 },
      { x: 210, y: 285, z: -20, rTop: 4, rBot: 7, len: 75, rotZ: -0.5, rotY: -0.3 },

      // Center Crown Fork (Zenith Spire)
      { x: -35, y: 275, z: 10, rTop: 8, rBot: 12, len: 100, rotZ: 0.45, rotY: 0.3 },
      { x: 35, y: 275, z: -10, rTop: 8, rBot: 12, len: 100, rotZ: -0.45, rotY: -0.3 },
      { x: 0, y: 330, z: 0, rTop: 6, rBot: 10, len: 95, rotZ: 0.05, rotY: 0.1 },
    ];

    boughs.forEach(b => {
      const geo = new THREE.CylinderGeometry(b.rTop, b.rBot, b.len, 8);
      const mesh = new THREE.Mesh(geo, barkMaterial);
      mesh.position.set(b.x, b.y, b.z);
      mesh.rotation.z = b.rotZ;
      mesh.rotation.y = b.rotY;
      treeGroup.add(mesh);
    });

    // 3D Foliage Clusters (Хмари листя королівського дуба)
    const foliageClusters = [
      // Crown Apex
      { x: 0, y: 390, z: 0, r: 65, mat: crownLeavesMaterial },
      { x: -55, y: 360, z: 25, r: 52, mat: crownLeavesMaterial },
      { x: 55, y: 360, z: -25, r: 52, mat: crownLeavesMaterial },
      { x: 0, y: 430, z: 10, r: 42, mat: goldLeafMaterial }, // Golden Apex Spire

      // Left Canopy
      { x: -140, y: 270, z: 40, r: 58, mat: foliageMaterial },
      { x: -220, y: 300, z: 30, r: 50, mat: foliageMaterial },
      { x: -270, y: 320, z: 10, r: 44, mat: crownLeavesMaterial },
      { x: -180, y: 330, z: 50, r: 35, mat: goldLeafMaterial },

      // Right Canopy
      { x: 140, y: 270, z: -40, r: 58, mat: foliageMaterial },
      { x: 220, y: 300, z: -30, r: 50, mat: foliageMaterial },
      { x: 270, y: 320, z: -10, r: 44, mat: crownLeavesMaterial },
      { x: 180, y: 330, z: -50, r: 35, mat: goldLeafMaterial },
    ];

    foliageClusters.forEach(f => {
      const geo = new THREE.DodecahedronGeometry(f.r, 1);
      // Slightly deform vertices for organic look
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const vz = pos.getZ(i);
        const noise = 1 + (Math.sin(vx * 0.1) * Math.cos(vy * 0.1)) * 0.15;
        pos.setXYZ(i, vx * noise, vy * noise, vz * noise);
      }
      geo.computeVertexNormals();

      const mesh = new THREE.Mesh(geo, f.mat);
      mesh.position.set(f.x, f.y, f.z);
      treeGroup.add(mesh);
    });

    // 3D Hanging Golden Acorns (Королівські золоті жолуді)
    const acornPositions = [
      { x: -100, y: 230, z: 40 },
      { x: 100, y: 230, z: -40 },
      { x: -40, y: 320, z: 30 },
      { x: 40, y: 320, z: -30 },
      { x: -190, y: 260, z: 25 },
      { x: 190, y: 260, z: -25 },
    ];

    acornPositions.forEach(p => {
      const acornGroup = new THREE.Group();
      // Cap
      const capGeo = new THREE.SphereGeometry(4.5, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const capMesh = new THREE.Mesh(capGeo, barkMaterial);
      acornGroup.add(capMesh);
      // Nut
      const nutGeo = new THREE.ConeGeometry(4, 9, 8);
      const nutMesh = new THREE.Mesh(nutGeo, acornMaterial);
      nutMesh.rotation.x = Math.PI;
      nutMesh.position.y = -4.5;
      acornGroup.add(nutMesh);

      acornGroup.position.set(p.x, p.y, p.z);
      treeGroup.add(acornGroup);
    });

    scene.add(treeGroup);

    // 5. Floating Castle Embers / Gold Dust Particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 600;
      particlePositions[i + 1] = Math.random() * 450;
      particlePositions[i + 2] = (Math.random() - 0.5) * 400;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 2.5,
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

      // Subtle tree sway like a living sacred royal oak
      treeGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.04;
      treeGroup.rotation.z = Math.cos(elapsed * 0.2) * 0.01;

      // Torchlight flickering
      torchLeft.intensity = 2.5 + Math.sin(elapsed * 12) * 0.4 + Math.cos(elapsed * 8) * 0.3;
      torchRight.intensity = 2.5 + Math.cos(elapsed * 10) * 0.4 + Math.sin(elapsed * 7) * 0.3;

      // Particle floating drift
      const pPositions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        pPositions[i] += 0.25;
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
