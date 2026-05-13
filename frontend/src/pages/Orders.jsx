import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getUserOrders } from '../services/api';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await getUserOrders();
            setOrders(res.data);
        } catch (err) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <FiClock className="status-pending" />;
            case 'CONFIRMED': return <FiCheckCircle className="status-confirmed" />;
            case 'SHIPPED': return <FiPackage className="status-shipped" />;
            case 'DELIVERED': return <FiCheckCircle className="status-delivered" />;
            case 'CANCELLED': return <FiXCircle className="status-cancelled" />;
            default: return <FiClock />;
        }
    };

    if (loading) return <div className="loading"><span className="spinner-lg"></span></div>;

    return (
        <div className="orders-page">
            <div className="page-header">
                <h1><FiPackage /> My Orders</h1>
                <p>Track your medicine orders</p>
            </div>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <FiPackage size={48} />
                    <h3>No orders yet</h3>
                    <p>Start shopping from the dashboard!</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <span className="order-id">Order #{order.id}</span>
                                <span className={`order-status ${order.status?.toLowerCase()}`}>
                                    {getStatusIcon(order.status)} {order.status}
                                </span>
                            </div>
                            <div className="order-body">
                                <div className="order-info">
                                    <h4>{order.medicine?.name || 'Medicine'}</h4>
                                    <p>Quantity: {order.quantity}</p>
                                </div>
                                <div className="order-price">
                                    <span className="price-label">Total</span>
                                    <span className="price-value">${order.totalPrice?.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="order-footer">
                                <span className="order-date">
                                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    }) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Orders;
