// starChart.js

let initialized = false;
let app = null;

export function initStarChart(containerId = "star-chart-container") {
  if (initialized) return;
  initialized = true;

  // 1) Find the container
  const container =
    typeof containerId === "string"
      ? document.getElementById(containerId)
      : containerId;
  if (!container) {
    console.error("Star chart container not found:", containerId);
    return;
  }

  // 2) Create the PIXI Application
  app = new PIXI.Application({
    width:  container.clientWidth  || window.innerWidth,
    height: container.clientHeight || window.innerHeight,
    backgroundColor: 0x000000,
    antialias: true
  });
  container.appendChild(app.view);
  

   
  // 3) Helper to create & cache a glowing-star texture
  function makeStarTexture() {
    const g = new PIXI.Graphics();
    const spikes      = 5;
    const outerRadius = 12;
    const innerRadius = 6;
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;

    g.beginFill(0xffffff);
    g.moveTo(0, -outerRadius);
    for (let i = 0; i < spikes; i++) {
      g.lineTo(
        Math.cos(rot) * outerRadius,
        Math.sin(rot) * outerRadius
      );
      rot += step;
      g.lineTo(
        Math.cos(rot) * innerRadius,
        Math.sin(rot) * innerRadius
      );
      rot += step;
    }
    g.closePath();
    g.endFill();

    // glow filter
    g.filters = [
      new PIXI.filters.GlowFilter({
        distance:      10,
        outerStrength: 4,
        color:         0xffffff
      })
    ];

    const tex = app.renderer.generateTexture(g);
    g.destroy();
    return tex;
  }
  const starTexture = makeStarTexture();

  // 4) Background
  const bg = PIXI.Sprite.from("img/space-bg.png");
  bg.width  = app.screen.width;
  bg.height = app.screen.height;
  app.stage.addChild(bg);
  const linesContainer = new PIXI.Container();
  app.stage.addChild(linesContainer);

  // 5) Nodes & Edges
  const nodes = [
    {id: 1, x: 0.7422685476758676, y: 0.8782565051086226},
    // strengh tree
    {id: 2, x: 0.8961020080806359, y: 0.8496344303111615},//base hp +2
    {id: 4, x: 0.9347801621252095, y: 0.7098267615718045},//hp per kill +1
    {id: 5, x: 0.8899486902671437, y: 0.6525826926053976},//base hp +1
    // dex tree
    {id: 3, x: 0.6587589217732279, y: 0.8606429640332317},
    {id: 6, x: 0.5075626067718753, y: 0.8287183452448526},
    //int tree
    {id: 7, x: 0.7009532482278783, y: 0.7879869962330356},
    {id: 8, x: 0.6244760315288246, y: 0.7703733745291294},
    {id: 9, x: 0.7308408746721113, y: 0.6977174067289333},
    {id: 10, x: 0.7791885833236867, y: 0.6437758817534444},
    
  ];
  const edges = [
    [1,2], [1,3], [1,4],
    [2,5], [5,6],
    [3,7],
    [4,8], [4,9], [9,10]
  ];

  function drawConnections() {
    linesContainer.removeChildren();           // clear old lines
    edges.forEach(([a,b]) => {
      const n1 = nodes[a-1], n2 = nodes[b-1];
      const g = new PIXI.Graphics()
        .lineStyle(2, 0x448aff, 0.4)
        .moveTo(n1.x * app.screen.width, n1.y * app.screen.height)
        .lineTo(n2.x * app.screen.width, n2.y * app.screen.height);
      linesContainer.addChild(g);
    });
  }

  drawConnections();

  // 6) Drag‐and‐drop handlers

  function onDragStart(event) {
    this.data = event.data;
    this.dragging = true;
  }

  function onDragMove() {
    if (!this.dragging) return;
    const newPos = this.data.getLocalPosition(this.parent);
    this.position.set(newPos.x, newPos.y);

    // update normalized coords immediately
    const node = nodes.find(n => n.id === this.nodeId);
    node.x = this.x / app.screen.width;
    node.y = this.y / app.screen.height;

    drawConnections();            // redraw lines in real time
    console.log(`Node ${node.id} at`, node);
  }
  function onDragEnd() {
    if (!this.dragging) return;
    this.dragging = false;
    this.data = null;

    const node = nodes.find(n => n.id === this.nodeId);
    node.x = this.x / app.screen.width;
    node.y = this.y / app.screen.height;

    drawConnections();            // ensure final lines
    console.log(`Node ${node.id} moved to`, node);
  }

  const nodesLayer = new PIXI.Container();
  app.stage.addChild(nodesLayer);

  // 8) Draw stars & labels
   nodes.forEach(n => {
  const sprite = new PIXI.Sprite(starTexture);
  sprite.anchor.set(0.5);
  sprite.position.set(n.x * app.screen.width, n.y * app.screen.height);
  sprite.nodeId      = n.id;
  sprite.interactive = true;
  sprite.buttonMode  = true;
  sprite
    .on("pointerdown",      onDragStart)
    .on("pointermove",      onDragMove)
    .on("pointerup",        onDragEnd)
    .on("pointerupoutside", onDragEnd);
  nodesLayer.addChild(sprite);

  const label = new PIXI.Text(n.id.toString(), {
    fontFamily: "Arial",
    fontSize: 14,
    fill: 0xffcc00
  });
  label.anchor.set(0.5);
  label.position.set(
    n.x * app.screen.width,
    n.y * app.screen.height - 25
  );
  nodesLayer.addChild(label);
  });
}
