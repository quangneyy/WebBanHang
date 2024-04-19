const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],    
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Đang chờ xử lý', 'Đang xử lý', 'Đã vận chuyển', 'Đã giao'],
        default: 'Đang chờ xử lý'
    },
    note:String,
    address:String,
    client:String,
    phonenum:String,
    des:String,
    type: String,
    shiptime:String,
    isPaid: {
        type: Boolean,
        default: false 
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = new mongoose.model('order', orderSchema);
