# Generate the lightweight, continuous Aurevio studio building for the web.
# Coordinates passed to helpers are Three.js coordinates (Y is up).
import bpy, math, os, sys
from mathutils import Vector
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for data in bpy.data.materials: bpy.data.materials.remove(data)

def mat(name, color, metallic=0.0, roughness=.72, emission=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Roughness'].default_value=roughness; p.inputs['Metallic'].default_value=metallic
    if emission:
        p.inputs['Emission Color'].default_value=(*color,1); p.inputs['Emission Strength'].default_value=emission
    return m
wall=mat('Wall',(.37,.40,.36)); panel=mat('Panel',(.18,.21,.18)); floor=mat('Floor',(.30,.32,.28)); floor_light=mat('FloorAccent',(.46,.48,.41));
wood=mat('Wood',(.31,.22,.14)); black=mat('Charcoal',(.035,.045,.035)); metal=mat('Metal',(.27,.31,.26),.35,.48); lime=mat('Lime',(.54,.90,.03),.04,.5,.12)
glass=mat('Glazing',(.13,.18,.16),.2,.28); plant=mat('Foliage',(.10,.23,.11)); light=mat('Light',(.83,.87,.72),0,.45,.5)
groups=defaultdict(list); special=[]

def box(name,x,y,z,w,h,d,material, separate=False):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,-z,y)); obj=bpy.context.object; obj.name=name
    obj.scale=(w,d,h); bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); obj.data.materials.append(material)
    (special if separate else groups[material.name]).append(obj); return obj

def cylinder(name,x,y,z,r,h,material,vertices=10):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=h,location=(x,-z,y)); obj=bpy.context.object;obj.name=name;obj.data.materials.append(material);groups[material.name].append(obj);return obj

def text(name,value,x,y,z,size,material,side=False):
    curve=bpy.data.curves.new(name,'FONT');curve.body=value;curve.align_x='CENTER';curve.size=size;curve.resolution_u=2;curve.extrude=0
    obj=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(obj);obj.location=(x,-z,y)
    # Text is in the XY plane; face the entrance or the middle of the building.
    obj.rotation_euler=(math.pi/2,0,math.pi/2 if side else 0)
    bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.convert(target='MESH');obj=bpy.context.object;obj.data.materials.append(material);groups[material.name].append(obj);obj.select_set(False)

def planter(x,z):
    cylinder('planter',x,.40,z,.38,.8,black)
    for dx,dz,dy in [(-.18,0,.95),(.18,.08,1.1),(0,-.15,1.3),(0,.14,1.5)]:
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.39,location=(x+dx,-(z+dz),dy)); o=bpy.context.object;o.scale=(.72,.72,1.25);o.data.materials.append(plant);groups[plant.name].append(o)

def table(x,z):
    box('tabletop',x,1.05,z,3.9,.14,1.85,wood)
    for dx in [-1.6,1.6]:
      for dz in [-.62,.62]: box('table_leg',x+dx,.51,z+dz,.12,1,.12,metal)

def monitor(x,z):
    box('monitor base',x,1.17,z,.55,.05,.4,black);box('monitor stem',x,1.45,z,.09,.55,.09,metal);box('monitor frame',x,1.94,z,1.4,.9,.12,black)
    box('monitor glass',x,1.94,z+.07,1.24,.74,.02,glass)

def partition(z,label):
    box('partition left',-6.1,3,z,5.8,6,.26,wall);box('partition right',6.1,3,z,5.8,6,.26,wall)
    box('portal top',0,5.5,z,6.4,1,.26,wall)
    for x in [-3.2,3.2]: box('portal trim',x,2.6,z+.15,.11,5.2,.12,metal)
    box('portal light',0,5.0,z+.16,6.4,.07,.1,lime)
    text('section label',label,5.9,4.45,z+.16,.42,light)

# A real building shell with a street-facing entrance and connected rooms.
box('facade left',-6,3,8,6,6,.4,wall);box('facade right',6,3,8,6,6,.4,wall)
box('facade lintel',0,5.35,8,6,1.3,.4,wall);box('entrance frame left',-3,2.5,8,.18,5,.5,metal);box('entrance frame right',3,2.5,8,.18,5,.5,metal)
text('front name','A U R E V I O',0,5.17,8.23,.55,light)
box('threshold',0,.02,8,6,.05,.38,lime)
# Outside apron and an architectural canopy.
box('forecourt',0,-.16,13,18,.25,12,floor_light);box('canopy',0,6.03,9,12,.22,3.2,panel)
for x in [-8.7,8.7]: box('outer wall',x,3,-50,.35,6,116,wall)
for i,(start,end) in enumerate([(8,-7),(-7,-30),(-30,-49),(-49,-59),(-59,-75),(-75,-90),(-90,-108)]):
    mid=(start+end)/2; depth=abs(start-end)
    box('floor',0,-.15,mid,18,.3,depth,floor if i%2==0 else floor_light)
    # Interrupted ceilings create skylight strips rather than a closed tunnel.
    for x in [-6.2,6.2]: box('ceiling',x,6.2,mid,5.1,.22,depth,panel)
    for z in [start-2,end+2]:
      box('crossbeam',0,6.05,z,17.5,.25,.28,metal);box('overhead strip',0,5.9,z,5,.055,.14,light)
