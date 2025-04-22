import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { AsyncAutocomplete } from '../00_UniversalComponents';
import { changeLocation } from '../02_Navigation/navSlice';
import { AlertContext } from '../../02_Providers/AlertProvider';

import { itemUrls, categoryUrls, projectUrls } from '@urls';
import { post } from '../../axiosClient';

import './styles/ItemCreator.css';

/**
 * Component used to create an item
 *
 * Name, stock, measurement unit and minimum allowed stock of the item need to be provided
 */
const ItemCreator = () => {
  const dispatch = useDispatch();
  const { isMobile } = useSelector((state) => state.device)
  const { showAlert } = useContext(AlertContext);
  const history = useHistory();
  const [reqQuantity, setReqQuantity] = useState('');
  const [projects, setProjects] = useState([]);
  const [itemProps, setItemProps] = useState([]);
  const [bomItem, setBomItem] = useState(null);
  const [category, setCategory] = useState(null);
  const [date, setDate] = useState(null);
  const [errors, setErrors] = useState({
    nameError: '',
    stockError: '',
    unitError: '',
    minStockError: ''
  });

  const [itemProp, setItemProp] = useState({
    name: '',
    value: '',
    unit: ''
  });

  const [content, setContent] = useState({
    name: '',
    unitPrice: '',
    inStock: '',
    measurementUnit: '',
    minAllowedQuantity: '',
    shopLink: '',
    location: '',
    bom: [],
    associatedProjects: [],
    category: null,
    properties: []
  });

  const validateInputs = () => {
    const { name, inStock, measurementUnit, minAllowedQuantity } = content;
    let isValid = true;

    if (!name) {
      setErrors((prev) => ({ ...prev, nameError: 'Please enter an item name' }));
      isValid = false;
    } else {
      setErrors((prev) => ({ ...prev, nameError: '' }));
    }

    if (!inStock) {
      setErrors((prev) => ({ ...prev, stockError: 'Please enter the initial stock' }));
      isValid = false;
    } else {
      setErrors((prev) => ({ ...prev, stockError: '' }));
    }

    if (!measurementUnit) {
      setErrors((prev) => ({ ...prev, unitError: 'Please enter a measurement unit' }));
      isValid = false;
    } else {
      setErrors((prev) => ({ ...prev, unitError: '' }));
    }

    if (!minAllowedQuantity) {
      setErrors((prev) => ({ ...prev, minStockError: 'Please enter the min allowed amount' }));
      isValid = false;
    } else {
      setErrors((prev) => ({ ...prev, minStockError: '' }));
    }

    return isValid;
  };

  const handleSave = async () => {
    if (validateInputs()) {
      projects.forEach((project) => {
        content.associatedProjects.push(project._id);
      });
      content.properties.push(...itemProps);
      try {
        const { data } = await post(itemUrls.createItem, { item: content, time: date.$d });
        history.push(`/itemDetail?id=${data}`);
      } catch (error) {
        showAlert(error.response.data);
      }
    }

  };

  useEffect(() => {
    dispatch(changeLocation('New Item'));
  }, []);

  return (
    <>
      <div className='page-container'>
        <div className='text-field-container'>
          <TextField
            label='Item Name'
            error={errors.nameError.length > 0}
            helperText={errors.nameError}
            value={content.name}
            onChange={(event) => {
              setContent((prevContent) => (
                { ...prevContent, name: event.target.value }
              ));
            }}
          />
          <Box sx={{
            display: 'flex',
            gap: 1
          }}>
            <TextField
              label='In Stock'
              error={errors.stockError.length > 0}
              helperText={errors.stockError}
              value={content.inStock}
              type='number'
              sx={{ width: '100%' }}
              onChange={(event) => {
                setContent((prevContent) => (
                  { ...prevContent, inStock: event.target.value }
                ));
              }}
            />
            <TextField
              label='Measured In'
              select
              fullWidth
              error={errors.unitError.length > 0}
              helperText={errors.unitError}
              value={content.measurementUnit}
              onChange={(event) => {
                setContent((prevContent) => (
                  { ...prevContent, measurementUnit: event.target.value }
                ));
              }}
            >
              <MenuItem value={'no.'}>no.</MenuItem>
              <MenuItem value={'cm'}>cm</MenuItem>
              <MenuItem value={'mm'}>mm</MenuItem>
              <MenuItem value={'l'}>l</MenuItem>
              <MenuItem value={'ml'}>ml</MenuItem>
            </TextField>
          </Box>
          <TextField
            label='Min Allowed Quantity'
            error={errors.minStockError.length > 0}
            helperText={errors.minStockError}
            value={content.minAllowedQuantity}
            type='number'
            onChange={(event) => {
              setContent((prevContent) => (
                { ...prevContent, minAllowedQuantity: event.target.value }
              ));
            }}
          />
          <TextField
            label='Item Price'
            value={content.unitPrice}
            type='number'
            onChange={(event) => {
              setContent((prevContent) => (
                { ...prevContent, unitPrice: event.target.value }
              ));
            }}
          />
          <TextField
            label='Shop Link'
            value={content.shopLink}
            onChange={(event) => {
              setContent((prevContent) => (
                { ...prevContent, shopLink: event.target.value }
              ));
            }}
          />
          <TextField
            label='Location'
            value={content.location}
            onChange={(event) => {
              setContent((prevContent) => (
                { ...prevContent, location: event.target.value }
              ));
            }}
          />
          <DateTimePicker
            label='Date Correction'
            format='YYYY/MM/DD HH:mm'
            timezone='UTC'
            viewRenderers={isMobile
              ? {}
              : {
                hours: null,
                minutes: null,
                seconds: null,
              }
            }
            onChange={(newTime) => setDate(newTime)}
          />
        </div>
        <div className='autocomplete-container'>
          <Box className='associated-projects'>
            <h3 style={{ textAlign: 'center' }}>Projects</h3>
            <div style={{ display: 'flex' }}>
              <AsyncAutocomplete
                multiple
                filterSelectedOptions
                dataUrl={projectUrls.getAllProjects}
                label={'Associated Projects'}
                localAlert={showAlert}
                sx={{ width: '100%' }}
                onChange={(_, newProject) => {
                  setProjects(newProject);
                }}
              />
            </div>
          </Box>
          <Box className='bom-container'>
            <h3 style={{ textAlign: 'center' }}>BOM</h3>
            <div style={{ display: 'flex', gap: '5px' }}>
              <AsyncAutocomplete
                dataUrl={itemUrls.getAllItems}
                label={'Item'}
                localAlert={showAlert}
                value={bomItem}
                size='small'
                sx={{ width: '60%' }}
                onChange={(_, item) => {
                  if (item) setBomItem(item);
                  else setBomItem(null);
                }}
              />
              <TextField
                sx={{ width: '150px' }}
                label='Required Quantity'
                value={reqQuantity}
                type='number'
                size='small'
                onChange={(event) => {
                  setReqQuantity(event.target.value)
                }}
              />
              <Button
                variant='contained'
                disableElevation
                startIcon={<AddIcon />}
                onClick={() => {
                  const { _id, name } = bomItem;
                  if (_id && reqQuantity) {
                    setContent((prevContent) => (
                      {
                        ...prevContent,
                        bom: [...prevContent.bom, {
                          itemId: _id,
                          itemName: name,
                          requiredQuantity: reqQuantity
                        }]
                      }
                    ));
                  }
                  setBomItem(null);
                  setReqQuantity('');
                }}
              >
                Add
              </Button>
            </div>
            {content.bom.length !== 0
              ? <TableContainer className='bom' >
                <Table size='small'>
                  <TableHead sx={{ backgroundColor: 'gray' }}>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Required Quantity</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {content.bom.map((element, itemIndex) => (
                      <TableRow key={itemIndex}>
                        <TableCell>{element.itemName}</TableCell>
                        <TableCell>{element.requiredQuantity}</TableCell>
                        <TableCell align='right'>
                          <IconButton
                            onClick={() => setContent({
                              ...content,
                              bom: content.bom.filter((_, index) => index !== itemIndex)
                            })}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer> : null}
          </Box>
          <Box className='category-container'>
            <h3 style={{ textAlign: 'center' }}>Category</h3>
            <AsyncAutocomplete
              dataUrl={categoryUrls.getAllCategories}
              label={'Category'}
              localAlert={showAlert}
              value={category}
              sx={{ width: '100%' }}
              onChange={(event, category) => {
                if (category) {
                  setCategory(category);
                  setItemProps(category.properties.map((prop) => ({ name: prop.name, value: 0, unit: prop.unit })));
                  setContent((prevContent) => ({ ...prevContent, category: category._id }));
                } else {
                  setCategory(null);
                  setItemProps([]);
                  setContent((prevContent) => ({ ...prevContent, category: null }));
                }
              }}
            />
            {itemProps.length !== 0
              ? <TableContainer component={Paper}>
                <Table size='small'>
                  <TableHead sx={{ backgroundColor: 'gray' }}>
                    <TableRow>
                      <TableCell>Property</TableCell>
                      <TableCell align='right'>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itemProps.map((prop, index) => (
                      <TableRow key={index}>
                        <TableCell>{prop.name}</TableCell>
                        <TableCell align='right'>
                          <TextField
                            size='small'
                            sx={{ width: '200px' }}
                            value={itemProps[index].value}
                            type='number'
                            slotProps={{
                              input: {
                                endAdornment: <InputAdornment position='end'>{prop.unit}</InputAdornment>
                              },
                              htmlInput: {
                                min: 0
                              }
                            }}
                            onChange={(event) => {
                              const { name, unit } = prop;
                              const { value } = event.target;
                              setItemProps((prevProps) => prevProps.map((prop, i) => (i === index ? { name, value, unit } : prop)));
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer> : null}
            <h3 style={{ textAlign: 'center' }}>Additional Properties</h3>
            <div style={{ display: 'flex', gap: 5 }}>
              <TextField
                label='Name'
                size='small'
                value={itemProp.name}
                sx={{ width: '45%' }}
                onChange={(event) => {
                  setItemProp((prevItemProp) => ({ ...prevItemProp, name: event.target.value }));
                }}
              />
              <TextField
                label='Value'
                type='number'
                size='small'
                value={itemProp.value}
                sx={{ width: '20%' }}
                onChange={(event) => {
                  setItemProp((prevItemProp) => ({ ...prevItemProp, value: event.target.value }));
                }}
              />
              <TextField
                label='Unit'
                size='small'
                value={itemProp.unit}
                sx={{ width: '20%' }}
                onChange={(event) => {
                  setItemProp((prevItemProp) => ({ ...prevItemProp, unit: event.target.value }));
                }}
              />
              <Button
                variant='contained'
                disableElevation
                startIcon={<AddIcon />}
                onClick={() => {
                  const { name, value, unit } = itemProp;
                  if (name && value && unit) {
                    setContent((prevContent) => (
                      { ...prevContent, properties: [...prevContent.properties, { name, value, unit }] }
                    ));
                    setItemProp({ name: '', value: '', unit: '' });
                  }
                }}
              >
                Add
              </Button>
            </div>
            {content.properties.length !== 0
              ? <TableContainer>
                <Table size='small'>
                  <TableHead sx={{ backgroundColor: 'gray' }}>
                    <TableRow>
                      <TableCell>Property</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {content.properties.map((property, propIndex) => (
                      <TableRow key={propIndex}>
                        <TableCell>{property.name}</TableCell>
                        <TableCell>{property.value}</TableCell>
                        <TableCell>{property.unit}</TableCell>
                        <TableCell align='right'>
                          <IconButton
                            onClick={() => setContent({
                              ...content,
                              properties: content.properties.filter((_, index) => index !== propIndex)
                            })}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer> : null}
          </Box>
        </div>
        <Button
          className='save-button'
          variant='contained'
          onClick={handleSave}
          sx={{ backgroundColor: 'hsl(120, 100%, 35%)' }}
        >
          Save
        </Button>
      </div>
    </>
  );
};

export default ItemCreator;
