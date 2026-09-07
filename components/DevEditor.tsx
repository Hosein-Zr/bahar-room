"use client";

import {
  useEffect,
  useRef,
} from "react";

import * as THREE from "three";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  GizmoHelper,
  GizmoViewport,
  Grid,
  Html,
  TransformControls,
} from "@react-three/drei";

/* ======================================================
   TYPES
====================================================== */

export type TransformMode =
  | "translate"
  | "rotate"
  | "scale";

export type TransformSpace =
  | "world"
  | "local";

/* ======================================================
   HELPERS
====================================================== */

function round(
  value: number
) {
  return Number(
    value.toFixed(3)
  );
}

function degrees(
  value: number
) {
  return Number(
    THREE.MathUtils
      .radToDeg(value)
      .toFixed(1)
  );
}

/* ======================================================
   SELECTION BOX
====================================================== */

function SelectionBox({
  object,
}: {
  object:
    THREE.Object3D;
}) {
  const {
    scene,
  } = useThree();

  const helperRef =
    useRef<
      THREE.BoxHelper | null
    >(null);

  useEffect(() => {
    const helper =
      new THREE.BoxHelper(
        object,
        0xffcc00
      );

    helperRef.current =
      helper;

    scene.add(helper);

    return () => {
      scene.remove(
        helper
      );

      helper.geometry.dispose();

      if (
        !Array.isArray(
          helper.material
        )
      ) {
        helper.material.dispose();
      }

      helperRef.current =
        null;
    };
  }, [
    object,
    scene,
  ]);

  useFrame(() => {
    helperRef.current
      ?.update();
  });

  return null;
}

/* ======================================================
   3D DEVELOPMENT TOOLS
====================================================== */

type Dev3DToolsProps = {
  selected:
    THREE.Object3D | null;

  mode:
    TransformMode;

  space:
    TransformSpace;

  onTransformStart:
    () => void;

  onTransformChange:
    () => void;

  onTransformEnd:
    () => void;
};

export function Dev3DTools({
  selected,
  mode,
  space,
  onTransformStart,
  onTransformChange,
  onTransformEnd,
}: Dev3DToolsProps) {
  return (
    <>
      <Grid
        infiniteGrid
        cellSize={0.5}
        sectionSize={5}
        fadeDistance={50}
        fadeStrength={1}
      />

      <axesHelper
        args={[2]}
      />

      {selected && (
        <>
          <SelectionBox
            object={
              selected
            }
          />

          <TransformControls
            object={
              selected
            }
            mode={
              mode
            }
            space={
              space
            }
            size={0.8}
            onMouseDown={
              onTransformStart
            }
            onObjectChange={
              onTransformChange
            }
            onMouseUp={
              onTransformEnd
            }
          />
        </>
      )}

      <GizmoHelper
        alignment="bottom-right"
        margin={[
          80,
          80,
        ]}
      >
        <GizmoViewport />
      </GizmoHelper>
    </>
  );
}

/* ======================================================
   DEVELOPMENT POINT LIGHT
====================================================== */

type DevPointLightProps = {
  name?: string;

  position?: [
    number,
    number,
    number
  ];

  intensity?: number;

  distance?: number;

  decay?: number;

  color?: string;

  castShadow?: boolean;

  dev?: boolean;

  onSelect?: (
    object:
      THREE.Object3D
  ) => void;
};