for z,label in [(-7,'GALLERY'),(-30,'WORKSHOP'),(-49,'THE POINT'),(-59,'PACKAGES'),(-75,'ABOUT'),(-90,'CONTACT')]: partition(z,label)
# Continuous slim inlay marks the route through rooms.
for x in [-2.7,2.7]: box('floor guide',x,.015,-49,.045,.03,112,metal)
# Foyer: reception and a piece of wall lettering.
box('reception',-5.1,.75,-1,4.4,1.5,1.7,panel);box('reception top',-5.1,1.56,-1,4.5,.12,1.8,wood)
text('reception brand','AUREVIO',-5.1,.7,-.12,.46,light);planter(6.6,3)
box('foyer wall plaque',7.5,3,-3.2,2.2,2.9,.12,black);text('foyer plaque','DESIGN / BUILD',7.5,3.0,-3.10,.19,light)
# Gallery: three full-scale framed exhibits mounted on the left wall.
for i,(z,title) in enumerate([(-12,'NOIRE'),(-19,'VELOR'),(-26,'ALEX MORGAN')]):
    box('gallery frame',-8.46,3,z,.36,3.5,5.55,metal)
    box('gallery display',-8.23,3,z,.12,3.15,5.05,black,True)
    box('gallery ledge',-7.65,1.04,z,1.6,.15,5.5,wood)
    box('gallery index',-7.95,.86,z,.12,.24,2.7,lime)
    text('gallery name',title,-8.08,1.35,z,.3,light,True)
for z in [-10,-23]: planter(6.8,z)
# Workshop tables, workstations and shelving.
table(4.6,-38);monitor(4.0,-38.1);monitor(5.5,-38.1)
for z in [-34,-39,-44]:
    box('shelf',7.7,2.3,z,1.2,.12,3.1,wood)
    for y in [1.0,3.3]: box('shelf upright',7.7,y,z,.1,2,.1,metal)
planter(-6.8,-43)
# Why area: an illuminated reading wall.
box('principles wall',8.43,3,-54,.18,3.8,8,black);box('principles stripe',8.30,4.6,-54,.08,.08,8,lime)
# Package plinths are off the route, so the camera can move past them.
for i,z in enumerate([-63,-67,-71]):
    box('package pedestal',5.7,.65,z,3.2,1.3,2.6,panel);box('package cap',5.7,1.34,z,3.2,.08,2.6,lime)
    box('package sign',6.5,2.65,z,.2,1.9,2.4,black)
# Lounge: bench, side table, shelves and planting.
box('bench seat',-5.3,.58,-81,3.8,.35,1.6,wood);box('bench back',-5.3,1.12,-81.7,3.8,1.1,.18,panel)
for x in [-6.8,-3.8]: box('bench leg',x,.28,-81,.15,.55,1.2,metal)
cylinder('coffee table',-2.6,.6,-82,1,.1,wood,20);cylinder('coffee stem',-2.6,.3,-82,.12,.6,metal)
planter(6.7,-80);planter(6.7,-88)
# Contact space: a large desk and end wall with a statement.
box('contact desk',0,1.05,-103,7,2.1,1.8,panel);box('contact top',0,2.15,-103,7,.12,1.9,wood)
box('end wall',0,3,-108,18,6,.35,wall);box('end sign',0,3.9,-107.75,11,1.7,.1,black)
text('end title','LET\'S BUILD',0,3.65,-107.66,.68,light)
for x in [-6.8,6.8]: planter(x,-104)
# Join meshes by material to reduce draw calls in Three.js.
for material_name, objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects: obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();bpy.context.object.name='Studio_'+material_name
# Only building meshes are exported. Blender-only lights and cameras are added below.
bpy.ops.object.select_all(action='SELECT')
out=os.path.join(ROOT,'assets','aurevio-studio.glb')
bpy.ops.export_scene.gltf(filepath=out,export_format='GLB',use_selection=True,export_apply=True,export_yup=True,export_materials='EXPORT')
print('STUDIO_GLB',out,os.path.getsize(out))

# Optional offline reference frames for checking the actual building geometry.
if '--render-frames' in sys.argv:
    bpy.ops.object.select_all(action='DESELECT')
    world=bpy.context.scene.world;world.color=(.32,.32,.32)
    bpy.context.scene.render.engine='CYCLES';bpy.context.scene.cycles.samples=12;bpy.context.scene.cycles.use_denoising=False;bpy.context.view_layer.cycles.use_denoising=False
    bpy.context.scene.render.resolution_x=960;bpy.context.scene.render.resolution_y=600;bpy.context.scene.render.resolution_percentage=100
    bpy.context.scene.view_settings.view_transform='AgX'
    for z in [3,-15,-37,-67,-83,-100]:
        bpy.ops.object.light_add(type='AREA',location=(0,-z,5.5));lamp=bpy.context.object;lamp.data.energy=1100;lamp.data.shape='DISK';lamp.data.size=8
    render_dir=os.environ.get('AUREVIO_RENDER_DIR',os.path.join(ROOT,'studio-renders'));os.makedirs(render_dir,exist_ok=True)
    def camera_render(name,pos,target):
        bpy.ops.object.camera_add(location=(pos[0],-pos[2],pos[1]));cam=bpy.context.object
        point=Vector((target[0],-target[2],target[1]));cam.rotation_euler=(point-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=30
        bpy.context.scene.camera=cam;bpy.context.scene.render.filepath=os.path.join(render_dir,name+'.png');bpy.ops.render.render(write_still=True)
    camera_render('studio-entrance',(0,2.4,17),(0,2.5,4))
    camera_render('studio-gallery',(-3,2.25,-19),(-8.3,2.8,-19))
    camera_render('studio-workshop',(0,2.2,-34),(4.5,2.0,-39))
