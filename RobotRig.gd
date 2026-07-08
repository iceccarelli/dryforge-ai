extends Node3D
## Procedural DryForge "Finisher" rig.
## Every inspectable sub-assembly is a Node3D whose metadata carries an
## "explode_dir" (Vector3) and "explode_mag" (float). ExplodedView reads these.
## Rotors are tagged with meta "rpm" and spun by Rotor.gd.
##
## Swap any _prim(...) block for an imported MeshInstance3D when you have
## modeled geometry — keep the node names and metadata so controllers still work.

const Rotor := preload("res://scripts/Rotor.gd")

var _running := true

func _ready() -> void:
	_build()

func set_running(on: bool) -> void:
	_running = on
	for r in _rotors():
		r.running = on

func _rotors() -> Array:
	var out := []
	for n in find_children("*", "Node3D", true, false):
		if n.get_script() == Rotor:
			out.append(n)
	return out

# --- assembly -------------------------------------------------------------

func _build() -> void:
	var chassis := _assembly("Chassis", Vector3.ZERO, 0.0)
	chassis.add_child(_box(Vector3(0.9, 0.22, 0.66), Vector3(0, 0.22, 0), Color(0.79, 0.82, 0.87)))
	for x in [-0.5, 0.5]:
		chassis.add_child(_box(Vector3(0.09, 0.18, 0.72), Vector3(x, 0.12, 0), Color(0.07, 0.09, 0.11)))
	add_child(chassis)

	var power := _assembly("PowerCompute", Vector3.DOWN, 0.7)
	power.position = Vector3(0, 0.24, 0)
	power.add_child(_box(Vector3(0.5, 0.14, 0.3), Vector3(0, 0, 0.12), Color(0.12, 0.44, 0.92)))   # battery
	power.add_child(_box(Vector3(0.34, 0.12, 0.22), Vector3(0, 0, -0.16), Color(0.16, 0.2, 0.27))) # compute
	var fan := Rotor.new()
	fan.name = "CoolingFan"
	fan.rpm = 3600.0
	fan.axis = Vector3.FORWARD
	fan.position = Vector3(0.3, 0, -0.16)
	fan.add_child(_disc(0.06, 0.01, Color(0.6, 0.66, 0.72)))
	power.add_child(fan)
	add_child(power)

	var column := _assembly("LiftColumn", Vector3.UP, 0.5)
	column.position = Vector3(0, 0.7, -0.1)
	column.add_child(_box(Vector3(0.16, 0.9, 0.16), Vector3.ZERO, Color(0.79, 0.82, 0.87)))
	column.add_child(_cyl(0.022, 0.86, Vector3.ZERO, Color(0.66, 0.7, 0.75)))  # ball screw
	add_child(column)

	var shoulder := _servo_joint("Shoulder", Vector3(0, 1.15, -0.1), Vector3.UP, 0.35)
	add_child(shoulder)

	var elbow := _servo_joint("Elbow", Vector3(0, 1.15, 0.08), Vector3.BACK, 0.45)
	add_child(elbow)

	var ee := _assembly("EndEffector", Vector3.BACK, 1.0)
	ee.position = Vector3(0, 1.15, 0.42)
	ee.add_child(_box(Vector3(0.26, 0.2, 0.16), Vector3.ZERO, Color(0.96, 0.62, 0.04)))
	var disc := Rotor.new()
	disc.name = "SanderDisc"
	disc.rpm = 2800.0
	disc.axis = Vector3.FORWARD
	disc.position = Vector3(0, 0, 0.12)
	disc.add_child(_disc(0.11, 0.016, Color(0.35, 0.27, 0.19)))
	ee.add_child(disc)
	add_child(ee)

	var estop := _assembly("EStop", Vector3.RIGHT, 0.4)
	estop.position = Vector3(0.34, 0.34, 0.2)
	estop.add_child(_cyl(0.045, 0.03, Vector3.ZERO, Color(0.88, 0.11, 0.18)))
	add_child(estop)

func _servo_joint(nm: String, pos: Vector3, dir: Vector3, mag: float) -> Node3D:
	var a := _assembly(nm, dir, mag)
	a.position = pos
	a.add_child(_cyl(0.09, 0.16, Vector3.ZERO, Color(0.16, 0.2, 0.27), Vector3(90, 0, 0)))  # motor housing
	var out := Rotor.new()
	out.name = "%sGearOut" % nm
	out.rpm = 18.0
	out.axis = Vector3.FORWARD
	out.position = Vector3(0, 0, 0.11)
	out.add_child(_gear(20, 0.08, 0.03))
	a.add_child(out)
	return a

# --- primitive helpers ----------------------------------------------------

func _assembly(nm: String, dir: Vector3, mag: float) -> Node3D:
	var n := Node3D.new()
	n.name = nm
	n.set_meta("explode_dir", dir)
	n.set_meta("explode_mag", mag)
	n.set_meta("home", Vector3.ZERO)  # filled by ExplodedView on first frame
	return n

func _mat(c: Color, metal := 0.4, rough := 0.45) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	m.metallic = metal
	m.roughness = rough
	return m

func _box(size: Vector3, pos: Vector3, c: Color) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var b := BoxMesh.new(); b.size = size
	mi.mesh = b; mi.position = pos; mi.material_override = _mat(c)
	return mi

func _cyl(r: float, h: float, pos: Vector3, c: Color, rot_deg := Vector3.ZERO) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var cm := CylinderMesh.new(); cm.top_radius = r; cm.bottom_radius = r; cm.height = h
	mi.mesh = cm; mi.position = pos; mi.rotation_degrees = rot_deg; mi.material_override = _mat(c, 0.9, 0.3)
	return mi

func _disc(r: float, h: float, c: Color) -> MeshInstance3D:
	var mi := _cyl(r, h, Vector3.ZERO, c)
	mi.rotation_degrees = Vector3(90, 0, 0)
	return mi

func _gear(teeth: int, radius: float, thickness: float) -> Node3D:
	var g := Node3D.new()
	g.add_child(_cyl(radius, thickness, Vector3.ZERO, Color(0.67, 0.7, 0.75), Vector3(90, 0, 0)))
	for i in teeth:
		var a := float(i) / teeth * TAU
		var tooth := _box(Vector3(radius * 0.16, thickness, radius * 0.34),
			Vector3(cos(a) * radius, 0, sin(a) * radius), Color(0.67, 0.7, 0.75))
		tooth.rotation.y = -a
		g.add_child(tooth)
	return g
