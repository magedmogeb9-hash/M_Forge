// ============ scene3d.js ============
// تصوّرات ثلاثية الأبعاد متحركة (3D + بُعد الزمن كحركة) — بديل واقعي وشغّال
// لمفهوم "4D" الذي لا توجد له تقنية فيديو مجانية حقيقية.

let mfRenderer, mfScene, mfCamera, mfAnimId;

function stopScene(){
  if (mfAnimId) cancelAnimationFrame(mfAnimId);
  const container = document.getElementById('scene3dContainer');
  if (mfRenderer) {
    mfRenderer.dispose();
    if (mfRenderer.domElement && mfRenderer.domElement.parentNode === container){
      container.removeChild(mfRenderer.domElement);
    }
  }
}

function initSceneBase(){
  const container = document.getElementById('scene3dContainer');
  const w = container.clientWidth, h = container.clientHeight;
  mfScene = new THREE.Scene();
  mfCamera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
  mfCamera.position.set(0, 0, 14);
  mfRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  mfRenderer.setSize(w, h);
  container.appendChild(mfRenderer.domElement);

  const ambient = new THREE.AmbientLight(0xC9A227, 0.6);
  mfScene.add(ambient);
  const point = new THREE.PointLight(0xF0D264, 1.4, 100);
  point.position.set(6, 8, 10);
  mfScene.add(point);
}

function renderScene(preset){
  stopScene();
  initSceneBase();
  let update = () => {};

  if (preset === 'eagle') {
    const geo = new THREE.OctahedronGeometry(4, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0xC9A227, metalness: 0.85, roughness: 0.25, flatShading: true });
    const eagle = new THREE.Mesh(geo, mat);
    mfScene.add(eagle);
    update = (t) => { eagle.rotation.y = t * 0.4; eagle.rotation.x = Math.sin(t * 0.3) * 0.2; };

  } else if (preset === 'orbit') {
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.3, 32, 32), new THREE.MeshStandardMaterial({ color: 0xF0D264, emissive: 0x7A5B12, emissiveIntensity: 0.6 }));
    mfScene.add(core);
    const orbiters = [];
    for (let i = 0; i < 4; i++){
      const r = 3 + i * 1.6;
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), new THREE.MeshStandardMaterial({ color: 0xC9A227 }));
      mfScene.add(m);
      orbiters.push({ mesh: m, r, speed: 0.5 + i * 0.15 });
    }
    update = (t) => {
      orbiters.forEach(o => {
        o.mesh.position.x = Math.cos(t * o.speed) * o.r;
        o.mesh.position.z = Math.sin(t * o.speed) * o.r;
      });
    };

  } else if (preset === 'crystal') {
    const geo = new THREE.IcosahedronGeometry(3.5, 0);
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xC9A227, transparent: true, opacity: 0.75, roughness: 0.1, metalness: 0.2, transmission: 0.4 });
    const crystal = new THREE.Mesh(geo, mat);
    mfScene.add(crystal);
    update = (t) => { crystal.rotation.y = t * 0.3; crystal.rotation.x = t * 0.2; crystal.scale.setScalar(1 + Math.sin(t) * 0.05); };

  } else if (preset === 'wave') {
    const geo = new THREE.PlaneGeometry(14, 14, 60, 60);
    const mat = new THREE.MeshStandardMaterial({ color: 0xC9A227, wireframe: true });
    const plane = new THREE.Mesh(geo, mat);
    plane.rotation.x = -Math.PI / 3;
    mfScene.add(plane);
    const pos = geo.attributes.position;
    update = (t) => {
      for (let i = 0; i < pos.count; i++){
        const x = pos.getX(i), y = pos.getY(i);
        pos.setZ(i, Math.sin(x * 0.6 + t) * 0.6 + Math.cos(y * 0.6 + t) * 0.6);
      }
      pos.needsUpdate = true;
    };
  }

  const clock = new THREE.Clock();
  function animate(){
    mfAnimId = requestAnimationFrame(animate);
    update(clock.getElapsedTime());
    mfRenderer.render(mfScene, mfCamera);
  }
  animate();
}
