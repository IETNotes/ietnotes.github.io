if (window.innerWidth < 768) {
  const canvas = document.getElementById("bg-canvas");
  if (canvas) canvas.style.display = "none";
}
(function () {
  const canvas = document.getElementById('bg-canvas');
  const W = () => window.innerWidth, H = () => window.innerHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H());
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 100);
  cam.position.z = 5;

  const N = 180;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  const sz  = new Float32Array(N);
  const spd = new Float32Array(N);
  const ph  = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random() - .5) * 22;
    pos[i*3+1] = (Math.random() - .5) * 14;
    pos[i*3+2] = (Math.random() - .5) * 5;
    sz[i]  = Math.random() * 3.5 + .5;
    spd[i] = Math.random() * .5 + .2;
    ph[i]  = Math.random() * Math.PI * 2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSize',    new THREE.BufferAttribute(sz,  1));
  geo.setAttribute('aSpd',     new THREE.BufferAttribute(spd, 1));
  geo.setAttribute('aPhase',   new THREE.BufferAttribute(ph,  1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uC1: { value: new THREE.Color('#93c5fd') },
      uC2: { value: new THREE.Color('#a5b4fc') },
      uC3: { value: new THREE.Color('#bfdbfe') },
    },
    vertexShader: `
      attribute float aSize; attribute float aSpd; attribute float aPhase;
      uniform float uTime; varying float vM; varying float vA;
      void main(){
        vM = fract(aSize*7.3+uTime*.035);
        float t = uTime*aSpd+aPhase;
        vec3 p = position;
        p.y += sin(t*.5+position.x*.4)*.3;
        p.x += cos(t*.4+position.z*.3)*.2;
        vA = 0.5+0.5*sin(t*.8);
        vec4 mv = modelViewMatrix*vec4(p,1.);
        gl_PointSize = aSize*(300./-mv.z)*(.6+.4*sin(t*1.2));
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader: `
      uniform vec3 uC1,uC2,uC3; varying float vM; varying float vA;
      void main(){
        float d=distance(gl_PointCoord,vec2(.5));
        if(d>.5)discard;
        float a=smoothstep(.5,.0,d)*.5*vA;
        vec3 c=vM<.5?mix(uC1,uC2,vM*2.):mix(uC2,uC3,(vM-.5)*2.);
        gl_FragColor=vec4(c,a);
      }`,
    transparent: true, depthWrite: false, blending: THREE.NormalBlending
  });
  scene.add(new THREE.Points(geo, mat));

  function orb(r, color, op, x, y, z) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r,32,32),
      new THREE.MeshBasicMaterial({color,transparent:true,opacity:op}));
    m.position.set(x,y,z); scene.add(m); return m;
  }
  const o1=orb(2.2,'#bfdbfe',.10,-3.5, 1.8,-1.5);
  const o2=orb(1.8,'#c7d2fe',.08, 3.5,-1.2,-1.5);
  const o3=orb(1.4,'#e0e7ff',.07, 0.5, 2.5,-2);
  const o4=orb(1.0,'#dbeafe',.06,-1,  -2.5,-1);

  const ring1 = new THREE.Mesh(new THREE.RingGeometry(2.8,2.82,80),
    new THREE.MeshBasicMaterial({color:'#93c5fd',transparent:true,opacity:.05,side:THREE.DoubleSide}));
  const ring2 = new THREE.Mesh(new THREE.RingGeometry(4.2,4.22,80),
    new THREE.MeshBasicMaterial({color:'#a5b4fc',transparent:true,opacity:.04,side:THREE.DoubleSide}));
  ring1.rotation.x = ring2.rotation.x = -.3;
  scene.add(ring1, ring2);

  let mx=0,my=0,cx=0,cy=0;
  window.addEventListener('mousemove', e => { mx=(e.clientX/W()-.5)*2; my=(e.clientY/H()-.5)*2; });
  window.addEventListener('resize', () => { renderer.setSize(W(),H()); cam.aspect=W()/H(); cam.updateProjectionMatrix(); });

  const clk = new THREE.Clock();
  (function loop(){
    requestAnimationFrame(loop);
    const t = clk.getElapsedTime();
    mat.uniforms.uTime.value = t;
    o1.position.x=-3.5+Math.sin(t*.18)*.8; o1.position.y=1.8+Math.cos(t*.22)*.5;
    o1.material.opacity=.08+.04*Math.sin(t*.5);
    o2.position.x=3.5+Math.cos(t*.15)*.8;  o2.position.y=-1.2+Math.sin(t*.20)*.5;
    o2.material.opacity=.06+.04*Math.cos(t*.4);
    o3.position.y=2.5+Math.sin(t*.12)*.4;
    o4.position.x=-1+Math.cos(t*.25)*.3;
    const s=1+.04*Math.sin(t*.6);
    ring1.scale.set(s,s,1); ring2.scale.set(1/s,1/s,1);
    ring1.rotation.z=t*.04; ring2.rotation.z=-t*.03;
    cx+=(mx*.25-cx)*.04; cy+=(-my*.18-cy)*.04;
    cam.position.x=cx; cam.position.y=cy;
    cam.lookAt(scene.position);
    renderer.render(scene, cam);
  })();
})();

const prog = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const s = document.documentElement;
  prog.style.width = (s.scrollTop / (s.scrollHeight - s.clientHeight) * 100) + '%';
});

/* ╔═══════════════════════════════════╗
   ║   CONFIG — only edit this part  ║
   ╚═══════════════════════════════════╝ */
const CONFIG = {
  GOOGLE_API_KEY: "AIzaSyAbxeu4gCUNL939f8_rpQPJjJ4lmGzbTj8",

  DEPTS_2024: [
    {
      name: "Computer Science & Engineering", short: "CSE",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
      iconBg: "#dbeafe", color: "#2563eb",
      folders: {
        syllabus: "1BgJKMrxAc-dn6outTzcQAw442LxRIE_Z",
        notes: {
          "Sem 1": "1sRELqRlAtkFtOLfb_5l0BSclbxsweyLS",
          "Sem 2": "1HtHm9NauRujhBllg8BSHVmuwIb_tyYNN",
          "Sem 3": "10NnWReh908h8_4NmmqhA-0bv_GC1ktYq",
          "Sem 4": "1dgmRrhDpyoNuJlqUMM3JHtp8NR_sOuV-",
          "Sem 5": "1e_Pn0Og8bzWE52mya57RVbBUjNykEfsQ",
          "Sem 6": "1xmPfSYrIy0gCTfdM-v529u0b2Kdq0nrV",
          "Sem 7": "1QCuQJdJHYgXhFLlKQo-v8scB4Ncy5E7L",
          "Sem 8": "13-jG2Q6Dg42CV8CG7ISQFUe_B6bavINu",
        },
        qp: {
          "Sem 1": "1BOaBv7_TQ3HQFoJ0mCgpDys3wOJf-U3-",
          "Sem 2": "1SvHcyT6P2JACtBKE_7f-3kvGT39vKPQ2",
          "Sem 3": "1f5N9I1YYXfz0zT_MLXVFGxXFp5inlJUW",
          "Sem 4": "1WbplenNYr21iu5LeVAHLpokkObGWwKXN",
          "Sem 5": "1mBbOHTvGrz66RVoINXpufL8aelmi7yZW",
          "Sem 6": "1fLPZxe6FgaxPjTNo9pQN2dMWQjfdIyor",
          "Sem 7": "1OUC2niZZuXynPjwSU9mlhplTJcpFkgEL",
          "Sem 8": "1DZqeiGSr3uBtlEWyQYwM4LMNyzGoBK8A",
        }
      }
    },
    {
      name: "Mechanical Engineering", short: "MECH",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
      iconBg: "#dcfce7", color: "#16a34a",
      folders: {
        syllabus: "1y3a9YnRWpAUJ6qP6fx2CJ5ZPfMieKmxC",
        notes: {
          "Sem 1": "13kwQidPkpxh8LNHPrw2Q9B1gXIrmV-2C",
          "Sem 2": "18Y9CV8hNpl8Zd8p9Gsgn3ZAv3Yx6f1KZ",
          "Sem 3": "1C2a-T2aXJTJPLMtufJRxP3qeCYZIaPyn",
          "Sem 4": "1biWFKlXIg-hGJf4bO6zhrEs-Uh8ueLH7",
          "Sem 5": "1yQJ4kDgEpZL7C7GkXaRdnbLPLwruT7zE",
          "Sem 6": "1NFfryTclt5gQnhb-P04fsWh_BOirm7f6",
          "Sem 7": "1YZcQn3ZvpQsR-Qy5M9LtCuCzyrX-_UBK",
          "Sem 8": "1AeRaaI9WytLosSSfFrC6YIyrxQqsVH6E",
        },
        qp: {
          "Sem 1": "1lzbVepwaaIjPehgE1xcUFeG8srrdsUjR",
          "Sem 2": "1vIOPQEH_46KxgwhGJtW_r-KBUgzASHn9",
          "Sem 3": "1Qz_ZWdBMNcDcWdqPh2s9ATo9UQmveRZW",
          "Sem 4": "1tzTJR4uYEUxkKS8hy5atHkoQjBSYvU11",
          "Sem 5": "12VfSU72wkBvQ7_0ZHuQ5aJ5jAFIj3YS-",
          "Sem 6": "1bApNyvYAMNrsxDcMX7Pal8mMUPBe3Amj",
          "Sem 7": "15xVlqOM8enJ6MJ3sNpKVwliCiauu10H_",
          "Sem 8": "1ap9AEIE6KL4qndKs6P7gMiprevegmzVo",
        }
      }
    },
    {
      name: "Electronics & Communication", short: "EC",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
      iconBg: "#fee2e2", color: "#dc2626",
      folders: {
        syllabus: "1IQAg7p2B2EQrCWWhQwKEtKu146xAAIdw",
        notes: {
          "Sem 1": "1s73e6ro8uBZf-O0q9sKN82VH9jdV-z9M",
          "Sem 2": "1W7OuXO8-PAPYaxJrq9MwhrqSDfuXxBPq",
          "Sem 3": "11L80nbdo1pv5pEPisLkgpU3_87chrcoN",
          "Sem 4": "1vJoIABWUn-WESxl5AwhNbinfyNx2d4ou",
          "Sem 5": "1DUhqHtc-mxkCJjCrBhjji6BCwJSrl6c7",
          "Sem 6": "1Ez70Cqme1RnYbHjn2lL_0wZZIjhYLbae",
          "Sem 7": "1ZXiUkzj2g7wqINLBA41XP7_rW9F6BC6e",
          "Sem 8": "1X204rrfAHiSWMQT2zBgoCJGOy88XxE5J",
        },
        qp: {
          "Sem 1": "141eU6fcYThUFZ-6h3F3CUdGOilLUJMnm",
          "Sem 2": "1-nxPAZC95Pi-ytTYCKxs-278J5ReaEHz",
          "Sem 3": "1LKL-DBD6c_8kWBaFJYK5qA74aH45Wora",
          "Sem 4": "1AQnuf9hxKKiVmcy85LzzGvq31G44qw0I",
          "Sem 5": "1GUt8JtyxlFtakp9IOF1uFv_dX4Ffaieu",
          "Sem 6": "1ShcRuAhW3q6WNolSohr0NHDlX7NhqXpB",
          "Sem 7": "1MqUKsl5v8CiQ0Zx4PL7pA0ivz5Ho8YMN",
          "Sem 8": "13ccL67HrAn_JFo3V7odzGPRIcD-px-3V",
        }
      }
    },
    {
      name: "Electrical & Electronics Engineering", short: "EEE",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      iconBg: "#fef9c3", color: "#ca8a04",
      folders: {
        syllabus: "1Nai3c8DESmbSdA2cKXn2UFzgS-Hf8FKn",
        notes: {
          "Sem 1": "1eCfNABFtjS9kIL4iBjkO38S654lN-Nus",
          "Sem 2": "1fbwRPOSCuyQBopG_jtWPKfp6szbg6Raf",
          "Sem 3": "16eVcN4Vdovt5NAcfNo0phlh6ySnOS0uf",
          "Sem 4": "1W4eJSe557w4w9fZCuEnkw2TL2M_KtLNs",
          "Sem 5": "1PKg_nGhh-xdX_VsKEi91m1kzcMkrFnot",
          "Sem 6": "1wq1aW-IAFofc0yr2nMBvurcpYa7nHUKK",
          "Sem 7": "15uxIijK0en4fY2fhHc3Ki_qPw77clEld",
          "Sem 8": "1Jrihs9FxJrBvtbom93S-3KnETCnYy_Mv",
        },
        qp: {
          "Sem 1": "1XFmLFPBTJJgpF0dJJX1Gb_2zlvJZSacI",
          "Sem 2": "1gQwljwa6RBFGK5AeY-f0F1RR9DfuvouX",
          "Sem 3": "106PzO5x-flNiiOUrYUveiQvNc_PZGFBI",
          "Sem 4": "1NjBUaYNCD1XCUv8SaT6gIaUsIudimu2_",
          "Sem 5": "1OXHAxxBrQHpKlaueFQH-KgFjTB4zWLWR",
          "Sem 6": "1e1cj7668vX1TfANCRq5-OCrR3wZ33vst",
          "Sem 7": "1-zmMgSo1KBusVhRcuLh2HBYREYNeVeNo",
          "Sem 8": "1qI_PHXZa4dTbu0PCWssOxAk7qd-KTY8n",
        }
      }
    },
    {
      name: "Printing Technology", short: "PT",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
      iconBg: "#f3e8ff", color: "#9333ea",
      folders: {
        syllabus: "1d3qw6bsVwEDXUgFpP5BcGmwCTLNSAkJV",
        notes: {
          "Sem 1": "15x6AEeForb_KLQrkUg8ofbvLZcSTGY2J",
          "Sem 2": "1dMX96ykLdVaRI_YWOa7e1fhdT0nfq6zT",
          "Sem 3": "1-VWfn7lbD1kohVyhi2mV7WyDUNszoA9E",
          "Sem 4": "1fucXZoXbuDTPReOEPLVPSRK2-WLzgMv_",
          "Sem 5": "14rP1wF9B2IWpKQsroYRP69FxbQ4kpAO5",
          "Sem 6": "1Up4goyjt_a5gW_K9DDhz51SrH1m1f0GO",
          "Sem 7": "19B6mgS4WVSRdq7yHckgGBMmxx7qn4CQW",
          "Sem 8": "1YDcdp2qVBz-Z-5L-g7-sx-xAZf8xxdZz",
        },
        qp: {
          "Sem 1": "1Zqr4G_pqXfQUf9k59PlaQd7ZiPjCmn6C",
          "Sem 2": "1IgqrUfC4fVK6nCLKb4IsvsXSdnSH48mH",
          "Sem 3": "1Bk3N-JPfd4LqokjXIlGeaoOFlVEFXqGq",
          "Sem 4": "1C2mCxIqA8wvanBmk5EvYUbvWLLFWLizz",
          "Sem 5": "1Fr7NGNdBCo9Z5H5a1r1zjeMfcHa-ZyGg",
          "Sem 6": "1qlblRSqXPDWYs265chba_lKSSvaPWHSa",
          "Sem 7": "1Nv417d9HwR8zpTC4uIueEOAKkgOJZy6v",
          "Sem 8": "1Hsk62nFs_owltntm6kHWKXbZomAuA3qw",
        }
      }
    },
    {
      name: "Electronics & Computer Science", short: "ECS",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
      iconBg: "#e0f2fe", color: "#0284c7",
      folders: {
        syllabus: "11sslcqHDpYGmuH_UYJtTtc5evNg7nARJ",
        notes: {
          "Sem 1": "1ufXxTw_xqAb94RTDaJjO8dubkbyNHSVz",
          "Sem 2": "1zUA2ZWh7KikJd-h6ibgjKNX2y6xkTpC9",
          "Sem 3": "1uMmNTEAPe-qJc7kVHNBJ5KhKp6X2nIbX",
          "Sem 4": "1JsaraDA3bllN1EKku_Mh6vj55OxHvzST",
          "Sem 5": "1cnsmcH__eotzm8oCXPhUAODA67Qf_NQx",
          "Sem 6": "1jRF-Ow-no8GrP1NKhX0j2ZOlvZ6_JNr9",
          "Sem 7": "1p_NdQaorzoBrxj4XMIStQQJcKNkXuJLs",
          "Sem 8": "14nNApTzvnro7aKx4H2UdOwHdrezxnul6",
        },
        qp: {
          "Sem 1": "16tlbAYTX7nxRohqU7bhAUzWdAkBlM6Nk",
          "Sem 2": "1EcQf3ck5TYPiaiVBIaknuCGJfwCK4l_z",
          "Sem 3": "1-Nuo__50DzOxvi3OX28bMlpchUmjHNNp",
          "Sem 4": "1OH9p2cUED0PRtizndQjO7vmNxHUJF4dQ",
          "Sem 5": "1VZ5tnGeL-3VKXdOvatUDWDxMRTZfaTrH",
          "Sem 6": "1F3mJsT51O9ymt9p12goojtz2VqRGxHDi",
          "Sem 7": "1yXkrV5MwO-H9llGGQU8T8001DWANBU9R",
          "Sem 8": "1dYiOtV7US_htv3Sm5cCijcrRgRNRUCGl",
        }
      }
    }
  ],

  DEPTS_2015: [
    {
      name: "Information Technology", short: "IT",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
      iconBg: "#e0f2fe", color: "#0284c7",
      folders: {
        syllabus: "1t1FY_YYeMYlOqwt0-xF7TrMWbpP-jhJd",
        notes: {
          "Sem 1": "179R7k67QhDUcGnwrUKkreskMiTx6-nVT",
          "Sem 2": "1W8WaA0FMwfkHs9PNEcr4RjCcCzcDBky4",
          "Sem 3": "1YG9AjNfydo7dAdrPQAJH51cQy39Yk2Pp",
          "Sem 4": "1oHuo6fQc-fnXnGSu6dEetpKmTqE9__R-",
          "Sem 5": "1WRS0EN49rZoRi0VsKomgwVAmV7Iv1ir1",
          "Sem 6": "1hJBRqGGmGN41vlGtSHuJL6y0OYbDTjjO",
          "Sem 7": "1JiIFux7KfpNqJlyFuYBzIOXSFP3-F8UD",
          "Sem 8": "1E297wq4SJoX8fcDyxu_aXVv24gRAYpSk",
        },
        qp: {
          "Sem 1": "1lkhIuQe3_yd-BCMGUydvNwz99tHuH7y1",
          "Sem 2": "1NQE05te1q4Vw-b_yW0806xPjOa0NQlVx",
          "Sem 3": "1Qp0gRwa6J-SXyJy7u3FSn7eZZk-gd_VH",
          "Sem 4": "1lNA0Xo7yqJjFY2sJ-U2y15gryZ7kSA1J",
          "Sem 5": "1Y5OXvgC5UU9MnXy_7wuWAFpWEXYsSf1Z",
          "Sem 6": "1tX9eLAohbrOPbywdUg48a5CfKMhHTc6e",
          "Sem 7": "12VGkfOuj2Q3PzZvtS0_Wn8TppehyQP9s",
          "Sem 8": "1pkwbqKNxPem9dr1pKrWo0L4jzMAekqeH",
        }
      }
    },
    {
      name: "Electrical & Electronics Engineering", short: "EEE",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      iconBg: "#fef9c3", color: "#ca8a04",
      folders: {
        syllabus: "1YPT1YrE3GecyCDAePi-fYfLPoWQHHre4",
        notes: {
          "Sem 1": "1Q9aQBHqxKtZq-qspZI2mOSuA4BII_fm3",
          "Sem 2": "1HSAWtgbFQfu7TN5CHM3lrkNSM1pOpg7Q",
          "Sem 3": "1sop3_1kcAy-fYKEDrrN_XxXQOImdXvF2",
          "Sem 4": "1TtIVtVLdhEKdwmsOVkwBt1jiPbdzAa-y",
          "Sem 5": "1H12NjY9d7aQFjmiNxpHNImkDNRc72zKb",
          "Sem 6": "19yBojWqki11NGk5GaeoA163lyVnxG-5u",
          "Sem 7": "1JdblUa2P2GxzBsYJU1k6WdtJ43JPzsoD",
          "Sem 8": "1wGERmfxCTYyow6v6Yfu_LPEHXO0Pt9y0",
        },
        qp: {
          "Sem 1": "1RhriuRz2rwFwNgeoQS4c1OuwhIl2jGAd",
          "Sem 2": "18cMzmMT7c-BvcwGQV3PrE5TljAMtScl5",
          "Sem 3": "1LhrDQxgBseSd4HgdUnA_M-Rr8adV_uet",
          "Sem 4": "1oZL7i4-GW_AqfIv1MvW6vrMJqAyizuzb",
          "Sem 5": "14k8qPp0gxHY149zeXS9SaNL6T6XCm73y",
          "Sem 6": "1jMMOBVR0CW518GrDI5--1-4FmePXDXQJ",
          "Sem 7": "1pGw_vNSbaDq6t02OsdJjZuFCc4OeMYwr",
          "Sem 8": "1OsnJmxVFROeEnX2yn6PrdOYc9vkyDOEW",
        }
      }
    },
    {
      name: "Electronics & Communication", short: "EC",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
      iconBg: "#fee2e2", color: "#dc2626",
      folders: {
        syllabus: "1pTX8LEGJsHKpL-QE9wBtxzNN_MnWM6Xm",
        notes: {
          "Sem 1": "1iW0V2rEzgg_qcY3V0UZbVVIYur2gnd1z",
          "Sem 2": "1dgHTWrEbpZG0KxO9GZxtPerf5euhZ1W-",
          "Sem 3": "1sdxxcr_b_D4cDRPG_mUnOyDcsTgJmUUc",
          "Sem 4": "1n45oHSvBYDjBnKKln3v4wJPQIBrrjUPy",
          "Sem 5": "1wRdL0hbBwBp0Rzwosqkr3u-A7hDnqqN8",
          "Sem 6": "1q3tIh49SQJ9H1sWQzdm4k3Ch8xnhaNrI",
          "Sem 7": "1vQ5eL4kdiDfuPq5nM-Tvk3qwoyWVc8Eq",
          "Sem 8": "1vJE14OdOj10N1ldInlTVPZTsS8ewIeGE",
        },
        qp: {
          "Sem 1": "10TptTPHEAwpwo6TrCkFcacPtlzOf4JFY",
          "Sem 2": "1x7w927JbnYt7SwZWeXsK7w69MVqauoJw",
          "Sem 3": "1Vai8lyOMteHvmCVQghsbfy1PgAzbJhtc",
          "Sem 4": "1bn9P0p2tA808neX_8vHBl-1DCUmqwTlS",
          "Sem 5": "1tJ-Zsq4qsfwUoQQgySS-N_g3qpHn0opn",
          "Sem 6": "1qLDr7RXw6twe-Xnvlk-tbEWtqMc-4H-z",
          "Sem 7": "1LnrsMPlXmJCWD3Pd5AJ7zPzrwHgwXiL0",
          "Sem 8": "17cTxZUQiZ73HmJfTQgzGCeX4skEerxuG",
        }
      }
    },
    {
      name: "Printing Technology", short: "PT",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
      iconBg: "#f3e8ff", color: "#9333ea",
      folders: {
        syllabus: "1Tjs1P2eMmWT6864NI3j2gA63s_dsFgeX",
        notes: {
          "Sem 1": "1ARpajN1wM4Wna6LAgZnWCv4Y-C66RUrE",
          "Sem 2": "1O5lPwSOrpIay3qHUqHEtSMzsx4duOxf2",
          "Sem 3": "1wDWTBqbhhuL3bbw-ELphkMyWEvjMSbDO",
          "Sem 4": "1WTs0zXCiddabSjhuh9RAFdZEXemq04i2",
          "Sem 5": "1ir3sezGj_peIEiIq26dCO9x5N-siwZsl",
          "Sem 6": "1nH6u2V3WM-tEym3QxYDEIHYkU3Yuv78E",
          "Sem 7": "1oA628COUXMl1_-3Va-br3S1CPICVoA9Q",
          "Sem 8": "1JuTjWFqRGCbRrVPCntfXAzUG1mEqzcCS",
        },
        qp: {
          "Sem 1": "1lxM4LMfGpweHOi3IQIRQZR_lJjuUVk4H",
          "Sem 2": "1mO9rGNh5OxzI8lV34_OyH_TbMcwLWCCP",
          "Sem 3": "1faMbVVMx3z5csYgZjN9Lk8nj125gwYJQ",
          "Sem 4": "1VPmfJlGm5ZIbOJRPBWWoBEH-uguggaae",
          "Sem 5": "17Jfvt0AQjxn6nrLYjRgALm30Wwuv3Q0j",
          "Sem 6": "1UL4sfobsMVi57uH180erfIJJvBKrIOJ7",
          "Sem 7": "1gtZc86cu0oYAELTIKgbraHtM-PCR57Mt",
          "Sem 8": "1V18s7aMwvQ5DaQJCai16nC5jq9gZlrUu",
        }
      }
    },
    {
      name: "Mechanical Engineering", short: "MECH",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
      iconBg: "#dcfce7", color: "#16a34a",
      folders: {
        syllabus: "11wuYDnHuvIEqWjf5WA_7EYMmt0YBSmYG",
        notes: {
          "Sem 1": "1bs1Izj-Knka7ymBV8BTr9v5abk2N9RfK",
          "Sem 2": "1dQuEDOO5C63Gi93rZh9g6qkONKu6FaV1",
          "Sem 3": "1bBQ2aZ2ExLwoY9zoIRXRcXceYPWRKRNJ",
          "Sem 4": "17pjR-c9IRK-ixCftJIgAd9n_QXG9c34R",
          "Sem 5": "1vDVcFLFehZieIzK412XxSBrJuIjoFcUu",
          "Sem 6": "1YoZxnlk_BY1cgdj-t_O349ilTNbXTEYw",
          "Sem 7": "1isJrmiPjKnMSomE8Kodofz7ABMAQ6CIQ",
          "Sem 8": "11IGsWpsBThG6IR_2ejmfyWAN9aXVP5_9",
        },
        qp: {
          "Sem 1": "1ecj7cFw43VJ3MKf_hbHqjwq70aBBjqts",
          "Sem 2": "1Cm6Aidq-XEvGv_bHInNqixG3A0NFdnjL",
          "Sem 3": "1ETsfKEGAtqXwiPiP53wd3LYdkj3OkNzB",
          "Sem 4": "1hFHxVo2EVldj25_ogXcFtwAOU2UGz9QI",
          "Sem 5": "1vVM0OgNf3i1fy6sBPZyK1tFbSfyFaPcu",
          "Sem 6": "1TRGGwnYv0xGQAyaHEoJXFLtLtVOmhoMf",
          "Sem 7": "1HiYo-f8MpFQtM6jSDh5dSTEifb0HuhX7",
          "Sem 8": "1NJpvmn9C4nUpWCZNgW-dyClfzX_zymJ_",
        }
      }
    }
  ]
};

/* ── STATE ── */
let activeScheme = '2024';
let activeDept   = 'All';
let searchQ      = '';
let driveCache   = {};
let deptState    = {};

function initDeptState(depts) {
  depts.forEach(d => {
    if (!deptState[d.short]) deptState[d.short] = { sem: 'Sem 1', type: 'notes' };
  });
}

const configured = () => CONFIG.GOOGLE_API_KEY && CONFIG.GOOGLE_API_KEY !== 'YOUR_API_KEY_HERE';

async function fetchFolder(id) {
  if (!id || id.startsWith('FOLDER_')) return null;
  if (driveCache[id]) return driveCache[id];
  const url = `https://www.googleapis.com/drive/v3/files?q='${id}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,size,webViewLink,webContentLink)&orderBy=name&key=${CONFIG.GOOGLE_API_KEY}`;
  try {
    const r = await fetch(url);
    const d = await r.json();
    if (d.error) { console.warn('Drive API error:', d.error.message); return []; }
    const files = (d.files||[]).map(f => ({
      name: f.name.replace(/\.(pdf|docx?|pptx?)$/i,''),
      type: f.mimeType.includes('pdf') ? 'pdf' : f.mimeType.includes('presentation') ? 'ppt' : 'doc',
      size: f.size ? (f.size/1048576).toFixed(1)+' MB' : '—',
      link: f.webContentLink || f.webViewLink || '#'
    }));
    driveCache[id] = files;
    return files;
  } catch(e) {
    console.warn('fetchFolder failed:', e);
    return [];
  }
}

