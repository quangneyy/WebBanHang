module.exports = function (...roles) {
    return function (req, res, next) {
        let userRole = req.user.role.map(e => e.toLowerCase());
        let requiredRole = roles.map(e => e.toLowerCase());
        let result = userRole.filter(
            e => requiredRole.includes(e)
        )
        if (result.length > 0) {
            next()
            return;
        }
        res.status(403).send("Bạn không có quyền")
    }
}