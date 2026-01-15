// User button dropdown toggle functionality
document.getElementById("userButton").addEventListener("click", function() {
    var dropdown = document.getElementById("userDropdown");
    // Toggle visibility of the dropdown
    dropdown.classList.toggle("show");
});

// Logout functionality for dropdown link
document.getElementById("logout-link").addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the link from navigating
    window.location.href = "/client/index.html"; 
});

const images = [
    {
      src: "https://www.momondo.com/rimg/himg/90/5f/72/expedia_group-2733205-249207-903697.jpg?width=968&height=607&crop=true",
      alt: "Building"
    },
    {
        src: "https://www.momondo.com/rimg/himg/01/57/b9/expedia_group-2733205-8d8ed2-044850.jpg?width=968&height=607&crop=true",
        alt: "Front Desk"
      },
    {
      src: "https://www.momondo.com/rimg/himg/7e/77/6a/expedia_group-2733205-3136453-031524.jpg?width=968&height=607&crop=true",
      alt: "Outdoor"
    },
    {
      src: "https://www.momondo.com/rimg/himg/58/3a/b4/expedia_group-2733205-219572729-038519.jpg?width=968&height=607&crop=true",
      alt: "Restaurant"
    },
    {
      src: "https://www.momondo.com/rimg/himg/e3/6c/41/expedia_group-2733205-100362006-927217.jpg?width=968&height=607&crop=true",
      alt: "Restaurant"
    },
    {
      src: "https://www.momondo.com/rimg/himg/2d/d3/2b/expedia_group-2733205-04f9e5-783070.jpg?width=968&height=607&crop=true",
      alt: "Bar"
    },
  ];
  
  let currentIndex = 0;
  
  function updateGallery() {
    const gallery = document.querySelector('.gallery-images');
    gallery.innerHTML = "";
  
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    const nextIndex = (currentIndex + 1) % images.length;
  
    // Function to create image block with caption
    function createImageBlock(imgObj, className) {
      const imageBlock = document.createElement('div');
      imageBlock.className = 'image-block';
  
      const img = document.createElement('img');
      img.src = imgObj.src;
      img.alt = imgObj.alt;
      img.className = className;
  
      const caption = document.createElement('div');
      caption.className = 'caption';
      caption.textContent = imgObj.alt;
  
      imageBlock.appendChild(img);
      imageBlock.appendChild(caption);
  
      return imageBlock;
    }
  
    // Create previous, current, and next images with captions
    const prevBlock = createImageBlock(images[prevIndex], "side");
    const currentBlock = createImageBlock(images[currentIndex], "current");
    const nextBlock = createImageBlock(images[nextIndex], "side");
  
    gallery.appendChild(prevBlock);
    gallery.appendChild(currentBlock);
    gallery.appendChild(nextBlock);
  }
  
  
  document.getElementById('prevBtn').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateGallery();
  });
  
  document.getElementById('nextBtn').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateGallery();
  });
  
  // Initialize
  updateGallery();