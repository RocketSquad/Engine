class VoxelData {
    size: number;
    jitter: number;
    voxels: any[];
    palette: any[];
    anim: any[];

    constructor() {
        this.size = null;
        this.jitter = 0;
        this.voxels = [];
        this.palette = [];

        this.anim = [{
            size: null,
            voxels: [],
        }];
    }
}

export const GetBinary = (url) => fetch(url).then(res => res.arrayBuffer().then(data => new Uint8Array(data)));

class DataHolder {
    binary: Uint8Array;
    cursor: number;
    chunkId: string;
    chunkSize: number;
    data: any;

    constructor(binary: Uint8Array) {
        this.binary = binary;
        this.cursor = 0;
        this.chunkSize = 0;
        this.data = new VoxelData();
    }

    next() {
        if (this.binary.byteLength <= this.cursor) {
            throw new Error("uint8Array index out of bounds: " + this.binary.byteLength);
        }
        return this.binary[this.cursor++];
    }

    hasNext() {
        return this.cursor < this.binary.byteLength;
    }
}

export const Parse = (binary: Uint8Array) => {
    const dataHolder = new DataHolder(binary);
    root(dataHolder);
    dataHolder.data.size = dataHolder.data.anim[0].size;
    dataHolder.data.voxels = dataHolder.data.anim[0].voxels;
    if (dataHolder.data.palette.length === 0) {
        dataHolder.data.palette = DefaultPalette;
    } else {
        dataHolder.data.palette.unshift(dataHolder.data.palette[0]);
        dataHolder.data.palette.pop();
    }
    return dataHolder.data;
};

const root = (dataHolder: DataHolder) => {
    magicNumber(dataHolder);
    versionNumber(dataHolder);
    chunk(dataHolder); // main chunk
};

const magicNumber = (dataHolder: DataHolder) => {
    let str = "";
    for (let i = 0; i < 4; i++) {
        str += String.fromCharCode(dataHolder.next());
    }

    if (str !== "VOX ") {
        throw new Error("invalid magic number '" + str + "'");
    }
};

const versionNumber = (dataHolder: DataHolder) => {
    let ver = 0;
    for (let i = 0; i < 4; i++) {
        ver += dataHolder.next() * Math.pow(256, i);
    }
};

const chunk = (dataHolder: DataHolder) => {
    if (!dataHolder.hasNext()) return false;

    chunkId(dataHolder);
    sizeOfChunkContents(dataHolder);
    totalSizeOfChildrenChunks(dataHolder);
    contents(dataHolder);
    while (chunk(dataHolder));
    return dataHolder.hasNext();
};

const chunkId = (dataHolder: DataHolder) => {
    let id = "";
    for (let i = 0; i < 4; i++) {
        id += String.fromCharCode(dataHolder.next());
    }

    dataHolder.chunkId = id;
    dataHolder.chunkSize = 0;
};

const sizeOfChunkContents = (dataHolder: DataHolder) => {
    let size = 0;
    for (let i = 0; i < 4; i++) {
        size += dataHolder.next() * Math.pow(256, i);
    }
    dataHolder.chunkSize = size;
};

const totalSizeOfChildrenChunks = (dataHolder: DataHolder) => {
    let size = 0;
    for (let i = 0; i < 4; i++) {
        size += dataHolder.next() * Math.pow(256, i);
    }
};

const contents = (dataHolder: DataHolder) => {
    switch (dataHolder.chunkId) {
        case "PACK":
            contentsOfPackChunk(dataHolder);
            break;
        case "SIZE":
            contentsOfSizeChunk(dataHolder);
            break;
        case "XYZI":
            contentsOfVoxelChunk(dataHolder);
            break;
        case "RGBA":
            contentsOfPaletteChunk(dataHolder);
            break;
        case "MATT":
            contentsOfMaterialChunk(dataHolder);
            break;
    }
};

