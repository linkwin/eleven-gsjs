//#include include/furniture.js, include/takeable.js

var label = "Wall Cabinet";
var version = "1351897068";
var name_single = "Wall Cabinet";
var name_plural = "Wall Cabinets";
var article = "a";
var description = "The good thing about this cabinet is that it's at eye-level. The bad thing about it is that it's eye-level and mildly unattractive. Still, you don't need to compliment the cabinetry while you're stashing your stockpile, as they say.";
var is_hidden = false;
var has_info = true;
var has_infopage = true;
var proxy_item = null;
var is_routable = false;
var adjusted_scale = 1;
var stackmax = 1;
var base_cost = 1350;
var input_for = [];
var parent_classes = ["bag_furniture_wallcabinet", "bag_furniture_cabinet_base", "furniture_base"];
var has_instance_props = true;

var classProps = {
	"placement_set"	: "wall",	// defined by furniture_base (overridden by bag_furniture_wallcabinet)
	"can_flip"	: "1",	// defined by furniture_base (overridden by bag_furniture_wallcabinet)
	"can_revert_to_base"	: "1",	// defined by furniture_base
	"width"	: "3",	// defined by bag_furniture_cabinet_base (overridden by bag_furniture_wallcabinet)
	"height"	: "3",	// defined by bag_furniture_cabinet_base (overridden by bag_furniture_wallcabinet)
	"rows_display"	: "3"	// defined by bag_furniture_cabinet_base (overridden by bag_furniture_wallcabinet)
};

function initInstanceProps(){
	this.instanceProps = {};
	this.instanceProps.upgrade_id = "";	// defined by furniture_base
	this.instanceProps.facing_right = "1";	// defined by furniture_base
	this.instanceProps.user_config = "";	// defined by furniture_base
}

var instancePropsDef = {
	upgrade_id : ["Which upgrade is applied to this furniture"],
	facing_right : ["Are we facing right?"],
	user_config : ["User customizations"],
};

var instancePropsChoices = {
	upgrade_id : [""],
	facing_right : [""],
	user_config : [""],
};

var verbs = {};

verbs.pickup = { // defined by furniture_base
	"name"				: "pick up",
	"ok_states"			: ["in_location"],
	"requires_target_pc"		: false,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_default"			: false,
	"is_emote"			: false,
	"sort_on"			: 50,
	"tooltip"			: "Or, drag to your pack",
	"is_drop_target"		: false,
	"conditions"			: function(pc, drop_stack){

		if (this.getContainerType() == 'street' && this.container.pols_is_pol() && !this.container.pols_is_owner(pc)) return {state: null};
		if (this.class_tsid == 'furniture_chassis' || this.class_tsid == 'furniture_tower_chassis') return {state: null};
		if (this.canPickup){
			var ret = this.canPickup(pc);
			if (!ret.ok){
				if (ret.error) return {state:'disabled', reason: ret.error};
				return {state:'disabled', reason: "You can't pick that up."};
			}
		}
		if (this.isForSale()) return {state:'disabled', reason: "You have to stop selling it first."};
		return {state:'enabled'};
	},
	"handler"			: function(pc, msg, suppress_activity){

		var failed = 0;
		var orig_count = this.count;
		var self_msgs = [];
		var self_effects = [];
		var they_effects = [];

		var ret = pc.furniture_pickup(msg.itemstack_tsid);
		failed = !ret.ok;
		if (ret.error) self_msgs.push(ret.error);

		var pre_msg = this.buildVerbMessage(msg.count, 'pick up', 'picked up', failed, self_msgs, self_effects, they_effects);
		if (!suppress_activity && pre_msg) pc.sendActivity(pre_msg);

		return failed ? false : true;
	}
};

