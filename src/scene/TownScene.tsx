import type { JSX } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { FirstPersonControls, OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { useWorldStore } from '../store/worldStore';
import type { WorldObject } from '../types/world';
import { postInteraction } from '../utils/api';
import { loadModel } from './ModelCache';

function DayNightLighting(): JSX.Element {
  const isNight = useWorldStore((state) => state.isNight);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);

  useFrame((_, delta) => {
    const directional = dirRef.current;
    const hemisphere = hemiRef.current;
    if (!directional || !hemisphere) return;
    const target = isNight ? 0.2 : 1.2;
    directional.intensity = THREE.MathUtils.damp(directional.intensity, target, 4, delta);
    hemisphere.intensity = THREE.MathUtils.damp(hemisphere.intensity, isNight ? 0.05 : 0.5, 4, delta);
  });

  return (
    <>
      <ambientLight intensity={0.25} />
      <hemisphereLight ref={hemiRef} args={['#dbeafe', '#111827', 0.5]} />
      <directionalLight ref={dirRef} position={[30, 60, 30]} castShadow intensity={1.2} />
    </>
  );
}

function CameraControls(): JSX.Element {
  const controlMode = useWorldStore((state) => state.controlMode);
  return controlMode === 'orbit' ? (
    <OrbitControls enableDamping minDistance={20} maxDistance={220} maxPolarAngle={Math.PI / 2.1} />
  ) : (
    <FirstPersonControls lookSpeed={0.06} movementSpeed={18} lookVertical />
  );
}

function InstancedTrees({ trees }: { trees: WorldObject[] }): JSX.Element {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    const helper = new THREE.Object3D();
    trees.forEach((tree, idx) => {
      helper.position.set(tree.position[0], tree.position[1], tree.position[2]);
      helper.scale.set(1.8, 3.6, 1.8);
      helper.rotation.y = tree.rotation[1];
      helper.updateMatrix();
      meshRef.current!.setMatrixAt(idx, helper.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [trees]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow frustumCulled>
      <coneGeometry args={[0.7, 2.2, 6]} />
      <meshStandardMaterial color="#15803d" />
    </instancedMesh>
  );
}

function ClickHandler(): null {
  const { camera, scene, gl } = useThree();
  const setSelectedObjectId = useWorldStore((state) => state.setSelectedObjectId);

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const target = intersects.find((entry) => entry.object.userData.objectId);
      const objectId = target?.object.userData.objectId as string | undefined;
      setSelectedObjectId(objectId);
      if (objectId) {
        void postInteraction(objectId, 'select');
      }
    };

    gl.domElement.addEventListener('click', onClick);
    return () => gl.domElement.removeEventListener('click', onClick);
  }, [camera, gl.domElement, scene.children, setSelectedObjectId]);

  return null;
}

function CarAnimator({ objects }: { objects: WorldObject[] }): JSX.Element {
  const carRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    carRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const radius = 24 + idx * 4;
      mesh.position.x = Math.cos(t * 0.15 + idx) * radius;
      mesh.position.z = Math.sin(t * 0.15 + idx) * radius;
      mesh.rotation.y = -t * 0.15 + idx;
    });
  });

  return (
    <>
      {objects.map((vehicle, idx) => (
        <mesh
          key={vehicle.id}
          ref={(el) => {
            carRefs.current[idx] = el;
          }}
          position={vehicle.position}
          castShadow
          userData={{ objectId: vehicle.id }}
        >
          <boxGeometry args={[2.3, 1.4, 4.2]} />
          <meshStandardMaterial color="#2563eb" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
    </>
  );
}

function AssetModel({ object }: { object: WorldObject }): JSX.Element | null {
  const [model, setModel] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!object.modelUrl) {
      setModel(null);
      return;
    }

    loadModel(object.modelUrl)
      .then((scene) => {
        if (!mounted) return;
        const clone = scene.clone(true);
        clone.traverse((child) => {
          if ('castShadow' in child) {
            child.castShadow = true;
          }
          if ('receiveShadow' in child) {
            child.receiveShadow = true;
          }
          child.userData = { ...child.userData, objectId: object.id };
        });
        setModel(clone);
      })
      .catch(() => {
        if (!mounted) return;
        setModel(null);
      });

    return () => {
      mounted = false;
    };
  }, [object.id, object.modelUrl]);

  if (model) {
    return (
      <primitive
        object={model}
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
        userData={{ objectId: object.id }}
      />
    );
  }

  return (
    <mesh position={object.position} rotation={object.rotation} scale={object.scale} castShadow userData={{ objectId: object.id }}>
      <boxGeometry args={[3, 3, 3]} />
      <meshStandardMaterial color="#f59e0b" />
    </mesh>
  );
}

function TownMeshes(): JSX.Element {
  const objects = useWorldStore((state) => state.objects);
  const selectedObjectId = useWorldStore((state) => state.selectedObjectId);
  const isNight = useWorldStore((state) => state.isNight);

  const roads = useMemo(() => objects.filter((o) => o.type === 'road'), [objects]);
  const buildings = useMemo(() => objects.filter((o) => o.type === 'building'), [objects]);
  const trees = useMemo(() => objects.filter((o) => o.type === 'tree'), [objects]);
  const vehicles = useMemo(() => objects.filter((o) => o.type === 'vehicle'), [objects]);
  const assets = useMemo(() => objects.filter((o) => o.type === 'asset' || Boolean(o.modelUrl)), [objects]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[320, 320]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {roads.map((road) => (
        <mesh key={road.id} position={road.position} rotation={road.rotation} scale={road.scale} userData={{ objectId: road.id }}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ))}

      {buildings.map((building) => (
        <mesh
          key={building.id}
          position={building.position}
          rotation={building.rotation}
          scale={building.scale}
          castShadow
          userData={{ objectId: building.id }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={selectedObjectId === building.id ? '#eab308' : '#94a3b8'}
            emissive={isNight ? '#1e293b' : '#000000'}
          />
        </mesh>
      ))}

      <InstancedTrees trees={trees} />
      <CarAnimator objects={vehicles} />
      {assets.map((asset) => (
        <AssetModel key={asset.id} object={asset} />
      ))}

      {buildings.slice(0, 12).map((building, index) => (
        <pointLight
          key={`street-light-${building.id}`}
          position={[building.position[0], 6, building.position[2] + 8]}
          intensity={isNight ? 0.7 : 0.02}
          distance={22}
          color={index % 2 ? '#fde68a' : '#bfdbfe'}
        />
      ))}
    </group>
  );
}

export function TownScene(): JSX.Element {
  const isNight = useWorldStore((state) => state.isNight);

  return (
    <Canvas
      camera={{ position: [65, 60, 65], fov: 55 }}
      shadows
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }}
    >
      <fog attach="fog" args={[isNight ? '#020617' : '#cbd5e1', 50, 260]} />
      <color attach="background" args={[isNight ? '#020617' : '#93c5fd']} />
      <Sky distance={450000} sunPosition={isNight ? [0, -1, 0] : [1, 0.3, 0.2]} inclination={0} azimuth={0.25} />
      <DayNightLighting />
      <TownMeshes />
      <CameraControls />
      <ClickHandler />
    </Canvas>
  );
}
