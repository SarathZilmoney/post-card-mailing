import React, { useState } from 'react';
import { Plus, Search, Filter, Upload, Download, Eye, Edit, Trash2, User, MailIcon } from 'lucide-react';
import { useAddresses } from '../hooks/useAddresses';
import { useTheme } from '../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export const Addresses: React.FC = () => {
  const { addresses, total, loading, deleteAddress, importAddresses } = useAddresses();
  const { isDark } = useTheme();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const filteredAddresses = addresses.filter(address => {
    const matchesSearch = 
      (address.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (address.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (address.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      address.street.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || address.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || address.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(id);
        toast.success('Address deleted successfully');
      } catch (error) {
        toast.error('Failed to delete address');
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importAddresses(file);
      toast.success(`Imported ${imported.length} addresses successfully`);
    } catch (error) {
      toast.error('Failed to import addresses');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'invalid':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'blacklisted':
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'manual':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'csv':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'outscrapper':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="animate-pulse">
          <div className={`h-8 ${
            isDark ? 'bg-dark-600' : 'bg-gray-300'
          } rounded w-1/4 mb-4`}></div>
          <div className={`h-4 ${
            isDark ? 'bg-dark-600' : 'bg-gray-300'
          } rounded w-1/2`}></div>
        </div>
        <div className={`${
          isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
        } rounded-2xl p-6`}>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-16 ${
                isDark ? 'bg-dark-600' : 'bg-gray-300'
              } rounded`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Address Lists</h1>
          <p className={`mt-2 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage your mailing addresses and contact lists
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <label className={`inline-flex items-center px-4 py-2 border ${
            isDark 
              ? 'border-dark-600 text-gray-300 bg-dark-800/50 hover:bg-dark-700/50 hover:text-white' 
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900'
          } text-sm font-medium rounded-lg cursor-pointer transition-all duration-200`}>
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button className={`inline-flex items-center px-4 py-2 border ${
            isDark 
              ? 'border-dark-600 text-gray-300 bg-dark-800/50 hover:bg-dark-700/50 hover:text-white' 
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900'
          } text-sm font-medium rounded-lg transition-all duration-200`}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 btn-gradient text-sm font-medium rounded-lg text-white">
            <User className="h-4 w-4 mr-2" />
            Add Address
          </button>
        </div>
      </div>

      <div className={`${
        isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
      } rounded-2xl`}>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              } h-4 w-4`} />
              <input
                type="text"
                placeholder="Search addresses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 ${
                  isDark 
                    ? 'bg-dark-800/50 border-dark-600 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200`}
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${
                  isDark 
                    ? 'bg-dark-800/50 border-dark-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="validated">Validated</option>
                <option value="invalid">Invalid</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className={`${
                  isDark 
                    ? 'bg-dark-800/50 border-dark-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200`}
              >
                <option value="all">All Sources</option>
                <option value="manual">Manual</option>
                <option value="csv">CSV Import</option>
                <option value="outscrapper">Outscrapper</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={`${
              isDark ? 'bg-dark-800/50' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Contact
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Address
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Source
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Added
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDark ? 'divide-dark-600' : 'divide-gray-200'
            }`}>
              {filteredAddresses.map((address) => (
                <tr key={address.id} className={`${
                  isDark ? 'hover:bg-dark-800/30' : 'hover:bg-gray-50'
                } transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {address.businessName || 'N/A'}
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {address.contactName || address.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {address.street}
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {address.city}, {address.state} {address.zipCode}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {address.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(address.status)}`}>
                      {address.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSourceColor(address.source)}`}>
                      {address.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {formatDistanceToNow(new Date(address.createdAt), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className={`${
                        isDark 
                          ? 'text-gray-400 hover:text-purple-400 hover:bg-dark-800/50' 
                          : 'text-gray-500 hover:text-purple-500 hover:bg-gray-100'
                      } p-1 rounded transition-colors`}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className={`${
                        isDark 
                          ? 'text-gray-400 hover:text-purple-400 hover:bg-dark-800/50' 
                          : 'text-gray-500 hover:text-purple-500 hover:bg-gray-100'
                      } p-1 rounded transition-colors`}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className={`${
                          isDark 
                            ? 'text-gray-400 hover:text-red-400 hover:bg-dark-800/50' 
                            : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'
                        } p-1 rounded transition-colors`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAddresses.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MailIcon className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className={`text-lg font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              } mb-2`}>No addresses found</h3>
              <p className={`${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } mb-6`}>
                {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first address'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};