const contentsOfPackChunk = (dataHolder: DataHolder) => {
    let size = 0;
    for (let i = 0; i < 4; i++) {
        size += dataHolder.next() * Math.pow(256, i);
    }
};

const contentsOfSizeChunk = (dataHolder: DataHolder) => {
    let x = 0;
    for (let i = 0; i < 4; i++) {
        x += dataHolder.next() * Math.pow(256, i);
    }
    let y = 0;
    for (let i = 0; i < 4; i++) {
        y += dataHolder.next() * Math.pow(256, i);
    }
    let z = 0;
    for (let i = 0; i < 4; i++) {
        z += dataHolder.next() * Math.pow(256, i);
    }
    // console.debug("  bounding box size = " + x + ", " + y + ", " + z);

    let data = dataHolder.data.anim[dataHolder.data.anim.length - 1];
    if (data.size) {
        data = { size: null, voxels: [] };
        dataHolder.data.anim.push(data);
    }
    data.size = {
        x,
        y,
        z
    };
};

const contentsOfVoxelChunk = (dataHolder) => {
    let num = 0;
    for (let i = 0; i < 4; i++) {
        num += dataHolder.next() * Math.pow(256, i);
    }

    let data = dataHolder.data.anim[dataHolder.data.anim.length - 1];
    if (data.voxels.length) {
        data = { size: null, voxels: [] };
        dataHolder.data.anim.push(data);
    }
    for (let i = 0; i < num; i++) {
        data.voxels.push({
            x: dataHolder.next(),
            y: dataHolder.next(),
            z: dataHolder.next(),
            colorIndex: dataHolder.next(),
        });
    }
};

const contentsOfPaletteChunk = (dataHolder) => {
    // console.debug("  palette");
    for (let i = 0; i < 256; i++) {
        const p = {
            r: dataHolder.next(),
            g: dataHolder.next(),
            b: dataHolder.next(),
            a: dataHolder.next(),
        };
        dataHolder.data.palette.push(p);
    }
};

const contentsOfMaterialChunk = (dataHolder) => {
    // console.debug("  material");
    let id = 0;
    for (let i = 0; i < 4; i++) {
        id += dataHolder.next() * Math.pow(256, i);
    }
    // console.debug("    id = " + id);

    let type = 0;
    for (let i = 0; i < 4; i++) {
        type += dataHolder.next() * Math.pow(256, i);
    }
    // console.debug("    type = " + type + " (0:diffuse 1:metal 2:glass 3:emissive)");

    let weight = 0;
    for (let i = 0; i < 4; i++) {
        weight += dataHolder.next() * Math.pow(256, i);
    }
    // console.debug("    weight = " + parseFloat(weight));

    let propertyBits = 0;
    for (let i = 0; i < 4; i++) {
        propertyBits += dataHolder.next() * Math.pow(256, i);
    }
    // console.debug("    property bits = " + propertyBits.toString(2));
    const plastic = !!(propertyBits & 1);
    const roughness = !!(propertyBits & 2);
    const specular = !!(propertyBits & 4);
    const ior = !!(propertyBits & 8);
    const attenuation = !!(propertyBits & 16);
    const power = !!(propertyBits & 32);
    const glow = !!(propertyBits & 64);
    const isTotalPower = !!(propertyBits & 128);

    let valueNum = 0;
    if (plastic) valueNum += 1;
    if (roughness) valueNum += 1;
    if (specular) valueNum += 1;
    if (ior) valueNum += 1;
    if (attenuation) valueNum += 1;
    if (power) valueNum += 1;
    if (glow) valueNum += 1;
    // isTotalPower is no value

    const values = [];
    for (let j = 0; j < valueNum; j++) {
        values[j] = 0;
        for (let i = 0; i < 4; i++) {
            values[j] += dataHolder.next() * Math.pow(256, i);
        }
        // console.debug("    normalized property value = " + parseFloat(values[j]));
    }
};

