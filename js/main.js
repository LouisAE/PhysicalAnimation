import * as THREE from "./three.module.js";
import {DrawSphere, DrawRing} from "./3dfunc.js";
import {OrbitControls} from "../controls/OrbitControls.js";


const scene = new THREE.Scene();
//scene.background = new THREE.Color( 0x0 );

//渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight * 0.7);//"图像"的长宽比
document.getElementById("container").appendChild(renderer.domElement);

//透视型camera
const camera = new THREE.PerspectiveCamera(
  85, //视野角度
  window.innerWidth / (window.innerHeight * 0.7),//"屏幕"的长宽比
  0.1,
  1000);
camera.position.z = 35;

const controls = new OrbitControls(camera, renderer.domElement);


let sphere0 = DrawSphere(5, 0xff0000);
let sphere1 = DrawSphere(2, 0x00ff00);

scene.add(sphere0);
scene.add(sphere1);

sphere1.position.x = 10;
sphere1.position.z = 0;


let ring0 = DrawRing(19.9, 20, 0xffffff);
let ring1 = DrawRing(9.9, 10, 0xff00ff);
scene.add(ring0);
scene.add(ring1);

const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

let t = 0, w1 = 10, w2 = 1, ani, running;

function ApplySettings() {
  w1 = $("#an_velocity").val();
  if ($("#pause").prop("checked")) {
    cancelAnimationFrame(ani);
    running = false;
  } else if (!running) {
    animate();

  }
}

window.ApplySettings = ApplySettings;//暴露修改函数

function animate() {
  ani = requestAnimationFrame(animate);
  t += 0.01;
  ring0.rotation.y = -w2 * t;//顺时针，和座标轴保持一致
  sphere1.position.x = 10 * Math.cos(w1 * t) * Math.cos(w2 * t);
  sphere1.position.y = 10 * Math.sin(w1 * t);
  sphere1.position.z = 10 * Math.cos(w1 * t) * Math.sin(w2 * t);
  ring1.rotation.y = -w2 * t;
  renderer.render(scene, camera);
  controls.update();
}

animate();

