import JTreeEntity from './JTreeEntity';
import ThirdPersonController from './thirdpersoncontroller';
import FlyCharacter from './FlyCharacter';
import CinematicController from './cinematiccontroller';
import * as THREE from 'three';
import Vox from './o3d/vox';
import {keys, mouse} from './lib/input';
import * as Howl from 'howler';
import AI from './o3d/ai';

interface IGameWindow extends Window {
    scene: THREE.Scene;
}

declare const window: IGameWindow;

const charData = require('./content/character/character.toml');
const testLevel = require('./content/testlevel.toml');
const dinoMite = require('./content/character/dinomite.toml');
const dinostrip = new Vox(require('./content/character/dinostrip.toml'));

const scene = new THREE.Scene();

window.scene = scene;
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let controls: CinematicController;
const clock = new THREE.Clock();

camera.position.z = 10;
camera.position.y = 2;

const uniforms = {
    color: {value: new THREE.Vector4(0, 1, 0, 1)},
};

const material = new THREE.MeshPhongMaterial( {color: 0xFFFF00} );

const sphereCenter = new THREE.Vector3(5, 5, 5);
const sphereRadius = 4;
const jtree = new JTreeEntity(material);

jtree.position.copy(new THREE.Vector3(-4, 10, -40));
jtree.generateJTreeSphere(sphereCenter, sphereRadius);
jtree.spawnCubes();

const character = new Vox(charData);
controls = new CinematicController(camera);

const makeDinoMite = () => {
    const o3d = new AI(dinoMite);
    o3d.position.set(Math.random() * 2, 0, Math.random() * 2);
    scene.add(o3d);
};

let x = 0;
while(x < 10) {
    x++;
    makeDinoMite();
}

scene.add(dinostrip);
scene.add(new Vox(testLevel));
scene.add(jtree);
scene.add(new THREE.DirectionalLight());
scene.add(new THREE.AmbientLight());

const direction = 1;

let soundFired = false;
const sound = new Howl.Howl({
  src: ['./sfx/sacktap.wav'],
  onend: () => {
    soundFired = false;
  },
});

const music = new Howl.Howl({
  src: ['./sfx/Flaming Atoms.mp3'],
});

music.loop(true);
music.play();

const render = () => {
    requestAnimationFrame(render);
    const delta = clock.getDelta();
    controls.tick(delta);

    renderer.render(scene, camera);
};

render();
