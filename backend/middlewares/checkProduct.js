    var Res = require('../helpers/ResRender');

    module.exports = async (req, res, next) => {
        try {
        let invalidProducts = req.body.items.filter(item => !item.quantity || item.quantity <= 0);
       
        if (invalidProducts.length > 0) {
            return Res.ResRend(res, false, { data: 'Số lượng sản phẩm phải lớn hơn 0', invalidProducts });
        }
        
        next(); 
        } catch (error) {
        Res.ResRend(res, false, error);
        }
    };
    