verbs.dont_sell = { // defined by furniture_base
	"name"				: "don't sell",
	"ok_states"			: ["in_location"],
	"requires_target_pc"		: false,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_default"			: false,
	"is_emote"			: false,
	"sort_on"			: 51,
	"tooltip"			: "Stop selling it",
	"is_drop_target"		: false,
	"disable_proximity"		: true,
	"conditions"			: function(pc, drop_stack){

		if (this.getContainerType() == 'street' && this.container.pols_is_pol() && !this.container.pols_is_owner(pc)) return {state: null};
		if (!this.canSell(pc)) return {state: null};
		if (!this.isForSale()) return {state: null};
		return {state:'enabled'};
	},
	"handler"			: function(pc, msg, suppress_activity){

		this.is_for_sale = false;
		this.triggerUpdateCallback('furniture');
		this.broadcastConfig();
		this.broadcastStoreConfig();

		var pre_msg = "You stopped selling a "+this.name_single+".";
		pc.sendActivity(pre_msg);

		return true;
	}
};

verbs.upgrade = { // defined by furniture_base
	"name"				: "upgrade",
	"ok_states"			: ["in_location","in_pack"],
	"requires_target_pc"		: false,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_default"			: false,
	"is_emote"			: false,
	"sort_on"			: 51,
	"tooltip"			: "Change it",
	"is_drop_target"		: false,
	"disable_proximity"		: true,
	"conditions"			: function(pc, drop_stack){

		if (this.getContainerType() == 'street' && this.container.pols_is_pol() && !this.container.pols_is_owner(pc)) return {state: null};
		if (this.class_tsid == 'furniture_chassis' || this.class_tsid == 'furniture_tower_chassis') return {state: null};
		if (this.isForSale()) return {state:'disabled', reason: "Cannot be upgraded while it's for sale"};
		if (intval(this.getInstanceProp('upgrade_id')) == 0){
			if (this.class_tsid != 'furniture_door' && (this.getContainerType() == 'pack' || this.getContainerType() == 'bag')) return {state:'disabled', reason: "Drag this "+this.name_single+" into your house to upgrade it"};
			return {state:'enabled'};
		}
		return {state:null};
	},
	"handler"			: function(pc, msg, suppress_activity){

		var upgrades = this.getUpgrades(pc);

		var ret = {
			type: "furniture_upgrade_start",
			itemstack_tsid: this.tsid, // the piece of furniture being upgraded
			upgrades: []
		};

		for (var i in upgrades){
			var up = upgrades[i];
			if (!up.is_visible && !pc.is_god) continue;

			var ob = {
				id: i,
				label: up.name,
				credits: intval(up.credits_cost), // 0==free
				imagination: intval(up.imagination_cost),
				subscriber_only: intval(up.subscriber_only),
				is_visible: up.is_visible ? true : false,
				is_owned: up.is_owned ? true : false,
				is_new: !!up.is_new,
				config: {
					swf_url: up.swf,
					config: up.config
				}
			}
			
			// this but is for tower chassis. We want the upgrade configs to all have the
			// same number of extra_floors as the current upgrade, for customizing!
			if (this.getInstanceProp('extra_floors')) {
				if (!ob.config.config) ob.config.config = {};
				ob.config.config.extra_floors = this.getInstanceProp('extra_floors');
			}
				
			ret.upgrades.push(ob);
		}

		pc.apiSendMsg(ret);

		return true;
	}
};

verbs.change_style = { // defined by furniture_base
	"name"				: "change style",
	"ok_states"			: ["in_location","in_pack"],
	"requires_target_pc"		: false,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_default"			: false,
	"is_emote"			: false,
	"sort_on"			: 52,
	"tooltip"			: "Change it",
	"is_drop_target"		: false,
	"disable_proximity"		: true,
	"conditions"			: function(pc, drop_stack){

		if (this.getContainerType() == 'street' && this.container.pols_is_pol() && !this.container.pols_is_owner(pc)) return {state: null};
		if (this.class_tsid == 'furniture_chassis' || this.class_tsid == 'furniture_tower_chassis') return {state: null};
		//if (!pc.has_done_intro) return {state: null};
		if (intval(this.getInstanceProp('upgrade_id')) != 0){
			if (this.isForSale()) return {state:'disabled', reason: "Cannot be upgraded while it's for sale"};
			return {state:'enabled'};
		}
		return {state:null};
	},
	"handler"			: function(pc, msg, suppress_activity){

		return this.verbs.upgrade.handler.call(this, pc, msg, suppress_activity);
	}
};

