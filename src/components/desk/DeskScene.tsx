import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CAMERA_PRESETS, DeskFocusId } from '../../data/portfolioData';
import { DeskObjects } from './DeskObjects';

function detectSoftwareGl(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

function StudioEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.78;

    return () => {
      scene.environment = null;
      envTexture.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, scene]);

  return null;
}

const _desiredPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();
const _hiddenTransparentMeshes: THREE.Object3D[] = [];

function isTransparentMesh(obj: THREE.Object3D): boolean {
  if (!(obj as THREE.Mesh).isMesh || !obj.visible) return false;
  const mat = (obj as THREE.Mesh).material;
  if (Array.isArray(mat)) {
    return mat.some((m) => m && m.transparent);
  }
  return Boolean(mat && mat.transparent);
}

interface CameraAndRenderDriverProps {
  activeFocus: DeskFocusId;
  fanActive: boolean;
  truckBedTipped: boolean;
  vinylPlaying: boolean;
  isSoftwareGl: boolean;
}

function CameraAndRenderDriver({
  activeFocus,
  fanActive,
  truckBedTipped,
  vinylPlaying,
  isSoftwareGl,
}: CameraAndRenderDriverProps) {
  const { camera, gl, invalidate } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const tweeningRef = useRef(true);
  const manualOverrideRef = useRef(false);
  const updatingControlsRef = useRef(false);
  const bedProgressRef = useRef(0);
  const lastFocusRef = useRef<DeskFocusId>(activeFocus);

  useEffect(() => {
    if (lastFocusRef.current !== activeFocus) {
      lastFocusRef.current = activeFocus;
      manualOverrideRef.current = false;
      tweeningRef.current = true;
    }
    invalidate();
  }, [activeFocus, fanActive, truckBedTipped, vinylPlaying, invalidate]);

  // Software-WebGL safe pacing using afterDraw when animating
  useEffect(() => {
    if (!isSoftwareGl) return;
    let timerId = 0;
    let cancelled = false;

    const scheduleNext = () => {
      if (cancelled) return;
      const needsAnim =
        tweeningRef.current || fanActive || vinylPlaying || Math.abs(bedProgressRef.current - (truckBedTipped ? 1 : 0)) > 0.02;
      if (!needsAnim) return;

      const context = gl.getContext() as WebGL2RenderingContext;
      if (context && typeof context.fenceSync === 'function') {
        const sync = context.fenceSync(context.SYNC_GPU_COMMANDS_COMPLETE, 0);
        context.flush();
        const poll = () => {
          if (cancelled) {
            if (sync) context.deleteSync(sync);
            return;
          }
          const state = sync && context.getSyncParameter(sync, context.SYNC_STATUS);
          if (state === context.UNSIGNALED) {
            timerId = window.setTimeout(poll, 8);
          } else {
            if (sync) context.deleteSync(sync);
            timerId = window.setTimeout(() => {
              if (!cancelled) {
                invalidate();
                scheduleNext();
              }
            }, 120);
          }
        };
        timerId = window.setTimeout(poll, 8);
      } else {
        timerId = window.setTimeout(() => {
          if (!cancelled) {
            invalidate();
            scheduleNext();
          }
        }, 120);
      }
    };

    scheduleNext();
    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [isSoftwareGl, activeFocus, fanActive, truckBedTipped, vinylPlaying, gl, invalidate]);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.08);
    const preset = CAMERA_PRESETS[activeFocus];
    _desiredPos.set(...preset.cameraPos);
    _desiredTarget.set(...preset.lookTarget);

    const targetBed = truckBedTipped ? 1 : 0;
    bedProgressRef.current = THREE.MathUtils.damp(bedProgressRef.current, targetBed, 7, clampedDelta);

    if (tweeningRef.current && !manualOverrideRef.current && controlsRef.current) {
      if (isSoftwareGl) {
        camera.position.copy(_desiredPos);
        controlsRef.current.target.copy(_desiredTarget);
        updatingControlsRef.current = true;
        controlsRef.current.update();
        updatingControlsRef.current = false;
        tweeningRef.current = false;
      } else {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredPos.x, 6, clampedDelta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredPos.y, 6, clampedDelta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredPos.z, 6, clampedDelta);

        controlsRef.current.target.x = THREE.MathUtils.damp(
          controlsRef.current.target.x,
          _desiredTarget.x,
          6,
          clampedDelta
        );
        controlsRef.current.target.y = THREE.MathUtils.damp(
          controlsRef.current.target.y,
          _desiredTarget.y,
          6,
          clampedDelta
        );
        controlsRef.current.target.z = THREE.MathUtils.damp(
          controlsRef.current.target.z,
          _desiredTarget.z,
          6,
          clampedDelta
        );

        updatingControlsRef.current = true;
        controlsRef.current.update();
        updatingControlsRef.current = false;

        const posDist = camera.position.distanceTo(_desiredPos);
        const tgtDist = controlsRef.current.target.distanceTo(_desiredTarget);
        if (posDist < 0.015 && tgtDist < 0.015) {
          camera.position.copy(_desiredPos);
          controlsRef.current.target.copy(_desiredTarget);
          updatingControlsRef.current = true;
          controlsRef.current.update();
          updatingControlsRef.current = false;
          tweeningRef.current = false;
        }
      }
    }

    const bedSettling = Math.abs(bedProgressRef.current - targetBed) > 0.01;
    if (!isSoftwareGl && (tweeningRef.current || fanActive || vinylPlaying || bedSettling)) {
      invalidate();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping={!isSoftwareGl}
      dampingFactor={0.07}
      minDistance={1.1}
      maxDistance={8.5}
      minPolarAngle={0.22}
      maxPolarAngle={Math.PI / 2 - 0.06}
      minAzimuthAngle={-Math.PI / 2.2}
      maxAzimuthAngle={Math.PI / 2.2}
      onStart={() => {
        manualOverrideRef.current = true;
        tweeningRef.current = false;
      }}
      onChange={() => {
        if (!updatingControlsRef.current) {
          invalidate();
        }
      }}
    />
  );
}

