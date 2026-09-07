"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import * as THREE from "three";

import {
  Canvas,
  useThree,
} from "@react-three/fiber";

import {
  Environment,
  OrbitControls,
} from "@react-three/drei";

import {
  Physics,
} from "@react-three/rapier";

import {
  Moon,
  Sun,
  Wrench,
  Play,
  X,
  Gamepad2,
  Keyboard,
  MousePointer2,
  PanelRight,
  Footprints,
} from "lucide-react";

import RoomWorld from "./RoomWorld";
import RoomPlayer from "./RoomPlayer";

import {
  MonitorInteraction,
  WindowsXPDesktop,
} from "./MonitorExperience";

import {
  Dev3DTools,
  DevPanel,
  DevPointLight,
  DevSpotLight,
} from "./DevEditor";

/* ======================================================
   TYPES
====================================================== */

type RoomInfo = {
  spawn: [
    number,
    number,
    number
  ];

  lookAt: [
    number,
    number,
    number
  ];

  offset?: [
    number,
    number,
    number
  ];

  bounds?: {
    min: [
      number,
      number,
      number
    ];

    max: [
      number,
      number,
      number
    ];
  };
};

type TransformSnapshot = {
  position:
    THREE.Vector3;

  quaternion:
    THREE.Quaternion;

  scale:
    THREE.Vector3;
};

type HistoryAction = {
  object:
    THREE.Object3D;

  before:
    TransformSnapshot;
};

/* ======================================================
   TRANSFORM HELPERS
====================================================== */

function captureTransform(
  object:
    THREE.Object3D
): TransformSnapshot {
  return {
    position:
      object.position.clone(),

    quaternion:
      object.quaternion.clone(),

    scale:
      object.scale.clone(),
  };
}

function restoreTransform(
  object:
    THREE.Object3D,

  transform:
    TransformSnapshot
) {
  object.position.copy(
    transform.position
  );

  object.quaternion.copy(
    transform.quaternion
  );

  object.scale.copy(
    transform.scale
  );

  object.updateMatrix();

  object.updateMatrixWorld(
    true
  );
}

function transformChanged(
  object:
    THREE.Object3D,

  before:
    TransformSnapshot
) {
  return (
    !object.position.equals(
      before.position
    ) ||
    !object.quaternion.equals(
      before.quaternion
    ) ||
    !object.scale.equals(
      before.scale
    )
  );
}

/* ======================================================
   RENDER SETTINGS
====================================================== */

function RenderSettings({
  lightingMode,
}: {
  lightingMode:
    | "day"
    | "night";
}) {
  const {
    gl,
  } = useThree();

  useEffect(() => {
    gl.toneMapping =
      THREE.ACESFilmicToneMapping;

    gl.outputColorSpace =
      THREE.SRGBColorSpace;

    gl.toneMappingExposure =
      lightingMode ===
      "night"
        ? 0.65
        : 1.05;
  }, [
    gl,
    lightingMode,
  ]);

  return null;
}

/* ======================================================
   MAIN SCENE
====================================================== */

