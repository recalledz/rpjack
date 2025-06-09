

let initialized = false;
let app = null;



export async function initStarChart(containerId = "star-chart-container") {
  if (initialized) return;
    // Guard against running in a non-browser environment or without PIXI loaded
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof PIXI === "undefined" ||
    !PIXI.filters ||
    !PIXI.filters.GlowFilter
  ) {
    console.warn("Pixi.js unavailable; skipping star chart initialization.");
    return;
  }
  const container =
    typeof containerId === "string"
      ? document.getElementById(containerId)
      : containerId;
  if (!container) return;
  app = new PIXI.Application({
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight,
    backgroundColor: 0x000000,
    antialias: true
  });
  container.appendChild(app.view);

  const STAR_URL = 'https://cdn.jsdelivr.net/gh/josephsurin/assets@main/glow-star.png';
  const nodes = [
    { id: 1, x: 0.5, y: 0.9 },
    { id: 2, x: 0.3, y: 0.75 },
    { id: 3, x: 0.5, y: 0.75 },
    { id: 4, x: 0.7, y: 0.75 },
    { id: 5, x: 0.2, y: 0.55 },
    { id: 6, x: 0.1, y: 0.35 },
    { id: 7, x: 0.4, y: 0.55 },
    { id: 8, x: 0.6, y: 0.55 },
    { id: 9, x: 0.8, y: 0.55 },
    { id: 10, x: 0.9, y: 0.35 }
  ];
  const edges = [
    [1, 2], [1, 3], [1, 4],
    [2, 5], [5, 6],
    [3, 7],
    [4, 8], [4, 9], [9, 10]
  ];

  const loader = new PIXI.Loader();
  loader.add('star', STAR_URL);
  loader.load((loader, resources) => {
    const starTexture = resources.star.texture;

    edges.forEach(([a, b]) => {
      const n1 = nodes[a - 1];
      const n2 = nodes[b - 1];
      const line = new PIXI.Graphics();
      line.lineStyle(2, 0x448aff, 0.4);
      line.moveTo(n1.x * app.screen.width, n1.y * app.screen.height);
      line.lineTo(n2.x * app.screen.width, n2.y * app.screen.height);
      app.stage.addChild(line);
    });

    nodes.forEach(n => {
      const x = n.x * app.screen.width;
      const y = n.y * app.screen.height;

      const star = new PIXI.Sprite(starTexture);
      star.anchor.set(0.5);
      star.position.set(x, y);
      star.scale.set(0.4);
      star.filters = [new PIXI.filters.GlowFilter({
        distance: 10,
        outerStrength: 4,
        color: 0xffffff
      })];
      app.stage.addChild(star);

      const label = new PIXI.Text(n.id.toString(), {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffcc00
      });
      label.anchor.set(0.5);
      label.position.set(x, y - 25);
      app.stage.addChild(label);
    });
    initialized = true;
  });
}