const parseFloat = (bytes) => {
    let bin = bytes.toString(2);
    while (bin.length < 32) {
        bin = "0" + bin;
    }
    const sign = bin[0] == "0" ? 1 : -1;
    const exponent = Number.parseInt(bin.substring(1, 9), 2) - 127;
    const fraction = Number.parseFloat("1." + Number.parseInt(bin.substring(9), 2));
    return sign * Math.pow(2, exponent) * fraction;
};

const DefaultPalette = [
    { r: 255, g: 255, b: 255, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
    { r: 255, g: 255, b: 204, a: 255 },
    { r: 255, g: 255, b: 153, a: 255 },
    { r: 255, g: 255, b: 102, a: 255 },
    { r: 255, g: 255, b: 51, a: 255 },
    { r: 255, g: 255, b: 0, a: 255 },
    { r: 255, g: 204, b: 255, a: 255 },
    { r: 255, g: 204, b: 204, a: 255 },
    { r: 255, g: 204, b: 153, a: 255 },
    { r: 255, g: 204, b: 102, a: 255 },
    { r: 255, g: 204, b: 51, a: 255 },
    { r: 255, g: 204, b: 0, a: 255 },
    { r: 255, g: 153, b: 255, a: 255 },
    { r: 255, g: 153, b: 204, a: 255 },
    { r: 255, g: 153, b: 153, a: 255 },
    { r: 255, g: 153, b: 102, a: 255 },
    { r: 255, g: 153, b: 51, a: 255 },
    { r: 255, g: 153, b: 0, a: 255 },
    { r: 255, g: 102, b: 255, a: 255 },
    { r: 255, g: 102, b: 204, a: 255 },
    { r: 255, g: 102, b: 153, a: 255 },
    { r: 255, g: 102, b: 102, a: 255 },
    { r: 255, g: 102, b: 51, a: 255 },
    { r: 255, g: 102, b: 0, a: 255 },
    { r: 255, g: 51, b: 255, a: 255 },
    { r: 255, g: 51, b: 204, a: 255 },
    { r: 255, g: 51, b: 153, a: 255 },
    { r: 255, g: 51, b: 102, a: 255 },
    { r: 255, g: 51, b: 51, a: 255 },
    { r: 255, g: 51, b: 0, a: 255 },
    { r: 255, g: 0, b: 255, a: 255 },
    { r: 255, g: 0, b: 204, a: 255 },
    { r: 255, g: 0, b: 153, a: 255 },
    { r: 255, g: 0, b: 102, a: 255 },
    { r: 255, g: 0, b: 51, a: 255 },
    { r: 255, g: 0, b: 0, a: 255 },
    { r: 204, g: 255, b: 255, a: 255 },
    { r: 204, g: 255, b: 204, a: 255 },
    { r: 204, g: 255, b: 153, a: 255 },
    { r: 204, g: 255, b: 102, a: 255 },
    { r: 204, g: 255, b: 51, a: 255 },
    { r: 204, g: 255, b: 0, a: 255 },
    { r: 204, g: 204, b: 255, a: 255 },
    { r: 204, g: 204, b: 204, a: 255 },
    { r: 204, g: 204, b: 153, a: 255 },
    { r: 204, g: 204, b: 102, a: 255 },
    { r: 204, g: 204, b: 51, a: 255 },
    { r: 204, g: 204, b: 0, a: 255 },
    { r: 204, g: 153, b: 255, a: 255 },
    { r: 204, g: 153, b: 204, a: 255 },
    { r: 204, g: 153, b: 153, a: 255 },
    { r: 204, g: 153, b: 102, a: 255 },
    { r: 204, g: 153, b: 51, a: 255 },
    { r: 204, g: 153, b: 0, a: 255 },
    { r: 204, g: 102, b: 255, a: 255 },
    { r: 204, g: 102, b: 204, a: 255 },
    { r: 204, g: 102, b: 153, a: 255 },
    { r: 204, g: 102, b: 102, a: 255 },
    { r: 204, g: 102, b: 51, a: 255 },
    { r: 204, g: 102, b: 0, a: 255 },
    { r: 204, g: 51, b: 255, a: 255 },
    { r: 204, g: 51, b: 204, a: 255 },
    { r: 204, g: 51, b: 153, a: 255 },
    { r: 204, g: 51, b: 102, a: 255 },
    { r: 204, g: 51, b: 51, a: 255 },
    { r: 204, g: 51, b: 0, a: 255 },
    { r: 204, g: 0, b: 255, a: 255 },
    { r: 204, g: 0, b: 204, a: 255 },
    { r: 204, g: 0, b: 153, a: 255 },
    { r: 204, g: 0, b: 102, a: 255 },
    { r: 204, g: 0, b: 51, a: 255 },
    { r: 204, g: 0, b: 0, a: 255 },
    { r: 153, g: 255, b: 255, a: 255 },
    { r: 153, g: 255, b: 204, a: 255 },
    { r: 153, g: 255, b: 153, a: 255 },
    { r: 153, g: 255, b: 102, a: 255 },
    { r: 153, g: 255, b: 51, a: 255 },
    { r: 153, g: 255, b: 0, a: 255 },
    { r: 153, g: 204, b: 255, a: 255 },
    { r: 153, g: 204, b: 204, a: 255 },
    { r: 153, g: 204, b: 153, a: 255 },
    { r: 153, g: 204, b: 102, a: 255 },
    { r: 153, g: 204, b: 51, a: 255 },
    { r: 153, g: 204, b: 0, a: 255 },
    { r: 153, g: 153, b: 255, a: 255 },
    { r: 153, g: 153, b: 204, a: 255 },
    { r: 153, g: 153, b: 153, a: 255 },
    { r: 153, g: 153, b: 102, a: 255 },
    { r: 153, g: 153, b: 51, a: 255 },
    { r: 153, g: 153, b: 0, a: 255 },
    { r: 153, g: 102, b: 255, a: 255 },
    { r: 153, g: 102, b: 204, a: 255 },
    { r: 153, g: 102, b: 153, a: 255 },
    { r: 153, g: 102, b: 102, a: 255 },
    { r: 153, g: 102, b: 51, a: 255 },
    { r: 153, g: 102, b: 0, a: 255 },
    { r: 153, g: 51, b: 255, a: 255 },
    { r: 153, g: 51, b: 204, a: 255 },
    { r: 153, g: 51, b: 153, a: 255 },
    { r: 153, g: 51, b: 102, a: 255 },
    { r: 153, g: 51, b: 51, a: 255 },
    { r: 153, g: 51, b: 0, a: 255 },
    { r: 153, g: 0, b: 255, a: 255 },
    { r: 153, g: 0, b: 204, a: 255 },
    { r: 153, g: 0, b: 153, a: 255 },
    { r: 153, g: 0, b: 102, a: 255 },
    { r: 153, g: 0, b: 51, a: 255 },
    { r: 153, g: 0, b: 0, a: 255 },
    { r: 102, g: 255, b: 255, a: 255 },
    { r: 102, g: 255, b: 204, a: 255 },
    { r: 102, g: 255, b: 153, a: 255 },
    { r: 102, g: 255, b: 102, a: 255 },
    { r: 102, g: 255, b: 51, a: 255 },
    { r: 102, g: 255, b: 0, a: 255 },
    { r: 102, g: 204, b: 255, a: 255 },
    { r: 102, g: 204, b: 204, a: 255 },
    { r: 102, g: 204, b: 153, a: 255 },
    { r: 102, g: 204, b: 102, a: 255 },
    { r: 102, g: 204, b: 51, a: 255 },
    { r: 102, g: 204, b: 0, a: 255 },
    { r: 102, g: 153, b: 255, a: 255 },
    { r: 102, g: 153, b: 204, a: 255 },
    { r: 102, g: 153, b: 153, a: 255 },
    { r: 102, g: 153, b: 102, a: 255 },
    { r: 102, g: 153, b: 51, a: 255 },
    { r: 102, g: 153, b: 0, a: 255 },
    { r: 102, g: 102, b: 255, a: 255 },
    { r: 102, g: 102, b: 204, a: 255 },
    { r: 102, g: 102, b: 153, a: 255 },
    { r: 102, g: 102, b: 102, a: 255 },
    { r: 102, g: 102, b: 51, a: 255 },
    { r: 102, g: 102, b: 0, a: 255 },
    { r: 102, g: 51, b: 255, a: 255 },
    { r: 102, g: 51, b: 204, a: 255 },
    { r: 102, g: 51, b: 153, a: 255 },
    { r: 102, g: 51, b: 102, a: 255 },
    { r: 102, g: 51, b: 51, a: 255 },
    { r: 102, g: 51, b: 0, a: 255 },
    { r: 102, g: 0, b: 255, a: 255 },
    { r: 102, g: 0, b: 204, a: 255 },
    { r: 102, g: 0, b: 153, a: 255 },
    { r: 102, g: 0, b: 102, a: 255 },
    { r: 102, g: 0, b: 51, a: 255 },
    { r: 102, g: 0, b: 0, a: 255 },
    { r: 51, g: 255, b: 255, a: 255 },
    { r: 51, g: 255, b: 204, a: 255 },
    { r: 51, g: 255, b: 153, a: 255 },
    { r: 51, g: 255, b: 102, a: 255 },
    { r: 51, g: 255, b: 51, a: 255 },
    { r: 51, g: 255, b: 0, a: 255 },
    { r: 51, g: 204, b: 255, a: 255 },
    { r: 51, g: 204, b: 204, a: 255 },
    { r: 51, g: 204, b: 153, a: 255 },
    { r: 51, g: 204, b: 102, a: 255 },
    { r: 51, g: 204, b: 51, a: 255 },
    { r: 51, g: 204, b: 0, a: 255 },
    { r: 51, g: 153, b: 255, a: 255 },
    { r: 51, g: 153, b: 204, a: 255 },
    { r: 51, g: 153, b: 153, a: 255 },
    { r: 51, g: 153, b: 102, a: 255 },
    { r: 51, g: 153, b: 51, a: 255 },
    { r: 51, g: 153, b: 0, a: 255 },
    { r: 51, g: 102, b: 255, a: 255 },
    { r: 51, g: 102, b: 204, a: 255 },
    { r: 51, g: 102, b: 153, a: 255 },
    { r: 51, g: 102, b: 102, a: 255 },
    { r: 51, g: 102, b: 51, a: 255 },
    { r: 51, g: 102, b: 0, a: 255 },
    { r: 51, g: 51, b: 255, a: 255 },
    { r: 51, g: 51, b: 204, a: 255 },
    { r: 51, g: 51, b: 153, a: 255 },
    { r: 51, g: 51, b: 102, a: 255 },
    { r: 51, g: 51, b: 51, a: 255 },
    { r: 51, g: 51, b: 0, a: 255 },
    { r: 51, g: 0, b: 255, a: 255 },
    { r: 51, g: 0, b: 204, a: 255 },
    { r: 51, g: 0, b: 153, a: 255 },
    { r: 51, g: 0, b: 102, a: 255 },
    { r: 51, g: 0, b: 51, a: 255 },
    { r: 51, g: 0, b: 0, a: 255 },
    { r: 0, g: 255, b: 255, a: 255 },
    { r: 0, g: 255, b: 204, a: 255 },
    { r: 0, g: 255, b: 153, a: 255 },
    { r: 0, g: 255, b: 102, a: 255 },
    { r: 0, g: 255, b: 51, a: 255 },
    { r: 0, g: 255, b: 0, a: 255 },
    { r: 0, g: 204, b: 255, a: 255 },
    { r: 0, g: 204, b: 204, a: 255 },
    { r: 0, g: 204, b: 153, a: 255 },
    { r: 0, g: 204, b: 102, a: 255 },
    { r: 0, g: 204, b: 51, a: 255 },
    { r: 0, g: 204, b: 0, a: 255 },
    { r: 0, g: 153, b: 255, a: 255 },
    { r: 0, g: 153, b: 204, a: 255 },
    { r: 0, g: 153, b: 153, a: 255 },
    { r: 0, g: 153, b: 102, a: 255 },
    { r: 0, g: 153, b: 51, a: 255 },
    { r: 0, g: 153, b: 0, a: 255 },
    { r: 0, g: 102, b: 255, a: 255 },
    { r: 0, g: 102, b: 204, a: 255 },
    { r: 0, g: 102, b: 153, a: 255 },
    { r: 0, g: 102, b: 102, a: 255 },
    { r: 0, g: 102, b: 51, a: 255 },
    { r: 0, g: 102, b: 0, a: 255 },
    { r: 0, g: 51, b: 255, a: 255 },
    { r: 0, g: 51, b: 204, a: 255 },
    { r: 0, g: 51, b: 153, a: 255 },
    { r: 0, g: 51, b: 102, a: 255 },
    { r: 0, g: 51, b: 51, a: 255 },
    { r: 0, g: 51, b: 0, a: 255 },
    { r: 0, g: 0, b: 255, a: 255 },
    { r: 0, g: 0, b: 204, a: 255 },
    { r: 0, g: 0, b: 153, a: 255 },
    { r: 0, g: 0, b: 102, a: 255 },
    { r: 0, g: 0, b: 51, a: 255 },
    { r: 238, g: 0, b: 0, a: 255 },
    { r: 221, g: 0, b: 0, a: 255 },
    { r: 187, g: 0, b: 0, a: 255 },
    { r: 170, g: 0, b: 0, a: 255 },
    { r: 136, g: 0, b: 0, a: 255 },
    { r: 119, g: 0, b: 0, a: 255 },
    { r: 85, g: 0, b: 0, a: 255 },
    { r: 68, g: 0, b: 0, a: 255 },
    { r: 34, g: 0, b: 0, a: 255 },
    { r: 17, g: 0, b: 0, a: 255 },
    { r: 0, g: 238, b: 0, a: 255 },
    { r: 0, g: 221, b: 0, a: 255 },
    { r: 0, g: 187, b: 0, a: 255 },
    { r: 0, g: 170, b: 0, a: 255 },
    { r: 0, g: 136, b: 0, a: 255 },
    { r: 0, g: 119, b: 0, a: 255 },
    { r: 0, g: 85, b: 0, a: 255 },
    { r: 0, g: 68, b: 0, a: 255 },
    { r: 0, g: 34, b: 0, a: 255 },
    { r: 0, g: 17, b: 0, a: 255 },
    { r: 0, g: 0, b: 238, a: 255 },
    { r: 0, g: 0, b: 221, a: 255 },
    { r: 0, g: 0, b: 187, a: 255 },
    { r: 0, g: 0, b: 170, a: 255 },
    { r: 0, g: 0, b: 136, a: 255 },
    { r: 0, g: 0, b: 119, a: 255 },
    { r: 0, g: 0, b: 85, a: 255 },
    { r: 0, g: 0, b: 68, a: 255 },
    { r: 0, g: 0, b: 34, a: 255 },
    { r: 0, g: 0, b: 17, a: 255 },

    { r: 238, g: 238, b: 238, a: 255 },

    { r: 221, g: 221, b: 221, a: 255 },
    { r: 187, g: 187, b: 187, a: 255 },
    { r: 170, g: 170, b: 170, a: 255 },
    { r: 136, g: 136, b: 136, a: 255 },
    { r: 119, g: 119, b: 119, a: 255 },
    { r: 85, g: 85, b: 85, a: 255 },
    { r: 68, g: 68, b: 68, a: 255 },
    { r: 34, g: 34, b: 34, a: 255 },
    { r: 17, g: 17, b: 17, a: 255 },
    // {r:0,g:0,b:0,a:255},
];
