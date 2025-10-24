// NASA APOD API URL
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// Random space facts for the "Did You Know?" section
const spaceFacts = [
  "A day on Venus is longer than its year! Venus takes 243 Earth days to rotate once but only 225 Earth days to orbit the Sun.",
  "Jupiter has at least 79 known moons, including four large moons discovered by Galileo in 1610.",
  "The Great Red Spot on Jupiter is a storm that has been raging for over 300 years and is larger than Earth.",
  "Saturn would float in water if there was a bathtub big enough to hold it, as it's less dense than water.",
  "One teaspoon of neutron star material would weigh about 6 billion tons on Earth.",
  "The Milky Way galaxy is on a collision course with the Andromeda galaxy, but won't collide for about 4.5 billion years.",
  "There are more stars in the observable universe than grains of sand on all Earth's beaches combined.",
  "Mars has the largest volcano in the solar system - Olympus Mons is about 13.6 miles (22 km) high.",
  "The temperature on the Moon can range from 250°F (121°C) in sunlight to -250°F (-157°C) in shadow.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth."
];

// Global variables
let apodDatabase = []; // Will store all APOD data
let currentGalleryData = []; // Currently displayed data

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Set default dates (last 7 days)
  setDefaultDates();
  
  // Show random space fact
  displayRandomSpaceFact();
  
  // Add event listeners
  document.getElementById('getImageBtn').addEventListener('click', fetchAndDisplayImages);
  
  // Close modal when clicking the X
  document.querySelector('.close').addEventListener('click', closeModal);
  
  // Close modal when clicking outside of it
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
      closeModal();
    }
  });
});

// Set default date range (last 7 days)
function setDefaultDates() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  
  // Format dates as YYYY-MM-DD
  document.getElementById('endDate').value = today.toISOString().split('T')[0];
  document.getElementById('startDate').value = weekAgo.toISOString().split('T')[0];
}

// Display a random space fact
function displayRandomSpaceFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  const factElement = document.getElementById('factText');
  factElement.textContent = spaceFacts[randomIndex];
}

// Fetch and display images based on selected date range
async function fetchAndDisplayImages() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  // Validate date inputs
  if (!startDate || !endDate) {
    alert('Please select both start and end dates.');
    return;
  }
  
  if (new Date(startDate) > new Date(endDate)) {
    alert('Start date must be earlier than end date.');
    return;
  }
  
  // Show loading message
  showLoading();
  
  try {
    // Load APOD data if not already loaded
    if (apodDatabase.length === 0) {
      await loadApodData();
    }
    
    // Filter data by date range
    const filteredData = filterDataByDateRange(startDate, endDate);
    
    // Display the gallery
    displayGallery(filteredData);
    
  } catch (error) {
    console.error('Error fetching images:', error);
    showError('Failed to load space images. Please try again.');
  }
}

// Load APOD data from the API
async function loadApodData() {
  const response = await fetch(apodData);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  apodDatabase = await response.json();
}

// Filter APOD data by date range
function filterDataByDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return apodDatabase.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });
}

// Show loading message
function showLoading() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = `
    <div class="loading">
      <div class="loading-icon">🔄</div>
      <p>Loading space photos...</p>
    </div>
  `;
}

// Show error message
function showError(message) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = `
    <div class="error">
      <div class="error-icon">⚠️</div>
      <p>${message}</p>
    </div>
  `;
}

// Display the gallery of images
function displayGallery(data) {
  const gallery = document.getElementById('gallery');
  currentGalleryData = data;
  
  if (data.length === 0) {
    gallery.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🌌</div>
        <p>No space images found for the selected date range.</p>
        <p>Try selecting a different date range.</p>
      </div>
    `;
    return;
  }
  
  // Create gallery items
  const galleryHTML = data.map((item, index) => {
    // Check if this is a video entry
    const isVideo = item.media_type === 'video';
    const imageUrl = isVideo ? (item.thumbnail_url || item.url) : item.url;
    const mediaIndicator = isVideo ? '<div class="video-indicator">▶️ Video</div>' : '';
    
    return `
      <div class="gallery-item" onclick="openModal(${index})" data-index="${index}">
        ${mediaIndicator}
        <img src="${imageUrl}" alt="${item.title}" loading="lazy" />
        <div class="gallery-info">
          <h3>${item.title}</h3>
          <p class="date">${formatDate(item.date)}</p>
        </div>
      </div>
    `;
  }).join('');
  
  gallery.innerHTML = galleryHTML;
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Open modal with detailed view
function openModal(index) {
  const item = currentGalleryData[index];
  if (!item) return;
  
  const modal = document.getElementById('modal');
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalExplanation = document.getElementById('modalExplanation');
  
  // Handle video vs image content
  if (item.media_type === 'video') {
    // For videos, try to show thumbnail or embed
    if (item.thumbnail_url) {
      modalImage.src = item.thumbnail_url;
      modalImage.alt = item.title;
    } else {
      // Create a video embed or link
      const modalBody = document.querySelector('.modal-body');
      const existingVideo = modalBody.querySelector('.video-embed');
      if (existingVideo) existingVideo.remove();
      
      if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
        // Extract YouTube video ID and create embed
        const videoId = extractYouTubeId(item.url);
        if (videoId) {
          const videoEmbed = document.createElement('div');
          videoEmbed.className = 'video-embed';
          videoEmbed.innerHTML = `
            <iframe width="100%" height="315" 
              src="https://www.youtube.com/embed/${videoId}" 
              frameborder="0" allowfullscreen>
            </iframe>
          `;
          modalImage.style.display = 'none';
          modalBody.insertBefore(videoEmbed, modalBody.querySelector('.modal-info'));
        }
      } else {
        // Show a link to the video
        modalImage.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="%23666">Video Content</text></svg>';
        modalImage.alt = 'Video content - click to view';
      }
    }
  } else {
    // Regular image
    modalImage.src = item.hdurl || item.url;
    modalImage.alt = item.title;
    modalImage.style.display = 'block';
    
    // Remove any existing video embed
    const existingVideo = document.querySelector('.video-embed');
    if (existingVideo) existingVideo.remove();
  }
  
  modalTitle.textContent = item.title;
  modalDate.textContent = formatDate(item.date);
  modalExplanation.textContent = item.explanation || 'No explanation available.';
  
  // Add click handler for video links
  if (item.media_type === 'video') {
    modalImage.style.cursor = 'pointer';
    modalImage.onclick = () => window.open(item.url, '_blank');
  } else {
    modalImage.style.cursor = 'default';
    modalImage.onclick = null;
  }
  
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Close modal
function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto'; // Restore scrolling
}