export function DevPointLight({
  name =
    "Point Light",

  position = [
    0,
    2,
    0,
  ],

  intensity =
    10,

  distance =
    0,

  decay =
    2,

  color =
    "#ffffff",

  castShadow =
    true,

  dev =
    true,

  onSelect,
}: DevPointLightProps) {
  const groupRef =
    useRef<
      THREE.Group | null
    >(null);

  const initializedRef =
    useRef(false);

  /*
   * Initial transform is applied only once.
   *
   * This is important:
   * moving the light in DEV mode will not be
   * undone by React when Day/Night changes.
   */

  useEffect(() => {
    if (
      !groupRef.current ||
      initializedRef.current
    ) {
      return;
    }

    groupRef.current.position.set(
      position[0],
      position[1],
      position[2]
    );

    initializedRef.current =
      true;
  }, [
    position,
  ]);

  return (
    <group
      ref={
        groupRef
      }
      name={
        name
      }
    >
      <pointLight
        intensity={
          intensity
        }
        distance={
          distance
        }
        decay={
          decay
        }
        color={
          color
        }
        castShadow={
          castShadow
        }
      />

      {dev && (
        <>
          <mesh
            onPointerDown={(
              event
            ) => {
              event.stopPropagation();

              if (
                groupRef.current
              ) {
                onSelect?.(
                  groupRef.current
                );
              }
            }}
          >
            <sphereGeometry
              args={[
                0.12,
                20,
                20,
              ]}
            />

            <meshBasicMaterial
              color="#ffd400"
              toneMapped={
                false
              }
            />
          </mesh>

          <Html
            position={[
              0,
              0.28,
              0,
            ]}
            center
            style={{
              pointerEvents:
                "none",

              padding:
                "4px 7px",

              borderRadius:
                "5px",

              background:
                "rgba(0,0,0,.78)",

              color:
                "white",

              fontSize:
                "11px",

              fontFamily:
                "system-ui",

              whiteSpace:
                "nowrap",
            }}
          >
            {name}
          </Html>
        </>
      )}
    </group>
  );
}

/* ======================================================
   DEVELOPMENT SPOTLIGHT

   THIS IS WHAT WE USE FOR THE PAINTINGS.

   The complete light is one Group:

       Light group
       ├── SpotLight
       ├── yellow handle
       └── target

   So:

       G = move spotlight
       R = aim spotlight

====================================================== */

type DevSpotLightProps = {
  name: string;

  position: [
    number,
    number,
    number
  ];

  rotation?: [
    number,
    number,
    number
  ];

  targetOffset?: [
    number,
    number,
    number
  ];

  intensity: number;

  color?: string;

  distance?: number;

  angle?: number;

  penumbra?: number;

  decay?: number;

  castShadow?: boolean;

  dev?: boolean;

  onSelect?: (
    object:
      THREE.Object3D
  ) => void;
};

