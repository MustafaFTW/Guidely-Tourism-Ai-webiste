// Updated filter function for placesdata.js

// Import your placesData
import placesData from './places.json'; // Adjust the path if needed

// Filter places based on category, budget and rating
export const filterPlaces = (category, budget, rating) => {
  const data = placesData;
  
  if (!data[category]) {
    console.log(`Category ${category} not found in data`);
    return [];
  }
  
  // Get the data for the selected category 
  let places = data[category];
  
  // Hotel price range thresholds in EGP per night
  const hotelPriceThresholds = {
    1: 1200,  // Budget: Under 1200 EGP
    2: 2000,  // Standard: 1200-2000 EGP
    3: 3000,  // Luxury: 2000-3000 EGP
    4: Infinity // Premium: Over 3000 EGP
  };
  
  // Apply filters
  return places.filter(place => {
    // For hotels, check price_per_night if available
    let priceCriteria;
    if (category === 'hotels') {
      const price = place.price_per_night || 0;
      
      if (budget === 4) {
        // If budget is set to maximum, show all hotels
        priceCriteria = true;
      } else if (budget === 1) {
        // Budget hotels: Under 1200 EGP
        priceCriteria = price < hotelPriceThresholds[1];
      } else if (budget === 2) {
        // Standard hotels: 1200-2000 EGP
        priceCriteria = price >= hotelPriceThresholds[1] && price < hotelPriceThresholds[2];
      } else if (budget === 3) {
        // Luxury hotels: 2000-3000 EGP
        priceCriteria = price >= hotelPriceThresholds[2] && price < hotelPriceThresholds[3];
      } else if (budget === 4) {
        // Premium hotels: Over 3000 EGP
        priceCriteria = price >= hotelPriceThresholds[3];
      }
    } else {
      // For non-hotels, use priceLevel
      priceCriteria = (place.priceLevel || 0) <= budget;
    }
    
    // Check the rating
    const ratingCriteria = (place.rating || 0) >= rating;
    
    return priceCriteria && ratingCriteria;
  });
};

// Add the missing getPriceRange function
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

// For use in other components
export const getEgyptianPriceRanges = () => {
  return {
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
};