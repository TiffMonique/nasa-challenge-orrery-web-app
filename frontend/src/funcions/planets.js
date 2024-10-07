import * as THREE from 'three';
import planetData from '../data/planetData.json';
import axios from 'axios';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

const apiUrl = 'http://localhost:3001/planets';  // Endpoint de tu servidor

// Función para consumir el endpoint planets
export async function fetchPlanets(page = 1, limit = 10, full_name = '') {
  try {
    const response = await axios.get(apiUrl, {
    });

    // Procesar los datos recibidos
    console.log('Planets data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching planets:', error);
  }
}


// ******  SHOW PLANET INFO AFTER SELECTION  ******
export function showPlanetInfo(planet) {
  var info = document.getElementById('planetInfo');
  var name = document.getElementById('planetName');
  var details = document.getElementById('planetDetails');

  name.innerText = planet;
  details.innerText = `Radius: ${planetData[planet].radius}\nTilt: ${planetData[planet].tilt}\nRotation: ${planetData[planet].rotation}\nOrbit: ${planetData[planet].orbit}\nDistance: ${planetData[planet].distance}\nMoons: ${planetData[planet].moons}\nInfo: ${planetData[planet].info}`;

  info.style.display = 'block';
}

const loadTexture = new THREE.TextureLoader();

// ******  PLANET CREATION FUNCTION  ******
export function createPlanet(planetName, size, position, tilt, tiltOrbit, texture, bump, ring, atmosphere, moons) {

  let material;
  if (texture instanceof THREE.Material) {
    material = texture;
  }
  else if (bump) {
    material = new THREE.MeshPhongMaterial({
      map: loadTexture.load(texture),
      bumpMap: loadTexture.load(bump),
      bumpScale: 0.7
    });
  }
  else {
    material = new THREE.MeshPhongMaterial({
      map: loadTexture.load(texture)
    });
  }

  const name = planetName;
  const geometry = new THREE.SphereGeometry(size, 32, 20);
  const planet = new THREE.Mesh(geometry, material);
  const planet3d = new THREE.Object3D;
  const planetOrbit3d = new THREE.Object3D;
  const planetSystem = new THREE.Group();
  planetSystem.add(planet);
  let Atmosphere;
  let Ring;
  planet.position.x = position;
  planet3d.rotateZ(tiltOrbit * Math.PI / 180);
  //planet.rotation.z = tilt * Math.PI / 180;

  // add orbit path
  const orbitPath = new THREE.EllipseCurve(
    0, 0,            // ax, aY
    position, position, // xRadius, yRadius
    0, 2 * Math.PI,   // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
  );

  const pathPoints = orbitPath.getPoints(100);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.03 });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
  planetOrbit3d.rotation.z = tiltOrbit * Math.PI / 180;
  //planetSystem.add(orbit);
  planetOrbit3d.add(orbit);

  //add ring
  if (ring) {
    const RingGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 30);
    const RingMat = new THREE.MeshStandardMaterial({
      map: loadTexture.load(ring.texture),
      side: THREE.DoubleSide
    });
    Ring = new THREE.Mesh(RingGeo, RingMat);
    planetSystem.add(Ring);
    Ring.position.x = position;
    Ring.rotation.x = -0.5 * Math.PI;
    Ring.rotation.y = -tilt * Math.PI / 180;
  }

  //add atmosphere
  if (atmosphere) {
    const atmosphereGeom = new THREE.SphereGeometry(size + 0.1, 32, 20);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      map: loadTexture.load(atmosphere),
      transparent: true,
      opacity: 0.4,
      depthTest: true,
      depthWrite: false
    })
    Atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMaterial)

    Atmosphere.rotation.z = 0.41;
    planet.add(Atmosphere);
  }

  //add moons
  if (moons) {
    moons.forEach(moon => {
      let moonMaterial;

      if (moon.bump) {
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture),
          bumpMap: loadTexture.load(moon.bump),
          bumpScale: 0.5
        });
      } else {
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture)
        });
      }
      const moonGeometry = new THREE.SphereGeometry(moon.size, 32, 20);
      const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
      const moonOrbitDistance = size * 1.5;
      moonMesh.position.set(moonOrbitDistance, 0, 0);
      planetSystem.add(moonMesh);
      moon.mesh = moonMesh;
    });
  }

  // Labels
  const text = document.createElement( 'div' );
  text.className = 'annotation';
  text.textContent = 'MyLabel';

  text.addEventListener( 'pointerenter', event => console.log( event ) );

  const label = new CSS2DObject( text );

  planetSystem.add( label );

  //add planet system to planet3d object and to the scene
  planet3d.add(planetSystem);
  return { name, planet, planet3d, Atmosphere, moons, planetSystem, Ring, planetOrbit3d, orbitPath };
}
