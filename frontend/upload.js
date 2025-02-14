// Select the close button
const closeFormButton = document.getElementById('closeForm');

// Add event listener to close the form
closeFormButton.addEventListener('click', () => {
    uploadFormContainer.classList.add('hidden'); // Hide the form
    document.body.style.overflow = ''; // Restore scrolling
    uploadFormContainer.style.position = ''; // Reset position
    uploadFormContainer.style.top = '';
    uploadFormContainer.style.left = '';
    uploadFormContainer.style.right = '';
    uploadFormContainer.style.zIndex = ''; // Reset z-index
    uploadFormContainer.style.height = ''; // Reset height
});  

const formatCurrency = (amount, currency) => {
  const symbols = {
    NGN: '₦',
    USD: '$',
    GBP: '£',
    KES: 'KSh',
    GHS: '₵',
    ZAR: 'R',
    XAF: 'FCFA',
    XOF: 'CFA',
    ETB: 'Br',
    EGP: '£'
  };
  return `${symbols[currency] || ''}${parseFloat(amount).toLocaleString()}`;
};

const searchItems = (items, searchTerm) => {
  if (!searchTerm) return items;
  
  searchTerm = searchTerm.toLowerCase().trim();
  return items.filter(item => {
    return (
      item.name?.toLowerCase().includes(searchTerm) ||
      item.category?.toLowerCase().includes(searchTerm) ||
      item.location?.toLowerCase().includes(searchTerm) ||
      item.user?.name?.toLowerCase().includes(searchTerm)
    );
  });
};

function createLoadingSkeleton() {
  return `
    <div class="bg-white shadow-lg rounded-lg overflow-hidden animate-pulse">
      <div class="p-3">
        <div class="flex items-center space-x-2">
          <div class="h-10 w-10 rounded-full bg-gray-200"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/3 mt-2"></div>
          </div>
        </div>
        <div class="mt-2">
          <div class="h-60 bg-gray-200 rounded-lg"></div>
        </div>
        <div class="mt-2">
          <div class="h-5 bg-gray-200 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4 mt-1"></div>
        </div>
      </div>
    </div>
  `;
}

