import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/api';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';

function Cart() {
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const [placing, setPlacing] = useState(false);
    const [orderResult, setOrderResult] = useState(null);
    const navigate = useNavigate();

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setPlacing(true);

        const results = { success: [], failed: [] };

        for (const item of cart) {
            try {
                await placeOrder({ medicineId: item.id, quantity: item.quantity });
                results.success.push(item.name);
            } catch (err) {
                results.failed.push({
                    name: item.name,
                    reason: err.response?.data?.message || 'Order failed'
                });
            }
        }

        setPlacing(false);

        if (results.success.length > 0) {
            clearCart();
            setOrderResult(results);
            toast.success(`${results.success.length} order(s) placed successfully!`);
        }

        if (results.failed.length > 0) {
            results.failed.forEach(f => toast.error(`${f.name}: ${f.reason}`));
        }
    };

    if (orderResult) {
        return (
            <div className="cart-page">
                <div className="checkout-success">
                    <FiCheckCircle size={64} className="success-icon" />
                    <h2>Order Placed Successfully!</h2>
                    <p>{orderResult.success.length} item(s) ordered</p>
                    <div className="success-items">
                        {orderResult.success.map((name, i) => (
                            <span key={i} className="success-item">✓ {name}</span>
                        ))}
                    </div>
                    {orderResult.failed.length > 0 && (
                        <div className="failed-items">
                            <p className="failed-label">Failed items:</p>
                            {orderResult.failed.map((f, i) => (
                                <span key={i} className="failed-item">✗ {f.name} — {f.reason}</span>
                            ))}
                        </div>
                    )}
                    <div className="success-actions">
                        <button className="btn-primary" onClick={() => navigate('/orders')}>
                            View My Orders
                        </button>
                        <button className="btn-secondary" onClick={() => { setOrderResult(null); navigate('/'); }}>
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="page-header">
                <h1><FiShoppingCart /> My Cart</h1>
                <p>{cart.length} item(s) in your cart</p>
            </div>

            {cart.length === 0 ? (
                <div className="empty-state">
                    <FiShoppingCart size={48} />
                    <h3>Your cart is empty</h3>
                    <p>Browse medicines from the dashboard and add them to your cart</p>
                    <button className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }} onClick={() => navigate('/')}>
                        <FiArrowLeft /> Browse Medicines
                    </button>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cart.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-info">
                                    <h4>{item.name}</h4>
                                    <span className="cart-item-category">{item.category || 'General'}</span>
                                    <span className="cart-item-price">${item.price?.toFixed(2)} each</span>
                                </div>
                                <div className="cart-item-controls">
                                    <div className="qty-controls">
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            <FiMinus />
                                        </button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            disabled={item.quantity >= item.stock}
                                        >
                                            <FiPlus />
                                        </button>
                                    </div>
                                    <span className="cart-item-subtotal">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                    <button
                                        className="btn-icon delete"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <div className="cart-summary-row">
                            <span>Items ({cart.length})</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="cart-summary-row total">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button
                            className="btn-checkout"
                            onClick={handleCheckout}
                            disabled={placing}
                        >
                            {placing ? (
                                <><span className="spinner"></span> Placing Orders...</>
                            ) : (
                                <><FiCheckCircle /> Place Order — ${cartTotal.toFixed(2)}</>
                            )}
                        </button>
                        <button className="btn-clear-cart" onClick={clearCart}>
                            <FiTrash2 /> Clear Cart
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;
