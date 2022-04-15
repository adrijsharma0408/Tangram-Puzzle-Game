import { Scene, Triangle, WebGLRenderer, Shader, Parallelogram } from './lib/threeD.js';
import { vertexShaderSrc } from './shaders/vertex.js';
import { fragmentShaderSrc } from './shaders/fragment.js';

let height = 720;
let width = 720;

let orange = new Float32Array([1.0, 0.5, 0.0, 1]);
let darkBlue = new Float32Array([0.0, 0.5, 1.0, 1]);
let green = new Float32Array([0.0, 1.0, 0.0, 1]);
let yellow = new Float32Array([1.0, 1.0, 0.0, 1]);
let red = new Float32Array([1.0, 0.0, 0.0, 1]);
let magenta = new Float32Array([1.0, 0.0, 1.0, 1]);
let lightBlue = new Float32Array([0.5, 1.0, 1.0, 1]);

let stationaryTriangleVertices1 = new Float32Array([-1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0]);
let stationaryTriangleVertices2 = new Float32Array([1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, -1.0, 0.0]);
let stationaryTriangleVertices3 = new Float32Array([-1.0, 0.0, 0.0, -1.0, -1.0, 0.0, 0.0, -1.0, 0.0]);
let stationaryTriangleVertices4 = new Float32Array([1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.5, -0.5, 0.0]);
let stationaryTriangleVertices5 = new Float32Array([0.0, 0.0, 0.0, -0.5, 0.5, 0.0, -0.5, -0.5, 0.0]);
let stationarySquareVertices = new Float32Array([-1.0, 0.0, 0.0, -1.0, 1.0, 0.0, -0.5, 0.5, 0.0, -0.5, -0.5, 0.0]);
let stationaryParallelogramVertices = new Float32Array([-0.5, -0.5, 0.0, 0.0, -1.0, 0.0, 0.5, -0.5, 0.0, 0.0, 0.0, 0.0])
stationaryTriangleVertices1 = stationaryTriangleVertices1.map(x => x * 0.9);
stationaryTriangleVertices2 = stationaryTriangleVertices2.map(x => x * 0.9);
stationaryTriangleVertices3 = stationaryTriangleVertices3.map(x => x * 0.9);
stationaryTriangleVertices4 = stationaryTriangleVertices4.map(x => x * 0.9);
stationaryTriangleVertices5 = stationaryTriangleVertices5.map(x => x * 0.9);
stationarySquareVertices = stationarySquareVertices.map(x => x * 0.9);
stationaryParallelogramVertices = stationaryParallelogramVertices.map(x => x * 0.9);

const stationaryTriangle1 = new Triangle(stationaryTriangleVertices1, orange);
const stationaryTriangle2 = new Triangle(stationaryTriangleVertices2, darkBlue);
const stationaryTriangle3 = new Triangle(stationaryTriangleVertices3, yellow);
const stationaryTriangle4 = new Triangle(stationaryTriangleVertices4, green);
const stationaryTriangle5 = new Triangle(stationaryTriangleVertices5, lightBlue);
const stationarySquare = new Parallelogram(stationarySquareVertices, red)
const stationaryParallelogram = new Parallelogram(stationaryParallelogramVertices, magenta)

const stationaryScene = new Scene();
stationaryScene.add(stationaryTriangle1);
stationaryScene.add(stationaryTriangle2);
stationaryScene.add(stationaryTriangle3);
stationaryScene.add(stationaryTriangle4);
stationaryScene.add(stationaryTriangle5);
stationaryScene.add(stationarySquare);
stationaryScene.add(stationaryParallelogram);
const stationaryRenderer = new WebGLRenderer();
stationaryRenderer.setSize(width, height);
document.body.appendChild(stationaryRenderer.domElement);
const stationaryShader = new Shader(stationaryRenderer.glContext(), vertexShaderSrc, fragmentShaderSrc);
stationaryShader.use();
stationaryRenderer.setAnimationLoop(stationaryAnimation);

const movingScene = new Scene();
restartGame(movingScene);
const movingRenderer = new WebGLRenderer();
movingRenderer.setSize(width, height);
document.body.appendChild(movingRenderer.domElement);
const movingShader = new Shader(movingRenderer.glContext(), vertexShaderSrc, fragmentShaderSrc);
movingShader.use();
movingRenderer.setAnimationLoop(movingAnimation);

let commonCentroid = [0.0, 0.0, 0.0]
let systemMode = 0;
let closestPrimitive = movingScene.primitives[0];

window.addEventListener("click", function(event) {
    if (systemMode == 1) {
        let mouseX = event.clientX;
        let mouseY = event.clientY;
        let actualMouseClickCoordinates = movingRenderer.mouseToClipCoord(mouseX, mouseY);
        let closestPrimitiveDistance = 1000;
        let closestPrimitiveIndex = -1;
        for (let i = 0; i < movingScene.primitives.length; i++) {
            let newCenter = movingScene.primitives[i].updatedCentroid;
            let distance = Math.sqrt((actualMouseClickCoordinates[0] - newCenter[0]) ** 2 + (actualMouseClickCoordinates[1] - newCenter[1]) ** 2);
            if (distance < closestPrimitiveDistance) {
                closestPrimitiveDistance = distance;
                closestPrimitiveIndex = i;
            }
        }
        if (closestPrimitiveIndex != -1)
            closestPrimitive = movingScene.primitives[closestPrimitiveIndex];
    }
});

