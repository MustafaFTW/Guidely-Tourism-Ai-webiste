import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import placesData from '../../data/places.json';
import '../styles/Chatbot.css';

const ChatbotComponent = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I can help you find places in Cairo. What are you looking for?' }
  ]);
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('budget'); // 'budget' or 'rating'
  const [selectedCategory, setSelectedCategory] = useState('hotels');
  const [selectedBudget, setSelectedBudget] = useState(4); // Default to highest budget
  const [selectedRating, setSelectedRating] = useState(3); // Default to 3 stars
  
  // Categories with emojis for better UI
  const categories = {
    hotels: { name: 'Hotels', emoji: '🏨' },
    restaurants: { name: 'Restaurants', emoji: '🍽️' },
    cafes: { name: 'Cafes', emoji: '☕' },
    monuments: { name: 'Monuments', emoji: '🏛️' }
  };

  // Combine all places
  const allPlaces = [
    ...placesData.restaurants.map(place => ({ ...place, category: 'restaurants' })),
    ...placesData.cafes.map(place => ({ ...place, category: 'cafes' })),
    ...placesData.hotels.map(place => ({ ...place, category: 'hotels' })),
    ...placesData.monuments.map(place => ({ ...place, category: 'monuments' }))
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showFilters]);

  // Price data
  const priceData = {
    restaurants: {
      ranges: {
        1: 'Under 200 EGP',
        2: '200-500 EGP',
        3: '500-1000 EGP',
        4: 'Over 1000 EGP'
      },
      labels: {
        1: 'Budget',
        2: 'Casual',
        3: 'Fine Dining',
        4: 'Premium'
      }
    },
    cafes: {
      ranges: {
        1: 'Under 100 EGP',
        2: '100-250 EGP',
        3: '250-500 EGP',
        4: 'Over 500 EGP'
      },
      labels: {
        1: 'Basic',
        2: 'Standard',
        3: 'Premium',
        4: 'Luxury'
      }
    },
    hotels: {
      ranges: {
        1: 'Under 1200 EGP',
        2: '1200-2000 EGP',
        3: '2000-3000 EGP',
        4: 'Over 3000 EGP'
      },
      labels: {
        1: 'Budget',
        2: 'Standard',
        3: 'Luxury',
        4: 'Premium'
      }
    },
    monuments: {
      ranges: {
        0: 'Free',
        1: 'Under 100 EGP',
        2: '100-300 EGP',
        3: '300-500 EGP',
        4: 'Over 500 EGP'
      },
      labels: {
        0: 'Free',
        1: 'Basic',
        2: 'Standard',
        3: 'Premium',
        4: 'VIP'
      }
    }
  };

  // Apply filters and navigate to results
  const applyFilters = () => {
    setShowFilters(false);
    
    const budgetLabel = priceData[selectedCategory].labels[selectedBudget];
    const budgetRange = priceData[selectedCategory].ranges[selectedBudget];
    
    const botResponse = {
      sender: 'bot',
      text: `🔍 Finding ${categories[selectedCategory].emoji} ${categories[selectedCategory].name} with ${budgetLabel} pricing (${budgetRange}) and minimum rating of ${selectedRating}⭐...`
    };
    
    setMessages(prev => [...prev, botResponse]);
    
    // Navigate with all filter parameters
    navigate(`/near-me?category=${selectedCategory}&budget=${selectedBudget}&rating=${selectedRating}`);
  };

  // Function to filter places based on current criteria and show in chat
  const showFilteredResults = () => {
    // Get places matching the selected category
    let filteredPlaces = allPlaces.filter(place => place.category === selectedCategory);
    
    // Apply budget filter based on category price ranges
    if (selectedCategory === 'hotels') {
      if (selectedBudget === 1) filteredPlaces = filteredPlaces.filter(p => p.price_per_night <= 1200);
      else if (selectedBudget === 2) filteredPlaces = filteredPlaces.filter(p => p.price_per_night > 1200 && p.price_per_night <= 2000);
      else if (selectedBudget === 3) filteredPlaces = filteredPlaces.filter(p => p.price_per_night > 2000 && p.price_per_night <= 3000);
      else if (selectedBudget === 4) filteredPlaces = filteredPlaces.filter(p => p.price_per_night > 3000);
    } else {
      filteredPlaces = filteredPlaces.filter(p => {
        // If priceLevel is not defined, default to showing it (assume it matches any budget)
        if (p.priceLevel === undefined) return true;
        
        // For monuments with free option
        if (selectedCategory === 'monuments' && selectedBudget === 0) {
          return p.priceLevel === 0;
        }
        
        return p.priceLevel <= selectedBudget;
      });
    }
    
    // Apply rating filter
    filteredPlaces = filteredPlaces.filter(p => p.rating >= selectedRating);
    
    // Sort by rating (highest first)
    filteredPlaces.sort((a, b) => b.rating - a.rating);
    
    // Take top 5 results
    const topResults = filteredPlaces.slice(0, 5);
    
    // Get descriptive text for filters
    const budgetLabel = priceData[selectedCategory].labels[selectedBudget];
    const budgetRange = priceData[selectedCategory].ranges[selectedBudget];
    
    if (topResults.length > 0) {
      const botResponse = {
        sender: 'bot',
        text: `I found ${topResults.length} ${categories[selectedCategory].emoji} ${categories[selectedCategory].name} with ${budgetLabel} pricing (${budgetRange}) and minimum rating of ${selectedRating}⭐:`,
        results: topResults
      };
      setMessages(prev => [...prev, botResponse]);
    } else {
      const botResponse = {
        sender: 'bot',
        text: `I couldn't find any ${categories[selectedCategory].name} matching your criteria. Try adjusting your filters.`,
      };
      setMessages(prev => [...prev, botResponse]);
    }
    
    // Hide filters after showing results
    setShowFilters(false);
  };

  // Function to detect query type and set appropriate filters
  const detectQueryIntent = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    let category = null;
    let budgetLevel = 4; // Default to highest
    let ratingLevel = 3; // Default to 3 stars
    
    // Detect category
    if (lowerInput.includes('hotel') || lowerInput.includes('stay') || lowerInput.includes('accommodation')) {
      category = 'hotels';
    } else if (lowerInput.includes('restaurant') || lowerInput.includes('food') || lowerInput.includes('eat')) {
      category = 'restaurants';
    } else if (lowerInput.includes('cafe') || lowerInput.includes('coffee') || lowerInput.includes('tea')) {
      category = 'cafes';
    } else if (lowerInput.includes('monument') || lowerInput.includes('attraction') || lowerInput.includes('pyramid') || lowerInput.includes('museum')) {
      category = 'monuments';
    }
    
    // Detect budget
    if (lowerInput.includes('cheap') || lowerInput.includes('budget') || lowerInput.includes('affordable') || lowerInput.includes('inexpensive')) {
      budgetLevel = 1;
    } else if (lowerInput.includes('moderate') || lowerInput.includes('medium') || lowerInput.includes('standard')) {
      budgetLevel = 2;
    } else if (lowerInput.includes('luxury') || lowerInput.includes('premium') || lowerInput.includes('expensive')) {
      budgetLevel = 4;
    }
    
    // Check for specific budget amount mentions
    const budgetMatch = lowerInput.match(/under\s*(\d+)/i) || lowerInput.match(/less than\s*(\d+)/i) || lowerInput.match(/below\s*(\d+)/i);
    if (budgetMatch) {
      const amount = parseInt(budgetMatch[1]);
      
      if (category === 'hotels' || category === null) {
        if (amount <= 1200) budgetLevel = 1;
        else if (amount <= 2000) budgetLevel = 2;
        else if (amount <= 3000) budgetLevel = 3;
      } else if (category === 'restaurants') {
        if (amount <= 200) budgetLevel = 1;
        else if (amount <= 500) budgetLevel = 2;
        else if (amount <= 1000) budgetLevel = 3;
      } else if (category === 'cafes') {
        if (amount <= 100) budgetLevel = 1;
        else if (amount <= 250) budgetLevel = 2;
        else if (amount <= 500) budgetLevel = 3;
      } else if (category === 'monuments') {
        if (amount === 0) budgetLevel = 0;
        else if (amount <= 100) budgetLevel = 1;
        else if (amount <= 300) budgetLevel = 2;
        else if (amount <= 500) budgetLevel = 3;
      }
    }
    
    // Check for "free" monuments
    if (category === 'monuments' && lowerInput.includes('free')) {
      budgetLevel = 0;
    }
    
    // Detect rating
    const ratingMatch = lowerInput.match(/(\d(?:\.\d)?)\s*star/i) || lowerInput.match(/rating\s*(\d(?:\.\d)?)/i);
    if (ratingMatch) {
      const rating = parseFloat(ratingMatch[1]);
      if (rating >= 3 && rating <= 5) {
        ratingLevel = rating;
      }
    } else if (lowerInput.includes('top rated') || lowerInput.includes('best') || lowerInput.includes('highest rating')) {
      ratingLevel = 4.5;
    }
    
    return { category, budgetLevel, ratingLevel };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    const userInput = input.toLowerCase();
    setInput('');
    setIsTyping(true);

    // Check for greeting and general questions
    if (userInput.match(/^(hi|hello|hey|greetings)/i)) {
      const botResponse = { 
        sender: 'bot', 
        text: 'Hello! I can help you find places in Cairo. What kind of place are you looking for? Hotels, restaurants, cafes, or monuments?' 
      };
      setTimeout(() => {
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 700);
      return;
    }
    
    if (userInput.includes('thank')) {
      const botResponse = { 
        sender: 'bot', 
        text: 'You\'re welcome! Is there anything else I can help you with?' 
      };
      setTimeout(() => {
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 700);
      return;
    }
    
    // Check for filter-related queries
    if (userInput.includes('budget') || userInput.includes('price') || userInput.includes('cost') || 
        userInput.includes('rating') || userInput.includes('star') || userInput.includes('filter')) {
      
      // Use intent detection to set initial filters
      const { category, budgetLevel, ratingLevel } = detectQueryIntent(userInput);
      
      if (category) {
        setSelectedCategory(category);
      }
      
      setSelectedBudget(budgetLevel);
      setSelectedRating(ratingLevel);
      
      // Determine which filter tab to show first
      if (userInput.includes('budget') || userInput.includes('price') || userInput.includes('cost')) {
        setActiveFilter('budget');
      } else if (userInput.includes('rating') || userInput.includes('star')) {
        setActiveFilter('rating');
      }
      
      const botResponse = {
        sender: 'bot',
        text: `Let's help you find the perfect place! You can customize your search criteria below:`
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, botResponse]);
        setShowFilters(true);
        setIsTyping(false);
      }, 700);
      return;
    }
    
    // Check for category + constraint queries
    const { category, budgetLevel, ratingLevel } = detectQueryIntent(userInput);
    if (category) {
      setSelectedCategory(category);
      setSelectedBudget(budgetLevel);
      setSelectedRating(ratingLevel);
      
      const budgetText = budgetLevel !== 4 ? 
                         ` with ${priceData[category].labels[budgetLevel]} pricing (${priceData[category].ranges[budgetLevel]})` : 
                         '';
      const ratingText = ratingLevel > 3 ? ` and minimum rating of ${ratingLevel}⭐` : '';
        
      if (budgetText || ratingText) {
        // User specified constraints, show results with those filters
        const botResponse = {
          sender: 'bot',
          text: `Looking for ${categories[category].emoji} ${categories[category].name}${budgetText}${ratingText}. Would you like to see results or refine your search?`,
          options: [
            { 
              text: 'Show Results', 
              action: () => {
                // Show loading message
                setMessages(prev => [...prev, { 
                  sender: 'bot', 
                  text: `Searching for ${categories[category].name}${budgetText}${ratingText}...` 
                }]);
                
                // Slight delay to show loading
                setTimeout(showFilteredResults, 800);
              } 
            },
            { 
              text: 'Refine Search', 
              action: () => {
                setShowFilters(true);
              } 
            }
          ]
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 700);
      } else {
        // User only specified category, offer filter options
        const botResponse = {
          sender: 'bot',
          text: `Great! I can help you find ${categories[category].emoji} ${categories[category].name} in Cairo. Would you like to filter by budget and rating?`,
          options: [
            { 
              text: 'Show All', 
              action: () => navigate(`/nearby?category=${category}`) 
            },
            { 
              text: 'Use Filters', 
              action: () => {
                setShowFilters(true);
              } 
            }
          ]
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 700);
      }
      return;
    }
    
    // Handle general search for any terms not caught above
    const searchResults = allPlaces.filter(place => {
      const name = place.name || place.hotel_name || '';
      const address = place.address || '';
      const description = place.description || '';
      const searchString = `${name} ${address} ${description}`.toLowerCase();
      return searchString.includes(userInput);
    }).slice(0, 5);
    
    if (searchResults.length > 0) {
      const botResponse = {
        sender: 'bot',
        text: `I found ${searchResults.length} places matching "${input}":`,
        results: searchResults
      };
      setTimeout(() => {
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 800);
    } else {
      const botResponse = {
        sender: 'bot',
        text: `I couldn't find places matching "${input}". Would you like to browse by category instead?`,
        options: [
          { text: '🏨 Hotels', action: () => { setSelectedCategory('hotels'); setShowFilters(true); } },
          { text: '🍽️ Restaurants', action: () => { setSelectedCategory('restaurants'); setShowFilters(true); } },
          { text: '☕ Cafes', action: () => { setSelectedCategory('cafes'); setShowFilters(true); } },
          { text: '🏛️ Monuments', action: () => { setSelectedCategory('monuments'); setShowFilters(true); } }
        ]
      };
      setTimeout(() => {
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 800);
    }
  };

  const getPlaceName = (place) => {
    return place.name || place.hotel_name || 'Unnamed Place';
  };

  return (
    <div className="chatbot-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-content">{message.text}</div>

            {message.options && (
              <div className="chat-options">
                {message.options.map((option, optIndex) => (
                  <button 
                    key={optIndex} 
                    className="chat-option-button"
                    onClick={option.action}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}

            {message.results && (
              <div className="chat-results">
                {message.results.map((result, i) => (
                  <div
                    key={i}
                    className="chat-result-item"
                    onClick={() => {
                      navigate(`/near-me?category=${result.category}&placeId=${result.id || result.hotel_id}`);
                    }}
                  >
                    <img
                      src={result.image_1 || result.image || `https://source.unsplash.com/100x100/?${result.category}`}
                      alt={getPlaceName(result)}
                      className="chat-result-image"
                    />
                    <div className="chat-result-details">
                      <h4>{getPlaceName(result)}</h4>
                      <p>{result.address || 'No address available'}</p>
                      <div className="chat-result-info">
                        <span className="chat-result-rating">⭐ {result.rating}</span>
                        {result.priceLevel !== undefined && (
                          <span className="chat-result-price">
                            {result.priceLevel === 0 ? 'Free' : 
                             result.priceLevel === 1 ? '$' : 
                             result.priceLevel === 2 ? '$$' : 
                             result.priceLevel === 3 ? '$$$' : '$$$$'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="message bot typing">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* New Improved Filter UI */}
      {showFilters && (
        <div className="chat-filter-container">
          <div className="chat-filter-header">
            <div className="category-selector">
              <span>Choose Category:</span>
              <div className="category-buttons">
                {Object.entries(categories).map(([key, { name, emoji }]) => (
                  <button
                    key={key}
                    className={`category-button ${selectedCategory === key ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(key)}
                  >
                    <span className="category-emoji">{emoji}</span>
                    <span className="category-name">{name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${activeFilter === 'budget' ? 'active' : ''}`}
                onClick={() => setActiveFilter('budget')}
              >
                💰 Budget
              </button>
              <button 
                className={`filter-tab ${activeFilter === 'rating' ? 'active' : ''}`}
                onClick={() => setActiveFilter('rating')}
              >
                ⭐ Rating
              </button>
            </div>
          </div>
          
          <div className="chat-filter-content">
            {activeFilter === 'budget' && (
              <div className="budget-filter">
                <div className="budget-options">
                  {(selectedCategory === 'monuments' ? [0, 1, 2, 3, 4] : [1, 2, 3, 4]).map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedBudget(level)}
                      className={`budget-option-button ${selectedBudget === level ? 'active' : ''}`}
                    >
                      <span className="budget-label">{priceData[selectedCategory].labels[level]}</span>
                      <span className="price-range">{priceData[selectedCategory].ranges[level]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {activeFilter === 'rating' && (
              <div className="rating-filter">
                <div className="rating-options">
                  {[3, 3.5, 4, 4.5, 5].map(star => (
                    <button
                      key={star}
                      className={`rating-option-button ${selectedRating === star ? 'active' : ''}`}
                      onClick={() => setSelectedRating(star)}
                    >
                      <span>{star}+ </span>
                      <span className="star-icon">★</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="filter-actions">
            <button 
              className="filter-action-button apply"
              onClick={showFilteredResults}
            >
              Show Results
            </button>
            <button 
              className="filter-action-button navigate"
              onClick={applyFilters}
            >
              Open in Map View
            </button>
            <button 
              className="filter-action-button cancel"
              onClick={() => setShowFilters(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me about places in Cairo..."
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="send-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatbotComponent;