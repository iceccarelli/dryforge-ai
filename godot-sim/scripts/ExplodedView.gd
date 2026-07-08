extends Node
## Lerps every tagged assembly outward along its explode_dir by `factor`.
## Reads meta set in RobotRig: "explode_dir", "explode_mag", "home".

@export var rig: Node3D
var factor: float = 0.0
var _init := false

func _process(_delta: float) -> void:
	if rig == null:
		return
	for child in rig.get_children():
		if not child is Node3D:
			continue
		if not child.has_meta("explode_dir"):
			continue
		if not _init:
			child.set_meta("home", child.position)
		var home: Vector3 = child.get_meta("home")
		var dir: Vector3 = child.get_meta("explode_dir")
		var mag: float = child.get_meta("explode_mag")
		child.position = home + dir.normalized() * mag * factor
	_init = true
