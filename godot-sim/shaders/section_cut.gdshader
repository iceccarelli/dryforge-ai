shader_type spatial;
// Section-cut shader for cutaway inspection. Discards fragments in front of a
// world-space Z plane when the global "section_enabled" flag is on.
// Assign as material on any housing you want sliceable, then toggle from CameraRig.

global uniform float section_enabled;
global uniform float section_z;

uniform vec4 albedo : source_color = vec4(0.79, 0.82, 0.87, 1.0);
uniform float metallic : hint_range(0.0, 1.0) = 0.4;
uniform float roughness : hint_range(0.0, 1.0) = 0.45;

varying vec3 world_pos;

void vertex() {
	world_pos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
	if (section_enabled > 0.5 && world_pos.z > section_z) {
		discard;
	}
	ALBEDO = albedo.rgb;
	METALLIC = metallic;
	ROUGHNESS = roughness;
	// light the freshly-cut interior faces
	if (!FRONT_FACING) {
		ALBEDO *= 0.6;
	}
}
