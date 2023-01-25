import * as CANNON from "cannon-es";
import * as THREE from "three";
import {OrbitControls} from "../controls/OrbitControls.js";
import {DrawSphere, rad, DrawBox, DrawCylinder} from "./functions.js";

const scene = new THREE.Scene();
//scene.background = new THREE.Color( 0x0 );
//渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight * 0.7);//"图像"的长宽比
document.getElementById("container").appendChild(renderer.domElement);

//透视型camera
const camera = new THREE.PerspectiveCamera(
  100, //视野角度
  window.innerWidth / (window.innerHeight * 0.7),//"屏幕"的长宽比
  0.1,
  1000);
camera.position.z = 35;

//轨道照相机,可以用鼠标调整视角
const controls = new OrbitControls(camera, renderer.domElement);
//光源
const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

let m = 1,theta = rad(60),len = 15,dt = 1/60;

let smallBall = DrawSphere(0.5,0xff0000);

let bigBall = DrawSphere(2,0x0ef76f);
smallBall.position.y = len;
bigBall.position.x = len * Math.sin(theta);
bigBall.position.y = len - (len * Math.cos(theta));
scene.add(smallBall);
scene.add(bigBall);

let floor = DrawBox(50,3,2,0xffffff);
floor.position.y = -10;
scene.add(floor);

//细线
let string0 = DrawCylinder(0.1, len, 0xffffff);
string0.position.copy(bigBall.position.clone().add(smallBall.position).multiplyScalar(0.5));
string0.rotateZ(theta);
scene.add(string0);



let world = new CANNON.World();
world.gravity.set(0, -9.8, 0);
world.broadphase = new CANNON.NaiveBroadphase();

let bodyBigBall = new CANNON.Body({
  mass: m,
  position: new CANNON.Vec3(len * Math.sin(theta), len - (len * Math.cos(theta)), 0),
  shape: new CANNON.Sphere(2),
  material: new CANNON.Material({restitution:0})
});
bigBall.userData = bodyBigBall;
bodyBigBall.linearDamping=0;
bodyBigBall.angularDamping=0;
world.addBody(bodyBigBall);

let bodyFloor = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(0, -10, 0),
  shape: new CANNON.Box(new CANNON.Vec3(25, 1.5, 1)),
  material: new CANNON.Material({friction:0})
});
floor.userData = bodyFloor;
world.addBody(bodyFloor);

let bodySmallBall = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(0, len, 0),
  shape: new CANNON.Sphere(0.5),
  material: new CANNON.Material(),
  velocity: new CANNON.Vec3(0, 0, 0)
});
smallBall.userData = bodySmallBall;
world.addBody(bodySmallBall);

/*
let bodyString0 = new CANNON.Body({
  mass: 0.1,
  position: new CANNON.Vec3(string0.position.x, string0.position.y, string0.position.z),
  shape: new CANNON.Cylinder(0.1, 0.1, len, 10),
  material: new CANNON.Material()
});
string0.userData = bodyString0;
world.addBody(bodyString0);


//world.addConstraint(new CANNON.PointToPointConstraint(bodyString0,new CANNON.Vec3(0,len/2,0), bodySmallBall,new CANNON.Vec3(0,0,0)));
*/

world.addConstraint(new CANNON.PointToPointConstraint(bodySmallBall,new CANNON.Vec3(0,0,0), bodyBigBall,new CANNON.Vec3(-len*Math.sin(theta),len*Math.cos(theta),0)));

function animate() {
  //ani = requestAnimationFrame(animate);
  renderer.render(scene, camera);
  world.step(dt);
  for(let i in scene.children) {
    if (scene.children[i].isMesh && scene.children[i].userData.position) {
      scene.children[i].position.copy(scene.children[i].userData.position);
      scene.children[i].quaternion.copy(scene.children[i].userData.quaternion);
    }
  }
  controls.update();
}
//animate();
renderer.setAnimationLoop(animate);

