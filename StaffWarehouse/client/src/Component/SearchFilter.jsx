import React from "react";
import { Search, Filter } from "lucide-react";

const SearchFilter = ({
  // Props cho tìm kiếm
  searchValue,
  onSearchChange,
  searchPlaceholder = "Nhập từ khóa tìm kiếm",
  searchTitle = "Tìm kiếm",

  // Props cho lọc
  filterValue,
  onFilterChange,
  filterOptions = [],
  filterTitle = "Lọc",
  filterPlaceholder = "Chọn bộ lọc",

  // Props chung
  isLoading = false,

  // Props tùy chỉnh layout
  showSearch = true,
  showFilter = true,
  searchColSize = "col-lg-6 col-md-6",
  filterColSize = "col-lg-6 col-md-6",
}) => {
  return (
    <div className="row justify-content-between mb-30">
      {/* Search Section */}
      {showSearch && (
        <div className={searchColSize}>
          <div className="single-cat">
            <div className="cat-icon">
              <Search size={40} className="flaticon-shipped" />
            </div>
            <div className="cat-cap">
              <h5>{searchTitle}</h5>
              <div className="search-box">
                <div className="input-form">
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={onSearchChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      {showFilter && (
        <div className={filterColSize}>
          <div className="single-cat">
            <div className="cat-icon">
              <Filter size={40} className="flaticon-filter" />
            </div>
            <div className="cat-cap">
              <h5>{filterTitle}</h5>
              <div className="select-items">
                <select
                  className="nice-select"
                  value={filterValue}
                  onChange={(e) => onFilterChange(e.target.value)}
                  disabled={isLoading}
                >
                  {filterOptions.map((option, index) => (
                    <option
                      key={option.value || index}
                      value={option.value || option}
                    >
                      {option.label || option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
