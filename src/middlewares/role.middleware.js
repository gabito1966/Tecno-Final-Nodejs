export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.redirect("/auth/login");
        }

        const userRole = req.user.role;

        if (!userRole) {
            return res.status(403).send("No autorizado");
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).send("No autorizado");
        }

        next();
    };
};
