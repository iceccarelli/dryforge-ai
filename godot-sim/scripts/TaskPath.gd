extends Node
## Drives the end-effector node along a boustrophedon (back-and-forth) wall
## pass — the motion profile a finisher uses for taping/mudding/sanding.
## Purely kinematic playback; swap for a physics/IK solve when you model joints.

@export var end_effector: Node3D
@export var wall_width: float = 1.6
@export var wall_height: float = 1.0
@export var rows: int = 5
@export var speed: float = 0.35     ## m/s along the path
@export var origin: Vector3 = Vector3(0, 0.6, 0.55)

var _points: PackedVector3Array
var _seg := 0
var _t := 0.0

func _ready() -> void:
	_build_path()

func _build_path() -> void:
	_points = PackedVector3Array()
	for r in rows:
		var y := origin.y + (float(r) / max(1, rows - 1)) * wall_height
		var left := origin + Vector3(-wall_width * 0.5, y - origin.y, 0)
		var right := origin + Vector3(wall_width * 0.5, y - origin.y, 0)
		if r % 2 == 0:
			_points.append(left); _points.append(right)
		else:
			_points.append(right); _points.append(left)

func _process(delta: float) -> void:
	if end_effector == null or _points.size() < 2:
		return
	var a := _points[_seg]
	var b := _points[(_seg + 1) % _points.size()]
	var seg_len := a.distance_to(b)
	_t += (speed * delta) / max(0.001, seg_len)
	if _t >= 1.0:
		_t = 0.0
		_seg = (_seg + 1) % _points.size()
		a = _points[_seg]
		b = _points[(_seg + 1) % _points.size()]
	end_effector.position = a.lerp(b, _t)
