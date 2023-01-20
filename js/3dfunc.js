import * as THREE from "three";

export function DrawSphere(radius,color){
  let SphereGeometry = new THREE.SphereGeometry( radius, 64, 16 );
  let SphereMaterial = new THREE.MeshBasicMaterial( { color: color } );
  return new THREE.Mesh( SphereGeometry, SphereMaterial );
}

export function DrawRing(innerRadius,outerRadius,color){
  const RingGeometry = new THREE.RingGeometry( innerRadius, outerRadius, 64 );
  const RingMaterial = new THREE.MeshBasicMaterial( { color: color, side: THREE.DoubleSide } );
  return new THREE.Mesh( RingGeometry, RingMaterial );
}






