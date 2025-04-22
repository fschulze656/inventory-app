import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import {
  Card,
  CardActionArea,
  CardContent,
  Typography
} from '@mui/material';

import { itemUrls } from '@urls';
import { get } from '../../axiosClient';

import './styles/ItemCard.css';

const dimensions = { width: '100%', height: '150px' };

/**
 * Displays an item's name, `ObjectId` and current stock
 */
const ItemCard = ({ itemId, itemName, inStock }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await get(itemUrls.getImage, { itemId }, { responseType: 'blob' });
        if (data) {
          const url = URL.createObjectURL(data);
          setImage(url);
        }
      } catch (error) {
        setImage(null);
        console.error(error);
      }
    })();

    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [itemId]);

  return (
    <div style={dimensions}>
      <Card
        variant='outlined'
        sx={{
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: 'hsla(0, 0%, 10%, 0.7)',
          position: 'relative'
        }}
      >
        {image && <img
          src={image}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            height: '100%',
            width: '100%',
            objectFit: 'cover',
            zIndex: -1
          }}
        />}
        <CardActionArea sx={{ ...dimensions, position: 'relative', zIndex: 1 }}>
          <Link to={`/itemDetail?id=${itemId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <CardContent className='card-content'>
              <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                {itemId}
              </Typography>
              <div className='name-container'>
                <Typography className='item-name' variant='h5' component='div'>
                  {itemName}
                </Typography>
              </div>
              <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                In Stock: {inStock}
              </Typography>
            </CardContent>
          </Link>
        </CardActionArea>
      </Card>
    </div>
  );
};

ItemCard.propTypes = {
  itemId: PropTypes.string,
  itemName: PropTypes.string,
  inStock: PropTypes.number,
};

export default ItemCard;
