import * as CANNON from "cannon-es";
import * as THREE from "three";
import {OrbitControls} from "../controls/OrbitControls.js";
import {drawSphere, rad, drawBox, drawCylinder} from "./functions.js";

const scene = new THREE.Scene();
let windowWidth = window.innerWidth,windowHeight = window.innerHeight;
//scene.background = new THREE.Color( 0x0 );

//渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(windowWidth*0.7, windowHeight * 0.7);//"图像"的长宽比
$("#container").append(renderer.domElement);

//透视型camera
const camera = new THREE.PerspectiveCamera(
  100, //视野角度
  windowWidth / (windowHeight * 0.7),//"屏幕"的长宽比
  0.1,
  1000);
camera.position.z = 35;

//轨道照相机,可以用鼠标调整视角
const controls = new OrbitControls(camera, renderer.domElement);

//光源
const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);


let m = 1, theta = rad(30), len0 = 15,len = len0, dt = 1 / 60, running = false;

//创建物体
let smallBall = drawSphere(0.5, 0xff0000);
let bigBall = drawSphere(2, 0x0ef76f);
let floor = drawBox(50, 3, 20, 0xffffff);
let string0 = drawCylinder(0.1, len, 0xffffff);

//调整物体参数
floor.position.y = -30;

function adjustParams() {
  smallBall.position.y = len;
  bigBall.position.copy(new THREE.Vector3(len * Math.sin(theta), len - (len * Math.cos(theta)), 0));
  string0.position.copy(bigBall.position.clone().add(smallBall.position).multiplyScalar(0.5));
  string0.rotation.z = theta;
}
adjustParams();

//添加物体到场景
scene.add(floor);
scene.add(string0);
scene.add(smallBall);
scene.add(bigBall);

//创建物理世界
let world = new CANNON.World();
world.gravity.set(0, -9.8, 0);
world.broadphase = new CANNON.NaiveBroadphase();

//创建物理对象
let bodyBigBall = new CANNON.Body({
  mass: m,
  position: new CANNON.Vec3(len * Math.sin(theta), len - (len * Math.cos(theta)), 0),
  shape: new CANNON.Sphere(2),
  material: new CANNON.Material({restitution: 0}),
  linearDamping: 0,
  angularDamping: 0
});

let bodyFloor = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(0, -30, 0),
  shape: new CANNON.Box(new CANNON.Vec3(25, 1.5, 10)),
  material: new CANNON.Material({friction: 0})
});

let bodySmallBall = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(0, len, 0),
  shape: new CANNON.Sphere(0.5),
  material: new CANNON.Material(),
  velocity: new CANNON.Vec3(0, 0, 0)
});

//对接物理世界和场景
bigBall.userData = bodyBigBall;
floor.userData = bodyFloor;
smallBall.userData = bodySmallBall;

//添加物理对象到物理世界
world.addBody(bodyFloor);
world.addBody(bodyBigBall);
world.addBody(bodySmallBall);

//创建约束
let connect = new CANNON.DistanceConstraint(bodySmallBall,bodyBigBall,len);
world.addConstraint(connect);


function resetStatus(){
  if(running) {
    start_pause();
  }

  theta = rad(Number($("#theta").val()));
  m = Number($("#mess").val());
  len = Number($("#length").val());
  world.gravity = new CANNON.Vec3(0,-Number($("#gravity").val()),0);

  $("#mess").removeAttr("disabled");
  $("#theta").removeAttr("disabled");
  $("#length").removeAttr("disabled");
  $("#gravity").removeAttr("disabled");
  adjustParams();

  bodySmallBall.position.set(0, len, 0);

  bodyBigBall.position.set(len * Math.sin(theta), len - (len * Math.cos(theta)), 0);
  bodyBigBall.velocity.set(0, 0, 0);
  bodyBigBall.angularVelocity.set(0, 0, 0);

  string0.scale.y = len/len0;

  world.removeConstraint(connect);
  connect = new CANNON.DistanceConstraint(bodySmallBall,bodyBigBall,len);
  world.addConstraint(connect);

  renderer.render(scene, camera);
}

function start_pause() {
  if(running){
    running = false;
    $("#pause").text("运行");
  }else{
    running = true;
    $("#apply").attr("disabled","disabled");
    $("#mess").attr("disabled","disabled");
    $("#theta").attr("disabled","disabled");
    $("#length").attr("disabled","disabled");
    $("#gravity").attr("disabled","disabled");
    $("#pause").text("暂停");
    animate();
  }
}

window.resetStatus = resetStatus;
window.start_pause = start_pause;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  if (running) {
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
  }
  controls.update();
}

animate();
