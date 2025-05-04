import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import placesData from '../../data/places.json';
import '../styles/searchpage.css';

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Get search query from URL when component mounts or URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query');
    
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [location.search]);

  // Perform search across all categories
  const performSearch = (query) => {
    setLoading(true);
    
    try {
      // Combine all places from different categories with safeguards
      const allPlaces = [
        ...(placesData.restaurants || []).map(place => ({ ...place, category: 'restaurants' })),
        ...(placesData.cafes || []).map(place => ({ ...place, category: 'cafes' })),
        ...(placesData.hotels || []).map(place => ({ ...place, category: 'hotels' })),
        ...(placesData.monuments || []).map(place => ({ ...place, category: 'monuments' }))
      ];
      
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
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Filter results by category
  const getFilteredResults = () => {
    if (activeFilter === 'all') return searchResults;
    return searchResults.filter(place => place.category === activeFilter);
  };

  // Count results by category
  const getCategoryCounts = () => {
    const counts = {
      all: searchResults.length,
      restaurants: 0,
      cafes: 0,
      hotels: 0,
      monuments: 0
    };
    
    searchResults.forEach(place => {
      if (counts[place.category] !== undefined) {
        counts[place.category]++;
      }
    });
    
    return counts;
  };

  // Get place name (works for both regular places and hotels)
  const getPlaceName = (place) => {
    return place.name || place.hotel_name || 'Unnamed Place';
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

  // Category icons mapping for consistent use
  const categoryIcons = {
    all: '🌟',
    restaurants: '🍽️',
    cafes: '☕',
    hotels: '🏨',
    monuments: '🏛️'
  };

  const categoryCounts = getCategoryCounts();
  const filteredResults = getFilteredResults();

  return (
    <div className="search-page">
      <div className="search-page-header">
        <div className="back-button-container">
          <button
            onClick={() => navigate('/')}
            className="back-button"
          >
            <span className="back-icon">←</span>
            <span>Back to Home</span>
          </button>
          
          <div className="header-divider"></div>
        </div>

        <h1 className="search-page-title">Search Results</h1>
        
        {/* Enhanced Search form */}
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for restaurants, hotels, cafes, or monuments..."
              className="search-input"
            />
            <button
              type="submit"
              className="search-button"
            >
              <span className="search-icon">🔍</span>
              <span className="search-button-text">Search</span>
            </button>
          </div>
        </form>
      </div>
      
      {/* Filter tabs */}
      {searchResults.length > 0 && (
        <div className="filter-tabs">
          {Object.entries(categoryIcons).map(([category, icon]) => (
            <button 
              key={category}
              className={`filter-tab ${activeFilter === category ? 'active' : ''}`}
              onClick={() => setActiveFilter(category)}
            >
              <span className="filter-icon">{icon}</span>
              <span className="filter-text">
                {category === 'all' ? 'All Results' : getCategoryName(category)}
              </span>
              <span className="filter-count">{categoryCounts[category] || 0}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Search results content */}
      <div className="search-results-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Searching for the best places in Cairo...</p>
          </div>
        ) : (
          <div className="results-content">
            {searchQuery && searchResults.length > 0 && (
              <p className="results-summary">
                Found <span className="results-count">{filteredResults.length}</span> 
                {activeFilter !== 'all' ? ` ${getCategoryName(activeFilter).toLowerCase()}s` : ' places'} 
                matching "<span className="query-highlight">{searchQuery}</span>"
              </p>
            )}
            
            {searchResults.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon"></div>
                <h2 className="no-results-title">No places found</h2>
                <p className="no-results-message">
                  Try different keywords or explore our categories
                </p>
                <Link to="/nearby" className="explore-button">
                  Explore All Places
                </Link>
              </div>
            ) : (
              <div className="search-results-list">
                {filteredResults.map((place, index) => (
                  <div 
                    key={place.id || place.hotel_id || index} 
                    className="result-card"
                    onClick={() => {
                      const categoryPath = place.category;
                      navigate(`/nearby?category=${categoryPath}`);
                    }}
                  >
                    <div className="result-image-container">
                      <img
                        src={getPlaceImage(place)}
                        alt={getPlaceName(place)}
                        className="result-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://source.unsplash.com/300x200/?${place.category}`;
                        }}
                      />
                      <div className="result-category-tag">
                        <span className="category-icon">{categoryIcons[place.category]}</span>
                        <span>{getCategoryName(place.category)}</span>
                      </div>
                    </div>
                    
                    <div className="result-content">
                      <div className="result-header">
                        <h3 className="result-title">{getPlaceName(place)}</h3>
                        <div className="result-rating">
                          <span className="rating-star">⭐</span>
                          <span className="rating-number">
                            {place.rating || 'N/A'}
                            {place.category === 'hotels' ? '/10' : ''}
                          </span>
                        </div>
                      </div>
                      
                      <p className="result-address">
                        <span className="address-icon">📍</span>
                        {place.address || 'Location information unavailable'}
                      </p>
                      
                      {place.description && (
                        <p className="result-description">
                          {place.description.length > 150 
                            ? `${place.description.substring(0, 150).replace(/â€"/g, "-")}...` 
                            : place.description.replace(/â€"/g, "-")}
                        </p>
                      )}
                      
                      <div className="result-features">
                        {place.features && place.features.slice(0, 3).map((feature, i) => (
                          <span key={i} className="feature-badge">{feature}</span>
                        ))}
                        
                        {place.amenities && place.amenities.slice(0, 3).map((amenity, i) => (
                          <span key={i} className="feature-badge">{amenity}</span>
                        ))}
                      </div>
                      
                      <button 
                        className="action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (place.category === 'hotels' && place.booking_link) {
                            window.open(place.booking_link, '_blank');
                          } else {
                            navigate(`/nearby?category=${place.category}`);
                          }
                        }}
                      >
                        {place.category === 'hotels' ? 'Book Now' : 'View Details'}
                        <span className="button-arrow">→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Bottom navigation */}
      {filteredResults.length > 5 && (
        <div className="bottom-navigation">
          <button
            onClick={() => navigate('/')}
            className="back-button large"
          >
            <span className="back-icon">←</span>
            <span>Back to Home</span>
          </button>
          
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="to-top-button"
          >
            <span className="to-top-icon">↑</span>
            <span>Back to Top</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;