function DeskPostProcessing() {
  const { gl, scene, camera, size } = useThree();

  const pipeline = useMemo(() => {
    const pixelRatio = gl.getPixelRatio();
    const width = Math.max(1, size.width);
    const height = Math.max(1, size.height);
    const samples = gl.capabilities.isWebGL2
      ? Math.min(4, gl.capabilities.maxSamples || 4)
      : 0;

    const renderTarget = new THREE.WebGLRenderTarget(
      Math.floor(width * pixelRatio),
      Math.floor(height * pixelRatio),
      {
        type: THREE.HalfFloatType,
        samples,
      }
    );

    const composer = new EffectComposer(gl, renderTarget);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(width, height);

    const renderPass = new RenderPass(scene, camera);

    // Screen Space Ambient Occlusion calibrated to desk prop scale for contact shadows
    const ssaoPass = new SSAOPass(
      scene,
      camera,
      Math.floor(width * pixelRatio),
      Math.floor(height * pixelRatio),
      32
    );
    ssaoPass.output = SSAOPass.OUTPUT.Default;
    ssaoPass.kernelRadius = 0.24;
    ssaoPass.minDistance = 0.0002;
    ssaoPass.maxDistance = 0.012;

    // Exclude transparent meshes (contact shadow discs, acrylic turntable cover) from SSAO depth/normal pass
    const origSsaoRender = ssaoPass.render.bind(ssaoPass);
    ssaoPass.render = (renderer, writeBuffer, readBuffer, deltaTime, maskActive) => {
      _hiddenTransparentMeshes.length = 0;
      scene.traverse((obj) => {
        if (isTransparentMesh(obj)) {
          obj.visible = false;
          _hiddenTransparentMeshes.push(obj);
        }
      });
      try {
        origSsaoRender(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
      } finally {
        for (let i = 0; i < _hiddenTransparentMeshes.length; i++) {
          _hiddenTransparentMeshes[i].visible = true;
        }
        _hiddenTransparentMeshes.length = 0;
      }
    };

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.34, // subtle warm physical bloom strength
      0.55, // soft glow spread
      0.92 // high HDR threshold so wood & paper stay crisp while emitters & highlights glow
    );
    const outputPass = new OutputPass();

    composer.addPass(renderPass);
    composer.addPass(ssaoPass);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    return { composer, renderTarget, ssaoPass, bloomPass, outputPass };
  }, [gl, scene, camera]);

  useEffect(() => {
    if (!pipeline) return;
    const pixelRatio = gl.getPixelRatio();
    const width = Math.max(1, size.width);
    const height = Math.max(1, size.height);
    pipeline.composer.setPixelRatio(pixelRatio);
    pipeline.composer.setSize(width, height);
    pipeline.bloomPass.resolution.set(width, height);
  }, [pipeline, gl, size.width, size.height]);

  useEffect(() => {
    if (!pipeline) return;
    return () => {
      pipeline.ssaoPass.dispose();
      pipeline.bloomPass.dispose();
      pipeline.outputPass.dispose();
      pipeline.composer.dispose();
      pipeline.renderTarget.dispose();
    };
  }, [pipeline]);

  useFrame(() => {
    if (pipeline) {
      pipeline.composer.render();
    }
  }, 1);

  return null;
}