const fetchItems = async (searchQuery = '') => {
  const container = document.getElementById('postedItems');
  container.innerHTML = Array(4).fill(createLoadingSkeleton()).join('');

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/items`);
    if (!response.ok) throw new Error('Failed to fetch items');

    const items = await response.json();
    const filteredItems = searchItems(items, searchQuery);
    
    container.innerHTML = '';
    
    if (filteredItems.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <i data-lucide="package-search" class="w-16 h-16 mx-auto text-gray-400 mb-4"></i>
          <p class="text-gray-500">No items found</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    filteredItems.forEach(item => {
      container.appendChild(createItemElement(item));
    });

    lucide.createIcons();
  } catch (error) {
    console.error('Error fetching items:', error);
    showNotification('Failed to fetch items. Please try again later.');
    container.innerHTML = `
      <div class="text-center py-8">
        <i data-lucide="alert-triangle" class="w-16 h-16 mx-auto text-red-400 mb-4"></i>
        <p class="text-gray-500">Failed to load items. Please try again later.</p>
      </div>
    `;
    lucide.createIcons();
  }
};

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('animate-fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function createItemElement(item) {
  const itemElement = document.createElement('div');
  itemElement.className = 'max-w-2xl mx-auto p-1';
  
  const createImageCarousel = (images) => {
    if (!images || images.length === 0) {
      return `
        <div class="relative h-60">
          <img src="https://via.placeholder.com/800x600" alt="Placeholder" class="w-full h-60 object-cover rounded-lg">
        </div>
      `;
    }

    const carouselId = `carousel-${Math.random().toString(36).substr(2, 9)}`;
    
    return `
      <div id="${carouselId}" class="relative h-60">
        ${images.map((img, idx) => `
          <img src="${img}" 
               alt="Product Image ${idx + 1}" 
               class="w-full h-60 object-cover rounded-lg absolute transition-opacity duration-300 ${idx === 0 ? 'opacity-100' : 'opacity-0'}"
               data-index="${idx}">
        `).join('')}
        ${images.length > 1 ? `
          <button class="carousel-prev absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-colors">
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
          </button>
          <button class="carousel-next absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-colors">
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
          <div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
            ${images.map((_, idx) => `
              <button class="carousel-indicator w-1.5 h-1.5 rounded-full bg-white bg-opacity-50 hover:bg-opacity-100 transition-colors ${idx === 0 ? 'bg-opacity-100' : ''}"
                      data-index="${idx}"></button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  };

  itemElement.innerHTML = `
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="p-3">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <img src="${item.user?.avatar || 'https://via.placeholder.com/100'}" 
                   alt="User Avatar" 
                   class="rounded-full w-full h-full object-cover">
            </div>
            <div>
              <div class="flex items-center">
                <h2 class="text-lg font-semibold">${item.user?.name || 'Anonymous'}</h2>
                ${item.user?.verified ? '<i data-lucide="check-circle" class="w-4 h-4 text-blue-500 ml-1"></i>' : ''}
              </div>
              <div class="flex items-center text-xs text-gray-500">
                <i data-lucide="map-pin" class="w-3 h-3 mr-1"></i>
                ${item.location || 'Location not specified'}
                <i data-lucide="timer" class="w-3 h-3 ml-2 mr-1"></i>
                ${new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div class="mt-2">
          ${createImageCarousel(item.images)}
        </div>

        <div class="mt-2">
          <h2 class="text-xl font-semibold">${item.name}</h2>
          <div class="flex items-center space-x-2 mt-1">
            <span class="text-xl font-bold text-green-600">${formatCurrency(item.price, item.currency)}</span>
            <span class="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">Negotiable</span>
          </div>
        </div>
      </div>

      <div class="collapsible hidden p-3 border-t">
        <div class="mt-2">
          <p class="text-sm text-gray-600">${item.description || 'No description provided'}</p>
        </div>

        <div class="mt-3 space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <button class="payment-tab p-2 text-sm bg-gray-200 rounded-lg">Payment Methods</button>
            <button class="delivery-tab p-2 text-sm bg-gray-200 rounded-lg">Delivery Options</button>
          </div>

          <div class="payment-content space-y-1">
            ${['Cash on Delivery', 'Bank Transfer', 'USSD Transfer', 'Paystack', 'Flutterwave']
              .map(method => `
                <button class="w-full p-2 text-sm border rounded-lg text-left flex items-center justify-between hover:bg-gray-50">
                  <span class="flex items-center">
                    <span class="mr-1">${method === 'Cash on Delivery' ? '💵' : 
                                      method === 'Bank Transfer' ? '🏦' : 
                                      method === 'USSD Transfer' ? '📱' : '💳'}</span>
                    ${method}
                  </span>
                  <i data-lucide="chevron-right" class="w-3 h-3"></i>
                </button>
              `).join('')}
          </div>

          <div class="delivery-content hidden space-y-1">
            ${[
              { name: 'Pickup', price: '0', icon: '🏪' },
              { name: 'Standard Delivery', price: '2000', icon: '🚛' },
              { name: 'Express Delivery', price: '5000', icon: '🚚' }
            ].map(option => `
                <button class="w-full p-2 text-sm border rounded-lg text-left flex items-center justify-between hover:bg-gray-50">
                  <span class="flex items-center">
                    <span class="mr-1">${option.icon}</span>
                    ${option.name}
                  </span>
                  <span>${formatCurrency(option.price, item.currency)}</span>
                </button>
              `).join('')}
          </div>
        </div>

        <div class="mt-3 flex space-x-2">
          <button class="make-offer flex-1 bg-green-600 text-white p-2 text-sm rounded-lg hover:bg-green-700">
            Make Offer
          </button>
          <button class="chat flex-1 border p-2 text-sm rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i data-lucide="message-circle" class="w-3 h-3 mr-1"></i> Chat
          </button>
          <button class="share border p-2 rounded-lg hover:bg-gray-50">
            <i data-lucide="share-2" class="w-3 h-3"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  const setupCarousel = () => {
    if (!item.images?.length) return;
    
    const carousel = itemElement.querySelector(`[id^="carousel-"]`);
    if (!carousel) return;

    const images = carousel.querySelectorAll('img');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const indicators = carousel.querySelectorAll('.carousel-indicator');
    let currentIndex = 0;

    const showImage = (index) => {
      images.forEach(img => img.classList.add('opacity-0'));
      indicators.forEach(ind => ind.classList.remove('bg-opacity-100'));
      
      images[index].classList.remove('opacity-0');
      indicators[index].classList.add('bg-opacity-100');
      currentIndex = index;
    };

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(newIndex);
      });

      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newIndex = (currentIndex + 1) % images.length;
        showImage(newIndex);
      });
    }

    indicators.forEach(indicator => {
      indicator.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(parseInt(indicator.dataset.index));
      });
    });
  };

  const setupEventListeners = () => {
    const container = itemElement.querySelector('.bg-white');
    const collapsible = itemElement.querySelector('.collapsible');
    const paymentTab = itemElement.querySelector('.payment-tab');
    const deliveryTab = itemElement.querySelector('.delivery-tab');
    const paymentContent = itemElement.querySelector('.payment-content');
    const deliveryContent = itemElement.querySelector('.delivery-content');

    container.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        collapsible.classList.toggle('hidden');
      }
    });

    paymentTab.addEventListener('click', (e) => {
      e.stopPropagation();
      paymentContent.classList.remove('hidden');
      deliveryContent.classList.add('hidden');
      paymentTab.classList.add('bg-gray-300');
      deliveryTab.classList.remove('bg-gray-300');
    });

    deliveryTab.addEventListener('click', (e) => {
      e.stopPropagation();
      deliveryContent.classList.remove('hidden');
      paymentContent.classList.add('hidden');
      deliveryTab.classList.add('bg-gray-300');
      paymentTab.classList.remove('bg-gray-300');
    });

    const makeOfferBtn = itemElement.querySelector('.make-offer');
    const chatBtn = itemElement.querySelector('.chat');
    const shareBtn = itemElement.querySelector('.share');

    [makeOfferBtn, chatBtn, shareBtn].forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });

    makeOfferBtn.addEventListener('click', () => {
      showNotification(`Making an offer on ${item.name}`);
    });

    chatBtn.addEventListener('click', () => {
      showNotification(`Starting chat about ${item.name}`);
    });

    shareBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(`Check out this item: ${item.name}`);
      showNotification('Item link copied to clipboard');
    });
  };

  // Initialize the component
  setupCarousel();
  setupEventListeners();

  return itemElement;
}

// Optional: Enhance existing fetchItems to add more functionality
const enhancedFetchItems = async (searchQuery = '') => {
  try {
    // Call the original fetchItems function
    await fetchItems(searchQuery);
    
    // Additional post-fetch interactions or processing
    const items = document.getElementById('postedItems').children;
    
    // Example: Add hover effects or additional interactions
    Array.from(items).forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.classList.add('transform', 'scale-105', 'transition-transform');
      });
      
      item.addEventListener('mouseleave', () => {
        item.classList.remove('transform', 'scale-105', 'transition-transform');
      });
    });
  } catch (error) {
    console.error('Enhanced fetch error:', error);
  }
};

// Optional: Replace original fetchItems if desired
// window.fetchItems = enhancedFetchItems;
      
  

  // Configuration
const CONFIG = {
  API_BASE_URL: 'https://afrimart-zbj3.onrender.com/api',
  UPLOAD_SETTINGS: {
    MAX_FILES: 8,
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    MAX_DIMENSION: 1000 // matches Cloudinary transformation
  },
  DEBOUNCE_DELAY: 300
};

// Utility Functions
class UploadError extends Error {
  constructor(message, technical = '') {
    super(message);
    this.technical = technical;
    this.name = 'UploadError';
  }
}

const getAuthToken = () => localStorage.getItem('token');

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
/**
const showNotification = (() => {
  let currentTimeout;
  return (message, type = 'error') => {
    const notification = document.getElementById('notification');
    if (!notification) return;

    clearTimeout(currentTimeout);
    notification.textContent = message;
    notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white ${
      type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } z-50 transition-opacity duration-300`;
    notification.classList.remove('hidden');
    
    currentTimeout = setTimeout(() => {
      notification.classList.add('opacity-0');
      setTimeout(() => {
        notification.classList.add('hidden');
        notification.classList.remove('opacity-0');
      }, 300);
    }, 3000);
  };
})();**/

