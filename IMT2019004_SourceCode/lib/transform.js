import { vec3, mat4 } from 'https://cdn.skypack.dev/gl-matrix';

export class Transform {
    constructor() {
        this.translate = vec3.create();
        vec3.set(this.translate, 0, 0, 0);
        this.scale = vec3.create();
        vec3.set(this.scale, 1, 1, 1);
        this.rotationAngle = 0;
        this.rotationAxis = vec3.create();
        vec3.set(this.rotationAxis, 0, 0, 1);
        this.modelTransformMatrix = mat4.create();
        mat4.identity(this.modelTransformMatrix);
    }

    translation(dx, dy, dz) {
        this.translate[0] = dx;
        this.translate[1] = dy;
        this.translate[2] = dz;
        mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, this.translate);
    }

    rotation(angle, centroid) {
        this.translation(centroid[0], centroid[1], centroid[2]);
        mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, angle, this.rotationAxis);
        this.translation(-centroid[0], -centroid[1], -centroid[2]);
    }

    proportinate(ratio, centroid) {
        this.translation(centroid[0], centroid[1], centroid[2]);
        this.scale[0] = ratio;
        this.scale[1] = ratio;
        this.scale[2] = ratio;
        mat4.scale(this.modelTransformMatrix, this.modelTransformMatrix, this.scale);
        this.translation(-centroid[0], -centroid[1], -centroid[2]);
    }

    resetMatrix() {
        mat4.identity(this.modelTransformMatrix);
    }
}