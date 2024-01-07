import * as THREE from "three";
// 导入轨道控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// 导入 cannon 引擎
import * as CANNON from "cannon-es";
import hitSoundMp3 from "@/assets/audio/metalHit.mp3";

// 目标：点击创建自由落体物体

// 1、创建场景
const scene = new THREE.Scene();

// 2、创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);

// 设置相机位置
camera.position.set(0, 0, 18);
scene.add(camera);

const cubeArr = [];
// 设置物体材质
const cubeWorldMaterial = new CANNON.Material("cube");

// 创建碰撞音效
const hitSound = new Audio(hitSoundMp3); // 浏览器需要激活, 才可以播放第一次声音

// 创建球和平面
const createCube = () => {
  const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshStandardMaterial();
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.castShadow = true;
  scene.add(cube);
  // 创建物理形状的 cube
  const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)); // 因为是实体盒子的宽高厚, 因此取大小的一半

  // 创建物理世界的物体
  const cubeBody = new CANNON.Body({
    shape: cubeShape,
    position: new CANNON.Vec3(0, 5, 0), // 设置初始位置
    mass: 1,
    material: cubeWorldMaterial,
  });

  // 添加作用力(可不添加)
  cubeBody.applyLocalForce(
    new CANNON.Vec3(100, 0, 0),
    new CANNON.Vec3(0, 0, 0)
  );

  // 将物体添加到物理世界
  cannonWorld.addBody(cubeBody);

  // ---- 监听碰撞事件 -----
  const hitEnents = (e) => {
    // 获取碰撞强度
    const impactStrength = e.contact.getImpactVelocityAlongNormal();
    console.log("碰撞强度:", impactStrength);
    if (impactStrength > 1) {
      // 重新从头开始播放
      hitSound.currentTime = 0;
      hitSound.volume = impactStrength / 20; // 随强度减弱而音量变小
      hitSound.play();
    }
  };

  cubeBody.addEventListener("collide", hitEnents);
  cubeArr.push({
    mesh: cube,
    body: cubeBody,
  });
};

// 监听点击, 创作物体
window.addEventListener("click", createCube);

// 创建地面
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: "gray" })
);

floor.position.set(0, -5, 0);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 创建cannon物理世界
const cannonWorld = new CANNON.World();
cannonWorld.gravity.set(0, -9.82, 0); // 设置重力

// 再创建物理地面
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
const floorMaterial = new CANNON.Material("floor");
floorBody.material = floorMaterial;

// 设置物理地面材质大小质量等
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.position.set(0, -5, 0);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); // 旋转
cannonWorld.addBody(floorBody);

// 设置2种材质碰撞的参数
const defaultContactMaterial = new CANNON.ContactMaterial(
  cubeWorldMaterial,
  floorMaterial,
  {
    friction: 0.1, // 摩擦力
    restitution: 0.7, // 弹性
  }
);

// 将材料的关联设置添加的物理世界
cannonWorld.addContactMaterial(defaultContactMaterial);

// 设置世界碰撞的默认材料
cannonWorld.defaultContactMaterial = defaultContactMaterial;

//添加环境光和平行光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.castShadow = true;
scene.add(dirLight);

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true });
// 设置渲染的尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 开启场景中的阴影贴图
renderer.shadowMap.enabled = true;
renderer.physicallyCorrectLights = true;

// 将webgl渲染的canvas内容添加到body
document.body.appendChild(renderer.domElement);

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置控制器阻尼，让控制器更有真实效果,必须在动画循环里调用.update()。
controls.enableDamping = true;

// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 设置时钟
const clock = new THREE.Clock();

// 重置渲染函数
function render() {
  const deltaTime = clock.getDelta();
  // 更新物理引擎里世界的物体
  cannonWorld.step(1 / 60, deltaTime);

  // 创建多个小物体
  cubeArr.forEach((item) => {
    item.mesh.position.copy(item.body.position);
    item.mesh.quaternion.copy(item.body.quaternion); // 旋转也要复制
  });

  renderer.render(scene, camera);
  //   渲染下一帧的时候就会调用render函数
  requestAnimationFrame(render);
}
render();

// 监听画面变化，更新渲染画面
window.addEventListener("resize", () => {
  //   console.log("画面变化了");

  // 更新摄像头
  camera.aspect = window.innerWidth / window.innerHeight;
  //   更新摄像机的投影矩阵
  camera.updateProjectionMatrix();

  //   更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
  //   设置渲染器的像素比
  renderer.setPixelRatio(window.devicePixelRatio);
});
