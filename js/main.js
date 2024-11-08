let imageSuggestionCount = 0; // Variable to track the number of active feedbacks
let feedbackMode = false; // Variable to track imageSuggestion mode
let selectedSuggestionImage = null; // Variable to hold the clicked image element
let commentsArray = []; // Array to hold comments for the selected image
let filesArray = []; // Array to store multiple files for each image

// Toggle imageSuggestion mode and show/hide cursor text
function toggleFeedbackMode() {
  feedbackMode = !feedbackMode;

  const feedbackButton = document.querySelector('.imageSuggestion-toggle-btn');
  feedbackButton.classList.toggle('active', feedbackMode);

  document.body.classList.toggle('imageSuggestion-mode', feedbackMode);

  const cursorText = document.getElementById('cursorText');
  cursorText.style.display = feedbackMode ? 'block' : 'none';
}

// Update cursor text position when imageSuggestion mode is active
document.addEventListener('mousemove', (e) => {
  const cursorText = document.getElementById('cursorText');
  if (feedbackMode) {
    cursorText.style.left = `${e.pageX + 15}px`;
    cursorText.style.top = `${e.pageY + 15}px`;
  }
});

// Event listener for images with the imageSuggestion-img class in imageSuggestion mode
document.querySelectorAll('.imageSuggestion-img').forEach(img => {
  img.addEventListener('click', (e) => {
    if (feedbackMode) {
      selectedSuggestionImage = e.target;
      showImageSuggestionTooltip(e);
    }
  });
});

// Function to update the imageSuggestion counter display
function updateImageSuggestionCounter() {
  document.getElementById("imageSuggestionCounter").textContent = imageSuggestionCount;
}

// Show tooltip near the clicked image and load any existing imageSuggestion
function showImageSuggestionTooltip(event) {
  const tooltip = document.getElementById("imageSuggestionTooltip");
  tooltip.style.display = "block";
  tooltip.style.left = `${event.pageX + 10}px`;
  tooltip.style.top = `${event.pageY + 10}px`;

  commentsArray = JSON.parse(selectedSuggestionImage.getAttribute('data-comments') || '[]');
  filesArray = JSON.parse(selectedSuggestionImage.getAttribute('data-imageSuggestion-files') || '[]'); // Retrieve saved files
  renderComments();
  renderFileList(); // Update file preview display
  togglePinVisibility(selectedSuggestionImage);
}

// Save imageSuggestion and close the tooltip
function saveFeedback() {
  const feedbackText = document.getElementById("feedbackInput").value;
  selectedSuggestionImage.setAttribute('data-imageSuggestion', feedbackText);
  closeTooltip();
}

// Close the tooltip and save the imageSuggestion data
function closeTooltip() {
  selectedSuggestionImage.setAttribute('data-comments', JSON.stringify(commentsArray));
  selectedSuggestionImage.setAttribute('data-imageSuggestion-files', JSON.stringify(filesArray));

  document.getElementById("imageSuggestionTooltip").style.display = "none";
  document.getElementById("newCommentInput").value = "";
  togglePinVisibility(selectedSuggestionImage);
}

