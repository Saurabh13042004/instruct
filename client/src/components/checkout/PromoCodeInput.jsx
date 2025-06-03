import React, { useState } from 'react';
import { api } from '../../api';
import { toast } from 'react-hot-toast';
import { FiTag, FiCheck, FiX } from 'react-icons/fi';

const PromoCodeInput = ({ courseId, onPromoApplied }) => {
    const [promoCode, setPromoCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState(null);

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) {
            toast.error('Please enter a promocode');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/courses/validate-promocode', {
                code: promoCode,
                courseId
            });

            if (response.data.success) {
                setAppliedPromo({
                    code: promoCode,
                    discountPercentage: response.data.discountPercentage,
                    discountedPrice: response.data.discountedPrice
                });
                onPromoApplied(response.data);
                toast.success('Promocode applied successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid promocode');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        onPromoApplied(null);
    };

    return (
        <div className="mt-4">
            {!appliedPromo ? (
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiTag className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            placeholder="Enter promocode"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <button
                        onClick={handleApplyPromo}
                        disabled={isLoading}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                            isLoading
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                        {isLoading ? 'Applying...' : 'Apply'}
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                    <div className="flex items-center space-x-2">
                        <FiCheck className="h-5 w-5 text-green-500" />
                        <div>
                            <p className="text-sm font-medium text-green-800">
                                Promocode {appliedPromo.code} applied
                            </p>
                            <p className="text-xs text-green-600">
                                {appliedPromo.discountPercentage}% off applied
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRemovePromo}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PromoCodeInput; 