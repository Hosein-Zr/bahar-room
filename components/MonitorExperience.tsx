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
  BookOpen,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  FileImage,
  Folder,
  FolderOpen,
  Globe2,
  Image as ImageIcon,
  Monitor,
  Trash2,
  Video,
  X,
} from "lucide-react";

/* ======================================================
   STATIC DRAWINGS

   These files already exist in:

   public/drawings/

   No API.
   No fetch.
   No filesystem reading.
====================================================== */

const DRAWINGS = [
  {
    name:
      "04cebe66-963a-491a-98d1-89a8770b0cf9.jpg",

    src:
      "/drawings/04cebe66-963a-491a-98d1-89a8770b0cf9.jpg",
  },

  {
    name:
      "046b5c8f-2a86-430d-bdf6-1778d208a77a.jpg",

    src:
      "/drawings/046b5c8f-2a86-430d-bdf6-1778d208a77a.jpg",
  },

  {
    name:
      "332ffbd6-ef4e-4e76-9d34-b4dbe22295ea.jpg",

    src:
      "/drawings/332ffbd6-ef4e-4e76-9d34-b4dbe22295ea.jpg",
  },

  {
    name:
      "405764dd-cb34-47ee-80cb-f91dd951b588.jpg",

    src:
      "/drawings/405764dd-cb34-47ee-80cb-f91dd951b588.jpg",
  },

  {
    name:
      "4225386c-bd74-4cab-86ba-6e3e0033766a.jpg",

    src:
      "/drawings/4225386c-bd74-4cab-86ba-6e3e0033766a.jpg",
  },

  {
    name:
      "5832224593794502406.jpg",

    src:
      "/drawings/5832224593794502406.jpg",
  },

  {
    name:
      "5832224593794502407.jpg",

    src:
      "/drawings/5832224593794502407.jpg",
  },

  {
    name:
      "5832224593794502408.jpg",

    src:
      "/drawings/5832224593794502408.jpg",
  },

  {
    name:
      "5832224593794502411.jpg",

    src:
      "/drawings/5832224593794502411.jpg",
  },

  {
    name:
      "6021725285402741940.jpg",

    src:
      "/drawings/6021725285402741940.jpg",
  },

  {
    name:
      "bdaac2dd-9e41-4eb7-84fe-361f43473b9a.jpg",

    src:
      "/drawings/bdaac2dd-9e41-4eb7-84fe-361f43473b9a.jpg",
  },

  {
    name:
      "f319a66b-e73f-45c1-8771-3f12f644cc59.jpg",

    src:
      "/drawings/f319a66b-e73f-45c1-8771-3f12f644cc59.jpg",
  },
];

/* ======================================================
   TYPES
====================================================== */

type Drawing =
  (typeof DRAWINGS)[number];

type XPWindow =
  | null
  | "memories"
  | "drawings"
  | "ielts"
  | "projects"
  | "migration"
  | "recycle"
  | "video"
  | "picture";