verbs.set_sale_price = { // defined by furniture_base
	"name"				: "set sale price",
	"ok_states"			: ["in_location"],
	"requires_target_pc"		: false,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_default"			: false,
	"is_emote"			: false,
	"sort_on"			: 52,
	"tooltip"			: "Start selling it",
	"is_drop_target"		: false,
	"disable_proximity"		: true,
	"conditions"			: function(pc, drop_stack){

		if (this.getContainerType() == 'street' && this.container.pols_is_pol() && !this.container.pols_is_owner(pc)) return {state: null};
		if (!this.canSell(pc)) return {state: null};
		if (this.isForSale()) return {state: null};
		if (this.is_bag && this.countContents()) return {state:'disabled', reason: "This item must be emptied before it can be sold."};
		if (this.isSoulbound(pc)) return {state:'disabled', reason: "This item is locked to you and cannot be sold."};
		if (this.income) return {state:'disabled', reason: "You have to collect the currants first."};
		return {state:'enabled'};
	},
	"handler"			: function(pc, msg, suppress_activity){

		var label = '<p class="rename_bubble_sdb_pricer_title">Price</p>';

		var args = {
			cancelable: true,
			input_focus: true,
			input_label: label,
			submit_label: "Set price",
			input_value: this.sale_price ? intval(this.sale_price) : 1,
			input_max_chars: 6,
			input_restrict: '0-9',
			no_bubble:false, // this makes the input request use the large UI
			is_currants:true
		};

		this.askPlayer(pc, 'set_sale_price', 'nothing', args);

		return true
	}
};

verbs.edit_sale_price = { // defined by furniture_base
	"name"				: "edit sale price",
	"ok_states"			: ["in_location"],
	"requires_target_pc"		: false,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_default"			: false,
	"is_emote"			: false,
	"sort_on"			: 53,
	"tooltip"			: "Change the sale price",
	"is_drop_target"		: false,
	"disable_proximity"		: true,
	"conditions"			: function(pc, drop_stack){

		if (this.getContainerType() == 'street' && this.container.pols_is_pol() && !this.container.pols_is_owner(pc)) return {state: null};
		if (!this.canSell(pc)) return {state: null};
		if (!this.isForSale()) return {state: null};
		return {state:'enabled'};
	},
	"handler"			: function(pc, msg, suppress_activity){

		return this.verbs.set_sale_price.handler.call(this, pc, msg, suppress_activity);
	}
};

verbs.open = { // defined by bag_furniture_cabinet_base
	"name"				: "open",
	"ok_states"			: ["in_location"],
	"requires_target_pc"		: false,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_default"			: false,
	"is_emote"			: false,
	"sort_on"			: 53,
	"tooltip"			: "Inspect your storage",
	"is_drop_target"		: false,
	"disable_proximity"		: true,
	"conditions"			: function(pc, drop_stack){

		if (this.getContainerType() != 'street') return {state:null};
		if (!this.isOwner(pc)) return {state:null};
		if (this.isForSale()) return {state:'disabled', reason: "You can't add items while it's for sale."};
		return {state:'enabled'};
	},
	"handler"			: function(pc, msg, suppress_activity){

		if (!this.isOwner(pc)){
			log.error(this+" not owner and has no key. Bailing.");
			return false;
		}

		if (this.capacity != (intval(this.classProps.width) * intval(this.classProps.height))){
			log.error(this+" capacity mismatch. Deleting.");
			delete this.capacity;
		}

		if (this.capacity != (intval(this.classProps.width) * intval(this.classProps.height))){
			log.error(this+" capacity mismatch. Bailing.");
			return false;
		}

		pc.apiSendMsgAsIs({
			type: "cabinet_start",
			itemstack_tsid: this.tsid, // the tsid of the cabinet that was opened
			cols: intval(this.classProps.width),
			rows: intval(this.classProps.height),
			rows_display: intval(this.classProps.rows_display),
			itemstacks: make_bag(this),
		});

		return true;
	}
};

