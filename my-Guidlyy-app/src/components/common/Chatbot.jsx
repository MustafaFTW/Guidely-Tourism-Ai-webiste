import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import placesData from '../../data/places.json';
import '../styles/Chatbot.css';

const ChatbotComponent = () => {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Hi! I\'m your Cairo travel assistant. I can help you find hotels, restaurants, cafes, and monuments. What are you looking for today?' 
    }
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
  
  // Session context for better conversation flow
  const [conversationContext, setConversationContext] = useState({
    lastCategory: null,
    lastIntent: null,
    userName: null,
    preferences: {
      budget: null,
      rating: null,
      area: null,
      cuisine: null
    },
    suggestedPlaces: []
  });
  
  // Categories with emojis for better UI
  const categories = {
    hotels: { name: 'Hotels', emoji: '🏨', singular: 'hotel' },
    restaurants: { name: 'Restaurants', emoji: '🍽️', singular: 'restaurant' },
    cafes: { name: 'Cafes', emoji: '☕', singular: 'cafe' },
    monuments: { name: 'Monuments', emoji: '🏛️', singular: 'monument' }
  };

  // Combine all places
  const allPlaces = [
    ...placesData.restaurants.map(place => ({ ...place, category: 'restaurants' })),
    ...placesData.cafes.map(place => ({ ...place, category: 'cafes' })),
    ...placesData.hotels.map(place => ({ ...place, category: 'hotels' })),
    ...placesData.monuments.map(place => ({ ...place, category: 'monuments' }))
  ];
  
  // Cairo areas for better location filtering
  const cairoAreas = [
    'Maadi', 'Zamalek', 'Downtown', 'Giza', 'Heliopolis', 
    'Nasr City', 'Mohandeseen', 'Dokki', 'Garden City',
    'New Cairo', 'El Rehab', '6th of October', 'Tahrir',
    'Khan el-Khalili', 'Islamic Cairo', 'Coptic Cairo'
  ];
  
  // Restaurant cuisines
  const cuisines = [
    'Egyptian', 'Middle Eastern', 'Mediterranean', 'Italian', 'French', 
    'Asian', 'Japanese', 'Chinese', 'Indian', 'American', 'Fast Food', 
    'Seafood', 'Vegetarian', 'International'
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
    
    // Navigate with all filter parameters and area if specified
    let navigationParams = `category=${selectedCategory}&budget=${selectedBudget}&rating=${selectedRating}`;
    
    // Add area parameter if specified
    if (conversationContext.preferences.area) {
      navigationParams += `&area=${encodeURIComponent(conversationContext.preferences.area)}`;
    }
    
    // Add cuisine parameter if specified for restaurants
    if (selectedCategory === 'restaurants' && conversationContext.preferences.cuisine) {
      navigationParams += `&cuisine=${encodeURIComponent(conversationContext.preferences.cuisine)}`;
    }
    
    navigate(`/near-me?${navigationParams}`);
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
    
    // Area filter if specified in context
    if (conversationContext.preferences.area) {
      const area = conversationContext.preferences.area.toLowerCase();
      filteredPlaces = filteredPlaces.filter(p => {
        const address = (p.address || '').toLowerCase();
        return address.includes(area);
      });
    }
    
    // Cuisine filter if specified in context (only for restaurants)
    if (selectedCategory === 'restaurants' && conversationContext.preferences.cuisine) {
      const cuisine = conversationContext.preferences.cuisine.toLowerCase();
      filteredPlaces = filteredPlaces.filter(p => {
        const description = (p.description || '').toLowerCase();
        return description.includes(cuisine);
      });
    }
    
    // Sort by rating (highest first)
    filteredPlaces.sort((a, b) => b.rating - a.rating);
    
    // Take top 5 results
    const topResults = filteredPlaces.slice(0, 5);
    
    // Save results to context for future reference
    setConversationContext(prev => ({
      ...prev,
      suggestedPlaces: topResults,
      lastCategory: selectedCategory
    }));
    
    // Get descriptive text for filters
    const budgetLabel = priceData[selectedCategory].labels[selectedBudget];
    const budgetRange = priceData[selectedCategory].ranges[selectedBudget];
    
    // Build response with relevant context
    let responseText = '';
    const locationText = conversationContext.preferences.area ? ` in ${conversationContext.preferences.area}` : '';
    const cuisineText = (selectedCategory === 'restaurants' && conversationContext.preferences.cuisine) ? 
                         ` serving ${conversationContext.preferences.cuisine} cuisine` : '';
    
    if (topResults.length > 0) {
      responseText = `I found ${topResults.length} ${categories[selectedCategory].emoji} ${categories[selectedCategory].name}${locationText}${cuisineText} with ${budgetLabel} pricing (${budgetRange}) and minimum rating of ${selectedRating}⭐:`;
      
      const botResponse = {
        sender: 'bot',
        text: responseText,
        results: topResults
      };
      setMessages(prev => [...prev, botResponse]);
      
      // If there are more than 5 results, offer to show more or refine
      if (filteredPlaces.length > 5) {
        setTimeout(() => {
          const followupResponse = {
            sender: 'bot',
            text: `I found ${filteredPlaces.length} places total. Would you like to:`,
            options: [
              { 
                text: 'See more results', 
                action: () => {
                  const moreResults = filteredPlaces.slice(5, 10);
                  if (moreResults.length > 0) {
                    setMessages(prev => [...prev, { 
                      sender: 'bot', 
                      text: 'Here are more results:',
                      results: moreResults
                    }]);
                  }
                } 
              },
              { 
                text: 'Open in map view', 
                action: applyFilters
              },
              { 
                text: 'Refine search', 
                action: () => {
                  setShowFilters(true);
                } 
              }
            ]
          };
          setMessages(prev => [...prev, followupResponse]);
        }, 1000);
      } else {
        // If there are few results, offer to open in map view
        setTimeout(() => {
          const followupResponse = {
            sender: 'bot',
            text: 'Would you like to see these places on the map?',
            options: [
              { 
                text: 'Open in map view', 
                action: applyFilters
              },
              { 
                text: 'Search for something else', 
                action: () => {
                  setConversationContext(prev => ({
                    ...prev,
                    preferences: {
                      budget: null,
                      rating: null,
                      area: null,
                      cuisine: null
                    }
                  }));
                } 
              }
            ]
          };
          setMessages(prev => [...prev, followupResponse]);
        }, 1000);
      }
    } else {
      responseText = `I couldn't find any ${categories[selectedCategory].name}${locationText}${cuisineText} matching your criteria. Would you like to try with different filters?`;
      
      const botResponse = {
        sender: 'bot',
        text: responseText,
        options: [
          { 
            text: 'Adjust Budget', 
            action: () => {
              setActiveFilter('budget');
              setShowFilters(true);
            } 
          },
          { 
            text: 'Adjust Rating', 
            action: () => {
              setActiveFilter('rating');
              setShowFilters(true);
            } 
          },
          { 
            text: 'Try Different Category', 
            action: () => {
              setShowFilters(true);
            } 
          }
        ]
      };
      setMessages(prev => [...prev, botResponse]);
    }
    
    // Hide filters after showing results
    setShowFilters(false);
  };

  // Improved function to detect query type and set appropriate filters
  const detectQueryIntent = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    
    // Initialize with defaults
    let intent = 'general';
    let category = null;
    let budgetLevel = null;
    let ratingLevel = null;
    let area = null;
    let cuisine = null;
    
    // Check for greeting intent
    if (lowerInput.match(/^(hi|hello|hey|greetings|howdy)/i)) {
      return { intent: 'greeting' };
    }
    
    // Check for help/info intent
    if (lowerInput.match(/(help me|how (can|do) you|what can you do)/i)) {
      return { intent: 'help' };
    }
    
    // Check for thanks intent
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return { intent: 'thanks' };
    }
    
    // Check for emotional/conversational intents
    if (lowerInput.match(/(how are you|how is your day|how do you feel)/i)) {
      return { intent: 'personal' };
    }
    
    // Check for hunger intent
    if (lowerInput.match(/(i('m| am) hungry|food|where (can|should) (i|we) eat|restaurants near)/i)) {
      category = 'restaurants';
      intent = 'hunger';
    }
    
    // Check for thirst/coffee intent
    if (lowerInput.match(/(i('m| am) thirsty|coffee|tea|drink|where (can|should) (i|we) get (a drink|coffee))/i)) {
      category = 'cafes';
      intent = 'thirst';
    }
    
    // Check for accommodation intent
    if (lowerInput.match(/(where (can|should) (i|we) stay|accommodation|place to sleep|lodging)/i)) {
      category = 'hotels';
      intent = 'accommodation';
    }
    
    // Check for sightseeing intent
    if (lowerInput.match(/(what (can|should) (i|we) see|tourist|attraction|sight|visit)/i)) {
      category = 'monuments';
      intent = 'sightseeing';
    }
    
    // Direct category mentions (handle singular and plural forms)
    if (lowerInput.match(/\b(hotels?|stay(ing)?|accommodations?|rooms?|lodging)\b/i)) {
      category = 'hotels';
    } else if (lowerInput.match(/\b(restaurants?|food|dining|eat(ing)?|dinner|lunch|breakfast)\b/i)) {
      category = 'restaurants';
    } else if (lowerInput.match(/\b(cafes?|café|coffee|tea|drinks?)\b/i)) {
      category = 'cafes';
    } else if (lowerInput.match(/\b(monuments?|attractions?|museums?|pyramids?|sights|sightseeing|tours?|landmarks?|histor(y|ical))\b/i)) {
      category = 'monuments';
    }
    
    // If we've identified a category, the intent is at least that
    if (category && intent === 'general') {
      intent = 'category';
    }
    
    // Detect budget level
    if (lowerInput.match(/\b(cheap|budget|affordable|inexpensive|low cost|economical)\b/i)) {
      budgetLevel = 1;
      intent = 'budget';
    } else if (lowerInput.match(/\b(moderate|medium|standard|reasonable|mid-range|middle)\b/i)) {
      budgetLevel = 2;
      intent = 'budget';
    } else if (lowerInput.match(/\b(nice|high(-| )end|upscale)\b/i)) {
      budgetLevel = 3;
      intent = 'budget';
    } else if (lowerInput.match(/\b(luxury|expensive|premium|top|fine|gourmet|high-class|fancy)\b/i)) {
      budgetLevel = 4;
      intent = 'budget';
    }
    
    // Check for specific budget amount mentions
    const budgetMatch = lowerInput.match(/under\s*(\d+)/i) || 
                        lowerInput.match(/less than\s*(\d+)/i) || 
                        lowerInput.match(/below\s*(\d+)/i) ||
                        lowerInput.match(/\b(\d+)\s*egp\b/i) ||
                        lowerInput.match(/\begp\s*(\d+)\b/i);
    
    if (budgetMatch) {
      const amount = parseInt(budgetMatch[1]);
      intent = 'budget';
      
      if (category === 'hotels' || category === null) {
        if (amount <= 1200) budgetLevel = 1;
        else if (amount <= 2000) budgetLevel = 2;
        else if (amount <= 3000) budgetLevel = 3;
        else budgetLevel = 4;
      } else if (category === 'restaurants') {
        if (amount <= 200) budgetLevel = 1;
        else if (amount <= 500) budgetLevel = 2;
        else if (amount <= 1000) budgetLevel = 3;
        else budgetLevel = 4;
      } else if (category === 'cafes') {
        if (amount <= 100) budgetLevel = 1;
        else if (amount <= 250) budgetLevel = 2;
        else if (amount <= 500) budgetLevel = 3;
        else budgetLevel = 4;
      } else if (category === 'monuments') {
        if (amount === 0) budgetLevel = 0;
        else if (amount <= 100) budgetLevel = 1;
        else if (amount <= 300) budgetLevel = 2;
        else if (amount <= 500) budgetLevel = 3;
        else budgetLevel = 4;
      }
    }
    
    // Check for "free" monuments
    if ((category === 'monuments' || intent === 'sightseeing') && lowerInput.includes('free')) {
      budgetLevel = 0;
      intent = 'budget';
      category = 'monuments';
    }
    
    // Detect rating
    const ratingMatch = lowerInput.match(/(\d(?:\.\d)?)\s*star/i) || 
                        lowerInput.match(/rating\s*(\d(?:\.\d)?)/i) ||
                        lowerInput.match(/rated\s*(\d(?:\.\d)?)/i);
    
    if (ratingMatch) {
      const rating = parseFloat(ratingMatch[1]);
      if (rating >= 3 && rating <= 5) {
        ratingLevel = rating;
        intent = 'rating';
      }
    } else if (lowerInput.match(/\b(top rated|best|highest rating|excellent|outstanding)\b/i)) {
      ratingLevel = 4.5;
      intent = 'rating';
    } else if (lowerInput.match(/\b(good|well rated|quality)\b/i)) {
      ratingLevel = 4;
      intent = 'rating';
    }
    
    // Detect area mentions
    for (const areaName of cairoAreas) {
      if (lowerInput.includes(areaName.toLowerCase())) {
        area = areaName;
        intent = 'location';
        break;
      }
    }
    
    // Detect cuisine for restaurants
    if (category === 'restaurants' || intent === 'hunger') {
      for (const cuisineType of cuisines) {
        if (lowerInput.includes(cuisineType.toLowerCase())) {
          cuisine = cuisineType;
          intent = 'cuisine';
          break;
        }
      }
    }
    
    return { 
      intent,
      category, 
      budgetLevel, 
      ratingLevel,
      area,
      cuisine
    };
  };

  // Function to get place name
  const getPlaceName = (place) => {
    return place.name || place.hotel_name || 'Unnamed Place';
  };

  // Function to get place image URL with fallback
  const getPlaceImageUrl = (place) => {
    // Check for hotel-specific image field first
    if (place.image_1) {
      return place.image_1;
    }
    // Then try imageUrl
    else if (place.imageUrl) {
      return place.imageUrl;
    } 
    // Then try image
    else if (place.image) {
      return place.image;
    } 
    // Finally use fallback
    else {
      const category = place.category;
      const placeName = getPlaceName(place);
      return `https://source.unsplash.com/300x200/?${encodeURIComponent(category)},${encodeURIComponent(placeName.split(' ')[0])}`;
    }
  };

  // Advanced send message function with intent detection
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    setInput('');
    setIsTyping(true);

    // Detect intent from user message
    const { 
      intent, 
      category, 
      budgetLevel, 
      ratingLevel,
      area,
      cuisine
    } = detectQueryIntent(input);
    
    // Update conversation context
    setConversationContext(prev => ({
      ...prev,
      lastIntent: intent,
      lastCategory: category || prev.lastCategory,
      preferences: {
        ...prev.preferences,
        budget: budgetLevel !== null ? budgetLevel : prev.preferences.budget,
        rating: ratingLevel !== null ? ratingLevel : prev.preferences.rating,
        area: area || prev.preferences.area,
        cuisine: cuisine || prev.preferences.cuisine
      }
    }));

    // Handle different intents
    switch (intent) {
      case 'greeting':
        setTimeout(() => {
          const botResponse = { 
            sender: 'bot', 
            text: 'Hello! I\'m your Cairo travel assistant. I can help you find:',
            options: [
              { text: '🏨 Hotels & Accommodation', action: () => { setSelectedCategory('hotels'); setShowFilters(true); } },
              { text: '🍽️ Restaurants & Dining', action: () => { setSelectedCategory('restaurants'); setShowFilters(true); } },
              { text: '☕ Cafes & Coffee Shops', action: () => { setSelectedCategory('cafes'); setShowFilters(true); } },
              { text: '🏛️ Monuments & Attractions', action: () => { setSelectedCategory('monuments'); setShowFilters(true); } }
            ] 
          };
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 700);
        break;
        
      case 'help':
        setTimeout(() => {
          const botResponse = { 
            sender: 'bot', 
            text: 'I can help you discover Cairo! You can ask me things like:',
            options: [
              { text: 'Where can I stay in Zamalek?', action: () => { 
                setSelectedCategory('hotels'); 
                setConversationContext(prev => ({
                  ...prev,
                  preferences: {...prev.preferences, area: 'Zamalek'}
                }));
                setShowFilters(true); 
              } },
              { text: 'Find budget restaurants', action: () => { 
                setSelectedCategory('restaurants'); 
                setSelectedBudget(1);
                setShowFilters(true); 
              } },
              { text: 'Best rated cafes', action: () => { 
                setSelectedCategory('cafes'); 
                setSelectedRating(4.5);
                setShowFilters(true); 
              } },
              { text: 'Free monuments to visit', action: () => { 
                setSelectedCategory('monuments'); 
                setSelectedBudget(0);
                setShowFilters(true); 
              } }
            ] 
          };
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 700);
        break;
        
      case 'thanks':
        setTimeout(() => {
          const botResponse = { 
            sender: 'bot', 
            text: 'You\'re welcome! Is there anything else I can help you with?' 
          };
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 700);
        break;
        
      case 'personal':
        setTimeout(() => {
          const botResponse = { 
            sender: 'bot', 
            text: 'I\'m doing great, thanks for asking! I\'m here to help you explore Cairo. What would you like to discover today?' 
          };
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 700);
        break;
        
      case 'hunger':
        setTimeout(() => {
          // Handle hunger intent specially
          setSelectedCategory('restaurants');
          
          // Check for cuisine in context
          const cuisineText = cuisine ? 
            ` for ${cuisine} food` : 
            (conversationContext.preferences.cuisine ? ` for ${conversationContext.preferences.cuisine} food` : '');
          
          // Check for area in context
          const areaText = area ? 
            ` in ${area}` : 
            (conversationContext.preferences.area ? ` in ${conversationContext.preferences.area}` : '');
          
          const botResponse = { 
            sender: 'bot', 
            text: `Hungry? I can help you find restaurants${cuisineText}${areaText}. What's your budget?`,
            options: [
              { 
                text: 'Budget (Under 200 EGP)', 
                action: () => {
                  setSelectedBudget(1);
                  setActiveFilter('rating');
                  setShowFilters(true);
                }
              },
              { 
                text: 'Casual (200-500 EGP)', 
                action: () => {
                  setSelectedBudget(2);
                  setActiveFilter('rating');
                  setShowFilters(true);
                }
              },
              { 
                text: 'Fine Dining (500-1000 EGP)', 
                action: () => {
                  setSelectedBudget(3);
                  setActiveFilter('rating');
                  setShowFilters(true);
                }
              },
              { 
                text: 'Show All Restaurants', 
                action: () => {
                  showFilteredResults();
                }
              }
            ]
          };
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 700);
        break;
        
      case 'thirst':
        setTimeout(() => {
          // Handle thirst/coffee intent
          setSelectedCategory('cafes');
          
          // Check for area in context
          const areaText = area ? 
            ` in ${area}` : 
            (conversationContext.preferences.area ? ` in ${conversationContext.preferences.area}` : '');
          
          const botResponse = { 
            sender: 'bot', 
            text: `Looking for a cafe${areaText}? I can help you find the perfect spot. What's your preference?`,
            options: [
              { 
                text: 'Budget Cafes', 
                action: () => {
                  setSelectedBudget(1);
                  setActiveFilter('rating');
                  setShowFilters(true);
                }
              },
              { 
                text: 'Top-Rated Cafes', 
                action: () => {
                  setSelectedRating(4.5);
                  setActiveFilter('budget');
                  setShowFilters(true);
                }
              },
              { 
                text: 'Show All Cafes', 
                action: () => {
                  showFilteredResults();
                }
              }
            ]
          };
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 700);
        break;
        
      case 'accommodation':
        setTimeout(() => {
          // Handle accommodation intent
          setSelectedCategory('hotels');
          
          // Check for area in context
          const areaText = area ? 
            ` in ${area}` : 
            (conversationContext.preferences.area ? ` in ${conversationContext.preferences.area}` : '');
          
          const botResponse = { 
            sender: 'bot', 
            text: `Looking for a place to stay${areaText}? What's your budget range?`,
            options: [
              { 
                text: 'Budget (Under 1200 EGP)', 
                action: () => {
                  setSelectedBudget(1);
                  setActiveFilter('rating');
                  setShowFilters(true);
                }
              },
              { 
                text: 'Standard (1200-2000 EGP)', 
                action: () => {
                  setSelectedBudget(2);
                  setActiveFilter('rating');
                  setShowFilters(true);
                }
              },
              { 
                text: 'Luxury (2000-3000 EGP)', 
                action: () => {
                  setSelectedBudget(3);
                  setActiveFilter('rating');
                  setShowFilters(true);
                }
              },
              { 
                text: 'Premium (Over 3000 EGP)', 
                action: () => {
                  setSelectedBudget(4);
                  setActiveFilter('rating');
                  setShowFilters(true);
                }
              }
            ]
          };
      setMessages(prev => [
        ...prev,
        { 
          text: 'Budget Friendly (Under 100 EGP)', 
          action: () => {
            setSelectedBudget(1);
            showFilteredResults();
          }
        },
        { 
          text: 'Top-Rated Attractions', 
          action: () => {
            setSelectedRating(4.5);
            showFilteredResults();
          }
        },
        { 
          text: 'Show All Attractions', 
          action: () => {
            showFilteredResults();
          }
        }
      ]);
      setIsTyping(false);
    }, 700);
    break;
    
  case 'category':
  case 'budget':
  case 'rating':
  case 'location':
  case 'cuisine':
    // Handle queries with specific constraints
    setTimeout(() => {
      if (category) {
        setSelectedCategory(category);
      }
      
      if (budgetLevel !== null) {
        setSelectedBudget(budgetLevel);
      }
      
      if (ratingLevel !== null) {
        setSelectedRating(ratingLevel);
      }
      
      // Build response text using available context
      let responseText = `I'll help you find`;
      
      // Add category if available
      if (category) {
        responseText += ` ${categories[category].name.toLowerCase()}`;
      } else if (conversationContext.lastCategory) {
        responseText += ` ${categories[conversationContext.lastCategory].name.toLowerCase()}`;
      } else {
        responseText += ` places`;
      }
      
      // Add cuisine if available (for restaurants)
      if (cuisine && (category === 'restaurants' || conversationContext.lastCategory === 'restaurants')) {
        responseText += ` with ${cuisine} cuisine`;
      }
      
      // Add area if available
      if (area) {
        responseText += ` in ${area}`;
      }
      
      // Add budget if available
      if (budgetLevel !== null) {
        const cat = category || conversationContext.lastCategory || 'restaurants';
        responseText += ` with ${priceData[cat].labels[budgetLevel]} pricing (${priceData[cat].ranges[budgetLevel]})`;
      }
      
      // Add rating if available
      if (ratingLevel !== null) {
        responseText += ` rated ${ratingLevel}⭐ and above`;
      }
      
      responseText += '. Would you like to:';
      
      const botResponse = {
        sender: 'bot',
        text: responseText,
        options: [
          { 
            text: 'Show results', 
            action: () => showFilteredResults()
          },
          { 
            text: 'Refine search', 
            action: () => setShowFilters(true)
          }
        ]
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 700);
    break;
  
  default:
    // Handle general search for any terms not caught above
    setTimeout(() => {
      // First check if we should just use the last category user was interested in
      if (conversationContext.lastCategory) {
        // Try to search within the last category the user was interested in
        let searchResults = allPlaces.filter(place => {
          if (place.category !== conversationContext.lastCategory) return false;
          
          const name = place.name || place.hotel_name || '';
          const address = place.address || '';
          const description = place.description || '';
          const searchString = `${name} ${address} ${description}`.toLowerCase();
          return searchString.includes(lowerInput);
        }).slice(0, 5);
        
        if (searchResults.length > 0) {
          const botResponse = {
            sender: 'bot',
            text: `I found ${searchResults.length} ${categories[conversationContext.lastCategory].name.toLowerCase()} matching "${input}":`,
            results: searchResults
          };
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
          return;
        }
      }
      
      // If no results in last category or no last category, search across all categories
      const searchResults = allPlaces.filter(place => {
        const name = place.name || place.hotel_name || '';
        const address = place.address || '';
        const description = place.description || '';
        const searchString = `${name} ${address} ${description}`.toLowerCase();
        return searchString.includes(lowerInput);
      }).slice(0, 5);
      
      if (searchResults.length > 0) {
        const botResponse = {
          sender: 'bot',
          text: `I found ${searchResults.length} places matching "${input}":`,
          results: searchResults
        };
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
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
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }
    }, 800);
    break;
}
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
                  src={getPlaceImageUrl(result)}
                  alt={getPlaceName(result)}
                  className="chat-result-image"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loops
                    const fallback = `https://source.unsplash.com/100x100/?${result.category}`;
                    e.target.src = fallback;
                  }}
                />
                <div className="chat-result-details">
                  <h4>{getPlaceName(result)}</h4>
                  <p>{result.address || 'No address available'}</p>
                  <div className="chat-result-info">
                    <span className="chat-result-rating">⭐ {result.rating}</span>
                    {result.priceLevel !== undefined ? (
                      <span className="chat-result-price">
                        {result.priceLevel === 0 ? 'Free' : 
                         result.priceLevel === 1 ? '$' : 
                         result.priceLevel === 2 ? '$$' : 
                         result.priceLevel === 3 ? '$$$' : '$$$$'}
                      </span>
                    ) : result.price_per_night && (
                      <span className="chat-result-price">
                        {result.price_per_night} {result.currency || 'EGP'}/night
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
  
  {/* Enhanced Filter UI */}
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