window.addEventListener("keydown", function(event) {
    let key = event.key;
    console.log(key);
    switch (key) {
        case "m":
            systemMode = (systemMode + 1) % 4;
            console.log(systemMode);
            if (systemMode == 0)
                restartGame(movingScene);
            else if (systemMode == 2) {
                bindPrimitivesTogether();
                for (let i = 0; i < movingScene.primitives.length; i++)
                    movingScene.primitives[i].updateVertices();
                bindPrimitivesTogether();
            } else if (systemMode == 3)
                movingScene.clear();
            break;
        case "ArrowLeft":
            if (systemMode == 1) {
                closestPrimitive.transform.translation(-0.01, 0, 0);
                closestPrimitive.updateCentroid();
            } else if (systemMode == 2) {
                for (let i = 0; i < movingScene.primitives.length; i++) {
                    movingScene.primitives[i].transform.translation(-0.01, 0, 0);
                    movingScene.primitives[i].updateCentroid();
                }
            }
            break;
        case "ArrowRight":
            if (systemMode == 1) {
                closestPrimitive.transform.translation(0.01, 0, 0);
                closestPrimitive.updateCentroid();
            } else if (systemMode == 2) {
                for (let i = 0; i < movingScene.primitives.length; i++) {
                    movingScene.primitives[i].transform.translation(0.01, 0, 0);
                    movingScene.primitives[i].updateCentroid();
                }
            }
            break;
        case "ArrowUp":
            if (systemMode == 1) {
                closestPrimitive.transform.translation(0, 0.01, 0);
                closestPrimitive.updateCentroid();
            } else if (systemMode == 2) {
                for (let i = 0; i < movingScene.primitives.length; i++) {
                    movingScene.primitives[i].transform.translation(0, 0.01, 0);
                    movingScene.primitives[i].updateCentroid();
                }
            }
            break;
        case "ArrowDown":
            if (systemMode == 1) {
                closestPrimitive.transform.translation(0, -0.01, 0);
                closestPrimitive.updateCentroid();
            } else if (systemMode == 2) {
                for (let i = 0; i < movingScene.primitives.length; i++) {
                    movingScene.primitives[i].transform.translation(0, -0.01, 0);
                    movingScene.primitives[i].updateCentroid();
                }
            }
            break;
        case "9":
            if (systemMode == 1) {
                closestPrimitive.transform.rotation(0.15708, closestPrimitive.centroid);
                closestPrimitive.updateCentroid();
            } else if (systemMode == 2) {
                for (let i = 0; i < movingScene.primitives.length; i++) {
                    movingScene.primitives[i].transform.rotation(0.15708, commonCentroid);
                    movingScene.primitives[i].updateCentroid();
                }
            }
            break;
        case "0":
            if (systemMode == 1) {
                closestPrimitive.transform.rotation(-0.15708, closestPrimitive.centroid);
                closestPrimitive.updateCentroid();
            } else if (systemMode == 2) {
                for (let i = 0; i < movingScene.primitives.length; i++) {
                    movingScene.primitives[i].transform.rotation(-0.15708, commonCentroid);
                    movingScene.primitives[i].updateCentroid();
                }
            }
            break;
        case "-":
            if (systemMode == 1) {
                closestPrimitive.transform.proportinate(0.95, closestPrimitive.centroid);
                closestPrimitive.updateCentroid();
            } else if (systemMode == 2) {
                for (let i = 0; i < movingScene.primitives.length; i++) {
                    movingScene.primitives[i].transform.proportinate(0.95, commonCentroid);
                    movingScene.primitives[i].updateCentroid();
                }
            }
            break;
        case "+":
            if (systemMode == 1) {
                closestPrimitive.transform.proportinate(1.05, closestPrimitive.centroid);
                closestPrimitive.updateCentroid();
            } else if (systemMode == 2) {
                for (let i = 0; i < movingScene.primitives.length; i++) {
                    movingScene.primitives[i].transform.proportinate(1.05, commonCentroid);
                    movingScene.primitives[i].updateCentroid();
                }
            }
            break;
    }
});

function movingAnimation() {
    movingRenderer.clear(0.7, 0.7, 0.7, 1);
    movingRenderer.render(movingScene, movingShader);
}

function stationaryAnimation() {
    stationaryRenderer.clear(1.0, 0.9, 0.8, 1);
    stationaryRenderer.render(stationaryScene, stationaryShader);
}

