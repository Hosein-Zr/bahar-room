"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as THREE from "three";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  useGLTF,
} from "@react-three/drei";

import {
  Folder,
  FolderOpen,
  Monitor,
  Trash2,
  Video,
  X,
} from "lucide-react";

/* ======================================================
   CREATE WINDOWS-XP-STYLE TEXTURE FOR PHYSICAL MONITOR
====================================================== */

function createDesktopTexture() {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    1024;

  canvas.height =
    768;

  const ctx =
    canvas.getContext(
      "2d"
    );

  if (!ctx) {
    throw new Error(
      "Could not create monitor texture"
    );
  }

  /* ====================================================
     SKY
  ==================================================== */

  const sky =
    ctx.createLinearGradient(
      0,
      0,
      0,
      600
    );

  sky.addColorStop(
    0,
    "#2176d9"
  );

  sky.addColorStop(
    1,
    "#76c5ff"
  );

  ctx.fillStyle =
    sky;

  ctx.fillRect(
    0,
    0,
    1024,
    768
  );

  /* ====================================================
     CLOUDS
  ==================================================== */

  ctx.fillStyle =
    "rgba(255,255,255,0.85)";

  ctx.beginPath();

  ctx.ellipse(
    720,
    130,
    100,
    35,
    0,
    0,
    Math.PI * 2
  );

  ctx.ellipse(
    790,
    120,
    75,
    45,
    0,
    0,
    Math.PI * 2
  );

  ctx.ellipse(
    650,
    125,
    70,
    30,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  /* ====================================================
     GREEN HILL
  ==================================================== */

  ctx.fillStyle =
    "#43a52d";

  ctx.beginPath();

  ctx.moveTo(
    0,
    560
  );

  ctx.bezierCurveTo(
    180,
    430,
    480,
    400,
    1024,
    590
  );

  ctx.lineTo(
    1024,
    730
  );

  ctx.lineTo(
    0,
    730
  );

  ctx.closePath();

  ctx.fill();

  /* ====================================================
     RECYCLE BIN ICON
  ==================================================== */

  ctx.fillStyle =
    "rgba(255,255,255,0.9)";

  ctx.fillRect(
    50,
    55,
    44,
    53
  );

  ctx.fillStyle =
    "#6c91b4";

  ctx.fillRect(
    46,
    50,
    52,
    8
  );

  ctx.font =
    "18px Tahoma, Arial";

  ctx.fillStyle =
    "white";

  ctx.shadowColor =
    "black";

  ctx.shadowBlur =
    3;

  ctx.fillText(
    "Recycle Bin",
    28,
    138
  );

  /* ====================================================
     MEMORIES FOLDER
  ==================================================== */

  ctx.shadowBlur =
    0;

  ctx.fillStyle =
    "#f5cf3e";

  ctx.fillRect(
    45,
    190,
    65,
    46
  );

  ctx.fillStyle =
    "#ffe46b";

  ctx.fillRect(
    45,
    180,
    32,
    15
  );

  ctx.fillStyle =
    "white";

  ctx.shadowColor =
    "black";

  ctx.shadowBlur =
    3;

  ctx.fillText(
    "Memories",
    39,
    267
  );

  ctx.shadowBlur =
    0;

  /* ====================================================
     XP STYLE TASKBAR
  ==================================================== */

  const taskbar =
    ctx.createLinearGradient(
      0,
      720,
      0,
      768
    );

  taskbar.addColorStop(
    0,
    "#3089e8"
  );

  taskbar.addColorStop(
    1,
    "#1757b7"
  );

  ctx.fillStyle =
    taskbar;

  ctx.fillRect(
    0,
    720,
    1024,
    48
  );

  /* START */

  const start =
    ctx.createLinearGradient(
      0,
      720,
      0,
      768
    );

  start.addColorStop(
    0,
    "#62c552"
  );

  start.addColorStop(
    1,
    "#238d32"
  );

  ctx.fillStyle =
    start;

  ctx.fillRect(
    0,
    720,
    135,
    48
  );

  ctx.font =
    "bold italic 22px Tahoma, Arial";

  ctx.fillStyle =
    "white";

  ctx.fillText(
    "start",
    52,
    751
  );

  /* SYSTEM TRAY */

  ctx.fillStyle =
    "#1b8bd9";

  ctx.fillRect(
    895,
    720,
    129,
    48
  );

  ctx.font =
    "16px Tahoma, Arial";

  ctx.fillStyle =
    "white";

  ctx.fillText(
    "Memories ♡",
    910,
    750
  );

  /* ====================================================
     THREE TEXTURE
  ==================================================== */

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  /*
   * GLTF UV orientation.
   */

  texture.flipY =
    false;

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.needsUpdate =
    true;

  return texture;
}

/* ======================================================
   MONITOR 3D INTERACTION
====================================================== */

type MonitorInteractionProps = {
  enabled:
    boolean;

  maxDistance?:
    number;

  onHoverChange:
    (
      hovered:
        boolean
    ) => void;

  onOpen:
    () => void;
};

export function MonitorInteraction({
  enabled,

  maxDistance =
    3.3,

  onHoverChange,

  onOpen,
}: MonitorInteractionProps) {
  const {
    camera,
    scene,
    gl,
  } = useThree();

  const gltf =
    useGLTF(
      "/models/BaharRoom.glb"
    ) as any;

  /*
   * This is your actual named Blender mesh.
   */

  const monitorGeometry =
    gltf.nodes
      ?.monitor
      ?.geometry as
      | THREE.BufferGeometry
      | undefined;

  const monitorRef =
    useRef<
      THREE.Mesh | null
    >(null);

  const originalMaterialRef =
    useRef<
      THREE.Material |
      THREE.Material[] |
      null
    >(null);

  const hoveredRef =
    useRef(false);

  const raycaster =
    useMemo(
      () =>
        new THREE.Raycaster(),
      []
    );

  const center =
    useMemo(
      () =>
        new THREE.Vector2(
          0,
          0
        ),
      []
    );

  /* ====================================================
     XP TEXTURE
  ==================================================== */

  const texture =
    useMemo(
      () =>
        createDesktopTexture(),
      []
    );

  /* ====================================================
     SELF-LIT SCREEN MATERIAL

     Doesn't depend on room lighting.

     This is important because a monitor emits light.
  ==================================================== */

  const screenMaterial =
    useMemo(() => {
      const material =
        new THREE.MeshBasicMaterial({
          map:
            texture,

          toneMapped:
            false,

          side:
            THREE.DoubleSide,
        });

      return material;
    }, [
      texture,
    ]);

  /* ====================================================
     TEXTURE QUALITY
  ==================================================== */

  
  useEffect(() => {
    texture.anisotropy =
      Math.min(
        16,
        gl.capabilities
          .getMaxAnisotropy()
      );

    texture.needsUpdate =
      true;
  }, [
    gl,
    texture,
  ]);

  /* ====================================================
     FIND THE RENDERED MONITOR

     BaharRoom.jsx recreates meshes with the geometry
     from nodes.monitor.

     We identify it by geometry identity.
  ==================================================== */

  useFrame(() => {
    if (
      !monitorRef.current &&
      monitorGeometry
    ) {
      let found:
        THREE.Mesh |
        null =
          null;

      scene.traverse(
        (
          object
        ) => {
          if (
            found
          ) {
            return;
          }

          const mesh =
            object as
              THREE.Mesh;

          if (
            mesh.isMesh &&
            mesh.geometry ===
              monitorGeometry
          ) {
            found =
              mesh;
          }
        }
      );

      if (
        found
      ) {
        const monitor =
          found as
            THREE.Mesh;

        originalMaterialRef.current =
          monitor.material;

        /*
         * Give the actual physical monitor
         * our XP desktop.
         */

        monitor.material =
          screenMaterial;

        monitorRef.current =
          monitor;
      }
    }

    /* ==================================================
       CENTER-SCREEN INTERACTION
    ================================================== */

    let hovering =
      false;

    if (
      enabled &&
      monitorRef.current
    ) {
      raycaster.setFromCamera(
        center,
        camera
      );

      const hits =
        raycaster.intersectObject(
          monitorRef.current,
          false
        );

      if (
        hits.length >
          0 &&
        hits[0].distance <=
          maxDistance
      ) {
        hovering =
          true;
      }
    }

    if (
      hovering !==
      hoveredRef.current
    ) {
      hoveredRef.current =
        hovering;

      onHoverChange(
        hovering
      );
    }
  });

  /* ====================================================
     CLICK WHILE POINTER-LOCKED
  ==================================================== */

  useEffect(() => {
    function handleMouseDown(
      event:
        MouseEvent
    ) {
      if (
        event.button !==
        0
      ) {
        return;
      }

      if (
        !enabled
      ) {
        return;
      }

      if (
        !hoveredRef.current
      ) {
        return;
      }

      onOpen();
    }

    window.addEventListener(
      "mousedown",
      handleMouseDown
    );

    return () => {
      window.removeEventListener(
        "mousedown",
        handleMouseDown
      );
    };
  }, [
    enabled,
    onOpen,
  ]);

  /* ====================================================
     CLEANUP
  ==================================================== */

  useEffect(() => {
    return () => {
      if (
        monitorRef.current &&
        originalMaterialRef.current
      ) {
        monitorRef.current.material =
          originalMaterialRef.current;
      }

      screenMaterial.dispose();

      texture.dispose();

      onHoverChange(
        false
      );
    };
  }, [
    screenMaterial,
    texture,
    onHoverChange,
  ]);

  return null;
}

/* ======================================================
   WINDOWS XP DESKTOP
====================================================== */

type WindowsXPDesktopProps = {
  onExit:
    () => void;

  videoSrc?:
    string;
};

type XPWindow =
  | null
  | "memories"
  | "recycle"
  | "video";

export function WindowsXPDesktop({
  onExit,

  videoSrc =
    "/movies/BaharBirthDay.mp4",
}: WindowsXPDesktopProps) {
  const [
    openWindow,
    setOpenWindow,
  ] =
    useState<XPWindow>(
      null
    );

  const [
    selectedDesktopIcon,
    setSelectedDesktopIcon,
  ] =
    useState<
      | "memories"
      | "recycle"
      | null
    >(null);

  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState(false);

  /* ====================================================
     ESC CLOSES WINDOWS FIRST

     If nothing is open, ESC exits monitor.
  ==================================================== */

  useEffect(() => {
    function handleKeyDown(
      event:
        KeyboardEvent
    ) {
      if (
        event.key !==
        "Escape"
      ) {
        return;
      }

      if (
        openWindow
      ) {
        setOpenWindow(
          null
        );

        return;
      }

      onExit();
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
    onExit,
    openWindow,
  ]);

  return (
    <div
      className="
        absolute
        inset-0
        z-[200]

        overflow-hidden

        font-[Tahoma,Arial,sans-serif]

        select-none
      "
      onMouseDown={() => {
        setSelectedDesktopIcon(
          null
        );

        setSelectedFile(
          false
        );
      }}
    >
      {/* =================================================
          XP DESKTOP BACKGROUND
      ================================================= */}

      <div
        className="
          absolute
          inset-0

          overflow-hidden

          bg-gradient-to-b
          from-[#168be5]
          via-[#64c8ff]
          to-[#a6e1ff]
        "
      >
        {/* CLOUDS */}

        <div
          className="
            absolute
            right-[10%]
            top-[8%]

            h-14
            w-52

            rounded-full

            bg-white/80

            blur-[1px]
          "
        />

        <div
          className="
            absolute
            right-[18%]
            top-[10%]

            h-10
            w-32

            rounded-full

            bg-white/80
          "
        />

        {/* HILL */}

        <div
          className="
            absolute

            -bottom-[20%]
            -left-[10%]

            h-[58%]
            w-[120%]

            rotate-[3deg]

            rounded-[50%]

            bg-gradient-to-b
            from-[#69c840]
            to-[#238a27]
          "
        />
      </div>

      {/* =================================================
          DESKTOP ICONS
      ================================================= */}

      <div
        className="
          absolute
          left-5
          top-5

          flex
          flex-col
          gap-4
        "
      >
        {/* RECYCLE BIN */}

        <DesktopIcon
          label="Recycle Bin"

          selected={
            selectedDesktopIcon ===
            "recycle"
          }

          icon={
            <Trash2
              size={
                38
              }
              strokeWidth={
                1.4
              }
              className="
                text-white
                drop-shadow-lg
              "
            />
          }

          onClick={() => {
            setSelectedDesktopIcon(
              "recycle"
            );
          }}

          onDoubleClick={() => {
            setOpenWindow(
              "recycle"
            );
          }}
        />

        {/* MEMORIES */}

        <DesktopIcon
          label="Memories"

          selected={
            selectedDesktopIcon ===
            "memories"
          }

          icon={
            <Folder
              size={
                42
              }
              strokeWidth={
                1.3
              }
              fill="#f6d34a"
              className="
                text-[#d6a91d]
                drop-shadow-lg
              "
            />
          }

          onClick={() => {
            setSelectedDesktopIcon(
              "memories"
            );
          }}

          onDoubleClick={() => {
            setOpenWindow(
              "memories"
            );
          }}
        />
      </div>

      {/* =================================================
          EXIT COMPUTER
      ================================================= */}

      <button
        type="button"

        onClick={
          onExit
        }

        className="
          absolute
          right-5
          top-5
          z-[240]

          flex
          items-center
          gap-2

          rounded-md

          border
          border-white/30

          bg-[#164c9c]

          px-4
          py-2

          text-sm
          font-semibold
          text-white

          shadow-lg

          hover:bg-[#2365c5]
        "
      >
        <Monitor
          size={
            16
          }
        />

        Back to room
      </button>

      {/* =================================================
          MEMORIES EXPLORER
      ================================================= */}

      {openWindow ===
        "memories" && (
        <XPWindowFrame
          title="Memories"

          icon={
            <FolderOpen
              size={
                17
              }
              fill="#f6d34a"
              className="
                text-[#bd9013]
              "
            />
          }

          onClose={() =>
            setOpenWindow(
              null
            )
          }
        >
          {/* ADDRESS */}

          <div
            className="
              flex
              h-8
              items-center
              gap-2

              border-b
              border-[#aca899]

              bg-[#ece9d8]

              px-2

              text-xs
              text-black
            "
          >
            <span
              className="
                text-[#555]
              "
            >
              Address
            </span>

            <div
              className="
                flex-1

                border
                border-[#7f9db9]

                bg-white

                px-2
                py-1
              "
            >
              C:\Documents and Settings\Bahar\Desktop\Memories
            </div>
          </div>

          {/* FILE CONTENT */}

          <div
            className="
              h-full

              bg-white

              p-6
            "
          >
            <button
              type="button"

              onMouseDown={(
                event
              ) => {
                event.stopPropagation();

                setSelectedFile(
                  true
                );
              }}

              onDoubleClick={(
                event
              ) => {
                event.stopPropagation();

                setOpenWindow(
                  "video"
                );
              }}

              className={`
                flex
                w-28
                flex-col
                items-center

                rounded-sm

                p-2

                text-center
                text-xs
                text-black

                ${
                  selectedFile
                    ? "bg-[#316ac5] text-white"
                    : ""
                }
              `}
            >
              <Video
                size={
                  46
                }
                strokeWidth={
                  1.3
                }
                className={
                  selectedFile
                    ? "text-white"
                    : "text-[#2454a4]"
                }
              />

              <span
                className="
                  mt-1
                  break-all
                "
              >
                BaharBirthDay.mp4
              </span>
            </button>
          </div>
        </XPWindowFrame>
      )}

      {/* =================================================
          RECYCLE BIN
      ================================================= */}

      {openWindow ===
        "recycle" && (
        <XPWindowFrame
          title="Recycle Bin"

          icon={
            <Trash2
              size={
                17
              }
            />
          }

          onClose={() =>
            setOpenWindow(
              null
            )
          }
        >
          <div
            className="
              flex
              h-full
              items-center
              justify-center

              bg-white

              text-sm
              text-[#555]
            "
          >
            Recycle Bin is empty.
          </div>
        </XPWindowFrame>
      )}

      {/* =================================================
          VIDEO PLAYER
      ================================================= */}

      {openWindow ===
        "video" && (
        <XPWindowFrame
          title="BaharBirthDay.mp4 - Windows Media Player"

          width="min(900px, 86vw)"

          height="min(680px, 78vh)"

          icon={
            <Video
              size={
                17
              }
            />
          }

          onClose={() =>
            setOpenWindow(
              "memories"
            )
          }
        >
          <div
            className="
              flex
              h-full
              flex-col

              bg-[#101010]
            "
          >
            <div
              className="
                flex-1

                overflow-hidden

                bg-black
              "
            >
              <video
                src={
                  videoSrc
                }

                autoPlay

                controls

                playsInline

                className="
                  h-full
                  w-full

                  object-contain
                "
              />
            </div>

            <div
              className="
                flex
                h-9
                items-center

                border-t
                border-[#555]

                bg-gradient-to-b
                from-[#eeeeee]
                to-[#bcbcbc]

                px-3

                text-xs
                text-black
              "
            >
              BaharBirthDay.mp4
            </div>
          </div>
        </XPWindowFrame>
      )}

      {/* =================================================
          TASKBAR
      ================================================= */}

      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          z-[210]

          flex
          h-10
          items-center

          bg-gradient-to-b
          from-[#3289e8]
          to-[#1557b5]

          shadow-[0_-1px_4px_rgba(0,0,0,.3)]
        "
      >
        {/* START */}

        <button
          type="button"

          className="
            flex
            h-full
            w-28
            items-center
            gap-2

            rounded-r-2xl

            bg-gradient-to-b
            from-[#64c557]
            to-[#238d31]

            px-4

            text-left
            text-lg
            font-bold
            italic
            text-white

            shadow-md
          "
        >
          <span
            className="
              text-xl
            "
          >
            ◈
          </span>

          start
        </button>

        {/* OPEN WINDOW TASK */}

        {openWindow && (
          <div
            className="
              ml-2

              max-w-60

              rounded-sm

              border
              border-[#174e9a]

              bg-[#2a70cf]

              px-4
              py-1

              text-xs
              text-white
            "
          >
            {openWindow ===
              "memories" &&
              "Memories"}

            {openWindow ===
              "recycle" &&
              "Recycle Bin"}

            {openWindow ===
              "video" &&
              "BaharBirthDay.mp4"}
          </div>
        )}

        {/* TRAY */}

        <div
          className="
            ml-auto

            flex
            h-full
            items-center

            border-l
            border-[#1781cf]

            bg-[#1493db]

            px-5

            text-xs
            text-white
          "
        >
          ♡ Memories
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   DESKTOP ICON
====================================================== */

function DesktopIcon({
  label,
  icon,
  selected,
  onClick,
  onDoubleClick,
}: {
  label:
    string;

  icon:
    React.ReactNode;

  selected:
    boolean;

  onClick:
    () => void;

  onDoubleClick:
    () => void;
}) {
  return (
    <button
      type="button"

      onMouseDown={(
        event
      ) => {
        event.stopPropagation();

        onClick();
      }}

      onDoubleClick={(
        event
      ) => {
        event.stopPropagation();

        onDoubleClick();
      }}

      className={`
        flex
        w-24
        flex-col
        items-center

        rounded-sm

        p-2

        text-center

        ${
          selected
            ? "bg-[#316ac5]/80"
            : ""
        }
      `}
    >
      {icon}

      <span
        className="
          mt-1

          text-xs
          text-white

          [text-shadow:1px_1px_2px_#000]
        "
      >
        {label}
      </span>
    </button>
  );
}

/* ======================================================
   WINDOWS XP WINDOW
====================================================== */

function XPWindowFrame({
  title,
  icon,
  onClose,
  children,

  width =
    "720px",

  height =
    "520px",
}: {
  title:
    string;

  icon:
    React.ReactNode;

  onClose:
    () => void;

  children:
    React.ReactNode;

  width?:
    string;

  height?:
    string;
}) {
  return (
    <div
      className="
        absolute
        left-1/2
        top-1/2
        z-[230]

        flex
        flex-col

        overflow-hidden

        rounded-t-md

        border-2
        border-[#0054e3]

        bg-[#ece9d8]

        shadow-2xl
      "

      style={{
        width,

        height,

        maxWidth:
          "92vw",

        maxHeight:
          "86vh",

        transform:
          "translate(-50%, -50%)",
      }}

      onMouseDown={(
        event
      ) => {
        event.stopPropagation();
      }}
    >
      {/* TITLE BAR */}

      <div
        className="
          flex
          h-8
          shrink-0
          items-center

          bg-gradient-to-b
          from-[#2f8cf4]
          via-[#0865d8]
          to-[#0054c8]

          px-1

          text-sm
          font-bold
          text-white
        "
      >
        <div
          className="
            flex
            items-center
            gap-2

            pl-1
          "
        >
          {icon}

          {title}
        </div>

        <button
          type="button"

          onClick={
            onClose
          }

          className="
            ml-auto

            flex
            h-6
            w-7
            items-center
            justify-center

            rounded-sm

            border
            border-white/60

            bg-gradient-to-b
            from-[#ef806b]
            to-[#ce321d]

            text-white
          "
        >
          <X
            size={
              15
            }
          />
        </button>
      </div>

      {/* WINDOW BODY */}

      <div
        className="
          min-h-0
          flex-1
        "
      >
        {children}
      </div>
    </div>
  );
}