/* ── SVGs ── */
const SVG_FILE  = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
const SVG_DOC   = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`;
const SVG_CHART = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`;
const SVG_DL    = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const SVG_NOTE  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
const SVG_QP    = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const SVG_SYL   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;

function noteCard(note) {
  const ico       = note.type==='pdf' ? SVG_FILE : note.type==='ppt' ? SVG_CHART : SVG_DOC;
  const iconBg    = note.type==='pdf' ? '#fee2e2' : note.type==='ppt' ? '#fef3c7' : '#dcfce7';
  const iconColor = note.type==='pdf' ? '#dc2626' : note.type==='ppt' ? '#d97706' : '#16a34a';
  return `<a class="note-card" href="${note.link||'#'}" target="_blank">
    <div class="n-icon" style="background:${iconBg};color:${iconColor}">${ico}</div>
    <div class="n-body">
      <div class="n-title">${note.name}</div>
      <div class="n-meta"><span class="tag tag-${note.type}">${note.type.toUpperCase()}</span>${note.size}</div>
    </div>
    <div class="dl-btn">${SVG_DL}</div>
  </a>`;
}

/* ── CHIPS ── */
function getCurrentDepts() {
  return activeScheme === '2024' ? CONFIG.DEPTS_2024 : CONFIG.DEPTS_2015;
}
function renderChips() {
  const depts = getCurrentDepts();
  const el = document.getElementById('deptChips');
  const items = [{l:'All Departments',v:'All'}, ...depts.map(d => ({l:d.name,v:d.short}))];
  el.innerHTML = items.map(c =>
    `<button class="chip${activeDept===c.v?' active':''}" onclick="setDept('${c.v}')">${c.l}</button>`
  ).join('');
}
function setDept(v) { activeDept = v; renderChips(); renderSections(); }

