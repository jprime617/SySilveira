import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const SearchableSelect = ({ options, value, onChange, placeholder, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch(''); // clear invalid searches
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.id === value);
  const displayValue = isOpen ? search : (selectedOption ? selectedOption.label : '');

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        className="form-input" 
        style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', cursor: 'text' }}
        onClick={() => setIsOpen(true)}
      >
        <input 
          type="text" 
          style={{ border: 'none', outline: 'none', width: '100%', padding: '0.2rem 0', backgroundColor: 'transparent' }}
          placeholder={selectedOption ? selectedOption.label : placeholder}
          value={displayValue}
          required={required && !value}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
        />
        <ChevronDown size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}/>
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', maxHeight: '250px', overflowY: 'auto', zIndex: 50, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <div 
                key={option.id}
                style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border)', backgroundColor: option.id === value ? '#F3F4F6' : '#fff' }}
                onClick={() => {
                  onChange(option.id);
                  setSearch('');
                  setIsOpen(false);
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = option.id === value ? '#F3F4F6' : '#fff'}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Nenhum resultado encontrado.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
