import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { filterPlaces } from '../../data/placesdata';
import BudgetFilter from '../common/BudgetFilter';
import '../styles/nearbyme.css';

const NearbyPlaces = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('restaurants');
  const [budget, setBudget] = useState(4); // Default to all prices
  const [rating, setRating] = useState(3); // Default to 3+ stars
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);

  // Back button hover effect handlers
  const handleMouseOver = (e) => {
    e.currentTarget.style.backgroundColor = '#f8f4ff';
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
  };
  
  const handleMouseOut = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  };

  // Check for category parameter in URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam && Object.keys(categoryIcons).includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [location.search]);

  // Add local getPriceRange function
  const getPriceRange = (priceLevel) => {
    const priceRanges = {
      0: 'Free',
      1: 'Inexpensive',
      2: 'Moderate',
      3: 'Expensive',
      4: 'Very Expensive'
    };
    
    return priceRanges[priceLevel] || 'Price not available';
  };

  // Define Egyptian price ranges directly in the component
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

  // Modern category icons with consistent styles
  const categoryIcons = {
    restaurants: { icon: '🍽️', color: '#FF5722', bg: '#FFF3F0', label: 'Restaurants' },
    cafes: { icon: '☕', color: '#795548', bg: '#F1EBE9', label: 'Cafes' },
    hotels: { icon: '🏨', color: '#2196F3', bg: '#E3F2FD', label: 'Hotels' },
    monuments: { icon: '🏛️', color: '#607D8B', bg: '#ECEFF1', label: 'Monuments' }
  };

  // Filter places based on selected criteria
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Pass the current budget value to the filterPlaces function
      let filteredPlaces = filterPlaces(selectedCategory, budget, rating);
      
      // For hotels category, apply special rating filter for 0-10 scale
      if (selectedCategory === 'hotels') {
        filteredPlaces = filteredPlaces.filter(place => {
          if (!place.rating) return false;
          // Convert 0-10 scale to 0-5 scale for comparison
          const normalizedRating = (Number(place.rating) / 10) * 5;
          return normalizedRating >= rating;
        });
      }
      
      // Log the filtering parameters to verify they're being used
      console.log('Filtering with:', { category: selectedCategory, budget, rating });
      
      setPlaces(filteredPlaces);
      setLoading(false);
    }, 500);
  }, [selectedCategory, budget, rating]);

  // Handle budget change and properly update state
  const handleBudgetChange = (newBudget) => {
    console.log('Budget changed to:', newBudget);
    setBudget(newBudget);
  };

  // Updated to handle hotel booking links
  const handleGetLocation = (place) => {
    if (selectedCategory === 'hotels' && place.booking_link) {
      window.open(place.booking_link, '_blank');
    } else {
      alert(`Getting directions to ${place.name || place.hotel_name}`);
    }
  };

  // Function to get the correct image URL - updated for hotels
  const getImageUrl = (place) => {
    let imageSource = null;
    
    // Check for hotel-specific image field first
    if (place.image_1) {
      imageSource = place.image_1;
    }
    // Then try imageUrl
    else if (place.imageUrl) {
      imageSource = place.imageUrl;
    } 
    // Then try image
    else if (place.image) {
      imageSource = place.image;
    } 
    // Finally use fallback
    else {
      const category = selectedCategory;
      const placeName = place.name || place.hotel_name || '';
      imageSource = `https://source.unsplash.com/300x200/?${encodeURIComponent(category)},${encodeURIComponent(placeName.split(' ')[0])}`;
    }
    
    return imageSource;
  };

  // Get price display text based on category
  const getPriceDisplay = (place) => {
    // For hotels
    if (selectedCategory === 'hotels' && place.price_per_night) {
      return `${place.price_per_night} ${place.currency || 'EGP'}/night`;
    }
    
    // For non-hotels
    const priceLevel = place.priceLevel || 0;
    
    if (selectedCategory in egyptianPriceRanges && priceLevel in egyptianPriceRanges[selectedCategory]) {
      return egyptianPriceRanges[selectedCategory][priceLevel];
    }
    
    return getPriceRange(priceLevel);
  };

  // Get place name based on category
  const getPlaceName = (place) => {
    return place.name || place.hotel_name || 'Unnamed Place';
  };

  // Format rating display
  const formatRating = (rating) => {
    if (rating === undefined || rating === null) return 'N/A';
    const numRating = Number(rating);
    if (isNaN(numRating)) return 'N/A';
    return numRating % 1 === 0 ? numRating.toFixed(0) : numRating.toFixed(1);
  };

  // Debug display to show current filter values
  const debugStyle = {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    zIndex: 1000,
    display: 'none' // Set to 'block' for debugging
  };

  return (
    <div className="nearby-places-page" style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Debug display - visible when debugging */}
      <div style={debugStyle}>
        Category: {selectedCategory} | Budget: {budget} | Rating: {rating}
      </div>
      
      {/* Top back button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px' 
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: 'transparent',
            border: '1px solid #4A00E0',
            borderRadius: '8px',
            color: '#4A00E0',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <span style={{ fontSize: '18px' }}>←</span>
          Back to Home
        </button>
        
        <div style={{ 
          height: '1px', 
          backgroundColor: '#eee', 
          flex: '1', 
          margin: '0 20px' 
        }}></div>
      </div>
      
      {/* Modern header with gradient background */}
      <header style={{
        background: 'linear-gradient(135deg, #4A00E0, #8E2DE2)',
        borderRadius: '16px',
        padding: '32px 24px',
        color: 'white',
        marginBottom: '32px',
        boxShadow: '0 10px 25px rgba(142, 45, 226, 0.2)'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 8px 0',
          fontWeight: '700'
        }}>Explore {categoryIcons[selectedCategory].label} in Cairo</h1>
        <p style={{ 
          fontSize: '1.1rem', 
          margin: '0',
          opacity: '0.9' 
        }}>Find the best {categoryIcons[selectedCategory].label.toLowerCase()} that match your preferences</p>
      </header>
      
      {/* Filter cards with clean design */}
      <div style={{ marginBottom: '32px' }}>
        {/* Category filter - horizontal scrollable on mobile */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '1.2rem', 
            margin: '0 0 16px 0',
            fontWeight: '600',
            color: '#333'
          }}>What are you looking for?</h3>
          
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap',
            overflowX: 'auto',
            padding: '4px 0'
          }}>
            {Object.entries(categoryIcons).map(([category, {icon, color, bg, label}]) => (
              <button 
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: selectedCategory === category ? color : 'white',
                  color: selectedCategory === category ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '100px',
                  boxShadow: selectedCategory === category 
                    ? `0 8px 20px rgba(0,0,0,0.15)` 
                    : '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <span style={{ 
                  fontSize: '28px',
                  marginBottom: '8px',
                  background: selectedCategory === category ? 'rgba(255,255,255,0.2)' : bg,
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  {icon}
                </span>
                <span style={{ fontWeight: '500' }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Filter panel with cleaner layout */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Budget filter component with explicit onChange handler */}
          <div style={{ 
            flex: '1', 
            minWidth: '250px',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <BudgetFilter 
              category={selectedCategory} 
              value={budget} 
              onChange={handleBudgetChange}
            />
          </div>
          
          {/* Rating filter component */}
          <div style={{ 
            flex: '1', 
            minWidth: '250px',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ 
              fontSize: '1.1rem', 
              marginTop: '0',
              marginBottom: '16px',
              fontWeight: '600',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Minimum Rating</span>
              {selectedCategory === 'hotels' && (
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: '400',
                  color: '#666',
                  backgroundColor: '#f0f0f0',
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  Hotels rated 0-10
                </span>
              )}
            </h3>
            
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: '10px' 
            }}>
              {selectedCategory === 'hotels' ? (
                // Hotel-specific rating buttons (6, 7, 8, 9)
                [6, 7, 8, 9].map(star => (
                  <button 
                    key={star} 
                    onClick={() => {
                      // Convert hotel 10-scale rating to 5-scale for internal use
                      const normalizedRating = (star / 10) * 5;
                      setRating(normalizedRating);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '10px 16px',
                      backgroundColor: (rating * 2).toFixed(1) >= star ? '#FFC107' : 'white',
                      color: (rating * 2).toFixed(1) >= star ? '#333' : '#555',
                      border: `1px solid ${(rating * 2).toFixed(1) >= star ? '#FFC107' : '#e0e0e0'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexGrow: '1',
                      fontWeight: (rating * 2).toFixed(1) >= star ? '600' : '400'
                    }}
                  >
                    <span style={{ fontWeight: '500' }}>
                      {star}+ 
                    </span>
                    <span style={{ fontSize: '18px' }}>⭐</span>
                  </button>
                ))
              ) : (
                // Regular rating buttons for other categories
                [3, 3.5, 4, 4.5, 5].map(star => (
                  <button 
                    key={star} 
                    onClick={() => setRating(star)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '10px 16px',
                      backgroundColor: rating >= star ? '#FFC107' : 'white',
                      color: rating >= star ? '#333' : '#555',
                      border: `1px solid ${rating >= star ? '#FFC107' : '#e0e0e0'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexGrow: '1',
                      fontWeight: rating >= star ? '600' : '400'
                    }}
                  >
                    <span style={{ fontWeight: '500' }}>
                      {star}+
                    </span>
                    <span style={{ fontSize: '18px' }}>⭐</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Results section with modern card design */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            margin: '0',
            color: '#333',
            fontWeight: '600'
          }}>
            {loading ? 'Finding places...' : `${categoryIcons[selectedCategory].label} Near You`}
          </h2>
          
          {!loading && places.length > 0 && (
            <span style={{ color: '#555' }}>
              {places.length} {places.length === 1 ? 'place' : 'places'} found
            </span>
          )}
        </div>
        
        {loading ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            padding: '60px 0',
            color: '#555'
          }}>
            <div style={{
              border: '3px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '50%',
              borderTop: '3px solid #4A00E0',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }}></div>
            <p style={{ margin: '0', fontWeight: '500' }}>Searching nearby places...</p>
          </div>
        ) : places.length === 0 ? (
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontSize: '50px', marginBottom: '16px', display: 'block' }}>🔍</span>
            <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No places match your criteria</h3>
            <p style={{ margin: '0', color: '#666' }}>Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '40px'
          }}>
            {places.map(place => (
              <div key={place.id || place.hotel_id} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ 
                  position: 'relative',
                  paddingTop: '65%' // Aspect ratio
                }}>
                  <img 
                    src={getImageUrl(place)} 
                    alt={getPlaceName(place)} 
                    style={{ 
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loops
                      const fallback = `https://source.unsplash.com/300x200/?${encodeURIComponent(selectedCategory)}`;
                      e.target.src = fallback;
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    <span>⭐</span>
                    {selectedCategory === 'hotels' ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ 
                          color: '#FFC107', 
                          fontWeight: '700'
                        }}>{formatRating(place.rating)}</span>
                        <span style={{ 
                          fontSize: '12px', 
                          marginLeft: '2px',
                          opacity: '0.9' 
                        }}>/10</span>
                      </div>
                    ) : (
                      <span>{formatRating(place.rating)}</span>
                    )}
                  </div>
                </div>
                
                <div style={{ 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{ 
                      margin: '0',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#333'
                    }}>{getPlaceName(place)}</h3>
                    <span style={{ 
                      fontWeight: '500',
                      color: '#4A00E0'
                    }}>{getPriceDisplay(place)}</span>
                  </div>
                  
                  {/* Show description for hotels */}
                  {selectedCategory === 'hotels' && place.description && (
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      margin: '8px 0',
                      lineHeight: '1.4'
                    }}>
                      {place.description.length > 100 
                        ? `${place.description.substring(0, 100).replace(/â€"/g, "-")}...` 
                        : place.description.replace(/â€"/g, "-")}
                    </p>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginTop: 'auto',
                    paddingTop: '16px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      fontSize: '14px',
                      color: '#555'
                    }}>
                      <span style={{ fontSize: '16px' }}>📍</span>
                      <span>{place.address || place.distance || 'Location unavailable'}</span>
                    </div>
                    
                    {selectedCategory === 'hotels' ? (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        fontSize: '14px',
                        color: '#555'
                      }}>
                        <span style={{ fontSize: '16px' }}>👥</span>
                        <span>{place.review_count || 0} reviews</span>
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        fontSize: '14px',
                        color: place.openStatus && place.openStatus.includes('Open') ? '#4CAF50' : '#F44336',
                        fontWeight: '500'
                      }}>
                        <span style={{ fontSize: '16px' }}>⏱️</span>
                        <span>{place.openStatus || 'Status unknown'}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleGetLocation(place)}
                  style={{
                    backgroundColor: '#4A00E0',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    width: '100%',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>
                    {selectedCategory === 'hotels' ? 'Book Now' : 'Get Directions'}
                  </span>
                  <span style={{ fontSize: '18px' }}>→</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom back button - kept for convenience */}
      <button 
        onClick={() => navigate('/')}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '32px',
          marginBottom: '40px',
          padding: '12px 20px',
          backgroundColor: 'transparent',
          border: '1px solid #4A00E0',
          borderRadius: '8px',
          color: '#4A00E0',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontWeight: '500'
        }}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        <span style={{ fontSize: '18px' }}>←</span>
        Back to Home
      </button>

      {/* CSS animation for loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NearbyPlaces;