/* ── SCHEME SWITCH ── */
function setScheme(s) {
  activeScheme = s;
  activeDept = 'All';
  Object.keys(deptState).forEach(k => { deptState[k] = { sem: 'Sem 1', type: deptState[k]?.type || 'notes' }; });
  document.getElementById('btn2024').classList.toggle('active', s==='2024');
  document.getElementById('btn2015').classList.toggle('active', s==='2015');
  document.getElementById('schemeNote').textContent = s==='2024'
    ? '6 Departments — 2024 batch'
    : '5 Departments — 2015 batch';
  initDeptState(getCurrentDepts());
  renderChips(); renderSections();
}

/* ── MAIN RENDER ── */
function renderSections() {
  const depts = activeDept === 'All'
    ? getCurrentDepts()
    : getCurrentDepts().filter(d => d.short === activeDept);

  // update stats
  document.getElementById('sD').textContent = getCurrentDepts().length;
  let tf = 0;
  getCurrentDepts().forEach(d => {
    ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6','Sem 7','Sem 8'].forEach(s => {
      const fid = d.folders.notes?.[s];
      tf += (fid && driveCache[fid] ? driveCache[fid].length : 0);
    });
  });
  document.getElementById('sF').textContent = tf;

  const SEMS_LIST = ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6','Sem 7','Sem 8'];
  const el = document.getElementById('sections');

  el.innerHTML = depts.map(dept => {
    const ds   = deptState[dept.short] || { sem: SEMS_LIST[0], type:'notes' };
    const sem  = ds.sem;
    const type = ds.type;

    let files = [];
    if (type === 'syllabus') {
      files = driveCache[dept.folders.syllabus] || [];
    } else if (type === 'qp') {
      files = driveCache[dept.folders.qp?.[sem]] || [];
    } else {
      files = driveCache[dept.folders.notes?.[sem]] || [];
    }

    if (searchQ) {
      const q = searchQ.toLowerCase();
      files = files.filter(f => f.name.toLowerCase().includes(q));
    }

    const semTabsHtml = type !== 'syllabus' ? `<div class="sem-tabs">
      ${SEMS_LIST.map(s => `<button class="sem-tab${s===sem?' active':''}" onclick="setSemFor('${dept.short}','${s}')">${s}</button>`).join('')}
    </div>` : '';

    const ctabs = `<div class="content-tabs">
      <button class="ctab${type==='notes'?' active-notes':''}" onclick="setTypeFor('${dept.short}','notes')">${SVG_NOTE} Notes</button>
      <button class="ctab${type==='qp'?' active-qp':''}" onclick="setTypeFor('${dept.short}','qp')">${SVG_QP} Question Papers</button>
      <button class="ctab${type==='syllabus'?' active-syl':''}" onclick="setTypeFor('${dept.short}','syllabus')">${SVG_SYL} Syllabus</button>
    </div>`;

    const cards = files.length
      ? files.map(f => noteCard(f)).join('')
      : `<div class="empty">
           <div class="ei"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg></div>
           <h4>No files yet</h4>
           <p>Files will appear here once uploaded to Google Drive.</p>
         </div>`;

    return `<div class="dept-block">
      <div class="dept-head">
        <div class="d-icon" style="background:${dept.iconBg};color:${dept.color}">${dept.icon}</div>
        <div class="d-name">${dept.name}</div>
        <div class="d-count">${files.length} file${files.length!==1?'s':''}</div>
      </div>
      ${ctabs}
      ${semTabsHtml}
      <div class="notes-grid">${cards}</div>
    </div>`;
  }).join('');

  // ── Throttled background Drive fetch (300ms gap between requests) ──
  if (configured()) {
    depts.forEach((dept, i) => {
      setTimeout(() => {
        const ds = deptState[dept.short] || { sem:'Sem 1', type:'notes' };
        const fid = ds.type==='syllabus' ? dept.folders.syllabus
          : ds.type==='qp' ? dept.folders.qp?.[ds.sem]
          : dept.folders.notes?.[ds.sem];
        if (fid && !driveCache[fid]) {
          fetchFolder(fid).then(f => { if (f && f.length) renderSections(); }).catch(()=>{});
        }
      }, i * 300);
    });
  }
}

function setSemFor(short, sem) { deptState[short] = {...(deptState[short]||{}), sem}; renderSections(); }
function setTypeFor(short, type) { deptState[short] = {...(deptState[short]||{}), type}; renderSections(); }

document.getElementById('searchInput').addEventListener('input', e => {
  searchQ = e.target.value.trim(); renderSections();
});

// init
initDeptState(CONFIG.DEPTS_2024);
initDeptState(CONFIG.DEPTS_2015);
renderChips();
renderSections();