verbs.flip = { // defined by furniture_base
	"name"				: "flip",
	"ok_states"			: ["in_location"],
	"requires_target_pc"		: false,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_single"			: 1,
	"is_default"			: false,
	"is_emote"			: false,
	"sort_on"			: 54,
	"tooltip"			: "Turn it around",
	"is_drop_target"		: false,
	"disable_proximity"		: true,
	"conditions"			: function(pc, drop_stack){

		if (this.getContainerType() == 'street' && this.container.pols_is_pol() && !this.container.pols_is_owner(pc)) return {state: null};
		var can_flip = intval(this.getClassProp('can_flip'));
		if (!can_flip) return {state:null};
		return {state:'enabled'};
	},
	"handler"			: function(pc, msg, suppress_activity){

		var facing_right = intval(this.getInstanceProp('facing_right'));
		this.setInstanceProp('facing_right', (facing_right+1)%2);
		this.flipPlats();

		this.broadcastConfig();

		return true;
	}
};

verbs.give = { // defined by furniture_base
	"name"				: "give",
	"ok_states"			: ["in_pack"],
	"requires_target_pc"		: true,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_single"			: 1,
	"is_default"			: false,
	"is_emote"			: false,
	"sort_on"			: 55,
	"tooltip"			: "Or, drag item to player",
	"is_drop_target"		: false,
	"conditions"			: function(pc, drop_stack){

		return this.takeable_give_conditions(pc, drop_stack);
	},
	"handler"			: function(pc, msg, suppress_activity){

		return this.takeable_give(pc, msg);
	}
};

verbs.buy = { // defined by furniture_base
	"name"				: "buy",
	"ok_states"			: ["in_location"],
	"requires_target_pc"		: false,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_default"			: false,
	"is_emote"			: false,
	"sort_on"			: 58,
	"tooltip"			: "Buy it",
	"get_tooltip"			: function(pc, verb, effects){

		return verb.tooltip+' for '+utils.number_format(this.sale_price)+'c';
	},
	"is_drop_target"		: false,
	"disable_proximity"		: true,
	"conditions"			: function(pc, drop_stack){

		var sell_to_owner = false;
		if (this.getContainerType() == 'street' && this.container.pols_is_pol() && this.container.pols_is_owner(pc) && !sell_to_owner) return {state: null};
		if (this.isForSale(pc)) return {state:'enabled'};
		return {state:null};
	},
	"handler"			: function(pc, msg, suppress_activity){

		var out = {
			type: 'store_start',
			item_class: this.class_id,
			item_tsid: this.tsid,
			verb: 'buy',
			store: this.getStoreInfo()
		};
			
		pc.apiSendMsgAsIs(out);
	}
};

// global block from bag_furniture_wallcabinet
var capacity = 9;

function canContain(stack){ // defined by bag_furniture_cabinet_base
	if (stack.class_id == 'contraband') return 0;
	if (stack.getProp('is_element')) return 0;
	if (stack.getProp('is_trophy')) return 0;
	if (!stack.is_takeable || !stack.is_takeable()) return 0;
	if (stack.hasTag('no_bag')) return 0;
	return stack.getProp('count');
}

function canPickup(pc){ // defined by bag_furniture_cabinet_base
	if (this.getContainerType() == 'street' && this.container.pols_is_pol() && !this.container.pols_is_owner(pc)) return {ok: 0};
	if (this.countContents()) return {ok: 0, error: "You must empty the cabinet first."};
	return {ok: 1};
}

function isOwner(pc){ // defined by bag_furniture_cabinet_base
	if (!this.container.owner) return true;

	var is_owner = this.container.owner.tsid == pc.tsid ? true : false;

	if (is_owner) return true;

	return this.container.acl_keys_player_has_key(pc);
	/*if (this.container.is_public){
		return false;
	}
	else{
		return this.container.acl_keys_player_has_key(pc);
	}*/
}

function isSelectable(pc){ // defined by bag_furniture_cabinet_base
	if (!pc) return false;

	return this.isOwner(pc);
}

function onCreate(){ // defined by bag_furniture_cabinet_base
	this.initInstanceProps();
	this.capacity = intval(this.classProps.width) * intval(this.classProps.height);
	this.is_pack = false;
	this.is_cabinet = true;
}

function broadcastStoreConfig(){ // defined by furniture_base
	var store_info = this.getStoreInfo();
	this.container.apiSendMsg({
		type: 'store_changed',
		item_class: this.class_id,
		item_tsid: this.tsid,
		store: store_info
	});
}

