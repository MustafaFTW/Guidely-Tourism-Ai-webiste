import React from 'react';

const BudgetFilter = ({ category, value, onChange }) => {
  // Egyptian pound price ranges with accurate values for each category
  const egyptianPriceRanges = {
    restaurants: {
      1: 'Under 200 EGP',
      2: '200-500 EGP',
      3: '500-1000 EGP',
      4: 'Over 1000 EGP'
    },
    cafes: {
      1: 'Under 100 EGP',
      2: '100-250 EGP',
      3: '250-500 EGP',
      4: 'Over 500 EGP'
    },
    hotels: {
      1: 'Under 1200 EGP',
      2: '1200-2000 EGP',
      3: '2000-3000 EGP',
      4: 'Over 3000 EGP'
    },
    monuments: {
      0: 'Free',
      1: 'Under 100 EGP',
      2: '100-300 EGP',
      3: '300-500 EGP',
      4: 'Over 500 EGP'
    }
  };

  // Price level labels that make sense for each category
  const priceLevelLabels = {
    restaurants: {
      1: 'Budget',
      2: 'Casual',
      3: 'Fine Dining',
      4: 'Premium'
    },
    cafes: {
      1: 'Basic',
      2: 'Standard',
      3: 'Premium',
      4: 'Luxury'
    },
    hotels: {
      1: 'Budget',
      2: 'Standard',
      3: 'Luxury',
      4: 'Premium'
    },
    monuments: {
      0: 'Free',
      1: 'Basic',
      2: 'Standard',
      3: 'Premium',
      4: 'VIP'
    }
  };

  // Get price description based on category and level
  const getPriceDescription = (cat, level) => {
    if (cat in egyptianPriceRanges && level in egyptianPriceRanges[cat]) {
      return egyptianPriceRanges[cat][level];
    }
    return level === 0 ? 'Free' : `Level ${level}`;
  };

  // Get label for price level
  const getPriceLevelLabel = (cat, level) => {
    if (cat in priceLevelLabels && level in priceLevelLabels[cat]) {
      return priceLevelLabels[cat][level];
    }
    return level === 0 ? 'Free' : `Level ${level}`;
  };

  return (
    <div className="budget-filter" style={{ marginTop: '25px' }}>
      <h3 style={{ 
         fontSize: '1.2rem',
        marginBottom: '15px',
        color: '#333',
        fontWeight: '600',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '8px'
      }}>Budget</h3>
      
      <div className="budget-options" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {/* Create buttons for each price level, including free (0) for monuments */}
        {(category === 'monuments' ? [0, 1, 2, 3, 4] : [1, 2, 3, 4]).map(level => (
          <button
            key={level}
            onClick={() => onChange(level)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 15px',
              backgroundColor: value === level ? '#1a73e8' : 'white',
              color: value === level ? 'white' : '#333',
              border: `1px solid ${value === level ? '#1a73e8' : '#ddd'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '110px',
              boxShadow: value === level ? `0 4px 8px rgba(0,0,0,0.15)` : 'none'
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
              {getPriceLevelLabel(category, level)}
            </span>
            <span style={{ fontSize: '13px', textAlign: 'center' }}>
              {getPriceDescription(category, level)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BudgetFilter;