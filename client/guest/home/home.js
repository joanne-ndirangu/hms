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
      src: "http://localhost:5000/images/osnet.jpg",
      alt: "Building"
    },
    {
        src: "http://localhost:5000/images/frontdesk.png",
        alt: "Front Desk"
      },
    {
      src: "http://localhost:5000/images/outdoor.png",
      alt: "Outdoor"
    },
    {
      src: "http://localhost:5000/images/restaurant1.png",
      alt: "Restaurant"
    },
    {
      src: "http://localhost:5000/images/restaurant2.png",
      alt: "Restaurant"
    },
    {
      src: "http://localhost:5000/images/bar.png",
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