const validateFiles = (files) => {
  if (!files || files.length === 0) {
    throw new UploadError('Please select at least one image');
  }

  if (files.length > CONFIG.UPLOAD_SETTINGS.MAX_FILES) {
    throw new UploadError(`Maximum ${CONFIG.UPLOAD_SETTINGS.MAX_FILES} files allowed`);
  }

  for (const file of files) {
    if (!CONFIG.UPLOAD_SETTINGS.ALLOWED_TYPES.includes(file.type)) {
      throw new UploadError(
        'Invalid file type. Only JPEG, JPG, PNG, and GIF files are allowed',
        `File type: ${file.type}`
      );
    }

    if (file.size > CONFIG.UPLOAD_SETTINGS.MAX_FILE_SIZE) {
      throw new UploadError(
        `File ${file.name} exceeds size limit of ${formatFileSize(CONFIG.UPLOAD_SETTINGS.MAX_FILE_SIZE)}`,
        `File size: ${formatFileSize(file.size)}`
      );
    }
  }
};
/**
// UI Functions
const createLoadingSkeleton = () => {
  return `
    <div class="animate-pulse">
      <div class="h-48 bg-gray-200 rounded-lg mb-4"></div>
      <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  `;
};

const createItemElement = (item) => {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'bg-white shadow-lg rounded-lg overflow-hidden';
  
  itemDiv.innerHTML = `
    <div class="p-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <div class="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
            <img src="${item.user?.avatar || '/placeholder-avatar.png'}" 
                 alt="User Avatar" 
                 class="rounded-full"
                 onerror="this.src='/placeholder-avatar.png'">
          </div>
          <div>
            <div class="flex items-center">
              <h2 class="text-xl font-semibold">${item.user?.name || 'Anonymous'}</h2>
              ${item.user?.verified ? '<i data-lucide="check-circle" class="w-5 h-5 text-blue-500 ml-2"></i>' : ''}
            </div>
            <div class="flex items-center text-sm text-gray-500">
              <i data-lucide="map-pin" class="w-4 h-4 mr-1"></i>
              ${item.location}
              <i data-lucide="clock" class="w-4 h-4 ml-3 mr-1"></i>
              ${new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <div class="grid grid-cols-${Math.min(item.images.length, 3)} gap-2">
          ${item.images.map(image => `
            <img src="${image}" 
                 alt="Product Image" 
                 class="w-full h-32 object-cover rounded-lg"
                 onerror="this.src='/placeholder-product.png'">
          `).join('')}
        </div>
      </div>

      <div class="mt-4">
        <h2 class="text-2xl font-semibold">${item.name}</h2>
        <div class="flex items-center space-x-2 mt-2">
          <span class="text-2xl font-bold text-green-600">${item.currency} ${parseFloat(item.price).toLocaleString()}</span>
          <span class="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-sm">Negotiable</span>
        </div>
        <p class="mt-2 text-gray-600">${item.description}</p>
        <p class="mt-2 text-sm text-gray-500">Category: ${item.category}</p>
      </div>
    </div>
  `;

  return itemDiv;
};**/