function canSell(pc){ // defined by furniture_base
	if (this.class_tsid == 'furniture_chassis') return false;
	if (this.class_tsid == 'furniture_tower_chassis') return false;
	if (this.class_tsid == 'furniture_door') return false;
	return true;
}

function getExtraConfig(ret){ // defined by furniture_base
	var tag_sd = {
		type: 'furn_price_tag',
		uid: 'furn_price_tag_'+this.tsid
	}

	if (this.isForSale()) {
		tag_sd.sale_price = this.sale_price;
		tag_sd.h_flipped = intval(this.getInstanceProp('facing_right')) != 1;
	}

	// order of array governs z depth of special displays
	ret.special_display = [tag_sd];

	return ret;
}

function getStoreInfo(){ // defined by furniture_base
	var upgrades = this.getUpgrades(null);
	var its_upgrades;

	for (var i in upgrades){
		var up = upgrades[i];
		if (!up) continue;
		//if (!up.credits_cost) continue; // 0==free, and we don't count that as an upgrade when we tell the user about it

		if (this.hasUpgrade(i)) { 
			if (!its_upgrades) its_upgrades = []; // lazy creation
			its_upgrades.push({
				id: i,
				label: up.name,
				credits: intval(up.credits_cost), // 0==free
				imagination: intval(up.imagination_cost),
				subscriber_only: intval(up.subscriber_only),
				is_visible: up.is_visible ? true : false,
				is_new: !!up.is_new,
				config: {
					swf_url: up.swf,
					config: up.config
				},
				thumb_40: up.thumb_40
				//temp: up
			});
		}
	}

	var rsp = {
		name : "Buying "+this.label,
		buy_multiplier : 0.0,
		items: [],
		is_single_furniture: true,
		single_furniture_upgrades: its_upgrades,
		single_stack_tsid: this.tsid
	};

	if (this.is_for_sale && this.sale_price){
		rsp.items = [
			{
				class_tsid: this.class_tsid,
				cost: this.sale_price,
				count: 1
			}
		];
	}

	return rsp;
}

function getUserConfig(){ // defined by furniture_base
	return this.getInstanceProp('user_config');
}

function isForSale(){ // defined by furniture_base
	return this.is_for_sale && this.sale_price;
}

function onInputBoxResponse(pc, uid, value){ // defined by furniture_base
	if (this.getContainerType() == 'street' && this.container.pols_is_pol() && !this.container.pols_is_owner(pc)) return false;
	if (!this.canSell(pc)) return false;

	if (value === '') return true;

	value = intval(value.substr(0,6).replace(/[^0-9 ]/gi,''));

	if (uid == 'set_sale_price'){
		if (value && value > 0){
			this.sale_price = value;
			this.is_for_sale = true;
		}
		else{
			this.is_for_sale = false;
		}

		this.triggerUpdateCallback('furniture');
		
		this.broadcastConfig();
		this.broadcastStoreConfig();
	}

	return true;
}

