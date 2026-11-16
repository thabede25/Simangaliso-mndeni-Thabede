import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { DeskFocusId } from '../../data/portfolioData';
import {
  createBreadboardTexture,
  createCadSheetTexture,
  createContactShadowTexture,
  createDeskMatTexture,
  createDiaryCoverTexture,
  createLaptopScreenTexture,
  createPhoneScreenTexture,
  createStickyNoteTexture,
  createTabletScreenTexture,
  createTireTreadTexture,
  createVinylRecordTexture,
  createWalnutTexture,
  createWoodTextures,
} from '../../utils/proceduralTextures';
import {
  buildLaptopKeySpecs,
  createCeramicMugGeometry,
  createJumperWireGeometry,
  createLampShadeGeometry,
  createRoundedSlabGeometry,
  createUsbCableGeometry,
} from '../../utils/proceduralGeometries';

interface DeskObjectsProps {
  activeFocus: DeskFocusId;
  onSelectObject: (focus: DeskFocusId) => void;
  onOpenWorkDrawer: () => void;
  fanActive: boolean;
  fanRpm: number;
  truckBedTipped: boolean;
  vinylPlaying: boolean;
  isSoftwareGl: boolean;
}

interface HoverTagProps {
  visible: boolean;
  title: string;
  subtitle: string;
  position: [number, number, number];
}

function HoverTag({ visible, title, subtitle, position }: HoverTagProps) {
  if (!visible) return null;
  return (
    <Html position={position} center distanceFactor={5} zIndexRange={[10, 0]}>
      <div className="pointer-events-none select-none rounded-lg border border-stone-300 bg-[#FAF8F4] px-2.5 py-1.5 shadow-md whitespace-nowrap">
        <div className="text-[11px] font-semibold text-zinc-900 leading-tight">{title}</div>
        <div className="text-[10px] text-amber-700 leading-tight">{subtitle}</div>
      </div>
    </Html>
  );
}