interface DeskSceneProps {
  activeFocus: DeskFocusId;
  onSelectObject: (focus: DeskFocusId) => void;
  onOpenWorkDrawer: () => void;
  fanActive: boolean;
  fanRpm: number;
  truckBedTipped: boolean;
  vinylPlaying: boolean;
}

export function DeskScene({
  activeFocus,
  onSelectObject,
  onOpenWorkDrawer,
  fanActive,
  fanRpm,
  truckBedTipped,
  vinylPlaying,
}: DeskSceneProps) {
  const isSoftwareGl = useMemo(() => detectSoftwareGl(), []);

  return (
    <div
      className="relative w-full h-full bg-[#EFECE6]"
      data-testid="desk-canvas-container"
      data-focus={activeFocus}
    >
      <Canvas
        frameloop="demand"
        dpr={isSoftwareGl ? 1 : [1, 2]}
        shadows={!isSoftwareGl ? { type: THREE.PCFSoftShadowMap } : false}
        camera={{
          position: CAMERA_PRESETS.overview.cameraPos,
          fov: 40,
          near: 0.1,
          far: 45,
        }}
        gl={{
          antialias: !isSoftwareGl,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.06,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <color attach="background" args={['#EFECE6']} />
        <fog attach="fog" args={['#EFECE6', 10, 24]} />

        <StudioEnvironment />

        {/* Soft PBR Hemisphere Fill + Warm Key Light + Cool Rim Light */}
        <hemisphereLight args={['#eef4fc', '#b49576', 0.72]} />
        <directionalLight
          position={[3.8, 6.5, 4.6]}
          intensity={1.55}
          color="#fff4e2"
          castShadow={!isSoftwareGl}
          shadow-mapSize={[2048, 2048]}
          shadow-radius={4}
          shadow-camera-near={1}
          shadow-camera-far={16}
          shadow-camera-left={-4.4}
          shadow-camera-right={4.4}
          shadow-camera-top={3.8}
          shadow-camera-bottom={-3.8}
          shadow-bias={-0.0003}
          shadow-normalBias={0.02}
        />
        {/* Cool architectural fill from back-left */}
        <directionalLight position={[-4.4, 3.4, -3.2]} intensity={0.58} color="#dbeafe" />
        {/* Warm desk-lamp localized pool */}
        <pointLight position={[-2.5, 1.02, -0.75]} intensity={1.1} distance={4.8} color="#fde68a" />

        <DeskObjects
          activeFocus={activeFocus}
          onSelectObject={onSelectObject}
          onOpenWorkDrawer={onOpenWorkDrawer}
          fanActive={fanActive}
          fanRpm={fanRpm}
          truckBedTipped={truckBedTipped}
          vinylPlaying={vinylPlaying}
          isSoftwareGl={isSoftwareGl}
        />

        <CameraAndRenderDriver
          activeFocus={activeFocus}
          fanActive={fanActive}
          truckBedTipped={truckBedTipped}
          vinylPlaying={vinylPlaying}
          isSoftwareGl={isSoftwareGl}
        />

        {!isSoftwareGl && <DeskPostProcessing />}
      </Canvas>
    </div>
  );
}
