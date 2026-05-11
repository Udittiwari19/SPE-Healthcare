import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getMedicines, addMedicine, updateMedicine, deleteMedicine, getAllOrders } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiX } from 'react-icons/fi';

function AdminPanel() {
    const [medicines, setMedicines] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('medicines');
    const [showModal, setShowModal] = useState(false);
    const [editingMed, setEditingMed] = useState(null);
    const [form, setForm] = useState({
        name: '', description: '', price: '', stock: '', category: '', manufacturer: ''
    });

    useEffect(() => {
        fetchMedicines();
        fetchOrders();
    }, []);

    const fetchMedicines = async () => {
        try {
            const res = await getMedicines();
            setMedicines(res.data);
        } catch { toast.error('Failed to load medicines'); }
    };

    const fetchOrders = async () => {
        try {
            const res = await getAllOrders();
            setOrders(res.data);
        } catch { /* admin orders may fail if no orders */ }
    };

    const openModal = (med = null) => {
        if (med) {
            setEditingMed(med);
            setForm({
                name: med.name, description: med.description || '',
                price: med.price, stock: med.stock,
                category: med.category || '', manufacturer: med.manufacturer || ''
            });
        } else {
            setEditingMed(null);
            setForm({ name: '', description: '', price: '', stock: '', category: '', manufacturer: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
            if (editingMed) {
                await updateMedicine(editingMed.id, data);
                toast.success('Medicine updated');
            } else {
                await addMedicine(data);
                toast.success('Medicine added');
            }
            setShowModal(false);
            fetchMedicines();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this medicine?')) return;
        try {
            await deleteMedicine(id);
            toast.success('Medicine deleted');
            fetchMedicines();
        } catch { toast.error('Delete failed'); }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>⚙️ Admin Panel</h1>
                <p>Manage medicines and view all orders</p>
            </div>

            <div className="tabs">
                <button className={`tab ${activeTab === 'medicines' ? 'active' : ''}`}
                    onClick={() => setActiveTab('medicines')}>Medicines</button>
                <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}>All Orders</button>
            </div>

            {activeTab === 'medicines' && (
                <div className="admin-section">
                    <button className="btn-add" onClick={() => openModal()}>
                        <FiPlus /> Add Medicine
                    </button>
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th><th>Name</th><th>Category</th><th>Price</th>
                                    <th>Stock</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.map((med) => (
                                    <tr key={med.id}>
                                        <td>{med.id}</td>
                                        <td>{med.name}</td>
                                        <td>{med.category || '-'}</td>
                                        <td>${med.price?.toFixed(2)}</td>
                                        <td><span className={`stock-badge ${med.stock <= 5 ? 'low' : ''}`}>{med.stock}</span></td>
                                        <td>
                                            <button className="btn-icon edit" onClick={() => openModal(med)}><FiEdit2 /></button>
                                            <button className="btn-icon delete" onClick={() => handleDelete(med.id)}><FiTrash2 /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="admin-section">
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th><th>User</th><th>Medicine</th><th>Qty</th>
                                    <th>Total</th><th>Status</th><th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{order.user?.username}</td>
                                        <td>{order.medicine?.name}</td>
                                        <td>{order.quantity}</td>
                                        <td>${order.totalPrice?.toFixed(2)}</td>
                                        <td><span className={`status-badge ${order.status?.toLowerCase()}`}>{order.status}</span></td>
                                        <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingMed ? 'Edit Medicine' : 'Add Medicine'}</h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            <div className="form-row">
                                <input type="number" step="0.01" placeholder="Price *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                                <input type="number" placeholder="Stock *" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
                            </div>
                            <div className="form-row">
                                <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                                <input placeholder="Manufacturer" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
                            </div>
                            <button type="submit" className="btn-primary">{editingMed ? 'Update' : 'Add'} Medicine</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;
