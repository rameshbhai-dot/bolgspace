document.addEventListener('DOMContentLoaded', function () {
  var editorContainer = document.getElementById('editor');
  if (!editorContainer) return;

  // Initialize Quill
  var quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Start writing your story...',
    modules: {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          ['link', 'image'],
          [{ align: [] }],
          ['clean']
        ],
        handlers: {
          image: imageHandler
        }
      }
    }
  });

  // Custom image upload handler
  function imageHandler() {
    var input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = function () {
      var file = input.files[0];
      if (!file) return;

      var formData = new FormData();
      formData.append('image', file);

      fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (data.url) {
            var range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', data.url);
            quill.setSelection(range.index + 1);
          }
        })
        .catch(function (error) {
          console.error('Image upload failed:', error);
          alert('Image upload failed. Please try again.');
        });
    };
  }

  // Load existing content when editing
  var existingContent = document.getElementById('existingContent');
  if (existingContent && existingContent.value) {
    quill.root.innerHTML = existingContent.value;
  }

  // Sync Quill content to hidden field on submit
  var form = document.getElementById('postForm');
  var contentField = document.getElementById('contentField');

  if (form && contentField) {
    form.addEventListener('submit', function (e) {
      // Sync content
      contentField.value = quill.root.innerHTML;

      // Validate title
      var titleInput = document.getElementById('postTitle');
      if (titleInput && !titleInput.value.trim()) {
        e.preventDefault();
        alert('Please enter a title for your post.');
        titleInput.focus();
        return false;
      }

      // Validate content
      if (quill.getText().trim().length < 10) {
        e.preventDefault();
        alert('Please write some content for your post (at least 10 characters).');
        return false;
      }
    });
  }

  // Featured image preview
  var imageInput = document.getElementById('featuredImage');
  var imagePreview = document.getElementById('imagePreview');

  if (imageInput && imagePreview) {
    imageInput.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function (ev) {
          imagePreview.innerHTML = '<img src="' + ev.target.result + '" class="image-preview" alt="Preview">';
        };
        reader.readAsDataURL(file);
      }
    });
  }
});
