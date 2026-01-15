document.addEventListener('DOMContentLoaded', function() {
  
  // Dropdown toggle
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdown = dropdownToggle?.closest('.dropdown');

  if (dropdownToggle && dropdown) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default anchor behavior
      dropdown.classList.toggle('active');
    });
  };
});