export function DevSpotLight({
  name,

  position,

  rotation = [
    0,
    0,
    0,
  ],

  targetOffset = [
    -1.2,
    -1.2,
    0,
  ],

  intensity,

  color =
    "#ffd6ad",

  distance =
    6,

  angle =
    0.45,

  penumbra =
    0.65,

  decay =
    2,

  castShadow =
    false,

  dev =
    true,

  onSelect,
}: DevSpotLightProps) {
  const groupRef =
    useRef<
      THREE.Group | null
    >(null);

  const lightRef =
    useRef<
      THREE.SpotLight | null
    >(null);

  const targetRef =
    useRef<
      THREE.Object3D | null
    >(null);

  const initializedRef =
    useRef(false);

  /* ====================================================
     APPLY INITIAL TRANSFORM ONLY ONCE
  ==================================================== */

  useEffect(() => {
    if (
      !groupRef.current ||
      initializedRef.current
    ) {
      return;
    }

    groupRef.current
      .position
      .set(
        position[0],
        position[1],
        position[2]
      );

    groupRef.current
      .rotation
      .set(
        rotation[0],
        rotation[1],
        rotation[2]
      );

    initializedRef.current =
      true;
  }, [
    position,
    rotation,
  ]);

  /* ====================================================
     CONNECT SPOTLIGHT TO TARGET
  ==================================================== */

  useEffect(() => {
    if (
      !lightRef.current ||
      !targetRef.current
    ) {
      return;
    }

    lightRef.current.target =
      targetRef.current;

    targetRef.current
      .updateMatrixWorld(
        true
      );
  }, []);

  return (
    <group
      ref={
        groupRef
      }
      name={
        name
      }
    >
      {/* ===============================================
          REAL SPOTLIGHT
      =============================================== */}

      <spotLight
        ref={
          lightRef
        }
        intensity={
          intensity
        }
        color={
          color
        }
        distance={
          distance
        }
        angle={
          angle
        }
        penumbra={
          penumbra
        }
        decay={
          decay
        }
        castShadow={
          castShadow
        }
      />

      {/* ===============================================
          TARGET

          This is a CHILD of the light group.

          Therefore rotating the group changes
          where the spotlight aims.
      =============================================== */}

      <object3D
        ref={
          targetRef
        }
        position={
          targetOffset
        }
      />

      {/* ===============================================
          DEV VISUALS
      =============================================== */}

      {dev && (
        <>
          {/* LIGHT HANDLE */}

          <mesh
            onPointerDown={(
              event
            ) => {
              event.stopPropagation();

              if (
                groupRef.current
              ) {
                onSelect?.(
                  groupRef.current
                );
              }
            }}
          >
            <sphereGeometry
              args={[
                0.13,
                20,
                20,
              ]}
            />

            <meshBasicMaterial
              color="#ffd400"
              toneMapped={
                false
              }
            />
          </mesh>

          {/* SMALL LIGHT FIXTURE */}

          <mesh
            rotation={[
              0,
              0,
              Math.PI /
                2,
            ]}
            onPointerDown={(
              event
            ) => {
              event.stopPropagation();

              if (
                groupRef.current
              ) {
                onSelect?.(
                  groupRef.current
                );
              }
            }}
          >
            <coneGeometry
              args={[
                0.12,
                0.25,
                16,
              ]}
            />

            <meshBasicMaterial
              color="#ffb900"
              wireframe
              toneMapped={
                false
              }
            />
          </mesh>

          {/* TARGET INDICATOR */}

          <mesh
            position={
              targetOffset
            }
            onPointerDown={(
              event
            ) => {
              event.stopPropagation();

              if (
                groupRef.current
              ) {
                onSelect?.(
                  groupRef.current
                );
              }
            }}
          >
            <sphereGeometry
              args={[
                0.055,
                12,
                12,
              ]}
            />

            <meshBasicMaterial
              color="#00e5ff"
              toneMapped={
                false
              }
            />
          </mesh>

          <Html
            position={[
              0,
              0.27,
              0,
            ]}
            center
            style={{
              pointerEvents:
                "none",

              padding:
                "4px 7px",

              borderRadius:
                "5px",

              background:
                "rgba(0,0,0,.8)",

              color:
                "white",

              fontSize:
                "11px",

              fontFamily:
                "system-ui",

              whiteSpace:
                "nowrap",
            }}
          >
            {name}
          </Html>
        </>
      )}
    </group>
  );
}

/* ======================================================
   DEV PANEL
====================================================== */

type DevPanelProps = {
  selected:
    THREE.Object3D | null;

  setSelected:
    React.Dispatch<
      React.SetStateAction<
        THREE.Object3D | null
      >
    >;

  mode:
    TransformMode;

  setMode:
    React.Dispatch<
      React.SetStateAction<
        TransformMode
      >
    >;

  space:
    TransformSpace;

  setSpace:
    React.Dispatch<
      React.SetStateAction<
        TransformSpace
      >
    >;

  revision:
    number;

  undo:
    () => void;

  canUndo:
    boolean;
};

