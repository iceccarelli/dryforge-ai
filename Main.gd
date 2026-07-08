extends Node3D
## DryForge Pro Simulator — bootstrap.
## Builds the scene procedurally so the project runs with zero imported assets.
## Replace RobotRig primitives with imported .glb/.blend meshes when ready.

const RobotRig := preload("res://scripts/RobotRig.gd")
const CameraRig := preload("res://scripts/CameraRig.gd")
const ExplodedView := preload("res://scripts/ExplodedView.gd")
const TaskPath := preload("res://scripts/TaskPath.gd")

var _rig: Node3D
var _exploded: Node
var _running := true

func _ready() -> void:
	_build_environment()
	_build_lights()

	# Robot
	_rig = RobotRig.new()
	add_child(_rig)

	# Camera rig (orbit + presets + section cutaway toggle)
	var cam := CameraRig.new()
	cam.target = Vector3(0, 0.9, 0.2)
	add_child(cam)

	# Exploded-view controller drives every part flagged in RobotRig
	_exploded = ExplodedView.new()
	_exploded.rig = _rig
	add_child(_exploded)

	# Task path: drives the end-effector along a boustrophedon wall pass
	var task := TaskPath.new()
	task.end_effector = _rig.get_node("EndEffector")
	add_child(task)

	_build_ui(cam)

func _build_environment() -> void:
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.043, 0.07, 0.125)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.6, 0.65, 0.75)
	env.ambient_light_energy = 0.4
	env.ssao_enabled = true
	env.tonemap_mode = Environment.TONE_MAPPER_ACES
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)

	var floor := MeshInstance3D.new()
	var plane := PlaneMesh.new()
	plane.size = Vector2(14, 14)
	floor.mesh = plane
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(0.09, 0.11, 0.15)
	m.roughness = 0.9
	floor.material_override = m
	add_child(floor)

func _build_lights() -> void:
	var key := DirectionalLight3D.new()
	key.rotation_degrees = Vector3(-55, -40, 0)
	key.light_energy = 1.6
	key.shadow_enabled = true
	add_child(key)
	var fill := OmniLight3D.new()
	fill.position = Vector3(-3, 2.5, 3)
	fill.light_energy = 0.5
	fill.omni_range = 12
	add_child(fill)

func _build_ui(cam: CameraRig) -> void:
	var ui := CanvasLayer.new()
	add_child(ui)

	var panel := VBoxContainer.new()
	panel.position = Vector2(16, 16)
	ui.add_child(panel)

	var badge := Label.new()
	badge.text = "Concept model — illustrative specs, not a validated digital twin"
	badge.add_theme_color_override("font_color", Color(0.96, 0.62, 0.04))
	panel.add_child(badge)

	# Exploded slider
	panel.add_child(_make_label("Exploded view"))
	var slider := HSlider.new()
	slider.min_value = 0.0
	slider.max_value = 1.0
	slider.step = 0.01
	slider.custom_minimum_size = Vector2(220, 0)
	slider.value_changed.connect(func(v): _exploded.factor = v)
	panel.add_child(slider)

	# Cutaway toggle
	var cut := CheckButton.new()
	cut.text = "Cutaway"
	cut.toggled.connect(func(on): cam.set_cutaway(on))
	panel.add_child(cut)

	# Run toggle
	var run := CheckButton.new()
	run.text = "Run drivetrain"
	run.button_pressed = true
	run.toggled.connect(func(on): _rig.set_running(on))
	panel.add_child(run)

	# Camera presets
	panel.add_child(_make_label("Views"))
	var row := HBoxContainer.new()
	for preset in ["3/4", "Side", "Top", "Tool"]:
		var b := Button.new()
		b.text = preset
		b.pressed.connect(func(): cam.apply_preset(preset))
		row.add_child(b)
	panel.add_child(row)

func _make_label(t: String) -> Label:
	var l := Label.new()
	l.text = t
	return l
