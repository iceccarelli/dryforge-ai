extends Node3D
class_name CameraRig
## Orbit camera (drag to rotate, wheel to zoom) + named presets + cutaway.
## Cutaway drives a global "section" uniform consumed by section_cut.gdshader
## on any part you want sliceable.

var target: Vector3 = Vector3(0, 0.9, 0.2)
var _yaw := 0.6
var _pitch := 0.4
var _dist := 3.6
var _cam: Camera3D
var _dragging := false
var _cut := false
var _cut_z := 0.1

const PRESETS := {
	"3/4": { "yaw": 0.7, "pitch": 0.45, "dist": 3.6 },
	"Side": { "yaw": 1.57, "pitch": 0.1, "dist": 4.0 },
	"Top": { "yaw": 0.0, "pitch": 1.45, "dist": 4.2 },
	"Tool": { "yaw": 0.4, "pitch": 0.2, "dist": 1.9 },
}

func _ready() -> void:
	_cam = Camera3D.new()
	_cam.fov = 42.0
	add_child(_cam)
	_update()

func apply_preset(name: String) -> void:
	if not PRESETS.has(name):
		return
	var p = PRESETS[name]
	_yaw = p.yaw; _pitch = p.pitch; _dist = p.dist
	_update()

func set_cutaway(on: bool) -> void:
	_cut = on
	# Broadcast to shader-driven parts via a project-wide shader parameter.
	RenderingServer.global_shader_parameter_set("section_enabled", 1.0 if on else 0.0)
	RenderingServer.global_shader_parameter_set("section_z", _cut_z)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			_dragging = event.pressed
		elif event.button_index == MOUSE_BUTTON_WHEEL_UP:
			_dist = max(1.4, _dist - 0.25); _update()
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			_dist = min(9.0, _dist + 0.25); _update()
	elif event is InputEventMouseMotion and _dragging:
		_yaw -= event.relative.x * 0.006
		_pitch = clamp(_pitch - event.relative.y * 0.006, -1.3, 1.5)
		_update()

func _update() -> void:
	var x := _dist * cos(_pitch) * sin(_yaw)
	var y := _dist * sin(_pitch)
	var z := _dist * cos(_pitch) * cos(_yaw)
	_cam.position = target + Vector3(x, y, z)
	_cam.look_at(target, Vector3.UP)