export function DevPanel({
  selected,
  setSelected,
  mode,
  setMode,
  space,
  setSpace,
  revision,
  undo,
  canUndo,
}: DevPanelProps) {
  void revision;

  /* ====================================================
     COPY TRANSFORM
  ==================================================== */

  async function copyTransform() {
    if (
      !selected
    ) {
      return;
    }

    const p =
      selected.position;

    const r =
      selected.rotation;

    const s =
      selected.scale;

    const text =
`position={[${round(
  p.x
)}, ${round(
  p.y
)}, ${round(
  p.z
)}]}
rotation={[${round(
  r.x
)}, ${round(
  r.y
)}, ${round(
  r.z
)}]}
scale={[${round(
  s.x
)}, ${round(
  s.y
)}, ${round(
  s.z
)}]}`;

    try {
      await navigator
        .clipboard
        .writeText(
          text
        );
    } catch {
      console.log(
        text
      );
    }
  }

  /* ====================================================
     SELECT PARENT
  ==================================================== */

  function selectParent() {
    if (
      !selected?.parent
    ) {
      return;
    }

    if (
      selected.parent.type ===
      "Scene"
    ) {
      return;
    }

    setSelected(
      selected.parent
    );
  }

  return (
    <>
      {/* ===============================================
          UNDO
      =============================================== */}

      <button
        type="button"
        disabled={
          !canUndo
        }
        onClick={
          undo
        }
        className="
          absolute
          left-4
          top-4
          z-50

          rounded-xl
          border
          border-white/10

          bg-black/70
          px-4
          py-2

          text-sm
          text-white

          backdrop-blur-xl

          hover:bg-black/90

          disabled:cursor-not-allowed
          disabled:opacity-30
        "
      >
        ↶ Undo

        <span
          className="
            ml-3
            text-xs
            text-neutral-400
          "
        >
          Ctrl + Z
        </span>
      </button>

      {/* ===============================================
          NOTHING SELECTED
      =============================================== */}

      {!selected && (
        <div
          className="
            pointer-events-none

            absolute
            bottom-5
            right-5
            z-50

            rounded-full
            border
            border-white/10

            bg-black/50

            px-4
            py-2

            text-xs
            text-neutral-400

            backdrop-blur-xl
          "
        >
          Click an object or light
        </div>
      )}

      {/* ===============================================
          SELECTED TICKET
      =============================================== */}

      {selected && (
        <div
          className="
            absolute
            bottom-6
            right-6
            z-50

            w-[320px]

            overflow-hidden

            rounded-2xl

            border
            border-white/10

            bg-black/75

            text-white

            shadow-2xl

            backdrop-blur-xl
          "
        >
          {/* HEADER */}

          <div
            className="
              flex
              items-start
              justify-between

              border-b
              border-white/10

              px-4
              py-3
            "
          >
            <div
              className="
                min-w-0
              "
            >
              <div
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-neutral-500
                "
              >
                Selected
              </div>

              <div
                className="
                  truncate
                  text-sm
                  font-semibold
                "
              >
                {selected.name ||
                  "Unnamed Object"}
              </div>

              <div
                className="
                  text-xs
                  text-neutral-500
                "
              >
                {selected.type}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelected(
                  null
                )
              }
              className="
                ml-3
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-white/5
                text-neutral-400
                hover:bg-white/10
                hover:text-white
              "
            >
              ×
            </button>
          </div>

          {/* TOOL */}

          <div
            className="
              grid
              grid-cols-3
              gap-2
              px-4
              pt-4
            "
          >
            <button
              type="button"
              onClick={() =>
                setMode(
                  "translate"
                )
              }
              className={
                mode ===
                "translate"
                  ? "rounded-lg bg-white px-3 py-2 text-xs font-medium text-black"
                  : "rounded-lg bg-white/5 px-3 py-2 text-xs text-neutral-300 hover:bg-white/10"
              }
            >
              G · Move
            </button>

            <button
              type="button"
              onClick={() =>
                setMode(
                  "rotate"
                )
              }
              className={
                mode ===
                "rotate"
                  ? "rounded-lg bg-white px-3 py-2 text-xs font-medium text-black"
                  : "rounded-lg bg-white/5 px-3 py-2 text-xs text-neutral-300 hover:bg-white/10"
              }
            >
              R · Rotate
            </button>

            <button
              type="button"
              onClick={() =>
                setMode(
                  "scale"
                )
              }
              className={
                mode ===
                "scale"
                  ? "rounded-lg bg-white px-3 py-2 text-xs font-medium text-black"
                  : "rounded-lg bg-white/5 px-3 py-2 text-xs text-neutral-300 hover:bg-white/10"
              }
            >
              S · Scale
            </button>
          </div>

          {/* VALUES */}

          <div
            className="
              space-y-4
              p-4
            "
          >
            <TransformSection
              title="Position"
              values={[
                {
                  axis:
                    "X",

                  value:
                    round(
                      selected
                        .position
                        .x
                    ),
                },

                {
                  axis:
                    "Y",

                  value:
                    round(
                      selected
                        .position
                        .y
                    ),
                },

                {
                  axis:
                    "Z",

                  value:
                    round(
                      selected
                        .position
                        .z
                    ),
                },
              ]}
            />

            <TransformSection
              title="Rotation"
              values={[
                {
                  axis:
                    "X",

                  value:
                    `${degrees(
                      selected
                        .rotation
                        .x
                    )}°`,
                },

                {
                  axis:
                    "Y",

                  value:
                    `${degrees(
                      selected
                        .rotation
                        .y
                    )}°`,
                },

                {
                  axis:
                    "Z",

                  value:
                    `${degrees(
                      selected
                        .rotation
                        .z
                    )}°`,
                },
              ]}
            />

            <TransformSection
              title="Scale"
              values={[
                {
                  axis:
                    "X",

                  value:
                    round(
                      selected
                        .scale
                        .x
                    ),
                },

                {
                  axis:
                    "Y",

                  value:
                    round(
                      selected
                        .scale
                        .y
                    ),
                },

                {
                  axis:
                    "Z",

                  value:
                    round(
                      selected
                        .scale
                        .z
                    ),
                },
              ]}
            />

            {/* WORLD / LOCAL */}

            <div
              className="
                grid
                grid-cols-2
                gap-2
              "
            >
              <button
                type="button"
                onClick={() =>
                  setSpace(
                    "world"
                  )
                }
                className={
                  space ===
                  "world"
                    ? "rounded-lg bg-white py-2 text-xs text-black"
                    : "rounded-lg bg-white/5 py-2 text-xs text-neutral-400"
                }
              >
                World
              </button>

              <button
                type="button"
                onClick={() =>
                  setSpace(
                    "local"
                  )
                }
                className={
                  space ===
                  "local"
                    ? "rounded-lg bg-white py-2 text-xs text-black"
                    : "rounded-lg bg-white/5 py-2 text-xs text-neutral-400"
                }
              >
                Local
              </button>
            </div>

            {/* ACTIONS */}

            <div
              className="
                grid
                grid-cols-2
                gap-2
              "
            >
              <button
                type="button"
                onClick={
                  selectParent
                }
                className="
                  rounded-lg
                  bg-white/5
                  py-2
                  text-xs
                  text-neutral-300
                  hover:bg-white/10
                "
              >
                ↑ Parent
              </button>

              <button
                type="button"
                onClick={
                  copyTransform
                }
                className="
                  rounded-lg
                  bg-white/5
                  py-2
                  text-xs
                  text-neutral-300
                  hover:bg-white/10
                "
              >
                Copy Transform
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ======================================================
   TRANSFORM SECTION
====================================================== */

function TransformSection({
  title,
  values,
}: {
  title:
    string;

  values: {
    axis:
      string;

    value:
      string |
      number;
  }[];
}) {
  return (
    <div>
      <div
        className="
          mb-2

          text-[10px]
          font-semibold
          uppercase
          tracking-widest

          text-neutral-500
        "
      >
        {title}
      </div>

      <div
        className="
          grid
          grid-cols-3
          gap-2
        "
      >
        {values.map(
          ({
            axis,
            value,
          }) => (
            <ValueBox
              key={
                axis
              }
              axis={
                axis
              }
              value={
                value
              }
            />
          )
        )}
      </div>
    </div>
  );
}

/* ======================================================
   VALUE BOX
====================================================== */

function ValueBox({
  axis,
  value,
}: {
  axis:
    string;

  value:
    string |
    number;
}) {
  return (
    <div
      className="
        rounded-lg
        border
        border-white/5
        bg-white/5
        px-2
        py-2
      "
    >
      <div
        className="
          text-[9px]
          text-neutral-500
        "
      >
        {axis}
      </div>

      <div
        className="
          font-mono
          text-xs
          text-neutral-200
        "
      >
        {value}
      </div>
    </div>
  );
}