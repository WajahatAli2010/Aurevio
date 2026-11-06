// A low-poly architectural corridor. Rendering happens only when the view changes.
export function cameraPosition(scroll, distance) {
  return Math.min(1, Math.max(0, scroll / Math.max(1, distance))) * 112 + 1;
}

export function initGalleryScene() {
  const canvas = document.querySelector('#gallery-scene');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!canvas || reduced.matches || matchMedia('(max-width: 700px)').matches || navigator.connection?.saveData) return;
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' }); } catch { return; }
  if (!gl) return;
  const vertexSource = `attribute vec3 position; attribute vec3 color; varying vec3 vColor; uniform float camera; uniform float aspect; void main(){ float z = position.z - camera; gl_Position = vec4(position.x * 1.35 / aspect, position.y * 1.35, 1.00267 * z - 0.20027, z); vColor = color; }`;
  const fragmentSource = `precision mediump float; varying vec3 vColor; void main(){ gl_FragColor=vec4(vColor,1.0); }`;
  function shader(type, source) {
    const result = gl.createShader(type); gl.shaderSource(result, source); gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(result));
    return result;
  }
  try {
    const program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const points = [];
    const quad = (a,b,c,d,col) => { for (const p of [a,b,c,a,c,d]) points.push(...p,...col); };
    // Walls, floor and ceiling are segmented into rooms, with light catching their edges.
    for (let i=0; i<20; i++) {
      const z=i*7, end=z+7, tone=i%2 ? .045 : .06;
      quad([-8,-4,z],[8,-4,z],[8,-4,end],[-8,-4,end],[.09+tone,.10+tone,.085+tone]);
      quad([-8,5,z],[-8,-4,z],[-8,-4,end],[-8,5,end],[.045+tone,.052+tone,.044+tone]);
      quad([8,-4,z],[8,5,z],[8,5,end],[8,-4,end],[.065+tone,.075+tone,.06+tone]);
      quad([-8,5,z],[8,5,z],[8,5,end],[-8,5,end],[.035+tone,.04+tone,.035+tone]);
      // Doorways, integrated into the architecture rather than floating objects.
      const edge=[.36,.42,.25], dim=[.16,.19,.14];
      quad([-7.92,-4,z],[-7.76,-4,z],[-7.76,4.8,z],[-7.92,4.8,z],edge);
      quad([7.76,-4,z],[7.92,-4,z],[7.92,4.8,z],[7.76,4.8,z],edge);
      quad([-7.92,4.65,z],[7.92,4.65,z],[7.92,4.8,z],[-7.92,4.8,z],dim);
      quad([-7.92,-3.98,z],[7.92,-3.98,z],[7.92,-3.82,z],[-7.92,-3.82,z],dim);
    }
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position'), color=gl.getAttribLocation(program,'color');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,3,gl.FLOAT,false,24,0);
    gl.enableVertexAttribArray(color); gl.vertexAttribPointer(color,3,gl.FLOAT,false,24,12);
    const camera=gl.getUniformLocation(program,'camera'), aspect=gl.getUniformLocation(program,'aspect');
    gl.enable(gl.DEPTH_TEST); gl.clearColor(.045,.05,.04,1);
    let scheduled=false;
    function draw() {
      scheduled=false;
      if (reduced.matches || matchMedia('(max-width: 700px)').matches || gl.isContextLost()) {
        document.documentElement.classList.remove('gallery-ready');
        return;
      }
      if (document.hidden) return;
      const dpr=Math.min(devicePixelRatio || 1, 1.25);
      const width=Math.round(innerWidth*dpr), height=Math.round(innerHeight*dpr);
      if(canvas.width!==width || canvas.height!==height){ canvas.width=width; canvas.height=height; }
      const maxScroll=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      const travel=cameraPosition(scrollY, maxScroll);
      gl.viewport(0,0,width,height); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(camera,travel); gl.uniform1f(aspect,width/height); gl.drawArrays(gl.TRIANGLES,0,points.length/6);
      canvas.dataset.position=travel.toFixed(2); canvas.dataset.ready='true';
      document.documentElement.classList.add('gallery-ready');
    }
    function requestDraw(){ if(!scheduled && !document.hidden){ scheduled=true; requestAnimationFrame(draw); } }
    addEventListener('scroll',requestDraw,{passive:true}); addEventListener('resize',requestDraw,{passive:true});
    document.addEventListener('visibilitychange',requestDraw); reduced.addEventListener?.('change',requestDraw);
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); document.documentElement.classList.remove('gallery-ready'); });
    requestDraw();
  } catch (error) { console.warn('Gallery scene unavailable:',error); }
}
