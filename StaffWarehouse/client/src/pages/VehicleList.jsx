import React from 'react';
import { useState, useEffect } from 'react';
import {
    ArrowUpDown,
    Truck,
    Clock,
    AlertCircle,
    ChevronRight,
    CircleEllipsis
} from 'lucide-react';
import { Header_Staff, Footer, ScrollToTop } from '../Layout';
import { getVehicle } from '../Services/VehicleService';
import SearchFilter from '../Component/SearchFilter'; // Import component SearchFilter
import { useNavigate } from "react-router-dom";
import {updateLocation} from "../Services/VehicleService";

// Component VehicleTable được định nghĩa bên ngoài
const VehicleTable = ({ 
    isLoading, 
    error, 
    retryFetch, 
    currentVehicles, 
    handleSort, 
    navigateToOrderList,
    handleUpdateLocation,
    getStatusIconAndClass,
    currentPage,
    totalPages,
    prevPage,
    nextPage,
    paginate
}) => {
    // Hiển thị loading
    if (isLoading) {
        return (
            <div className="row">
                <div className="col-lg-12">
                    <div className="progress-table">
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="sr-only">Đang tải...</span>
                            </div>
                            <p className="mt-3">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Hiển thị lỗi
    if (error) {
        return (
            <div className="row">
                <div className="col-lg-12">
                    <div className="progress-table">
                        <div className="text-center py-5">
                            <AlertCircle size={48} className="text-danger mb-3" />
                            <h5 className="text-danger">Có lỗi xảy ra</h5>
                            <p>{error}</p>
                            <button className="btn btn-primary" onClick={retryFetch}>
                                Thử lại
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="row">
            <div className="col-lg-12">
                <div className="progress-table">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="thead-light">
                                <tr>
                                    <th scope="col" className="sorting-header">
                                        Loại xe
                                    </th>
                                    <th scope="col">Biển số</th>
                                    <th scope="col" className="sorting-header" onClick={() => handleSort('status')}>
                                        <div className="flex items-center">
                                            Trạng thái
                                            <ArrowUpDown size={14} className="ml-1" />
                                        </div>
                                    </th>
                                    <th scope="col">Kho hiện tại</th>
                                    <th scope="col">Chi tiết</th>
                                    <th scope="col">Cập nhật</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentVehicles.length > 0 ? (
                                    currentVehicles.map((vehicle, index) => {
                                        if (!vehicle) return null;

                                        const { icon, className } = getStatusIconAndClass(vehicle.status);

                                        return (
                                            <tr
                                                key={vehicle.vehicleID || index}
                                                className="single-order-row"
                                                onClick={() => navigateToOrderList(vehicle.VehicleID)}
                                            >
                                                <td className="order-id font-weight-bold">{vehicle.Vehicle_type || 'N/A'}</td>
                                                <td className="customer">{vehicle.License_plate || 'N/A'}</td>
                                                <td className="from">{vehicle.status || 'N/A'}</td>
                                                <td className="to">{vehicle.Warehouse || 'N/A'}</td>
                                                <td className="details">
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigateToOrderList(vehicle.VehicleID);
                                                        }}
                                                        title="Danh sách đơn hàng"
                                                    >
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </td>
                                                <td className="details">
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={ async (e) => {
                                                            e.stopPropagation();
                                                            await handleUpdateLocation(vehicle.VehicleID);
                                                        }}
                                                        title="Cập nhật"
                                                    >
                                                        <CircleEllipsis size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">
                                            <p>Không tìm thấy xe nào</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination-wrapper mt-4">
                            <nav aria-label="Page navigation">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={prevPage} disabled={currentPage === 1}>
                                            Trước
                                        </button>
                                    </li>

                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => paginate(i + 1)}>
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}

                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={nextPage} disabled={currentPage === totalPages}>
                                            Sau
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [searchItem, setSearchItem] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [warehouse, setWarehouse] = useState('Tất cả');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })
    const vehiclesPerPage = 10;
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getVehicle();
            console.log('API response data:', data); // Debug log

            // Kiểm tra và xử lý dữ liệu trả về
            if (Array.isArray(data)) {
                setVehicles(data);
            } else if (data && Array.isArray(data.vehicles)) {
                setVehicles(data.vehicles);
            } else if (data && Array.isArray(data.data)) {
                setVehicles(data.data);
            } else {
                console.warn('Unexpected data format:', data);
                setVehicles([]);
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách đơn hàng:', err);
            setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
            setVehicles([]);
        } finally {
            setIsLoading(false);
        }
    };

    const retryFetch = () => {
        fetchVehicles();
    };

    //Hàm tìm kiếm
    const handleSearch = (e) => {
        setSearchItem(e.target.value);
        setCurrentPage(1);
    }

    //Hàm sắp xếp
    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
    }

    // Hàm update
    const handleUpdateLocation = async (vehicleId) => {
        try {
            await updateLocation(vehicleId);
            // Refresh danh sách xe
            fetchVehicles();
        } catch (error) {
            alert('Có lỗi xảy ra khi cập nhật vị trí xe');
        }
    }
    //Lọc theo kho hàng
    const handleWarehouse = (warehouseOptions) => {
        setWarehouse(warehouseOptions);
        setCurrentPage(1);
    }

    // Lọc và sắp xếp danh sách 
    const filteredVehicles = Array.isArray(vehicles) ? vehicles.filter(vehicle => {
        if (!vehicle) return false;

        const matchesSearch = (vehicle?.License_plate?.toString() || '').toLowerCase().includes(searchItem.toLowerCase());

        const matchesStatus = warehouse === 'Tất cả' ||
            vehicle?.Warehouse === warehouse;

        return matchesSearch && matchesStatus;
    })
        .sort((a, b) => {
            const aValue = a[sortConfig.key] || '';
            const bValue = b[sortConfig.key] || '';

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        }) : [];

    // Phân trang
    const indexOfLastVehicle = currentPage * vehiclesPerPage;
    const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
    const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
    const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

    // Xử lý chuyển trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => prev < totalPages ? prev + 1 : prev);
    const prevPage = () => setCurrentPage(prev => prev > 1 ? prev - 1 : prev);

    // Các vị trí kho hàng để lọc (dành cho vehicle)
    const warehouseOptions = [
        'Tất cả',
        'Kho Lạng Sơn',
        'Kho Quảng Ninh',
        'Kho Hải Phòng',
        'Kho Hà Nội',
        'Kho Hà Nam',
        'Kho Thanh Hóa',
        'Kho Nghệ An',
        'Kho Hà Tĩnh',
        'Kho Đà Nẵng',
        'Kho Quảng Nam',
        'Kho Khánh Hòa',
        'Kho Đắk Lắk',
        'Kho Bình Dương',
        'Kho Đồng Nai',
        'Kho Hồ Chí Minh'
    ];

    // Xử lý điều hướng đến trang chi tiết đơn hàng
    const navigateToOrderList = (vehicleID) => {
        navigate(`/vehicle/${vehicleID}`);
    };

    // Lấy biểu tượng và lớp CSS tương ứng với trạng thái
    const getStatusIconAndClass = (status) => {
        switch (status) {
            case 'Bảo trì':
                return { icon: <Clock size={18} />, className: 'status-processing' };
            case 'Hoạt động':
                return { icon: <Truck size={18} />, className: 'status-shipping' };
            case 'Ngừng hoạt động':
                return { icon: <AlertCircle size={18} />, className: 'status-pending' };
            default:
                return { icon: <Clock size={18} />, className: 'status-default' };
        }
    };

    return (
        <div className="wrapper">
            <Header_Staff />
            {/* Main Content */}
            <main className="categories-area section-padding30">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-tittle text-center mb-80">
                                <span>Quản lý xe vận chuyển</span>
                                <h2>Danh sách xe vận chuyển</h2>
                            </div>
                        </div>
                    </div>

                    {/* Sử dụng SearchFilter component với props cho Vehicle */}
                    <SearchFilter 
                        searchValue={searchItem}
                        onSearchChange={handleSearch}
                        searchPlaceholder="Nhập biển số xe"
                        searchTitle="Tìm kiếm xe"
                        
                        filterValue={warehouse}
                        onFilterChange={handleWarehouse}
                        filterOptions={warehouseOptions}
                        filterTitle="Lọc theo kho hiện tại"
                        
                        isLoading={isLoading}
                    />
                    
                    <VehicleTable 
                        isLoading={isLoading}
                        error={error}
                        retryFetch={retryFetch}
                        currentVehicles={currentVehicles}
                        handleSort={handleSort}
                        navigateToOrderList={navigateToOrderList}
                        handleUpdateLocation={handleUpdateLocation}
                        getStatusIconAndClass={getStatusIconAndClass}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        prevPage={prevPage}
                        nextPage={nextPage}
                        paginate={paginate}
                    />
                </div>
            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default VehicleList;