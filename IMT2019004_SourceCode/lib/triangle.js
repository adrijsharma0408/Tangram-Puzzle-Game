import { Transform } from './transform.js';
import { vec4, mat4 } from 'https://cdn.skypack.dev/gl-matrix';


export class Triangle {
    constructor(vertexPositions, color) {
        this.vertexPositions = vertexPositions;
        this.color = color;
        this.transform = new Transform();
        this.centroid = [
            (this.vertexPositions[0] + this.vertexPositions[3] + this.vertexPositions[6]) / 3,
            (this.vertexPositions[1] + this.vertexPositions[4] + this.vertexPositions[7]) / 3,
            (this.vertexPositions[2] + this.vertexPositions[5] + this.vertexPositions[8]) / 3,
        ];
        this.updatedCentroid = [0, 0, 0];
        this.updatedCentroid[0] = this.centroid[0];
        this.updatedCentroid[1] = this.centroid[1];
        this.updatedCentroid[2] = this.centroid[2];
        [this.x_max, this.x_min, this.y_max, this.y_min] = this.getBoundaryValues();
    }

    getUpdatedCentroid() {
        return this.updatedCentroid;
    }

    getCentroid() {
        return this.centroid;
    }

    updateCentroid() {
        let matrix = this.transform.modelTransformMatrix;
        let location = vec4.create()
        vec4.set(location, this.centroid[0], this.centroid[1], this.centroid[2], 1);
        mat4.multiply(location, matrix, location);
        this.updatedCentroid[0] = location[0];
        this.updatedCentroid[1] = location[1];
        this.updatedCentroid[2] = location[2];
    }

    updateVertices() {
        let matrix = this.transform.modelTransformMatrix;
        let location = vec4.create();
        for (let i = 0; i < this.vertexPositions.length; i += 3) {
            vec4.set(location, this.vertexPositions[i], this.vertexPositions[i + 1], this.vertexPositions[i + 2], 1);
            mat4.multiply(location, matrix, location);
            this.vertexPositions[i] = location[0];
            this.vertexPositions[i + 1] = location[1];
            this.vertexPositions[i + 2] = location[2];
        }
        this.transform.resetMatrix();
    }

    getBoundaryValues() {
        let x_max = this.vertexPositions[0];
        let x_min = this.vertexPositions[0];
        let y_max = this.vertexPositions[1];
        let y_min = this.vertexPositions[1];
        for (let i = 3; i < this.vertexPositions.length; i += 3) {
            if (this.vertexPositions[i] < x_min)
                x_min = this.vertexPositions[i];
            if (this.vertexPositions[i] > x_max)
                x_max = this.vertexPositions[i];
            if (this.vertexPositions[i + 1] < y_min)
                y_min = this.vertexPositions[i + 1];
            if (this.vertexPositions[i + 1] > y_max)
                y_max = this.vertexPositions[i + 1];
        }
        return [x_max, x_min, y_max, y_min];
    }
}