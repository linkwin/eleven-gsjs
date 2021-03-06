var type = 5;
var title = "Tower Floor 6";
var desc = "This project is to add the sixth floor to your Tower.";
var completion = "Congrats, your Tower now has 6 floors!";

var duration = 0;
var claimable = 0;

var requirements = {
	"r1717"	: {
		"bucket_id"	: "1",
		"group_id"	: "1",
		"type"		: "item",
		"class_id"	: "wall_segment",
		"num"		: 8,
		"base_cost"	: 2500,
		"desc"		: "Add wall segments"
	},
	"r1723"	: {
		"bucket_id"	: "1",
		"group_id"	: "1",
		"type"		: "item",
		"class_id"	: "grade_aa_earth_block",
		"num"		: 100,
		"base_cost"	: 150,
		"desc"		: "Add Urth blocks"
	},
	"r1729"	: {
		"bucket_id"	: "1",
		"group_id"	: "1",
		"type"		: "item",
		"class_id"	: "girder",
		"num"		: 20,
		"base_cost"	: 1500,
		"desc"		: "Add girders"
	},
	"r1753"	: {
		"bucket_id"	: "1",
		"group_id"	: "1",
		"type"		: "item",
		"class_id"	: "snail",
		"num"		: 24,
		"base_cost"	: 10,
		"desc"		: "Use snails"
	},
	"r1735"	: {
		"bucket_id"	: "1",
		"group_id"	: "2",
		"type"		: "work",
		"class_id"	: "construction_tool",
		"class_ids"	: {
			"0"	: "construction_tool"
		},
		"skill"		: "",
		"num"		: 40,
		"base_cost"	: 23,
		"energy"	: 20,
		"wear"		: 2,
		"verb_name"	: "construct",
		"verb_past"	: "constructed",
		"desc"		: "Construct the next floor"
	},
	"r1741"	: {
		"bucket_id"	: "2",
		"group_id"	: "1",
		"type"		: "item",
		"class_id"	: "beam",
		"num"		: 10,
		"base_cost"	: 800,
		"desc"		: "Add beams"
	},
	"r1747"	: {
		"bucket_id"	: "2",
		"group_id"	: "1",
		"type"		: "item",
		"class_id"	: "metal_post",
		"num"		: 20,
		"base_cost"	: 400,
		"desc"		: "Add metal bars"
	},
	"r1759"	: {
		"bucket_id"	: "2",
		"group_id"	: "1",
		"type"		: "item",
		"class_id"	: "string",
		"num"		: 212,
		"base_cost"	: 53,
		"desc"		: "String it up"
	},
	"r1810"	: {
		"bucket_id"	: "2",
		"group_id"	: "1",
		"type"		: "item",
		"class_id"	: "general_building_permit",
		"num"		: 1,
		"base_cost"	: 500,
		"desc"		: "Employ a permit"
	},
	"r1765"	: {
		"bucket_id"	: "2",
		"group_id"	: "2",
		"type"		: "work",
		"class_id"	: "tinkertool",
		"class_ids"	: {
			"0"	: "tinkertool"
		},
		"skill"		: "",
		"num"		: 40,
		"base_cost"	: 23,
		"energy"	: 20,
		"wear"		: 2,
		"verb_name"	: "elevate",
		"verb_past"	: "elevated",
		"desc"		: "Elevate the floor"
	}
};


function onComplete(pc, multiplier){ // generated from rewards
	var rewards = {};
	rewards.items = [];
	rewards.recipes = [];
	return rewards;
}
var rewards = {};

function applyPerformanceRewards(pc){ // generated from rewards
	var rewards = {};
	rewards.items = [];
	rewards.recipes = [];
	return rewards;
}
var performance_percent = 0;
var performance_cutoff = 0;
var performance_rewards = {};

// generated ok (NO DATE)
