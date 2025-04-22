import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  Button,
  IconButton,
  Link as MUILink,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

import { ImageUpload } from '../../00_UniversalComponents';
import { AlertContext } from '../../../02_Providers/AlertProvider';

import { itemUrls } from '@urls';
import { get, post } from '../../../axiosClient';

import '../styles/ItemDetail.css';

/**
 * Displays the details and stock history of an item
 */
const ItemInfo = ({ item, itemUpdate, amount, setShowQRCode }) => {
  const { isMobile } = useSelector((state) => state.device);
  const { showAlert } = useContext(AlertContext);
  const [editContent, setEditContent] = useState({});
  const [materials, setMaterials] = useState([]);
  const [editItem, setEditItem] = useState(false);

  const handleEditOpen = () => {
    setEditItem(true);
    setEditContent({
      location: item.location || '',
      unitPrice: item.unitPrice || null,
      minAllowedQuantity: item.minAllowedQuantity || null,
      shopLink: item.shopLink || ''
    });
  };

  const handleEditSave = async () => {
    try {
      setEditItem(false);
      const response = await post(itemUrls.updateItem, editContent, { itemId: item._id });
      showAlert(response.data, 'success');
    } catch (error) {
      if (error.status === 304) return showAlert(error.response.statusText, 'info');
      showAlert(error.response.data);
    }
  };

  useEffect(() => {
    if (item._id) {
      (async () => {
        const { data } = await get(itemUrls.getRawBomMaterials, { itemId: item._id });
        setMaterials(data);
      })();
    }
  }, [itemUpdate, item._id]);

  return (
    <Paper sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      marginTop: '10px',
      padding: '10px',
      gap: '10px',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 10
      }}>
        <ImageUpload itemId={item._id} sx={{ width: isMobile ? '100%' : '30%' }} />
        <Button
          variant='outlined'
          sx={{ width: isMobile ? '100%' : '70%' }}
          onClick={() => setShowQRCode(true)}
        >
          QR Code
        </Button>
      </div>
      <Typography variant='h5' align='center'>
        {editItem
          ? <>
            Edit
            <IconButton
              size='small'
              onClick={handleEditSave}
            >
              <SaveIcon fontSize='inherit' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => setEditItem(false)}
            >
              <CancelIcon fontSize='inherit' />
            </IconButton>
          </>
          : <>
            Details
            <IconButton
              size='small'
              onClick={handleEditOpen}
            >
              <EditIcon fontSize='inherit' />
            </IconButton>
          </>}
      </Typography>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap',
          gap: 5
        }}>
          <Typography variant='h6' width={isMobile ? '100%' : '48%'}>
            In Stock{item.measurementUnit ? ` (${item.measurementUnit})` : ''}: {item.inStock}
          </Typography>
          <Typography variant='h6' width={isMobile ? '100%' : '48%'}>
            Total Added: {item.totalIn}
          </Typography>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap',
          gap: 5
        }}>
          {editItem
            ? <>
              <TextField
                label='Location'
                size='small'
                sx={{ width: isMobile ? '100%' : '48%' }}
                defaultValue={item.location}
                onChange={(event) => setEditContent(
                  (prev) => ({ ...prev, location: event.target.value })
                )}
              />
              <TextField
                label='Price Per Unit'
                size='small'
                sx={{ width: isMobile ? '100%' : '48%' }}
                type='number'
                slotProps={{
                  htmlInput: {
                    min: 0
                  }
                }}
                defaultValue={item.unitPrice}
                onChange={(event) => setEditContent(
                  (prev) => ({ ...prev, unitPrice: event.target.value })
                )}
              />
              <TextField
                label='Min Allowed Quantity'
                size='small'
                sx={{ width: isMobile ? '100%' : '48%' }}
                type='number'
                slotProps={{
                  htmlInput: {
                    min: 0
                  }
                }}
                defaultValue={item.minAllowedQuantity}
                onChange={(event) => setEditContent(
                  (prev) => ({ ...prev, minAllowedQuantity: event.target.value })
                )}
              />
              <TextField
                label='Shop Link'
                size='small'
                sx={{ width: isMobile ? '100%' : '48%' }}
                defaultValue={item.shopLink}
                onChange={(event) => setEditContent(
                  (prev) => ({ ...prev, shopLink: event.target.value })
                )}
              />
            </>
            : <>
              <Typography variant='h6' width={isMobile ? '100%' : '48%'}>
                Location: {item.location || 'Not set'}
              </Typography>
              <Typography variant='h6' width={isMobile ? '100%' : '48%'}>
                Price Per Unit: {item.unitPrice || 'Not set'}
              </Typography>
              <Typography variant='h6' width={isMobile ? '100%' : '48%'}>
                Min Allowed Quantity: {item.minAllowedQuantity || 'Not set'}
              </Typography>
              <Typography variant='h6' textOverflow='ellipsis' overflow='hidden' whiteSpace='nowrap' width={isMobile ? '100%' : '48%'}>
                Shop Link: {item.shopLink ? <MUILink
                  href={item.shopLink}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {item.shopLink}
                </MUILink> : 'Not set'}
              </Typography>
            </>}
        </div>
      </div>
      {item.bomDetails?.length > 0
        ? <>
          <Typography variant='h5' align='center'>BOM</Typography>
          <TableContainer sx={{ height: '30vh' }}>
            <Table stickyHeader size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: 'transparent' }} />
                  <TableCell sx={{ backgroundColor: 'transparent' }} />
                  <TableCell
                    colSpan={2}
                    align='center'
                    sx={{
                      border: '1px solid rgba(81, 81, 81, 1)',
                      borderBottom: '0px'
                    }}
                  >
                    Required
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ borderLeft: '1px solid rgba(81, 81, 81, 1)' }}>
                    Item
                  </TableCell>
                  <TableCell>In Stock</TableCell>
                  <TableCell>Per Unit</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(81, 81, 81, 1)' }}>
                    In Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {item.bomDetails.map((bomItem, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Link
                        to={`/itemDetail?id=${bomItem._id}`}
                        style={{ color: 'white' }}
                      >
                        {bomItem.name}
                      </Link>
                    </TableCell>
                    <TableCell>{bomItem.inStock}</TableCell>
                    <TableCell>
                      {item.bom.filter((element) => element.itemId === bomItem._id)[0].requiredQuantity}
                    </TableCell>
                    <TableCell>
                      {item.bom.filter((element) => element.itemId === bomItem._id)[0].requiredQuantity * amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant='h5' align='center'>Raw Materials</Typography>
          <TableContainer sx={{ height: '30vh' }}>
            <Table stickyHeader size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: 'transparent' }} />
                  <TableCell sx={{ backgroundColor: 'transparent' }} />
                  <TableCell
                    colSpan={2}
                    align='center'
                    sx={{
                      border: '1px solid rgba(81, 81, 81, 1)',
                      borderBottom: '0px'
                    }}
                  >
                    Required
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ borderLeft: '1px solid rgba(81, 81, 81, 1)' }}>
                    Item
                  </TableCell>
                  <TableCell>In Stock</TableCell>
                  <TableCell>Per Unit</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(81, 81, 81, 1)' }}>
                    In Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.map((rawMat, index) => {
                  const total = materials.filter((element) => element.itemId === rawMat.itemId)[0].requiredQuantity * amount;
                  const insufficient = rawMat.inStock < total;
                  return (
                    <TableRow key={index} sx={{
                      backgroundColor: insufficient ? 'red' : ''
                    }}>
                      <TableCell>
                        <Link
                          to={`/itemDetail?id=${rawMat.itemId}`}
                          style={{ color: 'white' }}
                        >
                          {rawMat.name}
                        </Link>
                      </TableCell>
                      <TableCell>{rawMat.inStock}{insufficient ? ` + ${total - rawMat.inStock}` : ''}</TableCell>
                      <TableCell>
                        {materials.filter((element) => element.itemId === rawMat.itemId)[0].requiredQuantity}
                      </TableCell>
                      <TableCell>
                        {total}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </> : null}
      {item.properties?.length > 0
        ? <>
          <Typography variant='h5' align='center'>Properties</Typography>
          <TableContainer sx={{ height: '25vh' }}>
            <Table stickyHeader size='small'>
              <TableHead sx={{ backgroundColor: 'gray' }}>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>Value & Unit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {item.properties.map((prop, index) => (
                  <TableRow key={index}>
                    <TableCell>{prop.name}</TableCell>
                    <TableCell>{prop.value} {prop.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </> : null}
    </Paper>
  );
};

ItemInfo.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string,
    location: PropTypes.string,
    unitPrice: PropTypes.number,
    minAllowedQuantity: PropTypes.number,
    shopLink: PropTypes.string,
    inStock: PropTypes.number,
    totalIn: PropTypes.number,
    measurementUnit: PropTypes.string,
    bomDetails: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      inStock: PropTypes.number,
    })),
    bom: PropTypes.arrayOf(PropTypes.shape({
      itemId: PropTypes.string,
      requiredQuantity: PropTypes.number,
    })),
    properties: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      unit: PropTypes.string,
    })),
  }),
  itemUpdate: PropTypes.number,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setShowQRCode: PropTypes.func,
};

export default ItemInfo;
