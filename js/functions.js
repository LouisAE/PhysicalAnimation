import * as THREE from "three";

export function DrawSphere(radius,color){
  let geometry = new THREE.SphereGeometry( radius, 64, 16 );
  let material = new THREE.MeshBasicMaterial( { color: color } );
  return new THREE.Mesh( geometry, material );
}

export function DrawRing(innerRadius,outerRadius,color){
  const geometry = new THREE.RingGeometry( innerRadius, outerRadius, 64 );
  const material = new THREE.MeshBasicMaterial( { color: color, side: THREE.DoubleSide } );
  return new THREE.Mesh( geometry, material );
}

export function DrawBox(width, height, depth, color) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshBasicMaterial({ color: color });
  return new THREE.Mesh(geometry, material);
}

export function DrawCylinder(radius, height, color) {
  const geometry = new THREE.CylinderGeometry(radius, radius, height);
  const material = new THREE.MeshBasicMaterial({ color: color });
  return new THREE.Mesh(geometry, material);
}

//化角度为弧度
export function rad(deg) {
  return deg * Math.PI / 180;
}