function sellItem(pc, msg){ // defined by furniture_base
	if (!this.isForSale()){
		log.info("not selling");
		return pc.apiSendMsg(make_fail_rsp(msg, 0, "That store is no longer selling."));
	}

	//
	// check the count looks ok
	//

	var count = intval(msg.count);

	if (count <= 0){
		log.info("positive counts only");
		return pc.apiSendMsg(make_fail_rsp(msg, 0, "You can't buy a negative/zero amount of things!"));
	}

	var store_info = this.getStoreInfo();
	if (!store_info || !store_info.items){
		log.info("no store info");
		return pc.apiSendMsg(make_fail_rsp(msg, 0, "Oops, something is wrong with that store."));
	}


	//
	// check that the store sells this item
	//

	var store_items = [];
	for (var i in store_info.items){
		var it = store_info.items[i];
		if (it.class_tsid == msg.class_tsid){
			if (count < it.count){
				it.count = count;
			}
			else{
				count = it.count;
			}
			store_items.push(it);
			break;
		}
	}
	//log.info(store_items);
	var item_proto = apiFindItemPrototype(msg.class_tsid);

	if (!num_keys(store_items)){
		log.info("store doesn't sell that item");
		return pc.apiSendMsg(make_fail_rsp(msg, 0, "This store no longer sells that item."));
	}


	//
	// check that we have enough money
	//

	var total_cost = 0;
	for (var i in store_items){
		total_cost += (store_items[i].cost * store_items[i].count);
	}
	//log.info('total cost: '+total_cost);

	if (msg.price){
		var expected_price = intval(msg.price) * count;
		if (expected_price != total_cost){
			log.info("price mismatch: "+expected_price+" vs "+total_cost);
			return this.apiSendMsg(make_fail_rsp(msg, 0, "Oops, the price appears to have changed underneath you. Please try your purchase again."));
		}
	}
	else{
		msg.price = store_items[0].cost;
	}

	if (!pc.stats_has_currants(total_cost)){
		log.info("you don't have enough money");
		pc.sendActivity("Sorry, you can't afford that.");
		return pc.apiSendMsg(make_fail_rsp(msg, 0, "Sorry, you can't afford that."));
	}

	//
	// Charge them
	//

	var owner = this.container.pols_get_owner();
	if (!owner){
		log.info("No owner");
		return pc.apiSendMsg(make_fail_rsp(msg, 0, "I can't sell you that thing, since I can't find the owner of this location."));
	}

	this.is_for_sale = 0;
	this.broadcastStoreConfig();
	pc.announce_sound('PURCHASE_ITEM');

	total_cost = intval(msg.price) * count;
		
	pc.stats_remove_currants(total_cost, {type: 'store_buy', class_id: msg.class_tsid, store:'item_'+this.tsid, count: count});
	owner.prompts_add_simple(pc.linkifyLabel()+' just bought your '+this.getLabel()+' for '+pluralize(total_cost, 'currant', 'currants')+'.');

	// Do something with the money
	var pile = this.container.createAndReturnItem('pile_of_currants', 1, this.x, pc.y, 50, owner.tsid);
	if (pile){
		pile.setInstanceProp('balance', total_cost);
		pile.setInstanceProp('source', pc.linkifyLabel()+' purchasing your '+this.getLabel());
	}

	if (total_cost >= 1009){
		pc.achievements_grant('big_spender');
	}
		
	if (total_cost >= 2003){
		pc.achievements_grant('el_big_spenderino');
	}
		
	if (total_cost >= 5003){
		pc.achievements_grant('moneybags_magoo');
	}

	this.triggerUpdateCallback('furniture');
	this.addCallbackQueue('furniture_sale', {
		'seller_tsid': this.container.pols_get_owner().tsid,
		'buyer_tsid': pc.tsid,
		'item_class_tsid': msg.class_tsid,
		'total_price': total_cost
	});

	delete this.z;
	pc.location.geo_remove_plats_by_source(this.tsid);
	pc.addItemStack(this);

	return pc.apiSendMsg(make_ok_rsp(msg));
}

function getDescExtras(pc){
	var out = [];
	out.push([2, "This cabinet has 9 slots."]);

	// automatically generated source information...
	out.push([2, "This can be made with a <a href=\"\/items\/751\/\" glitch=\"item|construction_tool\">Construction Tool<\/a>."]);
	if (pc && !pc.skills_has("furnituremaking_1")) out.push([2, "You need to learn <a href=\"\/skills\/99\/\" glitch=\"skill|furnituremaking_1\">Furnituremaking I<\/a> to use a <a href=\"\/items\/751\/\" glitch=\"item|construction_tool\">Construction Tool<\/a>."]);
	if (pc && !(pc.skills_has("engineering_1") && pc.skills_has("furnituremaking_2"))) out.push([2, "The recipe for this will become available after you learn <a href=\"\/skills\/92\/\" glitch=\"skill|engineering_1\">Engineering I<\/a> and <a href=\"\/skills\/100\/\" glitch=\"skill|furnituremaking_2\">Furnituremaking II<\/a>."]);
	return out;
}

var tags = [
	"no_rube",
	"furniture",
	"furniture_interactable"
];


// this is a temporary fix, while the client doesn't load item defs
// from the XML files. we pass this data on login events.

