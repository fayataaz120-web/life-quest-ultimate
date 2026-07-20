/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AppState } from '../types';
import { voice } from '../utils/voice';

interface Companion3DSceneProps {
  state: AppState;
  emotion: string;
  mousePos: { x: number; y: number };
  widgetCenter: { x: number; y: number };
}

export const Companion3DScene: React.FC<Companion3DSceneProps> = ({
  emotion,
  mousePos,
  widgetCenter
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // React refs to track live props without causing scene reconstruction
  const emotionRef = useRef(emotion);
  const mousePosRef = useRef(mousePos);
  const widgetCenterRef = useRef(widgetCenter);
  const speakingRef = useRef(false);

  // Sync prop changes into refs
  useEffect(() => { emotionRef.current = emotion; }, [emotion]);
  useEffect(() => { mousePosRef.current = mousePos; }, [mousePos]);
  useEffect(() => { widgetCenterRef.current = widgetCenter; }, [widgetCenter]);

  // Connect voice state updates directly to ref to bypass React rendering cycles
  useEffect(() => {
    const handleVoiceState = (isSpeaking: boolean) => {
      speakingRef.current = isSpeaking;
    };
    voice.registerListener(handleVoiceState);
    return () => {
      voice.unregisterListener();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- TRACK RESOURCES FOR CLEANUP ---
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    const trackGeometry = <T extends THREE.BufferGeometry>(geo: T): T => {
      geometriesToDispose.push(geo);
      return geo;
    };

    const trackMaterial = <T extends THREE.Material>(mat: T): T => {
      materialsToDispose.push(mat);
      return mat;
    };

    // --- INITIAL SCENE PARAMETERS ---
    let lastWidth = containerRef.current.clientWidth || 240;
    let lastHeight = containerRef.current.clientHeight || 240;

    const scene = new THREE.Scene();
    scene.background = null; 

    const camera = new THREE.PerspectiveCamera(40, lastWidth / lastHeight, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(lastWidth, lastHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // --- TOON GRADIENT FOR CEL-SHADING ---
    const format = THREE.RGBAFormat;
    const gradientMapData = new Uint8Array([75, 75, 75, 255, 160, 160, 160, 255, 255, 255, 255, 255]);
    const gradientMap = new THREE.DataTexture(gradientMapData, 3, 1, format);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.generateMipmaps = false;
    gradientMap.needsUpdate = true;

    // --- TOON MATERIALS ---
    const skinMaterial = trackMaterial(new THREE.MeshToonMaterial({
      color: 0xfff2e8,
      gradientMap: gradientMap
    }));

    const hairMaterial = trackMaterial(new THREE.MeshToonMaterial({
      color: 0x111827,
      gradientMap: gradientMap
    }));

    const hairHighlightMaterial = trackMaterial(new THREE.MeshToonMaterial({
      color: 0x10b981, 
      gradientMap: gradientMap
    }));

    const robeBlackMaterial = trackMaterial(new THREE.MeshToonMaterial({
      color: 0x1e293b,
      gradientMap: gradientMap
    }));

    const robeWhiteMaterial = trackMaterial(new THREE.MeshToonMaterial({
      color: 0xffffff,
      gradientMap: gradientMap
    }));

    const goldTrimMaterial = trackMaterial(new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.8,
      roughness: 0.2
    }));

    const gemMaterial = trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      roughness: 0.1,
      metalness: 0.9
    }));

    const magicCircleMaterial = trackMaterial(new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    }));

    const wingMaterialLeft = trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x10b981, 
      emissive: 0x047857,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    }));

    const wingMaterialRight = trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, 
      emissive: 0x581c87,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    }));

    // --- CHARACTER GROUP HIERARCHY ---
    const characterGroup = new THREE.Group();
    characterGroup.position.y = -1.2; 
    scene.add(characterGroup);

    // Torso
    const torsoGeo = trackGeometry(new THREE.CylinderGeometry(0.5, 0.7, 2.0, 16));
    const torsoMesh = new THREE.Mesh(torsoGeo, robeBlackMaterial);
    torsoMesh.position.y = 1.0;
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    characterGroup.add(torsoMesh);

    // Robe panels
    const panelGeo = trackGeometry(new THREE.BoxGeometry(0.3, 1.8, 0.1));
    const leftPanel = new THREE.Mesh(panelGeo, robeWhiteMaterial);
    leftPanel.position.set(-0.35, 1.0, 0.3);
    leftPanel.rotation.z = 0.08;
    torsoMesh.add(leftPanel);

    const rightPanel = new THREE.Mesh(panelGeo, robeWhiteMaterial);
    rightPanel.position.set(0.35, 1.0, 0.3);
    rightPanel.rotation.z = -0.08;
    torsoMesh.add(rightPanel);

    // Belt
    const beltGeo = trackGeometry(new THREE.CylinderGeometry(0.57, 0.6, 0.15, 16));
    const beltMesh = new THREE.Mesh(beltGeo, trackMaterial(new THREE.MeshToonMaterial({ color: 0x451a03 })));
    beltMesh.position.y = 0.2;
    torsoMesh.add(beltMesh);

    const buckleGeo = trackGeometry(new THREE.BoxGeometry(0.18, 0.18, 0.12));
    const buckleMesh = new THREE.Mesh(buckleGeo, goldTrimMaterial);
    buckleMesh.position.set(0, 0.2, 0.56);
    torsoMesh.add(buckleMesh);

    // Gems
    const gemGeo = trackGeometry(new THREE.OctahedronGeometry(0.08));
    const chestGem = new THREE.Mesh(gemGeo, gemMaterial);
    chestGem.position.set(0, 0.7, 0.52);
    torsoMesh.add(chestGem);

    // Pauldrons
    const pauldronGeo = trackGeometry(new THREE.SphereGeometry(0.35, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2));
    const leftPauldron = new THREE.Mesh(pauldronGeo, goldTrimMaterial);
    leftPauldron.position.set(-0.7, 0.9, 0);
    leftPauldron.rotation.z = -Math.PI / 2;
    torsoMesh.add(leftPauldron);

    const rightPauldron = new THREE.Mesh(pauldronGeo, goldTrimMaterial);
    rightPauldron.position.set(0.7, 0.9, 0);
    rightPauldron.rotation.z = Math.PI / 2;
    torsoMesh.add(rightPauldron);

    const leftPauldronGem = new THREE.Mesh(gemGeo, gemMaterial);
    leftPauldronGem.position.set(-0.85, 0.95, 0.15);
    torsoMesh.add(leftPauldronGem);

    const rightPauldronGem = new THREE.Mesh(gemGeo, gemMaterial);
    rightPauldronGem.position.set(0.85, 0.95, 0.15);
    torsoMesh.add(rightPauldronGem);

    // Cape
    const capeGeo = trackGeometry(new THREE.PlaneGeometry(1.6, 2.2, 8, 8));
    const capeMesh = new THREE.Mesh(capeGeo, trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.9,
      side: THREE.DoubleSide
    })));
    capeMesh.position.set(0, 0.8, -0.65);
    capeMesh.rotation.x = 0.05;
    characterGroup.add(capeMesh);

    const capePositions = capeGeo.attributes.position.clone();

    // Arm Sleeves & Hands for Infinity Ascendant
    const sleeveGeo = trackGeometry(new THREE.CylinderGeometry(0.08, 0.12, 0.7, 8));
    sleeveGeo.translate(0, -0.35, 0); // pivot at shoulder
    
    const leftArm = new THREE.Mesh(sleeveGeo, robeBlackMaterial);
    leftArm.position.set(-0.65, 0.8, 0.05);
    leftArm.rotation.z = 0.2;
    torsoMesh.add(leftArm);
    
    const rightArm = new THREE.Mesh(sleeveGeo, robeBlackMaterial);
    rightArm.position.set(0.65, 0.8, 0.05);
    rightArm.rotation.z = -0.2;
    torsoMesh.add(rightArm);

    const handGeo = trackGeometry(new THREE.SphereGeometry(0.065, 8, 8));
    const leftHand = new THREE.Mesh(handGeo, skinMaterial);
    leftHand.position.set(0, -0.72, 0);
    leftArm.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, skinMaterial);
    rightHand.position.set(0, -0.72, 0);
    rightArm.add(rightHand);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.25, 0);
    characterGroup.add(headGroup);

    const headGeo = trackGeometry(new THREE.SphereGeometry(0.68, 24, 24));
    
    // Face dynamic canvas
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 256;
    faceCanvas.height = 256;
    const faceCtx = faceCanvas.getContext('2d')!;

    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.colorSpace = THREE.SRGBColorSpace;

    const faceMaterial = trackMaterial(new THREE.MeshToonMaterial({
      map: faceTexture,
      gradientMap: gradientMap
    }));

    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    headGroup.add(headMesh);

    const faceGeo = trackGeometry(new THREE.SphereGeometry(0.69, 16, 16, -Math.PI / 4, Math.PI / 2, Math.PI / 4, Math.PI / 2));
    const faceMesh = new THREE.Mesh(faceGeo, faceMaterial);
    faceMesh.rotation.y = Math.PI; 
    headGroup.add(faceMesh);

    // Hair Group
    const hairLocksGroup = new THREE.Group();
    headGroup.add(hairLocksGroup);

    interface HairLock {
      mesh: THREE.Object3D;
      targetRotX: number;
      targetRotZ: number;
      currentRotX: number;
      currentRotZ: number;
      velX: number;
      velZ: number;
      mass: number;
    }

    const hairLocks: HairLock[] = [];

    const constructHair = () => {
      // 1. Back hair
      for (let i = 0; i < 8; i++) {
        const angle = -Math.PI / 4 - (i / 7) * (Math.PI / 2); 
        const cone = trackGeometry(new THREE.ConeGeometry(0.12, 0.9, 4));
        cone.translate(0, -0.45, 0); 
        const mesh = new THREE.Mesh(cone, hairMaterial);
        mesh.position.set(Math.sin(angle) * 0.55, 0.1, Math.cos(angle) * 0.55);
        mesh.rotation.x = 0.2;
        mesh.rotation.z = angle * 0.5;

        const tipGeo = trackGeometry(new THREE.ConeGeometry(0.09, 0.3, 4));
        tipGeo.translate(0, -0.75, 0);
        const tipMesh = new THREE.Mesh(tipGeo, hairHighlightMaterial);
        mesh.add(tipMesh);

        hairLocksGroup.add(mesh);
        hairLocks.push({
          mesh,
          targetRotX: mesh.rotation.x,
          targetRotZ: mesh.rotation.z,
          currentRotX: mesh.rotation.x,
          currentRotZ: mesh.rotation.z,
          velX: 0,
          velZ: 0,
          mass: 1.0 + Math.random() * 0.5
        });
      }

      // 2. Bangs
      const bangConfigs = [
        { px: -0.3, py: 0.35, pz: 0.58, rx: -0.1, rz: 0.25, len: 0.65 },
        { px: -0.12, py: 0.45, pz: 0.64, rx: -0.2, rz: 0.1, len: 0.75 },
        { px: 0.12, py: 0.45, pz: 0.64, rx: -0.2, rz: -0.1, len: 0.75 },
        { px: 0.3, py: 0.35, pz: 0.58, rx: -0.1, rz: -0.25, len: 0.65 },
        { px: 0.0, py: 0.5, pz: 0.66, rx: -0.3, rz: 0.0, len: 0.8 }
      ];

      bangConfigs.forEach((cfg) => {
        const cone = trackGeometry(new THREE.ConeGeometry(0.08, cfg.len, 4));
        cone.translate(0, -cfg.len / 2, 0);
        const mesh = new THREE.Mesh(cone, hairMaterial);
        mesh.position.set(cfg.px, cfg.py, cfg.pz);
        mesh.rotation.x = cfg.rx;
        mesh.rotation.z = cfg.rz;

        const tipGeo = trackGeometry(new THREE.ConeGeometry(0.06, cfg.len * 0.3, 4));
        tipGeo.translate(0, -cfg.len * 0.8, 0);
        const tipMesh = new THREE.Mesh(tipGeo, hairHighlightMaterial);
        mesh.add(tipMesh);

        hairLocksGroup.add(mesh);
        hairLocks.push({
          mesh,
          targetRotX: mesh.rotation.x,
          targetRotZ: mesh.rotation.z,
          currentRotX: mesh.rotation.x,
          currentRotZ: mesh.rotation.z,
          velX: 0,
          velZ: 0,
          mass: 0.8
        });
      });

      // 3. Spiky crown
      for (let i = 0; i < 5; i++) {
        const theta = (i / 4) * Math.PI - Math.PI / 2;
        const cone = trackGeometry(new THREE.ConeGeometry(0.1, 0.5, 4));
        cone.translate(0, 0.25, 0); 
        const mesh = new THREE.Mesh(cone, hairMaterial);
        mesh.position.set(Math.sin(theta) * 0.4, 0.52, Math.cos(theta) * 0.1);
        mesh.rotation.z = -theta * 0.4;
        hairLocksGroup.add(mesh);
      }
    };

    constructHair();

    // Halo
    const haloGeo = trackGeometry(new THREE.RingGeometry(0.55, 0.58, 24));
    const haloMesh = new THREE.Mesh(haloGeo, goldTrimMaterial);
    haloMesh.rotation.x = Math.PI / 2;
    haloMesh.position.y = 0.85;
    headGroup.add(haloMesh);

    const haloGem = new THREE.Mesh(gemGeo, gemMaterial);
    haloGem.position.set(0, 0.85, 0.57);
    headGroup.add(haloGem);

    // Wings
    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(-0.4, 1.4, -0.4);
    characterGroup.add(leftWingGroup);

    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(0.4, 1.4, -0.4);
    characterGroup.add(rightWingGroup);

    const constructWing = (wingGroup: THREE.Group, mat: THREE.Material, isRight: boolean) => {
      const scaleSign = isRight ? 1 : -1;
      const backboneGeo = trackGeometry(new THREE.BoxGeometry(0.8, 0.1, 0.1));
      const backbone = new THREE.Mesh(backboneGeo, goldTrimMaterial);
      backbone.position.set(0.4 * scaleSign, 0.2, 0);
      backbone.rotation.z = 0.3 * scaleSign;
      wingGroup.add(backbone);

      for (let i = 0; i < 4; i++) {
        const bladeGeo = trackGeometry(new THREE.ConeGeometry(0.18, 1.2 - i * 0.2, 4));
        bladeGeo.translate(0, -0.5, 0);
        const blade = new THREE.Mesh(bladeGeo, mat);
        blade.position.set((0.3 + i * 0.22) * scaleSign, -i * 0.1, 0);
        blade.rotation.z = (-0.5 - i * 0.22) * scaleSign;
        wingGroup.add(blade);
      }
    };

    constructWing(leftWingGroup, wingMaterialLeft, false);
    constructWing(rightWingGroup, wingMaterialRight, true);

    // Magic Circle
    const runicRingGeo = trackGeometry(new THREE.RingGeometry(1.5, 1.6, 32));
    const runicRing = new THREE.Mesh(runicRingGeo, magicCircleMaterial);
    runicRing.rotation.x = -Math.PI / 2;
    runicRing.position.y = 0.05;
    characterGroup.add(runicRing);

    const runicInnerRingGeo = trackGeometry(new THREE.RingGeometry(1.2, 1.25, 24));
    const runicInnerRing = new THREE.Mesh(runicInnerRingGeo, trackMaterial(new THREE.MeshBasicMaterial({
      color: 0x8b5cf6, 
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    })));
    runicInnerRing.rotation.x = -Math.PI / 2;
    runicInnerRing.position.y = 0.04;
    characterGroup.add(runicInnerRing);

    // Orbiting Crystals
    const crystals: THREE.Mesh[] = [];
    const cryColors = [0x10b981, 0x8b5cf6, 0xfbbf24]; 
    for (let i = 0; i < 3; i++) {
      const cryMat = trackMaterial(new THREE.MeshStandardMaterial({
        color: cryColors[i],
        emissive: cryColors[i],
        emissiveIntensity: 0.4,
        roughness: 0.1,
        metalness: 0.9
      }));
      const cryGeo = trackGeometry(new THREE.OctahedronGeometry(0.15));
      const crystal = new THREE.Mesh(cryGeo, cryMat);
      const angle = (i / 3) * Math.PI * 2;
      crystal.position.set(Math.sin(angle) * 1.8, 1.2, Math.cos(angle) * 1.8);
      characterGroup.add(crystal);
      crystals.push(crystal);
    }

    // Particles
    const particleCount = 45;
    const particleGeometry = trackGeometry(new THREE.BufferGeometry());
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const pAngle = Math.random() * Math.PI * 2;
      const pRad = 0.6 + Math.random() * 1.4;
      particlePositions[i * 3] = Math.sin(pAngle) * pRad;
      particlePositions[i * 3 + 1] = Math.random() * 3.5;
      particlePositions[i * 3 + 2] = Math.cos(pAngle) * pRad;
      particleSpeeds.push(0.015 + Math.random() * 0.025);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = trackMaterial(new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    }));
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    characterGroup.add(particles);

    // Book (Reading Mode)
    const bookGroup = new THREE.Group();
    bookGroup.position.set(0, 1.2, 0.85);
    bookGroup.scale.set(0, 0, 0); 
    characterGroup.add(bookGroup);

    const bookCoverGeo = trackGeometry(new THREE.BoxGeometry(0.5, 0.03, 0.7));
    const bookCover = new THREE.Mesh(
      bookCoverGeo,
      trackMaterial(new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 }))
    );
    bookCover.rotation.y = 0.1;
    bookGroup.add(bookCover);

    const bookPagesGeo = trackGeometry(new THREE.BoxGeometry(0.48, 0.04, 0.66));
    const bookPages = new THREE.Mesh(
      bookPagesGeo,
      trackMaterial(new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.8 }))
    );
    bookPages.position.y = 0.03;
    bookCover.add(bookPages);

    const bookGem = new THREE.Mesh(gemGeo, gemMaterial);
    bookGem.position.set(0, 0.03, 0);
    bookCover.add(bookGem);

    // Constellation (Stargazing Mode)
    const constellationGroup = new THREE.Group();
    const starGeo = trackGeometry(new THREE.BufferGeometry());
    const starPos = new Float32Array([
      -0.6, 2.5, 1.2,
      -0.2, 2.8, 1.5,
      0.3, 2.9, 1.1,
      0.8, 2.5, 1.3,
      -0.1, 2.1, 0.9,
      0.2, 1.8, 1.6,
      -0.7, 1.6, 1.4,
      0.6, 1.9, 1.0
    ]);
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starIndices = [0, 1, 1, 2, 2, 3, 2, 4, 4, 5, 5, 7, 0, 6, 4, 6];
    starGeo.setIndex(starIndices);

    const starLines = new THREE.LineSegments(
      starGeo,
      trackMaterial(new THREE.LineBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.5 }))
    );
    const starPoints = new THREE.Points(
      starGeo,
      trackMaterial(new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.9 }))
    );
    constellationGroup.add(starLines);
    constellationGroup.add(starPoints);
    constellationGroup.position.set(0, 1.4, 0);
    constellationGroup.scale.set(0, 0, 0); 
    characterGroup.add(constellationGroup);

    // --- THE TREE OF LIFE ---
    const treeGroup = new THREE.Group();
    treeGroup.position.set(-1.8, -1.2, -1.8);
    treeGroup.scale.set(0.001, 0.001, 0.001);
    scene.add(treeGroup);

    const trunkMaterial = trackMaterial(new THREE.MeshToonMaterial({
      color: 0x2d1b0c,
      gradientMap: gradientMap
    }));
    
    const leafMaterialEmerald = trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2
    }));

    const leafMaterialGold = trackMaterial(new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2
    }));

    const trunkParts: THREE.Mesh[] = [];
    let prevHeight = 0;
    let currentRad = 0.24;
    let currentX = 0;
    let currentZ = 0;
    
    for (let i = 0; i < 6; i++) {
      const partHeight = 0.55;
      const tGeo = trackGeometry(new THREE.CylinderGeometry(currentRad * 0.85, currentRad, partHeight, 8));
      tGeo.translate(0, partHeight / 2, 0);
      const partMesh = new THREE.Mesh(tGeo, trunkMaterial);
      partMesh.position.set(currentX, prevHeight, currentZ);
      partMesh.rotation.z = Math.sin(i * 0.7) * 0.12;
      partMesh.rotation.x = Math.cos(i * 0.7) * 0.08;
      treeGroup.add(partMesh);
      trunkParts.push(partMesh);

      // Veins of light running up
      const veinGeo = trackGeometry(new THREE.CylinderGeometry(0.015, 0.015, partHeight, 4));
      veinGeo.translate(0, partHeight / 2, 0);
      const veinMesh = new THREE.Mesh(veinGeo, gemMaterial);
      veinMesh.position.set(0, 0, currentRad * 0.95);
      partMesh.add(veinMesh);

      prevHeight += partHeight - 0.04;
      currentRad *= 0.84;

      if (i >= 3) {
        const branchGeo = trackGeometry(new THREE.CylinderGeometry(0.025, 0.06, 0.6, 6));
        branchGeo.translate(0, 0.3, 0);
        const branchMesh = new THREE.Mesh(branchGeo, trunkMaterial);
        branchMesh.position.set(0, partHeight * 0.7, 0);
        branchMesh.rotation.z = (Math.random() - 0.5) * 1.0 + (i % 2 === 0 ? 0.75 : -0.75);
        branchMesh.rotation.y = Math.random() * Math.PI * 2;
        partMesh.add(branchMesh);

        const leafGeo = trackGeometry(new THREE.SphereGeometry(0.3 + Math.random() * 0.12, 8, 8));
        const leafMesh = new THREE.Mesh(leafGeo, i % 2 === 0 ? leafMaterialEmerald : leafMaterialGold);
        leafMesh.position.set(0, 0.6, 0);
        branchMesh.add(leafMesh);
      }
    }

    const mainCanopyGeo = trackGeometry(new THREE.SphereGeometry(0.65, 10, 10));
    const mainCanopy = new THREE.Mesh(mainCanopyGeo, leafMaterialEmerald);
    mainCanopy.position.set(currentX, prevHeight + 0.08, currentZ);
    treeGroup.add(mainCanopy);

    const canopyOffsets = [
      { x: 0.35, y: -0.1, z: 0.25, r: 0.45, mat: leafMaterialGold },
      { x: -0.35, y: 0.1, z: -0.25, r: 0.4, mat: leafMaterialEmerald },
      { x: -0.25, y: -0.15, z: 0.35, r: 0.38, mat: leafMaterialGold },
      { x: 0.25, y: 0.15, z: -0.35, r: 0.45, mat: leafMaterialEmerald }
    ];
    canopyOffsets.forEach(c => {
      const cGeo = trackGeometry(new THREE.SphereGeometry(c.r, 8, 8));
      const cMesh = new THREE.Mesh(cGeo, c.mat);
      cMesh.position.set(c.x, c.y, c.z);
      mainCanopy.add(cMesh);
    });

    // Memory Leaves drifting down
    const leafCount = 6;
    const memoryLeaves: { mesh: THREE.Mesh; speedX: number; speedY: number; angleSpeed: number; basePos: THREE.Vector3 }[] = [];
    for (let i = 0; i < leafCount; i++) {
      const lGeo = trackGeometry(new THREE.ConeGeometry(0.04, 0.12, 4));
      const lMesh = new THREE.Mesh(lGeo, leafMaterialGold);
      lMesh.rotation.x = Math.PI / 2;
      treeGroup.add(lMesh);
      const basePos = new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        prevHeight + 0.2 + Math.random() * 0.5,
        (Math.random() - 0.5) * 0.8
      );
      lMesh.position.copy(basePos);
      memoryLeaves.push({
        mesh: lMesh,
        speedX: -0.003 - Math.random() * 0.003,
        speedY: -0.008 - Math.random() * 0.012,
        angleSpeed: 0.01 + Math.random() * 0.02,
        basePos: basePos
      });
    }

    // --- LIBRARY BACKGROUND SHELVES ---
    const libraryGroup = new THREE.Group();
    libraryGroup.position.set(0, 0.4, -2.5);
    libraryGroup.scale.set(0.001, 0.001, 0.001);
    scene.add(libraryGroup);

    const shelfMaterial = trackMaterial(new THREE.MeshToonMaterial({
      color: 0x1e293b,
      gradientMap: gradientMap
    }));
    const bookColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0x64748b];

    for (let s = 0; s < 3; s++) {
      const sGeo = trackGeometry(new THREE.BoxGeometry(2.4, 0.06, 0.35));
      const sMesh = new THREE.Mesh(sGeo, shelfMaterial);
      sMesh.position.y = s * 0.7 - 0.6;
      libraryGroup.add(sMesh);

      for (let b = 0; b < 8; b++) {
        const bHeight = 0.25 + Math.random() * 0.12;
        const bWidth = 0.05 + Math.random() * 0.03;
        const bGeo = trackGeometry(new THREE.BoxGeometry(bWidth, bHeight, 0.22));
        const bMat = trackMaterial(new THREE.MeshToonMaterial({
          color: bookColors[Math.floor(Math.random() * bookColors.length)],
          gradientMap: gradientMap
        }));
        const bookMesh = new THREE.Mesh(bGeo, bMat);
        bookMesh.position.set(-0.8 + b * 0.22, s * 0.7 - 0.6 + bHeight / 2 + 0.03, 0);
        if (b === 2 || b === 5) {
          bookMesh.rotation.z = 0.22;
          bookMesh.position.x -= 0.02;
        }
        libraryGroup.add(bookMesh);
      }
    }

    // --- JOURNAL & STARDUST LIGHT QUILL ---
    const journalGroup = new THREE.Group();
    journalGroup.position.set(0, 1.1, 0.85);
    journalGroup.scale.set(0.001, 0.001, 0.001);
    characterGroup.add(journalGroup);

    const journalCover = new THREE.Mesh(
      trackGeometry(new THREE.BoxGeometry(0.5, 0.016, 0.7)),
      trackMaterial(new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.8 }))
    );
    journalCover.rotation.x = 0.15;
    journalGroup.add(journalCover);

    const journalPagesLeft = new THREE.Mesh(
      trackGeometry(new THREE.BoxGeometry(0.23, 0.024, 0.66)),
      trackMaterial(new THREE.MeshStandardMaterial({ color: 0xfffcf0, roughness: 0.7 }))
    );
    journalPagesLeft.position.set(-0.12, 0.02, 0);
    journalPagesLeft.rotation.y = 0.06;
    journalCover.add(journalPagesLeft);

    const journalPagesRight = new THREE.Mesh(
      trackGeometry(new THREE.BoxGeometry(0.23, 0.024, 0.66)),
      trackMaterial(new THREE.MeshStandardMaterial({ color: 0xfffcf0, roughness: 0.7 }))
    );
    journalPagesRight.position.set(0.12, 0.02, 0);
    journalPagesRight.rotation.y = -0.06;
    journalCover.add(journalPagesRight);

    // Quill
    const quillGroup = new THREE.Group();
    journalGroup.add(quillGroup);

    const quillBodyGeo = trackGeometry(new THREE.ConeGeometry(0.016, 0.25, 4));
    quillBodyGeo.translate(0, 0.125, 0);
    const quillBody = new THREE.Mesh(quillBodyGeo, trackMaterial(new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 1.5
    })));
    quillBody.rotation.x = -0.4;
    quillGroup.add(quillBody);

    const featherGeo = trackGeometry(new THREE.PlaneGeometry(0.05, 0.15));
    featherGeo.translate(0, 0.15, 0);
    const feather = new THREE.Mesh(featherGeo, wingMaterialRight);
    quillBody.add(feather);

    // --- MAGICAL CREATURES ---
    const creatureCount = 2;
    const creatures: any[] = [];
    const creatureOffsets: number[] = [];

    const creatureMat = trackMaterial(new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 2.0,
      roughness: 0.1
    }));
    const creatureWingMat = trackMaterial(new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    }));

    for (let i = 0; i < creatureCount; i++) {
      const cGroup = new THREE.Group() as any;
      const cBodyGeo = trackGeometry(new THREE.SphereGeometry(0.05, 6, 6));
      const cBody = new THREE.Mesh(cBodyGeo, creatureMat);
      cGroup.add(cBody);

      const wGeo = trackGeometry(new THREE.PlaneGeometry(0.08, 0.05));
      wGeo.translate(0.04, 0, 0);
      const wLeft = new THREE.Mesh(wGeo, creatureWingMat);
      wLeft.position.set(-0.015, 0, 0);
      wLeft.rotation.y = Math.PI;
      cGroup.add(wLeft);
      cGroup.leftWing = wLeft;

      const wRight = new THREE.Mesh(wGeo, creatureWingMat);
      wRight.position.set(0.015, 0, 0);
      cGroup.add(wRight);
      cGroup.rightWing = wRight;

      scene.add(cGroup);
      creatures.push(cGroup);
      creatureOffsets.push(Math.random() * Math.PI * 2);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(2, 6, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const energyPointLight = new THREE.PointLight(0x10b981, 1.0, 5);
    energyPointLight.position.set(0, 1.5, 1);
    scene.add(energyPointLight);

    // Animation vars
    let time = 0;
    let blinkTimer = 0;
    let blinkProgress = 0;
    let lookTargetX = 0;
    let lookTargetY = 0;
    let lookLerpX = 0;
    let lookLerpY = 0;
    let mouthOpen = 0;

    // Posture Shifting & Idle variables
    let postureTimer = 0;
    let currentPosture = 0;

    // Meditate & touch tree trunk
    let touchProgress = 0;
    
    // Magical creatures landing variables
    let landProgress = 0;

    // Canvas face texturing
    const drawFaceTexture = (expressionState: string, lookOffset: { x: number; y: number }, speakingFlag: boolean) => {
      faceCtx.clearRect(0, 0, 256, 256);
      faceCtx.fillStyle = '#fff2e8';
      faceCtx.fillRect(0, 0, 256, 256);

      // Blush
      faceCtx.fillStyle = 'rgba(253, 164, 175, 0.4)';
      faceCtx.beginPath();
      faceCtx.ellipse(82, 160, 15, 6, 0, 0, Math.PI * 2);
      faceCtx.ellipse(174, 160, 15, 6, 0, 0, Math.PI * 2);
      faceCtx.fill();

      // Eyebrows
      faceCtx.strokeStyle = '#0f172a';
      faceCtx.lineWidth = 3.0;
      faceCtx.lineCap = 'round';
      faceCtx.beginPath();
      if (expressionState === 'Concerned') {
        faceCtx.moveTo(60, 115);
        faceCtx.quadraticCurveTo(85, 125, 105, 120);
        faceCtx.moveTo(196, 115);
        faceCtx.quadraticCurveTo(171, 125, 151, 120);
      } else if (expressionState === 'Proud' || expressionState === 'Confident') {
        faceCtx.moveTo(60, 120);
        faceCtx.quadraticCurveTo(85, 110, 105, 118);
        faceCtx.moveTo(196, 120);
        faceCtx.quadraticCurveTo(171, 110, 151, 118);
      } else {
        faceCtx.moveTo(60, 118);
        faceCtx.quadraticCurveTo(85, 112, 105, 116);
        faceCtx.moveTo(196, 118);
        faceCtx.quadraticCurveTo(171, 112, 151, 116);
      }
      faceCtx.stroke();

      const drawEye = (cx: number, cy: number) => {
        const lx = lookOffset.x * 12;
        const ly = lookOffset.y * 8;

        if (blinkProgress > 0.85) {
          faceCtx.strokeStyle = '#0f172a';
          faceCtx.lineWidth = 4.5;
          faceCtx.lineCap = 'round';
          faceCtx.beginPath();
          faceCtx.moveTo(cx - 20, cy);
          faceCtx.quadraticCurveTo(cx, cy + 8, cx + 20, cy);
          faceCtx.stroke();
          return;
        }

        faceCtx.strokeStyle = '#0f172a';
        faceCtx.lineWidth = 4.5;
        faceCtx.lineCap = 'round';
        faceCtx.beginPath();
        faceCtx.moveTo(cx - 22, cy);
        faceCtx.quadraticCurveTo(cx, cy - 12, cx + 22, cy);
        faceCtx.stroke();

        faceCtx.fillStyle = '#10b981';
        faceCtx.beginPath();
        faceCtx.ellipse(cx + lx, cy + ly, 13, 17, 0, 0, Math.PI * 2);
        faceCtx.fill();

        faceCtx.fillStyle = '#0f172a';
        faceCtx.beginPath();
        faceCtx.ellipse(cx + lx, cy + ly, 6, 9, 0, 0, Math.PI * 2);
        faceCtx.fill();

        faceCtx.fillStyle = '#fbbf24';
        faceCtx.beginPath();
        faceCtx.arc(cx + lx - 3, cy + ly + 4, 3, 0, Math.PI * 2);
        faceCtx.fill();

        faceCtx.fillStyle = '#ffffff';
        faceCtx.beginPath();
        faceCtx.arc(cx + lx + 4, cy + ly - 5, 4.5, 0, Math.PI * 2);
        faceCtx.fill();
        faceCtx.beginPath();
        faceCtx.arc(cx + lx - 6, cy + ly + 1, 1.8, 0, Math.PI * 2);
        faceCtx.fill();
      };

      drawEye(85, 140);
      drawEye(171, 140);

      // Nose
      faceCtx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
      faceCtx.lineWidth = 2.0;
      faceCtx.beginPath();
      faceCtx.moveTo(128, 155);
      faceCtx.lineTo(127, 159);
      faceCtx.lineTo(129, 159);
      faceCtx.stroke();

      // Mouth
      faceCtx.strokeStyle = '#334155';
      faceCtx.lineWidth = 3.0;
      faceCtx.fillStyle = '#fda4af';
      
      const mouthCenterY = 185;
      const baseWidth = 18;

      if (speakingFlag && mouthOpen > 0.05) {
        const openH = mouthOpen * 14;
        faceCtx.beginPath();
        faceCtx.ellipse(128, mouthCenterY, baseWidth, openH, 0, 0, Math.PI * 2);
        faceCtx.fill();
        faceCtx.stroke();
      } else {
        faceCtx.beginPath();
        if (expressionState === 'Happy' || expressionState === 'Smiling' || expressionState === 'Excited') {
          faceCtx.moveTo(128 - baseWidth, mouthCenterY - 2);
          faceCtx.quadraticCurveTo(128, mouthCenterY + 8, 128 + baseWidth, mouthCenterY - 2);
        } else if (expressionState === 'Concerned' || expressionState === 'Sad') {
          faceCtx.moveTo(128 - baseWidth, mouthCenterY + 4);
          faceCtx.quadraticCurveTo(128, mouthCenterY - 2, 128 + baseWidth, mouthCenterY + 4);
        } else {
          faceCtx.moveTo(128 - baseWidth, mouthCenterY);
          faceCtx.quadraticCurveTo(128, mouthCenterY + 3, 128 + baseWidth, mouthCenterY);
        }
        faceCtx.stroke();
      }

      faceTexture.needsUpdate = true;
    };

    // --- ANIMATION / INTERACTION FRAME LOOP ---
    let frameId = 0;
    const windForce = new THREE.Vector3(0.04, 0, 0.02);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.035;

      // Read live reactive prop values from refs (avoids destroying/recreating Three.js contexts)
      const currentEmotion = emotionRef.current;
      const currentMousePos = mousePosRef.current;
      const currentWidgetCenter = widgetCenterRef.current;
      const isSpeaking = speakingRef.current;

      // 1. AUTO RESIZE CHECK INSIDE ANIMATION FRAME (bulletproof sizing)
      if (containerRef.current) {
        const currentWidth = containerRef.current.clientWidth;
        const currentHeight = containerRef.current.clientHeight;
        if (currentWidth !== lastWidth || currentHeight !== lastHeight) {
          lastWidth = currentWidth;
          lastHeight = currentHeight;
          camera.aspect = currentWidth / currentHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(currentWidth, currentHeight);
        }
      }

      // Query local hours for timeline poses
      const currentHour = new Date().getHours();
      let routineMode: 'Reading' | 'Walking' | 'Meditating' | 'Stargazing' = 'Walking';
      if (currentHour >= 6 && currentHour < 12) routineMode = 'Reading';
      else if (currentHour >= 12 && currentHour < 17) routineMode = 'Walking';
      else if (currentHour >= 17 && currentHour < 21) routineMode = 'Meditating';
      else routineMode = 'Stargazing';

      // Breathe
      const breatheCycle = Math.sin(time * 2.5);
      torsoMesh.scale.y = 1.0 + breatheCycle * 0.012;
      torsoMesh.scale.x = 1.0 + breatheCycle * 0.006;
      headGroup.position.y = 2.25 + breatheCycle * 0.015;

      // Flapping wings
      const wingFlap = Math.sin(time * 1.8);
      leftWingGroup.rotation.y = -0.3 + wingFlap * 0.15;
      leftWingGroup.rotation.z = -0.15 + Math.cos(time * 1.8) * 0.08;
      rightWingGroup.rotation.y = 0.3 - wingFlap * 0.15;
      rightWingGroup.rotation.z = 0.15 - Math.cos(time * 1.8) * 0.08;

      // Crystals
      crystals.forEach((c, idx) => {
        const cAngle = time * 0.6 + (idx / 3) * Math.PI * 2;
        const orbitRadius = 1.8 + Math.sin(time * 2.0 + idx) * 0.12;
        c.position.set(Math.sin(cAngle) * orbitRadius, 1.2 + Math.cos(time * 1.5 + idx) * 0.15, Math.cos(cAngle) * orbitRadius);
        c.rotation.x += 0.02;
        c.rotation.y += 0.035;
      });

      // Rings
      runicRing.rotation.z -= 0.0035;
      runicInnerRing.rotation.z += 0.008;

      // Particle update
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleSpeeds[i];
        positions[i * 3] += Math.sin(time * 0.5 + i) * 0.002;
        positions[i * 3 + 2] += Math.cos(time * 0.5 + i) * 0.002;

        if (positions[i * 3 + 1] > 3.5) {
          positions[i * 3 + 1] = 0.0;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // 1. Posture shifting timer (cycles every 16 seconds)
      postureTimer += 0.015;
      if (postureTimer > 16) {
        postureTimer = 0;
        currentPosture = Math.floor(Math.random() * 3);
      }

      // 2. Interactive routine state interpolators
      let targetTreeScale = 0.001;
      let targetLibraryScale = 0.001;
      let targetJournalScale = 0.001;
      let targetCreaturesScale = 0.001;

      // Meditate trunk touch cycle
      let isTouchingTrunk = false;
      if (routineMode === 'Meditating') {
        const touchCycle = Math.sin(time * 0.2); // oscillates over ~31s
        if (touchCycle > 0.75) {
          isTouchingTrunk = true;
          touchProgress += (1.0 - touchProgress) * 0.05;
        } else {
          isTouchingTrunk = false;
          touchProgress += (0.0 - touchProgress) * 0.05;
        }
      } else {
        touchProgress += (0.0 - touchProgress) * 0.1;
      }

      // Creature landing cycle
      let isCreatureLanded = false;
      if (routineMode === 'Walking') {
        const landCycle = Math.sin(time * 0.15); // oscillates over ~42s
        if (landCycle > 0.8) {
          isCreatureLanded = true;
          landProgress += (1.0 - landProgress) * 0.05;
        } else {
          isCreatureLanded = false;
          landProgress += (0.0 - landProgress) * 0.05;
        }
      } else {
        landProgress += (0.0 - landProgress) * 0.1;
      }

      // Handle timeline routines
      if (routineMode === 'Reading') {
        bookGroup.scale.set(1, 1, 1);
        constellationGroup.scale.set(0, 0, 0);
        bookGroup.position.y = 1.2 + Math.sin(time * 2.0) * 0.08;
        bookGroup.rotation.x = -0.15 + Math.sin(time * 1.5) * 0.05;
        bookGroup.rotation.y = 0.05 + Math.cos(time * 1.2) * 0.05;

        // Custom particles rising from book
        if (Math.random() < 0.15) {
          const positionsArr = particles.geometry.attributes.position.array as Float32Array;
          const pIdx = Math.floor(Math.random() * particleCount);
          positionsArr[pIdx * 3] = bookGroup.position.x + (Math.random() - 0.5) * 0.3;
          positionsArr[pIdx * 3 + 1] = bookGroup.position.y;
          positionsArr[pIdx * 3 + 2] = bookGroup.position.z + (Math.random() - 0.5) * 0.3;
          particles.geometry.attributes.position.needsUpdate = true;
        }

        lookTargetX = 0;
        lookTargetY = -0.55;

        targetLibraryScale = 1.0;

        ambientLight.color.setHex(0xfef3c7);
        dirLight.color.setHex(0xfbbf24);
        dirLight.intensity = 1.3;
        energyPointLight.color.setHex(0x10b981);
        energyPointLight.intensity = 1.2;
      } 
      else if (routineMode === 'Walking') {
        bookGroup.scale.set(0, 0, 0);
        constellationGroup.scale.set(0, 0, 0);

        const pace = Math.sin(time * 2.5);
        characterGroup.position.y = -1.2 + pace * 0.04;
        characterGroup.rotation.y = Math.sin(time * 0.6) * 0.08;
        torsoMesh.rotation.z = Math.cos(time * 2.5) * 0.03;

        targetCreaturesScale = 1.0;

        // Default gaze tracking
        if (currentWidgetCenter.x && currentWidgetCenter.y) {
          const dx = currentMousePos.x - currentWidgetCenter.x;
          const dy = currentMousePos.y - currentWidgetCenter.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 15) {
            lookTargetX = Math.max(-0.55, Math.min(0.55, dx / 280));
            lookTargetY = Math.max(-0.45, Math.min(0.45, -dy / 250));
          } else {
            lookTargetX = 0;
            lookTargetY = 0;
          }
        } else {
          lookTargetX = Math.sin(time * 0.5) * 0.15;
          lookTargetY = Math.cos(time * 0.8) * 0.08;
        }

        // Overridden by tracking the closest creature
        if (creatures.length > 0 && !isCreatureLanded) {
          let nearestIdx = 0;
          let minDist = 999;
          creatures.forEach((c, idx) => {
            const d = c.position.distanceTo(new THREE.Vector3(0, 1.0, 0));
            if (d < minDist) {
              minDist = d;
              nearestIdx = idx;
            }
          });
          if (minDist < 2.2) {
            const targetC = creatures[nearestIdx];
            lookTargetX = Math.max(-0.55, Math.min(0.55, targetC.position.x / 1.6));
            lookTargetY = Math.max(-0.4, Math.min(0.4, (targetC.position.y - 1.0) / 1.4));
          }
        }

        ambientLight.color.setHex(0xe0f2fe);
        dirLight.color.setHex(0x38bdf8);
        dirLight.intensity = 1.6;
        energyPointLight.color.setHex(0x10b981);
        energyPointLight.intensity = 0.8;
      }
      else if (routineMode === 'Meditating') {
        bookGroup.scale.set(0, 0, 0);
        constellationGroup.scale.set(0, 0, 0);

        // Slow hover
        characterGroup.position.y = -0.9 + Math.sin(time * 1.5) * 0.18;
        characterGroup.rotation.y = time * 0.1; 
        torsoMesh.rotation.z = 0;

        targetTreeScale = 1.0;

        if (touchProgress > 0.05) {
          // Hover closer to tree
          characterGroup.position.x = -0.65 * touchProgress;
          characterGroup.position.z = -0.65 * touchProgress;
          // Look at trunk
          lookTargetX = -0.4;
          lookTargetY = 0.15;
          
          // Light emission pulses
          leafMaterialEmerald.emissiveIntensity = 0.6 + touchProgress * 0.8;
          leafMaterialGold.emissiveIntensity = 0.6 + touchProgress * 0.8;
        } else {
          characterGroup.position.x = 0;
          characterGroup.position.z = 0;
          lookTargetX = 0;
          lookTargetY = 0.1;
          leafMaterialEmerald.emissiveIntensity = 0.6;
          leafMaterialGold.emissiveIntensity = 0.6;
        }

        ambientLight.color.setHex(0xfae8ff);
        dirLight.color.setHex(0xec4899);
        dirLight.intensity = 1.1;
        energyPointLight.color.setHex(0x8b5cf6);
        energyPointLight.intensity = 1.8;
      }
      else { // Stargazing
        bookGroup.scale.set(0, 0, 0);
        constellationGroup.scale.set(1, 1, 1);
        constellationGroup.rotation.y += 0.005;

        targetJournalScale = 1.0;

        // Writing quill animation
        const writeX = Math.sin(time * 3.2) * 0.12;
        const writeZ = Math.cos(time * 2.0) * 0.12;
        const writeY = 0.08 + Math.abs(Math.sin(time * 6.0)) * 0.02;
        quillGroup.position.set(writeX + 0.1, writeY + 0.03, writeZ);
        quillGroup.rotation.z = Math.sin(time * 3.5) * 0.12;

        // Head tracks quill
        lookTargetX = writeX + 0.12;
        lookTargetY = -0.35;

        characterGroup.position.y = -1.2;
        characterGroup.rotation.y = 0;
        torsoMesh.rotation.z = 0;

        ambientLight.color.setHex(0x1e1b4b);
        dirLight.color.setHex(0x6366f1);
        dirLight.intensity = 0.8;
        energyPointLight.color.setHex(0x38bdf8);
        energyPointLight.intensity = 1.5;
      }

      // Smooth Scale Lerping for environment
      treeGroup.scale.x += (targetTreeScale - treeGroup.scale.x) * 0.05;
      treeGroup.scale.y += (targetTreeScale - treeGroup.scale.y) * 0.05;
      treeGroup.scale.z += (targetTreeScale - treeGroup.scale.z) * 0.05;

      libraryGroup.scale.x += (targetLibraryScale - libraryGroup.scale.x) * 0.05;
      libraryGroup.scale.y += (targetLibraryScale - libraryGroup.scale.y) * 0.05;
      libraryGroup.scale.z += (targetLibraryScale - libraryGroup.scale.z) * 0.05;

      journalGroup.scale.x += (targetJournalScale - journalGroup.scale.x) * 0.05;
      journalGroup.scale.y += (targetJournalScale - journalGroup.scale.y) * 0.05;
      journalGroup.scale.z += (targetJournalScale - journalGroup.scale.z) * 0.05;

      // Update magical creatures
      creatures.forEach((c, idx) => {
        let currentScale = c.scale.x;
        let nextScale = currentScale + (targetCreaturesScale - currentScale) * 0.05;
        c.scale.set(nextScale, nextScale, nextScale);

        if (nextScale > 0.01) {
          if (isCreatureLanded && idx === 0) {
            // Hand world position
            const handWorldPos = new THREE.Vector3(-0.6, -0.4, 0.3);
            c.position.lerp(handWorldPos, 0.08);

            // slow flap
            const flap = Math.sin(time * 5.0) * 0.15;
            if (c.leftWing) c.leftWing.rotation.y = Math.PI - flap;
            if (c.rightWing) c.rightWing.rotation.y = flap;
          } else {
            // Standard orbital flight path
            const angle = time * 0.7 + creatureOffsets[idx];
            const radius = 1.4 + Math.sin(time * 0.4 + idx) * 0.3;
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            const y = 0.8 + Math.sin(time * 1.6 + idx * 2.0) * 0.4;
            c.position.set(x, y, z);

            // fast flap
            const flap = Math.sin(time * 26.0 + idx * 4.0) * 0.7;
            if (c.leftWing) c.leftWing.rotation.y = Math.PI - flap;
            if (c.rightWing) c.rightWing.rotation.y = flap;
          }
        }
      });

      // Update Memory Leaves
      if (treeGroup.scale.x > 0.05) {
        memoryLeaves.forEach((l, idx) => {
          l.mesh.position.y += l.speedY;
          l.mesh.position.x += l.speedX + Math.sin(time * 2.0 + idx) * 0.006;
          l.mesh.position.z += Math.cos(time * 1.5 + idx) * 0.006;
          l.mesh.rotation.y += l.angleSpeed;
          l.mesh.rotation.x += l.angleSpeed * 0.5;

          if (l.mesh.position.y < -1.0) {
            l.mesh.position.copy(l.basePos);
          }
        });
      }

      // 3. Posture Arm Animations
      if (touchProgress > 0.05) {
        // Reaching out to tree
        leftArm.rotation.x = -1.2 * touchProgress;
        leftArm.rotation.y = 0.4 * touchProgress;
        leftArm.rotation.z = 0.2 * touchProgress;

        rightArm.rotation.x = Math.sin(time * 1.5) * 0.05;
        rightArm.rotation.z = -0.15 + Math.sin(time * 0.8) * 0.03;
      }
      else if (landProgress > 0.05) {
        // Reaching out hand for creature landing
        leftArm.rotation.x = -0.9 * landProgress;
        leftArm.rotation.y = 0.2 * landProgress;
        leftArm.rotation.z = -0.25 * landProgress;

        rightArm.rotation.x = Math.sin(time * 1.5) * 0.05;
        rightArm.rotation.z = -0.15 + Math.sin(time * 0.8) * 0.03;
      }
      else if (routineMode === 'Stargazing' && targetJournalScale > 0.8) {
        // Directing the light quill with right arm
        leftArm.rotation.x = -0.3;
        leftArm.rotation.z = 0.1;

        rightArm.rotation.x = -0.9 + Math.sin(time * 2.0) * 0.05;
        rightArm.rotation.y = -0.2;
        rightArm.rotation.z = -0.2 + Math.cos(time * 2.0) * 0.05;
      }
      else {
        // Fallback to idle postures
        if (currentPosture === 1) { // Crossing arms
          leftArm.rotation.x = -0.4;
          leftArm.rotation.y = 0.2;
          leftArm.rotation.z = 0.7;

          rightArm.rotation.x = -0.4;
          rightArm.rotation.y = -0.2;
          rightArm.rotation.z = -0.7;
        }
        else if (currentPosture === 2) { // Thinking (Hand on chin)
          leftArm.rotation.x = Math.sin(time * 1.5) * 0.05;
          leftArm.rotation.z = 0.15 + Math.sin(time * 0.8) * 0.03;

          rightArm.rotation.x = -1.2 + Math.sin(time * 1.5) * 0.03;
          rightArm.rotation.y = -0.4;
          rightArm.rotation.z = -0.25;
        }
        else { // Standard idle sway
          leftArm.rotation.x = Math.sin(time * 1.5) * 0.05;
          leftArm.rotation.z = 0.15 + Math.sin(time * 0.8) * 0.03;

          rightArm.rotation.x = Math.sin(time * 1.5) * 0.05;
          rightArm.rotation.z = -0.15 - Math.sin(time * 0.8) * 0.03;
        }
      }

      // Smooth tracking LERP
      lookLerpX += (lookTargetX - lookLerpX) * 0.08;
      lookLerpY += (lookTargetY - lookLerpY) * 0.08;

      headMesh.rotation.y = lookLerpX * 0.75;
      headMesh.rotation.x = -lookLerpY * 0.45;
      faceMesh.rotation.y = Math.PI + lookLerpX * 0.75;
      faceMesh.rotation.x = lookLerpY * 0.45;

      // Spring Hair physics
      const headSpeedX = (lookTargetX - lookLerpX);
      const windActiveX = windForce.x + Math.sin(time * 6.5) * 0.06;
      const windActiveZ = windForce.z + Math.cos(time * 4.5) * 0.04;

      hairLocks.forEach((lock) => {
        const dispX = lock.currentRotX - lock.targetRotX;
        const dispZ = lock.currentRotZ - lock.targetRotZ;

        const k = 0.15; 
        const c = 0.08; 

        const forceX = -k * dispX - c * lock.velX + headSpeedX * 0.1 + windActiveX * 0.05;
        const forceZ = -k * dispZ - c * lock.velZ + windActiveZ * 0.05;

        lock.velX += forceX / lock.mass;
        lock.velZ += forceZ / lock.mass;

        lock.currentRotX += lock.velX;
        lock.currentRotZ += lock.velZ;

        lock.mesh.rotation.x = lock.currentRotX;
        lock.mesh.rotation.z = lock.currentRotZ;
      });

      // Cape vertex displacement
      const capePosAttr = capeMesh.geometry.attributes.position;
      for (let i = 0; i < capePosAttr.count; i++) {
        const xPos = capePositions.getX(i);
        const yPos = capePositions.getY(i);
        const anchorFactor = Math.max(0, (2.2 - (yPos + 1.1)) / 2.2); 
        const wave = Math.sin(xPos * 3.5 - time * 6.0 + yPos * 2.0) * 0.06 * anchorFactor;
        const secondaryWave = Math.cos(yPos * 2.0 - time * 4.0) * 0.04 * anchorFactor;
        
        capePosAttr.setZ(i, capePositions.getZ(i) + wave + secondaryWave);
      }
      capeMesh.geometry.attributes.position.needsUpdate = true;
      capeMesh.geometry.computeVertexNormals();

      // Organised random blinking
      blinkTimer += 1;
      if (blinkTimer > 180 + Math.random() * 200) {
        blinkProgress = 1.0;
        blinkTimer = 0;
      }
      if (blinkProgress > 0) {
        blinkProgress -= 0.18; 
      }

      // Talking lip sync
      if (isSpeaking) {
        mouthOpen = Math.abs(Math.sin(time * 11.0)) * (0.35 + 0.65 * Math.random());
      } else {
        mouthOpen = 0;
      }

      // Face redraw
      drawFaceTexture(currentEmotion, { x: lookLerpX, y: lookLerpY }, isSpeaking);

      // Camera lissajous motion
      camera.position.x = Math.sin(time * 0.4) * 0.12;
      camera.position.y = Math.cos(time * 0.3) * 0.08;
      camera.lookAt(0, 1.0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // --- CLEANUP DISPOSAL ON UNMOUNT ---
    return () => {
      cancelAnimationFrame(frameId);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      renderer.dispose();
      gradientMap.dispose();
      faceTexture.dispose();

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
    };
  }, []); // Empty dependency array: runs exactly once on mount!

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative" 
      style={{ minHeight: '100%', minWidth: '100%' }}
    />
  );
};