function LaptopKeyboard({ material }: { material: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const keys = useMemo(() => buildLaptopKeySpecs(), []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    keys.forEach((k, i) => {
      pos.set(k.x, 0.005, k.z);
      scl.set(k.w, 0.009, k.d);
      m.compose(pos, quat, scl);
      ref.current!.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [keys]);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, keys.length]}
      material={material}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

export function DeskObjects({
  activeFocus,
  onSelectObject,
  onOpenWorkDrawer,
  fanActive,
  fanRpm,
  truckBedTipped,
  vinylPlaying,
  isSoftwareGl,
}: DeskObjectsProps) {
  const { gl } = useThree();
  const maxAniso = useMemo(
    () => (isSoftwareGl ? 1 : Math.min(8, gl.capabilities.getMaxAnisotropy())),
    [gl, isSoftwareGl]
  );

  const textures = useMemo(() => {
    return {
      wood: createWoodTextures(maxAniso),
      deskMat: createDeskMatTexture(maxAniso),
      walnut: createWalnutTexture(maxAniso),
      vinylDisc: createVinylRecordTexture(maxAniso),
      stickyYellow: createStickyNoteTexture(
        '#fef08a',
        'Sprint Focus',
        ['• Surpac Block Model', '• Arduino NTC Cooling', '• Sasolburg DMC Calc'],
        maxAniso
      ),
      stickyPink: createStickyNoteTexture(
        '#fbcfe8',
        'Hiring?',
        ['Got an engineering', 'project or role?', 'Click to view contact!'],
        maxAniso
      ),
      tireTread: createTireTreadTexture(maxAniso),
      breadboard: createBreadboardTexture(maxAniso),
      cadSheet: createCadSheetTexture(maxAniso),
      laptopScreen: createLaptopScreenTexture(maxAniso),
      tabletScreen: createTabletScreenTexture(maxAniso),
      phoneScreen: createPhoneScreenTexture(maxAniso),
      diaryCover: createDiaryCoverTexture(maxAniso),
      contactShadow: createContactShadowTexture(),
    };
  }, [maxAniso]);

  const geos = useMemo(() => {
    return {
      deskTop: createRoundedSlabGeometry(6.6, 3.3, 0.11, 0.06, 0.012),
      deskMat: createRoundedSlabGeometry(3.6, 1.85, 0.012, 0.05, 0.003),
      turntablePlinth: createRoundedSlabGeometry(0.64, 0.56, 0.072, 0.024, 0.005),
      laptopBase: createRoundedSlabGeometry(1.18, 0.82, 0.028, 0.04, 0.005),
      laptopTrackpad: createRoundedSlabGeometry(0.38, 0.23, 0.004, 0.015, 0.001),
      laptopLid: createRoundedSlabGeometry(1.18, 0.76, 0.018, 0.04, 0.004),
      tabletBody: createRoundedSlabGeometry(0.76, 0.54, 0.018, 0.032, 0.004),
      breadboard: createRoundedSlabGeometry(0.44, 0.28, 0.032, 0.012, 0.003),
      arduinoBoard: createRoundedSlabGeometry(0.3, 0.2, 0.012, 0.008, 0.002),
      phoneBody: createRoundedSlabGeometry(0.31, 0.62, 0.022, 0.042, 0.004),
      diaryCover: createRoundedSlabGeometry(0.58, 0.78, 0.01, 0.018, 0.002),
      diaryPages: createRoundedSlabGeometry(0.55, 0.75, 0.044, 0.01, 0.002),
      mug: createCeramicMugGeometry(),
      lampShade: createLampShadeGeometry(),
      usbCable: createUsbCableGeometry(),
      wireOrange: createJumperWireGeometry([-0.08, 0.028, 0.18], [-0.04, 0.034, 0.02], 0.06),
      wireYellow: createJumperWireGeometry([-0.02, 0.028, 0.18], [0.06, 0.034, -0.02], 0.075),
      wireGreen: createJumperWireGeometry([0.04, 0.028, 0.18], [0.12, 0.048, -0.04], 0.065),
      wireBlue: createJumperWireGeometry([-0.14, 0.034, -0.05], [-0.06, 0.028, 0.18], 0.055),
    };
  }, []);

  const keycapMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1b1b1f',
        roughness: 0.65,
        metalness: 0.08,
      }),
    []
  );

  const woodNormalScale = useMemo(() => new THREE.Vector2(0.46, 0.46), []);

  useEffect(() => {
    return () => {
      textures.wood.map.dispose();
      textures.wood.normalMap.dispose();
      textures.wood.roughnessMap.dispose();
      textures.deskMat.dispose();
      textures.walnut.dispose();
      textures.vinylDisc.dispose();
      textures.stickyYellow.dispose();
      textures.stickyPink.dispose();
      textures.tireTread.dispose();
      textures.breadboard.dispose();
      textures.cadSheet.dispose();
      textures.laptopScreen.dispose();
      textures.tabletScreen.dispose();
      textures.phoneScreen.dispose();
      textures.diaryCover.dispose();
      textures.contactShadow.dispose();
    };
  }, [textures]);

  useEffect(() => {
    return () => {
      Object.values(geos).forEach((g) => g.dispose());
      keycapMaterial.dispose();
    };
  }, [geos, keycapMaterial]);

  const [hovered, setHovered] = useState<DeskFocusId | 'wall-note' | null>(null);
  const fanRotorRef = useRef<THREE.Group>(null);
  const truckBedRef = useRef<THREE.Group>(null);
  const vinylDiscRef = useRef<THREE.Mesh>(null);
  const tonearmRef = useRef<THREE.Group>(null);

  const handleOver = (id: DeskFocusId | 'wall-note') => (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(id);
    document.body.style.cursor = 'pointer';
  };

  const handleOut = () => {
    setHovered(null);
    document.body.style.cursor = 'default';
  };

  useFrame((_, delta) => {
    if (fanRotorRef.current && fanActive && fanRpm > 0) {
      const speedRad = (fanRpm / 2800) * 20;
      fanRotorRef.current.rotation.z -= delta * speedRad;
    }

    if (truckBedRef.current) {
      const targetAngle = truckBedTipped ? -0.58 : 0;
      truckBedRef.current.rotation.x = THREE.MathUtils.damp(
        truckBedRef.current.rotation.x,
        targetAngle,
        7,
        delta
      );
    }

    if (vinylDiscRef.current && vinylPlaying) {
      vinylDiscRef.current.rotation.y -= delta * 2.2;
    }

    if (tonearmRef.current) {
      const targetArmAngle = vinylPlaying ? 0.34 : 0.0;
      tonearmRef.current.rotation.y = THREE.MathUtils.damp(
        tonearmRef.current.rotation.y,
        targetArmAngle,
        6,
        delta
      );
    }
  });

  const showLabels = activeFocus === 'overview';

  return (
    <group>
      {/* Studio Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.82, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#e6e1d7" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* Architectural Studio Back Wall + Subtle Sticky Notes */}
      <group position={[0, 1.4, -1.78]}>
        <mesh receiveShadow>
          <planeGeometry args={[18, 6]} />
          <meshStandardMaterial color="#efece6" roughness={0.95} metalness={0.0} />
        </mesh>
        {/* Pinned Sticky Notes (Right side of studio wall) */}
        <mesh
          position={[2.75, 0.35, 0.01]}
          rotation={[0, 0, 0.06]}
          onPointerOver={handleOver('wall-note')}
          onPointerOut={handleOut}
          onClick={(e) => {
            e.stopPropagation();
            onOpenWorkDrawer();
          }}
        >
          <planeGeometry args={[0.42, 0.42]} />
          <meshStandardMaterial map={textures.stickyYellow} roughness={0.88} />
        </mesh>
        <mesh
          position={[2.9, -0.15, 0.015]}
          rotation={[0, 0, -0.08]}
          onPointerOver={handleOver('wall-note')}
          onPointerOut={handleOut}
          onClick={(e) => {
            e.stopPropagation();
            onOpenWorkDrawer();
          }}
        >
          <planeGeometry args={[0.42, 0.42]} />
          <meshStandardMaterial map={textures.stickyPink} roughness={0.88} />
        </mesh>
      </group>

      {/* Beveled Warm Oak Desk Surface (Top at y = 0) */}
      <group position={[0, 0, 0]}>
        <mesh geometry={geos.deskTop} position={[0, -0.11, 0]} receiveShadow castShadow>
          <meshStandardMaterial
            color="#ffffff"
            map={textures.wood.map}
            normalMap={textures.wood.normalMap}
            normalScale={woodNormalScale}
            roughnessMap={textures.wood.roughnessMap}
            roughness={0.68}
            metalness={0.03}
          />
        </mesh>

        {/* Rear brushed aluminum cable grommet */}
        <mesh position={[0.15, 0.002, -1.32]} receiveShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.008, 24]} />
          <meshStandardMaterial color="#3f3f46" roughness={0.35} metalness={0.8} />
        </mesh>

        {/* Matte powder-coated steel desk legs + crossbars */}
        {[
          [-2.95, -0.46, -1.35],
          [2.95, -0.46, -1.35],
          [-2.95, -0.46, 1.35],
          [2.95, -0.46, 1.35],
        ].map(([lx, ly, lz], i) => (
          <mesh key={i} position={[lx, ly, lz]} castShadow receiveShadow>
            <boxGeometry args={[0.09, 0.72, 0.09]} />
            <meshStandardMaterial color="#27272a" roughness={0.45} metalness={0.72} />
          </mesh>
        ))}

        {/* Stitched Wool-Felt Desk Mat */}
        <mesh geometry={geos.deskMat} position={[-0.05, 0.001, 0.14]} receiveShadow>
          <meshStandardMaterial
            color="#ffffff"
            map={textures.deskMat}
            roughness={0.94}
            metalness={0.0}
          />
        </mesh>

        {/* Braided USB-C Cable linking Laptop to Arduino Uno */}
        <mesh geometry={geos.usbCable} castShadow>
          <meshStandardMaterial color="#3f3f46" roughness={0.62} metalness={0.18} />
        </mesh>
      </group>

      {/* Articulated Architect's Desk Lamp (Back-left corner) */}
      <group position={[-2.92, 0, -1.16]} rotation={[0, 0.42, 0]} scale={0.86}>
        {/* Contact Shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <planeGeometry args={[0.65, 0.65]} />
          <meshBasicMaterial map={textures.contactShadow} transparent opacity={0.45} depthWrite={false} />
        </mesh>
        {/* Heavy weighted base */}
        <mesh position={[0, 0.022, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.21, 0.23, 0.044, 28]} />
          <meshStandardMaterial color="#1f2024" roughness={0.38} metalness={0.75} />
        </mesh>
        {/* Brass swivel collar */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.055, 0.04, 18]} />
          <meshStandardMaterial color="#b45309" roughness={0.28} metalness={0.86} />
        </mesh>
        {/* Lower arm */}
        <mesh position={[0, 0.43, -0.05]} rotation={[0.16, 0, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.02, 0.78, 12]} />
          <meshStandardMaterial color="#b45309" roughness={0.28} metalness={0.85} />
        </mesh>
        {/* Elbow knuckle */}
        <mesh position={[0, 0.81, -0.11]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.032, 0.032, 0.05, 16]} />
          <meshStandardMaterial color="#27272a" roughness={0.35} metalness={0.8} />
        </mesh>
        {/* Upper arm */}
        <mesh position={[0, 0.98, 0.14]} rotation={[-0.58, 0, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.018, 0.6, 12]} />
          <meshStandardMaterial color="#1f2024" roughness={0.4} metalness={0.75} />
        </mesh>
        {/* Spun-metal LatheGeometry lamp shade + warm bulb */}
        <group position={[0, 1.0, 0.4]} rotation={[0.42, 0, 0]}>
          <mesh geometry={geos.lampShade} position={[0, -0.1, 0]} castShadow>
            <meshStandardMaterial color="#222327" roughness={0.36} metalness={0.72} />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <sphereGeometry args={[0.058, 16, 16]} />
            <meshStandardMaterial
              color="#fef3c7"
              emissive="#fbbf24"
              emissiveIntensity={3.2}
              toneMapped={false}
              roughness={0.18}
            />
          </mesh>
        </group>
      </group>

      {/* Ceramic Coffee Mug on Cork Coaster */}
      <group position={[0.55, 0.013, 0.72]} rotation={[0, -0.6, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshBasicMaterial map={textures.contactShadow} transparent opacity={0.4} depthWrite={false} />
        </mesh>
        {/* Cork coaster */}
        <mesh position={[0, 0.005, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.105, 0.108, 0.01, 24]} />
          <meshStandardMaterial color="#b08968" roughness={0.88} />
        </mesh>
        {/* LatheGeometry hollow ceramic mug with clearcoat glaze */}
        <mesh geometry={geos.mug} position={[0, 0.01, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#f5f2eb"
            roughness={0.18}
            metalness={0.02}
            clearcoat={0.7}
            clearcoatRoughness={0.14}
          />
        </mesh>
        {/* Mug handle */}
        <mesh position={[0.078, 0.098, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <torusGeometry args={[0.042, 0.01, 10, 18, Math.PI]} />
          <meshPhysicalMaterial color="#f5f2eb" roughness={0.18} clearcoat={0.7} />
        </mesh>
        {/* Dark coffee surface with subtle glossy sheen */}
        <mesh position={[0, 0.145, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.063, 20]} />
          <meshPhysicalMaterial color="#2a160c" roughness={0.08} clearcoat={0.85} />
        </mesh>
      </group>

      {/* 1. REALISTIC MACBOOK-STYLE LAPTOP (My Projects) */}
      <group
        position={[-1.12, 0.013, -0.34]}
        rotation={[0, 0.16, 0]}
        onPointerOver={handleOver('laptop')}
        onPointerOut={handleOut}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject('laptop');
        }}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <planeGeometry args={[1.45, 1.05]} />
          <meshBasicMaterial map={textures.contactShadow} transparent opacity={0.42} depthWrite={false} />
        </mesh>
        {/* Rounded Anodized Aluminum Unibody Base */}
        <mesh geometry={geos.laptopBase} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial
            color={hovered === 'laptop' ? '#e4e4e7' : '#d2d4d9'}
            roughness={0.24}
            metalness={0.88}
          />
        </mesh>

        {/* Recessed Keyboard Well */}
        <mesh position={[0, 0.027, -0.065]} receiveShadow>
          <boxGeometry args={[1.0, 0.004, 0.34]} />
          <meshStandardMaterial color="#27272a" roughness={0.82} metalness={0.1} />
        </mesh>

        {/* Key-by-Key InstancedMesh Keyboard (64 individual keys) */}
        <group position={[0, 0.028, -0.05]}>
          <LaptopKeyboard material={keycapMaterial} />
        </group>

        {/* Front Lip Thumb Scoop */}
        <mesh position={[0, 0.026, 0.398]} receiveShadow>
          <boxGeometry args={[0.16, 0.005, 0.025]} />
          <meshStandardMaterial color="#71717a" roughness={0.3} metalness={0.85} />
        </mesh>

        {/* Glass Trackpad with subtle recess */}
        <mesh geometry={geos.laptopTrackpad} position={[0, 0.026, 0.245]} receiveShadow>
          <meshPhysicalMaterial color="#b4b7be" roughness={0.16} metalness={0.68} clearcoat={0.45} />
        </mesh>

        {/* Dark Rear Hinge Clutch */}
        <mesh position={[0, 0.032, -0.385]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.88, 16]} />
          <meshStandardMaterial color="#18181b" roughness={0.45} metalness={0.5} />
        </mesh>

        {/* Tilted Beveled Display Lid */}
        <group position={[0, 0.032, -0.395]} rotation={[-0.24, 0, 0]}>
          <mesh
            geometry={geos.laptopLid}
            position={[0, 0.38, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <meshStandardMaterial color="#d2d4d9" roughness={0.22} metalness={0.9} />
          </mesh>
          {/* Glossy Black Bezel */}
          <mesh position={[0, 0.38, 0.017]}>
            <boxGeometry args={[1.13, 0.71, 0.004]} />
            <meshPhysicalMaterial color="#09090b" roughness={0.12} metalness={0.2} clearcoat={0.9} />
          </mesh>
          {/* Webcam Lens */}
          <mesh position={[0, 0.722, 0.02]}>
            <circleGeometry args={[0.008, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Crisp Surpac / Python Screen */}
          <mesh position={[0, 0.382, 0.02]}>
            <planeGeometry args={[1.07, 0.66]} />
            <meshPhysicalMaterial
              map={textures.laptopScreen}
              emissiveMap={textures.laptopScreen}
              emissive="#ffffff"
              emissiveIntensity={0.45}
              roughness={0.28}
              metalness={0.02}
              clearcoat={0.35}
              clearcoatRoughness={0.18}
            />
          </mesh>
        </group>

        <HoverTag
          visible={showLabels && hovered === 'laptop'}
          title="Laptop · My projects"
          subtitle="Click to open 6 projects"
          position={[0, 0.95, -0.15]}
        />
      </group>

      {/* 2. REALISTIC TABLET + ARDUINO UNO + BREADBOARD + 5V COOLING FAN */}
      <group
        position={[0.42, 0.013, -0.54]}
        rotation={[0, -0.08, 0]}
        onPointerOver={handleOver('tablet')}
        onPointerOut={handleOut}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject('tablet');
        }}
      >
        {/* Brushed aluminum A-frame tablet stand */}
        <mesh position={[-0.24, 0.01, 0.02]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.016, 0.28]} />
          <meshStandardMaterial color="#52525b" roughness={0.32} metalness={0.82} />
        </mesh>
        <mesh position={[-0.24, 0.14, -0.07]} rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.14, 0.28, 0.016]} />
          <meshStandardMaterial color="#3f3f46" roughness={0.35} metalness={0.82} />
        </mesh>

        {/* Rounded-Slab Tablet on Stand */}
        <group position={[-0.24, 0.26, -0.02]} rotation={[-0.36, 0, 0]}>
          <mesh
            geometry={geos.tabletBody}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <meshStandardMaterial
              color={hovered === 'tablet' ? '#3f3f46' : '#27272a'}
              roughness={0.28}
              metalness={0.84}
            />
          </mesh>
          <mesh position={[0, 0, 0.019]}>
            <planeGeometry args={[0.72, 0.5]} />
            <meshStandardMaterial color="#09090b" roughness={0.18} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[0.67, 0.455]} />
            <meshStandardMaterial
              map={textures.tabletScreen}
              emissiveMap={textures.tabletScreen}
              emissive="#ffffff"
              emissiveIntensity={0.26}
              roughness={0.54}
              metalness={0.02}
            />
          </mesh>
        </group>

        {/* Arduino Uno R3 + Breadboard + 5V Cooling Rig */}
        <group position={[0.46, 0, 0.1]}>
          {/* Solderless Breadboard with realistic tie-point matrix */}
          <mesh geometry={geos.breadboard} position={[0, 0, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#f5f4ef" roughness={0.65} metalness={0.02} />
          </mesh>
          <mesh position={[0, 0.033, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.41, 0.25]} />
            <meshStandardMaterial map={textures.breadboard} roughness={0.7} />
          </mesh>

          {/* Arduino Uno R3 PCB */}
          <group position={[-0.08, 0, 0.25]}>
            <mesh geometry={geos.arduinoBoard} castShadow receiveShadow>
              <meshStandardMaterial color="#0e7490" roughness={0.42} metalness={0.28} />
            </mesh>
            {/* Silver USB-B Port */}
            <mesh position={[-0.135, 0.026, -0.02]} castShadow>
              <boxGeometry args={[0.055, 0.032, 0.055]} />
              <meshStandardMaterial color="#d4d4d8" roughness={0.2} metalness={0.92} />
            </mesh>
            {/* Black DC Barrel Jack */}
            <mesh position={[-0.13, 0.022, 0.06]} castShadow>
              <boxGeometry args={[0.05, 0.028, 0.04]} />
              <meshStandardMaterial color="#18181b" roughness={0.5} />
            </mesh>
            {/* ATmega328P DIP Chip */}
            <mesh position={[0.04, 0.018, 0.02]} castShadow>
              <boxGeometry args={[0.13, 0.014, 0.038]} />
              <meshStandardMaterial color="#18181b" roughness={0.55} />
            </mesh>
            {/* Female Pin Header Strips */}
            <mesh position={[0.02, 0.02, -0.075]}>
              <boxGeometry args={[0.18, 0.02, 0.018]} />
              <meshStandardMaterial color="#18181b" roughness={0.6} />
            </mesh>
            <mesh position={[0.04, 0.02, 0.078]}>
              <boxGeometry args={[0.15, 0.02, 0.018]} />
              <meshStandardMaterial color="#18181b" roughness={0.6} />
            </mesh>
          </group>

          {/* 5V Blue Relay Module + Screw Terminals */}
          <group position={[0.12, 0.032, -0.03]}>
            <mesh position={[0, 0.022, 0]} castShadow>
              <boxGeometry args={[0.085, 0.044, 0.082]} />
              <meshStandardMaterial color="#0284c7" roughness={0.45} metalness={0.12} />
            </mesh>
            <mesh position={[0.046, 0.018, 0]}>
              <boxGeometry args={[0.025, 0.032, 0.068]} />
              <meshStandardMaterial color="#15803d" roughness={0.55} />
            </mesh>
          </group>

          {/* Relay Status Indicator LED */}
          <mesh position={[0.12, 0.042, 0.065]}>
            <sphereGeometry args={[0.014, 12, 12]} />
            <meshStandardMaterial
              color={fanActive ? '#ef4444' : '#10b981'}
              emissive={fanActive ? '#ef4444' : '#10b981'}
              emissiveIntensity={3.0}
              toneMapped={false}
              roughness={0.18}
            />
          </mesh>

          {/* Glass-Bead NTC Thermistor Probe */}
          <mesh position={[-0.14, 0.056, -0.05]}>
            <cylinderGeometry args={[0.006, 0.006, 0.05, 8]} />
            <meshStandardMaterial color="#18181b" roughness={0.35} metalness={0.3} />
          </mesh>
          <mesh position={[-0.14, 0.082, -0.05]}>
            <sphereGeometry args={[0.01, 10, 10]} />
            <meshStandardMaterial color="#92400e" roughness={0.2} metalness={0.2} />
          </mesh>

          {/* Curved TubeGeometry Jumper Wires */}
          <mesh geometry={geos.wireOrange}>
            <meshStandardMaterial color="#ea580c" roughness={0.45} />
          </mesh>
          <mesh geometry={geos.wireYellow}>
            <meshStandardMaterial color="#eab308" roughness={0.45} />
          </mesh>
          <mesh geometry={geos.wireGreen}>
            <meshStandardMaterial color="#16a34a" roughness={0.45} />
          </mesh>
          <mesh geometry={geos.wireBlue}>
            <meshStandardMaterial color="#2563eb" roughness={0.45} />
          </mesh>

          {/* Detailed 5V Cooling Fan Housing + Grille + Spinning 5-Blade Rotor */}
          <group position={[0.34, 0.15, -0.03]} rotation={[0, -0.25, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.29, 0.29, 0.065]} />
              <meshStandardMaterial color="#18181b" roughness={0.58} metalness={0.18} />
            </mesh>
            {/* Corner mounting screws */}
            {[
              [-0.12, 0.12, 0.034],
              [0.12, 0.12, 0.034],
              [-0.12, -0.12, 0.034],
              [0.12, -0.12, 0.034],
            ].map(([sx, sy, sz], i) => (
              <mesh key={i} position={[sx, sy, sz]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.011, 0.011, 0.008, 10]} />
                <meshStandardMaterial color="#a1a1aa" roughness={0.25} metalness={0.9} />
              </mesh>
            ))}
            {/* Circular Shroud Ring */}
            <mesh position={[0, 0, 0.034]}>
              <ringGeometry args={[0.106, 0.138, 28]} />
              <meshStandardMaterial color="#27272a" roughness={0.48} />
            </mesh>
            {/* Spinning 5-Blade Airfoil Rotor */}
            <group ref={fanRotorRef} position={[0, 0, 0.022]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.034, 0.034, 0.028, 18]} />
                <meshStandardMaterial color="#d97706" roughness={0.32} metalness={0.55} />
              </mesh>
              {[0, 1, 2, 3, 4].map((idx) => (
                <group key={idx} rotation={[0, 0, (idx * Math.PI * 2) / 5]}>
                  <mesh position={[0, 0.064, 0]} rotation={[0.42, 0, 0.16]}>
                    <boxGeometry args={[0.034, 0.076, 0.007]} />
                    <meshStandardMaterial color="#f59e0b" roughness={0.38} metalness={0.22} />
                  </mesh>
                </group>
              ))}
            </group>
          </group>
        </group>

        <HoverTag
          visible={showLabels && hovered === 'tablet'}
          title="Tablet · Hardware & sensors"
          subtitle={fanActive ? `Fan ON · ${fanRpm} RPM` : 'Click to run cooling rig'}
          position={[0.1, 0.65, 0]}
        />
      </group>

      {/* 3. REALISTIC TITANIUM SMARTPHONE (AI Chat) */}
      <group
        position={[1.35, 0.013, 0.66]}
        rotation={[0, -0.32, 0]}
        onPointerOver={handleOver('phone')}
        onPointerOut={handleOut}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject('phone');
        }}
      >
        <mesh geometry={geos.phoneBody} castShadow receiveShadow>
          <meshStandardMaterial
            color={hovered === 'phone' ? '#52525b' : '#27272a'}
            roughness={0.22}
            metalness={0.88}
          />
        </mesh>
        {/* Side buttons */}
        <mesh position={[0.158, 0.012, -0.06]}>
          <boxGeometry args={[0.006, 0.008, 0.065]} />
          <meshStandardMaterial color="#71717a" roughness={0.25} metalness={0.9} />
        </mesh>
        {/* Screen glass */}
        <mesh position={[0, 0.023, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.278, 0.58]} />
          <meshStandardMaterial
            map={textures.phoneScreen}
            emissiveMap={textures.phoneScreen}
            emissive="#ffffff"
            emissiveIntensity={0.24}
            roughness={0.54}
          />
        </mesh>
        {/* Dynamic Island pill */}
        <mesh position={[0, 0.024, -0.255]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.068, 0.016]} />
          <meshStandardMaterial color="#09090b" roughness={0.2} />
        </mesh>
        <HoverTag
          visible={showLabels && hovered === 'phone'}
          title="Phone · AI chat"
          subtitle="Ask Gemini about Simangaliso"
          position={[0, 0.25, 0]}
        />
      </group>

      {/* 4. REALISTIC ARTICULATED YELLOW MINING HAUL TRUCK (Pit Calc) */}
      <group
        position={[2.22, 0, 0.35]}
        rotation={[0, -0.58, 0]}
        onPointerOver={handleOver('truck')}
        onPointerOut={handleOut}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject('truck');
        }}
      >
        {/* Ground contact shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <planeGeometry args={[0.85, 1.1]} />
          <meshBasicMaterial map={textures.contactShadow} transparent opacity={0.5} depthWrite={false} />
        </mesh>

        {/* Heavy steel box-section chassis */}
        <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.085, 0.82]} />
          <meshStandardMaterial color="#18181b" roughness={0.62} metalness={0.5} />
        </mesh>
        {/* Front bumper + radiator grille + headlights */}
        <mesh position={[0, 0.16, 0.42]} castShadow>
          <boxGeometry args={[0.46, 0.13, 0.04]} />
          <meshStandardMaterial color="#27272a" roughness={0.48} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.23, 0.39]} castShadow>
          <boxGeometry args={[0.3, 0.14, 0.06]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.65} />
        </mesh>
        {/* Radiator Grille Chrome Louvers */}
        {[-0.03, 0, 0.03].map((gy, idx) => (
          <mesh key={idx} position={[0, 0.23 + gy, 0.423]}>
            <boxGeometry args={[0.25, 0.012, 0.008]} />
            <meshStandardMaterial color="#a1a1aa" roughness={0.25} metalness={0.85} />
          </mesh>
        ))}
        {/* Dual Headlights */}
        {[-0.16, 0.16].map((hx, i) => (
          <mesh key={i} position={[hx, 0.16, 0.442]}>
            <boxGeometry args={[0.055, 0.032, 0.008]} />
            <meshStandardMaterial
              color="#fef9c3"
              emissive="#fde047"
              emissiveIntensity={2.6}
              toneMapped={false}
              roughness={0.15}
            />
          </mesh>
        ))}

        {/* Asymmetric Operator Cab + Tinted Glass + Amber Beacon */}
        <group position={[0.08, 0.29, 0.23]}>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.24, 0.27]} />
            <meshStandardMaterial
              color={hovered === 'truck' ? '#fbbf24' : '#eab308'}
              roughness={0.32}
              metalness={0.24}
            />
          </mesh>
          {/* Front & side cab windows */}
          <mesh position={[0, 0.025, 0.137]}>
            <planeGeometry args={[0.22, 0.13]} />
            <meshStandardMaterial color="#0f172a" roughness={0.08} metalness={0.85} />
          </mesh>
          <mesh position={[0.142, 0.025, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.18, 0.12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.08} metalness={0.85} />
          </mesh>
          {/* Roof amber safety strobe */}
          <mesh position={[0, 0.14, 0.04]}>
            <cylinderGeometry args={[0.022, 0.025, 0.04, 12]} />
            <meshStandardMaterial
              color="#f97316"
              emissive="#f97316"
              emissiveIntensity={2.4}
              toneMapped={false}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* Left deck safety handrail & diagonal access ladder */}
        <mesh position={[-0.14, 0.28, 0.37]} castShadow>
          <boxGeometry args={[0.16, 0.014, 0.014]} />
          <meshStandardMaterial color="#facc15" roughness={0.35} />
        </mesh>
        <mesh position={[-0.2, 0.23, 0.37]} castShadow>
          <boxGeometry args={[0.014, 0.11, 0.014]} />
          <meshStandardMaterial color="#facc15" roughness={0.35} />
        </mesh>
        {/* Exhaust stack */}
        <mesh position={[-0.14, 0.38, 0.14]} castShadow>
          <cylinderGeometry args={[0.018, 0.02, 0.24, 12]} />
          <meshStandardMaterial color="#71717a" roughness={0.3} metalness={0.88} />
        </mesh>

        {/* Hydraulic Lift Cylinders (visible when bed tips) */}
        {[-0.12, 0.12].map((cx, i) => (
          <mesh key={i} position={[cx, 0.21, -0.02]} rotation={[-0.35, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.022, 0.22, 10]} />
            <meshStandardMaterial color="#e4e4e7" roughness={0.18} metalness={0.94} />
          </mesh>
        ))}

        {/* 4 Heavy Off-Highway Lugged Mining Tires + Yellow Planetary Hubs */}
        {[
          [-0.24, 0.118, 0.25],
          [0.24, 0.118, 0.25],
          [-0.24, 0.118, -0.23],
          [0.24, 0.118, -0.23],
        ].map(([wx, wy, wz], idx) => (
          <group key={idx} position={[wx, wy, wz]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.118, 0.118, 0.095, 24]} />
              <meshStandardMaterial
                color="#ffffff"
                map={textures.tireTread}
                roughness={0.92}
                metalness={0.04}
              />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.062, 0.062, 0.1, 14]} />
              <meshStandardMaterial color="#ca8a04" roughness={0.38} metalness={0.32} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.028, 0.028, 0.108, 12]} />
              <meshStandardMaterial color="#27272a" roughness={0.45} metalness={0.7} />
            </mesh>
          </group>
        ))}

        {/* Pivoting Ribbed Dump Bed + Cab Canopy Guard + Metallic Ore Load */}
        <group ref={truckBedRef} position={[0, 0.18, -0.36]}>
          <group position={[0, 0.12, 0.19]}>
            <mesh position={[0, -0.08, 0]} castShadow>
              <boxGeometry args={[0.48, 0.042, 0.54]} />
              <meshStandardMaterial
                color={hovered === 'truck' ? '#fbbf24' : '#eab308'}
                roughness={0.34}
                metalness={0.25}
              />
            </mesh>
            <mesh position={[-0.22, 0.025, 0]} castShadow>
              <boxGeometry args={[0.042, 0.21, 0.54]} />
              <meshStandardMaterial color="#eab308" roughness={0.34} metalness={0.25} />
            </mesh>
            <mesh position={[0.22, 0.025, 0]} castShadow>
              <boxGeometry args={[0.042, 0.21, 0.54]} />
              <meshStandardMaterial color="#eab308" roughness={0.34} metalness={0.25} />
            </mesh>
            {/* External structural vertical stiffener ribs */}
            {[-0.14, 0, 0.14].map((rz, idx) => (
              <group key={idx}>
                <mesh position={[-0.245, 0.02, rz]} castShadow>
                  <boxGeometry args={[0.018, 0.19, 0.032]} />
                  <meshStandardMaterial color="#ca8a04" roughness={0.38} />
                </mesh>
                <mesh position={[0.245, 0.02, rz]} castShadow>
                  <boxGeometry args={[0.018, 0.19, 0.032]} />
                  <meshStandardMaterial color="#ca8a04" roughness={0.38} />
                </mesh>
              </group>
            ))}
            {/* Front wall + protective canopy overhang */}
            <mesh position={[0, 0.05, 0.27]} castShadow>
              <boxGeometry args={[0.48, 0.24, 0.04]} />
              <meshStandardMaterial color="#ca8a04" roughness={0.36} metalness={0.25} />
            </mesh>
            <mesh position={[0, 0.16, 0.36]} rotation={[0.12, 0, 0]} castShadow>
              <boxGeometry args={[0.48, 0.028, 0.2]} />
              <meshStandardMaterial color="#eab308" roughness={0.34} metalness={0.25} />
            </mesh>
            {/* Faceted Metallic Ore Rocks */}
            {[
              [-0.08, 0.03, 0.04, 0.075],
              [0.07, 0.035, -0.04, 0.088],
              [0, 0.065, 0.06, 0.072],
              [-0.05, 0.02, -0.11, 0.068],
              [0.09, 0.02, 0.11, 0.062],
            ].map(([ox, oy, oz, r], idx) => (
              <mesh key={idx} position={[ox, oy, oz]} rotation={[idx, idx * 0.7, 0]} castShadow>
                <dodecahedronGeometry args={[r, 0]} />
                <meshStandardMaterial color="#44403c" roughness={0.82} metalness={0.35} />
              </mesh>
            ))}
          </group>
        </group>

        <HoverTag
          visible={showLabels && hovered === 'truck'}
          title="Haul Truck · Pit calc"
          subtitle="Cycle-time & cut-off grade"
          position={[0, 0.65, 0]}
        />
      </group>

      {/* 5. REALISTIC HARDCOVER FIELD DIARY + HEXAGONAL BRASS DRAFTING PEN */}
      <group
        position={[-1.54, 0.013, 0.66]}
        rotation={[0, 0.22, 0]}
        onPointerOver={handleOver('diary')}
        onPointerOut={handleOut}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject('diary');
        }}
      >
        {/* Bottom cover */}
        <mesh geometry={geos.diaryCover} position={[0, 0, 0]} receiveShadow>
          <meshStandardMaterial color="#7c3218" roughness={0.74} metalness={0.04} />
        </mesh>
        {/* Cream Page Block */}
        <mesh geometry={geos.diaryPages} position={[0.01, 0.009, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#f5f0e6" roughness={0.86} metalness={0.0} />
        </mesh>
        {/* Top Hardcover with Embossed Label */}
        <mesh
          geometry={geos.diaryCover}
          position={[0, hovered === 'diary' ? 0.062 : 0.052, 0]}
          castShadow
        >
          <meshStandardMaterial
            color="#ffffff"
            map={textures.diaryCover}
            roughness={0.72}
            metalness={0.04}
          />
        </mesh>
        {/* Horizontal Spine Cylinder */}
        <mesh position={[-0.282, 0.032, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.029, 0.029, 0.76, 16]} />
          <meshStandardMaterial color="#7c3218" roughness={0.72} />
        </mesh>
        {/* Elastic closure band */}
        <mesh position={[0.21, 0.032, 0]}>
          <boxGeometry args={[0.028, 0.068, 0.788]} />
          <meshStandardMaterial color="#292524" roughness={0.88} />
        </mesh>
        {/* Woven Ribbon Bookmark Tail */}
        <mesh position={[0.08, 0.002, 0.43]} rotation={[0, -0.18, 0]}>
          <boxGeometry args={[0.024, 0.003, 0.14]} />
          <meshStandardMaterial color="#b45309" roughness={0.85} />
        </mesh>

        {/* Hexagonal Brass Drafting Pen */}
        <group position={[0.37, 0.016, 0.04]} rotation={[Math.PI / 2, 0, 0.12]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
            <meshStandardMaterial color="#d97706" roughness={0.22} metalness={0.9} />
          </mesh>
          {/* Steel pocket clip */}
          <mesh position={[0.016, 0.13, 0]}>
            <boxGeometry args={[0.004, 0.14, 0.008]} />
            <meshStandardMaterial color="#e4e4e7" roughness={0.2} metalness={0.92} />
          </mesh>
          {/* Fine drafting cone tip */}
          <mesh position={[0, -0.275, 0]}>
            <coneGeometry args={[0.014, 0.055, 12]} />
            <meshStandardMaterial color="#27272a" roughness={0.28} metalness={0.85} />
          </mesh>
        </group>

        <HoverTag
          visible={showLabels && hovered === 'diary'}
          title="Open my diary"
          subtitle="Firestore guestbook · anyone can sign"
          position={[0, 0.28, 0]}
        />
      </group>

      {/* 6. WALNUT & BRUSHED ALUMINUM VINYL RECORD PLAYER (Desk Music) */}
      <group
        position={[2.14, 0, -0.96]}
        rotation={[0, -0.38, 0]}
        onPointerOver={handleOver('vinyl')}
        onPointerOut={handleOut}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject('vinyl');
        }}
      >
        {/* Soft Ambient Contact Shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <planeGeometry args={[0.88, 0.8]} />
          <meshBasicMaterial map={textures.contactShadow} transparent opacity={0.5} depthWrite={false} />
        </mesh>

        {/* Walnut Wood Plinth Base */}
        <mesh geometry={geos.turntablePlinth} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial
            color="#ffffff"
            map={textures.walnut}
            roughness={0.54}
            metalness={0.05}
          />
        </mesh>

        {/* Brushed Aluminum Top Deck Plate */}
        <mesh position={[0, 0.072, 0]} receiveShadow>
          <boxGeometry args={[0.57, 0.006, 0.49]} />
          <meshStandardMaterial
            color={hovered === 'vinyl' ? '#d4d4d8' : '#b8bcc4'}
            roughness={0.28}
            metalness={0.82}
          />
        </mesh>

        {/* Aluminum Platter Ring */}
        <mesh position={[-0.045, 0.078, 0]} castShadow>
          <cylinderGeometry args={[0.205, 0.21, 0.012, 36]} />
          <meshStandardMaterial color="#3f3f46" roughness={0.32} metalness={0.78} />
        </mesh>

        {/* Spinning 12-Inch Grooved Vinyl LP */}
        <mesh
          ref={vinylDiscRef}
          position={[-0.045, 0.086, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.198, 0.198, 0.004, 40]} />
          <meshPhysicalMaterial
            color="#ffffff"
            map={textures.vinylDisc}
            roughness={0.24}
            metalness={0.12}
            clearcoat={0.75}
            clearcoatRoughness={0.18}
          />
        </mesh>

        {/* Center Chrome Spindle */}
        <mesh position={[-0.045, 0.094, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.018, 12]} />
          <meshStandardMaterial color="#e4e4e7" roughness={0.15} metalness={0.95} />
        </mesh>

        {/* Articulated Metallic Tonearm & Cartridge Assembly */}
        <group ref={tonearmRef} position={[0.21, 0.084, -0.16]}>
          {/* Gimbal Pedestal */}
          <mesh position={[0, 0.012, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.036, 0.024, 18]} />
            <meshStandardMaterial color="#27272a" roughness={0.35} metalness={0.8} />
          </mesh>
          {/* Rear Counterweight */}
          <mesh position={[0, 0.028, -0.042]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.03, 14]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.22} metalness={0.9} />
          </mesh>
          {/* Arm Tube */}
          <mesh position={[0, 0.028, 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, 0.28, 10]} />
            <meshStandardMaterial color="#e4e4e7" roughness={0.2} metalness={0.92} />
          </mesh>
          {/* Headshell & Stylus Cartridge */}
          <mesh position={[-0.012, 0.024, 0.26]} rotation={[0, 0.22, 0]}>
            <boxGeometry args={[0.022, 0.014, 0.045]} />
            <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.5} />
          </mesh>
        </group>

        {/* Corner Speed Knob & Glowing Power Button */}
        <mesh position={[0.21, 0.078, 0.16]}>
          <cylinderGeometry args={[0.02, 0.022, 0.014, 16]} />
          <meshStandardMaterial color="#27272a" roughness={0.35} metalness={0.75} />
        </mesh>
        <mesh position={[-0.22, 0.078, 0.19]}>
          <cylinderGeometry args={[0.013, 0.013, 0.008, 16]} />
          <meshStandardMaterial
            color={vinylPlaying ? '#3b82f6' : '#64748b'}
            emissive={vinylPlaying ? '#3b82f6' : '#1e293b'}
            emissiveIntensity={vinylPlaying ? 3.0 : 0.3}
            toneMapped={false}
          />
        </mesh>

        <HoverTag
          visible={showLabels && hovered === 'vinyl'}
          title="Vinyl Player · Desk music"
          subtitle={vinylPlaying ? 'Now spinning · Click to open queue' : 'Click to play vinyl music'}
          position={[0, 0.34, 0]}
        />
      </group>

      {/* 7. CAD TECHNICAL DRAWING SHEET + ROLLED BLUEPRINTS + SCALE RULER + PRISM ("See how it's made") */}
      <group
        position={[-2.28, 0, -0.48]}
        rotation={[0, 0.1, 0]}
        onPointerOver={handleOver('blueprint')}
        onPointerOut={handleOut}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject('blueprint');
        }}
      >
        {/* Flat Unrolled Solid Edge / Surpac CAD Engineering Drawing Sheet */}
        <mesh position={[0, 0.003, 0.12]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.08, 0.76]} />
          <meshStandardMaterial
            color="#ffffff"
            map={textures.cadSheet}
            roughness={0.86}
            metalness={0.0}
          />
        </mesh>

        {/* Anodized Aluminum Triangular Engineer's Scale Ruler resting on the CAD Sheet */}
        <mesh position={[0.16, 0.014, 0.41]} rotation={[0, -0.08, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.56, 3]} />
          <meshStandardMaterial color="#d4d4d8" roughness={0.28} metalness={0.86} />
        </mesh>

        {/* Tinted Acrylic Drafting Set-Square Ring */}
        <mesh position={[-0.3, 0.006, 0.32]} rotation={[-Math.PI / 2, 0, 0.35]} castShadow>
          <ringGeometry args={[0.075, 0.12, 3]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            roughness={0.18}
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Rolled Blueprint Cylinders with Copper Band */}
        <group position={[-0.08, 0, -0.35]} rotation={[0, 0.16, 0]}>
          <mesh position={[0, 0.044, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.044, 0.044, 0.66, 18]} />
            <meshStandardMaterial color="#e0f2fe" roughness={0.78} />
          </mesh>
          <mesh position={[0.03, 0.04, 0.105]} rotation={[0, 0.08, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.038, 0.038, 0.62, 18]} />
            <meshStandardMaterial color="#bae6fd" roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.044, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.046, 0.046, 0.04, 18]} />
            <meshStandardMaterial color="#d97706" roughness={0.28} metalness={0.84} />
          </mesh>
        </group>

        {/* Translucent Engineering Architecture Prism */}
        <group position={[-0.45, 0.09, 0.62]}>
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.16, 0.16]} />
            <meshPhysicalMaterial
              color={hovered === 'blueprint' ? '#38bdf8' : '#0284c7'}
              roughness={0.14}
              metalness={0.1}
              transparent
              opacity={0.48}
            />
          </mesh>
          <mesh rotation={[0.4, 0.5, 0]}>
            <octahedronGeometry args={[0.058, 0]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.25} metalness={0.78} />
          </mesh>
        </group>

        <HoverTag
          visible={showLabels && hovered === 'blueprint'}
          title="CAD Drawings & Architecture"
          subtitle="Click to inspect CAD & tech stack"
          position={[0, 0.45, -0.05]}
        />
      </group>
    </group>
  );
}
