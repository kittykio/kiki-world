'use client';

import { Html, useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import Avatar, { type Activity, type Outfit } from './Avatar';

export const ROOMS = [
  { title: 'Make', short: 'Ideas become playful interfaces.', model: '/models/studyroom.glb', x: -2.6, color: '#00f5ff', activity: 'Typing' },
  { title: 'Rest', short: 'Quiet space protects creative energy.', model: '/models/bedroom.glb', x: 0, color: '#ff2bd6', activity: 'Sitting' },
  { title: 'Connect', short: 'Good work becomes shared experience.', model: '/models/livingroom.glb', x: 2.6, color: '#b7ff00', activity: 'Dancing' },
] as const;

function Room({ room, active, onSelect }: { room: (typeof ROOMS)[number]; active: boolean; onSelect: () => void }) {
  const { scene } = useGLTF(room.model); const copy = useMemo(() => scene.clone(), [scene]);
  const size = useThree((state) => state.size);
  const modelScale = size.width / size.height < 0.8 ? 0.15 : size.height < 500 ? 0.16 : size.width < 1000 ? 0.18 : 0.19;
  return <group position={[room.x, -.78, 0]}>
    <primitive object={copy} scale={modelScale} rotation-y={-Math.PI / 4} onClick={onSelect} />
    <Html center position={[0, 1.35, 0]} distanceFactor={7} occlude={false}>
      <button className={`room-label ${active ? 'active' : ''}`} onClick={onSelect} aria-label={`Visit ${room.title}`}><span>{room.title}</span><small>{room.short}</small></button>
    </Html>
    {active && <pointLight position={[0, 1.1, 1]} color={room.color} intensity={3} distance={4} />}
  </group>;
}

function CameraRig({ active, reducedMotion }: { active: number; reducedMotion: boolean }) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);
  const lookAt = useMemo(() => new THREE.Vector3(), []);
  const portrait = size.width / size.height < 0.8;
  const shortLandscape = size.height < 500;
  const distance = portrait ? 6.8 : shortLandscape ? 6.25 : size.width < 1000 ? 5.8 : 5.4;
  const cameraHeight = portrait ? 1.45 : shortLandscape ? 1.1 : 1.25;
  const fieldOfView = portrait ? 54 : shortLandscape ? 56 : 48;
  useEffect(() => { camera.fov = fieldOfView; camera.updateProjectionMatrix(); }, [camera, fieldOfView]);
  useFrame((_, delta) => { const x = ROOMS[active].x; const desired = new THREE.Vector3(x, cameraHeight, distance); if (reducedMotion) camera.position.copy(desired); else camera.position.lerp(desired, 1 - Math.exp(-delta * 1.15)); lookAt.set(x, portrait ? .45 : .35, 0); camera.lookAt(lookAt); });
  return null;
}

export default function StudioScene({ active, onSelect, outfit, reducedMotion }: { active: number; onSelect: (index: number) => void; outfit: Outfit; reducedMotion: boolean }) {
  const size = useThree((state) => state.size);
  const avatarPosition: THREE.Vector3Tuple = [ROOMS[active].x, -.72, 1.05];
  const avatarScale = size.width / size.height < 0.8 ? 0.25 : size.height < 500 ? 0.26 : 0.3;
  return <>
    <color attach="background" args={['#070711']} /><fog attach="fog" args={['#070711', 6, 12]} />
    <ambientLight color="#9b8cff" intensity={.58} /><directionalLight color="#d9fbff" position={[3, 6, 5]} intensity={2.2} castShadow />
    {ROOMS.map((room, index) => <Room key={room.title} room={room} active={index === active} onSelect={() => onSelect(index)} />)}
    <Avatar key={outfit} destination={avatarPosition} activity={ROOMS[active].activity as Activity} outfit={outfit} scale={avatarScale} reducedMotion={reducedMotion} />
    <mesh rotation-x={-Math.PI / 2} position-y={-.8} receiveShadow><planeGeometry args={[30, 14]} /><meshStandardMaterial color="#0d0d1d" roughness={.88} metalness={.18} /></mesh>
    <CameraRig active={active} reducedMotion={reducedMotion} />
  </>;
}
