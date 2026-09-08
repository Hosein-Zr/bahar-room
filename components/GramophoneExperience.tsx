"use client";

import {
  useCallback,
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
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";

/* ======================================================
   STATIC PLAYLIST

   Files are loaded directly from public/musics.
   No API. No dynamic folder reading.
====================================================== */

const MUSIC_TRACKS = [
  {
    title: "Alireza Ghorbani 1",
    src: "/musics/Alireza Ghorbani 1.mp3",
  },
  {
    title: "Alireza Ghorbani 2",
    src: "/musics/Alireza Ghorbani 2.mp3",
  },
  {
    title: "Alireza Ghorbani 3",
    src: "/musics/Alireza Ghorbani 3.mp3",
  },
  {
    title: "Alireza Ghorbani 4",
    src: "/musics/Alireza Ghorbani 4.mp3",
  },
  {
    title: "Alireza Ghorbani 5",
    src: "/musics/Alireza Ghorbani 5.mp3",
  },
  {
    title: "Naser Abdollahi 1",
    src: "/musics/Naser Abdollahi 1.mp3",
  },
  {
    title: "Naser Abdollahi 2",
    src: "/musics/Naser Abdollahi 2.mp3",
  },
  {
    title: "Naser Abdollahi 3",
    src: "/musics/Naser Abdollahi 3.mp3",
  },
] as const;

/* ======================================================
   ACTUAL GRAMOPHONE MESHES FROM BaharRoom.glb
====================================================== */

const GRAMOPHONE_NODE_NAMES = [
  "base_low_test_0",
  "igla_low_test_0",
  "klyapki_low_test_0",
  "nojki_low_test_0",
  "plastina_low_test_0",
  "rukoyatka_low_test_0",
  "truba_low_test_0",
] as const;

const TRACK_CHANGE_EVENT =
  "bahar-room-gramophone-track-change";

/* ======================================================
   SHARED AUDIO

   The interaction lives inside <Canvas>, while the navbar
   lives outside <Canvas> in Scene.tsx.

   Both use this same audio instance.
====================================================== */

let sharedAudio:
  HTMLAudioElement | null =
    null;

let sharedTrackIndex = 0;

function emitTrackChange() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      TRACK_CHANGE_EVENT,
      {
        detail: {
          index:
            sharedTrackIndex,
        },
      }
    )
  );
}

function ensureAudio() {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  if (
    sharedAudio
  ) {
    return sharedAudio;
  }

  const audio =
    new Audio();

  audio.preload =
    "none";

  audio.addEventListener(
    "ended",
    () => {
      const next =
        (
          sharedTrackIndex +
          1
        ) %
        MUSIC_TRACKS.length;

      void playTrack(
        next
      );
    }
  );

  sharedAudio =
    audio;

  return audio;
}

async function playTrack(
  index: number
) {
  const audio =
    ensureAudio();

  if (
    !audio
  ) {
    return;
  }

  const safeIndex =
    (
      index +
      MUSIC_TRACKS.length
    ) %
    MUSIC_TRACKS.length;

  sharedTrackIndex =
    safeIndex;

  const track =
    MUSIC_TRACKS[
      safeIndex
    ];

  audio.src =
    track.src;

  audio.load();

  emitTrackChange();

  try {
    await audio.play();
  } catch (
    error
  ) {
    console.warn(
      "Could not play gramophone audio:",
      error
    );
  }
}

function startOrResumeFromUserGesture() {
  const audio =
    ensureAudio();

  if (
    !audio
  ) {
    return;
  }

  if (
    !audio.src
  ) {
    void playTrack(
      sharedTrackIndex
    );

    return;
  }

  if (
    audio.paused
  ) {
    void audio
      .play()
      .catch(
        (
          error
        ) => {
          console.warn(
            "Could not resume gramophone audio:",
            error
          );
        }
      );
  }
}

/* ======================================================
   INTERACTION INSIDE THE 3D CANVAS
====================================================== */

type GramophoneExperienceProps = {
  enabled:
    boolean;

  maxDistance?:
    number;

  onHoverChange?: (
    hovered:
      boolean
  ) => void;

  onOpen:
    () => void;
};

export default function GramophoneExperience({
  enabled,

  maxDistance =
    3.5,

  onHoverChange,

  onOpen,
}: GramophoneExperienceProps) {
  const {
    camera,
    scene,
  } =
    useThree();

  const gltf =
    useGLTF(
      "/models/BaharRoom.glb"
    ) as any;

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

  const geometries =
    useMemo(() => {
      const result:
        THREE.BufferGeometry[] =
          [];

      for (
        const nodeName
        of GRAMOPHONE_NODE_NAMES
      ) {
        const geometry =
          gltf.nodes?.[
            nodeName
          ]?.geometry;

        if (
          geometry
        ) {
          result.push(
            geometry
          );
        }
      }

      return result;
    }, [
      gltf.nodes,
    ]);

  const geometrySet =
    useMemo(
      () =>
        new Set(
          geometries
        ),
      [
        geometries,
      ]
    );

  const meshesRef =
    useRef<
      THREE.Mesh[]
    >([]);

  const searchedRef =
    useRef(false);

  const hoveredRef =
    useRef(false);

  /* ====================================================
     FIND THE ACTUAL RENDERED GRAMOPHONE + HOVER
  ==================================================== */

  useFrame(() => {
    if (
      !searchedRef.current &&
      geometrySet.size >
        0
    ) {
      const found:
        THREE.Mesh[] =
          [];

      scene.traverse(
        (
          object
        ) => {
          const mesh =
            object as
              THREE.Mesh;

          if (
            !mesh.isMesh
          ) {
            return;
          }

          if (
            geometrySet.has(
              mesh.geometry
            )
          ) {
            found.push(
              mesh
            );
          }
        }
      );

      if (
        found.length >
        0
      ) {
        meshesRef.current =
          found;

        searchedRef.current =
          true;
      }
    }

    let hovering =
      false;

    if (
      enabled &&
      meshesRef.current
        .length > 0
    ) {
      raycaster.setFromCamera(
        center,
        camera
      );

      const hits =
        raycaster.intersectObjects(
          meshesRef.current,
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

      onHoverChange?.(
        hovering
      );
    }
  });

  /* ====================================================
     CLICK GRAMOPHONE
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
        !enabled ||
        !hoveredRef.current
      ) {
        return;
      }

      /*
       * Start playback during the actual user click.
       * This avoids browser autoplay blocking.
       */

      startOrResumeFromUserGesture();

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

  return null;
}

/* ======================================================
   REAL DOM MUSIC NAVBAR

   IMPORTANT:
   This component must be rendered OUTSIDE <Canvas>.

   It is a real webpage navbar, not Drei <Html>.
====================================================== */

type GramophonePlayerBarProps = {
  onClose:
    () => void;

  autoHideMs?:
    number;
};

export function GramophonePlayerBar({
  onClose,

  autoHideMs =
    3800,
}: GramophonePlayerBarProps) {
  const [
    currentTrack,
    setCurrentTrack,
  ] =
    useState(
      sharedTrackIndex
    );

  const [
    playing,
    setPlaying,
  ] =
    useState(false);

  const [
    currentTime,
    setCurrentTime,
  ] =
    useState(0);

  const [
    duration,
    setDuration,
  ] =
    useState(0);

  const [
    controlsVisible,
    setControlsVisible,
  ] =
    useState(true);

  const hideTimerRef =
    useRef<
      number | null
    >(null);

  const clearHideTimer =
    useCallback(() => {
      if (
        hideTimerRef.current ===
        null
      ) {
        return;
      }

      window.clearTimeout(
        hideTimerRef.current
      );

      hideTimerRef.current =
        null;
    }, []);

  const scheduleHide =
    useCallback(() => {
      clearHideTimer();

      hideTimerRef.current =
        window.setTimeout(
          () => {
            setControlsVisible(
              false
            );

            hideTimerRef.current =
              null;
          },
          autoHideMs
        );
    }, [
      autoHideMs,
      clearHideTimer,
    ]);

  const revealControls =
    useCallback(() => {
      clearHideTimer();

      setControlsVisible(
        true
      );
    }, [
      clearHideTimer,
    ]);

  const revealTemporarily =
    useCallback(() => {
      setControlsVisible(
        true
      );

      scheduleHide();
    }, [
      scheduleHide,
    ]);

  /* ====================================================
     AUDIO EVENTS
  ==================================================== */

  useEffect(() => {
    const audio =
      ensureAudio();

    if (
      !audio
    ) {
      return;
    }

    setCurrentTrack(
      sharedTrackIndex
    );

    setPlaying(
      !audio.paused
    );

    setCurrentTime(
      audio.currentTime ||
        0
    );

    setDuration(
      Number.isFinite(
        audio.duration
      )
        ? audio.duration
        : 0
    );

    const handlePlay =
      () => {
        setPlaying(
          true
        );
      };

    const handlePause =
      () => {
        setPlaying(
          false
        );
      };

    const handleTime =
      () => {
        setCurrentTime(
          audio.currentTime ||
            0
        );
      };

    const handleDuration =
      () => {
        setDuration(
          Number.isFinite(
            audio.duration
          )
            ? audio.duration
            : 0
        );
      };

    const handleTrackChange =
      (
        event:
          Event
      ) => {
        const customEvent =
          event as
            CustomEvent<{
              index:
                number;
            }>;

        setCurrentTrack(
          customEvent.detail
            .index
        );

        setCurrentTime(
          0
        );

        setDuration(
          0
        );

        revealTemporarily();
      };

    audio.addEventListener(
      "play",
      handlePlay
    );

    audio.addEventListener(
      "pause",
      handlePause
    );

    audio.addEventListener(
      "timeupdate",
      handleTime
    );

    audio.addEventListener(
      "loadedmetadata",
      handleDuration
    );

    audio.addEventListener(
      "durationchange",
      handleDuration
    );

    window.addEventListener(
      TRACK_CHANGE_EVENT,
      handleTrackChange
    );

    return () => {
      audio.removeEventListener(
        "play",
        handlePlay
      );

      audio.removeEventListener(
        "pause",
        handlePause
      );

      audio.removeEventListener(
        "timeupdate",
        handleTime
      );

      audio.removeEventListener(
        "loadedmetadata",
        handleDuration
      );

      audio.removeEventListener(
        "durationchange",
        handleDuration
      );

      window.removeEventListener(
        TRACK_CHANGE_EVENT,
        handleTrackChange
      );
    };
  }, [
    revealTemporarily,
  ]);

  /* ====================================================
     AUTO HIDE
  ==================================================== */

  useEffect(() => {
    scheduleHide();

    return () => {
      clearHideTimer();
    };
  }, [
    clearHideTimer,
    scheduleHide,
  ]);

  /* ====================================================
     ESCAPE CLOSES THE PLAYER UI

     Audio is intentionally left playing.
  ==================================================== */

  useEffect(() => {
    function handleKeyDown(
      event:
        KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onClose();
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
    onClose,
  ]);

  /* ====================================================
     CONTROLS
  ==================================================== */

  function togglePlayPause() {
    const audio =
      ensureAudio();

    revealTemporarily();

    if (
      !audio
    ) {
      return;
    }

    if (
      !audio.src
    ) {
      void playTrack(
        sharedTrackIndex
      );

      return;
    }

    if (
      audio.paused
    ) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  function previousTrack() {
    revealTemporarily();

    const previous =
      sharedTrackIndex ===
      0
        ? MUSIC_TRACKS.length -
          1
        : sharedTrackIndex -
          1;

    void playTrack(
      previous
    );
  }

  function nextTrack() {
    revealTemporarily();

    const next =
      (
        sharedTrackIndex +
        1
      ) %
      MUSIC_TRACKS.length;

    void playTrack(
      next
    );
  }

  function seek(
    value:
      number
  ) {
    const audio =
      ensureAudio();

    if (
      !audio ||
      !Number.isFinite(
        audio.duration
      )
    ) {
      return;
    }

    const nextTime =
      Math.min(
        Math.max(
          value,
          0
        ),
        audio.duration
      );

    audio.currentTime =
      nextTime;

    setCurrentTime(
      nextTime
    );
  }

  const progressPercent =
    duration > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (
              currentTime /
              duration
            ) * 100
          )
        )
      : 0;

  /* ====================================================
     NAVBAR

     Expanded:
       full-width top navbar

     Hidden:
       only the progress strip remains at the top

     Hover the strip:
       controls return
  ==================================================== */

  return (
    <div
      data-gramophone-player="true"

      onMouseEnter={
        revealControls
      }

      onMouseLeave={
        scheduleHide
      }

      className={`
        fixed
        left-0
        right-0
        top-0
        z-[999999]

        overflow-hidden

        border-b
        border-white/10

        text-white

        backdrop-blur-2xl

        transition-[height,background-color,box-shadow]
        duration-300
        ease-out

        ${
          controlsVisible
            ? `
              h-[58px]
              bg-[#080808]/95
              shadow-[0_8px_30px_rgba(0,0,0,0.30)]
            `
            : `
              h-[8px]
              bg-black/35
            `
        }
      `}
    >
      {/* =================================================
          NAVBAR CONTENT
      ================================================= */}

      <div
        className={`
          absolute
          left-0
          right-0
          top-0

          flex
          h-[54px]
          items-center

          px-5

          transition-all
          duration-200

          ${
            controlsVisible
              ? `
                translate-y-0
                opacity-100
              `
              : `
                pointer-events-none
                -translate-y-2
                opacity-0
              `
          }
        `}
      >
        {/* TRACK */}

        <div
          className="
            flex
            min-w-0
            flex-1
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center

              rounded-full

              bg-white/10

              text-white/80
            "
          >
            <Music2
              size={17}
            />
          </div>

          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-white/35
              "
            >
              Now playing
            </div>

            <div
              className="
                mt-0.5
                max-w-[260px]
                truncate

                text-sm
                font-medium
                text-white/90
              "
            >
              {
                MUSIC_TRACKS[
                  currentTrack
                ].title
              }
            </div>
          </div>
        </div>

        {/* CENTER CONTROLS */}

        <div
          className="
            absolute
            left-1/2
            top-1/2

            flex
            -translate-x-1/2
            -translate-y-1/2
            items-center
            gap-1
          "
        >
          <button
            type="button"
            aria-label="Previous track"
            onClick={
              previousTrack
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-full

              text-white/60

              transition

              hover:bg-white/10
              hover:text-white
            "
          >
            <SkipBack
              size={17}
              fill="currentColor"
            />
          </button>

          <button
            type="button"
            aria-label={
              playing
                ? "Pause"
                : "Play"
            }
            onClick={
              togglePlayPause
            }
            className="
              mx-1

              flex
              h-10
              w-10
              items-center
              justify-center

              rounded-full

              bg-white

              text-black

              transition

              hover:scale-105
            "
          >
            {playing ? (
              <Pause
                size={17}
                fill="currentColor"
              />
            ) : (
              <Play
                size={17}
                fill="currentColor"
                className="translate-x-[1px]"
              />
            )}
          </button>

          <button
            type="button"
            aria-label="Next track"
            onClick={
              nextTrack
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-full

              text-white/60

              transition

              hover:bg-white/10
              hover:text-white
            "
          >
            <SkipForward
              size={17}
              fill="currentColor"
            />
          </button>
        </div>

        {/* TRACK NUMBER */}

        <div
          className="
            flex-1
            text-right

            text-xs
            tabular-nums
            text-white/35
          "
        >
          {currentTrack + 1}
          <span
            className="
              mx-1.5
              text-white/15
            "
          >
            /
          </span>
          {MUSIC_TRACKS.length}
        </div>
      </div>

      {/* =================================================
          PROGRESS — ALWAYS VISIBLE
      ================================================= */}

      <div
        className="
          absolute
          bottom-0
          left-0
          right-0

          h-[4px]

          bg-white/10
        "
      >
        <div
          className="
            h-full
            bg-white/90

            transition-[width]
            duration-100
            ease-linear
          "
          style={{
            width:
              `${progressPercent}%`,
          }}
        />
      </div>

      {/* SEEK */}

      <input
        type="range"
        aria-label="Music progress"
        min={0}
        max={
          duration > 0
            ? duration
            : 1
        }
        step={0.1}
        value={
          duration > 0
            ? Math.min(
                currentTime,
                duration
              )
            : 0
        }
        onPointerDown={
          revealControls
        }
        onChange={(
          event
        ) => {
          seek(
            Number(
              event.target.value
            )
          );
        }}
        className="
          absolute
          bottom-0
          left-0
          right-0
          z-10

          h-[10px]
          w-full

          cursor-pointer

          opacity-0
        "
      />
    </div>
  );
}
