export const notFoundHandler = (req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
};

export const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: err.message || 'Error del servidor' });
};
