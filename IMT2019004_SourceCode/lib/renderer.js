export class WebGLRenderer {
    constructor() {
        this.domElement = document.createElement("canvas");
        this.gl = this.domElement.getContext("webgl") || this.domElement.getContext("experimental-webgl");
        if (!this.gl) throw new Error("WebGL is not supported");
        this.setSize(50, 50);
        this.clear(1.0, 1.0, 1.0, 1.0);
    }

    setSize(width, height) {
        this.domElement.width = width;
        this.domElement.height = height;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }

    clear(r, g, b, a) {
        this.gl.clearColor(r, g, b, a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    setAnimationLoop(animation) {
        function renderLoop() {
            animation();
            window.requestAnimationFrame(renderLoop);
        }
        renderLoop();
    }

    getCanvas() {
        return this.domElement;
    }

    render(scene, shader) {
        scene.primitives.forEach(function(primitive) {
            shader.bindArrayBuffer(shader.vertexAttributesBuffer, primitive.vertexPositions);
            shader.fillAttributeData("aPosition", primitive.vertexPositions, 3, 3 * primitive.vertexPositions.BYTES_PER_ELEMENT, 0);
            shader.setUniform4f("uColor", primitive.color);
            const uMatrix = shader.uniform("uMatrix");
            shader.setUniformMatrix4fv(uMatrix, primitive.transform.modelTransformMatrix);
            shader.drawArrays(primitive.vertexPositions.length / 3); // Draw
        });
    }

    glContext() {
        return this.gl;
    }

    mouseToClipCoord(mouseX, mouseY) {
        let rect = this.domElement.getBoundingClientRect();
        mouseX = mouseX - rect.left;
        mouseY = mouseY - rect.top;
        mouseX = mouseX / rect.width; // convert the position from pixels to 0.0 to 1.0
        mouseY = mouseY / rect.height;
        mouseX = mouseX * 2; // convert from 0->1 to 0->2
        mouseY = mouseY * 2;
        mouseX = mouseX - 1; // convert from 0->1 to 0->2
        mouseY = mouseY - 1;
        mouseY = -mouseY; // Coordinates in clip space, axis flip
        return [mouseX, mouseY]
    }
}