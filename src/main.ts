import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
import "./style.css";

document.body.innerHTML = `
  <p>Example image asset: <img src="${exampleIconUrl}" class="icon" /></p>
  <button id = "clearbutton">Clear</button>
  <button id = "undobutton">Undo</button>
  <button id = "redobutton">Redo</button>
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
let lines: Point[][] = [];
let currentLine: Point[] = [];
const redoLines: Point[][] = [];

canvas.addEventListener("mousedown", (e) => {
  active = true;
  currentLine = [];
  lines.push(currentLine);
  currentLine.push({ x: e.offsetX, y: e.offsetY });
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (!active) return;
  currentLine.push({ x: e.offsetX, y: e.offsetY });
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mouseup", () => {
  active = false;
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    if (!line || !line[0]) {
      throw new Error("commit plz");
    }
    ctx.beginPath();
    ctx.moveTo(line[0].x, line[0].y);
    for (let i = 1; i < line.length; i++) {
      const point = line[i];
      if (!point || point.x === undefined || point.y === undefined) {
        throw new Error("commit plz");
      }
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
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
