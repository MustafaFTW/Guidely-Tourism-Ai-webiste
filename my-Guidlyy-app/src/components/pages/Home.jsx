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

  // Track window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    const numRecommendations = windowWidth < 768 ? 4 : 6;
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
    restaurants: '#FF5722',
    cafes: '#795548',
    hotels: '#2196F3',
    monuments: '#607D8B'
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
    all: '🌟',
    restaurants: '🍽️',
    cafes: '☕',
    hotels: '🏨',
    monuments: '🏛️'
  };

  return (
    <div className="home-page">
      {/* Header / Navigation */}
      <header className="header">
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
                  <span className="search-icon">🔍</span>
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

      {/* Hero Section with AI badge */}
      <section className="hero-section" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${PyramidsImage})`
      }}>
        <div className="overlay-gradient"></div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="ai-icon">🤖</span>
              <span>AI-Powered Tourism</span>
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
                Explore All
              </button>
              <button
                className="nearby-button"
                onClick={() => navigate('/near-me')}
              >
                Places Near Me
              </button>
              <button
                className="ai-assistant-button"
                onClick={handleChatbotClick}
              >
                Ask AI Assistant
              </button>
            </div>
          </div>
        </div>
        <div className="hero-bottom-fade"></div>
      </section>

      {/* Category tabs with horizontal scrolling */}
      <div className="category-tabs">
        <div className="category-tabs-container" ref={categoryTabsRef}>
          {['all', 'restaurants', 'cafes', 'hotels', 'monuments'].map(category => (
            <button
              key={category}
              className={`category-tab ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              <span className="category-tab-icon">{categoryIcons[category]}</span>
              <span className="category-tab-text">
                {category === 'all' ? 'All Places' : category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Services with top-rated badge */}
      <section className="services-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">
              <span className="section-badge-icon">⭐</span>
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

                  <div className="category-tag" style={{
                    backgroundColor: categoryColors[getCategoryName(place)] || '#4A00E0'
                  }}>
                    {getCategoryName(place).charAt(0).toUpperCase() + getCategoryName(place).slice(1)}
                  </div>

                  <div className="rating-badge">
                    <span className="rating-star">⭐</span>
                    <span className="rating-number">{place.rating}</span>
                    <span className="review-count">({place.review_count || place.reviewCount || 0})</span>
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
                    <span className="location-icon">📍</span>
                    <span>{place.address || place.distance}</span>
                  </div>

                  <button
                    className="directions-button"
                    onClick={() => handleGetLocation(place)}
                  >
                    <span>{isHotel(place) ? 'View Details' : 'Get Directions'}</span>
                    <span className="arrow-icon">→</span>
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
              View All {activeCategory === 'all'
                ? 'Places'
                : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
            </button>
          </div>
        </div>
      </section>

      {/* AI Recommendations Section with enhanced UI */}
      {recommendations.length > 0 && (
        <section className="recommendations-section">
          <div className="section-container">
            <div className="section-header">
              <div className="section-badge ai-badge-section">
                <span className="section-badge-icon">🤖</span>
                <span>AI Powered</span>
              </div>
              <h2 className="section-title">Personalized For You</h2>
              <p className="section-subtitle">AI-powered recommendations based on your preferences and browsing history</p>
            </div>

            <div className="service-cards">
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

                    <div className="category-tag" style={{
                      backgroundColor: categoryColors[getCategoryName(place)] || '#4A00E0'
                    }}>
                      {getCategoryName(place).charAt(0).toUpperCase() + getCategoryName(place).slice(1)}
                    </div>

                    <div className="rating-badge">
                      <span className="rating-star">⭐</span>
                      <span className="rating-number">{place.rating}</span>
                      <span className="review-count">({place.review_count || place.reviewCount || 0})</span>
                    </div>

                    {/* AI Badge */}
                    <div className="ai-badge">
                      <span className="ai-icon">🤖</span>
                      <span className="ai-text">{windowWidth < 400 ? "AI" : "AI Pick"}</span>
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
                      <span className="location-icon">📍</span>
                      <span>{place.address || place.distance}</span>
                    </div>

                    {/* Added AI Reason explanation - conditional for mobile */}
                    {windowWidth > 480 && (
                      <div className="ai-reason">
                        <span className="ai-reason-icon">💡</span>
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
                      <span className="arrow-icon">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Added preferences prompt */}
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
                  {windowWidth < 400 ? "Talk to AI" : "Talk to AI Assistant"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">
              <span className="section-badge-icon">✨</span>
              <span>Features</span>
            </div>
            <h2 className="section-title">Why Choose Guidely?</h2>
            <p className="section-subtitle">Discover how our AI-powered platform transforms your Cairo experience</p>
          </div>

          <div className="features-grid">
            {[
              {
                icon: '🔍',
                title: 'Smart Recommendations',
                description: 'Our AI analyzes your preferences to suggest personalized places that match your unique taste and interests.'
              },
              {
                icon: '🗣️',
                title: 'AI Assistant Chat',
                description: 'Get instant answers, directions, and local insights with our intelligent chatbot available 24/7.'
              },
              {
                icon: '📍',
                title: 'Reliable Navigation',
                description: 'Get precise directions to any destination in Cairo with real-time updates and offline support.'
              }
            ].map((feature, index) => (
              <div className="feature-card" key={index}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
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