function bindPrimitivesTogether() {
    let x_max = movingScene.primitives[0].x_max;
    let x_min = movingScene.primitives[0].x_min;
    let y_max = movingScene.primitives[0].y_max;
    let y_min = movingScene.primitives[0].y_min;
    for (let i = 1; i < movingScene.primitives.length; i++) {
        if (x_max < movingScene.primitives[i].x_max)
            x_max = movingScene.primitives[i].x_max;
        if (x_min > movingScene.primitives[i].x_min)
            x_min = movingScene.primitives[i].x_min;
        if (y_max < movingScene.primitives[i].y_max)
            y_max = movingScene.primitives[i].y_max;
        if (y_min > movingScene.primitives[i].y_min)
            y_min = movingScene.primitives[i].y_min;
    }
    commonCentroid[0] = (x_max + x_min) / 2;
    commonCentroid[1] = (y_max + y_min) / 2;
}

function restartGame(movingScene) {
    let randomDistanceX, randomDistanceY;

    randomDistanceX = Math.random() % 0.19 - 0.2;
    randomDistanceY = Math.random() % 0.18 - 0.5;
    let movingTriangleVertices1 = new Float32Array([-1.0 + randomDistanceX, 1.0 + randomDistanceY, 0, 1.0 + randomDistanceX, 1.0 + randomDistanceY, 0.0, 0.0 + randomDistanceX, 0.0 + randomDistanceY, 0]);
    movingTriangleVertices1 = movingTriangleVertices1.map(x => x * 0.8);
    const movingTriangle1 = new Triangle(movingTriangleVertices1, orange); //Orange triangle

    randomDistanceX = Math.random() % 0.16 + 0.1;
    randomDistanceY = Math.random() % 0.21 - 0.1;
    let movingTriangleVertices2 = new Float32Array([1.0 + randomDistanceX, 1.0 + randomDistanceY, 0, 1.0 + randomDistanceX, -1.0 + randomDistanceY, 0, 0.0 + randomDistanceX, 0.0 + randomDistanceY, 0]);
    movingTriangleVertices2 = movingTriangleVertices2.map(x => x * 0.8);
    const movingTriangle2 = new Triangle(movingTriangleVertices2, darkBlue);

    randomDistanceX = Math.random() % 0.20;
    randomDistanceY = Math.random() % 0.19;
    let movingTriangleVertices3 = new Float32Array([1.0 + randomDistanceX, -1.0 + randomDistanceY, 0, 0.0 + randomDistanceX, -1.0 + randomDistanceY, 0, 0.5 + randomDistanceX, -0.5 + randomDistanceY, 0]);
    movingTriangleVertices3 = movingTriangleVertices3.map(x => x * 0.8);
    const movingTriangle3 = new Triangle(movingTriangleVertices3, yellow);

    randomDistanceX = Math.random() % 0.5 + 0.25;
    randomDistanceY = Math.random() % 0.5;
    let movingTriangleVertices4 = new Float32Array([-1.0 + randomDistanceX, -1.0 + randomDistanceY, 0, 0.0 + randomDistanceX, -1.0 + randomDistanceY, 0, -1.0 + randomDistanceX, 0.0 + randomDistanceY, 0]);
    movingTriangleVertices4 = movingTriangleVertices4.map(x => x * 0.8);
    const movingTriangle4 = new Triangle(movingTriangleVertices4, green);

    randomDistanceX = Math.random() % 0.195 + 0.3;
    randomDistanceY = Math.random() % 0.205 - 0.2;
    let movingTriangleVertices5 = new Float32Array([0.0 + randomDistanceX, 0.0 + randomDistanceY, 0, -0.5 + randomDistanceX, 0.5 + randomDistanceY, 0, -0.5 + randomDistanceX, -0.5 + randomDistanceY, 0]);
    movingTriangleVertices5 = movingTriangleVertices5.map(x => x * 0.8);
    const movingTriangle5 = new Triangle(movingTriangleVertices5, lightBlue);

    randomDistanceX = Math.random() % 0.5 - 0.15;
    randomDistanceY = Math.random() % 0.5 + 0.15;
    let movingSquareVertices = new Float32Array([0.0 + randomDistanceX, 0.0 + randomDistanceY, 0, 0.5 + randomDistanceX, -0.5 + randomDistanceY, 0, 0.0 + randomDistanceX, -1.0 + randomDistanceY, 0, -0.5 + randomDistanceX, -0.5 + randomDistanceY, 0]);
    movingSquareVertices = movingSquareVertices.map(x => x * 0.8);
    const movingSquare = new Parallelogram(movingSquareVertices, red);

    randomDistanceX = Math.random() % 0.2 + 0.2;
    randomDistanceY = Math.random() % 0.6 - 0.5;
    let movingParallelogramVertices = new Float32Array([-1.0 + randomDistanceX, 1.0 + randomDistanceY, 0, -0.5 + randomDistanceX, 0.5 + randomDistanceY, 0, -0.5 + randomDistanceX, -0.5 + randomDistanceY, 0, -1.0 + randomDistanceX, 0.0 + randomDistanceY, 0]);
    movingParallelogramVertices = movingParallelogramVertices.map(x => x * 0.8);
    const movingParallelogram = new Parallelogram(movingParallelogramVertices, magenta);

    movingScene.add(movingTriangle1);
    movingScene.add(movingTriangle2);
    movingScene.add(movingTriangle3);
    movingScene.add(movingTriangle4);
    movingScene.add(movingTriangle5);
    movingScene.add(movingSquare);
    movingScene.add(movingParallelogram);
}