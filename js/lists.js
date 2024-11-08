// Function to toggle edit mode for a section
function toggleEditMode(button) {
    const section = button.closest(".position-relative");
    section.classList.toggle("edit-mode");
  }

  // Initialize delete buttons for pre-existing items with data-delete="true"
  document.querySelectorAll('li[data-delete="true"]').forEach((item) => {
    addDeleteButton(item);
  });

  // Function to add a delete button to a specified list item
  function addDeleteButton(listItem) {
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => listItem.remove();

    // Insert delete button after the editable span, making it non-editable
    listItem.appendChild(deleteButton);
  }

  // Function to add a new list item to a specified list
  function addListItem(listId) {
    const list = document.getElementById(listId);
    const newItem = document.createElement("li");

    // Create a span for the editable content
    const editableContent = document.createElement("span");
    editableContent.contentEditable = "true";
    editableContent.textContent = "[New List Item]";
    editableContent.setAttribute("data-max", "120");
    editableContent.setAttribute("data-min", "40");
    editableContent.setAttribute("data-counter", "");
    editableContent.classList.add("counter-normal");

    // Append the editable content and add the new item to the list
    newItem.appendChild(editableContent);
    list.appendChild(newItem);

    // Add a delete button to the new item
    addDeleteButton(newItem);

    // Update the character counter for the new editable span
    updateCharCounter(editableContent);

    // Add event listener to update the counter on content change within the editable span
    editableContent.addEventListener("input", () => updateCharCounter(editableContent));
  }