import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  label?: string;
  getDisplayValue?: (value: string) => string;
  className?: string;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select option",
  label,
  getDisplayValue,
  className = ""
}) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const filtered = options.filter(option => {
      const displayValue = getDisplayValue ? getDisplayValue(option) : option;
      return displayValue.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredOptions(filtered);
  }, [searchTerm, options, getDisplayValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  const displayValue = value ? (getDisplayValue ? getDisplayValue(value) : value) : '';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`block text-sm font-medium ${
          isDark ? 'text-gray-300' : 'text-light-700'
        } mb-2`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-full px-3 py-2 text-left ${
            isDark ? 'bg-dark-800/50 border-dark-600 text-white' : 'bg-light-100/70 border-light-300 text-light-900'
          } rounded-lg text-sm focus:ring-2 ${
            isDark ? 'focus:ring-purple-500 focus:border-purple-500' : 'focus:ring-brand-primary-500 focus:border-brand-primary-500'
          } transition-all duration-200 border flex items-center justify-between`}
        >
          <span className={displayValue ? '' : (isDark ? 'text-gray-500' : 'text-light-600')}>
            {displayValue || placeholder}
          </span>
          <div className="flex items-center space-x-1">
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className={`p-1 rounded ${
                  isDark ? 'hover:bg-dark-700' : 'hover:bg-light-200'
                } transition-colors`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className={`absolute z-10 w-full mt-1 ${
            isDark ? 'bg-dark-800 border-dark-600' : 'bg-white border-light-300'
          } border rounded-lg shadow-lg max-h-60 overflow-hidden`}>
            <div className="p-3 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className={`w-full pl-10 pr-4 py-2 text-sm ${
                    isDark ? 'bg-dark-700/50 border-dark-500 text-white placeholder-gray-400' : 'bg-light-100/70 border-light-300 text-light-900 placeholder-light-600'
                  } rounded-lg border focus:ring-2 ${
                    isDark ? 'focus:ring-purple-500 focus:border-purple-500' : 'focus:ring-brand-primary-500 focus:border-brand-primary-500'
                  } transition-all duration-200`}
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className={`px-4 py-3 text-sm ${
                  isDark ? 'text-gray-400' : 'text-light-600'
                } text-center`}>
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const displayText = getDisplayValue ? getDisplayValue(option) : option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`w-full px-4 py-2 text-left text-sm ${
                        value === option
                          ? (isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-brand-primary-100 text-brand-primary-700')
                          : (isDark ? 'text-white hover:bg-dark-700' : 'text-light-900 hover:bg-light-100')
                      } transition-colors`}
                    >
                      {displayText}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 