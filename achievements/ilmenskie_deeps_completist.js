var name		= "Ilmenskie Deeps Completist";
var collection_type	= 0;
var is_secret		= 0;
var desc		= "Visited every location in Ilmenskie Deeps";
var status_text		= "You delved deeper than ever thought possible, and by scraping the very undercarriage of Ilmenskie Deeps, you've hit paydirt: the title of Ilmenskie Deeps Completist. Hey! Turns out hitting bottom was a much more rewarding experience than you'd been led to believe!";
var last_published	= 1350066253;
var is_shareworthy	= 1;
var url		= "ilmenskie-deeps-completist";
var category		= "exploring";
var url_swf		= "\/c2.glitch.bz\/achievements\/2011-09-10\/ilmenskie_deeps_completist_1315685926.swf";
var url_img_180		= "\/c2.glitch.bz\/achievements\/2011-09-10\/ilmenskie_deeps_completist_1315685926_180.png";
var url_img_60		= "\/c2.glitch.bz\/achievements\/2011-09-10\/ilmenskie_deeps_completist_1315685926_60.png";
var url_img_40		= "\/c2.glitch.bz\/achievements\/2011-09-10\/ilmenskie_deeps_completist_1315685926_40.png";
function on_apply(pc){
	
}
var conditions = {
	492 : {
		type	: "counter",
		group	: "streets_visited_in_hub",
		label	: "number_78",
		value	: "17"
	},
};
function onComplete(pc){ // generated from rewards
	var multiplier = pc.buffs_has('gift_of_gab') ? 1.2 : pc.buffs_has('silvertongue') ? 1.05 : 1.0;
	multiplier += pc.imagination_get_achievement_modifier();
	if (/completist/i.exec(this.name)) { 
		 var level = pc.stats_get_level(); 
		 if (level > 4) {  
				multiplier *= (pc.stats_get_level()/4); 
		} 
	} 
	pc.stats_add_xp(round_to_5(150 * multiplier), true);
	pc.stats_add_favor_points("lem", round_to_5(20 * multiplier));
	if(pc.buffs_has('gift_of_gab')) {
		pc.buffs_remove('gift_of_gab');
	}
	else if(pc.buffs_has('silvertongue')) {
		pc.buffs_remove('silvertongue');
	}
}
var rewards	= {
	"xp"	: 150,
	"favor"	: {
		"giant"		: "lem",
		"points"	: 20
	}
};

//log.info("ilmenskie_deeps_completist.js LOADED");

// generated ok (NO DATE)