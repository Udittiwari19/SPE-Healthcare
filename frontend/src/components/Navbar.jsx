import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiLogOut, FiShield, FiHome, FiPackage } from 'react-icons/fi';

function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">
                    <span className="brand-icon">💊</span>
                    <span className="brand-text">HealthCare</span>
                </Link>
            </div>
            <div className="nav-links">
                <Link to="/" className="nav-link"><FiHome /> Dashboard</Link>
                <Link to="/cart" className="nav-link cart-link">
                    <FiShoppingCart />
                    Cart
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
                <Link to="/orders" className="nav-link"><FiPackage /> Orders</Link>
                {isAdmin() && (
                    <Link to="/admin" className="nav-link admin-link"><FiShield /> Admin</Link>
                )}
            </div>
            <div className="nav-user">
                <span className="user-badge">
                    <FiUser /> {user?.username}
                    <span className={`role-badge ${user?.role?.toLowerCase()}`}>{user?.role}</span>
                </span>
                <button className="btn-logout" onClick={handleLogout}>
                    <FiLogOut /> Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
