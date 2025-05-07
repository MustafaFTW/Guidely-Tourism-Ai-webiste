import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GuidlyLogo from './GuidlyLogo1.png';
import PyramidsImage from './pyramids.jpeg';
import placesData from '../../data/places.json';
import ChatbotComponent from '../common/Chatbot';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredPlaces, setFeaturedPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [recommendations, setRecommendations] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    preferredCategories: [],
    priceRange: [],
    previousVisits: []
  });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const categoryTabsRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const heroSectionRef = useRef(null);

  // Track window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 60) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate AI-based recommendations
  const generateRecommendations = () => {
    // Track user behavior (clicks, searches, views)
    const trackedBehavior = localStorage.getItem('userBehavior')
      ? JSON.parse(localStorage.getItem('userBehavior'))
      : { clicks: {}, searches: [], views: {} };

    // Combine all places
    const allPlaces = [
      ...placesData.restaurants.map(place => ({ ...place, category: 'restaurants' })),
      ...placesData.cafes.map(place => ({ ...place, category: 'cafes' })),
      ...placesData.hotels.map(place => ({ ...place, category: 'hotels' })),
      ...placesData.monuments.map(place => ({ ...place, category: 'monuments' }))
    ];

    // Weight and score places
    const scoredPlaces = allPlaces.map(place => {
      let score = place.rating * 10; // Base score from rating

      // Boost score based on behavior
      const placeId = place.id || place.hotel_id;
      if (trackedBehavior.clicks[placeId]) {
        score += trackedBehavior.clicks[placeId] * 5;
      }

      if (trackedBehavior.views[placeId]) {
        score += trackedBehavior.views[placeId] * 2;
      }

      // Boost score if category matches preferences
      if (userPreferences.preferredCategories.includes(place.category)) {
        score += 15;
      }

      return { ...place, recommendationScore: score };
    });

    // Sort by recommendation score and take top 6 or fewer based on screen size
    const numRecommendations = windowWidth < 768 ? 3 : windowWidth < 1024 ? 4 : 6;
    const topRecommendations = scoredPlaces
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, numRecommendations);

    setRecommendations(topRecommendations);
  };

  // Call this on component mount and when preferences change
  useEffect(() => {
    generateRecommendations();
  }, [userPreferences, windowWidth]);

  // Track user behavior
  const trackPlaceInteraction = (place, interactionType) => {
    const placeId = place.id || place.hotel_id;

    // Get existing behavior or initialize
    const behavior = localStorage.getItem('userBehavior')
      ? JSON.parse(localStorage.getItem('userBehavior'))
      : { clicks: {}, searches: [], views: {} };

    // Update behavior based on interaction type
    if (interactionType === 'click') {
      behavior.clicks[placeId] = (behavior.clicks[placeId] || 0) + 1;
    } else if (interactionType === 'view') {
      behavior.views[placeId] = (behavior.views[placeId] || 0) + 1;
    } else if (interactionType === 'search') {
      behavior.searches.push(place);
      // Limit search history
      if (behavior.searches.length > 20) {
        behavior.searches = behavior.searches.slice(-20);
      }
    }

    // Save updated behavior
    localStorage.setItem('userBehavior', JSON.stringify(behavior));

    // Regenerate recommendations after significant interactions
    if (interactionType === 'click') {
      generateRecommendations();
    }
  };

  // Get top-rated places across all categories
  useEffect(() => {
    // Get places for the active category
    let placesToShow = [];

    if (activeCategory === 'all') {
      // Combine all places from different categories
      placesToShow = [
        ...placesData.restaurants,
        ...placesData.cafes,
        ...placesData.hotels,
        ...placesData.monuments
      ];
    } else {
      // Get places from the selected category
      placesToShow = placesData[activeCategory] || [];
    }

    // Sort by rating (highest first) and limit based on screen size
    const numFeatured = windowWidth < 768 ? 3 : (windowWidth < 992 ? 4 : 6);
    const topPlaces = placesToShow
      .sort((a, b) => b.rating - a.rating)
      .slice(0, numFeatured);

    setFeaturedPlaces(topPlaces);
  }, [activeCategory, windowWidth]);

  // Function to handle the location button click
  const handleGetLocation = (place) => {
    // Track this interaction
    trackPlaceInteraction(place, 'click');

    // Check if this is a hotel
    if (place.hotel_name || place.booking_link) {
      if (place.booking_link) {
        window.open(place.booking_link, '_blank');
      } else {
        alert(`View details for ${place.hotel_name || place.name}`);
      }
    } else {
      alert(`Getting directions to ${place.name}`);
    }
  };

  // Function to handle chatbot icon click
  const handleChatbotClick = () => {
    setShowChatbot(prev => !prev);
    // Close mobile menu if open when chatbot is opened
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Function to handle explore button click
  const handleExploreClick = () => {
    if (activeCategory !== 'all') {
      navigate(`/nearby?category=${activeCategory}`);
    } else {
      navigate('/nearby');
    }
  };

  // Fixed handleSearchSubmit function
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      // Close mobile menu if open
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
      // Navigate to search page with query parameter
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      navigate(`/search?query=${encodedQuery}`);
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Get price range
  const getPriceRange = (priceLevel) => {
    return placesData.priceRanges?.[priceLevel] || 'N/A';
  };

  // Format price for hotels
  const formatPrice = (place) => {
    if (place.hotel_name && place.price_per_night) {
      return `${place.price_per_night} ${place.currency || 'EGP'}/night`;
    }
    return getPriceRange(place.priceLevel);
  };

  // Get place name (works for both regular places and hotels)
  const getPlaceName = (place) => {
    return place.name || place.hotel_name || 'Unnamed Place';
  };

  // Get place image (works for both regular places and hotels) 
  const getPlaceImage = (place) => {
    return place.image_1 || place.image || `https://source.unsplash.com/300x200/?${place.category || 'place'}`;
  };

  // Category tag colors
  const categoryColors = {
    restaurants: 'var(--color-restaurants)',
    cafes: 'var(--color-cafes)',
    hotels: 'var(--color-hotels)',
    monuments: 'var(--color-monuments)'
  };

  // Get correct category name
  const getCategoryName = (place) => {
    if (place.category) return place.category;
    if (place.hotel_name) return 'hotels';
    return activeCategory !== 'all' ? activeCategory : 'place';
  };

  // Check if place is a hotel
  const isHotel = (place) => {
    return place.hotel_name || getCategoryName(place) === 'hotels';
  };

  // Helper for scrolling category tabs to active tab
  useEffect(() => {
    if (categoryTabsRef.current) {
      const activeTab = categoryTabsRef.current.querySelector('.active');
      if (activeTab) {
        // Scroll the active tab into view with some padding
        const container = categoryTabsRef.current;
        const scrollPosition = activeTab.offsetLeft - (container.clientWidth / 2) + (activeTab.clientWidth / 2);
        container.scrollLeft = scrollPosition;
      }
    }
  }, [activeCategory]);

  // Function to determine if we should show the full footer or compact footer based on screen size
  const showCompactFooter = windowWidth < 768;

  // Category icons mapping for consistent use
  const categoryIcons = {
    all: '',
    restaurants: '',
    cafes: '',
    hotels: '',
    monuments: ''
  };

  return (
    <div className="home-page">
      {/* Header / Navigation */}
      <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="header-content">
          <div className="left-section">
            <div className="logo-container">
              <Link to="/">
                <img
                  src={GuidlyLogo}
                  alt="Guidely"
                  className="logo"
                />
              </Link>
            </div>

            {/* Search container only on desktop */}
            {windowWidth > 767 && (
              <form
                className={`search-container ${isSearchFocused ? 'search-focused' : ''}`}
                onSubmit={handleSearchSubmit}
              >
                <input
                  type="text"
                  placeholder={windowWidth < 480 ? "Search..." : "Search in Cairo..."}
                  className="search-input"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  aria-label="Search places"
                />
                <button
                  type="submit"
                  className="search-button"
                  aria-label="Search"
                >
                  <span className="search-icon"></span>
                </button>
              </form>
            )}
          </div>

          <div className="right-section">
            {/* Navigation links - only visible on larger screens */}
            {windowWidth > 767 && (
              <>
                <nav className="navigation">
                  <Link to="/" className="nav-link active">Home</Link>
                  <Link to="/nearby" className="nav-link">Explore</Link>
                  <Link to="/near-me" className="nav-link">Places Near Me</Link>
                  <button
                    onClick={handleChatbotClick}
                    className="nav-link chatbot-nav-button"
                  >
                    AI Assistant
                  </button>
                </nav>

                <div className="auth-links">
                  <Link to="/login" className="nav-link sign-in">Sign in</Link>
                  <Link to="/register" className="nav-link register">Register</Link>
                </div>
              </>
            )}

            {/* Mobile menu button with burger animation */}
            <button
              className={`menu-button ${isMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            // Remove this line
            // style={{ display: 'flex' }}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile menu with animation */}
        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <form
            onSubmit={handleSearchSubmit}
            className="mobile-search"
          >
            <input
              type="text"
              placeholder="Search places in Cairo..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              aria-label="Search for places in Cairo"
            />
            <button
              type="submit"
              aria-label="Search"
            >
              Search
            </button>
          </form>

          <nav className="mobile-navigation">
            <Link to="/" className="mobile-nav-link active">Home</Link>
            <Link to="/nearby" className="mobile-nav-link">Explore</Link>
            <Link to="/near-me" className="mobile-nav-link">Places Near Me</Link>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setShowChatbot(true);
              }}
              className="mobile-nav-link chatbot-mobile-button"
            >
              GuideAI
            </button>
          </nav>

          <div className="mobile-auth">
            <Link to="/login" className="mobile-sign-in">Sign in</Link>
            <Link to="/register" className="mobile-register">Register</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" ref={heroSectionRef} style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${PyramidsImage})`
      }}>
        <div className="overlay-gradient"></div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="ai-icon"></span>
              <span>AI-Powered</span>
            </div>
            <h1 className="hero-title">
              {windowWidth < 576 ? "Discover Cairo with AI" : "Discover Cairo with AI Assistance"}
            </h1>
            <p className="hero-subtitle">
              Your personal guide to the best restaurants, hotels, cafes, and monuments in Cairo - powered by AI
            </p>
            <div className="hero-buttons">
              <button
                className="explore-button"
                onClick={() => navigate('/nearby')}
              >
                <span>Explore All</span>
                <span className="button-icon"></span>
              </button>
              <button
                className="nearby-button"
                onClick={() => navigate('/near-me')}
              >
                <span>Places Near Me</span>
                <span className="button-icon">📍</span>
              </button>
              <button
                className="ai-assistant-button"
                onClick={handleChatbotClick}
              >
                <span>Ask AI Assistant</span>
                <span className="button-icon"></span>
              </button>
            </div>
          </div>
        </div>
        <div className="hero-bottom-fade"></div>
      </section>

      {/* Category tabs with horizontal scrolling */}
      <div className={`category-tabs ${scrolled ? 'tabs-fixed' : ''}`}>
        <div className="category-tabs-container" ref={categoryTabsRef}>
          {['all', 'restaurants', 'cafes', 'hotels', 'monuments'].map(category => (
            <button
              key={category}
              className={`category-tab ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              <span className="category-tab-icon">{categoryIcons[category]}</span>
              <span className="category-tab-text">
                {category === 'all' ? 'All ' : category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Modified Services Section JSX */}
      <section className="services-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">
              <span className="section-badge-icon">✨</span>
              <span>Top Rated</span>
            </div>
            <h2 className="section-title">
              {activeCategory === 'all'
                ? 'Top-Rated Places in Cairo'
                : `Top ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} in Cairo`}
            </h2>
            <p className="section-subtitle">
              Discover the highest-rated destinations handpicked for you
            </p>
          </div>

          <div className="service-cards">
            {featuredPlaces.map(place => (
              <div
                className="place-card"
                key={place.id || place.hotel_id}
                onMouseEnter={() => trackPlaceInteraction(place, 'view')}
              >
                <div className="card-image-container">
                  <img
                    src={getPlaceImage(place)}
                    alt={getPlaceName(place)}
                    className="card-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://source.unsplash.com/300x200/?${getCategoryName(place)}`;
                    }}
                  />

                  <div className="card-image-overlay"></div>

                  <div className="category-tag" style={{
                    backgroundColor: categoryColors[getCategoryName(place)] || 'var(--primary)'
                  }}>
                    {getCategoryName(place).charAt(0).toUpperCase() + getCategoryName(place).slice(1)}
                  </div>

                  <div className="rating-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#FFD700" className="rating-star-icon">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="rating-number">{place.rating}</span>
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="card-title">{getPlaceName(place)}</h3>

                  <div className="card-info">
                    <div className="price-info">
                      {formatPrice(place)}
                    </div>

                    <div className={`status-info ${place.openStatus?.includes('Open') ? 'open' : 'closed'}`}>
                      <span className="status-dot"></span>
                      {isHotel(place)
                        ? `${place.review_count || place.reviewCount || 0} reviews`
                        : (place.openStatus?.includes('Open') ? 'Open Now' : 'Closed')}
                    </div>
                  </div>

                  <div className="location-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="location-icon">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{place.address || place.distance}</span>
                  </div>

                  <button
                    className="directions-button"
                    onClick={() => handleGetLocation(place)}
                  >
                    <span>{isHotel(place) ? 'View Details' : 'Get Directions'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="view-all-container">
            <button
              className="view-all-button"
              onClick={handleExploreClick}
            >
              <span>View All {activeCategory === 'all'
                ? 'Places'
                : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="button-icon">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <div className="preferences-prompt">
            <div className="preferences-prompt-content">
              <div className="preferences-icon">🎯</div>
              <div className="preferences-text">
                <h4>Refine Your Recommendations</h4>
                <p>Answer a few questions to get more tailored suggestions</p>
              </div>
              <button
                className="preferences-button"
                onClick={() => setShowChatbot(true)}
              >
                <span>{windowWidth < 400 ? "Talk to AI" : "Talk to AI Assistant"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="preferences-arrow">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modified AI Recommendations Section */}
      {recommendations.length > 0 && (
        <section className="recommendations-section">
          <div className="section-container">
            <div className="section-header">
              <div className="section-badge ai-badge-section">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-badge-icon">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                  <path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>

              </div>
              <h2 className="section-title">Personalized For You</h2>
              <p className="section-subtitle">AI-powered recommendations based on your preferences and browsing history</p>
            </div>

            <div className="service-cards-container">
              <div className="service-cards recommendation-cards">
                {recommendations.map(place => (
                  <div
                    className="place-card recommendation-card"
                    key={place.id || place.hotel_id}
                    onClick={() => trackPlaceInteraction(place, 'click')}
                    onMouseEnter={() => trackPlaceInteraction(place, 'view')}
                  >
                    <div className="card-image-container">
                      <img
                        src={getPlaceImage(place)}
                        alt={getPlaceName(place)}
                        className="card-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://source.unsplash.com/300x200/?${getCategoryName(place)}`;
                        }}
                      />

                      <div className="card-image-overlay"></div>

                      <div className="category-tag" style={{
                        backgroundColor: categoryColors[getCategoryName(place)] || 'var(--primary)'
                      }}>
                        {getCategoryName(place).charAt(0).toUpperCase() + getCategoryName(place).slice(1)}
                      </div>

                      <div className="rating-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="rating-star">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span className="rating-number">{place.rating}</span>
                      </div>

                      <div className={`status-info ${place.openStatus?.includes('Open') ? 'open' : 'closed'}`}>
                        <span className="status-dot"></span>
                        {place.openStatus?.includes('Open') ? 'Open Now' : 'Closed'}
                      </div>

                      <button
                        className="directions-button"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent onClick
                          handleGetLocation(place);
                        }}
                      >
                        <span>{isHotel(place) ? 'View Details' : 'Get Directions'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </div>

                    <div className="card-content">
                      <h3 className="card-title">{getPlaceName(place)}</h3>

                      <div className="card-info">
                        <div className="price-info">
                          {formatPrice(place)}
                        </div>

                        <div className={`status-info ${place.openStatus?.includes('Open') ? 'open' : 'closed'}`}>
                          <span className="status-dot"></span>
                          {place.openStatus?.includes('Open') ? 'Open Now' : 'Closed'}
                        </div>
                      </div>

                      <div className="location-info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="location-icon">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{place.address || place.distance}</span>
                      </div>

                      {/* Added AI Reason explanation - conditional for mobile */}
                      {windowWidth > 480 && (
                        <div className="ai-reason">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ai-reason-icon">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                          <span className="ai-reason-text">
                            {place.category === 'restaurants' ? 'Matches your dining preferences' :
                              place.category === 'cafes' ? 'Similar to cafes you viewed' :
                                place.category === 'hotels' ? 'Based on your price range' :
                                  'Aligns with your interests'}
                          </span>
                        </div>
                      )}

                      <button
                        className="directions-button"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent onClick
                          handleGetLocation(place);
                        }}
                      >
                        <span>{isHotel(place) ? 'View Details' : 'Get Directions'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features section - Enhanced with animations */}
      <section class="features-section">
        <div class="section-container">
          <div class="section-header">
            <div class="section-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-badge-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Smart Features
            </div>
            <h2 class="section-title">Explore Cairo Like a Local</h2>
            <p class="section-subtitle">
              Discover the best places with our AI-powered tourism platform designed to make your exploration seamless and memorable.
            </p>
          </div>

          <div class="features-grid">
            <div class="feature-card feature-animate">
              <div class="feature-hover-effect"></div>
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h3 class="feature-title">Smart Recommendations</h3>
              <p class="feature-description">
                Our AI analyzes your preferences to suggest personalized places that match your unique taste and interests.
              </p>
            </div>

            <div class="feature-card feature-animate delay-100">
              <div class="feature-hover-effect"></div>
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <circle cx="9" cy="10" r="1"></circle>
                  <circle cx="12" cy="10" r="1"></circle>
                  <circle cx="15" cy="10" r="1"></circle>
                </svg>
              </div>
              <h3 class="feature-title">AI Assistant Chat</h3>
              <p class="feature-description">
                Get instant answers, directions, and local insights with our intelligent chatbot available 24/7.
              </p>
            </div>

            <div class="feature-card feature-animate delay-200">
              <div class="feature-hover-effect"></div>
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                </svg>
              </div>
              <h3 class="feature-title">Reliable Navigation</h3>
              <p class="feature-description">
                Get precise directions to any destination in Cairo with real-time updates and offline support.
              </p>
            </div>

            <div class="feature-card feature-animate delay-300">
              <div class="feature-hover-effect"></div>
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 4v6h-6"></path>
                  <path d="M1 20v-6h6"></path>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </div>
              <h3 class="feature-title">Real-time Updates</h3>
              <p class="feature-description">
                Stay informed with the latest information on opening hours, prices, and special events.
              </p>
            </div>

            <div class="feature-card feature-animate delay-400">
              <div class="feature-hover-effect"></div>
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="8" width="18" height="4" rx="1" ry="1"></rect>
                  <path d="M12 4v16M6 12v8M18 12v8M4 22h16"></path>
                  <path d="M4 6V4h16v2"></path>
                </svg>
              </div>
              <h3 class="feature-title">Cultural Insights</h3>
              <p class="feature-description">
                Learn about the rich history and cultural significance of each monument and landmark.
              </p>
            </div>

            <div class="feature-card feature-animate delay-500">
              <div class="feature-hover-effect"></div>
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <h3 class="feature-title">Offline Mode</h3>
              <p class="feature-description">
                Access your saved places and maps even without an internet connection during your travels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer section with newsletter heading - conditional rendering for mobile */}
      <footer className="footer">
        {!showCompactFooter ? (
          /* Full Footer for larger screens */
          <div className="footer-container">
            <div className="footer-column">
              <img src={GuidlyLogo} alt="Guidely Logo" className="footer-logo" />
              <p className="footer-description">
                Your AI-powered guide to exploring Cairo's best places, helping you discover the perfect spots tailored to your preferences.
              </p>
              <div className="social-links">
                <a href="#" className="social-link">📱</a>
                <a href="#" className="social-link">💬</a>
                <a href="#" className="social-link">📧</a>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/"><span className="footer-icon">→</span> Home</Link></li>
                <li><Link to="/nearby"><span className="footer-icon">→</span> Nearby Places</Link></li>
                <li><button onClick={handleChatbotClick} className="footer-button"><span className="footer-icon">→</span> GuideAI</button></li>
                <li><Link to="/login"><span className="footer-icon">→</span> Sign In</Link></li>
                <li><Link to="/register"><span className="footer-icon">→</span> Register</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Categories</h4>
              <ul className="footer-links">
                <li><Link to="/nearby?category=restaurants"><span className="footer-icon">🍽️</span> Restaurants</Link></li>
                <li><Link to="/nearby?category=cafes"><span className="footer-icon">☕</span> Cafes</Link></li>
                <li><Link to="/nearby?category=hotels"><span className="footer-icon">🏨</span> Hotels</Link></li>
                <li><Link to="/nearby?category=monuments"><span className="footer-icon">🏛️</span> Monuments</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Contact Us</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <span>123 Main Street, Cairo, Egypt</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <span>+20 12 345 6789</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <span>contact@guidely.com</span>
                </div>
              </div>

              <form className="newsletter-form">
                <h4 className="newsletter-heading">Get Cairo Travel Tips</h4>
                <div className="newsletter-input-group">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="newsletter-input"
                  />
                  <button className="newsletter-button">
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Compact Footer for mobile screens */
          <div className="mobile-footer-container">
            <div className="mobile-footer-top">
              <img src={GuidlyLogo} alt="Guidely Logo" className="footer-logo" />

              <div className="mobile-social-links">
                <a href="#" className="social-link">📱</a>
                <a href="#" className="social-link">💬</a>
                <a href="#" className="social-link">📧</a>
              </div>
            </div>

            <div className="mobile-footer-links">
              <div className="mobile-footer-column">
                <h4 className="footer-heading">Quick Links</h4>
                <ul className="footer-links">
                  <li><Link to="/"><span className="footer-icon">→</span> Home</Link></li>
                  <li><Link to="/nearby"><span className="footer-icon">→</span> Explore</Link></li>
                  <li><button onClick={handleChatbotClick} className="footer-button"><span className="footer-icon">→</span> GuideAI</button></li>
                </ul>
              </div>

              <div className="mobile-footer-column">
                <h4 className="footer-heading">Categories</h4>
                <ul className="footer-links">
                  <li><Link to="/nearby?category=restaurants"><span className="footer-icon">🍽️</span> Restaurants</Link></li>
                  <li><Link to="/nearby?category=cafes"><span className="footer-icon">☕</span> Cafes</Link></li>
                  <li><Link to="/nearby?category=hotels"><span className="footer-icon">🏨</span> Hotels</Link></li>
                </ul>
              </div>
            </div>

            <form className="mobile-newsletter-form">
              <h4 className="newsletter-heading">Get Cairo Travel Tips</h4>
              <div className="newsletter-input-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                />
                <button className="newsletter-button">
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="footer-bottom">
          <p>© 2025 Guidely — Your AI-Powered Cairo Guide. All rights reserved.</p>
        </div>
      </footer>

      {/* Chatbot Icon */}
      <div
        className={`chatbot-icon ${showChatbot ? 'active' : ''}`}
        onClick={handleChatbotClick}
        title="Chat with Guidly Assistant"
      >
        {showChatbot ? (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </div>

      {/* Chatbot Modal */}
      {showChatbot && (
        <div className="chatbot-modal">
          <div className="chatbot-header">
            <h3>Guidly AI Assistant</h3>
            <button
              className="close-chatbot-button"
              onClick={() => setShowChatbot(false)}
            >
              ✕
            </button>
          </div>
          <ChatbotComponent />
        </div>
      )}
    </div>
  );
};

export default Home;