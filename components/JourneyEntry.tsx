"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useProgress,
} from "@react-three/drei";

import {
  DoorOpen,
  Heart,
  LoaderCircle,
  Play,
  Sparkles,
} from "lucide-react";

type JourneyEntryProps = {
  visible: boolean;

  onEnter: () => void;
};

/* ======================================================
   JOURNEY ENTRY
====================================================== */

export default function JourneyEntry({
  visible,
  onEnter,
}: JourneyEntryProps) {
  const {
    active,
    progress,
    loaded,
    total,
  } = useProgress();

  /*
   * We smooth the displayed percentage.
   *
   * Three loaders sometimes jump:
   * 0 → 70 → 100
   *
   * This makes the UI feel much nicer.
   */

  const [
    displayedProgress,
    setDisplayedProgress,
  ] =
    useState(0);

  const realProgress =
    Math.min(
      100,
      Math.max(
        0,
        progress
      )
    );

  const ready =
    !active &&
    realProgress >=
      99.5;

  /* ====================================================
     SMOOTH PROGRESS
  ==================================================== */

  useEffect(() => {
    const target =
      ready
        ? 100
        : Math.min(
            realProgress,
            97
          );

    const timer =
      window.setInterval(
        () => {
          setDisplayedProgress(
            (
              current
            ) => {
              if (
                Math.abs(
                  target -
                    current
                ) <
                0.25
              ) {
                return target;
              }

              const difference =
                target -
                current;

              const step =
                Math.max(
                  0.35,
                  Math.abs(
                    difference
                  ) *
                    0.08
                );

              if (
                difference >
                0
              ) {
                return Math.min(
                  target,
                  current +
                    step
                );
              }

              return Math.max(
                target,
                current -
                  step
              );
            }
          );
        },
        16
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    realProgress,
    ready,
  ]);

  /* ====================================================
     STATUS COPY
  ==================================================== */

  const loadingMessage =
    useMemo(() => {
      if (
        ready
      ) {
        return {
          title:
            "Everything is in place.",

          description:
            "The room is ready for you.",
        };
      }

      if (
        displayedProgress <
        20
      ) {
        return {
          title:
            "Opening the door…",

          description:
            "Preparing the world behind it.",
        };
      }

      if (
        displayedProgress <
        45
      ) {
        return {
          title:
            "Bringing the room to life…",

          description:
            "Walls, furniture, and little details are taking their places.",
        };
      }

      if (
        displayedProgress <
        70
      ) {
        return {
          title:
            "Hanging the drawings…",

          description:
            "Some things deserve exactly the right place.",
        };
      }

      if (
        displayedProgress <
        90
      ) {
        return {
          title:
            "Turning on the lights…",

          description:
            "Adding a little warmth before you arrive.",
        };
      }

      return {
        title:
          "Almost there…",

        description:
          "Just a few final details.",
      };
    }, [
      displayedProgress,
      ready,
    ]);

  if (
    !visible
  ) {
    return null;
  }

  const roundedProgress =
    Math.round(
      displayedProgress
    );

  /* ====================================================
     UI
  ==================================================== */

  return (
    <div
      className="
        absolute
        inset-0
        z-[100]

        flex
        items-center
        justify-center

        overflow-hidden

        bg-[#050507]
      "
    >
      {/* =================================================
          BACKGROUND GLOW
      ================================================= */}

      <div
        className="
          pointer-events-none

          absolute
          -left-32
          -top-32

          h-[420px]
          w-[420px]

          rounded-full

          bg-fuchsia-500/15

          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none

          absolute
          -bottom-40
          -right-20

          h-[480px]
          w-[480px]

          rounded-full

          bg-cyan-400/15

          blur-[130px]
        "
      />

      <div
        className="
          pointer-events-none

          absolute
          left-1/2
          top-1/2

          h-[360px]
          w-[360px]

          -translate-x-1/2
          -translate-y-1/2

          rounded-full

          bg-violet-500/10

          blur-[120px]
        "
      />

      {/* =================================================
          CARD
      ================================================= */}

      <div
        className="
          relative

          w-[min(520px,calc(100vw-32px))]

          overflow-hidden

          rounded-[32px]

          border
          border-white/10

          bg-black/55

          p-8

          text-white

          shadow-2xl

          backdrop-blur-2xl
        "
      >
        {/* COLOR LINE */}

        <div
          className="
            absolute
            left-0
            right-0
            top-0

            h-[2px]

            bg-gradient-to-r
            from-fuchsia-500
            via-violet-400
            to-cyan-400
          "
        />

        {/* =================================================
            ICON
        ================================================= */}

        <div
          className="
            mb-6
            flex
            justify-center
          "
        >
          <div
            className="
              relative

              flex
              h-16
              w-16

              items-center
              justify-center

              rounded-2xl

              border
              border-white/10

              bg-white/5
            "
          >
            <div
              className="
                absolute
                inset-0

                rounded-2xl

                bg-gradient-to-br
                from-fuchsia-500/20
                via-violet-500/10
                to-cyan-400/20
              "
            />

            {ready ? (
              <DoorOpen
                className="
                  relative
                  text-white
                "
                size={27}
                strokeWidth={
                  1.7
                }
              />
            ) : (
              <Sparkles
                className="
                  relative
                  text-white
                "
                size={27}
                strokeWidth={
                  1.7
                }
              />
            )}
          </div>
        </div>

        {/* =================================================
            MAIN COPY
        ================================================= */}

        <div
          className="
            text-center
          "
        >
          <div
            className="
              mb-2

              text-[11px]
              font-semibold

              uppercase

              tracking-[0.28em]

              text-white/40
            "
          >
            A place made for you
          </div>

          <h1
            className="
              bg-gradient-to-r
              from-fuchsia-200
              via-white
              to-cyan-200

              bg-clip-text

              text-2xl
              font-medium
              leading-snug

              text-transparent
            "
          >
            A little world made
            from the things that
            feel like you.
          </h1>

          <p
            className="
              mx-auto
              mt-3

              max-w-[400px]

              text-sm
              leading-6

              text-white/50
            "
          >
            Your drawings,
            memories, lights,
            and tiny surprises
            are finding their
            place. When
            everything is ready,
            the door will open.
          </p>
        </div>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <div
          className="
            mt-8
          "
        >
          <div
            className="
              mb-3

              flex
              items-end
              justify-between
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2

                  text-sm
                  font-medium

                  text-white/80
                "
              >
                {!ready && (
                  <LoaderCircle
                    size={14}
                    className="
                      animate-spin
                    "
                  />
                )}

                {ready && (
                  <Heart
                    size={14}
                    fill="currentColor"
                    className="
                      text-fuchsia-300
                    "
                  />
                )}

                {
                  loadingMessage.title
                }
              </div>

              <div
                className="
                  mt-1

                  text-xs

                  text-white/35
                "
              >
                {
                  loadingMessage.description
                }
              </div>
            </div>

            <div
              className="
                bg-gradient-to-r
                from-fuchsia-300
                via-violet-300
                to-cyan-300

                bg-clip-text

                text-2xl
                font-semibold

                tabular-nums

                text-transparent
              "
            >
              {
                roundedProgress
              }
              %
            </div>
          </div>

          {/* PROGRESS TRACK */}

          <div
            className="
              relative

              h-3

              overflow-hidden

              rounded-full

              border
              border-white/5

              bg-white/[0.06]
            "
          >
            <div
              className="
                absolute
                inset-y-0
                left-0

                rounded-full

                bg-gradient-to-r
                from-fuchsia-500
                via-violet-500
                to-cyan-400

                shadow-[0_0_24px_rgba(168,85,247,.45)]

                transition-[width]
                duration-100
              "
              style={{
                width:
                  `${roundedProgress}%`,
              }}
            >
              {/* SHINE */}

              <div
                className="
                  absolute
                  inset-0

                  animate-pulse

                  bg-gradient-to-r
                  from-transparent
                  via-white/30
                  to-transparent
                "
              />
            </div>
          </div>

          {/* OPTIONAL TECH DETAIL */}

          {total > 0 && (
            <div
              className="
                mt-2

                text-right

                text-[10px]

                text-white/20
              "
            >
              {loaded} /{" "}
              {total} essential
              assets ready
            </div>
          )}
        </div>

        {/* =================================================
            ENTER
        ================================================= */}

        <button
          type="button"

          disabled={
            !ready
          }

          onClick={
            onEnter
          }

          className={`
            mt-7

            flex
            w-full

            items-center
            justify-center
            gap-2

            rounded-2xl

            px-5
            py-3.5

            text-sm
            font-medium

            transition-all
            duration-300

            ${
              ready
                ? `
                  bg-gradient-to-r
                  from-fuchsia-500
                  via-violet-500
                  to-cyan-500

                  text-white

                  shadow-[0_12px_40px_rgba(139,92,246,.25)]

                  hover:scale-[1.015]
                  hover:shadow-[0_16px_50px_rgba(139,92,246,.35)]
                `
                : `
                  cursor-not-allowed

                  bg-white/[0.06]

                  text-white/25
                `
            }
          `}
        >
          {ready ? (
            <>
              <Play
                size={16}
                fill="currentColor"
              />

              Begin the journey
            </>
          ) : (
            <>
              <LoaderCircle
                size={16}
                className="
                  animate-spin
                "
              />

              Preparing your room
            </>
          )}
        </button>

        {/* =================================================
            FOOTNOTE
        ================================================= */}

        <div
          className="
            mt-4

            text-center

            text-[10px]

            text-white/25
          "
        >
          The first visit may
          take a moment. The
          next one should feel
          much faster.
        </div>
      </div>
    </div>
  );
}