function getAssetInfo(){
	return {
		'position': {"x":-44,"y":-128,"w":88,"h":129},
		'thumb': "iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM\/rhtAAAG6klEQVR42s2Y+09TZxjH+x\/4B2yJ\ny37bftjlN39ZmEvclsXIsrkNlJvWCyB3wQKFQmmBUgoFFKiAdqjcwUIFSksBKS3IXedkGKOQZVm2\n7I949n5feI4t0cR5zg87yZP30vec93Oe2\/uc6nSvuZ4tNsa9TrYXHbnbkQb3dtgx96byNNzgfBpp\nqHiVvIg4Duv+6wWIUXfuznBXDnlvFSrS236JOhxnX0p9GrlsKdRak0Tu5os0P1ZJDyYtNNFroMBg\nGfVfz45dL8RlT6O22hTZ9rVfcj9fsx3Svc21NmWdCw6W0Jq\/mh7N2unhbB2FRitoK+yUErlXRXMj\nJhrsyKE71zKprSaV5u8aaTtcT49mrPR4zibbZ0tO2t1op+3FFhruzKEWy2kpvt4iWvdXV+je9gLg\n9JCZNqer5Ea\/hhy0MmWV43V\/Jf0yW00hj5HGuvPp4UyN2LCE\/L2Fcu2qr4IWRktpI2CW65bGy2lj\n2kLPl5vJXHCCRrryxMuVqgf0e1ppK2QX2qiVGwqfkX0WjJeESQG1Pm2n6QGDnA+PlVHEWy4BMV7z\nm2lu+IqE7W7SS9COpsvqAVstiQoUA+6Zr5Z+W6iX45WpKtlnQECt+S20OWOT2sZatBFvmezPDBVJ\ns3vc+eoB+11ZEgggG8FaqU3WCvoAW\/Qa5RiAk7fzaXnCKNcDkDUNQL7vwYRJ9u9156oDXPVbnR53\ngTQLNrw\/UiQ3mL9brGyMjdjPgkNlYtMcCfhk3kZPF51yHsLrcA9+Q3+wI0sdIG4GIEzDpsWDowEf\nzlQrG4uUIYME2gLEzupV2QdwNCjWYk4zQDxUmnhfU2jh5HvmqlTAe1ozKNBXFBNEmF+ZLJd9Xifd\nQWSB4a5cbQE5ODD+49F1JXDgh+g3mZPkGC\/BkQ8QtJjje6Fd9Ic6NQLkgOCHo3223CLnZ4cNEhDi\nqjsr1zHAXj40vTI14Rl9Lg1NzG\/PoByh4TGj9DNs6r1loNmh0leaNzqaGTDsNYmUU6oNYLT\/SF+8\nXyf7yIHsAgAcdefFACIY2HdZq89XWvbhzTRyI08bQJgqGnB3vVVuFrn38rSYHiwXIDZFQ9E+uBWq\nU8CRpPH7uCg+NAGM1h4HBABlyvGUyBbzGzN7J8vBgGIoDpzlyQqp0VFxkvS4MuM1AeRIxOa8EWuV\nTRwaNSmAnJD5Xg40PCPQXyjbO9cyqNGcGKcKcKgzW9ECpw8AoA\/zRQNuzuxB+PuviMrFGqPxaG16\nf86RrbX4pHpAZHsOEk7S2BRjNn1I5L7NYI00I06deVEzBkWdyFpjbXKgTN4pkM\/QDBCpgc2JRMza\nYPOhKtkKN0lA\/D7ZU0AXU75Q6kaGwxitb\/84bKpK0gYQD0U+w0P5pIhOHZ6bufTDiSO0teCQiTs4\nUBiTqLmP+6G5QH+RvP+aqMBVA+K8ZD\/CZjh72e94HpvPDpfQdsQh\/Qsa4vVcD8JHEfEwOV5yabxM\nfJ\/o1QMOdGTLjWVSFlpkQJwgHNEADI+VywQM\/5oZLlVOnOggwr0c4T7hBl2N59UD7pVbRqVEio7G\nFV+lMsbm8MFxUbAujFUogOwOe8nbosyjsNUMECU6HP0g4LrYcEUk3WhA+OCKryqmamHA6AIXha0m\ngCiJuEBFRHJ6gSYAiN8wj686AOLDiItYTtoHK2n4pmaAPa4i6egAij6P5UdSwCr9EvMARAUNbXPV\nAiCs42jndMMmbqrNIIf11OG3BlydssbfcpljTo89E1mUAoBLeph42WeRH1Cc86BpjnS00SYPDhbT\n9auVpFNzbQRq4jw9DiUhcxFwsFqGBreQ3wZLlJfAbzhVNoPV8h6GY8DIRA012\/LVAwa97TFm5cQL\nf2OfxO8vhHkbTD\/KHIc5rgND+9UOw\/HLLk01UF35WfWAkQlbzAZKYRCsVgChNWgI\/zCMunNjjkIE\nDUc0Bxju72vPovqKJPWA+ONo3mOkwECJKEgNNDdSIsZlokAoE3WdKeY7ZTvipJbqFGqrTaV2Wyrd\ncF4gl\/2MPDHsZT9Rd\/M5mrtrpNkRI3U2nCNH5Wl1gPgv0D9o3elszCG7KfnvRnNSCFJrTAgVZR6P\nEYvh++02u363vjLJn5l2rAritKZ5XfUXQrdbc5aXfLW7y3777pLP9vtfT24Qyz9bN+NUQRov6w+n\n6xN2Pvnog8diWK1W3n\/vXdd3J76kb7763KPT6io3ZDiPxh1ZEl29Wjn+9VF7cmI8VRqz3Tab4ZAm\ngOlnEnI+\/fhDh+h+plaSEuLzs9KT\/9RpeZlKsvS5l1LzRPcdtZKuTzynTznZqimgxZSfCtHiWY6a\n4uTM86fcmgI21xvjIVo8Ky8z1frt8WO5uv\/rlZ2RUmAouJDxpuv\/BaIYCQwFGPnaAAAAAElFTkSu\nQmCC",
	};
};