/* ======================================================
   PHYSICAL MONITOR XP TEXTURE
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

  /* SKY */

  const sky =
    ctx.createLinearGradient(
      0,
      0,
      0,
      650
    );

  sky.addColorStop(
    0,
    "#176fd1"
  );

  sky.addColorStop(
    1,
    "#7cc9ff"
  );

  ctx.fillStyle =
    sky;

  ctx.fillRect(
    0,
    0,
    1024,
    768
  );

  /* CLOUDS */

  ctx.fillStyle =
    "rgba(255,255,255,.88)";

  ctx.beginPath();

  ctx.ellipse(
    730,
    120,
    110,
    38,
    0,
    0,
    Math.PI * 2
  );

  ctx.ellipse(
    800,
    115,
    75,
    46,
    0,
    0,
    Math.PI * 2
  );

  ctx.ellipse(
    650,
    122,
    70,
    31,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  /* HILL */

  ctx.fillStyle =
    "#47a92f";

  ctx.beginPath();

  ctx.moveTo(
    0,
    560
  );

  ctx.bezierCurveTo(
    200,
    430,
    500,
    410,
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

  /* FOLDER DRAWER */

  function drawFolder(
    x: number,
    y: number,
    label: string
  ) {
    ctx.fillStyle =
      "#f5c93d";

    ctx.fillRect(
      x,
      y + 10,
      66,
      45
    );

    ctx.fillStyle =
      "#ffe164";

    ctx.fillRect(
      x,
      y,
      34,
      16
    );

    ctx.font =
      "16px Tahoma, Arial";

    ctx.fillStyle =
      "white";

    ctx.shadowColor =
      "black";

    ctx.shadowBlur =
      4;

    ctx.fillText(
      label,
      x - 2,
      y + 82
    );

    ctx.shadowBlur =
      0;
  }

  drawFolder(
    45,
    50,
    "Memories"
  );

  drawFolder(
    45,
    155,
    "Drawings"
  );

  drawFolder(
    45,
    260,
    "IELTS"
  );

  drawFolder(
    45,
    365,
    "Projects"
  );

  drawFolder(
    45,
    470,
    "Migration"
  );

  /* TASKBAR */

  const taskbar =
    ctx.createLinearGradient(
      0,
      720,
      0,
      768
    );

  taskbar.addColorStop(
    0,
    "#358be8"
  );

  taskbar.addColorStop(
    1,
    "#1554b3"
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

  const startGradient =
    ctx.createLinearGradient(
      0,
      720,
      0,
      768
    );

  startGradient.addColorStop(
    0,
    "#67ca58"
  );

  startGradient.addColorStop(
    1,
    "#258d34"
  );

  ctx.fillStyle =
    startGradient;

  ctx.fillRect(
    0,
    720,
    140,
    48
  );

  ctx.font =
    "bold italic 22px Tahoma, Arial";

  ctx.fillStyle =
    "white";

  ctx.fillText(
    "start",
    53,
    751
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.flipY =
    false;

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.needsUpdate =
    true;

  return texture;
}

/* ======================================================
   MONITOR INTERACTION
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
  } =
    useThree();

  const gltf =
    useGLTF(
      "/models/BaharRoom.glb"
    ) as any;

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
      | THREE.Material
      | THREE.Material[]
      | null
    >(null);

  const hoveredRef =
    useRef(
      false
    );

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

  const texture =
    useMemo(
      () =>
        createDesktopTexture(),
      []
    );

  const screenMaterial =
    useMemo(
      () =>
        new THREE.MeshBasicMaterial({
          map:
            texture,

          toneMapped:
            false,

          side:
            THREE.DoubleSide,
        }),
      [
        texture,
      ]
    );

  /* QUALITY */

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
    texture,
    gl,
  ]);

  /* FIND MONITOR + RAYCAST */

  useFrame(() => {
    if (
      !monitorRef.current &&
      monitorGeometry
    ) {
      let found:
        THREE.Mesh | null =
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

        monitor.material =
          screenMaterial;

        monitorRef.current =
          monitor;
      }
    }

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
        hits[0]
          .distance <=
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

  /* CLICK */

  useEffect(() => {
    function mouseDown(
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
        !enabled ||
        !hoveredRef.current
      ) {
        return;
      }

      onOpen();
    }

    window.addEventListener(
      "mousedown",
      mouseDown
    );

    return () => {
      window.removeEventListener(
        "mousedown",
        mouseDown
      );
    };
  }, [
    enabled,
    onOpen,
  ]);

  /* CLEANUP */

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
      string | null
    >(null);

  const [
    selectedDrawing,
    setSelectedDrawing,
  ] =
    useState(
      0
    );

  const currentDrawing =
    DRAWINGS[
      selectedDrawing
    ];

  /* ====================================================
     PREVIOUS DRAWING
  ==================================================== */

  function previousDrawing() {
    setSelectedDrawing(
      (
        current
      ) =>
        current ===
        0
          ? DRAWINGS.length -
            1
          : current -
            1
    );
  }

  /* ====================================================
     NEXT DRAWING
  ==================================================== */

  function nextDrawing() {
    setSelectedDrawing(
      (
        current
      ) =>
        current ===
        DRAWINGS.length -
          1
          ? 0
          : current +
            1
    );
  }

  /* ====================================================
     ESC
  ==================================================== */

  useEffect(() => {
    function keyDown(
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
        openWindow ===
        "picture"
      ) {
        setOpenWindow(
          "drawings"
        );

        return;
      }

      if (
        openWindow ===
        "video"
      ) {
        setOpenWindow(
          "memories"
        );

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
      keyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        keyDown
      );
    };
  }, [
    openWindow,
    onExit,
  ]);

  return (
    <div
      className="
        absolute
        inset-0
        z-[200]

        overflow-hidden

        select-none

        font-[Tahoma,Arial,sans-serif]
      "

      onMouseDown={() => {
        setSelectedDesktopIcon(
          null
        );
      }}
    >
      {/* =================================================
          WALLPAPER
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
          left-4
          top-4

          grid
          grid-cols-2

          gap-x-3
          gap-y-3
        "
      >
        {/* MEMORIES */}

        <DesktopIcon
          label="Memories"

          selected={
            selectedDesktopIcon ===
            "memories"
          }

          icon={
            <Folder
              size={42}
              fill="#f6d34a"
              className="
                text-[#d6a91d]
              "
            />
          }

          onClick={() =>
            setSelectedDesktopIcon(
              "memories"
            )
          }

          onDoubleClick={() =>
            setOpenWindow(
              "memories"
            )
          }
        />

        {/* DRAWINGS */}

        <DesktopIcon
          label="Drawings"

          selected={
            selectedDesktopIcon ===
            "drawings"
          }

          icon={
            <Folder
              size={42}
              fill="#f6d34a"
              className="
                text-[#d6a91d]
              "
            />
          }

          onClick={() =>
            setSelectedDesktopIcon(
              "drawings"
            )
          }

          onDoubleClick={() =>
            setOpenWindow(
              "drawings"
            )
          }
        />

        {/* IELTS */}

        <DesktopIcon
          label="IELTS"

          selected={
            selectedDesktopIcon ===
            "ielts"
          }

          icon={
            <Folder
              size={42}
              fill="#f6d34a"
              className="
                text-[#d6a91d]
              "
            />
          }

          onClick={() =>
            setSelectedDesktopIcon(
              "ielts"
            )
          }

          onDoubleClick={() =>
            setOpenWindow(
              "ielts"
            )
          }
        />

        {/* PROJECTS */}

        <DesktopIcon
          label="Projects"

          selected={
            selectedDesktopIcon ===
            "projects"
          }

          icon={
            <Folder
              size={42}
              fill="#f6d34a"
              className="
                text-[#d6a91d]
              "
            />
          }

          onClick={() =>
            setSelectedDesktopIcon(
              "projects"
            )
          }

          onDoubleClick={() =>
            setOpenWindow(
              "projects"
            )
          }
        />

        {/* MIGRATION */}

        <DesktopIcon
          label="Migration"

          selected={
            selectedDesktopIcon ===
            "migration"
          }

          icon={
            <Folder
              size={42}
              fill="#f6d34a"
              className="
                text-[#d6a91d]
              "
            />
          }

          onClick={() =>
            setSelectedDesktopIcon(
              "migration"
            )
          }

          onDoubleClick={() =>
            setOpenWindow(
              "migration"
            )
          }
        />

        {/* RECYCLE */}

        <DesktopIcon
          label="Recycle Bin"

          selected={
            selectedDesktopIcon ===
            "recycle"
          }

          icon={
            <Trash2
              size={38}
              className="
                text-white
              "
            />
          }

          onClick={() =>
            setSelectedDesktopIcon(
              "recycle"
            )
          }

          onDoubleClick={() =>
            setOpenWindow(
              "recycle"
            )
          }
        />
      </div>

      {/* =================================================
          BACK TO ROOM
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
          z-[260]

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
          size={16}
        />

        Back to room
      </button>

      {/* =================================================
          MEMORIES
      ================================================= */}

      {openWindow ===
        "memories" && (
        <XPWindowFrame
          title="Memories"

          icon={
            <FolderOpen
              size={17}
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
          <ExplorerAddress
            path={
              "C:\\Documents and Settings\\Bahar\\Desktop\\Memories"
            }
          />

          <div
            className="
              h-full
              bg-white
              p-6
            "
          >
            <FileTile
              label="BaharBirthDay.mp4"

              icon={
                <Video
                  size={48}
                  className="
                    text-[#2454a4]
                  "
                />
              }

              onDoubleClick={() =>
                setOpenWindow(
                  "video"
                )
              }
            />
          </div>
        </XPWindowFrame>
      )}

      {/* =================================================
          DRAWINGS

          STATICALLY RENDERS EVERY IMAGE
          LISTED IN DRAWINGS ABOVE.
      ================================================= */}

      {openWindow ===
        "drawings" && (
        <XPWindowFrame
          title={`Drawings (${DRAWINGS.length})`}

          width="min(1100px, 94vw)"

          height="min(720px, 86vh)"

          icon={
            <ImageIcon
              size={17}
            />
          }

          onClose={() =>
            setOpenWindow(
              null
            )
          }
        >
          <ExplorerAddress
            path={
              "C:\\Documents and Settings\\Bahar\\Desktop\\Drawings"
            }
          />

          <div
            className="
              h-full

              overflow-y-auto

              bg-white

              p-5
            "
          >
            <div
              className="
                grid

                grid-cols-2

                gap-5

                sm:grid-cols-3
                md:grid-cols-4
                lg:grid-cols-5
              "
            >
              {DRAWINGS.map(
                (
                  drawing,
                  index
                ) => (
                  <button
                    key={
                      drawing.src
                    }

                    type="button"

                    onDoubleClick={() => {
                      setSelectedDrawing(
                        index
                      );

                      setOpenWindow(
                        "picture"
                      );
                    }}

                    className="
                      group

                      flex
                      flex-col

                      rounded-sm

                      p-2

                      text-left

                      hover:bg-[#dbe9ff]

                      focus:bg-[#316ac5]
                      focus:outline-none
                    "
                  >
                    {/* THUMBNAIL */}

                    <div
                      className="
                        aspect-[4/3]

                        w-full

                        overflow-hidden

                        border
                        border-[#b7b7b7]

                        bg-[#eeeeee]

                        shadow-sm
                      "
                    >
                      <img
                        src={
                          drawing.src
                        }

                        alt={
                          drawing.name
                        }

                        loading="lazy"

                        decoding="async"

                        className="
                          h-full
                          w-full

                          object-contain
                        "
                      />
                    </div>

                    <div
                      className="
                        mt-2

                        flex
                        w-full

                        items-center
                        gap-1.5

                        text-xs

                        text-black

                        group-focus:text-white
                      "
                    >
                      <FileImage
                        size={13}
                        className="
                          shrink-0
                        "
                      />

                      <span
                        className="
                          truncate
                        "
                      >
                        {
                          drawing.name
                        }
                      </span>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        </XPWindowFrame>
      )}

      {/* =================================================
          PICTURE VIEWER
      ================================================= */}

      {openWindow ===
        "picture" &&
        currentDrawing && (
          <XPWindowFrame
            title={`${currentDrawing.name} - Windows Picture and Fax Viewer`}

            width="min(1100px, 94vw)"

            height="min(780px, 88vh)"

            icon={
              <ImageIcon
                size={17}
              />
            }

            onClose={() =>
              setOpenWindow(
                "drawings"
              )
            }
          >
            <div
              className="
                flex
                h-full

                flex-col

                bg-[#202020]
              "
            >
              {/* IMAGE */}

              <div
                className="
                  relative

                  min-h-0
                  flex-1

                  overflow-hidden

                  bg-[#202020]
                "
              >
                <img
                  src={
                    currentDrawing.src
                  }

                  alt={
                    currentDrawing.name
                  }

                  className="
                    h-full
                    w-full

                    object-contain
                  "
                />

                {/* PREVIOUS */}

                <button
                  type="button"

                  onClick={
                    previousDrawing
                  }

                  className="
                    absolute
                    left-4
                    top-1/2

                    flex
                    h-12
                    w-12

                    -translate-y-1/2

                    items-center
                    justify-center

                    rounded-full

                    bg-black/55

                    text-white

                    hover:bg-black/75
                  "
                >
                  <ChevronLeft
                    size={26}
                  />
                </button>

                {/* NEXT */}

                <button
                  type="button"

                  onClick={
                    nextDrawing
                  }

                  className="
                    absolute
                    right-4
                    top-1/2

                    flex
                    h-12
                    w-12

                    -translate-y-1/2

                    items-center
                    justify-center

                    rounded-full

                    bg-black/55

                    text-white

                    hover:bg-black/75
                  "
                >
                  <ChevronRight
                    size={26}
                  />
                </button>
              </div>

              {/* BOTTOM TOOLBAR */}

              <div
                className="
                  flex
                  h-12

                  shrink-0

                  items-center
                  justify-center

                  gap-6

                  border-t
                  border-[#777]

                  bg-gradient-to-b
                  from-[#f2f2f2]
                  to-[#bebebe]

                  text-[#333]
                "
              >
                <button
                  type="button"

                  onClick={
                    previousDrawing
                  }
                >
                  <ChevronLeft
                    size={20}
                  />
                </button>

                <span
                  className="
                    min-w-24

                    text-center

                    text-xs
                  "
                >
                  {selectedDrawing +
                    1}{" "}
                  /{" "}
                  {
                    DRAWINGS.length
                  }
                </span>

                <button
                  type="button"

                  onClick={
                    nextDrawing
                  }
                >
                  <ChevronRight
                    size={20}
                  />
                </button>
              </div>
            </div>
          </XPWindowFrame>
        )}

      {/* =================================================
          IELTS
      ================================================= */}

      {openWindow ===
        "ielts" && (
        <XPWindowFrame
          title="IELTS"

          icon={
            <BookOpen
              size={17}
            />
          }

          onClose={() =>
            setOpenWindow(
              null
            )
          }
        >
          <ExplorerAddress
            path={
              "C:\\Documents and Settings\\Bahar\\Desktop\\IELTS"
            }
          />

          <EmptyFolder
            title="This folder is empty"

            description="Nothing has been saved here yet."
          />
        </XPWindowFrame>
      )}

      {/* =================================================
          PROJECTS
      ================================================= */}

      {openWindow ===
        "projects" && (
        <XPWindowFrame
          title="Projects"

          icon={
            <BriefcaseBusiness
              size={17}
            />
          }

          onClose={() =>
            setOpenWindow(
              null
            )
          }
        >
          <ExplorerAddress
            path={
              "C:\\Documents and Settings\\Bahar\\Desktop\\Projects"
            }
          />

          <EmptyFolder
            title="This folder is empty"

            description="Nothing has been saved here yet."
          />
        </XPWindowFrame>
      )}

      {/* =================================================
          MIGRATION
      ================================================= */}

      {openWindow ===
        "migration" && (
        <XPWindowFrame
          title="Migration"

          icon={
            <Globe2
              size={17}
            />
          }

          onClose={() =>
            setOpenWindow(
              null
            )
          }
        >
          <ExplorerAddress
            path={
              "C:\\Documents and Settings\\Bahar\\Desktop\\Migration"
            }
          />

          <EmptyFolder
            title="This folder is empty"

            description="Nothing has been saved here yet."
          />
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
              size={17}
            />
          }

          onClose={() =>
            setOpenWindow(
              null
            )
          }
        >
          <EmptyFolder
            title="Recycle Bin is empty"

            description="Nothing to see here."
          />
        </XPWindowFrame>
      )}

      {/* =================================================
          VIDEO
      ================================================= */}

      {openWindow ===
        "video" && (
        <XPWindowFrame
          title="BaharBirthDay.mp4 - Windows Media Player"

          width="min(900px, 90vw)"

          height="min(680px, 82vh)"

          icon={
            <Video
              size={17}
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

              bg-black
            "
          >
            <div
              className="
                min-h-0
                flex-1
              "
            >
              <video
                src={
                  videoSrc
                }

                controls

                autoPlay

                playsInline

                preload="none"

                className="
                  h-full
                  w-full

                  object-contain
                "
              />
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
        "
      >
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

            text-lg
            font-bold
            italic

            text-white
          "
        >
          ◈ start
        </button>

        <div
          className="
            ml-auto

            flex
            h-full

            items-center

            bg-[#1493db]

            px-5

            text-xs
            text-white
          "
        >
          ♡ Bahar
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   ADDRESS
====================================================== */

function ExplorerAddress({
  path,
}: {
  path:
    string;
}) {
  return (
    <div
      className="
        flex
        h-8

        shrink-0

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
      <span>
        Address
      </span>

      <div
        className="
          flex-1

          truncate

          border
          border-[#7f9db9]

          bg-white

          px-2
          py-1
        "
      >
        {path}
      </div>
    </div>
  );
}

/* ======================================================
   EMPTY
====================================================== */

function EmptyFolder({
  title,
  description,
}: {
  title:
    string;

  description:
    string;
}) {
  return (
    <div
      className="
        flex
        h-full

        flex-col

        items-center
        justify-center

        bg-white
      "
    >
      <Folder
        size={44}
        className="
          text-[#999]
        "
      />

      <div
        className="
          mt-4

          text-sm
          font-semibold

          text-[#444]
        "
      >
        {title}
      </div>

      <div
        className="
          mt-1

          text-xs

          text-[#999]
        "
      >
        {description}
      </div>
    </div>
  );
}

/* ======================================================
   FILE
====================================================== */

function FileTile({
  label,
  icon,
  onDoubleClick,
}: {
  label:
    string;

  icon:
    React.ReactNode;

  onDoubleClick:
    () => void;
}) {
  return (
    <button
      type="button"

      onDoubleClick={
        onDoubleClick
      }

      className="
        flex
        w-36

        flex-col

        items-center

        p-2

        text-xs
        text-black

        hover:bg-[#dbe9ff]
      "
    >
      {icon}

      <span
        className="
          mt-2
          break-all
        "
      >
        {label}
      </span>
    </button>
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
   XP WINDOW
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
          "94vw",

        maxHeight:
          "88vh",

        transform:
          "translate(-50%, -50%)",
      }}

      onMouseDown={(
        event
      ) => {
        event.stopPropagation();
      }}
    >
      {/* TITLE */}

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

          <span
            className="
              truncate
            "
          >
            {title}
          </span>
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
            size={15}
          />
        </button>
      </div>

      {/* BODY */}

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