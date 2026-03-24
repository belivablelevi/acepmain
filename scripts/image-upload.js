/**
 * ACEP — Firebase Storage upload helpers for challenge photos
 */
(function () {
  const MAX_BYTES = 5 * 1024 * 1024;
  const ALLOWED = /^image\/(jpeg|jpg|png|gif|webp)$/i;

  window.acepUpload = {
    MAX_BYTES,

    validateFile(file) {
      if (!file || !(file instanceof File)) {
        return { ok: false, message: 'Please choose a photo to upload.' };
      }
      if (!ALLOWED.test(file.type)) {
        return { ok: false, message: 'Please upload a JPG, PNG, GIF, or WebP image.' };
      }
      if (file.size > MAX_BYTES) {
        return { ok: false, message: 'That file is too large. Maximum size is 5 MB.' };
      }
      return { ok: true };
    },

    /**
     * @returns {Promise<string>} download URL
     */
    async uploadSubmissionPhoto(userId, file) {
      const v = this.validateFile(file);
      if (!v.ok) {
        throw new Error(v.message);
      }
      const { storage } = window.acep;
      const safeName = file.name.replace(/[^\w.\-]/g, '_');
      const path = `submissions/${userId}/${Date.now()}_${safeName}`;
      const ref = storage.ref(path);
      const meta = { contentType: file.type || 'image/jpeg' };
      await ref.put(file, meta);
      return ref.getDownloadURL();
    },
  };
})();