// Function to add a comment and render it
function addComment() {
  const commentInput = document.getElementById("newCommentInput");
  const commentText = commentInput.value.trim();

  if (commentText) {
    // Detect if the comment is a URL
    const isUrl = /^(http|https):\/\/[^\s$.?#].[^\s]*$/gm.test(commentText);

    // Store as an object with type and content
    if (isUrl) {
      commentsArray.push({ type: 'link', content: commentText });
    } else {
      commentsArray.push({ type: 'text', content: commentText });
    }

    renderComments();
    commentInput.value = "";

    if (!selectedSuggestionImage.getAttribute('data-comments')) {
      imageSuggestionCount++;
    }
    selectedSuggestionImage.setAttribute('data-comments', JSON.stringify(commentsArray));

    // Update the counter and pin visibility
    updateImageSuggestionCounter();
    togglePinVisibility(selectedSuggestionImage);
  }
}

// Render comments in the tooltip
function renderComments() {
  const commentsList = document.getElementById("commentsList");
  commentsList.innerHTML = "";

  commentsArray.forEach((comment, index) => {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment-item");

    // Create an element based on the comment type
    if (comment.type === 'link') {
      const commentLink = document.createElement("a");
      commentLink.href = comment.content;
      commentLink.target = "_blank"; // Opens link in a new tab
      commentLink.textContent = comment.content;
      commentDiv.appendChild(commentLink);
    } else {
      const commentText = document.createElement("p");
      commentText.textContent = comment.content;
      commentDiv.appendChild(commentText);
    }

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.onclick = () => editComment(index);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteComment(index);

    commentDiv.appendChild(editButton);
    commentDiv.appendChild(deleteButton);
    commentsList.appendChild(commentDiv);
  });
}

// Edit a comment
function editComment(index) {
  const newComment = prompt("Edit your comment:", commentsArray[index]);
  if (newComment !== null) {
    commentsArray[index] = newComment.trim();
    renderComments();
  }
}

// Delete a comment and update imageSuggestion count if necessary
function deleteComment(index) {
  commentsArray.splice(index, 1);
  renderComments();

  if (commentsArray.length === 0 && filesArray.length === 0) {
    imageSuggestionCount--;
    updateImageSuggestionCounter();
  }
  selectedSuggestionImage.setAttribute('data-comments', JSON.stringify(commentsArray));
  togglePinVisibility(selectedSuggestionImage);
}

// Function to handle multiple file previews and show immediately
function previewFiles(event) {
  const fileInput = event.target.files;

  // Clear previous files from array
  filesArray = []; 
  Array.from(fileInput).forEach((file) => {
    const reader = new FileReader();

    reader.onload = function(e) {
      const fileDataUrl = e.target.result;

      // Check if the file is a PDF
      if (file.type === "application/pdf") {
        renderPDFPreview(fileDataUrl, file.name);
      } 
      // Check if the file is an image (.jpg, .png)
      else if (file.type.startsWith("image/")) {
        filesArray.push({ name: file.name, data: fileDataUrl, type: file.type });
        renderFileList();
      } 
      // For other files, use a generic thumbnail
      else {
        filesArray.push({
          name: file.name,
          data: fileDataUrl,
          type: file.type,
          preview: "path/to/generic-thumbnail.png" // Path to a generic icon image
        });
        renderFileList();
      }
    };

    // Read files as Data URL to handle previews and downloads
    reader.readAsDataURL(file);
  });

  // Save files to the selected image element's data attribute
  selectedSuggestionImage.setAttribute('data-imageSuggestion-files', JSON.stringify(filesArray));
}


// Function to render a PDF preview (first page as an image) and store for download
function renderPDFPreview(pdfDataUrl, fileName) {
  const loadingTask = pdfjsLib.getDocument(pdfDataUrl);

  loadingTask.promise.then(pdf => {
    pdf.getPage(1).then(page => {
      const scale = 0.5; // Scale down for thumbnail size
      const viewport = page.getViewport({ scale });

      // Create a canvas element to render the PDF page
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      page.render(renderContext).promise.then(() => {
        // Convert the canvas to a data URL for preview
        const pdfPreviewDataUrl = canvas.toDataURL();

        // Store preview and download versions separately in filesArray
        filesArray.push({
          name: fileName,
          preview: pdfPreviewDataUrl,   // Preview version (image)
          data: pdfDataUrl,             // Full PDF for download
          type: "application/pdf"
        });

        // Render the updated file list with the PDF preview
        renderFileList();
      });
    });
  }).catch(error => {
    console.error("Error rendering PDF:", error);
  });
}


// Render the file list in the tooltip, showing previews for images, PDFs, and generic files
function renderFileList() {
  const fileListContainer = document.getElementById("fileListContainer");
  fileListContainer.innerHTML = ""; // Clear previous file list

  filesArray.forEach((file, index) => {
    const fileDiv = document.createElement("div");
    fileDiv.classList.add("file-item");

    // Show image or PDF previews
    if (file.type.startsWith("image/") || (file.type === "application/pdf" && file.preview)) {
      const img = document.createElement("img");
      img.src = file.preview || file.data; // Use preview if available
      img.style.maxWidth = "100px";
      img.style.marginRight = "10px";
      fileDiv.appendChild(img);
    } 
    // Show generic thumbnail for other file types
    else {
      const genericIcon = document.createElement("img");
      genericIcon.src = "https://placehold.co/100x100/000000/FFFFFF/png?text=File"; // URL for generic icon
      genericIcon.alt = "File Preview";
      genericIcon.style.maxWidth = "100px";
      genericIcon.style.marginRight = "10px";
      fileDiv.appendChild(genericIcon);
    }

    // Download link or button
    const downloadLink = document.createElement("a");
    downloadLink.href = file.data;
    downloadLink.download = file.name;
    downloadLink.textContent = `Download ${file.name}`;
    downloadLink.style.marginRight = "10px";
    fileDiv.appendChild(downloadLink);

    // Delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteFile(index);
    fileDiv.appendChild(deleteButton);

    fileListContainer.appendChild(fileDiv);
  });

  // Render "Download All" button if there are files in the array
  if (filesArray.length > 0) {
    renderDownloadAllButton();
  }
}


// Delete an individual file and update display
function deleteFile(index) {
  filesArray.splice(index, 1);
  imageSuggestionCount--;
  updateImageSuggestionCounter();

  selectedSuggestionImage.setAttribute('data-imageSuggestion-files', JSON.stringify(filesArray));
  renderFileList();
  togglePinVisibility(selectedSuggestionImage);
}


// Toggle the visibility of the pin based on imageSuggestion data
function togglePinVisibility(imageElement) {
  const hasComments = imageElement.getAttribute('data-comments') && JSON.parse(imageElement.getAttribute('data-comments')).length > 0;
  const hasFiles = imageElement.getAttribute('data-imageSuggestion-files') && JSON.parse(imageElement.getAttribute('data-imageSuggestion-files')).length > 0;
  const pin = imageElement.closest('.image-container')?.querySelector('.imageSuggestion-pin');

  if (pin) {
    if (hasComments || hasFiles) {
      pin.classList.add("active");
    } else {
      pin.classList.remove("active");
    }
  }
}


// Function to render the "Download All" button with a hidden spinner
function renderDownloadAllButton() {
  const downloadAllButton = document.createElement("button");
  downloadAllButton.textContent = "Download All Files";
  downloadAllButton.onclick = downloadAllFiles;
  downloadAllButton.style.marginTop = "10px";
  downloadAllButton.id = "downloadAllButton"; // Set an ID to access later

  // Create the spinner element
  const spinner = document.createElement("span");
  spinner.classList.add("spinner-border", "spinner-border-sm", "ms-2");
  spinner.setAttribute("role", "status");
  spinner.setAttribute("aria-hidden", "true");
  spinner.style.display = "none"; // Hide spinner initially
  spinner.id = "downloadSpinner";

  // Append spinner to the button
  downloadAllButton.appendChild(spinner);

  // Check if the button is already in the container
  const existingButton = document.getElementById("fileListContainer").querySelector("#downloadAllButton");
  if (!existingButton) {
    document.getElementById("fileListContainer").appendChild(downloadAllButton);
  }
}


// Function to download all files as a ZIP with spinner feedback
function downloadAllFiles() {
  if (filesArray.length === 0) {
    alert("No files to download.");
    return;
  }

  // Show spinner
  const spinner = document.getElementById("downloadSpinner");
  spinner.style.display = "inline-block";

  const zip = new JSZip();
  filesArray.forEach((file) => {
    // For PDF, use the full data instead of the preview
    const base64Data = file.data.split(",")[1]; // Remove data URL prefix
    zip.file(file.name, base64Data, { base64: true });
  });

  // Generate and download the ZIP file
  zip.generateAsync({ type: "blob" }).then(function(content) {
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(content);
    downloadLink.download = "all_feedback_files.zip";
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }).finally(() => {
    // Hide spinner after download is complete
    spinner.style.display = "none";
  });
}