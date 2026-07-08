extends Node3D
## Spins a node at a configured RPM about a local axis. Attach to gearbox
## outputs, sander discs, cooling fans. RPM is an illustrative concept target.

@export var rpm: float = 60.0
@export var axis: Vector3 = Vector3.FORWARD
var running: bool = true

func _process(delta: float) -> void:
	if not running:
		return
	# rev/min -> rad/s
	var rad_per_sec := rpm * TAU / 60.0
	rotate(axis.normalized(), rad_per_sec * delta)
