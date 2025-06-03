import PromoCodeManager from '../../components/admin/PromoCodeManager';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`${
                                    activeTab === 'overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('courses')}
                                className={`${
                                    activeTab === 'courses'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Courses
                            </button>
                            <button
                                onClick={() => setActiveTab('promocodes')}
                                className={`${
                                    activeTab === 'promocodes'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Promocodes
                            </button>
                            {/* Add more tabs as needed */}
                        </nav>
                    </div>

                    <div className="mt-6">
                        {activeTab === 'overview' && (
                            <div>
                                {/* Overview content */}
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <div>
                                {/* Courses management content */}
                            </div>
                        )}

                        {activeTab === 'promocodes' && (
                            <PromoCodeManager />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 