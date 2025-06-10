import React, { useState, useEffect } from 'react';
import API from '../../../api';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const PromoCodeManager = () => {
    const [promocodes, setPromocodes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discountPercentage: '',
        courseId: '',
        validFrom: '',
        validUntil: '',
        usageLimit: '',
        isActive: true
    });

    useEffect(() => {
        fetchPromocodes();
        fetchCourses();
    }, []);

    const fetchPromocodes = async () => {
        try {
            const response = await API.get('/admin/promocodes', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPromocodes(response.data.promocodes);
        } catch (error) {
            console.error('Error fetching promocodes:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await API.get('/courses/getAllCourses');
            setCourses(response.data.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPromo) {
                await API.put(`/admin/promocodes/${editingPromo._id}`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            } else {
                await API.post('/admin/promocodes', formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            }
            fetchPromocodes();
            resetForm();
        } catch (error) {
            console.error('Error saving promocode:', error);
        }
    };

    const handleDelete = async (promoId) => {
        if (window.confirm('Are you sure you want to delete this promocode?')) {
            try {
                await API.delete(`/admin/promocodes/${promoId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                fetchPromocodes();
            } catch (error) {
                console.error('Error deleting promocode:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discountPercentage: '',
            courseId: '',
            validFrom: '',
            validUntil: '',
            usageLimit: '',
            isActive: true
        });
        setEditingPromo(null);
    };

    const openEditModal = (promo) => {
        setEditingPromo(promo);
        setFormData({
            code: promo.code,
            discountPercentage: promo.discountPercentage,
            courseId: promo.courseId._id,
            validFrom: new Date(promo.validFrom).toISOString().split('T')[0],
            validUntil: new Date(promo.validUntil).toISOString().split('T')[0],
            usageLimit: promo.usageLimit,
            isActive: promo.isActive
        });
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Promocode Management</h2>
                
                {/* Form Section */}
                <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-6 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Promo Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Discount Percentage</label>
                                <input
                                    type="number"
                                    value={formData.discountPercentage}
                                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    required
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Course</label>
                                <select
                                    value={formData.courseId}
                                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    required
                                >
                                    <option value="">Select a course</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.courseName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Usage Limit</label>
                                <input
                                    type="number"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    required
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Valid From</label>
                                <input
                                    type="date"
                                    value={formData.validFrom}
                                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Valid Until</label>
                                <input
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div
                                type="submit"
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                            >
                                {editingPromo ? 'Update Promocode' : 'Add Promocode'}
                            </div>
                            {editingPromo && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Table Section */}
                <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usage</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {promocodes.map((promo) => (
                                    <tr key={promo._id} className="hover:bg-gray-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            {promo.code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            {promo.courseId.courseName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            {promo.discountPercentage}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            {promo.usedCount} / {promo.usageLimit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs ${promo.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {promo.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(promo)}
                                                    className="p-1 text-amber-500 hover:text-amber-400 transition-colors"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(promo._id)}
                                                    className="p-1 text-red-500 hover:text-red-400 transition-colors"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromoCodeManager; 