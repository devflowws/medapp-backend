const { Message, Order } = require('../models');

exports.sendMessage = async (req, res, next) => {
  try {
    const { order_id, expediteur_type, expediteur_id, contenu } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Commande non trouvée' });
    }

    const message = await Message.create({
      order_id,
      expediteur_type,
      expediteur_id,
      contenu
    });

    // TODO: Déclencher un événement Socket.io pour la messagerie en temps réel
    const { getIo } = require('../sockets');
    try {
      const io = getIo();
      io.to(`order_${order_id}`).emit('newMessage', message);
    } catch (err) {
      console.log("Socket.io emit failed (might not be initialized):", err.message);
    }

    res.status(201).json({ status: 'success', data: message });
  } catch (error) {
    next(error);
  }
};

exports.getOrderMessages = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const messages = await Message.findAll({
      where: { order_id: orderId },
      order: [['created_at', 'ASC']]
    });

    res.json({ status: 'success', data: messages });
  } catch (error) {
    next(error);
  }
};
