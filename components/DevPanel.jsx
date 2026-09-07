"use client";

function round(value) {
  return Number(value.toFixed(3));
}

function degrees(value) {
  return Number(
    ((value * 180) / Math.PI).toFixed(1)
  );
}

export default function DevPanel({
  selected,
  setSelected,
  mode,
  setMode,
  space,
  setSpace,
  revision,
}) {
  if (!selected) {
    return (
      <div className="absolute left-4 top-4 z-50 rounded-lg bg-black/80 p-4 text-sm text-white">
        DEV MODE
        <div className="mt-2 text-neutral-400">
          Click an object
        </div>
      </div>
    );
  }

  const p = selected.position;
  const r = selected.rotation;
  const s = selected.scale;

  async function copyTransform() {
    const code =
`position={[${round(p.x)}, ${round(p.y)}, ${round(p.z)}]}
rotation={[${round(r.x)}, ${round(r.y)}, ${round(r.z)}]}
scale={[${round(s.x)}, ${round(s.y)}, ${round(s.z)}]}`;

    await navigator.clipboard.writeText(code);
  }

  function selectParent() {
    const parent = selected.parent;

    if (
      parent &&
      parent.type !== "Scene"
    ) {
      setSelected(parent);
    }
  }

  return (
    <div className="absolute left-4 top-4 z-50 w-72 rounded-xl bg-black/90 p-4 text-sm text-white backdrop-blur">
      <div className="mb-3">
        <div className="text-xs text-neutral-500">
          SELECTED
        </div>

        <div className="font-semibold">
          {selected.name || "(unnamed object)"}
        </div>

        <div className="text-xs text-neutral-400">
          {selected.type}
        </div>
      </div>

      {/* Tools */}

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setMode("translate")}
          className={
            mode === "translate"
              ? "rounded bg-white px-3 py-2 text-black"
              : "rounded bg-neutral-800 px-3 py-2"
          }
        >
          Move
        </button>

        <button
          onClick={() => setMode("rotate")}
          className={
            mode === "rotate"
              ? "rounded bg-white px-3 py-2 text-black"
              : "rounded bg-neutral-800 px-3 py-2"
          }
        >
          Rotate
        </button>

        <button
          onClick={() => setMode("scale")}
          className={
            mode === "scale"
              ? "rounded bg-white px-3 py-2 text-black"
              : "rounded bg-neutral-800 px-3 py-2"
          }
        >
          Scale
        </button>
      </div>

      {/* Coordinate system */}

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSpace("world")}
          className={
            space === "world"
              ? "rounded bg-white px-3 py-1 text-black"
              : "rounded bg-neutral-800 px-3 py-1"
          }
        >
          World
        </button>

        <button
          onClick={() => setSpace("local")}
          className={
            space === "local"
              ? "rounded bg-white px-3 py-1 text-black"
              : "rounded bg-neutral-800 px-3 py-1"
          }
        >
          Local
        </button>
      </div>

      {/* Transform */}

      <div className="space-y-3 font-mono text-xs">
        <div>
          <div className="text-neutral-500">
            POSITION
          </div>

          <div>
            X {round(p.x)}
          </div>
          <div>
            Y {round(p.y)}
          </div>
          <div>
            Z {round(p.z)}
          </div>
        </div>

        <div>
          <div className="text-neutral-500">
            ROTATION
          </div>

          <div>
            X {degrees(r.x)}°
          </div>
          <div>
            Y {degrees(r.y)}°
          </div>
          <div>
            Z {degrees(r.z)}°
          </div>
        </div>

        <div>
          <div className="text-neutral-500">
            SCALE
          </div>

          <div>
            X {round(s.x)}
          </div>
          <div>
            Y {round(s.y)}
          </div>
          <div>
            Z {round(s.z)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={selectParent}
          className="rounded bg-neutral-800 px-3 py-2"
        >
          Select Parent
        </button>

        <button
          onClick={copyTransform}
          className="rounded bg-neutral-800 px-3 py-2"
        >
          Copy Transform
        </button>

        <button
          onClick={() => setSelected(null)}
          className="rounded bg-neutral-800 px-3 py-2"
        >
          Deselect
        </button>
      </div>

      <div className="mt-4 border-t border-neutral-800 pt-3 text-xs text-neutral-500">
        revision {revision}
      </div>
    </div>
  );
}