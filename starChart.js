let initialized = false;

export function initStarChart(containerId = "star-chart-container") {
  if (initialized) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  // Create Pixi app
  const app = new PIXI.Application({
    width:  container.clientWidth,
    height: container.clientHeight,
    backgroundColor: 0x000000,
    antialias: true
  });
  container.appendChild(app.view);

  // Background sprite (your generated image)
  const bg = PIXI.Sprite.from("./space-bg.png");
  bg.width  = app.screen.width;
  bg.height = app.screen.height;
  app.stage.addChild(bg);

  // Star nodes and connections
  const nodes = [
    { id:1, x:0.5, y:0.9 },
    /* …others… */
    { id:10,x:0.9, y:0.35 }
  ];
  const edges = [[1,2],[1,3],[1,4],[2,5],[5,6],[3,7],[4,8],[4,9],[9,10]];

  // Load the glow-star sprite
  PIXI.Loader.shared
    .add("star", "glow-star.png")
    .load((loader, resources) => {
      // Draw connections
      for (const [a,b] of edges) {
        const s = new PIXI.Graphics();
        s.lineStyle(2, 0x448aff, 0.4)
         .moveTo(nodes[a-1].x * app.screen.width, nodes[a-1].y * app.screen.height)
         .lineTo(nodes[b-1].x * app.screen.width, nodes[b-1].y * app.screen.height);
        app.stage.addChild(s);
      }

      // Draw star sprites
      for (const n of nodes) {
        const sprite = new PIXI.Sprite(resources.star.texture);
        sprite.anchor.set(0.5);
        sprite.position.set(n.x * app.screen.width, n.y * app.screen.height);
        sprite.scale.set(0.4);
        sprite.filters = [ new PIXI.filters.GlowFilter({
          distance:      10,
          outerStrength: 4,
          color:         0xffffff
        })];
        app.stage.addChild(sprite);
      }
    });

  initialized = true;
}
