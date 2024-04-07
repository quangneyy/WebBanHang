const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    logo: String,
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
supplierSchema.virtual('published',{
    ref:'product',
    localField:'_id',
    foreignField:'supplier'
})
supplierSchema.set('toJSON',{virtuals:true})
supplierSchema.set('toObject',{virtuals:true})
module.exports = mongoose.model('supplier', supplierSchema);
