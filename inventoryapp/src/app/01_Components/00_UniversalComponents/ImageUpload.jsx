import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { Button } from '@mui/material';

import UploadIcon from '@mui/icons-material/Upload';

import { AlertContext } from '../../02_Providers/AlertProvider';

import { itemUrls } from '@urls';
import { post } from '../../axiosClient';

/**
 * Prompts the user to select an image to set as the item cards background
 */
const ImageUpload = ({ itemId, sx }) => {
  const { showAlert } = useContext(AlertContext);

  const handleUpload = async (event) => {
    const [selectedImage] = event.target.files;

    if (!selectedImage) {
      showAlert('No image selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const { data } = await post(itemUrls.uploadImage, formData, { itemId });

      if (data) {
        showAlert('Image uploaded', 'success');
      } else {
        showAlert(`Upload failed: ${data}`);
      }
    } catch (error) {
      console.error(error);
      showAlert('Error uploading image');
    }
  };

  return (
    <Button
      variant='contained'
      component='label'
      startIcon={<UploadIcon />}
      sx={sx}
    >
      Upload Image
      <input type='file' accept='image/*' hidden onChange={handleUpload} />
    </Button>
  );
};

ImageUpload.propTypes = {
  itemId: PropTypes.string,
  sx: PropTypes.object,
};


export default ImageUpload;
