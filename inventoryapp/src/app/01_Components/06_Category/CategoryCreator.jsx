import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  Button,
  IconButton,
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

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { changeLocation } from '../02_Navigation/navSlice';

import { categoryUrls } from '@urls';
import { post } from '../../axiosClient';

/**
 * Component used to create a category
 *
 * Name needs to be entered, properties don't need to be specified but can't be edited later
 */
const CategoryCreator = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { isMobile } = useSelector((state) => state.device);
  const [prop, setProp] = useState({
    name: '',
    unit: ''
  });
  const [content, setContent] = useState({
    name: '',
    properties: []
  });

  const handleCreate = async () => {
    await post(categoryUrls.createCategory, { category: content });
    history.push('/categories');
    setContent({ name: '', properties: [] });
    setProp({ name: '', unit: '' });
  };

  useEffect(() => {
    dispatch(changeLocation('Create Category'));
  }, []);

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        margin: '15px',
        gap: '10px',
        width: isMobile ? '' : '40%',
        justifySelf: 'center'
      }}>
        <TextField
          label='Category Name'
          value={content.name}
          onChange={(event) => setContent(
            (prevContent) => (
              { ...prevContent, name: event.target.value }
            )
          )}
        />
        <Typography variant='h5' align='center'>Properties</Typography>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '5px'
        }}>
          <TextField
            sx={{
              width: isMobile ? '50%' : '100%'
            }}
            label='Name'
            value={prop.name}
            onChange={(event) => {
              setProp((prev) => ({ ...prev, name: event.target.value }));
            }}
          />
          <TextField
            sx={{
              width: isMobile ? '25%' : '20%'
            }}
            label='Unit'
            value={prop.unit}
            onChange={(event) => {
              setProp((prev) => ({ ...prev, unit: event.target.value }));
            }}
          />
          <Button
            sx={{
              width: isMobile ? '25%' : '15%',
            }}
            size='small'
            variant='contained'
            startIcon={<AddIcon />}
            disabled={prop.name.length === 0}
            onClick={() => {
              const { name, unit } = prop;
              setContent((prevContent) => (
                { ...prevContent, properties: [...prevContent.properties, { name, unit }] }
              ));
              setProp({ name: '', unit: '' });
            }}
          >
            Add
          </Button>
        </div>
        {content.properties.length !== 0
          ? <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: 'gray' }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {content.properties.map((property, propIndex) => (
                  <TableRow key={propIndex}>
                    <TableCell>{property.name}</TableCell>
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
        <Button
          sx={{
            backgroundColor: 'hsl(120, 100%, 35%)'
          }}
          variant='contained'
          disabled={content.name.length === 0}
          onClick={handleCreate}
        >
          Create
        </Button>
      </div>
    </>
  );
};

export default CategoryCreator;
