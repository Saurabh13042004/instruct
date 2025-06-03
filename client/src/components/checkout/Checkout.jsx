import PromoCodeInput from './PromoCodeInput';

const Checkout = ({ course, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [promoData, setPromoData] = useState(null);

    const handlePromoApplied = (data) => {
        setPromoData(data);
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            const response = await api.post('/payment/create-order', {
                courseId: course._id,
                promocode: promoData?.code
            });

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: response.data.order.amount,
                currency: response.data.order.currency,
                name: "Your Company Name",
                description: `Purchase ${course.courseName}`,
                order_id: response.data.order.id,
                handler: async function (response) {
                    try {
                        await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            courseId: course._id,
                            promocodeId: response.data.appliedPromocode
                        });
                        toast.success('Payment successful!');
                        onClose();
                    } catch (error) {
                        toast.error('Payment verification failed');
                    }
                },
                prefill: {
                    name: "User Name",
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#2563EB"
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            toast.error('Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    const finalPrice = promoData ? promoData.discountedPrice : course.discountPrice;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Checkout</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FiX className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="border-b pb-4">
                        <h3 className="font-medium text-gray-900">{course.courseName}</h3>
                        <div className="mt-2 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-500">Original Price</p>
                                <p className="text-lg font-medium text-gray-900">₹{course.originalPrice}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Discounted Price</p>
                                <p className="text-lg font-medium text-gray-900">₹{course.discountPrice}</p>
                            </div>
                        </div>
                    </div>

                    <PromoCodeInput
                        courseId={course._id}
                        onPromoApplied={handlePromoApplied}
                    />

                    {promoData && (
                        <div className="bg-green-50 p-3 rounded-md">
                            <p className="text-sm text-green-800">
                                {promoData.discountPercentage}% discount applied
                            </p>
                        </div>
                    )}

                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                            <p className="text-lg font-medium">Final Price</p>
                            <p className="text-2xl font-bold text-blue-600">₹{finalPrice}</p>
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                            loading
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout; 