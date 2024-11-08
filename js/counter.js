// Function to update the character counter within the same element, ignoring extra spaces and newlines
function updateCharCounter(element) {
    const max = parseInt(element.dataset.max, 10) || 100;
    const min = parseInt(element.dataset.min, 10) || 10;

    // Clean content by removing extra spaces and newlines
    const content = element.textContent.replace(/\s+/g, ' ').trim();
    const charCount = content.length;

    // Update the data-counter attribute with the character count
    element.setAttribute('data-counter', `${charCount}/${max}`);

    // Reset all counter classes
    element.classList.remove('counter-normal', 'counter-warning', 'counter-limit');

    // Change counter color based on character limits
    if (charCount >= min && charCount <= max) {
        element.classList.add('counter-normal'); // Within acceptable range
    } else if (charCount < min) {
        element.classList.add('counter-warning'); // Below minimum
    } else {
        element.classList.add('counter-limit'); // Exceeds maximum
    }
}

// Apply the counter to each element with data-max and data-min
document.querySelectorAll('[data-max][data-min]').forEach((element) => {
    updateCharCounter(element); // Initial counter setup

    // Listen for content changes within the editable element
    element.addEventListener('input', () => updateCharCounter(element));
});