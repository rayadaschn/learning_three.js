import { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

const Page = () => {
  useEffect(() => {
    console.log(THREE);
    const canvas = document.getElementById("c");

    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    // 创建3D场景
    const scene = new THREE.Scene();

    const axes = new THREE.AxesHelper(100); // 增加坐标轴
    const grid = new THREE.GridHelper(100, 10); // 增加网格
    scene.add(axes, grid);

    // 添加光照全局
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(ambientLight, directionalLight);

    // 创建立方体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const faces = [];
    for (let i = 0; i < geometry.groups.length; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff * Math.random(),
      });

      faces.push(material);
    }

    // // 创建立方体的材质
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0x1890ff,
    //   // wireframe: true, // 透视线框
    // });
    // // 创建物体对象
    // const mesh = new THREE.Mesh(geometry, material);
    /** 创建物体对象(表面) */
    const mesh = new THREE.Mesh(geometry, faces);

    scene.add(mesh);

    // 创建相机对象
    const camera = new THREE.PerspectiveCamera(75, width / height); // 透视相机

    // 设置相机位置
    camera.position.set(2, 2, 3); // 相机默认的坐标是在(0,0,0);
    // 设置相机方向
    camera.lookAt(scene.position); // 将相机朝向场景
    // 将相机添加到场景中
    scene.add(camera);

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true, // 抗锯齿
    });

    // 设置渲染器屏幕像素比, 提高精度
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    // 设置渲染器大小
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 执行渲染
    renderer.render(scene, camera);

    // 创建轨道控制器
    const orbitControl = new OrbitControls(camera, canvas);
    orbitControl.enableDamping = true; // 启用阻尼效果(惯性效果)

    // 创建性能监视器
    const stats = new Stats();
    stats.setMode(0); // 0: 0 fps, 1: 1000 fps, 2: 100 f
    document.body.appendChild(stats.dom);

    const clock = new THREE.Clock(); // 创建一个时钟对象
    const tick = () => {
      const elapsedTime = clock.getElapsedTime(); // 获取自时钟创建以来经过的时间

      mesh.rotation.y = 0.5 * elapsedTime; // 让物体旋转
      mesh.position.x = Math.sin(0.5 * elapsedTime); // 让物体在x轴上移动
      mesh.scale.z = Math.sin(0.5 * elapsedTime); // 让物体在z轴上缩放

      orbitControl.update(); // 更新控制器
      stats.update(); // 更新性能监视器

      renderer.render(scene, camera);
      requestAnimationFrame(tick); // requestAnimationFrame 来请求下一次动画帧。这样，动画将以浏览器的最佳绘制频率运行，提供更流畅的用户体验。
    };

    // 启动动画
    tick();

    // 检测 resize 窗体变化
    window.addEventListener("resize", () => {
      // 更新摄像头
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // 更新渲染器
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio || 1);
    });
  }, []);

  return (
    <>
      <canvas id="c" />;
    </>
  );
};

export default Page;