// Image Preview Handling
const handleImagePreview = (() => {
  let currentFiles = [];

  const updateFileList = (fileInput, files) => {
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;
    currentFiles = files;
  };

  return (event) => {
    const files = Array.from(event.target.files);
    const previewContainer = document.getElementById('imagePreview');
    const fileInput = event.target;

    try {
      validateFiles(files);
      previewContainer.innerHTML = '';
      currentFiles = files;
      
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewDiv = document.createElement('div');
          previewDiv.className = 'relative inline-block';
          previewDiv.innerHTML = `
            <div class="relative group">
              <img src="${e.target.result}" 
                   class="w-24 h-24 object-cover rounded-lg m-2">
              <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 
                          transition-opacity duration-200 rounded-lg m-2 flex items-center justify-center">
                <button type="button" class="text-white hover:text-red-500 transition-colors duration-200">
                  <i data-lucide="trash-2" class="w-6 h-6"></i>
                </button>
              </div>
            </div>
            <span class="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded-full m-3">
              ${formatFileSize(file.size)}
            </span>
          `;

          previewDiv.querySelector('button').onclick = () => {
            previewDiv.remove();
            currentFiles = currentFiles.filter((_, i) => i !== index);
            updateFileList(fileInput, currentFiles);
          };

          previewContainer.appendChild(previewDiv);
          lucide.createIcons();
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      showNotification(error.message);
      event.target.value = '';
      previewContainer.innerHTML = '';
      currentFiles = [];
    }
  };
})();
/**
// API Functions
const fetchItems = async (searchQuery = '') => {
  const container = document.getElementById('postedItems');
  container.innerHTML = Array(4).fill(createLoadingSkeleton()).join('');

  try {
    const url = new URL(`${CONFIG.API_BASE_URL}/items`);
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }

    const items = await response.json();
    container.innerHTML = '';
    
    if (items.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <i data-lucide="package-search" class="w-16 h-16 mx-auto text-gray-400 mb-4"></i>
          <p class="text-gray-500">No items found</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    items.forEach(item => {
      container.appendChild(createItemElement(item));
    });

    lucide.createIcons();
  } catch (error) {
    console.error('Error fetching items:', error);
    showNotification('Failed to fetch items. Please try again later.');
    container.innerHTML = `
      <div class="text-center py-8">
        <i data-lucide="alert-triangle" class="w-16 h-16 mx-auto text-red-400 mb-4"></i>
        <p class="text-gray-500">Failed to load items. Please try again later.</p>
      </div>
    `;
    lucide.createIcons();
  }
};**/

