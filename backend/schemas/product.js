var mongoose = require('mongoose');
var productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    productType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "productType"
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "supplier"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},{
    timestamps:true
});

module.exports = new mongoose.model('product', productSchema);
