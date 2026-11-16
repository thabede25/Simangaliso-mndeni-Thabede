import { Component, ReactNode, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
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

class PostProcessingErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(err: unknown) {
    console.warn('Post-processing disabled due to WebGL pass error:', err);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

class DeskCanvasErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(err: unknown) {
    console.error('3D Desk Canvas failed to initialize:', err);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#EFECE6] p-8 text-center text-zinc-700">
          <div className="max-w-md rounded-2xl border border-stone-300 bg-[#FAF8F4] p-6 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900">
              3D WebGL view unavailable on this browser context
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Use the bottom navigation bar to open Projects, Cooling Rig, AI Chat, Haul Truck, Diary, Vinyl Player, or Architecture directly.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
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

/**
 * Patches Three.js SSAOShader to prevent normalize(vec3(0.0)) -> NaN whiteout
 * when random noise matches viewNormal or normals are near-zero, and gently
 * clamps contact occlusion to avoid harsh black patches.
 */
function hardenSsaoShader(ssaoPass: SSAOPass) {
  const mat = ssaoPass.ssaoMaterial;
  mat.fragmentShader = mat.fragmentShader
    .replace(
      /vec3 random = vec3\( texture2D\( tNoise, vUv \* noiseScale \)\.r \);\s*\/\/ compute matrix used to reorient a kernel vector\s*vec3 tangent = normalize\( random - viewNormal \* dot\( random, viewNormal \) \);\s*vec3 bitangent = cross\( viewNormal, tangent \);\s*mat3 kernelMatrix = mat3\( tangent, bitangent, viewNormal \);/,
      `float rNoise = texture2D( tNoise, vUv * noiseScale ).r;
       vec3 random = vec3(
         rNoise,
         fract( rNoise * 17.31 + 0.37 ) * 2.0 - 1.0,
         fract( rNoise * 43.17 + 0.71 ) * 2.0 - 1.0
       );
       float normLen = length( viewNormal );
       vec3 safeNormal = normLen > 1e-4 ? ( viewNormal / normLen ) : vec3( 0.0, 0.0, 1.0 );
       vec3 tangentRaw = random - safeNormal * dot( random, safeNormal );
       if ( dot( tangentRaw, tangentRaw ) < 1e-5 ) {
         vec3 fallbackAxis = abs( safeNormal.x ) < 0.9 ? vec3( 1.0, 0.0, 0.0 ) : vec3( 0.0, 1.0, 0.0 );
         tangentRaw = cross( safeNormal, fallbackAxis );
       }
       vec3 tangent = normalize( tangentRaw );
       vec3 bitangent = cross( safeNormal, tangent );
       mat3 kernelMatrix = mat3( tangent, bitangent, safeNormal );`
    )
    .replace(
      'gl_FragColor = vec4( vec3( 1.0 - occlusion ), 1.0 );',
      'gl_FragColor = vec4( vec3( clamp( 1.0 - occlusion * 0.62, 0.36, 1.0 ) ), 1.0 );'
    );
  mat.needsUpdate = true;
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
        tweeningRef.current ||
        fanActive ||
        vinylPlaying ||
        Math.abs(bedProgressRef.current - (truckBedTipped ? 1 : 0)) > 0.02;
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

function DeskPostProcessing({ isSoftwareGl }: { isSoftwareGl: boolean }) {
  const { gl, scene, camera, size } = useThree();

  const pipeline = useMemo(() => {
    const pixelRatio = gl.getPixelRatio();
    const width = Math.max(1, size.width);
    const height = Math.max(1, size.height);

    // Non-MSAA HalfFloatTarget prevents WebGL2 MSAA resolve/blending conflicts with SSAOPass + UnrealBloomPass;
    // crisp edge antialiasing is handled cleanly at the end by FXAAPass after OutputPass.
    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
      samples: 0,
    });

    const composer = new EffectComposer(gl, renderTarget);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(width, height);

    const renderPass = new RenderPass(scene, camera);

    const effWidth = Math.max(1, Math.floor(width * pixelRatio));
    const effHeight = Math.max(1, Math.floor(height * pixelRatio));

    // Screen Space Ambient Occlusion calibrated to desk prop scale for contact shadows
    const ssaoPass = new SSAOPass(
      scene,
      camera,
      effWidth,
      effHeight,
      isSoftwareGl ? 8 : 32
    );
    ssaoPass.output = SSAOPass.OUTPUT.Default;
    ssaoPass.kernelRadius = 0.22;
    ssaoPass.minDistance = 0.0002;
    ssaoPass.maxDistance = 0.014;
    hardenSsaoShader(ssaoPass);

    // Exclude transparent meshes (contact shadow discs, acrylic set-square) from SSAO depth/normal pass
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

    // High HDR threshold (> 2.0) guarantees studio wall, oak desk, CAD sheet, and screens
    // stay 100% crisp with zero whiteout haze, while toneMapped=false emitters glow softly.
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(effWidth, effHeight),
      0.16,
      0.38,
      2.05
    );

    const outputPass = new OutputPass();

    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms['resolution'].value.set(1 / effWidth, 1 / effHeight);

    composer.addPass(renderPass);
    composer.addPass(ssaoPass);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);
    composer.addPass(fxaaPass);

    return { composer, renderTarget, ssaoPass, bloomPass, outputPass, fxaaPass };
  }, [gl, scene, camera]);

  useEffect(() => {
    if (!pipeline) return;
    const pixelRatio = gl.getPixelRatio();
    const width = Math.max(1, size.width);
    const height = Math.max(1, size.height);
    const effWidth = Math.max(1, Math.floor(width * pixelRatio));
    const effHeight = Math.max(1, Math.floor(height * pixelRatio));

    pipeline.composer.setPixelRatio(pixelRatio);
    pipeline.composer.setSize(width, height);
    pipeline.bloomPass.resolution.set(effWidth, effHeight);
    pipeline.fxaaPass.material.uniforms['resolution'].value.set(1 / effWidth, 1 / effHeight);
  }, [pipeline, gl, size.width, size.height]);

  useEffect(() => {
    if (!pipeline) return;
    return () => {
      pipeline.ssaoPass.dispose();
      pipeline.ssaoPass.ssaoMaterial.dispose();
      pipeline.bloomPass.dispose();
      pipeline.outputPass.dispose();
      pipeline.fxaaPass.dispose();
      pipeline.composer.dispose();
      pipeline.renderTarget.dispose();
    };
  }, [pipeline]);

  useFrame(() => {
    if (pipeline && !gl.getContext().isContextLost()) {
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
  const enablePostProcessing = useMemo(() => {
    if (!isSoftwareGl) return true;
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).has('verifyPost');
    }
    return false;
  }, [isSoftwareGl]);

  return (
    <div
      className="relative w-full h-full bg-[#EFECE6]"
      data-testid="desk-canvas-container"
      data-focus={activeFocus}
    >
      <DeskCanvasErrorBoundary>
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
            antialias: !enablePostProcessing && !isSoftwareGl,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.04,
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

          {enablePostProcessing && (
            <PostProcessingErrorBoundary>
              <DeskPostProcessing isSoftwareGl={isSoftwareGl} />
            </PostProcessingErrorBoundary>
          )}
        </Canvas>
      </DeskCanvasErrorBoundary>
    </div>
  );
}