var itemDef = {
	label		: this.label,
	name_plural	: this.name_plural,
	stackmax	: this.stackmax,
	is_hidden	: this.is_hidden,
	has_info	: this.has_info,
	adjusted_scale	: this.adjusted_scale,
	asset_swf_v	: "\/c2.glitch.bz\/items\/2012-07\/bag_furniture_wallcabinet-1343186102.swf",
	admin_props	: true,
	obey_physics	: false,
	in_background	: false,
	in_foreground	: false,
	has_status	: false,
	not_selectable	: false,
};

itemDef.oneclick_verb	= { // defined by bag_furniture_cabinet_base
	"id"				: "open",
	"label"				: "open",
	"ok_states"			: ["in_location"],
	"requires_target_pc"		: false,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_default"			: false,
	"is_emote"			: false,
	"sort_on"			: 53,
	"tooltip"			: "Inspect your storage",
	"is_drop_target"		: false,
	"disable_proximity"		: true,
	"conditions"			: function(pc, drop_stack){

		if (this.getContainerType() != 'street') return {state:null};
		if (!this.isOwner(pc)) return {state:null};
		if (this.isForSale()) return {state:'disabled', reason: "You can't add items while it's for sale."};
		return {state:'enabled'};
	},
};

;
if (this.consumable_label_single) itemDef.consumable_label_single = this.consumable_label_single;
if (this.consumable_label_plural) itemDef.consumable_label_plural = this.consumable_label_plural;

itemDef.verbs = {
};
itemDef.hasConditionalVerbs = 1;
itemDef.emote_verbs = {
};
itemDef.hasConditionalEmoteVerbs = 0;
itemDef.tags = [
	"no_rube",
	"furniture",
	"furniture_interactable"
];
itemDef.keys_in_location = {
	"p"	: "pickup",
	"u"	: "buy",
	"c"	: "change_style",
	"o"	: "dont_sell",
	"e"	: "edit_sale_price",
	"h"	: "flip",
	"n"	: "open",
	"t"	: "set_sale_price",
	"j"	: "upgrade"
};
itemDef.keys_in_pack = {
	"g"	: "give",
	"c"	: "change_style",
	"j"	: "upgrade"
};

log.info("bag_furniture_wallcabinet.js LOADED");

// generated ok 2012-11-02 15:57:48 by tim