const uploadItem = async (formData) => {
  const token = getAuthToken();
  if (!token) {
    throw new UploadError('Please log in to upload items');
  }

  const response = await fetch(`${CONFIG.API_BASE_URL}/items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new UploadError(
      data.error || 'Failed to upload item',
      `Status: ${response.status}, Response: ${JSON.stringify(data)}`
    );
  }

  return data;
};

// Form Handling
const handleFormSubmit = async (event) => {
  event.preventDefault();
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;

  try {
    // Validate form data
    const requiredFields = ['name', 'price', 'description', 'location', 'category'];
    for (const field of requiredFields) {
      const input = form.querySelector(`#${field}`);
      if (!input.value.trim()) {
        throw new UploadError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      }
    }

    // Validate files
    const files = form.querySelector('#images').files;
    validateFiles(files);

    // Prepare form data
    //const formData = new FormData(form);
    const formData = new FormData(form);

// Ensure the fields are included in the FormData
formData.append('name', document.getElementById('name').value);
formData.append('price', document.getElementById('price').value);
formData.append('description', document.getElementById('description').value);
formData.append('currency', document.getElementById('currency').value);
formData.append('category', document.getElementById('category').value);
formData.append('location', document.getElementById('location').value);

    // Update UI
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <i data-lucide="loader" class="w-5 h-5 animate-spin inline-block"></i>
      Uploading...
    `;
    lucide.createIcons();

    // Upload
    const item = await uploadItem(formData);
    showNotification('Item uploaded successfully!', 'success');
    
    // Reset form
    form.reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('uploadFormContainer').classList.add('hidden');
    
    // Refresh items
    await fetchItems();
  } catch (error) {
    console.error('Upload error:', error);
    showNotification(error.message);
    if (error.technical) {
      console.error('Technical details:', error.technical);
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initial items fetch
  fetchItems();

  // Setup form handling
  const form = document.getElementById('uploadForm');
  form.addEventListener('submit', handleFormSubmit);

  // Setup image input handling
  const imageInput = document.getElementById('images');
  imageInput.addEventListener('change', handleImagePreview);

  // Setup upload button toggle
  const uploadButton = document.getElementById('uploadButton');
  const uploadFormContainer = document.getElementById('uploadFormContainer');
  uploadButton.addEventListener('click', () => {
    uploadFormContainer.classList.toggle('hidden');
  });

  // Setup search with debounce
  const searchInput = document.getElementById('searchQuery');
  let debounceTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      fetchItems(e.target.value.trim());
    }, CONFIG.DEBOUNCE_DELAY);
  });

  // Initialize Lucide icons
  lucide.createIcons();
});