export default function Scene() {
  /* ====================================================
     ROOM
  ==================================================== */

  const [
    roomInfo,
    setRoomInfo,
  ] =
    useState<
      RoomInfo | null
    >(null);

  /* ====================================================
     EXPERIENCE
  ==================================================== */

  const [
    entered,
    setEntered,
  ] =
    useState(false);

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);

  /* ====================================================
     MONITOR EXPERIENCE
  ==================================================== */

  const [
    monitorHovered,
    setMonitorHovered,
  ] =
    useState(false);

  const [
    monitorMode,
    setMonitorMode,
  ] =
    useState(false);

  /* ====================================================
     LIGHTING
  ==================================================== */

  const [
    lightingMode,
    setLightingMode,
  ] =
    useState<
      "day" |
      "night"
    >("night");

  const isNight =
    lightingMode ===
    "night";

  /* ====================================================
     DEV MODE
  ==================================================== */

  const [
    dev,
    setDev,
  ] =
    useState(false);

  const [
    selected,
    setSelected,
  ] =
    useState<
      THREE.Object3D |
      null
    >(null);

  const [
    mode,
    setMode,
  ] =
    useState<
      | "translate"
      | "rotate"
      | "scale"
    >("translate");

  const [
    space,
    setSpace,
  ] =
    useState<
      | "world"
      | "local"
    >("world");

  const [
    revision,
    setRevision,
  ] =
    useState(0);

  /* ====================================================
     POINTER LOCK
  ==================================================== */

  const pointerControlsRef =
    useRef<any>(
      null
    );

  /* ====================================================
     HISTORY
  ==================================================== */

  const historyRef =
    useRef<
      HistoryAction[]
    >([]);

  const transformStartRef =
    useRef<
      HistoryAction |
      null
    >(null);

  const [
    historySize,
    setHistorySize,
  ] =
    useState(0);

  /* ====================================================
     POINTER HELPERS
  ==================================================== */

  const lockPointer =
    useCallback(() => {
      pointerControlsRef
        .current
        ?.lock?.();
    }, []);

  const unlockPointer =
    useCallback(() => {
      pointerControlsRef
        .current
        ?.unlock?.();
    }, []);

  /* ====================================================
     UNDO
  ==================================================== */

  const undo =
    useCallback(() => {
      const history =
        historyRef.current;

      if (
        history.length ===
        0
      ) {
        return;
      }

      const action =
        history.pop();

      if (
        !action
      ) {
        return;
      }

      restoreTransform(
        action.object,
        action.before
      );

      setSelected(
        action.object
      );

      setHistorySize(
        history.length
      );

      setRevision(
        (
          value
        ) =>
          value + 1
      );
    }, []);

  /* ====================================================
     DEV TRANSFORMS
  ==================================================== */

  const handleTransformStart =
    useCallback(() => {
      if (
        !selected
      ) {
        return;
      }

      transformStartRef.current =
        {
          object:
            selected,

          before:
            captureTransform(
              selected
            ),
        };
    }, [
      selected,
    ]);

  const handleTransformChange =
    useCallback(() => {
      setRevision(
        (
          value
        ) =>
          value + 1
      );
    }, []);

  const handleTransformEnd =
    useCallback(() => {
      const operation =
        transformStartRef.current;

      if (
        !operation
      ) {
        return;
      }

      if (
        transformChanged(
          operation.object,
          operation.before
        )
      ) {
        historyRef.current.push({
          object:
            operation.object,

          before:
            operation.before,
        });

        setHistorySize(
          historyRef
            .current
            .length
        );
      }

      transformStartRef.current =
        null;

      setRevision(
        (
          value
        ) =>
          value + 1
      );
    }, []);

  /* ====================================================
     ENTER ROOM
  ==================================================== */

  function enterRoom() {
    setEntered(
      true
    );

    setMenuOpen(
      false
    );

    setDev(
      false
    );

    requestAnimationFrame(
      () => {
        lockPointer();
      }
    );
  }

  /* ====================================================
     OPEN COMPUTER
  ==================================================== */

  const openMonitor =
    useCallback(() => {
      unlockPointer();

      setMonitorHovered(
        false
      );

      setMenuOpen(
        false
      );

      setSelected(
        null
      );

      setMonitorMode(
        true
      );
    }, [
      unlockPointer,
    ]);

  /* ====================================================
     EXIT COMPUTER
  ==================================================== */

  const closeMonitor =
    useCallback(() => {
      setMonitorMode(
        false
      );

      setMonitorHovered(
        false
      );

      /*
       * Click on "Back to room" is a user gesture,
       * so pointer lock can normally resume.
       */

      requestAnimationFrame(
        () => {
          lockPointer();
        }
      );
    }, [
      lockPointer,
    ]);

  /* ====================================================
     MENU
  ==================================================== */

  const toggleMenu =
    useCallback(() => {
      if (
        !entered ||
        monitorMode
      ) {
        return;
      }

      setMenuOpen(
        (
          current
        ) => {
          const next =
            !current;

          if (
            next
          ) {
            unlockPointer();
          } else if (
            !dev
          ) {
            requestAnimationFrame(
              () => {
                lockPointer();
              }
            );
          }

          return next;
        }
      );
    }, [
      entered,
      monitorMode,
      dev,
      unlockPointer,
      lockPointer,
    ]);

  /* ====================================================
     RESUME ROOM
  ==================================================== */

  function resumeRoom() {
    setDev(
      false
    );

    setSelected(
      null
    );

    setMenuOpen(
      false
    );

    requestAnimationFrame(
      () => {
        lockPointer();
      }
    );
  }

  /* ====================================================
     DEV MODE
  ==================================================== */

  function toggleDeveloper() {
    if (
      !dev
    ) {
      unlockPointer();

      setSelected(
        null
      );

      setDev(
        true
      );

      setMenuOpen(
        false
      );

      return;
    }

    setSelected(
      null
    );

    setDev(
      false
    );

    setMenuOpen(
      false
    );

    requestAnimationFrame(
      () => {
        lockPointer();
      }
    );
  }

  /* ====================================================
     DAY / NIGHT
  ==================================================== */

  function toggleLighting() {
    setLightingMode(
      (
        current
      ) =>
        current ===
        "night"
          ? "day"
          : "night"
    );
  }

  /* ====================================================
     KEYBOARD
  ==================================================== */

  useEffect(() => {
    function handleKeyDown(
      event:
        KeyboardEvent
    ) {
      const target =
        event.target as
          HTMLElement |
          null;

      const tag =
        target
          ?.tagName
          ?.toLowerCase();

      const typing =
        tag ===
          "input" ||
        tag ===
          "textarea" ||
        tag ===
          "select" ||
        target
          ?.isContentEditable;

      if (
        typing
      ) {
        return;
      }

      /* -----------------------------------------------
         COMPUTER MODE
      ------------------------------------------------ */

      if (
        monitorMode
      ) {
        /*
         * WindowsXPDesktop itself handles Escape.
         */

        return;
      }

      const key =
        event.key
          .toLowerCase();

      /* -----------------------------------------------
         P
      ------------------------------------------------ */

      if (
        key ===
        "p"
      ) {
        event.preventDefault();

        toggleMenu();

        return;
      }

      /* -----------------------------------------------
         UNDO
      ------------------------------------------------ */

      if (
        (
          event.ctrlKey ||
          event.metaKey
        ) &&
        key ===
        "z"
      ) {
        event.preventDefault();

        undo();

        return;
      }

      if (
        !dev
      ) {
        return;
      }

      /* -----------------------------------------------
         DEV
      ------------------------------------------------ */

      if (
        key ===
        "g"
      ) {
        setMode(
          "translate"
        );

        return;
      }

      if (
        key ===
        "r"
      ) {
        setMode(
          "rotate"
        );

        return;
      }

      if (
        key ===
        "s"
      ) {
        setMode(
          "scale"
        );

        return;
      }

      if (
        event.key ===
        "Escape"
      ) {
        setSelected(
          null
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    dev,
    monitorMode,
    toggleMenu,
    undo,
  ]);

  /* ====================================================
     ROOM DEV SELECTION
  ==================================================== */

  function handleRoomPointerDown(
    event:
      any
  ) {
    if (
      !dev
    ) {
      return;
    }

    event.stopPropagation();

    setSelected(
      event.object
    );
  }

  /* ====================================================
     ROOM READY
  ==================================================== */

  const handleRoomReady =
    useCallback(
      (
        data:
          RoomInfo
      ) => {
        setRoomInfo(
          data
        );
      },
      []
    );

  /* ====================================================
     EXPLORE MODE
  ==================================================== */

  const exploreMode =
    entered &&
    !menuOpen &&
    !dev &&
    !monitorMode;

  /* ====================================================
     RENDER
  ==================================================== */

  return (
    <div
      className={`
        relative
        h-screen
        w-full
        overflow-hidden

        ${
          isNight
            ? "bg-[#020204]"
            : "bg-[#d9e1e7]"
        }
      `}
    >
      {/* =================================================
          THREE WORLD
      ================================================= */}

      <Canvas
        shadows

        dpr={[
          1,
          2,
        ]}

        camera={{
          position: [
            0,
            1.6,
            3,
          ],

          fov:
            65,

          near:
            0.05,

          far:
            500,
        }}

        gl={{
          antialias:
            true,

          powerPreference:
            "high-performance",
        }}

        onPointerMissed={() => {
          if (
            dev
          ) {
            setSelected(
              null
            );
          }
        }}
      >
        {/* =============================================
            RENDER SETTINGS
        ============================================= */}

        <RenderSettings
          lightingMode={
            lightingMode
          }
        />

        {/* =============================================
            BACKGROUND
        ============================================= */}

        <color
          attach="background"

          args={[
            isNight
              ? "#020204"
              : "#cbd6df",
          ]}
        />

        {/* =============================================
            DAY
        ============================================= */}

        {!isNight && (
          <>
            <ambientLight
              intensity={
                0.15
              }
            />

            <directionalLight
              position={[
                10,
                15,
                10,
              ]}
              intensity={
                2
              }
              castShadow
              shadow-mapSize-width={
                2048
              }
              shadow-mapSize-height={
                2048
              }
            />
          </>
        )}

        {/* =============================================
            NIGHT
        ============================================= */}

        {isNight && (
          <>
            <ambientLight
              intensity={
                0.015
              }
            />

            <directionalLight
              position={[
                -8,
                10,
                6,
              ]}
              intensity={
                0.18
              }
              color="#8fa8d8"
              castShadow
            />
          </>
        )}

        {/* =============================================
            ENVIRONMENT
        ============================================= */}

        <Suspense
          fallback={
            null
          }
        >
          <Environment
            preset={
              isNight
                ? "night"
                : "apartment"
            }

            environmentIntensity={
              isNight
                ? 0.08
                : 0.8
            }
          />
        </Suspense>

        {/* =============================================
            PHYSICS / ROOM / PLAYER
        ============================================= */}

        <Suspense
          fallback={
            null
          }
        >
          <Physics
            gravity={[
              0,
              -9.81,
              0,
            ]}
          >
            <RoomWorld
              onReady={
                handleRoomReady
              }

              onPointerDown={
                handleRoomPointerDown
              }
            />

            {roomInfo && (
              <RoomPlayer
                controlsRef={
                  pointerControlsRef
                }

                movementEnabled={
                  exploreMode
                }

                cameraOwned={
                  !dev
                }

                spawn={
                  roomInfo.spawn
                }

                lookAt={
                  roomInfo.lookAt
                }

                speed={
                  2.5
                }
              />
            )}
          </Physics>
        </Suspense>

        {/* =============================================
            MONITOR INTERACTION

            Finds nodes.monitor automatically.
        ============================================= */}

        <MonitorInteraction
          enabled={
            exploreMode
          }

          maxDistance={
            3.3
          }

          onHoverChange={
            setMonitorHovered
          }

          onOpen={
            openMonitor
          }
        />

        {/* =============================================
            DESK LIGHT
        ============================================= */}

        <DevPointLight
          name="Desk Light"

          position={[
            0,
            3.5,
            0,
          ]}

          intensity={
            isNight
              ? 6
              : 1
          }

          color={
            isNight
              ? "#ffd4a3"
              : "#ffffff"
          }

          dev={
            dev
          }

          onSelect={
            setSelected
          }
        />

        {/* =============================================
            PAINTING LIGHT 1
        ============================================= */}

        <DevSpotLight
          name="Painting Light 1"

          position={[
            -3.85,
            3.35,
            2.98,
          ]}

          targetOffset={[
            -1.15,
            -1.2,
            0,
          ]}

          intensity={
            isNight
              ? 900
              : 300
          }

          color="#ffd6ad"

          distance={
            6
          }

          angle={
            0.48
          }

          penumbra={
            0.65
          }

          dev={
            dev
          }

          onSelect={
            setSelected
          }
        />

        {/* =============================================
            PAINTING LIGHT 2
        ============================================= */}

        <DevSpotLight
          name="Painting Light 2"

          position={[
            -3.85,
            3.35,
            1.73,
          ]}

          targetOffset={[
            -1.2,
            -1.18,
            0,
          ]}

          intensity={
            isNight
              ? 900
              : 0
          }

          color="#ffd6ad"

          distance={
            6
          }

          angle={
            0.48
          }

          penumbra={
            0.65
          }

          dev={
            dev
          }

          onSelect={
            setSelected
          }
        />

        {/* =============================================
            PAINTING LIGHT 3
        ============================================= */}

        <DevSpotLight
          name="Painting Light 3"

          position={[
            -3.85,
            3.35,
            0.48,
          ]}

          targetOffset={[
            -1.18,
            -1.18,
            0,
          ]}

          intensity={
            isNight
              ? 900
              : 0
          }

          color="#ffd6ad"

          distance={
            6
          }

          angle={
            0.48
          }

          penumbra={
            0.65
          }

          dev={
            dev
          }

          onSelect={
            setSelected
          }
        />

        {/* =============================================
            DEV CAMERA
        ============================================= */}

        {dev && (
          <OrbitControls
            makeDefault

            enableDamping

            dampingFactor={
              0.05
            }
          />
        )}

        {/* =============================================
            DEV TOOLS
        ============================================= */}

        {dev && (
          <Dev3DTools
            selected={
              selected
            }

            mode={
              mode
            }

            space={
              space
            }

            onTransformStart={
              handleTransformStart
            }

            onTransformChange={
              handleTransformChange
            }

            onTransformEnd={
              handleTransformEnd
            }
          />
        )}
      </Canvas>

      {/* =================================================
          ENTRY
      ================================================= */}

      {!entered && (
        <div
          className="
            absolute
            inset-0
            z-[100]

            flex
            items-center
            justify-center

            bg-black/50
            backdrop-blur-sm
          "
        >
          <div
            className="
              flex
              max-w-md
              flex-col
              items-center

              rounded-3xl

              border
              border-white/10

              bg-black/70

              px-10
              py-8

              text-center
              text-white

              backdrop-blur-xl
            "
          >
            <Gamepad2
              size={
                34
              }
            />

            <div
              className="
                mt-4
                text-xl
                font-medium
              "
            >
              Enter the room
            </div>

            <div
              className="
                mt-2
                text-sm
                leading-6
                text-neutral-400
              "
            >
              Walk with WASD or
              arrow keys. Look
              around with your
              mouse.
            </div>

            <button
              type="button"

              onClick={
                enterRoom
              }

              className="
                mt-6

                flex
                items-center
                gap-2

                rounded-full

                bg-white

                px-6
                py-3

                text-sm
                font-medium
                text-black
              "
            >
              <Play
                size={
                  17
                }
                fill="currentColor"
              />

              Enter
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          NORMAL CROSSHAIR
      ================================================= */}

      {exploreMode && (
        <div
          className="
            pointer-events-none

            absolute
            left-1/2
            top-1/2
            z-40

            -translate-x-1/2
            -translate-y-1/2

            flex
            flex-col
            items-center
          "
        >
          {/* CROSSHAIR */}

          <div
            className={`
              rounded-full

              transition-all
              duration-150

              ${
                monitorHovered
                  ? `
                    h-6
                    w-6

                    border-2
                    border-white

                    bg-white/20

                    shadow-[0_0_18px_rgba(255,255,255,.8)]
                  `
                  : `
                    h-1
                    w-1

                    bg-white/60
                  `
              }
            `}
          />

          {/* INTERACTION TEXT */}

          {monitorHovered && (
            <div
              className="
                mt-3

                whitespace-nowrap

                rounded-full

                border
                border-white/10

                bg-black/70

                px-3
                py-1.5

                text-xs
                text-white

                backdrop-blur-md
              "
            >
              Open computer
            </div>
          )}
        </div>
      )}

      {/* =================================================
          P HINT
      ================================================= */}

      {exploreMode &&
        !monitorHovered && (
          <div
            className="
              pointer-events-none

              absolute
              bottom-5
              left-1/2
              z-40

              -translate-x-1/2

              flex
              items-center
              gap-2

              rounded-full

              border
              border-white/10

              bg-black/50

              px-4
              py-2

              text-xs
              text-white/60

              backdrop-blur-md
            "
          >
            <PanelRight
              size={
                13
              }
            />

            Press

            <span
              className="
                font-semibold
                text-white
              "
            >
              P
            </span>

            for controls
          </div>
        )}

      {/* =================================================
          CONTROL MENU
      ================================================= */}

      {menuOpen && (
        <aside
          className="
            absolute
            right-5
            top-5
            z-[80]

            w-[300px]

            overflow-hidden

            rounded-3xl

            border
            border-white/10

            bg-black/70

            text-white

            shadow-2xl

            backdrop-blur-2xl
          "
        >
          {/* HEADER */}

          <div
            className="
              flex
              items-center
              justify-between

              border-b
              border-white/10

              px-5
              py-4
            "
          >
            <div>
              <div
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.25em]
                  text-neutral-500
                "
              >
                Bahar Room
              </div>

              <div
                className="
                  mt-1
                  text-sm
                  font-medium
                "
              >
                Controls
              </div>
            </div>

            <button
              type="button"

              onClick={
                toggleMenu
              }

              className="
                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-full

                bg-white/5

                text-neutral-400

                hover:bg-white/10
                hover:text-white
              "
            >
              <X
                size={
                  17
                }
              />
            </button>
          </div>

          <div
            className="
              space-y-3
              p-4
            "
          >
            {/* DAY / NIGHT */}

            <button
              type="button"

              onClick={
                toggleLighting
              }

              className="
                flex
                w-full
                items-center
                gap-4

                rounded-2xl

                bg-white/5

                p-4

                text-left

                hover:bg-white/10
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11

                  items-center
                  justify-center

                  rounded-full

                  bg-white/10
                "
              >
                {isNight ? (
                  <Moon
                    size={
                      20
                    }
                  />
                ) : (
                  <Sun
                    size={
                      20
                    }
                  />
                )}
              </div>

              <div>
                <div
                  className="
                    text-sm
                    font-medium
                  "
                >
                  {isNight
                    ? "Night mode"
                    : "Day mode"}
                </div>

                <div
                  className="
                    mt-1
                    text-xs
                    text-neutral-500
                  "
                >
                  Switch room lighting
                </div>
              </div>
            </button>

            {/* DEV */}

            <button
              type="button"

              onClick={
                toggleDeveloper
              }

              className="
                flex
                w-full
                items-center
                gap-4

                rounded-2xl

                bg-white/5

                p-4

                text-left

                hover:bg-white/10
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11

                  items-center
                  justify-center

                  rounded-full

                  bg-white/10
                "
              >
                <Wrench
                  size={
                    19
                  }
                />
              </div>

              <div>
                <div
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Developer mode
                </div>

                <div
                  className="
                    mt-1
                    text-xs
                    text-neutral-500
                  "
                >
                  Edit room objects
                </div>
              </div>
            </button>

            {/* RESUME */}

            {!dev && (
              <button
                type="button"

                onClick={
                  resumeRoom
                }

                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2

                  rounded-2xl

                  bg-white

                  px-4
                  py-3

                  text-sm
                  font-medium

                  text-black
                "
              >
                <Play
                  size={
                    16
                  }
                  fill="currentColor"
                />

                Resume exploration
              </button>
            )}

            {/* HELP */}

            <div
              className="
                rounded-2xl

                border
                border-white/5

                p-4
              "
            >
              <div
                className="
                  mb-3

                  flex
                  items-center
                  gap-2

                  text-xs
                  text-neutral-400
                "
              >
                <Footprints
                  size={
                    14
                  }
                />

                Navigation
              </div>

              <ControlRow
                name="Move"

                value="WASD / Arrows"
              />

              <ControlRow
                name="Look"

                value="Mouse"

                icon={
                  <MousePointer2
                    size={
                      12
                    }
                  />
                }
              />

              <ControlRow
                name="Controls"

                value="P"

                icon={
                  <Keyboard
                    size={
                      12
                    }
                  />
                }
              />

              <ControlRow
                name="Sprint"

                value="Shift"
              />
            </div>
          </div>
        </aside>
      )}

      {/* =================================================
          DEV PANEL
      ================================================= */}

      {dev && (
        <DevPanel
          selected={
            selected
          }

          setSelected={
            setSelected
          }

          mode={
            mode
          }

          setMode={
            setMode
          }

          space={
            space
          }

          setSpace={
            setSpace
          }

          revision={
            revision
          }

          undo={
            undo
          }

          canUndo={
            historySize >
            0
          }
        />
      )}

      {/* =================================================
          DEV MENU BUTTON
      ================================================= */}

      {dev &&
        !menuOpen && (
          <button
            type="button"

            onClick={
              toggleMenu
            }

            className="
              absolute
              right-5
              top-5
              z-50

              flex
              h-11
              w-11
              items-center
              justify-center

              rounded-full

              border
              border-white/10

              bg-black/60

              text-white

              backdrop-blur-xl
            "
          >
            <PanelRight
              size={
                19
              }
            />
          </button>
        )}

      {/* =================================================
          THE COMPUTER

          This completely takes over the screen.
      ================================================= */}

      {monitorMode && (
        <WindowsXPDesktop
          videoSrc="/movies/BaharBirthDay.mp4"

          onExit={
            closeMonitor
          }
        />
      )}
    </div>
  );
}

/* ======================================================
   CONTROL ROW
====================================================== */

function ControlRow({
  name,
  value,
  icon = null,
}: {
  name:
    string;

  value:
    string;

  icon?:
    React.ReactNode;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-3

        py-1

        text-xs
        text-neutral-500
      "
    >
      <span>
        {name}
      </span>

      <span
        className="
          flex
          items-center
          gap-1

          text-neutral-300
        "
      >
        {icon}

        {value}
      </span>
    </div>
  );
}