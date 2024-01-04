import * as THREE from "three";
// 导入轨道控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// 目标：认识pointes

// 1、创建场景
const scene = new THREE.Scene();

// 2、创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// 设置相机位置
camera.position.set(0, 0, 10);
scene.add(camera);

/** 创建球几何体 */
const sphereGeometry = new THREE.SphereBufferGeometry(3, 30, 30);
// 1. 原先方法
// const material = new THREE.MeshBasicMaterial({
//   color: 0xff0000,
//   wireframe: true, // 线框显示
// });
// const mesh = new THREE.Mesh(sphereGeometry, material);
// scene.add(mesh);

// 2. 设置点材质
const pointsMaterial = new THREE.PointsMaterial();
pointsMaterial.size = 0.1; // 设置点材质的大小 0 到 1
pointsMaterial.color.set(0xfff000); // 设置点材质颜色
// 是否随相机深度而衰减: 离相机近的粒子看起来比离相机远的粒子更大。
pointsMaterial.sizeAttenuation = true;

// 载入纹理
const textureLoader = new THREE.TextureLoader(); // 创建纹理加载器对象
const texture = textureLoader.load("./textures/particles/2.png");
// 设置点材质纹理
pointsMaterial.map = texture;
pointsMaterial.alphaMap = texture; // 根据纹理的内容精细地控制每个像素的透明度: 黑色表示完全透明，白色表示完全不透明，灰色则表示中间透明度。
pointsMaterial.transparent = true; // 设置材质为透明，以使得纹理中的透明部分能够正确地显示
pointsMaterial.depthWrite = false; // 关闭深度写入，这意味着在渲染的时候不会更新深度缓冲区。通常在渲染透明物体时，关闭深度写入可以确保透明物体正确地显示在其他物体之上。
pointsMaterial.blending = THREE.AdditiveBlending; // 设置混合模式为加法混合，这种混合模式适用于创建发光的效果，通常在粒子系统中用于模拟光点、火花等效果。

const points = new THREE.Points(sphereGeometry, pointsMaterial);

scene.add(points);

// 初始化渲染器
const renderer = new THREE.WebGLRenderer();
// 设置渲染的尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 开启场景中的阴影贴图
renderer.shadowMap.enabled = true;
renderer.physicallyCorrectLights = true;

// console.log(renderer);
// 将webgl渲染的canvas内容添加到body
document.body.appendChild(renderer.domElement);

// // 使用渲染器，通过相机将场景渲染进来
// renderer.render(scene, camera);

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置控制器阻尼，让控制器更有真实效果,必须在动画循环里调用.update()。
controls.enableDamping = true;

// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

function render() {
  controls.update();
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
