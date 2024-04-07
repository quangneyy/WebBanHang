var mongoose = require('mongoose');
var productTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }, 
    isDeleted: {
        type: Boolean,
        default: false
    }
},{
    timestamps:true
});
productTypeSchema.virtual('published',{
    ref:'product',
    localField:'_id',
    foreignField:'productType'
})
productTypeSchema.set('toJSON',{virtuals:true})
productTypeSchema.set('toObject',{virtuals:true})
module.exports = new mongoose.model('productType', productTypeSchema);
