import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getMedicines, searchMedicines, placeOrder } from '../services/api';
import { FiSearch, FiShoppingCart, FiPackage, FiDollarSign } from 'react-icons/fi';

function Dashboard() {
    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const res = await getMedicines();
            setMedicines(res.data);
        } catch (err) {
            toast.error('Failed to load medicines');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearch(value);
        if (value.length > 1) {
            try {
                const res = await searchMedicines(value);
                setMedicines(res.data);
            } catch {
                // fallback
            }
        } else if (value === '') {
            fetchMedicines();
        }
    };

    const handleOrder = async (medicineId) => {
        try {
            await placeOrder({ medicineId, quantity: 1 });
            toast.success('Order placed successfully!');
            fetchMedicines(); // refresh stock
        } catch (err) {
            toast.error(err.response?.data?.message || 'Order failed');
        }
    };

    if (loading) return <div className="loading"><span className="spinner-lg"></span></div>;

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>🏥 Medicine Store</h1>
                <p>Browse and order medicines delivered to your doorstep</p>
            </div>

            <div className="search-bar">
                <FiSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search medicines..."
                    value={search}
                    onChange={handleSearch}
                />
            </div>

            {medicines.length === 0 ? (
                <div className="empty-state">
                    <FiPackage size={48} />
                    <h3>No medicines found</h3>
                    <p>Check back later or try a different search</p>
                </div>
            ) : (
                <div className="medicine-grid">
                    {medicines.map((med) => (
                        <div key={med.id} className="medicine-card">
                            <div className="card-header">
                                <span className="card-category">{med.category || 'General'}</span>
                            </div>
                            <h3 className="card-name">{med.name}</h3>
                            <p className="card-desc">{med.description || 'No description available'}</p>
                            <div className="card-meta">
                                <span className="card-manufacturer">{med.manufacturer || 'Unknown'}</span>
                            </div>
                            <div className="card-footer">
                                <span className="card-price"><FiDollarSign />{med.price?.toFixed(2)}</span>
                                <span className={`card-stock ${med.stock <= 5 ? 'low' : ''}`}>
                                    Stock: {med.stock}
                                </span>
                            </div>
                            <button
                                className="btn-order"
                                onClick={() => handleOrder(med.id)}
                                disabled={med.stock <= 0}
                            >
                                <FiShoppingCart /> {med.stock <= 0 ? 'Out of Stock' : 'Order Now'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
