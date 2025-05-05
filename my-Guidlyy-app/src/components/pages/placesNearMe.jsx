import React, { useState, useEffect } from 'react';

const BudgetFilter = ({ category = 'restaurants', value, onChange }) => {
  const [customBudget, setCustomBudget] = useState('');
  const [activeTab, setActiveTab] = useState('preset');
  const [currentCategory, setCurrentCategory] = useState(category);
  
  // When category changes, reset to preset view
  useEffect(() => {
    if (category !== currentCategory) {
      setActiveTab('preset');
      setCurrentCategory(category);
    }
  }, [category, currentCategory]);

  // Define price ranges for each category
  const priceRanges = {
    restaurants: {
      1: { label: 'Budget', range: 'Under 200 EGP' },
      2: { label: 'Casual', range: '200-500 EGP' },
      3: { label: 'Fine Dining', range: '500-1000 EGP' },
      4: { label: 'Premium', range: 'Over 1000 EGP' }
    },
    cafes: {
      1: { label: 'Budget', range: 'Under 100 EGP' },
      2: { label: 'Standard', range: '100-250 EGP' },
      3: { label: 'Premium', range: '250-500 EGP' },
      4: { label: 'Luxury', range: 'Over 500 EGP' }
    },
    hotels: {
      1: { label: 'Budget', range: 'Under 1200 EGP' },
      2: { label: 'Standard', range: '1200-2000 EGP' },
      3: { label: 'Premium', range: '2000-3000 EGP' },
      4: { label: 'Luxury', range: 'Over 3000 EGP' }
    },
    monuments: {
      0: { label: 'Free', range: 'Free Entry' },
      1: { label: 'Budget', range: 'Under 100 EGP' },
      2: { label: 'Standard', range: '100-300 EGP' },
      3: { label: 'Premium', range: '300-500 EGP' },
      4: { label: 'VIP', range: 'Over 500 EGP' }
    }
  };

  // Helper function to determine price level from amount
  const getPriceLevelFromAmount = (amount) => {
    if (!amount || isNaN(amount)) return null;
    
    const numAmount = Number(amount);
    
    if (category === 'restaurants') {
      if (numAmount < 200) return 1;
      if (numAmount >= 200 && numAmount < 500) return 2;
      if (numAmount >= 500 && numAmount < 1000) return 3;
      return 4;
    }
    else if (category === 'cafes') {
      if (numAmount < 100) return 1;
      if (numAmount >= 100 && numAmount < 250) return 2;
      if (numAmount >= 250 && numAmount < 500) return 3;
      return 4;
    }
    else if (category === 'hotels') {
      if (numAmount < 1200) return 1;
      if (numAmount >= 1200 && numAmount < 2000) return 2;
      if (numAmount >= 2000 && numAmount < 3000) return 3;
      return 4;
    }
    else if (category === 'monuments') {
      if (numAmount === 0) return 0;
      if (numAmount > 0 && numAmount < 100) return 1;
      if (numAmount >= 100 && numAmount < 300) return 2;
      if (numAmount >= 300 && numAmount < 500) return 3;
      return 4;
    }
    
    return 4; // Default to highest price point
  };

  // Handle preset budget selection
  const handlePresetSelect = (priceLevel) => {
    onChange(priceLevel);
  };

  // Handle custom budget input
  const handleCustomBudgetChange = (e) => {
    // Allow only numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomBudget(value);
  };

  // Handle apply button click
  const handleApplyCustomBudget = () => {
    const amount = parseInt(customBudget, 10);
    if (!isNaN(amount)) {
      const priceLevel = getPriceLevelFromAmount(amount);
      if (priceLevel !== null) {
        onChange(priceLevel);
      }
    }
  };

  // Get budget category name based on custom amount
  const getBudgetCategory = () => {
    if (!customBudget || isNaN(parseInt(customBudget, 10))) return null;
    
    const priceLevel = getPriceLevelFromAmount(parseInt(customBudget, 10));
    if (priceLevel === null) return null;
    
    return priceRanges[category][priceLevel]?.label || null;
  };

  // Get price range text based on custom amount
  const getPriceRangeText = () => {
    if (!customBudget || isNaN(parseInt(customBudget, 10))) return null;
    
    const priceLevel = getPriceLevelFromAmount(parseInt(customBudget, 10));
    if (priceLevel === null) return null;
    
    return priceRanges[category][priceLevel]?.range || null;
  };

  // Format for display
  const formatForDisplay = (amount) => {
    return new Intl.NumberFormat('en-EG').format(amount);
  };

  // Get budget icons based on category
  const getBudgetIcon = (priceLevel) => {
    // Different icons for each category and price level
    const icons = {
      restaurants: {
        1: '🍔', // Budget - burger
        2: '🍕', // Casual - pizza
        3: '🍣', // Fine Dining - sushi
        4: '🍷'  // Premium - wine
      },
      cafes: {
        1: '☕', // Budget - coffee
        2: '🧁', // Standard - cupcake
        3: '🍰', // Premium - cake
        4: '🍹'  // Luxury - cocktail
      },
      hotels: {
        1: '🏨', // Budget - hotel
        2: '🛌', // Standard - bed
        3: '🏖️', // Premium - beach
        4: '👑'  // Luxury - crown
      },
      monuments: {
        0: '🎟️', // Free - ticket
        1: '🏛️', // Budget - monument
        2: '🗿', // Standard - statue
        3: '🏰', // Premium - castle
        4: '💎'  // VIP - diamond
      }
    };
    
    return icons[category]?.[priceLevel] || '💰';
  };

  // Get gradient colors for each price level
  const getPriceGradient = (priceLevel) => {
    const gradients = {
      0: 'linear-gradient(135deg, #E0F7FA, #80DEEA)', // Free (cyan tones)
      1: 'linear-gradient(135deg, #E3F2FD, #90CAF9)', // Budget (light blue)
      2: 'linear-gradient(135deg, #EDE7F6, #B39DDB)', // Standard/Casual (light purple)
      3: 'linear-gradient(135deg, #F3E5F5, #CE93D8)', // Premium/Fine (purple pink)
      4: 'linear-gradient(135deg, #FFF8E1, #FFD54F)'  // Luxury/Premium (gold)
    };
    
    return gradients[priceLevel] || 'linear-gradient(135deg, #E1F5FE, #81D4FA)';
  };

  // Calculate the budget category and range for display
  const budgetCategory = getBudgetCategory();
  const priceRangeText = getPriceRangeText();

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ 
          fontSize: '1.1rem', 
          margin: '0',
          fontWeight: '600',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            backgroundColor: '#f0f0f0',
            color: '#4A00E0',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}>💲</span>
          Budget Range
        </h3>
        
        {/* Switch between preset and custom */}
        {activeTab === 'custom' && (
          <button
            onClick={() => setActiveTab('preset')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              border: 'none',
              borderRadius: '12px',
              backgroundColor: 'rgba(74, 0, 224, 0.1)',
              color: '#4A00E0',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '16px' }}>↺</span>
            Return to preset budgets
          </button>
        )}
      </div>
      
      {activeTab === 'preset' ? (
        /* CARD STYLE DESIGN: Horizontal cards with gradients and icons */
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '20px'
        }}>
          {Object.entries(priceRanges[category]).map(([level, { label, range }]) => {
            const isSelected = value === parseInt(level, 10);
            const priceLevel = parseInt(level, 10);
            const gradient = getPriceGradient(priceLevel);
            const icon = getBudgetIcon(priceLevel);
            
            return (
              <div
                key={level}
                onClick={() => handlePresetSelect(parseInt(level, 10))}
                style={{
                  flex: '1',
                  minWidth: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 10px',
                  background: isSelected ? gradient : 'white',
                  color: '#333',
                  border: isSelected ? 'none' : '1px solid #e0e0e0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isSelected 
                    ? '0 6px 15px rgba(0, 0, 0, 0.1)' 
                    : '0 2px 6px rgba(0, 0, 0, 0.05)',
                  transform: isSelected ? 'translateY(-2px)' : 'none'
                }}
              >
                {/* Icon circle */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: isSelected 
                    ? 'rgba(255, 255, 255, 0.9)' 
                    : 'rgba(74, 0, 224, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  fontSize: '18px',
                  transition: 'all 0.3s ease'
                }}>
                  {icon}
                </div>
                
                {/* Label */}
                <div style={{ 
                  fontWeight: '600', 
                  fontSize: '16px',
                  marginBottom: '2px',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {label}
                </div>
                
                {/* Price range */}
                <div style={{ 
                  fontSize: '13px', 
                  color: isSelected ? 'rgba(0, 0, 0, 0.7)' : '#666',
                  lineHeight: '1.3',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {range}
                </div>
                
                {/* Selected indicator */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    zIndex: 2
                  }}>
                    <span style={{
                      fontSize: '10px',
                      color: '#4A00E0',
                      fontWeight: 'bold'
                    }}>✓</span>
                  </div>
                )}
                
                {/* Decorative diagonal stripe */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    width: '150%',
                    height: '15px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'rotate(-45deg)',
                    top: '20px',
                    left: '-25%',
                    zIndex: 1
                  }}></div>
                )}
                
                {/* Another decorative diagonal stripe */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    width: '150%',
                    height: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'rotate(-45deg)',
                    bottom: '30px',
                    left: '-25%',
                    zIndex: 1
                  }}></div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Custom budget entry form with improved design */
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#444'
          }}>
            Enter your budget in EGP:
          </label>
          
          {/* Styled input container */}
          <div style={{ 
            position: 'relative', 
            marginBottom: '16px',
            display: 'flex',
            gap: '10px'
          }}>
            {/* Input field with money icon */}
            <div style={{ 
              position: 'relative',
              flexGrow: 1
            }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666',
                fontSize: '18px',
                pointerEvents: 'none'
              }}>
                💰
              </div>
              <input
                type="text"
                value={customBudget}
                onChange={handleCustomBudgetChange}
                style={{
                  width: '100%',
                  padding: '12px 60px 12px 40px', // Space for icon and EGP label
                  fontSize: '16px',
                  border: '1px solid #ccc',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  '&:focus': {
                    borderColor: '#4A00E0',
                    boxShadow: '0 0 0 3px rgba(74, 0, 224, 0.1)'
                  }
                }}
                placeholder="Amount"
              />
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666',
                pointerEvents: 'none'
              }}>
                EGP
              </span>
            </div>
            
            {/* Gradient apply button */}
            <button
              onClick={handleApplyCustomBudget}
              style={{
                background: 'linear-gradient(135deg, #4A00E0, #8E2DE2)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '0 20px',
                cursor: 'pointer',
                fontWeight: '500',
                flexShrink: 0,
                height: '44px', // Match input height
                boxShadow: '0 4px 10px rgba(142, 45, 226, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              Apply
            </button>
          </div>
          
          {/* Show current budget category if available */}
          {customBudget && !isNaN(parseInt(customBudget, 10)) && budgetCategory && (
            <div style={{
              background: 'rgba(74, 0, 224, 0.05)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderLeft: '4px solid #4A00E0'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(74, 0, 224, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                {getBudgetIcon(getPriceLevelFromAmount(parseInt(customBudget, 10)))}
              </div>
              
              <div>
                <p style={{ 
                  margin: '0', 
                  fontWeight: '600',
                  color: '#4A00E0',
                  fontSize: '15px'
                }}>
                  {formatForDisplay(customBudget)} EGP is currently applied
                </p>
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '14px', 
                  color: '#555'
                }}>
                  This falls under <strong>{budgetCategory}</strong> ({priceRangeText})
                </p>
              </div>
            </div>
          )}
          
          {/* Price ranges with styled list */}
          <div style={{
            backgroundColor: '#f9f9f9',
            borderRadius: '12px',
            padding: '12px 16px'
          }}>
            <p style={{ 
              fontWeight: '600', 
              color: '#333',
              margin: '0 0 10px 0',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ fontSize: '16px' }}>ℹ️</span>
              Price ranges for {category}:
            </p>
            
            <div style={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {Object.entries(priceRanges[category]).map(([level, { label, range }]) => (
                <div key={level} style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    backgroundColor: 'rgba(74, 0, 224, 0.08)',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px'
                  }}>
                    {getBudgetIcon(parseInt(level, 10))}
                  </span>
                  <span>
                    <strong>{label}:</strong> {range}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Option to switch to custom budget entry (only shown in preset mode) */}
      {activeTab === 'preset' && (
        <button
          onClick={() => setActiveTab('custom')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '12px',
            backgroundColor: 'white',
            border: '1px dashed rgba(74, 0, 224, 0.3)',
            borderRadius: '12px',
            color: '#4A00E0',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            gap: '8px'
          }}
        >
          <span style={{ 
            backgroundColor: 'rgba(74, 0, 224, 0.1)',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>+</span>
          <span>Enter custom budget</span>
        </button>
      )}
    </div>
  );
};

export default BudgetFilter;