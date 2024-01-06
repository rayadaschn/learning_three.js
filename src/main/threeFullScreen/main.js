import * as THREE from "three";
// 导入轨道控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// 导入动画库
import gsap from "gsap";

// 目标：3D 动画特效

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

const cubeGeometry = new THREE.BoxBufferGeometry(2, 2, 2);
const material = new THREE.MeshBasicMaterial({
  wireframe: true,
});

// 定义射线物体颜色, 稍后使用
const redMaterial = new THREE.MeshBasicMaterial({
  color: "#ff0000",
});

// 第一页多立方体
// 1. 创建1000个立方体
const cubeArr = [];
const cubeGroup = new THREE.Group();
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    for (let z = 0; z < 5; z++) {
      const cube = new THREE.Mesh(cubeGeometry, material);
      cube.position.set(i * 2 - 4, j * 2 - 4, z * 2 - 4);
      cubeGroup.add(cube);
      cubeArr.push(cube);
    }
  }
}

scene.add(cubeGroup);

// 第二页创建三角形物体
const sjxGroup = new THREE.Group();
for (let i = 0; i < 50; i++) {
  // 每一个三角形，需要3个顶点，每个顶点需要3个值
  const geometry = new THREE.BufferGeometry();
  const positionArray = new Float32Array(9);
  for (let j = 0; j < 9; j++) {
    if (j % 3 == 1) {
      positionArray[j] = Math.random() * 10 - 5;
    } else {
      positionArray[j] = Math.random() * 10 - 5;
    }
  }
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positionArray, 3)
  );
  const color = new THREE.Color(Math.random(), Math.random(), Math.random());
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  // 根据几何体和材质创建物体
  const sjxMesh = new THREE.Mesh(geometry, material);
  sjxGroup.add(sjxMesh);
}
sjxGroup.position.set(0, -30, 0); // 第二页位置
scene.add(sjxGroup);

// 第三页弹跳小球
const sphereGroup = new THREE.Group();
const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20);
const spherematerial = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
});
const sphere = new THREE.Mesh(sphereGeometry, spherematerial);
// 投射阴影
sphere.castShadow = true;
sphereGroup.add(sphere);

// 创建平面
const planeGeometry = new THREE.PlaneBufferGeometry(20, 20);
const plane = new THREE.Mesh(planeGeometry, spherematerial);
plane.position.set(0, -1, 0);
plane.rotation.x = -Math.PI / 2;
// 接收阴影
plane.receiveShadow = true;
sphereGroup.add(plane);

// 灯光, 环境光
const light = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
sphereGroup.add(light);

const smallBall = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.1, 20, 20),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
smallBall.position.set(2, 2, 2);
//直线光源
const pointLight = new THREE.PointLight(0xff0000, 3);
pointLight.castShadow = true;

// 设置阴影贴图模糊度
pointLight.shadow.radius = 20;
// 设置阴影贴图的分辨率
pointLight.shadow.mapSize.set(512, 512);

// 设置透视相机的属性
smallBall.add(pointLight);
sphereGroup.add(smallBall);

sphereGroup.position.set(0, -60, 0);
scene.add(sphereGroup);

// -----------------------------
const arrGroup = [cubeGroup, sjxGroup, sphereGroup]; // 记录场景

// 创建投射光线对象
const raycaster = new THREE.Raycaster();

// 获取鼠标的位置对象
const mouse = new THREE.Vector2();

// 监听鼠标的位置
window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX / window.innerWidth - 0.5;
  mouse.y = event.clientY / window.innerHeight - 0.5;
});

// 监听点击鼠标的位置
window.addEventListener("click", (event) => {
  // 获取归一化坐标, 范围: [-1, 1]
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -((event.clientY / window.innerHeight) * 2 - 1);
  raycaster.setFromCamera(mouse, camera); // 通过 setFromCamera 方法将鼠标位置映射到摄像机上，以便后续的射线投射
  const result = raycaster.intersectObjects(cubeArr); // 使用射线投射器 raycaster 对象，检测是否与一个或多个物体相交。cubeArr 是一个包含可能被点击的物体的数组。

  result.forEach((item) => {
    item.object.material = redMaterial;
  });
});

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

// 添加移动动画
gsap.to(cubeGroup.rotation, {
  x: "+=" + Math.PI * 2,
  y: "+=" + Math.PI * 2,
  duration: 10,
  ease: "power2.inOut",
  repeat: -1,
});
gsap.to(sjxGroup.rotation, {
  x: "-=" + Math.PI * 2,
  z: "+=" + Math.PI * 2,
  duration: 12,
  ease: "power2.inOut",
  repeat: -1,
});
gsap.to(smallBall.position, {
  x: -3,
  duration: 6,
  ease: "power2.inOut",
  repeat: -1,
  yoyo: true,
});
gsap.to(smallBall.position, {
  y: 0,
  duration: 0.5,
  ease: "power2.inOut",
  repeat: -1,
  yoyo: true,
});

// 设置时钟
const clock = new THREE.Clock();

// 重置渲染函数
function render() {
  const deltaTime = clock.getDelta();

  // 根据当前滚动的 scrolly ，去设置相机移动的位置
  const currentPage = window.scrollY / window.innerHeight;
  camera.position.y = -currentPage * 30; // 俩物体间相差 30
  camera.position.x += (mouse.x * 10 - camera.position.x) * deltaTime * 5;

  renderer.render(scene, camera);
  //   渲染下一帧的时候就会调用render函数
  requestAnimationFrame(render);
}

render();

// 监听画面变化，更新渲染画面
window.addEventListener("resize", () => {
  // 更新摄像头
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新摄像机的投影矩阵
  camera.updateProjectionMatrix();

  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 设置渲染器的像素比
  renderer.setPixelRatio(window.devicePixelRatio);
});

// 设置当前页
let currentPage = 0;
// 监听滚动事件
window.addEventListener("scroll", () => {
  const newPage = Math.round(window.scrollY / window.innerHeight);
  if (newPage != currentPage) {
    currentPage = newPage;
    console.log("改变页面，当前是：" + currentPage);
    console.log(arrGroup[currentPage].rotation);
    // 旋转物体
    gsap.to(arrGroup[currentPage].rotation, {
      z: "+=" + Math.PI * 2,
      x: "+=" + Math.PI * 2,
      duration: 2,
      onComplete: () => {
        console.log("旋转完成");
      },
    });

    gsap.fromTo(
      `.page${currentPage} h1`,
      { x: -300 },
      { x: 0, rotate: "+=360", duration: 1 }
    );
  }
});
