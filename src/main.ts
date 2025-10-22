import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
import "./style.css";

document.body.innerHTML = `
  <p>Example image asset: <img src="${exampleIconUrl}" class="icon" /></p>
  <button id = "clearbutton">Clear</button>
  <button id = "undobutton">Undo</button>
  <button id = "redobutton">Redo</button>
  <button id = "thinbutton">Thin</button>
  <button id = "thickbutton">Thick</button>
  <h1>Welcome to Sticker Sketching</h1>
`;

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
document.body.append(canvas);

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("commit plz");
}
type Point = { x: number; y: number };
let active = false;
let lines: MarkerLine[] = [];
let currentLine: MarkerLine | null = null;
const redoLines: MarkerLine[] = [];
let currentThickness = 2;

class MarkerLine {
  points: Point[] = [];
  thickness: number;

  constructor(startX: number, startY: number, thickness: number) {
    this.points.push({ x: startX, y: startY });
    this.thickness = thickness;
  }
  drag(x: number, y: number) {
    this.points.push({ x, y });
  }
  display(ctx: CanvasRenderingContext2D) {
    if (!this.points || this.points.length < 2) return;
    const start = this.points[0];
    if (!start) return;
    ctx.lineWidth = this.thickness;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i < this.points.length; i++) {
      const p = this.points[i];
      if (!p) continue;
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
}

class ToolPreview {
  x: number;
  y: number;
  thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "grey";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
let toolPreview: ToolPreview | null = null;

canvas.addEventListener("mousedown", (e) => {
  active = true;
  currentLine = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
  lines.push(currentLine);
  toolPreview = null;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (active && currentLine) {
    currentLine.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new Event("drawing-changed"));
    return;
  } else {
    toolPreview = new ToolPreview(e.offsetX, e.offsetY, currentThickness);
    canvas.dispatchEvent(new Event("tool-moved"));
  }
});

canvas.addEventListener("tool-moved", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    line.display(ctx);
  }
  if (toolPreview && !active) {
    toolPreview.draw(ctx);
  }
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    line.display(ctx);
  }
  if (toolPreview && !active) {
    toolPreview.draw(ctx);
  }
});

canvas.addEventListener("mouseup", () => {
  active = false;
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    line.display(ctx);
  }
});

const clearButton = document.getElementById("clearbutton");
clearButton?.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines = [];
});

const undoButton = document.getElementById("undobutton");
undoButton?.addEventListener("click", () => {
  if (lines.length > 0) {
    redoLines.push(lines.pop()!);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

const redoButton = document.getElementById("redobutton");
redoButton?.addEventListener("click", () => {
  if (redoLines.length > 0) {
    lines.push(redoLines.pop()!);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

const thinButton = document.getElementById("thinbutton");
thinButton?.addEventListener("click", () => {
  currentThickness = 4;
});

const thickButton = document.getElementById("thickbutton");
thickButton?.addEventListener("click", () => {
  currentThickness = 8;
});
