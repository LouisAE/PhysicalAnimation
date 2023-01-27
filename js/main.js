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


let m = 1, theta = rad(30), len0 = 15,len = len0, dt = 1 / 60, ani, running = false;


let smallBall = DrawSphere(0.5, 0xff0000);

let bigBall = DrawSphere(2, 0x0ef76f);
smallBall.position.y = len;
bigBall.position.x = len * Math.sin(theta);
bigBall.position.y = len - (len * Math.cos(theta));
scene.add(smallBall);
scene.add(bigBall);

let floor = DrawBox(50, 3, 20, 0xffffff);
floor.position.y = -30;
scene.add(floor);

//细线
let string0 = DrawCylinder(0.1, len, 0xffffff);
string0.position.copy(bigBall.position.clone().add(smallBall.position).multiplyScalar(0.5));
string0.rotateZ(theta);
scene.add(string0);


//物理世界
let world = new CANNON.World();
world.gravity.set(0, -9.8, 0);
world.broadphase = new CANNON.NaiveBroadphase();

let bodyBigBall = new CANNON.Body({
  mass: m,
  position: new CANNON.Vec3(len * Math.sin(theta), len - (len * Math.cos(theta)), 0),
  shape: new CANNON.Sphere(2),
  material: new CANNON.Material({restitution: 0})
});
bigBall.userData = bodyBigBall;
bodyBigBall.linearDamping = 0;
bodyBigBall.angularDamping = 0;
world.addBody(bodyBigBall);

let bodyFloor = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(0, -30, 0),
  shape: new CANNON.Box(new CANNON.Vec3(25, 1.5, 10)),
  material: new CANNON.Material({friction: 0})
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

let  connect = new CANNON.DistanceConstraint(bodySmallBall,bodyBigBall,len);
world.addConstraint(connect);


function resetStatus(){
  if(running) {
    start_pause();
  }
  $("#mess").removeAttr("disabled");
  $("#theta").removeAttr("disabled");
  $("#length").removeAttr("disabled");




  theta = rad($("#theta").val());
  len = Number($("#length").val());
  m = Number($("#mess").val());

  string0.scale.y = Number($("#length").val())/len0;
  smallBall.position.y = len;
  bodySmallBall.position.set(0, len, 0);

  bigBall.position.copy(new THREE.Vector3(len * Math.sin(theta), len - (len * Math.cos(theta)), 0));
  bodyBigBall.position.set(len * Math.sin(theta), len - (len * Math.cos(theta)), 0);
  bodyBigBall.velocity.set(0, 0, 0);
  bodyBigBall.angularVelocity.set(0, 0, 0);

  string0.position.copy(bigBall.position.clone().add(smallBall.position).multiplyScalar(0.5));
  string0.rotation.z = theta;

  world.removeConstraint(connect);
  connect = new CANNON.DistanceConstraint(bodySmallBall,bodyBigBall,len);
  world.addConstraint(connect);

  renderer.render(scene, camera);
}

function start_pause() {
  if(running){
    cancelAnimationFrame(ani);
    running = false;
    $("#pause").text("运行");
  }else{
    running = true;
    $("#apply").attr("disabled","disabled");
    $("#mess").attr("disabled","disabled");
    $("#theta").attr("disabled","disabled");
    $("#length").attr("disabled","disabled");
    $("#pause").text("暂停");
    animate();
  }
}

window.resetStatus = resetStatus;
window.start_pause = start_pause;

function animate() {
  ani = requestAnimationFrame(animate);
  renderer.render(scene, camera);
  world.step(dt);

  for (let i in scene.children) {
    if (scene.children[i].isMesh && scene.children[i].userData.position) {
      scene.children[i].position.copy(scene.children[i].userData.position);
      scene.children[i].quaternion.copy(scene.children[i].userData.quaternion);
    }
  }

  string0.position.copy(bigBall.position.clone().add(smallBall.position).multiplyScalar(0.5));
  string0.rotation.z = theta;

  theta = Math.atan2(bigBall.position.x, len - bigBall.position.y);
  controls.update();
}

renderer.render(scene, camera);
