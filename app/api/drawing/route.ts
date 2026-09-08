import fs from "node:fs/promises";
import path from "node:path";

/*
 * This route is generated statically during the Next.js build.
 *
 * So:
 *
 * public/drawings/
 *     image-a.jpg
 *     image-b.jpg
 *     image-c.jpg
 *
 * automatically becomes:
 *
 * [
 *   { name: "image-a.jpg", src: "/drawings/image-a.jpg" },
 *   { name: "image-b.jpg", src: "/drawings/image-b.jpg" },
 *   { name: "image-c.jpg", src: "/drawings/image-c.jpg" }
 * ]
 *
 * Every Vercel deployment rebuilds this list.
 */

export const runtime = "nodejs";
export const dynamic = "force-static";

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
];

export async function GET() {
  try {
    const drawingsDirectory =
      path.join(
        process.cwd(),
        "public",
        "drawings"
      );

    const files =
      await fs.readdir(
        drawingsDirectory
      );

    const drawings =
      files
        .filter((file) => {
          const extension =
            path
              .extname(file)
              .toLowerCase();

          return ALLOWED_EXTENSIONS.includes(
            extension
          );
        })
        .sort((a, b) =>
          a.localeCompare(
            b,
            undefined,
            {
              numeric: true,
            }
          )
        )
        .map((file) => ({
          name: file,

          src: `/drawings/${encodeURIComponent(
            file
          )}`,
        }));

    return Response.json(
      drawings
    );
  } catch (error) {
    console.error(
      "Failed to read public/drawings:",
      error
    );

    return Response.json(
      []
    );
  }
}