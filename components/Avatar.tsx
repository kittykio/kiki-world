'use client';

import { useAnimations, useFBX, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

export type Activity = 'Typing' | 'Sitting' | 'Dancing';
export type Outfit = 'jeans' | 'black' | 'blue' | 'brown';
type Motion = 'Bored' | 'Walking' | 'Waving' | Activity;

const OUTFIT_MODELS: Record<Outfit, string> = {
  jeans: '/models/avatar.glb',
  black: '/models/avatar-black.glb',
  blue: '/models/avatar-blue.glb',
  brown: '/models/avatar-brown.glb',
};

export default function Avatar({
  destination,
  activity,
  outfit,
  scale,
  reducedMotion,
}: {
  destination: THREE.Vector3Tuple;
  activity: Activity;
  outfit: Outfit;
  scale: number;
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const arrived = useRef(true);
  const timer = useRef<number>();
  const initialPosition = useRef<THREE.Vector3Tuple>(destination);
  const previousTarget = useRef(new THREE.Vector3(...destination));
  const activityRef = useRef(activity);
  const target = useMemo(() => new THREE.Vector3(...destination), [destination]);
  const { scene } = useGLTF(OUTFIT_MODELS[outfit]);
  const avatar = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { animations: bored } = useFBX('/animations/Bored.fbx');
  const { animations: walking } = useFBX('/animations/Walking.fbx');
  const { animations: waving } = useFBX('/animations/Waving.fbx');
  const { animations: typing } = useFBX('/animations/Typing.fbx');
  const { animations: sitting } = useFBX('/animations/Sitting.fbx');
  const { animations: dancing } = useFBX('/animations/Dancing.fbx');
  const clips = useMemo(() => {
    const sources = { Bored: bored, Walking: walking, Waving: waving, Typing: typing, Sitting: sitting, Dancing: dancing };
    return Object.entries(sources).map(([name, source]) => {
      const clip = source[0].clone();
      clip.name = name;
      // Mixamo stores locomotion on the hips. Keep its vertical bounce, but
      // lock horizontal root motion so the avatar cannot drift out of a room.
      clip.tracks.forEach((track) => {
        if (!track.name.toLowerCase().endsWith('hips.position')) return;
        const values = track.values;
        const originX = values[0];
        const originZ = values[2];
        for (let index = 0; index < values.length; index += 3) {
          values[index] = originX;
          values[index + 2] = originZ;
        }
      });
      return clip;
    });
  }, [bored, walking, waving, typing, sitting, dancing]);
  const { actions } = useAnimations(clips, group);
  const currentMotion = useRef<Motion>('Bored');

  const play = useCallback((next: Motion, blendDuration = 0.65) => {
    if (currentMotion.current === next) return;
    const previousAction = actions[currentMotion.current];
    const nextAction = actions[next]?.reset();
    if (nextAction) {
      nextAction.clampWhenFinished = false;
      nextAction.timeScale = next === 'Walking' ? 0.62 : 1;
    }
    if (next === 'Waving' && nextAction) {
      nextAction.setLoop(THREE.LoopOnce, 1);
      nextAction.clampWhenFinished = true;
    } else {
      nextAction?.setLoop(THREE.LoopRepeat, Infinity);
    }
    nextAction?.play();
    if (previousAction?.isRunning() && nextAction) {
      previousAction.crossFadeTo(nextAction, blendDuration, true);
    } else {
      nextAction?.fadeIn(blendDuration);
    }
    currentMotion.current = next;
  }, [actions]);

  useEffect(() => {
    actions[activity]?.reset().fadeIn(0.6).play();
    currentMotion.current = activity;
    return () => {
      Object.values(actions).forEach((action) => action?.stop());
      window.clearTimeout(timer.current);
    };
  }, [actions]);

  useEffect(() => {
    activityRef.current = activity;
  }, [activity]);

  useEffect(() => {
    if (previousTarget.current.equals(target)) return;
    previousTarget.current.copy(target);
    arrived.current = false;
    window.clearTimeout(timer.current);
    if (reducedMotion && group.current) {
      group.current.position.copy(target);
      play(activityRef.current, 0.8);
      arrived.current = true;
    } else {
      play('Walking', 0.75);
    }
  }, [play, reducedMotion, target]);

  useFrame((_, delta) => {
    if (!group.current || reducedMotion) return;
    if (group.current.position.distanceTo(target) > 0.025) {
      const oldX = group.current.position.x;
      group.current.position.lerp(target, 1 - Math.exp(-delta * 1.05));
      const travelRotation = group.current.position.x >= oldX ? Math.PI / 2 : -Math.PI / 2;
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, travelRotation, 7, delta);
      arrived.current = false;
      return;
    }
    group.current.position.copy(target);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, 0, 5, delta);
    if (!arrived.current) {
      arrived.current = true;
      play('Waving', 0.55);
      timer.current = window.setTimeout(() => play(activityRef.current, 0.85), 1300);
    }
  });

  return <group ref={group} scale={scale} position={initialPosition.current} dispose={null}><primitive object={avatar} /></group>;
}

useGLTF.preload('/models/avatar.glb');
useGLTF.preload('/models/avatar-black.glb');
useGLTF.preload('/models/avatar-blue.glb');
useGLTF.preload('/models/avatar-brown.glb');
