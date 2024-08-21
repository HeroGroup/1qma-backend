const mongoose = require("mongoose");
const { Schema } = mongoose;

const shopItemSchema = new Schema({
	type: String, // shopItemTypes: feature, asset, bundle
	details: Array, // [{ count: Number, title: String }]
	icon: String,
	realPrice: Number,
	currency: String, // default: $
	coinPrice: Object,
	isActive: Boolean, // true, false
});

module.exports = mongoose.model("ShopItem", shopItemSchema);
