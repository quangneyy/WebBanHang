var mongoose = require('mongoose');
var categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }, 
    isDeleted:{
        type:Boolean,
        default:false
    },
},{
    timestamps:true
});
categorySchema.virtual('category',{
    ref:'product',
    localField:'_id',
    foreignField:'category'
})
categorySchema.set('toJSON',{virtuals:true})
categorySchema.set('toObject',{virtuals:true})
module.exports = new mongoose.model('category', categorySchema);