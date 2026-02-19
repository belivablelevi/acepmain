// Image Upload without Firebase Storage
// Uses Imgur API (Free - no account needed for anonymous uploads)

const IMGUR_CLIENT_ID = 'YOUR_CLIENT_ID_HERE'; // Get from https://api.imgur.com/oauth2/addclient

// Upload image to Imgur
async function uploadImageToImgur(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.link; // Returns direct image URL
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('Imgur upload error:', error);
    throw error;
  }
}

// Convert image to base64 (for Firestore storage - under 1MB only)
function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Compress image before upload
async function compressImage(file, maxWidth = 1200) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.85);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Export functions
window.imageUpload = {
  uploadImageToImgur,
  convertImageToBase64,
  compressImage
};
