// app/reports/page.js
"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [marketplaces, setMarketplaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    categoryId: "",
    marketplaceId: "",
    startDate: "",
    endDate: "",
    transactionType: "",
    search: "",
    sortBy: "",
  });

  useEffect(() => {
    fetchReports();
    fetchFiltersData();
  }, []);

  const fetchFiltersData = async () => {
    try {
      const [categoriesRes, marketplacesRes] = await Promise.all([
        fetch("/api/category"),
        fetch("/api/marketplace"),
      ]);

      const [categoriesData, marketplacesData] = await Promise.all([
        categoriesRes.json(),
        marketplacesRes.json(),
      ]);

      setCategories(categoriesData);
      setMarketplaces(marketplacesData);
    } catch (error) {
      console.error("Error fetching filters:", error);
      setError("Error loading filters");
    }
  };

  const fetchReports = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.categoryId)
        queryParams.append("categoryId", filters.categoryId);
      if (filters.marketplaceId)
        queryParams.append("marketplaceId", filters.marketplaceId);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.transactionType)
        queryParams.append("transactionType", filters.transactionType);

      const response = await fetch(`/api/stock/transaction?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      const data = await response.json();
      setReports(data);
    } catch (error) {
      setError("Error fetching reports");
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      categoryId: "",
      marketplaceId: "",
      startDate: "",
      endDate: "",
      transactionType: "",
      search: "",
      sortBy: "",
    });
  };

  const getFilteredAndSortedReports = () => {
    let filtered = [...reports];

    if (filters.search) {
      filtered = filtered.filter(
        (report) =>
          report.stockData?.modelName
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          report.modelName?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aStock = a.newAvailableQuantity || 0;
        const bStock = b.newAvailableQuantity || 0;
        return filters.sortBy === "high" ? bStock - aStock : aStock - bStock;
      });
    }

    return filtered;
  };

  const filteredReports = getFilteredAndSortedReports();

  const getTotalAvailableQuantity = () => {
    const latestStockQuantities = new Map();

    filteredReports.forEach((transaction) => {
      const stockId = transaction.stockId;

      if (
        !latestStockQuantities.has(stockId) ||
        new Date(transaction.date) >
          new Date(latestStockQuantities.get(stockId).date)
      ) {
        latestStockQuantities.set(stockId, {
          date: transaction.date,
          quantity: transaction.newAvailableQuantity || 0,
        });
      }
    });

    return Array.from(latestStockQuantities.values()).reduce(
      (total, stock) => total + stock.quantity,
      0
    );
  };

  const getTotalQuantityEntries = () => {
    return filteredReports.reduce(
      (total, transaction) => total + (transaction.quantity || 0),
      0
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Transaction Reports
          </h1>
          <p className="text-gray-500 mt-1">
            Track and analyze your inventory transactions
          </p>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Today's Transactions</p>
            <p className="text-2xl font-bold text-blue-600">
              {
                reports.filter(
                  (t) =>
                    new Date(t.date).toDateString() ===
                    new Date().toDateString()
                ).length
              }
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Quantity Entries</p>
            <p className="text-2xl font-bold text-green-600">
              {getTotalQuantityEntries()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="text-2xl font-bold text-purple-600">
              {filteredReports.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Search Stock
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by model name..."
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Sort by Stock
            </label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No Sorting</option>
              <option value="high">Highest to Lowest</option>
              <option value="low">Lowest to Highest</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Marketplace
            </label>
            <select
              name="marketplaceId"
              value={filters.marketplaceId}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">All Marketplaces</option>
              {marketplaces.map((marketplace) => (
                <option key={marketplace._id} value={marketplace._id}>
                  {marketplace.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Transaction Type
            </label>
            <select
              name="transactionType"
              value={filters.transactionType}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">All Types</option>
              <option value="sell">Sell</option>
              <option value="return">Return</option>
              <option value="initial">Initial Stock Entry</option>
            </select>
          </div>
        </div>

        {Object.values(filters).some(Boolean) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Updated Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marketplace
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Initial Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                      .replace(/\//g, "-")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.stockData?.modelName || transaction.modelName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.categoryData?.name || transaction.categoryName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.transactionType === "initial"
                      ? "-"
                      : transaction.marketplaceData?.name ||
                        transaction.marketplaceName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    
                      <div>
                      <div className="text-xs text-gray-500">
                        Previous: {transaction.stockData?.initialQuantity + transaction.quantity ||
                      transaction.initialQuantity }
                      </div>
                      <div className="font-medium">
                        New: {transaction.stockData?.initialQuantity ||
                      transaction.initialQuantity}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    <div>
                      <div className="text-xs text-gray-500">
                        Previous: {transaction.previousAvailableQuantity}
                      </div>
                      <div className="font-medium">
                        New: {transaction.newAvailableQuantity}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        transaction.transactionType === "sell"
                          ? "bg-red-100 text-red-800"
                          : transaction.transactionType === "return"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {transaction.transactionType === "sell"
                        ? "Sell"
                        : transaction.transactionType === "return"
                        ? "Return"
                        : "Initial Stock Entry"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.returnType === "customer"
                      ? "Customer Ok" 
                      : transaction.returnType === "courier"
                      ? "Courier"
                      : transaction.returnType || "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {transaction.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
