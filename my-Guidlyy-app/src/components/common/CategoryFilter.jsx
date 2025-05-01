import React from 'react';

const CategoryFilter = ({ selectedCategory, onChange }) => {
  const categories = [
    { id: 'restaurant', name: 'Restaurants', icon: '🍽️' },
    { id: 'lodging', name: 'Hotels', icon: '🏨' },
    { id: 'cafe', name: 'Coffee Shops', icon: '☕' },
    { id: 'tourist_attraction', name: 'Monuments', icon: '🏛️' }
  ];

  return (
    <div className="category-filter">
      <h3>I'm looking for:</h3>
      <div className="category-buttons">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => onChange(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;