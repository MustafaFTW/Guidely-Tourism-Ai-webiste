import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import placesData from '../../data/places.json';
import '../styles/searchpage.css'; // Using your existing CSS file

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Get search query from URL when component mounts or URL changes
  useEffect(() => {
    console.log("SearchPage mounted or location changed");
    const params = new URLSearchParams(location.search);
    const query = params.get('query');
    console.log("Search query from URL:", query); 
    
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [location.search]);

  // Perform search across all categories
  const performSearch = (query) => {
    console.log("Performing search for:", query);
    setLoading(true);
    
    try {
      // Check if placesData is properly loaded
      console.log("Places data structure:", {
        restaurants: placesData.restaurants?.length || 0,
        cafes: placesData.cafes?.length || 0,
        hotels: placesData.hotels?.length || 0,
        monuments: placesData.monuments?.length || 0,
      });
      
      // Combine all places from different categories with safeguards
      const allPlaces = [
        ...(placesData.restaurants || []).map(place => ({ ...place, category: 'restaurants' })),
        ...(placesData.cafes || []).map(place => ({ ...place, category: 'cafes' })),
        ...(placesData.hotels || []).map(place => ({ ...place, category: 'hotels' })),
        ...(placesData.monuments || []).map(place => ({ ...place, category: 'monuments' }))
      ];
      
      console.log("Total places to search:", allPlaces.length);
      
      // Filter by search query (case insensitive with improved matching)
      const results = allPlaces.filter(place => {
        // Get searchable fields with fallbacks for undefined values
        const name = place.name || place.hotel_name || '';
        const address = place.address || '';
        const description = place.description || '';
        
        const searchString = `${name} ${address} ${description}`.toLowerCase();
        const queryLower = query.toLowerCase();
        
        // Check for matches in any part of the searchable text
        return searchString.includes(queryLower);
      });
      
      console.log("Search results found:", results.length);
      if (results.length > 0) {
        console.log("First result:", {
          name: results[0].name || results[0].hotel_name,
          category: results[0].category
        });
      }
      
      // Sort by relevance (exact matches first, then by rating)
      results.sort((a, b) => {
        const nameA = a.name || a.hotel_name || '';
        const nameB = b.name || b.hotel_name || '';
        const queryLower = query.toLowerCase();
        
        // Exact name matches come first
        if (nameA.toLowerCase() === queryLower) return -1;
        if (nameB.toLowerCase() === queryLower) return 1;
        
        // Starts with matches come next
        const aStartsWith = nameA.toLowerCase().startsWith(queryLower);
        const bStartsWith = nameB.toLowerCase().startsWith(queryLower);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Then sort by rating (handling undefined ratings)
        return (b.rating || 0) - (a.rating || 0);
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error("Error during search:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Submitting search form with query:", searchQuery);
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      // No need to call performSearch here - the useEffect will trigger it
    }
  };

  // Get place name (works for both regular places and hotels)
  const getPlaceName = (place) => {
    const name = place.name || place.hotel_name || 'Unnamed Place';
    console.log("Getting place name:", name);
    return name;
  };

  // Get place image
  const getPlaceImage = (place) => {
    return place.image_1 || place.image || `https://source.unsplash.com/300x200/?${place.category}`;
  };

  // Get the category display name
  const getCategoryName = (category) => {
    const categories = {
      restaurants: 'Restaurant',
      cafes: 'Cafe',
      hotels: 'Hotel',
      monuments: 'Monument'
    };
    return categories[category] || 'Place';
  };

  return (
    <div className="search-page" style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px' 
    }}>
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

      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>Search Results</h1>
        
        {/* Search form */}
        <form onSubmit={handleSearchSubmit} style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', maxWidth: '600px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for restaurants, hotels, cafes, or monuments..."
              style={{
                flex: 1,
                padding: '12px 15px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px 0 0 8px',
                outline: 'none',
                color: '#333' // Ensure text is visible
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 25px',
                backgroundColor: '#4A00E0',
                color: 'white',
                border: 'none',
                borderRadius: '0 8px 8px 0',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Search
            </button>
          </div>
        </form>
        
        {/* Search results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div style={{
              border: '3px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '50%',
              borderTop: '3px solid #4A00E0',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Searching...</p>
          </div>
        ) : (
          <div>
            {searchQuery && (
              <p style={{ marginBottom: '20px' }}>
                {searchResults.length} results for "{searchQuery}"
              </p>
            )}
            
            {searchResults.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '50px 20px',
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}>
                <span style={{ fontSize: '50px', display: 'block', marginBottom: '20px' }}>🔍</span>
                <h2 style={{ marginBottom: '10px' }}>No places found</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  Try different keywords or explore our categories
                </p>
                <Link 
                  to="/nearby" 
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#4A00E0',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  Explore All Places
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '30px' }}>
                {searchResults.map((place, index) => (
                  <div 
                    key={place.id || place.hotel_id || index} 
                    style={{
                      display: 'flex',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onClick={() => {
                      const categoryPath = place.category;
                      navigate(`/nearby?category=${categoryPath}`);
                    }}
                  >
                    <div style={{ 
                      width: '200px',
                      minWidth: '200px',
                      position: 'relative'
                    }}>
                      <img
                        src={getPlaceImage(place)}
                        alt={getPlaceName(place)}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loops
                          e.target.src = `https://source.unsplash.com/300x200/?${place.category}`;
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {getCategoryName(place.category)}
                      </div>
                    </div>
                    
                    <div style={{ padding: '15px', flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '10px'
                      }}>
                        <h3 style={{ 
                          margin: '0', 
                          fontSize: '18px',
                          color: '#333',
                          fontWeight: '600' 
                        }}>
                          {getPlaceName(place)}
                        </h3>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '5px',
                          color: '#FFB400',
                          fontWeight: '600'
                        }}>
                          <span>⭐</span>
                          <span>
                            {place.rating || 'N/A'}
                            {place.category === 'hotels' ? '/10' : ''}
                          </span>
                        </div>
                      </div>
                      
                      <p style={{ 
                        margin: '0 0 15px 0',
                        color: '#666',
                        fontSize: '14px'
                      }}>
                        {place.address || 'Location information unavailable'}
                      </p>
                      
                      {place.description && (
                        <p style={{ 
                          margin: '0 0 15px 0',
                          color: '#333',
                          fontSize: '14px'
                        }}>
                          {place.description.length > 150 
                            ? `${place.description.substring(0, 150).replace(/â€"/g, "-")}...` 
                            : place.description.replace(/â€"/g, "-")}
                        </p>
                      )}
                      
                      <button 
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4A00E0',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // If it's a hotel with booking link, open that link
                          if (place.category === 'hotels' && place.booking_link) {
                            window.open(place.booking_link, '_blank');
                          } else {
                            // Otherwise navigate to the nearby page with correct category
                            navigate(`/nearby?category=${place.category}`);
                          }
                        }}
                      >
                        {place.category === 'hotels' ? 'Book Now' : 'Explore Similar Places'}
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          padding: '12px 24px',
          backgroundColor: 'transparent',
          border: '1px solid #4A00E0',
          borderRadius: '8px',
          color: '#4A00E0',
          cursor: 'pointer',
          fontWeight: '600',
          marginBottom: '40px',
          marginTop: '20px',
          transition: 'all 0.2s ease',
          fontSize: '16px'
        }}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        <span style={{ fontSize: '20px' }}>←</span>
        Back to Home
      </button>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SearchPage;